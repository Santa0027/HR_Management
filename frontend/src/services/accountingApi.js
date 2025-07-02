import api from './api';

// Accounting Categories
export const accountingCategoriesApi = {
  getAll: (params = {}) => api.get('/accounting/categories/', { params }),
  getById: (id) => api.get(`/accounting/categories/${id}/`),
  create: (data) => api.post('/accounting/categories/', data),
  update: (id, data) => api.put(`/accounting/categories/${id}/`, data),
  delete: (id) => api.delete(`/accounting/categories/${id}/`),
};

// Payment Methods
export const paymentMethodsApi = {
  getAll: (params = {}) => api.get('/accounting/payment-methods/', { params }),
  getById: (id) => api.get(`/accounting/payment-methods/${id}/`),
  create: (data) => api.post('/accounting/payment-methods/', data),
  update: (id, data) => api.put(`/accounting/payment-methods/${id}/`, data),
  delete: (id) => api.delete(`/accounting/payment-methods/${id}/`),
};

// Bank Accounts
export const bankAccountsApi = {
  getAll: (params = {}) => api.get('/accounting/bank-accounts/', { params }),
  getById: (id) => api.get(`/accounting/bank-accounts/${id}/`),
  create: (data) => api.post('/accounting/bank-accounts/', data),
  update: (id, data) => api.put(`/accounting/bank-accounts/${id}/`, data),
  delete: (id) => api.delete(`/accounting/bank-accounts/${id}/`),
  updateBalance: (id, balance) => api.post(`/accounting/bank-accounts/${id}/update_balance/`, { balance }),
};

// Transactions
export const transactionsApi = {
  getAll: (params = {}) => api.get('/accounting/transactions/', { params }),
  getById: (id) => api.get(`/accounting/transactions/${id}/`),
  create: (data) => api.post('/accounting/transactions/', data),
  update: (id, data) => api.put(`/accounting/transactions/${id}/`, data),
  delete: (id) => api.delete(`/accounting/transactions/${id}/`),
  getSummary: (params = {}) => api.get('/accounting/transactions/summary/', { params }),
  getCategoryBreakdown: (params = {}) => api.get('/accounting/transactions/category_breakdown/', { params }),
  export: (params = {}) => api.get('/accounting/transactions/export/', { params, responseType: 'blob' }),
};

// Income
export const incomeApi = {
  getAll: (params = {}) => api.get('/accounting/income/', { params }),
  getById: (id) => api.get(`/accounting/income/${id}/`),
  create: (data) => api.post('/accounting/income/', data),
  update: (id, data) => api.put(`/accounting/income/${id}/`, data),
  delete: (id) => api.delete(`/accounting/income/${id}/`),
};

// Expenses
export const expensesApi = {
  getAll: (params = {}) => api.get('/accounting/expenses/', { params }),
  getById: (id) => api.get(`/accounting/expenses/${id}/`),
  create: (data) => api.post('/accounting/expenses/', data),
  update: (id, data) => api.put(`/accounting/expenses/${id}/`, data),
  delete: (id) => api.delete(`/accounting/expenses/${id}/`),
  approve: (id) => api.post(`/accounting/expenses/${id}/approve/`),
  reject: (id) => api.post(`/accounting/expenses/${id}/reject/`),
};

// Driver Payroll
export const payrollApi = {
  getAll: (params = {}) => api.get('/accounting/payroll/', { params }),
  getById: (id) => api.get(`/accounting/payroll/${id}/`),
  create: (data) => api.post('/accounting/payroll/', data),
  update: (id, data) => api.put(`/accounting/payroll/${id}/`, data),
  delete: (id) => api.delete(`/accounting/payroll/${id}/`),
  processPayment: (id) => api.post(`/accounting/payroll/${id}/process_payment/`),
  getSummary: (params = {}) => api.get('/accounting/payroll/summary/', { params }),
};

// Budgets
export const budgetsApi = {
  getAll: (params = {}) => api.get('/accounting/budgets/', { params }),
  getById: (id) => api.get(`/accounting/budgets/${id}/`),
  create: (data) => api.post('/accounting/budgets/', data),
  update: (id, data) => api.put(`/accounting/budgets/${id}/`, data),
  delete: (id) => api.delete(`/accounting/budgets/${id}/`),
  calculateActuals: (id) => api.post(`/accounting/budgets/${id}/calculate_actuals/`),
  getVarianceReport: (params = {}) => api.get('/accounting/budgets/variance_report/', { params }),
};

// Financial Reports
export const reportsApi = {
  getAll: (params = {}) => api.get('/accounting/reports/', { params }),
  getById: (id) => api.get(`/accounting/reports/${id}/`),
  create: (data) => api.post('/accounting/reports/', data),
  update: (id, data) => api.put(`/accounting/reports/${id}/`, data),
  delete: (id) => api.delete(`/accounting/reports/${id}/`),
  generateIncomeStatement: (data) => api.post('/accounting/reports/generate_income_statement/', data),
};

// Recurring Transactions
export const recurringTransactionsApi = {
  getAll: (params = {}) => api.get('/accounting/recurring/', { params }),
  getById: (id) => api.get(`/accounting/recurring/${id}/`),
  create: (data) => api.post('/accounting/recurring/', data),
  update: (id, data) => api.put(`/accounting/recurring/${id}/`, data),
  delete: (id) => api.delete(`/accounting/recurring/${id}/`),
  executeNow: (id) => api.post(`/accounting/recurring/${id}/execute_now/`),
  getDueToday: () => api.get('/accounting/recurring/due_today/'),
  executeDue: () => api.post('/accounting/recurring/execute_due/'),
};

// Helper function to handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    console.error(`API Error ${status}:`, data);
    
    if (status === 400) {
      return { error: 'Bad request. Please check your input.' };
    } else if (status === 401) {
      return { error: 'Unauthorized. Please login again.' };
    } else if (status === 403) {
      return { error: 'Forbidden. You do not have permission.' };
    } else if (status === 404) {
      return { error: 'Resource not found.' };
    } else if (status === 500) {
      return { error: 'Server error. Please try again later.' };
    }
    
    return { error: data.detail || data.message || 'An error occurred.' };
  } else if (error.request) {
    // Network error
    console.error('Network Error:', error.request);
    return { error: 'Network error. Please check your connection.' };
  } else {
    // Other error
    console.error('Error:', error.message);
    return { error: error.message || 'An unexpected error occurred.' };
  }
};

export default {
  categories: accountingCategoriesApi,
  paymentMethods: paymentMethodsApi,
  bankAccounts: bankAccountsApi,
  transactions: transactionsApi,
  income: incomeApi,
  expenses: expensesApi,
  payroll: payrollApi,
  budgets: budgetsApi,
  reports: reportsApi,
  recurring: recurringTransactionsApi,
  handleApiError,
};
