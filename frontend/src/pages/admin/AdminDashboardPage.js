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
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Description as DocumentsIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Storage as StorageIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as SuperAdminIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { adminService, documentService } from '../../services/api';
import { ROUTES } from '../../constants';
import LoadingScreen from '../../components/ui/LoadingScreen';
import EmptyState from '../../components/ui/EmptyState';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [stats, setStats] = useState({
    users: 0,
    documents: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      const [usersResponse, documentsResponse] = await Promise.all([
        adminService.getAllUsers(),
        documentService.getAllDocuments(1, 5)
      ]);
      
      setStats({
        users: Array.isArray(usersResponse.data) ? usersResponse.data.length : 0,
        documents: documentsResponse.data?.documents?.length || 0,
        recentActivity: documentsResponse.data?.documents || []
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
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
      default:
        return <AnalyticsIcon sx={{ fontSize: 40, color: 'white' }} />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin':
        return 'error';
      case 'admin':
        return 'warning';
      case 'manager':
        return 'info';
      default:
        return 'success';
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading admin dashboard..." />;
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        py: 4,
        px: 2
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 56,
                height: 56,
                mr: 2
              }}
            >
              <DashboardIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#333333' }}>
                Admin Dashboard
              </Typography>
              <Typography variant="body1" color="#555555">
                Welcome back, {user?.username}! Here's your system overview.
              </Typography>
            </Box>
            <Chip
              icon={user?.role === 'superadmin' ? <SuperAdminIcon /> : <AdminIcon />}
              label={user?.role?.toUpperCase() || 'ADMIN'}
              color={getRoleColor(user?.role)}
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Paper>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
              onClick={() => navigate(ROUTES.ADMIN.USERS)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {stats.users}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Total Users
                    </Typography>
                  </Box>
                  {getStatIcon('users')}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ opacity: 0.8,color:'white' }}>
                    Manage Users
                  </Typography>
                  <ArrowForwardIcon sx={{ opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
              onClick={() => navigate(ROUTES.DOCUMENTS)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {stats.documents}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Documents
                    </Typography>
                  </Box>
                  {getStatIcon('documents')}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ opacity: 0.8,color:'white' }}>
                    View Documents
                  </Typography>
                  <ArrowForwardIcon sx={{ opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
              onClick={() => navigate(ROUTES.ADMIN.LOGS)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      Active
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      System Status
                    </Typography>
                  </Box>
                  {getStatIcon('activity')}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ opacity: 0.8, color:'white' }}>
                    View Logs
                  </Typography>
                  <ArrowForwardIcon sx={{ opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', color: '#333333' }}>
                  <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                  Quick Actions
                </Typography>
              </Box>
              
              <List>
                <ListItem
                  button
                  onClick={() => navigate(ROUTES.ADMIN.USERS)}
                  sx={{
                    '&:hover': {
                      bgcolor: 'primary.light',
                      color: 'white',
                      '& .MuiListItemIcon-root': {
                        color: 'white'
                      }
                    }
                  }}
                >
                  <ListItemIcon>
                    <PeopleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography color="#333333">User Management</Typography>}
                    secondary={<Typography color="#666666">Manage users, roles, and permissions</Typography>}
                  />
                  <ArrowForwardIcon />
                </ListItem>
                
                <Divider />
                
                <ListItem
                  button
                  onClick={() => navigate(ROUTES.ADMIN.LOGS)}
                  sx={{
                    '&:hover': {
                      bgcolor: 'secondary.light',
                      color: 'white',
                      '& .MuiListItemIcon-root': {
                        color: 'white'
                      }
                    }
                  }}
                >
                  <ListItemIcon>
                    <AnalyticsIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography color="#333333">System Logs</Typography>}
                    secondary={<Typography color="#666666">View and export system activity logs</Typography>}
                  />
                  <ArrowForwardIcon />
                </ListItem>
                
                {user?.role === 'superadmin' && (
                  <>
                    <Divider />
                    <ListItem
                      button
                      onClick={() => navigate(ROUTES.ADMIN.SUPERADMIN)}
                      sx={{
                        '&:hover': {
                          bgcolor: 'error.light',
                          color: 'white',
                          '& .MuiListItemIcon-root': {
                            color: 'white'
                          }
                        }
                      }}
                    >
                      <ListItemIcon>
                        <SuperAdminIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography color="#333333">Super Admin Panel</Typography>}
                        secondary={<Typography color="#666666">Advanced system configuration and control</Typography>}
                      />
                      <ArrowForwardIcon />
                    </ListItem>
                  </>
                )}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', color: '#333333' }}>
                  <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
                  System Health
                </Typography>
              </Box>
              
              <Box sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="#555555">
                      Server Status
                    </Typography>
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                      Online
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={100}
                    color="success"
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="#555555">
                      Database
                    </Typography>
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                      Connected
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={100}
                    color="success"
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="#555555">
                      Security
                    </Typography>
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                      Secure
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={100}
                    color="success"
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminDashboardPage;