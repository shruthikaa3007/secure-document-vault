import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';
import { ROUTES } from '../constants';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 500
        }}
      >
        <LockIcon
          sx={{ fontSize: 80, color: 'warning.main', mb: 2 }}
        />
        
        <Typography variant="h4" component="h1" gutterBottom>
          403 - Unauthorized
        </Typography>
        
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          You do not have permission to access this page. If you believe this is an error, please contact your administrator.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(ROUTES.DASHBOARD)}
          >
            Go to Dashboard
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default UnauthorizedPage;