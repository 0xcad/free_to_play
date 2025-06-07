from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import authentication, permissions

from rest_framework_simplejwt.tokens import RefreshToken

from .models import PlayInstance
from .serializers import PlayInstanceSerializer
from accounts.serializers import UserSerializer

class PlayInstanceView(APIView):
    """
    Return current play instance + user
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        refresh = RefreshToken.for_user(user)

        play_instance_data = {}
        if user.is_joined:
            play_instance = PlayInstance.get_active()
            play_instance_data = PlayInstanceSerializer(play_instance).data

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
            'play_instance': play_instance_data
        });
