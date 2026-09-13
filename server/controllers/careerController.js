const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const Career = require('../models/Career');
const groqService = require('../services/groqService');

const getCareers = asyncHandler(async (req, res) => {
  const query = { isActive: true };
  if (req.query.category) query.category = req.query.category;

  const careers = await Career.find(query).populate('requiredSkills', 'name slug').sort({ name: 1 });
  sendSuccess(res, careers);
});

const getCareerBySlug = asyncHandler(async (req, res) => {
  const career = await Career.findOne({ slug: req.params.slug, isActive: true })
    .populate('requiredSkills', 'name slug category')
    .populate('recommendedSkills', 'name slug category');

  if (!career) return sendError(res, 404, 'Career not found.');
  sendSuccess(res, career);
});

// POST /api/careers/recommend — helps a learner who doesn't know what career to pursue yet.
const recommendCareer = asyncHandler(async (req, res) => {
  const { interests, existingSkills, workPreference, learningGoals, technicalPreference } = req.body;

  const careers = await Career.find({ isActive: true }).select('name slug description category difficulty').lean();
  if (!careers.length) return sendError(res, 503, 'Career catalog is not available right now.');

  const result = await groqService.generateCareerRecommendation({
    interests,
    existingSkills,
    workPreference,
    learningGoals,
    technicalPreference,
    availableCareers: careers.map((c) => ({ slug: c.slug, name: c.name, description: c.description, category: c.category })),
  });

  const bySlug = new Map(careers.map((c) => [c.slug, c]));
  sendSuccess(res, {
    topMatch: { career: bySlug.get(result.topMatch.careerSlug), reason: result.topMatch.reason },
    otherMatches: result.otherMatches.map((m) => ({ career: bySlug.get(m.careerSlug), reason: m.reason })),
    disclaimer: 'This is a recommendation based on the information you provided, not a guarantee of career success.',
  });
});

module.exports = { getCareers, getCareerBySlug, recommendCareer };
