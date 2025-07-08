import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../api/axiosInstance';
import {
  Plus,
  DollarSign,
  Calendar,
  FileText,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Eye,
  BarChart3,
  RefreshCw,
  X
} from 'lucide-react';

const IncomeManagement = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    income_source: '',
    status: '',
    category: '',
    date_from: '',
    date_to: ''
  });

  // Dependencies
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // Summary statistics
  const [summary, setSummary] = useState({
    total_income: 0,
    monthly_income: 0,
    pending_income: 0,
    overdue_income: 0
  });

  // Form state for new/edit income
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    payment_method: '',
    bank_account: '',
    company: '',
    driver: '',
    transaction_date: new Date().toISOString().split('T')[0],
    income_source: '',
    invoice_number: '',
    due_date: '',
    tax_amount: '0.00',
    is_recurring: false,
    recurring_frequency: '',
    status: 'completed'
  });

  // Fetch incomes from API
  const fetchIncomes = useCallback(async () => {
    try {
      setLoading(true);
      console.log('💰 Loading income data from API...');

      const response = await axiosInstance.get('/accounting/income/');
      const incomesData = Array.isArray(response.data.results) ? response.data.results : 
                         Array.isArray(response.data) ? response.data : [];
      
      setIncomes(incomesData);
      console.log('✅ Income data loaded from API:', incomesData.length);
    } catch (error) {
      console.error('Error fetching incomes:', error);
      toast.error('Failed to load income data');
      setIncomes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dependencies from API
  const fetchDependencies = useCallback(async () => {
    try {
      console.log('💰 Loading income form dependencies from API...');

      // Fetch all dependencies concurrently
      const [categoriesRes, paymentMethodsRes, bankAccountsRes, companiesRes, driversRes] = await Promise.allSettled([
        axiosInstance.get('/accounting/categories/'),
        axiosInstance.get('/accounting/payment-methods/'),
        axiosInstance.get('/accounting/bank-accounts/'),
        axiosInstance.get('/companies/'),
        axiosInstance.get('/Register/drivers/')
      ]);

      // Process categories
      if (categoriesRes.status === 'fulfilled') {
        const categoriesData = Array.isArray(categoriesRes.value.data.results) ? categoriesRes.value.data.results : 
                              Array.isArray(categoriesRes.value.data) ? categoriesRes.value.data : [];
        setCategories(categoriesData.filter(cat => cat.category_type === 'income'));
      }

      // Process payment methods
      if (paymentMethodsRes.status === 'fulfilled') {
        const paymentMethodsData = Array.isArray(paymentMethodsRes.value.data.results) ? paymentMethodsRes.value.data.results : 
                                  Array.isArray(paymentMethodsRes.value.data) ? paymentMethodsRes.value.data : [];
        setPaymentMethods(paymentMethodsData);
      }

      // Process bank accounts
      if (bankAccountsRes.status === 'fulfilled') {
        const bankAccountsData = Array.isArray(bankAccountsRes.value.data.results) ? bankAccountsRes.value.data.results : 
                                Array.isArray(bankAccountsRes.value.data) ? bankAccountsRes.value.data : [];
        setBankAccounts(bankAccountsData);
      }

      // Process companies
      if (companiesRes.status === 'fulfilled') {
        const companiesData = Array.isArray(companiesRes.value.data.results) ? companiesRes.value.data.results : 
                             Array.isArray(companiesRes.value.data) ? companiesRes.value.data : [];
        setCompanies(companiesData);
      }

      // Process drivers
      if (driversRes.status === 'fulfilled') {
        const driversData = Array.isArray(driversRes.value.data.results) ? driversRes.value.data.results : 
                           Array.isArray(driversRes.value.data) ? driversRes.value.data : [];
        setDrivers(driversData);
      }

      console.log('✅ Income dependencies loaded from API');
    } catch (error) {
      console.error('Error loading dependencies:', error);
      toast.error('Failed to load form dependencies');
    }
  }, []);

  // Fetch summary statistics
  const fetchSummary = useCallback(async () => {
    try {
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const [totalRes, monthlyRes] = await Promise.all([
        axiosInstance.get('/accounting/transactions/summary/', {
          params: {
            start_date: '2020-01-01',
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

      setSummary({
        total_income: parseFloat(totalRes.data.total_income || 0),
        monthly_income: parseFloat(monthlyRes.data.total_income || 0),
        pending_income: 0, // Calculate from incomes data
        overdue_income: 0  // Calculate from incomes data
      });
    } catch (error) {
      console.error('Error fetching summary:', error);
      setSummary({
        total_income: 0,
        monthly_income: 0,
        pending_income: 0,
        overdue_income: 0
      });
    }
  }, []);

  useEffect(() => {
    fetchIncomes();
    fetchDependencies();
    fetchSummary();
  }, [fetchIncomes, fetchDependencies, fetchSummary]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save income
  const handleSaveIncome = async () => {
    try {
      setLoading(true);
      
      const incomeData = {
        transaction: {
          amount: parseFloat(formData.amount),
          description: formData.description,
          category: formData.category,
          payment_method: formData.payment_method,
          bank_account: formData.bank_account || null,
          company: formData.company || null,
          driver: formData.driver || null,
          transaction_date: formData.transaction_date,
          status: formData.status
        },
        income_source: formData.income_source,
        invoice_number: formData.invoice_number,
        due_date: formData.due_date || null,
        tax_amount: parseFloat(formData.tax_amount || 0),
        is_recurring: formData.is_recurring,
        recurring_frequency: formData.recurring_frequency || null
      };

      if (selectedIncome) {
        await axiosInstance.put(`/accounting/income/${selectedIncome.id}/`, incomeData);
        toast.success('✅ Income updated successfully!');
        setShowEditModal(false);
      } else {
        await axiosInstance.post('/accounting/income/', incomeData);
        toast.success('✅ Income added successfully!');
        setShowAddModal(false);
      }

      // Reset form and refresh data
      setFormData({
        amount: '',
        description: '',
        category: '',
        payment_method: '',
        bank_account: '',
        company: '',
        driver: '',
        transaction_date: new Date().toISOString().split('T')[0],
        income_source: '',
        invoice_number: '',
        due_date: '',
        tax_amount: '0.00',
        is_recurring: false,
        recurring_frequency: '',
        status: 'completed'
      });
      setSelectedIncome(null);
      fetchIncomes();
      fetchSummary();
    } catch (error) {
      console.error('Error saving income:', error);
      toast.error('Failed to save income');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete income
  const handleDeleteIncome = async (incomeId) => {
    if (window.confirm('Are you sure you want to delete this income record?')) {
      try {
        await axiosInstance.delete(`/accounting/income/${incomeId}/`);
        toast.success('✅ Income deleted successfully!');
        fetchIncomes();
        fetchSummary();
      } catch (error) {
        console.error('Error deleting income:', error);
        toast.error('Failed to delete income');
      }
    }
  };

  // Handle edit income
  const handleEditIncome = (income) => {
    setSelectedIncome(income);
    setFormData({
      amount: income.transaction?.amount || '',
      description: income.transaction?.description || '',
      category: income.transaction?.category?.id || '',
      payment_method: income.transaction?.payment_method?.id || '',
      bank_account: income.transaction?.bank_account?.id || '',
      company: income.transaction?.company?.id || '',
      driver: income.transaction?.driver?.id || '',
      transaction_date: income.transaction?.transaction_date || '',
      income_source: income.income_source || '',
      invoice_number: income.invoice_number || '',
      due_date: income.due_date || '',
      tax_amount: income.tax_amount || '0.00',
      is_recurring: income.is_recurring || false,
      recurring_frequency: income.recurring_frequency || '',
      status: income.transaction?.status || 'completed'
    });
    setShowEditModal(true);
  };

  // Format currency
  const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numericAmount);
  };

  // Filter incomes based on search and filters
  const filteredIncomes = incomes.filter(income => {
    const matchesSearch = !searchQuery || 
      income.transaction?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      income.income_source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      income.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSource = !filters.income_source || income.income_source === filters.income_source;
    const matchesStatus = !filters.status || income.transaction?.status === filters.status;
    const matchesCategory = !filters.category || income.transaction?.category?.id == filters.category;

    return matchesSearch && matchesSource && matchesStatus && matchesCategory;
  });

  if (loading && incomes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading income data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Income Management</h1>
          <p className="text-gray-600 mt-1">Manage and track all income sources</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Income
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_income)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.monthly_income)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.pending_income)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.overdue_income)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search incomes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={filters.income_source}
              onChange={(e) => setFilters(prev => ({ ...prev, income_source: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Sources</option>
              <option value="driver_commission">Driver Commission</option>
              <option value="company_payment">Company Payment</option>
              <option value="vehicle_rental">Vehicle Rental</option>
              <option value="service_fee">Service Fee</option>
              <option value="penalty_collection">Penalty Collection</option>
              <option value="other">Other</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <Button 
              onClick={() => setFilters({ income_source: '', status: '', category: '', date_from: '', date_to: '' })}
              variant="outline"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Income List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Income Records ({filteredIncomes.length})
            </div>
            <Button
              onClick={fetchIncomes}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredIncomes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No income records found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first income record.</p>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Income
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
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
                  {filteredIncomes.map((income) => (
                    <tr key={income.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {income.transaction?.description || 'N/A'}
                        </div>
                        {income.invoice_number && (
                          <div className="text-sm text-gray-500">
                            Invoice: {income.invoice_number}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(income.transaction?.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {income.income_source || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {income.transaction?.transaction_date || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          className={
                            income.transaction?.status === 'completed' ? 'bg-green-100 text-green-800' :
                            income.transaction?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {income.transaction?.status || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleEditIncome(income)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteIncome(income.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
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
          )}
        </CardContent>
      </Card>

      {/* Add Income Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Add New Income</h2>
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Date *
                  </label>
                  <input
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => handleInputChange('transaction_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter income description"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Income Source *
                  </label>
                  <select
                    value={formData.income_source}
                    onChange={(e) => handleInputChange('income_source', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select source</option>
                    <option value="driver_commission">Driver Commission</option>
                    <option value="company_payment">Company Payment</option>
                    <option value="vehicle_rental">Vehicle Rental</option>
                    <option value="service_fee">Service Fee</option>
                    <option value="penalty_collection">Penalty Collection</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => handleInputChange('payment_method', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select payment method</option>
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Account
                  </label>
                  <select
                    value={formData.bank_account}
                    onChange={(e) => handleInputChange('bank_account', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select bank account</option>
                    {bankAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.account_name} - {account.account_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <select
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select driver</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.first_name} {driver.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={formData.invoice_number}
                    onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="INV-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleInputChange('due_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tax_amount}
                    onChange={(e) => handleInputChange('tax_amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_recurring}
                      onChange={(e) => handleInputChange('is_recurring', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Recurring Income</span>
                  </label>
                </div>

                {formData.is_recurring && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recurring Frequency
                    </label>
                    <select
                      value={formData.recurring_frequency}
                      onChange={(e) => handleInputChange('recurring_frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select frequency</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <Button
                onClick={() => setShowAddModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveIncome}
                disabled={loading || !formData.amount || !formData.description || !formData.income_source}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Income
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Income Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Edit Income</h2>
                <Button
                  onClick={() => setShowEditModal(false)}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Date *
                  </label>
                  <input
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => handleInputChange('transaction_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter income description"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Income Source *
                  </label>
                  <select
                    value={formData.income_source}
                    onChange={(e) => handleInputChange('income_source', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select source</option>
                    <option value="driver_commission">Driver Commission</option>
                    <option value="company_payment">Company Payment</option>
                    <option value="vehicle_rental">Vehicle Rental</option>
                    <option value="service_fee">Service Fee</option>
                    <option value="penalty_collection">Penalty Collection</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <Button
                onClick={() => setShowEditModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveIncome}
                disabled={loading || !formData.amount || !formData.description || !formData.income_source}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Income
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeManagement;
