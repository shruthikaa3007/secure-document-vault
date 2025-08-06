import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, Paper, Grid, Chip, TextField, 
  Alert, CircularProgress, Dialog, DialogTitle, DialogContent, 
  DialogContentText, DialogActions, FormControl, InputLabel, 
  Select, MenuItem, Divider, IconButton, Tooltip, List, 
  ListItem, ListItemText, ListItemSecondaryAction, Switch,
  Avatar, useTheme
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  GetApp as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import ShareIcon from '@mui/icons-material/Share';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { format } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { documentService, adminService } from '../services/api';
import { ROUTES, DOCUMENT_CLASSIFICATIONS, DEPARTMENTS, API_ENDPOINTS } from '../constants';
import PageHeader from '../components/ui/PageHeader';
import LoadingScreen from '../components/ui/LoadingScreen';

const DocumentDetailPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const { showSuccess, showError } = useNotification();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    tags: '',
    description: '',
    department: '',
    classification: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // Sharing state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [permissions, setPermissions] = useState({
    canView: true,
    canEdit: false,
    canDelete: false
  });
  const [shareLoading, setShareLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await documentService.getDocumentById(id);
      
      if (response && response.data && response.data.document) {
        setDocument(response.data.document);
        setEditData({
          tags: response.data.document.tags?.join(', ') || '',
          description: response.data.document.description || '',
          department: response.data.document.department || '',
          classification: response.data.document.classification || 'Internal'
        });
      } else {
        setError('Failed to load document details');
      }
    } catch (err) {
      console.error('Error fetching document:', err);
      setError('Failed to load document. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
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
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditData({
      tags: document.tags?.join(', ') || '',
      description: document.description || '',
      department: document.department || '',
      classification: document.classification || 'Internal'
    });
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      
      const updatedData = {
        tags: editData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        description: editData.description,
        department: editData.department,
        classification: editData.classification
      };
      
      const response = await documentService.updateDocument(id, updatedData);
      
      if (response.success) {
        showSuccess('Document updated successfully');
        setEditMode(false);
        await fetchDocument(); // Refresh document data
      } else {
        showError(response.message || 'Failed to update document');
      }
    } catch (error) {
      console.error('Error updating document:', error);
      showError('Failed to update document. Please try again later.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      
      const response = await documentService.deleteDocument(id);
      
      if (response.success) {
        showSuccess('Document deleted successfully');
        navigate(ROUTES.DOCUMENTS);
      } else {
        showError(response.message || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      showError('Failed to delete document. Please try again later.');
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  // Sharing functions
  const handleOpenShareDialog = async () => {
    try {
      setLoadingUsers(true);
      // Fetch users to share with
      const response = await adminService.getAllUsers();
      if (response && response.data) {
        // Filter out current user and users who already have access
        const filteredUsers = Array.isArray(response.data) 
          ? response.data.filter(u => 
              u._id !== user.id && 
              !document.accessControl?.some(ac => ac.user === u._id || (ac.user._id && ac.user._id === u._id))
            )
          : [];
        setUsers(filteredUsers);
      }
      setShareDialogOpen(true);
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Failed to load users for sharing');
    } finally {
      setLoadingUsers(false);
    }
  };

 const handleShare = async () => {
  if (!selectedUser) {
    showError('Please select a user to share with');
    return;
  }

  try {
    setShareLoading(true);

    const response = await documentService.shareDocument(id, selectedUser, permissions);

    if (response.success) {
      showSuccess(response.message);
      setShareDialogOpen(false);
      setSelectedUser('');
      setPermissions({
        canView: true,
        canEdit: false,
        canDelete: false
      });
      await fetchDocument();
       // Refresh to show updated access
    } else {
      showError(response.message || 'Failed to share document');
    }
  } catch (error) {
    console.error('Error sharing document:', error);
    showError(error.message || 'Failed to share document');
  } finally {
    setShareLoading(false);
  }
};


  const handleRevokeAccess = async (userId) => {
  try {
    const response = await documentService.revokeAccess(id, userId);

    if (response.success) {
      showSuccess(response.message);
      await fetchDocument(); // Refresh document data
    } else {
      showError(response.message || 'Failed to revoke access');
    }
  } catch (error) {
    console.error('Error revoking access:', error);
    showError(error.message || 'Failed to revoke access');
  }
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
  const canEdit = () => {
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

  const canDelete = () => {
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

  const canShare = () => {
    if (!document || !user) return false;
    
    // Superadmin, admin, and manager can share any document
    if (['superadmin', 'admin', 'manager'].includes(user.role)) return true;
    
    // Owner can share
    return document.owner._id === user.id;
  };

  if (loading) {
    return <LoadingScreen message="Loading document details..." />;
  }

  if (error) {
    return (
      <Box>
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Document Details
              </h1>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Button 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate(ROUTES.DOCUMENTS)}
                variant="outlined"
              >
                Back
              </Button>
            </div>
          </div>
        </div>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!document) {
    return (
      <Box>
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Document Details
              </h1>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Button 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate(ROUTES.DOCUMENTS)}
                variant="outlined"
              >
                Back
              </Button>
            </div>
          </div>
        </div>
        <Alert severity="warning" sx={{ mt: 2 }}>
          Document not found
        </Alert>
      </Box>
    );
  }

  // Create action buttons for the header
  const headerActions = (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate(ROUTES.DOCUMENTS)}
        variant="outlined"
      >
        Back
      </Button>
      <Button
        startIcon={<DownloadIcon />}
        onClick={handleDownload}
        variant="contained"
        color="primary"
      >
        Download
      </Button>
      {canShare() && !editMode && (
        <Button
          startIcon={<ShareIcon />}
          onClick={handleOpenShareDialog}
          variant="outlined"
        >
          Share
        </Button>
      )}
      {canEdit() && !editMode && (
        <Button
          startIcon={<EditIcon />}
          onClick={handleEdit}
          variant="outlined"
        >
          Edit
        </Button>
      )}
      {canDelete() && !editMode && (
        <Button
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
          variant="outlined"
          color="error"
        >
          Delete
        </Button>
      )}
    </Box>
  );

  return (
    <Box>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {document.fileName}
            </h1>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            {headerActions}
          </div>
        </div>
      </div>

      <Grid container spacing={3}>
        {/* Document Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Document Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Classification */}
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ mr: 1 }}>
                  Classification:
                </Typography>
                {editMode ? (
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <InputLabel id="classification-label">Classification</InputLabel>
                    <Select
                      labelId="classification-label"
                      id="classification"
                      name="classification"
                      value={editData.classification}
                      onChange={handleInputChange}
                      label="Classification"
                    >
                      {DOCUMENT_CLASSIFICATIONS.map((classification) => (
                        <MenuItem key={classification} value={classification}>
                          {classification}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Chip
                    label={document.classification || 'Internal'}
                    color={getClassificationColor(document.classification)}
                    size="small"
                  />
                )}
              </Box>

              {/* Department */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Department:
                </Typography>
                {editMode ? (
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <InputLabel id="department-label">Department</InputLabel>
                    <Select
                      labelId="department-label"
                      id="department"
                      name="department"
                      value={editData.department}
                      onChange={handleInputChange}
                      label="Department"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {document.department || 'Not specified'}
                  </Typography>
                )}
              </Box>

              {/* Description */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Description:
                </Typography>
                {editMode ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    name="description"
                    value={editData.description}
                    onChange={handleInputChange}
                    placeholder="Enter document description"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {document.description || 'No description provided'}
                  </Typography>
                )}
              </Box>

              {/* Tags */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Tags:
                </Typography>
                {editMode ? (
                  <TextField
                    fullWidth
                    name="tags"
                    value={editData.tags}
                    onChange={handleInputChange}
                    placeholder="Enter tags separated by commas"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {document.tags && document.tags.length > 0 ? (
                      document.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No tags
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>

              {/* Auto-generated tags */}
              {document.autoTags && document.autoTags.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    AI-Generated Tags:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {document.autoTags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        color="secondary"
                        sx={{ 
                          borderColor: 'secondary.light',
                          '&:hover': {
                            backgroundColor: 'secondary.light',
                            color: 'secondary.contrastText'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* AI Summary */}
              {document.summaryPreview && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    AI Summary:
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'background.default',
                      borderColor: 'secondary.light',
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="body2">
                      {document.summaryPreview}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Edit mode buttons */}
              {editMode && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelEdit}
                    disabled={saveLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={saveLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={saveLoading}
                  >
                    {saveLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Document Metadata */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Document Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Owner
              </Typography>
              <Typography variant="body1">
                {document.owner?.username || 'Unknown'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1">
                {document.createdAt ? format(new Date(document.createdAt), 'PPP') : 'Unknown'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Last Modified
              </Typography>
              <Typography variant="body1">
                {document.updatedAt ? format(new Date(document.updatedAt), 'PPP') : 'Unknown'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                File Type
              </Typography>
              <Typography variant="body1">
                {document.fileType || 'Unknown'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Original Name
              </Typography>
              <Typography variant="body1">
                {document.originalName || document.fileName || 'Unknown'}
              </Typography>
            </Box>
            
            {document.size && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Size
                </Typography>
                <Typography variant="body1">
                  {(document.size / 1024).toFixed(2)} KB
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Shared With */}
          {document.accessControl && document.accessControl.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Shared With
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                {document.accessControl.map((access, index) => (
                  <ListItem key={index} divider={index < document.accessControl.length - 1}>
                    <ListItemText
                      primary={
  typeof access.user === 'object'
    ? access.user.username || access.user.email || access.user.name || 'Unknown User'
    : access.user
}


                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          {access.canView && (
                            <Chip
                              icon={<VisibilityIcon fontSize="small" />}
                              label="View"
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                          {access.canEdit && (
                            <Chip
                              icon={<EditIcon fontSize="small" />}
                              label="Edit"
                              size="small"
                              color="info"
                              variant="outlined"
                            />
                          )}
                          {access.canDelete && (
                            <Chip
                              icon={<DeleteIcon fontSize="small" />}
                              label="Delete"
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                    />
                    {canShare() && (
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="revoke access"
                          onClick={() => handleRevokeAccess(access.user._id || access.user)}
                          color="error"
                          size="small"
                        >
                          <CloseIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the document "{document.fileName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => !shareLoading && setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Share Document
          <IconButton
            aria-label="close"
            onClick={() => setShareDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
            disabled={shareLoading}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {loadingUsers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : users.length === 0 ? (
              <Alert severity="info">
                No users available to share with. All users already have access or you are the only user.
              </Alert>
            ) : (
              <>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="user-select-label">Select User</InputLabel>
                  <Select
                    labelId="user-select-label"
                    id="user-select"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    label="Select User"
                  >
                    {users.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.username} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="subtitle1" gutterBottom>
                  Permissions
                </Typography>

                <List>
                  <ListItem>
                    <ListItemText primary="View" secondary="User can view the document" />
                    <Switch
                      edge="end"
                      checked={permissions.canView}
                      onChange={(e) => setPermissions({...permissions, canView: e.target.checked})}
                      disabled={true} // Always required
                      color="primary"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Edit" secondary="User can edit the document" />
                    <Switch
                      edge="end"
                      checked={permissions.canEdit}
                      onChange={(e) => setPermissions({...permissions, canEdit: e.target.checked})}
                      color="primary"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Delete" secondary="User can delete the document" />
                    <Switch
                      edge="end"
                      checked={permissions.canDelete}
                      onChange={(e) => setPermissions({...permissions, canDelete: e.target.checked})}
                      color="error"
                    />
                  </ListItem>
                </List>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)} disabled={shareLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            variant="contained"
            color="primary"
            disabled={shareLoading || !selectedUser}
            startIcon={shareLoading ? <CircularProgress size={20} /> : <PersonAddIcon />}
          >
            {shareLoading ? 'Sharing...' : 'Share'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentDetailPage;