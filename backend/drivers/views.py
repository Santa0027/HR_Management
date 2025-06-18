from rest_framework import viewsets, permissions
from .models import Driver, DriverLog
from .serializers import DriverSerializer, DriverLogSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from rest_framework.decorators import api_view



class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all().order_by('-created_at')
    serializer_class = DriverSerializer
    # permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # 👈 Required to parse file uploads

    def perform_create(self, serializer):
        serializer.save(submitted_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    def create(self, request, *args, **kwargs):
        print("Request DATA:", request.data)
        print("Request FILES:", request.FILES)
        return super().create(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        print("PATCH data received:", request.data)
        return super().partial_update(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='new-requests')
    def new_requests(self, request):
        pending_drivers = Driver.objects.filter(status='pending').order_by('-created_at')
        serializer = self.get_serializer(pending_drivers, many=True)
        return Response(serializer.data)
        

@api_view(['GET'])
def onboarded_drivers(request):
    """
    Return only drivers with account_status = 'Approved'
    """
    approved_drivers = Driver.objects.filter(status='approved')  # or profile_status='Approved'
    serializer = DriverSerializer(approved_drivers, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)        

class DriverLogViewSet(viewsets.ModelViewSet):
    queryset = DriverLog.objects.all().order_by('-timestamp')
    serializer_class = DriverLogSerializer
    permission_classes = [permissions.IsAuthenticated]
from django.http import JsonResponse
from .models import Driver

def get_drivers_by_company(request, company_id):
    drivers = Driver.objects.filter(company_id=company_id).values()
    return JsonResponse(list(drivers), safe=False)