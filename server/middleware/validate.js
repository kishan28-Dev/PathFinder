const { sendError } = require('../utils/apiResponse');

// Validates req.body against a zod schema. On success, replaces req.body with the
// parsed (and defaulted/coerced) value so downstream code can trust its shape.
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const message = firstIssue ? `${firstIssue.path.join('.') || 'body'}: ${firstIssue.message}` : 'Invalid request body';
      return sendError(res, 400, message);
    }
    req.body = result.data;
    next();
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const message = firstIssue ? `${firstIssue.path.join('.') || 'query'}: ${firstIssue.message}` : 'Invalid query parameters';
      return sendError(res, 400, message);
    }
    req.query = result.data;
    next();
  };
}

module.exports = { validateBody, validateQuery };
