from django.core.management.base import BaseCommand
from django.db import transaction
from drivers.models import Driver, DriverAuth


class Command(BaseCommand):
    help = 'Create authentication credentials for drivers'

    def add_arguments(self, parser):
        parser.add_argument(
            '--driver-id',
            type=int,
            help='Create auth for specific driver ID'
        )
        parser.add_argument(
            '--all-approved',
            action='store_true',
            help='Create auth for all approved drivers without credentials'
        )
        parser.add_argument(
            '--username-prefix',
            type=str,
            default='driver',
            help='Username prefix (default: driver)'
        )
        parser.add_argument(
            '--default-password',
            type=str,
            default='driver123',
            help='Default password for new accounts (default: driver123)'
        )

    def handle(self, *args, **options):
        driver_id = options['driver_id']
        all_approved = options['all_approved']
        username_prefix = options['username_prefix']
        default_password = options['default_password']

        if driver_id:
            self.create_auth_for_driver(driver_id, username_prefix, default_password)
        elif all_approved:
            self.create_auth_for_all_approved(username_prefix, default_password)
        else:
            self.stdout.write(
                self.style.ERROR('Please specify either --driver-id or --all-approved')
            )

    def create_auth_for_driver(self, driver_id, username_prefix, default_password):
        """Create authentication credentials for a specific driver"""
        try:
            driver = Driver.objects.get(id=driver_id)
            
            if hasattr(driver, 'auth_credentials'):
                self.stdout.write(
                    self.style.WARNING(f'Driver {driver.driver_name} already has authentication credentials')
                )
                return

            if driver.status != 'approved':
                self.stdout.write(
                    self.style.WARNING(f'Driver {driver.driver_name} is not approved (status: {driver.status})')
                )
                return

            username = self.generate_username(driver, username_prefix)
            
            with transaction.atomic():
                driver_auth = DriverAuth.objects.create(
                    driver=driver,
                    username=username,
                    is_active=True
                )
                driver_auth.set_password(default_password)
                driver_auth.save()

            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Created authentication credentials for {driver.driver_name}\n'
                    f'   Username: {username}\n'
                    f'   Password: {default_password}\n'
                    f'   Status: Active'
                )
            )

        except Driver.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'Driver with ID {driver_id} not found')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating auth for driver {driver_id}: {str(e)}')
            )

    def create_auth_for_all_approved(self, username_prefix, default_password):
        """Create authentication credentials for all approved drivers without credentials"""
        # Get approved drivers without authentication credentials
        drivers_with_auth = DriverAuth.objects.values_list('driver_id', flat=True)
        drivers_without_auth = Driver.objects.filter(
            status='approved'
        ).exclude(
            id__in=drivers_with_auth
        )

        if not drivers_without_auth.exists():
            self.stdout.write(
                self.style.WARNING('No approved drivers found without authentication credentials')
            )
            return

        self.stdout.write(
            f'Found {drivers_without_auth.count()} approved drivers without authentication credentials'
        )

        created_count = 0
        failed_count = 0

        for driver in drivers_without_auth:
            try:
                username = self.generate_username(driver, username_prefix)
                
                with transaction.atomic():
                    driver_auth = DriverAuth.objects.create(
                        driver=driver,
                        username=username,
                        is_active=True
                    )
                    driver_auth.set_password(default_password)
                    driver_auth.save()

                self.stdout.write(
                    f'✅ {driver.driver_name} -> Username: {username}'
                )
                created_count += 1

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'❌ Failed to create auth for {driver.driver_name}: {str(e)}')
                )
                failed_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'\n📊 Summary:\n'
                f'   ✅ Successfully created: {created_count}\n'
                f'   ❌ Failed: {failed_count}\n'
                f'   🔑 Default password: {default_password}\n'
                f'   📱 Drivers can now login to mobile app'
            )
        )

    def generate_username(self, driver, prefix):
        """Generate a unique username for the driver"""
        # Try different username formats
        base_username = f"{prefix}{driver.id}"
        
        # Check if username already exists
        if not DriverAuth.objects.filter(username=base_username).exists():
            return base_username
        
        # If exists, try with driver name
        name_parts = driver.driver_name.lower().split()
        if name_parts:
            base_username = f"{prefix}_{name_parts[0]}{driver.id}"
            if not DriverAuth.objects.filter(username=base_username).exists():
                return base_username
        
        # If still exists, add timestamp
        import time
        timestamp = str(int(time.time()))[-4:]
        return f"{prefix}{driver.id}_{timestamp}"
