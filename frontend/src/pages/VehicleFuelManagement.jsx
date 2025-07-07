import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Fuel,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Car,
  User,
  MapPin,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Gauge,
  Receipt,
  Edit,
  Trash2,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';

const FuelCard = ({ fuelRecord, onView, onEdit, onDelete }) => {
  const getFuelTypeColor = (type) => {
    switch (type) {
      case 'PETROL': return 'bg-blue-100 text-blue-800';
      case 'DIESEL': return 'bg-green-100 text-green-800';
      case 'CNG': return 'bg-yellow-100 text-yellow-800';
      case 'LPG': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Fuel className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{fuelRecord.vehicle?.vehicle_name}</h3>
            <p className="text-sm text-gray-500">{fuelRecord.vehicle?.vehicle_number}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getFuelTypeColor(fuelRecord.fuel_type)}`}>
          {fuelRecord.fuel_type}
        </span>
      </div>

      {/* Fuel Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Date:</span>
          <span className="text-sm font-medium text-gray-900">{new Date(fuelRecord.fuel_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Quantity:</span>
          <span className="text-sm font-medium text-gray-900">{fuelRecord.quantity_liters}L</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Cost per Liter:</span>
          <span className="text-sm font-medium text-gray-900">${fuelRecord.cost_per_liter}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Cost:</span>
          <span className="text-sm font-medium text-green-600">${fuelRecord.total_cost}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Odometer:</span>
          <span className="text-sm font-medium text-gray-900">{fuelRecord.odometer_reading} km</span>
        </div>
        {fuelRecord.fuel_efficiency && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Efficiency:</span>
            <span className="text-sm font-medium text-blue-600">{fuelRecord.fuel_efficiency} km/L</span>
          </div>
        )}
      </div>

      {/* Station and Driver */}
      <div className="space-y-2 mb-4">
        {fuelRecord.fuel_station && (
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{fuelRecord.fuel_station}</span>
          </div>
        )}
        {fuelRecord.driver && (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{fuelRecord.driver.driver_name}</span>
          </div>
        )}
        {fuelRecord.receipt_number && (
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Receipt: {fuelRecord.receipt_number}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => onView(fuelRecord)}
            className="flex items-center px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </button>
          <button
            onClick={() => onEdit(fuelRecord)}
            className="flex items-center px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </button>
        </div>
        <button
          onClick={() => onDelete(fuelRecord)}
          className="flex items-center px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </button>
      </div>
    </div>
  );
};

const VehicleFuelManagement = () => {
  const navigate = useNavigate();
  
  const [fuelRecords, setFuelRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');

  // Statistics
  const [fuelStats, setFuelStats] = useState({
    totalRecords: 0,
    totalCost: 0,
    totalLiters: 0,
    avgCostPerLiter: 0,
    avgEfficiency: 0,
    thisMonth: 0,
    lastMonth: 0,
    costThisMonth: 0,
    costLastMonth: 0,
    topVehicle: null,
    mostEfficientVehicle: null
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockFuelRecords = [
      {
        id: 1,
        vehicle: { vehicle_name: 'Toyota Camry', vehicle_number: 'ABC-123' },
        fuel_date: '2024-01-15T10:30:00',
        fuel_type: 'PETROL',
        quantity_liters: 45.5,
        cost_per_liter: 1.25,
        total_cost: 56.88,
        odometer_reading: 45000,
        fuel_station: 'Shell Station Downtown',
        driver: { driver_name: 'John Smith' },
        receipt_number: 'SH-001234',
        distance_covered: 520,
        fuel_efficiency: 11.4
      },
      {
        id: 2,
        vehicle: { vehicle_name: 'Honda Civic', vehicle_number: 'XYZ-789' },
        fuel_date: '2024-01-12T14:15:00',
        fuel_type: 'PETROL',
        quantity_liters: 38.2,
        cost_per_liter: 1.28,
        total_cost: 48.90,
        odometer_reading: 32000,
        fuel_station: 'BP Gas Station',
        driver: { driver_name: 'Sarah Johnson' },
        receipt_number: 'BP-567890',
        distance_covered: 480,
        fuel_efficiency: 12.6
      },
      {
        id: 3,
        vehicle: { vehicle_name: 'Ford Transit', vehicle_number: 'DEF-456' },
        fuel_date: '2024-01-10T09:45:00',
        fuel_type: 'DIESEL',
        quantity_liters: 65.0,
        cost_per_liter: 1.15,
        total_cost: 74.75,
        odometer_reading: 78000,
        fuel_station: 'Texaco Truck Stop',
        driver: { driver_name: 'Mike Wilson' },
        receipt_number: 'TX-445566',
        distance_covered: 650,
        fuel_efficiency: 10.0
      }
    ];

    setFuelRecords(mockFuelRecords);
    setFilteredRecords(mockFuelRecords);
    
    // Calculate stats
    const totalCost = mockFuelRecords.reduce((sum, record) => sum + record.total_cost, 0);
    const totalLiters = mockFuelRecords.reduce((sum, record) => sum + record.quantity_liters, 0);
    const avgEfficiency = mockFuelRecords.reduce((sum, record) => sum + (record.fuel_efficiency || 0), 0) / mockFuelRecords.length;
    
    const stats = {
      totalRecords: mockFuelRecords.length,
      totalCost: totalCost,
      totalLiters: totalLiters,
      avgCostPerLiter: totalCost / totalLiters,
      avgEfficiency: avgEfficiency,
      thisMonth: mockFuelRecords.filter(r => new Date(r.fuel_date).getMonth() === new Date().getMonth()).length,
      lastMonth: 0,
      costThisMonth: totalCost,
      costLastMonth: 0,
      topVehicle: 'Toyota Camry',
      mostEfficientVehicle: 'Honda Civic'
    };
    
    setFuelStats(stats);
    setLoading(false);
  }, []);

  // Filter records based on search and filters
  useEffect(() => {
    let filtered = fuelRecords;

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.vehicle.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.vehicle.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.fuel_station?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.driver?.driver_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (fuelTypeFilter !== 'all') {
      filtered = filtered.filter(record => record.fuel_type === fuelTypeFilter);
    }

    setFilteredRecords(filtered);
  }, [fuelRecords, searchTerm, fuelTypeFilter]);

  const handleViewRecord = (record) => {
    navigate(`/vehicle-fuel/${record.id}`);
  };

  const handleEditRecord = (record) => {
    navigate(`/vehicle-fuel-edit/${record.id}`);
  };

  const handleDeleteRecord = (record) => {
    if (window.confirm('Are you sure you want to delete this fuel record?')) {
      const updatedRecords = fuelRecords.filter(r => r.id !== record.id);
      setFuelRecords(updatedRecords);
      toast.success('Fuel record deleted successfully');
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
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Fuel Management</h1>
          <p className="text-gray-600 mt-2">Track fuel consumption, costs, and efficiency</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <button
            onClick={() => navigate('/vehicle-fuel-add')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Fuel Record
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{fuelStats.totalRecords}</p>
              <p className="text-xs text-gray-500">{fuelStats.thisMonth} this month</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Fuel className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">${fuelStats.totalCost.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Avg: ${fuelStats.avgCostPerLiter.toFixed(2)}/L</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Liters</p>
              <p className="text-2xl font-bold text-gray-900">{fuelStats.totalLiters.toFixed(1)}L</p>
              <p className="text-xs text-gray-500">Fuel consumed</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Gauge className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
              <p className="text-2xl font-bold text-gray-900">{fuelStats.avgEfficiency.toFixed(1)} km/L</p>
              <p className="text-xs text-gray-500">Fleet average</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Activity className="w-6 h-6 text-purple-600" />
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
              placeholder="Search fuel records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={fuelTypeFilter}
            onChange={(e) => setFuelTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Fuel Types</option>
            <option value="PETROL">Petrol</option>
            <option value="DIESEL">Diesel</option>
            <option value="CNG">CNG</option>
            <option value="LPG">LPG</option>
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
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

      {/* Fuel Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords.map((record) => (
          <FuelCard
            key={record.id}
            fuelRecord={record}
            onView={handleViewRecord}
            onEdit={handleEditRecord}
            onDelete={handleDeleteRecord}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredRecords.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Fuel className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No fuel records found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || fuelTypeFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first fuel record.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default VehicleFuelManagement;
