from rest_framework import serializers
from .models import Item, ItemPurchase, ItemCategory

class ItemCategorySerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    class Meta:
        model = ItemCategory
        fields = ['id', 'name', 'order', 'items']

    def get_items(self, obj):
        items = obj.items.all()
        return items.values_list('id', flat=True)

class ItemSerializer(serializers.ModelSerializer):
    #category = ItemCategorySerializer(read_only=True)

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
