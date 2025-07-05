import React, { useState, useEffect } from 'react';
import {
  ChevronDown, CircleUserRound, ChevronLeft, ChevronRight,
  Plus, Edit, Trash2, Eye, Search, Filter, Car,
  CheckCircle, XCircle, Clock, AlertTriangle, Download,
  FileText, Image as ImageIcon, Calendar, User, Building
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

// Enhanced Vehicle List Component
function VehicleListManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    vehicleType: '',
    approvalStatus: '',
    insuranceStatus: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  const itemsPerPage = 10;

  // Fetch vehicles data
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/vehicles/');
      const vehicleData = response.data.results || response.data || [];
      setVehicles(Array.isArray(vehicleData) ? vehicleData : []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete vehicle
  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;

    try {
      await axiosInstance.delete(`/vehicles/${vehicleToDelete.id}/`);
      toast.success('Vehicle deleted successfully');
      fetchVehicles(); // Refresh the list
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
    } finally {
      setShowDeleteModal(false);
      setVehicleToDelete(null);
    }
  };

  // Update vehicle approval status
  const handleUpdateApprovalStatus = async (vehicleId, newStatus) => {
    try {
      await axiosInstance.patch(`/vehicles/${vehicleId}/`, {
        approval_status: newStatus
      });
      toast.success(`Vehicle ${newStatus.toLowerCase()} successfully`);
      fetchVehicles(); // Refresh the list
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      toast.error('Failed to update vehicle status');
    }
  };

  // Filter and search logic
  const getFilteredVehicles = () => {
    let filtered = vehicles;

    // Apply tab filter
    if (activeTab === 'pending') {
      filtered = filtered.filter(v => v.approval_status === 'PENDING');
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(v => v.approval_status === 'APPROVED');
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(v => v.approval_status === 'REJECTED');
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(v =>
        v.vehicle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.Chassis_Number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.vehicleType) {
      filtered = filtered.filter(v => v.vehicle_type === filters.vehicleType);
    }
    if (filters.approvalStatus) {
      filtered = filtered.filter(v => v.approval_status === filters.approvalStatus);
    }

    return filtered;
  };

  const filteredVehicles = getFilteredVehicles();
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      APPROVED: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Approved' },
      REJECTED: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };

    const config = statusConfig[status] || { icon: AlertTriangle, color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <IconComponent className="w-4 h-4 mr-1" />
        {config.label}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Light Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-gray-500">Vehicle Management / Vehicle List</div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors">
              English <ChevronDown size={16} className="ml-1" />
            </button>
            <CircleUserRound size={24} className="text-blue-600" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                  <Car className="h-8 w-8 mr-3 text-blue-600" />
                  Vehicle Management
                </h1>
                <p className="text-gray-600 mt-2">Manage and monitor all vehicles in the fleet</p>
              </div>
              <div className="mt-4 lg:mt-0">
                <button
                  onClick={() => navigate('/vehicle-registration')}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg shadow-md transition-all hover:shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Vehicle
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Vehicle Type Filter */}
              <select
                value={filters.vehicleType}
                onChange={(e) => setFilters(prev => ({ ...prev, vehicleType: e.target.value }))}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Vehicle Types</option>
                <option value="CAR">Car</option>
                <option value="BIKE">Bike</option>
                <option value="TRUCK">Truck</option>
                <option value="BUS">Bus</option>
                <option value="OTHER">Other</option>
              </select>

              {/* Approval Status Filter */}
              <select
                value={filters.approvalStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, approvalStatus: e.target.value }))}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              {/* Reset Filters */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ vehicleType: '', approvalStatus: '', insuranceStatus: '' });
                  setCurrentPage(1);
                }}
                className="flex items-center justify-center px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Filter className="h-5 w-5 mr-2" />
                Reset
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 mb-8">
            <div className="flex overflow-x-auto">
              {[
                { id: 'all', label: 'All Vehicles', count: vehicles.length },
                { id: 'pending', label: 'Pending', count: vehicles.filter(v => v.approval_status === 'PENDING').length },
                { id: 'approved', label: 'Approved', count: vehicles.filter(v => v.approval_status === 'APPROVED').length },
                { id: 'rejected', label: 'Rejected', count: vehicles.filter(v => v.approval_status === 'REJECTED').length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white border-b-2 border-blue-500 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedVehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all">
                {/* Vehicle Image */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  {vehicle.image ? (
                    <img
                      src={vehicle.image}
                      alt={vehicle.vehicle_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Car className="h-16 w-16 text-gray-400" />
                  )}
                </div>

                {/* Vehicle Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">{vehicle.vehicle_name}</h3>
                    {getStatusBadge(vehicle.approval_status)}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Car className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm">{vehicle.vehicle_number}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FileText className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">{vehicle.vehicle_type}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Building className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="text-sm">{vehicle.Chassis_Number || 'N/A'}</span>
                    </div>
                    {vehicle.insurance_expiry_date && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                        <span className="text-sm">Insurance: {formatDate(vehicle.insurance_expiry_date)}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/vehicle-profile/${vehicle.id}`)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/vehicle-registration/${vehicle.id}`)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setVehicleToDelete(vehicle);
                        setShowDeleteModal(true);
                      }}
                      className="flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Approval Actions for Pending Vehicles */}
                  {vehicle.approval_status === 'PENDING' && (
                    <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleUpdateApprovalStatus(vehicle.id, 'APPROVED')}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateApprovalStatus(vehicle.id, 'REJECTED')}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {paginatedVehicles.length === 0 && (
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-12 text-center">
              <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Vehicles Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filters.vehicleType || filters.approvalStatus
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first vehicle'
                }
              </p>
              <button
                onClick={() => navigate('/vehicle-registration')}
                className="flex items-center mx-auto px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg shadow-md transition-all hover:shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Vehicle
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredVehicles.length)} of {filteredVehicles.length} vehicles
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>

                  <div className="flex space-x-1">
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          currentPage === idx + 1
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">Delete Vehicle</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{vehicleToDelete?.vehicle_name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setVehicleToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVehicle}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VehicleListManagement;
