import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Upload } from 'lucide-react';

const AddDriverForm = () => {
  const [mode, setMode] = useState('partial');
  const [activeTab, setActiveTab] = useState('info');
  const [vehicles, setVehicles] = useState([]);
  const [companies, setCompanies] = useState([]);

  // --- UPDATED formData STATE ---
  const [formData, setFormData] = useState({
    driver_name: '', gender: '', iqama: '', mobile: '', city: '',
    nationality: '', dob: '', vehicleType: '', company: '',
    documents: {
      iqama_document: null, iqama_expiry: '',
      passport_document: null, passport_expiry: '',
      license_document: null, license_expiry: '',
      visa_document: null, visa_expiry: '',
      medical_document: null, medical_expiry: '',
      // --- NEW DOCUMENT FIELDS ---
      insurance_document: null, insurance_expiry: '',
      accommodation_document: null, accommodation_expiry: '',
      phone_bill_document: null, phone_bill_expiry: ''
    },
    // --- NEW PAID_BY FIELDS ---
    insurance_paid_by: '',
    accommodation_paid_by: '',
    phone_bill_paid_by: ''
  });

  const PAID_BY_OPTIONS = [
    { value: '', label: 'Select' }, // Default empty option
    { value: 'own', label: 'Own' },
    { value: 'company', label: 'Company' }
  ];

  useEffect(() => {
    // Correct API endpoints for vehicles and companies
    // Assuming your Django app serves these at these paths
    axios.get('http://localhost:8000/vehicles/').then(res => setVehicles(res.data)).catch(err => console.error("Error fetching vehicles:", err));
    axios.get('http://localhost:8000/company/').then(res => setCompanies(res.data)).catch(err => console.error("Error fetching companies:", err));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    // Special handling for foreign keys if they need to be numbers
    // Assuming Django expects integer IDs for vehicleType and company
    if (name === 'vehicleType' || name === 'company') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value, 10) : '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleFileChange = useCallback((e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [name]: files[0] }
    }));
  }, []);

  // Updated handleDateChange to handle new expiry fields for insurance, accommodation, phone_bill
  const handleDocumentExpiryChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [name]: value }
    }));
  }, []);

  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    try {
      const res = await axios.post('http://localhost:8000/api/token/refresh/', { refresh });
      localStorage.setItem('access_token', res.data.access);
      return res.data.access;
    } catch (err) {
      console.error("Token refresh failed:", err);
      // Handle refresh token failure (e.g., redirect to login)
      throw err;
    }
  };

  const submitDriver = async data => {
    let token = localStorage.getItem('access_token');
    try {
      const res = await axios.post('http://localhost:8000/Register/drivers/', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res;
    } catch (err) {
      if (err.response?.status === 401) {
        token = await refreshToken(); // Attempt to refresh token
        // Retry the request with the new token
        return axios.post('http://localhost:8000/Register/drivers/', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      throw err; // Re-throw other errors
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();

    // --- UPDATED keysToAppend for 'full' mode ---
    const keysToAppend = mode === 'full'
      ? [
          'driver_name', 'gender', 'iqama', 'mobile', 'city',
          'nationality', 'dob', 'vehicleType', 'company',
          'insurance_paid_by', 'accommodation_paid_by', 'phone_bill_paid_by' // Add new fields
        ]
      : ['driver_name', 'iqama', 'mobile', 'city', 'gender'];

    keysToAppend.forEach(key => {
      // Handle the 'documents' object (including new document fields)
      if (key === 'documents') { // This key won't be in keysToAppend directly, but it's handled here for completeness
        Object.entries(formData.documents).forEach(([docKey, docValue]) => {
          // Append file if not null
          if (docValue instanceof File) {
            data.append(docKey, docValue);
          }
          // Append expiry dates
          else if (docKey.endsWith('_expiry') && docValue) {
            data.append(docKey, docValue);
          }
        });
      } else if (key === 'vehicleType' || key === 'company') {
          // Append foreign key IDs if they exist and are numbers
          if (formData[key]) {
            data.append(key, formData[key]);
          }
      }
      else {
        // Append other form data fields
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
            data.append(key, formData[key]);
        }
      }
    });

    // Explicitly append all document related fields from formData.documents
    // This is safer than relying on 'documents' being in keysToAppend as a top-level key.
    Object.entries(formData.documents).forEach(([docKey, docValue]) => {
      if (docValue instanceof File) { // It's a file input
        data.append(docKey, docValue);
      } else if (docKey.endsWith('_expiry') && docValue) { // It's an expiry date
        data.append(docKey, docValue);
      }
    });

    // Ensure paid_by fields are appended even if not in original keysToAppend (if you decide to separate logic)
    if (mode === 'full') {
      if (formData.insurance_paid_by) data.append('insurance_paid_by', formData.insurance_paid_by);
      if (formData.accommodation_paid_by) data.append('accommodation_paid_by', formData.accommodation_paid_by);
      if (formData.phone_bill_paid_by) data.append('phone_bill_paid_by', formData.phone_bill_paid_by);
    }


    try {
      await submitDriver(data);
      alert('Driver added successfully!');
      // --- RESET formData STATE ---
      setFormData({
        driver_name: '', gender: '', iqama: '', mobile: '', city: '',
        nationality: '', dob: '', vehicleType: '', company: '',
        documents: {
          iqama_document: null, iqama_expiry: '',
          passport_document: null, passport_expiry: '',
          license_document: null, license_expiry: '',
          visa_document: null, visa_expiry: '',
          medical_document: null, medical_expiry: '',
          // --- NEW DOCUMENT FIELDS RESET ---
          insurance_document: null, insurance_expiry: '',
          accommodation_document: null, accommodation_expiry: '',
          phone_bill_document: null, phone_bill_expiry: ''
        },
        // --- NEW PAID_BY FIELDS RESET ---
        insurance_paid_by: '',
        accommodation_paid_by: '',
        phone_bill_paid_by: ''
      });
      setActiveTab('info'); // Go back to info tab after successful submission
    } catch (err) {
      console.error("Submission failed:", err);
      alert('Submission failed: ' + (err.response?.data?.detail || err.message || 'An unknown error occurred.'));
    }
  };

  const getFileName = file => file?.name || 'No file chosen';

  // --- Re-using existing InputField for date and text inputs ---
  const InputField = ({ label, ...props }) => (
    <div>
      <label className="block text-sm mb-1 text-white">{label}</label>
      <input className="w-full p-2 border rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-700" {...props} />
    </div>
  );

  // --- Re-using existing SelectField for dropdowns ---
  const SelectField = ({ label, options, ...props }) => (
    <div>
      <label className="block text-sm mb-1 text-white">{label}</label>
      <select className="w-full p-2 border rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-700" {...props}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  // --- Re-using existing FileUploadField for documents ---
  const FileUploadField = ({ label, name, file, expiryKey, expiryValue, onExpiryChange }) => (
    <div>
      <label className="block text-sm mb-1 text-white">{label} Document:</label>
      <div className="flex border border-gray-700 rounded overflow-hidden">
        <input type="text" readOnly value={getFileName(file)} className="flex-1 bg-gray-800 p-2 text-white" />
        <label htmlFor={name} className="cursor-pointer bg-blue-700 hover:bg-blue-800 text-white px-4 py-2">
          <Upload size={18} />
        </label>
        <input type="file" name={name} id={name} onChange={handleFileChange} className="hidden" />
      </div>
      <label className="block text-sm mt-2 mb-1 text-white">{label} Expiry:</label>
      <InputField type="date" name={expiryKey} value={expiryValue} onChange={onExpiryChange} />
    </div>
  );

  const infoHints = mode === 'full'
    ? 'You can fill all sections including documents and assignments.'
    : 'Only essential fields are required in partial mode.';

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gray-800 rounded-lg shadow-lg space-y-6">
      <header className="flex justify-between">
        <h2 className="text-2xl font-bold text-white">Add New Driver</h2>
        <div>
          <label className="mr-4 text-white">Mode:</label>
          <select
            value={mode}
            onChange={e => setMode(e.target.value)}
            className="bg-gray-800 border border-gray-700 p-2 rounded text-white"
          >
            <option value="partial">Partial Details</option>
            <option value="full">Full Details</option>
          </select>
        </div>
      </header>

      <p className="text-sm text-gray-400">{infoHints}</p>

      <div className="flex space-x-4">
        <button
          type="button"
          className={`px-4 py-2 rounded ${
            activeTab === 'info' ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-300'
          }`}
          onClick={() => setActiveTab('info')}
        >
          Driver Info
        </button>
        {mode === 'full' && (
          <button
            type="button"
            className={`px-4 py-2 rounded ${
              activeTab === 'documents' ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-300'
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
            <InputField label="Driver Name" name="driver_name" value={formData.driver_name} onChange={handleChange} placeholder="Enter name" required />
            <InputField label="Iqama Number" name="iqama" value={formData.iqama} onChange={handleChange} placeholder="Enter Iqama" required />
            <InputField label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Enter Mobile" required />
            <InputField label="City" name="city" value={formData.city} onChange={handleChange} placeholder="Enter City" required />
            <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={[
              { value: '', label: 'Select Gender' },
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' }
            ]} required />
            <InputField label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} placeholder="Enter Nationality" />
            <InputField label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleChange} />
          </div>
        )}

        {mode === 'full' && activeTab === 'documents' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mt-8 mb-4">Mandatory Documents</h3>
            {['iqama', 'passport', 'license', 'visa', 'medical'].map(doc => (
              <FileUploadField
                key={doc}
                label={doc.charAt(0).toUpperCase() + doc.slice(1)}
                name={`${doc}_document`}
                file={formData.documents[`${doc}_document`]}
                expiryKey={`${doc}_expiry`}
                expiryValue={formData.documents[`${doc}_expiry`]}
                onExpiryChange={handleDocumentExpiryChange} // Use the specific handler
              />
            ))}

            {/* --- NEW SECTIONS FOR EXPENSES/BILLS --- */}
            <h3 className="text-xl font-semibold text-white mt-8 mb-4">Expenses & Bills</h3>

            {/* Insurance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Insurance Paid By"
                name="insurance_paid_by"
                value={formData.insurance_paid_by}
                onChange={handleChange}
                options={PAID_BY_OPTIONS}
              />
     
            </div>

            {/* Accommodation Rent */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Accommodation Paid By"
                name="accommodation_paid_by"
                value={formData.accommodation_paid_by}
                onChange={handleChange}
                options={PAID_BY_OPTIONS}
              />
         
            </div>

            {/* Phone Bill */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Phone Bill Paid By"
                name="phone_bill_paid_by"
                value={formData.phone_bill_paid_by}
                onChange={handleChange}
                options={PAID_BY_OPTIONS}
              />
          
            </div>

            {/* Existing Assignment Fields */}
            <h3 className="text-xl font-semibold text-white mt-8 mb-4">Assignment</h3>
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
                ...companies.map(c => ({ value: c.id, label: c.company_name }))
              ]}
            />
          </div>
        )}

        <div className="text-right">
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDriverForm;