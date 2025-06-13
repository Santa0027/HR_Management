from rest_framework import viewsets, permissions
from .models import Driver, DriverLog
from .serializers import DriverSerializer, DriverLogSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny



class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all().order_by('-submitted_at')
    serializer_class = DriverSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]  # 👈 Required to parse file uploads

    def perform_create(self, serializer):
        serializer.save(submitted_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    def create(self, request, *args, **kwargs):
        print("Request DATA:", request.data)
        print("Request FILES:", request.FILES)
        return super().create(request, *args, **kwargs)
        

class DriverLogViewSet(viewsets.ModelViewSet):
    queryset = DriverLog.objects.all().order_by('-timestamp')
    serializer_class = DriverLogSerializer
    permission_classes = [permissions.IsAuthenticated]
