from django.urls import path
from .views import (
    StatelessCompatCheckView,
    BuildListCreateView,
    BuildDetailView,
    BuildItemAddView,
    BuildItemRemoveView,
    BuildCheckView,
    BuildRecommendView,
    BuildShareView,
)

app_name = "builds"

urlpatterns = [
    # Smart Build Recommendation Engine
    path("recommend/", BuildRecommendView.as_view(), name="build-recommend"),
    # Stateless Compatibility Check
    path("compat-check/", StatelessCompatCheckView.as_view(), name="compat-check"),
    # Saved Builds CRUD
    path("", BuildListCreateView.as_view(), name="build-list-create"),
    path("<uuid:id>/", BuildDetailView.as_view(), name="build-detail"),
    path("<uuid:id>/items/", BuildItemAddView.as_view(), name="build-item-add"),
    path(
        "<uuid:id>/items/<str:category_id>/",
        BuildItemRemoveView.as_view(),
        name="build-item-remove",
    ),
    path("<uuid:id>/check/", BuildCheckView.as_view(), name="build-check"),
    # Public Build Sharing Link
    path("share/<uuid:id>/", BuildShareView.as_view(), name="build-share"),
]
