const mongoose = require('mongoose');

const mentorMessageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

mentorMessageSchema.index({ user: 1, createdAt: 1 });

module.exports = mongoose.model('MentorMessage', mentorMessageSchema);
