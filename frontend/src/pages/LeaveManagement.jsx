import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [loading, setLoading] = useState(false);

  // State for leave management data
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [stats, setStats] = useState({});

  // Modal states
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [typeForm, setTypeForm] = useState({
    name: '',
    description: '',
    max_days_per_year: 30,
    is_paid: true,
    requires_approval: true,
    advance_notice_days: 1,
    is_active: true
  });

  const [approvalForm, setApprovalForm] = useState({
    status: '',
    admin_comments: ''
  });

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    driver: '',
    leave_type: '',
    year: new Date().getFullYear()
  });

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [requestsRes, typesRes, balancesRes, driversRes, statsRes] = await Promise.all([
        axiosInstance.get('/hr/leave-requests/', { params: filters }),
        axiosInstance.get('/hr/leave-types/'),
        axiosInstance.get('/hr/leave-balances/'),
        axiosInstance.get('/Register/drivers/'),
        axiosInstance.get('/hr/leave-requests/stats/')
      ]);

      setLeaveRequests(requestsRes.data.results || requestsRes.data);
      setLeaveTypes(typesRes.data.results || typesRes.data);
      setLeaveBalances(balancesRes.data.results || balancesRes.data);
      setDrivers(driversRes.data.results || driversRes.data);
      setStats(statsRes.data);

      console.log('Leave management data loaded:', {
        requests: requestsRes.data.results?.length || requestsRes.data.length,
        types: typesRes.data.results?.length || typesRes.data.length,
        balances: balancesRes.data.results?.length || balancesRes.data.length,
        drivers: driversRes.data.results?.length || driversRes.data.length,
        stats: statsRes.data
      });
    } catch (error) {
      console.error('Error fetching leave management data:', error);
      toast.error('Failed to load leave management data');
    } finally {
      setLoading(false);
    }
  };



  // Create leave type
  const handleCreateType = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/hr/leave-types/', typeForm);
      toast.success('Leave type created successfully');
      setShowTypeModal(false);
      setTypeForm({
        name: '',
        description: '',
        max_days_per_year: 30,
        is_paid: true,
        requires_approval: true,
        advance_notice_days: 1,
        is_active: true
      });
      fetchData();
    } catch (error) {
      console.error('Error creating leave type:', error);
      toast.error('Failed to create leave type');
    } finally {
      setLoading(false);
    }
  };

  // Handle approval/rejection
  const handleApproval = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setLoading(true);
    try {
      const action = approvalForm.status === 'approved' ? 'approve' : 'reject';
      await axiosInstance.post(`/hr/leave-requests/${selectedRequest.id}/${action}/`, {
        admin_comments: approvalForm.admin_comments
      });

      toast.success(`Leave request ${approvalForm.status} successfully`);
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setApprovalForm({ status: '', admin_comments: '' });
      fetchData();
    } catch (error) {
      console.error('Error updating leave request:', error);
      toast.error('Failed to update leave request');
    } finally {
      setLoading(false);
    }
  };

  // Initialize leave balances
  const initializeBalances = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/hr/leave-balances/initialize-balances/', {
        year: filters.year
      });
      toast.success(response.data.message);
      fetchData();
    } catch (error) {
      console.error('Error initializing balances:', error);
      toast.error('Failed to initialize leave balances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Helper functions
  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const openApprovalModal = (request, status) => {
    setSelectedRequest(request);
    setApprovalForm({ status, admin_comments: '' });
    setShowApprovalModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Statistics */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">📅 Leave Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total_requests || 0}</div>
            <div className="text-sm text-blue-600">Total Requests</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending_requests || 0}</div>
            <div className="text-sm text-yellow-600">Pending</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{stats.approved_requests || 0}</div>
            <div className="text-sm text-green-600">Approved</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">{stats.rejected_requests || 0}</div>
            <div className="text-sm text-red-600">Rejected</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Leave Requests
            </button>
            <button
              onClick={() => setActiveTab('balances')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'balances'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⚖️ Leave Balances
            </button>
            <button
              onClick={() => setActiveTab('types')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'types'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏷️ Leave Types
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Leave Requests Tab */}
          {activeTab === 'requests' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Leave Requests - Admin Approval</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-sm">
                    <strong>📋 Admin View:</strong> Review and approve/reject leave requests submitted by drivers
                  </p>
                </div>
              </div>

              {/* Admin Filters */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">🔍 Filter Leave Requests</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="pending">⏳ Pending Review</option>
                    <option value="approved">✅ Approved</option>
                    <option value="rejected">❌ Rejected</option>
                    <option value="cancelled">🚫 Cancelled</option>
                  </select>
                  <select
                    value={filters.driver}
                    onChange={(e) => setFilters({ ...filters, driver: e.target.value })}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Drivers</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        👤 {driver.driver_name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.leave_type}
                    onChange={(e) => setFilters({ ...filters, leave_type: e.target.value })}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Leave Types</option>
                    {leaveTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        🏷️ {type.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={filters.year}
                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="📅 Year (e.g., 2025)"
                  />
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  💡 <strong>Tip:</strong> Focus on "Pending Review" to see requests awaiting your approval
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Driver
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Leave Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Days
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applied Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leaveRequests.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-8 text-center">
                            <div className="text-gray-500">
                              <div className="text-4xl mb-2">📋</div>
                              <div className="text-lg font-medium">No leave requests found</div>
                              <div className="text-sm">Drivers will submit requests that appear here for your review</div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        leaveRequests.map((request) => (
                          <tr
                            key={request.id}
                            className={`${
                              request.status === 'pending'
                                ? 'bg-yellow-50 border-l-4 border-yellow-400'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div className="flex items-center">
                                <div className="text-2xl mr-2">👤</div>
                                <div>
                                  <div className="font-semibold">{request.driver_name}</div>
                                  <div className="text-xs text-gray-500">Driver ID: {request.driver_id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <div className="text-lg mr-2">🏷️</div>
                                <div>{request.leave_type_name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <div className="text-lg mr-2">📅</div>
                                <div>
                                  <div>{formatDate(request.start_date)}</div>
                                  <div className="text-xs text-gray-400">to {formatDate(request.end_date)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <div className="text-lg mr-2">⏱️</div>
                                <div className="font-semibold">{request.total_days} days</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(request.status)}
                              {request.status === 'pending' && (
                                <div className="text-xs text-yellow-600 mt-1 font-medium">
                                  ⚠️ Needs Review
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <div className="text-lg mr-2">📝</div>
                                <div>
                                  <div>{formatDate(request.applied_date)}</div>
                                  <div className="text-xs text-gray-400">Applied</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {request.status === 'pending' ? (
                                <div className="flex flex-col space-y-2">
                                  <button
                                    onClick={() => openApprovalModal(request, 'approved')}
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                  >
                                    ✅ Approve
                                  </button>
                                  <button
                                    onClick={() => openApprovalModal(request, 'rejected')}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                  >
                                    ❌ Reject
                                  </button>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <div className="text-gray-400 text-xs">
                                    {request.status === 'approved' && '✅ Approved'}
                                    {request.status === 'rejected' && '❌ Rejected'}
                                    {request.status === 'cancelled' && '🚫 Cancelled'}
                                  </div>
                                  {request.reviewed_date && (
                                    <div className="text-xs text-gray-400 mt-1">
                                      {formatDate(request.reviewed_date)}
                                    </div>
                                  )}
                                  {request.admin_comments && (
                                    <div className="text-xs text-gray-500 mt-1 italic">
                                      "{request.admin_comments.substring(0, 30)}..."
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Leave Balances Tab */}
          {activeTab === 'balances' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Leave Balances</h2>
                <button
                  onClick={initializeBalances}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  disabled={loading}
                >
                  🔄 Initialize Balances
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Driver
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Leave Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Allocated
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Used
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pending
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remaining
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leaveBalances.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                            No leave balances found. Click "Initialize Balances" to create them.
                          </td>
                        </tr>
                      ) : (
                        leaveBalances.map((balance) => (
                          <tr key={balance.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {balance.driver_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {balance.leave_type_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {balance.year}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {balance.allocated_days}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {balance.used_days}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {balance.pending_days}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                balance.remaining_days > 5
                                  ? 'bg-green-100 text-green-800'
                                  : balance.remaining_days > 0
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {balance.remaining_days} days
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Leave Types Tab */}
          {activeTab === 'types' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Leave Types</h2>
                <button
                  onClick={() => setShowTypeModal(true)}
                  className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  disabled={loading}
                >
                  ➕ New Leave Type
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {leaveTypes.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-8">
                      No leave types found
                    </div>
                  ) : (
                    leaveTypes.map((type) => (
                      <div key={type.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            type.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {type.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Max Days/Year:</span>
                            <span className="font-medium">{type.max_days_per_year}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Paid:</span>
                            <span className={type.is_paid ? 'text-green-600' : 'text-red-600'}>
                              {type.is_paid ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Requires Approval:</span>
                            <span className={type.requires_approval ? 'text-yellow-600' : 'text-green-600'}>
                              {type.requires_approval ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Advance Notice:</span>
                            <span className="font-medium">{type.advance_notice_days} days</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>



      {/* New Leave Type Modal */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Leave Type</h3>
              <form onSubmit={handleCreateType}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={typeForm.name}
                    onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Description
                  </label>
                  <textarea
                    value={typeForm.description}
                    onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows="3"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Max Days Per Year *
                  </label>
                  <input
                    type="number"
                    value={typeForm.max_days_per_year}
                    onChange={(e) => setTypeForm({ ...typeForm, max_days_per_year: e.target.value })}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    min="1"
                  />
                </div>
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    id="is_paid"
                    checked={typeForm.is_paid}
                    onChange={(e) => setTypeForm({ ...typeForm, is_paid: e.target.checked })}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_paid" className="text-gray-700 text-sm font-bold">
                    Is Paid Leave
                  </label>
                </div>
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    id="requires_approval"
                    checked={typeForm.requires_approval}
                    onChange={(e) => setTypeForm({ ...typeForm, requires_approval: e.target.checked })}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requires_approval" className="text-gray-700 text-sm font-bold">
                    Requires Approval
                  </label>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Advance Notice Days *
                  </label>
                  <input
                    type="number"
                    value={typeForm.advance_notice_days}
                    onChange={(e) => setTypeForm({ ...typeForm, advance_notice_days: e.target.value })}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    min="0"
                  />
                </div>
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={typeForm.is_active}
                    onChange={(e) => setTypeForm({ ...typeForm, is_active: e.target.checked })}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="text-gray-700 text-sm font-bold">
                    Is Active
                  </label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowTypeModal(false)}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Leave Type'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Approval/Rejection Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                {approvalForm.status === 'approved' ? '✅ Approve' : '❌ Reject'} Leave Request
              </h3>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-semibold text-gray-800 mb-3">📋 Request Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">👤 Driver:</span>
                    <span className="font-medium">{selectedRequest.driver_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">🏷️ Leave Type:</span>
                    <span className="font-medium">{selectedRequest.leave_type_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">📅 Period:</span>
                    <span className="font-medium">{formatDate(selectedRequest.start_date)} - {formatDate(selectedRequest.end_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">⏱️ Duration:</span>
                    <span className="font-medium">{selectedRequest.total_days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">📝 Applied:</span>
                    <span className="font-medium">{formatDate(selectedRequest.applied_date)}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-gray-600 text-sm">📝 Reason:</span>
                  <div className="mt-1 p-2 bg-white rounded border text-sm italic">
                    "{selectedRequest.reason}"
                  </div>
                </div>

                {selectedRequest.emergency_contact && (
                  <div className="mt-3">
                    <span className="text-gray-600 text-sm">📞 Emergency Contact:</span>
                    <div className="font-medium text-sm">{selectedRequest.emergency_contact}</div>
                  </div>
                )}
              </div>
              <form onSubmit={handleApproval}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    💬 Admin Comments {approvalForm.status === 'rejected' && <span className="text-red-600">(Required for rejection)</span>}
                  </label>
                  <textarea
                    value={approvalForm.admin_comments}
                    onChange={(e) => setApprovalForm({ ...approvalForm, admin_comments: e.target.value })}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder={
                      approvalForm.status === 'approved'
                        ? "Add approval comments (optional): e.g., 'Approved for medical treatment'"
                        : "Explain reason for rejection: e.g., 'Insufficient notice period' or 'Overlapping with busy period'"
                    }
                    required={approvalForm.status === 'rejected'}
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    {approvalForm.status === 'approved'
                      ? "💡 Optional: Add any conditions or notes for the driver"
                      : "⚠️ Required: Driver will see this explanation for the rejection"
                    }
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowApprovalModal(false)}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`${
                      approvalForm.status === 'approved'
                        ? 'bg-green-500 hover:bg-green-700'
                        : 'bg-red-500 hover:bg-red-700'
                    } text-white font-bold py-2 px-4 rounded disabled:opacity-50`}
                  >
                    {loading
                      ? approvalForm.status === 'approved'
                        ? 'Approving...'
                        : 'Rejecting...'
                      : approvalForm.status === 'approved'
                      ? 'Confirm Approval'
                      : 'Confirm Rejection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;