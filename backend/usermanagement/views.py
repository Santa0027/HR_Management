# usermanagement/views.py
from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model
from .serializers import CustomUserSerializer

User = get_user_model()

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-id')
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]
