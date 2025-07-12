# HR Management System - Setup Instructions

## 🚀 Quick Setup (Complete System)

Run this single command to set up everything:

```bash
cd backend
python setup_complete_system.py
```

This will:
- ✅ Run database migrations
- ✅ Create admin users
- ✅ Create driver authentication
- ✅ Create initial data (companies, vehicles, leave types, etc.)
- ✅ Display all login credentials

## 📋 Manual Setup (Step by Step)

### 1. Database Setup
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### 2. Login System Setup
```bash
python setup_login_system.py
```

### 3. Initial Data Setup
```bash
python setup_initial_data.py
```

### 4. Test Login System
```bash
python test_login.py
```

## 🔑 Default Login Credentials

### Admin Dashboard (Web)
- **Super Admin**: admin@company.com / admin123
- **HR Manager**: hr@company.com / hr123
- **Fleet Manager**: manager@company.com / manager123
- **Accountant**: accountant@company.com / accountant123

### Mobile App (Drivers)
- **Driver 1**: driver001 / driver123
- **Driver 2**: driver002 / driver123
- **Driver 3**: driver003 / driver123

## 🌐 System URLs

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin
- **API Documentation**: http://localhost:8000/api/docs

## 🚀 Starting the System

### 1. Start Backend Server
```bash
cd backend
python manage.py runserver
```

### 2. Start Frontend Dashboard
```bash
cd frontend
npm install
npm start
```

### 3. Start Mobile App
```bash
cd Drivers-application
flutter pub get
flutter run
```

## 📊 What Gets Created

### Users & Authentication
- 4 Admin users with different roles
- 3 Sample drivers with mobile app login
- Driver authentication system
- Role-based permissions

### Companies & Drivers
- 2 Sample transport companies
- 3 Sample drivers with complete profiles
- Driver authentication for mobile app

### Vehicles
- 6 Vehicle types (Sedan, SUV, Van, Truck, Bus, Motorcycle)
- 3 Sample vehicles with registration details
- Vehicle status tracking

### HR Management
- 4 Shift types (Morning, Evening, Night, Full Day)
- 5 Leave types (Annual, Sick, Emergency, Maternity, Bereavement)
- Leave balances for all drivers
- Attendance tracking system

### Accounting
- 8 Accounting categories (Income/Expense)
- 6 Payment methods
- Financial tracking setup

## 🔧 Troubleshooting

### Database Issues
```bash
# Reset database
rm db.sqlite3
python manage.py migrate
python setup_complete_system.py
```

### Permission Issues
```bash
# Make scripts executable
chmod +x setup_*.py
chmod +x test_login.py
```

### API Connection Issues
1. Check backend server is running on port 8000
2. Update API URLs in frontend/mobile app if needed
3. Check CORS settings in Django

### Mobile App Issues
1. Update API URL in `Drivers-application/lib/services/api_service.dart`
2. Check camera/location permissions
3. Run `flutter clean && flutter pub get`

## 📱 Mobile App Configuration

Update the API URL in the mobile app:
```dart
// File: Drivers-application/lib/services/api_service.dart
static const String baseUrl = 'http://YOUR_IP:8000/';
```

Replace `YOUR_IP` with your actual IP address.

## 🔐 Security Notes

- **Development Only**: These credentials are for development
- **Change in Production**: Update all passwords for production use
- **API Security**: Enable proper authentication in production
- **Database**: Use PostgreSQL/MySQL in production instead of SQLite

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login/` - Admin login
- `POST /api/drivers/login/` - Driver login
- `GET /api/drivers/profile/` - Driver profile

### HR Management
- `GET /api/hr/attendance/` - Attendance records
- `POST /api/hr/attendance/login/` - Check-in
- `PATCH /api/hr/attendance/{id}/logout/` - Check-out
- `GET /api/hr/leave-types/` - Leave types
- `POST /api/hr/leave-requests/` - Create leave request

### Vehicle Management
- `GET /api/vehicles/` - Vehicle list
- `GET /api/vehicles/types/` - Vehicle types

## 💡 Next Steps

1. **Start Development**: Use the provided credentials to login
2. **Customize Data**: Modify the setup scripts for your specific needs
3. **Add Features**: Extend the system with additional functionality
4. **Deploy**: Configure for production deployment
5. **Test**: Use the test script to verify functionality

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Run the test script: `python test_login.py`
3. Check Django logs for detailed error messages
4. Verify all dependencies are installed

---

**Happy Coding! 🎉**
