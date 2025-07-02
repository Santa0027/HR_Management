import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  UserPlus,
  FileText,
  DollarSign,
  Award
} from 'lucide-react';

const EnhancedHRDashboard = () => {
  const { user, canViewHR } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    employees: { total: 0, active: 0, new_this_month: 0 },
    attendance: { today_present: 0, today_total: 0, avg_monthly: 0 },
    leaves: { pending: 0, approved_this_month: 0, total_days_taken: 0 },
    performance: { reviews_pending: 0, avg_rating: 0, goals_completed: 0 },
    payroll: { processed_this_month: 0, pending_approvals: 0, total_amount: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (canViewHR()) {
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API calls - replace with actual API endpoints
      const mockData = {
        employees: { total: 45, active: 42, new_this_month: 3 },
        attendance: { today_present: 38, today_total: 42, avg_monthly: 92 },
        leaves: { pending: 5, approved_this_month: 12, total_days_taken: 156 },
        performance: { reviews_pending: 8, avg_rating: 4.2, goals_completed: 67 },
        payroll: { processed_this_month: 42, pending_approvals: 3, total_amount: 450000 }
      };
      
      setDashboardData(mockData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!canViewHR()) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          You don't have permission to access the HR Dashboard.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue", trend = null }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend > 0 ? '+' : ''}{trend}% from last month
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Enhanced HR Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}! Here's your comprehensive HR overview.</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Employees"
          value={dashboardData.employees.total}
          subtitle={`${dashboardData.employees.active} active`}
          icon={Users}
          color="blue"
          trend={5.2}
        />
        <StatCard
          title="Today's Attendance"
          value={`${Math.round((dashboardData.attendance.today_present / dashboardData.attendance.today_total) * 100)}%`}
          subtitle={`${dashboardData.attendance.today_present}/${dashboardData.attendance.today_total} present`}
          icon={Clock}
          color="green"
          trend={2.1}
        />
        <StatCard
          title="Pending Leave Requests"
          value={dashboardData.leaves.pending}
          subtitle={`${dashboardData.leaves.approved_this_month} approved this month`}
          icon={Calendar}
          color="yellow"
        />
        <StatCard
          title="Performance Reviews"
          value={dashboardData.performance.reviews_pending}
          subtitle={`Avg rating: ${dashboardData.performance.avg_rating}/5`}
          icon={Award}
          color="purple"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="New Hires"
          value={dashboardData.employees.new_this_month}
          subtitle="This month"
          icon={UserPlus}
          color="indigo"
        />
        <StatCard
          title="Monthly Attendance"
          value={`${dashboardData.attendance.avg_monthly}%`}
          subtitle="Average"
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Leave Days Taken"
          value={dashboardData.leaves.total_days_taken}
          subtitle="This year"
          icon={FileText}
          color="orange"
        />
        <StatCard
          title="Payroll Processed"
          value={`₹${(dashboardData.payroll.total_amount / 1000).toFixed(0)}K`}
          subtitle="This month"
          icon={DollarSign}
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
            Pending Actions
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded">
              <span className="text-sm">Leave requests awaiting approval</span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                {dashboardData.leaves.pending}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
              <span className="text-sm">Performance reviews pending</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                {dashboardData.performance.reviews_pending}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="text-sm">Payroll approvals needed</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {dashboardData.payroll.pending_approvals}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Manage Employees</span>
            </button>
            <button className="p-3 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <span className="text-sm font-medium text-green-900">Leave Requests</span>
            </button>
            <button className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
              <Award className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Performance</span>
            </button>
            <button className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Payroll</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedHRDashboard;
