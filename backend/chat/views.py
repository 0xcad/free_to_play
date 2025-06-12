import redis
from django.conf import settings
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import ChatMessage
from accounts.models import User
from play.models import PlayInstance# TODO?, UserPlayInstance

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from accounts.permissions import UserJoinedAudience
from notifications.utils import send_notification

from .serializers import (
        ChatMessageSerializer,
        CreateChatMessageSerializer
)
from .pagination import ChatCursorPagination

from datetime import datetime
import random

# Instantiate a Redis client (adjust host/port as needed)
redis_client = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0)

class ChatViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, UserJoinedAudience]
    pagination_class = ChatCursorPagination

    def get_serializer_class(self, *args, **kwargs):
        if self.action == 'create':
            return CreateChatMessageSerializer
        return ChatMessageSerializer

    def get_queryset(self):
        return ChatMessage.objects.filter(
            play_instance=PlayInstance.get_active(),
            user__is_muted=False
        )

    def perform_create(self, serializer):
        # set the current play instance and user
        play_instance=PlayInstance.get_active()
        serializer.save(user=self.request.user, play_instance=play_instance)

    def create(self, request, *args, **kwargs):
        if request.user.is_muted:
            return Response({'details': "You've been muted :("}, status=status.HTTP_403_FORBIDDEN)

        play_instance=PlayInstance.get_active()

        if not play_instance or play_instance.status != 'running':
            return Response({"details": "No play instance running right now"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        full_serializer = ChatMessageSerializer(serializer.instance)

        send_notification('chat.ChatMessage', 'created', full_serializer.data)

        # Return the response with the created data
        return Response(full_serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        raise PermissionDenied("Updating chat messages is not allowed.")

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only admins can delete chat messages")


        instance = self.get_object()
        message_id = instance.id
        self.perform_destroy(instance)

        send_notification('chat.ChatMessage', 'deleted', {'message_id': message_id})
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["POST"])
    def kick(self, request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied("Only admins can kick users")
        user_id = request.data.get("user_id")
        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({"details": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        elif user.is_staff:
            return Response({"details": "Cannot kick staff users"}, status=status.HTTP_403_FORBIDDEN)
        play_instance = PlayInstance.get_active()
        play_instance.audience.remove(user)
        send_notification('accounts.User', 'kicked', {'user_id': user_id})
        return Response({"details": 'kicked user from the play'}, status=status.HTTP_200_OK)
