const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const Career = require('../models/Career');
const Skill = require('../models/Skill');
const Resource = require('../models/Resource');
const UserProfile = require('../models/UserProfile');

// Generic CRUD helpers keep these admin endpoints thin and consistent. Full admin
// UI is out of scope for the MVP (see README known limitations) — this gives a
// complete, working backend surface for managing the catalog.
function makeCrudHandlers(Model, { populate } = {}) {
  const list = asyncHandler(async (req, res) => {
    let query = Model.find({});
    if (populate) query = query.populate(populate);
    sendSuccess(res, await query.sort({ createdAt: -1 }));
  });

  const create = asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    sendSuccess(res, doc, 201);
  });

  const update = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return sendError(res, 404, 'Not found.');
    sendSuccess(res, doc);
  });

  const remove = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return sendError(res, 404, 'Not found.');
    sendSuccess(res, { deleted: true });
  });

  return { list, create, update, remove };
}

const careers = makeCrudHandlers(Career, { populate: 'requiredSkills recommendedSkills' });
const skills = makeCrudHandlers(Skill);
const resources = makeCrudHandlers(Resource, { populate: 'skill' });

// PUT /api/admin/users/:id/role — promote/demote a user. Admins are provisioned this
// way for the MVP rather than via a self-service UI, to avoid privilege-escalation risk.
const setUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) return sendError(res, 400, 'role must be "user" or "admin".');

  const profile = await UserProfile.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!profile) return sendError(res, 404, 'User not found.');
  sendSuccess(res, profile);
});

module.exports = { careers, skills, resources, setUserRole };
