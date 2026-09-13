// Groq may only recommend careers that actually exist in our database — never a made-up title.
function buildCareerRecommendationPrompt({ interests, existingSkills, workPreference, learningGoals, technicalPreference, availableCareers }) {
  const system = `You are a career-guidance engine for CareerPath AI helping someone who is unsure what career to pursue.
You must choose exclusively from the provided list of available careers (by slug). Never invent a career that is not in the list.
Explain your reasoning clearly. Never claim AI can guarantee a career outcome — frame everything as a recommendation based on the information given.
Return ONLY valid JSON.`;

  const user = `Learner's interests: ${interests || 'not specified'}
Existing skills/experience: ${(existingSkills || []).join(', ') || 'none specified'}
Preferred type of work: ${workPreference || 'not specified'}
Learning goals: ${learningGoals || 'not specified'}
Technical vs non-technical preference: ${technicalPreference || 'not specified'}

Available careers (choose only from these slugs):
${JSON.stringify(availableCareers, null, 2)}

Return JSON matching exactly this shape:
{
  "topMatch": { "careerSlug": "string - must be one of the provided slugs", "reason": "2-3 sentences" },
  "otherMatches": [
    { "careerSlug": "string - must be one of the provided slugs", "reason": "1-2 sentences" }
  ]
}
Provide 2-3 items in otherMatches.`;

  return { system, user };
}

module.exports = { buildCareerRecommendationPrompt };
