from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'accounts'

router = DefaultRouter()
router.register(r'', views.UserViewSet, basename='accounts')

urlpatterns = [
    path('qr/code', views.qr_code, name='qr-code'),
    path('', include(router.urls)),
]
