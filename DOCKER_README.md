# HR Management System - Docker Setup

## 🐳 Complete Dockerized Solution

This project is now fully dockerized with enhanced features including:
- **Vehicle Tariffs** for different vehicle types (bikes, cars, etc.)
- **Employee Accessories** management system
- **New Driver Application** form with comprehensive details
- **Working Driver** management with employment details

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
chmod +x docker-setup.sh
./docker-setup.sh
```

### Option 2: Manual Setup
```bash
# Build and start all services
docker-compose up --build -d

# Setup initial data
docker-compose exec backend python setup_complete_system.py
```

## 📋 What's Included

### Services
- **PostgreSQL Database** (Port 5432)
- **Redis Cache** (Port 6379)
- **Django Backend API** (Port 8000)
- **React Frontend** (Port 3000)
- **Nginx Reverse Proxy** (Port 80/443) - Production only

### New Features

#### 🚗 Vehicle Tariffs
- Different pricing for bikes, cars, vans, trucks, buses
- Per kilometer, per hour, per day, or fixed rates
- Fuel surcharge, night charges, holiday charges
- Effective date ranges and active status

#### 👕 Employee Accessories
- Uniform items (T-shirts, caps, bags, vests)
- Safety equipment (helmets, safety gear)
- Technology items and personal accessories
- Stock management and assignment tracking
- Security deposits and damage charges

#### 📝 Driver Forms

**New Driver Application:**
- Personal details (name, gender, DOB, nationality, etc.)
- Physical details (weight, height, blood group, T-shirt size)
- Contact information and addresses
- Nominee details (relationship, contact info)
- Document uploads (passport, visa, certificates, photos)
- Company and vehicle type assignment

**Working Driver Management:**
- Employee ID and basic information
- Vehicle details and registration
- Legal documents (Civil ID, License, Health Card)
- Document photos and vehicle photos (4 sides)
- Department assignment and employment status
- Accessory issuance tracking
- Performance metrics

## 🔑 Login Credentials

### Admin Dashboard
- **Super Admin**: admin@company.com / admin123
- **HR Manager**: hr@company.com / hr123
- **Fleet Manager**: manager@company.com / manager123
- **Accountant**: accountant@company.com / accountant123

### Mobile App (Drivers)
- **Driver 1**: driver001 / driver123
- **Driver 2**: driver002 / driver123
- **Driver 3**: driver003 / driver123

## 🌐 Access URLs

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin
- **API Documentation**: http://localhost:8000/api/docs

## 📊 Database Schema

### New Tables
- `company_vehicletariff` - Vehicle pricing by type
- `company_employeeaccessory` - Accessory catalog
- `company_employeeaccessoryassignment` - Accessory assignments
- `drivers_newdriverapplication` - New driver applications
- `drivers_workingdriver` - Working driver records

## 🛠️ Docker Commands

### Basic Operations
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart services
docker-compose restart

# Rebuild and start
docker-compose up --build -d
```

### Database Operations
```bash
# Access database
docker-compose exec db psql -U admin -d hr_management_db

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Load initial data
docker-compose exec backend python setup_complete_system.py
```

### Development
```bash
# Access backend shell
docker-compose exec backend python manage.py shell

# Access backend bash
docker-compose exec backend bash

# Access frontend bash
docker-compose exec frontend bash
```

## 📁 Directory Structure

```
├── backend/
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   ├── requirements.txt
│   └── media/
│       ├── new_drivers/
│       ├── working_drivers/
│       └── company/
├── frontend/
│   └── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── docker-setup.sh
└── .env
```

## 🔧 Configuration

### Environment Variables (.env)
```env
# Database
POSTGRES_DB=hr_management_db
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin@vellore

# Django
DEBUG=1
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1,backend

# Frontend
REACT_APP_API_URL=http://localhost:8000
```

## 📱 Mobile App Integration

The Flutter mobile app connects to the dockerized backend:

```dart
// Update API URL in mobile app
static const String baseUrl = 'http://YOUR_IP:8000/';
```

Replace `YOUR_IP` with your Docker host IP address.

## 🔒 Security Notes

- Default passwords are for development only
- Change all credentials in production
- Use HTTPS in production with proper SSL certificates
- Configure proper firewall rules
- Use environment-specific configuration files

## 🚀 Production Deployment

### With Nginx (Recommended)
```bash
# Start with nginx
docker-compose --profile production up -d

# Access via nginx
http://your-domain.com
```

### Environment Setup
1. Update `.env` with production values
2. Set `DEBUG=0` in Django settings
3. Configure proper `ALLOWED_HOSTS`
4. Set up SSL certificates
5. Configure backup strategies

## 📞 Troubleshooting

### Common Issues

**Database Connection Error:**
```bash
# Check database status
docker-compose ps db

# View database logs
docker-compose logs db
```

**Backend Not Starting:**
```bash
# Check backend logs
docker-compose logs backend

# Rebuild backend
docker-compose up --build backend
```

**Frontend Build Errors:**
```bash
# Clear node modules and rebuild
docker-compose exec frontend rm -rf node_modules
docker-compose up --build frontend
```

### Reset Everything
```bash
# Stop and remove all containers
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
./docker-setup.sh
```

## 📈 Monitoring

### Health Checks
```bash
# Check all services
docker-compose ps

# Check specific service health
docker-compose exec backend python manage.py check
```

### Performance
```bash
# View resource usage
docker stats

# View container logs
docker-compose logs --tail=100 -f
```

---

**Happy Dockerizing! 🐳**
