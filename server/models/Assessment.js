const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    skill: { type: String, required: true },
    question: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['multiple-choice', 'code-output', 'debugging', 'conceptual', 'scenario', 'short-answer'],
    },
    difficulty: { type: String, enum: ['basic', 'intermediate', 'advanced'], required: true },
    options: [{ type: String }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: '' },
    evaluationCriteria: { type: String, default: '' },
  },
  { _id: false }
);

const assessmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true, index: true },
    careerName: { type: String, required: true },
    career: { type: mongoose.Schema.Types.ObjectId, ref: 'Career', default: null },
    type: { type: String, enum: ['initial', 'reassessment'], default: 'initial' },
    questions: [questionSchema],
    status: { type: String, enum: ['in-progress', 'submitted', 'evaluated'], default: 'in-progress' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
