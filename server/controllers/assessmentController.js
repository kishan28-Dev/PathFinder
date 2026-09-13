const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const UserProfile = require('../models/UserProfile');
const groqService = require('../services/groqService');
const assessmentService = require('../services/assessmentService');
const { resolveCareerContext } = require('../services/careerContextService');
const { applyAssessedSkillsToProfile } = require('../services/skillLevelService');
const { touchStreak } = require('../utils/streak');

// Strips answer-revealing fields before sending questions to the client taking the quiz.
function toClientQuestion(q) {
  return {
    questionId: q.questionId,
    skill: q.skill,
    question: q.question,
    type: q.type,
    difficulty: q.difficulty,
    options: q.options,
  };
}

const generateAssessment = asyncHandler(async (req, res) => {
  const { type, questionCount } = req.body;
  const profile = req.userProfile;

  const careerContext = await resolveCareerContext(profile);
  if (!careerContext) {
    return sendError(res, 400, 'Please choose a target career before starting an assessment.');
  }

  const populatedProfile = await UserProfile.findById(profile._id).populate('skills.skill', 'name');
  const userSkills = populatedProfile.skills
    .filter((s) => s.skill)
    .map((s) => ({ name: s.skill.name, level: s.level }));

  const questions = await groqService.generateAssessment({
    careerName: careerContext.careerName,
    requiredSkills: careerContext.requiredSkills,
    userSkills,
    questionCount,
  });

  const assessment = await Assessment.create({
    user: profile._id,
    careerName: careerContext.careerName,
    career: careerContext.careerId,
    type,
    questions,
    status: 'in-progress',
  });

  sendSuccess(
    res,
    {
      assessmentId: assessment._id,
      careerName: assessment.careerName,
      type: assessment.type,
      questions: assessment.questions.map(toClientQuestion),
    },
    201
  );
});

const submitAssessment = asyncHandler(async (req, res) => {
  const { assessmentId, answers } = req.body;
  const profile = req.userProfile;

  const assessment = await Assessment.findOne({ _id: assessmentId, user: profile._id });
  if (!assessment) return sendError(res, 404, 'Assessment not found.');
  if (assessment.status === 'evaluated') return sendError(res, 400, 'This assessment has already been submitted.');

  const answersByQuestionId = new Map(answers.map((a) => [a.questionId, a.answer]));
  const { gradedAnswers, skillScores, overallScore } = await assessmentService.evaluateSubmission({
    questions: assessment.questions,
    answersByQuestionId,
  });
  const gradedByQuestionId = new Map(gradedAnswers.map((a) => [a.questionId, a]));

  const careerContext = await resolveCareerContext(profile);
  const careerName = careerContext?.careerName || assessment.careerName;
  const requiredSkills = careerContext?.requiredSkills || [];
  const recommendedSkills = careerContext?.recommendedSkills || [];

  const synthesis = await groqService.synthesizeEvaluation({ careerName, skillScores, requiredSkills });
  const skillGap = groqService.generateSkillGap({ requiredSkills, recommendedSkills, skillScores });

  const result = await AssessmentResult.create({
    user: profile._id,
    assessment: assessment._id,
    answers: assessment.questions.map((q) => ({
      questionId: q.questionId,
      skill: q.skill,
      userAnswer: answersByQuestionId.get(q.questionId) || '',
      isCorrect: gradedByQuestionId.get(q.questionId)?.isCorrect ?? null,
    })),
    overallScore,
    skillScores,
    strengths: synthesis.strengths,
    weaknesses: synthesis.weaknesses,
    knowledgeGaps: synthesis.knowledgeGaps,
    recommendedStartingPoint: synthesis.recommendedStartingPoint,
    confidence: synthesis.confidence,
  });

  assessment.status = 'evaluated';
  await assessment.save();

  await applyAssessedSkillsToProfile(profile, skillScores);
  touchStreak(profile.streak);
  await profile.save();

  sendSuccess(res, {
    resultId: result._id,
    overallScore,
    skillScores,
    strengths: synthesis.strengths,
    weaknesses: synthesis.weaknesses,
    knowledgeGaps: synthesis.knowledgeGaps,
    recommendedStartingPoint: synthesis.recommendedStartingPoint,
    confidence: synthesis.confidence,
    skillGap,
  });
});

const getHistory = asyncHandler(async (req, res) => {
  const results = await AssessmentResult.find({ user: req.userProfile._id })
    .populate('assessment', 'careerName type createdAt')
    .sort({ createdAt: -1 })
    .select('-answers');

  sendSuccess(res, results);
});

const getAssessmentById = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findOne({ _id: req.params.id, user: req.userProfile._id });
  if (!assessment) return sendError(res, 404, 'Assessment not found.');

  const includeAnswers = assessment.status === 'evaluated';
  sendSuccess(res, {
    assessmentId: assessment._id,
    careerName: assessment.careerName,
    type: assessment.type,
    status: assessment.status,
    questions: includeAnswers ? assessment.questions : assessment.questions.map(toClientQuestion),
  });
});

module.exports = { generateAssessment, submitAssessment, getHistory, getAssessmentById };
