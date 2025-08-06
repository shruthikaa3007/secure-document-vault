require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const Role = require('./models/Role');

const API_URL = 'http://localhost:5000';
let token = '';
let testUserId = '';
let testDocumentId = '';

// Connect to MongoDB to check roles
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected for testing');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}

// Check if roles exist, seed if needed
async function ensureRolesExist() {
  try {
    const roleCount = await Role.countDocuments();
    if (roleCount === 0) {
      console.log('No roles found in database. Running seed script...');
      // Import and run the seed function
      const seedRoles = require('./seedRoles');
      await seedRoles();
    } else {
      console.log(`Found ${roleCount} roles in database`);
      const roles = await Role.find().select('name');
      console.log('Available roles:', roles.map(r => r.name));
    }
    return true;
  } catch (error) {
    console.error('Error checking roles:', error);
    return false;
  }
}

// Create a test file for document upload
async function createTestFile() {
  const testFilePath = path.join(__dirname, 'test-document.txt');
  const content = `This is a test document created at ${new Date().toISOString()}`;
  
  try {
    fs.writeFileSync(testFilePath, content);
    console.log(`Test file created at: ${testFilePath}`);
    return testFilePath;
  } catch (error) {
    console.error('Error creating test file:', error);
    return null;
  }
}

// Test authentication (register & login)
async function testAuthentication() {
  try {
    console.log('\n--- TESTING AUTHENTICATION ---');
    
    // Generate unique test user
    const timestamp = Date.now();
    const testUser = {
      username: `testuser_${timestamp}`,
      email: `test_${timestamp}@example.com`,
      password: 'password123',
      roleName: 'user'
    };
    
    // Test registration
    console.log('\nTesting user registration...');
    const registerResponse = await axios.post(`${API_URL}/api/auth/register`, testUser);
    console.log('Registration successful:', registerResponse.data);
    
    // Test login with newly created user
    console.log('\nTesting user login...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('Login successful:', loginResponse.data);
    
    // Save token and user ID for later tests
    token = loginResponse.data.token;
    testUserId = loginResponse.data.user.id;
    
    return true;
  } catch (error) {
    console.error('Authentication test failed:', error.response?.data || error.message);
    return false;
  }
}

// Test document CRUD operations
async function testDocumentCRUD() {
  try {
    console.log('\n--- TESTING DOCUMENT CRUD OPERATIONS ---');
    
    if (!token) {
      console.error('No authentication token available. Cannot test document operations.');
      return false;
    }
    
    // Create a test file for upload
    const testFilePath = await createTestFile();
    if (!testFilePath) {
      console.error('Failed to create test file. Cannot test document upload.');
      return false;
    }
    
    // 1. CREATE: Test document upload
    console.log('\nTesting document upload...');
    
    // Create form data with file and tags
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('tags', 'test,api,document');
    
    console.log('Form data created with file and tags');
    
    try {
      // Make the upload request
      const uploadResponse = await axios.post(`${API_URL}/api/documents/upload`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${token}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      console.log('Document upload successful:', uploadResponse.data);
      testDocumentId = uploadResponse.data.document._id;
      
      // Continue with other CRUD operations only if upload succeeded
      if (testDocumentId) {
        // 2. READ: Test getting all documents
        console.log('\nTesting get all documents...');
        const getAllResponse = await axios.get(`${API_URL}/api/documents`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log(`Retrieved ${getAllResponse.data.documents.length} documents`);
        
        // 3. READ: Test getting a specific document
        console.log('\nTesting get specific document...');
        const getOneResponse = await axios.get(`${API_URL}/api/documents/${testDocumentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Retrieved document:', getOneResponse.data);
        
        // 4. UPDATE: Test updating document tags
        console.log('\nTesting document update...');
        const updateResponse = await axios.put(`${API_URL}/api/documents/${testDocumentId}`, {
          tags: 'updated,test,api'
        }, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Document update successful:', updateResponse.data);
        
        // 5. DELETE: Test document deletion
        console.log('\nTesting document deletion...');
        const deleteResponse = await axios.delete(`${API_URL}/api/documents/${testDocumentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Document deletion successful:', deleteResponse.data);
      }
    } catch (uploadError) {
      console.error('Document upload failed:', uploadError.response?.data || uploadError.message);
      console.error('Error details:', uploadError.response?.data?.details || 'No additional details');
      
      // Log request details for debugging
      console.log('Request details:');
      console.log('- URL:', `${API_URL}/api/documents/upload`);
      console.log('- Headers:', {
        ...formData.getHeaders(),
        'Authorization': 'Bearer [TOKEN]' // Don't log the actual token
      });
      console.log('- Form data keys:', Object.keys(formData).join(', '));
      
      // Continue with other tests even if upload failed
      console.log('\nSkipping remaining CRUD tests due to upload failure');
    }
    
    // Clean up test file
    try {
      fs.unlinkSync(testFilePath);
      console.log('Test file cleaned up');
    } catch (error) {
      console.error('Error cleaning up test file:', error);
    }
    
    return true;
  } catch (error) {
    console.error('Document CRUD test failed:', error.response?.data || error.message);
    return false;
  }
}

// Test basic API connectivity
async function testBasicConnectivity() {
  try {
    console.log('\n--- TESTING BASIC CONNECTIVITY ---');
    const testResponse = await axios.get(`${API_URL}/api/test`);
    console.log('Basic connectivity test:', testResponse.data);
    return true;
  } catch (error) {
    console.error('Basic connectivity test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  try {
    console.log('=== STARTING API TESTS ===\n');
    
    // Connect to database
    const dbConnected = await connectDB();
    if (!dbConnected) {
      console.error('Cannot run tests without database connection');
      return;
    }
    
    // Ensure roles exist
    await ensureRolesExist();
    
    // Test basic connectivity
    await testBasicConnectivity();
    
    // Test authentication
    const authSuccess = await testAuthentication();
    if (!authSuccess) {
      console.error('Authentication tests failed. Cannot proceed with document tests.');
      return;
    }
    
    // Test document CRUD
    await testDocumentCRUD();
    
    console.log('\n=== API TESTS COMPLETED ===');
  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    // Close MongoDB connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the tests
runTests();