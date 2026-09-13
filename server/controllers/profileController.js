const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const UserProfile = require('../models/UserProfile');

const getProfile = asyncHandler(async (req, res) => {
  const profile = await UserProfile.findById(req.userProfile._id)
    .populate('targetCareer')
    .populate('skills.skill')
    .populate('currentRoadmap', 'careerName summary estimatedDuration version');

  sendSuccess(res, profile);
});

const updateProfile = asyncHandler(async (req, res) => {
  const updates = req.body;
  const profile = req.userProfile;

  if (updates.aboutYou) profile.aboutYou = { ...profile.aboutYou, ...updates.aboutYou };
  if (updates.targetCareer !== undefined) profile.targetCareer = updates.targetCareer;
  if (updates.customCareerName !== undefined) profile.customCareerName = updates.customCareerName;
  if (updates.skills !== undefined) profile.skills = updates.skills;
  if (updates.preferences) profile.preferences = { ...profile.preferences, ...updates.preferences };
  if (updates.onboardingCompleted !== undefined) profile.onboardingCompleted = updates.onboardingCompleted;

  await profile.save();

  const populated = await UserProfile.findById(profile._id).populate('targetCareer').populate('skills.skill');
  sendSuccess(res, populated);
});

module.exports = { getProfile, updateProfile };
