const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate, authorize, isOwnerOrAdmin } = require('../middleware/authMiddleware');
const { validateObjectId, validateRequestBody } = require('../middleware/validationMiddleware');
const { uploadLimiter } = require('../middleware/rateLimitMiddleware');
const sanitizeMiddleware = require('../middleware/sanitizeMiddleware');
const { documentUploadSchema, documentUpdateSchema } = require('../utils/validationSchemas');
const Document = require('../models/Document');
const User = require('../models/User');
const { encryptFile, decryptFile } = require('../utils/encrypt');
const { ensureUploadDir, ensureTempDir } = require('../utils/ensureDirectories');
const LogService = require('../services/logService');
const mime = require('mime-types');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');


// Ensure upload directories exist
ensureUploadDir();
ensureTempDir();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, '../temp');
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    const uniqueName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    cb(null, uniqueName);
  }
});

// Define file filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ];

  // Get the file extension and determine MIME type
  const extension = path.extname(file.originalname).toLowerCase();
  let detectedMimeType = mime.lookup(extension) || file.mimetype;
  
  // Store the detected MIME type for later use
  file.detectedMimeType = detectedMimeType;
  
  if (!allowedTypes.includes(detectedMimeType)) {
    return cb(new Error(`Unsupported file type: ${detectedMimeType}`), false);
  }
  
  cb(null, true);
};

// Create multer upload instance
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

// Get all documents (filtered by user's role)
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, tags, department, classification, sort = '-createdAt' } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by tags if provided
    if (tags) {
      query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }
    
    // Filter by department if provided
    if (department) {
      query.department = department;
    }
    
    // Filter by classification if provided
    if (classification) {
      query.classification = classification;
    }
    
    // If not admin/manager/superadmin, only show user's own documents
   if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.role !== 'superadmin') {
  query.$or = [
    { owner: req.user.userId },
    { 'accessControl.user': req.user.userId }
  ];
}
 else if (req.user.role === 'manager' && department) {
      // Managers can see all documents in their department
      query.department = department;
    }
    // Superadmin and admin can see all documents (no additional query filters)
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [documents, total] = await Promise.all([
      Document.find(query)
        .populate('owner', 'username email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-encryptedPath'),
      Document.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      documents,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ 
      message: 'Error fetching documents', 
      code: 'FETCH_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/search', authenticate, async (req, res) => {
  try {
    const {
      q,
      page = 1,
      limit = 20,
      classification,
      department,
      tags,
      startDate,
      endDate
    } = req.query;

    if (!q) {
      return res.status(400).json({
        message: 'Search query is required',
        code: 'MISSING_QUERY'
      });
    }

    // Base search (text-based)
    const searchConditions = {
      $or: [
        { fileName: { $regex: q, $options: 'i' } },
        { tags: { $in: [q] } },
        { description: { $regex: q, $options: 'i' } }
      ]
    };

    // Additional filters
    const additionalFilters = {};

    if (classification) additionalFilters.classification = classification;
    if (department) additionalFilters.department = department;

    // Handle tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      additionalFilters.tags = { $in: tagArray };
    }

    // Date filter
    if (startDate || endDate) {
      additionalFilters.createdAt = {};
      if (startDate) {
        additionalFilters.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Add 1 day to include the full day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        additionalFilters.createdAt.$lte = end;
      }
    }

    // Combine base query and filters
    let finalQuery = {
      $and: [searchConditions, additionalFilters]
    };

    // Restrict access for non-admins
    if (!['admin', 'manager', 'superadmin'].includes(req.user.role)) {
      finalQuery = {
        $and: [
          {
            $or: [
              { owner: req.user.userId },
              { 'accessControl.user': req.user.userId }
            ]
          },
          searchConditions,
          additionalFilters
        ]
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [documents, total] = await Promise.all([
      Document.find(finalQuery)
        .populate('owner', 'username email')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .select('-encryptedPath'),
      Document.countDocuments(finalQuery)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      documents,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error searching documents:', error);
    res.status(500).json({
      message: 'Error searching documents',
      code: 'SEARCH_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});




// Get document by ID
router.get('/:id', authenticate, validateObjectId, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('accessControl.user', 'username email');

    
    if (!document) {
      return res.status(404).json({ 
        message: 'Document not found', 
        code: 'DOCUMENT_NOT_FOUND' 
      });
    }
    
    // Check if user has access to the document
    const isOwner = document.owner._id.toString() === req.user.userId.toString();
    const isAdminOrManagerOrSuperadmin = ['admin', 'manager', 'superadmin'].includes(req.user.role);
    
    if (!isOwner && !isAdminOrManagerOrSuperadmin) {
      // Check access control list
      const hasAccess = document.accessControl && document.accessControl.some(
  access => {
    const userId = access.user._id ? access.user._id.toString() : access.user.toString();
    return userId === req.user.userId.toString() && access.canView;
  }
);

      
      if (!hasAccess) {
        return res.status(403).json({ 
          message: 'Access denied', 
          code: 'ACCESS_DENIED' 
        });
      }
    }
    
    res.json({ document });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ 
      message: 'Error fetching document', 
      code: 'FETCH_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Upload document route
router.post('/upload', 
  authenticate, 
  uploadLimiter, 
  upload.single('file'), 
  sanitizeMiddleware,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          message: 'No file uploaded', 
          code: 'NO_FILE' 
        });
      }

      // Validate request body
      const { error } = documentUploadSchema.validate(req.body);
      if (error) {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
          message: 'Validation error', 
          details: error.details.map(d => d.message),
          code: 'VALIDATION_ERROR' 
        });
      }

      const fileName = req.body.fileName || req.file.originalname;
      const fileType = req.file.detectedMimeType || req.file.mimetype;
      const tags = req.body.tags ? JSON.parse(req.body.tags) : [];
      const description = req.body.description || '';
      const department = req.body.department || '';
      const classification = req.body.classification || 'Internal';
      
      // Extract text from the file for AI processing
      let plainText = '';
      const ext = path.extname(req.file.originalname).toLowerCase();
      
      try {
        if (ext === '.pdf') {
          const dataBuffer = fs.readFileSync(req.file.path);
          const pdfData = await pdfParse(dataBuffer);
          plainText = pdfData.text;
        } else if (ext === '.docx') {
          const result = await mammoth.extractRawText({ path: req.file.path });
          plainText = result.value;
        } else if (['.xlsx', '.xls'].includes(ext)) {
          const workbook = xlsx.readFile(req.file.path);
          const sheetNames = workbook.SheetNames;
          let text = '';
          sheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const json = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
            json.forEach(row => {
              if (row.length) text += row.join(' ') + '\n';
            });
          });
          plainText = text;
        } else if (['.txt', '.csv', '.json', '.js', '.py', '.html', '.css'].includes(ext)) {
          plainText = fs.readFileSync(req.file.path, 'utf8');
        }
      } catch (err) {
        console.error('Error extracting text from file:', err);
        // Continue with upload even if text extraction fails
      }
      
      // Initialize AI-generated tags and summary
      let autoTags = [];
      let summaryPreview = '';
      
      // Only attempt AI processing if we have text content
      if (plainText && plainText.trim().length > 0) {
        try {
          console.log('[AI] Extracted text length:', plainText.length);
          console.log('[AI] Sending text to tagger...');
          
          // Make sure to handle potential connection issues
          const aiResponse = await axios.post('http://localhost:8000/tag', { 
            text: plainText.substring(0, 10000) // Limit text length to avoid overwhelming the AI service
          }, {
            timeout: 10000 // 10 second timeout
          });
          
          if (aiResponse.data) {
            // Extract keywords and entities from AI response
            const keywords = aiResponse.data.keywords || [];
            const entities = aiResponse.data.entities || [];
            
            // Combine and deduplicate tags
            const combinedTags = [...keywords, ...entities];
            autoTags = [...new Set(combinedTags)].slice(0, 15); // Limit to 15 tags
            
            // Get summary from AI response
            summaryPreview = aiResponse.data.summary || '';
            
            console.log('[AI] Tagging complete. Tags:', autoTags.length, 'Summary length:', summaryPreview.length);
          }
        } catch (err) {
          console.error('[AI] Tagging failed:', err.message);
          // Continue with upload even if AI tagging fails
          // We'll just have empty autoTags and summaryPreview
        }
      } else {
        console.log('[AI] No text content extracted for AI processing');
      }
      
      // Encrypt the file
      const encryptedPath = await encryptFile(req.file.path);
      
      // Create the document with AI-generated tags and summary
      const document = new Document({
        fileName,
        fileType,
        tags,
        description,
        department,
        classification,
        mimeType: req.file.mimetype,
        owner: req.user.userId,
        originalName: req.file.originalname,
        encryptedPath,
        size: req.file.size,
        autoTags,
        summaryPreview
      });
      
      await document.save();
      
      // Log the upload
      await LogService.createLog({
        userId: req.user.userId,
        action: 'DOCUMENT_UPLOADED',
        details: { 
          documentId: document._id,
          fileName,
          fileType,
          classification
        }
      });
      
      res.status(201).json({
        message: 'Document uploaded successfully',
        document: {
          id: document._id,
          fileName: document.fileName,
          fileType: document.fileType,
          tags: document.tags,
          autoTags: document.autoTags,
          summaryPreview: document.summaryPreview,
          description: document.description,
          department: document.department,
          classification: document.classification,
          createdAt: document.createdAt,
          owner: document.owner
        }
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ 
        message: 'Error uploading document', 
        code: 'UPLOAD_ERROR',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Add this function to verify file hash
const verifyFileHash = async (filePath, storedHash) => {
  try {
    const computedHash = await computeFileHash(filePath);
    return computedHash === storedHash;
  } catch (error) {
    console.error('Error verifying file hash:', error);
    return false;
  }
};

// Download document
router.get('/:id/download', authenticate, validateObjectId, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ 
        message: 'Document not found', 
        code: 'DOCUMENT_NOT_FOUND' 
      });
    }
    
    // Check if user has permission to download the document
    const isOwner = document.owner.toString() === req.user.userId.toString();
    const isAdminOrManagerOrSuperadmin = ['admin', 'manager', 'superadmin'].includes(req.user.role);
    
    if (!isOwner && !isAdminOrManagerOrSuperadmin) {
      // Check access control list
      const hasAccess = document.accessControl && document.accessControl.some(
        access => access.user.toString() === req.user.userId.toString() && access.canView
      );
      
      if (!hasAccess) {
        return res.status(403).json({ 
          message: 'Access denied', 
          code: 'ACCESS_DENIED' 
        });
      }
    }
    
    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Generate a temporary file path
    const tempFilePath = path.join(tempDir, `temp-${Date.now()}-${document._id}`);
    
    // Decrypt the file
    await decryptFile(document.encryptedPath, tempFilePath);
    
    // Verify file hash if available
    if (document.fileHash) {
      const isHashValid = await verifyFileHash(tempFilePath, document.fileHash);
      
      if (!isHashValid) {
        // Delete the temporary file
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        
        // Log the hash verification failure
        await LogService.createLog({
          userId: req.user.userId,
          action: 'DOCUMENT_HASH_VERIFICATION_FAILED',
          details: {
            documentId: document._id,
            fileName: document.fileName
          }
        }, req);
        
        return res.status(400).json({
          message: 'Document integrity check failed. The file may have been tampered with.',
          code: 'HASH_VERIFICATION_FAILED'
        });
      }
    }
    
    // Determine the correct filename with extension
    let finalFileName = document.originalName || document.fileName || `document-${document._id}`;
    
    // Enhanced MIME type to extension mapping
    const mimeToExt = {
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'application/vnd.ms-excel': '.xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
      'application/vnd.ms-powerpoint': '.ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
      'text/plain': '.txt',
      'text/csv': '.csv',
      'text/html': '.html',
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'application/zip': '.zip',
      'application/x-rar-compressed': '.rar'
    };
    
    // Ensure filename has correct extension
    const fileExt = path.extname(finalFileName).toLowerCase();
    if (!fileExt && document.mimeType) {
      const defaultExt = mimeToExt[document.mimeType] || '';
      if (defaultExt) {
        finalFileName += defaultExt;
      }
    }
    
    // Sanitize filename
    finalFileName = finalFileName.replace(/[^a-zA-Z0-9_\-\. ]/g, '_');
    
    // Set headers
    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${finalFileName}"`);
    
    // Log the download
    await LogService.createLog({
      userId: req.user.userId,
      action: 'DOCUMENT_DOWNLOADED',
      details: { 
        documentId: document._id,
        fileName: document.fileName
      }
    }, req);
    
    // Send file and delete temp file after sending
    res.download(tempFilePath, finalFileName, (err) => {
      // Delete the temporary file after sending
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      
      if (err) {
        console.error('Error sending file:', err);
      }
    });
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({
      message: 'Error downloading document',
      code: 'DOWNLOAD_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update document
router.put('/:id', authenticate, validateObjectId, sanitizeMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ 
        message: 'Document not found', 
        code: 'DOCUMENT_NOT_FOUND' 
      });
    }
    
    // Check if user has permission to update the document
    const isOwner = document.owner.toString() === req.user.userId.toString();
    const isAdminOrManagerOrSuperadmin = ['admin', 'manager', 'superadmin'].includes(req.user.role);
    
    if (!isOwner && !isAdminOrManagerOrSuperadmin) {
      // Check access control list
      const hasAccess = document.accessControl && document.accessControl.some(
        access => access.user.toString() === req.user.userId.toString() && access.canEdit
      );
      
      if (!hasAccess) {
        return res.status(403).json({ 
          message: 'Access denied', 
          code: 'ACCESS_DENIED' 
        });
      }
    }
    
    // Validate request body
    const { error } = documentUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.details.map(d => d.message),
        code: 'VALIDATION_ERROR' 
      });
    }
    
    // Update fields
    if (req.body.fileName) document.fileName = req.body.fileName;
    if (req.body.tags) document.tags = JSON.parse(req.body.tags);
    if (req.body.description !== undefined) document.description = req.body.description;
    if (req.body.department !== undefined) document.department = req.body.department;
    if (req.body.classification !== undefined) document.classification = req.body.classification;
    
    await document.save();
    
    // Log the update
    await LogService.createLog({
      userId: req.user.userId,
      action: 'DOCUMENT_UPDATED',
      details: { 
        documentId: document._id,
        fileName: document.fileName,
        updates: Object.keys(req.body).join(', ')
      }
    }, req);
    
    res.json({
      message: 'Document updated successfully',
      document: {
        id: document._id,
        fileName: document.fileName,
        tags: document.tags,
        description: document.description,
        department: document.department,
        classification: document.classification,
        updatedAt: document.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ 
      message: 'Error updating document', 
      code: 'UPDATE_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete document
router.delete('/:id', authenticate, validateObjectId, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ 
        message: 'Document not found', 
        code: 'DOCUMENT_NOT_FOUND' 
      });
    }
    
    // Check if user has permission to delete the document
    const isOwner = document.owner.toString() === req.user.userId.toString();
    const isAdminOrSuperadmin = ['admin', 'superadmin'].includes(req.user.role);
    
    if (!isOwner && !isAdminOrSuperadmin) {
      // Check access control list
      const hasAccess = document.accessControl && document.accessControl.some(
        access => access.user.toString() === req.user.userId.toString() && access.canDelete
      );
      
      if (!hasAccess) {
        return res.status(403).json({ 
          message: 'Access denied', 
          code: 'ACCESS_DENIED' 
        });
      }
    }
    
    // Delete the encrypted file
    if (document.encryptedPath && fs.existsSync(document.encryptedPath)) {
      fs.unlinkSync(document.encryptedPath);
    }
    
    // Delete the document record
    await Document.findByIdAndDelete(req.params.id);
    
    // Log the deletion
    await LogService.createLog({
      userId: req.user.userId,
      action: 'DOCUMENT_DELETED',
      details: { 
        documentId: req.params.id,
        fileName: document.fileName
      }
    });
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ 
      message: 'Error deleting document', 
      code: 'DELETE_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Admin route to view all documents
router.get('/admin/all', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt' } = req.query;
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [documents, total] = await Promise.all([
      Document.find()
        .populate('owner', 'username email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Document.countDocuments()
    ]);
    
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      documents,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching all documents:', error);
    res.status(500).json({ 
      message: 'Error fetching all documents', 
      code: 'FETCH_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Share document with another user
router.post('/:id/share', authenticate, validateObjectId, sanitizeMiddleware, async (req, res) => {
  try {
    const { userId, permissions } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        message: 'User ID is required', 
        code: 'MISSING_USER_ID' 
      });
    }
    
    if (!permissions) {
      return res.status(400).json({ 
        message: 'Permissions are required', 
        code: 'MISSING_PERMISSIONS' 
      });
    }
    
    // Find the document
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ 
        message: 'Document not found', 
        code: 'DOCUMENT_NOT_FOUND' 
      });
    }
    
    // Check if user has permission to share the document
    const isOwner = document.owner.toString() === req.user.userId.toString();
    const isAdminOrManager = ['admin', 'manager', 'superadmin'].includes(req.user.role);
    
    if (!isOwner && !isAdminOrManager) {
      return res.status(403).json({ 
        message: 'Access denied: You do not have permission to share this document', 
        code: 'ACCESS_DENIED' 
      });
    }
    
    // Check if the user exists
    const userToShare = await User.findById(userId);
    if (!userToShare) {
      return res.status(404).json({ 
        message: 'User not found', 
        code: 'USER_NOT_FOUND' 
      });
    }
    
    // Check if the document is already shared with this user
    const existingShareIndex = document.accessControl.findIndex(
      access => access.user.toString() === userId
    );
    
    if (existingShareIndex !== -1) {
      // Update existing permissions
      document.accessControl[existingShareIndex] = {
        user: userId,
        canView: permissions.canView !== undefined ? permissions.canView : true,
        canEdit: permissions.canEdit !== undefined ? permissions.canEdit : false,
        canDelete: permissions.canDelete !== undefined ? permissions.canDelete : false
      };
    } else {
      // Add new access control entry
      document.accessControl.push({
        user: userId,
        canView: permissions.canView !== undefined ? permissions.canView : true,
        canEdit: permissions.canEdit !== undefined ? permissions.canEdit : false,
        canDelete: permissions.canDelete !== undefined ? permissions.canDelete : false
      });
    }
    
    await document.save();
    
    // Log the share action
    await LogService.createLog({
      userId: req.user.userId,
      action: 'DOCUMENT_SHARED',
      details: { 
        documentId: document._id,
        sharedWithUserId: userId,
        permissions
      }
    }, req);
    
    res.json({
      message: 'Document shared successfully',
      document: {
        id: document._id,
        accessControl: document.accessControl
      }
    });
  } catch (error) {
    console.error('Error sharing document:', error);
    res.status(500).json({ 
      message: 'Error sharing document', 
      code: 'SHARE_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Revoke access to a document
router.delete('/:id/share/:userId', authenticate, validateObjectId, async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    // Find the document
    const document = await Document.findById(id);
    
    if (!document) {
      return res.status(404).json({ 
        message: 'Document not found', 
        code: 'DOCUMENT_NOT_FOUND' 
      });
    }
    
    // Check if user has permission to modify sharing
    const isOwner = document.owner.toString() === req.user.userId.toString();
    const isAdminOrManager = ['admin', 'manager', 'superadmin'].includes(req.user.role);
    
    if (!isOwner && !isAdminOrManager) {
      return res.status(403).json({ 
        message: 'Access denied: You do not have permission to modify sharing for this document', 
        code: 'ACCESS_DENIED' 
      });
    }
    
    // Find the access control entry for this user
    const accessIndex = document.accessControl.findIndex(
      access => access.user.toString() === userId
    );
    
    if (accessIndex === -1) {
      return res.status(404).json({ 
        message: 'This document is not shared with the specified user', 
        code: 'SHARE_NOT_FOUND' 
      });
    }
    
    // Remove the access control entry
    document.accessControl.splice(accessIndex, 1);
    await document.save();
    
    // Log the revoke action
    await LogService.createLog({
      userId: req.user.userId,
      action: 'DOCUMENT_ACCESS_REVOKED',
      details: { 
        documentId: document._id,
        revokedFromUserId: userId
      }
    }, req);
    
    res.json({
      message: 'Document access revoked successfully',
      document: {
        id: document._id,
        accessControl: document.accessControl
      }
    });
  } catch (error) {
    console.error('Error revoking document access:', error);
    res.status(500).json({ 
      message: 'Error revoking document access', 
      code: 'REVOKE_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;