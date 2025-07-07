from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from .models import (
    VehicleRegistration,
    VehicleLog,
    VehicleServiceRecord,
    VehicleFuelRecord,
    VehicleRentalRecord,
    VehicleExpense
)
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .serializers import (
    VehicleRegistrationSerializer,
    VehicleLogSerializer,
    VehicleServiceRecordSerializer,
    VehicleFuelRecordSerializer,
    VehicleRentalRecordSerializer,
    VehicleExpenseSerializer
)



from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated


class VehicleRegistrationViewSet(viewsets.ModelViewSet):
    queryset = VehicleRegistration.objects.all().order_by('-created_at')
    serializer_class = VehicleRegistrationSerializer
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        # Log vehicle creation
        vehicle = serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)
        VehicleLog.objects.create(
            vehicle=vehicle,
            user=self.request.user if self.request.user.is_authenticated else None,
            action='CREATED',
            remarks=f'Vehicle {vehicle.vehicle_name} created'
        )

    def perform_update(self, serializer):
        # Log vehicle update
        vehicle = serializer.save()
        VehicleLog.objects.create(
            vehicle=vehicle,
            user=self.request.user if self.request.user.is_authenticated else None,
            action='UPDATED',
            remarks=f'Vehicle {vehicle.vehicle_name} updated'
        )

    def perform_destroy(self, instance):
        # Log vehicle deletion
        VehicleLog.objects.create(
            vehicle=instance,
            user=self.request.user if self.request.user.is_authenticated else None,
            action='DELETED',
            remarks=f'Vehicle {instance.vehicle_name} deleted'
        )
        super().perform_destroy(instance)

    @action(detail=True, methods=['post'])
    def assign_driver(self, request, pk=None):
        """Assign a driver to the vehicle"""
        vehicle = self.get_object()
        driver_id = request.data.get('driver_id')

        if driver_id:
            from drivers.models import Driver
            try:
                driver = Driver.objects.get(id=driver_id)
                vehicle.assigned_driver = driver
                vehicle.save()

                # Log driver assignment
                VehicleLog.objects.create(
                    vehicle=vehicle,
                    user=request.user if request.user.is_authenticated else None,
                    action='ASSIGNED',
                    remarks=f'Driver {driver.driver_name} assigned to vehicle {vehicle.vehicle_name}'
                )

                return Response({'status': 'Driver assigned successfully'})
            except Driver.DoesNotExist:
                return Response({'error': 'Driver not found'}, status=400)
        else:
            # Unassign driver
            old_driver = vehicle.assigned_driver
            vehicle.assigned_driver = None
            vehicle.save()

            if old_driver:
                VehicleLog.objects.create(
                    vehicle=vehicle,
                    user=request.user if request.user.is_authenticated else None,
                    action='UNASSIGNED',
                    remarks=f'Driver {old_driver.driver_name} unassigned from vehicle {vehicle.vehicle_name}'
                )

            return Response({'status': 'Driver unassigned successfully'})

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get vehicle statistics"""
        vehicle = self.get_object()

        # Calculate basic statistics
        stats = {
            'total_services': vehicle.service_records.count() if hasattr(vehicle, 'service_records') else 0,
            'total_fuel_records': vehicle.fuel_records.count() if hasattr(vehicle, 'fuel_records') else 0,
            'total_expenses': vehicle.expenses.count() if hasattr(vehicle, 'expenses') else 0,
            'current_odometer': vehicle.current_odometer,
            'days_since_last_service': 0,  # Calculate based on last_service_date
            'documents_expiring_soon': []
        }

        # Check for expiring documents
        from datetime import date, timedelta
        thirty_days_from_now = date.today() + timedelta(days=30)

        if vehicle.insurance_expiry_date and vehicle.insurance_expiry_date <= thirty_days_from_now:
            stats['documents_expiring_soon'].append('Insurance')
        if vehicle.rc_expiry_date and vehicle.rc_expiry_date <= thirty_days_from_now:
            stats['documents_expiring_soon'].append('RC')
        if vehicle.next_service_date and vehicle.next_service_date <= thirty_days_from_now:
            stats['documents_expiring_soon'].append('Service Due')

        return Response(stats)


# Additional ViewSets for new models
class VehicleServiceRecordViewSet(viewsets.ModelViewSet):
    queryset = VehicleServiceRecord.objects.all().order_by('-service_date')
    serializer_class = VehicleServiceRecordSerializer
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        service_record = serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)
        # Log service record creation
        VehicleLog.objects.create(
            vehicle=service_record.vehicle,
            user=self.request.user if self.request.user.is_authenticated else None,
            action='SERVICE_SCHEDULED',
            remarks=f'Service scheduled for {service_record.vehicle.vehicle_name}'
        )

class VehicleFuelRecordViewSet(viewsets.ModelViewSet):
    queryset = VehicleFuelRecord.objects.all().order_by('-fuel_date')
    serializer_class = VehicleFuelRecordSerializer
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        fuel_record = serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)
        # Log fuel record creation
        VehicleLog.objects.create(
            vehicle=fuel_record.vehicle,
            user=self.request.user if self.request.user.is_authenticated else None,
            action='FUEL_REFILLED',
            remarks=f'Fuel refilled for {fuel_record.vehicle.vehicle_name} - {fuel_record.quantity_liters}L'
        )

class VehicleRentalRecordViewSet(viewsets.ModelViewSet):
    queryset = VehicleRentalRecord.objects.all().order_by('-rental_start_date')
    serializer_class = VehicleRentalRecordSerializer
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        rental_record = serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)
        # Update vehicle status to indicate it's rented
        vehicle = rental_record.vehicle
        vehicle.vehicle_status = 'RENTAL'
        vehicle.save()

class VehicleExpenseViewSet(viewsets.ModelViewSet):
    queryset = VehicleExpense.objects.all().order_by('-expense_date')
    serializer_class = VehicleExpenseSerializer
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve an expense"""
        expense = self.get_object()
        expense.is_approved = True
        expense.approved_by = request.user if request.user.is_authenticated else None
        expense.approved_at = timezone.now()
        expense.save()
        return Response({'status': 'Expense approved successfully'})

class VehicleLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VehicleLog.objects.all().order_by('-timestamp')
    serializer_class = VehicleLogSerializer
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    permission_classes = [AllowAny]


@api_view(['GET'])
def vehicle_list(request):
    vehicles = VehicleRegistration.objects.all().order_by('-created_at')
    serializer = VehicleRegistrationSerializer(vehicles, many=True)
    return Response(serializer.data)



@login_required
def vehicle_profile(request, pk):
    vehicle = get_object_or_404(VehicleRegistration, pk=pk)
    return render(request, 'vehicle_profile.html', {'vehicle': vehicle})

@login_required
def edit_vehicle(request, pk):
    vehicle = get_object_or_404(VehicleRegistration, pk=pk)
    if request.method == 'POST':
        vehicle.vehicle_name = request.POST['vehicle_name']
        vehicle.vehicle_type = request.POST['vehicle_type']
        vehicle.service_date = request.POST['service_date']
        # ...update other fields...
        vehicle.save()

        VehicleLog.objects.create(
            vehicle=vehicle,
            user=request.user,
            action='UPDATED',
            remarks='Vehicle details updated'
        )
        messages.success(request, 'Vehicle updated successfully.')
        return redirect('vehicle_profile', pk=vehicle.pk)

    return render(request, 'vehicle_edit.html', {'vehicle': vehicle})

@login_required
def delete_vehicle(request, pk):
    vehicle = get_object_or_404(VehicleRegistration, pk=pk)
    if request.method == 'POST':
        VehicleLog.objects.create(
            vehicle=vehicle,
            user=request.user,
            action='DELETED',
            remarks='Vehicle deleted'
        )
        vehicle.delete()
        messages.success(request, 'Vehicle deleted successfully.')
        return redirect('dashboard')

    return render(request, 'vehicle_confirm_delete.html', {'vehicle': vehicle})




