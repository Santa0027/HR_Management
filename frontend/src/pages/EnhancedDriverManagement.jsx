import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
  Alert,
  Snackbar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Avatar,
  LinearProgress,
  Fade,
  Zoom
} from '@mui/material';
import {
  Add,
  Edit,
  Visibility,
  CheckCircle,
  Cancel,
  Person,
  Work,
  Assignment,
  DirectionsCar,
  Search,
  FilterList,
  Download,
  Refresh,
  TrendingUp,
  Group,
  PendingActions,
  VerifiedUser
} from '@mui/icons-material';
import EnhancedDriverForm from '../components/drivers/EnhancedDriverForm';

const EnhancedDriverManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [newDriverApplications, setNewDriverApplications] = useState([]);
  const [workingDrivers, setWorkingDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch new driver applications
      const newDriverResponse = await fetch('/api/drivers/new-driver-applications/');
      const newDriverData = await newDriverResponse.json();
      setNewDriverApplications(newDriverData.results || newDriverData);

      // Fetch working drivers
      const workingDriverResponse = await fetch('/api/drivers/working-drivers/');
      const workingDriverData = await workingDriverResponse.json();
      setWorkingDrivers(workingDriverData.results || workingDriverData);
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmitForm = async (formData) => {
    try {
      const response = await fetch('/api/drivers/submit-form/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        showSnackbar(result.message, 'success');
        setShowForm(false);
        setEditingDriver(null);
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        showSnackbar(`Error: ${error.error || 'Failed to submit form'}`, 'error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showSnackbar('Error submitting form', 'error');
    }
  };

  const handleApproveApplication = async (applicationId) => {
    try {
      const response = await fetch(`/api/drivers/new-driver-applications/${applicationId}/approve/`, {
        method: 'POST',
      });

      if (response.ok) {
        showSnackbar('Application approved successfully', 'success');
        fetchData();
      } else {
        showSnackbar('Error approving application', 'error');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      showSnackbar('Error approving application', 'error');
    }
  };

  const handleRejectApplication = async (applicationId) => {
    try {
      const response = await fetch(`/api/drivers/new-driver-applications/${applicationId}/reject/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'Application rejected by admin' }),
      });

      if (response.ok) {
        showSnackbar('Application rejected', 'success');
        fetchData();
      } else {
        showSnackbar('Error rejecting application', 'error');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      showSnackbar('Error rejecting application', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'under_review': return 'info';
      case 'active': return 'success';
      case 'suspended': return 'error';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const renderNewDriverApplications = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Application #</TableCell>
            <TableCell>Full Name</TableCell>
            <TableCell>Company</TableCell>
            <TableCell>Vehicle Type</TableCell>
            <TableCell>Nationality</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Application Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {newDriverApplications.map((application) => (
            <TableRow key={application.id}>
              <TableCell>{application.application_number}</TableCell>
              <TableCell>{application.full_name}</TableCell>
              <TableCell>{application.company_name}</TableCell>
              <TableCell>
                <Chip 
                  label={application.vehicle_type} 
                  size="small" 
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{application.nationality}</TableCell>
              <TableCell>{application.phone_number}</TableCell>
              <TableCell>
                <Chip 
                  label={application.status_display || application.status} 
                  color={getStatusColor(application.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {new Date(application.application_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <IconButton size="small" color="primary">
                  <Visibility />
                </IconButton>
                {application.status === 'pending' && (
                  <>
                    <IconButton 
                      size="small" 
                      color="success"
                      onClick={() => handleApproveApplication(application.id)}
                    >
                      <CheckCircle />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleRejectApplication(application.id)}
                    >
                      <Cancel />
                    </IconButton>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderWorkingDrivers = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Employee ID</TableCell>
            <TableCell>Full Name</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Vehicle Type</TableCell>
            <TableCell>Vehicle Model</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Joining Date</TableCell>
            <TableCell>Rating</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {workingDrivers.map((driver) => (
            <TableRow key={driver.id}>
              <TableCell>{driver.employee_id}</TableCell>
              <TableCell>{driver.full_name}</TableCell>
              <TableCell>{driver.working_department_display}</TableCell>
              <TableCell>
                <Chip 
                  label={driver.vehicle_type} 
                  size="small" 
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{driver.vehicle_model}</TableCell>
              <TableCell>{driver.phone_number}</TableCell>
              <TableCell>
                <Chip 
                  label={driver.employment_status_display} 
                  color={getStatusColor(driver.employment_status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {new Date(driver.joining_date).toLocaleDateString()}
              </TableCell>
              <TableCell>{driver.rating}/5.0</TableCell>
              <TableCell>
                <IconButton size="small" color="primary">
                  <Visibility />
                </IconButton>
                <IconButton size="small" color="secondary">
                  <Edit />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                🚗 Driver Management System
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Manage driver applications and working drivers efficiently
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={fetchData}
                  disabled={loading}
                  sx={{ bgcolor: 'action.hover' }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Data">
                <IconButton sx={{ bgcolor: 'action.hover' }}>
                  <Download />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowForm(true)}
                size="large"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 3
                }}
              >
                Add New Driver
              </Button>
            </Box>
          </Box>

          {/* Search and Filters */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search drivers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="action" />
                        </InputAdornment>
                      ),
                    }
                  }}
                  sx={{ bgcolor: 'white' }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status Filter"
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    label="Department"
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="all">All Departments</MenuItem>
                    <MenuItem value="delivery">Delivery</MenuItem>
                    <MenuItem value="transport">Transport</MenuItem>
                    <MenuItem value="logistics">Logistics</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterList />}
                  sx={{ height: '56px' }}
                >
                  Advanced
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* Enhanced Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={300}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {newDriverApplications.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        New Applications
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">+12% this month</Typography>
                      </Box>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 60, height: 60 }}>
                      <Person sx={{ fontSize: 30 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={400}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {workingDrivers.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Working Drivers
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Group sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">Total workforce</Typography>
                      </Box>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 60, height: 60 }}>
                      <Work sx={{ fontSize: 30 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={500}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {newDriverApplications.filter(app => app.status === 'pending').length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Pending Review
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <PendingActions sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">Needs attention</Typography>
                      </Box>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 60, height: 60 }}>
                      <Assignment sx={{ fontSize: 30 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={600}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {workingDrivers.filter(driver => driver.employment_status === 'active').length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Active Drivers
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <VerifiedUser sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">Currently working</Typography>
                      </Box>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 60, height: 60 }}>
                      <DirectionsCar sx={{ fontSize: 30 }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        </Grid>

        {/* Loading Progress */}
        {loading && (
          <Fade in={loading}>
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
            </Box>
          </Fade>
        )}

        {/* Enhanced Tabs */}
        <Paper
          sx={{
            mb: 3,
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '1rem',
                py: 2,
                '&.Mui-selected': {
                  color: 'primary.main',
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              }
            }}
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person />
                  New Driver Applications
                  <Chip
                    label={newDriverApplications.filter(app => app.status === 'pending').length}
                    size="small"
                    color="warning"
                  />
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Work />
                  Working Drivers
                  <Chip
                    label={workingDrivers.filter(driver => driver.employment_status === 'active').length}
                    size="small"
                    color="success"
                  />
                </Box>
              }
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Box>
          {activeTab === 0 && renderNewDriverApplications()}
          {activeTab === 1 && renderWorkingDrivers()}
        </Box>

        {/* Enhanced Driver Form Dialog */}
        <Dialog 
          open={showForm} 
          onClose={() => setShowForm(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogContent sx={{ p: 0 }}>
            <EnhancedDriverForm
              onSubmit={handleSubmitForm}
              onCancel={() => setShowForm(false)}
              editingDriver={editingDriver}
            />
          </DialogContent>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default EnhancedDriverManagement;
