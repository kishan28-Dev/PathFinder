const rateLimit = require('express-rate-limit');

// AI/Groq-backed endpoints are expensive and rate-limited upstream, so they get a
// stricter per-user limit than the rest of the API.
const aiRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.clerkUserId || req.ip,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'You are sending too many AI requests. Please wait a few minutes and try again.',
    });
  },
});

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ success: false, message: 'Too many requests. Please slow down.' });
  },
});

module.exports = { aiRateLimiter, apiRateLimiter };
