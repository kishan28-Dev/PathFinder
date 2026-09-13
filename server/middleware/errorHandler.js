const { sendError } = require('../utils/apiResponse');

function notFoundHandler(req, res) {
  sendError(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
}

// Centralized error handler. Never leaks stack traces or internal error details to the client.
function errorHandler(err, req, res, _next) {
  const statusCode = err.isOperational && err.statusCode ? err.statusCode : 500;

  if (statusCode >= 500) {
    console.error('[error]', err);
  } else {
    console.warn('[error]', err.message);
  }

  const message = err.isOperational ? err.message : 'Something went wrong. Please try again.';
  sendError(res, statusCode, message);
}

module.exports = { notFoundHandler, errorHandler };
