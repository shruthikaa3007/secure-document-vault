import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  LinearProgress,
  Stack
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  SupervisorAccount as SuperAdminIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Edit as EditIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Shield as ShieldIcon,
  TrendingUp as TrendingUpIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { adminService } from '../../services/api';
import { ROUTES, USER_ROLES } from '../../constants';
import PageHeader from '../../components/ui/PageHeader';
import LoadingScreen from '../../components/ui/LoadingScreen';
import EmptyState from '../../components/ui/EmptyState';
import { format } from 'date-fns';

const SuperAdminPanel = () => {
  const navigate = useNavigate();
  const { user, refreshUserData } = useContext(AuthContext);
  const { showSuccess, showError } = useNotification();
  
  // State variables
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Check if current user is a superadmin
  const isSuperAdmin = user?.role === 'superadmin' || user?.permissions?.includes('access:all');
  
  useEffect(() => {
    if (isSuperAdmin) {
      fetchData();
    }
  }, [isSuperAdmin]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get users and roles data
      const [usersResponse, rolesResponse] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllRoles()
      ]);
      
      setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
      setRoles(Array.isArray(rolesResponse.data) ? rolesResponse.data : []);
      
      // Try to get system stats, but don't fail if it's not available
      try {
        const statsResponse = await adminService.getSystemStats();
        if (statsResponse.success) {
          setSystemStats(statsResponse.data);
        }
      } catch (statsError) {
        console.warn('System stats not available:', statsError);
        // Continue without system stats
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      showError(error.response?.data?.message || 'Error loading admin data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUserSelect = (userData) => {
    setSelectedUser(userData);
    setSelectedRole(userData.role?.name || '');
    setDialogOpen(true);
  };
  
  const handleRoleUpdate = async () => {
    if (!selectedUser || !selectedRole) return;
    
    try {
      setUpdateLoading(true);
      
      // Find the role ID based on the selected role name
      const roleId = roles.find(role => role.name === selectedRole)?._id;
      
      if (!roleId) {
        showError('Invalid role selected');
        return;
      }
      
      const response = await adminService.updateUserRole(selectedUser._id, roleId);
      
      if (response.success) {
        showSuccess(`User ${selectedUser.username}'s role updated to ${selectedRole}`);
        setDialogOpen(false);
        
        // Refresh data
        await fetchData();
        
        // If the user updated their own role, refresh the auth context
        if (selectedUser._id === user.id) {
          refreshUserData();
        }
      } else {
        showError(response.message || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      showError(error.response?.data?.message || 'Error updating user role');
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
      default:
        return 'default';
    }
  };
  
  const getRoleIcon = (roleName) => {
    switch (roleName) {
      case 'superadmin':
        return <SuperAdminIcon />;
      case 'admin':
        return <AdminIcon />;
      case 'manager':
        return <SecurityIcon />;
      default:
        return <PersonIcon />;
    }
  };
  
  const getStatIcon = (type) => {
    switch (type) {
      case 'users':
        return <PeopleIcon sx={{ fontSize: 40, color: 'white' }} />;
      case 'documents':
        return <StorageIcon sx={{ fontSize: 40, color: 'white' }} />;
      case 'activity':
        return <TrendingUpIcon sx={{ fontSize: 40, color: 'white' }} />;
      case 'security':
        return <ShieldIcon sx={{ fontSize: 40, color: 'white' }} />;
      default:
        return <AnalyticsIcon sx={{ fontSize: 40, color: 'white' }} />;
    }
  };

  // Calculate user statistics directly from the users array
  const getUserStats = () => {
    const totalUsers = users.length;
    const regularUsers = users.filter(u => u.role?.name === 'user').length;
    const managers = users.filter(u => u.role?.name === 'manager').length;
    const admins = users.filter(u => ['admin', 'superadmin'].includes(u.role?.name)).length;
    
    return {
      totalUsers,
      regularUsers,
      managers,
      admins
    };
  };
  
  if (!isSuperAdmin) {
    return (
      <EmptyState
        title="Access Denied"
        description="You don't have permission to access the Super Admin panel. Contact your administrator if you believe this is an error."
        icon="🚫"
        action={
          <Button
            variant="contained"
            startIcon={<BackIcon />}
            onClick={() => navigate(ROUTES.DASHBOARD)}
          >
            Back to Dashboard
          </Button>
        }
      />
    );
  }
  
  if (loading) {
    return <LoadingScreen message="Loading Super Admin panel..." />;
  }
  
  // Get user statistics
  const userStats = getUserStats();
  
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #142a8aff 0%, #2e1a42ff 100%)',
        minHeight: '100vh',
        py: 4,
        px: 2
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate(ROUTES.ADMIN.DASHBOARD)}
            sx={{
              mb: 2,
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Back to Admin
          </Button>
          
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: 'error.main',
                  width: 56,
                  height: 56,
                  mr: 2
                }}
              >
                <SuperAdminIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#333333' }}>
                  Super Admin Panel
                </Typography>
                <Typography variant="body1" color="#555555">
                  Complete system control and user management
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
                color: 'white'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {userStats.totalUsers}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                      Total Users
                    </Typography>
                  </Box>
                  {getStatIcon('users')}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)',
                color: 'white'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {userStats.regularUsers}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                      Regular Users
                    </Typography>
                  </Box>
                  {getStatIcon('documents')}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #43CBFF 0%, #9708CC 100%)',
                color: 'white'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {userStats.managers}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                      Managers
                    </Typography>
                  </Box>
                  {getStatIcon('activity')}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {userStats.admins}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                      Administrators
                    </Typography>
                  </Box>
                  {getStatIcon('security')}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* User Management */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            background: 'rgba(21, 19, 19, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', color: '#847e7eff' }}>
              <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
              User Management
            </Typography>
            <Typography variant="body2" color="#555555" sx={{ mt: 1 }}>
              Manage user roles and permissions across the system
            </Typography>
          </Box>
          
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
                      <Typography variant="body1" color="text.secondary">
                        No users found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {user.username.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body1">{user.username}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getRoleIcon(user.role?.name)}
                          label={user.role?.name?.toUpperCase() || 'USER'}
                          color={getRoleColor(user.role?.name)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button
                          startIcon={<EditIcon />}
                          variant="outlined"
                          size="small"
                          onClick={() => handleUserSelect(user)}
                        >
                          Edit Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        
        {/* Edit Role Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Edit User Role
          </DialogTitle>
          <DialogContent dividers>
            {selectedUser && (
              <Box sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{selectedUser.username}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedUser.email}
                    </Typography>
                  </Box>
                </Box>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="role-select-label">Role</InputLabel>
                  <Select
                    labelId="role-select-label"
                    value={selectedRole}
                    label="Role"
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    {USER_ROLES.map((role) => (
                      <MenuItem key={role} value={role}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getRoleIcon(role)}
                          <Typography sx={{ ml: 1 }}>{role.toUpperCase()}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  Changing a user's role will update their permissions and access level immediately.
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              onClick={() => setDialogOpen(false)}
              disabled={updateLoading}
              sx={{ borderRadius: 2, color: '#555555' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoleUpdate}
              variant="contained"
              disabled={updateLoading || !selectedRole}
              startIcon={updateLoading ? <CircularProgress size={20} /> : <EditIcon />}
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
            >
              {updateLoading ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default SuperAdminPanel;