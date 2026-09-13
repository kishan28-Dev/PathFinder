// Used only as a fallback when our verified resource database has no catalogued
// entry for a skill (e.g. a custom, off-catalog career). This must never produce
// something that looks like a real resource — see the CRITICAL RULES below.
function buildResourceGuidancePrompt({ skillName, careerName, preferences }) {
  const system = `You are a research assistant for CareerPath AI. You are being asked for guidance on a
skill because our verified resource database does not yet have a catalogued entry for it.

CRITICAL RULES:
- Never output a specific URL, domain, course title, video title, or creator/channel name as if it were a
  real, verified resource — you have no way to confirm any specific link still exists or is accurate, and
  presenting one as real would be a fabrication.
- Instead, describe what to search for and what to look for in a good result: concrete search terms, the
  type of source to prioritize (official documentation, a well-established free learning platform, etc.),
  and red flags to avoid (paywalls, outdated content, unverified channels).
- Keep it concrete and actionable: 2-4 sentences.
- Never guarantee that searching will succeed, or that learning this skill guarantees any career, job, or
  certification outcome.
Return ONLY valid JSON.`;

  const user = `Skill to find learning material for: ${skillName}
Target career: ${careerName || 'not specified'}
Learner preferences: cost preference=${preferences?.resourcePreference || 'only-free'}, formats=${(preferences?.learningFormat || []).join(', ') || 'combination'}

Return JSON matching exactly this shape:
{
  "guidance": "2-4 sentences of concrete, actionable guidance on how to find good free material for this skill",
  "suggestedSearchTerms": ["search term 1", "search term 2", "search term 3"]
}`;

  return { system, user };
}

module.exports = { buildResourceGuidancePrompt };
