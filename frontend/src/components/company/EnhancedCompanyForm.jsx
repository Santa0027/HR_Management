import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Paper,
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import {
  Business,
  ContactPhone,
  Inventory,
  Add,
  Remove,
  CheckCircle
} from '@mui/icons-material';

const EnhancedCompanyForm = ({ onSubmit, onCancel, editingCompany = null }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Company basic info
    company_name: '',
    address: '',
    city: '',
    country: 'Saudi Arabia',
    contact_phone: '',
    contact_email: '',
    contact_person: '',
    registration_number: '',
  });

  const [companyAccessories, setCompanyAccessories] = useState([]);
  const [errors, setErrors] = useState({});

  const steps = ['Company Information', 'Contact Details', 'Accessories Configuration'];

  const accessoryOptions = [
    {
      name: 'T-Shirt',
      category: 'uniform',
      icon: '👕',
      description: 'Company branded t-shirts',
      default_quantity: 2,
      minimum_stock_level: 10
    },
    {
      name: 'Cap',
      category: 'uniform',
      icon: '🧢',
      description: 'Company branded caps',
      default_quantity: 1,
      minimum_stock_level: 5
    },
    {
      name: 'Work Bag',
      category: 'personal',
      icon: '🎒',
      description: 'Work bags for drivers',
      default_quantity: 1,
      minimum_stock_level: 5
    },
    {
      name: 'Safety Vest',
      category: 'safety',
      icon: '🦺',
      description: 'High-visibility safety vests',
      default_quantity: 1,
      minimum_stock_level: 10
    },
    {
      name: 'Safety Equipment',
      category: 'safety',
      icon: '⛑️',
      description: 'General safety equipment',
      default_quantity: 1,
      minimum_stock_level: 5
    },
    {
      name: 'Helmet',
      category: 'safety',
      icon: '🪖',
      description: 'Safety helmets',
      default_quantity: 1,
      minimum_stock_level: 10
    },
    {
      name: 'Cool Jacket',
      category: 'uniform',
      icon: '🧥',
      description: 'Cooling jackets for hot weather',
      default_quantity: 1,
      minimum_stock_level: 5
    },
    {
      name: 'Water Bottle',
      category: 'personal',
      icon: '🍼',
      description: 'Insulated water bottles',
      default_quantity: 2,
      minimum_stock_level: 20
    },
    {
      name: 'Safety Shoes',
      category: 'safety',
      icon: '👟',
      description: 'Work safety shoes',
      default_quantity: 1,
      minimum_stock_level: 10
    },
    {
      name: 'Work Gloves',
      category: 'safety',
      icon: '🧤',
      description: 'Protective work gloves',
      default_quantity: 2,
      minimum_stock_level: 20
    },
    {
      name: 'ID Card',
      category: 'personal',
      icon: '🪪',
      description: 'Employee identification cards',
      default_quantity: 1,
      minimum_stock_level: 5
    },
    {
      name: 'Uniform Pants',
      category: 'uniform',
      icon: '👖',
      description: 'Company uniform pants',
      default_quantity: 2,
      minimum_stock_level: 10
    }
  ];

  useEffect(() => {
    if (editingCompany) {
      setFormData(editingCompany);
      if (editingCompany.employee_accessories) {
        setCompanyAccessories(editingCompany.employee_accessories);
      }
    } else {
      // Initialize with default accessories
      const defaultAccessories = accessoryOptions.map(accessory => ({
        ...accessory,
        enabled: false,
        stock_quantity: 0
      }));
      setCompanyAccessories(defaultAccessories);
    }
  }, [editingCompany]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleAccessoryToggle = (accessoryIndex) => {
    setCompanyAccessories(prev =>
      prev.map((accessory, index) =>
        index === accessoryIndex
          ? { ...accessory, enabled: !accessory.enabled }
          : accessory
      )
    );
  };

  const handleAccessoryStockChange = (accessoryIndex, newStock) => {
    setCompanyAccessories(prev =>
      prev.map((accessory, index) =>
        index === accessoryIndex
          ? { ...accessory, stock_quantity: Math.max(0, newStock) }
          : accessory
      )
    );
  };

  const handleAccessoryDefaultChange = (accessoryIndex, newDefault) => {
    setCompanyAccessories(prev =>
      prev.map((accessory, index) =>
        index === accessoryIndex
          ? { ...accessory, default_quantity: Math.max(0, newDefault) }
          : accessory
      )
    );
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Company Information
        if (!formData.company_name) newErrors.company_name = 'Company name is required';
        if (!formData.registration_number) newErrors.registration_number = 'Registration number is required';
        break;
      case 1: // Contact Details
        if (!formData.contact_phone) newErrors.contact_phone = 'Contact phone is required';
        if (!formData.contact_email) newErrors.contact_email = 'Contact email is required';
        if (!formData.contact_person) newErrors.contact_person = 'Contact person is required';
        if (!formData.address) newErrors.address = 'Address is required';
        break;
      case 2: // Accessories - no validation needed
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    try {
      const submitData = {
        ...formData,
        employee_accessories: companyAccessories.filter(acc => acc.enabled)
      };
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const renderCompanyInformation = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
          Company Information
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Company Name *"
          value={formData.company_name}
          onChange={(e) => handleInputChange('company_name', e.target.value)}
          error={!!errors.company_name}
          helperText={errors.company_name}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Registration Number *"
          value={formData.registration_number}
          onChange={(e) => handleInputChange('registration_number', e.target.value)}
          error={!!errors.registration_number}
          helperText={errors.registration_number}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="City"
          value={formData.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Country</InputLabel>
          <Select
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            label="Country"
          >
            <MenuItem value="Saudi Arabia">Saudi Arabia</MenuItem>
            <MenuItem value="UAE">UAE</MenuItem>
            <MenuItem value="Kuwait">Kuwait</MenuItem>
            <MenuItem value="Qatar">Qatar</MenuItem>
            <MenuItem value="Bahrain">Bahrain</MenuItem>
            <MenuItem value="Oman">Oman</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  const renderContactDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          <ContactPhone sx={{ mr: 1, verticalAlign: 'middle' }} />
          Contact Details
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Contact Person *"
          value={formData.contact_person}
          onChange={(e) => handleInputChange('contact_person', e.target.value)}
          error={!!errors.contact_person}
          helperText={errors.contact_person}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Contact Phone *"
          value={formData.contact_phone}
          onChange={(e) => handleInputChange('contact_phone', e.target.value)}
          error={!!errors.contact_phone}
          helperText={errors.contact_phone}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Contact Email *"
          type="email"
          value={formData.contact_email}
          onChange={(e) => handleInputChange('contact_email', e.target.value)}
          error={!!errors.contact_email}
          helperText={errors.contact_email}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Address *"
          multiline
          rows={3}
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          error={!!errors.address}
          helperText={errors.address}
        />
      </Grid>
    </Grid>
  );

  const renderAccessoriesConfiguration = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          <Inventory sx={{ mr: 1, verticalAlign: 'middle' }} />
          Accessories Configuration
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Select the accessories your company provides to drivers and set default quantities and stock levels.
        </Alert>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Available Accessories
          </Typography>
          <Grid container spacing={2}>
            {companyAccessories.map((accessory, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    p: 2,
                    border: accessory.enabled ? '2px solid' : '1px solid #ddd',
                    borderColor: accessory.enabled ? 'primary.main' : '#ddd',
                    bgcolor: accessory.enabled ? 'primary.light' : 'white',
                    color: accessory.enabled ? 'primary.contrastText' : 'text.primary'
                  }}
                >
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h3" sx={{ mb: 1 }}>
                      {accessory.icon}
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={accessory.enabled}
                          onChange={() => handleAccessoryToggle(index)}
                          sx={{ color: accessory.enabled ? 'inherit' : 'primary.main' }}
                        />
                      }
                      label={
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {accessory.name}
                        </Typography>
                      }
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.8 }}>
                      {accessory.description}
                    </Typography>
                  </Box>

                  {accessory.enabled && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" display="block" gutterBottom>
                        Default Quantity per Driver:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleAccessoryDefaultChange(index, accessory.default_quantity - 1)}
                          disabled={accessory.default_quantity <= 0}
                          sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                        >
                          <Remove />
                        </IconButton>
                        <TextField
                          size="small"
                          type="number"
                          value={accessory.default_quantity}
                          onChange={(e) => handleAccessoryDefaultChange(index, parseInt(e.target.value) || 0)}
                          slotProps={{
                            input: {
                              style: { textAlign: 'center', width: '60px' },
                              min: 0
                            }
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'rgba(255,255,255,0.9)',
                              color: 'text.primary'
                            }
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleAccessoryDefaultChange(index, accessory.default_quantity + 1)}
                          sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                        >
                          <Add />
                        </IconButton>
                      </Box>

                      <Typography variant="caption" display="block" gutterBottom>
                        Initial Stock Quantity:
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={accessory.stock_quantity}
                        onChange={(e) => handleAccessoryStockChange(index, parseInt(e.target.value) || 0)}
                        placeholder="Enter stock quantity"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255,255,255,0.9)',
                            color: 'text.primary'
                          }
                        }}
                      />
                    </Box>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Typography variant="subtitle2" gutterBottom>
            <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
            Selected Accessories Summary
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {companyAccessories
              .filter(accessory => accessory.enabled)
              .map((accessory, index) => (
                <Chip
                  key={index}
                  label={`${accessory.name} (Default: ${accessory.default_quantity}, Stock: ${accessory.stock_quantity})`}
                  variant="outlined"
                  size="small"
                />
              ))}
            {companyAccessories.filter(acc => acc.enabled).length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No accessories selected
              </Typography>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderCompanyInformation();
      case 1:
        return renderContactDetails();
      case 2:
        return renderAccessoriesConfiguration();
      default:
        return null;
    }
  };

  return (
    <Card sx={{ maxWidth: 1000, margin: 'auto', mt: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {editingCompany ? 'Edit Company' : 'Register New Company'}
        </Typography>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Form Content */}
        <Box sx={{ minHeight: 400 }}>
          {renderStepContent()}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button onClick={onCancel} variant="outlined">
            Cancel
          </Button>
          <Box>
            {activeStep > 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
            {activeStep < steps.length - 1 ? (
              <Button onClick={handleNext} variant="contained">
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} variant="contained">
                {editingCompany ? 'Update Company' : 'Register Company'}
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EnhancedCompanyForm;
