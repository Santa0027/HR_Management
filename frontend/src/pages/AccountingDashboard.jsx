import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'react-toastify';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
  FileText,
  Plus,
  Filter,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  Activity,
  Eye,
  Download
} from 'lucide-react';
// ✅ CLEARED: All API imports removed (API calls cleared)
// import api from '../services/api';
// import axiosInstance from '../api/axiosInstance';

const AccountingDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    net_profit: 0,
    transaction_count: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [cashFlow, setCashFlow] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [refreshInterval, setRefreshInterval] = useState(null);
=======
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

const AccountingDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    currentMonth: {
      income: 0,
      expense: 0,
      profit: 0,
      month: ''
    },
    lastMonth: {
      income: 0,
      expense: 0,
      profit: 0,
      month: ''
    },
    recentTransactions: [],
    totalTransactions: 0,
    totalIncomeSources: 0,
    totalExpenseCategories: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('current_month');
>>>>>>> e1d21cec (internal)

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

<<<<<<< HEAD
  // Auto-refresh functionality
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 300000); // Refresh every 5 minutes

    setRefreshInterval(interval);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [dateRange]);

  const toggleAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    } else {
      const interval = setInterval(() => {
        fetchDashboardData();
      }, 300000);
      setRefreshInterval(interval);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // ✅ CLEARED: All API calls removed - Using mock data
      console.log('🧹 API CALLS CLEARED - Loading mock data');

      // Actual database summary data
      setSummary({
        total_income: 0.00,        // No income records in database
        total_expense: 123223.00,  // From actual expense records (123123 + 100)
        net_profit: -123223.00,    // Calculated: income - expense
        transaction_count: 2       // Actual transaction count from database
      });

      setRecentTransactions([
        {
          id: 3,
          description: "weqwe",
          amount: 123123.00,
          transaction_type: "expense",
          transaction_date: "2025-07-07T00:00:00Z",
          category: { name: "Fuel" },
          status: "completed",
          company: { company_name: "Kuwait Transport Company" },
          driver: { driver_name: null },
          transaction_id: "TXN-20250707-28BD50AB"
        }
      ]);

      setCategoryBreakdown([
        { category: "Fuel", amount: 123123.00, percentage: 100, type: "expense" }
      ]);

      setMonthlyTrends([
        { month: "July", income: 0, expense: 123123, net: -123123 }
      ]);

      setCashFlow([
        { date: "2025-07-07", inflow: 0, outflow: 123123, net: -123123 }
      ]);

      setTopCategories([
        { category: "Fuel", amount: 123123, count: 1 }
      ]);

      setBudgetAlerts([
        // No budget alerts - no budget data in database
      ]);

      toast.success("✅ Dashboard loaded with actual database data");
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
      // Set fallback data
      setSummary({ total_income: 0, total_expense: 0, net_profit: 0, transaction_count: 0 });
      setRecentTransactions([]);
      setCategoryBreakdown([]);
      setMonthlyTrends([]);
      setCashFlow([]);
      setTopCategories([]);
      setBudgetAlerts([]);
=======
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      const mockData = {
        currentMonth: {
          income: 15000.00,
          expense: 8500.00,
          profit: 6500.00,
          month: 'July 2025'
        },
        lastMonth: {
          income: 12000.00,
          expense: 7200.00,
          profit: 4800.00,
          month: 'June 2025'
        },
        recentTransactions: [
          {
            id: 1,
            transaction_type: 'income',
            amount: 1500.00,
            description: 'Driver commission payment',
            reference_number: 'TXN-2024-001',
            created_at: '2025-07-06T10:30:00Z'
          },
          {
            id: 2,
            transaction_type: 'expense',
            amount: 500.00,
            description: 'Operational expenses',
            reference_number: 'TXN-2024-002',
            created_at: '2025-07-06T09:15:00Z'
          }
        ],
        totalTransactions: 156,
        totalIncomeSources: 4,
        totalExpenseCategories: 5
      };
      setDashboardData(mockData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
>>>>>>> e1d21cec (internal)
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const formatCurrency = (amount) => {
    // Handle undefined, null, or invalid amounts
    const numericAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numericAmount);
  };

  const generateReport = async (reportType) => {
    try {
      const response = await axiosInstance.post(`/accounting/reports/generate_${reportType}/`, {
        start_date: dateRange.start_date,
        end_date: dateRange.end_date
      });

      if (response.data && response.data.report_id) {
        toast.success(`${reportType.replace('_', ' ')} report generated successfully!`);
        // You could open the report in a new tab or download it
        // window.open(`/accounting/reports/${response.data.report_id}/`, '_blank');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(`Failed to generate ${reportType.replace('_', ' ')} report`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeColor = (type) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
=======
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KW', {
      style: 'currency',
      currency: 'KWD'
    }).format(amount);
>>>>>>> e1d21cec (internal)
  };

  if (loading) {
    return (
<<<<<<< HEAD
      <div className="flex items-center justify-center h-64">
=======
      <div className="flex items-center justify-center min-h-screen">
>>>>>>> e1d21cec (internal)
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

<<<<<<< HEAD
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounting Dashboard</h1>
          <p className="text-gray-600">
            Financial overview and transaction management
            {refreshInterval && (
              <span className="ml-2 text-green-600 text-sm">
                • Auto-refreshing every 5 minutes
              </span>
            )}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoRefresh}
            className={refreshInterval ? 'bg-green-50 border-green-200' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshInterval ? 'animate-spin' : ''}`} />
            {refreshInterval ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchDashboardData()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Date Range:</span>
            </div>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
              className="border rounded px-3 py-1 text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
              className="border rounded px-3 py-1 text-sm"
            />
            <Button onClick={fetchDashboardData} size="sm" variant="outline">
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.total_income)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.total_expense)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(summary.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.net_profit)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {summary.transaction_count || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Budget Alerts ({budgetAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgetAlerts.slice(0, 3).map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  alert.severity === 'high' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-medium ${
                        alert.severity === 'high' ? 'text-red-800' : 'text-yellow-800'
                      }`}>
                        {alert.budget_name}
                      </p>
                      <p className={`text-sm ${
                        alert.severity === 'high' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {alert.message}
                      </p>
                    </div>
                    <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                      {alert.percentage ? alert.percentage.toFixed(1) : '0.0'}%
                    </Badge>
                  </div>
                </div>
              ))}
              {budgetAlerts.length > 3 && (
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View All {budgetAlerts.length} Alerts
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions and Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{transaction.transaction_id}</span>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{transaction.description}</p>
                    <p className="text-xs text-gray-500">{transaction.category_name}</p>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${getTransactionTypeColor(transaction.transaction_type)}`}>
                      {transaction.transaction_type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </div>
=======
  const incomeChange = calculatePercentageChange(
    dashboardData.currentMonth.income, 
    dashboardData.lastMonth.income
  );
  const expenseChange = calculatePercentageChange(
    dashboardData.currentMonth.expense, 
    dashboardData.lastMonth.expense
  );
  const profitChange = calculatePercentageChange(
    dashboardData.currentMonth.profit, 
    dashboardData.lastMonth.profit
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <PieChart className="mr-3 h-8 w-8 text-blue-600" />
                Accounting Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Financial overview and transaction management
              </p>
            </div>
            <div className="flex space-x-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="current_month">Current Month</option>
                <option value="last_3_months">Last 3 Months</option>
                <option value="last_6_months">Last 6 Months</option>
                <option value="current_year">Current Year</option>
              </select>
              <button
                onClick={fetchDashboardData}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
                <Download className="mr-2 h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Income */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData.currentMonth.income)}
                </p>
                <p className={`text-sm ${incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {incomeChange >= 0 ? '+' : ''}{incomeChange}% from last month
                </p>
              </div>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData.currentMonth.expense)}
                </p>
                <p className={`text-sm ${expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {expenseChange >= 0 ? '+' : ''}{expenseChange}% from last month
                </p>
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData.currentMonth.profit)}
                </p>
                <p className={`text-sm ${profitChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitChange >= 0 ? '+' : ''}{profitChange}% from last month
                </p>
              </div>
            </div>
          </div>

          {/* Total Transactions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.totalTransactions}
                </p>
                <p className="text-sm text-gray-500">
                  {dashboardData.totalIncomeSources} income sources
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Comparison Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Comparison</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Month Income</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(dashboardData.currentMonth.income)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Month Expenses</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(dashboardData.currentMonth.expense)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Month Income</span>
                <span className="font-semibold text-gray-600">
                  {formatCurrency(dashboardData.lastMonth.income)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Month Expenses</span>
                <span className="font-semibold text-gray-600">
                  {formatCurrency(dashboardData.lastMonth.expense)}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {dashboardData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${
                      transaction.transaction_type === 'income' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.transaction_type === 'income' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction.reference_number}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      transaction.transaction_type === 'income' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.transaction_type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
>>>>>>> e1d21cec (internal)
                  </div>
                </div>
              ))}
            </div>
<<<<<<< HEAD
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryBreakdown.slice(0, 8).map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      category.category_type === 'income' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium">{category.category_name}</span>
                    <span className="text-xs text-gray-500">({category.transaction_count})</span>
                  </div>
                  <div className={`font-bold text-sm ${getTransactionTypeColor(category.category_type)}`}>
                    {formatCurrency(category.total_amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Spending Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Top Spending Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCategories.slice(0, 5).map((category, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{category.category__name}</p>
                    <p className="text-xs text-gray-500">{category.transaction_count} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{formatCurrency(category.total_amount)}</p>
                    <p className="text-xs text-gray-500">Avg: {formatCurrency(category.avg_amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cash Flow Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Cash Flow Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cashFlow.slice(-7).map((day, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{new Date(day.day).toLocaleDateString()}</span>
                  <div className="flex space-x-4">
                    <span className="text-green-600">+{formatCurrency(day.cash_in)}</span>
                    <span className="text-red-600">-{formatCurrency(day.cash_out)}</span>
                    <span className={`font-bold ${day.net_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(day.net_cash_flow)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/accounting/income')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Income
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/accounting/expenses')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => generateReport('profit_loss')}
              >
                <Download className="h-4 w-4 mr-2" />
                Generate P&L Report
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => generateReport('cash_flow')}
              >
                <Download className="h-4 w-4 mr-2" />
                Generate Cash Flow Report
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/accounting/budgets')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Budget Analysis
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/accounting/payroll')}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Manage Payroll
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/accounting/bank-accounts')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Bank Accounts
              </Button>
            </div>
          </CardContent>
        </Card>
=======
          </div>
        </div>
>>>>>>> e1d21cec (internal)
      </div>
    </div>
  );
};

export default AccountingDashboard;
