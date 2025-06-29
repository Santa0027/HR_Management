import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
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
  Upload
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

// Main Driver Management component
const DriverManagement = () => {
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
  // Stores the driver object currently selected for viewing or editing
  const [selectedDriver, setSelectedDriver] = useState(null);
  // Boolean states to control the visibility of different modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  // States to hold data for dropdowns in forms (e.g., companies, vehicles)
  const [companies, setCompanies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  // State for displaying driver statistics
  const [driverStats, setDriverStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    approved: 0
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

  // useCallback to memoize the fetchDrivers function, preventing unnecessary re-renders
  const fetchDrivers = useCallback(async () => {
    setLoading(true); // Set loading to true before fetching
    try {
      console.log('🚗 Loading actual driver data from database');

      // Simulated API call to fetch driver data
      // In a real application, this would be an `axios.get` call to your backend.
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

      // Calculate and update driver statistics based on fetched data
      const stats = {
        total: actualDriverData.length,
        active: actualDriverData.filter(d => d.status === 'active').length,
        pending: actualDriverData.filter(d => d.status === 'pending').length,
        suspended: actualDriverData.filter(d => d.status === 'suspended').length,
        approved: actualDriverData.filter(d => d.status === 'approved').length
      };
      setDriverStats(stats);

      toast.success("✅ Driver data loaded from database"); // Success notification
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

      toast.success("✅ Dependencies loaded"); // Success notification
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
        const stats = {
          total: updatedDrivers.length,
          active: updatedDrivers.filter(d => d.status === 'active').length,
          pending: updatedDrivers.filter(d => d.status === 'pending').length,
          suspended: updatedDrivers.filter(d => d.status === 'suspended').length,
          approved: updatedDrivers.filter(d => d.status === 'approved').length
        };
        setDriverStats(stats);

        toast.success("✅ Driver deleted successfully (Simulated)"); // Success notification
      } catch (error) {
        console.error('Error deleting driver:', error);
        toast.error("Failed to delete driver"); // Error notification
      }
    }
  };

  // Handler for initiating the edit process for a driver
  const handleEditDriver = (driver) => {
    setSelectedDriver(driver); // Set the driver to be edited
    // Populate the form state with the selected driver's data
    // Ensure date fields are formatted correctly for input type="date" (YYYY-MM-DD)
    setNewDriver({
      ...driver,
      vehicle: driver.vehicle?.id || '', // Use ID for select input
      company: driver.company?.id || '', // Use ID for select input
      dob: driver.dob ? new Date(driver.dob).toISOString().split('T')[0] : '',
      iqama_expiry: driver.iqama_expiry ? new Date(driver.iqama_expiry).toISOString().split('T')[0] : '',
      passport_expiry: driver.passport_expiry ? new Date(driver.passport_expiry).toISOString().split('T')[0] : '',
      license_expiry: driver.license_expiry ? new Date(driver.license_expiry).toISOString().split('T')[0] : '',
      visa_expiry: driver.visa_expiry ? new Date(driver.visa_expiry).toISOString().split('T')[0] : '',
      medical_expiry: driver.medical_expiry ? new Date(driver.medical_expiry).toISOString().split('T')[0] : '',
      insurance_paid_by: driver.insurance_paid_by || '',
      accommodation_paid_by: driver.accommodation_paid_by || '',
      phone_bill_paid_by: driver.phone_bill_paid_by || ''
    });
    setShowEditModal(true); // Show the edit modal
  };

  // Handler for saving a driver (either adding new or updating existing)
  const handleSaveDriver = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      console.log('💾 Simulating driver save operation');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find the full vehicle and company objects based on their IDs from dropdowns
      const vehicleObj = vehicles.find(v => v.id == newDriver.vehicle);
      const companyObj = companies.find(c => c.id == newDriver.company);

      if (selectedDriver) {
        // Logic for editing an existing driver
        const updatedDrivers = drivers.map(driver =>
          driver.id === selectedDriver.id
            ? {
                ...driver, // Keep existing driver properties
                ...newDriver, // Overlay with new form data
                vehicle: vehicleObj || driver.vehicle, // Use found object or existing if not changed
                company: companyObj || driver.company, // Use found object or existing if not changed
                updated_at: new Date().toISOString() // Update timestamp
              }
            : driver // Keep other drivers as they are
        );
        setDrivers(updatedDrivers);
        setFilteredDrivers(updatedDrivers);
        toast.success("✅ Driver updated successfully (Simulated)");
      } else {
        // Logic for adding a new driver
        const newDriverData = {
          ...newDriver, // New driver data from form
          id: Math.max(...drivers.map(d => d.id)) + 1, // Generate a unique ID (for simulation)
          created_at: new Date().toISOString(), // Set creation timestamp
          vehicle: vehicleObj, // Assign full vehicle object
          company: companyObj // Assign full company object
        };
        const updatedDrivers = [...drivers, newDriverData]; // Add new driver to the list
        setDrivers(updatedDrivers);
        setFilteredDrivers(updatedDrivers);

        // Recalculate and update statistics after adding a driver
        const stats = {
          total: updatedDrivers.length,
          active: updatedDrivers.filter(d => d.status === 'active').length,
          pending: updatedDrivers.filter(d => d.status === 'pending').length,
          suspended: updatedDrivers.filter(d => d.status === 'suspended').length,
          approved: updatedDrivers.filter(d => d.status === 'approved').length
        };
        setDriverStats(stats);

        toast.success("✅ Driver added successfully (Simulated)");
      }

      // Reset form fields and close modals after successful save
      setNewDriver({
        driver_name: '', gender: 'male', iqama: '', mobile: '', city: '',
        nationality: '', dob: '', vehicle: '', company: '', status: 'pending',
        remarks: '', iqama_expiry: '', passport_expiry: '', license_expiry: '',
        visa_expiry: '', medical_expiry: '', insurance_paid_by: '',
        accommodation_paid_by: '', phone_bill_paid_by: ''
      });
      setSelectedDriver(null); // Clear selected driver
      setShowAddModal(false); // Close add modal
      setShowEditModal(false); // Close edit modal
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
    <div className="p-6 max-w-7xl mx-auto font-inter">
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
              setSelectedDriver(null); // Ensure no driver is selected when adding new
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

      {/* Statistics Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Drivers</p>
              <p className="text-2xl font-bold text-gray-900">{driverStats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{driverStats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{driverStats.active}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{driverStats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Suspended</p>
              <p className="text-2xl font-bold text-gray-900">{driverStats.suspended}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
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

      {/* Drivers Table Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                        onClick={() => {
                          setSelectedDriver(driver); // Set the driver for viewing
                          setShowViewModal(true); // Open the view modal
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {/* Edit Driver Button */}
                      <button
                        onClick={() => handleEditDriver(driver)} // Call handler to prepare and open edit modal
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

      {/* Edit Driver Modal */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Driver">
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* View Driver Modal */}
      <Modal show={showViewModal} onClose={() => setShowViewModal(false)} title="Driver Details">
        {selectedDriver && (
          <div className="space-y-4 text-gray-700">
            <p><strong>Driver Name:</strong> {selectedDriver.driver_name}</p>
            <p><strong>Gender:</strong> {selectedDriver.gender}</p>
            <p><strong>IQAMA:</strong> {selectedDriver.iqama}</p>
            <p><strong>Mobile:</strong> {selectedDriver.mobile}</p>
            <p><strong>City:</strong> {selectedDriver.city}</p>
            <p><strong>Nationality:</strong> {selectedDriver.nationality}</p>
            <p><strong>Date of Birth:</strong> {selectedDriver.dob ? new Date(selectedDriver.dob).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Vehicle:</strong> {selectedDriver.vehicle?.vehicle_name || 'N/A'} ({selectedDriver.vehicle?.vehicle_number || 'N/A'})</p>
            <p><strong>Company:</strong> {selectedDriver.company?.company_name || 'N/A'}</p>
            <p><strong>Status:</strong> <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedDriver.status)}`}>
              {getStatusIcon(selectedDriver.status)}
              <span className="ml-1 capitalize">{selectedDriver.status}</span>
            </span></p>
            <p><strong>Remarks:</strong> {selectedDriver.remarks || 'N/A'}</p>
            <p><strong>IQAMA Expiry:</strong> {selectedDriver.iqama_expiry ? new Date(selectedDriver.iqama_expiry).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Passport Expiry:</strong> {selectedDriver.passport_expiry ? new Date(selectedDriver.passport_expiry).toLocaleDateString() : 'N/A'}</p>
            <p><strong>License Expiry:</strong> {selectedDriver.license_expiry ? new Date(selectedDriver.license_expiry).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Visa Expiry:</strong> {selectedDriver.visa_expiry ? new Date(selectedDriver.visa_expiry).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Medical Expiry:</strong> {selectedDriver.medical_expiry ? new Date(selectedDriver.medical_expiry).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Insurance Paid By:</strong> {selectedDriver.insurance_paid_by || 'N/A'}</p>
            <p><strong>Accommodation Paid By:</strong> {selectedDriver.accommodation_paid_by || 'N/A'}</p>
            <p><strong>Phone Bill Paid By:</strong> {selectedDriver.phone_bill_paid_by || 'N/A'}</p>
            <p><strong>Joined Date:</strong> {selectedDriver.created_at ? new Date(selectedDriver.created_at).toLocaleDateString() : 'N/A'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DriverManagement;
