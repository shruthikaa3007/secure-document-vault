/**
 * Safely stringify an object, handling circular references
 * @param {Object} obj - Object to stringify
 * @param {number} indent - Indentation spaces
 * @returns {string} - JSON string
 */
const safeStringify = (obj, indent = 2) => {
  const cache = new Set();
  
  const safeReplacer = (key, value) => {
    if (value === undefined) {
      return '[undefined]';
    }
    
    if (typeof value === 'function') {
      return `[Function: ${value.name || 'anonymous'}]`;
    }
    
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return '[Circular Reference]';
      }
      cache.add(value);
    }
    
    return value;
  };
  
  try {
    const result = JSON.stringify(obj, safeReplacer, indent);
    cache.clear();
    return result;
  } catch (error) {
    return `[Error during JSON.stringify: ${error.message}]`;
  }
};

/**
 * Safely parse a JSON string
 * @param {string} str - JSON string to parse
 * @param {Function} reviver - Reviver function
 * @returns {Object|null} - Parsed object or null on error
 */
const safeParse = (str, reviver = null) => {
  try {
    return JSON.parse(str, reviver);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
};

module.exports = {
  safeStringify,
  safeParse
};