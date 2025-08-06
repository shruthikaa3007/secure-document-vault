// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import DocumentDetailPage from './pages/DocumentDetailPage';
import UploadDocumentPage from './pages/UploadDocumentPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import LogsPage from './pages/admin/LogsPage';
import SuperAdminPanel from './pages/admin/SuperAdminPanel';

import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <Layout>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />
                  
                  {/* Protected Routes */}
                  <Route 
                    path="/" 
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/documents" 
                    element={
                      <ProtectedRoute>
                        <DocumentsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/documents/:id" 
                    element={
                      <ProtectedRoute>
                        <DocumentDetailPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/upload" 
                    element={
                      <ProtectedRoute>
                        <UploadDocumentPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/search" 
                    element={
                      <ProtectedRoute>
                        <SearchPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Admin Routes */}
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute requiredPermissions={['manage:users', 'view:logs']}>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/users" 
                    element={
                      <ProtectedRoute requiredPermissions={['manage:users']}>
                        <UserManagementPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/logs" 
                    element={
                      <ProtectedRoute requiredPermissions={['view:logs']}>
                        <LogsPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Super Admin Route */}
                  <Route 
                    path="/admin/superadmin" 
                    element={
                      <ProtectedRoute requiredPermissions={['access:all']}>
                        <SuperAdminPanel />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Layout>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;