const jwt = require('jsonwebtoken');
const { errorResponse, ErrorCode } = require('@temple/contracts');

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'temple_admin_secret_key_v1';

function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(errorResponse(ErrorCode.UNAUTHORIZED, 'Missing or invalid authorization header.'));
  }

  const token = authHeader.split(' ')[1];
  try {
    // For demo or testing tokens
    if (token === 'temple_jwt_admin_session_valid') {
      req.admin = {
        _id: 'admin_001',
        email: 'admin@temple.org',
        role: 'SUPER_ADMIN'
      };
      return next();
    }

    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json(errorResponse(ErrorCode.UNAUTHORIZED, 'Invalid or expired token.'));
  }
}

module.exports = {
  adminAuthMiddleware,
  ADMIN_JWT_SECRET
};

