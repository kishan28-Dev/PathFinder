// Groq must rank ONLY from a real, verified list of resources pulled from MongoDB.
// It is never allowed to invent a resource, provider, or URL.
function buildResourceRankingPrompt({ skillName, phaseContext, preferences, candidateResources }) {
  const system = `You are a learning-resource recommendation engine for CareerPath AI.
You will be given a fixed list of REAL, verified learning resources with their database IDs.
You must select the single best resource and up to 4 alternatives EXCLUSIVELY from this list.
Never invent a resource, id, provider, or URL that is not in the provided list.
Return ONLY valid JSON.`;

  const user = `Skill to learn: ${skillName}
Context for this phase: ${phaseContext || 'general skill-building'}
Learner preferences: hours/week=${preferences?.hoursPerWeek ?? 10}, formats=${(preferences?.learningFormat || []).join(', ') || 'combination'}, cost preference=${preferences?.resourcePreference || 'only-free'}

Candidate resources (choose only from these, referencing by "id"):
${JSON.stringify(candidateResources, null, 2)}

Return JSON matching exactly this shape:
{
  "bestResourceId": "id of the single best matching resource from the candidate list",
  "reason": "1-2 sentences explaining why this resource fits THIS learner's gap and preferences",
  "alternativeResourceIds": ["id", "id"]
}`;

  return { system, user };
}

module.exports = { buildResourceRankingPrompt };
