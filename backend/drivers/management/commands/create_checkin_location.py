from django.core.management.base import BaseCommand
from drivers.models import Driver
from hr.models import CheckinLocation

class Command(BaseCommand):
    help = 'Create a test checkin location for the mobile app testing'

    def handle(self, *args, **options):
        try:
            # Get the driver
            driver = Driver.objects.get(driver_name='John Driver')
            
            # Create or update checkin location
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
            else:
                # Update existing location
                checkin_location.latitude = 24.7136
                checkin_location.longitude = 46.6753
                checkin_location.radius_meters = 100
                checkin_location.is_active = True
                checkin_location.driver = driver
                checkin_location.save()
                
                self.stdout.write(
                    self.style.SUCCESS(f'Updated checkin location: {checkin_location.name}')
                )
            
            # Display location information
            self.stdout.write('\n' + '='*50)
            self.stdout.write('CHECKIN LOCATION DETAILS:')
            self.stdout.write('='*50)
            self.stdout.write(f'Location ID: {checkin_location.id}')
            self.stdout.write(f'Location Name: {checkin_location.name}')
            self.stdout.write(f'Latitude: {checkin_location.latitude}')
            self.stdout.write(f'Longitude: {checkin_location.longitude}')
            self.stdout.write(f'Radius: {checkin_location.radius_meters} meters')
            self.stdout.write(f'Active: {checkin_location.is_active}')
            self.stdout.write(f'Driver: {checkin_location.driver.driver_name if checkin_location.driver else "None"}')
            
            self.stdout.write('\n' + '='*50)
            self.stdout.write('MOBILE APP TESTING INFO:')
            self.stdout.write('='*50)
            self.stdout.write('Use these exact coordinates for testing:')
            self.stdout.write(f'- Latitude: {checkin_location.latitude}')
            self.stdout.write(f'- Longitude: {checkin_location.longitude}')
            self.stdout.write(f'- Radius: {checkin_location.radius_meters} meters')
            
        except Driver.DoesNotExist:
            self.stdout.write(
                self.style.ERROR('Driver "John Driver" not found. Please run create_test_driver first.')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating checkin location: {e}')
            )
