import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance'; // Assuming axiosInstance is configured correctly here

// Reusing placeholder components from HRDashboard.jsx for consistency
// If you are using Shadcn UI, uncomment their imports and remove these placeholders.
const Table = ({ children, ...props }) => <table className="w-full table-auto text-sm" {...props}>{children}</table>;
const TableBody = ({ children }) => <tbody className="text-white">{children}</tbody>;
const TableCell = ({ children, ...props }) => <td className="py-2 px-2" {...props}>{children}</td>;
const TableHead = ({ children }) => <th className="py-2 px-2">{children}</th>;
const TableHeader = ({ children }) => <thead className="text-left text-gray-400 border-b border-gray-700">{children}</thead>;
const TableRow = ({ children }) => <tr className="border-b border-gray-800">{children}</tr>;
const Button = ({ children, onClick, className = '', type = 'button' }) => <button type={type} onClick={onClick} className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm ${className}`}>{children}</button>;
const Input = ({ type = 'text', placeholder, value, onChange, className = '', id, name, step }) => <input id={id} name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} step={step} className={`w-full px-4 py-2 bg-gray-800 text-white rounded-md border border-gray-700 ${className}`} />;


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

  // useEffect hook to load data when the component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true); // Set loading to true while fetching data

        // Fetch both daily attendance and monthly summary concurrently using Promise.allSettled
        // This ensures that even if one promise rejects, the other one's result is still available.
        const results = await Promise.allSettled([
          axiosInstance.get('/attendance/'), // Endpoint for daily attendance records
          axiosInstance.get('/monthly-summary') // Endpoint for monthly attendance summary
        ]);

        let dailyDataResult = [];
        let monthlyDataResult = [];

        // Process daily data result
        if (results[0].status === 'fulfilled') {
          dailyDataResult = results[0].value.data;
          console.log('Daily Data Response (fulfilled):', dailyDataResult);
        } else {
          console.error('Failed to fetch daily data:', results[0].reason);
          // You might want to show a user-friendly error message here
        }

        // Process monthly data result
        if (results[1].status === 'fulfilled') {
          monthlyDataResult = results[1].value.data;
          console.log('Monthly Data Response (fulfilled):', monthlyDataResult);
        } else {
          console.error('Failed to fetch monthly data:', results[1].reason);
          // You might want to show a user-friendly error message here
        }

        setDailyData(dailyDataResult); // Store daily data
        setMonthlyData(monthlyDataResult); // Store monthly data

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
    <div className="bg-black text-white min-h-screen p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Attendance Report</h1>
        <p className="text-gray-400">View and manage driver attendance records.</p>
      </div>

      {/* Search Input */}
      <Input
        type="text"
        placeholder="Search by driver name"
        value={searchTerm}
        onChange={handleSearch}
        className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none"
      />

      {/* View Switch Buttons */}
      <div className="flex gap-4">
        <button
          className={`px-4 py-2 rounded-md text-sm transition-colors duration-200 ${
            viewType === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          }`}
          onClick={() => handleViewSwitch('daily')}
        >
          Daily Report
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm transition-colors duration-200 ${
            viewType === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          }`}
          onClick={() => handleViewSwitch('monthly')}
        >
          Monthly Report
        </button>
      </div>

      {/* Attendance Table */}
      <div className="overflow-auto mt-4 rounded-lg border border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              {viewType === 'daily' ? (
                // Headers for Daily Report
                <>
                  <TableHead>Driver</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Login</TableHead>
                  <TableHead>Logout</TableHead>
                  <TableHead>Photo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active Time</TableHead> {/* Renamed from 'Time' for clarity */}
                  <TableHead>Platform</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Deduct ₹</TableHead>
                </>
              ) : (
                // Headers for Monthly Report
                <>
                  <TableHead>Driver</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Late</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead>On-time %</TableHead>
                  <TableHead>Total Deductions ₹</TableHead>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
        <div className="bg-gray-800 p-4 rounded-md shadow-lg">
          <p className="text-gray-400 text-sm">Total Present</p>
          <p className="text-2xl font-bold mt-1">{summary.present_days || 0}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-md shadow-lg">
          <p className="text-gray-400 text-sm">Late Arrivals</p>
          <p className="text-2xl font-bold mt-1">{summary.late_days || 0}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-md shadow-lg">
          <p className="text-gray-400 text-sm">Total Absent</p>
          <p className="text-2xl font-bold mt-1">{summary.absent_days || 0}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-md shadow-lg">
          <p className="text-gray-400 text-sm">On-time Percentage</p>
          <p className="text-2xl font-bold mt-1">{summary.on_time_percentage || 0}%</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-md shadow-lg">
          <p className="text-gray-400 text-sm">Total Deductions</p>
          <p className="text-2xl font-bold mt-1">₹{Number(summary.total_deductions_amount || 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-4 mt-6">
        <Button className="bg-blue-600 hover:bg-blue-700">Export as PDF</Button>
        <Button className="bg-blue-600 hover:bg-blue-700">Export as CSV</Button>
      </div>
    </div>
  );
};

export default AttendanceReport;
