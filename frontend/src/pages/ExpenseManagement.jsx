import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Plus, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  FileText,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import api from '../services/api';

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [summary, setSummary] = useState({
    total_expense: 0,
    monthly_expense: 0,
    pending_expense: 0,
    pending_approval: 0
  });

  const [newExpense, setNewExpense] = useState({
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
    expense_type: '',
    vendor_name: '',
    bill_number: '',
    due_date: '',
    tax_amount: '0.00',
    is_recurring: false,
    recurring_frequency: '',
    next_due_date: '',
    requires_approval: false,
    approval_status: 'pending'
  });

  useEffect(() => {
    fetchExpenses();
    fetchFilterOptions();
    fetchSummary();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/accounting/expenses/');
      setExpenses(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [categoriesRes, paymentMethodsRes, companiesRes, driversRes] = await Promise.all([
        api.get('/accounting/categories/?category_type=expense'),
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
            end_date: currentDate.toISOString().split('T')[0]
          }
        }),
        api.get('/accounting/transactions/summary/', {
          params: {
            start_date: startOfMonth.toISOString().split('T')[0],
            end_date: endOfMonth.toISOString().split('T')[0]
          }
        })
      ]);

      const pendingApproval = expenses.filter(exp => exp.approval_status === 'pending').length;
      const pendingExpense = expenses.filter(exp => exp.transaction.status === 'pending').length;

      setSummary({
        total_expense: totalRes.data.total_expense || 0,
        monthly_expense: monthlyRes.data.total_expense || 0,
        pending_expense: pendingExpense,
        pending_approval: pendingApproval
      });
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedExpense) {
        await api.put(`/accounting/expenses/${selectedExpense.id}/`, newExpense);
      } else {
        await api.post('/accounting/expenses/', newExpense);
      }
      
      setShowAddModal(false);
      setSelectedExpense(null);
      resetForm();
      fetchExpenses();
      fetchSummary();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Error saving expense. Please check all fields.');
    }
  };

  const resetForm = () => {
    setNewExpense({
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
      expense_type: '',
      vendor_name: '',
      bill_number: '',
      due_date: '',
      tax_amount: '0.00',
      is_recurring: false,
      recurring_frequency: '',
      next_due_date: '',
      requires_approval: false,
      approval_status: 'pending'
    });
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setNewExpense({
      transaction_data: {
        amount: expense.transaction.amount,
        description: expense.transaction.description,
        category: expense.transaction.category,
        payment_method: expense.transaction.payment_method,
        bank_account: expense.transaction.bank_account || '',
        company: expense.transaction.company || '',
        driver: expense.transaction.driver || '',
        transaction_date: expense.transaction.transaction_date.split('T')[0],
        status: expense.transaction.status
      },
      expense_type: expense.expense_type,
      vendor_name: expense.vendor_name || '',
      bill_number: expense.bill_number || '',
      due_date: expense.due_date || '',
      tax_amount: expense.tax_amount,
      is_recurring: expense.is_recurring,
      recurring_frequency: expense.recurring_frequency || '',
      next_due_date: expense.next_due_date || '',
      requires_approval: expense.requires_approval,
      approval_status: expense.approval_status
    });
    setShowAddModal(true);
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      try {
        await api.delete(`/accounting/expenses/${expenseId}/`);
        fetchExpenses();
        fetchSummary();
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Error deleting expense');
      }
    }
  };

  const handleApprove = async (expenseId) => {
    try {
      await api.post(`/accounting/expenses/${expenseId}/approve/`);
      fetchExpenses();
      fetchSummary();
    } catch (error) {
      console.error('Error approving expense:', error);
      alert('Error approving expense');
    }
  };

  const handleReject = async (expenseId) => {
    try {
      await api.post(`/accounting/expenses/${expenseId}/reject/`);
      fetchExpenses();
      fetchSummary();
    } catch (error) {
      console.error('Error rejecting expense:', error);
      alert('Error rejecting expense');
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

  const getApprovalStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
          <p className="text-gray-600">Track and manage all business expenses</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
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

        <Card>
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

        <Card>
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

        <Card>
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
      <Card>
        <CardHeader>
          <CardTitle>Expense Records ({expenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Transaction ID</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Vendor</th>
                  <th className="text-left p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Approval</th>
                  <th className="text-left p-3 font-medium">Recurring</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{expense.transaction.transaction_id}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {expense.transaction.description}
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      {new Date(expense.transaction.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-sm capitalize">
                      {expense.expense_type.replace('_', ' ')}
                    </td>
                    <td className="p-3 text-sm">{expense.vendor_name || '-'}</td>
                    <td className="p-3">
                      <span className="font-bold text-red-600">
                        {formatCurrency(expense.transaction.amount)}
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusColor(expense.transaction.status)}>
                        {expense.transaction.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {expense.requires_approval ? (
                        <Badge className={getApprovalStatusColor(expense.approval_status)}>
                          {expense.approval_status}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="p-3">
                      {expense.is_recurring ? (
                        <Badge className="bg-purple-100 text-purple-800">
                          {expense.recurring_frequency}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">No</span>
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
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(expense.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(expense)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(expense.id)}
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
              {selectedExpense ? 'Edit Expense' : 'Add New Expense'}
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
                    value={newExpense.transaction_data.amount}
                    onChange={(e) => handleInputChange('transaction_data', 'amount', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Expense Type *</label>
                  <select
                    required
                    value={newExpense.expense_type}
                    onChange={(e) => handleInputChange('', 'expense_type', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
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
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    required
                    value={newExpense.transaction_data.category}
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
                    value={newExpense.transaction_data.payment_method}
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
                    value={newExpense.transaction_data.transaction_date}
                    onChange={(e) => handleInputChange('transaction_data', 'transaction_date', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={newExpense.transaction_data.status}
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
                  value={newExpense.transaction_data.description}
                  onChange={(e) => handleInputChange('transaction_data', 'description', e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                  rows="3"
                />
              </div>

              {/* Additional Expense Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Vendor Name</label>
                  <input
                    type="text"
                    value={newExpense.vendor_name}
                    onChange={(e) => handleInputChange('', 'vendor_name', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bill Number</label>
                  <input
                    type="text"
                    value={newExpense.bill_number}
                    onChange={(e) => handleInputChange('', 'bill_number', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tax Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newExpense.tax_amount}
                    onChange={(e) => handleInputChange('', 'tax_amount', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newExpense.due_date}
                    onChange={(e) => handleInputChange('', 'due_date', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <select
                    value={newExpense.transaction_data.company}
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

                <div>
                  <label className="block text-sm font-medium mb-1">Driver</label>
                  <select
                    value={newExpense.transaction_data.driver}
                    onChange={(e) => handleInputChange('transaction_data', 'driver', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Select Driver</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.driver_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Approval and Recurring Options */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requires_approval"
                    checked={newExpense.requires_approval}
                    onChange={(e) => handleInputChange('', 'requires_approval', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="requires_approval" className="text-sm font-medium">
                    This expense requires approval
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_recurring"
                    checked={newExpense.is_recurring}
                    onChange={(e) => handleInputChange('', 'is_recurring', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="is_recurring" className="text-sm font-medium">
                    This is a recurring expense
                  </label>
                </div>

                {newExpense.is_recurring && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Frequency</label>
                      <select
                        value={newExpense.recurring_frequency}
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
                        value={newExpense.next_due_date}
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
                    setSelectedExpense(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
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
