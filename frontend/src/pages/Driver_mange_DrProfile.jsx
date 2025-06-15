import React, { useEffect, useState } from 'react';
import { ChevronDown, CircleUserRound } from 'lucide-react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

function Driver_mange_DrProfile() {
  const { id } = useParams(); // ✅ Correctly defined at the top
  const [activeTab, setActiveTab] = useState('Driver Information');
  const [driverData, setDriverData] = useState(null);
  const [driverProfilePicture, setDriverProfilePicture] = useState(
    'https://placehold.co/100x100/535c9b/ffffff?text=Avatar'
  );

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const response = await axiosInstance.get(`/Register/drivers/${id}`);
        setDriverData(response.data);

        if (response.data.profilePictureUrl) {
          setDriverProfilePicture(response.data.profilePictureUrl);
        }
      } catch (error) {
        console.error('Failed to fetch driver data:', error);
      }
    };

    if (id) {
      fetchDriverData();
    }
  }, [id]);

  if (!driverData) {
    return <div className="min-h-screen bg-black text-white p-8">Loading driver profile...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 font-inter p-8">
      {/* Header */}
      <div className="flex justify-end items-center mb-6">
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm transition-colors">
            English <ChevronDown size={16} className="ml-1" />
          </button>
          <CircleUserRound size={24} className="text-green-400" />
        </div>
      </div>

      <div className="text-sm text-gray-400 mb-6">Driver Management / Driver Profile</div>

      {/* Profile */}
      <div className="bg-gray-900 p-6 rounded-lg flex items-center mb-8">
        <img
          src={driverProfilePicture}
          alt="Driver Avatar"
          className="w-24 h-24 rounded-full object-cover mr-6"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/100x100/535c9b/ffffff?text=Avatar';
          }}
        />
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2">Driver Profile</h1>
          <h2 className="text-2xl font-medium text-green-400 mb-4">{driverData.driver_name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-2 text-sm text-gray-400">
            <div><span className="font-semibold text-gray-300">Driver ID:</span> {driverData.driverId}</div>
            <div><span className="font-semibold text-gray-300">National ID:</span> {driverData.nationality}</div>
            <div><span className="font-semibold text-gray-300">Delivery Provider:</span> {driverData.deliveryProvider}</div>
            <div><span className="font-semibold text-gray-300">Phone Number:</span> {driverData.mobile}</div>
            <div><span className="font-semibold text-gray-300">Availability:</span> {driverData.availability}</div>
            <div>
              <span className="font-semibold text-gray-300">Status:</span>{' '}
              <button
                className={`py-1 px-3 rounded-full text-xs font-medium transition-colors ${driverData.status === 'Active' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}
                disabled
              >
                {driverData.status}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-800">
        {['Driver Information', 'Documents', 'Trips', 'Vehicle', 'Payment', 'Violation'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium ${activeTab === tab
                ? 'border-b-2 border-green-400 text-white'
                : 'text-gray-400 hover:text-white'
              } transition-colors`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Driver Information' && (
        <div className="bg-gray-900 p-6 rounded-lg">
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Driver Name</label>
              <input
                type="text"
                value={driverData.driver_name || ''}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <input
                type="date"
                value={driverData.dob || ''}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ID/Iqama</label>
              <input
                type="text"
                value={driverData.iqama || ''}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">nationality</label>
              <input
                type="text"
                value={driverData.nationality || ''}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700"
                disabled
              />
            </div>
            {/* <div>
              <label className="block text-sm font-medium mb-1">IMEI</label>
              <input
                type="text"
                value={driverData.imei || ''}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700"
                disabled
              />
            </div> */}
            <div>
              <label className="block text-sm font-medium mb-1">ID/Iqama Expiry Date</label>
              <input
                type="date"
                value={driverData.iqama_expiry || ''}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nationality</label>
              <input
                type="text"
                value={driverData.nationality || ''}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                type="text"
                value={driverData.city || ''}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={driverData.password || ''}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <input
                type="text"
                value={driverData.gender || ''}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700"
                disabled
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium mb-1">Add Note</label>
              <textarea
                rows="3"
                value={driverData.addNote || ''}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700"
                disabled
              />
            </div>
          </form>
        </div>
      )}
      {activeTab === 'Documents' && (
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Documents</h2>
          <p className="text-gray-400">This section will show all uploaded driver documents like ID proof, license, etc.</p>
          {/* You can map over a `driverData.documents` array if it exists */}
        </div>
      )}
    </div>
  );
}

export default Driver_mange_DrProfile;
