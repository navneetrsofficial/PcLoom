from django.contrib import admin
from .models import Build, BuildItem


class BuildItemInline(admin.TabularInline):
    model = BuildItem
    extra = 0
    readonly_fields = ("category", "product", "added_at")


@admin.register(Build)
class BuildAdmin(admin.ModelAdmin):
    list_display = ("name", "id", "user", "total_price", "created_at", "updated_at")
    list_filter = ("created_at",)
    search_fields = ("name", "user__email", "id")
    inlines = [BuildItemInline]


@admin.register(BuildItem)
class BuildItemAdmin(admin.ModelAdmin):
    list_display = ("build", "category", "product", "added_at")
    list_filter = ("category",)
    search_fields = ("build__name", "product__name")
