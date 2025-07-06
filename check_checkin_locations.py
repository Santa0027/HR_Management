#!/usr/bin/env python3
"""
Script to check checkin locations in the database
"""
import requests
import json

# Test configuration
BASE_URL = "http://127.0.0.1:8000"
TEST_CREDENTIALS = {
    "email": "driver@hrmanagement.com",
    "password": "driver123"
}

def get_access_token():
    """Get access token"""
    url = f"{BASE_URL}/auth/login/"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    response = requests.post(url, json=TEST_CREDENTIALS, headers=headers)
    if response.status_code == 200:
        return response.json().get('access')
    return None

def check_checkin_locations(access_token):
    """Check available checkin locations"""
    print("🏢 Checking Checkin Locations...")
    
    url = f"{BASE_URL}/checkin-locations/"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and 'results' in data:
                locations = data['results']
            else:
                locations = data
                
            print(f"✅ Found {len(locations)} checkin locations:")
            for i, location in enumerate(locations, 1):
                print(f"\n  Location {i}:")
                print(f"    ID: {location.get('id')}")
                print(f"    Name: {location.get('name')}")
                print(f"    Latitude: {location.get('latitude')}")
                print(f"    Longitude: {location.get('longitude')}")
                print(f"    Radius: {location.get('radius_meters')} meters")
                print(f"    Active: {location.get('is_active')}")
                print(f"    Driver ID: {location.get('driver')}")
        else:
            print(f"❌ Failed to get checkin locations: {response.text}")
            
    except Exception as e:
        print(f"❌ Error checking checkin locations: {e}")

def test_distance_calculation():
    """Test if our coordinates are within range"""
    print("\n📍 Testing Distance Calculation...")
    
    # Our test coordinates
    test_lat = 24.713600
    test_lon = 46.675300
    
    # Expected location coordinates (same as test)
    location_lat = 24.7136
    location_lon = 46.6753
    
    # Calculate distance using Haversine formula
    import math
    
    def haversine_distance(lat1, lon1, lat2, lon2):
        R = 6371000  # Earth's radius in meters
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_lat / 2) ** 2 + 
             math.cos(lat1_rad) * math.cos(lat2_rad) * 
             math.sin(delta_lon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    distance = haversine_distance(test_lat, test_lon, location_lat, location_lon)
    print(f"Distance between test coordinates and location: {distance:.2f} meters")
    print(f"Expected radius: 100 meters")
    print(f"Within range: {'✅ Yes' if distance <= 100 else '❌ No'}")

def main():
    """Main function"""
    print("🔍 Checking Checkin Locations Setup")
    print("=" * 50)
    
    # Get access token
    access_token = get_access_token()
    if not access_token:
        print("❌ Failed to get access token")
        return
    
    # Check checkin locations
    check_checkin_locations(access_token)
    
    # Test distance calculation
    test_distance_calculation()
    
    print("\n" + "=" * 50)
    print("🎯 Checkin Location Analysis Complete!")

if __name__ == "__main__":
    main()
