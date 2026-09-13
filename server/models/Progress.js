const mongoose = require('mongoose');

const quizScoreEntrySchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    overallScore: { type: Number, required: true },
    assessmentResult: { type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentResult' },
  },
  { _id: false }
);

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true, unique: true, index: true },
    roadmap: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', default: null },
    overallProgress: { type: Number, default: 0, min: 0, max: 100 },
    completedTopics: [{ type: String }], // keys formatted as `${phaseOrder}:${topicIndex}`
    completedResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
    completedProjects: [{ type: Number }], // phase order values
    currentPhaseIndex: { type: Number, default: 0 },
    quizScores: [quizScoreEntrySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Progress', progressSchema);
