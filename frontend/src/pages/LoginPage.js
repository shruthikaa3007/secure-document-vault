import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Grid,
  Container,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Description as DocumentIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ROUTES } from '../constants';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { showSuccess, showError } = useNotification();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const result = await login(formData);
      
      if (result.success) {
        showSuccess('Login successful!');
        navigate('/');
      } else {
        const errorMessage = result.message || 'Login failed. Please check your credentials.';
        setError(errorMessage);
        showError(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 50%, #2a2a2a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={0} sx={{ overflow: 'hidden', borderRadius: 4, boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)' }}>
          {/* Left Column - App Info */}
          <Grid 
            item 
            xs={12} 
            md={6} 
            sx={{ 
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
              p: 6,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url(https://images.unsplash.com/photo-1568283661163-c90193fd13f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.1,
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 800, 
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  color: 'white',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  mb: 3
                }}
              >
                SECURE DOCUMENT VAULT
              </Typography>

              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  mb: 4, 
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 300,
                  maxWidth: '80%'
                }}
              >
                Your trusted platform for secure document storage and management with enterprise-grade security
              </Typography>

              <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SecurityIcon sx={{ mr: 1, color: 'rgba(255,255,255,0.9)', fontSize: 28 }} />
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                      End-to-end encryption
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ShieldIcon sx={{ mr: 1, color: 'rgba(255,255,255,0.9)', fontSize: 28 }} />
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                      Role-based access control
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DocumentIcon sx={{ mr: 1, color: 'rgba(255,255,255,0.9)', fontSize: 28 }} />
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                      Document versioning
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <StorageIcon sx={{ mr: 1, color: 'rgba(255,255,255,0.9)', fontSize: 28 }} />
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                      Secure cloud storage
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2, color: 'white' }}>
                  "The Secure Document Vault has transformed how we handle sensitive information. 
                  The peace of mind knowing our documents are encrypted and securely stored is invaluable."
                </Typography>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  — Sarah Johnson, CTO at TechSecure
                </Typography>
              </Paper>
            </Box>
          </Grid>

          {/* Right Column - Login Form */}
          <Grid 
            item 
            xs={12} 
            md={6} 
            sx={{ 
              bgcolor: '#121212',
              p: { xs: 4, md: 6 },
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 450, mx: 'auto' }}>
              <Box sx={{ mb: 5, textAlign: 'center' }}>
                <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700, color: 'white' }}>
                  Sign In
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Welcome back! Please enter your credentials to access your secure vault.
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ mb: 4 }}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #1565c0 0%, #0d47a1 100%)',
                      },
                      boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                    }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </Box>

                <Divider sx={{ my: 4, color: 'text.secondary', '&::before, &::after': { borderColor: 'rgba(255,255,255,0.1)' } }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>

                {/* Register Link */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Don't have an account?
                  </Typography>
                  <Button
                    component={Link}
                    to={ROUTES.REGISTER}
                    variant="outlined"
                    fullWidth
                    size="large"
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      borderColor: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      },
                    }}
                  >
                    Create Account
                  </Button>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LoginPage;