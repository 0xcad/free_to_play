from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, authentication, permissions, viewsets
from rest_framework.decorators import action

from rest_framework_simplejwt.tokens import RefreshToken

from .models import PlayInstance
from .serializers import PlayInstanceSerializer, PlayInstanceUpdateSerializer
from accounts.serializers import UserSerializer, UserListSerializer
from notifications.utils import send_notification

import random

class PlayInstanceViewSet(viewsets.ViewSet):
    """
    ViewSet for play instance operations.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """
        Retrieve the active PlayInstance.
        """
        return PlayInstance.get_active()

    # Disable list and delete
    def list(self, request):
        """
        Return current play instance + user
        """
        user = request.user
        refresh = RefreshToken.for_user(user)

        play_instance_data = {}
        play_instance = self.get_object()
        if user.is_joined:
            play_instance_data = PlayInstanceSerializer(play_instance).data

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
            'play_instance': play_instance_data,
            'users': UserListSerializer(play_instance.audience, many=True).data,
        })

    def destroy(self, request, pk=None):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def retrieve(self, request, pk=None):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(detail=False, methods=['POST'], url_path='join', permission_classes=[permissions.IsAuthenticated])
    def join(self, request):
        """
        Join the current play instance
        """
        if request.user.is_joined:
            return Response({"details": "Already in active play"}, status=status.HTTP_200_OK)

        join_code = request.data.get('join_code')
        play_instance = self.get_object()
        if join_code and play_instance and play_instance.join_code == join_code.strip():
            play_instance.add_user(request.user)
            send_notification('accounts.User', 'joined', UserListSerializer(request.user).data)
            return Response({"details": "Successfully joined the current play!"}, status=status.HTTP_200_OK)
        else:
            return Response({"details": "Invalid code"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['POST'], url_path='update', permission_classes=[permissions.IsAdminUser])
    def update_instance(self, request):
        """
        Update the current play instance. Only admins can do this.
        """
        play_instance = self.get_object()

        serializer = PlayInstanceUpdateSerializer(play_instance, data=request.data, partial=True)
        if serializer.is_valid():
            # updated_current_player = serializer.validated_data.get('current_player')
            # if updated_current_player:
            #     updated_current_player.has_played = True
            #     updated_current_player.save()
            serializer.save()
            # post-save signal should send a websocket over
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['POST'], url_path='select_player', permission_classes=[permissions.IsAdminUser])
    def select_player(self, request):
        """
        Pick a new user to play. Only admins can do this.
        """
        play_instance = self.get_object()
        excluded_ids = request.data.get('exclude', [])
        # eligible_users = play_instance.play_users.filter(is_muted=False, has_played=False)
        eligible_users = (
            play_instance.audience
            .filter(is_muted=False, is_participating=True, has_played=False, is_staff=False)
            .exclude(id__in=excluded_ids)
        )
        if not eligible_users:
            # eligible_users = play_instance.play_users.filter(is_muted=False)
            eligible_users = (
                play_instance.audience
                .filter(is_muted=False, is_participating=True, has_played=False, is_staff=False)
                .exclude(id__in=excluded_ids)
            )
        if not eligible_users:
            return Response({"details": "No eligible users to select!"}, status=status.HTTP_400_BAD_REQUEST)

        # Randomly select a user from the eligible users
        selected_user = random.choice(eligible_users)
        # play_instance.current_player = selected_user
        # play_instance.save()

        # post-save signal should send a websocket over
        return Response({'current_player': UserListSerializer(selected_user).data}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['POST'], url_path='timer/start', permission_classes=[permissions.IsAdminUser])
    def start_timer(self, request):
        """
        Start or resume the timer. Accepts optional 'duration' in seconds to override.
        """
        pi = self.get_object()
        duration_sec = request.data.get('duration')
        duration = timedelta(seconds=duration_sec) if duration_sec is not None else None
        pi.start_timer(duration=duration)
        return Response({
            'end_time': pi.end_time,
            'remaining_time': pi.remaining_time,
        })

    @action(detail=False, methods=['post'], url_path='timer/pause', permission_classes=[permissions.IsAdminUser])
    def pause_timer(self, request):
        """
        Pause the timer and save remaining_time.
        If you provide `now` in the request, it will use that as the current time.
        """
        pi = self.get_object()
        pi.pause_timer(now=request.data.get('now'))
        return Response({
            'remaining_time': pi.remaining_time,
            'end_time': None,
        })

    @action(detail=False, methods=['post'], url_path='timer/reset', permission_classes=[permissions.IsAdminUser])
    def reset_timer(self, request):
        """
        Reset the timer to default duration and stop.
        Accepts optional 'duration' in seconds to override.
        """
        pi = self.get_object()
        duration_sec = request.data.get('duration')
        duration = timedelta(seconds=duration_sec) if duration_sec is not None else None
        pi.reset_timer(duration=duration)
        return Response({
            'remaining_time': pi.remaining_time,
            'end_time': None,
        })
