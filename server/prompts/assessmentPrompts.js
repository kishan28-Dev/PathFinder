const QUESTION_TYPES = ['multiple-choice', 'code-output', 'debugging', 'conceptual', 'scenario', 'short-answer'];

function buildAssessmentPrompt({ careerName, requiredSkills, userSkills, questionCount = 12 }) {
  const system = `You are an expert technical assessment engine for CareerPath AI, a career-learning platform.
Your job is to generate an assessment that accurately determines a learner's ACTUAL working knowledge, not memorization.

Rules:
- Return ONLY valid JSON matching the schema. No prose, no markdown fences.
- Mix question types across: ${QUESTION_TYPES.join(', ')}. Do NOT make every question multiple-choice.
- Skew difficulty toward each skill's self-reported level (beginner/elementary -> mostly basic questions with a couple intermediate; intermediate -> mix of basic/intermediate/some advanced; advanced/expert -> mostly intermediate/advanced).
- Cover every skill listed as "required" for the target career, even ones the user did not self-report (treat unreported skills as beginner level to probe fundamentals).
- Never invent URLs, course names, or external references inside questions.
- Every question needs a concrete correctAnswer and a short explanation a learner can read after answering.
- For "multiple-choice" questions, provide exactly 4 plausible options in the "options" array, with "correctAnswer" equal to one of them verbatim.
- For non multiple-choice types, leave "options" as an empty array and make "correctAnswer" a concise reference answer (a few sentences at most) and set "evaluationCriteria" to a short rubric describing what a correct answer must include.
- Produce exactly ${questionCount} questions.`;

  const userSkillLines = userSkills.length
    ? userSkills.map((s) => `- ${s.name}: self-reported as ${s.level}`).join('\n')
    : '- (user has not self-reported any current skills; treat them as a complete beginner)';

  const user = `Target career: ${careerName}

Required skills for this career:
${requiredSkills.join(', ') || 'general programming fundamentals'}

User's self-reported current skills:
${userSkillLines}

Generate the assessment now. Return JSON matching exactly this shape:
{
  "questions": [
    {
      "questionId": "q1",
      "skill": "string - one of the required skills or a closely related fundamental",
      "question": "string",
      "type": "one of: ${QUESTION_TYPES.join(' | ')}",
      "difficulty": "one of: basic | intermediate | advanced",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string",
      "evaluationCriteria": "string"
    }
  ]
}`;

  return { system, user };
}

module.exports = { buildAssessmentPrompt, QUESTION_TYPES };
