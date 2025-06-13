import React, { useState } from 'react';
import { ChevronDown, CircleUserRound } from 'lucide-react'; // Importing icons

function Driver_mange_DrProfile() {
  const [activeTab, setActiveTab] = useState('Driver Information'); // State for active tab
  const [driverProfilePicture] = useState('https://placehold.co/100x100/535c9b/ffffff?text=Avatar'); // Placeholder for driver image

  // Sample data for the driver profile, now populated and fixed
  const [driverData] = useState({
    name: 'Ethan kan',
    driverId: 'DRV123456',
    nationalId: '1234567890',
    deliveryProvider: 'Speedy Deliveries',
    phoneNumber: '555-123-4567',
    availability: 'Available',
    status: 'Active', // Fixed status
    dateOfBirth: '1990-05-15', // Sample Date of Birth
    idIqama: 'AB1234567',
    country: 'Saudi Arabia',
    imei: '987654321098765',
    idIqamaExpiryDate: '2025-12-31',
    nationality: 'Saudi',
    city: 'Riyadh',
    password: '*************', // Representing a masked password
    gender: 'Male',
    addNote: 'Driver has consistently met delivery targets and maintains a high customer satisfaction rating. Excellent communication skills.',
  });

  return (
    <div className="min-h-screen bg-black text-gray-200 font-inter p-8">
      {/* Main Content */}
      <div className="flex flex-col">
        {/* Top Bar for Language and User Icon */}
        <div className="flex justify-end items-center mb-6"> {/* Changed justify-between to justify-end */}
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm transition-colors">
              English <ChevronDown size={16} className="ml-1" />
            </button>
            <CircleUserRound size={24} className="text-green-400" />
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-6">Driver Management / Driver Profile</div>

        {/* Driver Profile Header Section */}
        <div className="bg-gray-900 p-6 rounded-lg flex items-center mb-8">
          <img
            src={driverProfilePicture}
            alt="Driver Avatar"
            className="w-24 h-24 rounded-full object-cover mr-6"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/535c9b/ffffff?text=Avatar'; }} // Fallback
          />
          <div>
            <h1 className="text-3xl font-semibold text-white mb-2">Driver Profile</h1>
            <h2 className="text-2xl font-medium text-green-400 mb-4">{driverData.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-2 text-sm text-gray-400">
              <div><span className="font-semibold text-gray-300">Driver ID:</span> {driverData.driverId}</div>
              <div><span className="font-semibold text-gray-300">National ID:</span> {driverData.nationalId}</div>
              <div><span className="font-semibold text-gray-300">Delivery Provider:</span> {driverData.deliveryProvider}</div>
              <div><span className="font-semibold text-gray-300">Phone Number:</span> {driverData.phoneNumber}</div>
              <div><span className="font-semibold text-gray-300">Availability:</span> {driverData.availability}</div>
              <div>
                <span className="font-semibold text-gray-300">Status:</span>{' '}
                {/* Status is now a button */}
                <button
                  className={`py-1 px-3 rounded-full text-xs font-medium transition-colors ${
                    driverData.status === 'Active' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}
                  disabled // Make the button non-interactive
                >
                  {driverData.status}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Driver Details */}
        <div className="flex space-x-4 mb-8 border-b border-gray-700">
          <button
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'Driver Information' ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-400'
            }`}
            onClick={() => setActiveTab('Driver Information')}
          >
            Driver Information
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'Vehicle Information' ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-400'
            }`}
            onClick={() => setActiveTab('Vehicle Information')}
          >
            Vehicle Information
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'Attachments' ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-400'
            }`}
            onClick={() => setActiveTab('Attachments')}
          >
            Attachments
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'Logs' ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-400'
            }`}
            onClick={() => setActiveTab('Logs')}
          >
            Logs
          </button>
        </div>

        {/* Content based on active tab */}
        <div className="bg-gray-900 p-6 rounded-lg mb-8">
          {activeTab === 'Driver Information' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Row 1 */}
              <div>
                <label htmlFor="idIqama" className="block text-gray-400 text-sm mb-2">ID/Iqama</label>
                <input
                  type="text"
                  id="idIqama"
                  value={driverData.idIqama}
                  readOnly // Make read-only
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-gray-400 text-sm mb-2">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  value={driverData.dateOfBirth}
                  readOnly // Make read-only
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              {/* Row 2 */}
              <div>
                <label htmlFor="country" className="block text-gray-400 text-sm mb-2">Country</label>
                <input
                  type="text"
                  id="country"
                  value={driverData.country}
                  readOnly // Make read-only
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="imei" className="block text-gray-400 text-sm mb-2">Imei</label>
                <input
                  type="text"
                  id="imei"
                  value={driverData.imei}
                  readOnly // Make read-only
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              {/* Row 3 */}
              <div>
                <label htmlFor="phoneNumber" className="block text-gray-400 text-sm mb-2">Phone Number</label>
                <input
                  type="text"
                  id="phoneNumber"
                  value={driverData.phoneNumber}
                  readOnly // Make read-only
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="idIqamaExpiryDate" className="block text-gray-400 text-sm mb-2">ID/Iqama Expiry Date</label>
                <input
                  type="text"
                  id="idIqamaExpiryDate"
                  value={driverData.idIqamaExpiryDate}
                  readOnly // Make read-only
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              {/* Row 4 */}
              <div>
                <label htmlFor="nationality" className="block text-gray-400 text-sm mb-2">Nationality</label>
                <input
                  type="text"
                  id="nationality"
                  value={driverData.nationality}
                  readOnly // Make read-only
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-gray-400 text-sm mb-2">City</label>
                <input
                  type="text"
                  id="city"
                  value={driverData.city}
                  readOnly // Make read-only
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              {/* Row 5 */}
              <div>
                <label htmlFor="password" className="block text-gray-400 text-sm mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  value={driverData.password}
                  readOnly // Make read-only
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-gray-400 text-sm mb-2">Gender</label>
                <input
                  type="text"
                  id="gender"
                  value={driverData.gender}
                  readOnly // Make read-only
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              {/* Add Note */}
              <div className="md:col-span-2"> {/* Span full width on medium screens and up */}
                <label htmlFor="addNote" className="block text-gray-400 text-sm mb-2">Add Note</label>
                <textarea
                  id="addNote"
                  rows="4"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={driverData.addNote}
                  readOnly // Make read-only
                ></textarea>
              </div>
            </div>
          )}
          {/* Placeholder for other tabs - add content here if needed */}
          {activeTab === 'Vehicle Information' && <div className="text-gray-400">Vehicle Information content goes here.</div>}
          {activeTab === 'Attachments' && <div className="text-gray-400">Attachments content goes here.</div>}
          {activeTab === 'Logs' && <div className="text-gray-400">Logs content goes here.</div>}
        </div>

        {/* Edit Button */}
        <div className="flex justify-center">
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-medium text-lg transition-colors">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

export default Driver_mange_DrProfile;
