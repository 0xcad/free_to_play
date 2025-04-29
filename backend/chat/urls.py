from django.urls import path
#from .views import JoinChatView, LeaveChatView, ChatMessagesView, DeleteMessageView
from .views import *

urlpatterns = [
    path("join/", JoinChatView.as_view(), name="api_join"),
    path("leave/", LeaveChatView.as_view(), name="api_leave"),
    path("messages/", ChatMessagesView.as_view(), name="api_messages"),
    path("users/", UsersView.as_view(), name="api_users"),
    path("kick/", KickUser.as_view(), name="api_kick"),
    path("mute/", MuteUser.as_view(), name="api_mute"),
    path("delete_message/<int:message_id>/", DeleteMessageView.as_view(), name="api_delete_message"),
]

