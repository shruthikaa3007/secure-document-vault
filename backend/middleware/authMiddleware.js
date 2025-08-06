const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate middleware - verifies JWT token
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.', 
        code: 'AUTH_REQUIRED' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.', 
        code: 'AUTH_REQUIRED' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Set user information from decoded token
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      permissions: decoded.permissions || []
    };
    
    console.log('Authenticated user:', req.user); // Debug log
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      message: 'Invalid token.', 
      code: 'INVALID_TOKEN' 
    });
  }
};

// Authorize middleware - checks if user has required permissions
const authorize = (requiredPermissions = []) => {
  return (req, res, next) => {
    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    const userRole = req.user.role;

    console.log('Required permissions:', requiredPermissions);
    console.log('User permissions:', userPermissions);
    console.log('User role:', userRole);

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );

    // Also allow access for admin and superadmin roles for certain permissions
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';
    const adminPermissions = ['manage:users', 'view:logs', 'manage:system'];
    const hasAdminAccess = isAdmin && requiredPermissions.some(perm => 
      adminPermissions.includes(perm)
    );

    if (!hasAllPermissions && !hasAdminAccess) {
      return res.status(403).json({ 
        message: 'Access denied: insufficient permissions',
        requiredPermissions,
        userPermissions,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

// Check if user is owner or has admin privileges
const isOwnerOrAdmin = async (req, res, next) => {
  try {
    const resourceOwnerId = req.params.userId || req.body.userId;
    const currentUserId = req.user.userId;
    const userRole = req.user.role;

    // Allow if user is accessing their own resource
    if (resourceOwnerId && resourceOwnerId.toString() === currentUserId.toString()) {
      return next();
    }

    // Allow if user is admin or superadmin
    if (userRole === 'admin' || userRole === 'superadmin') {
      return next();
    }

    // Check if user has manage:users permission
    const userPermissions = req.user.permissions || [];
    if (userPermissions.includes('manage:users')) {
      return next();
    }

    return res.status(403).json({ 
      message: 'Access denied: insufficient permissions',
      code: 'ACCESS_DENIED'
    });
  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(500).json({ 
      message: 'Server error during authorization',
      code: 'SERVER_ERROR'
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  isOwnerOrAdmin
};