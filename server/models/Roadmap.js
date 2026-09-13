const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const phaseResourceSchema = new mongoose.Schema(
  {
    resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
    isBest: { type: Boolean, default: false },
    reason: { type: String, default: '' },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

// AI-generated search guidance for a phase skill that has no verified resource in
// our catalog yet (common for custom/off-catalog careers) — never a fabricated
// resource/URL, just what to search for. See services/roadmapService.js.
const resourceGuidanceSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    guidance: { type: String, required: true },
    suggestedSearchTerms: [{ type: String }],
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    skillsPracticed: [{ type: String }],
    requirements: [{ type: String }],
    bonusFeatures: [{ type: String }],
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    estimatedTime: { type: String, default: '' },
    expectedOutcome: { type: String, default: '' },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const phaseSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    estimatedDuration: { type: String, default: '' },
    skills: [{ type: String }],
    topics: [topicSchema],
    resources: [phaseResourceSchema],
    resourceGuidance: [resourceGuidanceSchema],
    practiceTasks: [{ type: String }],
    project: projectSchema,
    status: { type: String, enum: ['completed', 'current', 'upcoming'], default: 'upcoming' },
  },
  { _id: false }
);

const roadmapSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true, index: true },
    careerName: { type: String, required: true },
    career: { type: mongoose.Schema.Types.ObjectId, ref: 'Career', default: null },
    summary: { type: String, default: '' },
    startingLevel: { type: String, default: 'Beginner' },
    estimatedDuration: { type: String, default: '' },
    phases: [phaseSchema],
    sourceAssessmentResult: { type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentResult', default: null },
    version: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Roadmap', roadmapSchema);
