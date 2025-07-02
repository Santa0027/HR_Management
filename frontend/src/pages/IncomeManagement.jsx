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
  Eye
} from 'lucide-react';
import api from '../services/api';

const IncomeManagement = () => {
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [summary, setSummary] = useState({
    total_income: 0,
    monthly_income: 0,
    pending_income: 0,
    recurring_income: 0
  });

  const [newIncome, setNewIncome] = useState({
    transaction_data: {
      amount: '',
      description: '',
      category: '',
      payment_method: '',
      bank_account: '',
      company: '',
      driver: '',
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
  });

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
            start_date: '2020-01-01',
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

      setSummary({
        total_income: totalRes.data.total_income || 0,
        monthly_income: monthlyRes.data.total_income || 0,
        pending_income: 0, // Calculate from pending transactions
        recurring_income: 0 // Calculate from recurring incomes
      });
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

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
    try {
      if (selectedIncome) {
        await api.put(`/accounting/income/${selectedIncome.id}/`, newIncome);
      } else {
        await api.post('/accounting/income/', newIncome);
      }
      
      setShowAddModal(false);
      setSelectedIncome(null);
      resetForm();
      fetchIncomes();
      fetchSummary();
    } catch (error) {
      console.error('Error saving income:', error);
      alert('Error saving income. Please check all fields.');
    }
  };

  const resetForm = () => {
    setNewIncome({
      transaction_data: {
        amount: '',
        description: '',
        category: '',
        payment_method: '',
        bank_account: '',
        company: '',
        driver: '',
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
    });
  };

  const handleEdit = (income) => {
    setSelectedIncome(income);
    setNewIncome({
      transaction_data: {
        amount: income.transaction.amount,
        description: income.transaction.description,
        category: income.transaction.category,
        payment_method: income.transaction.payment_method,
        bank_account: income.transaction.bank_account || '',
        company: income.transaction.company || '',
        driver: income.transaction.driver || '',
        transaction_date: income.transaction.transaction_date.split('T')[0],
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
        fetchIncomes();
        fetchSummary();
      } catch (error) {
        console.error('Error deleting income:', error);
        alert('Error deleting income');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Income Management</h1>
          <p className="text-gray-600">Track and manage all income sources</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Income
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
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

        <Card>
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

        <Card>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recurring</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {incomes.filter(income => income.is_recurring).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income List */}
      <Card>
        <CardHeader>
          <CardTitle>Income Records ({incomes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Transaction ID</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Source</th>
                  <th className="text-left p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Net Amount</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Company</th>
                  <th className="text-left p-3 font-medium">Recurring</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((income) => (
                  <tr key={income.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{income.transaction.transaction_id}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {income.transaction.description}
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      {new Date(income.transaction.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-sm capitalize">
                      {income.income_source.replace('_', ' ')}
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
                    <td className="p-3 text-sm">{income.transaction.company_name || '-'}</td>
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
                          onClick={() => handleEdit(income)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(income.id)}
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
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedIncome ? 'Edit Income' : 'Add New Income'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Transaction Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newIncome.transaction_data.amount}
                    onChange={(e) => handleInputChange('transaction_data', 'amount', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Income Source *</label>
                  <select
                    required
                    value={newIncome.income_source}
                    onChange={(e) => handleInputChange('', 'income_source', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
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
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    required
                    value={newIncome.transaction_data.category}
                    onChange={(e) => handleInputChange('transaction_data', 'category', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
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
                  <label className="block text-sm font-medium mb-1">Payment Method *</label>
                  <select
                    required
                    value={newIncome.transaction_data.payment_method}
                    onChange={(e) => handleInputChange('transaction_data', 'payment_method', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
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
                  <label className="block text-sm font-medium mb-1">Transaction Date *</label>
                  <input
                    type="date"
                    required
                    value={newIncome.transaction_data.transaction_date}
                    onChange={(e) => handleInputChange('transaction_data', 'transaction_date', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={newIncome.transaction_data.status}
                    onChange={(e) => handleInputChange('transaction_data', 'status', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  required
                  value={newIncome.transaction_data.description}
                  onChange={(e) => handleInputChange('transaction_data', 'description', e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                  rows="3"
                />
              </div>

              {/* Additional Income Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={newIncome.invoice_number}
                    onChange={(e) => handleInputChange('', 'invoice_number', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tax Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newIncome.tax_amount}
                    onChange={(e) => handleInputChange('', 'tax_amount', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newIncome.due_date}
                    onChange={(e) => handleInputChange('', 'due_date', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <select
                    value={newIncome.transaction_data.company}
                    onChange={(e) => handleInputChange('transaction_data', 'company', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Select Company</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.company_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Recurring Options */}
              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="is_recurring"
                    checked={newIncome.is_recurring}
                    onChange={(e) => handleInputChange('', 'is_recurring', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="is_recurring" className="text-sm font-medium">
                    This is a recurring income
                  </label>
                </div>

                {newIncome.is_recurring && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Frequency</label>
                      <select
                        value={newIncome.recurring_frequency}
                        onChange={(e) => handleInputChange('', 'recurring_frequency', e.target.value)}
                        className="w-full border rounded-md px-3 py-2"
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
                      <label className="block text-sm font-medium mb-1">Next Due Date</label>
                      <input
                        type="date"
                        value={newIncome.next_due_date}
                        onChange={(e) => handleInputChange('', 'next_due_date', e.target.value)}
                        className="w-full border rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedIncome(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
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
