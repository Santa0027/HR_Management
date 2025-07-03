from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test users with different roles for testing role-based authentication'

    def handle(self, *args, **options):
        users_to_create = [
            {
                'email': 'admin@hrmanagement.com',
                'password': 'admin123',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True
            },
            {
                'email': 'hr@hrmanagement.com',
                'password': 'hr123',
                'first_name': 'HR',
                'last_name': 'Manager',
                'role': 'hr',
                'is_staff': True,
                'is_superuser': False
            },
            {
                'email': 'accountant@hrmanagement.com',
                'password': 'accountant123',
                'first_name': 'Finance',
                'last_name': 'Manager',
                'role': 'accountant',
                'is_staff': True,
                'is_superuser': False
            },
            {
                'email': 'driver@hrmanagement.com',
                'password': 'driver123',
                'first_name': 'John',
                'last_name': 'Driver',
                'role': 'driver',
                'is_staff': False,
                'is_superuser': False
            },
            {
                'email': 'management@hrmanagement.com',
                'password': 'management123',
                'first_name': 'Management',
                'last_name': 'User',
                'role': 'management',
                'is_staff': True,
                'is_superuser': False
            },
            {
                'email': 'staff@hrmanagement.com',
                'password': 'staff123',
                'first_name': 'Staff',
                'last_name': 'Member',
                'role': 'staff',
                'is_staff': False,
                'is_superuser': False
            }
        ]
        
        created_count = 0
        updated_count = 0
        
        for user_data in users_to_create:
            email = user_data['email']
            
            # Check if user already exists
            if User.objects.filter(email=email).exists():
                user = User.objects.get(email=email)
                # Update existing user
                user.role = user_data['role']
                user.first_name = user_data['first_name']
                user.last_name = user_data['last_name']
                user.is_staff = user_data['is_staff']
                user.is_superuser = user_data['is_superuser']
                user.set_password(user_data['password'])
                user.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated existing user: {email} (Role: {user_data["role"]})')
                )
            else:
                # Create new user
                user = User.objects.create_user(
                    email=email,
                    password=user_data['password'],
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name'],
                    role=user_data['role'],
                    is_staff=user_data['is_staff'],
                    is_superuser=user_data['is_superuser']
                )
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created user: {email} (Role: {user_data["role"]})')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nSummary: Created {created_count} new users, updated {updated_count} existing users'
            )
        )
        
        self.stdout.write('\nTest Users Created:')
        self.stdout.write('==================')
        for user_data in users_to_create:
            self.stdout.write(f'Role: {user_data["role"].upper()}')
            self.stdout.write(f'Email: {user_data["email"]}')
            self.stdout.write(f'Password: {user_data["password"]}')
            self.stdout.write('---')
        
        self.stdout.write('\nYou can now test role-based authentication with these users!')
        self.stdout.write('Each user has different permissions based on their role.')
        self.stdout.write('\nRole Permissions:')
        self.stdout.write('- Admin: Full access to all features')
        self.stdout.write('- HR: Can manage drivers, attendance, HR functions')
        self.stdout.write('- Accountant: Can manage accounting, view financial data')
        self.stdout.write('- Management: Can view reports and data, approve expenses')
        self.stdout.write('- Staff: Limited access to basic functions')
        self.stdout.write('- Driver: Can only view own data and update profile')
