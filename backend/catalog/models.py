from decimal import Decimal
from django.db import models


class Category(models.Model):
    """Component category (e.g. CPU, Motherboard, GPU, etc.)."""

    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["order", "name"]

    def __str__(self):
        return self.name


class SpecDefinition(models.Model):
    """Dynamic specification schema for a category."""

    DATA_TYPE_CHOICES = [
        ("string", "String"),
        ("integer", "Integer"),
        ("float", "Float"),
        ("boolean", "Boolean"),
        ("list", "List / Multi-value"),
    ]

    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="spec_definitions"
    )
    key = models.CharField(max_length=50)
    label = models.CharField(max_length=100)
    unit = models.CharField(max_length=20, blank=True)
    data_type = models.CharField(
        max_length=20, choices=DATA_TYPE_CHOICES, default="string"
    )
    # None = neutral/categorical, True = higher is better, False = lower is better
    higher_is_better = models.BooleanField(null=True, blank=True)

    class Meta:
        unique_together = ("category", "key")
        ordering = ["category", "key"]

    def __str__(self):
        return f"{self.category.name} - {self.label} ({self.key})"


class Product(models.Model):
    """Hardware component with typed JSON specs validated against SpecDefinitions."""

    id = models.CharField(max_length=50, primary_key=True)  # e.g. 'cpu-01'
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="products"
    )
    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=100, db_index=True)
    seller_name = models.CharField(max_length=100, default="PartFit Direct")
    price = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("99.99")
    )
    stock = models.PositiveIntegerField(default=50)
    image_url = models.URLField(max_length=500, blank=True)
    specs = models.JSONField(default=dict)
    source_url = models.URLField(max_length=500, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["category", "brand", "name"]
        indexes = [
            models.Index(fields=["category", "brand"]),
            models.Index(fields=["category", "price"]),
        ]

    def __str__(self):
        return f"{self.brand} {self.name} ({self.id})"
