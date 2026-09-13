const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const Roadmap = require('../models/Roadmap');
const Progress = require('../models/Progress');
const AssessmentResult = require('../models/AssessmentResult');
const { resolveCareerContext } = require('../services/careerContextService');
const { buildPersonalizedRoadmap } = require('../services/roadmapService');
const groqService = require('../services/groqService');

// POST /api/roadmap/generate — generates once per meaningful change (see spec section 49
// on avoiding unnecessary AI calls). Requires a completed assessment so the roadmap is
// grounded in real, verified skill data rather than guesses.
const generateRoadmap = asyncHandler(async (req, res) => {
  const profile = req.userProfile;

  const careerContext = await resolveCareerContext(profile);
  if (!careerContext) {
    return sendError(res, 400, 'Please choose a target career before generating a roadmap.');
  }

  const latestResult = await AssessmentResult.findOne({ user: profile._id }).sort({ createdAt: -1 });
  if (!latestResult) {
    return sendError(res, 400, 'Please complete an assessment before generating a roadmap.');
  }

  const skillGap = groqService.generateSkillGap({
    requiredSkills: careerContext.requiredSkills,
    recommendedSkills: careerContext.recommendedSkills,
    skillScores: latestResult.skillScores,
  });

  const roadmapData = await buildPersonalizedRoadmap({
    careerName: careerContext.careerName,
    requiredSkills: careerContext.requiredSkills,
    recommendedSkills: careerContext.recommendedSkills,
    typicalProjects: careerContext.typicalProjects,
    skillScores: latestResult.skillScores,
    strengths: latestResult.strengths,
    weaknesses: latestResult.weaknesses,
    knowledgeGaps: latestResult.knowledgeGaps,
    preferences: profile.preferences,
    gapDetails: skillGap.details,
  });

  const previousActive = await Roadmap.findOne({ user: profile._id, isActive: true });
  const nextVersion = previousActive ? previousActive.version + 1 : 1;
  if (previousActive) {
    previousActive.isActive = false;
    await previousActive.save();
  }

  const roadmap = await Roadmap.create({
    user: profile._id,
    career: careerContext.careerId,
    ...roadmapData,
    sourceAssessmentResult: latestResult._id,
    version: nextVersion,
    isActive: true,
  });

  profile.currentRoadmap = roadmap._id;
  await profile.save();

  await Progress.findOneAndUpdate(
    { user: profile._id },
    { user: profile._id, roadmap: roadmap._id, overallProgress: 0, completedTopics: [], completedResources: [], completedProjects: [], currentPhaseIndex: 0 },
    { upsert: true, new: true }
  );

  const populated = await Roadmap.findById(roadmap._id).populate('phases.resources.resource');
  sendSuccess(res, populated, 201);
});

const getRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findOne({ user: req.userProfile._id, isActive: true }).populate(
    'phases.resources.resource'
  );
  sendSuccess(res, roadmap || null);
});

module.exports = { generateRoadmap, getRoadmap };
