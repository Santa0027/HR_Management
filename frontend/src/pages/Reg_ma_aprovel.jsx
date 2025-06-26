import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, CircleUserRound, ChevronLeft, ChevronRight
} from 'lucide-react';
// Import your configured axiosInstance
import axiosInstance from '../api/axiosInstance'; // Adjust this path based on where you saved axiosConfig.js

function Reg_ma_new_approval() {
  const [activeTab, setActiveTab] = useState('New Request'); // This seems to be the default for the component, adjust if needed
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [filterVehicleType, setFilterVehicleType] = useState('');
  const [filterRequestStatus, setFilterRequestStatus] = useState('');
  const [filterRequestId, setFilterRequestId] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterApproval, setFilterApproval] = useState('');

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        // Use axiosInstance.get instead of fetch
        // axiosInstance returns the response data directly in .data
        const response = await axiosInstance.get('Register/drivers/'); // Removed 'http://localhost:8000/'
        setDrivers(response.data); // Axios puts the response body directly in .data
      } catch (err) {
        console.error("Failed to fetch drivers:", err);
        // Axios errors have a 'response' property for server errors
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
    const vtype = driver.vehicle?.vehicle_type || '';
    return (
      (filterVehicleType === '' || vtype === filterVehicleType) &&
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

  // Extract unique vehicle types (primitive strings) for dropdown
  const getUniqueOptions = (key) => {
    return [...new Set(drivers
      .map(driver => {
        if (key === 'vehicle') return driver.vehicle?.vehicle_type; // Correctly access nested vehicle_type
        return driver[key];
      })
      .filter(Boolean) // Filter out null/undefined values
    )];
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-inter">
      <div className="flex flex-col p-8">
        {/* Header */}
        <header className="flex justify-between items-center pb-6 border-b border-gray-700 mb-8">
          <div className="text-sm text-gray-400">Organization / Registration Management</div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-1 bg-gray-900 rounded-full text-sm hover:bg-gray-800 transition-colors">
              English <ChevronDown size={16} className="ml-1" />
            </button>
            <CircleUserRound size={24} className="text-green-400" />
          </div>
        </header>

        {/* Page Title & Add Driver */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Registration Management</h1>
          <Link to="/adddriverform">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition-colors">
              Add Driver
            </button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-gray-700">
          <Link to="/registration-management">
            <button className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'New Request' ? 'bg-gray-900 text-white' : 'hover:bg-gray-800 text-gray-400'}`}>
              New Request
            </button>
          </Link>
          <Link to="/registration-management/aproval_status">
            <button className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'Completed Requests' ? 'bg-gray-900 text-white' : 'hover:bg-gray-800 text-gray-400'}`}>
              Completed Requests
            </button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 p-6 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          {/* Vehicle Type Filter */}
          <div>
            <label htmlFor="vehicleType" className="block text-gray-400 text-sm mb-2">Vehicle Type</label>
            <select
              id="vehicleType"
              value={filterVehicleType}
              onChange={e => setFilterVehicleType(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
            >
              <option value="">Select Vehicle Type</option> {/* Added a default option */}
              {getUniqueOptions('vehicle').map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Other Filters */}
          <div>
            <label htmlFor="requestStatus" className="block text-gray-400 text-sm mb-2">Request Status</label>
            <select
              id="requestStatus"
              value={filterRequestStatus}
              onChange={e => setFilterRequestStatus(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
            >
              <option value="">Select Request Status</option>
              {getUniqueOptions('status').map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="requestId" className="block text-gray-400 text-sm mb-2">Request ID</label>
            <input
              type="text"
              id="requestId"
              value={filterRequestId}
              onChange={e => setFilterRequestId(e.target.value)}
              placeholder="Enter Request ID"
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-gray-400 text-sm mb-2">City</label>
            <select
              id="city"
              value={filterCity}
              onChange={e => setFilterCity(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
            >
              <option value="">Select City</option>
              {getUniqueOptions('city').map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="approval" className="block text-gray-400 text-sm mb-2">Approval</label>
            <select
              id="approval"
              value={filterApproval}
              onChange={e => setFilterApproval(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
            >
              <option value="">Select Approval</option>
              {getUniqueOptions('approval').map(appr => (
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

        {/* Data Table */}
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-gray-900 rounded-lg">
            <thead>
              <tr className="bg-gray-800 text-gray-300 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left rounded-tl-lg">Request #</th>
                <th className="py-3 px-6 text-left">Driver ID</th>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Phone</th>
                <th className="py-3 px-6 text-left">Company</th>
                <th className="py-3 px-6 text-left">Approval</th>
                <th className="py-3 px-6 text-left">Vehicle Type</th>
                <th className="py-3 px-6 text-left">City</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-center rounded-tr-lg">Action</th>
              </tr>
            </thead>

            <tbody className="text-gray-400 text-sm font-light">
              {loading ? (
                <tr><td colSpan="10" className="py-6 text-center">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan="10" className="py-6 text-center text-red-400">{error}</td></tr>
              ) : filteredDrivers.length > 0 ? (
                filteredDrivers.map(driver => (
                  <tr key={driver.id} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                    <td className="py-3 px-6">{driver.id}</td>
                    <td className="py-3 px-6">{driver.iqama}</td>
                    <td className="py-3 px-6">{driver.driver_name}</td>
                    <td className="py-3 px-6">{driver.mobile}</td>
                    <td className="py-3 px-6">{driver.company}</td>
                    <td className="py-3 px-6">{driver.approval}</td>
                    <td className="py-3 px-6">{driver.vehicle?.vehicle_type || '—'}</td>
                    <td className="py-3 px-6">{driver.city}</td>
                    <td className="py-3 px-6">{driver.status}</td>
                    <td className="py-3 px-6 text-center">
                      {/* Assuming this link leads to an approval/detail page for the driver */}
                      <Link to={`/registration-management/aproval_status/driver/${driver.id}`}>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full text-sm">
                          Approve
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="10" className="py-6 text-center text-gray-500">No Entries Available</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center mt-auto space-x-2 text-sm text-gray-400">
          <button className="p-2 rounded-full hover:bg-gray-800"><ChevronLeft size={16} /></button>
          <span className="bg-green-600 text-white px-3 py-1 rounded-full">1</span>
          <button className="p-2 rounded-full hover:bg-gray-800"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}

export default Reg_ma_new_approval;





















  // // src/pages/LoginPage.jsx
  // import React, { useState } from 'react';
  // import { useNavigate } from 'react-router-dom';
  // import { loginUser } from '../services/authService'; // Not default import

  // const LoginPage = () => {
  //   const [credentials, setCredentials] = useState({ email: '', password: '' });
  //   const [error, setError] = useState('');
  //   const navigate = useNavigate();

  //   const handleChange = (e) => {
  //     setCredentials({ ...credentials, [e.target.name]: e.target.value });
  //   };

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     setError('');
  //     try {
  //       const res = await loginUser(credentials);

  //       console.log('Login success:', res);

  //       if (res?.access) {
  //         localStorage.setItem('accessToken', res.access); // ✅ Correct key
  //         localStorage.setItem('refreshToken', res.refresh);
  //         console.log('Navigating to dashboard...');
  //         navigate('/dashboard');
  //       } else {
  //         setError('Unexpected response from server.');
  //       }
  //     } catch (err) {
  //       console.error('Login error:', err);
  //       setError('Invalid credentials. Please try again.');
  //     }
  //   };

  //   return (
  //     <div style={{ padding: '2rem' }}>
  //       <h2>Login</h2>
  //       <form onSubmit={handleSubmit}>
  //         <div>
  //           <label>Email:</label><br />
  //           <input type="email" name="email" value={credentials.email} onChange={handleChange} required />
  //         </div>
  //         <div style={{ marginTop: '1rem' }}>
  //           <label>Password:</label><br />
  //           <input type="password" name="password" value={credentials.password} onChange={handleChange} required />
  //         </div>
  //         {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
  //         <button type="submit" style={{ marginTop: '1rem' }}>Login</button>
  //       </form>
  //     </div>
  //   );
  // };

  // export default LoginPage;
