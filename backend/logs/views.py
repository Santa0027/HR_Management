from rest_framework import generics
from .models import ModificationLog
from .serializers import ModificationLogSerializer
from rest_framework.permissions import IsAdminUser

class ModificationLogListView(generics.ListAPIView):
    serializer_class = ModificationLogSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return ModificationLog.objects.all().order_by('-modified_at')
