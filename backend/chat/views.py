import redis
from django.conf import settings
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import ChatMessage
from play.models import PlayInstance

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
            user__is_muted=False,
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
        self.perform_destroy(instance)

        send_notification('chat.ChatMessage', 'deleted', {'id': instance.id})
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["POST"])
    def kick(self, request, *args, **kwargs):
        print(request.data)


'''
class JoinChatView(APIView):
    #API endpoint for joining the chat.
    #Expects a JSON payload with 'username'.
    def post(self, request, format=None):
        username = request.session.get("chat_username")
        if username and redis_client.sismember("active_users", username):
            return Response({"success": True, "username": username}, status=status.HTTP_200_OK)
        elif username:
            request.session.pop("chat_username")

        username = request.data.get("username")
        if not username:
            return Response({"error": "No username provided"}, status=status.HTTP_400_BAD_REQUEST)
        if redis_client.sismember("active_users", username):
            return Response({"error": "Username already in use."}, status=status.HTTP_400_BAD_REQUEST)
        redis_client.sadd("active_users", username)
        request.session["chat_username"] = username

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "chat_room",
            {"type": "add_user", "username": username}
        )
        return Response({"success": True, "username": username}, status=status.HTTP_200_OK)


class ChatMessagesView(APIView):
    #API endpoint for retrieving chat messages (GET) and sending a new message (POST).
    #GET: Returns a list of messages.
    #POST: Creates a new message from the current session user.

    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, format=None):
        messages = list(ChatMessage.objects.all().order_by("timestamp").values())
        return Response({"messages": messages}, status=status.HTTP_200_OK)

    def post(self, request, format=None):
        username = request.session.get("chat_username")
        # no username, or username isn't an actual member
        if not username or not redis_client.sismember("active_users", username):
            if username:
                request.session.pop("chat_username")
            return Response({"error": "User not joined"}, status=status.HTTP_400_BAD_REQUEST)

        content = request.data.get("content")
        if not content:
            return Response({"error": "No content provided"}, status=status.HTTP_400_BAD_REQUEST)

        message_data = {
            "id": random.randint(1000,2000),
            "username": username,
            "content": content,
            "timestamp": datetime.now().isoformat(),
        }

        # don't do anything on backend if the user is muted
        if redis_client.sismember("muted_users", username):
            return Response({"success": True, "message": message_data}, status=status.HTTP_201_CREATED)

        # create new message
        message = ChatMessage.objects.create(username=username, content=content)
        message_data['id'] = message.id
        message_data["timestamp"] = message.timestamp.isoformat(),
        # Broadcast new message event via Channels.
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "chat_room",
            {"type": "chat_message", "message": message_data}
        )
        return Response({"success": True, "message": message_data}, status=status.HTTP_201_CREATED)

class UsersView(APIView):
    #API endpoint for retrieving users currently in redis cache
    def get(self, request, format=None):
        active_users = redis_client.smembers("active_users")
        username = request.session.get("chat_username", "")
        if username and not redis_client.sismember("active_users", username):
            request.session.pop('chat_username', None)
            username = None

        muted_users = redis_client.smembers("muted_users")
        return Response(
                {'user': username,
                 'users': active_users,
                 'muted_users': muted_users,
                }, status=status.HTTP_200_OK)


class KickUser(APIView):
    #API endpoint for moderators to kick users
    #Only accessible to authenticated staff users.
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        username = request.data.get("user")
        print('kicking', username)

        if not username or not redis_client.sismember("active_users", username):
            return Response({"error": "No active user with that name"}, status=status.HTTP_400_BAD_REQUEST)

        # remove user
        redis_client.srem("active_users", username)
        # send websocket to user that got kicked
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "chat_room",
            {"type": "kick_user", "username": username}
        )

        return Response({'success': True}, status=status.HTTP_200_OK)


class MuteUser(APIView):
    #API endpoint for moderators to kick users
    #Only accessible to authenticated staff users.
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        username = request.data.get("user")

        if not username or not redis_client.sismember("active_users", username):
            return Response({"error": "No active user with that name"}, status=status.HTTP_400_BAD_REQUEST)

        channel_layer = get_channel_layer()
        if redis_client.sismember("muted_users", username):
            redis_client.srem("muted_users", username)
            async_to_sync(channel_layer.group_send)(
                "chat_room",
                {"type": "unmute_user", "username": username}
            )
            return Response({'success': True, 'unmuted': True}, status=status.HTTP_200_OK)

        # mute user
        redis_client.sadd("muted_users", username)
        # send websocket to user that got muted
        async_to_sync(channel_layer.group_send)(
            "chat_room",
            {"type": "mute_user", "username": username}
        )

        return Response({'success': True, 'muted': True}, status=status.HTTP_200_OK)
'''
