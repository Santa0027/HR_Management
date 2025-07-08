import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import {
  ChevronDown, CircleUserRound, AlertTriangle,
  TrendingUp, Users, Clock, FileText, Calendar, Search, Filter, Download,
  RefreshCw, BarChart3, Activity, AlertCircle, TrendingDown, UserCheck, UserX,
  Target, Plus
} from 'lucide-react';
import { toast } from 'react-toastify';

// Modern UI Components with Professional Styling
const Card = ({ children, className = '', onClick }) => (
  <div
    className={`bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-105' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const MetricCard = ({ title, value, change, changeType, icon: Icon, color, onClick, subtitle }) => (
  <Card onClick={onClick} className="p-6">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        {change && (
          <div className={`flex items-center mt-2 text-sm ${
            changeType === 'increase' ? 'text-green-600' :
            changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {changeType === 'increase' ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : changeType === 'decrease' ? (
              <TrendingDown className="h-4 w-4 mr-1" />
            ) : (
              <Activity className="h-4 w-4 mr-1" />
            )}
            {change}
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="h-8 w-8 text-white" />
      </div>
    </div>
  </Card>
);

const Button = ({ children, onClick, className = '', type = 'button', variant = 'primary', size = 'md', disabled = false }) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-md hover:shadow-lg',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-md hover:shadow-lg',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500 shadow-md hover:shadow-lg',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ type = 'text', placeholder, value, onChange, className = '', id, name, step, icon: Icon }) => (
  <div className="relative">
    {Icon && (
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
    )}
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      step={step}
      className={`w-full px-4 py-3 ${Icon ? 'pl-10' : ''} bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${className}`}
    />
  </div>
);



const Table = ({ children, className = '' }) => (
  <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
    <table className={`w-full divide-y divide-gray-200 ${className}`}>
      {children}
    </table>
  </div>
);

const TableHeader = ({ children }) => (
  <thead className="bg-gray-50">
    {children}
  </thead>
);

const TableBody = ({ children }) => (
  <tbody className="bg-white divide-y divide-gray-200">
    {children}
  </tbody>
);

const TableRow = ({ children, className = '' }) => (
  <tr className={`hover:bg-gray-50 transition-colors duration-150 ${className}`}>
    {children}
  </tr>
);

const TableHead = ({ children, className = '' }) => (
  <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

const TableCell = ({ children, className = '' }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>
    {children}
  </td>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};


const AttendanceReport = () => {
  // State for controlling the view type: 'daily' or 'monthly'
  const [viewType, setViewType] = useState('daily');
  // State to store raw daily attendance data
  const [dailyData, setDailyData] = useState([]);
  // State to store raw monthly attendance summary data
  const [monthlyData, setMonthlyData] = useState([]);
  // State to store data currently displayed in the table (after filtering/view switching)
  const [filteredData, setFilteredData] = useState([]);
  // State to store summary statistics (present, late, absent, deductions)
  const [summary, setSummary] = useState({});
  // State for the search input field
  const [searchTerm, setSearchTerm] = useState('');
  // State to manage loading status
  const [loading, setLoading] = useState(true);

  // Enhanced states for warning and termination functionality
  const [drivers, setDrivers] = useState([]);
  const [warningLetters, setWarningLetters] = useState([]);
  const [terminations, setTerminations] = useState([]);
  const [atRiskDrivers, setAtRiskDrivers] = useState([]);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Manual attendance entry states
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [manualEntryForm, setManualEntryForm] = useState({
    driver_id: '',
    date: new Date().toISOString().split('T')[0],
    login_time: '',
    logout_time: '',
    status: 'present',
    reason_for_deduction: '',
    deduct_amount: '0',
    platform: 'manual_entry'
  });

  // Bulk operations states
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  const [warningForm, setWarningForm] = useState({
    driver_id: '',
    reason: '',
    description: '',
    issued_date: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  // useEffect hook to load data when the component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true); // Set loading to true while fetching data

        // Fetch attendance, warnings, terminations, and drivers concurrently
        const results = await Promise.allSettled([
          axiosInstance.get('/hr/attendance/'), // Endpoint for daily attendance records
          axiosInstance.get('/hr/monthly-summary/'), // Endpoint for monthly attendance summary
          axiosInstance.get('/hr/warning-letters/'), // Warning letters
          axiosInstance.get('/hr/terminations/'), // Terminations
          axiosInstance.get('/Register/drivers/') // Drivers
        ]);

        let dailyDataResult = [];
        let monthlyDataResult = [];
        let warningLettersResult = [];
        let terminationsResult = [];
        let driversResult = [];

        // Process daily data result with enhanced error handling
        if (results[0].status === 'fulfilled') {
          const dailyResponse = results[0].value.data;
          dailyDataResult = Array.isArray(dailyResponse)
            ? dailyResponse
            : (dailyResponse?.results || []);
          console.log('✅ Daily attendance data loaded:', dailyDataResult.length, 'records');
        } else {
          console.error('❌ Failed to fetch daily attendance data:', results[0].reason);
          toast.error('Failed to load daily attendance data');
          dailyDataResult = [];
        }

        // Process monthly data result with enhanced error handling
        if (results[1].status === 'fulfilled') {
          const monthlyResponse = results[1].value.data;
          monthlyDataResult = Array.isArray(monthlyResponse)
            ? monthlyResponse
            : (monthlyResponse?.results || []);
          console.log('✅ Monthly attendance summary loaded:', monthlyDataResult.length, 'records');
        } else {
          console.error('❌ Failed to fetch monthly attendance summary:', results[1].reason);
          toast.error('Failed to load monthly attendance summary');
          monthlyDataResult = [];
        }

        // Process warning letters result with enhanced error handling
        if (results[2].status === 'fulfilled') {
          const warningResponse = results[2].value.data;
          warningLettersResult = Array.isArray(warningResponse)
            ? warningResponse
            : (warningResponse?.results || []);
          console.log('✅ Warning letters loaded:', warningLettersResult.length, 'records');
        } else {
          console.error('❌ Failed to fetch warning letters:', results[2].reason);
          toast.warn('Warning letters data unavailable');
          warningLettersResult = [];
        }

        // Process terminations result with enhanced error handling
        if (results[3].status === 'fulfilled') {
          const terminationResponse = results[3].value.data;
          terminationsResult = Array.isArray(terminationResponse)
            ? terminationResponse
            : (terminationResponse?.results || []);
          console.log('✅ Terminations loaded:', terminationsResult.length, 'records');
        } else {
          console.error('❌ Failed to fetch terminations:', results[3].reason);
          toast.warn('Termination data unavailable');
          terminationsResult = [];
        }

        // Process drivers result with enhanced error handling
        if (results[4].status === 'fulfilled') {
          const driversResponse = results[4].value.data;
          driversResult = Array.isArray(driversResponse)
            ? driversResponse
            : (driversResponse?.results || []);
          console.log('✅ Drivers loaded:', driversResult.length, 'records');
        } else {
          console.error('❌ Failed to fetch drivers:', results[4].reason);
          toast.error('Failed to load drivers data');
          driversResult = [];
        }

        setDailyData(dailyDataResult); // Store daily data
        setMonthlyData(monthlyDataResult); // Store monthly data
        setWarningLetters(warningLettersResult); // Store warning letters
        setTerminations(terminationsResult); // Store terminations
        setDrivers(driversResult); // Store drivers

        // Calculate at-risk drivers
        const atRisk = calculateAtRiskDrivers(dailyDataResult, driversResult);
        setAtRiskDrivers(atRisk);

        // Initialize filteredData and summary with daily data by default
        setFilteredData(dailyDataResult);
        setSummary(calculateSummary(dailyDataResult, 'daily')); // Pass 'daily' viewType to summary calculation
        setLoading(false); // Set loading to false after data is loaded
      } catch (error) {
        // This catch block will only hit if Promise.allSettled itself throws, which is rare.
        // Individual promise rejections are handled within Promise.allSettled results.
        console.error('An unexpected error occurred during data loading:', error);
        setLoading(false); // Ensure loading is set to false even if there's an error
      }
    };

    loadData(); // Call the data loading function
  }, []); // Empty dependency array means this effect runs only once on mount

  // Function to calculate attendance summary based on the current data and view type
  const calculateSummary = (data, currentViewType) => {
    let present = 0;
    let late = 0;
    let absent = 0;
    let totalDeductions = 0;

    if (currentViewType === 'daily') {
      data.forEach(item => {
        const status = item.status?.toLowerCase().trim(); // Get status, convert to lowercase and trim whitespace

        // More comprehensive status checking to handle various backend formats
        if (status === 'on-time' || status === 'present' || status === 'on_time' || status === 'ontime') {
          present++;
        } else if (status === 'late' || status === 'delayed') {
          present++; // Late counts as present, but also late
          late++;
        } else if (status === 'absent' || status === 'not_present' || status === 'no_show' || !status) {
          absent++; // Absent or missing status
        } else {
          // For any unknown status, log it and count as absent
          console.warn('Unknown attendance status:', item.status, 'for driver:', item.driver_name);
          absent++;
        }

        // Handle deduction amounts more safely
        const deductAmount = parseFloat(item.deduct_amount || item.deduction_amount || 0);
        totalDeductions += isNaN(deductAmount) ? 0 : deductAmount;
      });

      const totalRecords = present + absent; // Total records processed
      // Calculate on-time percentage (present minus late, divided by total records)
      const onTimePercent = totalRecords > 0 ? (((present - late) / totalRecords) * 100).toFixed(2) : 0;

      return {
        present,
        late,
        absent,
        on_time_percent: onTimePercent,
        total_deductions: totalDeductions.toFixed(2),
        total_records: totalRecords
      };
    } else { // Monthly view summary
        // For monthly, data already contains aggregated counts from the backend
        data.forEach(item => {
            present += parseInt(item.present_days || item.present || 0);
            late += parseInt(item.late_days || item.late || 0);
            absent += parseInt(item.absent_days || item.absent || 0);

            const monthlyDeductions = parseFloat(item.total_deductions_amount || item.total_deductions || 0);
            totalDeductions += isNaN(monthlyDeductions) ? 0 : monthlyDeductions;
        });

        const totalEntries = present + absent;
        const onTimePercent = totalEntries > 0 ? (((present - late) / totalEntries) * 100).toFixed(2) : 0;

        return {
            present,
            late,
            absent,
            on_time_percent: onTimePercent,
            total_deductions: totalDeductions.toFixed(2),
            total_records: totalEntries
        };
    }
  };

  // Calculate at-risk drivers based on attendance patterns
  const calculateAtRiskDrivers = (attendanceData, driversData) => {
    const driverStats = {};

    // Initialize driver stats
    driversData.forEach(driver => {
      driverStats[driver.id] = {
        id: driver.id,
        name: driver.driver_name,
        total: 0,
        late: 0,
        absent: 0,
        deductions: 0,
        riskScore: 0
      };
    });

    // Calculate stats from attendance data
    attendanceData.forEach(record => {
      const driverId = record.driver_id || record.driver?.id;
      if (driverStats[driverId]) {
        driverStats[driverId].total++;

        const status = record.status?.toLowerCase();
        if (status === 'late') {
          driverStats[driverId].late++;
        } else if (status === 'absent') {
          driverStats[driverId].absent++;
        }

        if (record.deduct_amount) {
          driverStats[driverId].deductions += parseFloat(record.deduct_amount);
        }
      }
    });

    // Calculate risk scores and filter at-risk drivers
    const atRiskDrivers = [];
    Object.values(driverStats).forEach(driver => {
      if (driver.total > 0) {
        const riskPercentage = ((driver.late + driver.absent) / driver.total) * 100;
        driver.riskScore = riskPercentage;

        // Consider drivers with >20% late/absent as at-risk
        if (riskPercentage > 20) {
          atRiskDrivers.push(driver);
        }
      }
    });

    return atRiskDrivers.sort((a, b) => b.riskScore - a.riskScore);
  };

  // Handle warning letter creation
  const handleCreateWarning = async () => {
    if (!warningForm.driver_id || !warningForm.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await axiosInstance.post('/hr/warning-letters/', {
        ...warningForm,
        issued_by_id: 1 // Replace with actual user ID
      });
      toast.success('Warning letter issued successfully');
      setShowWarningModal(false);
      setWarningForm({
        driver_id: '',
        reason: '',
        description: '',
        issued_date: new Date().toISOString().split('T')[0],
        status: 'active'
      });
      // Refresh data by calling the loadData function again
      const loadDataAgain = async () => {
        try {
          const results = await Promise.allSettled([
            axiosInstance.get('/hr/attendance/'),
            axiosInstance.get('/hr/monthly-summary/'),
            axiosInstance.get('/hr/warning-letters/'),
            axiosInstance.get('/hr/terminations/'),
            axiosInstance.get('/Register/drivers/')
          ]);

          if (results[2].status === 'fulfilled') {
            setWarningLetters(results[2].value.data.results || results[2].value.data);
          }
        } catch (error) {
          console.error('Error refreshing data:', error);
        }
      };
      loadDataAgain();
    } catch (error) {
      console.error('Error creating warning:', error);
      toast.error('Failed to issue warning letter');
    }
  };

  // Handle manual attendance entry
  const handleManualEntry = async () => {
    if (!manualEntryForm.driver_id || !manualEntryForm.date) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const attendanceData = {
        driver: parseInt(manualEntryForm.driver_id),
        date: manualEntryForm.date,
        login_time: manualEntryForm.login_time || null,
        logout_time: manualEntryForm.logout_time || null,
        status: manualEntryForm.status,
        reason_for_deduction: manualEntryForm.reason_for_deduction || null,
        deduct_amount: parseFloat(manualEntryForm.deduct_amount) || 0,
        platform: 'manual_entry'
      };

      await axiosInstance.post('/hr/attendance/', attendanceData);
      toast.success('Manual attendance entry created successfully');
      setShowManualEntryModal(false);
      setManualEntryForm({
        driver_id: '',
        date: new Date().toISOString().split('T')[0],
        login_time: '',
        logout_time: '',
        status: 'present',
        reason_for_deduction: '',
        deduct_amount: '0',
        platform: 'manual_entry'
      });
      // Refresh data
      await handleRefresh();
    } catch (error) {
      console.error('Error creating manual attendance entry:', error);
      toast.error('Failed to create attendance entry');
    }
  };

  // Bulk operations handlers
  const handleSelectRecord = (recordId) => {
    setSelectedRecords(prev => {
      if (prev.includes(recordId)) {
        return prev.filter(id => id !== recordId);
      } else {
        return [...prev, recordId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === filteredData.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(filteredData.map(record => record.id));
    }
  };

  const handleBulkAction = async () => {
    if (selectedRecords.length === 0) {
      toast.error('Please select records to perform bulk action');
      return;
    }

    if (!bulkAction) {
      toast.error('Please select a bulk action');
      return;
    }

    try {
      switch (bulkAction) {
        case 'mark_present':
          await Promise.all(selectedRecords.map(id =>
            axiosInstance.patch(`/hr/attendance/${id}/`, { status: 'present' })
          ));
          toast.success(`Marked ${selectedRecords.length} records as present`);
          break;
        case 'mark_absent':
          await Promise.all(selectedRecords.map(id =>
            axiosInstance.patch(`/hr/attendance/${id}/`, { status: 'absent' })
          ));
          toast.success(`Marked ${selectedRecords.length} records as absent`);
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedRecords.length} records?`)) {
            await Promise.all(selectedRecords.map(id =>
              axiosInstance.delete(`/hr/attendance/${id}/`)
            ));
            toast.success(`Deleted ${selectedRecords.length} records`);
          }
          break;
        default:
          toast.error('Invalid bulk action');
          return;
      }

      // Reset selections and refresh data
      setSelectedRecords([]);
      setBulkAction('');
      setShowBulkActions(false);
      await handleRefresh();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  // Enhanced handler for search input changes
  const handleSearch = (e) => {
    const value = e.target.value.trim();
    setSearchTerm(value);

    // Enhanced filtering with multiple search criteria
    if (viewType === 'daily') {
      const filtered = dailyData.filter(d => {
        const searchLower = value.toLowerCase();
        return (
          d.driver_name?.toLowerCase().includes(searchLower) ||
          d.driver?.driver_name?.toLowerCase().includes(searchLower) ||
          d.status?.toLowerCase().includes(searchLower) ||
          d.platform?.toLowerCase().includes(searchLower) ||
          d.date?.includes(value)
        );
      });
      setFilteredData(filtered);
      setSummary(calculateSummary(filtered, 'daily'));
    } else {
      const filtered = monthlyData.filter(d => {
        const searchLower = value.toLowerCase();
        return (
          d.driver_name?.toLowerCase().includes(searchLower) ||
          d.driver?.driver_name?.toLowerCase().includes(searchLower) ||
          d.month?.toString().includes(value) ||
          d.year?.toString().includes(value)
        );
      });
      setFilteredData(filtered);
      setSummary(calculateSummary(filtered, 'monthly'));
    }
  };

  // Handler for switching between daily and monthly report views
  const handleViewSwitch = (type) => {
    setViewType(type);
    const data = type === 'daily' ? dailyData : monthlyData;
    setFilteredData(data);
    setSummary(calculateSummary(data, type));
    setSearchTerm(''); // Clear search term when switching views
  };

  // Handler for refreshing data
  const handleRefresh = async () => {
    try {
      setLoading(true);
      console.log('🔄 Refreshing attendance data...');

      const results = await Promise.allSettled([
        axiosInstance.get('/hr/attendance/'),
        axiosInstance.get('/hr/monthly-summary/'),
        axiosInstance.get('/hr/warning-letters/'),
        axiosInstance.get('/hr/terminations/'),
        axiosInstance.get('/Register/drivers/')
      ]);

      // Process results similar to initial load
      let dailyDataResult = [];
      let monthlyDataResult = [];
      let warningLettersResult = [];
      let terminationsResult = [];
      let driversResult = [];

      if (results[0].status === 'fulfilled') {
        const dailyResponse = results[0].value.data;
        dailyDataResult = Array.isArray(dailyResponse) ? dailyResponse : (dailyResponse?.results || []);
      }

      if (results[1].status === 'fulfilled') {
        const monthlyResponse = results[1].value.data;
        monthlyDataResult = Array.isArray(monthlyResponse) ? monthlyResponse : (monthlyResponse?.results || []);
      }

      if (results[2].status === 'fulfilled') {
        const warningResponse = results[2].value.data;
        warningLettersResult = Array.isArray(warningResponse) ? warningResponse : (warningResponse?.results || []);
      }

      if (results[3].status === 'fulfilled') {
        const terminationResponse = results[3].value.data;
        terminationsResult = Array.isArray(terminationResponse) ? terminationResponse : (terminationResponse?.results || []);
      }

      if (results[4].status === 'fulfilled') {
        const driversResponse = results[4].value.data;
        driversResult = Array.isArray(driversResponse) ? driversResponse : (driversResponse?.results || []);
      }

      // Update all state
      setDailyData(dailyDataResult);
      setMonthlyData(monthlyDataResult);
      setWarningLetters(warningLettersResult);
      setTerminations(terminationsResult);
      setDrivers(driversResult);

      // Recalculate at-risk drivers
      const atRisk = calculateAtRiskDrivers(dailyDataResult, driversResult);
      setAtRiskDrivers(atRisk);

      // Update current view
      const currentData = viewType === 'daily' ? dailyDataResult : monthlyDataResult;
      setFilteredData(currentData);
      setSummary(calculateSummary(currentData, viewType));

      toast.success('✅ Attendance data refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
      toast.error('Failed to refresh attendance data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Professional Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
                  Attendance Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Comprehensive attendance tracking and management system</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowManualEntryModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Manual Entry
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <Button
                variant="secondary"
                size="sm"
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <button className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors">
                English <ChevronDown size={16} className="ml-1" />
              </button>
              <CircleUserRound size={32} className="text-blue-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-8xl h-20 mx-auto space-y-8">
          {/* Enhanced Summary Cards with Dynamic Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <MetricCard
              title="Total Present"
              value={summary.present || 0}
              change={`${summary.total_records || 0} total records`}
              changeType="neutral"
              icon={UserCheck}
              color="bg-green-500"
              subtitle={viewType === 'daily' ? 'Present today' : 'Present this period'}
            />
            <MetricCard
              title="Late Arrivals"
              value={summary.late || 0}
              change={summary.present > 0 ? `${((summary.late / summary.present) * 100).toFixed(1)}% of present` : 'No data'}
              changeType={summary.late > 0 ? 'warning' : 'neutral'}
              icon={Clock}
              color="bg-yellow-500"
              subtitle="Delayed check-ins"
            />
            <MetricCard
              title="Total Absent"
              value={summary.absent || 0}
              change={summary.total_records > 0 ? `${((summary.absent / summary.total_records) * 100).toFixed(1)}% absence rate` : 'No data'}
              changeType={summary.absent > 0 ? 'decrease' : 'neutral'}
              icon={UserX}
              color="bg-red-500"
              subtitle="Missing employees"
            />
            <MetricCard
              title="On-time Rate"
              value={`${summary.on_time_percent || 0}%`}
              change={parseFloat(summary.on_time_percent || 0) >= 90 ? 'Excellent' : parseFloat(summary.on_time_percent || 0) >= 75 ? 'Good' : 'Needs improvement'}
              changeType={parseFloat(summary.on_time_percent || 0) >= 90 ? 'increase' : parseFloat(summary.on_time_percent || 0) >= 75 ? 'neutral' : 'decrease'}
              icon={Target}
              color="bg-blue-500"
              subtitle="Punctuality score"
            />
            <MetricCard
              title="Total Deductions"
              value={`₹${Number(summary.total_deductions || 0).toFixed(0)}`}
              change={summary.present > 0 ? `₹${(Number(summary.total_deductions || 0) / summary.present).toFixed(0)} avg per person` : 'No data'}
              changeType={Number(summary.total_deductions || 0) > 0 ? 'decrease' : 'neutral'}
              icon={AlertCircle}
              color="bg-purple-500"
              subtitle="Penalty amount"
            />
            <MetricCard
              title="At Risk Drivers"
              value={atRiskDrivers.length}
              change={atRiskDrivers.length > 0 ? 'Requires attention' : 'All good'}
              changeType={atRiskDrivers.length > 0 ? 'warning' : 'increase'}
              icon={AlertTriangle}
              color="bg-orange-500"
              subtitle="Performance alerts"
            />
          </div>

          {/* Controls Section */}
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      viewType === 'daily'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => handleViewSwitch('daily')}
                  >
                    <Calendar className="h-4 w-4 mr-2 inline" />
                    Daily Report
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      viewType === 'monthly'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => handleViewSwitch('monthly')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2 inline" />
                    Monthly Report
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 lg:w-1/3">
                <Input
                  type="text"
                  placeholder="Search by driver name..."
                  value={searchTerm}
                  onChange={handleSearch}
                  icon={Search}
                  className="flex-1"
                />
                {selectedRecords.length > 0 && (
                  <button
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="flex items-center px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors whitespace-nowrap"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Bulk ({selectedRecords.length})
                  </button>
                )}
              </div>
            </div>
          </Card>

          {/* Bulk Actions Panel */}
          {showBulkActions && selectedRecords.length > 0 && (
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-orange-800">
                      Bulk Actions ({selectedRecords.length} selected)
                    </h3>
                    <select
                      value={bulkAction}
                      onChange={(e) => setBulkAction(e.target.value)}
                      className="px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select Action</option>
                      <option value="mark_present">Mark as Present</option>
                      <option value="mark_absent">Mark as Absent</option>
                      <option value="delete">Delete Records</option>
                    </select>
                    <button
                      onClick={handleBulkAction}
                      disabled={!bulkAction}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Apply Action
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSelectAll}
                      className="px-3 py-2 text-orange-700 hover:bg-orange-100 rounded-lg transition-colors"
                    >
                      {selectedRecords.length === filteredData.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRecords([]);
                        setShowBulkActions(false);
                        setBulkAction('');
                      }}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Enhanced Attendance Table */}
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  {viewType === 'daily' ? 'Daily Attendance Records' : 'Monthly Attendance Summary'}
                </h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="info" className="text-xs">
                    {filteredData.length} records
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {viewType === 'daily' ? (
                      // Headers for Daily Report
                      <>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedRecords.length === filteredData.length && filteredData.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Assigned Time</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>Check-out</TableHead>
                        <TableHead>Photo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Active Hours</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Deduction</TableHead>
                        <TableHead>Actions</TableHead>
                      </>
                    ) : (
                      // Headers for Monthly Report
                      <>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedRecords.length === filteredData.length && filteredData.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead>Present Days</TableHead>
                        <TableHead>Late Days</TableHead>
                        <TableHead>Absent Days</TableHead>
                        <TableHead>Punctuality</TableHead>
                        <TableHead>Total Deductions</TableHead>
                        <TableHead>Actions</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
          <TableBody>
            {loading ? (
              // Loading state row
              <TableRow><TableCell colSpan={viewType === 'daily' ? 12 : 8} className="text-center p-4 text-gray-400">Loading data...</TableCell></TableRow>
            ) : filteredData.length === 0 ? (
              // No data found state row
              <TableRow><TableCell colSpan={viewType === 'daily' ? 12 : 8} className="text-center p-4 text-gray-400">No attendance data found for this view.</TableCell></TableRow>
            ) : viewType === 'daily' ? (
              // Render Daily Report rows
              filteredData.map((d, i) => (
                <TableRow key={i} className="border-b border-gray-800">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedRecords.includes(d.id)}
                      onChange={() => handleSelectRecord(d.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableCell>
                  <TableCell>{d.driver.driver_name}</TableCell>
                  <TableCell>{d.date}</TableCell>
                  <TableCell>{d.assigned_time}</TableCell>
                  <TableCell>{d.login_time || 'N/A'}</TableCell> {/* Use N/A or '-' for absent */}
                  <TableCell>{d.logout_time || 'N/A'}</TableCell>
                  <TableCell>
                    {d.login_photo ? (
                      <img src={d.login_photo} alt="driver" className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/32x32/cccccc/000000?text=No+Photo'; e.target.classList.add('p-1'); }} /> // Fallback placeholder
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">No Photo</div> // Fallback if no URL
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      d.status?.toLowerCase() === 'on-time' ? 'bg-green-700 text-green-100' :
                      d.status?.toLowerCase() === 'late' ? 'bg-yellow-700 text-yellow-100' : 'bg-red-700 text-red-100'
                    }`}>
                      {d.status}
                    </span>
                  </TableCell>
                  <TableCell>{d.active_time_hours || '-'}</TableCell>
                  <TableCell>{d.platform || '-'}</TableCell>
                  <TableCell>{d.reason_for_deduction || '-'}</TableCell>
                  <TableCell>₹{Number(d.deduct_amount || 0).toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              // Render Monthly Report rows
              filteredData.map((d, i) => (
                <TableRow key={i} className="border-b border-gray-800">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedRecords.includes(d.id)}
                      onChange={() => handleSelectRecord(d.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableCell>
                  <TableCell>{d.driver_name}</TableCell>
                  <TableCell>{d.month}</TableCell>
                  <TableCell>{d.present_days}</TableCell>
                  <TableCell>{d.late_days}</TableCell>
                  <TableCell>{d.absent_days}</TableCell>
                  <TableCell>{d.on_time_percentage}%</TableCell>
                  <TableCell>₹{Number(d.total_deductions_amount || 0).toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
        <div className="bg-[#C9D6DF] p-4 rounded-md shadow-lg">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-[#353535] text-sm">Total Present</p>
              <p className="text-2xl font-bold mt-1">{summary.present || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#C9D6DF] p-4 rounded-md shadow-lg">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-[#353535] text-sm">Late Arrivals</p>
              <p className="text-2xl font-bold mt-1">{summary.late || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#C9D6DF] p-4 rounded-md shadow-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-[#353535] text-sm">Total Absent</p>
              <p className="text-2xl font-bold mt-1">{summary.absent || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#C9D6DF] p-4 rounded-md shadow-lg">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-[#353535] text-sm">On-time %</p>
              <p className="text-2xl font-bold mt-1">{summary.on_time_percent || 0}%</p>
            </div>
          </div>
        </div>
        <div className="bg-[#C9D6DF] p-4 rounded-md shadow-lg">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-[#353535] text-sm">Deductions</p>
              <p className="text-2xl font-bold mt-1">₹{Number(summary.total_deductions || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#C9D6DF] p-4 rounded-md shadow-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-[#353535] text-sm">At Risk</p>
              <p className="text-2xl font-bold mt-1">{atRiskDrivers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* At-Risk Drivers Section */}
      {atRiskDrivers.length > 0 && (
        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-orange-800 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2" />
              Drivers at Risk ({atRiskDrivers.length})
            </h2>
            <button
              onClick={() => setShowWarningModal(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Issue Warning Letter
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {atRiskDrivers.slice(0, 6).map((driver) => (
              <div key={driver.id} className="bg-white border border-orange-300 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                  <span className="text-lg font-bold text-orange-600">{driver.riskScore.toFixed(1)}%</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Late: {driver.late} | Absent: {driver.absent}</p>
                  <p>Total Records: {driver.total}</p>
                  <p>Deductions: ₹{driver.deductions.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedDriverForWarning(driver);
                    setWarningForm({ ...warningForm, driver_id: driver.id });
                    setShowWarningModal(true);
                  }}
                  className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded text-sm"
                >
                  Issue Warning
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Action Buttons */}
      <div className="flex flex-wrap gap-4 mt-6">
        <Button className="bg-blue-600 hover:bg-blue-700">Export as PDF</Button>
        <Button className="bg-blue-600 hover:bg-blue-700">Export as CSV</Button>
        <button
          onClick={() => setShowWarningModal(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Issue Warning Letter
        </button>
        <a
          href="/warning-letter"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm inline-block"
        >
          Manage Warnings ({warningLetters.length})
        </a>
        <a
          href="/termination-letter"
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm inline-block"
        >
          Manage Terminations ({terminations.length})
        </a>
      </div>

      {/* Manual Attendance Entry Modal */}
      {showManualEntryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">📝 Manual Attendance Entry</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleManualEntry(); }}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Driver *
                  </label>
                  <select
                    value={manualEntryForm.driver_id}
                    onChange={(e) => setManualEntryForm({...manualEntryForm, driver_id: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Select Driver</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.driver_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={manualEntryForm.date}
                    onChange={(e) => setManualEntryForm({...manualEntryForm, date: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Status *
                  </label>
                  <select
                    value={manualEntryForm.status}
                    onChange={(e) => setManualEntryForm({...manualEntryForm, status: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="present">Present</option>
                    <option value="on-time">On Time</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Login Time
                    </label>
                    <input
                      type="time"
                      value={manualEntryForm.login_time}
                      onChange={(e) => setManualEntryForm({...manualEntryForm, login_time: e.target.value})}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Logout Time
                    </label>
                    <input
                      type="time"
                      value={manualEntryForm.logout_time}
                      onChange={(e) => setManualEntryForm({...manualEntryForm, logout_time: e.target.value})}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Deduction Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={manualEntryForm.deduct_amount}
                    onChange={(e) => setManualEntryForm({...manualEntryForm, deduct_amount: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Reason for Deduction
                  </label>
                  <textarea
                    value={manualEntryForm.reason_for_deduction}
                    onChange={(e) => setManualEntryForm({...manualEntryForm, reason_for_deduction: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows="3"
                    placeholder="Optional reason for deduction..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setShowManualEntryModal(false);
                      setManualEntryForm({
                        driver_id: '',
                        date: new Date().toISOString().split('T')[0],
                        login_time: '',
                        logout_time: '',
                        status: 'present',
                        reason_for_deduction: '',
                        deduct_amount: '0',
                        platform: 'manual_entry'
                      });
                    }}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Create Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Warning Letter Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Issue Warning Letter</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleCreateWarning(); }}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Driver *
                  </label>
                  <select
                    value={warningForm.driver_id}
                    onChange={(e) => setWarningForm({ ...warningForm, driver_id: e.target.value })}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Select Driver</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.driver_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Reason *
                  </label>
                  <select
                    value={warningForm.reason}
                    onChange={(e) => setWarningForm({ ...warningForm, reason: e.target.value })}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Select Reason</option>
                    <option value="late_delivery">Late Delivery</option>
                    <option value="speeding">Speeding</option>
                    <option value="reckless_driving">Reckless Driving</option>
                    <option value="unauthorized_route">Unauthorized Route</option>
                    <option value="vehicle_damage">Vehicle Damage</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Description
                  </label>
                  <textarea
                    value={warningForm.description}
                    onChange={(e) => setWarningForm({ ...warningForm, description: e.target.value })}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows="3"
                    placeholder="Additional details about the warning..."
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    value={warningForm.issued_date}
                    onChange={(e) => setWarningForm({ ...warningForm, issued_date: e.target.value })}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowWarningModal(false);
                      setSelectedDriverForWarning(null);
                      setWarningForm({
                        driver_id: '',
                        reason: '',
                        description: '',
                        issued_date: new Date().toISOString().split('T')[0],
                        status: 'active'
                      });
                    }}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Issue Warning
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;
