import { useState, useEffect } from 'react';
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
import axiosInstance from '../api/axiosInstance';

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

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

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
      console.log('📊 Loading accounting dashboard data from API...');

      // Fetch dashboard data from API using correct action endpoints
      // Note: Some endpoints require authentication, handle gracefully
      const [summaryRes, transactionsRes, categoryRes, trendsRes, cashFlowRes, budgetRes] = await Promise.allSettled([
        axiosInstance.get('/accounting/transactions/summary/', { params: dateRange }),
        axiosInstance.get('/accounting/transactions/', { params: { limit: 10, ordering: '-transaction_date', ...dateRange } }),
        axiosInstance.get('/accounting/transactions/category_breakdown/', { params: dateRange }),
        axiosInstance.get('/accounting/transactions/monthly_trends/', { params: dateRange }),
        axiosInstance.get('/accounting/reports/', { params: { report_type: 'cash_flow', ...dateRange } }).catch(err => {
          console.warn('Reports endpoint requires authentication:', err.response?.status);
          return { status: 'rejected', reason: err };
        }),
        axiosInstance.get('/accounting/budgets/', { params: dateRange }).catch(err => {
          console.warn('Budgets endpoint requires authentication:', err.response?.status);
          return { status: 'rejected', reason: err };
        })
      ]);

      // Process summary data
      if (summaryRes.status === 'fulfilled') {
        setSummary(summaryRes.value.data);
      } else {
        setSummary({ total_income: 0, total_expense: 0, net_profit: 0, transaction_count: 0 });
      }

      // Process recent transactions
      if (transactionsRes.status === 'fulfilled') {
        const transactionsData = Array.isArray(transactionsRes.value.data) ? transactionsRes.value.data : [];
        setRecentTransactions(transactionsData);
      } else {
        setRecentTransactions([]);
      }

      // Process category breakdown
      if (categoryRes.status === 'fulfilled') {
        const categoryData = Array.isArray(categoryRes.value.data) ? categoryRes.value.data : [];
        setCategoryBreakdown(categoryData);
      } else {
        setCategoryBreakdown([]);
      }

      // Process monthly trends
      if (trendsRes.status === 'fulfilled') {
        const trendsData = Array.isArray(trendsRes.value.data) ? trendsRes.value.data : [];
        setMonthlyTrends(trendsData);
      } else {
        setMonthlyTrends([]);
      }

      // Process cash flow
      if (cashFlowRes.status === 'fulfilled') {
        const cashFlowData = Array.isArray(cashFlowRes.value.data) ? cashFlowRes.value.data : [];
        setCashFlow(cashFlowData);
      } else {
        setCashFlow([]);
      }

      // Process budget alerts
      if (budgetRes.status === 'fulfilled') {
        const budgetData = Array.isArray(budgetRes.value.data) ? budgetRes.value.data : [];
        setBudgetAlerts(budgetData);
      } else {
        setBudgetAlerts([]);
      }

      console.log('✅ Accounting dashboard data loaded from API');
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
    } finally {
      setLoading(false);
    }
  };

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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
                  </div>
                </div>
              ))}
            </div>
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
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/accounting/reports')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Financial Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountingDashboard;
