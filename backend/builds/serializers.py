from rest_framework import serializers
from catalog.models import Product
from catalog.serializers import ProductListSerializer
from .models import Build, BuildItem
from .services.compatibility import evaluate_build, evaluate_compatibility


class BuildItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    category_id = serializers.CharField(source="category.id", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = BuildItem
        fields = ["id", "category_id", "category_name", "product", "added_at"]


class BuildSerializer(serializers.ModelSerializer):
    items = BuildItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Build
        fields = [
            "id",
            "name",
            "item_count",
            "total_price",
            "items",
            "created_at",
            "updated_at",
        ]

    def get_item_count(self, obj):
        return obj.items.count()


class BuildDetailWithCompatSerializer(BuildSerializer):
    compatibility = serializers.SerializerMethodField()

    class Meta(BuildSerializer.Meta):
        fields = BuildSerializer.Meta.fields + ["compatibility"]

    def get_compatibility(self, obj):
        return evaluate_build(obj)


class BuildItemAddSerializer(serializers.Serializer):
    product_id = serializers.CharField(required=True)

    def validate_product_id(self, value):
        try:
            product = Product.objects.select_related("category").get(id=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError(f"Active product with ID '{value}' does not exist.")
        return product


class StatelessCompatCheckSerializer(serializers.Serializer):
    part_ids = serializers.ListField(
        child=serializers.CharField(),
        required=True,
        help_text="List of product IDs to evaluate (e.g. ['cpu-01', 'mb-01', 'ram-01'])",
    )


from decimal import Decimal

class BuildRecommendRequestSerializer(serializers.Serializer):
    budget = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal("500.00"),
        default=Decimal("1200.00"),
        help_text="Target budget in USD (minimum $500)",
    )
    purpose = serializers.ChoiceField(
        choices=["gaming", "workstation", "general"],
        default="gaming",
        help_text="Primary system use-case ('gaming', 'workstation', or 'general')",
    )


class BuildShareSerializer(BuildDetailWithCompatSerializer):
    shareable_url = serializers.SerializerMethodField()

    class Meta(BuildDetailWithCompatSerializer.Meta):
        fields = BuildDetailWithCompatSerializer.Meta.fields + ["shareable_url"]

    def get_shareable_url(self, obj):
        from django.conf import settings
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
        return f"{frontend_url}/builds/shared/{obj.id}"

