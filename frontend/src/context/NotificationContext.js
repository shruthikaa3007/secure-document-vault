import React, { createContext, useState, useContext } from 'react';

export const NotificationContext = createContext();

// Custom hook for using the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info', duration = 5000) => {
    setNotification({ message, type });
    
    // Auto-hide notification after duration
    setTimeout(() => {
      setNotification(null);
    }, duration);
  };

  const hideNotification = () => {
    setNotification(null);
  };

  // Success notification shorthand
  const showSuccess = (message, duration) => showNotification(message, 'success', duration);
  
  // Error notification shorthand
  const showError = (message, duration) => showNotification(message, 'error', duration);
  
  // Warning notification shorthand
  const showWarning = (message, duration) => showNotification(message, 'warning', duration);
  
  // Info notification shorthand
  const showInfo = (message, duration) => showNotification(message, 'info', duration);

  // Notification component
  const Notification = () => {
    if (!notification) return null;

    const bgColor = {
      info: 'bg-blue-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500'
    }[notification.type];

    return (
      <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center`}>
        <span>{notification.message}</span>
        <button
          onClick={hideNotification}
          className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        >
          ×
        </button>
      </div>
    );
  };

  return (
    <NotificationContext.Provider value={{ 
      showNotification, 
      hideNotification,
      showSuccess,
      showError,
      showWarning,
      showInfo
    }}>
      {children}
      <Notification />
    </NotificationContext.Provider>
  );
};