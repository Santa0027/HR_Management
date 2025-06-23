import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Upload } from 'lucide-react';

const AddDriverForm = () => {
  const [mode, setMode] = useState('partial');
  const [activeTab, setActiveTab] = useState('info');
  const [vehicles, setVehicles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
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
      iqama_document: null, iqama_expiry: '',
      passport_document: null, passport_expiry: '',
      license_document: null, license_expiry: '',
      visa_document: null, visa_expiry: '',
      medical_document: null, medical_expiry: '',
      insurance_document: null, insurance_expiry: '',
      accommodation_document: null, accommodation_expiry: '',
      phone_bill_document: null, phone_bill_expiry: ''
    },
    insurance_paid_by: '',
    accommodation_paid_by: '',
    phone_bill_paid_by: ''
  });

  const PAID_BY_OPTIONS = [
    { value: '', label: 'Select' },
    { value: 'own', label: 'Own' },
    { value: 'company', label: 'Company' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesRes, companiesRes] = await Promise.all([
          axios.get('http://localhost:8000/vehicles/'),
          axios.get('http://localhost:8000/company/')
        ]);
        setVehicles(vehiclesRes.data);
        setCompanies(companiesRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    if (name === 'vehicleType' || name === 'company') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value ? parseInt(value, 10) : '' 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value 
      }));
    }
  }, []);

  const handleFileChange = useCallback((e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      documents: { 
        ...prev.documents, 
        [name]: files[0] || null 
      }
    }));
  }, []);

  const handleDocumentExpiryChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      documents: { 
        ...prev.documents, 
        [name]: value 
      }
    }));
  }, []);

  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      throw new Error('No refresh token available');
    }
    
    try {
      const res = await axios.post('http://localhost:8000/api/token/refresh/', { refresh });
      localStorage.setItem('access_token', res.data.access);
      return res.data.access;
    } catch (err) {
      console.error("Token refresh failed:", err);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      throw err;
    }
  };

  const submitDriver = async (data) => {
    let token = localStorage.getItem('access_token');
    
    try {
      const res = await axios.post('http://localhost:8000/Register/drivers/', data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return res;
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          token = await refreshToken();
          return axios.post('http://localhost:8000/Register/drivers/', data, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
        } catch (refreshErr) {
          throw refreshErr;
        }
      }
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();

      // Define which fields to include based on mode
      const basicFields = ['driver_name', 'iqama', 'mobile', 'city', 'gender'];
      const fullFields = [
        'driver_name', 'gender', 'iqama', 'mobile', 'city',
        'nationality', 'dob', 'vehicleType', 'company',
        'insurance_paid_by', 'accommodation_paid_by', 'phone_bill_paid_by'
      ];

      const fieldsToInclude = mode === 'full' ? fullFields : basicFields;

      // Append basic form fields
      fieldsToInclude.forEach(key => {
        const value = formData[key];
        if (value !== null && value !== undefined && value !== '') {
          data.append(key, value);
        }
      });

      // Append document files and expiry dates (only in full mode)
      if (mode === 'full') {
        Object.entries(formData.documents).forEach(([docKey, docValue]) => {
          if (docValue instanceof File) {
            data.append(docKey, docValue);
          } else if (docKey.endsWith('_expiry') && docValue) {
            data.append(docKey, docValue);
          }
        });
      }

      // Debug: Log what's being sent
      console.log('Submitting data:');
      for (let [key, value] of data.entries()) {
        console.log(key, value);
      }

      await submitDriver(data);
      alert('Driver added successfully!');
      
      // Reset form
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
          iqama_document: null, iqama_expiry: '',
          passport_document: null, passport_expiry: '',
          license_document: null, license_expiry: '',
          visa_document: null, visa_expiry: '',
          medical_document: null, medical_expiry: '',
          insurance_document: null, insurance_expiry: '',
          accommodation_document: null, accommodation_expiry: '',
          phone_bill_document: null, phone_bill_expiry: ''
        },
        insurance_paid_by: '',
        accommodation_paid_by: '',
        phone_bill_paid_by: ''
      });
      setActiveTab('info');
      
    } catch (err) {
      console.error("Submission failed:", err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          err.message || 
                          'An unknown error occurred.';
      alert('Submission failed: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileName = (file) => file?.name || 'No file chosen';

  const InputField = ({ label, required = false, ...props }) => (
    <div>
      <label className="block text-sm mb-1 text-white">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input 
        className="w-full p-2 border rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-700" 
        {...props} 
      />
    </div>
  );

  const SelectField = ({ label, options, required = false, ...props }) => (
    <div>
      <label className="block text-sm mb-1 text-white">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select 
        className="w-full p-2 border rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-700" 
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );

  const FileUploadField = ({ label, name, file, expiryKey, expiryValue, onExpiryChange }) => (
    <div className="space-y-2">
      <label className="block text-sm mb-1 text-white">{label} Document:</label>
      <div className="flex border border-gray-700 rounded overflow-hidden">
        <input 
          type="text" 
          readOnly 
          value={getFileName(file)} 
          className="flex-1 bg-gray-800 p-2 text-white" 
        />
        <label 
          htmlFor={name} 
          className="cursor-pointer bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 flex items-center"
        >
          <Upload size={18} />
        </label>
        <input 
          type="file" 
          name={name} 
          id={name} 
          onChange={handleFileChange} 
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
      </div>
      {file && (
        <p className="text-xs text-gray-400">Selected: {file.name}</p>
      )}
      <label className="block text-sm mt-2 mb-1 text-white">{label} Expiry:</label>
      <input
        type="date"
        name={expiryKey}
        value={expiryValue}
        onChange={onExpiryChange}
        className="w-full p-2 border rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
      />
    </div>
  );

  const infoHints = mode === 'full'
    ? 'You can fill all sections including documents and assignments.'
    : 'Only essential fields are required in partial mode.';

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-800 rounded-lg shadow-lg space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Add New Driver</h2>
        <div className="flex items-center space-x-2">
          <label className="text-white">Mode:</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="bg-gray-700 border border-gray-600 p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
          >
            <option value="partial">Partial Details</option>
            <option value="full">Full Details</option>
          </select>
        </div>
      </header>

      <p className="text-sm text-gray-400">{infoHints}</p>

      <div className="flex space-x-4 border-b border-gray-700">
        <button
          type="button"
          className={`px-4 py-2 rounded-t ${
            activeTab === 'info' 
              ? 'bg-blue-700 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => setActiveTab('info')}
        >
          Driver Info
        </button>
        {mode === 'full' && (
          <button
            type="button"
            className={`px-4 py-2 rounded-t ${
              activeTab === 'documents' 
                ? 'bg-blue-700 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab('documents')}
          >
            Documents & Assignment
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField 
              label="Driver Name" 
              name="driver_name" 
              value={formData.driver_name} 
              onChange={handleChange} 
              placeholder="Enter name" 
              required 
            />
            <InputField 
              label="Iqama Number" 
              name="iqama" 
              value={formData.iqama} 
              onChange={handleChange} 
              placeholder="Enter Iqama" 
              required 
            />
            <InputField 
              label="Mobile" 
              name="mobile" 
              value={formData.mobile} 
              onChange={handleChange} 
              placeholder="Enter Mobile" 
              required 
            />
            <InputField 
              label="City" 
              name="city" 
              value={formData.city} 
              onChange={handleChange} 
              placeholder="Enter City" 
              required 
            />
            <SelectField 
              label="Gender" 
              name="gender" 
              value={formData.gender} 
              onChange={handleChange} 
              required
              options={[
                { value: '', label: 'Select Gender' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' }
              ]} 
            />
            {mode === 'full' && (
              <>
                <InputField 
                  label="Nationality" 
                  name="nationality" 
                  value={formData.nationality} 
                  onChange={handleChange} 
                  placeholder="Enter Nationality" 
                />
                <InputField 
                  label="Date of Birth" 
                  type="date" 
                  name="dob" 
                  value={formData.dob} 
                  onChange={handleChange} 
                />
              </>
            )}
          </div>
        )}

        {mode === 'full' && activeTab === 'documents' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
              Mandatory Documents
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {['iqama', 'passport', 'license', 'visa', 'medical'].map(doc => (
                <FileUploadField
                  key={doc}
                  label={doc.charAt(0).toUpperCase() + doc.slice(1)}
                  name={`${doc}_document`}
                  file={formData.documents[`${doc}_document`]}
                  expiryKey={`${doc}_expiry`}
                  expiryValue={formData.documents[`${doc}_expiry`]}
                  onExpiryChange={handleDocumentExpiryChange}
                />
              ))}
            </div>

            <h3 className="text-xl font-semibold text-white border-b border-gray-700 pb-2 mt-8">
              Expenses & Bills
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectField
                label="Insurance Paid By"
                name="insurance_paid_by"
                value={formData.insurance_paid_by}
                onChange={handleChange}
                options={PAID_BY_OPTIONS}
              />
              <SelectField
                label="Accommodation Paid By"
                name="accommodation_paid_by"
                value={formData.accommodation_paid_by}
                onChange={handleChange}
                options={PAID_BY_OPTIONS}
              />
              <SelectField
                label="Phone Bill Paid By"
                name="phone_bill_paid_by"
                value={formData.phone_bill_paid_by}
                onChange={handleChange}
                options={PAID_BY_OPTIONS}
              />
            </div>

            <h3 className="text-xl font-semibold text-white border-b border-gray-700 pb-2 mt-8">
              Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Assign Vehicle"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Select Vehicle' },
                  ...vehicles.map(v => ({
                    value: v.id,
                    label: `${v.vehicle_name} (${v.vehicle_number})`
                  }))
                ]}
              />
              <SelectField
                label="Assign Company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Select Company' },
                  ...companies.map(c => ({ 
                    value: c.id, 
                    label: c.company_name 
                  }))
                ]}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-gray-700">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Driver'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDriverForm;