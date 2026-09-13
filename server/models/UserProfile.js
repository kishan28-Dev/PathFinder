const mongoose = require('mongoose');

const skillLevelEnum = ['beginner', 'elementary', 'intermediate', 'advanced', 'expert'];

const userSkillSchema = new mongoose.Schema(
  {
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    level: { type: String, enum: skillLevelEnum, required: true },
    source: { type: String, enum: ['self-reported', 'assessed'], default: 'self-reported' },
  },
  { _id: false }
);

const userProfileSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, default: '' },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    onboardingCompleted: { type: Boolean, default: false },
    aboutYou: {
      educationLevel: {
        type: String,
        enum: ['high-school', 'undergraduate', 'graduate', 'postgraduate', 'self-taught', 'other'],
      },
      currentRole: { type: String, default: '' },
      experienceLevel: {
        type: String,
        enum: ['none', 'student', 'early-career', 'mid-career', 'senior'],
      },
      learningGoal: {
        type: String,
        enum: ['switch-career', 'first-job', 'upskill', 'promotion', 'curiosity'],
      },
    },

    targetCareer: { type: mongoose.Schema.Types.ObjectId, ref: 'Career', default: null },
    customCareerName: { type: String, default: '' },

    skills: [userSkillSchema],

    preferences: {
      hoursPerWeek: { type: Number, default: 10 },
      learningFormat: [
        { type: String, enum: ['video', 'documentation', 'interactive', 'projects', 'combination'] },
      ],
      resourcePreference: {
        type: String,
        enum: ['only-free', 'mostly-free', 'any'],
        default: 'only-free',
      },
    },

    currentRoadmap: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', default: null },

    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActiveDate: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserProfile', userProfileSchema);
module.exports.SKILL_LEVELS = skillLevelEnum;
