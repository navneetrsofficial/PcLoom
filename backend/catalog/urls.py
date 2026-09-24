from django.urls import path
from .views import (
    CategoryListView,
    ProductListView,
    ProductDetailView,
    CompareView,
)

app_name = "catalog"

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("products/", ProductListView.as_view(), name="product-list"),
    path("products/<str:id>/", ProductDetailView.as_view(), name="product-detail"),
    path("compare/", CompareView.as_view(), name="product-compare"),
]
