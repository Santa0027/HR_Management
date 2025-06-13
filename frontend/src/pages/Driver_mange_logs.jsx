import React, { useState } from 'react';
import { ChevronDown, CircleUserRound } from 'lucide-react'; // Importing icons

function Driver_mange_logs() {
  const [activeTab, setActiveTab] = useState('Logs'); // Default to Logs tab
  const [driverProfilePicture] = useState('https://placehold.co/100x100/535c9b/ffffff?text=Avatar'); // Placeholder for driver image

  // Sample data for the driver profile (read-only for the header)
  const driverHeaderData = {
    name: 'Ethan kan',
    driverId: 'DRV123456',
    nationalId: '1234567890',
    deliveryProvider: 'Speedy Deliveries',
    phoneNumber: '555-123-4567',
    availability: 'Available',
    status: 'Active', // Fixed status
  };

  // Sample data for Logs tab
  const logData = {
    totalWorkingTime: '120h 30m',
    totalWorkingDays: '20',
    entries: [
      {
        date: '2025-05-10',
        startedWorkingAt: '08:00 AM',
        finishedWorkingAt: '06:00 PM',
        duration: '10h 00m',
      },
      {
        date: '2025-05-15',
        startedWorkingAt: '09:00 AM',
        finishedWorkingAt: '05:00 PM',
        duration: '8h 00m',
      },
      {
        date: '2025-05-20',
        startedWorkingAt: '08:30 AM',
        finishedWorkingAt: '06:30 PM',
        duration: '10h 00m',
      },
      {
        date: '2025-05-25',
        startedWorkingAt: '09:30 AM',
        finishedWorkingAt: '07:30 PM',
        duration: '10h 00m',
      },
      {
        date: '2025-05-30',
        startedWorkingAt: '08:00 AM',
        finishedWorkingAt: '05:00 PM',
        duration: '9h 00m',
      },
    ],
  };

  // Fixed values for From and To dates in Logs
  const fromDate = '2025-05-01';
  const toDate = '2025-05-31';

  return (
    <div className="min-h-screen bg-black text-gray-200 font-inter p-8">
      {/* Main Content */}
      <div className="flex flex-col">
        {/* Top Bar for Language and User Icon */}
        <div className="flex justify-end items-center mb-6">
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
            <h2 className="text-2xl font-medium text-green-400 mb-4">{driverHeaderData.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-2 text-sm text-gray-400">
              <div><span className="font-semibold text-gray-300">Driver ID:</span> {driverHeaderData.driverId}</div>
              <div><span className="font-semibold text-gray-300">National ID:</span> {driverHeaderData.nationalId}</div>
              <div><span className="font-semibold text-gray-300">Delivery Provider:</span> {driverHeaderData.deliveryProvider}</div>
              <div><span className="font-semibold text-gray-300">Phone Number:</span> {driverHeaderData.phoneNumber}</div>
              <div><span className="font-semibold text-gray-300">Availability:</span> {driverHeaderData.availability}</div>
              <div>
                <span className="font-semibold text-gray-300">Status:</span>{' '}
                <button
                  className={`py-1 px-3 rounded-full text-xs font-medium transition-colors ${
                    driverHeaderData.status === 'Active' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}
                  disabled
                >
                  {driverHeaderData.status}
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
          {activeTab === 'Logs' && (
            <div>
              {/* From and To Date Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label htmlFor="fromDate" className="block text-gray-400 text-sm mb-2">From</label>
                  <input
                    type="date"
                    id="fromDate"
                    value={fromDate}
                    readOnly
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="toDate" className="block text-gray-400 text-sm mb-2">To</label>
                  <input
                    type="date"
                    id="toDate"
                    value={toDate}
                    readOnly
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Total Working Time and Days */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-800 p-4 rounded-md">
                  <div className="text-gray-400 text-sm mb-1">Total Working Time</div>
                  <div className="text-2xl font-semibold text-white">{logData.totalWorkingTime}</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-md">
                  <div className="text-gray-400 text-sm mb-1">Total Working Days</div>
                  <div className="text-2xl font-semibold text-white">{logData.totalWorkingDays}</div>
                </div>
              </div>

              {/* Log Entries Table */}
              <h3 className="text-xl font-semibold text-white mb-4">Date</h3> {/* "Date" as a section header */}
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-900 rounded-lg">
                  <thead>
                    <tr className="bg-gray-800 text-gray-300 uppercase text-sm leading-normal">
                      <th className="py-3 px-6 text-left rounded-tl-lg">Date</th>
                      <th className="py-3 px-6 text-left">Started Working At</th>
                      <th className="py-3 px-6 text-left">Finished Working At</th>
                      <th className="py-3 px-6 text-left rounded-tr-lg">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-400 text-sm font-light">
                    {logData.entries.map((entry, index) => (
                      <tr key={index} className="border-b border-gray-800 hover:bg-gray-700">
                        <td className="py-3 px-6 text-left whitespace-nowrap">{entry.date}</td>
                        <td className="py-3 px-6 text-left whitespace-nowrap">{entry.startedWorkingAt}</td>
                        <td className="py-3 px-6 text-left whitespace-nowrap">{entry.finishedWorkingAt}</td>
                        <td className="py-3 px-6 text-left whitespace-nowrap">{entry.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'Driver Information' && <div className="text-gray-400">Driver Information content goes here.</div>}
          {activeTab === 'Vehicle Information' && <div className="text-gray-400">Vehicle Information content goes here.</div>}
          {activeTab === 'Attachments' && <div className="text-gray-400">Attachments content goes here.</div>}
        </div>

        {/* Save Button (removed) */}
        {/* <div className="flex justify-center">
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-medium text-lg transition-colors">
            Save
          </button>
        </div> */}
      </div>
    </div>
  );
}

export default Driver_mange_logs;
