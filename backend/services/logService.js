const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');
const AuditLog = require('../models/AuditLog');
const { ensureLogExportsDir } = require('../utils/ensureDirectories');

class LogService {
  /**
   * Create a new log entry
   * @param {Object} logData - Log data
   * @param {string} logData.userId - User ID
   * @param {string} logData.action - Action performed
   * @param {Object} logData.details - Additional details
   * @param {Object} req - Express request object
   * @returns {Promise<Object>} Created log
   */
  static async createLog(logData, req = null) {
    try {
      const { userId, action, details } = logData;
      
      const log = new AuditLog({
        userId,
        action,
        details,
        ipAddress: req ? (req.ip || req.connection.remoteAddress) : null,
        userAgent: req ? req.get('User-Agent') : null
      });
      
      await log.save();
      return log;
    } catch (error) {
      console.error('Error creating log:', error);
      throw error;
    }
  }

  /**
   * Get logs with pagination and filtering
   * @param {Object} filters - Filters to apply
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} sort - Sort field and direction
   * @returns {Promise<Object>} Logs and pagination info
   */
  static async getLogs(filters = {}, page = 1, limit = 20, sort = '-createdAt') {
    try {
      const query = {};
      
      // Apply filters
      if (filters.action) {
        query.action = filters.action;
      }
      
      if (filters.userId) {
        query.userId = filters.userId;
      }
      
      // Date range
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        
        if (filters.startDate) {
          query.createdAt.$gte = new Date(filters.startDate);
        }
        
        if (filters.endDate) {
          query.createdAt.$lte = new Date(filters.endDate);
        }
      }
      
      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [logs, total] = await Promise.all([
        AuditLog.find(query)
          .populate('userId', 'username email')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        AuditLog.countDocuments(query)
      ]);
      
      const totalPages = Math.ceil(total / parseInt(limit));
      
      return {
        logs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      };
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  }

  /**
   * Export logs to CSV file
   * @param {Object} filters - Filters to apply
   * @returns {Promise<Object>} File path and name
   */
  static async exportLogs(filters = {}) {
    try {
      // Ensure export directory exists
      const exportDir = ensureLogExportsDir();
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `logs_export_${timestamp}.csv`;
      const filePath = path.join(exportDir, fileName);
      
      // Get logs (no pagination for export)
      const query = {};
      
      // Apply filters
      if (filters.action) {
        query.action = filters.action;
      }
      
      if (filters.userId) {
        query.userId = filters.userId;
      }
      
      // Date range
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        
        if (filters.startDate) {
          query.createdAt.$gte = new Date(filters.startDate);
        }
        
        if (filters.endDate) {
          query.createdAt.$lte = new Date(filters.endDate);
        }
      }
      
      // Get all logs matching the query
      const logs = await AuditLog.find(query)
        .populate('userId', 'username email')
        .sort('-createdAt');
      
      // Create CSV writer
      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
          { id: 'timestamp', title: 'Timestamp' },
          { id: 'user', title: 'User' },
          { id: 'action', title: 'Action' },
          { id: 'details', title: 'Details' },
          { id: 'ipAddress', title: 'IP Address' },
          { id: 'userAgent', title: 'User Agent' }
        ]
      });
      
      // Format logs for CSV
      const records = logs.map(log => ({
        timestamp: log.createdAt.toISOString(),
        user: log.userId ? `${log.userId.username} (${log.userId.email})` : 'System',
        action: log.action,
        details: JSON.stringify(log.details || {}),
        ipAddress: log.ipAddress || 'N/A',
        userAgent: log.userAgent || 'N/A'
      }));
      
      // Write CSV
      await csvWriter.writeRecords(records);
      
      return { filePath, fileName };
    } catch (error) {
      console.error('Error exporting logs:', error);
      throw error;
    }
  }

  /**
   * Export logs to CSV string format
   * @param {Object} filters - Filters to apply
   * @returns {Promise<string>} CSV data
   */
  static async exportLogsToCSV(filters = {}) {
    try {
      // Get logs (no pagination for export)
      const query = {};
      
      // Apply filters
      if (filters.action) {
        query.action = filters.action;
      }
      
      if (filters.userId) {
        query.userId = filters.userId;
      }
      
      // Date range
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        
        if (filters.startDate) {
          query.createdAt.$gte = new Date(filters.startDate);
        }
        
        if (filters.endDate) {
          query.createdAt.$lte = new Date(filters.endDate);
        }
      }
      
      // Get all logs matching the query
      const logs = await AuditLog.find(query)
        .populate('userId', 'username email')
        .sort('-createdAt');
      
      // CSV header
      let csv = 'Timestamp,User,Action,Details,IP Address,User Agent\n';
      
      // Add rows
      logs.forEach(log => {
        const timestamp = log.createdAt.toISOString();
        const user = log.userId ? `"${log.userId.username} (${log.userId.email})"` : 'System';
        const action = log.action;
        const details = `"${JSON.stringify(log.details || {}).replace(/"/g, '""')}"`;
        const ipAddress = log.ipAddress || 'N/A';
        const userAgent = `"${(log.userAgent || 'N/A').replace(/"/g, '""')}"`;
        
        csv += `${timestamp},${user},${action},${details},${ipAddress},${userAgent}\n`;
      });
      
      return csv;
    } catch (error) {
      console.error('Error exporting logs to CSV:', error);
      throw error;
    }
  }

  /**
   * Get logs by type with pagination
   * @param {string} type - Log type/action
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Logs and pagination info
   */
  static async getLogsByType(type, page = 1, limit = 20) {
    return this.getLogs({ action: type }, page, limit);
  }

  /**
   * Get logs by user with pagination
   * @param {string} userId - User ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Logs and pagination info
   */
  static async getLogsByUser(userId, page = 1, limit = 20) {
    return this.getLogs({ userId }, page, limit);
  }

  /**
   * Get logs by date range with pagination
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Logs and pagination info
   */
  static async getLogsByDateRange(startDate, endDate, page = 1, limit = 20) {
    return this.getLogs({ startDate, endDate }, page, limit);
  }

  /**
   * Clear all logs (admin only)
   * @returns {Promise<Object>} Result
   */
  static async clearLogs() {
    try {
      const result = await AuditLog.deleteMany({});
      return { deletedCount: result.deletedCount };
    } catch (error) {
      console.error('Error clearing logs:', error);
      throw error;
    }
  }
}

module.exports = LogService;