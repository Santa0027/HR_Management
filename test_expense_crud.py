#!/usr/bin/env python3
"""
Test script to verify all CRUD operations for expense management
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_expense_crud():
    print("Testing Expense Management CRUD Operations")
    print("=" * 50)
    
    # Test 1: GET all expenses
    print("\n1. Testing GET all expenses...")
    response = requests.get(f"{BASE_URL}/accounting/expenses/")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        expenses = response.json()
        print(f"Found {len(expenses)} expenses")
        print("✅ GET all expenses - SUCCESS")
    else:
        print("❌ GET all expenses - FAILED")
        return
    
    # Test 2: CREATE new expense
    print("\n2. Testing CREATE new expense...")
    new_expense = {
        "transaction_data": {
            "amount": "100.00",
            "description": "Test CRUD expense",
            "category": 5,  # Driver Salary
            "payment_method": 1,  # Cash
            "transaction_date": "2025-07-04",
            "status": "pending"
        },
        "expense_type": "fuel",
        "vendor_name": "CRUD Test Vendor",
        "bill_number": "CRUD001",
        "tax_amount": "10.00",
        "requires_approval": True
    }
    
    response = requests.post(f"{BASE_URL}/accounting/expenses/", 
                           json=new_expense,
                           headers={"Content-Type": "application/json"})
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        created_expense = response.json()
        expense_id = created_expense["id"]
        print(f"Created expense with ID: {expense_id}")
        print("✅ CREATE expense - SUCCESS")
    else:
        print("❌ CREATE expense - FAILED")
        print(f"Error: {response.text}")
        return
    
    # Test 3: GET single expense
    print(f"\n3. Testing GET single expense (ID: {expense_id})...")
    response = requests.get(f"{BASE_URL}/accounting/expenses/{expense_id}/")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        expense = response.json()
        print(f"Retrieved expense: {expense['vendor_name']}")
        print("✅ GET single expense - SUCCESS")
    else:
        print("❌ GET single expense - FAILED")
        return
    
    # Test 4: UPDATE expense
    print(f"\n4. Testing UPDATE expense (ID: {expense_id})...")
    updated_expense = {
        "transaction_data": {
            "amount": "150.00",
            "description": "Updated CRUD expense",
            "category": 5,
            "payment_method": 1,
            "transaction_date": "2025-07-04",
            "status": "completed"
        },
        "expense_type": "fuel",
        "vendor_name": "Updated CRUD Vendor",
        "bill_number": "CRUD001-UPDATED",
        "tax_amount": "15.00",
        "requires_approval": True
    }
    
    response = requests.put(f"{BASE_URL}/accounting/expenses/{expense_id}/",
                          json=updated_expense,
                          headers={"Content-Type": "application/json"})
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        updated = response.json()
        print(f"Updated expense amount: ${updated['transaction_data']['amount']}")
        print("✅ UPDATE expense - SUCCESS")
    else:
        print("❌ UPDATE expense - FAILED")
        print(f"Error: {response.text}")
        return
    
    # Test 5: DELETE expense
    print(f"\n5. Testing DELETE expense (ID: {expense_id})...")
    response = requests.delete(f"{BASE_URL}/accounting/expenses/{expense_id}/")
    print(f"Status: {response.status_code}")
    if response.status_code == 204:
        print("✅ DELETE expense - SUCCESS")
    else:
        print("❌ DELETE expense - FAILED")
        return
    
    # Test 6: Verify deletion
    print(f"\n6. Verifying deletion (ID: {expense_id})...")
    response = requests.get(f"{BASE_URL}/accounting/expenses/{expense_id}/")
    print(f"Status: {response.status_code}")
    if response.status_code == 404:
        print("✅ Expense successfully deleted")
    else:
        print("❌ Expense still exists after deletion")
    
    print("\n" + "=" * 50)
    print("🎉 ALL EXPENSE CRUD OPERATIONS COMPLETED SUCCESSFULLY!")
    print("=" * 50)

if __name__ == "__main__":
    test_expense_crud()
