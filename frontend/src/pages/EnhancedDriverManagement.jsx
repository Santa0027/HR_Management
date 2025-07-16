  import React, { useState, useEffect, useCallback, useMemo } from 'react';
  import {
    PlusIcon,
    PencilIcon,
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowDownTrayIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    UserIcon,
    BriefcaseIcon,
    ClipboardDocumentCheckIcon,
    TruckIcon,
    ArrowTrendingUpIcon,
    UsersIcon,
    RectangleStackIcon,
    ShieldCheckIcon,
    PaperClipIcon,
    ArrowUpTrayIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    CalendarDaysIcon,
    ExclamationCircleIcon,
    InformationCircleIcon
  } from '@heroicons/react/24/solid';

  // Enhanced Input Component with proper focus handling
  const FormInput = ({ type = "text", id, name, value, onChange, className, required, autoComplete, placeholder, ...props }) => {
    const [localValue, setLocalValue] = useState(value || '');

    useEffect(() => {
      setLocalValue(value || '');
    }, [value]);

    const handleInputChange = (e) => {
      e.preventDefault();
      const newValue = e.target.value;
      setLocalValue(newValue);

      // Create a synthetic event for the parent handler
      const syntheticEvent = {
        target: {
          name: name,
          value: newValue,
          type: type,
          checked: e.target.checked,
          files: e.target.files
        }
      };
      onChange(syntheticEvent);
    };

    return (
      <input
        type={type}
        id={id}
        name={name}
        value={localValue}
        onChange={handleInputChange}
        className={className}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        {...props}
      />
    );
  };

  // Enhanced Select Component
  const FormSelect = ({ id, name, value, onChange, className, required, children, ...props }) => {
    const [localValue, setLocalValue] = useState(value || '');

    useEffect(() => {
      setLocalValue(value || '');
    }, [value]);

    const handleSelectChange = (e) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      // Create a synthetic event for the parent handler
      const syntheticEvent = {
        target: {
          name: name,
          value: newValue,
          type: 'select'
        }
      };
      onChange(syntheticEvent);
    };

    return (
      <select
        id={id}
        name={name}
        value={localValue}
        onChange={handleSelectChange}
        className={className}
        required={required}
        {...props}
      >
        {children}
      </select>
    );
  };

  // --- Dummy Data ---
  const initialNewDriverApplications = [
    {
      id: 'app001',
      full_name: 'Ahmed Al-Farsi',
      company_name: 'SwiftDeliver Co.',
      vehicle_type: 'Bike',
      nationality: 'Kuwaiti',
      phone_number: '+965-12345678',
      status: 'pending',
      status_display: 'Pending',
      application_date: '2025-06-20T10:00:00Z',
    },
    {
      id: 'app002',
      full_name: 'Fatima Zahra',
      company_name: 'ExpressLogistics',
      vehicle_type: 'Car',
      nationality: 'Egyptian',
      phone_number: '+965-98765432',
      status: 'approved',
      status_display: 'Approved',
      application_date: '2025-06-15T14:30:00Z',
    },
    {
      id: 'app003',
      full_name: 'Omar Hassan',
      company_name: 'Urban Transit',
      vehicle_type: 'Van',
      nationality: 'Syrian',
      phone_number: '+965-55551111',
      status: 'rejected',
      status_display: 'Rejected',
      application_date: '2025-06-10T09:00:00Z',
    },
  ];

  const initialWorkingDrivers = [
    {
      id: 'driver001',
      employee_id: 'EMP7890',
      full_name: 'Khaled Jaber',
      working_department: 'delivery',
      working_department_display: 'Delivery',
      vehicle_type: 'Bike',
      vehicle_model: 'Honda CB300R',
      phone_number: '+965-11223344',
      employment_status: 'active',
      employment_status_display: 'Active',
      joining_date: '2024-01-01',
      rating: 4.8,
    },
    {
      id: 'driver002',
      employee_id: 'EMP1234',
      full_name: 'Layla Mansour',
      working_department: 'transport',
      working_department_display: 'Transport',
      vehicle_type: 'Truck',
      vehicle_model: 'Volvo FH16',
      phone_number: '+965-99887766',
      employment_status: 'active',
      employment_status_display: 'Active',
      joining_date: '2023-05-10',
      rating: 4.5,
    },
    {
      id: 'driver003',
      employee_id: 'EMP5678',
      full_name: 'Yousef Ali',
      working_department: 'logistics',
      working_department_display: 'Logistics',
      vehicle_type: 'Van',
      vehicle_model: 'Ford Transit',
      phone_number: '+965-44332211',
      employment_status: 'suspended',
      employment_status_display: 'Suspended',
      joining_date: '2024-03-20',
      rating: 3.9,
    },
  ];

  // --- Generic Modal Component ---
  const Modal = ({ isOpen, onClose, children, maxWidth = 'max-w-2xl' }) => {
    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 transition-opacity duration-300 ease-out"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div
          className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} p-8 transform transition-all scale-95 duration-300 ease-out border border-gray-100 relative max-h-[90vh] overflow-y-auto custom-scrollbar`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition duration-150 p-2 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
          {children}
        </div>
      </div>
    );
  };

  // --- Generic Snackbar Component ---
  const Snackbar = ({ message, severity, open, onClose, autoHideDuration = 6000 }) => {
    useEffect(() => {
      if (open) {
        const timer = setTimeout(() => {
          onClose();
        }, autoHideDuration);
        return () => clearTimeout(timer);
      }
    }, [open, autoHideDuration, onClose]);

    if (!open) return null;

    const getColors = () => {
      switch (severity) {
        case 'success':
          return { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-400', icon: CheckCircleIcon };
        case 'error':
          return { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-400', icon: XCircleIcon };
        case 'warning':
          return { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-400', icon: ExclamationCircleIcon };
        case 'info':
          return { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-400', icon: InformationCircleIcon };
        default:
          return { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-400', icon: InformationCircleIcon };
      }
    };

    const { bg, text, border, icon: Icon } = getColors();

    return (
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg flex items-center space-x-3 transition-opacity duration-300 ease-out z-[100] ${bg} ${text} border ${border}`}
      >
        <Icon className="h-6 w-6" />
        <span className="font-medium text-sm">{message}</span>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-opacity-20 transition-colors duration-150">
          <XCircleIcon className="h-5 w-5" />
        </button>
      </div>
    );
  };

  // --- Helper component for form steps (Stepper) ---
  const Stepper = ({ currentStep, totalSteps, stepNames, stepIcons }) => {
    return (
      <div className="flex justify-between mb-8">
        {[...Array(totalSteps)].map((_, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 border-4
                ${index === currentStep ? 'bg-blue-600 text-white border-blue-100 shadow-lg' : 'bg-gray-100 text-gray-500 border-gray-200'}
                ${index < currentStep ? 'bg-green-500 text-white border-green-100' : ''}`}
            >
              {stepIcons[index] && React.createElement(stepIcons[index], { className: "h-6 w-6" })}
            </div>
            <span className={`mt-2 text-sm font-medium text-center ${index <= currentStep ? 'text-gray-900' : 'text-gray-500'}`}>
              Step {index + 1}<br/>{stepNames[index]}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // --- New Driver Form Sub-Components ---
  const Step1NewDriverPersonal = ({ formData, handleChange, handleNext, errors }) => {
    const InputField = ({ id, label, type = 'text', required = true }) => (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <FormInput
          type={type}
          id={id}
          name={id}
          value={formData[id]}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors[id] ? 'border-red-500' : 'border-gray-300'}`}
          required={required}
        />
        {errors[id] && <p className="text-sm text-red-600 mt-1">{errors[id]}</p>}
      </div>
    );

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InputField id="fullName" label="Full Name" />
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
            <FormSelect id="gender" name="gender" value={formData.gender} onChange={handleChange} className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${errors.gender ? 'border-red-500' : 'border-gray-300'}`} required>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </FormSelect>
            {errors.gender && <p className="text-sm text-red-600 mt-1">{errors.gender}</p>}
          </div>
          <InputField id="dob" label="Date of Birth" type="date" />
          <InputField id="nationality" label="Nationality" />
          <InputField id="city" label="City" />
          <InputField id="company" label="Company" />
          <InputField id="apartmentArea" label="Apartment/Area" />
          <InputField id="phoneNumber" label="Phone Number" type="tel" />
          <InputField id="age" label="Age" type="number" />
          <div>
            <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700">Marital Status</label>
            <select id="maritalStatus" name="maritalStatus" value={formData.maritalStatus || ''} onChange={handleChange} className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${errors.maritalStatus ? 'border-red-500' : 'border-gray-300'}`} required>
              <option value="">Select</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
            {errors.maritalStatus && <p className="text-sm text-red-600 mt-1">{errors.maritalStatus}</p>}
          </div>
          <div>
            <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">Blood Group</label>
            <select id="bloodGroup" name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleChange} className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${errors.bloodGroup ? 'border-red-500' : 'border-gray-300'}`} required>
              <option value="">Select</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
            {errors.bloodGroup && <p className="text-sm text-red-600 mt-1">{errors.bloodGroup}</p>}
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="homeCountryAddress" className="block text-sm font-medium text-gray-700">Home Country Address</label>
          <textarea
            id="homeCountryAddress"
            name="homeCountryAddress"
            value={formData.homeCountryAddress || ''}
            onChange={handleChange}
            rows="3"
            className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.homeCountryAddress ? 'border-red-500' : 'border-gray-300'}`}
            required
          ></textarea>
          {errors.homeCountryAddress && <p className="text-sm text-red-600 mt-1">{errors.homeCountryAddress}</p>}
        </div>

        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Nominee Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField id="nomineeWife" label="Nominee (Wife, Father, Mother, etc.)" />
            <InputField id="nomineePhone" label="Nominee Phone Number" type="tel" required={false} />
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
          >
            Next <ChevronRightIcon className="ml-2 h-4 w-4" />
          </button>
        </div>
      </>
    );
  };

  const Step2NewDriverVehicle = ({ formData, handleChange, handleNext, handlePrevious, errors }) => {
    const InputField = ({ id, label, type = 'text', required = true }) => (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <FormInput
          type={type}
          id={id}
          name={id}
          value={formData[id]}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors[id] ? 'border-red-500' : 'border-gray-300'}`}
          required={required}
        />
        {errors[id] && <p className="text-sm text-red-600 mt-1">{errors[id]}</p>}
      </div>
    );

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">Vehicle Type</label>
            <select id="vehicleType" name="vehicleType" value={formData.vehicleType || ''} onChange={handleChange} className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${errors.vehicleType ? 'border-red-500' : 'border-gray-300'}`} required>
              <option value="">Select Type</option>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="truck">Truck</option>
              <option value="van">Van</option>
            </select>
            {errors.vehicleType && <p className="text-sm text-red-600 mt-1">{errors.vehicleType}</p>}
          </div>
          <InputField id="vehicleDestination" label="Vehicle Destination" />
          <div>
            <label htmlFor="tShirtSize" className="block text-sm font-medium text-gray-700">T-shirt Size</label>
            <select id="tShirtSize" name="tShirtSize" value={formData.tShirtSize || ''} onChange={handleChange} className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${errors.tShirtSize ? 'border-red-500' : 'border-gray-300'}`} required>
              <option value="">Select Size</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
              <option value="XXXL">XXXL</option>
            </select>
            {errors.tShirtSize && <p className="text-sm text-red-600 mt-1">{errors.tShirtSize}</p>}
          </div>
          <InputField id="weight" label="Weight (kg)" type="number" />
          <InputField id="height" label="Height (cm)" type="number" />
          <InputField id="kuwaitEntryDate" label="Kuwait Entry Date" type="date" />
        </div>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handlePrevious}
            className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
          >
            <ChevronLeftIcon className="mr-2 h-4 w-4" /> Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
          >
            Next <ChevronRightIcon className="ml-2 h-4 w-4" />
          </button>
        </div>
      </>
    );
  };

  const Step3NewDriverDocuments = ({ formData, handleChange, handlePrevious, handleSubmit, errors }) => {
    const handleFileChange = (e) => {
      const { name, files } = e.target;
      handleChange({ target: { name, value: files[0] } });
    };

    const FileInput = ({ id, label, isRequired = true }) => (
      <div className="flex flex-col items-start p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition duration-150 relative cursor-pointer">
        <input
          type="file"
          id={id}
          name={id}
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          required={isRequired}
        />
        <div className="flex items-center space-x-3">
          <ArrowUpTrayIcon className="h-6 w-6 text-blue-500" />
          <span className="text-sm font-medium text-gray-800">{label}</span>
        </div>
        {formData[id]?.name ? (
          <span className="text-xs text-green-600 mt-2">
            {formData[id].name} uploaded.
          </span>
        ) : (
          <span className="text-xs text-gray-500 mt-1">Upload file</span>
        )}
        {errors[id] && <p className="text-xs text-red-600 mt-1">{errors[id]}</p>}
      </div>
    );

    const fileFields = [
      { id: 'passport', label: 'Passport' },
      { id: 'visa', label: 'Visa' },
      { id: 'policeCer', label: 'Police Clearance Certificate' },
      { id: 'pasPhot', label: 'Passport Photo' },
      { id: 'medicalCer', label: 'Medical Certificate' },
    ];

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fileFields.map(file => (
            <FileInput key={file.id} id={file.id} label={file.label} />
          ))}
        </div>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handlePrevious}
            className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
          >
            <ChevronLeftIcon className="mr-2 h-4 w-4" /> Previous
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
          >
            <CheckCircleIcon className="mr-2 h-4 w-4" /> Submit Application
          </button>
        </div>
      </>
    );
  };

  // --- Main New Driver Form Component ---
  const NewDriverForm = ({ onSubmit }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const totalSteps = 3;

    const steps = [
      { name: 'Personal Details', icon: UserIcon, component: Step1NewDriverPersonal, requiredFields: ['fullName', 'gender', 'dob', 'nationality', 'city', 'company', 'apartmentArea', 'phoneNumber', 'age', 'maritalStatus', 'bloodGroup', 'homeCountryAddress', 'nomineeWife'] },
      { name: 'Vehicle & Other Details', icon: TruckIcon, component: Step2NewDriverVehicle, requiredFields: ['vehicleType', 'vehicleDestination', 'tShirtSize', 'weight', 'height', 'kuwaitEntryDate'] },
      { name: 'Document Uploads', icon: PaperClipIcon, component: Step3NewDriverDocuments, requiredFields: ['passport', 'visa', 'policeCer', 'pasPhot', 'medicalCer'] },
    ];

    const handleChange = useCallback((e) => {
      e.preventDefault();
      const { name, value, type, files, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'file' ? files[0] : (type === 'checkbox' ? checked : value),
      }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    }, [errors]);

    const validateStep = (stepIndex) => {
      let currentErrors = {};
      let isValid = true;
      const requiredFields = steps[stepIndex].requiredFields;

      requiredFields.forEach(field => {
        if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
          currentErrors[field] = 'This field is required';
          isValid = false;
        }
      });

      setErrors(currentErrors);
      return isValid;
    };

    const handleNext = () => {
      if (validateStep(currentStep)) {
        if (currentStep < totalSteps - 1) {
          setCurrentStep(currentStep + 1);
        }
      }
    };

    const handlePrevious = () => {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    };

    const handleSubmit = () => {
      if (validateStep(currentStep)) {
        console.log('New Driver Form Final Submission Data:', formData);
        const dataToSubmit = new FormData();
        Object.keys(formData).forEach(key => {
          dataToSubmit.append(key, formData[key]);
        });
        onSubmit(dataToSubmit);
      }
    };

    const CurrentFormComponent = steps[currentStep].component;

    return (
      <div className="min-h-full">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
          New Driver Application
        </h2>

        <Stepper
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepNames={steps.map(s => s.name)}
          stepIcons={steps.map(s => s.icon)}
        />

        <div className="min-h-[500px]">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
            {steps[currentStep].name}
          </h3>
          <CurrentFormComponent
            formData={formData}
            handleChange={handleChange}
            handleNext={handleNext}
            handlePrevious={handlePrevious}
            handleSubmit={handleSubmit}
            errors={errors}
          />
        </div>
      </div>
    );
  };


  // --- Working Driver Form Sub-Components ---
  const Step1WorkingPersonalInfo = React.memo(({ formData, handleChange, handleNext, errors }) => {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
            <FormInput
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              autoComplete="name"
              className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.fullName && <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
            <FormSelect
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </FormSelect>
            {errors.gender && <p className="text-sm text-red-600 mt-1">{errors.gender}</p>}
          </div>

          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <FormInput
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              autoComplete="bday"
              className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.dob ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.dob && <p className="text-sm text-red-600 mt-1">{errors.dob}</p>}
          </div>

          <div>
            <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">Nationality</label>
            <FormInput
              type="text"
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              autoComplete="country"
              className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.nationality ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.nationality && <p className="text-sm text-red-600 mt-1">{errors.nationality}</p>}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <FormInput
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              autoComplete="tel"
              className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.phoneNumber && <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>}
          </div>

          <div>
            <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">Vehicle Type</label>
            <FormSelect
              id="vehicleType"
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.vehicleType ? 'border-red-500' : 'border-gray-300'}`}
              required
            >
              <option value="">Select Vehicle Type</option>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="van">Van</option>
              <option value="truck">Truck</option>
            </FormSelect>
            {errors.vehicleType && <p className="text-sm text-red-600 mt-1">{errors.vehicleType}</p>}
          </div>

          <div>
            <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700">Vehicle Model</label>
            <FormInput
              type="text"
              id="vehicleModel"
              name="vehicleModel"
              value={formData.vehicleModel}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.vehicleModel ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.vehicleModel && <p className="text-sm text-red-600 mt-1">{errors.vehicleModel}</p>}
          </div>
        </div>
        <div className="flex justify-end mt-8">
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
          >
            Next <ChevronRightIcon className="ml-2 h-4 w-4" />
          </button>
        </div>
      </>
    );
  });

  const Step2WorkingDocuments = React.memo(({ formData, handleChange, handleNext, handlePrevious, errors }) => {
    const handleFileChange = (e) => {
      const { name, files } = e.target;
      handleChange({ target: { name, value: files[0] } });
    };

    const FileInput = ({ id, label, isRequired = true }) => (
      <div className="flex flex-col items-start p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition duration-150 relative cursor-pointer">
        <input
          type="file"
          id={id}
          name={id}
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          required={isRequired}
        />
        <div className="flex items-center space-x-3">
          <ArrowUpTrayIcon className="h-6 w-6 text-blue-500" />
          <span className="text-sm font-medium text-gray-800">{label}</span>
        </div>
        {formData[id]?.name ? (
          <span className="text-xs text-green-600 mt-2">
            {formData[id].name} uploaded.
          </span>
        ) : (
          <span className="text-xs text-gray-500 mt-1">Upload file (PDF, JPG, PNG)</span>
        )}
        {errors[id] && <p className="text-xs text-red-600 mt-1">{errors[id]}</p>}
      </div>
    );

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Employee ID</label>
            <FormInput
              type="text"
              id="employeeId"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.employeeId ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.employeeId && <p className="text-sm text-red-600 mt-1">{errors.employeeId}</p>}
          </div>

          <FileInput id="civilIdDoc" label="Upload Civil ID" />
          <FileInput id="fnbDocs" label="Upload F&B Documents" isRequired={false} />
          <FileInput id="licenseDocs" label="Upload License Documents" />
          <FileInput id="vehicleDocs" label="Upload Vehicle Documents" />
          <FileInput id="photo" label="Upload Photo" />
          <FileInput id="healthCardDoc" label="Upload Health Card" />
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Photos (4 Sides)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FileInput id="vehiclePhotoFront" label="Front" />
            <FileInput id="vehiclePhotoBack" label="Back" />
            <FileInput id="vehiclePhotoLeft" label="Left" />
            <FileInput id="vehiclePhotoRight" label="Right" />
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handlePrevious}
            className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
          >
            <ChevronLeftIcon className="mr-2 h-4 w-4" /> Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
          >
            Next <ChevronRightIcon className="ml-2 h-4 w-4" />
          </button>
        </div>
      </>
    );
  });

  const Step3WorkingExpiryDates = React.memo(({ formData, handleChange, handleNext, handlePrevious, errors }) => {
    const InputGroup = ({ label, id, isDate = false }) => (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
          type={isDate ? 'date' : 'text'}
          id={id}
          name={id}
          value={formData[id] || ''}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors[id] ? 'border-red-500' : 'border-gray-300'}`}
          required
        />
        {errors[id] && <p className="text-sm text-red-600 mt-1">{errors[id]}</p>}
      </div>
    );

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup id="civilIdNumber" label="Civil ID Number" />
          <InputGroup id="civilIdExpiryDate" label="Civil ID Expiry Date" isDate={true} />
          <InputGroup id="licenseNumber" label="License Number" />
          <InputGroup id="licenseExpiryDate" label="License Expiry Date" isDate={true} />
          <InputGroup id="vehicleNumber" label="Vehicle Number" />
          <InputGroup id="vehicleExpiryDate" label="Vehicle Expiry Date" isDate={true} />
          <InputGroup id="healthCardNumber" label="Health Card Number" />
          <InputGroup id="healthCardExpiryDate" label="Health Card Expiry Date" isDate={true} />
        </div>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handlePrevious}
            className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
          >
            <ChevronLeftIcon className="mr-2 h-4 w-4" /> Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
          >
            Next <ChevronRightIcon className="ml-2 h-4 w-4" />
          </button>
        </div>
      </>
    );
  });

  const Step4WorkingEquipment = React.memo(({ formData, handleChange, handlePrevious, handleSubmit, errors }) => {
    const equipmentOptions = [
      'cap', 'bag', 'vest', 'safeties', 'helmet', 'coolJackets', 'waterBottle'
    ];
    const tShirtSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="workingDepartment" className="block text-sm font-medium text-gray-700">Working Department</label>
            <select
              id="workingDepartment"
              name="workingDepartment"
              value={formData.workingDepartment || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.workingDepartment ? 'border-red-500' : 'border-gray-300'}`}
              required
            >
              <option value="">Select Department</option>
              <option value="delivery">Delivery</option>
              <option value="transport">Transport</option>
              <option value="logistics">Logistics</option>
              <option value="maintenance">Maintenance</option>
            </select>
            {errors.workingDepartment && <p className="text-sm text-red-600 mt-1">{errors.workingDepartment}</p>}
          </div>

          <div>
            <label htmlFor="tShirtSize" className="block text-sm font-medium text-gray-700">T-shirt Size</label>
            <select
              id="tShirtSize"
              name="tShirtSize"
              value={formData.tShirtSize || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border p-2 shadow-sm ${errors.tShirtSize ? 'border-red-500' : 'border-gray-300'}`}
              required
            >
              <option value="">Select Size</option>
              {tShirtSizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            {errors.tShirtSize && <p className="text-sm text-red-600 mt-1">{errors.tShirtSize}</p>}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Equipment Provided</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {equipmentOptions.map(option => (
              <div key={option} className="flex items-center p-3 border rounded-lg bg-white shadow-sm">
                <input
                  type="checkbox"
                  id={option}
                  name={option}
                  checked={formData[option] || false}
                  onChange={(e) => handleChange({ target: { name: option, value: e.target.checked } })}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={option} className="ml-3 text-sm font-medium text-gray-700 capitalize">
                  {option.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handlePrevious}
            className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
          >
            <ChevronLeftIcon className="mr-2 h-4 w-4" /> Previous
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
          >
            <CheckCircleIcon className="mr-2 h-4 w-4" /> Complete Form
          </button>
        </div>
      </>
    );
  });

  // --- Main Working Driver Form Component ---
  const WorkingDriverForm = ({ onSubmit }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const totalSteps = 4;

    const steps = [
      { name: 'Personal & Vehicle Basics', icon: UserIcon, component: Step1WorkingPersonalInfo, requiredFields: ['fullName', 'gender', 'dob', 'nationality', 'phoneNumber', 'vehicleType', 'vehicleModel'] },
      { name: 'Identification & Documents', icon: ClipboardDocumentCheckIcon, component: Step2WorkingDocuments, requiredFields: ['employeeId', 'civilIdDoc', 'licenseDocs', 'vehicleDocs', 'photo', 'healthCardDoc', 'vehiclePhotoFront', 'vehiclePhotoBack', 'vehiclePhotoLeft', 'vehiclePhotoRight'] },
      { name: 'Expiry Dates & Numbers', icon: CalendarDaysIcon, component: Step3WorkingExpiryDates, requiredFields: ['civilIdNumber', 'civilIdExpiryDate', 'licenseNumber', 'licenseExpiryDate', 'vehicleNumber', 'vehicleExpiryDate', 'healthCardNumber', 'healthCardExpiryDate'] },
      { name: 'Uniform & Equipment', icon: BriefcaseIcon, component: Step4WorkingEquipment, requiredFields: ['workingDepartment', 'tShirtSize'] },
    ];

    const handleChange = useCallback((e) => {
      const { name, value, type, checked, files } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'file' ? files[0] : value),
      }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    }, [errors]);

    const validateStep = (stepIndex) => {
      let currentErrors = {};
      let isValid = true;
      const requiredFields = steps[stepIndex].requiredFields;

      requiredFields.forEach(field => {
        // For file inputs, check if a file object exists
        if (field.includes('Doc') || field.includes('Photo')) {
          if (!formData[field] || !(formData[field] instanceof File)) {
            currentErrors[field] = 'This file is required';
            isValid = false;
          }
        } else {
          // For text/select inputs
          if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
            currentErrors[field] = 'This field is required';
            isValid = false;
          }
        }
      });

      setErrors(currentErrors);
      return isValid;
    };

    const handleNext = () => {
      if (validateStep(currentStep)) {
        if (currentStep < totalSteps - 1) {
          setCurrentStep(currentStep + 1);
        }
      }
    };

    const handlePrevious = () => {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    };

    const handleSubmit = () => {
      if (validateStep(currentStep)) {
        console.log('Working Driver Form Final Submission Data:', formData);
        onSubmit(formData);
      }
    };

    const CurrentFormComponent = steps[currentStep].component;

    return (
      <div className="min-h-full">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
              Working Driver Details Form
          </h2>

          <Stepper
            currentStep={currentStep}
            totalSteps={totalSteps}
            stepNames={steps.map(s => s.name)}
            stepIcons={steps.map(s => s.icon)}
          />

          <div className="min-h-[500px]">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
              {steps[currentStep].name}
            </h3>
            <CurrentFormComponent
              formData={formData}
              handleChange={handleChange}
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              handleSubmit={handleSubmit}
              errors={errors}
            />
          </div>
        </div>
    );
  };


  // --- Main App Component (DriverManagement) ---
  function App() {
    const [activeTab, setActiveTab] = useState('newApplications');
    const [showFormModal, setShowFormModal] = useState(false); // Single modal for both forms
    const [activeFormTypeInModal, setActiveFormTypeInModal] = useState('newApplication'); // 'newApplication' or 'workingDriver'
    const [newDriverApplications, setNewDriverApplications] = useState([]);
    const [workingDrivers, setWorkingDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');

    useEffect(() => {
      fetchData();
    }, []);

    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setNewDriverApplications(initialNewDriverApplications);
      setWorkingDrivers(initialWorkingDrivers);
      setLoading(false);
    };

    const showSnackbar = (message, severity = 'success') => {
      setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
      setSnackbar({ ...snackbar, open: false });
    };

    const handleNewDriverSubmit = async (formData) => {
      console.log('New Driver Form Submitted:', Object.fromEntries(formData));
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newApplication = {
        id: `app${Date.now()}`,
        full_name: formData.get('fullName'),
        company_name: formData.get('company'),
        vehicle_type: formData.get('vehicleType'),
        nationality: formData.get('nationality'),
        phone_number: formData.get('phoneNumber'),
        status: 'pending',
        status_display: 'Pending',
        application_date: new Date().toISOString(),
      };
      setNewDriverApplications(prev => [...prev, newApplication]);
      setShowFormModal(false);
      setLoading(false);
      showSnackbar('New driver application submitted successfully!', 'success');
    };

    const handleWorkingDriverSubmit = async (formData) => {
      console.log('Working Driver Form Submitted:', formData);
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newWorkingDriver = {
        id: `driver${Date.now()}`,
        employee_id: formData.employeeId || `EMP${Date.now().toString().slice(-4)}`,
        full_name: formData.fullName,
        working_department: formData.workingDepartment,
        working_department_display: formData.workingDepartment ? formData.workingDepartment.charAt(0).toUpperCase() + formData.workingDepartment.slice(1) : '',
        vehicle_type: formData.vehicleType,
        vehicle_model: formData.vehicleModel,
        phone_number: formData.phoneNumber,
        employment_status: 'active',
        employment_status_display: 'Active',
        joining_date: new Date().toISOString().split('T')[0],
        rating: 0,
      };
      setWorkingDrivers(prev => [...prev, newWorkingDriver]);
      setShowFormModal(false);
      setLoading(false);
      showSnackbar('Working driver details updated successfully!', 'success');
    };

    const handleApproveApplication = async (applicationId) => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setNewDriverApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: 'approved', status_display: 'Approved' } : app
        )
      );
      setLoading(false);
      showSnackbar('Application approved successfully!', 'success');
    };

    const handleRejectApplication = async (applicationId) => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setNewDriverApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: 'rejected', status_display: 'Rejected' } : app
        )
      );
      setLoading(false);
      showSnackbar('Application rejected.', 'info');
    };

    const getStatusClasses = (status) => {
      switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'approved': return 'bg-green-100 text-green-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        case 'under_review': return 'bg-blue-100 text-blue-800';
        case 'active': return 'bg-green-100 text-green-800';
        case 'suspended': return 'bg-red-100 text-red-800';
        case 'inactive': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const filteredNewApplications = newDriverApplications.filter(app => {
      const matchesSearch = app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            app.phone_number.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const filteredWorkingDrivers = workingDrivers.filter(driver => {
      const matchesSearch = driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            driver.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            driver.phone_number.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || driver.employment_status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || driver.working_department === departmentFilter;
      return matchesSearch && matchesStatus && matchesDepartment;
    });

    const handleOpenFormModal = (formType) => {
      setActiveFormTypeInModal(formType);
      setShowFormModal(true);
    };

    const handleModalClose = () => {
      setShowFormModal(false);
      setActiveFormTypeInModal('newApplication'); // Reset to default when closing
    };

    return (
      <>
        {/* Tailwind CSS Directives - This is usually in index.css */}
        <style>
          {`
          @import "tailwindcss/preflight";
          @tailwind utilities;
          @tailwind utilities;

          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #555;
          }

          @keyframes linear-progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          .animate-linear-progress {
            animation: linear-progress 1.5s infinite linear;
          }
          `}
        </style>

        <div className="min-h-screen bg-gray-100 p-8 font-sans">
          {/* Header */}
          <header className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                  🚗 Driver Management System
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage driver applications and working drivers efficiently
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-150 disabled:opacity-50"
                  title="Refresh Data"
                >
                  <ArrowPathIcon className="h-6 w-6" />
                </button>
                <button
                  className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-150"
                  title="Export Data"
                >
                  <ArrowDownTrayIcon className="h-6 w-6" />
                </button>
                <button
                  onClick={() => handleOpenFormModal('newApplication')}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-150 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <PlusIcon className="h-5 w-5 mr-2" /> Add New Driver
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="col-span-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search drivers by name, ID, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                {activeTab === 'workingDrivers' && (
                  <div>
                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="all">All Departments</option>
                      <option value="delivery">Delivery</option>
                      <option value="transport">Transport</option>
                      <option value="logistics">Logistics</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card 1: New Applications */}
            <div className="p-6 rounded-xl shadow-lg border border-gray-200 bg-gradient-to-br from-indigo-500 to-purple-600 text-white transform transition duration-300 hover:scale-[1.02] hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold mb-1">{newDriverApplications.length}</p>
                  <p className="text-sm opacity-90">New Applications</p>
                  <div className="flex items-center text-xs mt-2 opacity-80">
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                    <span>+12% this month</span>
                  </div>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <UserIcon className="h-8 w-8" />
                </div>
              </div>
            </div>

            {/* Card 2: Working Drivers */}
            <div className="p-6 rounded-xl shadow-lg border border-gray-200 bg-gradient-to-br from-pink-500 to-red-600 text-white transform transition duration-300 hover:scale-[1.02] hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold mb-1">{workingDrivers.length}</p>
                  <p className="text-sm opacity-90">Working Drivers</p>
                  <div className="flex items-center text-xs mt-2 opacity-80">
                    <UsersIcon className="h-4 w-4 mr-1" />
                    <span>Total workforce</span>
                  </div>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <BriefcaseIcon className="h-8 w-8" />
                </div>
              </div>
            </div>

            {/* Card 3: Pending Review */}
            <div className="p-6 rounded-xl shadow-lg border border-gray-200 bg-gradient-to-br from-sky-500 to-cyan-600 text-white transform transition duration-300 hover:scale-[1.02] hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold mb-1">
                    {newDriverApplications.filter(app => app.status === 'pending').length}
                  </p>
                  <p className="text-sm opacity-90">Pending Review</p>
                  <div className="flex items-center text-xs mt-2 opacity-80">
                    <RectangleStackIcon className="h-4 w-4 mr-1" />
                    <span>Needs attention</span>
                  </div>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <ClipboardDocumentCheckIcon className="h-8 w-8" />
                </div>
              </div>
            </div>

            {/* Card 4: Active Drivers */}
            <div className="p-6 rounded-xl shadow-lg border border-gray-200 bg-gradient-to-br from-emerald-500 to-green-600 text-white transform transition duration-300 hover:scale-[1.02] hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold mb-1">
                    {workingDrivers.filter(driver => driver.employment_status === 'active').length}
                  </p>
                  <p className="text-sm opacity-90">Active Drivers</p>
                  <div className="flex items-center text-xs mt-2 opacity-80">
                    <ShieldCheckIcon className="h-4 w-4 mr-1" />
                    <span>Currently working</span>
                  </div>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <TruckIcon className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Loading Progress Bar */}
          {loading && (
            <div className="w-full h-1 bg-blue-200 overflow-hidden rounded-full mb-4">
              <div className="h-full bg-blue-500 w-1/4 animate-linear-progress origin-left"></div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('newApplications')}
                className={`flex-1 py-4 px-6 text-center text-lg font-semibold transition-colors duration-200 ease-in-out
                  ${activeTab === 'newApplications' ? 'text-blue-700 border-b-4 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              >
                <span className="flex items-center justify-center space-x-2">
                  <UserIcon className="h-5 w-5" />
                  <span>New Driver Applications</span>
                  {newDriverApplications.filter(app => app.status === 'pending').length > 0 && (
                    <span className="ml-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                      {newDriverApplications.filter(app => app.status === 'pending').length}
                    </span>
                  )}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('workingDrivers')}
                className={`flex-1 py-4 px-6 text-center text-lg font-semibold transition-colors duration-200 ease-in-out
                  ${activeTab === 'workingDrivers' ? 'text-blue-700 border-b-4 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              >
                <span className="flex items-center justify-center space-x-2">
                  <BriefcaseIcon className="h-5 w-5" />
                  <span>Working Drivers</span>
                  {workingDrivers.filter(driver => driver.employment_status === 'active').length > 0 && (
                    <span className="ml-2 px-2 py-1 bg-green-400 text-green-900 text-xs font-bold rounded-full">
                      {workingDrivers.filter(driver => driver.employment_status === 'active').length}
                    </span>
                  )}
                </span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'newApplications' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application #</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nationality</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredNewApplications.length > 0 ? (
                        filteredNewApplications.map((application) => (
                          <tr key={application.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{application.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{application.full_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{application.company_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {application.vehicle_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{application.nationality}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{application.phone_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(application.status)}`}>
                                {application.status_display}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {new Date(application.application_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 p-1" title="View Details">
                                <EyeIcon className="h-5 w-5" />
                              </button>
                              {application.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveApplication(application.id)}
                                    className="text-green-600 hover:text-green-900 p-1 ml-2"
                                    title="Approve"
                                  >
                                    <CheckCircleIcon className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectApplication(application.id)}
                                    className="text-red-600 hover:text-red-900 p-1 ml-2"
                                    title="Reject"
                                  >
                                    <XCircleIcon className="h-5 w-5" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="px-6 py-4 text-center text-gray-500">No new driver applications found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'workingDrivers' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Model</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredWorkingDrivers.length > 0 ? (
                        filteredWorkingDrivers.map((driver) => (
                          <tr key={driver.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{driver.employee_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.full_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{driver.working_department_display}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {driver.vehicle_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{driver.vehicle_model}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{driver.phone_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(driver.employment_status)}`}>
                                {driver.employment_status_display}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {new Date(driver.joining_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{driver.rating}/5.0</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 p-1" title="View Details">
                                <EyeIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => {
                                    // const driverToEdit = workingDrivers.find(d => d.id === driver.id);
                                    // if (driverToEdit) {
                                    //     setEditingDriver(driverToEdit); // Pass data for editing
                                    //     setShowWorkingDriverModal(true);
                                    // }
                                    showSnackbar("Edit functionality not implemented for this demo.", "info");
                                }}
                                className="text-indigo-600 hover:text-indigo-900 p-1 ml-2"
                                title="Edit"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" className="px-6 py-4 text-center text-gray-500">No working drivers found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Main Form Modal (for both New Driver and Working Driver) */}
          <Modal
            isOpen={showFormModal}
            onClose={handleModalClose}
            maxWidth="max-w-5xl" // Adjust max-width as needed for larger forms
          >
            <div className="flex justify-center mb-6 border-b border-gray-200 pb-4">
              <button
                onClick={() => setActiveFormTypeInModal('newApplication')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                  activeFormTypeInModal === 'newApplication'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                New Driver Application
              </button>
              <button
                onClick={() => setActiveFormTypeInModal('workingDriver')}
                className={`ml-4 px-6 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                  activeFormTypeInModal === 'workingDriver'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Working Driver
              </button>
            </div>

            {activeFormTypeInModal === 'newApplication' && (
              <NewDriverForm
                onClose={handleModalClose}
                onSubmit={handleNewDriverSubmit}
              />
            )}

            {activeFormTypeInModal === 'workingDriver' && (
              <WorkingDriverForm
                onClose={handleModalClose}
                onSubmit={handleWorkingDriverSubmit}
              />
            )}
          </Modal>

          {/* Snackbar Notification */}
          <Snackbar
            message={snackbar.message}
            severity={snackbar.severity}
            open={snackbar.open}
            onClose={handleCloseSnackbar}
          />
        </div>
      </>
    );
  }

  export default App;