#!/bin/bash

# HR Management System - Docker Setup Script
# This script sets up the complete dockerized environment

set -e  # Exit on any error

echo "🚀 HR Management System - Docker Setup"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed"
}

# Create necessary directories
create_directories() {
    print_info "Creating necessary directories..."
    
    mkdir -p backend/media/new_drivers/documents
    mkdir -p backend/media/new_drivers/photos
    mkdir -p backend/media/working_drivers/civil_id
    mkdir -p backend/media/working_drivers/license
    mkdir -p backend/media/working_drivers/vehicle_docs
    mkdir -p backend/media/working_drivers/health
    mkdir -p backend/media/working_drivers/photos
    mkdir -p backend/media/working_drivers/vehicle_photos
    mkdir -p backend/media/company/logo
    mkdir -p backend/staticfiles
    
    print_status "Directories created"
}

# Create environment file
create_env_file() {
    print_info "Creating environment file..."
    
    cat > .env << EOF
# Database Configuration
POSTGRES_DB=hr_management_db
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin@vellore
DATABASE_URL=postgresql://admin:admin@vellore@db:5432/hr_management_db

# Django Configuration
DEBUG=1
SECRET_KEY=your-secret-key-here-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1,backend,0.0.0.0
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Redis Configuration
REDIS_URL=redis://redis:6379/0

# Email Configuration (Optional)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
EOF
    
    print_status "Environment file created"
}

# Build and start services
start_services() {
    print_info "Building and starting Docker services..."
    
    # Stop any existing containers
    docker-compose down
    
    # Build and start services
    docker-compose up --build -d
    
    print_status "Docker services started"
}

# Wait for services to be ready
wait_for_services() {
    print_info "Waiting for services to be ready..."
    
    # Wait for database
    echo "Waiting for database..."
    sleep 10
    
    # Wait for backend
    echo "Waiting for backend..."
    timeout=60
    while ! curl -f http://localhost:8000/api/ &>/dev/null; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            print_warning "Backend service timeout, but continuing..."
            break
        fi
    done
    
    print_status "Services are ready"
}

# Setup initial data
setup_initial_data() {
    print_info "Setting up initial data..."
    
    # Run migrations and setup
    docker-compose exec backend python manage.py makemigrations
    docker-compose exec backend python manage.py migrate
    docker-compose exec backend python setup_complete_system.py
    
    print_status "Initial data setup completed"
}

# Display final information
display_info() {
    echo ""
    echo "🎉 Docker Setup Complete!"
    echo "========================"
    echo ""
    echo "🌐 Access URLs:"
    echo "   Frontend Dashboard: http://localhost:3000"
    echo "   Backend API: http://localhost:8000"
    echo "   Django Admin: http://localhost:8000/admin"
    echo "   API Documentation: http://localhost:8000/api/docs"
    echo ""
    echo "🔑 Login Credentials:"
    echo "   Super Admin: admin@company.com / admin123"
    echo "   HR Manager: hr@company.com / hr123"
    echo "   Fleet Manager: manager@company.com / manager123"
    echo "   Accountant: accountant@company.com / accountant123"
    echo ""
    echo "📱 Mobile App Credentials:"
    echo "   Driver 1: driver001 / driver123"
    echo "   Driver 2: driver002 / driver123"
    echo "   Driver 3: driver003 / driver123"
    echo ""
    echo "🐳 Docker Commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo "   Restart services: docker-compose restart"
    echo "   View running containers: docker-compose ps"
    echo ""
    echo "📊 Database Access:"
    echo "   Host: localhost"
    echo "   Port: 5432"
    echo "   Database: hr_management_db"
    echo "   Username: admin"
    echo "   Password: admin@vellore"
    echo ""
}

# Main execution
main() {
    check_docker
    create_directories
    create_env_file
    start_services
    wait_for_services
    setup_initial_data
    display_info
}

# Handle script interruption
trap 'print_error "Setup interrupted"; exit 1' INT

# Run main function
main

print_status "Setup completed successfully! 🎉"
