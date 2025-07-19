from django.urls import path, include
from . import views

from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'', views.ItemViewSet, basename='items')

stripe_router = DefaultRouter()
stripe_router.register(r'', views.StripeViewSet, basename='stripe')

app_name = "store"
urlpatterns = [
    path('items/', include(router.urls)),
    path('buy-gems/', views.BuyGemsView.as_view(), name='buy-gems'),
    path('stripe/', include(stripe_router.urls)),
]

