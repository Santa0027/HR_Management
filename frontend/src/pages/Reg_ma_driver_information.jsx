import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronDown, CircleUserRound, Edit, Trash2, Download, Upload, Eye } from 'lucide-react'; // Added Eye icon for view
import axiosInstance from '../api/axiosInstance';

// --- Reusable Components (unchanged from last iteration, good to keep them separate) ---

// Reusable Input field for general text/number inputs
const Input = ({ label, name, type = "text", value, onChange, placeholder = "", readOnly = false }) => (
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
      className={`w-full p-2 bg-gray-800 border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${readOnly ? 'cursor-not-allowed opacity-75' : ''}`}
    />
  </div>
);

// Reusable Textarea field
const Textarea = ({ label, name, value, onChange, placeholder = "", readOnly = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm mb-2 text-gray-300">{label}</label>
    <textarea
      id={name}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      rows="3" // Default rows for textarea
      className={`w-full p-2 bg-gray-800 border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${readOnly ? 'cursor-not-allowed opacity-75' : ''}`}
    ></textarea>
  </div>
);

// --- New Helper Function for File Type Determination ---

const getFileType = (fileData) => {
  if (!fileData) return 'none';

  let mimeType = '';
  if (fileData instanceof File) {
    mimeType = fileData.type;
  } else if (typeof fileData === 'string') {
    const fileName = fileData.split('/').pop();
    const extension = fileName.split('.').pop().toLowerCase();
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

// --- New Component for Document Preview ---

const DocumentPreview = ({ fileUrl, fileType }) => {
  if (!fileUrl || fileType === 'none') return null;

  if (fileType === 'image') {
    return (
      <img
        src={fileUrl} // CORRECTED: Use fileUrl prop here
        alt="Document Preview"
        className="max-w-full h-auto max-h-64 object-contain rounded border border-gray-700 mt-2"
        onError={(e) => {
          e.target.style.display = 'none'; // Hide broken image icon
          e.target.nextSibling.style.display = 'block'; // Show fallback message
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

// --- Updated Document/File Upload, Download, and Preview Field ---

const DocumentField = ({ label, docKey, fileData, isEditing, onFileChange, onDownload }) => {
  const fileToPreview = fileData instanceof File ? URL.createObjectURL(fileData) : fileData;
  const type = getFileType(fileData);

  useEffect(() => {
    // Revoke object URL when component unmounts or fileToPreview changes
    // This is important to prevent memory leaks with createObjectURL
    return () => {
      if (fileData instanceof File && fileToPreview) {
        URL.revokeObjectURL(fileToPreview);
      }
    };
  }, [fileToPreview, fileData]);

  return (
    <div className="mb-6 p-4 border border-gray-800 rounded-lg bg-gray-850"> {/* Enhanced styling */}
      <label className="block font-medium mb-2 text-gray-300">
        {label}
      </label>
      <div className="flex items-center space-x-3 mb-3">
        <p className="flex-grow p-2 bg-gray-800 rounded truncate text-gray-200">
          {fileData instanceof File ? fileData.name : (fileData ? fileData.split('/').pop() : 'No file chosen')}
        </p>
        {!isEditing ? (
          <div className="flex space-x-2">
            {type !== 'none' && ( // Show Eye icon if there's a file to preview/download
              <button
                onClick={() => onDownload(fileData)}
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
            <span>{fileData ? 'Change File' : 'Upload File'}</span> {/* Improved label */}
            <input type="file" name={docKey} id={docKey} className="hidden" onChange={onFileChange} />
          </label>
        )}
      </div>
      {/* Document Preview Area (only in display mode) */}
      {!isEditing && fileToPreview && type !== 'other' && (
        <div className="bg-gray-900 p-3 rounded mt-3 text-center">
          <DocumentPreview fileUrl={fileToPreview} fileType={type} />
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
  const [driverData, setDriverData] = useState(null); // Stores fetched data and current form data
  const [initialDriverData, setInitialDriverData] = useState(null); // Stores original fetched data for cancelling edits
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch driver data on component mount or driverId change
  useEffect(() => {
    async function fetchDriver() {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get(`/Register/drivers/${driverId}/`);
        setDriverData(res.data);
        setInitialDriverData(res.data); // Store initial data for reset
      } catch (err) {
        console.error("Error fetching driver data:", err.response?.data || err.message);
        setError('Failed to load driver data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchDriver();
  }, [driverId]);

  // Handle changes for text/number/select inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDriverData(prev => ({ ...prev, [name]: value }));
  };

  // Handle changes for file inputs (documents and profile image)
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setDriverData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  // Handles saving driver data (PATCH request)
  const handleSave = async () => {
    setLoading(true);
    const formData = new FormData();

    // Iterate over driverData to append fields for submission
    Object.entries(driverData).forEach(([key, value]) => {
      // For file fields, only append if it's a new File object
      if (
        (key.endsWith('_document') || key === 'profileImage')
      ) {
        if (value instanceof File) {
          formData.append(key, value);
        }
        // If the value is a string (existing URL) and it hasn't changed (i.e., not a new file selected),
        // we generally don't append it for PATCH requests unless you want to explicitly resend it.
        // Omitting it means the backend keeps the existing value.
        // If you need to explicitly clear a file (set to null/empty), you'd handle that separately
        // (e.g., by sending an empty string for that field name if your API supports it).
      } else {
        // For non-file fields, append their value.
        // Ensure values are not undefined or null if the backend expects a string.
        formData.append(key, value ?? '');
      }
    });

    try {
      const res = await axiosInstance.patch(`/Register/drivers/${driverId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }, // Essential for file uploads
      });
      setDriverData(res.data); // Update with the latest data from the server
      setInitialDriverData(res.data); // Update initial data to new saved state
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
        navigate('/driver-management'); // Redirect to driver list after deletion
      } catch (err) {
        console.error("Error deleting driver:", err.response?.data || err.message);
        const errorMessage = err.response?.data ? JSON.stringify(error.response.data) : err.message;
        alert(`Delete failed! ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Function to handle downloading/viewing documents by opening URL
  const handleDownload = (docUrl) => {
    window.open(docUrl, '_blank');
  };

  const getFileName = (fileData) => {
    if (!fileData) return 'No file';
    if (fileData instanceof File) return fileData.name;
    return fileData.split('/').pop();
  };

  if (loading) return <div className="min-h-screen bg-white text-[#284B63] p-8">Loading driver profile...</div>;
  if (error || !driverData) return <div className="min-h-screen bg-black text-red-400 p-8">{error || 'Driver not found.'}</div>;

  return (
    <div className="min-h-screen bg-white text-[#1E2022]font-inter p-8">
      <div className="flex justify-end mb-6">
        <button className="flex items-center px-3 py-1  bg-[#284B63] hover:bg-[#52616B] text-[#FFFFFF] rounded-full text-sm">
          English <ChevronDown size={16} className="ml-1" />
        </button>
        <CircleUserRound size={24} className="ml-4 text-green-400" />
      </div>

      <div className="flex justify-between items-center mb-6">
        <Link to="/driver-management" className="text-gray-400 hover:text-white transition-colors duration-200">
          ← Back to Driver List
        </Link>
        <div className="space-x-4">
          {!isEditing ? (
            <button
              onClick={handleEditClick}
              className="bg-blue-700 hover:bg-blue-600 px-5 py-2 rounded-lg flex items-center transition-colors duration-200"
              disabled={loading}
            >
              <Edit size={18} className="mr-2" /> Edit
            </button>
          ) : (
            <>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-600 hover:bg-gray-500 px-5 py-2 rounded-lg text-white transition-colors duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-500 px-5 py-2 rounded-lg text-white transition-colors duration-200"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-500 px-5 py-2 rounded-lg flex items-center transition-colors duration-200"
            disabled={isEditing || loading} // Disable delete while editing or saving
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
            src={
              driverData.profileImage instanceof File
                ? URL.createObjectURL(driverData.profileImage) // New file preview
                : driverData.profileImage || 'https://placehold.co/100x100/52616B/F0F5F9?text=DP' // Existing URL or placeholder
            }
            alt="Driver Profile"
            className="w-24 h-24 rounded-full border-2 border-gray-700 mr-6 object-cover flex-shrink-0"
            onError={(e) => e.target.src = 'https://placehold.co/100x100/52616B/F0F5F9?text=DP'} // Fallback for broken image
          />
          {isEditing && (
            <label htmlFor="profileImage" className="cursor-pointer bg-gray-700 hover:bg-gray-600 p-2 rounded-full transition-colors duration-200" title="Change Profile Picture">
              <Edit size={16} className="text-white" />
              <input type="file" name="profileImage" id="profileImage" className="hidden" onChange={handleFileChange} accept="image/*" />
            </label>
          )}
        </div>

        {/* Driver Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[
            // Basic Driver Information
            { key: 'driver_name', label: 'Driver Name' },
            { key: 'mobile', label: 'Mobile Number', type: 'tel' },
            { key: 'nationality', label: 'Nationality' },
            { key: 'status', label: 'Approval Status' },
            { key: 'licenseNumber', label: 'License Number' },
            { key: 'licenseExpiry', label: 'License Expiry', type: 'date' },
            { key: 'vehicleAllocated', label: 'Vehicle Allocated' },
            { key: 'createdBy', label: 'Created By', readOnly: true },
            { key: 'submitted_by', label: 'Created At', type: 'date', readOnly: true },
            { key: 'address', label: 'Address', type: 'textarea' },
            // Add other fields as per your backend model
          ].map(({ key, label, readOnly = false, type = 'text' }) => (
            <div key={key}>
              {isEditing && !readOnly ? (
                type === 'textarea' ? (
                  <Textarea
                    label={label}
                    name={key}
                    value={driverData[key]}
                    onChange={handleChange}
                    placeholder={`Enter ${label.toLowerCase()}`}
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
          ))}
        </div>

        {/* Documents Section */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-white">Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Responsive grid for documents */}
            {[
              { key: 'iqama_document', label: 'Iqama Document' },
              { key: 'passport_document', label: 'Passport Document' },
              { key: 'license_document', label: 'License Document' },
              { key: 'visa_document', label: 'Visa Document' },
              { key: 'medical_document', label: 'Medical Document' },
              // Add other document fields if needed
            ].map((docInfo) => (
              <DocumentField
                key={docInfo.key}
                label={docInfo.label}
                docKey={docInfo.key}
                fileData={driverData[docInfo.key]}
                isEditing={isEditing}
                onFileChange={handleFileChange}
                onDownload={handleDownload}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverProfileEditDelete;