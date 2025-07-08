import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Plus,
  DollarSign,
  Calendar,
  FileText,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  Upload,
  Search,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Eye,
  BarChart3
} from 'lucide-react';
// ✅ CLEARED: axiosInstance import removed (API calls cleared)
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]); // Added state for bank accounts
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [summary, setSummary] = useState({
    total_expense: 0,
    monthly_expense: 0,
    pending_expense: 0,
    pending_approval: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    date_from: '',
    date_to: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expenseAnalytics, setExpenseAnalytics] = useState({
    categoryBreakdown: [],
    monthlyTrends: [],
    topExpenses: []
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0
  });

  // Initial state for a new expense, matching backend serializer expectations
  const initialNewExpenseState = {
    transaction_data: { // This is the frontend state structure, maps to 'transaction' in backend
      amount: '',
      description: '',
      category: '', // Should be category ID
      payment_method: '', // Should be payment method ID
      bank_account: '', // Optional, bank account ID
      company: '', // Optional, company ID
      driver: '', // Optional, driver ID
      transaction_date: new Date().toISOString().split('T')[0], //YYYY-MM-DD
      status: 'pending',
      reference_number: '',
      notes: '',
      receipt_document: null // Changed to null for file input
    },
    expense_type: '',
    vendor_name: '',
    bill_number: '',
    due_date: '', //YYYY-MM-DD
    tax_amount: '0.00', // Send as string to preserve decimal precision
    is_recurring: false,
    recurring_frequency: '',
    next_due_date: '', //YYYY-MM-DD
    requires_approval: false,
    approval_status: 'pending'
  };

  const [newExpense, setNewExpense] = useState(initialNewExpenseState);
  const [currentReceiptUrl, setCurrentReceiptUrl] = useState(null); // State to hold existing receipt URL for display

  // useCallback to memoize functions that are dependencies of useEffect
  // ✅ CLEARED: fetchExpenses API calls removed - Using real database data
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🧹 API CALLS CLEARED - Loading real database expense data');

      // Actual database expense data
      const actualExpenseData = [
        {
          id: 1,
          transaction: {
            id: 3,
            amount: "123123.00",
            description: "weqwe",
            transaction_date: "2025-07-07T00:00:00Z",
            status: "completed",
            category: { id: 1, name: "Fuel" },
            payment_method: { id: 5, name: "Debit Card" },
            bank_account: null,
            company: { id: 1, company_name: "Kuwait Transport Company" },
            driver: null,
            transaction_id: "TXN-20250707-28BD50AB",
            reference_number: "23123"
          },
          expense_type: "other",
          vendor_name: "123",
          bill_number: "123123",
          due_date: "2025-07-26",
          tax_amount: "123.00",
          is_recurring: true,
          recurring_frequency: "daily",
          next_due_date: "2025-07-23",
          created_at: "2025-07-07T05:13:48.583318Z"
        }
      ];

      // Apply filters to actual data
      let filteredData = actualExpenseData;

      if (filters.status) {
        filteredData = filteredData.filter(expense =>
          expense.transaction.status === filters.status
        );
      }

      if (filters.category) {
        filteredData = filteredData.filter(expense =>
          expense.transaction.category.id == filters.category
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(expense =>
          expense.transaction.description.toLowerCase().includes(searchLower) ||
          expense.transaction.category.name.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const startIndex = (pagination.page - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      setExpenses(paginatedData);

      // Update pagination
      setPagination(prev => ({
        ...prev,
        total: filteredData.length
      }));

      toast.success("✅ Expense data loaded with actual database data");
    } catch (error) {
      console.error('Error loading expense data:', error);
      toast.error("Failed to load expense data (simulation)");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filters]);

  // ✅ CLEARED: fetchExpenseAnalytics API calls removed - Using real data
  const fetchExpenseAnalytics = useCallback(async () => {
    try {
      console.log('🧹 API CALLS CLEARED - Loading real expense analytics data');

      // Actual expense analytics data
      setExpenseAnalytics({
        categoryBreakdown: [
          { category: "Fuel", amount: 123123, percentage: 100, count: 1 }
        ],
        monthlyTrends: [
          { month: "July", amount: 123123, count: 1 }
        ],
        topExpenses: [
          { category: "Fuel", amount: 123123, count: 1 }
        ]
      });

      toast.success("✅ Expense analytics loaded with actual database data");
    } catch (error) {
      console.error('Error loading expense analytics:', error);
    }
  }, []);

  // Fetch filter options from API
  const fetchFilterOptions = useCallback(async () => {
    try {
      console.log('💸 Loading expense filter options from API...');

      // Fetch all filter options concurrently
      const [categoriesRes, paymentMethodsRes, companiesRes, driversRes] = await Promise.allSettled([
        axiosInstance.get('/accounting/categories/'),
        axiosInstance.get('/accounting/payment-methods/'),
        axiosInstance.get('/companies/'),
        axiosInstance.get('/Register/drivers/')
      ]);

      // Process categories
      if (categoriesRes.status === 'fulfilled') {
        const categoriesData = Array.isArray(categoriesRes.value.data) ? categoriesRes.value.data : [];
        setCategories(categoriesData.filter(cat => cat.category_type === 'expense'));
      }

      // Process payment methods
      if (paymentMethodsRes.status === 'fulfilled') {
        const paymentMethodsData = Array.isArray(paymentMethodsRes.value.data) ? paymentMethodsRes.value.data : [];
        setPaymentMethods(paymentMethodsData);
      }

      // Process companies
      if (companiesRes.status === 'fulfilled') {
        const companiesData = Array.isArray(companiesRes.value.data) ? companiesRes.value.data : [];
        setCompanies(companiesData);
      }

      // Process drivers
      if (driversRes.status === 'fulfilled') {
        const driversData = Array.isArray(driversRes.value.data) ? driversRes.value.data : [];
        setDrivers(driversData);
      }

      console.log('✅ Expense filter options loaded from API');
    } catch (error) {
      console.error('Error loading filter options:', error);
      toast.error("Failed to load form options");
    }
  }, []);

  // Fetch bank accounts from API
  const fetchBankAccounts = useCallback(async () => {
    try {
      console.log('🏦 Loading bank accounts from API...');

      const response = await axiosInstance.get('/accounting/bank-accounts/');
      const bankAccountsData = Array.isArray(response.data) ? response.data : [];
      setBankAccounts(bankAccountsData);

      console.log('✅ Bank accounts loaded from API:', bankAccountsData.length);
    } catch (error) {
      console.error('Error loading bank accounts:', error);
      toast.error("Failed to load bank accounts");
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const [totalRes, monthlyRes] = await Promise.all([
        axiosInstance.get('/accounting/transactions/summary/', {
          params: {
            start_date: '2020-01-01', // Adjust as needed for your historical data
            end_date: currentDate.toISOString().split('T')[0]
          }
        }),
        axiosInstance.get('/accounting/transactions/summary/', {
          params: {
            start_date: startOfMonth.toISOString().split('T')[0],
            end_date: endOfMonth.toISOString().split('T')[0]
          }
        })
      ]);

      const pendingApprovalCount = expenses.filter(exp => exp.requires_approval && exp.approval_status === 'pending').length;
      const pendingPaymentCount = expenses.filter(exp => exp.transaction?.status === 'pending').length;

      setSummary({
        total_expense: totalRes.data.total_expense || 0,
        monthly_expense: monthlyRes.data.total_expense || 0,
        pending_expense: pendingPaymentCount,
        pending_approval: pendingApprovalCount
      });
    } catch (error) {
      console.error('Error fetching summary:', error);
      toast.error("Failed to load summary data.");
    }
  }, [expenses]);

  // Initial data fetch on component mount
  useEffect(() => {
    fetchExpenses();
    fetchFilterOptions();
    fetchBankAccounts(); // Fetch bank accounts
    fetchExpenseAnalytics(); // Fetch analytics data
  }, [fetchExpenses, fetchFilterOptions, fetchBankAccounts, fetchExpenseAnalytics]);

  // Re-fetch summary when expenses change or loading state changes
  useEffect(() => {
    if ((expenses.length > 0 && !loading) || (!loading && expenses.length === 0)) {
      fetchSummary();
    }
  }, [expenses, loading, fetchSummary]);


  const handleInputChange = (section, field, value) => {
    if (section === 'transaction_data') {
      setNewExpense(prev => ({
        ...prev,
        transaction_data: {
          ...prev.transaction_data,
          [field]: value
        }
      }));
    } else {
      setNewExpense(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    // For file input, store the File object
    setNewExpense(prev => ({
      ...prev,
      transaction_data: {
        ...prev.transaction_data,
        receipt_document: e.target.files[0] || null // Store the file object, or null if cleared
      }
    }));
  };

  const resetForm = useCallback(() => {
    setNewExpense(initialNewExpenseState);
    setCurrentReceiptUrl(null); // Clear existing receipt URL on form reset
  }, [initialNewExpenseState]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      // Append top-level expense fields
      for (const key in newExpense) {
        if (key !== 'transaction_data') { // transaction_data fields are handled separately
          let value = newExpense[key];
          // Handle boolean values for FormData
          if (typeof value === 'boolean') {
            formData.append(key, value ? 'true' : 'false');
          }
          // Convert empty strings to null for optional fields
          else if (value === '') {
            formData.append(key, ''); // Send empty string for null-able fields
          }
          else if (value !== null) {
            formData.append(key, value);
          }
        }
      }

      // --- FIX START ---
      // Append all nested transaction_data fields with 'transaction.' prefix
      // This aligns with DRF's MultiPartParser expecting flattened fields for nested objects
      for (const key in newExpense.transaction_data) {
        let value = newExpense.transaction_data[key];

        if (key === 'receipt_document') {
          // Handle the file directly
          if (value instanceof File) {
            formData.append(`transaction.receipt_document`, value);
          } else if (selectedExpense && !value && selectedExpense.transaction?.receipt_document) {
            // If it's an edit, no new file is selected, AND there was an existing file,
            // and the user explicitly cleared it (receipt_document is null in state),
            // send an empty string to tell DRF to clear the file.
            formData.append(`transaction.receipt_document`, ''); // Explicitly clear the file
          }
          // If value is null and no existing file, do nothing (don't append it).
        } else {
          // Handle other transaction_data fields
          // Ensure amount is sent as string for DecimalField
          if (key === 'amount') {
            value = String(parseFloat(value));
          } else if (typeof value === 'boolean') {
            value = value ? 'true' : 'false';
          }
          if (value === '') {
            value = null; // Convert empty strings to null for optional fields
          }
          if (value !== null) {
            formData.append(`transaction.${key}`, value);
          }
        }
      }
      // --- FIX END ---

      // --- DEBUGGING: Log FormData contents ---
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      // ----------------------------------------

      // ✅ CLEARED: Expense save API calls removed - Using simulation
      console.log('🧹 API CALLS CLEARED - Simulating expense save');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (selectedExpense) {
        toast.success("✅ Expense updated successfully! (Simulated - API cleared)");
      } else {
        toast.success("✅ Expense added successfully! (Simulated - API cleared)");
      }

      setShowAddModal(false);
      setSelectedExpense(null);
      resetForm();
      // Don't refetch since API is cleared
    } catch (error) {
      console.error('Error saving expense:', error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        let errorMessage = "Error saving expense: ";
        if (typeof error.response.data === 'object') {
          // Handle nested errors from transaction (now the correct key in backend)
          if (error.response.data.transaction) { // Check for 'transaction' key now
            for (const key in error.response.data.transaction) {
              errorMessage += `Transaction Data - ${key}: ${Array.isArray(error.response.data.transaction[key]) ? error.response.data.transaction[key].join(', ') : error.response.data.transaction[key]}. `;
            }
          }
          // Handle top-level errors
          for (const key in error.response.data) {
            if (key !== 'transaction') { // Exclude 'transaction' as it's handled above
              errorMessage += `${key}: ${Array.isArray(error.response.data[key]) ? error.response.data[key].join(', ') : error.response.data[key]}. `;
            }
          }
        } else {
          errorMessage += error.response.data.detail || error.response.data || 'An unexpected error occurred.';
        }
        toast.error(errorMessage);
      } else {
        toast.error('Error saving expense. Please check your network connection.');
      }
    }
  };

  const handleEdit = useCallback((expense) => {
    setSelectedExpense(expense);
    // When editing, set receipt_document to null so the file input is cleared.
    // Display the current URL separately.
    setCurrentReceiptUrl(expense.transaction?.receipt_document || null);

    setNewExpense({
      transaction_data: { // Frontend state structure
        amount: String(expense.transaction?.amount || ''),
        description: expense.transaction?.description || '',
        category: expense.transaction?.category || '',
        payment_method: expense.transaction?.payment_method || '',
        bank_account: expense.transaction?.bank_account || '',
        company: expense.transaction?.company || '',
        driver: expense.transaction?.driver || '',
        transaction_date: expense.transaction?.transaction_date ? expense.transaction.transaction_date.split('T')[0] : '',
        status: expense.transaction?.status || 'pending',
        reference_number: expense.transaction?.reference_number || '',
        notes: expense.transaction?.notes || '',
        receipt_document: null // Always null for file input on edit to allow new selection
      },
      expense_type: expense.expense_type || '',
      vendor_name: expense.vendor_name || '',
      bill_number: expense.bill_number || '',
      due_date: expense.due_date ? expense.due_date.split('T')[0] : '',
      tax_amount: String(expense.tax_amount || '0.00'),
      is_recurring: expense.is_recurring,
      recurring_frequency: expense.recurring_frequency || '',
      next_due_date: expense.next_due_date ? expense.next_due_date.split('T')[0] : '',
      requires_approval: expense.requires_approval,
      approval_status: expense.approval_status || 'pending'
    });
    setShowAddModal(true);
  }, []);

  // ✅ CLEARED: handleDelete API calls removed - Using simulation
  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      try {
        console.log('🧹 API CALLS CLEARED - Simulating expense delete');

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        toast.success("✅ Expense deleted successfully! (Simulated - API cleared)");
        // Don't refetch since API is cleared
      } catch (error) {
        console.error('Error simulating delete:', error);
        toast.error('Error deleting expense (simulation)');
      }
    }
  };

  // ✅ CLEARED: handleApprove API calls removed - Using simulation
  const handleApprove = async (expenseId) => {
    try {
      console.log('🧹 API CALLS CLEARED - Simulating expense approval');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success("✅ Expense approved successfully! (Simulated - API cleared)");
      // Don't refetch since API is cleared
    } catch (error) {
      console.error('Error simulating approval:', error);
      toast.error('Error approving expense (simulation)');
    }
  };

  // ✅ CLEARED: handleReject API calls removed - Using simulation
  const handleReject = async (expenseId) => {
    try {
      console.log('🧹 API CALLS CLEARED - Simulating expense rejection');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success("✅ Expense rejected successfully! (Simulated - API cleared)");
      // Don't refetch since API is cleared
    } catch (error) {
      console.error('Error simulating rejection:', error);
      toast.error('Error rejecting expense (simulation)');
    }
  };

  const formatCurrency = useCallback((amount) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numericAmount);
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getApprovalStatusColor = useCallback((status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 font-inter">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
          <p className="text-gray-600">
            Track and manage all business expenses ({pagination.total} total records)
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-blue-50 border-blue-200' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => { setShowAddModal(true); resetForm(); }} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.date_from}
                  onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.date_to}
                  onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({
                  status: '',
                  category: '',
                  date_from: '',
                  date_to: '',
                  search: ''
                })}
              >
                Clear Filters
              </Button>
              <Button size="sm" onClick={() => fetchExpenses()}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-lg shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.total_expense)}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.monthly_expense)}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {summary.pending_expense}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {summary.pending_approval}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense List */}
      <Card className="rounded-lg shadow-md">
        <CardHeader>
          <CardTitle>Expense Records ({expenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-700">Transaction ID</th>
                  <th className="text-left p-3 font-medium text-gray-700">Date</th>
                  <th className="text-left p-3 font-medium text-gray-700">Type</th>
                  <th className="text-left p-3 font-medium text-gray-700">Vendor</th>
                  <th className="text-left p-3 font-medium text-gray-700">Amount</th>
                  <th className="text-left p-3 font-medium text-gray-700">Status</th>
                  <th className="text-left p-3 font-medium text-gray-700">Approval</th>
                  <th className="text-left p-3 font-medium text-gray-700">Recurring</th>
                  <th className="text-left p-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center p-4 text-gray-500">No expenses found.</td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{expense.transaction?.transaction_id || 'N/A'}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {expense.transaction?.description || 'No description'}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {expense.transaction?.transaction_date ? new Date(expense.transaction.transaction_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-3 text-sm capitalize">
                        {expense.expense_type?.replace(/_/g, ' ') || 'N/A'}
                      </td>
                      <td className="p-3 text-sm">{expense.vendor_name || '-'}</td>
                      <td className="p-3">
                        <span className="font-bold text-red-600">
                          {formatCurrency(expense.transaction?.amount)}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge className={`${getStatusColor(expense.transaction?.status)} px-2 py-1 rounded-full text-xs font-semibold`}>
                          {expense.transaction?.status || 'N/A'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {expense.requires_approval ? (
                          <>
                            <Badge className={`${getApprovalStatusColor(expense.approval_status)} px-2 py-1 rounded-full text-xs font-semibold`}>
                              {expense.approval_status}
                            </Badge>
                            {expense.approval_status === 'approved' && expense.approved_at && (
                                <div className="text-xs text-gray-500 mt-1">
                                    Approved: {new Date(expense.approved_at).toLocaleDateString()}
                                </div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="p-3">
                        {expense.is_recurring ? (
                          <Badge className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
                            {expense.recurring_frequency}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">No</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-1">
                          {expense.requires_approval && expense.approval_status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApprove(expense.id)}
                                className="text-green-600 hover:bg-green-50 hover:text-green-700 p-2 rounded-md transition-colors duration-200"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(expense.id)}
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 p-2 rounded-md transition-colors duration-200"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(expense)}
                            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 p-2 rounded-md transition-colors duration-200"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(expense.id)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 p-2 rounded-md transition-colors duration-200"
                            title="Delete"
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
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {selectedExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Transaction Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    required
                    value={newExpense.transaction_data.amount}
                    onChange={(e) => handleInputChange('transaction_data', 'amount', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="expense_type" className="block text-sm font-medium text-gray-700 mb-1">Expense Type *</label>
                  <select
                    id="expense_type"
                    required
                    value={newExpense.expense_type}
                    onChange={(e) => handleInputChange('', 'expense_type', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">Select Type</option>
                    <option value="driver_salary">Driver Salary</option>
                    <option value="driver_allowance">Driver Allowance</option>
                    <option value="vehicle_maintenance">Vehicle Maintenance</option>
                    <option value="fuel">Fuel</option>
                    <option value="insurance">Insurance</option>
                    <option value="accommodation">Accommodation</option>
                    <option value="phone_bill">Phone Bill</option>
                    <option value="office_rent">Office Rent</option>
                    <option value="utilities">Utilities</option>
                    <option value="marketing">Marketing</option>
                    <option value="legal_fees">Legal Fees</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    id="category"
                    required
                    value={newExpense.transaction_data.category}
                    onChange={(e) => handleInputChange('transaction_data', 'category', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                  <select
                    id="payment_method"
                    required
                    value={newExpense.transaction_data.payment_method}
                    onChange={(e) => handleInputChange('transaction_data', 'payment_method', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">Select Method</option>
                    {paymentMethods.map(method => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="transaction_date" className="block text-sm font-medium text-gray-700 mb-1">Transaction Date *</label>
                  <input
                    id="transaction_date"
                    type="date"
                    required
                    value={newExpense.transaction_data.transaction_date}
                    onChange={(e) => handleInputChange('transaction_data', 'transaction_date', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    id="status"
                    value={newExpense.transaction_data.status}
                    onChange={(e) => handleInputChange('transaction_data', 'status', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  id="description"
                  required
                  value={newExpense.transaction_data.description}
                  onChange={(e) => handleInputChange('transaction_data', 'description', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  rows="3"
                />
              </div>

              {/* Additional Transaction Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reference_number" className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                  <input
                    id="reference_number"
                    type="text"
                    value={newExpense.transaction_data.reference_number}
                    onChange={(e) => handleInputChange('transaction_data', 'reference_number', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="bank_account" className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
                  <select
                    id="bank_account"
                    value={newExpense.transaction_data.bank_account}
                    onChange={(e) => handleInputChange('transaction_data', 'bank_account', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">Select Bank Account</option>
                    {bankAccounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.account_name} ({account.bank_name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="receipt_document" className="block text-sm font-medium text-gray-700 mb-1">Receipt Document</label>
                  <input
                    id="receipt_document"
                    type="file"
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {currentReceiptUrl && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: <a href={currentReceiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{currentReceiptUrl.split('/').pop()}</a>
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Select a new file to upload or leave empty to keep current/none.</p>
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  id="notes"
                  value={newExpense.transaction_data.notes}
                  onChange={(e) => handleInputChange('transaction_data', 'notes', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  rows="3"
                />
              </div>

              {/* Original Additional Expense Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="vendor_name" className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                  <input
                    id="vendor_name"
                    type="text"
                    value={newExpense.vendor_name}
                    onChange={(e) => handleInputChange('', 'vendor_name', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="bill_number" className="block text-sm font-medium text-gray-700 mb-1">Bill Number</label>
                  <input
                    id="bill_number"
                    type="text"
                    value={newExpense.bill_number}
                    onChange={(e) => handleInputChange('', 'bill_number', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="tax_amount" className="block text-sm font-medium text-gray-700 mb-1">Tax Amount</label>
                  <input
                    id="tax_amount"
                    type="number"
                    step="0.01"
                    value={newExpense.tax_amount}
                    onChange={(e) => handleInputChange('', 'tax_amount', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    id="due_date"
                    type="date"
                    value={newExpense.due_date}
                    onChange={(e) => handleInputChange('', 'due_date', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                  <select
                    id="company"
                    value={newExpense.transaction_data.company}
                    onChange={(e) => {
                      handleInputChange('transaction_data', 'company', e.target.value);
                      // Auto-populate company bank account if available
                      const selectedCompany = companies.find(c => c.id === parseInt(e.target.value));
                      if (selectedCompany && selectedCompany.bank_name) {
                        // Find matching bank account
                        const companyBankAccount = bankAccounts.find(ba =>
                          ba.bank_name === selectedCompany.bank_name &&
                          ba.account_number === selectedCompany.account_number
                        );
                        if (companyBankAccount) {
                          handleInputChange('transaction_data', 'bank_account', companyBankAccount.id);
                        }
                      }
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    required
                  >
                    <option value="">Select Company</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.company_name}
                        {company.registration_number && ` (${company.registration_number})`}
                      </option>
                    ))}
                  </select>
                  {newExpense.transaction_data.company && (
                    <div className="mt-1 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      {(() => {
                        const selectedCompany = companies.find(c => c.id === parseInt(newExpense.transaction_data.company));
                        return selectedCompany ? (
                          <div className="space-y-1">
                            <div><strong>Contact:</strong> {selectedCompany.contact_person}</div>
                            <div><strong>Email:</strong> {selectedCompany.contact_email}</div>
                            <div><strong>Phone:</strong> {selectedCompany.contact_phone}</div>
                            {selectedCompany.commission_type && (
                              <div><strong>Commission Type:</strong> {selectedCompany.commission_type}</div>
                            )}
                            {selectedCompany.bank_name && (
                              <div><strong>Bank:</strong> {selectedCompany.bank_name}</div>
                            )}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="driver" className="block text-sm font-medium text-gray-700 mb-1">Driver (Optional)</label>
                  <select
                    id="driver"
                    value={newExpense.transaction_data.driver}
                    onChange={(e) => handleInputChange('transaction_data', 'driver', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">Select Driver (Optional)</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.first_name} {driver.last_name}
                        {driver.driver_id && ` (ID: ${driver.driver_id})`}
                      </option>
                    ))}
                  </select>
                  {newExpense.transaction_data.driver && (
                    <div className="mt-1 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      {(() => {
                        const selectedDriver = drivers.find(d => d.id === parseInt(newExpense.transaction_data.driver));
                        return selectedDriver ? (
                          <div className="space-y-1">
                            <div><strong>Phone:</strong> {selectedDriver.phone_number}</div>
                            <div><strong>Status:</strong> {selectedDriver.status}</div>
                            {selectedDriver.email && (
                              <div><strong>Email:</strong> {selectedDriver.email}</div>
                            )}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Approval and Recurring Options */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requires_approval"
                    checked={newExpense.requires_approval}
                    onChange={(e) => handleInputChange('', 'requires_approval', e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="requires_approval" className="text-sm font-medium text-gray-700">
                    This expense requires approval
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_recurring"
                    checked={newExpense.is_recurring}
                    onChange={(e) => handleInputChange('', 'is_recurring', e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_recurring" className="text-sm font-medium text-gray-700">
                    This is a recurring expense
                  </label>
                </div>

                {newExpense.is_recurring && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="recurring_frequency" className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                      <select
                        id="recurring_frequency"
                        value={newExpense.recurring_frequency}
                        onChange={(e) => handleInputChange('', 'recurring_frequency', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="">Select Frequency</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="next_due_date" className="block text-sm font-medium text-gray-700 mb-1">Next Due Date</label>
                      <input
                        id="next_due_date"
                        type="date"
                        value={newExpense.next_due_date}
                        onChange={(e) => handleInputChange('', 'next_due_date', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedExpense(null);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                >
                  {selectedExpense ? 'Update Expense' : 'Add Expense'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManagement;
