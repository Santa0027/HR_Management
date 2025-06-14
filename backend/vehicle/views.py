from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from django.shortcuts import get_object_or_404, redirect, render
from .models import VehicleRegistration, VehicleLog
from django.contrib.auth.decorators import login_required
from django.contrib import messages

from .models import VehicleRegistration
from .serializers import VehicleRegistrationSerializer

class VehicleRegistrationViewSet(viewsets.ModelViewSet):
    queryset = VehicleRegistration.objects.all().order_by('-created_at')
    serializer_class = VehicleRegistrationSerializer
    # authentication_classes = [SessionAuthentication]
    # permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

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