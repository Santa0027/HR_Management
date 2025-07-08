import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Clock,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  DollarSign,
  MapPin,
  RefreshCw,
  Download,
  Filter,
  Eye
} from 'lucide-react';

const AttendanceAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    dailyTrends: [],
    monthlyTrends: [],
    driverPerformance: [],
    locationStats: [],
    timePatterns: [],
    deductionAnalysis: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('attendance_rate');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
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

      let attendanceData = [];
      let monthlyData = [];
      let driversData = [];
      let locationsData = [];

      if (results[0].status === 'fulfilled') {
        attendanceData = results[0].value.data.results || results[0].value.data || [];
      }
      if (results[1].status === 'fulfilled') {
        monthlyData = results[1].value.data.results || results[1].value.data || [];
      }
      if (results[2].status === 'fulfilled') {
        driversData = results[2].value.data.results || results[2].value.data || [];
      }
      if (results[3].status === 'fulfilled') {
        locationsData = results[3].value.data.results || results[3].value.data || [];
      }

      const analytics = processAnalyticsData(attendanceData, monthlyData, driversData, locationsData);
      setAnalyticsData(analytics);
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (attendance, monthly, drivers, locations) => {
    // Daily trends analysis
    const dailyTrends = processDailyTrends(attendance);
    
    // Monthly trends analysis
    const monthlyTrends = processMonthlyTrends(monthly);
    
    // Driver performance analysis
    const driverPerformance = processDriverPerformance(attendance, drivers);
    
    // Location statistics
    const locationStats = processLocationStats(attendance, locations);
    
    // Time patterns analysis
    const timePatterns = processTimePatterns(attendance);
    
    // Deduction analysis
    const deductionAnalysis = processDeductionAnalysis(attendance);

    return {
      dailyTrends,
      monthlyTrends,
      driverPerformance,
      locationStats,
      timePatterns,
      deductionAnalysis
    };
  };

  const processDailyTrends = (attendance) => {
    const last30Days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAttendance = attendance.filter(record => record.date === dateStr);
      const present = dayAttendance.filter(record => 
        ['on_time', 'late', 'logged_in'].includes(record.status)
      ).length;
      const late = dayAttendance.filter(record => record.status === 'late').length;
      const absent = dayAttendance.filter(record => record.status === 'absent').length;
      
      last30Days.push({
        date: dateStr,
        present,
        late,
        absent,
        total: dayAttendance.length,
        attendanceRate: dayAttendance.length > 0 ? (present / dayAttendance.length * 100) : 0
      });
    }
    
    return last30Days;
  };

  const processMonthlyTrends = (monthly) => {
    const monthlyStats = {};
    
    monthly.forEach(record => {
      const key = `${record.year}-${String(record.month).padStart(2, '0')}`;
      if (!monthlyStats[key]) {
        monthlyStats[key] = {
          month: key,
          totalDrivers: 0,
          presentDays: 0,
          lateDays: 0,
          absentDays: 0,
          totalDeductions: 0,
          averageScore: 0
        };
      }
      
      monthlyStats[key].totalDrivers++;
      monthlyStats[key].presentDays += record.present_days || 0;
      monthlyStats[key].lateDays += record.late_days || 0;
      monthlyStats[key].absentDays += record.absent_days || 0;
      monthlyStats[key].totalDeductions += parseFloat(record.total_deductions_amount || 0);
      monthlyStats[key].averageScore += record.attendance_score || 0;
    });
    
    return Object.values(monthlyStats).map(stat => ({
      ...stat,
      averageScore: stat.totalDrivers > 0 ? stat.averageScore / stat.totalDrivers : 0
    }));
  };

  const processDriverPerformance = (attendance, drivers) => {
    const driverStats = {};
    
    drivers.forEach(driver => {
      driverStats[driver.id] = {
        id: driver.id,
        name: driver.driver_name,
        totalRecords: 0,
        onTime: 0,
        late: 0,
        absent: 0,
        totalDeductions: 0,
        averageWorkingHours: 0,
        attendanceScore: 0,
        riskLevel: 'low'
      };
    });
    
    attendance.forEach(record => {
      const driverId = record.driver_id || record.driver?.id;
      if (driverStats[driverId]) {
        const stats = driverStats[driverId];
        stats.totalRecords++;
        
        switch (record.status) {
          case 'on_time':
            stats.onTime++;
            break;
          case 'late':
            stats.late++;
            break;
          case 'absent':
            stats.absent++;
            break;
        }
        
        stats.totalDeductions += parseFloat(record.deduct_amount || 0);
        
        if (record.login_time && record.logout_time) {
          const loginTime = new Date(`2000-01-01T${record.login_time}`);
          const logoutTime = new Date(`2000-01-01T${record.logout_time}`);
          const hours = (logoutTime - loginTime) / (1000 * 60 * 60);
          stats.averageWorkingHours += hours;
        }
      }
    });
    
    return Object.values(driverStats).map(stats => {
      const attendanceRate = stats.totalRecords > 0 ? 
        ((stats.onTime + stats.late) / stats.totalRecords * 100) : 0;
      const punctualityRate = stats.totalRecords > 0 ? 
        (stats.onTime / stats.totalRecords * 100) : 0;
      
      stats.attendanceScore = Math.max(0, 100 - (stats.late * 2) - (stats.absent * 5));
      stats.averageWorkingHours = stats.totalRecords > 0 ? 
        stats.averageWorkingHours / stats.totalRecords : 0;
      
      // Determine risk level
      if (attendanceRate < 80 || punctualityRate < 70) {
        stats.riskLevel = 'high';
      } else if (attendanceRate < 90 || punctualityRate < 85) {
        stats.riskLevel = 'medium';
      }
      
      return {
        ...stats,
        attendanceRate,
        punctualityRate
      };
    }).filter(stats => stats.totalRecords > 0);
  };

  const processLocationStats = (attendance, locations) => {
    const locationStats = {};
    
    locations.forEach(location => {
      locationStats[location.id] = {
        id: location.id,
        name: location.name,
        totalCheckIns: 0,
        onTimeCheckIns: 0,
        lateCheckIns: 0,
        averageCheckInTime: null,
        popularityScore: 0
      };
    });
    
    attendance.forEach(record => {
      if (record.checked_in_location) {
        const locationId = record.checked_in_location.id || record.checked_in_location_id;
        if (locationStats[locationId]) {
          locationStats[locationId].totalCheckIns++;
          
          if (record.status === 'on_time') {
            locationStats[locationId].onTimeCheckIns++;
          } else if (record.status === 'late') {
            locationStats[locationId].lateCheckIns++;
          }
        }
      }
    });
    
    return Object.values(locationStats).filter(stats => stats.totalCheckIns > 0);
  };

  const processTimePatterns = (attendance) => {
    const hourlyPatterns = Array(24).fill(0).map((_, hour) => ({
      hour,
      checkIns: 0,
      onTime: 0,
      late: 0
    }));
    
    attendance.forEach(record => {
      if (record.login_time) {
        try {
          const hour = parseInt(record.login_time.split(':')[0]);
          if (hour >= 0 && hour < 24) {
            hourlyPatterns[hour].checkIns++;
            
            if (record.status === 'on_time') {
              hourlyPatterns[hour].onTime++;
            } else if (record.status === 'late') {
              hourlyPatterns[hour].late++;
            }
          }
        } catch (error) {
          console.error('Error parsing time:', record.login_time);
        }
      }
    });
    
    return hourlyPatterns;
  };

  const processDeductionAnalysis = (attendance) => {
    const deductionReasons = {};
    let totalDeductions = 0;
    
    attendance.forEach(record => {
      if (record.deduct_amount && parseFloat(record.deduct_amount) > 0) {
        const amount = parseFloat(record.deduct_amount);
        totalDeductions += amount;
        
        const reason = record.reason_for_deduction || 'Unspecified';
        if (!deductionReasons[reason]) {
          deductionReasons[reason] = {
            reason,
            count: 0,
            totalAmount: 0,
            averageAmount: 0
          };
        }
        
        deductionReasons[reason].count++;
        deductionReasons[reason].totalAmount += amount;
      }
    });
    
    return Object.values(deductionReasons).map(item => ({
      ...item,
      averageAmount: item.count > 0 ? item.totalAmount / item.count : 0,
      percentage: totalDeductions > 0 ? (item.totalAmount / totalDeductions * 100) : 0
    }));
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
            <h1 className="text-3xl font-bold text-gray-900">Attendance Analytics</h1>
            <p className="text-gray-600 mt-2">Advanced insights and trends for driver attendance</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last 12 Months</option>
            </select>
            <button
              onClick={fetchAnalyticsData}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.driverPerformance.length > 0 
                    ? Math.round(analyticsData.driverPerformance.reduce((sum, driver) => sum + driver.attendanceRate, 0) / analyticsData.driverPerformance.length)
                    : 0}%
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Punctuality Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.driverPerformance.length > 0 
                    ? Math.round(analyticsData.driverPerformance.reduce((sum, driver) => sum + driver.punctualityRate, 0) / analyticsData.driverPerformance.length)
                    : 0}%
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">At-Risk Drivers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.driverPerformance.filter(driver => driver.riskLevel === 'high').length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deductions</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${analyticsData.deductionAnalysis.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Trends Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Attendance Trends</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <BarChart3 className="w-12 h-12 mr-4" />
              <span>Chart visualization would be implemented here with a charting library like Chart.js or Recharts</span>
            </div>
          </div>

          {/* Driver Performance Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Performance Distribution</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <PieChart className="w-12 h-12 mr-4" />
              <span>Performance distribution chart would be implemented here</span>
            </div>
          </div>
        </div>

        {/* Driver Performance Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Performance Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Punctuality Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deductions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.driverPerformance.slice(0, 10).map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{Math.round(driver.attendanceRate)}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{Math.round(driver.punctualityRate)}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{Math.round(driver.attendanceScore)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        driver.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                        driver.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {driver.riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${driver.totalDeductions.toFixed(2)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceAnalytics;
