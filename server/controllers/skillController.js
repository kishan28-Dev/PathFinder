const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const Skill = require('../models/Skill');

const getSkills = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.category) query.category = req.query.category;
  if (req.query.search) query.name = new RegExp(req.query.search, 'i');

  const skills = await Skill.find(query).sort({ name: 1 });
  sendSuccess(res, skills);
});

module.exports = { getSkills };
