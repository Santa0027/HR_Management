import React, { useState, useEffect } from 'react';
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
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Cancel,
  Person,
  Work,
  Assignment,
  DirectionsCar
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Enhanced Driver Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowForm(true)}
            size="large"
          >
            Add Driver
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{newDriverApplications.length}</Typography>
                    <Typography color="textSecondary">New Applications</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Work sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{workingDrivers.length}</Typography>
                    <Typography color="textSecondary">Working Drivers</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Assignment sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4">
                      {newDriverApplications.filter(app => app.status === 'pending').length}
                    </Typography>
                    <Typography color="textSecondary">Pending Review</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DirectionsCar sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4">
                      {workingDrivers.filter(driver => driver.employment_status === 'active').length}
                    </Typography>
                    <Typography color="textSecondary">Active Drivers</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
          >
            <Tab label="New Driver Applications" />
            <Tab label="Working Drivers" />
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
