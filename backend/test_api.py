#!/usr/bin/env python
import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

import requests
import json

def test_company_api():
    base_url = "http://127.0.0.1:8000"
    
    # Test GET companies
    print("Testing GET /companies/")
    try:
        response = requests.get(f"{base_url}/companies/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection error: {e}")
    
    # Test POST company
    print("\nTesting POST /companies/")
    test_data = {
        'company_name': 'Test API Company',
        'contact_person': 'John Doe',
        'contact_email': 'john@testapi.com',
        'contact_phone': '+96512345678',
        'address': 'Test Address',
        'city': 'Kuwait City',
        'country': 'Kuwait',
        'car_fixed_commission': '200.00',
        'bike_rate_per_km': '2.50',
        'bike_min_km': '50'
    }
    
    try:
        response = requests.post(f"{base_url}/companies/", data=test_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            print(f"Success: {response.json()}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection error: {e}")

    # Test companies-for-drivers endpoint
    print("\nTesting GET /companies-for-drivers/")
    try:
        response = requests.get(f"{base_url}/companies-for-drivers/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    test_company_api()
