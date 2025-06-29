import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';

const AccountingCRUDTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [testTransaction, setTestTransaction] = useState(null);

  const runTest = async (testName, testFunction) => {
    try {
      console.log(`Running test: ${testName}`);
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, data: result, error: null }
      }));
      return result;
    } catch (error) {
      console.error(`Test failed: ${testName}`, error);
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, data: null, error: error.response?.data || error.message }
      }));
      throw error;
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults({});
    
    try {
      // Test 1: GET Categories
      await runTest('GET Categories', async () => {
        const response = await axiosInstance.get('/accounting/categories/');
        return response.data;
      });

      // Test 2: GET Payment Methods
      await runTest('GET Payment Methods', async () => {
        const response = await axiosInstance.get('/accounting/payment-methods/');
        return response.data;
      });

      // Test 3: GET Companies
      await runTest('GET Companies', async () => {
        const response = await axiosInstance.get('/companies/');
        return response.data;
      });

      // Test 4: GET Drivers
      await runTest('GET Drivers', async () => {
        const response = await axiosInstance.get('/Register/drivers/');
        return response.data;
      });

      // Test 5: GET Transactions
      await runTest('GET Transactions', async () => {
        const response = await axiosInstance.get('/accounting/transactions/');
        return response.data;
      });

      // Test 6: CREATE Transaction
      const createResult = await runTest('CREATE Transaction', async () => {
        const response = await axiosInstance.post('/accounting/transactions/', {
          transaction_type: 'expense',
          amount: 100.00,
          description: 'CRUD Test Transaction',
          category: 1,
          payment_method: 1,
          transaction_date: new Date().toISOString().split('T')[0]
        });
        setTestTransaction(response.data);
        return response.data;
      });

      // Test 7: UPDATE Transaction (if create was successful)
      if (createResult && testTransaction) {
        await runTest('UPDATE Transaction', async () => {
          const response = await axiosInstance.put(`/accounting/transactions/${testTransaction.id}/`, {
            transaction_type: 'expense',
            amount: 150.00,
            description: 'CRUD Test Transaction - Updated',
            category: 1,
            payment_method: 1,
            transaction_date: new Date().toISOString().split('T')[0]
          });
          return response.data;
        });
      }

      // Test 8: GET Income
      await runTest('GET Income', async () => {
        const response = await axiosInstance.get('/accounting/income/');
        return response.data;
      });

      // Test 9: GET Expenses
      await runTest('GET Expenses', async () => {
        const response = await axiosInstance.get('/accounting/expenses/');
        return response.data;
      });

      // Test 10: GET Budgets
      await runTest('GET Budgets', async () => {
        const response = await axiosInstance.get('/accounting/budgets/');
        return response.data;
      });

      // Test 11: GET Bank Accounts
      await runTest('GET Bank Accounts', async () => {
        const response = await axiosInstance.get('/accounting/bank-accounts/');
        return response.data;
      });

      // Test 12: GET Transaction Summary
      await runTest('GET Transaction Summary', async () => {
        const response = await axiosInstance.get('/accounting/transactions/summary/', {
          params: {
            start_date: '2025-01-01',
            end_date: '2025-12-31'
          }
        });
        return response.data;
      });

      // Test 13: GET Category Breakdown
      await runTest('GET Category Breakdown', async () => {
        const response = await axiosInstance.get('/accounting/transactions/category_breakdown/', {
          params: {
            start_date: '2025-01-01',
            end_date: '2025-12-31'
          }
        });
        return response.data;
      });

      // Test 14: DELETE Transaction (cleanup)
      if (testTransaction) {
        await runTest('DELETE Transaction', async () => {
          const response = await axiosInstance.delete(`/accounting/transactions/${testTransaction.id}/`);
          return { deleted: true, id: testTransaction.id };
        });
      }

      toast.success('All CRUD tests completed!');
    } catch (error) {
      toast.error('Some tests failed. Check the results below.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (result) => {
    if (!result) return <Badge variant="secondary">Not Run</Badge>;
    return result.success ? 
      <Badge className="bg-green-100 text-green-800">✅ Pass</Badge> : 
      <Badge className="bg-red-100 text-red-800">❌ Fail</Badge>;
  };

  const testCases = [
    'GET Categories',
    'GET Payment Methods', 
    'GET Companies',
    'GET Drivers',
    'GET Transactions',
    'CREATE Transaction',
    'UPDATE Transaction',
    'GET Income',
    'GET Expenses',
    'GET Budgets',
    'GET Bank Accounts',
    'GET Transaction Summary',
    'GET Category Breakdown',
    'DELETE Transaction'
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounting CRUD Test Suite</h1>
          <p className="text-gray-600">Comprehensive testing of all accounting API endpoints</p>
        </div>
        <Button 
          onClick={runAllTests} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </Button>
      </div>

      {/* Test Results Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testCases.map(testName => (
              <div key={testName} className="flex justify-between items-center p-3 border rounded-lg">
                <span className="font-medium">{testName}</span>
                {getStatusBadge(testResults[testName])}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(testResults).map(([testName, result]) => (
                <div key={testName} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{testName}</h3>
                    {getStatusBadge(result)}
                  </div>
                  
                  {result.success ? (
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-green-800 font-medium">✅ Success</p>
                      <pre className="text-xs text-green-700 mt-2 overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="bg-red-50 p-3 rounded">
                      <p className="text-red-800 font-medium">❌ Failed</p>
                      <pre className="text-xs text-red-700 mt-2 overflow-x-auto">
                        {JSON.stringify(result.error, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountingCRUDTest;
