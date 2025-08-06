// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import api, { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        // Set the authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        setToken(storedToken);
        
        try {
          const response = await authAPI.getCurrentUser();
          setUser({
            id: response.data._id,
            username: response.data.username,
            email: response.data.email,
            role: response.data.role.name,
            permissions: response.data.role.permissions || []
          });
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error fetching user data:', error);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      
      setIsLoading(false);
    };
    
    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      console.log('Attempting login with:', credentials.email);
      const response = await authAPI.login(credentials);
      console.log('Login response:', response.data);
      
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setToken(token);
      
      // Set user data
      setUser({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      });
      
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      console.log('Attempting registration with:', userData.username, userData.email);
      const response = await authAPI.register(userData);
      console.log('Registration response:', response.data);
      
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setToken(token);
      
      // Set user data
      setUser({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      });
      
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user data (e.g., after role change)
  const refreshUserData = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser({
        id: response.data._id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role.name,
        permissions: response.data.role.permissions || []
      });
      return { success: true };
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return { success: false, message: 'Failed to refresh user data' };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    token,
    login,
    register,
    logout,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;