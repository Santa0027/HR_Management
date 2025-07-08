import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Car,
  Phone,
  MapPin,
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
  CloudUpload
} from 'lucide-react';

// A generic Modal component to be reused for Add, View, and Edit forms.
// It provides a consistent overlay and structure for dialogs.
const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null; // If 'show' is false, the modal is not rendered.

  return (
    // Fixed overlay for the modal, covering the entire screen.
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      {/* Modal content container, centered and styled */}
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full relative">
        {/* Modal title */}
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>
        {/* Close button for the modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
          aria-label="Close modal"
        >
          &times;
        </button>
        {/* Scrollable area for modal content */}
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {children} {/* Renders the content passed to the Modal component */}
        </div>
      </div>
    </div>
  );
};

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

// Enhanced Driver Card Component
const DriverCard = ({ driver, onView, onEdit, onDelete, onToggleStatus }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3" />;
      case 'approved': return <UserCheck className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'suspended': return <UserX className="w-3 h-3" />;
      case 'rejected': return <XCircle className="w-3 h-3" />;
      default: return <AlertTriangle className="w-3 h-3" />;
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
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{driver.driver_name}</h3>
            <p className="text-sm text-gray-500">ID: {driver.iqama}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(driver.status)}`}>
            {getStatusIcon(driver.status)}
            <span className="ml-1 capitalize">{driver.status}</span>
          </span>
        </div>
      </div>

      {/* Driver Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{driver.mobile}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{driver.city}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Car className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{driver.vehicle?.vehicle_name || 'No Vehicle'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{new Date(driver.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Document Status */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Document Status</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'IQAMA', expiry: driver.iqama_expiry },
            { label: 'License', expiry: driver.license_expiry },
            { label: 'Passport', expiry: driver.passport_expiry },
            { label: 'Medical', expiry: driver.medical_expiry }
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
            onClick={() => onView(driver)}
            className="flex items-center px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </button>
          <button
            onClick={() => onEdit(driver)}
            className="flex items-center px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onToggleStatus(driver)}
            className={`flex items-center px-3 py-1 text-sm rounded-md transition-colors ${
              driver.status === 'active'
                ? 'text-red-600 hover:bg-red-50'
                : 'text-green-600 hover:bg-green-50'
            }`}
          >
            {driver.status === 'active' ? <UserX className="w-4 h-4 mr-1" /> : <UserCheck className="w-4 h-4 mr-1" />}
            {driver.status === 'active' ? 'Suspend' : 'Activate'}
          </button>
          <button
            onClick={() => onDelete(driver)}
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

// Main Driver Management component
const DriverManagement = () => {
  const navigate = useNavigate();

  // State to hold all driver data
  const [drivers, setDrivers] = useState([]);
  // State to hold drivers after applying search and filters
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  // Loading state for data fetching
  const [loading, setLoading] = useState(true);
  // Search term for filtering drivers by name, IQAMA, mobile, or vehicle number
  const [searchTerm, setSearchTerm] = useState('');
  // Filter for driver status (e.g., 'all', 'approved', 'pending')
  const [statusFilter, setStatusFilter] = useState('all');

  // Boolean states to control the visibility of different modals
  const [showAddModal, setShowAddModal] = useState(false);
  // States to hold data for dropdowns in forms (e.g., companies, vehicles)
  const [companies, setCompanies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  // Enhanced state for displaying comprehensive driver statistics
  const [driverStats, setDriverStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    approved: 0,
    rejected: 0,
    documentsExpiring: 0,
    newThisMonth: 0,
    averageAge: 0,
    maleDrivers: 0,
    femaleDrivers: 0,
    withVehicles: 0,
    withoutVehicles: 0
  });

  // Additional state for enhanced features
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'date', 'status'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [selectedDrivers, setSelectedDrivers] = useState([]); // For bulk operations
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    nationality: '',
    city: '',
    company: '',
    vehicle_type: '',
    document_expiry: '',
    age_range: { min: '', max: '' },
    join_date_range: { start: '', end: '' }
  });

  // State for the new/edited driver form data
  const [newDriver, setNewDriver] = useState({
    driver_name: '',
    gender: 'male',
    iqama: '',
    mobile: '',
    city: '',
    nationality: '',
    dob: '',
    vehicle: '', // Will store vehicle ID
    company: '', // Will store company ID
    status: 'pending',
    remarks: '',
    iqama_expiry: '',
    passport_expiry: '',
    license_expiry: '',
    visa_expiry: '',
    medical_expiry: '',
    insurance_paid_by: '',
    accommodation_paid_by: '',
    phone_bill_paid_by: ''
  });

  // Handler for input changes in the add/edit driver form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDriver(prev => ({ ...prev, [name]: value }));
  };

  // Enhanced statistics calculation function
  const calculateEnhancedStats = (driversData) => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Document expiry check
    const documentsExpiring = driversData.filter(driver => {
      const expiryDates = [
        driver.iqama_expiry,
        driver.license_expiry,
        driver.passport_expiry,
        driver.medical_expiry
      ].filter(date => date);

      return expiryDates.some(date => {
        const expiryDate = new Date(date);
        return expiryDate <= thirtyDaysFromNow;
      });
    }).length;

    // New drivers this month
    const newThisMonth = driversData.filter(driver => {
      const joinDate = new Date(driver.created_at);
      return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
    }).length;

    // Age calculation
    const ages = driversData
      .filter(driver => driver.dob)
      .map(driver => {
        const birthDate = new Date(driver.dob);
        const age = now.getFullYear() - birthDate.getFullYear();
        const monthDiff = now.getMonth() - birthDate.getMonth();
        return monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate()) ? age - 1 : age;
      });

    const averageAge = ages.length > 0 ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) : 0;

    return {
      total: driversData.length,
      active: driversData.filter(d => d.status === 'active').length,
      pending: driversData.filter(d => d.status === 'pending').length,
      suspended: driversData.filter(d => d.status === 'suspended').length,
      approved: driversData.filter(d => d.status === 'approved').length,
      rejected: driversData.filter(d => d.status === 'rejected').length,
      documentsExpiring,
      newThisMonth,
      averageAge,
      maleDrivers: driversData.filter(d => d.gender === 'male').length,
      femaleDrivers: driversData.filter(d => d.gender === 'female').length,
      withVehicles: driversData.filter(d => d.vehicle && d.vehicle.id).length,
      withoutVehicles: driversData.filter(d => !d.vehicle || !d.vehicle.id).length
    };
  };

  // Toggle driver status function
  const handleToggleStatus = async (driver) => {
    try {
      const newStatus = driver.status === 'active' ? 'suspended' : 'active';
      const updatedDrivers = drivers.map(d =>
        d.id === driver.id ? { ...d, status: newStatus } : d
      );

      setDrivers(updatedDrivers);
      setFilteredDrivers(updatedDrivers);
      setDriverStats(calculateEnhancedStats(updatedDrivers));

      toast.success(`Driver ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
    } catch (error) {
      console.error('Error toggling driver status:', error);
      toast.error('Failed to update driver status');
    }
  };

  // Bulk operations handler
  const handleBulkOperation = async (operation) => {
    try {
      let updatedDrivers = [...drivers];

      switch (operation) {
        case 'activate':
          updatedDrivers = drivers.map(d =>
            selectedDrivers.includes(d.id) ? { ...d, status: 'active' } : d
          );
          break;
        case 'suspend':
          updatedDrivers = drivers.map(d =>
            selectedDrivers.includes(d.id) ? { ...d, status: 'suspended' } : d
          );
          break;
        case 'delete':
          updatedDrivers = drivers.filter(d => !selectedDrivers.includes(d.id));
          break;
        default:
          return;
      }

      setDrivers(updatedDrivers);
      setFilteredDrivers(updatedDrivers);
      setDriverStats(calculateEnhancedStats(updatedDrivers));
      setSelectedDrivers([]);
      setShowBulkActions(false);

      toast.success(`Bulk ${operation} completed successfully`);
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      toast.error('Failed to perform bulk operation');
    }
  };

  // useCallback to memoize the fetchDrivers function, preventing unnecessary re-renders
  const fetchDrivers = useCallback(async () => {
    setLoading(true); // Set loading to true before fetching
    try {
      console.log('🚗 Loading actual driver data from database');

      // Real API call to fetch driver data
      const response = await axiosInstance.get('/Register/drivers/');
      const driversData = Array.isArray(response.data)
        ? response.data
        : (response.data.results || []);

      setDrivers(driversData);
      setFilteredDrivers(driversData);
      setDriverStats(calculateEnhancedStats(driversData));

      console.log('✅ Loaded drivers from API:', driversData.length);

      // If no real data is available, fall back to simulated data for demo purposes
      if (driversData.length === 0) {
        console.log('📝 No real data found, using simulated data for demo');
        const actualDriverData = [
        {
          id: 3,
          driver_name: "Omar Al-Rashid",
          gender: "male",
          iqama: "IQ003",
          mobile: "+965-9876-5434",
          city: "Kuwait City",
          nationality: "Kuwait",
          dob: "1985-03-15", // Added a sample DOB
          status: "approved",
          remarks: "Excellent record",
          vehicle: {
            id: 3,
            vehicle_name: "Mercedes Sprinter",
            vehicle_number: "KWT-003",
            vehicle_type: "BUS"
          },
          company: {
            id: 1,
            company_name: "Kuwait Transport Company"
          },
          driver_profile_img: null,
          iqama_document: null,
          iqama_expiry: "2026-12-31",
          passport_document: null,
          passport_expiry: "2028-05-20",
          license_document: null,
          license_expiry: "2027-01-10",
          visa_document: null,
          visa_expiry: null,
          medical_document: null,
          medical_expiry: "2026-07-01",
          insurance_paid_by: "Company",
          accommodation_paid_by: "Driver",
          phone_bill_paid_by: "Company",
          created_at: "2025-07-06T09:41:30.751591Z"
        },
        {
          id: 2,
          driver_name: "Ahmed Hassan",
          gender: "male",
          iqama: "IQ002",
          mobile: "+965-9876-5433",
          city: "Kuwait City",
          nationality: "Kuwait",
          dob: "1990-08-22",
          status: "active", // Changed to active for testing stats
          remarks: "New driver, good performance",
          vehicle: {
            id: 2,
            vehicle_name: "Nissan Urvan",
            vehicle_number: "KWT-002",
            vehicle_type: "BUS"
          },
          company: {
            id: 1,
            company_name: "Kuwait Transport Company"
          },
          driver_profile_img: null,
          iqama_document: null,
          iqama_expiry: "2027-06-15",
          passport_document: null,
          passport_expiry: "2029-03-01",
          license_document: null,
          license_expiry: "2028-02-28",
          visa_document: null,
          visa_expiry: null,
          medical_document: null,
          medical_expiry: "2027-09-10",
          insurance_paid_by: "Driver",
          accommodation_paid_by: "Company",
          phone_bill_paid_by: "Driver",
          created_at: "2025-07-06T09:41:30.747301Z"
        },
        {
          id: 1,
          driver_name: "Mohammed Al-Ahmad",
          gender: "male",
          iqama: "IQ001",
          mobile: "+965-9876-5432",
          city: "Kuwait City",
          nationality: "Kuwait",
          dob: "1978-11-01",
          status: "pending", // Changed to pending for testing stats
          remarks: "Awaiting final documents",
          vehicle: {
            id: 1,
            vehicle_name: "Toyota Hiace",
            vehicle_number: "KWT-001",
            vehicle_type: "BUS"
          },
          company: {
            id: 1,
            company_name: "Kuwait Transport Company"
          },
          driver_profile_img: null,
          iqama_document: null,
          iqama_expiry: "2026-01-01",
          passport_document: null,
          passport_expiry: "2027-04-05",
          license_document: null,
          license_expiry: "2026-08-12",
          visa_document: null,
          visa_expiry: null,
          medical_document: null,
          medical_expiry: "2025-11-30",
          insurance_paid_by: "Company",
          accommodation_paid_by: "Company",
          phone_bill_paid_by: "Company",
          created_at: "2025-07-06T09:41:30.741675Z"
        }
      ];

        setDrivers(actualDriverData); // Update the main drivers state
        setFilteredDrivers(actualDriverData); // Initialize filtered drivers with all data

        // Calculate and update comprehensive driver statistics based on fetched data
        const stats = calculateEnhancedStats(actualDriverData);
        setDriverStats(stats);

        toast.success("✅ Using simulated data for demo"); // Success notification
      }
    } catch (error) {
      console.error('Error loading drivers:', error);
      toast.error("Failed to load driver data"); // Error notification
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  }, []); // Empty dependency array means this runs once on component mount

  // useCallback to memoize the fetchDependencies function
  const fetchDependencies = useCallback(async () => {
    try {
      // Simulated API call to fetch companies
      setCompanies([
        { id: 1, company_name: "Kuwait Transport Company" },
        { id: 2, company_name: "Gulf Logistics Inc." },
        { id: 3, company_name: "Desert Express Services" }
      ]);

      // Simulated API call to fetch vehicles
      setVehicles([
        { id: 1, vehicle_name: "Toyota Hiace", vehicle_number: "KWT-001", vehicle_type: "BUS" },
        { id: 2, vehicle_name: "Nissan Urvan", vehicle_number: "KWT-002", vehicle_type: "BUS" },
        { id: 3, vehicle_name: "Mercedes Sprinter", vehicle_number: "KWT-003", vehicle_type: "BUS" },
        { id: 4, vehicle_name: "Ford Transit", vehicle_number: "KWT-004", vehicle_type: "VAN" }
      ]);

      // Fetch companies and vehicles from API
      const [companiesResponse, vehiclesResponse] = await Promise.allSettled([
        axiosInstance.get('/companies/'),
        axiosInstance.get('/vehicles/')
      ]);

      // Process companies data
      let companiesData = [];
      if (companiesResponse.status === 'fulfilled') {
        companiesData = Array.isArray(companiesResponse.value.data)
          ? companiesResponse.value.data
          : (companiesResponse.value.data.results || []);
      }

      // Process vehicles data
      let vehiclesData = [];
      if (vehiclesResponse.status === 'fulfilled') {
        vehiclesData = Array.isArray(vehiclesResponse.value.data)
          ? vehiclesResponse.value.data
          : (vehiclesResponse.value.data.results || []);
      }

      // Set the data or use fallback
      setCompanies(companiesData.length > 0 ? companiesData : [
        { id: 1, company_name: "Kuwait Transport Company" },
        { id: 2, company_name: "Gulf Logistics Inc." },
        { id: 3, company_name: "Desert Express Services" }
      ]);

      setVehicles(vehiclesData.length > 0 ? vehiclesData : [
        { id: 1, vehicle_name: "Toyota Hiace", vehicle_number: "KWT-001", vehicle_type: "BUS" },
        { id: 2, vehicle_name: "Nissan Urvan", vehicle_number: "KWT-002", vehicle_type: "BUS" },
        { id: 3, vehicle_name: "Mercedes Sprinter", vehicle_number: "KWT-003", vehicle_type: "BUS" },
        { id: 4, vehicle_name: "Ford Transit", vehicle_number: "KWT-004", vehicle_type: "VAN" }
      ]);

      console.log('✅ Loaded companies:', companiesData.length || 'using fallback');
      console.log('✅ Loaded vehicles:', vehiclesData.length || 'using fallback');
    } catch (error) {
      console.error('Error loading dependencies:', error);
      toast.error("Failed to load form options"); // Error notification
    }
  }, []); // Empty dependency array means this runs once on component mount

  // useCallback to memoize the filterDrivers function
  const filterDrivers = useCallback(() => {
    let currentFiltered = drivers; // Start with the full list of drivers

    // Apply search term filter
    if (searchTerm) {
      currentFiltered = currentFiltered.filter(driver =>
        driver.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.iqama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.mobile.includes(searchTerm) ||
        driver.vehicle?.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      currentFiltered = currentFiltered.filter(driver => driver.status === statusFilter);
    }

    setFilteredDrivers(currentFiltered); // Update the state with filtered results
  }, [drivers, searchTerm, statusFilter]); // Dependencies for this memoized function

  // useEffect to call fetchDrivers and fetchDependencies on component mount
  useEffect(() => {
    fetchDrivers();
    fetchDependencies();
  }, [fetchDrivers, fetchDependencies]); // Dependencies ensure these functions are called when they change (which they won't due to useCallback)

  // useEffect to re-filter drivers whenever the main drivers list, search term, or status filter changes
  useEffect(() => {
    filterDrivers();
  }, [filterDrivers]); // Dependency ensures filterDrivers is called when it changes

  // Helper function to determine status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Helper function to determine status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'suspended': return <XCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  // Handler for deleting a driver
  const handleDeleteDriver = async (driverId) => {
    // Use a custom modal for confirmation instead of window.confirm in a real app
    if (window.confirm('Are you sure you want to delete this driver? This action cannot be undone.')) {
      try {
        console.log('🗑️ Simulating driver deletion for ID:', driverId);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Update local state by filtering out the deleted driver
        const updatedDrivers = drivers.filter(driver => driver.id !== driverId);
        setDrivers(updatedDrivers);
        setFilteredDrivers(updatedDrivers); // Also update filtered list

        // Recalculate and update statistics
        setDriverStats(calculateEnhancedStats(updatedDrivers));

        toast.success("✅ Driver deleted successfully (Simulated)"); // Success notification
      } catch (error) {
        console.error('Error deleting driver:', error);
        toast.error("Failed to delete driver"); // Error notification
      }
    }
  };

  // Handler for navigating to the edit page for a driver
  const handleEditDriver = (driver) => {
    navigate(`/profileedit/${driver.id}`);
  };

  // Handler for navigating to the view page for a driver
  const handleViewDriver = (driver) => {
    navigate(`/driver-profile/${driver.id}`);
  };

  // Handler for saving a driver (either adding new or updating existing)
  const handleSaveDriver = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      console.log('💾 Creating new driver via API');

      // Prepare the data for API submission
      const driverData = {
        driver_name: newDriver.driver_name,
        gender: newDriver.gender,
        iqama: newDriver.iqama,
        mobile: newDriver.mobile,
        city: newDriver.city,
        nationality: newDriver.nationality,
        dob: newDriver.dob || null,
        status: newDriver.status,
        remarks: newDriver.remarks || '',
        iqama_expiry: newDriver.iqama_expiry || null,
        passport_expiry: newDriver.passport_expiry || null,
        license_expiry: newDriver.license_expiry || null,
        visa_expiry: newDriver.visa_expiry || null,
        medical_expiry: newDriver.medical_expiry || null,
        insurance_paid_by: newDriver.insurance_paid_by || '',
        accommodation_paid_by: newDriver.accommodation_paid_by || '',
        phone_bill_paid_by: newDriver.phone_bill_paid_by || ''
      };

      // Add vehicle_id and Company_id only if they are selected
      if (newDriver.vehicle && newDriver.vehicle !== '') {
        driverData.vehicle_id = parseInt(newDriver.vehicle);
      }
      if (newDriver.company && newDriver.company !== '') {
        driverData.Company_id = parseInt(newDriver.company);
      }

      console.log('Submitting driver data:', driverData);

      // Make API call to create driver
      const response = await axiosInstance.post('/Register/drivers/', driverData);

      console.log('Driver created successfully:', response.data);
      toast.success("✅ Driver added successfully!");

      // Refresh the drivers list
      await loadDrivers();

      // Reset form fields and close modals after successful save
      setNewDriver({
        driver_name: '', gender: 'male', iqama: '', mobile: '', city: '',
        nationality: '', dob: '', vehicle: '', company: '', status: 'pending',
        remarks: '', iqama_expiry: '', passport_expiry: '', license_expiry: '',
        visa_expiry: '', medical_expiry: '', insurance_paid_by: '',
        accommodation_paid_by: '', phone_bill_paid_by: ''
      });
      setShowAddModal(false); // Close add modal
    } catch (error) {
      console.error('Error saving driver:', error);
      toast.error("Failed to save driver"); // Error notification
    }
  };

  // Display a loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-8xl mx-auto font-inter">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="h-8 w-8 mr-3 text-blue-600" />
              Driver Management
            </h1>
            <p className="text-gray-600 mt-2">Manage onboarded drivers, their status, and vehicle assignments</p>
          </div>
          {/* Button to open the Add New Driver modal */}
          <button
            onClick={() => {
              // Reset form for adding new driver
              setNewDriver({ // Reset form to default empty values
                driver_name: '', gender: 'male', iqama: '', mobile: '', city: '',
                nationality: '', dob: '', vehicle: '', company: '', status: 'pending',
                remarks: '', iqama_expiry: '', passport_expiry: '', license_expiry: '',
                visa_expiry: '', medical_expiry: '', insurance_paid_by: '',
                accommodation_paid_by: '', phone_bill_paid_by: ''
              });
              setShowAddModal(true); // Show the add modal
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-md"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Driver</span>
          </button>
        </div>
      </div>

      {/* Enhanced Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Drivers"
          value={driverStats.total}
          subtitle={`${driverStats.newThisMonth} new this month`}
          icon={Users}
          color="bg-blue-500"
          change={driverStats.newThisMonth > 0 ? `+${driverStats.newThisMonth}` : null}
          changeType="increase"
        />

        <StatCard
          title="Active Drivers"
          value={driverStats.active}
          subtitle={`${Math.round((driverStats.active / driverStats.total) * 100)}% of total`}
          icon={CheckCircle}
          color="bg-green-500"
        />

        <StatCard
          title="Pending Approval"
          value={driverStats.pending}
          subtitle="Awaiting review"
          icon={Clock}
          color="bg-yellow-500"
        />

        <StatCard
          title="Documents Expiring"
          value={driverStats.documentsExpiring}
          subtitle="Within 30 days"
          icon={AlertTriangle}
          color="bg-red-500"
        />
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="With Vehicles"
          value={driverStats.withVehicles}
          subtitle={`${driverStats.withoutVehicles} without vehicles`}
          icon={Car}
          color="bg-purple-500"
        />

        <StatCard
          title="Average Age"
          value={`${driverStats.averageAge} years`}
          subtitle="Driver average"
          icon={Users}
          color="bg-indigo-500"
        />

        <StatCard
          title="Suspended"
          value={driverStats.suspended}
          subtitle="Temporarily inactive"
          icon={UserX}
          color="bg-red-500"
        />

        <StatCard
          title="Gender Split"
          value={`${driverStats.maleDrivers}M / ${driverStats.femaleDrivers}F`}
          subtitle="Male / Female"
          icon={Users}
          color="bg-gray-500"
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
              {viewMode === 'cards' ? <BarChart3 className="w-4 h-4 mr-2" /> : <Users className="w-4 h-4 mr-2" />}
              {viewMode === 'cards' ? 'Table View' : 'Card View'}
            </button>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </button>

            {selectedDrivers.length > 0 && (
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Bulk Actions ({selectedDrivers.length})
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
              onClick={fetchDrivers}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
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
                onClick={() => handleBulkOperation('suspend')}
                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
              >
                Suspend Selected
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


      {/* Search and Filter Bar Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, IQAMA, mobile, or vehicle number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Drivers Display Section - Cards or Table View */}
      {viewMode === 'cards' ? (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => (
            <DriverCard
              key={driver.id}
              driver={driver}
              onView={handleViewDriver}
              onEdit={handleEditDriver}
              onDelete={handleDeleteDriver}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDrivers(filteredDrivers.map(d => d.id));
                        } else {
                          setSelectedDrivers([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedDrivers.includes(driver.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDrivers([...selectedDrivers, driver.id]);
                        } else {
                          setSelectedDrivers(selectedDrivers.filter(id => id !== driver.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{driver.driver_name}</div>
                        <div className="text-sm text-gray-500">IQAMA: {driver.iqama}</div>
                        <div className="text-sm text-gray-500">{driver.nationality}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {driver.mobile}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {driver.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Car className="h-4 w-4 mr-2 text-gray-400" />
                      {driver.vehicle?.vehicle_name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">{driver.vehicle?.vehicle_number || 'N/A'}</div>
                    <div className="text-xs text-gray-400">{driver.vehicle?.vehicle_type || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(driver.status)}`}>
                      {getStatusIcon(driver.status)}
                      <span className="ml-1 capitalize">{driver.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {driver.created_at ? new Date(driver.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {/* View Details Button */}
                      <button
                        onClick={() => handleViewDriver(driver)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {/* Edit Driver Button */}
                      <button
                        onClick={() => handleEditDriver(driver)}
                        className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                        title="Edit Driver"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {/* Delete Driver Button */}
                      <button
                        onClick={() => handleDeleteDriver(driver.id)} // Call handler to delete driver
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        title="Delete Driver"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Message when no drivers are found */}
        {filteredDrivers.length === 0 && (
          <div className="text-center py-12 bg-gray-50">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No drivers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first driver.'
              }
            </p>
          </div>
        )}
        </div>
      )}

      {/* Empty State for Card View */}
      {viewMode === 'cards' && filteredDrivers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No drivers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first driver.'
            }
          </p>
        </div>
      )}

      {/* Add New Driver Modal */}
      <Modal show={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Driver">
        <form onSubmit={handleSaveDriver} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Driver Name */}
          <div className="col-span-2">
            <label htmlFor="driver_name" className="block text-sm font-medium text-gray-700">Driver Name</label>
            <input
              type="text"
              name="driver_name"
              id="driver_name"
              value={newDriver.driver_name}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              name="gender"
              id="gender"
              value={newDriver.gender}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* IQAMA */}
          <div>
            <label htmlFor="iqama" className="block text-sm font-medium text-gray-700">IQAMA</label>
            <input
              type="text"
              name="iqama"
              id="iqama"
              value={newDriver.iqama}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Mobile */}
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile</label>
            <input
              type="text"
              name="mobile"
              id="mobile"
              value={newDriver.mobile}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              name="city"
              id="city"
              value={newDriver.city}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Nationality */}
          <div>
            <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">Nationality</label>
            <input
              type="text"
              name="nationality"
              id="nationality"
              value={newDriver.nationality}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              name="dob"
              id="dob"
              value={newDriver.dob}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Vehicle Dropdown */}
          <div>
            <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700">Vehicle</label>
            <select
              name="vehicle"
              id="vehicle"
              value={newDriver.vehicle}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.vehicle_name} ({vehicle.vehicle_number})</option>
              ))}
            </select>
          </div>

          {/* Company Dropdown */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
            <select
              name="company"
              id="company"
              value={newDriver.company}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select Company</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>{company.company_name}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              id="status"
              value={newDriver.status}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Remarks Textarea */}
          <div className="col-span-2">
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
            <textarea
              name="remarks"
              id="remarks"
              value={newDriver.remarks}
              onChange={handleInputChange}
              rows="3"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            ></textarea>
          </div>

          {/* Expiry Dates Section */}
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 mt-4">
            <div>
              <label htmlFor="iqama_expiry" className="block text-sm font-medium text-gray-700">IQAMA Expiry</label>
              <input type="date" name="iqama_expiry" id="iqama_expiry" value={newDriver.iqama_expiry} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
            </div>
            <div>
              <label htmlFor="passport_expiry" className="block text-sm font-medium text-gray-700">Passport Expiry</label>
              <input type="date" name="passport_expiry" id="passport_expiry" value={newDriver.passport_expiry} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
            </div>
            <div>
              <label htmlFor="license_expiry" className="block text-sm font-medium text-gray-700">License Expiry</label>
              <input type="date" name="license_expiry" id="license_expiry" value={newDriver.license_expiry} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
            </div>
            <div>
              <label htmlFor="visa_expiry" className="block text-sm font-medium text-gray-700">Visa Expiry</label>
              <input type="date" name="visa_expiry" id="visa_expiry" value={newDriver.visa_expiry} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
            </div>
            <div>
              <label htmlFor="medical_expiry" className="block text-sm font-medium text-gray-700">Medical Expiry</label>
              <input type="date" name="medical_expiry" id="medical_expiry" value={newDriver.medical_expiry} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
            </div>
          </div>

          {/* Paid By Fields Section */}
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 mt-4">
            <div>
              <label htmlFor="insurance_paid_by" className="block text-sm font-medium text-gray-700">Insurance Paid By</label>
              <input type="text" name="insurance_paid_by" id="insurance_paid_by" value={newDriver.insurance_paid_by} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
            </div>
            <div>
              <label htmlFor="accommodation_paid_by" className="block text-sm font-medium text-gray-700">Accommodation Paid By</label>
              <input type="text" name="accommodation_paid_by" id="accommodation_paid_by" value={newDriver.accommodation_paid_by} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
            </div>
            <div>
              <label htmlFor="phone_bill_paid_by" className="block text-sm font-medium text-gray-700">Phone Bill Paid By</label>
              <input type="text" name="phone_bill_paid_by" id="phone_bill_paid_by" value={newDriver.phone_bill_paid_by} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="col-span-2 flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Add Driver
            </button>
          </div>
        </form>
      </Modal>



    </div>
  );
};

export default DriverManagement;
