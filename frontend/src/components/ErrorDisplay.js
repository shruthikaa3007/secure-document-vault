import React from 'react';
import { Alert, Box, Typography, Paper } from '@mui/material';

const ErrorDisplay = ({ error }) => {
  // Handle different error types
  const formatError = (err) => {
    if (!err) return null;
    
    if (typeof err === 'string') return err;
    
    if (err instanceof Error) return err.message;
    
    if (typeof err === 'object') {
      try {
        return JSON.stringify(err, null, 2);
      } catch (e) {
        return 'Error object could not be displayed';
      }
    }
    
    return String(err);
  };
  
  if (!error) return null;
  
  const errorMessage = formatError(error);
  
  return (
    <Box sx={{ my: 2 }}>
      <Alert severity="error" sx={{ mb: 1 }}>
        <Typography variant="body1" fontWeight="bold">
          An error occurred
        </Typography>
      </Alert>
      
      {errorMessage && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            bgcolor: 'error.light', 
            color: 'error.contrastText',
            borderRadius: 1,
            maxHeight: '200px',
            overflow: 'auto'
          }}
        >
          <Typography 
            component="pre" 
            sx={{ 
              fontFamily: 'monospace', 
              fontSize: '0.875rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {errorMessage}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ErrorDisplay;
