from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, authentication, permissions

from rest_framework_simplejwt.tokens import RefreshToken

from .models import PlayInstance
from .serializers import PlayInstanceSerializer
from accounts.serializers import UserSerializer, UserListSerializer
from notifications.utils import send_notification

class PlayInstanceView(APIView):
    """
    Return current play instance + user
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        refresh = RefreshToken.for_user(user)

        play_instance_data = {}
        play_instance = PlayInstance.get_active()
        if user.is_joined:
            play_instance_data = PlayInstanceSerializer(play_instance).data

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
            'play_instance': play_instance_data,
            'users': UserListSerializer(play_instance.audience, many=True).data,
        });

class JoinView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        join_code = request.data.get('join_code')
        if request.user.is_joined:
            return Response({"details": "Already in active play"}, status=status.HTTP_200_OK)

        play_instance = PlayInstance.get_active()
        if join_code and play_instance and play_instance.join_code == join_code.strip():
            play_instance.audience.add(request.user)
            send_notification('accounts.User', 'joined', UserListSerializer(request.user).data)
            return Response({"details": "Successfully joined the current play!"}, status=status.HTTP_200_OK)
        else:
            return Response({"details": "Invalid code"}, status=status.HTTP_400_BAD_REQUEST)
