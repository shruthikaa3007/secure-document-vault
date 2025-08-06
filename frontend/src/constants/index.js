// Document classifications
export const DOCUMENT_CLASSIFICATIONS = [
  'Public',
  'Internal',
  'Confidential',
  'Restricted'
];

// Department options
export const DEPARTMENTS = [
  'General',
  'IT',
  'HR',
  'Finance',
  'Marketing',
  'Operations',
  'Legal',
  'Executive',
  'Sales',
  'Research',
  'Development'
];

// User roles - Updated with superadmin
export const USER_ROLES = [
  'user',
  'manager',
  'admin',
  'superadmin'
];

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    ME: '/auth/me'
  },
  DOCUMENTS: {
    LIST: '/documents',
    DETAIL: (id) => `/documents/${id}`,
    UPLOAD: '/documents/upload',
    DOWNLOAD: (id) => `/documents/${id}/download`,
    SEARCH: '/documents/search',
    SHARE: (id) => `/documents/${id}/share`,
    REVOKE_ACCESS: (id, userId) => `/documents/${id}/share/${userId}`
  },
  ADMIN: {
    USERS: '/admin/users',
    USER_DETAIL: (id) => `/admin/users/${id}`,
    ROLES: '/admin/roles',
    SYSTEM_STATS: '/admin/system-stats'
  },
  LOGS: {
    LIST: '/logs',
    EXPORT: '/logs/export',
    EXPORTS: '/logs/exports',
    EXPORT_DOWNLOAD: (filename) => `/logs/exports/${filename}`
  }
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME_MODE: 'themeMode'
};

// Routes - Updated with superadmin routes
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  DOCUMENTS: '/documents',
  DOCUMENT_DETAIL: (id) => `/documents/${id}`,
  UPLOAD: '/upload',
  PROFILE: '/profile',
  SEARCH: '/search',
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    LOGS: '/admin/logs',
    SUPERADMIN: '/admin/superadmin'
  },
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/not-found'
};