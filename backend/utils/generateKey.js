const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { debug } = require('./debugUtils');

/**
 * Generate a random 32-character encryption key
 * @returns {string} - 32-character encryption key
 */
const generateKey = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Update .env file with new encryption key
 * @param {string} key - Encryption key to add to .env
 */
const updateEnvFile = (key) => {
  try {
    const envPath = path.join(__dirname, '../.env');
    let envContent = '';
    
    // Read existing .env file if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Check if ENCRYPTION_KEY already exists
    if (envContent.includes('ENCRYPTION_KEY=')) {
      // Replace existing key
      envContent = envContent.replace(
        /ENCRYPTION_KEY=.*/,
        `ENCRYPTION_KEY=${key}`
      );
    } else {
      // Add new key
      envContent += `\nENCRYPTION_KEY=${key}\n`;
    }
    
    // Write updated content back to .env
    fs.writeFileSync(envPath, envContent);
    
    debug('Updated .env file with new encryption key', {}, 'INFO', true);
    return true;
  } catch (error) {
    debug('Error updating .env file', { error: error.message }, 'ERROR', true);
    return false;
  }
};

// If this script is run directly
if (require.main === module) {
  const key = generateKey();
  console.log('\n=== Encryption Key Generator ===');
  console.log(`\nGenerated key: ${key}`);
  
  const updated = updateEnvFile(key);
  
  if (updated) {
    console.log('\n✅ .env file updated with new encryption key.');
  } else {
    console.log('\n❌ Failed to update .env file. Please add the key manually:');
    console.log(`\nENCRYPTION_KEY=${key}\n`);
  }
  
  console.log('Note: This key is used for encrypting documents. Keep it secure and consistent.');
  console.log('      Changing this key will make existing encrypted documents inaccessible.\n');
}

module.exports = {
  generateKey,
  updateEnvFile
};