const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    provider: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['video', 'course', 'documentation', 'article', 'tutorial', 'practice', 'project'],
    },
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true, index: true },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    isFree: { type: Boolean, default: true, index: true },
    language: { type: String, default: 'English' },
    duration: { type: String, default: '' }, // e.g. "3 hours", "Self-paced"
    rating: { type: Number, min: 0, max: 5, default: 0 },
    description: { type: String, default: '' },
    tags: [{ type: String, trim: true, lowercase: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

resourceSchema.index({ skill: 1, level: 1, isFree: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
