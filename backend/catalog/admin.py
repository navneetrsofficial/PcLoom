from django.contrib import admin
from .models import Category, SpecDefinition, Product


class SpecDefinitionInline(admin.TabularInline):
    model = SpecDefinition
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug", "order")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [SpecDefinitionInline]


@admin.register(SpecDefinition)
class SpecDefinitionAdmin(admin.ModelAdmin):
    list_display = ("category", "label", "key", "data_type", "unit", "higher_is_better")
    list_filter = ("category", "data_type")
    search_fields = ("label", "key")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "brand", "category", "price", "stock", "is_active")
    list_filter = ("category", "brand", "is_active")
    search_fields = ("id", "name", "brand")
    readonly_fields = ("created_at", "updated_at")
