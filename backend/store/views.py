from django.shortcuts import render

from .serializers import ItemSerializer, ItemPurchaseSerializer
from accounts.permissions import UserJoinedAudience


class ItemsListView(generics.ListAPIView):
    """
    List all items available for purchase in the current play instance.
    """
    serializer_class = ItemSerializer
    permissions = [UserJoinedAudience]

    def get_queryset(self):
        # TODO: eventually filter by visibility?
        # play_instance = PlayInstance.get_active()

        return Item.objects.all()

class InventoryView(generics.ListAPIView):
    """
    List all items purchased by the user in the current play instance.
    """
    serializer_class = ItemPurchaseSerializer
    permissions = [UserJoinedAudience]

    def get_queryset(self):
        user = self.request.user
        return user.inventory.all()


class ItemPurchaseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling item purchases.
    """
    serializer_class = ItemPurchaseSerializer
    permissions = [UserJoinedAudience]

    def get_queryset(self):
        play_instance = PlayInstance.get_active()
        return play_instance.purchased_items.all()

    def perform_create(self, serializer):
        # Assuming the user is authenticated and available in the request
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["POST"], permission_classes=[UserJoinedAudience])
    def gems(self, request, *args, **kwargs):
        user = self.request.user
        gems = request.data.get('gems')
        if gems is None or type(gems) is not int or gems <= 0 or gems > 1000:
            return Response({"details": "Invalid gems amount"}, status=status.HTTP_400_BAD_REQUEST)
        user.balance += gems
        user.save()
        return Response({
            "balance": user.balance
        }, status=status.HTTP_200_OK)
