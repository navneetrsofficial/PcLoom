from rest_framework import serializers
from .models import Category, SpecDefinition, Product


class SpecDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpecDefinition
        fields = ["key", "label", "unit", "data_type", "higher_is_better"]


class CategorySerializer(serializers.ModelSerializer):
    spec_definitions = SpecDefinitionSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "order", "spec_definitions"]


class ProductListSerializer(serializers.ModelSerializer):
    category_id = serializers.CharField(source="category.id", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "category_id",
            "category_name",
            "name",
            "brand",
            "seller_name",
            "price",
            "stock",
            "image_url",
            "specs",
            "is_active",
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "category",
            "name",
            "brand",
            "seller_name",
            "price",
            "stock",
            "image_url",
            "specs",
            "source_url",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
