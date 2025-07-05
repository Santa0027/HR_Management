import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';

const AttendanceWarningSystem = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Data states
  const [attendanceData, setAttendanceData] = useState([]);
  const [warningLetters, setWarningLetters] = useState([]);
  const [terminations, setTerminations] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({});

  // Modal states
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showTerminationModal, setShowTerminationModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Form states
  const [warningForm, setWarningForm] = useState({
    driver: '',
    reason: '',
    description: '',
    issued_date: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  const [terminationForm, setTerminationForm] = useState({
    driver: '',
    termination_date: new Date().toISOString().split('T')[0],
    reason: '',
    details: '',
    processed_by: 1
  });

  // Filters
  const [filters, setFilters] = useState({
    dateRange: '30', // days
    status: '',
    driver: '',
    warningStatus: '',
    search: ''
  });

  // Warning and termination reasons
  const WARNING_REASONS = [
    { value: 'attendance_issues', label: 'Attendance Issues' },
    { value: 'late_arrival', label: 'Frequent Late Arrivals' },
    { value: 'early_departure', label: 'Early Departures' },
    { value: 'unauthorized_absence', label: 'Unauthorized Absence' },
    { value: 'performance_issues', label: 'Performance Issues' },
    { value: 'policy_violation', label: 'Policy Violation' },
    { value: 'other', label: 'Other' }
  ];

  const TERMINATION_REASONS = [
    { value: 'performance_issues', label: 'Performance Issues' },
    { value: 'attendance_violations', label: 'Repeated Attendance Violations' },
    { value: 'policy_violation', label: 'Policy Violation' },
    { value: 'voluntary_resignation', label: 'Voluntary Resignation' },
    { value: 'contract_expiration', label: 'Contract Expiration' },
    { value: 'redundancy', label: 'Redundancy' },
    { value: 'other', label: 'Other' }
  ];

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [attendanceRes, warningsRes, terminationsRes, driversRes] = await Promise.all([
        axiosInstance.get('/hr/attendance/', { params: { days: filters.dateRange } }),
        axiosInstance.get('/hr/warning-letters/'),
        axiosInstance.get('/hr/terminations/'),
        axiosInstance.get('/Register/drivers/')
      ]);

      setAttendanceData(attendanceRes.data.results || attendanceRes.data);
      setWarningLetters(warningsRes.data.results || warningsRes.data);
      setTerminations(terminationsRes.data.results || terminationsRes.data);
      setDrivers(driversRes.data.results || driversRes.data);

      // Calculate attendance statistics
      calculateAttendanceStats(attendanceRes.data.results || attendanceRes.data);

      console.log('Attendance warning system data loaded:', {
        attendance: attendanceRes.data.results?.length || attendanceRes.data.length,
        warnings: warningsRes.data.results?.length || warningsRes.data.length,
        terminations: terminationsRes.data.results?.length || terminationsRes.data.length,
        drivers: driversRes.data.results?.length || driversRes.data.length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate attendance statistics
  const calculateAttendanceStats = (attendanceData) => {
    const stats = {
      totalRecords: attendanceData.length,
      present: 0,
      late: 0,
      absent: 0,
      earlyDeparture: 0,
      totalDeductions: 0,
      driversAtRisk: new Set(),
      criticalDrivers: new Set()
    };

    const driverStats = {};

    attendanceData.forEach(record => {
      // Initialize driver stats if not exists
      if (!driverStats[record.driver_id]) {
        driverStats[record.driver_id] = {
          name: record.driver_name,
          total: 0,
          late: 0,
          absent: 0,
          earlyDeparture: 0,
          deductions: 0
        };
      }

      const driverStat = driverStats[record.driver_id];
      driverStat.total++;

      // Count status types
      switch (record.status) {
        case 'present':
          stats.present++;
          break;
        case 'late':
          stats.late++;
          driverStat.late++;
          break;
        case 'absent':
          stats.absent++;
          driverStat.absent++;
          break;
        case 'early_departure':
          stats.earlyDeparture++;
          driverStat.earlyDeparture++;
          break;
      }

      // Track deductions
      if (record.deduct_amount) {
        stats.totalDeductions += parseFloat(record.deduct_amount);
        driverStat.deductions += parseFloat(record.deduct_amount);
      }

      // Identify at-risk drivers (>20% late/absent)
      const riskPercentage = (driverStat.late + driverStat.absent) / driverStat.total;
      if (riskPercentage > 0.2) {
        stats.driversAtRisk.add(record.driver_id);
      }
      if (riskPercentage > 0.4) {
        stats.criticalDrivers.add(record.driver_id);
      }
    });

    stats.driverStats = driverStats;
    stats.driversAtRisk = stats.driversAtRisk.size;
    stats.criticalDrivers = stats.criticalDrivers.size;

    setAttendanceStats(stats);
  };

  // Create warning letter
  const handleCreateWarning = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/hr/warning-letters/', {
        ...warningForm,
        driver_id: warningForm.driver,
        issued_by_id: 1 // Replace with actual user ID
      });
      toast.success('Warning letter created successfully');
      setShowWarningModal(false);
      resetWarningForm();
      fetchData();
    } catch (error) {
      console.error('Error creating warning:', error);
      toast.error('Failed to create warning letter');
    } finally {
      setLoading(false);
    }
  };

  // Create termination
  const handleCreateTermination = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/hr/terminations/', terminationForm);
      toast.success('Termination record created successfully');
      setShowTerminationModal(false);
      resetTerminationForm();
      fetchData();
    } catch (error) {
      console.error('Error creating termination:', error);
      toast.error('Failed to create termination record');
    } finally {
      setLoading(false);
    }
  };

  // Reset forms
  const resetWarningForm = () => {
    setWarningForm({
      driver: '',
      reason: '',
      description: '',
      issued_date: new Date().toISOString().split('T')[0],
      status: 'active'
    });
  };

  const resetTerminationForm = () => {
    setTerminationForm({
      driver: '',
      termination_date: new Date().toISOString().split('T')[0],
      reason: '',
      details: '',
      processed_by: 1
    });
  };

  // Get driver name by ID
  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.driver_name : 'Unknown Driver';
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusClasses = {
      present: 'bg-green-100 text-green-800',
      late: 'bg-yellow-100 text-yellow-800',
      absent: 'bg-red-100 text-red-800',
      early_departure: 'bg-orange-100 text-orange-800',
      active: 'bg-blue-100 text-blue-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get at-risk drivers
  const getAtRiskDrivers = () => {
    if (!attendanceStats.driverStats) return [];
    
    return Object.entries(attendanceStats.driverStats)
      .filter(([driverId, stats]) => {
        const riskPercentage = (stats.late + stats.absent) / stats.total;
        return riskPercentage > 0.2;
      })
      .map(([driverId, stats]) => ({
        id: driverId,
        name: stats.name,
        riskPercentage: ((stats.late + stats.absent) / stats.total * 100).toFixed(1),
        lateCount: stats.late,
        absentCount: stats.absent,
        totalRecords: stats.total,
        deductions: stats.deductions
      }))
      .sort((a, b) => parseFloat(b.riskPercentage) - parseFloat(a.riskPercentage));
  };

  useEffect(() => {
    fetchData();
  }, [filters.dateRange]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">⚠️ Attendance Warning & Termination System</h1>
        <p className="text-gray-600">Monitor driver attendance, issue warnings, and manage terminations</p>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'attendance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📅 Attendance Records
            </button>
            <button
              onClick={() => setActiveTab('warnings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'warnings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⚠️ Warning Letters ({warningLetters.length})
            </button>
            <button
              onClick={() => setActiveTab('terminations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'terminations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🚫 Terminations ({terminations.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="text-3xl text-blue-600 mr-4">📊</div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{attendanceStats.totalRecords || 0}</div>
                      <div className="text-sm text-blue-600">Total Records</div>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="text-3xl text-green-600 mr-4">✅</div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{attendanceStats.present || 0}</div>
                      <div className="text-sm text-green-600">Present</div>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="text-3xl text-yellow-600 mr-4">⏰</div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{attendanceStats.late || 0}</div>
                      <div className="text-sm text-yellow-600">Late Arrivals</div>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="text-3xl text-red-600 mr-4">❌</div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{attendanceStats.absent || 0}</div>
                      <div className="text-sm text-red-600">Absent</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* At-Risk Drivers */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-orange-800 mb-4">⚠️ Drivers at Risk</h3>
                  <div className="space-y-3">
                    {getAtRiskDrivers().slice(0, 5).map((driver) => (
                      <div key={driver.id} className="flex justify-between items-center bg-white p-3 rounded border">
                        <div>
                          <div className="font-medium text-gray-900">{driver.name}</div>
                          <div className="text-sm text-gray-600">
                            {driver.lateCount} late, {driver.absentCount} absent of {driver.totalRecords} records
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-orange-600">{driver.riskPercentage}%</div>
                          <button
                            onClick={() => {
                              setSelectedDriver(driver);
                              setWarningForm({ ...warningForm, driver: driver.id });
                              setShowWarningModal(true);
                            }}
                            className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded"
                          >
                            Issue Warning
                          </button>
                        </div>
                      </div>
                    ))}
                    {getAtRiskDrivers().length === 0 && (
                      <div className="text-center text-gray-500 py-4">
                        No drivers at risk currently
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Actions */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Recent Actions</h3>
                  <div className="space-y-3">
                    {/* Recent Warnings */}
                    {warningLetters.slice(0, 3).map((warning) => (
                      <div key={warning.id} className="flex items-center bg-white p-3 rounded border">
                        <div className="text-2xl mr-3">⚠️</div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Warning Issued</div>
                          <div className="text-sm text-gray-600">
                            {warning.driver_name} - {warning.reason?.replace(/_/g, ' ')}
                          </div>
                          <div className="text-xs text-gray-500">{formatDate(warning.issued_date)}</div>
                        </div>
                      </div>
                    ))}
                    {/* Recent Terminations */}
                    {terminations.slice(0, 2).map((termination) => (
                      <div key={termination.id} className="flex items-center bg-white p-3 rounded border">
                        <div className="text-2xl mr-3">🚫</div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Termination</div>
                          <div className="text-sm text-gray-600">
                            {termination.driver_name} - {termination.reason?.replace(/_/g, ' ')}
                          </div>
                          <div className="text-xs text-gray-500">{formatDate(termination.termination_date)}</div>
                        </div>
                      </div>
                    ))}
                    {warningLetters.length === 0 && terminations.length === 0 && (
                      <div className="text-center text-gray-500 py-4">
                        No recent actions
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">🚀 Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowWarningModal(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-medium"
                  >
                    ⚠️ Issue Warning Letter
                  </button>
                  <button
                    onClick={() => setShowTerminationModal(true)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium"
                  >
                    🚫 Process Termination
                  </button>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium"
                  >
                    📅 View Attendance Records
                  </button>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                    className="border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Records Tab */}
          {activeTab === 'attendance' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">📅 Attendance Records</h2>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Search drivers..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">All Status</option>
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                    <option value="early_departure">Early Departure</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Driver
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Login Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Logout Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
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
                      {attendanceData
                        .filter(record => {
                          const matchesSearch = !filters.search ||
                            record.driver_name?.toLowerCase().includes(filters.search.toLowerCase());
                          const matchesStatus = !filters.status || record.status === filters.status;
                          return matchesSearch && matchesStatus;
                        })
                        .slice(0, 50)
                        .map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {record.driver_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(record.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {record.login_time || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {record.logout_time || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(record.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {record.deduct_amount ? `$${record.deduct_amount}` : 'None'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {(record.status === 'late' || record.status === 'absent') && (
                                <button
                                  onClick={() => {
                                    setWarningForm({
                                      ...warningForm,
                                      driver: record.driver_id,
                                      reason: record.status === 'late' ? 'late_arrival' : 'unauthorized_absence'
                                    });
                                    setShowWarningModal(true);
                                  }}
                                  className="text-yellow-600 hover:text-yellow-900"
                                >
                                  ⚠️ Issue Warning
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Warning Letters Tab */}
          {activeTab === 'warnings' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">⚠️ Warning Letters</h2>
                <button
                  onClick={() => setShowWarningModal(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                  disabled={loading}
                >
                  ➕ Issue Warning Letter
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {warningLetters.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="text-4xl mb-4">⚠️</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Warning Letters</h3>
                      <p className="text-gray-500">No warning letters have been issued yet</p>
                    </div>
                  ) : (
                    warningLetters.map((warning) => (
                      <div key={warning.id} className="bg-white border border-yellow-200 rounded-lg p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{warning.driver_name}</h3>
                          {getStatusBadge(warning.status)}
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div>
                            <span className="font-medium">Reason:</span>
                            <div className="text-gray-800">{warning.reason?.replace(/_/g, ' ')}</div>
                          </div>
                          <div>
                            <span className="font-medium">Issued Date:</span>
                            <div className="text-gray-800">{formatDate(warning.issued_date)}</div>
                          </div>
                          {warning.description && (
                            <div>
                              <span className="font-medium">Description:</span>
                              <div className="text-gray-800">{warning.description}</div>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded">
                            📄 View Letter
                          </button>
                          <button className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded">
                            ✏️ Edit
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Terminations Tab */}
          {activeTab === 'terminations' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">🚫 Terminations</h2>
                <button
                  onClick={() => setShowTerminationModal(true)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                  disabled={loading}
                >
                  ➕ Process Termination
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {terminations.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="text-4xl mb-4">🚫</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Terminations</h3>
                      <p className="text-gray-500">No termination records found</p>
                    </div>
                  ) : (
                    terminations.map((termination) => (
                      <div key={termination.id} className="bg-white border border-red-200 rounded-lg p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{termination.driver_name}</h3>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Terminated
                          </span>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div>
                            <span className="font-medium">Reason:</span>
                            <div className="text-gray-800">{termination.reason?.replace(/_/g, ' ')}</div>
                          </div>
                          <div>
                            <span className="font-medium">Termination Date:</span>
                            <div className="text-gray-800">{formatDate(termination.termination_date)}</div>
                          </div>
                          {termination.details && (
                            <div>
                              <span className="font-medium">Details:</span>
                              <div className="text-gray-800">{termination.details}</div>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded">
                            📄 View Letter
                          </button>
                          <button className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded">
                            📋 View Details
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Warning Letter Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">⚠️ Issue Warning Letter</h3>
              <form onSubmit={handleCreateWarning}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Driver *
                  </label>
                  <select
                    value={warningForm.driver}
                    onChange={(e) => setWarningForm({ ...warningForm, driver: e.target.value })}
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
                    {WARNING_REASONS.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
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
                      resetWarningForm();
                    }}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Issue Warning'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Termination Modal */}
      {showTerminationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">🚫 Process Termination</h3>
              <form onSubmit={handleCreateTermination}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Driver *
                  </label>
                  <select
                    value={terminationForm.driver}
                    onChange={(e) => setTerminationForm({ ...terminationForm, driver: e.target.value })}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Select Driver</option>
                    {drivers.filter(driver => !terminations.find(t => t.driver_id === driver.id)).map((driver) => (
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
                    value={terminationForm.reason}
                    onChange={(e) => setTerminationForm({ ...terminationForm, reason: e.target.value })}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Select Reason</option>
                    {TERMINATION_REASONS.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Details
                  </label>
                  <textarea
                    value={terminationForm.details}
                    onChange={(e) => setTerminationForm({ ...terminationForm, details: e.target.value })}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows="3"
                    placeholder="Additional details about the termination..."
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Termination Date *
                  </label>
                  <input
                    type="date"
                    value={terminationForm.termination_date}
                    onChange={(e) => setTerminationForm({ ...terminationForm, termination_date: e.target.value })}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTerminationModal(false);
                      resetTerminationForm();
                    }}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Process Termination'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceWarningSystem;
