from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

'''
app is something like play.PlayInstance, or chat.ChatMessage
action is something like created, updated, deleted -- or just put random shit in there
'''
def send_notification(app=None, action=None, data={}):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "notifications",
        {"type": "send_event", "app": app, "action": action, "data": data}
    )
