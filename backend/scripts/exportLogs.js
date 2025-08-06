#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const LogService = require('../services/logService');

// Directory to store log exports
const EXPORT_DIR = path.join(__dirname, '../log_exports');

// Ensure export directory exists
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

// Format date for filename
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Connect to MongoDB and export logs
async function exportDailyLogs() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB. Exporting logs...');
    
    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Export logs for yesterday
    const filters = {
      startDate: yesterday,
      endDate: today
    };
    
    const csvData = await LogService.exportLogsToCSV(filters);
    
    // Create filename with yesterday's date
    const filename = `logs_${formatDate(yesterday)}.csv`;
    const filePath = path.join(EXPORT_DIR, filename);
    
    // Write to file
    fs.writeFileSync(filePath, csvData);
    
    console.log(`Logs exported successfully to ${filePath}`);
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    return { success: true, filePath };
  } catch (error) {
    console.error('Error exporting logs:', error);
    
    // Close MongoDB connection if open
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
    
    return { success: false, error: error.message };
  }
}

// Run the export if executed directly
if (require.main === module) {
  exportDailyLogs()
    .then(result => {
      if (result.success) {
        console.log('Daily log export completed successfully');
        process.exit(0);
      } else {
        console.error('Daily log export failed:', result.error);
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unhandled error:', err);
      process.exit(1);
    });
} else {
  // Export for use in other scripts
  module.exports = exportDailyLogs;
}