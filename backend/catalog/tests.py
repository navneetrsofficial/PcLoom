from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from django.core.management import call_command
from rest_framework.test import APIClient
from rest_framework import status


class CatalogAPITests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_catalog", verbosity=0)

    def setUp(self):
        self.client = APIClient()

    def test_category_list(self):
        """GET /api/catalog/categories/ returns all 8 categories with spec schemas."""
        url = reverse("catalog:category-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 8)
        # Verify nested spec_definitions are present
        cpu_cat = next(c for c in response.data if c["id"] == "cpu")
        self.assertGreater(len(cpu_cat["spec_definitions"]), 0)

    def test_product_list_unfiltered(self):
        """GET /api/catalog/products/ returns paginated products."""
        url = reverse("catalog:product-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        self.assertEqual(response.data["count"], 80)

    def test_product_list_filtered_by_category(self):
        """GET /api/catalog/products/?category=gpu returns 10 GPUs."""
        url = reverse("catalog:product-list")
        response = self.client.get(url, {"category": "gpu"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 10)
        for item in response.data["results"]:
            self.assertEqual(item["category_id"], "gpu")

    def test_product_list_filtered_by_brand_and_search(self):
        """Filter by brand and search text query."""
        url = reverse("catalog:product-list")
        response = self.client.get(url, {"brand": "AMD", "q": "Ryzen"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(response.data["count"], 0)
        for item in response.data["results"]:
            self.assertEqual(item["brand"], "AMD")

    def test_product_detail(self):
        """GET /api/catalog/products/<id>/ returns single product with full specs."""
        url = reverse("catalog:product-detail", kwargs={"id": "cpu-01"})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], "cpu-01")
        self.assertEqual(response.data["name"], "Ryzen 5 5600X")
        self.assertEqual(response.data["specs"]["socket"], "AM4")

    def test_compare_products_side_by_side(self):
        """GET /api/catalog/compare/?ids=cpu-01,cpu-02 returns aligned specs matrix."""
        url = reverse("catalog:product-compare")
        response = self.client.get(url, {"ids": "cpu-01,cpu-02"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["products"]), 2)
        self.assertEqual(response.data["category"]["id"], "cpu")

        # Check specs matrix
        matrix = {item["key"]: item for item in response.data["specs_matrix"]}
        self.assertIn("cores", matrix)
        self.assertEqual(matrix["cores"]["values"]["cpu-01"], 6)
        self.assertEqual(matrix["cores"]["values"]["cpu-02"], 8)
        # Since cores has higher_is_better=True, cpu-02 (8 cores) should be best
        self.assertEqual(matrix["cores"]["best_product_id"], "cpu-02")
        self.assertTrue(matrix["cores"]["is_different"])

    def test_compare_different_categories_rejected(self):
        """Comparing CPU and Motherboard should fail with 400 Bad Request."""
        url = reverse("catalog:product-compare")
        response = self.client.get(url, {"ids": "cpu-01,mb-01"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
