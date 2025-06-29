import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  BarChart3,
  FileText,
  Users,
  CreditCard,
  Building,
  RefreshCw
} from 'lucide-react';

const AccountingSystemTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [overallStatus, setOverallStatus] = useState('pending');

  const tests = [
    {
      id: 'categories',
      name: 'Accounting Categories',
      description: 'Test category CRUD operations and filtering',
      endpoint: '/accounting/categories/',
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 'payment-methods',
      name: 'Payment Methods',
      description: 'Test payment method management',
      endpoint: '/accounting/payment-methods/',
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      id: 'bank-accounts',
      name: 'Bank Accounts',
      description: 'Test bank account management and balance updates',
      endpoint: '/accounting/bank-accounts/',
      icon: <Building className="h-5 w-5" />
    },
    {
      id: 'transactions',
      name: 'Transactions',
      description: 'Test transaction CRUD and analytics',
      endpoint: '/accounting/transactions/',
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      id: 'transaction-summary',
      name: 'Transaction Summary',
      description: 'Test transaction summary analytics',
      endpoint: '/accounting/transactions/summary/',
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      id: 'category-breakdown',
      name: 'Category Breakdown',
      description: 'Test category-wise transaction breakdown',
      endpoint: '/accounting/transactions/category_breakdown/',
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: 'monthly-trends',
      name: 'Monthly Trends',
      description: 'Test monthly transaction trends',
      endpoint: '/accounting/transactions/monthly_trends/',
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: 'cash-flow',
      name: 'Cash Flow Analysis',
      description: 'Test cash flow analytics',
      endpoint: '/accounting/transactions/cash_flow/',
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: 'income',
      name: 'Income Management',
      description: 'Test income CRUD operations',
      endpoint: '/accounting/income/',
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: 'expenses',
      name: 'Expense Management',
      description: 'Test expense CRUD operations',
      endpoint: '/accounting/expenses/',
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: 'budgets',
      name: 'Budget Management',
      description: 'Test budget CRUD and performance tracking',
      endpoint: '/accounting/budgets/',
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      id: 'payroll',
      name: 'Payroll Management',
      description: 'Test payroll processing and management',
      endpoint: '/accounting/payroll/',
      icon: <Users className="h-5 w-5" />
    }
  ];

  const runTest = async (test) => {
    try {
      setTestResults(prev => ({
        ...prev,
        [test.id]: { status: 'running', message: 'Testing...', details: null }
      }));

      let response;
      const params = {};

      // Add required parameters for specific endpoints
      if (test.id === 'transaction-summary' || test.id === 'category-breakdown' || test.id === 'cash-flow') {
        params.start_date = '2025-01-01';
        params.end_date = '2025-12-31';
      }

      response = await axiosInstance.get(test.endpoint, { params });

      const data = response.data;
      let details = {};

      // Extract meaningful details based on endpoint
      if (data.results) {
        details.count = data.count || data.results.length;
        details.hasData = data.results.length > 0;
        details.sampleData = data.results.slice(0, 2);
      } else if (Array.isArray(data)) {
        details.count = data.length;
        details.hasData = data.length > 0;
        details.sampleData = data.slice(0, 2);
      } else if (typeof data === 'object') {
        details = data;
        details.hasData = Object.keys(data).length > 0;
      }

      setTestResults(prev => ({
        ...prev,
        [test.id]: {
          status: 'success',
          message: `✅ Success - ${details.count || 'Data'} records found`,
          details,
          responseTime: Date.now()
        }
      }));

    } catch (error) {
      console.error(`Test failed for ${test.name}:`, error);
      
      setTestResults(prev => ({
        ...prev,
        [test.id]: {
          status: 'error',
          message: `❌ Failed - ${error.response?.data?.detail || error.message}`,
          details: {
            status: error.response?.status,
            statusText: error.response?.statusText,
            error: error.response?.data
          }
        }
      }));
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setOverallStatus('running');
    setTestResults({});

    for (const test of tests) {
      await runTest(test);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Calculate overall status
    const results = Object.values(testResults);
    const successCount = results.filter(r => r.status === 'success').length;
    const totalCount = tests.length;

    if (successCount === totalCount) {
      setOverallStatus('success');
      toast.success('All accounting system tests passed!');
    } else if (successCount > 0) {
      setOverallStatus('partial');
      toast.warning(`${successCount}/${totalCount} tests passed`);
    } else {
      setOverallStatus('error');
      toast.error('All tests failed');
    }

    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounting System Test</h1>
          <p className="text-gray-600">Comprehensive test of all accounting features and API endpoints</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={runAllTests}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Run All Tests
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      {overallStatus !== 'pending' && (
        <Card className={`border-2 ${getStatusColor(overallStatus)}`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              {getStatusIcon(overallStatus)}
              <div>
                <h3 className="font-semibold">
                  Overall Status: {overallStatus === 'success' ? 'All Tests Passed' : 
                                  overallStatus === 'partial' ? 'Some Tests Failed' : 'Tests Failed'}
                </h3>
                <p className="text-sm">
                  {Object.values(testResults).filter(r => r.status === 'success').length} / {tests.length} tests passed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => {
          const result = testResults[test.id];
          const status = result?.status || 'pending';

          return (
            <Card key={test.id} className={`border ${getStatusColor(status)}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center space-x-2">
                    {test.icon}
                    <span>{test.name}</span>
                  </div>
                  {getStatusIcon(status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{test.description}</p>
                
                {result && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{result.message}</p>
                    
                    {result.details && (
                      <div className="text-xs bg-gray-50 p-2 rounded">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runTest(test)}
                    disabled={loading}
                    className="w-full"
                  >
                    {result?.status === 'running' ? 'Testing...' : 'Test'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AccountingSystemTest;
