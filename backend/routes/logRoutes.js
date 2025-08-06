const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticate } = require('../middleware/authMiddleware');
const LogService = require('../services/logService');

// Middleware to check if user has access to logs
const logAccessMiddleware = async (req, res, next) => {
  try {
    // Check if user has admin or manager role
    const userRole = req.user.role;
    const userPermissions = req.user.permissions || [];
    
    // Allow access if user has view:logs permission
    if (userPermissions.includes('view:logs')) {
      return next();
    }
    
    // Restrict access for regular users
    if (userRole !== 'admin' && userRole !== 'manager' && userRole !== 'superadmin') {
      return res.status(403).json({
        message: 'Access denied: Insufficient permissions to view logs',
        code: 'ACCESS_DENIED'
      });
    }
    
    next();
  } catch (error) {
    console.error('Log access middleware error:', error);
    res.status(500).json({ 
      message: 'Server error checking log access permissions',
      error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
    });
  }
};

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
  const userRole = req.user.role;
  const userPermissions = req.user.permissions || [];
  
  // Allow access if user has manage:logs permission
  if (userPermissions.includes('manage:logs')) {
    return next();
  }
  
  // Restrict access for non-admin users
  if (userRole !== 'admin' && userRole !== 'superadmin') {
    return res.status(403).json({
      message: 'Access denied: Admin privileges required',
      code: 'ADMIN_REQUIRED'
    });
  }
  
  next();
};

// Get logs with filtering and pagination
router.get('/', authenticate, logAccessMiddleware, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      action, 
      userId, 
      startDate, 
      endDate,
      sort = '-createdAt'
    } = req.query;
    
    // Build filters
    const filters = {};
    
    if (action) {
      filters.action = action;
    }
    
    // Non-admin users can only see their own logs
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      filters.userId = req.user.userId;
    } else if (userId) {
      filters.userId = userId;
    }
    
    // Date range
    if (startDate) {
      filters.startDate = startDate;
    }
    
    if (endDate) {
      filters.endDate = endDate;
    }
    
    // Get logs
    const result = await LogService.getLogs(filters, page, limit, sort);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ 
      message: 'Failed to fetch logs',
      error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
    });
  }
});

// Get logs by type
router.get('/type/:type', authenticate, logAccessMiddleware, async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const result = await LogService.getLogsByType(type, page, limit);
    res.json(result);
  } catch (error) {
    console.error('Error fetching logs by type:', error);
    res.status(500).json({ 
      message: 'Failed to fetch logs by type',
      error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
    });
  }
});

// Get logs by user
router.get('/user/:userId', authenticate, logAccessMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    // Check if user can access other users' logs
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && userId !== req.user.userId) {
      return res.status(403).json({
        message: 'Access denied: Cannot view other users\' logs',
        code: 'ACCESS_DENIED'
      });
    }
    
    const result = await LogService.getLogsByUser(userId, page, limit);
    res.json(result);
  } catch (error) {
    console.error('Error fetching logs by user:', error);
    res.status(500).json({ 
      message: 'Failed to fetch logs by user',
      error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
    });
  }
});

// Get logs by date range
router.get('/date-range', authenticate, logAccessMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 20 } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: 'Start date and end date are required',
        code: 'MISSING_DATES'
      });
    }
    
    const result = await LogService.getLogsByDateRange(startDate, endDate, page, limit);
    res.json(result);
  } catch (error) {
    console.error('Error fetching logs by date range:', error);
    res.status(500).json({ 
      message: 'Failed to fetch logs by date range',
      error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
    });
  }
});

// Export logs to CSV
router.get('/export', authenticate, adminMiddleware, async (req, res) => {
  try {
    const { action, userId, startDate, endDate } = req.query;
    
    // Build filters
    const filters = {};
    
    if (action) {
      filters.action = action;
    }
    
    if (userId) {
      filters.userId = userId;
    }
    
    // Date range
    if (startDate) {
      filters.startDate = startDate;
    }
    
    if (endDate) {
      filters.endDate = endDate;
    }
    
    // Export logs
    const { filePath, fileName } = await LogService.exportLogs(filters);
    
    // Log the export
    await LogService.createLog({
      userId: req.user.userId,
      action: 'LOGS_EXPORTED',
      details: { 
        fileName,
        filters: JSON.stringify(filters)
      }
    }, req);
    
    // Send file
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      
      // Clean up file after download
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 5000); // Delete after 5 seconds
    });
  } catch (error) {
    console.error('Error exporting logs:', error);
    res.status(500).json({ 
      message: 'Failed to export logs',
      error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
    });
  }
});

// Get list of exported log files
router.get('/exports', authenticate, adminMiddleware, async (req, res) => {
  try {
    const exportDir = path.join(__dirname, '../log_exports');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    // Read directory
    const files = fs.readdirSync(exportDir)
      .filter(file => file.endsWith('.csv'))
      .map(file => {
        const stats = fs.statSync(path.join(exportDir, file));
        return {
          name: file,
          size: stats.size,
          createdAt: stats.birthtime
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);
    
    res.json({ files });
  } catch (error) {
    console.error('Error fetching exported logs:', error);
    res.status(500).json({ 
      message: 'Failed to fetch exported logs',
      error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
    });
  }
});

// Download exported log file
router.get('/exports/:filename', authenticate, adminMiddleware, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../log_exports', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        message: 'File not found',
        code: 'FILE_NOT_FOUND'
      });
    }
    
    // Log the download
    await LogService.createLog({
      userId: req.user.userId,
      action: 'LOG_FILE_DOWNLOADED',
      details: { fileName: filename }
    }, req);
    
    // Send file
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
    });
  } catch (error) {
    console.error('Error downloading log file:', error);
    res.status(500).json({ 
      message: 'Failed to download log file',
      error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
    });
  }
});

// Clear all logs (superadmin only)
router.delete('/', authenticate, async (req, res) => {
  try {
    // Check if user is superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        message: 'Access denied: Superadmin privileges required',
        code: 'SUPERADMIN_REQUIRED'
      });
    }
    
    const result = await LogService.clearLogs();
    
    // Log the action
    await LogService.createLog({
      userId: req.user.userId,
      action: 'LOGS_CLEARED',
      details: { deletedCount: result.deletedCount }
    }, req);
    
    res.json({ 
      message: 'All logs cleared successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing logs:', error);
    res.status(500).json({ 
      message: 'Failed to clear logs',
      error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
    });
  }
});

module.exports = router;