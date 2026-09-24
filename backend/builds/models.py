import uuid
from django.conf import settings
from django.db import models
from catalog.models import Category, Product


class Build(models.Model):
    """A user-assembled PC build consisting of up to one part per category."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="builds",
    )
    name = models.CharField(max_length=200, default="Custom PC Build")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.name} ({self.id})"

    @property
    def total_price(self):
        return sum(item.product.price for item in self.items.select_related("product"))


class BuildItem(models.Model):
    """An individual component in a build. Enforces at most one item per category."""

    build = models.ForeignKey(Build, on_delete=models.CASCADE, related_name="items")
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("build", "category")
        ordering = ["category__order", "category__name"]

    def __str__(self):
        return f"{self.build.name} - {self.category.name}: {self.product.name}"

    def save(self, *args, **kwargs):
        # Automatically set category to match the product category
        if self.product and not self.category_id:
            self.category = self.product.category
        super().save(*args, **kwargs)
