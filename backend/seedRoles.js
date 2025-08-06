require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('./models/Role');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected for role seeding'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Define roles with their permissions
const roles = [
  {
    name: 'user',
    permissions: [
      'read:own_documents',
      'write:own_documents', 
      'delete:own_documents'
    ]
  },
  {
    name: 'manager',
    permissions: [
      'read:own_documents',
      'write:own_documents',
      'delete:own_documents',
      'read:team_documents',
      'write:team_documents'
    ]
  },
  {
    name: 'admin',
    permissions: [
      'read:own_documents',
      'write:own_documents',
      'delete:own_documents',
      'read:all_documents',
      'write:all_documents',
      'delete:all_documents',
      'manage:users',
      'view:logs',
      'manage:system'
    ]
  },
  {
    name: 'superadmin',
    permissions: [
      'read:own_documents',
      'write:own_documents',
      'delete:own_documents',
      'read:all_documents',
      'write:all_documents',
      'delete:all_documents',
      'manage:users',
      'view:logs',
      'manage:system',
      'access:all',
      'assign:admin'
    ]
  }
];

// Seed roles
const seedRoles = async () => {
  try {
    // Clear existing roles
    await Role.deleteMany({});
    console.log('Cleared existing roles');

    // Insert new roles
    const createdRoles = await Role.insertMany(roles);
    console.log(`Created ${createdRoles.length} roles:`);
    
    createdRoles.forEach(role => {
      console.log(`- ${role.name}: [${role.permissions.join(', ')}]`);
    });

    console.log('Role seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
};

// Run the seeding
seedRoles();