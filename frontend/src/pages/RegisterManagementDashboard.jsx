import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import {
  ChevronDown, CircleUserRound, Users, Building, Car, FileText,
  TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle, Plus,
  Search, Filter, Eye, Edit, Trash2, Download
} from 'lucide-react';

const RegisterManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Data states
  const [drivers, setDrivers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [statistics, setStatistics] = useState({
    drivers: { total: 0, pending: 0, approved: 0, rejected: 0 },
    companies: { total: 0, active: 0, inactive: 0 },
    vehicles: { total: 0, pending: 0, approved: 0, rejected: 0 }
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    dateRange: '30'
  });

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [driversRes, companiesRes, vehiclesRes] = await Promise.all([
        axiosInstance.get('/Register/drivers/'),
        axiosInstance.get('/companies/'),
        axiosInstance.get('/vehicle-registrations/')
      ]);

      const driversData = driversRes.data.results || driversRes.data;
      const companiesData = companiesRes.data.results || companiesRes.data;
      const vehiclesData = vehiclesRes.data.results || vehiclesRes.data;

      setDrivers(driversData);
      setCompanies(companiesData);
      setVehicles(vehiclesData);

      // Calculate statistics
      calculateStatistics(driversData, companiesData, vehiclesData);

      console.log('Register Management data loaded:', {
        drivers: driversData.length,
        companies: companiesData.length,
        vehicles: vehiclesData.length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load registration data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStatistics = (driversData, companiesData, vehiclesData) => {
    const stats = {
      drivers: {
        total: driversData.length,
        pending: driversData.filter(d => d.status === 'pending').length,
        approved: driversData.filter(d => d.status === 'approved').length,
        rejected: driversData.filter(d => d.status === 'rejected').length
      },
      companies: {
        total: companiesData.length,
        active: companiesData.filter(c => c.is_active !== false).length,
        inactive: companiesData.filter(c => c.is_active === false).length
      },
      vehicles: {
        total: vehiclesData.length,
        pending: vehiclesData.filter(v => v.approval_status === 'PENDING').length,
        approved: vehiclesData.filter(v => v.approval_status === 'APPROVED').length,
        rejected: vehiclesData.filter(v => v.approval_status === 'REJECTED').length
      }
    };

    setStatistics(stats);
  };

  // Handle status update
  const handleStatusUpdate = async (type, id, newStatus) => {
    try {
      let endpoint = '';
      let data = {};

      switch (type) {
        case 'driver':
          endpoint = `/Register/drivers/${id}/`;
          data = { status: newStatus };
          break;
        case 'vehicle':
          endpoint = `/vehicle-registrations/${id}/`;
          data = { approval_status: newStatus };
          break;
        default:
          return;
      }

      await axiosInstance.patch(endpoint, data);
      toast.success(`${type} status updated successfully`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Get status badge
  const getStatusBadge = (status, type = 'driver') => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get recent activities
  const getRecentActivities = () => {
    const activities = [];
    
    // Recent driver registrations
    drivers.slice(0, 5).forEach(driver => {
      activities.push({
        type: 'driver',
        action: 'registered',
        name: driver.driver_name,
        date: driver.created_at,
        status: driver.status
      });
    });

    // Recent vehicle registrations
    vehicles.slice(0, 3).forEach(vehicle => {
      activities.push({
        type: 'vehicle',
        action: 'registered',
        name: vehicle.vehicle_name,
        date: vehicle.created_at,
        status: vehicle.approval_status
      });
    });

    return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🏢 Register Management System</h1>
            <p className="text-gray-600">Comprehensive registration and approval management</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm transition-colors">
              English <ChevronDown size={16} className="ml-1" />
            </button>
            <CircleUserRound size={24} className="text-gray-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('drivers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'drivers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 Drivers ({statistics.drivers.total})
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'companies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏢 Companies ({statistics.companies.total})
            </button>
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vehicles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🚗 Vehicles ({statistics.vehicles.total})
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'approvals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ✅ Pending Approvals
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <Users className="h-12 w-12 text-blue-600 mr-4" />
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{statistics.drivers.total}</div>
                      <div className="text-sm text-blue-600">Total Drivers</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {statistics.drivers.pending} pending
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <Building className="h-12 w-12 text-green-600 mr-4" />
                    <div>
                      <div className="text-2xl font-bold text-green-600">{statistics.companies.total}</div>
                      <div className="text-sm text-green-600">Companies</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {statistics.companies.active} active
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <Car className="h-12 w-12 text-purple-600 mr-4" />
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{statistics.vehicles.total}</div>
                      <div className="text-sm text-purple-600">Vehicles</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {statistics.vehicles.pending} pending
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-12 w-12 text-orange-600 mr-4" />
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {statistics.drivers.pending + statistics.vehicles.pending}
                      </div>
                      <div className="text-sm text-orange-600">Pending Approvals</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Requires attention
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🚀 Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/registration-management"
                      className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded text-center text-sm font-medium"
                    >
                      👥 New Driver Request
                    </Link>
                    <Link
                      to="/company-registration"
                      className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded text-center text-sm font-medium"
                    >
                      🏢 Register Company
                    </Link>
                    <Link
                      to="/vehicle-registration"
                      className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded text-center text-sm font-medium"
                    >
                      🚗 Register Vehicle
                    </Link>
                    <Link
                      to="/registration-management/aproval_status"
                      className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded text-center text-sm font-medium"
                    >
                      ✅ Manage Approvals
                    </Link>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Recent Activities</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {getRecentActivities().map((activity, index) => (
                      <div key={index} className="flex items-center bg-white p-3 rounded border">
                        <div className="text-2xl mr-3">
                          {activity.type === 'driver' ? '👤' : '🚗'}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{activity.name}</div>
                          <div className="text-sm text-gray-600">
                            {activity.type} {activity.action}
                          </div>
                          <div className="text-xs text-gray-500">{formatDate(activity.date)}</div>
                        </div>
                        <div>
                          {getStatusBadge(activity.status)}
                        </div>
                      </div>
                    ))}
                    {getRecentActivities().length === 0 && (
                      <div className="text-center text-gray-500 py-4">
                        No recent activities
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Approval Summary */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4">⚠️ Pending Approvals Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-yellow-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">{statistics.drivers.pending}</div>
                        <div className="text-sm text-yellow-600">Driver Applications</div>
                      </div>
                      <Users className="h-8 w-8 text-yellow-600" />
                    </div>
                    {statistics.drivers.pending > 0 && (
                      <Link
                        to="/registration-management/aproval_status"
                        className="mt-2 text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded inline-block"
                      >
                        Review Now
                      </Link>
                    )}
                  </div>
                  <div className="bg-white border border-yellow-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">{statistics.vehicles.pending}</div>
                        <div className="text-sm text-yellow-600">Vehicle Registrations</div>
                      </div>
                      <Car className="h-8 w-8 text-yellow-600" />
                    </div>
                    {statistics.vehicles.pending > 0 && (
                      <Link
                        to="/vehicle-list"
                        className="mt-2 text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded inline-block"
                      >
                        Review Now
                      </Link>
                    )}
                  </div>
                  <div className="bg-white border border-yellow-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {statistics.drivers.pending + statistics.vehicles.pending}
                        </div>
                        <div className="text-sm text-yellow-600">Total Pending</div>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-yellow-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterManagementDashboard;
