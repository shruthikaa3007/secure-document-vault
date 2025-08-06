import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, TextField, Button, Grid, 
  Alert, CircularProgress, InputAdornment, FormControl, 
  InputLabel, Select, MenuItem, Pagination, IconButton, 
  Collapse
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { documentService } from '../services/api';
import { ROUTES, DOCUMENT_CLASSIFICATIONS, DEPARTMENTS } from '../constants';
import PageHeader from '../components/ui/PageHeader';
import LoadingScreen from '../components/ui/LoadingScreen';
import EmptyState from '../components/ui/EmptyState';
import DocumentCard from '../components/ui/DocumentCard';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const SearchPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { showSuccess, showError } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    classification: '',
    department: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const handleSearch = async (page = 1) => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare query parameters
      const params = {
        q: searchTerm,
        page,
        limit: pagination.limit,
        ...filters
      };
      
      // Remove empty filter values
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key];
        }
      });
      
      const response = await documentService.searchDocuments(params);
      
      if (response.success) {
        const documents = response.data.documents || [];
        const paginationData = response.data.pagination || {};
        
        setSearchResults(documents);
        setPagination({
          page: paginationData.page || 1,
          limit: paginationData.limit || 12,
          total: paginationData.total || 0,
          totalPages: paginationData.totalPages || 1
        });
        setSearched(true);
      } else {
        setError(response.message || 'Search failed');
      }
    } catch (err) {
      console.error('Error searching documents:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const clearFilters = () => {
    setFilters({
      classification: '',
      department: '',
      startDate: '',
      endDate: ''
    });
  };

  const handlePageChange = (event, value) => {
    handleSearch(value);
  };

  const handleViewDocument = (id) => {
    navigate(`${ROUTES.DOCUMENTS}/${id}`);
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
  };

  const handleEditDocument = (id) => {
    navigate(`${ROUTES.DOCUMENTS}/${id}`);
  };

  const handleDeleteDocument = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await documentService.deleteDocument(id);
        if (response.success) {
          showSuccess('Document deleted successfully');
          // Refresh search results
          handleSearch(pagination.page);
        } else {
          showError(response.message || 'Failed to delete document');
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        showError('Failed to delete document. Please try again later.');
      }
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
  const canEdit = (document) => {
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

  const canDelete = (document) => {
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

  return (
    <Box>
      <PageHeader title="Search Documents" />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              label="Search Documents"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter keywords to search for documents"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear search"
                      onClick={() => setSearchTerm('')}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => handleSearch()}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                fullWidth
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => setShowFilters(!showFilters)}
                startIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                <FilterListIcon />
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Collapse in={showFilters}>
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel id="classification-label">Classification</InputLabel>
                      <Select
                        labelId="classification-label"
                        id="classification"
                        name="classification"
                        value={filters.classification}
                        onChange={handleFilterChange}
                        label="Classification"
                      >
                        <MenuItem value="">All</MenuItem>
                        {DOCUMENT_CLASSIFICATIONS.map((classification) => (
                          <MenuItem key={classification} value={classification}>
                            {classification}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel id="department-label">Department</InputLabel>
                      <Select
                        labelId="department-label"
                        id="department"
                        name="department"
                        value={filters.department}
                        onChange={handleFilterChange}
                        label="Department"
                      >
                        <MenuItem value="">All</MenuItem>
                        {DEPARTMENTS.map((department) => (
                          <MenuItem key={department} value={department}>
                            {department}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        variant="outlined" 
                        onClick={clearFilters}
                        sx={{ mr: 1 }}
                      >
                        Clear Filters
                      </Button>
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => handleSearch()}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                        fullWidth
                      >
                        {loading ? 'Searching...' : 'Search'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <LoadingScreen message="Searching documents..." />
      ) : searched ? (
        <Box>
          {searchResults.length > 0 ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Found {pagination.total} results for "{searchTerm}"
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {searchResults.map((document, index) => (
                  <Grid item xs={12} sm={6} md={4} key={document._id || document.id || index}>
                    <DocumentCard 
                      document={document}
                      onView={handleViewDocument}
                      onDownload={handleDownloadDocument}
                      getClassificationColor={getClassificationColor}
                    />
                  </Grid>
                ))}
              </Grid>
              
              {pagination.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination 
                    count={pagination.totalPages} 
                    page={pagination.page} 
                    onChange={handlePageChange} 
                    color="primary" 
                  />
                </Box>
              )}
            </Box>
          ) : (
            <EmptyState 
              title="No Results Found" 
              message={`No documents match your search for "${searchTerm}". Try different keywords or filters.`}
              buttonText="Clear Search" 
              buttonAction={() => {
                setSearchTerm('');
                clearFilters();
                setSearched(false);
              }}
              icon={<SearchIcon sx={{ fontSize: 48 }} />}
            />
          )}
        </Box>
      ) : null}
    </Box>
  );
};

export default SearchPage;