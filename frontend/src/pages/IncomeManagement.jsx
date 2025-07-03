// src/pages/IncomeManagement.js
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Plus,
  TrendingUp,
  DollarSign,
  Calendar,
  FileText,
  Edit,
  Trash2,
  // Eye // Not used in this component currently
} from 'lucide-react';
import api from '../services/api'; // Ensure this path is correct

const IncomeManagement = () => {
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [drivers, setDrivers] = useState([]); // State for drivers
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [summary, setSummary] = useState({
    total_income: 0,
    monthly_income: 0,
    pending_income: 0,
    recurring_income_count: 0 // Changed from recurring_income to count
  });

  const initialNewIncomeState = {
    transaction_data: {
      amount: '',
      description: '',
      category: '', // ID
      payment_method: '', // ID
      bank_account: '', // ID, optional
      company: '', // ID, optional
      driver: '', // ID, optional
      transaction_date: new Date().toISOString().split('T')[0],
      status: 'pending'
    },
    income_source: '',
    invoice_number: '',
    due_date: '',
    tax_amount: '0.00',
    is_recurring: false,
    recurring_frequency: '',
    next_due_date: ''
  };

  const [newIncome, setNewIncome] = useState(initialNewIncomeState);

  useEffect(() => {
    fetchIncomes();
    fetchFilterOptions();
    fetchSummary();
  }, []);

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/accounting/income/');
      setIncomes(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching incomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [categoriesRes, paymentMethodsRes, companiesRes, driversRes] = await Promise.all([
        api.get('/accounting/categories/?category_type=income'),
        api.get('/accounting/payment-methods/'),
        api.get('/companies/'),
        api.get('/Register/drivers/')
      ]);

      setCategories(categoriesRes.data.results || categoriesRes.data || []);
      setPaymentMethods(paymentMethodsRes.data.results || paymentMethodsRes.data || []);
      setCompanies(companiesRes.data.results || companiesRes.data || []);
      setDrivers(driversRes.data.results || driversRes.data || []);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const [totalRes, monthlyRes] = await Promise.all([
        api.get('/accounting/transactions/summary/', {
          params: {
            start_date: '2020-01-01', // A sufficiently old date to capture all
            end_date: currentDate.toISOString().split('T')[0],
            transaction_type: 'income'
          }
        }),
        api.get('/accounting/transactions/summary/', {
          params: {
            start_date: startOfMonth.toISOString().split('T')[0],
            end_date: endOfMonth.toISOString().split('T')[0],
            transaction_type: 'income'
          }
        })
      ]);

      // Calculate pending and recurring from fetched incomes client-side for mock
      const pending = incomes.filter(inc => inc.transaction.status === 'pending')
                           .reduce((sum, inc) => sum + parseFloat(inc.transaction.amount), 0);
      const recurringCount = incomes.filter(inc => inc.is_recurring).length;

      setSummary({
        total_income: totalRes.data.total_income || 0,
        monthly_income: monthlyRes.data.monthly_income || 0, // Ensure monthly_income key is used
        pending_income: pending,
        recurring_income_count: recurringCount
      });
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  // Re-fetch summary whenever incomes change
  useEffect(() => {
    fetchSummary();
  }, [incomes]);


  const handleInputChange = (section, field, value) => {
    if (section === 'transaction_data') {
      setNewIncome(prev => ({
        ...prev,
        transaction_data: {
          ...prev.transaction_data,
          [field]: value
        }
      }));
    } else {
      setNewIncome(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    const { transaction_data, income_source } = newIncome;
    if (!transaction_data.amount || !transaction_data.description || !transaction_data.category ||
        !transaction_data.payment_method || !transaction_data.transaction_date || !income_source) {
      alert('Please fill in all required fields (marked with *).');
      return;
    }

    try {
      if (selectedIncome) {
        await api.put(`/accounting/income/${selectedIncome.id}/`, newIncome);
        alert('Income updated successfully!');
      } else {
        await api.post('/accounting/income/', newIncome);
        alert('Income added successfully!');
      }

      setShowAddModal(false);
      setSelectedIncome(null);
      resetForm();
      fetchIncomes(); // Refetch all incomes to update list and summary
    } catch (error) {
      console.error('Error saving income:', error.response?.data || error.message);
      alert(`Error saving income: ${error.response?.data?.detail || error.message}`);
    }
  };

  const resetForm = () => {
    setNewIncome(initialNewIncomeState);
  };

  const handleEdit = (income) => {
    setSelectedIncome(income);
    setNewIncome({
      transaction_data: {
        amount: income.transaction.amount,
        description: income.transaction.description,
        category: income.transaction.category, // ID
        payment_method: income.transaction.payment_method, // ID
        bank_account: income.transaction.bank_account || '', // ID, handle null
        company: income.transaction.company || '', // ID, handle null
        driver: income.transaction.driver || '', // ID, handle null
        transaction_date: income.transaction.transaction_date, // Already YYYY-MM-DD
        status: income.transaction.status
      },
      income_source: income.income_source,
      invoice_number: income.invoice_number || '',
      due_date: income.due_date || '',
      tax_amount: income.tax_amount,
      is_recurring: income.is_recurring,
      recurring_frequency: income.recurring_frequency || '',
      next_due_date: income.next_due_date || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (incomeId) => {
    if (window.confirm('Are you sure you want to delete this income record?')) {
      try {
        await api.delete(`/accounting/income/${incomeId}/`);
        alert('Income deleted successfully!');
        fetchIncomes(); // Refetch incomes to update list and summary
      } catch (error) {
        console.error('Error deleting income:', error.response?.data || error.message);
        alert(`Error deleting income: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  const formatCurrency = (amount) => {
    // Ensure amount is a number for formatting
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '$0.00'; // Handle invalid numbers
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Income Management</h1>
          <p className="text-gray-600">Track and manage all income sources</p>
        </div>
        <Button
          onClick={() => {
            setShowAddModal(true);
            setSelectedIncome(null); // Clear selected income for "Add" mode
            resetForm(); // Reset form to initial state
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Income
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.total_income)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.monthly_income)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(summary.pending_income)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recurring</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {summary.recurring_income_count}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income List */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Income Records ({incomes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-700">
                  <th className="text-left p-3 font-semibold">Transaction ID</th>
                  <th className="text-left p-3 font-semibold">Date</th>
                  <th className="text-left p-3 font-semibold">Source</th>
                  <th className="text-left p-3 font-semibold">Amount</th>
                  <th className="text-left p-3 font-semibold">Net Amount</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Company</th>
                  <th className="text-left p-3 font-semibold">Driver</th> {/* Added Driver Column */}
                  <th className="text-left p-3 font-semibold">Recurring</th>
                  <th className="text-left p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomes.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center p-4 text-gray-500">No income records found.</td>
                  </tr>
                ) : (
                  incomes.map((income) => (
                    <tr key={income.id} className="border-b border-gray-100 hover:bg-gray-100">
                      <td className="p-3">
                        <div className="font-medium text-gray-800">{income.transaction.transaction_id}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {income.transaction.description}
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {new Date(income.transaction.transaction_date).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-sm capitalize text-gray-700">
                        {income.income_source.replace(/_/g, ' ')}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-green-600">
                          {formatCurrency(income.transaction.amount)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-green-700">
                          {formatCurrency(income.net_amount)}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge className={getStatusColor(income.transaction.status)}>
                          {income.transaction.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-gray-700">{income.transaction.company_name || '-'}</td>
                      <td className="p-3 text-sm text-gray-700">{income.transaction.driver_name || '-'}</td> {/* Display Driver Name */}
                      <td className="p-3">
                        {income.is_recurring ? (
                          <Badge className="bg-purple-100 text-purple-800">
                            {income.recurring_frequency}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 hover:bg-blue-50"
                            onClick={() => handleEdit(income)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(income.id)}
                            className="text-red-600 hover:bg-red-50"
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {selectedIncome ? 'Edit Income' : 'Add New Income'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Transaction Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    required
                    value={newIncome.transaction_data.amount}
                    onChange={(e) => handleInputChange('transaction_data', 'amount', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="income_source" className="block text-sm font-medium text-gray-700 mb-1">Income Source *</label>
                  <select
                    id="income_source"
                    required
                    value={newIncome.income_source}
                    onChange={(e) => handleInputChange('', 'income_source', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Source</option>
                    <option value="driver_commission">Driver Commission</option>
                    <option value="company_payment">Company Payment</option>
                    <option value="vehicle_rental">Vehicle Rental</option>
                    <option value="service_fee">Service Fee</option>
                    <option value="penalty_collection">Penalty Collection</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    id="category"
                    required
                    value={newIncome.transaction_data.category}
                    onChange={(e) => handleInputChange('transaction_data', 'category', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500"
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
                    value={newIncome.transaction_data.payment_method}
                    onChange={(e) => handleInputChange('transaction_data', 'payment_method', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500"
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
                    value={newIncome.transaction_data.transaction_date}
                    onChange={(e) => handleInputChange('transaction_data', 'transaction_date', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    id="status"
                    value={newIncome.transaction_data.status}
                    onChange={(e) => handleInputChange('transaction_data', 'status', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500"
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
                  value={newIncome.transaction_data.description}
                  onChange={(e) => handleInputChange('transaction_data', 'description', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Enter a brief description of the income..."
                />
              </div>

              {/* Additional Income Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                  <input
                    id="invoice_number"
                    type="text"
                    value={newIncome.invoice_number}
                    onChange={(e) => handleInputChange('', 'invoice_number', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional invoice number"
                  />
                </div>

                <div>
                  <label htmlFor="tax_amount" className="block text-sm font-medium text-gray-700 mb-1">Tax Amount</label>
                  <input
                    id="tax_amount"
                    type="number"
                    step="0.01"
                    value={newIncome.tax_amount}
                    onChange={(e) => handleInputChange('', 'tax_amount', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    id="due_date"
                    type="date"
                    value={newIncome.due_date}
                    onChange={(e) => handleInputChange('', 'due_date', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="bank_account" className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
                  <input
                    id="bank_account"
                    type="text" // Assuming text input for bank_account ID/name for simplicity, or make it a dropdown if you fetch bank accounts
                    value={newIncome.transaction_data.bank_account}
                    onChange={(e) => handleInputChange('transaction_data', 'bank_account', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Bank Account ID (Optional)"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <select
                    id="company"
                    value={newIncome.transaction_data.company}
                    onChange={(e) => handleInputChange('transaction_data', 'company', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Company (Optional)</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.company_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="driver" className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                  <select
                    id="driver"
                    value={newIncome.transaction_data.driver}
                    onChange={(e) => handleInputChange('transaction_data', 'driver', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Driver (Optional)</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.driver_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Recurring Options */}
              <div className="border-t border-gray-200 pt-5">
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="is_recurring"
                    checked={newIncome.is_recurring}
                    onChange={(e) => handleInputChange('', 'is_recurring', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_recurring" className="text-sm font-medium text-gray-700">
                    This is a recurring income
                  </label>
                </div>

                {newIncome.is_recurring && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="recurring_frequency" className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                      <select
                        id="recurring_frequency"
                        required={newIncome.is_recurring}
                        value={newIncome.recurring_frequency}
                        onChange={(e) => handleInputChange('', 'recurring_frequency', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500"
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
                      <label htmlFor="next_due_date" className="block text-sm font-medium text-gray-700 mb-1">Next Due Date *</label>
                      <input
                        id="next_due_date"
                        type="date"
                        required={newIncome.is_recurring}
                        value={newIncome.next_due_date}
                        onChange={(e) => handleInputChange('', 'next_due_date', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedIncome(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {selectedIncome ? 'Update Income' : 'Add Income'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeManagement;