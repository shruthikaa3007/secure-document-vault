import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Description as DescriptionIcon,
  Storage as StorageIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ROUTES } from '../constants';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const { showSuccess, showError } = useNotification();
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
    passwordsMatch: false
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Update password validation state
    if (name === 'password') {
      setPasswordValidation({
        ...passwordValidation,
        minLength: value.length >= 8,
        hasUppercase: /[A-Z]/.test(value),
        hasLowercase: /[a-z]/.test(value),
        hasNumber: /\d/.test(value),
        hasSpecial: /[@$!%*?&]/.test(value),
        passwordsMatch: value === formData.confirmPassword
      });
    }
    
    if (name === 'confirmPassword') {
      setPasswordValidation({
        ...passwordValidation,
        passwordsMatch: value === formData.password
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Check password strength
    const { minLength, hasUppercase, hasLowercase, hasNumber, hasSpecial } = passwordValidation;
    if (!minLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      setError('Password does not meet the strength requirements');
      return;
    }

    try {
      setLoading(true);
      const result = await register(formData);
      
      if (result.success) {
        showSuccess('Registration successful! You can now sign in.');
        navigate('/');
      } else {
        const errorMessage = result.message || 'Registration failed. Please try again.';
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
  
  // Check if all password requirements are met
  const isPasswordValid = 
    passwordValidation.minLength && 
    passwordValidation.hasUppercase && 
    passwordValidation.hasLowercase && 
    passwordValidation.hasNumber && 
    passwordValidation.hasSpecial;
  
  // Check if form is valid for submission
  const isFormValid = 
    formData.username && 
    formData.email && 
    isPasswordValid && 
    passwordValidation.passwordsMatch;

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={10}
          sx={{
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          <Grid container>
            {/* Left Column - App Info */}
            <Grid 
              item 
              xs={12} 
              md={6} 
              sx={{ 
                position: 'relative',
                bgcolor: '#6a11cb',
                backgroundImage: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                p: { xs: 4, md: 6 },
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              {/* Background overlay */}
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: 'url(https://source.unsplash.com/random?vault)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.2
                }}
              />
              
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
                  JOIN SECURE VAULT
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
                  Create your account to start securely storing and managing your documents with enterprise-grade protection
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 6 }}>
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
                      <DescriptionIcon sx={{ mr: 1, color: 'rgba(255,255,255,0.9)', fontSize: 28 }} />
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
                    "Setting up our team with Secure Document Vault was quick and easy. 
                    The security features are robust, and the interface is intuitive."
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    — Michael Chen, Security Director at DataShield
                  </Typography>
                </Paper>
              </Box>
            </Grid>
            
            {/* Right Column - Registration Form */}
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
                    Create Account
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Fill in your details to create your secure vault account.
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
                      label="Username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  
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
                  
                  <Box sx={{ mb: 3 }}>
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
                            <LockIcon sx={{ color: 'secondary.main' }} />
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
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: 'secondary.main' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  
                  {/* Password strength requirements */}
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      mb: 4, 
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Password must contain:
                    </Typography>
                    <List dense disablePadding>
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          {passwordValidation.minLength ? 
                            <CheckIcon fontSize="small" color="success" /> : 
                            <CloseIcon fontSize="small" color="error" />}
                        </ListItemIcon>
                        <ListItemText 
                          primary="At least 8 characters" 
                          primaryTypographyProps={{ 
                            variant: 'body2', 
                            color: passwordValidation.minLength ? 'text.secondary' : 'error.light' 
                          }} 
                        />
                      </ListItem>
                      
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          {passwordValidation.hasUppercase ? 
                            <CheckIcon fontSize="small" color="success" /> : 
                            <CloseIcon fontSize="small" color="error" />}
                        </ListItemIcon>
                        <ListItemText 
                          primary="At least one uppercase letter" 
                          primaryTypographyProps={{ 
                            variant: 'body2', 
                            color: passwordValidation.hasUppercase ? 'text.secondary' : 'error.light' 
                          }} 
                        />
                      </ListItem>
                      
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          {passwordValidation.hasLowercase ? 
                            <CheckIcon fontSize="small" color="success" /> : 
                            <CloseIcon fontSize="small" color="error" />}
                        </ListItemIcon>
                        <ListItemText 
                          primary="At least one lowercase letter" 
                          primaryTypographyProps={{ 
                            variant: 'body2', 
                            color: passwordValidation.hasLowercase ? 'text.secondary' : 'error.light' 
                          }} 
                        />
                      </ListItem>
                      
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          {passwordValidation.hasNumber ? 
                            <CheckIcon fontSize="small" color="success" /> : 
                            <CloseIcon fontSize="small" color="error" />}
                        </ListItemIcon>
                        <ListItemText 
                          primary="At least one number" 
                          primaryTypographyProps={{ 
                            variant: 'body2', 
                            color: passwordValidation.hasNumber ? 'text.secondary' : 'error.light' 
                          }} 
                        />
                      </ListItem>
                      
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          {passwordValidation.hasSpecial ? 
                            <CheckIcon fontSize="small" color="success" /> : 
                            <CloseIcon fontSize="small" color="error" />}
                        </ListItemIcon>
                        <ListItemText 
                          primary="At least one special character (@$!%*?&)" 
                          primaryTypographyProps={{ 
                            variant: 'body2', 
                            color: passwordValidation.hasSpecial ? 'text.secondary' : 'error.light' 
                          }} 
                        />
                      </ListItem>
                      
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          {passwordValidation.passwordsMatch ? 
                            <CheckIcon fontSize="small" color="success" /> : 
                            <CloseIcon fontSize="small" color="error" />}
                        </ListItemIcon>
                        <ListItemText 
                          primary="Passwords match" 
                          primaryTypographyProps={{ 
                            variant: 'body2', 
                            color: passwordValidation.passwordsMatch ? 'text.secondary' : 'error.light' 
                          }} 
                        />
                      </ListItem>
                    </List>
                  </Paper>
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading || !isFormValid}
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 2,
                      background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #5a0cb1 0%, #1e68e0 100%)',
                      }
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Create Account'}
                  </Button>
                  
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Already have an account?{' '}
                      <Link to={ROUTES.LOGIN} style={{ color: '#6a11cb', textDecoration: 'none' }}>
                        Sign in
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;