const fs = require('fs');
const path = require('path');
const { safeStringify } = require('./objectUtils');

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

// Get current log level from environment variable
const currentLogLevel = (() => {
  const envLevel = process.env.LOG_LEVEL?.toUpperCase();
  return LOG_LEVELS[envLevel] !== undefined ? LOG_LEVELS[envLevel] : LOG_LEVELS.INFO;
})();

/**
 * Write debug message to file
 * @param {string} message - Debug message
 * @param {Object} data - Additional data to log
 * @param {string} level - Log level (ERROR, WARN, INFO, DEBUG, TRACE)
 */
const debugToFile = (message, data = {}, level = 'DEBUG') => {
  try {
    // Check if debug is enabled
    if (process.env.DEBUG === 'false') return;
    
    // Check if level should be logged
    const logLevel = LOG_LEVELS[level] || LOG_LEVELS.DEBUG;
    if (logLevel > currentLogLevel) return;
    
    // Create logs directory if it doesn't exist
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Create log file path
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(logDir, `debug-${date}.log`);
    
    // Create log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
    
    // Append to log file
    fs.appendFileSync(logFile, safeStringify(logEntry) + '\n');
  } catch (error) {
    console.error('Error writing to debug file:', error);
  }
};

/**
 * Log debug message to console and optionally to file
 * @param {string} message - Debug message
 * @param {Object} data - Additional data to log
 * @param {string} level - Log level (ERROR, WARN, INFO, DEBUG, TRACE)
 * @param {boolean} toFile - Whether to also write to file
 */
const debug = (message, data = {}, level = 'DEBUG', toFile = false) => {
  // Check if level should be logged
  const logLevel = LOG_LEVELS[level] || LOG_LEVELS.DEBUG;
  if (logLevel > currentLogLevel) return;
  
  // Format timestamp
  const timestamp = new Date().toISOString();
  
  // Determine console method based on level
  let consoleMethod;
  switch (level) {
    case 'ERROR':
      consoleMethod = console.error;
      break;
    case 'WARN':
      consoleMethod = console.warn;
      break;
    case 'INFO':
      consoleMethod = console.info;
      break;
    default:
      consoleMethod = console.log;
  }
  
  // Log to console
  consoleMethod(`[${timestamp}] [${level}] ${message}`, Object.keys(data).length ? data : '');
  
  // Log to file if requested
  if (toFile) {
    debugToFile(message, data, level);
  }
};

module.exports = {
  debug,
  debugToFile,
  LOG_LEVELS,
  safeStringify
};