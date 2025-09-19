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


    @action(detail=False, methods=['POST'], permission_classes=[permissions.IsAuthenticated])
    def freelance(self, request):
        play_instance = self.get_object()

        user = request.user
        freelance_text = user.freelance_text
        if freelance_text:
            received_freelance_text = request.data.get('freelance_text')

            # they get it correct
            if freelance_text == received_freelance_text:
                user.freelance_index += 1
                user.save()
                freelance_text = user.freelance_text
            else: # incorrect, return 400
                return Response({"details": "check your text for errors!"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            'freelance_text': freelance_text,
            'completed': freelance_text is None,
            'freelance_score': play_instance.freelance_score
        })

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

        # all audience members who are not muted, not staff, and haven't played yet
        eligible_users = (
            play_instance.audience
            .filter(is_muted=False, is_participating=True, has_played=False, is_staff=False)
            .exclude(id__in=excluded_ids)
        )

        # prioritize donors if any
        filtered_users = [u for u in list(eligible_users) if u.is_donor]
        if filtered_users:
            eligible_users = filtered_users

        if not eligible_users:
            # eligible_users = play_instance.play_users.filter(is_muted=False)
            eligible_users = (
                play_instance.audience
                .filter(is_muted=False, is_participating=True, is_staff=False)
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

