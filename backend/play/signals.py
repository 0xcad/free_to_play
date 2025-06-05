from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import PlayInstance
from .serializers import PlayInstanceSerializer

from notifications.utils import send_notification

'''
Every time the active play instance updates, send a websocket to frontend
'''
@receiver(post_save, sender=PlayInstance)
def play_instance_saved(sender, instance, created, **kwargs):
    if not created and instance.is_active:
        serialized = PlayInstanceSerializer(instance).data
        send_notification('play.PlayInstance', 'updated', serialized)
