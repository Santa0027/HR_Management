import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Search,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  FileText,
  Eye,
  Edit,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Target,
  Award,
  AlertCircle,
  Info,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Plus,
  Minus
} from 'lucide-react';

// Enhanced Attendance Report Component
const AttendanceReportEnhanced = () => {
  const navigate = useNavigate();
  
  // Main state
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Statistics state
  const [attendanceStats, setAttendanceStats] = useState({
    totalDrivers: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    onTimePercentage: 0,
    totalDeductions: 0,
    averageWorkingHours: 0,
    attendanceScore: 0,
    thisMonthPresent: 0,
    thisMonthAbsent: 0,
    atRiskDrivers: 0
  });

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [driverFilter, setDriverFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  
  // View and display states
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [viewType, setViewType] = useState('daily'); // 'daily' or 'monthly'
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Advanced features
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [expandedCards, setExpandedCards] = useState(new Set());

  // Fetch data on component mount
  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate, selectedMonth, viewType]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      
      const endpoints = [
        '/hr/attendance/',
        '/hr/monthly-summary/',
        '/Register/drivers/',
        '/hr/checkin-locations/'
      ];

      const results = await Promise.allSettled(
        endpoints.map(endpoint => axiosInstance.get(endpoint))
      );

      // Process attendance data
      let attendanceResult = [];
      if (results[0].status === 'fulfilled') {
        attendanceResult = results[0].value.data.results || results[0].value.data || [];
      }

      // Process monthly data
      let monthlyResult = [];
      if (results[1].status === 'fulfilled') {
        monthlyResult = results[1].value.data.results || results[1].value.data || [];
      }

      // Process drivers data
      let driversResult = [];
      if (results[2].status === 'fulfilled') {
        driversResult = results[2].value.data.results || results[2].value.data || [];
      }

      // Process locations data
      let locationsResult = [];
      if (results[3].status === 'fulfilled') {
        locationsResult = results[3].value.data.results || results[3].value.data || [];
      }

      setAttendanceData(attendanceResult);
      setMonthlyData(monthlyResult);
      setDrivers(driversResult);
      setFilteredData(attendanceResult);
      setAttendanceStats(calculateEnhancedStats(attendanceResult, driversResult));
      
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast.error('Failed to load attendance data');
      // Set empty arrays on error
      setAttendanceData([]);
      setMonthlyData([]);
      setDrivers([]);
      setFilteredData([]);
      setAttendanceStats(calculateEnhancedStats([], []));
    } finally {
      setLoading(false);
    }
  };

  // Enhanced statistics calculation
  const calculateEnhancedStats = (attendanceData, driversData) => {
    if (!Array.isArray(attendanceData) || !Array.isArray(driversData)) {
      return {
        totalDrivers: 0,
        presentToday: 0,
        absentToday: 0,
        lateToday: 0,
        onTimePercentage: 0,
        totalDeductions: 0,
        averageWorkingHours: 0,
        attendanceScore: 0,
        thisMonthPresent: 0,
        thisMonthAbsent: 0,
        atRiskDrivers: 0
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Today's attendance
    const todayAttendance = attendanceData.filter(record => 
      record.date === today
    );

    const presentToday = todayAttendance.filter(record => 
      ['on_time', 'late', 'logged_in'].includes(record.status)
    ).length;

    const lateToday = todayAttendance.filter(record => 
      record.status === 'late'
    ).length;

    const absentToday = driversData.length - presentToday;

    // This month's data
    const thisMonthAttendance = attendanceData.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() + 1 === currentMonth && 
             recordDate.getFullYear() === currentYear;
    });

    const thisMonthPresent = thisMonthAttendance.filter(record => 
      ['on_time', 'late', 'logged_in'].includes(record.status)
    ).length;

    const thisMonthAbsent = thisMonthAttendance.filter(record => 
      record.status === 'absent'
    ).length;

    // Calculate deductions
    const totalDeductions = attendanceData.reduce((sum, record) => 
      sum + (parseFloat(record.deduct_amount) || 0), 0
    );

    // Calculate average working hours
    const workingHoursData = attendanceData.filter(record => 
      record.login_time && record.logout_time
    );

    const averageWorkingHours = workingHoursData.length > 0 
      ? workingHoursData.reduce((sum, record) => {
          const loginTime = new Date(`2000-01-01T${record.login_time}`);
          const logoutTime = new Date(`2000-01-01T${record.logout_time}`);
          const hours = (logoutTime - loginTime) / (1000 * 60 * 60);
          return sum + hours;
        }, 0) / workingHoursData.length
      : 0;

    // Calculate on-time percentage
    const onTimePercentage = todayAttendance.length > 0 
      ? ((todayAttendance.filter(record => record.status === 'on_time').length / todayAttendance.length) * 100)
      : 0;

    // Calculate attendance score
    const attendanceScore = Math.max(0, 100 - (lateToday * 5) - (absentToday * 10));

    // Calculate at-risk drivers (drivers with poor attendance patterns)
    const driverAttendanceMap = {};
    driversData.forEach(driver => {
      const driverRecords = attendanceData.filter(record => 
        record.driver_id === driver.id || record.driver?.id === driver.id
      );
      const lateCount = driverRecords.filter(record => record.status === 'late').length;
      const absentCount = driverRecords.filter(record => record.status === 'absent').length;
      const totalRecords = driverRecords.length;
      
      if (totalRecords > 0) {
        const riskScore = (lateCount * 2 + absentCount * 5) / totalRecords;
        driverAttendanceMap[driver.id] = riskScore;
      }
    });

    const atRiskDrivers = Object.values(driverAttendanceMap).filter(score => score > 2).length;

    return {
      totalDrivers: driversData.length,
      presentToday,
      absentToday,
      lateToday,
      onTimePercentage: Math.round(onTimePercentage * 100) / 100,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      averageWorkingHours: Math.round(averageWorkingHours * 100) / 100,
      attendanceScore: Math.round(attendanceScore),
      thisMonthPresent,
      thisMonthAbsent,
      atRiskDrivers
    };
  };

  // Filter data based on search and filters
  useEffect(() => {
    if (!Array.isArray(attendanceData)) {
      setFilteredData([]);
      return;
    }

    let filtered = attendanceData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.driver?.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.checked_in_location?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setDate(today.getDate());
          break;
        case 'yesterday':
          filterDate.setDate(today.getDate() - 1);
          break;
        case 'week':
          filterDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() - 1);
          break;
        default:
          break;
      }

      if (dateFilter !== 'all') {
        filtered = filtered.filter(record => {
          const recordDate = new Date(record.date);
          return dateFilter === 'today' 
            ? recordDate.toDateString() === today.toDateString()
            : recordDate >= filterDate;
        });
      }
    }

    // Driver filter
    if (driverFilter !== 'all') {
      filtered = filtered.filter(record => 
        record.driver_id === parseInt(driverFilter) || record.driver?.id === parseInt(driverFilter)
      );
    }

    // Sort data
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'driver':
          aValue = a.driver?.driver_name || a.driver_name || '';
          bValue = b.driver?.driver_name || b.driver_name || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'login_time':
          aValue = a.login_time || '';
          bValue = b.login_time || '';
          break;
        default:
          aValue = a[sortBy] || '';
          bValue = b[sortBy] || '';
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredData(filtered);
  }, [attendanceData, searchTerm, statusFilter, dateFilter, driverFilter, sortBy, sortOrder]);

  // Helper functions
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'on_time': return 'bg-green-100 text-green-800 border-green-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'logged_in': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'on_time': return <CheckCircle className="w-4 h-4" />;
      case 'late': return <Clock className="w-4 h-4" />;
      case 'absent': return <XCircle className="w-4 h-4" />;
      case 'logged_in': return <UserCheck className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const time = new Date(`2000-01-01T${timeString}`);
      return time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  const calculateWorkingHours = (loginTime, logoutTime) => {
    if (!loginTime || !logoutTime) return 'N/A';
    try {
      const login = new Date(`2000-01-01T${loginTime}`);
      const logout = new Date(`2000-01-01T${logoutTime}`);
      const hours = (logout - login) / (1000 * 60 * 60);
      return `${hours.toFixed(1)}h`;
    } catch {
      return 'N/A';
    }
  };

  // Export functions
  const exportToCSV = () => {
    const headers = ['Date', 'Driver Name', 'Status', 'Login Time', 'Logout Time', 'Working Hours', 'Location', 'Deduction'];
    const csvData = filteredData.map(record => [
      record.date,
      record.driver?.driver_name || record.driver_name || 'N/A',
      record.status,
      formatTime(record.login_time),
      formatTime(record.logout_time),
      calculateWorkingHours(record.login_time, record.logout_time),
      record.checked_in_location?.name || 'N/A',
      record.deduct_amount || '0'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // This would integrate with a PDF library like jsPDF
    toast.info('PDF export functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance Report</h1>
            <p className="text-gray-600 mt-2">Comprehensive driver attendance tracking and analytics</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <button
              onClick={fetchAttendanceData}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceStats.totalDrivers}</p>
                <p className="text-xs text-gray-500">{attendanceStats.atRiskDrivers} at risk</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceStats.presentToday}</p>
                <p className="text-xs text-gray-500">{attendanceStats.lateToday} late arrivals</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceStats.onTimePercentage}%</p>
                <p className="text-xs text-gray-500">Score: {attendanceStats.attendanceScore}/100</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deductions</p>
                <p className="text-2xl font-bold text-gray-900">${attendanceStats.totalDeductions}</p>
                <p className="text-xs text-gray-500">Avg: {attendanceStats.averageWorkingHours}h/day</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search drivers, status, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {showAdvancedFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={viewType}
                onChange={(e) => setViewType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Daily View</option>
                <option value="monthly">Monthly View</option>
              </select>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="on_time">On Time</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                    <option value="logged_in">Logged In</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Driver</label>
                  <select
                    value={driverFilter}
                    onChange={(e) => setDriverFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Drivers</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.driver_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <div className="flex space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="date">Date</option>
                      <option value="driver">Driver Name</option>
                      <option value="status">Status</option>
                      <option value="login_time">Login Time</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Attendance Data Display */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((record) => (
              <AttendanceCard
                key={`${record.id}-${record.date}`}
                record={record}
                onExpand={() => {
                  const newExpanded = new Set(expandedCards);
                  if (newExpanded.has(record.id)) {
                    newExpanded.delete(record.id);
                  } else {
                    newExpanded.add(record.id);
                  }
                  setExpandedCards(newExpanded);
                }}
                isExpanded={expandedCards.has(record.id)}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                formatTime={formatTime}
                calculateWorkingHours={calculateWorkingHours}
              />
            ))}
          </div>
        ) : (
          <AttendanceTable
            data={filteredData}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            formatTime={formatTime}
            calculateWorkingHours={calculateWorkingHours}
          />
        )}

        {/* Empty State */}
        {filteredData.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No attendance data available for the selected period.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Attendance Card Component
const AttendanceCard = ({
  record,
  onExpand,
  isExpanded,
  getStatusColor,
  getStatusIcon,
  formatTime,
  calculateWorkingHours
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {record.driver?.driver_name || record.driver_name || 'Unknown Driver'}
            </h3>
            <p className="text-sm text-gray-500">{record.date}</p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
            {getStatusIcon(record.status)}
            <span className="ml-1">{record.status?.replace('_', ' ').toUpperCase()}</span>
          </span>
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Login Time:</span>
          <span className="text-sm font-medium text-gray-900">{formatTime(record.login_time)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Logout Time:</span>
          <span className="text-sm font-medium text-gray-900">{formatTime(record.logout_time)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Working Hours:</span>
          <span className="text-sm font-medium text-gray-900">
            {calculateWorkingHours(record.login_time, record.logout_time)}
          </span>
        </div>
        {record.deduct_amount && parseFloat(record.deduct_amount) > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Deduction:</span>
            <span className="text-sm font-medium text-red-600">${record.deduct_amount}</span>
          </div>
        )}
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-4 space-y-2">
          {record.checked_in_location && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Location: {record.checked_in_location.name}</span>
            </div>
          )}
          {record.login_latitude && record.login_longitude && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Coordinates: {record.login_latitude}, {record.login_longitude}
              </span>
            </div>
          )}
          {record.reason_for_deduction && (
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
              <span className="text-sm text-gray-600">Reason: {record.reason_for_deduction}</span>
            </div>
          )}
          {record.platform && (
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Platform: {record.platform}</span>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onExpand}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          {isExpanded ? (
            <>
              <Minus className="w-4 h-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              Show More
            </>
          )}
        </button>
        <div className="flex space-x-2">
          <button className="flex items-center px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Eye className="w-4 h-4 mr-1" />
            View
          </button>
          <button className="flex items-center px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

// Attendance Table Component
const AttendanceTable = ({
  data,
  getStatusColor,
  getStatusIcon,
  formatTime,
  calculateWorkingHours
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Driver
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Login Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Logout Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Working Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deduction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((record) => (
              <tr key={`${record.id}-${record.date}`} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {record.driver?.driver_name || record.driver_name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {record.driver?.id || record.driver_id || 'N/A'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                    {getStatusIcon(record.status)}
                    <span className="ml-1">{record.status?.replace('_', ' ').toUpperCase()}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatTime(record.login_time)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatTime(record.logout_time)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {calculateWorkingHours(record.login_time, record.logout_time)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.checked_in_location?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.deduct_amount && parseFloat(record.deduct_amount) > 0 ? (
                    <span className="text-red-600 font-medium">${record.deduct_amount}</span>
                  ) : (
                    <span className="text-gray-500">$0.00</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceReportEnhanced;
