const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const documentSchema = new Schema({
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  fileType: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  classification: {
    type: String,
    enum: ['Public', 'Internal', 'Confidential', 'Restricted'],
    default: 'Internal'
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  encryptedPath: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 0
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  autoTags: {
    type: [String],
    default: []
  },
  summaryPreview: {
    type: String,
    default: ''
  },
  fileHash: {
    type: String,
    default: ''
  },
  accessControl: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    canView: {
      type: Boolean,
      default: true
    },
    canEdit: {
      type: Boolean,
      default: false
    },
    canDelete: {
      type: Boolean,
      default: false
    }
  }]
}, { timestamps: true });

// Create text index for search
documentSchema.index({ 
  fileName: 'text', 
  description: 'text', 
  tags: 'text',
  autoTags: 'text',
  summaryPreview: 'text'
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;