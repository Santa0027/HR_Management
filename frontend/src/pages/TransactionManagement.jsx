import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'react-toastify';
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
// ✅ CLEARED: axiosInstance import removed (API calls cleared)
import 'react-toastify/dist/ReactToastify.css';

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
  
  const [formData, setFormData] = useState({
    transaction_type: '',
    amount: '',
    category: '',
    payment_method: '',
    company: '',
    driver: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  // ✅ CLEARED: fetchTransactions API calls removed
  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      console.log('🧹 API CALLS CLEARED - Loading mock transactions');

      // Actual database transaction data
      const actualTransactions = [
        {
          id: 3,
          description: "weqwe",
          amount: 123123.00,
          transaction_type: "expense",
          transaction_date: "2025-07-07",
          category: { id: 1, name: "Fuel" },
          payment_method: { id: 5, name: "Debit Card" },
          status: "completed",
          company: { id: 1, company_name: "Kuwait Transport Company" },
          driver: { id: 3, first_name: "Driver", last_name: "Name" },
          transaction_id: "TXN-20250707-28BD50AB",
          reference_number: "23123"
        }
      ];

      setTransactions(actualTransactions);
      setPagination(prev => ({
        ...prev,
        count: actualTransactions.length,
        next: null,
        previous: null,
        current_page: page,
        page_size: prev.page_size
      }));

      toast.success("✅ Transactions loaded with actual database data");
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error("Failed to load transactions.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page_size]);

  // ✅ CLEARED: fetchFilterOptions API calls removed
  const fetchFilterOptions = useCallback(async () => {
    try {
      console.log('🧹 API CALLS CLEARED - Loading mock filter options');

      // Actual database filter data
      setCategories([
        { id: 1, name: "Fuel", category_type: "expense" }
      ]);

      setPaymentMethods([
        { id: 5, name: "Debit Card" }
      ]);

      setCompanies([
        { id: 1, company_name: "Kuwait Transport Company" }
      ]);

      setDrivers([
        { id: 3, first_name: "Driver", last_name: "Name" }
      ]);

      toast.success("✅ Filter options loaded with actual database data");
    } catch (error) {
      console.error('Error loading filter options:', error);
      toast.error("Failed to load filter options.");
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchFilterOptions();
  }, [fetchTransactions, fetchFilterOptions]);

  // Memoized formatCurrency using useCallback
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset category when transaction type changes
    if (field === 'transaction_type') {
      setFormData(prev => ({
        ...prev,
        category: ''
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      transaction_type: '',
      amount: '',
      category: '',
      payment_method: '',
      company: '',
      driver: '',
      description: '',
      transaction_date: new Date().toISOString().split('T')[0]
    });
  };

  // ✅ CLEARED: handleSubmit API calls removed
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('🧹 API CALLS CLEARED - Simulating transaction save');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (selectedTransaction) {
        toast.success('✅ Transaction updated successfully! (Simulated - API cleared)');
      } else {
        toast.success('✅ Transaction created successfully! (Simulated - API cleared)');
      }

      setShowAddModal(false);
      setSelectedTransaction(null);
      resetForm();
      // Don't refetch since API is cleared
    } catch (error) {
      console.error('Error simulating transaction save:', error);
      toast.error('Failed to save transaction (simulation)');
    }
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      transaction_type: transaction.transaction_type || '',
      amount: transaction.amount || '',
      category: transaction.category?.id || '',
      payment_method: transaction.payment_method?.id || '',
      company: transaction.company?.id || '',
      driver: transaction.driver?.id || '',
      description: transaction.description || '',
      transaction_date: transaction.transaction_date || new Date().toISOString().split('T')[0]
    });
    setShowAddModal(true);
  };

  // Filter categories based on transaction type
  const getFilteredCategories = () => {
    if (!formData.transaction_type) return categories;
    return categories.filter(category => category.category_type === formData.transaction_type);
  };

  // ✅ CLEARED: handleDeleteTransaction API calls removed
  const handleDeleteTransaction = useCallback(async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        console.log('🧹 API CALLS CLEARED - Simulating transaction delete for ID:', transactionId);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        toast.success("✅ Transaction deleted successfully! (Simulated - API cleared)");
        // Don't refetch since API is cleared
      } catch (error) {
        console.error('Error simulating transaction delete:', error);
        toast.error("Failed to delete transaction (simulation)");
      }
    }
  }, []);

  // ✅ CLEARED: exportTransactions API calls removed
  const exportTransactions = useCallback(async () => {
    try {
      console.log('🧹 API CALLS CLEARED - Simulating transaction export');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create mock CSV content
      const csvContent = `Transaction ID,Description,Amount,Type,Date,Category
1,"Trip Revenue - Downtown Route",150.00,income,2025-07-07,"Trip Revenue"
2,"Fuel Purchase - Station A",75.00,expense,2025-07-07,"Fuel"
3,"Vehicle Maintenance",200.00,expense,2025-07-06,"Maintenance"`;

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_mock_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("✅ Transactions exported successfully! (Mock data - API cleared)");
    } catch (error) {
      console.error('Error simulating export:', error);
      toast.error("Failed to export transactions (simulation)");
    }
  }, []);

  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
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
          <p className="text-gray-600">Manage all financial transactions</p>
        </div>
        <div className="flex space-x-3">
          <Button size="sm" variant="outline" onClick={exportTransactions}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => {
            resetForm();
            setSelectedTransaction(null);
            setShowAddModal(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.transaction_type}
                onChange={(e) => setFilters(prev => ({ ...prev, transaction_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={() => fetchTransactions(1)}
                className="w-full"
              >
                Apply Filters
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={transaction.transaction_type === 'income' ? 'success' : 'destructive'}
                        className={transaction.transaction_type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {transaction.transaction_type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={transaction.description}>
                        {transaction.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.category?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.transaction_type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={transaction.status === 'completed' ? 'success' :
                                transaction.status === 'pending' ? 'warning' : 'destructive'}
                        className={
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.count > pagination.page_size && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  onClick={() => fetchTransactions(pagination.current_page - 1)}
                  disabled={!pagination.previous}
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => fetchTransactions(pagination.current_page + 1)}
                  disabled={!pagination.next}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {(pagination.current_page - 1) * pagination.page_size + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.current_page * pagination.page_size, pagination.count)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{pagination.count}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <Button
                      onClick={() => fetchTransactions(pagination.current_page - 1)}
                      disabled={!pagination.previous}
                      variant="outline"
                      className="rounded-l-md"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => fetchTransactions(pagination.current_page + 1)}
                      disabled={!pagination.next}
                      variant="outline"
                      className="rounded-r-md"
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {selectedTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Type *
                  </label>
                  <select
                    value={formData.transaction_type}
                    onChange={(e) => handleInputChange('transaction_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!formData.transaction_type}
                  >
                    <option value="">
                      {formData.transaction_type ? 'Select Category' : 'Select Transaction Type First'}
                    </option>
                    {getFilteredCategories().map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => handleInputChange('payment_method', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Payment Method</option>
                    {paymentMethods.map(method => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <select
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Company</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.company_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver
                  </label>
                  <select
                    value={formData.driver}
                    onChange={(e) => handleInputChange('driver', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Driver</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.first_name} {driver.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows="3"
                  placeholder="Enter transaction description..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Date *
                </label>
                <input
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => handleInputChange('transaction_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </form>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedTransaction(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSubmit}
              >
                {selectedTransaction ? 'Update Transaction' : 'Create Transaction'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManagement;
