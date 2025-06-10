from django.urls import path
from . import views

app_name = 'play'
urlpatterns = [
    path('', views.PlayInstanceView.as_view(), name='play'),
    path('join', views.JoinView.as_view(), name='join'),
]

