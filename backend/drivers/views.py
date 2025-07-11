from rest_framework import viewsets, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.http import JsonResponse

from .models import Driver, DriverLog
from .serializers import DriverSerializer, DriverLogSerializer
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser

class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all().order_by('-created_at')
    serializer_class = DriverSerializer
    permission_classes = [AllowAny]  # Use IsAuthenticated for protected endpoints
    parser_classes = [JSONParser, MultiPartParser, FormParser]

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
@permission_classes([AllowAny])
def onboarded_drivers(request):
    """
    Return only drivers with status = 'approved'
    """
    approved_drivers = Driver.objects.filter(status='approved')
    serializer = DriverSerializer(approved_drivers, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


class DriverLogViewSet(viewsets.ModelViewSet):
    queryset = DriverLog.objects.all().order_by('-timestamp')
    serializer_class = DriverLogSerializer
    permission_classes = [IsAuthenticated]


def get_drivers_by_company(request, company_id):
    """
    Returns drivers filtered by company ID
    """
    drivers = Driver.objects.filter(company_id=company_id).values()
    return JsonResponse(list(drivers), safe=False)
