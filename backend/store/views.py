from django.shortcuts import render

from .serializers import ItemSerializer, ItemPurchaseSerializer, ItemCategorySerializer
from accounts.permissions import UserJoinedAudience
from rest_framework import generics, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Item, ItemPurchase, ItemCategory
from play.models import PlayInstance

class BuyGemsView(generics.GenericAPIView):
    """
    View for purchasing gems.
    """
    permissions = [UserJoinedAudience]

    def post(self, request, *args, **kwargs):
        user = self.request.user
        gems = request.data.get('gems')
        if gems is None or type(gems) is not int or gems <= 0 or gems > 1000:
            return Response({"details": "Invalid gems amount"}, status=status.HTTP_400_BAD_REQUEST)
        user.balance += gems
        user.save()
        return Response({
            "balance": user.balance
        }, status=status.HTTP_200_OK)

class ItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling items.

    * /items/ -- list items available to purchase, grouped by category
    * /items/<id> -- get item details
    * /items/<id>/purchase -- purchase an item, returns the item purchased
    * /items/inventory -- get the user's inventory, and play inventory
    """
    serializer_class = ItemSerializer
    permissions = [UserJoinedAudience]

    def get_queryset(self):
        return Item.objects.all()

    def list(self, request, *args, **kwargs):
        """
        List all items available to purchase, grouped by category.
        """
        queryset = self.get_queryset()
        categories = ItemCategory.objects.all()
        serializer = self.get_serializer(queryset, many=True)

        data = {'categories': ItemCategorySerializer(categories, many=True).data,
                'items': serializer.data}
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[UserJoinedAudience])
    def purchase(self, request, pk=None):
        """
        Purchase an item.
        """
        item = self.get_object()
        user = request.user
        play_instance = PlayInstance.get_active()

        if not item.is_available:
            return Response({"details": "Item is not available"}, status=status.HTTP_400_BAD_REQUEST)

        if user.balance < item.cost:
            return Response({"details": "Insufficient balance"}, status=status.HTTP_400_BAD_REQUEST)

        # Create the purchase record
        purchase = ItemPurchase.objects.create(user=user, item=item, play_instance=play_instance)

        # Deduct the cost from user's balance
        user.balance -= item.cost
        user.save()

        serializer = self.get_serializer(item)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[UserJoinedAudience])
    def inventory(self, request):
        """
        Get the user's inventory and play inventory
        """
        user = request.user
        user_purchases = Item.objects.filter(
            id__in=user.inventory.values_list('item_id', flat=True)
        )

        play = PlayInstance.get_active()
        play_purchases = Item.objects.filter(
            id__in=play.purchased_items.filter(item__item_type='play').values_list('item_id', flat=True)
        )

        print('User purchases:', user_purchases)
        print('Play purchases:', play_purchases)

        data = {
            'user': ItemSerializer(user_purchases, many=True).data,
            'play': ItemSerializer(play_purchases, many=True).data
        }
        return Response(data, status=status.HTTP_200_OK)

