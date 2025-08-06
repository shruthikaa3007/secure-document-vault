import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import LoadingScreen from './ui/LoadingScreen';
import { ROUTES } from '../constants';

const ProtectedRoute = ({ children, requiredPermissions = [] }) => {
  const { isAuthenticated, isLoading, user } = useContext(AuthContext);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // If permissions are required, check if user has them
  if (requiredPermissions.length > 0) {
    const userPermissions = user?.permissions || [];
    const hasRequiredPermissions = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );

    // Redirect to unauthorized page if user doesn't have required permissions
    if (!hasRequiredPermissions) {
      return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
    }
  }

  // Render the protected component
  return children;
};

export default ProtectedRoute;