from django.urls import path, include
from . import views

from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'', views.ItemPurchaseViewSet, basename='ItemPurchase')


app_name = "store"
urlpatterns = [
    path('items', views.ItemListView.as_view(), name='item_list'),
    path('purchase', include(router.urls)),
]

