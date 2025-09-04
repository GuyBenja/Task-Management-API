const jwt = require('jsonwebtoken');
const { fail } = require('../utils/responses');

// Extract token from Authorization header (Bearer <token>) or 'token' cookie
function extractToken(req) {
  // Prefer Authorization header for mobile clients
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (authHeader && typeof authHeader === 'string') {
    const [scheme, value] = authHeader.split(' ');
    if (scheme && value && scheme.toLowerCase() === 'bearer') {
      return value.trim();
    }
  }
  // Fallback: cookie-based token (web)
  if (req.cookies && req.cookies.token) return req.cookies.token;
  return null;
}

function auth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return fail(res, 'Unauthorized', {}, 401);

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Attach minimal user info for RBAC checks
    req.user = { id: payload.id, username: payload.username, role: payload.role };
    return next();
  } catch (e) {
    return fail(res, 'Invalid or expired token', { details: e.message }, 401);
  }
}

module.exports = { auth };
