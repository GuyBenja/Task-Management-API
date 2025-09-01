const jwt = require('jsonwebtoken');
const { fail } = require('../utils/responses');

function auth(req, res, next)
{
  const token = req.cookies?.token;
  if (!token) return fail(res, 'Authentication failed: token missing', {}, 401);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { username, role? }
    next();
  } catch {
    return fail(res, 'Authentication failed: invalid token', {}, 401);
  }
}

function requireRole(role)
{
  return (req, res, next) => {
    if (!req.user?.role || req.user.role !== role)
      return fail(res, 'Forbidden: insufficient role', {}, 403);
    next();
  };
}

module.exports = { auth, requireRole };