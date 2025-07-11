from django.urls import path, include
from . import views

from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'', views.ItemViewSet, basename='items')

app_name = "store"
urlpatterns = [
    path('items/', include(router.urls)),
    path('buy-gems', views.BuyGemsView.as_view(), name='buy-gems'),
]

