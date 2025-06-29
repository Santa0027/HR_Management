import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import {
  ChevronDown, CircleUserRound, TrendingUp, TrendingDown,
  Users, Car, Building, AlertTriangle, CheckCircle, Clock,
  DollarSign, Activity, BarChart3, PieChart, Calendar,
  Bell, Settings, Plus, Eye, ArrowRight, MapPin, Phone,
  Mail, FileText, Download, Upload, RefreshCw, Filter,
  Search, MoreVertical, Star, Award, Target, Zap
} from 'lucide-react';
import { toast } from 'react-toastify';

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

// Enterprise Dashboard Component
export default function EnterpriseDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    drivers: [],
    vehicles: [],
    companies: [],
    metrics: {
      totalDrivers: 0,
      activeDrivers: 0,
      totalVehicles: 0,
      totalCompanies: 0,
      pendingApprovals: 0,
      monthlyRevenue: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [driversRes, vehiclesRes, companiesRes] = await Promise.all([
        axiosInstance.get("/Register/onboarded/").catch(() => ({ data: [] })),
        axiosInstance.get("/vehicles/").catch(() => ({ data: [] })),
        axiosInstance.get("/companies/").catch(() => ({ data: [] }))
      ]);

      const drivers = Array.isArray(driversRes.data) ? driversRes.data : driversRes.data?.results || [];
      const vehicles = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : vehiclesRes.data?.results || [];
      const companies = Array.isArray(companiesRes.data) ? companiesRes.data : companiesRes.data?.results || [];

      // Calculate metrics
      const metrics = {
        totalDrivers: drivers.length,
        activeDrivers: drivers.filter(d => d.status === 'approved').length,
        totalVehicles: vehicles.length,
        totalCompanies: companies.length,
        pendingApprovals: drivers.filter(d => d.status === 'pending').length +
                         vehicles.filter(v => v.approval_status === 'PENDING').length,
        monthlyRevenue: 125000 // Mock data - replace with actual calculation
      };

      setDashboardData({
        drivers,
        vehicles,
        companies,
        metrics
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError('Failed to load dashboard data. Please try again.');
      toast.error('Failed to load dashboard data');
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
      title: "New Driver Registration",
      description: "John Doe submitted registration documents",
      time: "2 hours ago",
      type: "info",
      icon: Users
    },
    {
      title: "Vehicle Approved",
      description: "Vehicle ABC-123 has been approved for service",
      time: "4 hours ago",
      type: "success",
      icon: CheckCircle
    },
    {
      title: "Payment Pending",
      description: "Invoice #1234 requires attention",
      time: "6 hours ago",
      type: "warning",
      icon: AlertTriangle
    },
    {
      title: "System Maintenance",
      description: "Scheduled maintenance completed successfully",
      time: "1 day ago",
      type: "success",
      icon: Settings
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Enterprise Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Enterprise Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business today.</p>
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

      {/* Main Dashboard Content */}
      <div className="p-8">
        <div className="max-w-8xl mx-auto">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <MetricCard
              title="Total Drivers"
              value={dashboardData.metrics.totalDrivers.toLocaleString()}
              change="+12% from last month"
              changeType="increase"
              icon={Users}
              color="bg-blue-500"
              onClick={() => navigate('/registration-management')}
            />
            <MetricCard
              title="Active Drivers"
              value={dashboardData.metrics.activeDrivers.toLocaleString()}
              change="+8% from last month"
              changeType="increase"
              icon={CheckCircle}
              color="bg-green-500"
              onClick={() => navigate('/registration-management')}
            />
            <MetricCard
              title="Total Vehicles"
              value={dashboardData.metrics.totalVehicles.toLocaleString()}
              change="+5% from last month"
              changeType="increase"
              icon={Car}
              color="bg-purple-500"
              onClick={() => navigate('/vehicle-list')}
            />
            <MetricCard
              title="Companies"
              value={dashboardData.metrics.totalCompanies.toLocaleString()}
              change="+3% from last month"
              changeType="increase"
              icon={Building}
              color="bg-orange-500"
              onClick={() => navigate('/platform-list')}
            />
            <MetricCard
              title="Pending Approvals"
              value={dashboardData.metrics.pendingApprovals.toLocaleString()}
              change="-15% from last month"
              changeType="decrease"
              icon={Clock}
              color="bg-yellow-500"
              onClick={() => navigate('/registration-management/aproval_status')}
            />
            <MetricCard
              title="Monthly Revenue"
              value={`$${dashboardData.metrics.monthlyRevenue.toLocaleString()}`}
              change="+18% from last month"
              changeType="increase"
              icon={DollarSign}
              color="bg-emerald-500"
              onClick={() => navigate('/accounting')}
            />
          </div>

          {/* Quick Actions Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <QuickActionCard
              title="Add New Driver"
              description="Register a new driver to the system"
              icon={Plus}
              color="bg-blue-500"
              onClick={() => navigate('/adddriverform')}
            />
            <QuickActionCard
              title="Vehicle Management"
              description="Manage fleet vehicles and registrations"
              icon={Car}
              color="bg-purple-500"
              onClick={() => navigate('/vehicle-list')}
            />
            <QuickActionCard
              title="Company Registration"
              description="Add new platform companies"
              icon={Building}
              color="bg-orange-500"
              onClick={() => navigate('/company-registration')}
            />
            <QuickActionCard
              title="View Reports"
              description="Access detailed analytics and reports"
              icon={BarChart3}
              color="bg-green-500"
              onClick={() => navigate('/accounting')}
            />
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Recent Activities */}
            <div className="lg:col-span-2">
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-blue-600" />
                      Recent Activities
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

            {/* System Status */}
            <div className="lg:col-span-1">
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                    System Status
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API Services</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-green-600">Operational</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-green-600">Healthy</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Payment Gateway</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                        <span className="text-sm text-yellow-600">Maintenance</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Backup System</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-green-600">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 mt-6">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-purple-600" />
                    Performance
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Driver Approval Rate</span>
                        <span className="text-gray-900 font-medium">87%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Vehicle Utilization</span>
                        <span className="text-gray-900 font-medium">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">System Uptime</span>
                        <span className="text-gray-900 font-medium">99.9%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '99.9%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
