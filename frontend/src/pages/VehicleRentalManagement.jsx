import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Car,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  CreditCard,
  FileText,
  Key,
  Activity,
  TrendingUp
} from 'lucide-react';

const LeaseCard = ({ rental, onView, onEdit, onDelete, onReturn, onExtend }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'OVERDUE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING': return 'bg-orange-100 text-orange-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = () => {
    return new Date(rental.lease_end_date) < new Date() && rental.lease_status === 'ACTIVE';
  };

  const getDaysRemaining = () => {
    const endDate = new Date(rental.lease_end_date);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Car className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{rental.vehicle?.vehicle_name}</h3>
            <p className="text-sm text-gray-500">{rental.vehicle?.vehicle_number}</p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(rental.lease_status)}`}>
            {isOverdue() ? 'OVERDUE' : rental.lease_status}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(rental.payment_status)}`}>
            {rental.payment_status}
          </span>
          {rental.lease_type && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {rental.lease_type}
            </span>
          )}
        </div>
      </div>

      {/* Lessee Information */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900 font-medium">{rental.lessee_name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{rental.lessee_contact}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Key className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">License: {rental.lessee_license}</span>
        </div>
      </div>

      {/* Lease Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Start Date:</span>
          <span className="text-sm font-medium text-gray-900">{new Date(rental.lease_start_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">End Date:</span>
          <span className="text-sm font-medium text-gray-900">{new Date(rental.lease_end_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Duration:</span>
          <span className="text-sm font-medium text-gray-900">{rental.total_months} months</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Monthly Rate:</span>
          <span className="text-sm font-medium text-gray-900">${rental.monthly_rate}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Amount:</span>
          <span className="text-sm font-medium text-green-600">${rental.total_amount}</span>
        </div>
        {rental.lease_status === 'ACTIVE' && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Days Remaining:</span>
            <span className={`text-sm font-medium ${getDaysRemaining() < 0 ? 'text-red-600' : getDaysRemaining() <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
              {getDaysRemaining() < 0 ? `${Math.abs(getDaysRemaining())} overdue` : `${getDaysRemaining()} days`}
            </span>
          </div>
        )}
      </div>

      {/* Vehicle Condition */}
      <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700">Vehicle Condition</h4>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Pickup Odometer:</span>
          <span className="text-xs font-medium text-gray-900">{rental.pickup_odometer} km</span>
        </div>
        {rental.return_odometer && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Return Odometer:</span>
            <span className="text-xs font-medium text-gray-900">{rental.return_odometer} km</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Fuel Level:</span>
          <span className="text-xs font-medium text-gray-900">{rental.pickup_fuel_level}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => onView(rental)}
            className="flex items-center px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </button>
          <button
            onClick={() => onEdit(rental)}
            className="flex items-center px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </button>
        </div>
        <div className="flex space-x-2">
          {rental.rental_status === 'ACTIVE' && (
            <>
              <button
                onClick={() => onReturn(rental)}
                className="flex items-center px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Return
              </button>
              <button
                onClick={() => onExtend(rental)}
                className="flex items-center px-3 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
              >
                <Clock className="w-4 h-4 mr-1" />
                Extend
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const VehicleRentalManagement = () => {
  const navigate = useNavigate();

  const [leases, setLeases] = useState([]);
  const [filteredLeases, setFilteredLeases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Statistics
  const [leaseStats, setLeaseStats] = useState({
    totalLeases: 0,
    activeLeases: 0,
    completedLeases: 0,
    overdueLeases: 0,
    totalRevenue: 0,
    avgMonthlyRate: 0,
    thisMonth: 0,
    pendingPayments: 0,
    utilizationRate: 0
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockLeases = [
      {
        id: 1,
        vehicle: { vehicle_name: 'Toyota Camry', vehicle_number: 'ABC-123' },
        lessee_name: 'ABC Corporation',
        lessee_contact: '+1-555-0123',
        lessee_license: 'BL123456789',
        lessee_address: '123 Business St, City, State',
        lease_start_date: '2024-01-01T09:00:00',
        lease_end_date: '2024-12-31T18:00:00',
        actual_return_date: null,
        monthly_rate: 450.00,
        total_months: 12,
        base_amount: 5400.00,
        security_deposit: 1000.00,
        additional_charges: 0,
        discount: 0,
        total_amount: 6400.00,
        pickup_odometer: 45000,
        return_odometer: null,
        pickup_fuel_level: 'FULL',
        return_fuel_level: null,
        lease_status: 'ACTIVE',
        payment_status: 'PARTIAL',
        lease_type: 'BUSINESS'
      },
      {
        id: 2,
        vehicle: { vehicle_name: 'Honda Civic', vehicle_number: 'XYZ-789' },
        lessee_name: 'XYZ Logistics Ltd',
        lessee_contact: '+1-555-0456',
        lessee_license: 'BL987654321',
        lessee_address: '456 Industrial Ave, City, State',
        lease_start_date: '2023-06-01T10:00:00',
        lease_end_date: '2024-05-31T17:00:00',
        actual_return_date: '2024-05-31T16:30:00',
        monthly_rate: 380.00,
        total_months: 12,
        base_amount: 4560.00,
        security_deposit: 800.00,
        additional_charges: 200.00,
        discount: 160.00,
        total_amount: 5400.00,
        pickup_odometer: 32000,
        return_odometer: 45000,
        pickup_fuel_level: 'FULL',
        return_fuel_level: 'FULL',
        lease_status: 'COMPLETED',
        payment_status: 'PAID',
        lease_type: 'BUSINESS'
      },
      {
        id: 3,
        vehicle: { vehicle_name: 'Ford Transit', vehicle_number: 'DEF-456' },
        lessee_name: 'Green Delivery Services',
        lessee_contact: '+1-555-0789',
        lessee_license: 'BL456789123',
        lessee_address: '789 Commerce St, City, State',
        lease_start_date: '2024-01-01T08:00:00',
        lease_end_date: '2025-12-31T20:00:00',
        actual_return_date: null,
        monthly_rate: 650.00,
        total_months: 24,
        base_amount: 15600.00,
        security_deposit: 1500.00,
        additional_charges: 0,
        discount: 0,
        total_amount: 17100.00,
        pickup_odometer: 78000,
        return_odometer: null,
        pickup_fuel_level: 'FULL',
        return_fuel_level: null,
        lease_status: 'ACTIVE',
        payment_status: 'PENDING',
        lease_type: 'COMMERCIAL'
      }
    ];

    setLeases(mockLeases);
    setFilteredLeases(mockLeases);

    // Calculate stats
    const totalRevenue = mockLeases.reduce((sum, lease) => sum + lease.total_amount, 0);
    const avgMonthlyRate = mockLeases.reduce((sum, lease) => sum + lease.monthly_rate, 0) / mockLeases.length;

    const stats = {
      totalLeases: mockLeases.length,
      activeLeases: mockLeases.filter(r => r.lease_status === 'ACTIVE').length,
      completedLeases: mockLeases.filter(r => r.lease_status === 'COMPLETED').length,
      overdueLeases: mockLeases.filter(r => new Date(r.lease_end_date) < new Date() && r.lease_status === 'ACTIVE').length,
      totalRevenue: totalRevenue,
      avgMonthlyRate: avgMonthlyRate,
      thisMonth: mockLeases.filter(r => new Date(r.lease_start_date).getMonth() === new Date().getMonth()).length,
      pendingPayments: mockLeases.filter(r => r.payment_status === 'PENDING' || r.payment_status === 'PARTIAL').length,
      utilizationRate: 75 // Mock utilization rate
    };

    setLeaseStats(stats);
    setLoading(false);
  }, []);

  // Filter leases based on search and filters
  useEffect(() => {
    let filtered = leases;

    if (searchTerm) {
      filtered = filtered.filter(lease =>
        lease.vehicle.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lease.vehicle.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lease.lessee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lease.lessee_contact.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lease => lease.lease_status === statusFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(lease => lease.payment_status === paymentFilter);
    }

    setFilteredLeases(filtered);
  }, [leases, searchTerm, statusFilter, paymentFilter]);

  const handleViewLease = (lease) => {
    navigate(`/vehicle-lease/${lease.id}`);
  };

  const handleEditLease = (lease) => {
    navigate(`/vehicle-lease-edit/${lease.id}`);
  };

  const handleDeleteLease = (lease) => {
    if (window.confirm('Are you sure you want to delete this lease record?')) {
      const updatedLeases = leases.filter(r => r.id !== lease.id);
      setLeases(updatedLeases);
      toast.success('Lease record deleted successfully');
    }
  };

  const handleReturnVehicle = (lease) => {
    navigate(`/vehicle-lease-return/${lease.id}`);
  };

  const handleExtendLease = (lease) => {
    navigate(`/vehicle-lease-extend/${lease.id}`);
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
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Lease Management</h1>
          <p className="text-gray-600 mt-2">Manage vehicle leases, contracts, and returns</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <button
            onClick={() => navigate('/vehicle-rental-add')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Lease
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leases</p>
              <p className="text-2xl font-bold text-gray-900">{leaseStats.totalLeases}</p>
              <p className="text-xs text-gray-500">{leaseStats.thisMonth} this month</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Leases</p>
              <p className="text-2xl font-bold text-gray-900">{leaseStats.activeLeases}</p>
              <p className="text-xs text-gray-500">{leaseStats.overdueLeases} overdue</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${leaseStats.totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Avg: ${leaseStats.avgMonthlyRate.toFixed(2)}/month</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">{leaseStats.pendingPayments}</p>
              <p className="text-xs text-gray-500">Require attention</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <CreditCard className="w-6 h-6 text-yellow-600" />
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
              placeholder="Search leases..."
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
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="OVERDUE">Overdue</option>
          </select>
          
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Payments</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="PENDING">Pending</option>
            <option value="OVERDUE">Overdue</option>
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

      {/* Leases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeases.map((lease) => (
          <LeaseCard
            key={lease.id}
            rental={lease}
            onView={handleViewLease}
            onEdit={handleEditLease}
            onDelete={handleDeleteLease}
            onReturn={handleReturnVehicle}
            onExtend={handleExtendLease}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredLeases.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Car className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No leases found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first lease.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default VehicleRentalManagement;
