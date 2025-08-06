/**
 * Security Features Demonstration Script
 * 
 * This script demonstrates the security features implemented in the Secure Document Vault:
 * 1. Role-based Access Control
 * 2. Input Sanitization
 * 3. NoSQL Injection Protection
 * 4. Rate Limiting
 * 5. CORS Configuration
 * 6. HTTPS & Helmet Security Headers
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:5000/api';
let authToken = '';
let userId = '';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper function to log with colors
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  error: (msg, err) => {
    console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`);
    if (err) {
      if (err.response) {
        console.log(`${colors.red}[ERROR DETAILS]${colors.reset} Status: ${err.response.status}`);
        console.log(`${colors.red}[ERROR DETAILS]${colors.reset} Data: ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        console.log(`${colors.red}[ERROR DETAILS]${colors.reset} No response received`);
      } else {
        console.log(`${colors.red}[ERROR DETAILS]${colors.reset} ${err.message}`);
      }
    }
  },
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  feature: (msg) => console.log(`\n${colors.magenta}[FEATURE]${colors.reset} ${msg}\n`)
};

// Helper function to pause execution
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Create HTTP client with interceptors
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

// Request interceptor to add auth token
api.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// First check if server is running
async function checkServerStatus() {
  try {
    log.info(`Checking server status at ${API_URL.replace('/api', '')}`);
    const response = await axios.get(`${API_URL.replace('/api', '')}/`);
    log.success(`Server is running: ${JSON.stringify(response.data)}`);
    return true;
  } catch (error) {
    if (error.response) {
      // Server responded with non-2xx status
      log.warning(`Server responded with status ${error.response.status}`);
      return true; // Server is running but returned an error
    } else if (error.request) {
      // No response received
      log.error('Server is not running or not accessible', error);
      return false;
    } else {
      log.error('Error checking server status', error);
      return false;
    }
  }
}

// Demo functions
async function registerUser(username, email, password) {
  try {
    log.info(`Registering user: ${username}, ${email}`);
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
      confirmPassword: password
    });
    
    log.success('User registered successfully');
    authToken = response.data.token;
    userId = response.data.user.id;
    return response.data;
  } catch (error) {
    log.error('Registration failed', error);
    return null;
  }
}

async function loginUser(email, password) {
  try {
    log.info(`Logging in user: ${email}`);
    const response = await api.post('/auth/login', {
      email,
      password
    });
    
    log.success('Login successful');
    authToken = response.data.token;
    userId = response.data.user.id;
    return response.data;
  } catch (error) {
    log.error('Login failed', error);
    return null;
  }
}

// Create a test file for upload
function createTestFile() {
  const testFilePath = path.join(__dirname, '../temp/test-file.txt');
  const tempDir = path.join(__dirname, '../temp');
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Create test file
  fs.writeFileSync(testFilePath, 'This is a test file for security demo.');
  
  return testFilePath;
}

async function uploadDocument(fileName, filePath, tags = []) {
  try {
    log.info(`Uploading document: ${fileName}`);
    
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('fileName', fileName);
    form.append('tags', JSON.stringify(tags));
    
    const response = await api.post('/documents/upload', form, {
      headers: {
        ...form.getHeaders()
      }
    });
    
    log.success('Document uploaded successfully');
    return response.data;
  } catch (error) {
    log.error('Upload failed', error);
    return null;
  }
}

async function testRateLimiting() {
  log.feature('Testing Rate Limiting');
  
  log.info('Sending multiple requests to trigger rate limiting...');
  
  let rateLimitDetected = false;
  
  for (let i = 0; i < 12; i++) {
    try {
      await api.post('/auth/login', {
        email: `test${i}@example.com`,
        password: 'password123'
      });
      log.info(`Request ${i+1} completed`);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        log.success('Rate limiting working: 429 Too Many Requests received');
        rateLimitDetected = true;
        break;
      } else {
        log.info(`Request ${i+1} failed with non-rate-limit error`);
      }
    }
    
    // Small delay to make requests more realistic
    await sleep(100);
  }
  
  if (!rateLimitDetected) {
    log.warning('Rate limiting not triggered. This could be normal if the limit is set higher than our test count.');
  }
}

async function testInputSanitization() {
  log.feature('Testing Input Sanitization');
  
  const maliciousInput = '<script>alert("XSS Attack!")</script>Sanitized Content';
  log.info(`Sending malicious input: ${maliciousInput}`);
  
  try {
    const response = await api.post('/auth/register', {
      username: `user_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'password123',
      confirmPassword: 'password123',
      profile: maliciousInput
    });
    
    log.success('Request completed. Checking if sanitization worked...');
    
    // Check if the response contains the sanitized input
    if (response.config && response.config.data) {
      const requestData = JSON.parse(response.config.data);
      if (requestData.profile && !requestData.profile.includes('<script>')) {
        log.success('Input sanitization working: Script tags removed');
      } else {
        log.warning('Input may not have been sanitized properly');
      }
    }
  } catch (error) {
    // Even if there's an error, we can check if the sanitization worked
    if (error.response && error.response.config && error.response.config.data) {
      const requestData = JSON.parse(error.response.config.data);
      if (requestData.profile && !requestData.profile.includes('<script>')) {
        log.success('Input sanitization working: Script tags removed');
      } else {
        log.warning('Input may not have been sanitized properly');
      }
    } else {
      log.error('Could not verify input sanitization', error);
    }
  }
}

async function testNoSQLInjection() {
  log.feature('Testing NoSQL Injection Protection');
  
  log.info('Sending malicious query parameter...');
  
  try {
    // Attempt NoSQL injection in query parameters
    await api.get('/documents?owner[$gt]=');
    log.warning('Request succeeded. NoSQL injection protection might not be working or the endpoint is not vulnerable.');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log.success('NoSQL injection protection working: Bad request detected');
    } else {
      log.error('Error occurred, but not due to NoSQL injection protection', error);
    }
  }
}

async function testRBAC() {
  log.feature('Testing Role-Based Access Control');
  
  // First, create a regular user
  const username = `user_${Date.now()}`;
  const email = `user_${Date.now()}@example.com`;
  const password = 'Password123!';
  
  const regularUser = await registerUser(username, email, password);
  
  if (!regularUser) {
    log.error('Failed to create regular user for RBAC test');
    return;
  }
  
  // Try to access admin endpoint
  try {
    await api.get('/admin/users');
    log.warning('RBAC might not be working: Regular user accessed admin endpoint');
  } catch (error) {
    if (error.response && error.response.status === 403) {
      log.success('RBAC working: Regular user blocked from admin endpoint');
    } else {
      log.error('Error occurred, but not due to RBAC', error);
    }
  }
  
  // Now login as admin (if you have admin credentials)
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const adminLogin = await loginUser(
      process.env.ADMIN_EMAIL,
      process.env.ADMIN_PASSWORD
    );
    
    if (adminLogin) {
      try {
        const response = await api.get('/admin/users');
        log.success('RBAC working: Admin user accessed admin endpoint');
      } catch (error) {
        log.error('Admin user could not access admin endpoint', error);
      }
    }
  } else {
    log.warning('Admin credentials not provided, skipping admin RBAC test');
  }
}

async function testHelmetHeaders() {
  log.feature('Testing Helmet Security Headers');
  
  try {
    const response = await axios.get(`${API_URL.replace('/api', '')}/`);
    
    const securityHeaders = [
      'x-content-type-options',
      'x-dns-prefetch-control',
      'x-download-options',
      'x-frame-options',
      'x-permitted-cross-domain-policies',
      'x-xss-protection',
      'strict-transport-security'
    ];
    
    const presentHeaders = securityHeaders.filter(
      header => response.headers[header]
    );
    
    if (presentHeaders.length > 0) {
      log.success(`Helmet security headers detected: ${presentHeaders.join(', ')}`);
    } else {
      log.warning('No Helmet security headers detected');
    }
  } catch (error) {
    log.error('Failed to test security headers', error);
  }
}

// Main demo function
async function runDemo() {
  log.info('Starting Security Features Demo');
  log.info('===============================');
  
  // First check if server is running
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    log.error('Server is not running. Please start the server before running the demo.');
    return;
  }
  
  // Test RBAC
  await testRBAC();
  
  // Test Input Sanitization
  await testInputSanitization();
  
  // Test NoSQL Injection Protection
  await testNoSQLInjection();
  
  // Test Rate Limiting
  await testRateLimiting();
  
  // Test Helmet Headers
  await testHelmetHeaders();
  
  log.info('===============================');
  log.info('Security Features Demo Completed');
}

// Run the demo
runDemo().catch(error => {
  log.error(`Demo failed with unhandled error: ${error.message}`);
});