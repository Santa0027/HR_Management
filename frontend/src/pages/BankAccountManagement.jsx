import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../api/axiosInstance';
import {
  Plus,
  DollarSign,
  CreditCard,
  Building,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  XCircle,
  Save
} from 'lucide-react';

const BankAccountManagement = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [formData, setFormData] = useState({
    account_name: '',
    account_number: '',
    bank_name: '',
    account_type: 'checking',
    current_balance: '',
    currency: 'USD',
    is_active: true,
    description: ''
  });

  const [reconcileData, setReconcileData] = useState({
    statement_balance: '',
    statement_date: '',
    reconcile_notes: ''
  });

  const [summary, setSummary] = useState({
    total_balance: 0,
    active_accounts: 0,
    pending_reconciliation: 0,
    monthly_inflow: 0,
    monthly_outflow: 0
  });

  const [filters, setFilters] = useState({
    account_type: '',
    status: 'active',
    date_range: '30'
  });

  // Fetch bank accounts from API
  const fetchBankAccounts = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🏦 Loading bank accounts from API...');

      const response = await axiosInstance.get('/accounting/bank-accounts/');
      const bankAccountsData = Array.isArray(response.data) ? response.data : [];
      setBankAccounts(bankAccountsData);

      console.log('✅ Bank accounts loaded from API:', bankAccountsData.length);
    } catch (error) {
      console.error('Error loading bank accounts:', error);
      toast.error("Failed to load bank accounts");
      setBankAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch recent transactions
  const fetchTransactions = useCallback(async () => {
    try {
      const daysAgo = parseInt(filters.date_range);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const response = await axiosInstance.get('/accounting/transactions/', {
        params: {
          transaction_date__gte: startDate.toISOString().split('T')[0],
          ordering: '-transaction_date',
          limit: 50
        }
      });
      setTransactions(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, [filters.date_range]);

  // Calculate summary
  const calculateSummary = useCallback(() => {
    const totalBalance = bankAccounts.reduce((sum, account) => 
      sum + parseFloat(account.current_balance || 0), 0
    );
    const activeAccounts = bankAccounts.filter(account => account.is_active).length;
    const pendingReconciliation = bankAccounts.filter(account => 
      account.needs_reconciliation
    ).length;

    // Calculate monthly cash flow
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTransactions = transactions.filter(t => 
      new Date(t.transaction_date) >= thirtyDaysAgo
    );
    
    const monthlyInflow = recentTransactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    const monthlyOutflow = recentTransactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    setSummary({
      total_balance: totalBalance,
      active_accounts: activeAccounts,
      pending_reconciliation: pendingReconciliation,
      monthly_inflow: monthlyInflow,
      monthly_outflow: monthlyOutflow
    });
  }, [bankAccounts, transactions]);

  useEffect(() => {
    fetchBankAccounts();
    fetchTransactions();
  }, [fetchBankAccounts, fetchTransactions]);

  useEffect(() => {
    calculateSummary();
  }, [calculateSummary]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('💾 Saving bank account via API...');

      if (selectedAccount) {
        // Update existing account
        await axiosInstance.put(`/accounting/bank-accounts/${selectedAccount.id}/`, formData);
        toast.success("✅ Bank account updated successfully!");
        setShowEditModal(false);
      } else {
        // Create new account
        await axiosInstance.post('/accounting/bank-accounts/', formData);
        toast.success("✅ Bank account created successfully!");
        setShowAddModal(false);
      }

      // Refresh the bank accounts list
      await fetchBankAccounts();
      resetForm();
    } catch (error) {
      console.error('Error saving bank account:', error);
      toast.error("Failed to save bank account.");
    }
  };

  // Handle reconciliation
  const handleReconcile = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(`/accounting/bank-accounts/${selectedAccount.id}/reconcile/`, reconcileData);
      toast.success("Account reconciled successfully!");
      setShowReconcileModal(false);
      fetchBankAccounts();
      resetReconcileForm();
    } catch (error) {
      console.error('Error reconciling account:', error);
      toast.error("Failed to reconcile account.");
    }
  };

  // Reset forms
  const resetForm = () => {
    setFormData({
      account_name: '',
      account_number: '',
      bank_name: '',
      account_type: 'checking',
      current_balance: '',
      currency: 'USD',
      is_active: true,
      description: '',
      iban: '',
      opening_balance: '',
      branch: '',
      swift_code: '',
      status: 'active'
    });
    setSelectedAccount(null);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetReconcileForm = () => {
    setReconcileData({
      statement_balance: '',
      statement_date: '',
      reconcile_notes: ''
    });
    setSelectedAccount(null);
  };

  // Handle edit
  const handleEdit = (account) => {
    setSelectedAccount(account);
    setFormData({
      account_name: account.account_name || '',
      account_number: account.account_number || '',
      bank_name: account.bank_name || '',
      account_type: account.account_type || 'checking',
      current_balance: account.current_balance || '',
      currency: account.currency || 'USD',
      is_active: account.is_active !== undefined ? account.is_active : true,
      description: account.description || ''
    });
    setShowEditModal(true);
  };

  // Handle reconcile
  const handleReconcileClick = (account) => {
    setSelectedAccount(account);
    setReconcileData({
      statement_balance: account.current_balance || '',
      statement_date: new Date().toISOString().split('T')[0],
      reconcile_notes: ''
    });
    setShowReconcileModal(true);
  };

  // Handle delete
  const handleDelete = async (accountId) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      try {
        await axiosInstance.delete(`/accounting/bank-accounts/${accountId}/`);
        toast.success("Bank account deleted successfully!");
        fetchBankAccounts();
      } catch (error) {
        console.error('Error deleting bank account:', error);
        toast.error("Failed to delete bank account.");
      }
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Get account type color
  const getAccountTypeColor = (type) => {
    switch (type) {
      case 'checking': return 'bg-blue-100 text-blue-800';
      case 'savings': return 'bg-green-100 text-green-800';
      case 'credit': return 'bg-purple-100 text-purple-800';
      case 'business': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get balance color
  const getBalanceColor = (balance) => {
    return parseFloat(balance) >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bank Account Management</h1>
          <p className="text-gray-600">
            Manage bank accounts and track balances ({bankAccounts.length} accounts)
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => { setShowAddModal(true); resetForm(); }} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_balance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Accounts</p>
                <p className="text-2xl font-bold text-gray-900">{summary.active_accounts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Need Reconciliation</p>
                <p className="text-2xl font-bold text-gray-900">{summary.pending_reconciliation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ArrowUpRight className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Inflow</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.monthly_inflow)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ArrowDownLeft className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Outflow</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.monthly_outflow)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bank Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bankAccounts.map((account) => (
          <Card key={account.id} className={`${account.is_active ? '' : 'opacity-60'}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{account.account_name}</CardTitle>
                  <p className="text-sm text-gray-600">{account.bank_name}</p>
                </div>
                <div className="flex space-x-2">
                  <Badge className={getAccountTypeColor(account.account_type)}>
                    {account.account_type}
                  </Badge>
                  {account.needs_reconciliation && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Reconcile
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Account Number</p>
                  <p className="font-mono text-sm">****{account.account_number?.slice(-4)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Current Balance</p>
                  <p className={`text-2xl font-bold ${getBalanceColor(account.current_balance)}`}>
                    {formatCurrency(account.current_balance)}
                  </p>
                </div>

                {account.description && (
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-sm">{account.description}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(account)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReconcileClick(account)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(account.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {account.is_active ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-xs text-gray-500">
                      {account.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {bankAccounts.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No bank accounts found</p>
                <p className="text-gray-400 text-sm mb-4">Add your first bank account to get started</p>
                <Button onClick={() => { setShowAddModal(true); resetForm(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bank Account
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Add/Edit Bank Account Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Building className="h-6 w-6 mr-3 text-blue-600" />
                {selectedAccount ? 'Edit Bank Account' : 'Add New Bank Account'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedAccount(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bank Name and Account Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Saudi National Bank"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="account_name"
                    value={formData.account_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Business Operations Account"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Account Number and IBAN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleInputChange}
                    placeholder="Enter account number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IBAN
                  </label>
                  <input
                    type="text"
                    name="iban"
                    value={formData.iban}
                    onChange={handleInputChange}
                    placeholder="SA00 0000 0000 0000 0000 0000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Account Type and Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="account_type"
                    value={formData.account_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select Account Type</option>
                    <option value="checking">Checking Account</option>
                    <option value="savings">Savings Account</option>
                    <option value="business">Business Account</option>
                    <option value="credit">Credit Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select Currency</option>
                    <option value="SAR">SAR - Saudi Riyal</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
              </div>

              {/* Current Balance and Opening Balance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Balance <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {formData.currency === 'SAR' ? 'ر.س' : '$'}
                    </span>
                    <input
                      type="number"
                      name="current_balance"
                      value={formData.current_balance}
                      onChange={handleInputChange}
                      step="0.01"
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opening Balance
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {formData.currency === 'SAR' ? 'ر.س' : '$'}
                    </span>
                    <input
                      type="number"
                      name="opening_balance"
                      value={formData.opening_balance}
                      onChange={handleInputChange}
                      step="0.01"
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Branch and Swift Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    placeholder="e.g., Riyadh Main Branch"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Swift Code
                  </label>
                  <input
                    type="text"
                    name="swift_code"
                    value={formData.swift_code}
                    onChange={handleInputChange}
                    placeholder="e.g., NCBKSARI"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Additional notes about this account..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Account Summary */}
              {formData.current_balance && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Account Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Account:</span>
                      <p className="font-medium">{formData.account_name || 'New Account'}</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Current Balance:</span>
                      <p className="font-medium text-green-600">
                        {formData.currency === 'SAR' ? 'ر.س' : '$'} {parseFloat(formData.current_balance || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-700">Bank:</span>
                      <p className="font-medium">{formData.bank_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Type:</span>
                      <p className="font-medium capitalize">{formData.account_type || 'Not selected'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedAccount(null);
                    resetForm();
                  }}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {selectedAccount ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {selectedAccount ? 'Update Account' : 'Create Account'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reconcile Modal */}
      {showReconcileModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Reconcile Account
              </h2>
              <button
                onClick={() => setShowReconcileModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{selectedAccount.account_name}</h3>
                <p className="text-sm text-gray-600">
                  Current Balance: <span className="font-medium">${selectedAccount.current_balance?.toLocaleString()}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Statement Balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter actual bank balance"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowReconcileModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReconcile}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Reconcile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccountManagement;
