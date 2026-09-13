const express = require('express');
const { careers, skills, resources, setUserRole } = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const {
  careerSchema,
  careerUpdateSchema,
  skillSchema,
  skillUpdateSchema,
  resourceSchema,
  resourceUpdateSchema,
} = require('../validators/adminValidators');
const { z } = require('zod');

const router = express.Router();

// Every route below requires an authenticated admin (requireAuth + attachUserProfile
// already applied at the /api/admin mount point in app.js).
router.use(requireAdmin);

router.get('/careers', careers.list);
router.post('/careers', validateBody(careerSchema), careers.create);
router.put('/careers/:id', validateBody(careerUpdateSchema), careers.update);
router.delete('/careers/:id', careers.remove);

router.get('/skills', skills.list);
router.post('/skills', validateBody(skillSchema), skills.create);
router.put('/skills/:id', validateBody(skillUpdateSchema), skills.update);
router.delete('/skills/:id', skills.remove);

router.get('/resources', resources.list);
router.post('/resources', validateBody(resourceSchema), resources.create);
router.put('/resources/:id', validateBody(resourceUpdateSchema), resources.update);
router.delete('/resources/:id', resources.remove);

router.put('/users/:id/role', validateBody(z.object({ role: z.enum(['user', 'admin']) })), setUserRole);

module.exports = router;
