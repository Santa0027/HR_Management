import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2,
  Eye,
  ArrowUpDown
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify'; // Added toast import
import 'react-toastify/dist/ReactToastify.css'; // Ensure CSS is imported

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    transaction_type: '',
    status: '',
    category: '',
    company: '',
    start_date: '',
    end_date: ''
  });
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    current_page: 1,
    page_size: 20
  });

  // Memoized fetchTransactions using useCallback
  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pagination.page_size,
        ...filters,
        ordering: '-transaction_date'
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await axiosInstance.get('/accounting/transactions/', { params });

      // Handle both paginated and non-paginated responses
      const transactionData = response.data.results || response.data || [];
      setTransactions(transactionData);

      setPagination(prev => ({
        count: response.data.count || transactionData.length,
        next: response.data.next || null,
        previous: response.data.previous || null,
        current_page: page,
        page_size: prev.page_size
      }));

    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error("Failed to load transactions.");
      setTransactions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page_size]);

  // Memoized fetchFilterOptions using useCallback
  const fetchFilterOptions = useCallback(async () => {
    try {
      const [categoriesRes, paymentMethodsRes, companiesRes, driversRes] = await Promise.all([
        axiosInstance.get('/accounting/categories/'),
        axiosInstance.get('/accounting/payment-methods/'),
        axiosInstance.get('/companies/'),
        axiosInstance.get('/Register/drivers/')
      ]);

      setCategories(categoriesRes.data.results || categoriesRes.data || []);
      setPaymentMethods(paymentMethodsRes.data.results || paymentMethodsRes.data || []);
      setCompanies(companiesRes.data.results || companiesRes.data || []);
      setDrivers(driversRes.data.results || driversRes.data || []);
    } catch (error) {
      console.error('Error fetching filter options:', error);
      toast.error("Failed to load filter options."); // Replaced alert with toast
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchFilterOptions();
  }, [filters, fetchTransactions, fetchFilterOptions]); // Added fetchTransactions and fetchFilterOptions as dependencies

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      transaction_type: '',
      status: '',
      category: '',
      company: '',
      start_date: '',
      end_date: ''
    });
  };

  // Memoized formatCurrency using useCallback
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }, []);

  // Memoized getStatusColor using useCallback
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  // Memoized getTransactionTypeColor using useCallback
  const getTransactionTypeColor = useCallback((type) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  }, []);

  // Memoized handleDeleteTransaction using useCallback
  const handleDeleteTransaction = useCallback(async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axiosInstance.delete(`/accounting/transactions/${transactionId}/`);
        toast.success("Transaction deleted successfully!"); // Replaced alert with toast
        fetchTransactions(pagination.current_page);
      } catch (error) {
        console.error('Error deleting transaction:', error);
        toast.error("Error deleting transaction."); // Replaced alert with toast
      }
    }
  }, [fetchTransactions, pagination.current_page]); // Added dependencies

  // Memoized exportTransactions using useCallback
  const exportTransactions = useCallback(async () => {
    try {
      const params = { ...filters, format: 'csv' };
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await axiosInstance.get('/accounting/transactions/export/', { 
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Transactions exported successfully!"); // Added toast
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast.error("Error exporting transactions."); // Replaced alert with toast
    }
  }, [filters]); // Added dependencies

  if (loading && transactions.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Transaction Management</h1>
          <p className="text-gray-600">Manage all financial transactions ({pagination.count} total records)</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => fetchTransactions(1)}>
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline" size="sm" onClick={exportTransactions}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {pagination.count}
              </div>
              <div className="text-sm text-gray-600">Total Transactions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {transactions.filter(t => t.transaction_type === 'income').length}
              </div>
              <div className="text-sm text-gray-600">Income Records</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {transactions.filter(t => t.transaction_type === 'expense').length}
              </div>
              <div className="text-sm text-gray-600">Expense Records</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {transactions.filter(t => t.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending Approval</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={filters.transaction_type}
                onChange={(e) => handleFilterChange('transaction_type', e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.category_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <select
                value={filters.company}
                onChange={(e) => handleFilterChange('company', e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Companies</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({pagination.count})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Transaction ID</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Company</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-500">
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                          Loading transactions...
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg font-medium">No transactions found</p>
                          <p className="text-sm">Try adjusting your filters or add a new transaction</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{transaction.transaction_id}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {transaction.description}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span className={`capitalize font-medium ${getTransactionTypeColor(transaction.transaction_type)}`}>
                          {transaction.transaction_type}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-bold ${getTransactionTypeColor(transaction.transaction_type)}`}>
                          {transaction.transaction_type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="p-3 text-sm">{transaction.category_name}</td>
                      <td className="p-3">
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">{transaction.company_name || '-'}</td>
                      <td className="p-3">
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTransaction(transaction)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowAddModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.count > pagination.page_size && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Showing {((pagination.current_page - 1) * pagination.page_size) + 1} to{' '}
                {Math.min(pagination.current_page * pagination.page_size, pagination.count)} of{' '}
                {pagination.count} transactions
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.previous}
                  onClick={() => fetchTransactions(pagination.current_page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.next}
                  onClick={() => fetchTransactions(pagination.current_page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add/Edit Transaction Modal (Placeholder - you would implement this) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {selectedTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </h2>
            <p>This is a placeholder for the Add/Edit Transaction form.</p>
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedTransaction(null);
                }}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManagement;
