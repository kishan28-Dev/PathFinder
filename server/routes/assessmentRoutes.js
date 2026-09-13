const express = require('express');
const { generateAssessment, submitAssessment, getHistory, getAssessmentById } = require('../controllers/assessmentController');
const { validateBody } = require('../middleware/validate');
const { generateAssessmentSchema, submitAssessmentSchema } = require('../validators/assessmentValidators');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/generate', aiRateLimiter, validateBody(generateAssessmentSchema), generateAssessment);
router.post('/submit', aiRateLimiter, validateBody(submitAssessmentSchema), submitAssessment);
router.get('/history', getHistory);
router.get('/:id', getAssessmentById);

module.exports = router;
