import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown, CircleUserRound, Users, Calendar, Clock,
  MapPin, BarChart3, Bell,
  TrendingUp, TrendingDown, AlertTriangle,
  UserCheck, FileText, Award, Target, Activity,
  ArrowRight, RefreshCw
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

// Import organized HR components
import ShiftManagement from './ShiftManagement';
import LeaveManagement from './LeaveManagement';
import LocationManagement from './LocationManagement';

// Enhanced Metric Card Component
const MetricCard = ({ title, value, change, changeType, icon: Icon, color, onClick }) => (
  <div
    className={`bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all cursor-pointer group ${onClick ? 'hover:scale-105' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change && (
          <div className={`flex items-center mt-2 text-sm ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'increase' ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            {change}
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="h-8 w-8 text-white" />
      </div>
    </div>
  </div>
);

// Quick Action Card Component
const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => (
  <div
    className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all cursor-pointer group hover:scale-105"
    onClick={onClick}
  >
    <div className="flex items-center">
      <div className={`p-3 rounded-lg ${color} group-hover:scale-110 transition-transform mr-4`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-gray-600 transition-colors" />
    </div>
  </div>
);

// Activity Item Component
const ActivityItem = ({ title, description, time, type, icon: Icon }) => (
  <div className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
    <div className={`p-2 rounded-lg mr-4 ${
      type === 'success' ? 'bg-green-100 text-green-600' :
      type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
      type === 'error' ? 'bg-red-100 text-red-600' :
      'bg-blue-100 text-blue-600'
    }`}>
      <Icon className="h-4 w-4" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
    <span className="text-xs text-gray-500">{time}</span>
  </div>
);

// Enhanced HR Dashboard Component
const HRDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      totalEmployees: 0,
      activeEmployees: 0,
      pendingLeaves: 0,
      todayAttendance: 0,
      monthlyAttendance: 0,
      overdueDocuments: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch HR dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all HR data in parallel
      const [driversRes, attendanceRes, leavesRes, warningsRes, terminationsRes, shiftTypesRes] = await Promise.all([
        axiosInstance.get("/Register/drivers/").catch(() => ({ data: [] })),
        axiosInstance.get("/hr/attendance/").catch(() => ({ data: [] })),
        axiosInstance.get("/hr/leave-requests/").catch(() => ({ data: [] })),
        axiosInstance.get("/hr/warning-letters/").catch(() => ({ data: [] })),
        axiosInstance.get("/hr/terminations/").catch(() => ({ data: [] })),
        axiosInstance.get("/hr/shift-types/").catch(() => ({ data: [] }))
      ]);

      const drivers = Array.isArray(driversRes.data) ? driversRes.data : driversRes.data?.results || [];
      const attendance = Array.isArray(attendanceRes.data) ? attendanceRes.data : attendanceRes.data?.results || [];
      const leaves = Array.isArray(leavesRes.data) ? leavesRes.data : leavesRes.data?.results || [];

      // Calculate metrics
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendance.filter(a => a.date === today).length;
      const pendingLeaves = leaves.filter(l => l.status === 'pending').length;

      const metrics = {
        totalEmployees: drivers.length,
        activeEmployees: drivers.filter(d => d.status === 'approved').length,
        pendingLeaves: pendingLeaves,
        todayAttendance: todayAttendance,
        monthlyAttendance: Math.round((todayAttendance / drivers.length) * 100) || 0,
        overdueDocuments: drivers.filter(d => {
          // Check for overdue documents (mock calculation)
          return d.iqama_expiry && new Date(d.iqama_expiry) < new Date();
        }).length
      };

      setDashboardData({ metrics });
    } catch (error) {
      console.error('Error fetching HR dashboard data:', error);
      toast.error('Failed to load HR dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Recent activities (mock data - replace with real data)
  const recentActivities = [
    {
      title: "New Leave Request",
      description: "John Doe submitted annual leave request",
      time: "2 hours ago",
      type: "info",
      icon: Calendar
    },
    {
      title: "Attendance Alert",
      description: "5 employees marked late today",
      time: "4 hours ago",
      type: "warning",
      icon: AlertTriangle
    },
    {
      title: "Shift Updated",
      description: "Night shift schedule updated for next week",
      time: "6 hours ago",
      type: "success",
      icon: Clock
    },
    {
      title: "Document Expiry",
      description: "3 employee documents expiring this month",
      time: "1 day ago",
      type: "warning",
      icon: FileText
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading HR dashboard...</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <HROverview dashboardData={dashboardData} recentActivities={recentActivities} setActiveTab={setActiveTab} />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'shifts':
        return <ShiftManagement />;
      case 'leaves':
        return <LeaveManagement />;
      case 'locations':
        return <LocationManagement />;
      default:
        return <HROverview dashboardData={dashboardData} recentActivities={recentActivities} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Enterprise Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">HR Management Dashboard</h1>
                <p className="text-gray-600 mt-1">Comprehensive human resources management system</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                className={`flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg ${refreshing ? 'opacity-50' : ''}`}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </button>
              <button className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors">
                English <ChevronDown size={16} className="ml-1" />
              </button>
              <CircleUserRound size={32} className="text-blue-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-md border-b border-gray-200">
        <div className="px-8">
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'attendance', label: 'Attendance', icon: Clock },
              { id: 'shifts', label: 'Shift Management', icon: Calendar },
              { id: 'leaves', label: 'Leave Management', icon: FileText },
              { id: 'locations', label: 'Location Management', icon: MapPin }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 border-transparent'
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-8xl mx-auto">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

// HR Overview Component
const HROverview = ({ dashboardData, recentActivities, setActiveTab }) => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <MetricCard
          title="Total Employees"
          value={dashboardData.metrics.totalEmployees.toLocaleString()}
          change="+5% from last month"
          changeType="increase"
          icon={Users}
          color="bg-blue-500"
          onClick={() => navigate('/registration-management')}
        />
        <MetricCard
          title="Active Employees"
          value={dashboardData.metrics.activeEmployees.toLocaleString()}
          change="+3% from last month"
          changeType="increase"
          icon={UserCheck}
          color="bg-green-500"
          onClick={() => navigate('/registration-management')}
        />
        <MetricCard
          title="Pending Leaves"
          value={dashboardData.metrics.pendingLeaves.toLocaleString()}
          change="-10% from last month"
          changeType="decrease"
          icon={Calendar}
          color="bg-yellow-500"
          onClick={() => setActiveTab('leaves')}
        />
        <MetricCard
          title="Today's Attendance"
          value={`${dashboardData.metrics.monthlyAttendance}%`}
          change="+2% from yesterday"
          changeType="increase"
          icon={Clock}
          color="bg-purple-500"
          onClick={() => setActiveTab('attendance')}
        />
        <MetricCard
          title="Overdue Documents"
          value={dashboardData.metrics.overdueDocuments.toLocaleString()}
          change="-5% from last month"
          changeType="decrease"
          icon={AlertTriangle}
          color="bg-red-500"
        />
        <MetricCard
          title="Performance Score"
          value="94%"
          change="+1% from last month"
          changeType="increase"
          icon={Award}
          color="bg-emerald-500"
        />
      </div>

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <QuickActionCard
          title="Manage Attendance"
          description="View and manage employee attendance"
          icon={Clock}
          color="bg-blue-500"
          onClick={() => setActiveTab('attendance')}
        />
        <QuickActionCard
          title="Shift Scheduling"
          description="Create and manage work shifts"
          icon={Calendar}
          color="bg-purple-500"
          onClick={() => setActiveTab('shifts')}
        />
        <QuickActionCard
          title="Leave Requests"
          description="Review and approve leave requests"
          icon={FileText}
          color="bg-orange-500"
          onClick={() => setActiveTab('leaves')}
        />
        <QuickActionCard
          title="Location Settings"
          description="Manage check-in locations"
          icon={MapPin}
          color="bg-green-500"
          onClick={() => setActiveTab('locations')}
        />
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  Recent HR Activities
                </h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <ActivityItem
                    key={index}
                    title={activity.title}
                    description={activity.description}
                    time={activity.time}
                    type={activity.type}
                    icon={activity.icon}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* HR Statistics */}
        <div className="lg:col-span-1">
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <Target className="h-5 w-5 mr-2 text-purple-600" />
                HR Statistics
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Employee Satisfaction</span>
                    <span className="text-gray-900 font-medium">89%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '89%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Attendance Rate</span>
                    <span className="text-gray-900 font-medium">94%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Leave Approval Rate</span>
                    <span className="text-gray-900 font-medium">96%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Document Compliance</span>
                    <span className="text-gray-900 font-medium">91%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '91%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for missing HR modules
const AttendanceManagement = () => (
  <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-8 text-center">
    <Clock className="h-16 w-16 text-blue-500 mx-auto mb-4" />
    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Attendance Management</h3>
    <p className="text-gray-600 mb-6">Track and manage employee attendance, check-ins, and work hours.</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-800">Today's Attendance</h4>
        <p className="text-2xl font-bold text-blue-600">87%</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-semibold text-green-800">On Time</h4>
        <p className="text-2xl font-bold text-green-600">92%</p>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="font-semibold text-yellow-800">Late Arrivals</h4>
        <p className="text-2xl font-bold text-yellow-600">8%</p>
      </div>
    </div>
  </div>
);



export default HRDashboard;