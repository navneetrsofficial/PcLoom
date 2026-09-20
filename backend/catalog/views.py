from decimal import Decimal
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from .models import Category, SpecDefinition, Product
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
)


class CategoryListView(generics.ListAPIView):
    """List all component categories with their specification definitions."""

    queryset = Category.objects.prefetch_related("spec_definitions").all()
    serializer_class = CategorySerializer
    pagination_class = None


class ProductListView(generics.ListAPIView):
    """
    List and filter products with search, category, brand, and price parameters.
    """

    serializer_class = ProductListSerializer

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="category",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Category ID (e.g. 'cpu', 'gpu', 'ram')",
            ),
            OpenApiParameter(
                name="brand",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filter by brand (e.g. 'AMD', 'Intel', 'ASUS')",
            ),
            OpenApiParameter(
                name="min_price",
                type=OpenApiTypes.FLOAT,
                location=OpenApiParameter.QUERY,
                description="Minimum price filter",
            ),
            OpenApiParameter(
                name="max_price",
                type=OpenApiTypes.FLOAT,
                location=OpenApiParameter.QUERY,
                description="Maximum price filter",
            ),
            OpenApiParameter(
                name="q",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Search query against name, brand, or notes",
            ),
            OpenApiParameter(
                name="ordering",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Order by 'price', '-price', 'name', or '-name'",
            ),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        queryset = Product.objects.select_related("category").filter(is_active=True)
        params = self.request.query_params

        # Filter by category
        category = params.get("category")
        if category:
            queryset = queryset.filter(
                Q(category__id__iexact=category) | Q(category__slug__iexact=category)
            )

        # Filter by brand
        brand = params.get("brand")
        if brand:
            queryset = queryset.filter(brand__iexact=brand)

        # Filter by price range
        min_price = params.get("min_price")
        if min_price:
            try:
                queryset = queryset.filter(price__gte=Decimal(min_price))
            except ValueError:
                pass

        max_price = params.get("max_price")
        if max_price:
            try:
                queryset = queryset.filter(price__lte=Decimal(max_price))
            except ValueError:
                pass

        # Text search (Name, Brand, Notes)
        query = params.get("q")
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query)
                | Q(brand__icontains=query)
                | Q(notes__icontains=query)
            )

        # Ordering
        ordering = params.get("ordering")
        if ordering in ("price", "-price", "name", "-name", "brand", "-brand"):
            queryset = queryset.order_by(ordering)

        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    """Retrieve full details of a single product by its ID."""

    queryset = Product.objects.select_related("category").all()
    serializer_class = ProductDetailSerializer
    lookup_field = "id"


class CompareView(APIView):
    """
    Compare 2 to 4 products from the same category side-by-side.
    Returns structured specs aligned by key, with best-value highlights.
    """

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="ids",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=True,
                description="Comma-separated product IDs (e.g. 'cpu-01,cpu-02')",
            )
        ]
    )
    def get(self, request, *args, **kwargs):
        ids_param = request.query_params.get("ids", "").strip()
        if not ids_param:
            return Response(
                {"error": "Please specify comma-separated product IDs in 'ids' query parameter (e.g. ?ids=cpu-01,cpu-02)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        raw_ids = [i.strip() for i in ids_param.split(",") if i.strip()]
        if len(raw_ids) < 2 or len(raw_ids) > 4:
            return Response(
                {"error": f"Compare requires between 2 and 4 products. Received {len(raw_ids)}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Preserve order of requested IDs
        products = list(Product.objects.filter(id__in=raw_ids).select_related("category"))
        products_dict = {p.id: p for p in products}
        ordered_products = [products_dict[pid] for pid in raw_ids if pid in products_dict]

        if len(ordered_products) != len(raw_ids):
            missing = set(raw_ids) - set(products_dict.keys())
            return Response(
                {"error": f"One or more products not found: {list(missing)}"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Verify all products belong to the same category
        category_ids = {p.category.id for p in ordered_products}
        if len(category_ids) > 1:
            return Response(
                {"error": "Compare only supports products from the same category."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        category = ordered_products[0].category
        spec_defs = list(SpecDefinition.objects.filter(category=category))

        # Build comparison matrix
        specs_matrix = []
        for sd in spec_defs:
            values = {}
            numeric_values = {}
            for p in ordered_products:
                val = p.specs.get(sd.key)
                values[p.id] = val
                if isinstance(val, (int, float)) and not isinstance(val, bool):
                    numeric_values[p.id] = val

            # Check if all values are identical
            unique_vals = set(str(v) for v in values.values())
            is_different = len(unique_vals) > 1

            # Determine best product ID based on higher_is_better
            best_product_id = None
            if sd.higher_is_better is not None and numeric_values:
                if sd.higher_is_better is True:
                    best_product_id = max(numeric_values, key=numeric_values.get)
                elif sd.higher_is_better is False:
                    best_product_id = min(numeric_values, key=numeric_values.get)

            specs_matrix.append(
                {
                    "key": sd.key,
                    "label": sd.label,
                    "unit": sd.unit,
                    "data_type": sd.data_type,
                    "higher_is_better": sd.higher_is_better,
                    "values": values,
                    "best_product_id": best_product_id,
                    "is_different": is_different,
                }
            )

        # Also compare Price
        price_values = {p.id: float(p.price) for p in ordered_products}
        lowest_price_id = min(price_values, key=price_values.get)

        return Response(
            {
                "category": {
                    "id": category.id,
                    "name": category.name,
                    "slug": category.slug,
                },
                "products": ProductListSerializer(ordered_products, many=True).data,
                "price_comparison": {
                    "values": price_values,
                    "best_product_id": lowest_price_id,  # Lower price is better
                },
                "specs_matrix": specs_matrix,
            }
        )
