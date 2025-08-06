const sanitizeHtml = require('sanitize-html');

// Default sanitize-html options
const sanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: 'recursiveEscape'
};

// Sanitize middleware for request body
const sanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    // Sanitize each field in the request body
    Object.keys(req.body).forEach(key => {
      // Skip sanitization for specific fields like passwords or JSON strings
      if (key === 'password' || key === 'confirmPassword' || key === 'tags') {
        return;
      }
      
      // Only sanitize string values
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key], sanitizeOptions);
      }
    });
  }
  
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeHtml(req.query[key], sanitizeOptions);
      }
    });
  }
  
  next();
};

module.exports = sanitizeMiddleware;
