const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.adminToken;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.adminId).select('-passwordHash');

    if (!admin) {
      return res.status(401).json({ message: 'Admin account not found' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message || 'Invalid or expired session' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (!req.admin || req.admin.role !== role) {
    return res.status(403).json({ message: 'You do not have permission for this action' });
  }

  next();
};

module.exports = {
  requireAuth,
  requireRole
};
