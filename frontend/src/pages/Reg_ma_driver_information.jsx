import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronDown, CircleUserRound, Edit, Trash2, Download } from 'lucide-react';
import axiosInstance from '../api/axiosInstance'; // Configure baseURL + headers

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
  console.log("Driver ID:", driverId);
console.log("URL:", `/Register/drivers/${driverId}/`)

  if (loading) return <div className="min-h-screen bg-black text-white p-8">Loading driver profile...</div>;
  if (error || !driverData) return <div className="min-h-screen bg-black text-red-400 p-8">{error || 'Driver not found.'}</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDriverData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setDriverData(prev => ({ ...prev, [name]: files[0].name }));
    }
  };

  const handleSave = async () => {
    try {
      await axiosInstance.patch(`/Register/drivers/${driverId}/`, driverData);
      console.log(driverData);
      alert('Saved successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
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

  return (
    <div className="min-h-screen bg-black text-gray-200 font-inter p-8">
      <div className="flex justify-end mb-6">
        <button className="flex items-center px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm">
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
            src={driverData.profileImage || 'https://placehold.co/100x100/52616B/F0F5F9?text=DP'}
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

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            ['driver_name','driver_name'],
            ['driverId','Driver No.'],
            ['nationality','National ID'],
            ['mobile','Contact No.'],
            ['driverType','Driver Type'],
            ['status','Approval'],
            ['licenseNumber','License No.'],
            ['licenseExpiry','License Expiry'],
            ['vehicleAllocated','Vehicle'],
            ['createdBy','Created By', true],
            ['submitted_by','Created At', true, 'date'],
            ['address','Address', false, 'textarea']
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

        {/* Documents */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          {['licenseDocument','nationalIdDocument'].map((docKey) => (
            <div key={docKey} className="mb-4">
              <label className="block font-medium mb-1">{docKey.replace(/([A-Z])/g,' $1')}</label>
              <div className="flex items-center">
                <p className="flex-grow p-2 bg-gray-800 rounded">{driverData[docKey]?.split('/').pop() || 'No file'}</p>
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
