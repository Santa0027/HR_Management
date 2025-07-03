import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronDown, CircleUserRound, Edit, Trash2, Download, Upload, Eye } from 'lucide-react';
import axiosInstance from '../api/axiosInstance'; // Make sure this path is correct

// --- Reusable Components ---

// Reusable Input field for general text/number inputs
const Input = ({ label, name, type = "text", value, onChange, placeholder = "", readOnly = false, required = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm mb-2 text-gray-300">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      required={required}
      className={`w-full p-2 bg-gray-800 border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${readOnly ? 'cursor-not-allowed opacity-75' : ''}`}
    />
  </div>
);

// Reusable Textarea field
const Textarea = ({ label, name, value, onChange, placeholder = "", readOnly = false, required = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm mb-2 text-gray-300">{label}</label>
    <textarea
      id={name}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      required={required}
      rows="3"
      className={`w-full p-2 bg-gray-800 border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${readOnly ? 'cursor-not-allowed opacity-75' : ''}`}
    ></textarea>
  </div>
);

// Reusable Select Field
const Select = ({ label, name, value, onChange, options, readOnly = false, required = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm mb-2 text-gray-300">{label}</label>
    <select
      id={name}
      name={name}
      value={value === null || value === undefined ? '' : value} // Handle null/undefined values for select
      onChange={onChange}
      readOnly={readOnly}
      required={required}
      className={`w-full p-2 bg-gray-800 border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${readOnly ? 'cursor-not-allowed opacity-75' : ''}`}
    >
      <option value="">Select {label}</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

// --- Helper Function for File Type Determination ---

const getFileType = (fileData) => {
  if (!fileData) return 'none';

  let mimeType = '';
  if (fileData instanceof File) {
    mimeType = fileData.type;
  } else if (typeof fileData === 'string') {
    // Attempt to infer type from URL/extension
    const fileName = fileData.split('/').pop();
    const extension = fileName.split('.').pop()?.toLowerCase(); // Use optional chaining
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
    } else if (extension === 'pdf') {
      mimeType = 'application/pdf';
    }
  }

  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  return 'other';
};

// --- Component for Document Preview ---

const DocumentPreview = ({ fileUrl, fileType }) => {
  if (!fileUrl || fileType === 'none') return null;

  if (fileType === 'image') {
    return (
      <img
        src={fileUrl}
        alt="Document Preview"
        className="max-w-full h-auto max-h-64 object-contain rounded border border-gray-700 mt-2"
        onError={(e) => {
          e.target.style.display = 'none'; // Hide broken image icon
          // Ensure fallback message is displayed
          if (e.target.nextElementSibling) {
            e.target.nextElementSibling.style.display = 'block';
          }
        }}
      />
    );
  } else if (fileType === 'pdf') {
    return (
      <embed
        src={fileUrl}
        type="application/pdf"
        width="100%"
        height="300px"
        className="rounded border border-gray-700 mt-2"
      />
    );
  }
  return null; // No preview for 'other' types
};

// --- Document/File Upload, Download, and Preview Field ---

const DocumentField = ({ label, docKey, fileData, isEditing, onFileChange, onDownload }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const type = getFileType(fileData);

  useEffect(() => {
    if (fileData instanceof File) {
      const url = URL.createObjectURL(fileData);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url); // Clean up the object URL when component unmounts or fileData changes
    } else {
      setPreviewUrl(fileData); // If it's a string (URL from backend)
    }
  }, [fileData]); // Depend on fileData to re-run when it changes

  return (
    <div className="mb-6 p-4 border border-gray-800 rounded-lg bg-gray-850">
      <label className="block font-medium mb-2 text-gray-300">
        {label}
      </label>
      <div className="flex items-center space-x-3 mb-3">
        <p className="flex-grow p-2 bg-gray-800 rounded truncate text-gray-200">
          {fileData instanceof File ? fileData.name : (fileData ? fileData.split('/').pop() : 'No file chosen')}
        </p>
        {!isEditing ? (
          <div className="flex space-x-2">
            {type !== 'none' && (
              <button
                type="button" // Important: Prevent form submission
                onClick={() => onDownload(previewUrl)} // Use previewUrl for consistency
                className="bg-blue-700 hover:bg-blue-600 text-white p-2 rounded-full flex-shrink-0 transition-colors duration-200"
                title={type === 'other' ? "Download Document" : "View Document"}
              >
                {type === 'other' ? <Download size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>
        ) : (
          <label htmlFor={docKey} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-full cursor-pointer flex items-center space-x-2 transition-colors duration-200">
            <Upload size={18} />
            <span>{fileData ? 'Change File' : 'Upload File'}</span>
            <input type="file" name={docKey} id={docKey} className="hidden" onChange={onFileChange} />
          </label>
        )}
      </div>
      {/* Document Preview Area (only in display mode) */}
      {!isEditing && previewUrl && type !== 'other' && (
        <div className="bg-gray-900 p-3 rounded mt-3 text-center">
          <DocumentPreview fileUrl={previewUrl} fileType={type} />
          <div className="text-gray-400 text-sm mt-2" style={{ display: 'none' }}>
            Preview not available or failed to load.
          </div>
        </div>
      )}
    </div>
  );
};


// --- Main DriverProfileEditDelete Component ---

function DriverProfileEditDelete() {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [driverData, setDriverData] = useState(null);
  const [initialDriverData, setInitialDriverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vehicles, setVehicles] = useState([]); // State for all vehicles
  const [companies, setCompanies] = useState([]); // State for all companies

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Use toLocaleDateString with options for a readable format
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Invalid Date';
    }
  };

  // Fetch initial data (driver, vehicles, companies) on component mount
  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      setError('');
      try {
        const [driverRes, vehiclesRes, companiesRes] = await Promise.all([
          axiosInstance.get(`/Register/drivers/${driverId}/`),
          axiosInstance.get('/vehicles/'), // Adjust this endpoint if needed, e.g., '/vehicles/'
          axiosInstance.get('/company/'),  // Adjust this endpoint if needed, e.g., '/companies/'
        ]);

        const fetchedDriverData = { ...driverRes.data };

        // Normalize foreign key objects to their IDs for the form state
        // This assumes your API provides nested objects like {id: 1, name: "Vehicle X"}
        // If your API provides just the ID, remove .id
        fetchedDriverData.vehicle = fetchedDriverData.vehicle ? fetchedDriverData.vehicle.id : '';
        fetchedDriverData.company = fetchedDriverData.company ? fetchedDriverData.company.id : '';

        // Ensure file fields are null if empty strings or not present to avoid issues with `instanceof File`
        const fileFields = [
          'driver_profile_img', 'iqama_document', 'passport_document',
          'license_document', 'visa_document', 'medical_document'
        ];
        fileFields.forEach(field => {
          fetchedDriverData[field] = fetchedDriverData[field] || null;
        });

        setDriverData(fetchedDriverData);
        setInitialDriverData(fetchedDriverData); // Store initial fetched data for reset

        setVehicles(vehiclesRes.data);
        setCompanies(companiesRes.data);

      } catch (err) {
        console.error("Error fetching data:", err.response?.data || err.message);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  }, [driverId]);

  // Handle changes for text/number/select inputs
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    // For checkbox, update with checked value
    setDriverData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Handle changes for file inputs (documents and profile image)
  const handleFileChange = useCallback((e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setDriverData(prev => ({ ...prev, [name]: files[0] }));
    }
  }, []);

  // Function to handle clicking the "Edit" button
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Function to handle clicking the "Cancel" button during edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    // Revert to original fetched data, which includes original file URLs or nulls
    setDriverData(initialDriverData);
  };

  // Handles saving driver data (PATCH request)
  const handleSave = async () => {
    setLoading(true);
    const formData = new FormData();

    // Append all fields from driverData
    Object.entries(driverData).forEach(([key, value]) => {
      // Handle special cases for ForeignKey fields: send only the ID
      if (key === 'vehicle' && (value === null || value === '')) {
          formData.append('vehicle', ''); // Send empty string for null
      } else if (key === 'vehicle' && value) {
          formData.append('vehicle', value);
      }
      else if (key === 'company' && (value === null || value === '')) {
          formData.append('company', ''); // Send empty string for null
      }
      else if (key === 'company' && value) {
          formData.append('company', value);
      }
      // If the value is a File object, append it directly
      else if (value instanceof File) {
        formData.append(key, value, value.name);
      }
      // For any other field, if it's not null/undefined, append its value
      // This also handles cases where a file field might have its URL (string) if not changed
      else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    try {
      const res = await axiosInstance.patch(`/Register/drivers/${driverId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // After successful save, update state with the response data
      // Normalize foreign key objects back to their IDs if they are nested in the response
      const updatedData = { ...res.data };
      updatedData.vehicle = updatedData.vehicle ? updatedData.vehicle.id : '';
      updatedData.company = updatedData.company ? updatedData.company.id : '';

      // Ensure file fields are set to null if the response sends empty strings for them
      const fileFields = [
        'driver_profile_img', 'iqama_document', 'passport_document',
        'license_document', 'visa_document', 'medical_document'
      ];
      fileFields.forEach(field => {
        updatedData[field] = updatedData[field] || null;
      });

      setDriverData(updatedData);
      setInitialDriverData(updatedData); // Update initial data to new saved state
      alert('Driver profile updated successfully!');
      setIsEditing(false); // Exit edit mode
    } catch (err) {
      console.error("Error saving driver data:", err.response?.data || err.message);
      const errorMessage = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      alert(`Save failed! ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Handles deleting driver data (DELETE request)
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete driver ${driverData.driver_name}? This action cannot be undone.`)) {
      setLoading(true);
      try {
        await axiosInstance.delete(`/Register/drivers/${driverId}/`);
        alert('Driver deleted successfully!');
        navigate('/registration-management'); // Redirect to driver list after deletion
      } catch (err) {
        console.error("Error deleting driver:", err.response?.data || err.message);
        const errorMessage = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        alert(`Delete failed! ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Function to handle downloading/viewing documents by opening URL
  const handleDownload = useCallback((docUrl) => {
    if (docUrl) {
      window.open(docUrl, '_blank');
    } else {
      alert("No document to download/view.");
    }
  }, []);

  // Effect to clean up profile image object URL
  useEffect(() => {
    const currentProfileImage = driverData?.driver_profile_img instanceof File
      ? URL.createObjectURL(driverData.driver_profile_img)
      : null; // Only createObjectURL if it's a File

    return () => {
      if (currentProfileImage && currentProfileImage.startsWith('blob:')) {
        URL.revokeObjectURL(currentProfileImage);
      }
    };
  }, [driverData?.driver_profile_img]);


  if (loading) return <div className="min-h-screen bg-black text-white p-8">Loading driver profile...</div>;
  if (error || !driverData) return <div className="min-h-screen bg-black text-red-400 p-8">{error || 'Driver not found.'}</div>;

  // Resolve the profile image URL for display
  const displayProfileImage = driverData.driver_profile_img instanceof File
    ? URL.createObjectURL(driverData.driver_profile_img)
    : driverData.driver_profile_img;


  // Define options for select fields
  const GENDER_OPTIONS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const PAID_BY_OPTIONS = [
    { value: 'own', label: 'Own' },
    { value: 'company', label: 'Company' },
  ];

  // Helper to get vehicle/company name for display
  const getVehicleName = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.vehicle_name} (${vehicle.vehicle_number})` : 'N/A';
  };

  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.company_name : 'N/A';
  };


  return (
    <div className="min-h-screen bg-black text-white font-inter p-8">
      <div className="flex justify-end mb-6">
        <button type="button" className="flex items-center px-3 py-1  bg-[#284B63] hover:bg-[#52616B] text-[#FFFFFF] rounded-full text-sm">
          English <ChevronDown size={16} className="ml-1" />
        </button>
        <CircleUserRound size={24} className="ml-4 text-green-400" />
      </div>

      <div className="flex justify-between items-center mb-6">
        <Link to="/registration-management" className="text-gray-400 hover:text-white transition-colors duration-200">
          ← Back to Driver List
        </Link>
        <div className="space-x-4">
          {!isEditing ? (
            <button
              type="button"
              onClick={handleEditClick}
              className="bg-blue-700 hover:bg-blue-600 px-5 py-2 rounded-lg flex items-center transition-colors duration-200"
              disabled={loading}
            >
              <Edit size={18} className="mr-2" /> Edit
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-600 hover:bg-gray-500 px-5 py-2 rounded-lg text-white transition-colors duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-500 px-5 py-2 rounded-lg text-white transition-colors duration-200"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-500 px-5 py-2 rounded-lg flex items-center transition-colors duration-200"
            disabled={isEditing || loading}
          >
            <Trash2 size={18} className="mr-2" /> Delete
          </button>
        </div>
      </div>

      <h1 className="text-3xl font-semibold mb-6 text-white">Driver Profile: {driverData.driver_name}</h1>

      <div className="bg-gray-900 p-8 rounded-lg shadow-lg">
        {/* Profile Image Section */}
        <div className="flex items-center mb-8">
          <img
            src={displayProfileImage || 'https://placehold.co/100x100/52616B/F0F5F9?text=DP'}
            alt="Driver Profile"
            className="w-24 h-24 rounded-full border-2 border-gray-700 mr-6 object-cover flex-shrink-0"
            onError={(e) => e.target.src = 'https://placehold.co/100x100/52616B/F0F5F9?text=DP'}
          />
          {isEditing && (
            <label htmlFor="driver_profile_img" className="cursor-pointer bg-gray-700 hover:bg-gray-600 p-2 rounded-full transition-colors duration-200" title="Change Profile Picture">
              <Edit size={16} className="text-white" />
              <input type="file" name="driver_profile_img" id="driver_profile_img" className="hidden" onChange={handleFileChange} accept="image/*" />
            </label>
          )}
        </div>

        {/* Driver Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[
            { key: 'driver_name', label: 'Driver Name', required: true },
            { key: 'iqama', label: 'Iqama Number', required: true },
            { key: 'mobile', label: 'Mobile Number', type: 'tel', required: true },
            { key: 'city', label: 'City', required: true },
            { key: 'nationality', label: 'Nationality' },
            { key: 'dob', label: 'Date of Birth', type: 'date' },
            { key: 'remarks', label: 'Remarks', type: 'textarea' },
            { key: 'created_at', label: 'Created At', type: 'date', readOnly: true },
            { key: 'created_by', label: 'Created By', readOnly: true }, // Placeholder: needs actual backend value
          ].map(({ key, label, readOnly = false, type = 'text', required = false }) => {
            // Special handling for boolean fields like 'is_active'
            if (key === 'is_active') {
              return (
                <div key={key}>
                  <label htmlFor={key} className="block text-sm mb-2 text-gray-300">{label}</label>
                  {isEditing && !readOnly ? (
                    <input
                      type="checkbox"
                      name={key}
                      id={key}
                      checked={driverData[key] || false}
                      onChange={handleChange}
                      className="form-checkbox h-5 w-5 text-green-500 rounded bg-gray-800 border-gray-700"
                    />
                  ) : (
                    <p className="p-2 bg-gray-800 rounded text-gray-200">
                      {driverData[key] ? 'Yes' : 'No'}
                    </p>
                  )}
                </div>
              );
            }
            return (
              <div key={key}>
                {isEditing && !readOnly ? (
                  type === 'textarea' ? (
                    <Textarea
                      label={label}
                      name={key}
                      value={driverData[key]}
                      onChange={handleChange}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      required={required}
                    />
                  ) : (
                    <Input
                      label={label}
                      name={key}
                      type={type}
                      // For date inputs, ensure format is 'YYYY-MM-DD'
                      value={type === 'date' && driverData[key] ? driverData[key].split('T')[0] : driverData[key]}
                      onChange={handleChange}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      required={required}
                    />
                  )
                ) : (
                  <div>
                    <label className="block text-sm mb-1 font-medium text-gray-300">{label}:</label>
                    <p className="p-2 bg-gray-800 rounded text-gray-200">
                      {type === 'date' ? formatDate(driverData[key]) : (driverData[key] || 'N/A')}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Special Fields: Gender, Status, Vehicle, Company */}
          <div>
            {isEditing ? (
              <Select
                label="Gender"
                name="gender"
                value={driverData.gender}
                onChange={handleChange}
                options={GENDER_OPTIONS}
                required
              />
            ) : (
              <div>
                <label className="block text-sm mb-1 font-medium text-gray-300">Gender:</label>
                <p className="p-2 bg-gray-800 rounded text-gray-200">{driverData.gender || 'N/A'}</p>
              </div>
            )}
          </div>

          <div>
            {isEditing ? (
              <Select
                label="Approval Status"
                name="status"
                value={driverData.status}
                onChange={handleChange}
                options={STATUS_OPTIONS}
              />
            ) : (
              <div>
                <label className="block text-sm mb-1 font-medium text-gray-300">Approval Status:</label>
                <p className="p-2 bg-gray-800 rounded text-gray-200">{driverData.status || 'N/A'}</p>
              </div>
            )}
          </div>

          <div>
            {isEditing ? (
              <Select
                label="Assign Vehicle"
                name="vehicle"
                value={driverData.vehicle}
                onChange={handleChange}
                options={vehicles.map(v => ({ value: v.id, label: `${v.vehicle_name} (${v.vehicle_number})` }))}
              />
            ) : (
              <div>
                <label className="block text-sm mb-1 font-medium text-gray-300">Vehicle Allocated:</label>
                <p className="p-2 bg-gray-800 rounded text-gray-200">
                  {driverData.vehicle ? getVehicleName(driverData.vehicle) : 'N/A'}
                </p>
              </div>
            )}
          </div>

          <div>
            {isEditing ? (
              <Select
                label="Assign Company"
                name="company"
                value={driverData.company}
                onChange={handleChange}
                options={companies.map(c => ({ value: c.id, label: c.company_name }))}
              />
            ) : (
              <div>
                <label className="block text-sm mb-1 font-medium text-gray-300">Assigned Company:</label>
                <p className="p-2 bg-gray-800 rounded text-gray-200">
                  {driverData.company ? getCompanyName(driverData.company) : 'N/A'}
                </p>
              </div>
            )}
          </div>

          {/* New 'is_active' field from Django model */}
          <div>
            <label htmlFor="is_active" className="block text-sm mb-2 text-gray-300">Is Active</label>
            {isEditing ? (
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={driverData.is_active || false}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-green-500 rounded bg-gray-800 border-gray-700"
              />
            ) : (
              <p className="p-2 bg-gray-800 rounded text-gray-200">
                {driverData.is_active ? 'Yes' : 'No'}
              </p>
            )}
          </div>

        </div>

        {/* Documents Section */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-white">Mandatory Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { key: 'iqama_document', label: 'Iqama Document', expiryKey: 'iqama_expiry' },
              { key: 'passport_document', label: 'Passport Document', expiryKey: 'passport_expiry' },
              { key: 'license_document', label: 'License Document', expiryKey: 'license_expiry' },
              { key: 'visa_document', label: 'Visa Document', expiryKey: 'visa_expiry' },
              { key: 'medical_document', label: 'Medical Document', expiryKey: 'medical_expiry' },
            ].map((docInfo) => (
              <div key={docInfo.key} className="bg-gray-800/50 p-4 rounded-lg"> {/* Wrapper for document and expiry */}
                <DocumentField
                  label={docInfo.label}
                  docKey={docInfo.key}
                  fileData={driverData[docInfo.key]}
                  isEditing={isEditing}
                  onFileChange={handleFileChange}
                  onDownload={handleDownload}
                />
                <div className="mt-4">
                  {isEditing ? (
                    <Input
                      label={`${docInfo.label} Expiry Date`}
                      name={docInfo.expiryKey}
                      type="date"
                      value={driverData[docInfo.expiryKey] ? driverData[docInfo.expiryKey].split('T')[0] : ''}
                      onChange={handleChange}
                    />
                  ) : (
                    <div>
                      <label className="block text-sm mb-1 font-medium text-gray-300">{`${docInfo.label} Expiry Date`}:</label>
                      <p className="p-2 bg-gray-800 rounded text-gray-200">
                        {formatDate(driverData[docInfo.expiryKey])}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses & Bills Section */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-white">Expenses & Bills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { key: 'insurance_paid_by', label: 'Insurance Paid By' },
              { key: 'accommodation_paid_by', label: 'Accommodation Paid By' },
              { key: 'phone_bill_paid_by', label: 'Phone Bill Paid By' },
            ].map((expenseInfo) => (
              <div key={expenseInfo.key} className="bg-gray-800/50 p-4 rounded-lg">
                {isEditing ? (
                  <Select
                    label={expenseInfo.label}
                    name={expenseInfo.key}
                    value={driverData[expenseInfo.key]}
                    onChange={handleChange}
                    options={PAID_BY_OPTIONS}
                  />
                ) : (
                  <div>
                    <label className="block text-sm mb-1 font-medium text-gray-300">{expenseInfo.label}:</label>
                    <p className="p-2 bg-gray-800 rounded text-gray-200">{driverData[expenseInfo.key] || 'N/A'}</p>
                  </div>
                )}
                {/* Add DocumentField and expiry for insurance, accommodation, phone_bill if you uncomment them in Django */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverProfileEditDelete;