from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a test user for login testing'

    def handle(self, *args, **options):
        email = 'admin@example.com'
        password = 'admin123'
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f'User with email {email} already exists')
            )
            return
        
        # Create the user
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name='Test',
            last_name='Admin',
            is_staff=True,
            is_superuser=True
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created test user: {email} / {password}')
        )
