import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, CircleUserRound
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

function Reg_ma_new_request() {
  const [activeTab, setActiveTab] = useState('New Request');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterVehicleType, setFilterVehicleType] = useState('');
  const [filterRequestStatus, setFilterRequestStatus] = useState('');
  const [filterRequestId, setFilterRequestId] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterApproval, setFilterApproval] = useState('');

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await axiosInstance.get('Register/drivers/');
        setDrivers(response.data);
      } catch (err) {
        console.error("Failed to fetch drivers:", err);
        if (err.response) {
          setError(`Error: ${err.response.status} - ${err.response.statusText}`);
        } else if (err.request) {
          setError("Network Error: No response received.");
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  const filteredDrivers = drivers.filter(driver => {
    return (
      (filterVehicleType === '' || (driver.vehicle && driver.vehicle.vehicle_type === filterVehicleType)) &&
      (filterRequestStatus === '' || driver.status === filterRequestStatus) &&
      (filterRequestId === '' || String(driver.id).includes(filterRequestId)) &&
      (filterCity === '' || driver.city === filterCity) &&
      (filterApproval === '' || driver.approval === filterApproval)
    );
  });

  const resetFilters = () => {
    setFilterVehicleType('');
    setFilterRequestStatus('');
    setFilterRequestId('');
    setFilterCity('');
    setFilterApproval('');
  };

  const getUniqueOptions = (key) => {
    if (key === 'vehicle') {
      return [...new Set(drivers.map(driver => driver.vehicle?.vehicle_type).filter(Boolean))]
        .map(type => ({ vehicle_type: type }));
    }
    return [...new Set(drivers.map(driver => driver[key]).filter(Boolean))];
  };

  return (
    <div className="min-h-screen bg-white text-[#1E2022] font-inter">
      <div className="flex flex-col p-8">
        <header className="flex justify-between items-center pb-6 border-b border-gray-700 mb-8">
          <div className="text-sm text-[#52616B]">Organization / Registration Management</div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-1 bg-[#284B63] hover:bg-[#52616B] text-[#FFFFFF] rounded-full text-sm">
              English <ChevronDown size={16} className="ml-1" />
            </button>
            <CircleUserRound size={24} className="text-[#1E2022]" />
          </div>
        </header>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-[#187795]">Driver Registration Management</h1>
          <Link to="/adddriverform">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium">
              Add Driver
            </button>
          </Link>
        </div>

        <div className="flex space-x-4 mb-8 border-b border-gray-700">
          <Link to="/registration-management">
            <button className={`bg-[#284B63] px-4 py-2 rounded-t-lg font-medium ${activeTab === 'New Request' ? 'bg-gray-900 text-white' : 'hover:bg-gray-800 text-gray-400'}`}>
              New Request
            </button>
          </Link>
          <Link to="/registration-management/aproval_status">
            <button className="px-4 py-2 rounded-t-lg font-medium hover:bg-gray-800 hover:text-white text-gray-500">
              Completed Requests
            </button>
          </Link>
        </div>

        <div className="bg-[#C9D6DF] p-6 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <div>
            <label className="block text-[#353535] text-sm mb-2">Vehicle Type</label>
            <select
              value={filterVehicleType}
              onChange={e => setFilterVehicleType(e.target.value)}
              className="w-full bg-[#D9D9D9] border border-gray-700 rounded-md py-2 px-3 text-[#353535]"
            >
              <option value="">Select Vehicle</option>
              {getUniqueOptions("vehicle").map(vehicle => (
                <option key={vehicle.vehicle_type} value={vehicle.vehicle_type}>{vehicle.vehicle_type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[#353535] text-sm mb-2">Request Status</label>
            <select
              value={filterRequestStatus}
              onChange={e => setFilterRequestStatus(e.target.value)}
              className="w-full bg-[#D9D9D9] border border-gray-700 rounded-md py-2 px-3 text-[#353535]"
            >
              <option value="">Select Request Status</option>
              {getUniqueOptions("status").map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[#353535] text-sm mb-2">Request ID</label>
            <input
              type="text"
              value={filterRequestId}
              onChange={e => setFilterRequestId(e.target.value)}
              placeholder="Enter Request ID"
              className="w-full bg-[#D9D9D9] border border-gray-700 rounded-md py-2 px-3 text-[#353535]"
            />
          </div>
          <div>
            <label className="block text-[#353535] text-sm mb-2">City</label>
            <select
              value={filterCity}
              onChange={e => setFilterCity(e.target.value)}
              className="w-full bg-[#D9D9D9] border border-gray-700 rounded-md py-2 px-3 text-[#353535]"
            >
              <option value="">Select City</option>
              {getUniqueOptions("city").map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[#353535] text-sm mb-2">Approval</label>
            <select
              value={filterApproval}
              onChange={e => setFilterApproval(e.target.value)}
              className="w-full bg-[#D9D9D9] border border-gray-700 rounded-md py-2 px-3 text-[#353535]"
            >
              <option value="">Select Approval</option>
              {getUniqueOptions("approval").map(appr => (
                <option key={appr} value={appr}>{appr}</option>
              ))}
            </select>
          </div>
          <div className="flex space-x-2">
            <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium">Sorting</button>
            <button
              onClick={resetFilters}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Reset All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-gray-900 rounded-lg">
            <thead>
              <tr className="bg-[#284B63] text-white uppercase text-sm">
                <th className="py-3 px-6 text-left rounded-tl-lg">Request Number</th>
                <th className="py-3 px-6 text-left">Driver ID</th>
                <th className="py-3 px-6 text-left">Driver Name</th>
                <th className="py-3 px-6 text-left">Phone Number</th>
                <th className="py-3 px-6 text-left">Delivery Provider</th>
                <th className="py-3 px-6 text-left">Tawseel Approval</th>
                <th className="py-3 px-6 text-left">Vehicle Type</th>
                <th className="py-3 px-6 text-left">City</th>
                <th className="py-3 px-6 text-left">Request Status</th>
                <th className="py-3 px-6 text-center rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-400 bg-[#C9D6DF] text-sm font-light">
              {loading ? (
                <tr><td colSpan="10" className="py-6 text-center">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan="10" className="py-6 text-center text-red-400">{error}</td></tr>
              ) : filteredDrivers.length > 0 ? (
                filteredDrivers.map((driver, index) => (
                  <tr key={index} className="border-b text-[#353535] font-bold border-gray-800 hover:bg-white">
                    <td className="py-3 px-6">{driver.driver_}</td>
                    <td className="py-3 px-6">{driver.iqama}</td>
                    <td className="py-3 px-6">{driver.driver_name}</td>
                    <td className="py-3 px-6">{driver.mobile}</td>
                    <td className="py-3 px-6">{driver.company?.company_name}</td>
                    <td className="py-3 px-6">{driver.approval}</td>
                    <td className="py-3 px-6">{driver.vehicle?.vehicle_type || 'No Vehicle Assigned'}</td>
                    <td className="py-3 px-6">{driver.city}</td>
                    <td className="py-3 px-6">{driver.status}</td>
                    <td className="py-3 px-6 text-center">
                      <Link to={`/profileedit/${driver.id}`}>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md">Edit</button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="10" className="py-6 text-center">No drivers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reg_ma_new_request;