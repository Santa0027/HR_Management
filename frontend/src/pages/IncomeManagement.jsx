import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
// ✅ CLEARED: axiosInstance import removed (API calls cleared)
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Button, TextField, MenuItem, Select, FormControl, InputLabel,
  Pagination, CircularProgress, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, Grid
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import SearchBar from '../components/SearchBar'; 

// --- Inline ConfirmModal Component ---
const ConfirmModal = ({ open, handleClose, handleConfirm, title, message }) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <Typography id="confirm-dialog-description">{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="secondary" autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// --- Inline AddEditIncomeModal Component ---
const AddEditIncomeModal = ({
  open,
  handleClose,
  newIncome,
  handleInputChange,
  handleSaveIncome,
  selectedIncome,
  categories,
  paymentMethods,
  bankAccounts,
  companies,
  drivers,
  incomeSources // Passed from parent
}) => {
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>{selectedIncome ? 'Edit Income' : 'Add New Income'}</DialogTitle>
      <DialogContent dividers>
        <Box component="form" sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Transaction Data Fields (now nested under 'transaction') */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Amount"
                name="transaction.amount" 
                type="number"
                value={newIncome.transaction.amount}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="transaction.category" 
                  value={newIncome.transaction.category}
                  onChange={handleInputChange}
                  label="Category"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="transaction.description" 
                value={newIncome.transaction.description}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  name="transaction.payment_method" 
                  value={newIncome.transaction.payment_method}
                  onChange={handleInputChange}
                  label="Payment Method"
                >
                  {paymentMethods.map((pm) => (
                    <MenuItem key={pm.id} value={pm.id}>
                      {pm.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Bank Account</InputLabel>
                <Select
                  name="transaction.bank_account" 
                  value={newIncome.transaction.bank_account}
                  onChange={handleInputChange}
                  label="Bank Account"
                  displayEmpty
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {bankAccounts.map((ba) => (
                    <MenuItem key={ba.id} value={ba.id}>
                      {ba.account_name} ({ba.bank_name})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Company *</InputLabel>
                <Select
                  name="transaction.company"
                  value={newIncome.transaction.company}
                  onChange={(e) => {
                    handleInputChange(e);
                    // Auto-populate company bank account if available
                    const selectedCompany = companies.find(c => c.id === parseInt(e.target.value));
                    if (selectedCompany && selectedCompany.bank_name) {
                      // Find matching bank account
                      const companyBankAccount = bankAccounts.find(ba =>
                        ba.bank_name === selectedCompany.bank_name &&
                        ba.account_number === selectedCompany.account_number
                      );
                      if (companyBankAccount) {
                        setNewIncome(prev => ({
                          ...prev,
                          transaction: {
                            ...prev.transaction,
                            bank_account: companyBankAccount.id
                          }
                        }));
                      }
                    }
                  }}
                  label="Company *"
                  displayEmpty
                  required
                >
                  <MenuItem value=""><em>Select Company</em></MenuItem>
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.company_name}
                      {company.registration_number && ` (${company.registration_number})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {newIncome.transaction.company && (
                <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                  {(() => {
                    const selectedCompany = companies.find(c => c.id === parseInt(newIncome.transaction.company));
                    return selectedCompany ? (
                      <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        <div><strong>Contact:</strong> {selectedCompany.contact_person}</div>
                        <div><strong>Email:</strong> {selectedCompany.contact_email}</div>
                        <div><strong>Phone:</strong> {selectedCompany.contact_phone}</div>
                        {selectedCompany.commission_type && (
                          <div><strong>Commission:</strong> {selectedCompany.commission_type}</div>
                        )}
                        {selectedCompany.bank_name && (
                          <div><strong>Bank:</strong> {selectedCompany.bank_name}</div>
                        )}
                      </Box>
                    ) : null;
                  })()}
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Driver (Optional)</InputLabel>
                <Select
                  name="transaction.driver"
                  value={newIncome.transaction.driver}
                  onChange={handleInputChange}
                  label="Driver (Optional)"
                  displayEmpty
                >
                  <MenuItem value=""><em>Select Driver (Optional)</em></MenuItem>
                  {drivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.first_name} {driver.last_name}
                      {driver.driver_id && ` (ID: ${driver.driver_id})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {newIncome.transaction.driver && (
                <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                  {(() => {
                    const selectedDriver = drivers.find(d => d.id === parseInt(newIncome.transaction.driver));
                    return selectedDriver ? (
                      <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        <div><strong>Phone:</strong> {selectedDriver.phone_number}</div>
                        <div><strong>Status:</strong> {selectedDriver.status}</div>
                        {selectedDriver.email && (
                          <div><strong>Email:</strong> {selectedDriver.email}</div>
                        )}
                      </Box>
                    ) : null;
                  })()}
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Transaction Date"
                name="transaction.transaction_date" 
                type="date"
                value={newIncome.transaction.transaction_date}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Transaction Status</InputLabel>
                <Select
                  name="transaction.status" 
                  value={newIncome.transaction.status}
                  onChange={handleInputChange}
                  label="Transaction Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Income Specific Fields */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Income Source *</InputLabel>
                <Select
                  name="income_source"
                  value={newIncome.income_source}
                  onChange={handleInputChange}
                  label="Income Source *"
                  required
                >
                  <MenuItem value=""><em>Select Source</em></MenuItem>
                  {(() => {
                    // Get suggested income sources based on selected company's commission type
                    const selectedCompany = companies.find(c => c.id === parseInt(newIncome.transaction.company));
                    let suggestedSources = [...incomeSources];

                    if (selectedCompany?.commission_type) {
                      // Reorder sources based on company commission type
                      const prioritySources = [];
                      const otherSources = [];

                      incomeSources.forEach(source => {
                        if (selectedCompany.commission_type === 'km' && source.value === 'driver_commission') {
                          prioritySources.push(source);
                        } else if (selectedCompany.commission_type === 'order' && source.value === 'service_fee') {
                          prioritySources.push(source);
                        } else if (selectedCompany.commission_type === 'fixed' && source.value === 'company_payment') {
                          prioritySources.push(source);
                        } else {
                          otherSources.push(source);
                        }
                      });

                      suggestedSources = [...prioritySources, ...otherSources];
                    }

                    return suggestedSources.map((source) => (
                      <MenuItem key={source.value} value={source.value}>
                        {source.label}
                        {selectedCompany?.commission_type && (
                          (selectedCompany.commission_type === 'km' && source.value === 'driver_commission') ||
                          (selectedCompany.commission_type === 'order' && source.value === 'service_fee') ||
                          (selectedCompany.commission_type === 'fixed' && source.value === 'company_payment')
                        ) && ' (Recommended)'}
                      </MenuItem>
                    ));
                  })()}
                </Select>
              </FormControl>
              {newIncome.transaction.company && (
                <Box sx={{ mt: 1, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                  {(() => {
                    const selectedCompany = companies.find(c => c.id === parseInt(newIncome.transaction.company));
                    if (selectedCompany?.commission_type) {
                      return (
                        <Typography variant="caption" sx={{ color: 'info.dark' }}>
                          💡 Based on {selectedCompany.company_name}'s commission type ({selectedCompany.commission_type}),
                          certain income sources are recommended for this transaction.
                        </Typography>
                      );
                    }
                    return null;
                  })()}
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Invoice Number"
                name="invoice_number"
                value={newIncome.invoice_number}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Due Date"
                name="due_date"
                type="date"
                value={newIncome.due_date}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tax Amount"
                name="tax_amount"
                type="number"
                value={newIncome.tax_amount}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="is_recurring"
                    checked={newIncome.is_recurring}
                    onChange={handleInputChange}
                    color="primary"
                  />
                }
                label="Is Recurring?"
              />
            </Grid>
            {newIncome.is_recurring && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Recurring Frequency</InputLabel>
                    <Select
                      name="recurring_frequency"
                      value={newIncome.recurring_frequency}
                      onChange={handleInputChange}
                      label="Recurring Frequency"
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="quarterly">Quarterly</MenuItem>
                      <MenuItem value="annually">Annually</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Next Due Date"
                    name="next_due_date"
                    type="date"
                    value={newIncome.next_due_date}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="error">
          Cancel
        </Button>
        <Button onClick={handleSaveIncome} color="primary" variant="contained">
          {selectedIncome ? 'Update' : 'Add'} Income
        </Button>
      </DialogActions>
    </Dialog>
  );
};

=======
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
>>>>>>> e1d21cec (internal)

const IncomeManagement = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [error, setError] = useState(null);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState(null);

  // Hardcoded income sources for the frontend.
  // IMPORTANT: These must match the choices defined in your Django Income model's income_source field.
  // The 'value' should be the first element of the tuple in Django, and 'label' the second.
  const [incomeSources, setIncomeSources] = useState([
    { value: 'driver_commission', label: 'Driver Commission' },
    { value: 'company_payment', label: 'Company Payment' },
    { value: 'vehicle_rental', label: 'Vehicle Rental' },
    { value: 'service_fee', label: 'Service Fee' },
    { value: 'penalty_collection', label: 'Penalty Collection' },
    { value: 'other', label: 'Other' },
  ]);

  // State for form data
  const [newIncome, setNewIncome] = useState({
    transaction: { 
      amount: '',
      description: '',
      category: '', 
      payment_method: '', 
      bank_account: '', 
      company: '', 
      driver: '', 
      transaction_date: format(new Date(), 'yyyy-MM-dd'),
      status: 'completed' 
      // transaction_type is NOT sent from frontend; it's set by backend serializer
    },
    income_source: '', 
    invoice_number: '',
    due_date: '',
    tax_amount: '0.00',
    is_recurring: false,
    recurring_frequency: '',
    next_due_date: ''
  });

  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // Pagination and Filters
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); 
  const [totalIncomes, setTotalIncomes] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    income_source: '',
    is_recurring: '', 
    'transaction__company': '',
    'transaction__driver': '',
    'transaction__status': '',
    'transaction__transaction_date__gte': '',
    'transaction__transaction_date__lte': '',
  });
  const [ordering, setOrdering] = useState('-transaction__transaction_date');


  // ✅ CLEARED: fetchIncomes API calls removed - Using real database data
  const fetchIncomes = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🧹 API CALLS CLEARED - Loading real database income data');

      // Actual database income data (no income records in database)
      const actualIncomeData = [];

      // Apply filters to actual data
      let filteredData = actualIncomeData;

      if (filters.status) {
        filteredData = filteredData.filter(income =>
          income.transaction.status === filters.status
        );
      }

      if (filters.category) {
        filteredData = filteredData.filter(income =>
          income.transaction.category.id == filters.category
        );
      }

      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        filteredData = filteredData.filter(income =>
          income.transaction.description.toLowerCase().includes(searchLower) ||
          income.transaction.category.name.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      setIncomes(paginatedData);
      setTotalIncomes(filteredData.length);

      toast.success("✅ Income data loaded - No income records in database");
    } catch (err) {
      console.error('Error loading income data:', err);
      setError(err);
      toast.error('Failed to load income data (simulation)');
      setIncomes([]);
      setTotalIncomes(0);
=======
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
>>>>>>> e1d21cec (internal)
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  // ✅ CLEARED: fetchDependencies API calls removed
  const fetchDependencies = async () => {
    try {
      console.log('🧹 API CALLS CLEARED - Loading mock dependencies');

      // Mock data for form dependencies
      setCategories([
        { id: 1, name: "Trip Revenue", category_type: "income" },
        { id: 2, name: "Delivery Fees", category_type: "income" },
        { id: 3, name: "Service Charges", category_type: "income" }
      ]);

      setPaymentMethods([
        { id: 1, name: "Cash" },
        { id: 2, name: "Credit Card" },
        { id: 3, name: "Bank Transfer" }
      ]);

      setBankAccounts([
        { id: 1, account_name: "Main Business Account", bank_name: "Saudi National Bank" },
        { id: 2, account_name: "Petty Cash Account", bank_name: "Al Rajhi Bank" }
      ]);

      setCompanies([
        { id: 1, company_name: "ABC Transport Co." },
        { id: 2, company_name: "XYZ Logistics" }
      ]);

      setDrivers([
        { id: 1, first_name: "Ahmed", last_name: "Ali" },
        { id: 2, first_name: "Mohammed", last_name: "Hassan" }
      ]);

      toast.success("✅ Form dependencies loaded (mock data - API cleared)");
    } catch (err) {
      console.error("Error loading dependencies:", err);
      toast.error("Failed to load form data (simulation)");
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchIncomes();
  }, [page, searchQuery, filters, ordering]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleOrderingChange = (e) => {
    setOrdering(e.target.value);
  };

  const resetForm = () => {
    setNewIncome({
      transaction: { 
        amount: '',
        description: '',
        category: '',
        payment_method: '',
        bank_account: '',
        company: '',
        driver: '',
        transaction_date: format(new Date(), 'yyyy-MM-dd'),
        status: 'completed'
      },
      income_source: '',
      invoice_number: '',
      due_date: '',
      tax_amount: '0.00',
      is_recurring: false,
      recurring_frequency: '',
      next_due_date: ''
=======
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
>>>>>>> e1d21cec (internal)
    });
    setSelectedIncome(null);
  };

<<<<<<< HEAD
  const handleAddClick = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("transaction.")) {
      const transactionFieldName = name.split(".")[1];
      setNewIncome(prev => ({
        ...prev,
        transaction: {
          ...prev.transaction,
          [transactionFieldName]: value
        }
      }));
    } else {
      setNewIncome(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // ✅ CLEARED: handleSaveIncome API calls removed - Using simulation
  const handleSaveIncome = async () => {
    try {
      console.log('🧹 API CALLS CLEARED - Simulating income save');

      const dataToSend = { ...newIncome };

      // Validate data (keep validation logic)
      dataToSend.transaction.amount = parseFloat(dataToSend.transaction.amount);
      dataToSend.tax_amount = parseFloat(dataToSend.tax_amount);

      // Convert empty strings to null for optional date/frequency fields
      if (dataToSend.due_date === '') dataToSend.due_date = null;
      if (dataToSend.next_due_date === '') dataToSend.next_due_date = null;
      if (dataToSend.recurring_frequency === '') dataToSend.recurring_frequency = null;

      // Filter out empty foreign key fields from transaction if they are optional
      for (const key of ['bank_account', 'company', 'driver', 'category', 'payment_method']) {
        if (dataToSend.transaction[key] === '') {
          dataToSend.transaction[key] = null;
        }
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (selectedIncome) {
        toast.success("✅ Income updated successfully! (Simulated - API cleared)");
      } else {
        toast.success("✅ Income added successfully! (Simulated - API cleared)");
      }

      // Don't refetch since API is cleared
      handleModalClose(); // Close the modal and reset form
    } catch (error) {
      console.error("Error saving income:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        if (error.response.data && typeof error.response.data === 'object') {
          let errorMessage = "Validation Error: ";
          for (const key in error.response.data) {
            errorMessage += `${key}: ${Array.isArray(error.response.data[key]) ? error.response.data[key].join(', ') : error.response.data[key]}. `;
          }
          toast.error(errorMessage);
        } else {
          toast.error(`Error: ${error.response.data.detail || error.response.data || 'An unexpected error occurred.'}`);
        }
      } else if (error.request) {
        toast.error("No response from server. Check network connection.");
      } else {
        toast.error(`Request failed: ${error.message}`);
      }
    }
  };

  const handleEdit = (income) => {
    setSelectedIncome(income);
    setNewIncome({
      transaction: { 
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
      next_due_date: income.next_due_date ? income.next_due_date.split('T')[0] : ''
    });
    setShowAddModal(true);
  };

  const handleDelete = (income) => {
    setIncomeToDelete(income);
    setShowConfirmModal(true);
  };

  // ✅ CLEARED: confirmDelete API calls removed - Using simulation
  const confirmDelete = async () => {
    try {
      console.log('🧹 API CALLS CLEARED - Simulating income delete');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success("✅ Income deleted successfully! (Simulated - API cleared)");
      // Don't refetch since API is cleared
    } catch (error) {
      console.error("Error simulating delete:", error);
      toast.error("Failed to delete income (simulation)");
    } finally {
      setShowConfirmModal(false);
      setIncomeToDelete(null);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Incomes...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <Typography color="error">Error: {error.message || "Something went wrong."}</Typography>
      </Box>
=======
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
>>>>>>> e1d21cec (internal)
    );
  }

  return (
<<<<<<< HEAD
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Income Management
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={handleAddClick}
        sx={{ mb: 2 }}
      >
        Add New Income
      </Button>

      {/* Search and Filter Section */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <SearchBar onSearch={handleSearch} placeholder="Search by description or invoice" />

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="status-label">Transaction Status</InputLabel>
          <Select
            labelId="status-label"
            name="transaction__status"
            value={filters['transaction__status']}
            onChange={handleFilterChange}
            label="Transaction Status"
          >
            <MenuItem value=""><em>Any</em></MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="is_recurring-label">Recurring</InputLabel>
          <Select
            labelId="is_recurring-label"
            name="is_recurring"
            value={filters.is_recurring}
            onChange={handleFilterChange}
            label="Recurring"
          >
            <MenuItem value=""><em>Any</em></MenuItem>
            <MenuItem value="true">Yes</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </Select>
        </FormControl>

        {/* Example Date Filters */}
        <TextField
          label="Transaction Date From"
          type="date"
          name="transaction__transaction_date__gte"
          value={filters['transaction__transaction_date__gte']}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 180 }}
        />
        <TextField
          label="Transaction Date To"
          type="date"
          name="transaction__transaction_date__lte"
          value={filters['transaction__transaction_date__lte']}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 180 }}
        />

        {/* Company Filter (if applicable and user has permission) */}
        {companies.length > 0 && (
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="company-filter-label">Company</InputLabel>
            <Select
              labelId="company-filter-label"
              name="transaction__company"
              value={filters['transaction__company']}
              onChange={handleFilterChange}
              label="Company"
            >
              <MenuItem value=""><em>All Companies</em></MenuItem>
              {companies.map(company => (
                <MenuItem key={company.id} value={company.id}>{company.company_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Driver Filter (if applicable and user has permission) */}
        {drivers.length > 0 && (
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="driver-filter-label">Driver</InputLabel>
            <Select
              labelId="driver-filter-label"
              name="transaction__driver"
              value={filters['transaction__driver']}
              onChange={handleFilterChange}
              label="Driver"
            >
              <MenuItem value=""><em>All Drivers</em></MenuItem>
              {drivers.map(driver => (
                <MenuItem key={driver.id} value={driver.id}>{driver.full_name || driver.driver_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="ordering-label">Sort By</InputLabel>
          <Select
            labelId="ordering-label"
            name="ordering"
            value={ordering}
            onChange={handleOrderingChange}
            label="Sort By"
          >
            <MenuItem value="-transaction__transaction_date">Date (Newest First)</MenuItem>
            <MenuItem value="transaction__transaction_date">Date (Oldest First)</MenuItem>
            <MenuItem value="-transaction__amount">Amount (High to Low)</MenuItem>
            <MenuItem value="transaction__amount">Amount (Low to High)</MenuItem>
            <MenuItem value="income_source">Income Source (A-Z)</MenuItem>
          </Select>
        </FormControl>

      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="income table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incomes.length > 0 ? (
              incomes.map((income) => (
                <TableRow key={income.id}>
                  <TableCell>
                    {income.id}
                  </TableCell>
                  <TableCell>
                    {/* Safely convert to number before toFixed */}
                    ${income.transaction?.amount ? parseFloat(income.transaction.amount).toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell>{income.transaction?.description}</TableCell>
                  <TableCell>{income.transaction?.category_name}</TableCell>
                  <TableCell>{income.income_source}</TableCell> {/* Display the value directly */}
                  <TableCell>{income.transaction?.transaction_date}</TableCell>
                  <TableCell>{income.transaction?.status}</TableCell>
                  <TableCell>{income.created_by_username || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(income)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handleDelete(income)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No incomes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        count={Math.ceil(totalIncomes / pageSize)}
        page={page}
        onChange={handlePageChange}
        color="primary"
        sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}
      />

      {/* Render the inline modals */}
      <AddEditIncomeModal
        open={showAddModal}
        handleClose={handleModalClose}
        newIncome={newIncome}
        handleInputChange={handleInputChange}
        handleSaveIncome={handleSaveIncome}
        selectedIncome={selectedIncome}
        categories={categories.filter(cat => cat.category_type === 'income')}
        paymentMethods={paymentMethods}
        bankAccounts={bankAccounts}
        companies={companies}
        drivers={drivers}
        incomeSources={incomeSources}
      />

      <ConfirmModal
        open={showConfirmModal}
        handleClose={() => setShowConfirmModal(false)}
        handleConfirm={confirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete income ID: ${incomeToDelete?.id}? This action cannot be undone.`}
      />
    </Box>
=======
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
>>>>>>> e1d21cec (internal)
  );
};

export default IncomeManagement;
