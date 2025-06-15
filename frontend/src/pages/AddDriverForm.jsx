import React, { useState, useEffect, useCallback, memo } from 'react'; // Added memo and useCallback
import axios from 'axios';
import { ChevronDown, CircleUserRound, Upload } from 'lucide-react'; // Added Upload icon

const AddDriverForm = () => {
  const [activeTab, setActiveTab] = useState('info'); // State to control active tab
  const [vehicles, setVehicles] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [value, setValue] = useState("");

  const [formData, setFormData] = useState({
    driver_name: '',
    gender: '',
    iqama: '',
    mobile: '',
    city: '',
    nationality: '',
    dob: '',
    vehicleType: '', // This should be vehicle_id if linking to backend vehicle ID
    company: '',     // This should be company_id if linking to backend company ID
    documents: {
      iqama_document: null,
      iqama_expiry: '',
      passport_document: null,
      passport_expiry: '',
      license_document: null,
      license_expiry: '',
      visa_document: null,
      visa_expiry: '',
      medical_document: null,
      medical_expiry: '',
    },
  });

  useEffect(() => {
    fetch('http://localhost:8000/vehicles/')
      .then(res => res.json())
      .then(data => setVehicles(data))
      .catch(err => console.error('Vehicle error:', err));

    fetch('http://localhost:8000/company/')
      .then(res => res.json())
      .then(data => setCompanies(data))
      .catch(err => console.error('Company error:', err));
  }, []);

  // Memoized change handlers to prevent unnecessary re-renders of child components
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [name]: files[0]
      }
    }));
  }, []);

  const handleDateChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [name]: value
      }
    }));
  }, []);

  const refreshAccessToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    const res = await fetch('http://localhost:8000/api/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    return data.access;
  };

  const submitDriver = async (token, data) => {
    const response = await fetch('http://localhost:8000/Register/drivers/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    });

    return response;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'documents') {
        Object.entries(value).forEach(([docKey, docValue]) => {
          if (docValue) data.append(docKey, docValue);
        });
      } else {
        data.append(key, value);
      }
    });

    let token = localStorage.getItem('access_token');

    try {
      let res = await submitDriver(token, data);

      if (res.status === 401) {
        // Token might be expired
        token = await refreshAccessToken();
        res = await submitDriver(token, data);
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(JSON.stringify(errData));
      }

      const result = await res.json();
      alert('Driver added successfully!');
      console.log(result);
      // Optionally reset form after successful submission
      setFormData({
        driver_name: '',
        gender: '',
        iqama: '',
        mobile: '',
        city: '',
        nationality: '',
        dob: '',
        vehicleType: '',
        company: '',
        documents: {
          iqama_document: null,
          iqama_expiry: '',
          passport_document: null,
          passport_expiry: '',
          license_document: null,
          license_expiry: '',
          visa_document: null,
          visa_expiry: '',
          medical_document: null,
          medical_expiry: '',
        },
      });
      setActiveTab('info'); // Go back to first tab
    } catch (err) {
      console.error('Error submitting driver:', err);
      alert('Failed to submit driver. Please log in again or check your data.' + err.message);
    }
  };

  // Helper to get file name for display
  const getFileName = (file) => {
    return file ? file.name : 'No file chosen';
  };

  // Memoized InputField component
  const InputField = memo(({ label, type = "text", name, value, onChange, placeholder }) => (
    <div>
      <label htmlFor={name} className="block text-sm mb-1 text-white">{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-2 border rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
        autoComplete="off"
      />
    </div>
  ));

  // Memoized SelectField component
  const SelectField = memo(({ label, name, value, onChange, options }) => (
    <div>
      <label htmlFor={name} className="block text-sm mb-1 text-white">{label}</label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  ));

  // FileUploadField does not need to be memoized itself, as it's not a standalone component that receives props from a list.
  // Its internal InputField is already memoized.
  const FileUploadField = ({ label, name, file, onFileChange, expiryKey, expiryValue, onExpiryChange }) => (
    <div>
      <label className="block text-sm mb-1 text-white">{label} Document:</label>
      <div className="relative flex items-stretch border border-gray-700 rounded-md overflow-hidden">
        <input
          type="text"
          readOnly
          value={getFileName(file)}
          className="flex-1 bg-gray-800 py-2 px-3 text-white focus:outline-none"
        />
        <label htmlFor={name} className="cursor-pointer bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 flex items-center h-full">
          <Upload size={18} className="mr-2" /> Upload
        </label>
        <input
          type="file"
          name={name}
          id={name}
          onChange={onFileChange}
          className="hidden"
        />
      </div>
      <label className="block text-sm mb-1 mt-2 text-white">{label} Expiry:</label>
      <InputField // This InputField is already memoized
        type="date"
        name={expiryKey}
        value={expiryValue}
        onChange={onExpiryChange}
        // Tailwind classes are passed via className prop in InputField, not directly here.
      />
    </div>
  );

  const infoTabContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField label="Driver Name" name="driver_name" value={formData.driver_name} onChange={handleChange} placeholder="Enter driver's full name" />
      <InputField label="Iqama Number" name="iqama" value={formData.iqama} onChange={handleChange} placeholder="Enter Iqama number" />
      <InputField label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Enter mobile number" />
      <InputField label="City" name="city" value={formData.city} onChange={handleChange} placeholder="Enter city" />
      <SelectField
        label="Gender"
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        options={[
          { value: '', label: 'Select Gender' },
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' },
        ]}
      />
      <InputField label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} placeholder="Enter nationality" />
      <InputField label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleChange} />
    </div>
  );

  const documentsTabContent = (
    <div className="space-y-6">
      <FileUploadField
        label="Iqama"
        name="iqama_document"
        file={formData.documents.iqama_document}
        onFileChange={handleFileChange}
        expiryKey="iqama_expiry"
        expiryValue={formData.documents.iqama_expiry}
        onExpiryChange={handleDateChange}
      />
      <FileUploadField
        label="Passport"
        name="passport_document"
        file={formData.documents.passport_document}
        onFileChange={handleFileChange}
        expiryKey="passport_expiry"
        expiryValue={formData.documents.passport_expiry}
        onExpiryChange={handleDateChange}
      />
      <FileUploadField
        label="License"
        name="license_document"
        file={formData.documents.license_document}
        onFileChange={handleFileChange}
        expiryKey="license_expiry"
        expiryValue={formData.documents.license_expiry}
        onExpiryChange={handleDateChange}
      />
      <FileUploadField
        label="Visa"
        name="visa_document"
        file={formData.documents.visa_document}
        onFileChange={handleFileChange}
        expiryKey="visa_expiry"
        expiryValue={formData.documents.visa_expiry}
        onExpiryChange={handleDateChange}
      />
      <FileUploadField
        label="Medical"
        name="medical_document"
        file={formData.documents.medical_document}
        onFileChange={handleFileChange}
        expiryKey="medical_expiry"
        expiryValue={formData.documents.medical_expiry}
        onExpiryChange={handleDateChange}
      />

      <SelectField
        label="Assign Vehicle"
        name="vehicleType"
        value={formData.vehicleType}
        onChange={handleChange}
        options={[
          { value: '', label: 'Select Vehicle' },
          ...vehicles.map(v => ({ value: v.id, label: `${v.vehicle_name} (${v.vehicle_number})` }))
        ]}
      />
      <SelectField
        label="Assign Company"
        name="company"
        value={formData.company}
        onChange={handleChange}
        options={[
          { value: '', label: 'Select Company' },
          ...companies.map(c => ({ value: c.id, label: c.company_name }))
        ]}
      />
    </div>
  );

  const reviewTabContent = (
    <div className="space-y-3 text-sm text-white">
      <h3 className="text-lg font-semibold mb-2 text-white">Review Driver Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
        {Object.entries(formData).map(([key, value]) => {
          if (key !== 'documents' && value !== '') {
            return (
              <p key={key}>
                <strong className="text-gray-300 capitalize">{key.replace(/_/g, ' ')}:</strong> {value}
              </p>
            );
          }
          return null;
        })}
      </div>
      <h4 className="text-lg font-semibold mt-6 mb-2 text-white">Documents & Assignment</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
        {Object.entries(formData.documents).map(([key, value]) => {
          if (value !== null && value !== '') {
            const displayValue = key.includes('_document') ? (value?.name || 'Uploaded') : value;
            return (
              <p key={key}>
                <strong className="text-gray-300 capitalize">{key.replace(/_/g, ' ')}:</strong> {displayValue}
              </p>
            );
          }
          return null;
        })}
      </div>
    </div>
  );

  // Define the order of tabs for progress bar and navigation
  const tabs = ['info', 'documents', 'review'];
  const currentStepIndex = tabs.indexOf(activeTab) + 1;
  const totalSteps = tabs.length;


  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-8"> {/* Main container with black background, white text */}
      {/* Header Component */}
      <header className="flex justify-between items-center pb-6 border-b border-gray-700 mb-8">
        <div className="text-sm text-gray-400">Organization / Registration Management / Add Driver</div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-3 py-1 bg-gray-900 rounded-full text-sm hover:bg-gray-800 text-white transition-colors">
            English <ChevronDown size={16} className="ml-1" />
          </button>
          <CircleUserRound size={24} className="text-green-400" />
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center">
        <div className="bg-gray-900 p-6 rounded-lg w-full max-w-4xl shadow-lg"> {/* Form container background */}
          <h2 className="text-2xl font-bold mb-4">Add New Driver</h2>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-700 mb-6 rounded-full overflow-hidden">
            <div className="h-full bg-blue-700 rounded-full" style={{ width: `${(currentStepIndex / totalSteps) * 100}%` }} />
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6 border-b border-gray-700">
            <button
              type="button"
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'info' ? 'bg-blue-700 text-white' : 'bg-gray-700 text-white'}`}
              onClick={() => setActiveTab('info')}
            >
              Driver Info
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'documents' ? 'bg-blue-700' : 'bg-gray-700'}`}
              onClick={() => setActiveTab('documents')}
            >
              Documents & Assignment
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'review' ? 'bg-blue-700' : 'bg-gray-700'}`}
              onClick={() => setActiveTab('review')}
            >
              Review
            </button>
          </div>
          <form onSubmit={handleSubmit}>


            {/* Conditionally display tab content using hidden/block classes */}
            <div className={activeTab === 'info' ? 'block' : 'hidden'}>{infoTabContent}</div>
            <div className={activeTab === 'documents' ? 'block' : 'hidden'}>{documentsTabContent}</div>
            <div className={activeTab === 'review' ? 'block' : 'hidden'}>{reviewTabContent}</div>


            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              {currentStepIndex > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveTab(tabs[currentStepIndex - 2])} // Go to previous tab
                  className="bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 text-white font-medium transition-colors"
                >
                  Back
                </button>
              )}
              {currentStepIndex < totalSteps && (
                <button
                  type="button"
                  onClick={() => setActiveTab(tabs[currentStepIndex])} // Go to next tab
                  className="bg-blue-700 px-4 py-2 rounded-lg hover:bg-blue-800 text-white font-medium transition-colors ml-auto"
                >
                  Next
                </button>
              )}
              {currentStepIndex === totalSteps && (
                <button
                  type="submit"
                  className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 text-white font-medium transition-colors ml-auto"
                >
                  Submit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDriverForm;
