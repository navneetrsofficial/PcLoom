"""
URL configuration for PartFit (pc_buddy) project.
"""

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    # Django Admin
    path("admin/", admin.site.urls),
    # API Documentation (Swagger & Redoc)
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
    # API Routes
    path("api/auth/", include("accounts.urls", namespace="accounts")),
    path("api/catalog/", include("catalog.urls", namespace="catalog")),
    path("api/builds/", include("builds.urls", namespace="builds")),
    path("api/orders/", include("orders.urls", namespace="orders")),
]
