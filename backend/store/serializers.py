from rest_framework import serializers
from .models import Item, ItemPurchase, ItemCategory

class ItemCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemCategory
        fields = ['name']

class ItemSerializer(serializers.ModelSerializer):
    category = ItemCategorySerializer(read_only=True)

    class Meta:
        model = Item
        fields = ['id',
                  'name',
                  'slug',
                  'image',
                  'cost',
                  'description',
                  'data',
                  'category',
                  'quantity',
                  'order',
                  'is_available', 'is_visible',
                ]

    def get_is_available(self, obj):
        return obj.is_available

    def get_is_visible(self, obj):
        return obj.is_visible

class ItemPurchaseSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)

    class Meta:
        model = ItemPurchase
        fields = ['id', 'user', 'item']
