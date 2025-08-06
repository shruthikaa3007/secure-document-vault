import React, { useState, useEffect, useContext } from 'react';
import { Box, Grid, Paper, Typography, Button, Alert, CircularProgress, Chip, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { documentService } from '../services/api';
import { ROUTES } from '../constants';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';

// Icons
import FolderIcon from '@mui/icons-material/Folder';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    recentUploads: 0,
    sharedWithMe: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch recent documents
        const response = await documentService.getAllDocuments(1, 5);
        
        if (response && response.data) {
          setRecentDocuments(response.data.documents || []);
          
          // Set basic stats
          setStats({
            totalDocuments: response.data.pagination?.total || 0,
            recentUploads: response.data.documents?.filter(
              doc => new Date(doc.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length || 0,
            sharedWithMe: response.data.documents?.filter(
              doc => doc.owner._id !== user?.id && doc.accessControl?.some(
                access => access.user === user?.id
              )
            ).length || 0
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const quickActions = [
    {
      title: 'My Documents',
      icon: <FolderIcon fontSize="large" />,
      description: 'View and manage your documents',
      action: () => navigate(ROUTES.DOCUMENTS)
    },
    {
      title: 'Upload Document',
      icon: <UploadFileIcon fontSize="large" />,
      description: 'Upload a new document',
      action: () => navigate(ROUTES.UPLOAD)
    },
    {
      title: 'Search',
      icon: <SearchIcon fontSize="large" />,
      description: 'Search for documents',
      action: () => navigate(ROUTES.SEARCH)
    },
    {
      title: 'Profile',
      icon: <PersonIcon fontSize="large" />,
      description: 'Manage your profile',
      action: () => navigate(ROUTES.PROFILE)
    }
  ];

  // Get user permissions based on role
  const getUserPermissions = () => {
    switch (user?.role) {
      case 'superadmin':
        return [
          { name: 'Read Own Documents', icon: <VisibilityIcon fontSize="small" color="success" /> },
          { name: 'Write Own Documents', icon: <EditIcon fontSize="small" color="success" /> },
          { name: 'Delete Own Documents', icon: <DeleteIcon fontSize="small" color="success" /> },
          { name: 'Read All Documents', icon: <VisibilityIcon fontSize="small" color="success" /> },
          { name: 'Write All Documents', icon: <EditIcon fontSize="small" color="success" /> },
          { name: 'Delete All Documents', icon: <DeleteIcon fontSize="small" color="success" /> },
          { name: 'Manage Users', icon: <CheckCircleIcon fontSize="small" color="success" /> },
          { name: 'View Logs', icon: <CheckCircleIcon fontSize="small" color="success" /> },
          { name: 'Manage System', icon: <CheckCircleIcon fontSize="small" color="success" /> },
          { name: 'Access All', icon: <CheckCircleIcon fontSize="small" color="success" /> },
          { name: 'Assign Admin', icon: <CheckCircleIcon fontSize="small" color="success" /> }
        ];
      case 'admin':
        return [
          { name: 'Read Own Documents', icon: <VisibilityIcon fontSize="small" color="success" /> },
          { name: 'Write Own Documents', icon: <EditIcon fontSize="small" color="success" /> },
          { name: 'Delete Own Documents', icon: <DeleteIcon fontSize="small" color="success" /> },
          { name: 'Read All Documents', icon: <VisibilityIcon fontSize="small" color="success" /> },
          { name: 'Write All Documents', icon: <EditIcon fontSize="small" color="success" /> },
          { name: 'Delete All Documents', icon: <DeleteIcon fontSize="small" color="success" /> },
          { name: 'Manage Users', icon: <CheckCircleIcon fontSize="small" color="success" /> },
          { name: 'View Logs', icon: <CheckCircleIcon fontSize="small" color="success" /> },
          { name: 'Manage System', icon: <CheckCircleIcon fontSize="small" color="success" /> }
        ];
      case 'manager':
        return [
          { name: 'Read Own Documents', icon: <VisibilityIcon fontSize="small" color="success" /> },
          { name: 'Write Own Documents', icon: <EditIcon fontSize="small" color="success" /> },
          { name: 'Delete Own Documents', icon: <DeleteIcon fontSize="small" color="success" /> },
          { name: 'Read Team Documents', icon: <VisibilityIcon fontSize="small" color="success" /> },
          { name: 'Write Team Documents', icon: <EditIcon fontSize="small" color="success" /> }
        ];
      default: // user
        return [
          { name: 'Read Own Documents', icon: <VisibilityIcon fontSize="small" color="success" /> },
          { name: 'Write Own Documents', icon: <EditIcon fontSize="small" color="success" /> },
          { name: 'Delete Own Documents', icon: <DeleteIcon fontSize="small" color="success" /> }
        ];
    }
  };

  return (
    <Box sx={{ py: 4, px: 3 }}>
      <PageHeader title="Dashboard" />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Welcome & Role Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h5" gutterBottom>
              Welcome, {user?.username || 'User'}
            </Typography>
            <Typography variant="body1">
              You are logged in as: <strong>{user?.role || 'User'}</strong>
            </Typography>
          </Paper>
        </Grid>

        {/* System Information */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            System Information
          </Typography>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#f5f5f5' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <InfoIcon sx={{ color: 'primary.main', mr: 1, mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" color="#333333">
                      About Secure Document Vault
                    </Typography>
                    <Typography variant="body2" color="#555555">
                      This platform provides end-to-end encryption for all your documents using AES-256-CBC encryption. 
                      Your files are securely stored and can only be accessed by authorized users.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <SecurityIcon sx={{ color: 'error.main', mr: 1, mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" color="#333333">
                      Security Features
                    </Typography>
                    <Typography variant="body2" color="#555555">
                      • Role-based access control<br />
                      • Document-level permissions<br />
                      • Comprehensive audit logging
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <LockIcon sx={{ color: 'primary.main', mr: 1, mt: 0.5 }} />
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="#333333">
                      Your Permissions
                    </Typography>
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      {getUserPermissions().map((permission, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {permission.icon}
                            <Typography variant="body2" color="#555555" sx={{ ml: 1 }}>
                              {permission.name}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center', 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    }
                  }}
                  onClick={action.action}
                >
                  <Box sx={{ mb: 1, color: 'primary.main' }}>
                    {action.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {action.title}
                  </Typography>
                  <Typography variant="body2">
                    {action.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Recent Documents */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Recent Documents
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => navigate(ROUTES.DOCUMENTS)}
            >
              View All
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : recentDocuments.length > 0 ? (
            <Grid container spacing={2}>
              {recentDocuments.map((doc) => (
                <Grid item xs={12} key={doc._id}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                    onClick={() => navigate(ROUTES.DOCUMENT_DETAIL(doc._id))}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {doc.fileName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(doc.updatedAt).toLocaleDateString()} • {doc.fileType} • {doc.classification || 'Unclassified'}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                No documents found. Upload your first document now!
              </Typography>
              <Button 
                variant="contained" 
                sx={{ mt: 2 }}
                onClick={() => navigate(ROUTES.UPLOAD)}
                startIcon={<UploadFileIcon />}
              >
                Upload Document
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;