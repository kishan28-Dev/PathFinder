const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    category: {
      type: String,
      required: true,
      enum: ['frontend', 'backend', 'database', 'devops', 'data', 'ai-ml', 'security', 'cloud', 'design', 'soft-skills', 'other'],
    },
    description: { type: String, default: '' },
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
    relatedSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);
