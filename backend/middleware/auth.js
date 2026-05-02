const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid token or user not found' });
    }

    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Middleware to require admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// Middleware to allow admin or resource owner
const allowAdminOrOwner = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if user is the owner of the resource
    const resourceUserId = req.params.id || req.body[resourceField] || req.query[resourceField];
    if (resourceUserId && resourceUserId.toString() === req.user.userId.toString()) {
      return next();
    }
    
    return res.status(403).json({ success: false, message: 'Access denied' });
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  allowAdminOrOwner
};
