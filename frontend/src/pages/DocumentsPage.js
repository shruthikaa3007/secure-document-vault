import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, Grid, Alert, Card, CardContent, 
  Chip, IconButton, Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import { 
  Add as AddIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { documentService } from '../services/api';
import { ROUTES } from '../constants';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import PageHeader from '../components/ui/PageHeader';
import LoadingScreen from '../components/ui/LoadingScreen';
import EmptyState from '../components/ui/EmptyState';
import DocumentCard from '../components/ui/DocumentCard';

const DocumentsPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { showSuccess, showError } = useNotification();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    myDocuments: 0,
    sharedDocuments: 0
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await documentService.getAllDocuments();
      
      if (response.data) {
        const docs = response.data.documents || [];
        setDocuments(docs);
        
        // Calculate stats
        const myDocs = docs.filter(doc => doc.owner._id === user.id);
        const sharedDocs = docs.filter(doc => 
          doc.owner._id !== user.id && 
          doc.accessControl?.some(ac => ac.user === user.id)
        );
        
        setStats({
          totalDocuments: docs.length,
          myDocuments: myDocs.length,
          sharedDocuments: sharedDocs.length
        });
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, document) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocument(document);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocument(null);
  };

  const handleViewDocument = (id) => {
    navigate(`${ROUTES.DOCUMENTS}/${id}`);
    handleMenuClose();
  };

  const handleDownloadDocument = async (id) => {
    try {
      const response = await documentService.downloadDocument(id);
      if (response.success) {
        showSuccess('Document downloaded successfully');
      } else {
        showError(response.message || 'Failed to download document');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      showError('Failed to download document. Please try again later.');
    }
    handleMenuClose();
  };

  const handleEditDocument = (id) => {
    navigate(`${ROUTES.DOCUMENTS}/${id}`);
    handleMenuClose();
  };

  const handleDeleteDocument = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await documentService.deleteDocument(id);
        if (response.success) {
          showSuccess('Document deleted successfully');
          fetchDocuments(); // Refresh the list
        } else {
          showError(response.message || 'Failed to delete document');
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        showError('Failed to delete document. Please try again later.');
      }
    }
    handleMenuClose();
  };

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'Public':
        return 'success';
      case 'Internal':
        return 'primary';
      case 'Confidential':
        return 'warning';
      case 'Restricted':
        return 'error';
      default:
        return 'default';
    }
  };

  // Permission checks
  const canEditDocument = (document) => {
    if (!document || !user) return false;
    
    // Superadmin, admin, and manager can edit any document
    if (['superadmin', 'admin', 'manager'].includes(user.role)) return true;
    
    // Owner can edit
    if (document.owner._id === user.id) return true;
    
    // Check access control list
    return document.accessControl?.some(
      access => (access.user._id === user.id || access.user === user.id) && access.canEdit
    );
  };

  const canDeleteDocument = (document) => {
    if (!document || !user) return false;
    
    // Superadmin and admin can delete any document
    if (['superadmin', 'admin'].includes(user.role)) return true;
    
    // Owner can delete
    if (document.owner._id === user.id) return true;
    
    // Check access control list
    return document.accessControl?.some(
      access => (access.user._id === user.id || access.user === user.id) && access.canDelete
    );
  };

  if (loading) {
    return <LoadingScreen message="Loading documents..." />;
  }

  return (
    <Box>
      <PageHeader 
        title="Documents" 
        action={
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate(ROUTES.UPLOAD)}
          >
            Upload Document
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Document Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h4">{stats.totalDocuments}</Typography>
              <Typography variant="h6">Total Documents</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
            <CardContent>
              <Typography variant="h4">{stats.myDocuments}</Typography>
              <Typography variant="h6">My Documents</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent>
              <Typography variant="h4">{stats.sharedDocuments}</Typography>
              <Typography variant="h6">Shared With Me</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Documents List */}
      {documents.length === 0 ? (
        <EmptyState
          title="No Documents Found"
          description="Upload your first document to get started"
          icon="📄"
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(ROUTES.UPLOAD)}
            >
              Upload Document
            </Button>
          }
        />
      ) : (
        <Grid container spacing={3}>
          {documents.map((document) => (
            <Grid item xs={12} sm={6} md={4} key={document._id}>
              <DocumentCard
                document={document}
                onView={() => handleViewDocument(document._id)}
                onDownload={() => handleDownloadDocument(document._id)}
                onEdit={canEditDocument(document) ? () => handleEditDocument(document._id) : null}
                onDelete={canDeleteDocument(document) ? () => handleDeleteDocument(document._id) : null}
                getClassificationColor={getClassificationColor}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewDocument(selectedDocument?._id)}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleDownloadDocument(selectedDocument?._id)}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        
        {selectedDocument && canEditDocument(selectedDocument) && (
          <MenuItem onClick={() => handleEditDocument(selectedDocument._id)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}
        
        {selectedDocument && canDeleteDocument(selectedDocument) && (
          <MenuItem 
            onClick={() => handleDeleteDocument(selectedDocument._id)}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default DocumentsPage;