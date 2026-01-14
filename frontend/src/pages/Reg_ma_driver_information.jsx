import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronDown, CircleUserRound, Edit, Trash2, Download } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

function DriverProfileEditDelete() {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [driverData, setDriverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDriver() {
      try {
        const res = await axiosInstance.get(`/Register/drivers/${driverId}/`);
        setDriverData(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load driver data.');
      } finally {
        setLoading(false);
      }
    }
    fetchDriver();
  }, [driverId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDriverData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setDriverData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

 const handleSave = async () => {
  const formData = new FormData();

  // Only include valid File objects
  Object.entries(driverData).forEach(([key, value]) => {
    if (
      key.endsWith('_document') || key === 'profileImage'
    ) {
      if (value instanceof File) {
        formData.append(key, value);
      }
    } else {
      formData.append(key, value ?? '');
    }
  });

  try {
    await axiosInstance.patch(`/Register/drivers/${driverId}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    alert('Saved successfully!');
    setIsEditing(false);
  } catch (err) {
    console.error(err.response?.data || err.message);
    alert('Save failed!');
  }
};

  const handleDelete = async () => {
    if (window.confirm(`Delete ${driverData.driver_name}?`)) {
      try {
        await axiosInstance.delete(`/Register/drivers/${driverId}/`);
        alert('Deleted.');
        navigate('/driver-management');
      } catch (err) {
        console.error(err);
        alert('Delete failed!');
      }
    }
  };

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
        <Link to="/driver-management" className="text-gray-400 hover:text-white">← Back to List</Link>
        <div className="space-x-4">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="bg-blue-700 px-5 py-2 rounded-lg flex items-center">
              <Edit size={18} className="mr-2" /> Edit
            </button>
          ) : (
            <button onClick={handleSave} className="bg-green-600 px-5 py-2 rounded-lg text-white">Save</button>
          )}
          <button onClick={handleDelete} className="bg-red-600 px-5 py-2 rounded-lg flex items-center">
            <Trash2 size={18} className="mr-2" /> Delete
          </button>
        </div>
      </div>

      <h1 className="text-3xl font-semibold mb-6">Driver Profile</h1>

      <div className="bg-gray-900 p-8 rounded-lg shadow-lg">
        <div className="flex items-center mb-8">
          <img
            src={
              driverData.profileImage instanceof File
                ? URL.createObjectURL(driverData.profileImage)
                : driverData.profileImage || 'https://placehold.co/100x100/52616B/F0F5F9?text=DP'
            }
            alt="Profile"
            className="w-24 h-24 rounded-full border-2 mr-6 object-cover"
          />
          {isEditing && (
            <label htmlFor="profileImage" className="cursor-pointer bg-gray-700 p-2 rounded-full">
              <Edit size={16} />
              <input type="file" name="profileImage" id="profileImage" className="hidden" onChange={handleFileChange} />
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            ['driver_name','driver_name'],
            ['mobile','Driver No.'],
            ['nationality','National ID'],
            ['mobile','Contact No.'],
            // ['vehicle_name','Driver Type'],
            ['status','Approval'],
            // ['licenseNumber','License No.'],
            // ['licenseExpiry','License Expiry'],
            // ['vehicleAllocated','Vehicle'],
            // ['createdBy','Created By', true],
            // ['submitted_by','Created At', true, 'date'],
            // ['address','Address', false, 'textarea']
          ].map(([key,label, readonly=false, type='text']) => (
            <div key={key}>
              <label className="block font-medium mb-1">{label}</label>
              {isEditing && !readonly ? (
                type === 'textarea' ? (
                  <textarea name={key} value={driverData[key] || ''} onChange={handleChange}
                    className="w-full p-2 bg-gray-800 border-gray-700 rounded"/>
                ) : (
                  <input type={type==='date'?'date':'text'} name={key} value={driverData[key] || ''} onChange={handleChange}
                    className="w-full p-2 bg-gray-800 border-gray-700 rounded"/>
                )
              ) : (
                <p className="p-2 bg-gray-800 rounded">{driverData[key]}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700">
          {[
            'iqama_document',
            'passport_document',
            'license_document',
            'visa_document',
            'medical_document',
          ].map((docKey) => (
            <div key={docKey} className="mb-4">
              <label className="block font-medium mb-1">
                {docKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </label>
              <div className="flex items-center">
                <p className="flex-grow p-2 bg-gray-800 rounded">
                  {getFileName(driverData[docKey])}
                </p>
                {!isEditing ? (
                  driverData[docKey] && (
                    <button onClick={() => handleDownload(driverData[docKey])}
                      className="ml-2 bg-blue-700 p-2 rounded">
                      <Download size={18} />
                    </button>
                  )
                ) : (
                  <label htmlFor={docKey} className="ml-2 bg-blue-700 p-2 rounded cursor-pointer">
                    Upload
                    <input type="file" name={docKey} id={docKey} className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DriverProfileEditDelete;
