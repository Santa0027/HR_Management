#!/usr/bin/env python3
"""
Complete System Setup Script
Sets up the entire HR Management System with login and initial data
"""

import os
import sys
import django
import subprocess
from datetime import datetime

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def run_migrations():
    """Run database migrations"""
    print("🔄 Running Database Migrations...")
    try:
        subprocess.run([sys.executable, 'manage.py', 'makemigrations'], check=True)
        subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
        print("✅ Database migrations completed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Migration failed: {e}")
        return False
    return True

def setup_login_system():
    """Setup login system"""
    print("\n🔐 Setting up Login System...")
    try:
        # Import and run the login setup functions
        import setup_login_system
        admin_users = setup_login_system.create_admin_users()
        driver_auths = setup_login_system.create_driver_authentication()
        setup_login_system.print_login_credentials(admin_users, driver_auths)
        print("✅ Login system setup completed!")
    except Exception as e:
        print(f"❌ Login setup failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    return True

def setup_initial_data():
    """Setup initial data"""
    print("\n📊 Setting up Initial Data...")
    try:
        # Import and run the initial data setup functions
        import setup_initial_data
        companies = setup_initial_data.create_companies()
        vehicle_types = setup_initial_data.create_vehicle_types()
        vehicles = setup_initial_data.create_vehicles(companies, vehicle_types)
        shift_types = setup_initial_data.create_shift_types()
        leave_types = setup_initial_data.create_leave_types()
        accounting_categories = setup_initial_data.create_accounting_categories()
        payment_methods = setup_initial_data.create_payment_methods()

        # Get drivers and create leave balances
        from drivers.models import Driver
        drivers = Driver.objects.all()
        if drivers.exists():
            setup_initial_data.create_leave_balances(drivers, leave_types)

        setup_initial_data.print_summary()
        print("✅ Initial data setup completed!")
    except Exception as e:
        print(f"❌ Initial data setup failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    return True

def create_superuser_if_needed():
    """Create Django superuser if none exists"""
    print("\n👑 Checking for Django Superuser...")
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    if not User.objects.filter(is_superuser=True).exists():
        print("Creating Django superuser...")
        try:
            subprocess.run([
                sys.executable, 'manage.py', 'createsuperuser',
                '--email', 'superadmin@company.com',
                '--noinput'
            ], check=True, env={**os.environ, 'DJANGO_SUPERUSER_PASSWORD': 'superadmin123'})
            print("✅ Django superuser created!")
        except subprocess.CalledProcessError:
            print("ℹ️ Superuser creation skipped or failed")
    else:
        print("ℹ️ Django superuser already exists")

def print_final_summary():
    """Print final setup summary"""
    print("\n" + "="*80)
    print("🎉 COMPLETE SYSTEM SETUP FINISHED!")
    print("="*80)
    
    print("\n🌐 SYSTEM URLS:")
    print("Frontend (Admin Dashboard): http://localhost:3000")
    print("Backend API: http://localhost:8000")
    print("Django Admin: http://localhost:8000/admin")
    print("API Documentation: http://localhost:8000/api/docs")
    
    print("\n🔑 ADMIN LOGIN CREDENTIALS:")
    print("Super Admin: admin@company.com / admin123")
    print("HR Manager: hr@company.com / hr123")
    print("Fleet Manager: manager@company.com / manager123")
    print("Accountant: accountant@company.com / accountant123")
    
    print("\n📱 MOBILE APP LOGIN CREDENTIALS:")
    print("Driver 1: driver001 / driver123")
    print("Driver 2: driver002 / driver123") 
    print("Driver 3: driver003 / driver123")
    
    print("\n🚀 QUICK START COMMANDS:")
    print("1. Start Backend:")
    print("   cd backend && python manage.py runserver")
    print("\n2. Start Frontend:")
    print("   cd frontend && npm start")
    print("\n3. Start Mobile App:")
    print("   cd Drivers-application && flutter run")
    
    print("\n📋 WHAT'S BEEN CREATED:")
    print("✅ Database tables and migrations")
    print("✅ Admin users with different roles")
    print("✅ Driver authentication for mobile app")
    print("✅ Sample companies and drivers")
    print("✅ Vehicle types and sample vehicles")
    print("✅ Shift types and leave types")
    print("✅ Leave balances for all drivers")
    print("✅ Accounting categories and payment methods")
    
    print("\n💡 NEXT STEPS:")
    print("1. Start the backend server")
    print("2. Start the frontend application")
    print("3. Login with any of the credentials above")
    print("4. Explore the system features")
    print("5. Test mobile app with driver credentials")
    
    print("\n📚 ADDITIONAL INFO:")
    print("- All passwords are set to simple values for development")
    print("- Change passwords in production environment")
    print("- Mobile app connects to backend API")
    print("- Check API endpoints at /api/docs")
    
    print("\n" + "="*80)

def main():
    """Main setup function"""
    print("🚀 COMPLETE HR MANAGEMENT SYSTEM SETUP")
    print("="*80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80)
    
    success = True
    
    # Step 1: Run migrations
    if not run_migrations():
        success = False
    
    # Step 2: Setup login system
    if success and not setup_login_system():
        success = False
    
    # Step 3: Setup initial data
    if success and not setup_initial_data():
        success = False
    
    # Step 4: Create Django superuser
    if success:
        create_superuser_if_needed()
    
    # Final summary
    if success:
        print_final_summary()
        print("\n🎉 Setup completed successfully!")
    else:
        print("\n❌ Setup failed. Please check the errors above.")
        return 1
    
    return 0

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)
