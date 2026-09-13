function buildRoadmapPrompt({
  careerName,
  requiredSkills,
  recommendedSkills,
  typicalProjects,
  skillScores,
  strengths,
  weaknesses,
  knowledgeGaps,
  preferences,
}) {
  const system = `You are an expert curriculum designer for CareerPath AI, creating a fully personalized learning roadmap.

CRITICAL RULES:
- The roadmap MUST reflect what this specific learner already knows. Do NOT include phases (or should drastically shorten them) for skills where the learner already scored strong/advanced.
- Do NOT invent, name, or link to any specific course, video, website, or resource. Resources are attached separately by the system from a verified database — you only describe topics, skills and projects.
- Do NOT guarantee employment, salary, or certification outcomes anywhere in the text.
- Order phases so foundational/weakest-required skills come first and build logically toward the target career.
- Each phase must end in a hands-on project that uses only the skills taught up to that phase.
- Every entry in a phase's "skills" array MUST be copied verbatim (exact spelling and casing) from the
  "Required skills" or "Recommended/bonus skills" lists below — these are used as database lookup keys to
  attach real resources afterward. Never paraphrase, combine, or invent a skill name. A phase's "topics" array
  is where you can use free, descriptive language.
- Return ONLY valid JSON matching the schema exactly. No prose outside JSON.`;

  const user = `Target career: ${careerName}
Required skills: ${requiredSkills.join(', ')}
Recommended/bonus skills: ${(recommendedSkills || []).join(', ') || 'none'}
Typical real-world projects for this career: ${(typicalProjects || []).join(', ') || 'none provided'}

Learner's assessed skill scores (0-100, ground truth from a real assessment):
${JSON.stringify(skillScores, null, 2)}

Learner's strengths: ${(strengths || []).join(', ') || 'none identified yet'}
Learner's weaknesses: ${(weaknesses || []).join(', ') || 'none identified yet'}
Knowledge gaps (missing skills required for the career): ${(knowledgeGaps || []).join(', ') || 'none identified yet'}

Learning preferences:
- Hours available per week: ${preferences?.hoursPerWeek ?? 10}
- Preferred formats: ${(preferences?.learningFormat || []).join(', ') || 'combination'}
- Resource cost preference: ${preferences?.resourcePreference || 'only-free'}

Generate a personalized, phased roadmap now. Return JSON matching exactly this shape:
{
  "summary": "2-3 sentence personalized summary referencing this learner's specific starting point",
  "startingLevel": "Beginner | Beginner to Intermediate | Intermediate | Intermediate to Advanced | Advanced",
  "estimatedDuration": "e.g. 4 months",
  "phases": [
    {
      "title": "string",
      "description": "1-2 sentences explaining why this phase matters for this learner",
      "estimatedDuration": "e.g. 2 weeks",
      "skills": ["skill names covered in this phase — exact strings from the required/recommended skills lists above"],
      "topics": ["specific topic 1", "specific topic 2"],
      "practiceTasks": ["short practice exercise 1", "short practice exercise 2"],
      "project": {
        "title": "string",
        "description": "string",
        "skillsPracticed": ["string"],
        "requirements": ["string"],
        "bonusFeatures": ["string"],
        "difficulty": "beginner | intermediate | advanced",
        "estimatedTime": "e.g. 1 week",
        "expectedOutcome": "string describing what the learner will be able to do/show afterward"
      }
    }
  ]
}`;

  return { system, user };
}

module.exports = { buildRoadmapPrompt };
