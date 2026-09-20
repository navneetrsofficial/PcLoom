from decimal import Decimal, InvalidOperation
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from catalog.models import Product
from .models import Build, BuildItem
from .services.compatibility import evaluate_compatibility, evaluate_build
from .services.recommender import recommend_build
from .serializers import (
    BuildSerializer,
    BuildDetailWithCompatSerializer,
    BuildItemAddSerializer,
    StatelessCompatCheckSerializer,
    BuildRecommendRequestSerializer,
    BuildShareSerializer,
)


class StatelessCompatCheckView(APIView):
    """
    Stateless Compatibility Check.
    Provide a list of product IDs (e.g. ['cpu-01', 'mb-01']) and receive
    an instant compatibility analysis with power estimation, errors, and warnings.
    """

    permission_classes = [AllowAny]

    @extend_schema(
        request=StatelessCompatCheckSerializer,
        responses={200: dict},
    )
    def post(self, request, *args, **kwargs):
        serializer = StatelessCompatCheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        part_ids = serializer.validated_data["part_ids"]
        products = Product.objects.filter(id__in=part_ids).select_related("category")

        parts = {}
        for p in products:
            parts[p.category.id] = p

        report = evaluate_compatibility(parts)
        report["evaluated_parts_count"] = len(parts)
        report["missing_categories"] = [
            cat_id
            for cat_id in ["cpu", "motherboard", "ram", "gpu", "storage", "psu", "case", "cpu_cooler"]
            if cat_id not in parts
        ]

        return Response(report, status=status.HTTP_200_OK)


class BuildListCreateView(generics.ListCreateAPIView):
    """
    List user builds or create a new empty build.
    Supports both logged-in users and guest sessions.
    """

    permission_classes = [AllowAny]
    serializer_class = BuildSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Build.objects.filter(user=user).prefetch_related("items__product__category")
        # For guests, return builds created in the current session
        session_build_ids = self.request.session.get("guest_build_ids", [])
        return Build.objects.filter(id__in=session_build_ids).prefetch_related("items__product__category")

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        build = serializer.save(user=user)

        # Track build in session for guest users
        if not user:
            session_builds = self.request.session.get("guest_build_ids", [])
            session_builds.append(str(build.id))
            self.request.session["guest_build_ids"] = session_builds


class BuildDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update name, or delete a saved build."""

    permission_classes = [AllowAny]
    queryset = Build.objects.prefetch_related("items__product__category")
    serializer_class = BuildDetailWithCompatSerializer
    lookup_field = "id"


class BuildItemAddView(APIView):
    """
    Add or replace a component in a build.
    Enforces at most one part per category (automatically updates existing part).
    """

    permission_classes = [AllowAny]

    @extend_schema(request=BuildItemAddSerializer)
    def post(self, request, id, *args, **kwargs):
        try:
            build = Build.objects.get(id=id)
        except Build.DoesNotExist:
            return Response({"error": "Build not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = BuildItemAddSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data["product_id"]
        category = product.category

        # Add or update the single part for this category
        item, created = BuildItem.objects.update_or_create(
            build=build,
            category=category,
            defaults={"product": product},
        )

        build_serializer = BuildDetailWithCompatSerializer(build)
        return Response(
            {
                "message": f"Added {product.brand} {product.name} to {category.name}.",
                "build": build_serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class BuildItemRemoveView(APIView):
    """Remove a component from a build by its category ID."""

    permission_classes = [AllowAny]

    def delete(self, request, id, category_id, *args, **kwargs):
        try:
            build = Build.objects.get(id=id)
        except Build.DoesNotExist:
            return Response({"error": "Build not found."}, status=status.HTTP_404_NOT_FOUND)

        deleted_count, _ = BuildItem.objects.filter(build=build, category_id=category_id).delete()

        if deleted_count == 0:
            return Response(
                {"error": f"No item found for category '{category_id}' in this build."},
                status=status.HTTP_404_NOT_FOUND,
            )

        build_serializer = BuildDetailWithCompatSerializer(build)
        return Response(
            {
                "message": f"Removed component from {category_id}.",
                "build": build_serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class BuildCheckView(APIView):
    """Evaluate compatibility for a saved build."""

    permission_classes = [AllowAny]

    def get(self, request, id, *args, **kwargs):
        try:
            build = Build.objects.prefetch_related("items__product__category").get(id=id)
        except Build.DoesNotExist:
            return Response({"error": "Build not found."}, status=status.HTTP_404_NOT_FOUND)

        report = evaluate_build(build)
        return Response(report, status=status.HTTP_200_OK)


class BuildRecommendView(APIView):
    """
    Automated PC Build Recommendation Engine.
    Given a target budget and purpose ('gaming', 'workstation', 'general'),
    selects an optimal, 100% compatible combination of 8 components.
    """

    permission_classes = [AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="budget",
                type=OpenApiTypes.FLOAT,
                location=OpenApiParameter.QUERY,
                description="Target budget in USD (e.g. 1200)",
                default=1200,
            ),
            OpenApiParameter(
                name="purpose",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="System use-case ('gaming', 'workstation', 'general')",
                default="gaming",
            ),
        ],
        responses={200: dict},
    )
    def get(self, request, *args, **kwargs):
        budget_raw = request.query_params.get("budget", "1200")
        purpose = request.query_params.get("purpose", "gaming")

        try:
            budget = Decimal(budget_raw)
        except (InvalidOperation, ValueError):
            return Response(
                {"error": f"Invalid budget value '{budget_raw}'. Must be a valid number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = recommend_build(budget, purpose)
        return Response(result, status=status.HTTP_200_OK)

    @extend_schema(
        request=BuildRecommendRequestSerializer,
        responses={200: dict},
    )
    def post(self, request, *args, **kwargs):
        serializer = BuildRecommendRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        budget = serializer.validated_data["budget"]
        purpose = serializer.validated_data["purpose"]

        result = recommend_build(budget, purpose)
        return Response(result, status=status.HTTP_200_OK)


class BuildShareView(generics.RetrieveAPIView):
    """
    Public read-only view of a shared build.
    Accessible without authentication via shareable link.
    """

    permission_classes = [AllowAny]
    queryset = Build.objects.prefetch_related("items__product__category")
    serializer_class = BuildShareSerializer
    lookup_field = "id"
