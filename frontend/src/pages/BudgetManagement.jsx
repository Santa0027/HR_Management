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
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  Save
} from 'lucide-react';

const BudgetManagement = () => {
  const [budgets, setBudgets] = useState([]);
  const [budgetPerformance, setBudgetPerformance] = useState([]);
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [errors, setErrors] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    year: new Date().getFullYear(),
    category: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budgeted_income: '',
    budgeted_expense: '',
    budget_period_start: '',
    budget_period_end: '',
    category: '',
    status: 'active'
  });

  const [summary, setSummary] = useState({
    total_budgets: 0,
    active_budgets: 0,
    over_budget_count: 0,
    total_variance: 0
  });

  // Fetch budgets from API
  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      console.log('💰 Loading budgets from API...');

      const response = await axiosInstance.get('/budgets/');
      const budgetsData = Array.isArray(response.data) ? response.data : [];
      setBudgets(budgetsData);
      console.log('✅ Budgets loaded from API:', budgetsData.length);
    } catch (error) {
      console.error('Error loading budgets:', error);
      toast.error("Failed to load budgets");
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch budget performance data
  const fetchBudgetPerformance = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/accounting/budgets/budget_performance/', {
        params: { year: filters.year }
      });
      setBudgetPerformance(response.data || []);
    } catch (error) {
      console.error('Error fetching budget performance:', error);
    }
  }, [filters.year]);

  // Fetch budget alerts
  const fetchBudgetAlerts = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/accounting/budgets/budget_alerts/');
      setBudgetAlerts(response.data || []);
    } catch (error) {
      console.error('Error fetching budget alerts:', error);
    }
  }, []);

  // Fetch categories for dropdown
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/accounting/categories/');
      setCategories(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // Calculate summary statistics
  const calculateSummary = useCallback(() => {
    const totalBudgets = budgets.length;
    const activeBudgets = budgets.filter(b => b.status === 'active').length;
    const overBudgetCount = budgetPerformance.filter(p => 
      p.expense_variance > 0 || p.income_variance < 0
    ).length;
    const totalVariance = budgetPerformance.reduce((sum, p) => 
      sum + (p.income_variance - p.expense_variance), 0
    );

    setSummary({
      total_budgets: totalBudgets,
      active_budgets: activeBudgets,
      over_budget_count: overBudgetCount,
      total_variance: totalVariance
    });
  }, [budgets, budgetPerformance]);

  useEffect(() => {
    fetchBudgets();
    fetchBudgetPerformance();
    fetchBudgetAlerts();
    fetchCategories();
  }, [fetchBudgets, fetchBudgetPerformance, fetchBudgetAlerts, fetchCategories]);

  useEffect(() => {
    calculateSummary();
  }, [calculateSummary]);

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Budget name is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (!formData.budgeted_income || parseFloat(formData.budgeted_income) < 0) {
      errors.budgeted_income = 'Budgeted income must be 0 or greater';
    }

    if (!formData.budgeted_expense || parseFloat(formData.budgeted_expense) < 0) {
      errors.budgeted_expense = 'Budgeted expense must be 0 or greater';
    }

    if (!formData.budget_period_start) {
      errors.budget_period_start = 'Start date is required';
    }

    if (!formData.budget_period_end) {
      errors.budget_period_end = 'End date is required';
    }

    if (formData.budget_period_start && formData.budget_period_end &&
        new Date(formData.budget_period_start) >= new Date(formData.budget_period_end)) {
      errors.budget_period_end = 'End date must be after start date';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        budgeted_income: parseFloat(formData.budgeted_income),
        budgeted_expense: parseFloat(formData.budgeted_expense)
      };

      console.log('💾 Saving budget via API...');

      if (selectedBudget) {
        // Update existing budget
        await axiosInstance.put(`/budgets/${selectedBudget.id}/`, dataToSubmit);
        toast.success("✅ Budget updated successfully!");
        setShowEditModal(false);
      } else {
        // Create new budget
        await axiosInstance.post('/budgets/', dataToSubmit);
        toast.success("✅ Budget created successfully!");
        setShowAddModal(false);
      }

      // Refresh the budgets list
      await fetchBudgets();
      resetForm();
    } catch (error) {
      console.error('Error saving budget:', error);

      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const fieldErrors = {};
          Object.keys(errorData).forEach(key => {
            if (Array.isArray(errorData[key])) {
              fieldErrors[key] = errorData[key][0];
            } else {
              fieldErrors[key] = errorData[key];
            }
          });
          setErrors(fieldErrors);
          toast.error('Please check the form for errors');
        } else {
          toast.error("Failed to save budget.");
        }
      } else {
        toast.error('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      budgeted_income: '',
      budgeted_expense: '',
      budget_period_start: '',
      budget_period_end: '',
      category: '',
      status: 'active'
    });
    setSelectedBudget(null);
    setErrors({});
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle edit
  const handleEdit = (budget) => {
    setSelectedBudget(budget);
    setFormData({
      name: budget.name || '',
      description: budget.description || '',
      budgeted_income: budget.budgeted_income || '',
      budgeted_expense: budget.budgeted_expense || '',
      budget_period_start: budget.budget_period_start || '',
      budget_period_end: budget.budget_period_end || '',
      category: budget.category || '',
      status: budget.status || 'active'
    });
    setShowEditModal(true);
  };

  // Handle delete
  const handleDelete = async (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await axiosInstance.delete(`/accounting/budgets/${budgetId}/`);
        toast.success("Budget deleted successfully!");
        fetchBudgets();
        fetchBudgetPerformance();
      } catch (error) {
        console.error('Error deleting budget:', error);
        toast.error("Failed to delete budget.");
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

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get variance color
  const getVarianceColor = (variance, isIncome = false) => {
    if (isIncome) {
      return variance >= 0 ? 'text-green-600' : 'text-red-600';
    } else {
      return variance <= 0 ? 'text-green-600' : 'text-red-600';
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-600">
            Plan, track, and analyze your financial budgets ({summary.total_budgets} total budgets)
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
            Create Budget
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Budgets</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_budgets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Budgets</p>
                <p className="text-2xl font-bold text-gray-900">{summary.active_budgets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Over Budget</p>
                <p className="text-2xl font-bold text-gray-900">{summary.over_budget_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Variance</p>
                <p className={`text-2xl font-bold ${getVarianceColor(summary.total_variance, true)}`}>
                  {formatCurrency(summary.total_variance)}
                </p>
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgetAlerts.slice(0, 6).map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  alert.severity === 'high' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-medium ${
                      alert.severity === 'high' ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {alert.budget_name}
                    </h4>
                    <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                      {alert.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <p className={`text-sm ${
                    alert.severity === 'high' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {alert.message}
                  </p>
                  <div className="mt-2 text-xs text-gray-600">
                    Budget: {formatCurrency(alert.budgeted_amount)} |
                    Actual: {formatCurrency(alert.actual_amount)}
                  </div>
                </div>
              ))}
            </div>
            {budgetAlerts.length > 6 && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All {budgetAlerts.length} Alerts
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Budget Performance and Budget List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Budget Performance ({filters.year})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetPerformance.slice(0, 5).map((performance, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{performance.name}</h4>
                    <Badge className={getStatusColor(performance.status)}>
                      {performance.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Income Performance</p>
                      <p className="font-medium">
                        {formatCurrency(performance.actual_income)} / {formatCurrency(performance.budgeted_income)}
                      </p>
                      <p className={`text-xs ${getVarianceColor(performance.income_variance, true)}`}>
                        {performance.income_variance >= 0 ? '+' : ''}{formatCurrency(performance.income_variance)}
                        ({performance.income_variance_percent.toFixed(1)}%)
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600">Expense Performance</p>
                      <p className="font-medium">
                        {formatCurrency(performance.actual_expense)} / {formatCurrency(performance.budgeted_expense)}
                      </p>
                      <p className={`text-xs ${getVarianceColor(performance.expense_variance, false)}`}>
                        {performance.expense_variance >= 0 ? '+' : ''}{formatCurrency(performance.expense_variance)}
                        ({performance.expense_variance_percent.toFixed(1)}%)
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    Period: {new Date(performance.period_start).toLocaleDateString()} - {new Date(performance.period_end).toLocaleDateString()}
                  </div>
                </div>
              ))}

              {budgetPerformance.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No budget performance data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Budget List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Budget List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgets.slice(0, 5).map((budget) => (
                <div key={budget.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{budget.name}</h4>
                      <p className="text-sm text-gray-600">{budget.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(budget)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(budget.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Budgeted Income</p>
                      <p className="font-medium text-green-600">{formatCurrency(budget.budgeted_income)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Budgeted Expense</p>
                      <p className="font-medium text-red-600">{formatCurrency(budget.budgeted_expense)}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <Badge className={getStatusColor(budget.status)}>
                      {budget.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(budget.budget_period_start).toLocaleDateString()} - {new Date(budget.budget_period_end).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}

              {budgets.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No budgets found</p>
                  <Button
                    className="mt-4"
                    onClick={() => { setShowAddModal(true); resetForm(); }}
                  >
                    Create Your First Budget
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Budget Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Target className="h-6 w-6 mr-3 text-blue-600" />
                {selectedBudget ? 'Edit Budget' : 'Create New Budget'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedBudget(null);
                  resetForm();
                  setErrors({});
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Budget Name and Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Monthly Operations Budget"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.category ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {errors.category}
                    </p>
                  )}
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
                  placeholder="Brief description of this budget..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Budget Amounts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budgeted Income <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="budgeted_income"
                      value={formData.budgeted_income}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.budgeted_income ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.budgeted_income && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {errors.budgeted_income}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budgeted Expense <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="budgeted_expense"
                      value={formData.budgeted_expense}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.budgeted_expense ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.budgeted_expense && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {errors.budgeted_expense}
                    </p>
                  )}
                </div>
              </div>

              {/* Budget Period */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="budget_period_start"
                    value={formData.budget_period_start}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.budget_period_start ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.budget_period_start && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {errors.budget_period_start}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="budget_period_end"
                    value={formData.budget_period_end}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.budget_period_end ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.budget_period_end && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {errors.budget_period_end}
                    </p>
                  )}
                </div>
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
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Budget Summary */}
              {(formData.budgeted_income || formData.budgeted_expense) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Budget Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Expected Income:</span>
                      <p className="font-medium text-green-600">
                        ${parseFloat(formData.budgeted_income || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-700">Expected Expense:</span>
                      <p className="font-medium text-red-600">
                        ${parseFloat(formData.budgeted_expense || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-700">Net Budget:</span>
                      <p className={`font-medium ${
                        (parseFloat(formData.budgeted_income || 0) - parseFloat(formData.budgeted_expense || 0)) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        ${(parseFloat(formData.budgeted_income || 0) - parseFloat(formData.budgeted_expense || 0)).toLocaleString()}
                      </p>
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
                    setSelectedBudget(null);
                    resetForm();
                    setErrors({});
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
                      {selectedBudget ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {selectedBudget ? 'Update Budget' : 'Create Budget'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManagement;
