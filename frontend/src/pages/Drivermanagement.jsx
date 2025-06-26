import React, { useEffect, useState, useMemo } from "react"; // Added useMemo
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import {
  ChevronDown, CircleUserRound, ChevronLeft, ChevronRight
} from 'lucide-react';

const Badge = ({ status }) => {
  // Normalize status for consistent display from Django model choices
  let displayStatus = status;
  let color = "bg-gray-500"; // Default for unknown/N/A

  if (status === "approved") {
    displayStatus = "Approved";
    color = "bg-green-600";
  } else if (status === "pending") {
    displayStatus = "Pending";
    color = "bg-yellow-600"; // Added yellow for pending
  } else if (status === "rejected") {
    displayStatus = "Rejected";
    color = "bg-red-600";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-white text-sm ${color}`}>
      {displayStatus || 'N/A'}
    </span>
  );
};

export default function DriverManagement() {
  const [drivers, setDrivers] = useState([]); // All fetched drivers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchId, setSearchId] = useState('');
  const [driverNameSearch, setDriverNameSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState(''); // Assuming vehicleType.vehicle_make or .model
  const [accountStatusFilter, setAccountStatusFilter] = useState(''); // Maps to Django 'status' field
  const [driverStatusFilter, setDriverStatusFilter] = useState(''); // Placeholder, potentially maps to 'status' or a new field

  useEffect(() => {
    axiosInstance.get("/Register/onboarded/")
      .then((response) => {
        setDrivers(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching driver data:", err);
        setError('Failed to load driver data. Please try again.');
        setLoading(false);
      });
  }, []);

  // Filtered drivers based on current filter states
  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => {
      // Driver ID Filter
      if (searchId && !String(driver.id).toLowerCase().includes(searchId.toLowerCase())) {
        return false;
      }

      // Driver Name Filter
      if (driverNameSearch && !String(driver.driver_name).toLowerCase().includes(driverNameSearch.toLowerCase())) {
        return false;
      }

      // City Filter
      if (cityFilter && !String(driver.city).toLowerCase().includes(cityFilter.toLowerCase())) {
        return false;
      }

      // Vehicle Type Filter (assuming vehicleType is an object with vehicle_make/model)
      if (vehicleTypeFilter) {
        const vehicleInfo = `${driver.vehicle.vehicle_type || ''} ${driver.vehicle_type || ''}`.toLowerCase();
        if (!vehicleInfo.includes(vehicleTypeFilter.toLowerCase())) {
          return false;
        }
      }
      
      // Account Status Filter (maps to Django 'status' field: 'approved', 'pending', 'rejected')
      if (accountStatusFilter && String(driver.status).toLowerCase() !== accountStatusFilter.toLowerCase()) {
        return false;
      }

      // Driver Status Filter (mapping 'Active' to 'approved', 'Inactive' to 'pending' or 'rejected')
      if (driverStatusFilter) {
        const driverModelStatus = String(driver.status).toLowerCase();
        if (driverStatusFilter === 'Active' && driverModelStatus !== 'approved') {
          return false;
        }
        if (driverStatusFilter === 'Inactive' && (driverModelStatus === 'approved' || driverModelStatus === 'N/A')) {
          return false;
        }
      }

      return true; // Include driver if all filters pass
    });
  }, [drivers, searchId, driverNameSearch, cityFilter, vehicleTypeFilter, accountStatusFilter, driverStatusFilter]);

  // Reset All Filters
  const handleResetFilters = () => {
    setSearchId('');
    setDriverNameSearch('');
    setCityFilter('');
    setVehicleTypeFilter('');
    setAccountStatusFilter('');
    setDriverStatusFilter('');
  };

  return (
    <div className="min-h-screen w-auto bg-[#F0F5F9] text-[#1E2022] p-10">
      {/* Header */}
      <header className="flex justify-between items-center pb-6 border-b border-gray-700 mb-8 p-5 ">
        <div className="text-sm text-[#52616B]">Organization / Registration Management</div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-3 py-1 bg-[#284B63] hover:bg-[#52616B] text-[#FFFFFF] rounded-full text-sm  transition-colors">
            English <ChevronDown size={16} className="ml-1" />
          </button>
          <CircleUserRound size={24} className="text-[#1E2022]" />
        </div>
      </header>
      <h1 className="text-3xl text-[#187795] font-bold mb-6">Driver Management</h1>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by Driver ID"
          className="px-4 py-2 border  rounded bg-[#D9D9D9] border-gray-700 focus:ring-green-500 focus:border-green-500"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Driver Name"
          className="px-4 py-2 rounded bg-[#D9D9D9] border border-gray-700 focus:ring-green-500 focus:border-green-500"
          value={driverNameSearch}
          onChange={(e) => setDriverNameSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="City"
          className="px-4 py-2 rounded bg-[#D9D9D9] border border-gray-700 focus:ring-green-500 focus:border-green-500"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Vehicle Type"
          className="px-4 py-2 rounded border bg-[#D9D9D9] border-gray-700 focus:ring-green-500 focus:border-green-500"
          value={vehicleTypeFilter}
          onChange={(e) => setVehicleTypeFilter(e.target.value)}
        />
        <select
          className="px-4 py-2 rounded bg-[#D9D9D9] border border-gray-700 focus:ring-green-500 focus:border-green-500"
          value={accountStatusFilter}
          onChange={(e) => setAccountStatusFilter(e.target.value)}
        >
          <option value="">Account Status</option> {/* Empty value for "All" */}
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          className="px-4 py-2 rounded bg-[#D9D9D9] border border-gray-700 focus:ring-green-500 focus:border-green-500"
          value={driverStatusFilter}
          onChange={(e) => setDriverStatusFilter(e.target.value)}
        >
          <option value="">Driver Status</option> {/* Empty value for "All" */}
          <option value="Active">Active</option> {/* Maps to 'approved' */}
          <option value="Inactive">Inactive</option> {/* Maps to 'pending' or 'rejected' */}
        </select>
        <button
          className="col-span-2 md:col-span-1 px-4 py-2 rounded text-white bg-red-700 hover:bg-red-800 transition-colors"
          onClick={handleResetFilters}
        >
          Reset All
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#C9D6DF] overflow-x-auto">
        {loading ? (
          <p className="text-center text-lg py-10">Loading drivers...</p>
        ) : error ? (
          <p className="text-center text-red-500 text-lg py-10">{error}</p>
        ) : filteredDrivers.length === 0 ? (
          <p className="text-center text-gray-500 text-lg py-10">No drivers found matching your criteria.</p>
        ) : (
          <table className="w-full text-left border border-gray-700">
            <thead className="bg-[#284B63]">
              <tr className="text-white uppercase">
                {[
                  "Driver ID",
                  "Driver Name",
                  "Company",
                  "Mobile Number",
                  "Gender",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th key={h} className="px-4 py-2 border border-gray-700">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((d) => ( // Use filteredDrivers here
                <tr key={d.id} className="border-t text-[#353535] border-gray-700 hover:bg-white transition-colors">
                  <td className="px-4 py-2">{d.id}</td>
                  <td className="px-4 py-2">{d.driver_name}</td>
                  <td className="px-4 py-2">{d.company?.company_name || 'N/A'}</td>
                  <td className="px-4 py-2">{d.mobile}</td>
                  <td className="px-4 py-2">{d.gender || 'N/A'}</td>
                  <td className="px-4 py-2">
                    <Badge status={d.status} />
                  </td>
                  <td className="px-4 py-2">
                    <Link to={`/driver-management/Driver_profile/${d.id}`}>
                      <button className="text-blue-500 font-bold hover:underline">View Profile</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
       {/* Pagination (Client-side, currently just showing all filtered results) */}
       <div className="flex justify-between items-center mt-6 text-gray-400">
        <div>Showing 1 to {filteredDrivers.length} of {filteredDrivers.length} entries (Total: {drivers.length})</div>
        <div className="flex space-x-2">
          {/* These buttons are non-functional without pagination logic */}
          <button className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50" disabled>
            <ChevronLeft size={16} /> 
          </button>
          <button className="px-3 py-1 rounded bg-[#00A63E] text-white">1</button>
          <button className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50" disabled>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}