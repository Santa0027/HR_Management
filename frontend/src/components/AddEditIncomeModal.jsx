// frontend/src/components/modals/AddEditIncomeModal.jsx
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, FormControl, InputLabel, Select, Checkbox, FormControlLabel, Box, Grid
} from '@mui/material';
import { format } from 'date-fns';

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
  drivers
}) => {
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>{selectedIncome ? 'Edit Income' : 'Add New Income'}</DialogTitle>
      <DialogContent dividers>
        <Box component="form" sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Transaction Data Fields */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Amount"
                name="transaction_data.amount"
                type="number"
                value={newIncome.transaction_data.amount}
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
                  name="transaction_data.category"
                  value={newIncome.transaction_data.category}
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
                name="transaction_data.description"
                value={newIncome.transaction_data.description}
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
                  name="transaction_data.payment_method"
                  value={newIncome.transaction_data.payment_method}
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
                  name="transaction_data.bank_account"
                  value={newIncome.transaction_data.bank_account}
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
                  name="transaction_data.company"
                  value={newIncome.transaction_data.company}
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
                  name="transaction_data.driver"
                  value={newIncome.transaction_data.driver}
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
                name="transaction_data.transaction_date"
                type="date"
                value={newIncome.transaction_data.transaction_date}
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
                  name="transaction_data.status"
                  value={newIncome.transaction_data.status}
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
              <TextField
                label="Income Source"
                name="income_source"
                value={newIncome.income_source}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
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

export default AddEditIncomeModal;