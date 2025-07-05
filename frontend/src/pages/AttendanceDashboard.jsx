import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import {
  ChevronDown, CircleUserRound, AlertTriangle,
  TrendingUp, Users, Clock, FileText, Calendar, Search, Filter, Download,
  RefreshCw, BarChart3, Activity, AlertCircle, TrendingDown, UserCheck, UserX,
  Target
} from 'lucide-react';
import { toast } from 'react-toastify';

// Modern UI Components with Professional Styling
const Card = ({ children, className = '', onClick }) => (
  <div
    className={`bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-105' : ''} ${className}`}
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

        // Process daily data result
        if (results[0].status === 'fulfilled') {
          dailyDataResult = results[0].value.data.results || results[0].value.data;
          console.log('Daily Data Response (fulfilled):', dailyDataResult);
        } else {
          console.error('Failed to fetch daily data:', results[0].reason);
        }

        // Process monthly data result
        if (results[1].status === 'fulfilled') {
          monthlyDataResult = results[1].value.data.results || results[1].value.data;
          console.log('Monthly Data Response (fulfilled):', monthlyDataResult);
        } else {
          console.error('Failed to fetch monthly data:', results[1].reason);
        }

        // Process warning letters result
        if (results[2].status === 'fulfilled') {
          warningLettersResult = results[2].value.data.results || results[2].value.data;
          console.log('Warning Letters Response (fulfilled):', warningLettersResult);
        } else {
          console.error('Failed to fetch warning letters:', results[2].reason);
        }

        // Process terminations result
        if (results[3].status === 'fulfilled') {
          terminationsResult = results[3].value.data.results || results[3].value.data;
          console.log('Terminations Response (fulfilled):', terminationsResult);
        } else {
          console.error('Failed to fetch terminations:', results[3].reason);
        }

        // Process drivers result
        if (results[4].status === 'fulfilled') {
          driversResult = results[4].value.data.results || results[4].value.data;
          console.log('Drivers Response (fulfilled):', driversResult);
        } else {
          console.error('Failed to fetch drivers:', results[4].reason);
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
        const status = item.status?.toLowerCase(); // Get status, convert to lowercase for consistent comparison

        if (status === 'on-time') {
          present++;
        } else if (status === 'late') {
          present++; // Late counts as present, but also late
          late++;
        } else {
          absent++; // Any other status is considered absent
        }

        totalDeductions += Number(item.deduct_amount || 0); // Sum up deduction amounts
      });

      const totalWithStatus = present + absent; // Total records that have a status
      // Calculate on-time percentage (present minus late, divided by total records with status)
      const onTimePercent = totalWithStatus ? (((present - late) / totalWithStatus) * 100).toFixed(2) : 0;

      return {
        present,
        late,
        absent,
        on_time_percent: onTimePercent,
        total_deductions: totalDeductions,
      };
    } else { // Monthly view summary
        // For monthly, data already contains aggregated counts from the backend
        // So, we just sum up the existing monthly aggregates for a total monthly summary
        data.forEach(item => {
            present += item.present || 0;
            late += item.late || 0;
            absent += item.absent || 0;
            totalDeductions += item.total_deductions || 0; // Assuming monthly summary also provides total_deductions
        });
        const totalEntries = present + absent; // Total entries across all drivers in the monthly summary
        const onTimePercent = totalEntries ? (((present - late) / totalEntries) * 100).toFixed(2) : 0;
        return {
            present,
            late,
            absent,
            on_time_percent: onTimePercent,
            total_deductions: totalDeductions,
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

  // Handler for search input changes
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value); // Update search term state

    // Filter data based on the current viewType and search term
    if (viewType === 'daily') {
      const filtered = dailyData.filter(d =>
        d.driver_name?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(filtered);
      setSummary(calculateSummary(filtered, 'daily')); // Recalculate summary for filtered daily data
    } else {
      const filtered = monthlyData.filter(d =>
        d.driver_name?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(filtered);
      setSummary(calculateSummary(filtered, 'monthly')); // Recalculate summary for filtered monthly data
    }
  };

  // Handler for switching between daily and monthly report views
  const handleViewSwitch = (type) => {
    setViewType(type); // Update the view type
    const data = type === 'daily' ? dailyData : monthlyData; // Select appropriate raw data
    setFilteredData(data); // Set filtered data to the selected raw data
    setSummary(calculateSummary(data, type)); // Recalculate summary for the new view type
    setSearchTerm(''); // Clear search term when switching views
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
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
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
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Enhanced Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <MetricCard
              title="Total Present"
              value={summary.present || 0}
              change="+5% from yesterday"
              changeType="increase"
              icon={UserCheck}
              color="bg-green-500"
              subtitle="Active employees today"
            />
            <MetricCard
              title="Late Arrivals"
              value={summary.late || 0}
              change="-2% from yesterday"
              changeType="decrease"
              icon={Clock}
              color="bg-yellow-500"
              subtitle="Delayed check-ins"
            />
            <MetricCard
              title="Total Absent"
              value={summary.absent || 0}
              change="+1% from yesterday"
              changeType="increase"
              icon={UserX}
              color="bg-red-500"
              subtitle="Missing employees"
            />
            <MetricCard
              title="On-time Rate"
              value={`${summary.on_time_percent || 0}%`}
              change="+3% from yesterday"
              changeType="increase"
              icon={Target}
              color="bg-blue-500"
              subtitle="Punctuality score"
            />
            <MetricCard
              title="Total Deductions"
              value={`₹${Number(summary.total_deductions || 0).toFixed(0)}`}
              change="-₹500 from yesterday"
              changeType="decrease"
              icon={AlertCircle}
              color="bg-purple-500"
              subtitle="Penalty amount"
            />
            <MetricCard
              title="At Risk Drivers"
              value={atRiskDrivers.length}
              change="2 new alerts"
              changeType="warning"
              icon={AlertTriangle}
              color="bg-orange-500"
              subtitle="Require attention"
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
              </div>
            </div>
          </Card>

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
              <TableRow><TableCell colSpan={viewType === 'daily' ? 11 : 7} className="text-center p-4 text-gray-400">Loading data...</TableCell></TableRow>
            ) : filteredData.length === 0 ? (
              // No data found state row
              <TableRow><TableCell colSpan={viewType === 'daily' ? 11 : 7} className="text-center p-4 text-gray-400">No attendance data found for this view.</TableCell></TableRow>
            ) : viewType === 'daily' ? (
              // Render Daily Report rows
              filteredData.map((d, i) => (
                <TableRow key={i} className="border-b border-gray-800">
                  <TableCell>{d.driver_name}</TableCell>
                  <TableCell>{d.date}</TableCell>
                  <TableCell>{d.assigned_time}</TableCell>
                  <TableCell>{d.login_time || 'N/A'}</TableCell> {/* Use N/A or '-' for absent */}
                  <TableCell>{d.logout_time || 'N/A'}</TableCell>
                  <TableCell>
                    {d.photo_url ? (
                      <img src={d.photo_url} alt="driver" className="w-8 h-8 rounded-full object-cover"
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
                  <TableCell>{d.duration || '-'}</TableCell>
                  <TableCell>{d.platform || '-'}</TableCell>
                  <TableCell>{d.reason_for_deduction || '-'}</TableCell>
                  <TableCell>₹{Number(d.deduct_amount || 0).toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              // Render Monthly Report rows
              filteredData.map((d, i) => (
                <TableRow key={i} className="border-b border-gray-800">
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
