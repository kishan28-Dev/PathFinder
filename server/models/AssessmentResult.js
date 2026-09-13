const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    skill: { type: String, required: true },
    userAnswer: { type: String, default: '' },
    isCorrect: { type: Boolean, default: null },
  },
  { _id: false }
);

const skillScoreSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

const assessmentResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true, index: true },
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    answers: [answerSchema],
    overallScore: { type: Number, min: 0, max: 100, required: true },
    skillScores: [skillScoreSchema],
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    knowledgeGaps: [{ type: String }],
    recommendedStartingPoint: { type: String, default: '' },
    confidence: { type: Number, min: 0, max: 1, default: 0.7 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AssessmentResult', assessmentResultSchema);
