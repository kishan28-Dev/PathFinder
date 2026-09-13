const express = require('express');
const { getCareers, getCareerBySlug, recommendCareer } = require('../controllers/careerController');
const { requireAuth, attachUserProfile } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { validateBody } = require('../middleware/validate');
const { z } = require('zod');

const router = express.Router();

const recommendSchema = z.object({
  interests: z.string().max(1000).optional(),
  existingSkills: z.array(z.string()).default([]),
  workPreference: z.string().max(200).optional(),
  learningGoals: z.string().max(500).optional(),
  technicalPreference: z.string().max(200).optional(),
});

// Public catalog browsing — no auth required so the landing page can showcase careers.
router.get('/', getCareers);
router.get('/:slug', getCareerBySlug);

// AI-backed "what should I become?" — requires auth and is rate-limited like other AI routes.
router.post('/recommend', requireAuth, attachUserProfile, aiRateLimiter, validateBody(recommendSchema), recommendCareer);

module.exports = router;
