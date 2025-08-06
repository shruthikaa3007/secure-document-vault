import React, { useState, useEffect } from 'react';
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
  TablePagination,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  CircularProgress,
  Collapse,
  IconButton,
  Chip
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { format, isValid, parseISO } from 'date-fns';
import { logService } from '../../services/api';
import { ROUTES } from '../../constants';
import PageHeader from '../../components/ui/PageHeader';

const LogsPage = () => {
  const navigate = useNavigate();
  
  // State variables
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: page + 1, // Backend expects 1-based pagination
        limit: rowsPerPage,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key];
        }
      });

      const response = await logService.getLogs(params);
      
      if (response.data) {
        setLogs(response.data.logs || []);
        setTotalLogs(response.data.pagination?.total || 0);
      } else {
        setLogs([]);
        setTotalLogs(0);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to fetch logs. Please try again later.');
      setLogs([]);
      setTotalLogs(0);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      userId: '',
      startDate: '',
      endDate: ''
    });
    setPage(0);
  };

  const handleExportLogs = async () => {
    try {
      setExportLoading(true);
      
      // Prepare query parameters for export
      const params = { ...filters };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key];
        }
      });
      
      const response = await logService.exportLogs(params);
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'text/csv' });
      
      // Create a link element and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const date = format(new Date(), 'yyyy-MM-dd');
      link.setAttribute('download', `logs_export_${date}.csv`);
      
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting logs:', error);
      setError('Failed to export logs. Please try again later.');
    } finally {
      setExportLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      // Try parsing as ISO string first
      let date = parseISO(dateString);
      
      // If that fails, try creating a new Date
      if (!isValid(date)) {
        date = new Date(dateString);
      }
      
      // If still invalid, return N/A
      if (!isValid(date)) {
        return 'N/A';
      }
      
      return format(date, 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      console.error('Error formatting date:', error, 'Date string:', dateString);
      return 'N/A';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'USER_LOGIN':
        return 'success';
      case 'USER_LOGOUT':
        return 'info';
      case 'DOCUMENT_UPLOADED':
        return 'primary';
      case 'DOCUMENT_DOWNLOADED':
        return 'secondary';
      case 'DOCUMENT_DELETED':
        return 'error';
      case 'DOCUMENT_UPDATED':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <PageHeader 
        title="System Logs" 
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

      {/* Filters Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Filters
          </Typography>
          <Box>
            <Button
              startIcon={<DownloadIcon />}
              onClick={handleExportLogs}
              disabled={exportLoading}
              sx={{ mr: 1 }}
            >
              {exportLoading ? 'Exporting...' : 'Export CSV'}
            </Button>
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={showFilters}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Action</InputLabel>
                <Select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  label="Action"
                >
                  <MenuItem value="">All Actions</MenuItem>
                  <MenuItem value="USER_LOGIN">User Login</MenuItem>
                  <MenuItem value="USER_LOGOUT">User Logout</MenuItem>
                  <MenuItem value="DOCUMENT_UPLOADED">Document Upload</MenuItem>
                  <MenuItem value="DOCUMENT_DOWNLOADED">Document Download</MenuItem>
                  <MenuItem value="DOCUMENT_UPDATED">Document Update</MenuItem>
                  <MenuItem value="DOCUMENT_DELETED">Document Delete</MenuItem>
                  <MenuItem value="LOGS_EXPORTED">Logs Export</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="User ID"
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                placeholder="Enter user ID"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button onClick={clearFilters} variant="outlined">
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Collapse>
      </Paper>

      {/* Logs Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>IP Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    No logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      {formatDate(log.createdAt || log.timestamp)}
                    </TableCell>
                    <TableCell>
                      {log.userId?.username || 'System'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.action}
                        color={getActionColor(log.action)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {typeof log.details === 'object' 
                          ? JSON.stringify(log.details) 
                          : log.details || 'N/A'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>{log.ipAddress || 'N/A'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalLogs}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default LogsPage;