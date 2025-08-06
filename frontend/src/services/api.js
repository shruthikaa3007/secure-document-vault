import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log(`Request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Remove token and redirect to login if not already on login page
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Document Service
const documentService = {
  getAllDocuments: (page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams({ page, limit });
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    return api.get(`/documents?${params}`);
  },
  getDocumentById: (id) => api.get(`/documents/${id}`),
  uploadDocument: async (formData) => {
    try {
      const response = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Transform response to include success flag for frontend compatibility
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Document uploaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Upload failed',
        error: error.response?.data
      };
    }
  },
  updateDocument: async (id, data) => {
    try {
      const response = await api.put(`/documents/${id}`, data);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Document updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed',
        error: error.response?.data
      };
    }
  },
  deleteDocument: async (id) => {
    try {
      const response = await api.delete(`/documents/${id}`);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Document deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Delete failed',
        error: error.response?.data
      };
    }
  },
  downloadDocument: async (id) => {
    try {
      const response = await api.get(`/documents/${id}/download`, {
        responseType: 'blob'
      });
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'document';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      } else {
        // If no Content-Disposition header, try to derive filename from content-type
        const contentType = response.headers['content-type'];
        if (contentType) {
          const extension = contentType.split('/')[1];
          if (extension) {
            filename += `.${extension}`;
          }
        }
      }
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return {
        success: true,
        message: 'Document downloaded successfully',
        filename: filename
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Download failed',
        error: error.response?.data
      };
    }
  },
  searchDocuments: async (params) => {
    try {
      const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
  if (params[key] !== undefined && params[key] !== null) {
    queryParams.append(key, params[key]);
    console.log(params)
  }
});

      
      const response = await api.get(`/documents/search?${queryParams}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Search completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Search failed',
        error: error.response?.data
      };
    }
  },
  getDocumentsByTag: (tag) => api.get(`/documents/tag/${encodeURIComponent(tag)}`),
  addTagToDocument: (id, tag) => api.post(`/documents/${id}/tags`, { tag }),
  removeTagFromDocument: (id, tag) => api.delete(`/documents/${id}/tags/${encodeURIComponent(tag)}`),
  shareDocument: async (id, userId, permissions) => {
    try {
      const response = await api.post(`/documents/${id}/share`, { userId, permissions });
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Document shared successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Sharing failed',
        error: error.response?.data
      };
    }
  },
  revokeAccess: async (id, userId) => {
    try {
      const response = await api.delete(`/documents/${id}/share/${userId}`);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Access revoked successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Revoking access failed',
        error: error.response?.data
      };
    }
  }
};

// Auth API
const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
};

// Admin Service
const adminService = {
  getAllUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      return {
        success: true,
        data: response.data,
        message: 'Users retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to retrieve users',
        error: error.response?.data
      };
    }
  },
  
  getUserById: async (id) => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'User retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to retrieve user',
        error: error.response?.data
      };
    }
  },
  
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/admin/users/${id}`, userData);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'User updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user',
        error: error.response?.data
      };
    }
  },
  
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'User deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete user',
        error: error.response?.data
      };
    }
  },
  
  getAllRoles: async () => {
    try {
      const response = await api.get('/admin/roles');
      return {
        success: true,
        data: response.data,
        message: 'Roles retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to retrieve roles',
        error: error.response?.data
      };
    }
  },
  
  updateUserRole: async (userId, roleId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { roleId });
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'User role updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user role',
        error: error.response?.data
      };
    }
  },
  
  getSystemStats: async () => {
    try {
      const response = await api.get('/admin/system-stats');
      return {
        success: true,
        data: response.data,
        message: 'System stats retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to retrieve system stats',
        error: error.response?.data
      };
    }
  }
};

// Log Service
const logService = {
  getLogs: (page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams({ page, limit });
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    return api.get(`/logs?${params}`);
  },
  getAllLogs: (page = 1, limit = 20) => api.get(`/logs?page=${page}&limit=${limit}`),
  getLogsByType: (type, page = 1, limit = 20) => api.get(`/logs/type/${type}?page=${page}&limit=${limit}`),
  getLogsByUser: (userId, page = 1, limit = 20) => api.get(`/logs/user/${userId}?page=${page}&limit=${limit}`),
  getLogsByDateRange: (startDate, endDate, page = 1, limit = 20) => 
    api.get(`/logs/date-range?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`),
  exportLogs: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    return api.get(`/logs/export?${params}`, { responseType: 'blob' });
  },
  getExportedLogs: () => api.get('/logs/exports'),
  downloadExportedLog: (filename) => api.get(`/logs/exports/${filename}`, { responseType: 'blob' }),
  clearLogs: () => api.delete('/logs'),
};

export default api;
export { documentService, authAPI, adminService, logService };