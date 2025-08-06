import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Drawer,
  List,
  ListItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Person as PersonIcon,
  ExitToApp as ExitToAppIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Security as SecurityIcon,
  Menu as MenuIcon,
  SupervisorAccount as SuperAdminIcon,
  AdminPanelSettings as AdminIcon,
  Description as DocumentIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  Folder as FolderIcon,
  BarChart as AnalyticsIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { useTheme as useAppTheme } from '../context/ThemeContext';

import { ROUTES } from '../constants';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useAppTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleProfileNavigate = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
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

  const getRoleIcon = (role) => {
    switch (role) {
      case 'superadmin':
      case 'admin':
        return <SecurityIcon fontSize="small" />;
      case 'manager':
        return <SettingsIcon fontSize="small" />;
      default:
        return <PersonIcon fontSize="small" />;
    }
  };

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;

  const navItems = [
    { 
      title: 'Dashboard', 
      path: ROUTES.DASHBOARD, 
      icon: <DashboardIcon />,
      visible: !!user
    },
    { 
      title: 'Documents', 
      path: ROUTES.DOCUMENTS, 
      icon: <FolderIcon />,
      visible: !!user
    },
    { 
      title: 'Upload', 
      path: ROUTES.UPLOAD, 
      icon: <UploadIcon />,
      visible: !!user
    },
    { 
      title: 'Search', 
      path: ROUTES.SEARCH, 
      icon: <SearchIcon />,
      visible: !!user
    },
    { 
      title: 'Admin', 
      path: ROUTES.ADMIN.DASHBOARD, 
      icon: <AdminIcon />,
      visible: isAdmin
    },
    { 
      title: 'Users', 
      path: ROUTES.ADMIN.USERS, 
      icon: <PersonIcon />,
      visible: isAdmin
    },
    { 
      title: 'Logs', 
      path: ROUTES.ADMIN.LOGS, 
      icon: <AnalyticsIcon />,
      visible: isAdmin
    },
    { 
      title: 'Super Admin', 
      path: ROUTES.ADMIN.SUPERADMIN, 
      icon: <SuperAdminIcon />,
      visible: isSuperAdmin
    }
  ];

  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Secure Vault
        </Typography>
        {user && (
          <Typography variant="body2" color="text.secondary">
            {user.username} ({user.email})
          </Typography>
        )}
      </Box>
      <List>
        {navItems
          .filter(item => item.visible)
          .map((item) => (
            <ListItem 
              button 
              key={item.title} 
              component={Link} 
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.dark',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                  '& .MuiListItemText-primary': {
                    color: 'white',
                    fontWeight: 600,
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItem>
          ))}
        <Divider sx={{ my: 2 }} />
        {user ? (
          <>
            <ListItem 
              button 
              component={Link} 
              to="/profile"
              sx={{ borderRadius: 1, mx: 1, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem 
              button 
              onClick={handleLogout}
              sx={{ borderRadius: 1, mx: 1, mb: 0.5, color: 'error.main' }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem 
              button 
              component={Link} 
              to="/login"
              sx={{ borderRadius: 1, mx: 1, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem 
              button 
              component={Link} 
              to="/register"
              sx={{ borderRadius: 1, mx: 1, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: 'linear-gradient(90deg, #121212 0%, #1e1e1e 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h5"
            component={Link}
            to="/dashboard"
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'white',
              fontWeight: 800,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              letterSpacing: '-0.5px',
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
                opacity: 0.9
              }
            }}
          >
            <SecurityIcon sx={{ mr: 1, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }} />
            SECURE DOCUMENT VAULT
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {navItems
                .filter(item => item.visible)
                .map((item) => (
                  <Button
                    key={item.title}
                    component={Link}
                    to={item.path}
                    color="inherit"
                    startIcon={item.icon}
                    sx={{
                      mx: 0.5,
                      py: 1,
                      px: 2,
                      borderRadius: 2,
                      ...(location.pathname === item.path && {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        fontWeight: 600,
                      }),
                    }}
                  >
                    {item.title}
                  </Button>
                ))}
            </Box>
          )}

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
             

              <Chip
                icon={getRoleIcon(user.role)}
                label={user.role?.toUpperCase() || 'USER'}
                color={getRoleColor(user.role)}
                size="small"
                sx={{ 
                  fontWeight: 600,
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiChip-icon': {
                    color: 'white'
                  }
                }}
              />

              <IconButton
                onClick={handleProfileClick}
                sx={{ 
                  ml: 1,
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  {user.username?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    borderRadius: 2,
                    minWidth: 200,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    bgcolor: '#1e1e1e'
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {user.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                
                <MenuItem onClick={handleProfileNavigate} sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Profile Settings</ListItemText>
                </MenuItem>
                
                <Divider />
                
                <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
                  <ListItemIcon>
                    <ExitToAppIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Sign Out</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>

      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          mt: 'auto',
          backgroundColor: '#121212',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Secure Document Vault - Built with ❤️ for Security
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;