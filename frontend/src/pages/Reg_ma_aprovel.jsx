import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, CircleUserRound, ChevronLeft, ChevronRight, Search, Filter,
  CheckCircle, XCircle, Clock, Users, AlertTriangle, Eye, FileText
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

function Reg_ma_new_approval() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Enhanced filter states
  const [filterRequestStatus, setFilterRequestStatus] = useState('pending');
  const [filterCity, setFilterCity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Statistics
  const [statistics, setStatistics] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [approvalAction, setApprovalAction] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  // Enhanced data fetching
  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('Register/drivers/');
      const driversData = response.data.results || response.data;
      setDrivers(driversData);

      // Calculate statistics
      calculateStatistics(driversData);

      console.log('Drivers loaded for approval:', driversData.length);
    } catch (err) {
      console.error("Failed to fetch drivers:", err);
      if (err.response) {
        setError(`Error: ${err.response.status} - ${err.response.statusText}`);
        toast.error(`Failed to load drivers: ${err.response.status}`);
      } else if (err.request) {
        setError("Network Error: No response received.");
        toast.error("Network error - please check your connection");
      } else {
        setError("An unexpected error occurred.");
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStatistics = (driversData) => {
    const stats = {
      total: driversData.length,
      pending: driversData.filter(d => d.status === 'pending').length,
      approved: driversData.filter(d => d.status === 'approved').length,
      rejected: driversData.filter(d => d.status === 'rejected').length
    };
    setStatistics(stats);
  };

  // Handle approval action
  const handleApprovalAction = async (driverId, action, notes = '') => {
    try {
      await axiosInstance.patch(`Register/drivers/${driverId}/`, {
        status: action,
        approval_notes: notes
      });

      toast.success(`Driver ${action} successfully`);

      // Refresh data
      fetchDrivers();

      // Close modal
      setShowApprovalModal(false);
      setSelectedDriver(null);
      setApprovalAction('');
      setApprovalNotes('');
    } catch (error) {
      console.error('Error updating driver status:', error);
      toast.error('Failed to update driver status');
    }
  };

  // Enhanced filtering and sorting
  const filteredDrivers = drivers
    .filter(driver => {
      const matchesSearch = !searchTerm ||
        driver.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone?.includes(searchTerm) ||
        String(driver.id).includes(searchTerm);

      const matchesStatus = !filterRequestStatus || driver.status === filterRequestStatus;
      const matchesCity = !filterCity || driver.city === filterCity;

      return matchesSearch && matchesStatus && matchesCity;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Get status badge
  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get unique options for filters
  const getUniqueOptions = (key) => {
    return [...new Set(drivers
      .map(driver => {
        if (key === 'vehicle') return driver.vehicle?.vehicle_type;
        return driver[key];
      })
      .filter(Boolean)
    )];
  };

  // Reset filters
  const resetFilters = () => {
    setFilterRequestStatus('');
    setFilterCity('');
    setSearchTerm('');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  return (
    <div className="min-h-screen bg-[#F0F5F9] text-[#1E2022] font-inter">
      <div className="flex flex-col p-8">
        {/* Header */}
        <header className="flex justify-between items-center pb-6 border-b border-gray-700 mb-8">
          <div className="text-sm text-[#52616B]">Organization / Registration Management</div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center rounded-full px-3 py-1 bg-[#284B63] hover:bg-[#52616B] text-[#FFFFFF] transition-colors">
              English <ChevronDown size={16} className="ml-1" />
            </button>
            <CircleUserRound size={24} className="text-[#1E2022]" />
          </div>
        </header>

        {/* Enhanced Page Title & Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-[#187795] mb-2">✅ Driver Approval Management</h1>
            <p className="text-gray-600">Review and approve pending driver applications</p>
          </div>
          <div className="flex space-x-3">
            <Link to="/register-management-dashboard">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors">
                📊 Dashboard
              </button>
            </Link>
            <Link to="/registration-management">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors">
                ➕ New Registration
              </button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
                <div className="text-sm text-yellow-600">Pending Approval</div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-green-600">{statistics.approved}</div>
                <div className="text-sm text-green-600">Approved</div>
              </div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-red-600">{statistics.rejected}</div>
                <div className="text-sm text-red-600">Rejected</div>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{statistics.total}</div>
                <div className="text-sm text-blue-600">Total Applications</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters & Search
            </h3>
            <div className="text-sm text-gray-600">
              Showing {filteredDrivers.length} of {drivers.length} applications
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, phone..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Status</label>
              <select
                value={filterRequestStatus}
                onChange={e => setFilterRequestStatus(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">City</label>
              <select
                value={filterCity}
                onChange={e => setFilterCity(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Cities</option>
                {getUniqueOptions("city").map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Sort By</label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="flex-1 py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="created_at">Date</option>
                  <option value="driver_name">Name</option>
                  <option value="status">Status</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear All Filters
            </button>
            <div className="text-sm text-gray-500">
              {filteredDrivers.length > 0 && `${filteredDrivers.length} result${filteredDrivers.length !== 1 ? 's' : ''} found`}
            </div>
          </div>
        </div>

        {/* Enhanced Approval Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver Name</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-500">Loading applications...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-red-500">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                      {error}
                    </td>
                  </tr>
                ) : filteredDrivers.length > 0 ? (
                  filteredDrivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">#{driver.id}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{driver.driver_name}</div>
                            <div className="text-sm text-gray-500">ID: {driver.iqama}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">{driver.email || 'N/A'}</td>
                      <td className="py-4 px-6 text-sm text-gray-900">{driver.mobile || driver.phone}</td>
                      <td className="py-4 px-6 text-sm text-gray-900">{driver.city}</td>
                      <td className="py-4 px-6">
                        {getStatusBadge(driver.status)}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {formatDate(driver.created_at)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedDriver(driver);
                              setShowApprovalModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {driver.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedDriver(driver);
                                  setApprovalAction('approved');
                                  setShowApprovalModal(true);
                                }}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedDriver(driver);
                                  setApprovalAction('rejected');
                                  setShowApprovalModal(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <div className="text-lg font-medium mb-2">No applications found</div>
                      <div className="text-sm">Try adjusting your search or filter criteria</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enhanced Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            Showing {filteredDrivers.length} of {drivers.length} applications
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-2 bg-blue-600 text-white rounded-md">1</span>
            <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Approval Modal */}
        {showApprovalModal && selectedDriver && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {approvalAction ? `${approvalAction === 'approved' ? 'Approve' : 'Reject'} Driver` : 'Driver Details'}
                </h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="ml-2 text-gray-900">{selectedDriver.driver_name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">ID:</span>
                    <span className="ml-2 text-gray-900">{selectedDriver.iqama}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-900">{selectedDriver.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <span className="ml-2 text-gray-900">{selectedDriver.mobile || selectedDriver.phone}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">City:</span>
                    <span className="ml-2 text-gray-900">{selectedDriver.city}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Current Status:</span>
                    <span className="ml-2">{getStatusBadge(selectedDriver.status)}</span>
                  </div>
                </div>

                {approvalAction && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      rows="3"
                      placeholder={`Add notes for ${approvalAction}...`}
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowApprovalModal(false);
                      setSelectedDriver(null);
                      setApprovalAction('');
                      setApprovalNotes('');
                    }}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  {approvalAction ? (
                    <button
                      onClick={() => handleApprovalAction(selectedDriver.id, approvalAction, approvalNotes)}
                      className={`font-bold py-2 px-4 rounded ${
                        approvalAction === 'approved'
                          ? 'bg-green-500 hover:bg-green-700 text-white'
                          : 'bg-red-500 hover:bg-red-700 text-white'
                      }`}
                    >
                      {approvalAction === 'approved' ? 'Approve Driver' : 'Reject Driver'}
                    </button>
                  ) : (
                    <Link to={`/profileedit/${selectedDriver.id}`}>
                      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Edit Profile
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
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

