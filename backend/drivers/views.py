from rest_framework import viewsets, permissions
from .models import Driver, DriverLog
from .serializers import DriverSerializer, DriverLogSerializer

class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all().order_by('-submitted_at')
    serializer_class = DriverSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(submitted_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

class DriverLogViewSet(viewsets.ModelViewSet):
    queryset = DriverLog.objects.all().order_by('-timestamp')
    serializer_class = DriverLogSerializer
    permission_classes = [permissions.IsAuthenticated]
