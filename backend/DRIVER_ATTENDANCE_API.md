# Driver Attendance API Documentation

## Overview
This document provides comprehensive documentation for the Driver Attendance API endpoints with geolocation validation and check-in location authentication.

## Base URL
```
http://localhost:8000/hr/attendance/
```

## Authentication
Currently using `AllowAny` permission for development. In production, implement proper authentication.

## API Endpoints

### 1. Driver Login/Check-in
**Endpoint:** `POST /hr/attendance/login/`

**Description:** Allows drivers to check in with geolocation validation and photo capture.

**Request Body:**
```json
{
    "driver": 123,
    "login_time": "09:00:00",
    "login_latitude": "24.7136",
    "login_longitude": "46.6753",
    "login_photo_base64": "data:image/jpeg;base64,/9j/4AAQ...",
    "platform": "mobile_app"
}
```

**Success Response (201/200):**
```json
{
    "success": true,
    "message": "Driver John Doe checked in successfully",
    "attendance": {
        "id": 456,
        "driver": {...},
        "date": "2024-01-15",
        "login_time": "09:00:00",
        "status": "logged_in"
    },
    "location_validation": {
        "validated": true,
        "matched_location": {
            "id": 1,
            "name": "Main Office",
            "distance_from_center": 15.5,
            "allowed_radius": 50
        }
    }
}
```

**Error Response (400/403/404/409):**
```json
{
    "success": false,
    "error": "LOCATION_VALIDATION_FAILED",
    "message": "Location validation failed. Closest location is Main Office (75.2m away, max allowed: 50m)",
    "details": {
        "validation_result": {...},
        "driver_location": {...}
    }
}
```

### 2. Driver Logout/Check-out
**Endpoint:** `PATCH /hr/attendance/{attendance_id}/logout/`

**Description:** Allows drivers to check out with optional location validation and work duration calculation.

**Request Body:**
```json
{
    "logout_time": "17:30:00",
    "logout_latitude": "24.7140",
    "logout_longitude": "46.6750",
    "logout_photo_base64": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Success Response (200):**
```json
{
    "success": true,
    "message": "Driver John Doe checked out successfully",
    "attendance": {...},
    "work_session": {
        "check_in_time": "09:00:00",
        "check_out_time": "17:30:00",
        "work_duration": {
            "total_seconds": 30600,
            "hours": 8.5,
            "minutes": 30,
            "formatted": "8:30:00"
        }
    }
}
```

### 3. Get Current Day Attendance
**Endpoint:** `GET /hr/attendance/current-day/{driver_id}/`

**Description:** Retrieves the current day's attendance record for a specific driver.

**Response:**
```json
{
    "id": 456,
    "driver": {...},
    "date": "2024-01-15",
    "login_time": "09:00:00",
    "logout_time": null,
    "status": "logged_in"
}
```

### 4. Get Driver Status
**Endpoint:** `GET /hr/attendance/driver-status/{driver_id}/`

**Description:** Gets current attendance status for a specific driver.

**Response:**
```json
{
    "driver_id": "3",
    "driver_name": "John Doe",
    "date": "2024-01-15",
    "status": "checked_in",
    "message": "Driver checked in at 09:00:00",
    "attendance_id": 456,
    "login_time": "09:00:00",
    "logout_time": null,
    "can_check_in": false,
    "can_check_out": true
}
```

### 5. Get Driver Locations
**Endpoint:** `GET /hr/attendance/locations/{driver_id}/`

**Description:** Gets all authorized check-in locations for a specific driver.

**Response:**
```json
{
    "driver_id": "3",
    "driver_name": "John Doe",
    "total_locations": 4,
    "locations": [
        {
            "id": 1,
            "name": "Main Office",
            "latitude": 24.7136,
            "longitude": 46.6753,
            "radius_meters": 100,
            "is_driver_specific": false,
            "created_at": "2024-01-15T10:00:00Z"
        }
    ]
}
```

## Error Codes

| Error Code | Description |
|------------|-------------|
| `MISSING_REQUIRED_FIELDS` | Missing driver ID or time |
| `DRIVER_NOT_FOUND` | Invalid driver ID |
| `INVALID_TIME_FORMAT` | Incorrect time format |
| `ALREADY_CHECKED_IN` | Duplicate check-in attempt |
| `LOCATION_VALIDATION_FAILED` | Outside authorized location |
| `ATTENDANCE_NOT_FOUND` | Invalid attendance ID for logout |
| `ALREADY_LOGGED_OUT` | Duplicate logout attempt |
| `NOT_LOGGED_IN` | Logout without check-in |

## Geolocation Validation

The API uses the Haversine formula to calculate distances between driver location and authorized check-in locations. Validation includes:

- **Radius Checking:** Driver must be within the specified radius of an authorized location
- **Multi-Location Support:** Supports multiple authorized locations per driver
- **Distance Calculation:** Precise GPS distance measurements
- **Detailed Feedback:** Comprehensive validation results and error messages

## Photo Upload Support

The API supports two photo upload methods:
1. **File Upload:** Traditional multipart/form-data file upload
2. **Base64 Upload:** Base64 encoded image data (recommended for mobile apps)

## Integration Examples

### Flutter/Mobile App Integration
```dart
// Check-in example
final response = await apiService.driverLogin(
  driverId: 123,
  loginTime: "09:00:00",
  latitude: 24.7136,
  longitude: 46.6753,
  photoBase64: capturedPhoto,
);
```

### Web Dashboard Integration
```javascript
// Get driver status
const response = await fetch('/hr/attendance/driver-status/123/');
const status = await response.json();
```

## Testing

Use the provided endpoints to test the API:
```bash
# Test driver status
curl http://localhost:8000/hr/attendance/driver-status/3/

# Test driver locations
curl http://localhost:8000/hr/attendance/locations/3/
```
