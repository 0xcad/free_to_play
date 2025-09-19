from rest_framework import serializers
from .models import Item, ItemPurchase, ItemCategory

class ItemCategorySerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    class Meta:
        model = ItemCategory
        fields = ['id', 'name', 'description', 'icon', 'order', 'items']

    def get_items(self, obj):
        items = obj.items.all()
        return items.values_list('id', flat=True)

class ItemSerializer(serializers.ModelSerializer):
    count = serializers.SerializerMethodField()
    is_available = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = ['id',
                  'name',
                  'slug',
                  'image',
                  'cost',
                  'description',
                  'count',
                  'quantity',
                  'is_available',
                  'item_type',
                ]

    def get_is_available(self, obj):
        request = self.context.get('request')
        return obj.is_available(request.user) if request else False

    def get_count(self, obj):
        request = self.context.get('request')
        return obj.count(user=request.user)

class ItemPurchaseSerializer(serializers.ModelSerializer):
    item_id = serializers.PrimaryKeyRelatedField(source='item', read_only=True)
    item_type = serializers.CharField(source='item.item_type', read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(source='user', read_only=True)
    created = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S.%fZ')

    class Meta:
        model = ItemPurchase
        fields = ['id', 'user_id', 'item_id', 'item_type', 'created']
