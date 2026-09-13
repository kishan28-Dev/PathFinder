const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

// GET /api/auth/me — confirms the session is valid and returns the linked profile id
// plus onboarding status, so the frontend knows whether to route to onboarding or dashboard.
const getMe = asyncHandler(async (req, res) => {
  const profile = req.userProfile;
  sendSuccess(res, {
    profileId: profile._id,
    clerkId: profile.clerkId,
    role: profile.role,
    onboardingCompleted: profile.onboardingCompleted,
  });
});

module.exports = { getMe };
