import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
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
              <FormControl fullWidth margin="normal">
                <InputLabel>Company</InputLabel>
                <Select
                  name="transaction.company" 
                  value={newIncome.transaction.company}
                  onChange={handleInputChange}
                  label="Company"
                  displayEmpty
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.company_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Driver</InputLabel>
                <Select
                  name="transaction.driver" 
                  value={newIncome.transaction.driver}
                  onChange={handleInputChange}
                  label="Driver"
                  displayEmpty
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {drivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.full_name || driver.driver_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                <InputLabel>Income Source</InputLabel>
                <Select
                  name="income_source"
                  value={newIncome.income_source}
                  onChange={handleInputChange}
                  label="Income Source"
                  required
                >
                  <MenuItem value=""><em>Select Source</em></MenuItem>
                  {incomeSources.map((source) => (
                    <MenuItem key={source.value} value={source.value}> {/* Use source.value for the actual value */}
                      {source.label} {/* Use source.label for display */}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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


const IncomeManagement = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
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


  // Function to fetch data
  const fetchIncomes = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        page_size: pageSize,
        search: searchQuery,
        ordering,
        ...filters,
      };

      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await axiosInstance.get('/accounting/income/', { params });
      // --- DEBUGGING: Log the response data from GET request ---
      console.log("Response data from GET /accounting/income/:", response.data);
      // ---------------------------------------------------------
      
      // Check if response.data is an array (direct list) or an object with 'results' (paginated)
      if (Array.isArray(response.data)) {
        setIncomes(response.data);
        setTotalIncomes(response.data.length); // If no pagination, total is array length
      } else if (response.data && response.data.results) {
        setIncomes(response.data.results);
        setTotalIncomes(response.data.count);
      } else {
        // Fallback for unexpected structure
        setIncomes([]);
        setTotalIncomes(0);
        console.warn("Unexpected response data structure from /accounting/income/:", response.data);
      }

    } catch (err) {
      console.error("Failed to fetch incomes:", err);
      setError(err);
      toast.error("Failed to load incomes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [
        categoriesRes,
        paymentMethodsRes,
        bankAccountsRes,
        companiesRes,
        driversRes
      ] = await Promise.all([
        axiosInstance.get('/accounting/categories/'),
        axiosInstance.get('/accounting/payment-methods/'), 
        axiosInstance.get('/accounting/bank-accounts/'), 
        axiosInstance.get('/companies/'), 
        axiosInstance.get('/Register/drivers/') 
      ]);
      setCategories(categoriesRes.data.results || categoriesRes.data);
      setPaymentMethods(paymentMethodsRes.data.results || paymentMethodsRes.data);
      setBankAccounts(bankAccountsRes.data.results || bankAccountsRes.data);
      setCompanies(companiesRes.data.results || companiesRes.data);
      setDrivers(driversRes.data.results || driversRes.data);

    } catch (err) {
      console.error("Failed to fetch dependencies:", err);
      toast.error("Failed to load form data. Some fields might be missing.");
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
    });
    setSelectedIncome(null);
  };

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

  const handleSaveIncome = async () => {
    try {
      const dataToSend = { ...newIncome };

      // --- DEBUGGING: Log the payload being sent ---
      console.log("Payload being sent to backend:", dataToSend);
      // ---------------------------------------------

      // Ensure numbers are parsed correctly
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

      let response;
      if (selectedIncome) {
        response = await axiosInstance.put(`/accounting/income/${selectedIncome.id}/`, dataToSend);
        toast.success("Income updated successfully!");
      } else {
        const { created_by, ...finalDataToSend } = dataToSend; 
        response = await axiosInstance.post('/accounting/income/', finalDataToSend);
        toast.success("Income added successfully!");
      }

      fetchIncomes(); // Refresh the list
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

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/accounting/income/${incomeToDelete.id}/`);
      toast.success("Income deleted successfully!");
      fetchIncomes();
    } catch (error) {
      console.error("Error deleting income:", error);
      toast.error("Failed to delete income. Please try again.");
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
    );
  }

  return (
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
  );
};

export default IncomeManagement;
