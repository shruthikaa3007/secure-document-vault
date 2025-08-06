import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  ArrowBack as BackIcon,
  Description as FileIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { documentService } from '../services/api';
import { ROUTES, DOCUMENT_CLASSIFICATIONS, DEPARTMENTS } from '../constants';
import PageHeader from '../components/ui/PageHeader';

const UploadDocumentPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
const { showSuccess, showError, showWarning, showInfo } = useContext(NotificationContext);


  // Form state
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState(user?.department || '');
  const [classification, setClassification] = useState('Internal');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        if (!fileName) {
          setFileName(selectedFile.name);
        }
        setError(null);
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/zip': ['.zip']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload.');
      showError('Please select a file to upload.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', fileName || file.name);
      formData.append('tags', JSON.stringify(tags.split(',').map(tag => tag.trim()).filter(tag => tag)));
      formData.append('description', description);
      formData.append('department', department);
      formData.append('classification', classification);
      
      // Upload document
      const response = await documentService.uploadDocument(formData);
      
      if (response.success) {
        setSuccess(true);
        showSuccess('Document uploaded successfully!');
        
        // Reset form
        setFile(null);
        setFileName('');
        setTags('');
        setDescription('');
        setDepartment(user?.department || '');
        setClassification('Internal');
        
        // Redirect to documents page after 2 seconds
        setTimeout(() => {
          navigate(ROUTES.DOCUMENTS);
        }, 2000);
      } else {
        setError(response.message || 'Failed to upload document. Please try again.');
        showError(response.message || 'Failed to upload document');
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      const errorMessage = err.response?.data?.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileName('');
    setError(null);
  };

  return (
    <Box>
      <PageHeader 
        title="Upload Document" 
        action={
          <Button 
            startIcon={<BackIcon />} 
            onClick={() => navigate(ROUTES.DOCUMENTS)}
            variant="outlined"
          >
            Back to Documents
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Document uploaded successfully! Redirecting to documents page...
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* File Upload Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Select File
              </Typography>
              
              {!file ? (
                <Box
                  {...getRootProps()}
                  sx={{
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <input {...getInputProps()} />
                  <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, ZIP
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Maximum file size: 10MB
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'success.main',
                    borderRadius: 2,
                    p: 2,
                    bgcolor: 'success.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FileIcon sx={{ mr: 2, color: 'success.dark' }} />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {file.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={removeFile}
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Document Metadata */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="File Name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter custom file name (optional)"
                helperText="Leave empty to use original filename"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Enter tags separated by commas"
                helperText="e.g., report, finance, quarterly"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter document description (optional)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  label="Department"
                >
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Classification</InputLabel>
                <Select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value)}
                  label="Classification"
                >
                  {DOCUMENT_CLASSIFICATIONS.map((cls) => (
                    <MenuItem key={cls} value={cls}>
                      {cls}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(ROUTES.DOCUMENTS)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!file || loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
                >
                  {loading ? 'Uploading...' : 'Upload Document'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default UploadDocumentPage;