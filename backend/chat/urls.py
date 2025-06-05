from django.urls import path, include
from . import views

from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'', views.ChatViewSet, basename='ChatMessage')


app_name = "chat"
urlpatterns = [
    path('', include(router.urls)),
]
'''
path("join/", views.JoinChatView.as_view(), name="join"),
path("leave/", views.LeaveChatView.as_view(), name="leave"),
path("messages/", views.ChatMessagesView.as_view(), name="messages"),
path("users/", views.UsersView.as_view(), name="users"),
path("kick/", views.KickUser.as_view(), name="kick"),
path("mute/", views.MuteUser.as_view(), name="mute"),
path("delete_message/<int:message_id>/", views.DeleteMessageView.as_view(), name="delete_message"),
'''

