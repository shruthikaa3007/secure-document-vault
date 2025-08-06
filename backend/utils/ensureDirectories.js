const fs = require('fs');
const path = require('path');

/**
 * Ensure a directory exists, create it if it doesn't
 * @param {string} dirPath - Path to the directory
 * @returns {string} - Path to the directory
 */
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
};

/**
 * Ensure the upload directory exists
 * @returns {string} - Path to the upload directory
 */
const ensureUploadDir = () => {
  const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
  return ensureDirectoryExists(uploadDir);
};

/**
 * Ensure the temp directory exists
 * @returns {string} - Path to the temp directory
 */
const ensureTempDir = () => {
  const tempDir = path.join(__dirname, '../temp');
  return ensureDirectoryExists(tempDir);
};

/**
 * Ensure the log exports directory exists
 * @returns {string} - Path to the log exports directory
 */
const ensureLogExportsDir = () => {
  const logExportsDir = path.join(__dirname, '../log_exports');
  return ensureDirectoryExists(logExportsDir);
};

module.exports = {
  ensureDirectoryExists,
  ensureUploadDir,
  ensureTempDir,
  ensureLogExportsDir
};