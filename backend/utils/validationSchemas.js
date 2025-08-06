const Joi = require('joi');

// User registration schema
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required()
    .messages({
      'string.base': 'Username must be a string',
      'string.empty': 'Username is required',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username cannot exceed 30 characters',
      'string.alphanum': 'Username must only contain alphanumeric characters',
      'any.required': 'Username is required'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.base': 'Email must be a string',
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    .required()
    .messages({
      'string.base': 'Password must be a string',
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    .messages({
      'string.base': 'Confirm password must be a string',
      'string.empty': 'Confirm password is required',
      'any.only': 'Passwords must match',
      'any.required': 'Confirm password is required'
    }),
  roleName: Joi.string().optional()
    .messages({
      'string.base': 'Role name must be a string'
    }),
  department: Joi.string().optional()
    .messages({
      'string.base': 'Department must be a string'
    })
});

// User login schema
const loginSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.base': 'Email must be a string',
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string().required()
    .messages({
      'string.base': 'Password must be a string',
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    })
});

// Document upload schema
const documentUploadSchema = Joi.object({
  fileName: Joi.string().max(255).optional()
    .messages({
      'string.base': 'File name must be a string',
      'string.max': 'File name cannot exceed 255 characters'
    }),
  tags: Joi.string().custom((value, helpers) => {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        return helpers.error('Tags must be an array');
      }
      return value;
    } catch (error) {
      return helpers.error('Tags must be a valid JSON array');
    }
  }).optional()
    .messages({
      'string.base': 'Tags must be a string representation of a JSON array'
    }),
  description: Joi.string().optional()
    .messages({
      'string.base': 'Description must be a string'
    }),
  department: Joi.string().optional()
    .messages({
      'string.base': 'Department must be a string'
    }),
  classification: Joi.string().optional()
    .messages({
      'string.base': 'Classification must be a string'
    })
});

// Document update schema
const documentUpdateSchema = Joi.object({
  fileName: Joi.string().max(255).optional()
    .messages({
      'string.base': 'File name must be a string',
      'string.max': 'File name cannot exceed 255 characters'
    }),
  tags: Joi.string().custom((value, helpers) => {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        return helpers.error('Tags must be an array');
      }
      return value;
    } catch (error) {
      return helpers.error('Tags must be a valid JSON array');
    }
  }).optional()
    .messages({
      'string.base': 'Tags must be a string representation of a JSON array'
    }),
  description: Joi.string().optional()
    .messages({
      'string.base': 'Description must be a string'
    }),
  department: Joi.string().optional()
    .messages({
      'string.base': 'Department must be a string'
    }),
  classification: Joi.string().optional()
    .messages({
      'string.base': 'Classification must be a string'
    })
});

module.exports = {
  registerSchema,
  loginSchema,
  documentUploadSchema,
  documentUpdateSchema
};