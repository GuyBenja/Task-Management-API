/**
 * Send a standardized success response.
 * Shape: { success:true, message, data, error:null }
 */
function ok(res, message = 'OK', data = null, code = 200)
{
  return res.status(code).json({ success: true, message, data, error: null });
}

/**
 * Send a standardized error response.
 * Shape: { success:false, message, data:null, error }
 */
function fail(res, message = 'Error', error = {}, code = 400) {
  return res.status(code).json({ success: false, message, data: null, error });
}

module.exports = { ok, fail };
