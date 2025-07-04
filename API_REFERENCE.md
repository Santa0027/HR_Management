# Accounting API Reference
## HR Management System - Kuwait Driver Supply Platform

### Base URL
```
http://localhost:8000/accounting/
```

### Authentication
All endpoints require JWT authentication unless specified otherwise.

```http
Authorization: Bearer <your_jwt_token>
```

---

## Categories API

### List Categories
```http
GET /categories/
```

**Query Parameters:**
- `category_type`: Filter by 'income' or 'expense'
- `is_active`: Filter by active status (true/false)
- `search`: Search in name and description

**Response:**
```json
[
  {
    "id": 1,
    "name": "Driver Commission",
    "description": "Commission from driver services",
    "category_type": "income",
    "is_active": true,
    "created_at": "2025-07-03T12:43:56.669188Z",
    "updated_at": "2025-07-03T12:43:56.669240Z"
  }
]
```

### Create Category
```http
POST /categories/
```

**Request Body:**
```json
{
  "name": "New Category",
  "description": "Category description",
  "category_type": "income",
  "is_active": true
}
```

### Get Category
```http
GET /categories/{id}/
```

### Update Category
```http
PUT /categories/{id}/
```

### Delete Category
```http
DELETE /categories/{id}/
```

---

## Payment Methods API

### List Payment Methods
```http
GET /payment-methods/
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Cash",
    "description": "Cash payments",
    "is_active": true,
    "created_at": "2025-07-03T12:43:56.669188Z"
  }
]
```

### Create Payment Method
```http
POST /payment-methods/
```

**Request Body:**
```json
{
  "name": "Digital Wallet",
  "description": "Mobile wallet payments",
  "is_active": true
}
```

---

## Bank Accounts API

### List Bank Accounts
```http
GET /bank-accounts/
```

**Response:**
```json
[
  {
    "id": 1,
    "account_name": "Main Business Account",
    "bank_name": "Kuwait National Bank",
    "account_number": "1234567890",
    "routing_number": "KNB001",
    "account_type": "business",
    "current_balance": "50000.00",
    "is_active": true,
    "created_at": "2025-07-03T12:43:56.669188Z"
  }
]
```

### Update Bank Balance
```http
POST /bank-accounts/{id}/update_balance/
```

**Request Body:**
```json
{
  "new_balance": "55000.00",
  "notes": "Monthly reconciliation"
}
```

---

## Transactions API

### List Transactions
```http
GET /transactions/
```

**Query Parameters:**
- `transaction_type`: 'income' or 'expense'
- `status`: 'pending', 'completed', 'cancelled', 'failed'
- `category`: Category ID
- `company`: Company ID
- `driver`: Driver ID
- `start_date`: YYYY-MM-DD format
- `end_date`: YYYY-MM-DD format
- `search`: Search in description
- `ordering`: Sort field (e.g., '-created_at')

**Response:**
```json
[
  {
    "id": 1,
    "transaction_id": "TXN-20250704-ABC123",
    "transaction_type": "income",
    "amount": "500.00",
    "currency": "USD",
    "description": "Driver commission payment",
    "transaction_date": "2025-07-04T00:00:00Z",
    "status": "completed",
    "category_name": "Driver Commission",
    "payment_method_name": "Bank Transfer",
    "company_name": "Swiggy Kuwait",
    "driver_name": "Ahmed Al-Rashid",
    "reference_number": "REF001",
    "notes": "Monthly commission",
    "created_at": "2025-07-04T06:05:04.331062Z"
  }
]
```

### Create Transaction
```http
POST /transactions/
```

**Request Body:**
```json
{
  "transaction_type": "expense",
  "amount": "100.00",
  "description": "Fuel expense",
  "category": 7,
  "payment_method": 1,
  "transaction_date": "2025-07-04",
  "status": "pending",
  "company": 1,
  "reference_number": "FUEL001",
  "notes": "Vehicle maintenance fuel"
}
```

### Transaction Summary
```http
GET /transactions/summary/
```

**Query Parameters:**
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD
- `category_type`: 'income' or 'expense'

**Response:**
```json
{
  "total_income": "15000.00",
  "total_expenses": "8500.00",
  "net_profit": "6500.00",
  "transaction_count": 45,
  "category_breakdown": [
    {
      "category_name": "Driver Commission",
      "category_type": "income",
      "total_amount": "8000.00",
      "transaction_count": 20
    }
  ]
}
```

---

## Income API

### List Income Records
```http
GET /incomes/
```

**Query Parameters:**
- `income_source`: Filter by source type
- `is_recurring`: true/false
- `company`: Company ID
- `driver`: Driver ID

**Response:**
```json
[
  {
    "id": 1,
    "transaction_data": {
      "id": 1,
      "amount": "500.00",
      "description": "Monthly driver commission",
      "transaction_date": "2025-07-04T00:00:00Z",
      "status": "completed",
      "category_name": "Driver Commission",
      "payment_method_name": "Bank Transfer",
      "company_name": "Swiggy Kuwait",
      "driver_name": "Ahmed Al-Rashid"
    },
    "income_source": "commission",
    "invoice_number": "INV-2025-001",
    "due_date": "2025-07-31",
    "tax_amount": "50.00",
    "is_recurring": true,
    "recurring_frequency": "monthly",
    "next_due_date": "2025-08-04",
    "created_at": "2025-07-04T06:05:04.334919Z"
  }
]
```

### Create Income
```http
POST /incomes/
```

**Request Body:**
```json
{
  "transaction_data": {
    "amount": "750.00",
    "description": "Vehicle rental income",
    "category": 3,
    "payment_method": 2,
    "transaction_date": "2025-07-04",
    "status": "pending",
    "company": 1
  },
  "income_source": "rental",
  "invoice_number": "INV-2025-002",
  "due_date": "2025-07-31",
  "tax_amount": "75.00",
  "is_recurring": false
}
```

---

## Expenses API

### List Expenses
```http
GET /expenses/
```

**Query Parameters:**
- `expense_type`: Filter by expense type
- `requires_approval`: true/false
- `approval_status`: 'pending', 'approved', 'rejected'
- `company`: Company ID
- `driver`: Driver ID

**Response:**
```json
[
  {
    "id": 2,
    "transaction_data": {
      "id": 6,
      "amount": "123.00",
      "description": "Vehicle fuel expense",
      "transaction_date": "2025-07-04T00:00:00Z",
      "status": "completed",
      "category_name": "Fuel",
      "payment_method_name": "Bank Transfer",
      "company_name": "Swiggy Kuwait",
      "driver_name": "Ali Al-Sabah"
    },
    "expense_type": "fuel",
    "vendor_name": "Kuwait Petroleum",
    "bill_number": "FUEL-001",
    "due_date": "2025-07-31",
    "tax_amount": "12.30",
    "requires_approval": true,
    "approval_status": "approved",
    "is_recurring": false,
    "created_at": "2025-07-04T06:05:04.334919Z"
  }
]
```

### Create Expense
```http
POST /expenses/
```

**Request Body:**
```json
{
  "transaction_data": {
    "amount": "200.00",
    "description": "Office rent payment",
    "category": 8,
    "payment_method": 2,
    "transaction_date": "2025-07-04",
    "status": "pending"
  },
  "expense_type": "rent",
  "vendor_name": "Property Management Co.",
  "bill_number": "RENT-2025-07",
  "due_date": "2025-07-31",
  "tax_amount": "20.00",
  "requires_approval": true,
  "is_recurring": true,
  "recurring_frequency": "monthly"
}
```

### Approve Expense
```http
POST /expenses/{id}/approve/
```

**Request Body:**
```json
{
  "notes": "Approved for payment"
}
```

**Response:**
```json
{
  "message": "Expense approved successfully"
}
```

### Reject Expense
```http
POST /expenses/{id}/reject/
```

**Request Body:**
```json
{
  "reason": "Insufficient documentation"
}
```

**Response:**
```json
{
  "message": "Expense rejected successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": {
    "amount": ["This field is required."],
    "category": ["Invalid category ID."]
  }
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred."
}
```

---

## Rate Limiting

- **Standard endpoints**: 100 requests per minute
- **Bulk operations**: 10 requests per minute
- **File uploads**: 5 requests per minute

---

## Pagination

Large result sets are paginated:

```json
{
  "count": 150,
  "next": "http://localhost:8000/accounting/transactions/?page=2",
  "previous": null,
  "results": [...]
}
```

**Query Parameters:**
- `page`: Page number
- `page_size`: Results per page (max 100)

---

## File Uploads

### Receipt Upload
```http
POST /expenses/{id}/upload_receipt/
Content-Type: multipart/form-data
```

**Form Data:**
- `receipt`: File (PDF, JPG, PNG, max 5MB)

**Response:**
```json
{
  "message": "Receipt uploaded successfully",
  "file_url": "/media/accounting/receipts/receipt_123.pdf"
}
```

---

## Webhooks (Future Feature)

### Transaction Status Updates
```http
POST /webhooks/transaction-status/
```

**Payload:**
```json
{
  "event": "transaction.completed",
  "transaction_id": "TXN-20250704-ABC123",
  "timestamp": "2025-07-04T12:00:00Z",
  "data": {
    "id": 1,
    "status": "completed",
    "amount": "500.00"
  }
}
```

---

*Last Updated: July 4, 2025*
*Version: 1.0*
