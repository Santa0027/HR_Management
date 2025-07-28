from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db import transaction
from django.contrib import messages
import json

from .models import Driver, Accessory, DriverAccessory
from company.models import Company


def driver_form_view(request):
    """Render the driver registration form"""
    companies = Company.objects.all().order_by('company_name')
    accessories = Accessory.objects.all().order_by('name')
    
    context = {
        'companies': companies,
        'accessories': accessories,
    }
    return render(request, 'drivers/driver_form.html', context)


@require_http_methods(["GET"])
def get_company_data(request, company_id):
    """Ajax endpoint to get company commission and accessories data"""
    try:
        company = get_object_or_404(Company, id=company_id)
        
        # Get commission data for both car and bike
        commission_data = {
            'car': {
                'rate_per_km': float(company.car_rate_per_km) if company.car_rate_per_km else None,
                'min_km': company.car_min_km,
                'rate_per_order': float(company.car_rate_per_order) if company.car_rate_per_order else None,
                'fixed_commission': float(company.car_fixed_commission) if company.car_fixed_commission else None,
            },
            'bike': {
                'rate_per_km': float(company.bike_rate_per_km) if company.bike_rate_per_km else None,
                'min_km': company.bike_min_km,
                'rate_per_order': float(company.bike_rate_per_order) if company.bike_rate_per_order else None,
                'fixed_commission': float(company.bike_fixed_commission) if company.bike_fixed_commission else None,
            }
        }
        
        # Get accessories assigned to this company
        accessories_data = []
        for accessory in company.accessories.all():
            accessories_data.append({
                'id': accessory.id,
                'name': accessory.name,
                'description': accessory.description,
            })
        
        return JsonResponse({
            'success': True,
            'company_name': company.company_name,
            'commission': commission_data,
            'accessories': accessories_data,
        })
        
    except Company.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Company not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def save_driver(request):
    """Save driver data with company, commission, and accessories"""
    try:
        data = json.loads(request.body)
        
        with transaction.atomic():
            # Create driver instance
            driver = Driver()
            
            # Basic driver information
            driver.driver_name = data.get('driver_name', '')
            driver.iqama = data.get('iqama', '')
            driver.mobile = data.get('mobile', '')
            driver.gender = data.get('gender', '')
            driver.nationality = data.get('nationality', '')
            driver.city = data.get('city', '')
            
            # Company and vehicle information
            company_id = data.get('company_id')
            if company_id:
                driver.assigned_company = Company.objects.get(id=company_id)
            
            driver.vehicle_type = data.get('vehicle_type', 'car')
            driver.commission_rate = data.get('commission_rate')
            
            # Save the driver
            driver.save()
            
            # Save accessories with counts
            accessories_data = data.get('accessories', [])
            for accessory_data in accessories_data:
                accessory_id = accessory_data.get('accessory_id')
                count = accessory_data.get('count', 0)
                
                if accessory_id and count > 0:
                    accessory = Accessory.objects.get(id=accessory_id)
                    DriverAccessory.objects.create(
                        driver=driver,
                        accessory=accessory,
                        count=count,
                        notes=accessory_data.get('notes', '')
                    )
            
            return JsonResponse({
                'success': True,
                'message': 'Driver registered successfully',
                'driver_id': driver.id
            })
            
    except Company.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Selected company not found'
        }, status=400)
    except Accessory.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Selected accessory not found'
        }, status=400)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_http_methods(["GET"])
def get_all_accessories(request):
    """Get all available accessories"""
    try:
        accessories = Accessory.objects.all().order_by('name')
        accessories_data = []
        
        for accessory in accessories:
            accessories_data.append({
                'id': accessory.id,
                'name': accessory.name,
                'description': accessory.description,
            })
        
        return JsonResponse({
            'success': True,
            'accessories': accessories_data
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_http_methods(["GET"])
def get_driver_details(request, driver_id):
    """Get driver details with accessories"""
    try:
        driver = get_object_or_404(Driver, id=driver_id)
        
        # Get driver accessories with counts
        driver_accessories = []
        for da in driver.driver_accessories.all():
            driver_accessories.append({
                'accessory_id': da.accessory.id,
                'accessory_name': da.accessory.name,
                'count': da.count,
                'notes': da.notes,
                'assigned_date': da.assigned_date.isoformat()
            })
        
        driver_data = {
            'id': driver.id,
            'driver_name': driver.driver_name,
            'iqama': driver.iqama,
            'mobile': driver.mobile,
            'company_id': driver.assigned_company.id if driver.assigned_company else None,
            'company_name': driver.assigned_company.company_name if driver.assigned_company else None,
            'vehicle_type': driver.vehicle_type,
            'commission_rate': float(driver.commission_rate) if driver.commission_rate else None,
            'accessories': driver_accessories,
            'status': driver.status,
        }
        
        return JsonResponse({
            'success': True,
            'driver': driver_data
        })
        
    except Driver.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Driver not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
