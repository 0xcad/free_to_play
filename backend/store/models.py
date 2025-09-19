from django.db import models

from accounts.models import User
from play.models import PlayInstance

ITEM_TYPE_CHOICES = [
    ('user', 'User'),
    ('play', 'Play'),
]


class ItemCategory(models.Model):
    name = models.CharField(max_length=50, unique=True, help_text="The name of the item category.")
    description = models.TextField(null=True, blank=True)
    icon = models.CharField(max_length=15, null=True, blank=True)
    order = models.PositiveIntegerField(null=True, blank=True, help_text="Order of this category in the list, lower numbers appear first.")
    item_type = models.CharField(max_length=10, choices=ITEM_TYPE_CHOICES, null=True, blank=True)

    class Meta:
        ordering = ['order', 'name']
        verbose_name_plural = 'Item Categories'

    def __str__(self):
        return self.name

class Item(models.Model):
    """
    Represents an item in the game.
    Items persist between play instances
    """
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True, null=True)
    image = models.ImageField(upload_to='items/', blank=True, null=True)
    cost = models.IntegerField(default=0)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(ItemCategory, on_delete=models.SET_NULL, related_name='items', null=True, blank=True, help_text="The category this item belongs to.")
    item_type = models.CharField(max_length=10, choices=ITEM_TYPE_CHOICES, help_text="Buy it for yourself or for the play.", null=True, blank=True)
    quantity = models.PositiveIntegerField(default=0, help_text="How many of this item are available per play instance.", blank=True, null=True)
    order = models.PositiveIntegerField(default=0, help_text="Order of this item in the list, lower numbers appear first.", blank=True, null=True)


    def __str__(self):
        return self.name

    class Meta:
        ordering = ['category__order', 'order', 'name']

    def count(self, user):
        '''
        How many have been purchased in the current active play instance
        '''
        if self.item_type == 'user':
            return self.purchased_items.filter(play_instance__is_active=True, user=user).count()
        return self.purchased_items.filter(play_instance__is_active=True).count()

    def is_available(self, user):
        count = self.count(user)
        return (not self.quantity or count < self.quantity)

class ItemPurchase(models.Model):
    '''
    An item that has been purchased by a user in a specific play instance.
    These reset between play instances
    '''
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='all_purchased_items')
    play_instance = models.ForeignKey(PlayInstance, on_delete=models.CASCADE, related_name='purchased_items')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='purchased_items')
    created = models.DateTimeField(auto_now_add=True, help_text="When the item was purchased.")

    class Meta:
        ordering = ['play_instance', 'item__category__order', 'item__order', 'item__name']

class StripeCheckoutSession(models.Model):
    """
    Represents a Stripe Checkout session.
    """
    session_id = models.CharField(max_length=255, unique=True, help_text="The unique ID of the Stripe Checkout session.")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stripe_checkouts', help_text="The user who initiated the checkout.")
    created_at = models.DateTimeField(auto_now_add=True, help_text="When the checkout session was created.")
    completed = models.BooleanField(default=False, help_text="Whether the checkout session has been completed.")

    def __str__(self):
        return f"Checkout {self.session_id} for {self.user.username}"
