import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = "chat_room"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):

        data = json.loads(text_data)
        action = data.get("action")
        '''if action == "block_user":
            # Use moderator authorization (the WS scope user is set if authentication middleware is in use).
            if not self.scope["user"].is_authenticated or not self.scope["user"].is_staff:
                return
            user_name = data.get("user_name")
            await self.channel_layer.group_send(
                self.room_group_name,
                {"type": "block_user", "user_name": user_name}
            )'''

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "action": "new_message",
            "message": event["message"]
        }))

    async def delete_message(self, event):
        await self.send(text_data=json.dumps({
            "action": "delete_message",
            "message_id": event["message_id"]
        }))

    async def kick_user(self, event):
        await self.send(text_data=json.dumps({
            "action": "kick_user",
            "username": event["username"]
        }))

    async def add_user(self, event):
        await self.send(text_data=json.dumps({
            "action": "add_user",
            "username": event["username"]
        }))

    async def leave_user(self, event):
        await self.send(text_data=json.dumps({
            "action": "leave_user",
            "username": event["username"]
        }))

    async def mute_user(self, event):
        await self.send(text_data=json.dumps({
            "action": "mute_user",
            "username": event["username"]
        }))

    async def unmute_user(self, event):
        await self.send(text_data=json.dumps({
            "action": "unmute_user",
            "username": event["username"]
        }))

