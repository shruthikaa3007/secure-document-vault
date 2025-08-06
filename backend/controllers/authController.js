const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Register a new user
exports.register = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      errors: errors.array(),
      code: 'MISSING_FIELDS'
    });
  }

  const { username, email, password, confirmPassword } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ 
        message: 'User already exists',
        code: 'USER_EXISTS'
      });
    }

    // Get default user role
    const userRole = await Role.findOne({ name: 'user' });
    if (!userRole) {
      return res.status(500).json({ 
        message: 'Default role not found. Please contact administrator.',
        code: 'ROLE_NOT_FOUND'
      });
    }

    // Create new user
    user = new User({
      username,
      email,
      password,
      role: userRole._id
    });

    // Save user to database
    await user.save();

    // Generate JWT token with consistent structure
    const payload = {
      userId: user._id,
      role: userRole.name,
      permissions: userRole.permissions || []
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: userRole.name,
        permissions: userRole.permissions || []
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration',
      code: 'SERVER_ERROR'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      errors: errors.array(),
      code: 'MISSING_CREDENTIALS'
    });
  }

  const { email, password } = req.body;

  try {
    // Find user by email and populate role
    const user = await User.findOne({ email }).populate('role');
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate JWT token with consistent structure
    const payload = {
      userId: user._id,
      role: user.role.name,
      permissions: user.role.permissions || []
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ 
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permissions || []
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      code: 'SERVER_ERROR'
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('role');
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: {
        name: user.role.name,
        permissions: user.role.permissions || []
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      message: 'Server error fetching user data',
      code: 'SERVER_ERROR'
    });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  const { userId, roleName } = req.body;

  if (!userId || !roleName) {
    return res.status(400).json({ 
      message: 'User ID and role name are required',
      code: 'MISSING_FIELDS'
    });
  }

  try {
    // Find the role
    const role = await Role.findOne({ name: roleName.toLowerCase() });
    if (!role) {
      return res.status(404).json({ 
        message: 'Role not found',
        code: 'ROLE_NOT_FOUND'
      });
    }

    // Find and update the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    user.role = role._id;
    await user.save();

    // Populate the role for response
    await user.populate('role');

    res.json({ 
      message: 'User role updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role.name,
        permissions: user.role.permissions || []
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ 
      message: 'Server error updating user role',
      code: 'SERVER_ERROR'
    });
  }
};