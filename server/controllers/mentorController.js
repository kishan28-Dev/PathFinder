const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const MentorMessage = require('../models/MentorMessage');
const Roadmap = require('../models/Roadmap');
const Progress = require('../models/Progress');
const AssessmentResult = require('../models/AssessmentResult');
const { resolveCareerContext } = require('../services/careerContextService');
const groqService = require('../services/groqService');

// POST /api/mentor/chat — sends only the minimal context the mentor needs (career,
// skill summary, current phase, progress), never the learner's raw personal details.
const chat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const profile = req.userProfile;

  const [careerContext, roadmap, progress, latestResult, history] = await Promise.all([
    resolveCareerContext(profile),
    Roadmap.findOne({ user: profile._id, isActive: true }),
    Progress.findOne({ user: profile._id }),
    AssessmentResult.findOne({ user: profile._id }).sort({ createdAt: -1 }),
    MentorMessage.find({ user: profile._id }).sort({ createdAt: 1 }).limit(20),
  ]);

  const currentPhase = roadmap?.phases.find((p) => p.status === 'current');
  const skillSummary = latestResult?.skillScores.length
    ? latestResult.skillScores.map((s) => `${s.skill}: ${s.score}%`).join(', ')
    : 'not yet assessed';
  const progressSummary = progress
    ? `${progress.overallProgress}% through the roadmap, ${profile.streak.current}-day learning streak`
    : 'no roadmap progress yet';

  const reply = await groqService.generateMentorResponse({
    context: {
      targetCareer: careerContext?.careerName,
      skillSummary,
      currentPhase: currentPhase?.title,
      progressSummary,
    },
    history: history.map((m) => ({ role: m.role, content: m.content })),
    message,
  });

  await MentorMessage.insertMany([
    { user: profile._id, role: 'user', content: message },
    { user: profile._id, role: 'assistant', content: reply },
  ]);

  sendSuccess(res, { reply });
});

const getHistory = asyncHandler(async (req, res) => {
  const messages = await MentorMessage.find({ user: req.userProfile._id }).sort({ createdAt: 1 }).limit(100);
  sendSuccess(res, messages);
});

module.exports = { chat, getHistory };
