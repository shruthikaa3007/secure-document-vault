import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { adminService } from '../../services/api';
import { ROUTES, USER_ROLES } from '../../constants';
import PageHeader from '../../components/ui/PageHeader';
import LoadingScreen from '../../components/ui/LoadingScreen';

const UserManagementPage = () => {
  const navigate = useNavigate();
  const { user, refreshUserData } = useContext(AuthContext);
  const { showSuccess, showError } = useNotification();

  // State variables
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usersResponse, rolesResponse] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllRoles()
      ]);
      
      console.log('Users response:', usersResponse);
      console.log('Roles response:', rolesResponse);
      
      // Handle users data
      if (usersResponse.data) {
        setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
      } else {
        setUsers([]);
      }
      
      // Handle roles data
      if (rolesResponse.data) {
        setRoles(Array.isArray(rolesResponse.data) ? rolesResponse.data : []);
      } else {
        setRoles([]);
      }
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch users and roles. Please try again later.');
      setUsers([]);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role?.name || '');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setSelectedRole('');
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !selectedRole) {
      showError('Please select a role');
      return;
    }

    try {
      setUpdateLoading(true);
      
      const response = await adminService.updateUserRole(selectedUser._id, selectedRole);
      
      if (response.data) {
        showSuccess(`Role updated for ${selectedUser.username}`);
        
        // Refresh data
        await fetchData();
        
        // Refresh current user data if they updated their own role
        if (selectedUser._id === user.id) {
          await refreshUserData();
        }
        
        handleCloseDialog();
      } else {
        showError('Failed to update user role');
      }
    } catch (err) {
      console.error('Error updating role:', err);
      showError(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'superadmin':
        return 'error';
      case 'admin':
        return 'warning';
      case 'manager':
        return 'info';
      case 'user':
        return 'success';
      default:
        return 'default';
    }
  };

  const canEditUser = (targetUser) => {
    // Superadmin can edit anyone
    if (user.role === 'superadmin') {
      return true;
    }
    
    // Admin can edit users and managers, but not other admins or superadmins
    if (user.role === 'admin') {
      return ['user', 'manager'].includes(targetUser.role?.name);
    }
    
    // Manager can edit users only
    if (user.role === 'manager') {
      return targetUser.role?.name === 'user';
    }
    
    return false;
  };

  const getAvailableRoles = () => {
    if (user.role === 'superadmin') {
      return USER_ROLES;
    }
    
    if (user.role === 'admin') {
      return ['user', 'manager', 'admin'];
    }
    
    if (user.role === 'manager') {
      return ['user', 'manager'];
    }
    
    return ['user'];
  };

  if (loading) {
    return <LoadingScreen message="Loading users..." />;
  }

  return (
    <Box>
      <PageHeader 
        title="User Management" 
        action={
          <Button 
            startIcon={<BackIcon />} 
            onClick={() => navigate(ROUTES.ADMIN.DASHBOARD)}
            variant="outlined"
          >
            Back to Admin
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* User Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {users.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Users
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {users.filter(u => u.role?.name === 'user').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Regular Users
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main">
              {users.filter(u => u.role?.name === 'manager').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Managers
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {users.filter(u => ['admin', 'superadmin'].includes(u.role?.name)).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Administrators
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Users Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No users found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((userData) => (
                  <TableRow key={userData._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {userData.username}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {userData._id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{userData.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={userData.role?.name || 'No Role'}
                        color={getRoleColor(userData.role?.name)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {userData.createdAt 
                        ? new Date(userData.createdAt).toLocaleDateString()
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      {canEditUser(userData) && (
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditRole(userData)}
                          variant="outlined"
                        >
                          Edit Role
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Role Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit User Role
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>User:</strong> {selectedUser.username} ({selectedUser.email})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                <strong>Current Role:</strong> {selectedUser.role?.name || 'No Role'}
              </Typography>
              
              <FormControl fullWidth>
                <InputLabel>New Role</InputLabel>
                <Select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  label="New Role"
                >
                  {getAvailableRoles().map((role) => (
                    <MenuItem key={role} value={role}>
                      <Chip
                        label={role}
                        color={getRoleColor(role)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={updateLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateRole}
            variant="contained"
            disabled={updateLoading || !selectedRole}
            startIcon={updateLoading ? <CircularProgress size={20} /> : null}
          >
            {updateLoading ? 'Updating...' : 'Update Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementPage;