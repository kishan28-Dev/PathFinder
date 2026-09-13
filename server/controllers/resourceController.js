const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const AssessmentResult = require('../models/AssessmentResult');
const { listResources, findCandidateResourcesForSkill, toCandidateSummary } = require('../services/resourceService');
const { resolveCareerContext } = require('../services/careerContextService');
const groqService = require('../services/groqService');

const getResources = asyncHandler(async (req, res) => {
  const { skill: skillSlug, type, level, page, limit } = req.query;
  const isFree = req.query.isFree === undefined ? undefined : req.query.isFree === 'true';

  const result = await listResources({
    skillSlug,
    type,
    level,
    isFree,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
  });

  sendSuccess(res, result);
});

// GET /api/resources/recommended — a handful of the best free resources for the
// learner's current weakest skills, independent of any roadmap (useful before a
// roadmap even exists, and for the dashboard's "Recommended Resources" widget).
const getRecommendedResources = asyncHandler(async (req, res) => {
  const profile = req.userProfile;
  const latestResult = await AssessmentResult.findOne({ user: profile._id }).sort({ createdAt: -1 });

  if (!latestResult) {
    return sendSuccess(res, { message: 'Take your first assessment to get personalized resource recommendations.', items: [] });
  }

  const focusSkills = [...latestResult.knowledgeGaps, ...latestResult.weaknesses].slice(0, 4);
  const careerContext = await resolveCareerContext(profile);
  const items = [];
  const guidance = [];

  for (const skillName of focusSkills) {
    const candidates = await findCandidateResourcesForSkill(skillName, {
      level: 'beginner',
      resourcePreference: profile.preferences?.resourcePreference,
      limit: 6,
    });

    if (!candidates.length) {
      // No verified resource exists for this skill (common for custom/off-catalog
      // careers). Fall back to AI search guidance rather than showing nothing —
      // never a fabricated resource card/URL, see generateResourceGuidance().
      try {
        const g = await groqService.generateResourceGuidance({
          skillName,
          careerName: careerContext?.careerName,
          preferences: profile.preferences,
        });
        guidance.push({ skill: skillName, guidance: g.guidance, suggestedSearchTerms: g.suggestedSearchTerms });
      } catch {
        // Best-effort only — an AI hiccup here shouldn't block the rest of the page.
      }
      continue;
    }

    const ranking = await groqService.rankResources({
      skillName,
      phaseContext: `Focused practice for ${skillName}, a current skill gap.`,
      preferences: profile.preferences,
      candidateResources: candidates.map(toCandidateSummary),
    });

    const best = candidates.find((c) => String(c._id) === ranking.bestResourceId);
    if (best) items.push({ skill: skillName, resource: best, reason: ranking.reason });
  }

  // Distinguish "you haven't assessed yet" from "you have, but nothing matched" —
  // otherwise the frontend can't tell the difference and shows the wrong empty state.
  const message = items.length === 0 && guidance.length === 0
    ? "We couldn't find or generate resource guidance for your current focus areas yet. Try generating or refreshing your roadmap."
    : undefined;

  sendSuccess(res, { items, guidance, message });
});

module.exports = { getResources, getRecommendedResources };
