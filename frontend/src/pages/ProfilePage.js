import React, { useState, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Avatar, 
  Divider, 
  Alert, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import SaveIcon from '@mui/icons-material/Save';
import { AuthContext } from '../context/AuthContext';
import { DEPARTMENTS } from '../constants';
import PageHeader from '../components/ui/PageHeader';

const ProfilePage = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Validation schema
  const validationSchema = Yup.object({
    username: Yup.string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be less than 20 characters')
      .required('Username is required'),
    email: Yup.string()
      .email('Enter a valid email')
      .required('Email is required'),
    currentPassword: Yup.string()
      .min(6, 'Password must be at least 6 characters'),
    newPassword: Yup.string()
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
    department: Yup.string()
  });
  
  // Formik setup
  const formik = useFormik({
    initialValues: {
      username: user?.username || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      department: user?.department || ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(false);
        
        // Only include password fields if the user is trying to change password
        const updateData = {
          username: values.username,
          email: values.email,
          department: values.department
        };
        
        if (values.currentPassword && values.newPassword) {
          updateData.currentPassword = values.currentPassword;
          updateData.newPassword = values.newPassword;
        }
        
        const result = await updateProfile(updateData);
        
        if (result.success) {
          // Reset password fields
          formik.setFieldValue('currentPassword', '');
          formik.setFieldValue('newPassword', '');
          formik.setFieldValue('confirmPassword', '');
          
          setSuccess(true);
        } else {
          setError(result.message || 'Failed to update profile. Please try again.');
        }
      } catch (err) {
        console.error('Error updating profile:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  });
  
  return (
    <Box>
      <PageHeader title="My Profile" />
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Profile updated successfully!
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '3rem'
              }}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            
            <Typography variant="h6">
              {user?.username}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Role: {user?.role}
            </Typography>
            
            <Typography variant="body2" color="textSecondary">
              Member since: {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box component="form" onSubmit={formik.handleSubmit}>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              
              <TextField
                margin="normal"
                fullWidth
                id="username"
                name="username"
                label="Username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
              />
              
              <TextField
                margin="normal"
                fullWidth
                id="email"
                name="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="department-label">Department</InputLabel>
                <Select
                  labelId="department-label"
                  id="department"
                  name="department"
                  value={formik.values.department}
                  label="Department"
                  onChange={formik.handleChange}
                >
                  <MenuItem value="">None</MenuItem>
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              
              <TextField
                margin="normal"
                fullWidth
                id="currentPassword"
                name="currentPassword"
                label="Current Password"
                type="password"
                value={formik.values.currentPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.currentPassword && Boolean(formik.errors.currentPassword)}
                helperText={formik.touched.currentPassword && formik.errors.currentPassword}
              />
              
              <TextField
                margin="normal"
                fullWidth
                id="newPassword"
                name="newPassword"
                label="New Password"
                type="password"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                helperText={formik.touched.newPassword && formik.errors.newPassword}
              />
              
              <TextField
                margin="normal"
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              />
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProfilePage;