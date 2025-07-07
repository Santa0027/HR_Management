import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  FileText,
  Car,
  User,
  MapPin,
  Phone,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Settings,
  TrendingUp,
  Activity,
  BarChart3
} from 'lucide-react';

const ServiceCard = ({ service, onView, onEdit, onDelete, onComplete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getServiceTypeIcon = (type) => {
    switch (type) {
      case 'ROUTINE': return <Calendar className="w-4 h-4" />;
      case 'REPAIR': return <Wrench className="w-4 h-4" />;
      case 'MAINTENANCE': return <Settings className="w-4 h-4" />;
      case 'INSPECTION': return <Eye className="w-4 h-4" />;
      case 'EMERGENCY': return <AlertTriangle className="w-4 h-4" />;
      default: return <Wrench className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            {getServiceTypeIcon(service.service_type)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{service.vehicle?.vehicle_name}</h3>
            <p className="text-sm text-gray-500">{service.vehicle?.vehicle_number}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
          {service.status}
        </span>
      </div>

      {/* Service Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Service Type:</span>
          <span className="text-sm font-medium text-gray-900">{service.service_type}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Date:</span>
          <span className="text-sm font-medium text-gray-900">{new Date(service.service_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Provider:</span>
          <span className="text-sm font-medium text-gray-900">{service.service_provider}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Cost:</span>
          <span className="text-sm font-medium text-green-600">${service.cost}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Odometer:</span>
          <span className="text-sm font-medium text-gray-900">{service.odometer_reading} km</span>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 line-clamp-2">{service.service_description}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => onView(service)}
            className="flex items-center px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </button>
          <button
            onClick={() => onEdit(service)}
            className="flex items-center px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </button>
        </div>
        <div className="flex space-x-2">
          {service.status === 'SCHEDULED' && (
            <button
              onClick={() => onComplete(service)}
              className="flex items-center px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Complete
            </button>
          )}
          <button
            onClick={() => onDelete(service)}
            className="flex items-center px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const VehicleServiceManagement = () => {
  const navigate = useNavigate();
  
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Statistics
  const [serviceStats, setServiceStats] = useState({
    total: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalCost: 0,
    avgCost: 0,
    thisMonth: 0,
    overdue: 0
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockServices = [
      {
        id: 1,
        vehicle: { vehicle_name: 'Toyota Camry', vehicle_number: 'ABC-123' },
        service_type: 'ROUTINE',
        service_date: '2024-01-15',
        service_provider: 'AutoCare Center',
        service_description: 'Regular maintenance service including oil change, filter replacement, and general inspection.',
        cost: 150.00,
        odometer_reading: 45000,
        status: 'SCHEDULED'
      },
      {
        id: 2,
        vehicle: { vehicle_name: 'Honda Civic', vehicle_number: 'XYZ-789' },
        service_type: 'REPAIR',
        service_date: '2024-01-10',
        service_provider: 'Quick Fix Garage',
        service_description: 'Brake pad replacement and brake fluid change.',
        cost: 280.00,
        odometer_reading: 32000,
        status: 'COMPLETED'
      },
      {
        id: 3,
        vehicle: { vehicle_name: 'Ford Transit', vehicle_number: 'DEF-456' },
        service_type: 'MAINTENANCE',
        service_date: '2024-01-20',
        service_provider: 'Fleet Services Ltd',
        service_description: 'Comprehensive maintenance check including engine diagnostics.',
        cost: 350.00,
        odometer_reading: 78000,
        status: 'IN_PROGRESS'
      }
    ];

    setServices(mockServices);
    setFilteredServices(mockServices);
    
    // Calculate stats
    const stats = {
      total: mockServices.length,
      scheduled: mockServices.filter(s => s.status === 'SCHEDULED').length,
      inProgress: mockServices.filter(s => s.status === 'IN_PROGRESS').length,
      completed: mockServices.filter(s => s.status === 'COMPLETED').length,
      cancelled: mockServices.filter(s => s.status === 'CANCELLED').length,
      totalCost: mockServices.reduce((sum, s) => sum + s.cost, 0),
      avgCost: mockServices.reduce((sum, s) => sum + s.cost, 0) / mockServices.length,
      thisMonth: mockServices.filter(s => new Date(s.service_date).getMonth() === new Date().getMonth()).length,
      overdue: 0
    };
    
    setServiceStats(stats);
    setLoading(false);
  }, []);

  // Filter services based on search and filters
  useEffect(() => {
    let filtered = services;

    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.vehicle.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.vehicle.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.service_provider.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(service => service.status === statusFilter);
    }

    if (serviceTypeFilter !== 'all') {
      filtered = filtered.filter(service => service.service_type === serviceTypeFilter);
    }

    setFilteredServices(filtered);
  }, [services, searchTerm, statusFilter, serviceTypeFilter]);

  const handleViewService = (service) => {
    navigate(`/vehicle-service/${service.id}`);
  };

  const handleEditService = (service) => {
    navigate(`/vehicle-service-edit/${service.id}`);
  };

  const handleDeleteService = (service) => {
    if (window.confirm('Are you sure you want to delete this service record?')) {
      const updatedServices = services.filter(s => s.id !== service.id);
      setServices(updatedServices);
      toast.success('Service record deleted successfully');
    }
  };

  const handleCompleteService = (service) => {
    const updatedServices = services.map(s =>
      s.id === service.id ? { ...s, status: 'COMPLETED' } : s
    );
    setServices(updatedServices);
    toast.success('Service marked as completed');
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
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Service Management</h1>
          <p className="text-gray-600 mt-2">Track and manage vehicle maintenance and repairs</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <button
            onClick={() => navigate('/vehicle-service-add')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Service
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{serviceStats.total}</p>
              <p className="text-xs text-gray-500">{serviceStats.thisMonth} this month</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{serviceStats.inProgress}</p>
              <p className="text-xs text-gray-500">Currently servicing</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{serviceStats.completed}</p>
              <p className="text-xs text-gray-500">Successfully finished</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">${serviceStats.totalCost.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Avg: ${serviceStats.avgCost.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search services..."
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
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          
          <select
            value={serviceTypeFilter}
            onChange={(e) => setServiceTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="ROUTINE">Routine</option>
            <option value="REPAIR">Repair</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="INSPECTION">Inspection</option>
            <option value="EMERGENCY">Emergency</option>
          </select>
          
          <button
            onClick={() => {/* Export functionality */}}
            className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onView={handleViewService}
            onEdit={handleEditService}
            onDelete={handleDeleteService}
            onComplete={handleCompleteService}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Wrench className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by scheduling your first service.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default VehicleServiceManagement;
