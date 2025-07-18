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
  Chip
} from '@mui/material';
import {
  Business,
  ContactPhone,
  Inventory,
  CheckCircle
} from '@mui/icons-material';

const EnhancedCompanyForm = ({ onSubmit, onCancel, editingCompany = null }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Company basic info
    company_name: '',
    address: '',
    city: '',
    country: 'Kuwait',
    contact_phone: '+965',
    contact_email: '',
    contact_person: '',
    registration_number: '',

    // Car commission fields
    car_commission_type: 'FIXED',
    car_rate_per_km: '',
    car_min_km: '',
    car_rate_per_order: '',
    car_fixed_commission: '',

    // Bike commission fields
    bike_commission_type: 'FIXED',
    bike_rate_per_km: '',
    bike_min_km: '',
    bike_rate_per_order: '',
    bike_fixed_commission: '',

    // Accessories (boolean fields only)
    t_shirt: false,
    cap: false,
    jackets: false,
    bag: false,
    wristbands: false,
    water_bottle: false,
    safety_gear: false,
    helmet: false,
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    countries: [],
    cities: {},
    vehicle_types: []
  });
  const [errors, setErrors] = useState({});

  const steps = ['Company Information', 'Contact Details', 'Commission Configuration', 'Accessories Configuration'];

  // Fetch dropdown options on component mount
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/dropdown-options/');
        if (response.ok) {
          const data = await response.json();
          setDropdownOptions(data);
        }
      } catch (error) {
        console.error('Error fetching dropdown options:', error);
      }
    };

    fetchDropdownOptions();
  }, []);

  // Handle editing company data
  useEffect(() => {
    if (editingCompany) {
      setFormData({
        company_name: editingCompany.company_name || '',
        address: editingCompany.address || '',
        city: editingCompany.city || '',
        country: editingCompany.country || 'Kuwait',
        contact_phone: editingCompany.contact_phone || '+965',
        contact_email: editingCompany.contact_email || '',
        contact_person: editingCompany.contact_person || '',
        registration_number: editingCompany.registration_number || '',

        // Car commission fields
        car_commission_type: editingCompany.car_commission_type || 'FIXED',
        car_rate_per_km: editingCompany.car_rate_per_km || '',
        car_min_km: editingCompany.car_min_km || '',
        car_rate_per_order: editingCompany.car_rate_per_order || '',
        car_fixed_commission: editingCompany.car_fixed_commission || '',

        // Bike commission fields
        bike_commission_type: editingCompany.bike_commission_type || 'FIXED',
        bike_rate_per_km: editingCompany.bike_rate_per_km || '',
        bike_min_km: editingCompany.bike_min_km || '',
        bike_rate_per_order: editingCompany.bike_rate_per_order || '',
        bike_fixed_commission: editingCompany.bike_fixed_commission || '',

        // Accessories (boolean fields)
        t_shirt: editingCompany.t_shirt || false,
        cap: editingCompany.cap || false,
        jackets: editingCompany.jackets || false,
        bag: editingCompany.bag || false,
        wristbands: editingCompany.wristbands || false,
        water_bottle: editingCompany.water_bottle || false,
        safety_gear: editingCompany.safety_gear || false,
        helmet: editingCompany.helmet || false,
      });
    }
  }, [editingCompany]);

  const accessoryOptions = [
    {
      key: 't_shirt',
      name: 'T-Shirt',
      category: 'uniform',
      icon: '👕',
      description: 'Company branded t-shirts'
    },
    {
      key: 'cap',
      name: 'Cap',
      category: 'uniform',
      icon: '🧢',
      description: 'Company branded caps'
    },
    {
      key: 'jackets',
      name: 'Jackets',
      category: 'uniform',
      icon: '🧥',
      description: 'Work jackets for drivers'
    },
    {
      key: 'bag',
      name: 'Work Bag',
      category: 'personal',
      icon: '🎒',
      description: 'Work bags for drivers'
    },
    {
      key: 'wristbands',
      name: 'Wristbands',
      category: 'personal',
      icon: '⌚',
      description: 'Company wristbands'
    },
    {
      key: 'water_bottle',
      name: 'Water Bottle',
      category: 'personal',
      icon: '🍼',
      description: 'Company water bottles'
    },
    {
      key: 'safety_gear',
      name: 'Safety Gear',
      category: 'safety',
      icon: '🦺',
      description: 'General safety equipment'
    },
    {
      key: 'helmet',
      name: 'Helmet',
      category: 'safety',
      icon: '⛑️',
      description: 'Safety helmets'
    }
  ];



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
      case 2: // Commission Configuration
        // Validate car commission
        if (formData.car_commission_type === 'KM') {
          if (!formData.car_rate_per_km) newErrors.car_rate_per_km = 'Car rate per KM is required';
          if (!formData.car_min_km) newErrors.car_min_km = 'Car minimum KM is required';
        } else if (formData.car_commission_type === 'ORDER') {
          if (!formData.car_rate_per_order) newErrors.car_rate_per_order = 'Car rate per order is required';
        } else if (formData.car_commission_type === 'FIXED') {
          if (!formData.car_fixed_commission) newErrors.car_fixed_commission = 'Car fixed commission is required';
        }

        // Validate bike commission
        if (formData.bike_commission_type === 'KM') {
          if (!formData.bike_rate_per_km) newErrors.bike_rate_per_km = 'Bike rate per KM is required';
          if (!formData.bike_min_km) newErrors.bike_min_km = 'Bike minimum KM is required';
        } else if (formData.bike_commission_type === 'ORDER') {
          if (!formData.bike_rate_per_order) newErrors.bike_rate_per_order = 'Bike rate per order is required';
        } else if (formData.bike_commission_type === 'FIXED') {
          if (!formData.bike_fixed_commission) newErrors.bike_fixed_commission = 'Bike fixed commission is required';
        }
        break;
      case 3: // Accessories - no validation needed
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
      // Submit form data directly - accessories are now boolean fields in formData
      await onSubmit(formData);
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
        <FormControl fullWidth>
          <InputLabel>Country</InputLabel>
          <Select
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            label="Country"
          >
            {dropdownOptions.countries.map((country) => (
              <MenuItem key={country.value} value={country.value}>
                {country.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>City</InputLabel>
          <Select
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            label="City"
          >
            {(dropdownOptions.cities[formData.country] || dropdownOptions.cities.default || []).map((city) => (
              <MenuItem key={city.value} value={city.value}>
                {city.label}
              </MenuItem>
            ))}
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

  const renderCommissionConfiguration = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          💰 Commission Configuration
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Configure commission rates for different vehicle types. This will be displayed to drivers during registration.
        </Alert>
      </Grid>

      {/* Car Commission Configuration */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography variant="h6" gutterBottom>
            🚗 Car Commission Settings
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'inherit' }}>Commission Type</InputLabel>
                <Select
                  value={formData.car_commission_type}
                  onChange={(e) => handleInputChange('car_commission_type', e.target.value)}
                  label="Commission Type"
                  sx={{ color: 'inherit', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' } }}
                >
                  <MenuItem value="KM">KM Based</MenuItem>
                  <MenuItem value="ORDER">Order Based</MenuItem>
                  <MenuItem value="FIXED">Fixed Commission</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.car_commission_type === 'KM' && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Rate per KM"
                    type="number"
                    value={formData.car_rate_per_km}
                    onChange={(e) => handleInputChange('car_rate_per_km', e.target.value)}
                    error={!!errors.car_rate_per_km}
                    helperText={errors.car_rate_per_km}
                    sx={{ '& .MuiInputLabel-root': { color: 'inherit' }, '& .MuiOutlinedInput-root': { color: 'inherit' } }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Minimum KM"
                    type="number"
                    value={formData.car_min_km}
                    onChange={(e) => handleInputChange('car_min_km', e.target.value)}
                    error={!!errors.car_min_km}
                    helperText={errors.car_min_km}
                    sx={{ '& .MuiInputLabel-root': { color: 'inherit' }, '& .MuiOutlinedInput-root': { color: 'inherit' } }}
                  />
                </Grid>
              </>
            )}

            {formData.car_commission_type === 'ORDER' && (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Rate per Order"
                  type="number"
                  value={formData.car_rate_per_order}
                  onChange={(e) => handleInputChange('car_rate_per_order', e.target.value)}
                  error={!!errors.car_rate_per_order}
                  helperText={errors.car_rate_per_order}
                  sx={{ '& .MuiInputLabel-root': { color: 'inherit' }, '& .MuiOutlinedInput-root': { color: 'inherit' } }}
                />
              </Grid>
            )}

            {formData.car_commission_type === 'FIXED' && (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Fixed Commission Amount"
                  type="number"
                  value={formData.car_fixed_commission}
                  onChange={(e) => handleInputChange('car_fixed_commission', e.target.value)}
                  error={!!errors.car_fixed_commission}
                  helperText={errors.car_fixed_commission}
                  sx={{ '& .MuiInputLabel-root': { color: 'inherit' }, '& .MuiOutlinedInput-root': { color: 'inherit' } }}
                />
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>

      {/* Bike Commission Configuration */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
          <Typography variant="h6" gutterBottom>
            🏍️ Bike Commission Settings
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'inherit' }}>Commission Type</InputLabel>
                <Select
                  value={formData.bike_commission_type}
                  onChange={(e) => handleInputChange('bike_commission_type', e.target.value)}
                  label="Commission Type"
                  sx={{ color: 'inherit', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' } }}
                >
                  <MenuItem value="KM">KM Based</MenuItem>
                  <MenuItem value="ORDER">Order Based</MenuItem>
                  <MenuItem value="FIXED">Fixed Commission</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.bike_commission_type === 'KM' && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Rate per KM"
                    type="number"
                    value={formData.bike_rate_per_km}
                    onChange={(e) => handleInputChange('bike_rate_per_km', e.target.value)}
                    error={!!errors.bike_rate_per_km}
                    helperText={errors.bike_rate_per_km}
                    sx={{ '& .MuiInputLabel-root': { color: 'inherit' }, '& .MuiOutlinedInput-root': { color: 'inherit' } }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Minimum KM"
                    type="number"
                    value={formData.bike_min_km}
                    onChange={(e) => handleInputChange('bike_min_km', e.target.value)}
                    error={!!errors.bike_min_km}
                    helperText={errors.bike_min_km}
                    sx={{ '& .MuiInputLabel-root': { color: 'inherit' }, '& .MuiOutlinedInput-root': { color: 'inherit' } }}
                  />
                </Grid>
              </>
            )}

            {formData.bike_commission_type === 'ORDER' && (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Rate per Order"
                  type="number"
                  value={formData.bike_rate_per_order}
                  onChange={(e) => handleInputChange('bike_rate_per_order', e.target.value)}
                  error={!!errors.bike_rate_per_order}
                  helperText={errors.bike_rate_per_order}
                  sx={{ '& .MuiInputLabel-root': { color: 'inherit' }, '& .MuiOutlinedInput-root': { color: 'inherit' } }}
                />
              </Grid>
            )}

            {formData.bike_commission_type === 'FIXED' && (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Fixed Commission Amount"
                  type="number"
                  value={formData.bike_fixed_commission}
                  onChange={(e) => handleInputChange('bike_fixed_commission', e.target.value)}
                  error={!!errors.bike_fixed_commission}
                  helperText={errors.bike_fixed_commission}
                  sx={{ '& .MuiInputLabel-root': { color: 'inherit' }, '& .MuiOutlinedInput-root': { color: 'inherit' } }}
                />
              </Grid>
            )}
          </Grid>
        </Paper>
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
          Select the accessories your company provides to drivers. Quantities will be entered during driver registration.
        </Alert>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Available Accessories
          </Typography>
          <Grid container spacing={2}>
            {accessoryOptions.map((accessory) => (
              <Grid item xs={12} sm={6} md={4} key={accessory.key}>
                <Card
                  sx={{
                    p: 2,
                    border: formData[accessory.key] ? '2px solid' : '1px solid #ddd',
                    borderColor: formData[accessory.key] ? 'primary.main' : '#ddd',
                    bgcolor: formData[accessory.key] ? 'primary.light' : 'white',
                    color: formData[accessory.key] ? 'primary.contrastText' : 'text.primary'
                  }}
                >
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h3" sx={{ mb: 1 }}>
                      {accessory.icon}
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData[accessory.key]}
                          onChange={(e) => handleInputChange(accessory.key, e.target.checked)}
                          sx={{ color: formData[accessory.key] ? 'inherit' : 'primary.main' }}
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
                    <Chip
                      label={accessory.category}
                      size="small"
                      sx={{ mt: 1 }}
                      color={formData[accessory.key] ? 'secondary' : 'default'}
                    />
                  </Box>

                  {formData[accessory.key] && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{
                        bgcolor: 'rgba(255,255,255,0.9)',
                        color: 'text.primary',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        display: 'inline-block'
                      }}>
                        ✓ Available for drivers
                      </Typography>
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
            {accessoryOptions
              .filter(accessory => formData[accessory.key])
              .map((accessory) => (
                <Chip
                  key={accessory.key}
                  label={`${accessory.icon} ${accessory.name}`}
                  variant="outlined"
                  size="small"
                  sx={{ color: 'inherit' }}
                />
              ))}
            {accessoryOptions.filter(acc => formData[acc.key]).length === 0 && (
              <Typography variant="body2" sx={{ color: 'inherit', opacity: 0.8 }}>
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
        return renderCommissionConfiguration();
      case 3:
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
