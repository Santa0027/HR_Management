import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

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
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KW', {
      style: 'currency',
      currency: 'KWD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingDashboard;
