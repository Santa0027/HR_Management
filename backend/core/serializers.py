from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        # Make sure we use 'email' instead of 'username'
        attrs['username'] = attrs.get('email')
        return super().validate(attrs)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['user'] = {
            "id": self.user.id,
            "email": self.user.email,
            "name": self.user.get_full_name()
        }
        return data
