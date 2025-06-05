import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = "notifications"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):

        data = json.loads(text_data)
        action = data.get("action")
        # TODO: do I need anything for for this?

    async def send_event(self, event):
        '''
        All events must have action, and data
        '''
        await self.send(text_data=json.dumps({
            "app": event.get('app'),
            "action": event['action'],
            "data": event['data'],
        }))

