const { fail } = require('../utils/responses');
function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err);
  return fail(res, 'Internal Server Error', { details: err.message }, 500);
}
module.exports = { errorHandler };