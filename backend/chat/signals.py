'''
from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import ChatMessage
from .serializers import ChatMessageSerializer

from notifications.utils import send_notification

#Every time a chat message gets deleted, send a websocket to frontend with id...
@receiver(post_delete, sender=PlayInstance)
def chat_message_deleted(sender, instance, created, **kwargs):
    if not created and instance.is_active:
        serialized = PlayInstanceSerializer(instance).data
        send_notification('play.PlayInstance', 'updated', serialized)
'''
