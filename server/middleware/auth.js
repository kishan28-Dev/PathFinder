const { clerkMiddleware, getAuth } = require('@clerk/express');
const { sendError } = require('../utils/apiResponse');
const UserProfile = require('../models/UserProfile');

// Attaches Clerk auth state (req.auth) to every request. Does not block unauthenticated requests.
const attachClerkAuth = clerkMiddleware();

// Blocks the request unless a valid Clerk session is present. Use on every protected API route.
function requireAuth(req, res, next) {
  const auth = getAuth(req);
  if (!auth || !auth.userId) {
    return sendError(res, 401, 'Authentication required. Please sign in.');
  }
  req.clerkUserId = auth.userId;
  next();
}

// Loads (or lazily creates) the UserProfile document for the authenticated Clerk user
// and attaches it to req.userProfile. Must run after requireAuth.
async function attachUserProfile(req, res, next) {
  try {
    let profile = await UserProfile.findOne({ clerkId: req.clerkUserId });

    if (!profile) {
      const auth = getAuth(req);
      profile = await UserProfile.create({
        clerkId: req.clerkUserId,
        email: auth.sessionClaims?.email || '',
      });
    }

    req.userProfile = profile;
    next();
  } catch (err) {
    next(err);
  }
}

function requireAdmin(req, res, next) {
  if (!req.userProfile || req.userProfile.role !== 'admin') {
    return sendError(res, 403, 'Admin access required.');
  }
  next();
}

module.exports = { attachClerkAuth, requireAuth, attachUserProfile, requireAdmin };
