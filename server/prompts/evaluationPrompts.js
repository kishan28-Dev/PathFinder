// Subjective (non multiple-choice) answers are graded by the AI because there is no
// single string to compare against. Objective (multiple-choice) answers are graded
// deterministically in code — see utils/gradeObjective.js — so their scores never
// depend on the model's judgment.
function buildSubjectiveGradingPrompt({ items }) {
  const system = `You are a strict but fair technical grader for CareerPath AI.
For each submitted answer, decide if it demonstrates real understanding based on the provided evaluation criteria and reference answer.
Return ONLY valid JSON. Do not invent facts about the candidate. Do not guarantee any career or job outcome in your feedback.`;

  const user = `Grade each of the following answers. For each item, return a score from 0-100 (0 = no understanding, 100 = fully correct and complete) and one short, encouraging feedback sentence explaining the score.

Items:
${JSON.stringify(items, null, 2)}

Return JSON matching exactly this shape:
{
  "results": [
    { "questionId": "string", "score": 0, "isCorrect": true, "feedback": "string" }
  ]
}
"isCorrect" should be true only if score >= 60.`;

  return { system, user };
}

function buildEvaluationSynthesisPrompt({ careerName, skillScores, requiredSkills }) {
  const system = `You are an expert learning-analytics engine for CareerPath AI.
You will be given ALREADY-COMPUTED, trustworthy skill scores (0-100) for a learner. Do NOT change or re-derive the numbers.
Your job is only to interpret them: identify strengths, weaknesses, knowledge gaps relative to the target career, a recommended starting point, and your confidence in this read.
Never guarantee career outcomes, salaries, or employment. Return ONLY valid JSON.

CRITICAL: every skill name you output in "strengths", "weaknesses", and "knowledgeGaps" MUST be copied
verbatim (exact spelling and casing) from the "Required skills for this career" list or the skill scores
list below — these names are used as database lookup keys downstream. Never paraphrase, combine, abbreviate,
or invent a skill name that isn't in one of those two lists.`;

  const user = `Target career: ${careerName}
Required skills for this career (use these exact strings): ${requiredSkills.join(', ')}

Computed skill scores (ground truth, 0-100; use these exact skill name strings too):
${JSON.stringify(skillScores, null, 2)}

Return JSON matching exactly this shape:
{
  "strengths": ["skill names scoring well, strongest first — exact strings from the lists above"],
  "weaknesses": ["skill names scoring poorly among ones the user has some exposure to — exact strings from the lists above"],
  "knowledgeGaps": ["required skills that are missing or very weak and block progress toward the career — exact strings from the required skills list"],
  "recommendedStartingPoint": "one short sentence naming the single best skill/topic to start with and why",
  "confidence": 0.8
}`;

  return { system, user };
}

module.exports = { buildSubjectiveGradingPrompt, buildEvaluationSynthesisPrompt };
