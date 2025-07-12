#!/bin/bash

# Wait for database to be ready
echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "Database started"

# Run migrations
echo "Running migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser if it doesn't exist
echo "Creating superuser..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@company.com').exists():
    User.objects.create_superuser('admin@company.com', 'admin123')
    print('Superuser created')
else:
    print('Superuser already exists')
EOF

# Setup initial data
echo "Setting up initial data..."
python setup_complete_system.py

# Start server
echo "Starting server..."
exec "$@"
