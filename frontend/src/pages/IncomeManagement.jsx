import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Download,
  DollarSign,
  User,
  Calendar
} from 'lucide-react';

const IncomeManagement = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');

  const [formData, setFormData] = useState({
    source: 'trip_commission',
    amount: '',
    description: '',
    driver: '',
    reference_number: '',
    date: new Date().toISOString().split('T')[0]
  });

  const incomeSources = [
    { value: 'trip_commission', label: 'Trip Commission' },
    { value: 'subscription_fee', label: 'Subscription Fee' },
    { value: 'penalty_fee', label: 'Penalty Fee' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      // Simulate API call
      const mockIncomes = [
        {
          id: 1,
          source: 'trip_commission',
          source_display: 'Trip Commission',
          amount: 1500.00,
          description: 'Driver commission for January',
          driver: 1,
          driver_name: 'Mohammed Al-Ahmad',
          reference_number: 'INC-2024-001',
          created_at: '2025-07-06T10:30:00Z',
          created_by_name: 'System Administrator'
        },
        {
          id: 2,
          source: 'subscription_fee',
          source_display: 'Subscription Fee',
          amount: 2000.00,
          description: 'Monthly subscription fees',
          driver: null,
          driver_name: null,
          reference_number: 'INC-2024-002',
          created_at: '2025-07-05T14:20:00Z',
          created_by_name: 'HR Manager'
        },
        {
          id: 3,
          source: 'penalty_fee',
          source_display: 'Penalty Fee',
          amount: 300.00,
          description: 'Late payment penalty',
          driver: 2,
          driver_name: 'Ahmed Hassan',
          reference_number: 'INC-2024-003',
          created_at: '2025-07-04T09:15:00Z',
          created_by_name: 'System Administrator'
        }
      ];
      setIncomes(mockIncomes);
    } catch (error) {
      console.error('Error fetching incomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    try {
      const newIncome = {
        id: incomes.length + 1,
        ...formData,
        amount: parseFloat(formData.amount),
        source_display: incomeSources.find(s => s.value === formData.source)?.label,
        driver_name: formData.driver ? `Driver ${formData.driver}` : null,
        created_at: new Date().toISOString(),
        created_by_name: 'Current User'
      };
      setIncomes([newIncome, ...incomes]);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding income:', error);
    }
  };

  const handleEditIncome = async (e) => {
    e.preventDefault();
    try {
      const updatedIncomes = incomes.map(income => 
        income.id === selectedIncome.id 
          ? { 
              ...income, 
              ...formData, 
              amount: parseFloat(formData.amount),
              source_display: incomeSources.find(s => s.value === formData.source)?.label,
              driver_name: formData.driver ? `Driver ${formData.driver}` : null
            }
          : income
      );
      setIncomes(updatedIncomes);
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error('Error updating income:', error);
    }
  };

  const handleDeleteIncome = async (incomeId) => {
    if (window.confirm('Are you sure you want to delete this income record?')) {
      try {
        setIncomes(incomes.filter(income => income.id !== incomeId));
      } catch (error) {
        console.error('Error deleting income:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      source: 'trip_commission',
      amount: '',
      description: '',
      driver: '',
      reference_number: '',
      date: new Date().toISOString().split('T')[0]
    });
    setSelectedIncome(null);
  };

  const openEditModal = (income) => {
    setSelectedIncome(income);
    setFormData({
      source: income.source,
      amount: income.amount.toString(),
      description: income.description,
      driver: income.driver || '',
      reference_number: income.reference_number,
      date: new Date(income.created_at).toISOString().split('T')[0]
    });
    setShowEditModal(true);
  };

  const filteredIncomes = incomes.filter(income => {
    const matchesSearch = income.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         income.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (income.driver_name && income.driver_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSource = filterSource === 'all' || income.source === filterSource;
    return matchesSearch && matchesSource;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KW', {
      style: 'currency',
      currency: 'KWD'
    }).format(amount);
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const monthlyIncome = incomes
    .filter(income => new Date(income.created_at).getMonth() === new Date().getMonth())
    .reduce((sum, income) => sum + income.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="mr-3 h-8 w-8 text-green-600" />
                Income Management
              </h1>
              <p className="mt-2 text-gray-600">
                Track and manage all income sources and revenue streams
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
                <Download className="mr-2 h-4 w-4" />
                Export
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Income
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(monthlyIncome)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Income Records</p>
                <p className="text-2xl font-bold text-purple-600">
                  {incomes.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search income records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Sources</option>
                {incomeSources.map(source => (
                  <option key={source.value} value={source.value}>
                    {source.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Income Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Income Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
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
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {income.description}
                        </div>
                        <div className="text-sm text-gray-500">
                          {income.reference_number}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {income.source_display}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(income.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {income.driver_name ? (
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{income.driver_name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(income.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(income)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Edit Income"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteIncome(income.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title="Delete Income"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeManagement;
