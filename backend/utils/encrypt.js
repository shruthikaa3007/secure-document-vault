const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Promisify fs functions
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

// Ensure uploads directory exists
const ensureUploadDir = () => {
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

/**
 * Encrypt a file using AES-256-CBC
 * @param {string} filePath - Path to the file to encrypt
 * @returns {Promise<string>} - Path to the encrypted file
 */
const encryptFile = async (filePath) => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Get encryption key from environment variable
    const key = process.env.ENCRYPTION_KEY;
    
    if (!key || key.length !== 32) {
      throw new Error('Invalid encryption key. Must be 32 characters long.');
    }
    
    // Read the file
    const fileData = await readFile(filePath);
    
    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    
    // Encrypt the file
    const encrypted = Buffer.concat([
      iv,
      cipher.update(fileData),
      cipher.final()
    ]);
    
    // Generate a unique filename for the encrypted file
    const uploadDir = ensureUploadDir();
    const encryptedFilePath = path.join(uploadDir, crypto.createHash('md5').update(filePath + Date.now()).digest('hex'));
    
    // Write the encrypted file
    await writeFile(encryptedFilePath, encrypted);
    
    // Delete the original file
    await unlink(filePath);
    
    return encryptedFilePath;
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};

/**
 * Decrypt a file using AES-256-CBC
 * @param {string} encryptedFilePath - Path to the encrypted file
 * @param {string} outputPath - Path to save the decrypted file
 * @returns {Promise<string>} - Path to the decrypted file
 */
const decryptFile = async (encryptedFilePath, outputPath) => {
  try {
    // Check if file exists
    if (!fs.existsSync(encryptedFilePath)) {
      throw new Error(`Encrypted file not found: ${encryptedFilePath}`);
    }
    
    // Get encryption key from environment variable
    const key = process.env.ENCRYPTION_KEY;
    
    if (!key || key.length !== 32) {
      throw new Error('Invalid encryption key. Must be 32 characters long.');
    }
    
    // Read the encrypted file
    const encryptedData = await readFile(encryptedFilePath);
    
    // Extract the IV from the first 16 bytes
    const iv = encryptedData.slice(0, 16);
    
    // Extract the encrypted data (everything after the IV)
    const encryptedContent = encryptedData.slice(16);
    
    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    
    // Decrypt the file
    const decrypted = Buffer.concat([
      decipher.update(encryptedContent),
      decipher.final()
    ]);
    
    // Write the decrypted file
    await writeFile(outputPath, decrypted);
    
    return outputPath;
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
};

module.exports = {
  encryptFile,
  decryptFile,
  ensureUploadDir
};