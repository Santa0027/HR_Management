import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import {
  Car,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  Upload,
  MoreVertical,
  Star,
  Award,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  RefreshCw,
  Settings,
  Mail,
  Shield,
  UserCheck,
  UserX,
  UserPlus,
  Zap,
  Target,
  DollarSign,
  Navigation,
  Fuel,
  Timer,
  Bell,
  Archive,
  Bookmark,
  Copy,
  ExternalLink,
  History,
  Info,
  MessageSquare,
  Share2,
  Printer,
  FileSpreadsheet,
  Database,
  CloudDownload,
  CloudUpload,
  Wrench,
  CreditCard,
  MapPin,
  Gauge,
  Calendar as CalendarIcon,
  Building,
  Key,
  Truck
} from 'lucide-react';

// Enhanced Statistics Card Component
const StatCard = ({ title, value, change, changeType, icon: Icon, color, onClick, subtitle }) => (
  <div
    className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all cursor-pointer group ${onClick ? 'hover:scale-105' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {change && (
        <div className={`flex items-center space-x-1 ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
          {changeType === 'increase' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="text-sm font-medium">{change}</span>
        </div>
      )}
    </div>
  </div>
);

// Enhanced Vehicle Card Component
const VehicleCard = ({ vehicle, onView, onEdit, onDelete, onAssignDriver, onServiceSchedule }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OUT_OF_SERVICE': return 'bg-red-100 text-red-800 border-red-200';
      case 'RETIRED': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOwnershipColor = (type) => {
    switch (type) {
      case 'OWN': return 'bg-blue-100 text-blue-800';
      case 'LEASE': return 'bg-orange-100 text-orange-800';
      case 'RENTAL': return 'bg-purple-100 text-purple-800';
      case 'FINANCE': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isDocumentExpiring = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiry <= thirtyDaysFromNow;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Car className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{vehicle.vehicle_name}</h3>
            <p className="text-sm text-gray-500">{vehicle.vehicle_number}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(vehicle.vehicle_status)}`}>
            {vehicle.vehicle_status}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOwnershipColor(vehicle.ownership_type)}`}>
            {vehicle.ownership_type}
          </span>
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Truck className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{vehicle.make} {vehicle.model}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Fuel className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{vehicle.fuel_type}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{vehicle.assigned_driver?.driver_name || 'Unassigned'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{vehicle.current_odometer || 0} km</span>
        </div>
      </div>

      {/* Document Status */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Document Status</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Insurance', expiry: vehicle.insurance_expiry_date },
            { label: 'RC', expiry: vehicle.rc_expiry_date },
            { label: 'Service', expiry: vehicle.next_service_date }
          ].map((doc) => (
            <span
              key={doc.label}
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isDocumentExpiring(doc.expiry)
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-green-100 text-green-800 border border-green-200'
              }`}
            >
              {doc.label}
              {isDocumentExpiring(doc.expiry) && <AlertTriangle className="w-3 h-3 ml-1" />}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => onView(vehicle)}
            className="flex items-center px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </button>
          <button
            onClick={() => onEdit(vehicle)}
            className="flex items-center px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onAssignDriver(vehicle)}
            className="flex items-center px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Assign
          </button>
          <button
            onClick={() => onServiceSchedule(vehicle)}
            className="flex items-center px-3 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
          >
            <Wrench className="w-4 h-4 mr-1" />
            Service
          </button>
        </div>
      </div>
    </div>
  );
};

const VehicleManagement = () => {
  const navigate = useNavigate();
  
  // State to hold all vehicle data
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ownershipFilter, setOwnershipFilter] = useState('all');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('all');

  // Enhanced state for displaying comprehensive vehicle statistics
  const [vehicleStats, setVehicleStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    maintenance: 0,
    outOfService: 0,
    owned: 0,
    leased: 0,
    rental: 0,
    financed: 0,
    documentsExpiring: 0,
    servicesDue: 0,
    assigned: 0,
    unassigned: 0,
    averageAge: 0,
    totalValue: 0
  });

  // Additional state for enhanced features
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'date', 'status'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [selectedVehicles, setSelectedVehicles] = useState([]); // For bulk operations
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch vehicles data
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/vehicles/');
      const vehicleData = response.data || [];

      setVehicles(vehicleData);
      setFilteredVehicles(vehicleData);
      setVehicleStats(calculateEnhancedStats(vehicleData));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
      setLoading(false);
    }
  };

  // Enhanced statistics calculation function
  const calculateEnhancedStats = (vehiclesData) => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Document expiry check
    const documentsExpiring = vehiclesData.filter(vehicle => {
      const expiryDates = [
        vehicle.insurance_expiry_date,
        vehicle.rc_expiry_date,
        vehicle.next_service_date
      ].filter(date => date);

      return expiryDates.some(date => {
        const expiryDate = new Date(date);
        return expiryDate <= thirtyDaysFromNow;
      });
    }).length;

    // Services due
    const servicesDue = vehiclesData.filter(vehicle => {
      if (vehicle.next_service_date) {
        const serviceDate = new Date(vehicle.next_service_date);
        return serviceDate <= now;
      }
      return false;
    }).length;

    // Calculate total fleet value
    const totalValue = vehiclesData.reduce((sum, vehicle) => {
      return sum + (parseFloat(vehicle.purchase_price) || 0);
    }, 0);

    return {
      total: vehiclesData.length,
      active: vehiclesData.filter(v => v.vehicle_status === 'ACTIVE').length,
      inactive: vehiclesData.filter(v => v.vehicle_status === 'INACTIVE').length,
      maintenance: vehiclesData.filter(v => v.vehicle_status === 'MAINTENANCE').length,
      outOfService: vehiclesData.filter(v => v.vehicle_status === 'OUT_OF_SERVICE').length,
      owned: vehiclesData.filter(v => v.ownership_type === 'OWN').length,
      leased: vehiclesData.filter(v => v.ownership_type === 'LEASE').length,
      rental: vehiclesData.filter(v => v.ownership_type === 'RENTAL').length,
      financed: vehiclesData.filter(v => v.ownership_type === 'FINANCE').length,
      documentsExpiring,
      servicesDue,
      assigned: vehiclesData.filter(v => v.assigned_driver).length,
      unassigned: vehiclesData.filter(v => !v.assigned_driver).length,
      averageAge: 0, // Calculate if needed
      totalValue
    };
  };

  // Filter vehicles based on search and filters
  useEffect(() => {
    let filtered = vehicles;

    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.vehicle_status === statusFilter);
    }

    if (ownershipFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.ownership_type === ownershipFilter);
    }

    if (fuelTypeFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.fuel_type === fuelTypeFilter);
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm, statusFilter, ownershipFilter, fuelTypeFilter]);

  // CRUD Operations
  const handleDeleteVehicle = async (vehicle) => {
    if (window.confirm(`Are you sure you want to delete ${vehicle.vehicle_name}?`)) {
      try {
        await axiosInstance.delete(`/vehicles/${vehicle.id}/`);
        toast.success('Vehicle deleted successfully');
        fetchVehicles(); // Refresh the list
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        toast.error('Failed to delete vehicle');
      }
    }
  };

  const handleAssignDriver = (vehicle) => {
    // Navigate to driver assignment page or open modal
    navigate(`/vehicle-assign-driver/${vehicle.id}`);
  };

  const handleServiceSchedule = (vehicle) => {
    // Navigate to service scheduling page
    navigate(`/vehicle-service-add?vehicle=${vehicle.id}`);
  };

  const handleBulkOperation = async (operation) => {
    try {
      let promises = [];

      switch (operation) {
        case 'activate':
          promises = selectedVehicles.map(id =>
            axiosInstance.patch(`/vehicles/${id}/`, { vehicle_status: 'ACTIVE' })
          );
          break;
        case 'deactivate':
          promises = selectedVehicles.map(id =>
            axiosInstance.patch(`/vehicles/${id}/`, { vehicle_status: 'INACTIVE' })
          );
          break;
        case 'delete':
          promises = selectedVehicles.map(id =>
            axiosInstance.delete(`/vehicles/${id}/`)
          );
          break;
        default:
          return;
      }

      await Promise.all(promises);
      toast.success(`Bulk ${operation} completed successfully`);
      setSelectedVehicles([]);
      setShowBulkActions(false);
      fetchVehicles(); // Refresh the list
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      toast.error('Failed to perform bulk operation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-8xl mx-auto font-inter">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Management</h1>
          <p className="text-gray-600 mt-2">Comprehensive vehicle fleet management system</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <button
            onClick={() => navigate('/vehicle-add')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Enhanced Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Vehicles"
          value={vehicleStats.total}
          subtitle={`${vehicleStats.active} active`}
          icon={Car}
          color="bg-blue-500"
        />

        <StatCard
          title="Active Vehicles"
          value={vehicleStats.active}
          subtitle={`${Math.round((vehicleStats.active / vehicleStats.total) * 100) || 0}% of fleet`}
          icon={CheckCircle}
          color="bg-green-500"
        />

        <StatCard
          title="Under Maintenance"
          value={vehicleStats.maintenance}
          subtitle="Currently servicing"
          icon={Wrench}
          color="bg-yellow-500"
        />

        <StatCard
          title="Documents Expiring"
          value={vehicleStats.documentsExpiring}
          subtitle="Within 30 days"
          icon={AlertTriangle}
          color="bg-red-500"
        />
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Owned Vehicles"
          value={vehicleStats.owned}
          subtitle={`${vehicleStats.leased} leased`}
          icon={Key}
          color="bg-purple-500"
        />

        <StatCard
          title="Driver Assigned"
          value={vehicleStats.assigned}
          subtitle={`${vehicleStats.unassigned} unassigned`}
          icon={Users}
          color="bg-indigo-500"
        />

        <StatCard
          title="Services Due"
          value={vehicleStats.servicesDue}
          subtitle="Scheduled maintenance"
          icon={Calendar}
          color="bg-orange-500"
        />

        <StatCard
          title="Fleet Value"
          value={`$${vehicleStats.totalValue.toLocaleString()}`}
          subtitle="Total asset value"
          icon={DollarSign}
          color="bg-green-600"
        />
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {viewMode === 'cards' ? <BarChart3 className="w-4 h-4 mr-2" /> : <Car className="w-4 h-4 mr-2" />}
              {viewMode === 'cards' ? 'Table View' : 'Card View'}
            </button>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </button>

            {selectedVehicles.length > 0 && (
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Bulk Actions ({selectedVehicles.length})
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>

            <button className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </button>

            <button
              onClick={fetchVehicles}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
            <option value="RETIRED">Retired</option>
          </select>

          <select
            value={ownershipFilter}
            onChange={(e) => setOwnershipFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Ownership</option>
            <option value="OWN">Owned</option>
            <option value="LEASE">Leased</option>
            <option value="RENTAL">Rental</option>
            <option value="FINANCE">Financed</option>
          </select>

          <select
            value={fuelTypeFilter}
            onChange={(e) => setFuelTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Fuel Types</option>
            <option value="PETROL">Petrol</option>
            <option value="DIESEL">Diesel</option>
            <option value="ELECTRIC">Electric</option>
            <option value="HYBRID">Hybrid</option>
            <option value="CNG">CNG</option>
            <option value="LPG">LPG</option>
          </select>
        </div>

        {/* Bulk Actions Panel */}
        {showBulkActions && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Bulk Actions</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkOperation('activate')}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
              >
                Activate Selected
              </button>
              <button
                onClick={() => handleBulkOperation('deactivate')}
                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
              >
                Deactivate Selected
              </button>
              <button
                onClick={() => handleBulkOperation('delete')}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Vehicle Display Section - Cards or Table View */}
      {viewMode === 'cards' ? (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onView={(vehicle) => navigate(`/vehicle-profile/${vehicle.id}`)}
              onEdit={(vehicle) => navigate(`/vehicle-edit/${vehicle.id}`)}
              onDelete={handleDeleteVehicle}
              onAssignDriver={handleAssignDriver}
              onServiceSchedule={handleServiceSchedule}
            />
          ))}
        </div>
      ) : (
        /* Table View - Will be added in next edit */
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 text-center text-gray-500">
            Table view will be implemented next
          </div>
        </div>
      )}

      {/* Empty State for Card View */}
      {viewMode === 'cards' && filteredVehicles.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Car className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first vehicle.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;
