const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected for superadmin assignment'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Function to assign superadmin role to a user by email
const assignSuperadmin = async (email) => {
  try {
    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    // Find the superadmin role
    const superadminRole = await Role.findOne({ name: 'superadmin' });
    if (!superadminRole) {
      console.error('Superadmin role not found. Please run seedRoles.js first');
      process.exit(1);
    }

    // Update user's role
    user.role = superadminRole._id;
    await user.save();

    console.log(`User ${user.username} (${user.email}) has been assigned the superadmin role`);
    console.log('Role details:', {
      name: superadminRole.name,
      permissions: superadminRole.permissions
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error assigning superadmin role:', error);
    process.exit(1);
  }
};

// Get email from command line arguments
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address');
  console.log('Usage: node assignSuperadmin.js user@example.com');
  process.exit(1);
}

// Run the function
assignSuperadmin(email);f