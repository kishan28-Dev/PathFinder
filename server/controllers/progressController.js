const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const Roadmap = require('../models/Roadmap');
const Progress = require('../models/Progress');
const progressService = require('../services/progressService');
const { touchStreak } = require('../utils/streak');

const getProgress = asyncHandler(async (req, res) => {
  const progress = await Progress.findOne({ user: req.userProfile._id }).populate(
    'roadmap',
    'careerName summary estimatedDuration startingLevel'
  );

  if (!progress) return sendSuccess(res, null);
  sendSuccess(res, progress);
});

// Toggles completion of a topic, resource, or project inside the learner's active
// roadmap, then recalculates phase statuses, overall progress, and the streak.
const updateProgress = asyncHandler(async (req, res) => {
  const profile = req.userProfile;
  const roadmap = await Roadmap.findOne({ user: profile._id, isActive: true });
  if (!roadmap) return sendError(res, 404, 'No active roadmap found. Generate a roadmap first.');

  const applied = progressService.applyItemUpdate(roadmap, req.body);
  if (!applied) return sendError(res, 404, 'That roadmap item could not be found.');

  const currentPhaseIndex = progressService.recomputePhaseStatuses(roadmap);
  await roadmap.save();

  const overallProgress = progressService.computeOverallProgress(roadmap);
  const completedTopics = progressService.computeCompletedTopics(roadmap);
  const completedResources = progressService.computeCompletedResources(roadmap);
  const completedProjects = progressService.computeCompletedProjects(roadmap);

  const progress = await Progress.findOneAndUpdate(
    { user: profile._id },
    {
      user: profile._id,
      roadmap: roadmap._id,
      overallProgress,
      completedTopics,
      completedResources,
      completedProjects,
      currentPhaseIndex,
    },
    { upsert: true, new: true }
  );

  if (req.body.completed) {
    touchStreak(profile.streak);
    await profile.save();
  }

  // The frontend renders full resource details (title, url, provider) from this
  // roadmap, so it must go back populated — not just the bare ObjectId refs that
  // `Roadmap.findOne` returns above.
  await roadmap.populate('phases.resources.resource');

  sendSuccess(res, { roadmap, progress });
});

module.exports = { getProgress, updateProgress };
