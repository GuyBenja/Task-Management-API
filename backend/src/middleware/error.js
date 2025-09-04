const { fail } = require('../utils/responses');

/**
 * Fallback error handler for unexpected exceptions.
 * Never leaks stack traces to clients.
 */
function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err);
  return fail(res, 'Internal Server Error', { details: err.message }, 500);
}

module.exports = { errorHandler };
