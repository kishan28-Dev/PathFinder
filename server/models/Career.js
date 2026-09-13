const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['software-development', 'data', 'ai-ml', 'security', 'cloud', 'design', 'other'],
      default: 'software-development',
    },
    icon: { type: String, default: 'briefcase' },
    requiredSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
    recommendedSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
    typicalProjects: [{ type: String }],
    estimatedLearningDuration: { type: String, default: '4-6 months' },
    difficulty: {
      type: String,
      enum: ['beginner-friendly', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Career', careerSchema);
