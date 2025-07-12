import React, { useState, useEffect } from 'react';
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
  Switch,
  Chip,
  Alert,
  Paper,
  Divider,
  IconButton,
  Avatar
} from '@mui/material';
import {
  Person,
  Work,
  Assignment,
  PhotoCamera,
  LocationOn,
  ContactPhone,
  Business,
  DirectionsCar,
  Security,
  LocalHospital,
  Checkroom
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const EnhancedDriverForm = ({ onSubmit, onCancel, editingDriver = null }) => {
  const [driverType, setDriverType] = useState('new'); // 'new' or 'working'
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Common fields
    full_name: '',
    gender: '',
    date_of_birth: null,
    nationality: '',
    phone_number: '',
    vehicle_type: '',
    
    // New Driver specific fields
    passport_document: null,
    visa_document: null,
    police_certificate: null,
    passport_photo: null,
    medical_certificate: null,
    city: '',
    company: '',
    apartment_area: '',
    age: '',
    marital_status: '',
    blood_group: '',
    home_country_address: '',
    home_country_phone: '',
    nominee_name: '',
    nominee_relationship: '',
    nominee_phone: '',
    nominee_address: '',
    t_shirt_size: '',
    weight: '',
    height: '',
    kuwait_entry_date: null,
    vehicle_destination: '',
    
    // Working Driver specific fields
    vehicle_model: '',
    employee_id: '',
    civil_id_front: null,
    civil_id_back: null,
    license_front: null,
    license_back: null,
    vehicle_documents: null,
    driver_photo: null,
    health_card_document: null,
    vehicle_photo_front: null,
    vehicle_photo_back: null,
    vehicle_photo_left: null,
    vehicle_photo_right: null,
    civil_id_number: '',
    civil_id_expiry: null,
    license_number: '',
    license_expiry_date: null,
    vehicle_number: '',
    vehicle_expiry_date: null,
    health_card_number: '',
    health_card_expiry: null,
    working_department: '',
    
    // Accessories/Uniform
    t_shirt_issued: false,
    cap_issued: false,
    bag_issued: false,
    vest_issued: false,
    safety_equipment_issued: false,
    helmet_issued: false,
    cool_jacket_issued: false,
    water_bottle_issued: false,
  });

  const [companies, setCompanies] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Form steps for New Driver
  const newDriverSteps = [
    'Personal Details',
    'Contact & Address',
    'Physical Details & Nominee',
    'Work Information',
    'Documents Upload'
  ];

  // Form steps for Working Driver
  const workingDriverSteps = [
    'Basic Information',
    'Employment Details',
    'Legal Documents',
    'Document Photos',
    'Vehicle Photos',
    'Accessories & Uniform'
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const vehicleTypeOptions = [
    { value: 'bike', label: 'Bike/Motorcycle' },
    { value: 'car', label: 'Car' },
    { value: 'van', label: 'Van' },
    { value: 'truck', label: 'Truck' },
    { value: 'bus', label: 'Bus' }
  ];

  const maritalStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' }
  ];

  const bloodGroupOptions = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];

  const tShirtSizeOptions = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'
  ];

  const nomineeRelationshipOptions = [
    { value: 'wife', label: 'Wife' },
    { value: 'husband', label: 'Husband' },
    { value: 'father', label: 'Father' },
    { value: 'mother', label: 'Mother' },
    { value: 'brother', label: 'Brother' },
    { value: 'sister', label: 'Sister' },
    { value: 'son', label: 'Son' },
    { value: 'daughter', label: 'Daughter' },
    { value: 'other', label: 'Other' }
  ];

  const departmentOptions = [
    { value: 'delivery', label: 'Delivery' },
    { value: 'transport', label: 'Transport' },
    { value: 'logistics', label: 'Logistics' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'emergency', label: 'Emergency Services' }
  ];

  useEffect(() => {
    fetchCompanies();
    if (editingDriver) {
      setFormData(editingDriver);
      setDriverType(editingDriver.driver_type || 'new');
    }
  }, [editingDriver]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies/');
      const data = await response.json();
      setCompanies(data.results || data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    // Auto-calculate age when DOB changes
    if (field === 'date_of_birth' && value) {
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      setFormData(prev => ({
        ...prev,
        age: age.toString()
      }));
    }
  };

  const handleFileUpload = (field, file) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (driverType === 'new') {
      switch (step) {
        case 0: // Personal Details
          if (!formData.full_name) newErrors.full_name = 'Full name is required';
          if (!formData.gender) newErrors.gender = 'Gender is required';
          if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
          if (!formData.nationality) newErrors.nationality = 'Nationality is required';
          break;
        case 1: // Contact & Address
          if (!formData.phone_number) newErrors.phone_number = 'Phone number is required';
          if (!formData.city) newErrors.city = 'City is required';
          if (!formData.apartment_area) newErrors.apartment_area = 'Apartment area is required';
          break;
        case 2: // Physical Details & Nominee
          if (!formData.marital_status) newErrors.marital_status = 'Marital status is required';
          if (!formData.blood_group) newErrors.blood_group = 'Blood group is required';
          if (!formData.nominee_name) newErrors.nominee_name = 'Nominee name is required';
          break;
        case 3: // Work Information
          if (!formData.company) newErrors.company = 'Company is required';
          if (!formData.vehicle_type) newErrors.vehicle_type = 'Vehicle type is required';
          if (!formData.kuwait_entry_date) newErrors.kuwait_entry_date = 'Kuwait entry date is required';
          break;
        case 4: // Documents
          if (!formData.passport_document) newErrors.passport_document = 'Passport document is required';
          if (!formData.visa_document) newErrors.visa_document = 'Visa document is required';
          if (!formData.passport_photo) newErrors.passport_photo = 'Passport photo is required';
          break;
      }
    } else {
      switch (step) {
        case 0: // Basic Information
          if (!formData.full_name) newErrors.full_name = 'Full name is required';
          if (!formData.gender) newErrors.gender = 'Gender is required';
          if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
          if (!formData.nationality) newErrors.nationality = 'Nationality is required';
          if (!formData.phone_number) newErrors.phone_number = 'Phone number is required';
          break;
        case 1: // Employment Details
          if (!formData.employee_id) newErrors.employee_id = 'Employee ID is required';
          if (!formData.vehicle_type) newErrors.vehicle_type = 'Vehicle type is required';
          if (!formData.vehicle_model) newErrors.vehicle_model = 'Vehicle model is required';
          if (!formData.working_department) newErrors.working_department = 'Working department is required';
          break;
        case 2: // Legal Documents
          if (!formData.civil_id_number) newErrors.civil_id_number = 'Civil ID number is required';
          if (!formData.civil_id_expiry) newErrors.civil_id_expiry = 'Civil ID expiry is required';
          if (!formData.license_number) newErrors.license_number = 'License number is required';
          if (!formData.license_expiry_date) newErrors.license_expiry_date = 'License expiry is required';
          break;
      }
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
    
    setLoading(true);
    try {
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          if (formData[key] instanceof File) {
            submitData.append(key, formData[key]);
          } else if (formData[key] instanceof Date) {
            submitData.append(key, formData[key].toISOString().split('T')[0]);
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });
      
      submitData.append('driver_type', driverType);
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentSteps = driverType === 'new' ? newDriverSteps : workingDriverSteps;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card sx={{ maxWidth: 1200, margin: 'auto', mt: 2 }}>
        <CardContent>
          {/* Driver Type Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Add Driver
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant={driverType === 'new' ? 'contained' : 'outlined'}
                onClick={() => {
                  setDriverType('new');
                  setActiveStep(0);
                }}
                startIcon={<Person />}
                color="primary"
              >
                New Driver Application
              </Button>
              <Button
                variant={driverType === 'working' ? 'contained' : 'outlined'}
                onClick={() => {
                  setDriverType('working');
                  setActiveStep(0);
                }}
                startIcon={<Work />}
                color="secondary"
              >
                Working Driver
              </Button>
            </Box>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {currentSteps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Form Content */}
          <Box sx={{ minHeight: 400 }}>
            {driverType === 'new' ? renderNewDriverForm() : renderWorkingDriverForm()}
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
              {activeStep < currentSteps.length - 1 ? (
                <Button onClick={handleNext} variant="contained">
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  variant="contained" 
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );

  // New Driver Form Renderer
  function renderNewDriverForm() {
    switch (activeStep) {
      case 0: // Personal Details
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                Personal Details
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name *"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                error={!!errors.full_name}
                helperText={errors.full_name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.gender}>
                <InputLabel>Gender *</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  label="Gender *"
                >
                  {genderOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Date of Birth *"
                value={formData.date_of_birth}
                onChange={(date) => handleInputChange('date_of_birth', date)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    error={!!errors.date_of_birth}
                    helperText={errors.date_of_birth}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Age"
                value={formData.age}
                InputProps={{ readOnly: true }}
                helperText="Auto-calculated from date of birth"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nationality *"
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                error={!!errors.nationality}
                helperText={errors.nationality}
              />
            </Grid>
          </Grid>
        );
      
      case 1: // Contact & Address
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <ContactPhone sx={{ mr: 1, verticalAlign: 'middle' }} />
                Contact & Address Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number *"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                error={!!errors.phone_number}
                helperText={errors.phone_number}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Home Country Phone"
                value={formData.home_country_phone}
                onChange={(e) => handleInputChange('home_country_phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City *"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                error={!!errors.city}
                helperText={errors.city}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Apartment Area *"
                value={formData.apartment_area}
                onChange={(e) => handleInputChange('apartment_area', e.target.value)}
                error={!!errors.apartment_area}
                helperText={errors.apartment_area}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Home Country Address"
                value={formData.home_country_address}
                onChange={(e) => handleInputChange('home_country_address', e.target.value)}
              />
            </Grid>
          </Grid>
        );

      case 2: // Physical Details & Nominee
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Physical Details & Nominee Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.marital_status}>
                <InputLabel>Marital Status *</InputLabel>
                <Select
                  value={formData.marital_status}
                  onChange={(e) => handleInputChange('marital_status', e.target.value)}
                  label="Marital Status *"
                >
                  {maritalStatusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.blood_group}>
                <InputLabel>Blood Group *</InputLabel>
                <Select
                  value={formData.blood_group}
                  onChange={(e) => handleInputChange('blood_group', e.target.value)}
                  label="Blood Group *"
                >
                  {bloodGroupOptions.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>T-Shirt Size</InputLabel>
                <Select
                  value={formData.t_shirt_size}
                  onChange={(e) => handleInputChange('t_shirt_size', e.target.value)}
                  label="T-Shirt Size"
                >
                  {tShirtSizeOptions.map(size => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Weight (KG)"
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Height (CM)"
                type="number"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Nominee Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nominee Name *"
                value={formData.nominee_name}
                onChange={(e) => handleInputChange('nominee_name', e.target.value)}
                error={!!errors.nominee_name}
                helperText={errors.nominee_name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Relationship</InputLabel>
                <Select
                  value={formData.nominee_relationship}
                  onChange={(e) => handleInputChange('nominee_relationship', e.target.value)}
                  label="Relationship"
                >
                  {nomineeRelationshipOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nominee Phone"
                value={formData.nominee_phone}
                onChange={(e) => handleInputChange('nominee_phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Nominee Address"
                value={formData.nominee_address}
                onChange={(e) => handleInputChange('nominee_address', e.target.value)}
              />
            </Grid>
          </Grid>
        );

      case 3: // Work Information
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                Work Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.company}>
                <InputLabel>Company *</InputLabel>
                <Select
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  label="Company *"
                >
                  {companies.map(company => (
                    <MenuItem key={company.id} value={company.company_name}>
                      {company.company_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.vehicle_type}>
                <InputLabel>Vehicle Type *</InputLabel>
                <Select
                  value={formData.vehicle_type}
                  onChange={(e) => handleInputChange('vehicle_type', e.target.value)}
                  label="Vehicle Type *"
                >
                  {vehicleTypeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vehicle Destination"
                value={formData.vehicle_destination}
                onChange={(e) => handleInputChange('vehicle_destination', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Kuwait Entry Date *"
                value={formData.kuwait_entry_date}
                onChange={(date) => handleInputChange('kuwait_entry_date', date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errors.kuwait_entry_date}
                    helperText={errors.kuwait_entry_date}
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 4: // Documents Upload
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                Document Upload
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Please upload clear, readable copies of all required documents
              </Alert>
            </Grid>

            {[
              { field: 'passport_document', label: 'Passport Document *', required: true },
              { field: 'visa_document', label: 'Visa Document *', required: true },
              { field: 'police_certificate', label: 'Police Certificate', required: false },
              { field: 'medical_certificate', label: 'Medical Certificate', required: false },
              { field: 'passport_photo', label: 'Passport Photo *', required: true, accept: 'image/*' }
            ].map(({ field, label, required, accept = '.pdf,.jpg,.jpeg,.png' }) => (
              <Grid item xs={12} md={6} key={field}>
                <Paper sx={{ p: 2, border: errors[field] ? '1px solid red' : '1px solid #ddd' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {label}
                  </Typography>
                  <input
                    type="file"
                    accept={accept}
                    onChange={(e) => handleFileUpload(field, e.target.files[0])}
                    style={{ width: '100%', marginBottom: 8 }}
                  />
                  {formData[field] && (
                    <Chip
                      label={formData[field].name}
                      color="success"
                      size="small"
                    />
                  )}
                  {errors[field] && (
                    <Typography color="error" variant="caption">
                      {errors[field]}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        );

      default:
        return <Typography>Invalid step</Typography>;
    }
  }

  // Working Driver Form Renderer
  function renderWorkingDriverForm() {
    switch (activeStep) {
      case 0: // Basic Information
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
                Basic Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name *"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                error={!!errors.full_name}
                helperText={errors.full_name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.gender}>
                <InputLabel>Gender *</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  label="Gender *"
                >
                  {genderOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Date of Birth *"
                value={formData.date_of_birth}
                onChange={(date) => handleInputChange('date_of_birth', date)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    error={!!errors.date_of_birth}
                    helperText={errors.date_of_birth}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nationality *"
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                error={!!errors.nationality}
                helperText={errors.nationality}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number *"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                error={!!errors.phone_number}
                helperText={errors.phone_number}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.vehicle_type}>
                <InputLabel>Vehicle Type *</InputLabel>
                <Select
                  value={formData.vehicle_type}
                  onChange={(e) => handleInputChange('vehicle_type', e.target.value)}
                  label="Vehicle Type *"
                >
                  {vehicleTypeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vehicle Model *"
                value={formData.vehicle_model}
                onChange={(e) => handleInputChange('vehicle_model', e.target.value)}
                error={!!errors.vehicle_model}
                helperText={errors.vehicle_model}
              />
            </Grid>
          </Grid>
        );
      
      case 1: // Employment Details
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                Employment Details
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Employee ID *"
                value={formData.employee_id}
                onChange={(e) => handleInputChange('employee_id', e.target.value)}
                error={!!errors.employee_id}
                helperText={errors.employee_id}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.working_department}>
                <InputLabel>Working Department *</InputLabel>
                <Select
                  value={formData.working_department}
                  onChange={(e) => handleInputChange('working_department', e.target.value)}
                  label="Working Department *"
                >
                  {departmentOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vehicle Model *"
                value={formData.vehicle_model}
                onChange={(e) => handleInputChange('vehicle_model', e.target.value)}
                error={!!errors.vehicle_model}
                helperText={errors.vehicle_model}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vehicle Number"
                value={formData.vehicle_number}
                onChange={(e) => handleInputChange('vehicle_number', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Vehicle Expiry Date"
                value={formData.vehicle_expiry_date}
                onChange={(date) => handleInputChange('vehicle_expiry_date', date)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth />
                )}
              />
            </Grid>
          </Grid>
        );

      case 2: // Legal Documents
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                Legal Documents & Numbers
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Civil ID Number *"
                value={formData.civil_id_number}
                onChange={(e) => handleInputChange('civil_id_number', e.target.value)}
                error={!!errors.civil_id_number}
                helperText={errors.civil_id_number}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Civil ID Expiry *"
                value={formData.civil_id_expiry}
                onChange={(date) => handleInputChange('civil_id_expiry', date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errors.civil_id_expiry}
                    helperText={errors.civil_id_expiry}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="License Number *"
                value={formData.license_number}
                onChange={(e) => handleInputChange('license_number', e.target.value)}
                error={!!errors.license_number}
                helperText={errors.license_number}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="License Expiry Date *"
                value={formData.license_expiry_date}
                onChange={(date) => handleInputChange('license_expiry_date', date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errors.license_expiry_date}
                    helperText={errors.license_expiry_date}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Health Card Number"
                value={formData.health_card_number}
                onChange={(e) => handleInputChange('health_card_number', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Health Card Expiry"
                value={formData.health_card_expiry}
                onChange={(date) => handleInputChange('health_card_expiry', date)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth />
                )}
              />
            </Grid>
          </Grid>
        );

      case 3: // Document Photos
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <PhotoCamera sx={{ mr: 1, verticalAlign: 'middle' }} />
                Document Photos & Driver Photo
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Upload clear photos of front and back of documents
              </Alert>
            </Grid>

            {[
              { field: 'civil_id_front', label: 'Civil ID Front *', required: true },
              { field: 'civil_id_back', label: 'Civil ID Back *', required: true },
              { field: 'license_front', label: 'License Front *', required: true },
              { field: 'license_back', label: 'License Back *', required: true },
              { field: 'vehicle_documents', label: 'Vehicle Documents', required: false },
              { field: 'driver_photo', label: 'Driver Photo *', required: true },
              { field: 'health_card_document', label: 'Health Card', required: false }
            ].map(({ field, label, required }) => (
              <Grid item xs={12} md={6} key={field}>
                <Paper sx={{ p: 2, border: errors[field] ? '1px solid red' : '1px solid #ddd' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {label}
                  </Typography>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(field, e.target.files[0])}
                    style={{ width: '100%', marginBottom: 8 }}
                  />
                  {formData[field] && (
                    <Chip
                      label={formData[field].name}
                      color="success"
                      size="small"
                    />
                  )}
                  {errors[field] && (
                    <Typography color="error" variant="caption">
                      {errors[field]}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        );

      case 4: // Vehicle Photos (4 sides)
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <DirectionsCar sx={{ mr: 1, verticalAlign: 'middle' }} />
                Vehicle Photos (4 Sides)
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Take clear photos of your vehicle from all 4 sides
              </Alert>
            </Grid>

            {[
              { field: 'vehicle_photo_front', label: 'Vehicle Front View *', icon: '🚗' },
              { field: 'vehicle_photo_back', label: 'Vehicle Back View *', icon: '🚙' },
              { field: 'vehicle_photo_left', label: 'Vehicle Left Side *', icon: '🚐' },
              { field: 'vehicle_photo_right', label: 'Vehicle Right Side *', icon: '🚚' }
            ].map(({ field, label, icon }) => (
              <Grid item xs={12} md={6} key={field}>
                <Paper sx={{ p: 2, border: '1px solid #ddd', textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {icon}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    {label}
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(field, e.target.files[0])}
                    style={{ width: '100%', marginBottom: 8 }}
                  />
                  {formData[field] && (
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={formData[field].name}
                        color="success"
                        size="small"
                      />
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        );

      case 5: // Accessories & Uniform
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <Checkroom sx={{ mr: 1, verticalAlign: 'middle' }} />
                Accessories & Uniform Issuance
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Mark the items that have been issued to the driver
              </Alert>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Uniform Items
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.t_shirt_issued}
                          onChange={(e) => handleInputChange('t_shirt_issued', e.target.checked)}
                        />
                      }
                      label="T-Shirt"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.cap_issued}
                          onChange={(e) => handleInputChange('cap_issued', e.target.checked)}
                        />
                      }
                      label="Cap"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.bag_issued}
                          onChange={(e) => handleInputChange('bag_issued', e.target.checked)}
                        />
                      }
                      label="Bag"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.vest_issued}
                          onChange={(e) => handleInputChange('vest_issued', e.target.checked)}
                        />
                      }
                      label="Vest"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Safety & Equipment
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.safety_equipment_issued}
                          onChange={(e) => handleInputChange('safety_equipment_issued', e.target.checked)}
                        />
                      }
                      label="Safety Equipment"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.helmet_issued}
                          onChange={(e) => handleInputChange('helmet_issued', e.target.checked)}
                        />
                      }
                      label="Helmet"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.cool_jacket_issued}
                          onChange={(e) => handleInputChange('cool_jacket_issued', e.target.checked)}
                        />
                      }
                      label="Cool Jacket"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.water_bottle_issued}
                          onChange={(e) => handleInputChange('water_bottle_issued', e.target.checked)}
                        />
                      }
                      label="Water Bottle"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {formData.t_shirt_issued && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>T-Shirt Size</InputLabel>
                  <Select
                    value={formData.t_shirt_size}
                    onChange={(e) => handleInputChange('t_shirt_size', e.target.value)}
                    label="T-Shirt Size"
                  >
                    {tShirtSizeOptions.map(size => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        );

      default:
        return <Typography>Invalid step</Typography>;
    }
  }
};

export default EnhancedDriverForm;
