const jwt = require('jsonwebtoken');
const { fail } = require('../utils/responses');

function auth(req, res, next)
{
  const token = req.cookies?.token;
  if (!token) return fail(res, 'Authentication failed: token missing', {}, 401);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role }
    next();
  } catch {
    return fail(res, 'Authentication failed: invalid token', {}, 401);
  }
}

function authorize(...allowedRoles)
{
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !allowedRoles.includes(role))
      return fail(res, 'Forbidden: insufficient role', {}, 403);
    next();
  };
}


function requireRole(role)
{
  return authorize(role);
}

module.exports = { auth, authorize, requireRole };
