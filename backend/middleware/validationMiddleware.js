const { isValidObjectId } = require('mongoose');

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (req, res, next) => {
  const id = req.params.id;
  
  if (!id || !isValidObjectId(id)) {
    return res.status(400).json({ 
      message: 'Invalid ID format', 
      code: 'INVALID_ID' 
    });
  }
  
  next();
};

/**
 * Validate query parameters for MongoDB queries
 */
const validateQueryParams = (req, res, next) => {
  // Check for potential NoSQL injection in query parameters
  const query = req.query;
  
  // Detect potential operator injection
  const hasOperator = Object.keys(query).some(key => 
    typeof query[key] === 'string' && 
    (query[key].includes('$') || key.includes('$'))
  );
  
  if (hasOperator) {
    return res.status(400).json({ 
      message: 'Invalid query parameters', 
      code: 'INVALID_QUERY' 
    });
  }
  
  next();
};

/**
 * Validate request body against a Joi schema
 * @param {Object} schema - Joi schema to validate against
 */
const validateRequestBody = (schema) => {
  return (req, res, next) => {
    if (!req.body) {
      return res.status(400).json({ 
        message: 'Request body is required', 
        code: 'MISSING_BODY' 
      });
    }
    
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.details.map(d => d.message),
        code: 'VALIDATION_ERROR' 
      });
    }
    
    // Replace req.body with validated value
    req.body = value;
    next();
  };
};

module.exports = {
  validateObjectId,
  validateQueryParams,
  validateRequestBody
};