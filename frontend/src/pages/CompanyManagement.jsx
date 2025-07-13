import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
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
  Tooltip,
  Avatar,
  Fade,
  CircularProgress // Added for better loading indicator
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Business,
  LocationOn,
  Phone,
  Email,
  Search,
  Refresh,
  Download,
  Inventory,
  MonetizationOn // New icon for commissions
} from '@mui/icons-material';
import EnhancedCompanyForm from './components/company/EnhancedCompanyForm'; // Adjust path if needed

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      // await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await fetch('/api/companies/');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCompanies(data.results || data); // Handle both paginated results and direct array
    } catch (error) {
      console.error('Error fetching companies:', error);
      showSnackbar(`Error fetching companies: ${error.message}`, 'error');
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
    setLoading(true); // Indicate loading during form submission
    try {
      const url = editingCompany
        ? `/api/companies/${editingCompany.id}/`
        : '/api/companies/';

      const method = editingCompany ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const message = editingCompany
          ? 'Company updated successfully'
          : 'Company registered successfully';
        showSnackbar(message, 'success');
        setShowForm(false);
        setEditingCompany(null);
        fetchCompanies(); // Refresh data after successful operation
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
        showSnackbar(`Error: ${errorMessage || 'Failed to save company'}`, 'error');
        console.error('API Error:', errorData);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showSnackbar(`Error submitting form: ${error.message}`, 'error');
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleDeleteCompany = async (companyId) => {
    if (window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      setLoading(true); // Indicate loading during deletion
      try {
        const response = await fetch(`/api/companies/${companyId}/`, {
          method: 'DELETE',
        });

        if (response.ok) {
          showSnackbar('Company deleted successfully', 'success');
          fetchCompanies(); // Refresh data after deletion
        } else {
          const errorData = await response.json();
          const errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
          showSnackbar(`Error deleting company: ${errorMessage}`, 'error');
          console.error('API Error:', errorData);
        }
      } catch (error) {
        console.error('Error deleting company:', error);
        showSnackbar(`Error deleting company: ${error.message}`, 'error');
      } finally {
        setLoading(false); // End loading
      }
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                🏢 Company Management
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Manage company registrations and accessories configuration
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={fetchCompanies}
                  disabled={loading}
                  sx={{ bgcolor: 'action.hover' }}
                >
                  {loading ? <CircularProgress size={24} /> : <Refresh />}
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
                onClick={() => {
                  setEditingCompany(null); // Ensure no company is being edited when adding new
                  setShowForm(true);
                }}
                size="large"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 3
                }}
              >
                Register New Company
              </Button>
            </Box>
          </Box>

          {/* Search */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
            <TextField
              fullWidth
              placeholder="Search by company name, contact, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ // Use InputProps for startAdornment on TextField
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: 'white', borderRadius: 1 }} // Apply border radius directly
            />
          </Paper>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {companies.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Companies Registered
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 60, height: 60 }}>
                    <Business sx={{ fontSize: 30 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              borderRadius: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {companies.filter(c => c.employee_accessories?.some(acc => acc.enabled)).length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Companies with Accessories
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 60, height: 60 }}>
                    <Inventory sx={{ fontSize: 30 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* New Card: Companies with Bike Commission */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #1abc9c 0%, #2ecc71 100%)',
              color: 'white',
              borderRadius: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {companies.filter(c => c.bike_commission > 0).length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      With Bike Commission
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 60, height: 60 }}>
                    <MonetizationOn sx={{ fontSize: 30 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* New Card: Companies with Car Commission */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #fd746c 0%, #ff9068 100%)',
              color: 'white',
              borderRadius: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {companies.filter(c => c.car_commission > 0).length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      With Car Commission
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 60, height: 60 }}>
                    <MonetizationOn sx={{ fontSize: 30 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Loading */}
        {loading && (
          <Fade in={loading}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress sx={{ mr: 2 }} />
              <Alert severity="info" sx={{ flexGrow: 1 }}>Loading companies...</Alert>
            </Box>
          </Fade>
        )}

        {/* Companies Table */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Company Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contact Person</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contact</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Accessories</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Bike Comm.</TableCell> {/* New Column */}
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Car Comm.</TableCell>  {/* New Column */}
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCompanies.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        No companies found.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your search or registering a new company.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                            <Business />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {company.company_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Reg: {company.registration_number || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{company.contact_person}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn fontSize="small" color="action" />
                          {company.city}, {company.country}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Phone fontSize="small" color="action" />
                            <Typography variant="body2">{company.contact_phone || 'N/A'}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Email fontSize="small" color="action" />
                            <Typography variant="body2">{company.contact_email || 'N/A'}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={
                          company.employee_accessories && company.employee_accessories.filter(acc => acc.enabled).length > 0
                            ? company.employee_accessories.filter(acc => acc.enabled).map(acc => acc.name).join(', ')
                            : 'No accessories configured'
                        }>
                          <Chip
                            label={`${company.employee_accessories?.filter(acc => acc.enabled).length || 0} items`}
                            color={company.employee_accessories?.some(acc => acc.enabled) ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={company.bike_commission ? `${company.bike_commission}%` : 'N/A'}
                          size="small"
                          color={company.bike_commission > 0 ? 'info' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={company.car_commission ? `${company.car_commission}%` : 'N/A'}
                          size="small"
                          color={company.car_commission > 0 ? 'info' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" color="primary">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Company">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleEditCompany(company)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Company">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteCompany(company.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Enhanced Company Form Dialog */}
        <Dialog
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingCompany(null);
          }}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogContent sx={{ p: 0 }}>
            <EnhancedCompanyForm
              onSubmit={handleSubmitForm}
              onCancel={() => {
                setShowForm(false);
                setEditingCompany(null);
              }}
              editingCompany={editingCompany}
            />
          </DialogContent>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%', boxShadow: 3 }}
            variant="filled" // Looks nicer
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default CompanyManagement;