import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, Briefcase, Truck, ChevronDown, Bell, CircleUserRound, ChevronLeft, ChevronRight } from 'lucide-react'; // Importing icons

function Reg_ma_new_request() {
  const [activeMenuItem, setActiveMenuItem] = useState('Registration Management');
  const [activeTab, setActiveTab] = useState('New Request');
  const [isHrManagementOpen, setIsHrManagementOpen] = useState(false);

  const navItems = [
    { name: 'Driver Management', icon: <Users size={20} />, id: 'Driver Management' },
    { name: 'Registration Management', icon: <LayoutDashboard size={20} />, id: 'Registration Management' },
    {
      name: 'HR Management',
      icon: <UserCog size={20} />,
      id: 'HR Management',
      subItems: [
        { name: 'New Request (0)', id: 'HR New Request' },
        { name: 'Completed Requests (8)', id: 'HR Completed Requests' },
      ]
    },
    { name: 'Accounts Management', icon: <Briefcase size={20} />, id: 'Accounts Management' },
  ];

  return (
    <div className="min-h-screen bg-black text-gray-200 font-inter"> {/* Changed main background to black */}
      {/* Main Content */}
      <div className="flex flex-col p-8"> {/* Removed 'flex-1' from main content */}
        {/* Header */}
        <header className="flex justify-between items-center pb-6 border-b border-gray-700 mb-8">
          <div className="text-sm text-gray-400">Organization / Registration Management</div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-1 bg-gray-900 rounded-full text-sm hover:bg-gray-800 transition-colors"> {/* Darker button background */}
              English <ChevronDown size={16} className="ml-1" />
            </button>
            <CircleUserRound size={24} className="text-green-400" /> {/* Changed icon color to green */}
          </div>
        </header>

        {/* Page Title & Add Driver Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Registration Management</h1>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition-colors"> {/* Changed button to green */}
            Add Driver
          </button>
        </div>

        {/* Tabs */}

        <div className="flex space-x-4 mb-8 border-b border-gray-700">
          <Link to="/registration-management">
            <button
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'New Request'
                  ? 'bg-gray-900 text-white'
                  : 'hover:bg-gray-800 text-gray-400'
                }`}
            >
              New Request
            </button>
          </Link>

          <Link to="/registration-management/aproval_status">
            <button
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'Completed Requests'
                  ? 'bg-gray-900 text-white'
                  : 'hover:bg-gray-800 text-gray-400'
                }`}
            >
              Completed Requests
            </button>
          </Link>
        </div>

        {/* Filter Section */}
        <div className="bg-gray-900 p-6 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end"> {/* Darker filter section background */}
          <div>
            <label htmlFor="vehicleType" className="block text-gray-400 text-sm mb-2">Vehicle Type</label>
            <select id="vehicleType" className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"> {/* Darker select background, green ring */}
              <option>Select Vehicle Type</option>
              {/* Add more options here */}
            </select>
          </div>
          <div>
            <label htmlFor="requestStatus" className="block text-gray-400 text-sm mb-2">Request Status</label>
            <select id="requestStatus" className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"> {/* Darker select background, green ring */}
              <option>Select Request Status</option>
              {/* Add more options here */}
            </select>
          </div>
          <div>
            <label htmlFor="requestId" className="block text-gray-400 text-sm mb-2">Request ID</label>
            <input type="text" id="requestId" placeholder="Enter Request ID" className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500" /> {/* Darker input background, green ring */}
          </div>
          <div>
            <label htmlFor="city" className="block text-gray-400 text-sm mb-2">City</label>
            <select id="city" className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"> {/* Darker select background, green ring */}
              <option>Select City</option>
              {/* Add more options here */}
            </select>
          </div>
          <div>
            <label htmlFor="approval" className="block text-gray-400 text-sm mb-2">Approval</label>
            <select id="approval" className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"> {/* Darker select background, green ring */}
              <option>Select Approval</option>
              {/* Add more options here */}
            </select>
          </div>
          <div className="flex space-x-2">
            <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors"> {/* Darker button background */}
              Sorting
            </button>
            <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors"> {/* Darker button background */}
              Reset All
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-gray-900 rounded-lg"> {/* Darker table background */}
            <thead>
              <tr className="bg-gray-800 text-gray-300 uppercase text-sm leading-normal"> {/* Darker table header background */}
                <th className="py-3 px-6 text-left rounded-tl-lg">Request Number</th>
                <th className="py-3 px-6 text-left">Driver ID</th>
                <th className="py-3 px-6 text-left">Driver name</th>
                <th className="py-3 px-6 text-left">Driver Number</th>
                <th className="py-3 px-6 text-left">Phone Number</th>
                <th className="py-3 px-6 text-left">Delivery Provider</th>
                <th className="py-3 px-6 text-left">Tawseel Approval</th>
                <th className="py-3 px-6 text-left">Vehicle Type</th>
                <th className="py-3 px-6 text-left">City</th>
                <th className="py-3 px-6 text-left">Request Status</th>
                <th className="py-3 px-6 text-center rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-400 text-sm font-light">
              <tr className="border-b border-gray-800"> {/* Darker border */}
                <td className="py-3 px-6 text-center" colSpan="11">
                  <div className="text-lg font-semibold mt-8 mb-2">No Entries Available</div>
                  <div className="text-sm text-gray-500 mb-8">
                    There are currently no entries available. Please check back later or add
                    new entries to view them here.
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center mt-auto space-x-2 text-sm text-gray-400">
          <button className="p-2 rounded-full hover:bg-gray-800 transition-colors"> {/* Darker pagination button background */}
            <ChevronLeft size={16} />
          </button>
          <span className="bg-green-600 text-white px-3 py-1 rounded-full">1</span> {/* Changed pagination active to green */}
          <button className="p-2 rounded-full hover:bg-gray-800 transition-colors"> {/* Darker pagination button background */}
            <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}

export default Reg_ma_new_request;
