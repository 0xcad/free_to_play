from django.shortcuts import render

from .serializers import ItemSerializer, ItemPurchaseSerializer, ItemCategorySerializer
from accounts.permissions import UserJoinedAudience
from rest_framework import generics, viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.views.decorators.csrf import csrf_exempt

from .models import Item, ItemPurchase, ItemCategory, StripeCheckoutSession
from play.models import PlayInstance
from accounts.models import User

import stripe
from django.conf import settings
from django.http import HttpResponse
from django.core.cache import cache

def fulfill_checkout(session_id):
    '''
    Create a checkout session, save it, and fulfill the purchase
    Here we change the user's balance by the amount of gems purchased
    '''
    print("Fulfilling Checkout Session", session_id)
    checkout_session = stripe.checkout.Session.retrieve(
        session_id,
        expand=['line_items'],
    )

    user = User.objects.filter(email=checkout_session.customer_email).first()
    CheckoutSession, created = StripeCheckoutSession.objects.get_or_create(
        session_id=checkout_session.id,
        defaults={
            'user': user,
            'completed': False,
        }
    )

    # Check the Checkout Session's payment_status property
    # to determine if fulfillment should be performed
    if checkout_session.payment_status != 'unpaid' and not CheckoutSession.completed:
        user = CheckoutSession.user
        print("fulfilling checkout for user", user)
        for item in checkout_session.line_items.data:
            gems = item.price.metadata.get('gems', 0)
            print('giving user', user, gems, 'gems')
            if gems and user:
                user.balance += int(gems)
                user.save()
        CheckoutSession.completed = True
        CheckoutSession.save()

def authorize_stripe():
    '''
    add api key to stripe
    return play_instance
    '''
    play_instance = PlayInstance.get_active()
    if play_instance.is_debug:
        stripe.api_key = settings.STRIPE_TEST_SK
    else:
        stripe.api_key = settings.STRIPE_SK
    return play_instance

class StripeViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['POST'], permission_classes=[permissions.IsAuthenticated])
    def create_checkout_session(self, request):
        """
        Create a Stripe checkout session for purchasing gems.
        """
        user = request.user
        authorize_stripe()

        price_id = request.data.get('price_id')
        # ^user supplies which product they want to buy

        try:
            session = stripe.checkout.Session.create(
                ui_mode = 'embedded',
                customer_email= user.email,
                billing_address_collection='auto',
                line_items=[
                    {
                        # Provide the exact Price ID (for example, price_1234) of the product you want to sell
                        'price': price_id,
                        'quantity': 1,
                    },
                ],
                mode='payment',
                redirect_on_completion='if_required',
                return_url=settings.FRONTEND_URL + '/store?checkout_success=true',
            )
        except Exception as e:
            print(e)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        print(session.client_secret)

        return Response({'clientSecret': session.client_secret}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['GET'], permission_classes=[permissions.IsAuthenticated])
    def products(self, request):
        """
        List available products for purchase.
        """
        CACHE_KEY = 'stripe_products'
        cached_products = cache.get(CACHE_KEY)
        if cached_products:
            return Response(cached_products, status=status.HTTP_200_OK)

        authorize_stripe()
        stripe_prices = stripe.Price.list(expand=['data.product'], limit=10)
        products = []

        # poor man's serializer
        for price in stripe_prices.data:
            product = price.product
            product_info = {
                'name': product.name,
                'description': product.description,
                'id': price.id,
                'images': product.images,
                'gems': int(price.metadata.get('gems', 0)),
                'price': price.unit_amount / 100,  # Convert cents to dollars
            }
            products.append(product_info)

        CACHE_TIMEOUT = 60 if settings.DEBUG else 60 * 60  # 60 seconds in debug, 1 hour in production
        cache.set(CACHE_KEY, products, timeout=CACHE_TIMEOUT)
        return Response(products, status=status.HTTP_200_OK)

    @csrf_exempt
    @action(detail=False, methods=['POST', "GET"], permission_classes=[permissions.AllowAny])
    def webhook(self, request):
        '''
        Stripe purchases call this webhook when a purchase is completed
        '''
        authorize_stripe()

        payload = request.body
        sig_header = request.META['HTTP_STRIPE_SIGNATURE']
        event = None
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

        try:
            event = stripe.Webhook.construct_event(
              payload, sig_header, endpoint_secret
            )
        except ValueError as e:
            # Invalid payload
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            return HttpResponse(status=400)

        if (event['type'] == 'checkout.session.completed'
            or event['type'] == 'checkout.session.async_payment_succeeded'):
            fulfill_checkout(event['data']['object']['id'])

        return HttpResponse(status=200)

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

