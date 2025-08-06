const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Get all users (admin and superadmin only)
router.get('/users', authenticate, authorize(['manage:users']), async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('role');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Get all roles (admin and superadmin only)
router.get('/roles', authenticate, authorize(['manage:users']), async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Server error fetching roles' });
  }
});

// Update user role (superadmin only for admin assignment)
router.put('/users/:userId/role', authenticate, async (req, res) => {
  try {
    const { roleName } = req.body;
    const { userId } = req.params;
    
    // Find the role
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Special permission check for assigning admin roles
    if (role.name === 'admin' || role.name === 'superadmin') {
      // Check if user has permission to assign admin roles
      if (!req.user.permissions.includes('assign:admin')) {
        return res.status(403).json({ 
          message: 'You do not have permission to assign admin or superadmin roles' 
        });
      }
    } else {
      // For other roles, check regular user management permission
      if (!req.user.permissions.includes('manage:users')) {
        return res.status(403).json({ 
          message: 'You do not have permission to manage users' 
        });
      }
    }
    
    // Update the user's role
    const user = await User.findByIdAndUpdate(
      userId,
      { role: role._id },
      { new: true }
    ).populate('role');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: {
          id: user.role._id,
          name: user.role.name
        }
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error updating user role' });
  }
});

// System stats (superadmin only)
router.get('/system-stats', authenticate, authorize(['manage:system']), async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const roleStats = await User.aggregate([
      {
        $lookup: {
          from: 'roles',
          localField: 'role',
          foreignField: '_id',
          as: 'roleInfo'
        }
      },
      { $unwind: '$roleInfo' },
      {
        $group: {
          _id: '$roleInfo.name',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      totalUsers: userCount,
      roleDistribution: roleStats
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ message: 'Server error fetching system stats' });
  }
});

module.exports = router;