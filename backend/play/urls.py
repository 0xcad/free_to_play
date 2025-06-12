from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'play'
router = DefaultRouter()
router.register('', views.PlayInstanceViewSet, basename='play')

urlpatterns = [
    path('', include(router.urls)),
]

