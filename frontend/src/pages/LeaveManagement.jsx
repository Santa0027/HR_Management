import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Filter,
  Search,
  Eye,
  Check,
  X
} from 'lucide-react';

const LeaveManagement = () => {
  const { user, canManageHR, canViewHR } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('requests');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (canViewHR()) {
      fetchLeaveData();
    }
  }, []);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockRequests = [
        {
          id: 1,
          employee_name: 'John Doe',
          leave_type_name: 'Annual Leave',
          start_date: '2025-07-15',
          end_date: '2025-07-19',
          days_requested: 5,
          reason: 'Family vacation',
          status: 'pending',
          created_at: '2025-07-01T10:00:00Z'
        },
        {
          id: 2,
          employee_name: 'Jane Smith',
          leave_type_name: 'Sick Leave',
          start_date: '2025-07-10',
          end_date: '2025-07-12',
          days_requested: 3,
          reason: 'Medical appointment',
          status: 'approved',
          approved_by_name: 'HR Manager',
          created_at: '2025-07-08T14:30:00Z'
        },
        {
          id: 3,
          employee_name: 'Mike Johnson',
          leave_type_name: 'Personal Leave',
          start_date: '2025-07-20',
          end_date: '2025-07-20',
          days_requested: 1,
          reason: 'Personal matters',
          status: 'rejected',
          rejection_reason: 'Insufficient leave balance',
          created_at: '2025-07-05T09:15:00Z'
        }
      ];

      const mockBalances = [
        {
          id: 1,
          employee_name: 'John Doe',
          leave_type_name: 'Annual Leave',
          allocated_days: 21,
          used_days: 8,
          pending_days: 5,
          remaining_days: 8
        },
        {
          id: 2,
          employee_name: 'John Doe',
          leave_type_name: 'Sick Leave',
          allocated_days: 10,
          used_days: 2,
          pending_days: 0,
          remaining_days: 8
        },
        {
          id: 3,
          employee_name: 'Jane Smith',
          leave_type_name: 'Annual Leave',
          allocated_days: 21,
          used_days: 12,
          pending_days: 0,
          remaining_days: 9
        }
      ];
      
      setLeaveRequests(mockRequests);
      setLeaveBalances(mockBalances);
    } catch (err) {
      setError('Failed to load leave data');
      console.error('Leave data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      // API call to approve request
      setLeaveRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'approved', approved_by_name: user.name }
            : req
        )
      );
    } catch (err) {
      console.error('Error approving request:', err);
    }
  };

  const handleRejectRequest = async (requestId, reason) => {
    try {
      // API call to reject request
      setLeaveRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'rejected', rejection_reason: reason }
            : req
        )
      );
    } catch (err) {
      console.error('Error rejecting request:', err);
    }
  };

  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = 
      request.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.leave_type_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || request.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!canViewHR()) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          You don't have permission to access Leave Management.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-gray-600">Manage employee leave requests and balances</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            New Leave Request
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'requests'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Leave Requests
          </button>
          <button
            onClick={() => setActiveTab('balances')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'balances'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Leave Balances
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {activeTab === 'requests' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Leave Requests Tab */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map(request => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.employee_name}</div>
                      <div className="text-sm text-gray-500">{request.reason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.leave_type_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.days_requested}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(request.status)}
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManageHR() && request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveRequest(request.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id, 'Rejected by HR')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leave Balances Tab */}
      {activeTab === 'balances' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaveBalances.map(balance => (
            <div key={balance.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{balance.employee_name}</h3>
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">{balance.leave_type_name}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Allocated:</span>
                    <span className="font-medium">{balance.allocated_days} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Used:</span>
                    <span className="font-medium text-red-600">{balance.used_days} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pending:</span>
                    <span className="font-medium text-yellow-600">{balance.pending_days} days</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-gray-600">Remaining:</span>
                    <span className="font-medium text-green-600">{balance.remaining_days} days</span>
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${(balance.used_days / balance.allocated_days) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
