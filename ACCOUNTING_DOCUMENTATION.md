# Accounting Section Documentation
## HR Management System - Kuwait Driver Supply Platform

### Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Models](#database-models)
4. [API Endpoints](#api-endpoints)
5. [Frontend Components](#frontend-components)
6. [User Roles & Permissions](#user-roles--permissions)
7. [Features](#features)
8. [Usage Guide](#usage-guide)
9. [Configuration](#configuration)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Accounting Section is a comprehensive financial management module designed for transportation and logistics companies in Kuwait. It handles income tracking, expense management, transaction processing, and financial reporting for driver supply platforms like Swiggy and Talabat.

### Key Capabilities
- **Income Management**: Track driver commissions, company payments, vehicle rentals
- **Expense Management**: Monitor driver salaries, vehicle maintenance, fuel costs, office expenses
- **Transaction Processing**: Handle payments, approvals, and financial workflows
- **Financial Reporting**: Generate summaries, budgets, and analytics
- **Multi-Role Access**: Support for Admin, HR, Accountant, and Management roles

---

## Architecture

### Backend Structure
```
backend/accounting/
├── models.py          # Database models
├── serializers.py     # API serializers
├── views.py          # API views and business logic
├── urls.py           # URL routing
├── admin.py          # Django admin interface
├── permissions.py    # Custom permissions
└── migrations/       # Database migrations
```

### Frontend Structure
```
frontend/src/pages/
├── AccountingDashboard.jsx    # Main dashboard
├── IncomeManagement.jsx       # Income CRUD operations
├── ExpenseManagement.jsx      # Expense CRUD operations
└── TransactionManagement.jsx  # Transaction overview
```

---

## Database Models

### 1. AccountingCategory
Organizes income and expenses into categories.

**Fields:**
- `name`: Category name (unique)
- `description`: Optional description
- `category_type`: 'income' or 'expense'
- `is_active`: Boolean flag
- `created_at`, `updated_at`: Timestamps

**Example Categories:**
- **Income**: Driver Commission, Company Payment, Vehicle Rental, Service Fee
- **Expense**: Driver Salary, Vehicle Maintenance, Fuel, Office Rent

### 2. PaymentMethod
Defines available payment methods.

**Fields:**
- `name`: Method name (Cash, Bank Transfer, Credit Card, etc.)
- `description`: Optional description
- `is_active`: Boolean flag
- `created_at`: Timestamp

### 3. BankAccount
Company bank accounts for transaction tracking.

**Fields:**
- `account_name`: Account identifier
- `bank_name`: Bank name
- `account_number`: Account number
- `routing_number`: Bank routing number
- `account_type`: 'checking', 'savings', 'business'
- `current_balance`: Current balance
- `is_active`: Boolean flag

### 4. Transaction
Base model for all financial transactions.

**Fields:**
- `transaction_id`: Unique identifier (auto-generated)
- `transaction_type`: 'income' or 'expense'
- `amount`: Decimal amount
- `currency`: Currency code (default: USD)
- `description`: Transaction description
- `transaction_date`: Date of transaction
- `status`: 'pending', 'completed', 'cancelled', 'failed'
- `category`: Foreign key to AccountingCategory
- `payment_method`: Foreign key to PaymentMethod
- `bank_account`: Optional foreign key to BankAccount
- `company`: Optional foreign key to Company
- `driver`: Optional foreign key to Driver
- `reference_number`: Optional reference
- `notes`: Optional notes
- `receipt_document`: Optional file upload
- `created_by`, `approved_by`: User references
- `created_at`, `updated_at`: Timestamps

### 5. Income
Extends Transaction for income-specific fields.

**Fields:**
- `transaction`: One-to-one with Transaction
- `income_source`: Source type
- `invoice_number`: Optional invoice reference
- `due_date`: Payment due date
- `tax_amount`: Tax amount
- `is_recurring`: Boolean for recurring income
- `recurring_frequency`: Frequency if recurring
- `next_due_date`: Next payment date
- `created_by`: User reference
- `created_at`, `updated_at`: Timestamps

### 6. Expense
Extends Transaction for expense-specific fields.

**Fields:**
- `transaction`: One-to-one with Transaction
- `expense_type`: Type of expense
- `vendor_name`: Vendor/supplier name
- `bill_number`: Bill/invoice number
- `due_date`: Payment due date
- `tax_amount`: Tax amount
- `is_recurring`: Boolean for recurring expenses
- `recurring_frequency`: Frequency if recurring
- `next_due_date`: Next payment date
- `requires_approval`: Boolean for approval workflow
- `approval_status`: 'pending', 'approved', 'rejected'
- `approved_at`: Approval timestamp
- `created_by`: User reference
- `created_at`, `updated_at`: Timestamps

---

## API Endpoints

### Base URL: `/accounting/`

#### Categories
- `GET /categories/` - List all categories
- `POST /categories/` - Create new category
- `GET /categories/{id}/` - Get specific category
- `PUT /categories/{id}/` - Update category
- `DELETE /categories/{id}/` - Delete category
- `GET /categories/?category_type=income` - Filter by type

#### Payment Methods
- `GET /payment-methods/` - List all payment methods
- `POST /payment-methods/` - Create new payment method
- `GET /payment-methods/{id}/` - Get specific method
- `PUT /payment-methods/{id}/` - Update method
- `DELETE /payment-methods/{id}/` - Delete method

#### Bank Accounts
- `GET /bank-accounts/` - List all bank accounts
- `POST /bank-accounts/` - Create new account
- `GET /bank-accounts/{id}/` - Get specific account
- `PUT /bank-accounts/{id}/` - Update account
- `DELETE /bank-accounts/{id}/` - Delete account
- `POST /bank-accounts/{id}/update_balance/` - Update balance

#### Transactions
- `GET /transactions/` - List all transactions
- `POST /transactions/` - Create new transaction
- `GET /transactions/{id}/` - Get specific transaction
- `PUT /transactions/{id}/` - Update transaction
- `DELETE /transactions/{id}/` - Delete transaction
- `GET /transactions/summary/` - Get financial summary

#### Income
- `GET /incomes/` - List all income records
- `POST /incomes/` - Create new income
- `GET /incomes/{id}/` - Get specific income
- `PUT /incomes/{id}/` - Update income
- `DELETE /incomes/{id}/` - Delete income

#### Expenses
- `GET /expenses/` - List all expense records
- `POST /expenses/` - Create new expense
- `GET /expenses/{id}/` - Get specific expense
- `PUT /expenses/{id}/` - Update expense
- `DELETE /expenses/{id}/` - Delete expense
- `POST /expenses/{id}/approve/` - Approve expense
- `POST /expenses/{id}/reject/` - Reject expense

### Query Parameters
- `?category_type=income|expense` - Filter by category type
- `?status=pending|completed|cancelled` - Filter by status
- `?company={id}` - Filter by company
- `?driver={id}` - Filter by driver
- `?start_date=YYYY-MM-DD` - Date range start
- `?end_date=YYYY-MM-DD` - Date range end
- `?search=term` - Search in descriptions
- `?ordering=-created_at` - Sort results

---

## Frontend Components

### 1. AccountingDashboard.jsx
Main dashboard showing financial overview.

**Features:**
- Total income/expense summaries
- Monthly financial trends
- Pending transactions count
- Quick action buttons
- Financial charts and graphs

### 2. IncomeManagement.jsx
Complete income management interface.

**Features:**
- Income list with filtering/sorting
- Add/Edit income modal
- Bulk operations
- Export functionality
- Recurring income setup

### 3. ExpenseManagement.jsx
Complete expense management interface.

**Features:**
- Expense list with filtering/sorting
- Add/Edit expense modal
- Approval workflow buttons
- Receipt upload
- Recurring expense setup
- Vendor management

### 4. TransactionManagement.jsx
Transaction overview and management.

**Features:**
- All transactions in one view
- Advanced filtering options
- Transaction status updates
- Bulk operations
- Export/reporting tools

---

## User Roles & Permissions

### Admin
- Full access to all accounting features
- Can manage categories, payment methods, bank accounts
- Can approve/reject expenses
- Can view all financial data
- Can generate reports

### Accountant
- Full access to income/expense management
- Can approve/reject expenses
- Can manage transactions
- Can generate financial reports
- Cannot modify system settings

### HR
- Can view driver-related income/expenses
- Can create expense records for HR activities
- Limited approval permissions
- Can view financial summaries

### Management
- Can view financial dashboards and reports
- Can approve high-value expenses
- Read-only access to most data
- Can export reports

### Driver (Limited)
- Can view own income records
- Can view own expense reimbursements
- Cannot create or modify financial records

---

## Features

### 1. Income Tracking
- **Driver Commissions**: Track earnings from delivery services
- **Company Payments**: Record payments from partner companies
- **Vehicle Rentals**: Monitor rental income
- **Service Fees**: Track additional service charges
- **Recurring Income**: Automate regular income entries

### 2. Expense Management
- **Driver Salaries**: Manage payroll expenses
- **Vehicle Maintenance**: Track maintenance costs
- **Fuel Expenses**: Monitor fuel consumption costs
- **Office Operations**: Track rent, utilities, phone bills
- **Approval Workflow**: Multi-level expense approval
- **Receipt Management**: Upload and store receipts

### 3. Financial Reporting
- **Summary Reports**: Income vs expense summaries
- **Category Breakdown**: Spending by category
- **Monthly Trends**: Financial performance over time
- **Company-wise Reports**: Performance by partner company
- **Driver-wise Reports**: Individual driver financials

### 4. Transaction Processing
- **Multiple Payment Methods**: Cash, bank transfer, cards
- **Bank Account Integration**: Track multiple accounts
- **Status Tracking**: Monitor transaction lifecycle
- **Reference Numbers**: Link to external systems
- **Audit Trail**: Complete transaction history

---

## Usage Guide

### Getting Started

1. **Setup Categories**
   ```
   Navigate to: Accounting > Categories
   - Create income categories (Driver Commission, Company Payment)
   - Create expense categories (Driver Salary, Fuel, Maintenance)
   ```

2. **Configure Payment Methods**
   ```
   Navigate to: Accounting > Payment Methods
   - Add: Cash, Bank Transfer, Credit Card, Digital Wallet
   ```

3. **Add Bank Accounts**
   ```
   Navigate to: Accounting > Bank Accounts
   - Add company bank accounts
   - Set initial balances
   ```

### Daily Operations

#### Recording Income
1. Go to **Income Management**
2. Click **"Add Income"**
3. Fill required fields:
   - Amount
   - Description
   - Category (e.g., Driver Commission)
   - Payment Method
   - Company/Driver (if applicable)
4. Set recurring if needed
5. Save

#### Recording Expenses
1. Go to **Expense Management**
2. Click **"Add Expense"**
3. Fill required fields:
   - Amount
   - Description
   - Category (e.g., Fuel)
   - Vendor Name
   - Payment Method
4. Upload receipt if available
5. Set approval requirement if needed
6. Save

#### Expense Approval
1. Go to **Expense Management**
2. Filter by "Pending Approval"
3. Review expense details
4. Click **Approve** or **Reject**
5. Add approval notes if needed

### Monthly Tasks

1. **Generate Reports**
   - Review monthly income/expense summary
   - Check category-wise spending
   - Analyze trends and patterns

2. **Reconcile Accounts**
   - Update bank account balances
   - Verify transaction records
   - Resolve discrepancies

3. **Process Recurring Items**
   - Review recurring income/expenses
   - Update amounts if needed
   - Generate next period entries

---

## Configuration

### Environment Variables
```bash
# Database Configuration
DATABASE_NAME=hr_management_db
DATABASE_USER=admin
DATABASE_PASSWORD=admin@vellore
DATABASE_HOST=localhost
DATABASE_PORT=5432

# API Configuration
API_BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5174

# File Upload
MEDIA_ROOT=/path/to/media
MEDIA_URL=/media/
```

### Django Settings
```python
# settings.py
INSTALLED_APPS = [
    # ... other apps
    'accounting',
    'rest_framework',
    'corsheaders',
    'django_filters',
]

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}
```

### Frontend Configuration
```javascript
// src/api/axiosInstance.js
const API_BASE_URL = 'http://localhost:8000';

// Authentication headers
headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
}
```

---

## Troubleshooting

### Common Issues

#### 1. Authentication Errors
**Problem**: "Authentication credentials were not provided"
**Solution**: 
- Ensure JWT token is included in requests
- Check token expiration
- Verify user permissions

#### 2. Permission Denied
**Problem**: User cannot access certain features
**Solution**:
- Check user role assignments
- Verify permission settings
- Update user permissions in admin

#### 3. Transaction Creation Fails
**Problem**: Error creating income/expense records
**Solution**:
- Verify all required fields are provided
- Check foreign key relationships (category, payment method)
- Ensure decimal amounts are properly formatted

#### 4. File Upload Issues
**Problem**: Receipt uploads fail
**Solution**:
- Check file size limits
- Verify MEDIA_ROOT configuration
- Ensure proper file permissions

### API Testing
```bash
# Test expense creation
curl -X POST http://localhost:8000/accounting/expenses/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "transaction_data": {
      "amount": "100.00",
      "description": "Test expense",
      "category": 5,
      "payment_method": 1,
      "transaction_date": "2025-07-04"
    },
    "expense_type": "fuel",
    "vendor_name": "Test Vendor"
  }'
```

### Database Queries
```sql
-- Check transaction summary
SELECT 
    category__name,
    SUM(amount) as total_amount,
    COUNT(*) as transaction_count
FROM accounting_transaction 
WHERE transaction_type = 'expense'
GROUP BY category__name;

-- Find pending approvals
SELECT * FROM accounting_expense 
WHERE requires_approval = true 
AND approval_status = 'pending';
```

---

## Support & Maintenance

### Regular Maintenance
- **Daily**: Monitor transaction processing
- **Weekly**: Review pending approvals
- **Monthly**: Generate financial reports
- **Quarterly**: Database cleanup and optimization

### Backup Procedures
- Database backups: Daily automated backups
- File uploads: Weekly backup of media files
- Configuration: Version control for settings

### Performance Optimization
- Database indexing on frequently queried fields
- Caching for dashboard summaries
- Pagination for large transaction lists
- File compression for uploaded receipts

---

*Last Updated: July 4, 2025*
*Version: 1.0*
