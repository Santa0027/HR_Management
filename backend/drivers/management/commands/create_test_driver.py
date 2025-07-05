from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from drivers.models import Driver
from company.models import Company
from vehicle.models import VehicleRegistration
from hr.models import CheckinLocation

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a test driver record for the mobile app testing'

    def handle(self, *args, **options):
        try:
            # Get the driver user
            driver_user = User.objects.get(email='driver@hrmanagement.com')
            
            # Check if driver record already exists
            if Driver.objects.filter(driver_name='John Driver').exists():
                self.stdout.write(
                    self.style.WARNING('Driver record already exists for John Driver')
                )
                driver = Driver.objects.get(driver_name='John Driver')
            else:
                # Create or get a test company
                company, created = Company.objects.get_or_create(
                    company_name='Test Transport Company',
                    defaults={
                        'registration_number': 'TEST-REG-001',
                        'address': '123 Test Street, Riyadh',
                        'city': 'Riyadh',
                        'country': 'Saudi Arabia',
                        'contact_person': 'Test Manager',
                        'contact_email': 'info@testtransport.com',
                        'contact_phone': '+966123456789',
                        'bank_name': 'Test Bank',
                        'account_number': '1234567890',
                        'ifsc_code': 'TEST001'
                    }
                )
                
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f'Created test company: {company.company_name}')
                    )
                
                # Create or get a test vehicle
                vehicle, created = VehicleRegistration.objects.get_or_create(
                    vehicle_number='ABC-1234',
                    defaults={
                        'vehicle_name': 'Test Bus',
                        'vehicle_type': 'BUS',
                        'approval_status': 'APPROVED'
                    }
                )
                
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f'Created test vehicle: {vehicle.vehicle_name}')
                    )
                
                # Create driver record
                driver = Driver.objects.create(
                    driver_name='John Driver',
                    gender='male',
                    iqama='1234567890',
                    mobile='+966987654321',
                    city='Riyadh',
                    nationality='Saudi Arabia',
                    dob='1990-01-01',
                    vehicle=vehicle,
                    company=company,
                    status='approved',
                    remarks='Test driver for mobile app',
                    insurance_paid_by='company',
                    accommodation_paid_by='company',
                    phone_bill_paid_by='company'
                )
                
                self.stdout.write(
                    self.style.SUCCESS(f'Created driver record: {driver.driver_name} (ID: {driver.id})')
                )

                # Create a test checkin location for the driver
                checkin_location, created = CheckinLocation.objects.get_or_create(
                    name='Test Office Location',
                    defaults={
                        'latitude': 24.7136,  # Riyadh coordinates
                        'longitude': 46.6753,
                        'radius_meters': 100,  # 100 meter radius
                        'is_active': True,
                        'driver': driver
                    }
                )

                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f'Created checkin location: {checkin_location.name}')
                    )
            
            # Display driver information
            self.stdout.write('\n' + '='*50)
            self.stdout.write('DRIVER RECORD DETAILS:')
            self.stdout.write('='*50)
            self.stdout.write(f'Driver ID: {driver.id}')
            self.stdout.write(f'Driver Name: {driver.driver_name}')
            self.stdout.write(f'User ID: {driver_user.id}')
            self.stdout.write(f'User Email: {driver_user.email}')
            self.stdout.write(f'Company: {driver.company.company_name if driver.company else "None"}')
            self.stdout.write(f'Vehicle: {driver.vehicle.vehicle_name if driver.vehicle else "None"}')
            self.stdout.write(f'Status: {driver.status}')
            
            self.stdout.write('\n' + '='*50)
            self.stdout.write('MOBILE APP TESTING INFO:')
            self.stdout.write('='*50)
            self.stdout.write('For mobile app attendance API, use:')
            self.stdout.write(f'- User ID for authentication: {driver_user.id}')
            self.stdout.write(f'- Driver ID for attendance: {driver.id}')
            self.stdout.write('- Login credentials:')
            self.stdout.write('  Email: driver@hrmanagement.com')
            self.stdout.write('  Password: driver123')
            
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR('Driver user not found. Please run create_role_users first.')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating driver: {e}')
            )
