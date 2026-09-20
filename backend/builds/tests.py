from django.test import TestCase
from django.core.management import call_command
from catalog.models import Product, Category
from builds.models import Build, BuildItem
from builds.services.compatibility import evaluate_compatibility, evaluate_build


class CompatibilityEngineKnownBuildsTests(TestCase):
    """
    Validates the 5 Known-Good and 5 Known-Bad builds specified in test_builds.md.
    """

    @classmethod
    def setUpTestData(cls):
        call_command("seed_catalog", verbosity=0)

    def _get_parts_dict(self, part_ids):
        parts = {}
        for p in Product.objects.filter(id__in=part_ids).select_related("category"):
            parts[p.category.id] = p
        return parts

    # -----------------------------------------------------------------
    # 5 KNOWN-GOOD BUILDS
    # -----------------------------------------------------------------

    def test_good_build_1_flagship_amd_am5_atx(self):
        """Good Build 1: Flagship AMD AM5 ATX Gaming Rig."""
        part_ids = [
            "cpu-06", "mb-04", "ram-08", "gpu-04",
            "storage-01", "psu-08", "case-06", "cooler-01",
        ]
        parts = self._get_parts_dict(part_ids)
        result = evaluate_compatibility(parts)

        self.assertTrue(result["is_compatible"], f"Expected compatible, got: {result['errors']}")
        self.assertEqual(len(result["errors"]), 0)
        self.assertGreater(result["estimated_power_w"], 400)

    def test_good_build_2_budget_intel_i5_matx(self):
        """Good Build 2: Budget Intel Core i5 Micro-ATX Build."""
        part_ids = [
            "cpu-08", "mb-07", "ram-01", "gpu-08",
            "storage-03", "psu-06", "case-05", "cooler-05",
        ]
        parts = self._get_parts_dict(part_ids)
        result = evaluate_compatibility(parts)

        self.assertTrue(result["is_compatible"], f"Expected compatible, got: {result['errors']}")
        self.assertEqual(len(result["errors"]), 0)

    def test_good_build_3_mainstream_amd_am4_atx(self):
        """Good Build 3: Mainstream AMD AM4 ATX Gaming Build."""
        part_ids = [
            "cpu-01", "mb-01", "ram-04", "gpu-05",
            "storage-02", "psu-04", "case-08", "cooler-08",
        ]
        parts = self._get_parts_dict(part_ids)
        result = evaluate_compatibility(parts)

        self.assertTrue(result["is_compatible"], f"Expected compatible, got: {result['errors']}")
        self.assertEqual(len(result["errors"]), 0)

    def test_good_build_4_high_end_intel_i7_enthusiast(self):
        """Good Build 4: High-End Intel Core i7 Enthusiast Build."""
        part_ids = [
            "cpu-10", "mb-10", "ram-07", "gpu-01",
            "storage-04", "psu-10", "case-09", "cooler-03",
        ]
        parts = self._get_parts_dict(part_ids)
        result = evaluate_compatibility(parts)

        self.assertTrue(result["is_compatible"], f"Expected compatible, got: {result['errors']}")
        self.assertEqual(len(result["errors"]), 0)

    def test_good_build_5_compact_matx_intel(self):
        """Good Build 5: Compact Micro-ATX Intel Build."""
        part_ids = [
            "cpu-07", "mb-07", "ram-02", "gpu-09",
            "storage-05", "psu-03", "case-04", "cooler-05",
        ]
        parts = self._get_parts_dict(part_ids)
        result = evaluate_compatibility(parts)

        self.assertTrue(result["is_compatible"], f"Expected compatible, got: {result['errors']}")
        self.assertEqual(len(result["errors"]), 0)

    # -----------------------------------------------------------------
    # 5 KNOWN-BAD BUILDS
    # -----------------------------------------------------------------

    def test_bad_build_1_socket_mismatch(self):
        """Bad Build 1: AM5 CPU on LGA1700 motherboard (Rule 1 Error)."""
        part_ids = [
            "cpu-04", "mb-07", "ram-01", "gpu-08",
            "storage-01", "psu-06", "case-06", "cooler-01",
        ]
        parts = self._get_parts_dict(part_ids)
        result = evaluate_compatibility(parts)

        self.assertFalse(result["is_compatible"])
        rule_ids = [e["rule_id"] for e in result["errors"]]
        self.assertIn(1, rule_ids)
        self.assertIn("AM5 CPU on an LGA1700 motherboard", result["errors"][0]["message"])

    def test_bad_build_2_ram_generation_mismatch(self):
        """Bad Build 2: DDR4 RAM in DDR5 motherboard (Rule 2 Error)."""
        part_ids = [
            "cpu-08", "mb-10", "ram-03", "gpu-07",
            "storage-01", "psu-04", "case-06", "cooler-01",
        ]
        parts = self._get_parts_dict(part_ids)
        result = evaluate_compatibility(parts)

        self.assertFalse(result["is_compatible"])
        rule_ids = [e["rule_id"] for e in result["errors"]]
        self.assertIn(2, rule_ids)
        self.assertIn("DDR4 RAM installed in a DDR5 motherboard", result["errors"][0]["message"])

    def test_bad_build_3_gpu_clearance_failure(self):
        """Bad Build 3: GPU length (348mm) exceeds case clearance (330mm) (Rule 4 Error)."""
        part_ids = [
            "cpu-01", "mb-03", "ram-01", "gpu-01",
            "storage-01", "psu-08", "case-01", "cooler-05",
        ]
        parts = self._get_parts_dict(part_ids)
        result = evaluate_compatibility(parts)

        self.assertFalse(result["is_compatible"])
        rule_ids = [e["rule_id"] for e in result["errors"]]
        self.assertIn(4, rule_ids)
        self.assertIn("GPU length (348 mm) exceeds the case's maximum GPU clearance (330 mm)", result["errors"][0]["message"])

    def test_bad_build_4_cooler_height_clearance_failure(self):
        """Bad Build 4: Cooler height (155mm) exceeds case clearance (70mm) (Rule 5 Error)."""
        part_ids = [
            "cpu-01", "mb-03", "ram-01", "gpu-10",
            "storage-01", "psu-04", "case-02", "cooler-01",
        ]
        parts = self._get_parts_dict(part_ids)
        result = evaluate_compatibility(parts)

        self.assertFalse(result["is_compatible"])
        rule_ids = [e["rule_id"] for e in result["errors"]]
        self.assertIn(5, rule_ids)
        self.assertIn("CPU cooler height (155 mm) exceeds the case's maximum cooler clearance (70 mm)", result["errors"][0]["message"])

    def test_bad_build_5_insufficient_psu_headroom_warning(self):
        """Bad Build 5: Low-wattage PSU on high-draw parts triggers Rule 8 Warning."""
        part_ids = [
            "cpu-10", "mb-08", "ram-03", "gpu-05",
            "storage-01", "psu-02", "case-06", "cooler-03",
        ]
        parts = self._get_parts_dict(part_ids)
        result = evaluate_compatibility(parts)

        # Still compatible because it's a Warning, not a hard blocking Error
        self.assertTrue(result["is_compatible"])
        self.assertEqual(len(result["errors"]), 0)
        warn_rules = [w["rule_id"] for w in result["warnings"]]
        self.assertIn(8, warn_rules)
        self.assertIn("insufficient recommended headroom", result["warnings"][0]["message"])


class CompatibilityEngineAdditionalRulesTests(TestCase):
    """
    Tests additional rules: Motherboard form factor, RAM slot limits, unverified Noctua specs.
    """

    @classmethod
    def setUpTestData(cls):
        call_command("seed_catalog", verbosity=0)

    def test_rule_03_motherboard_form_factor_mismatch(self):
        """ATX motherboard in Mini-ITX case triggers Rule 3 Error."""
        atx_mb = Product.objects.get(id="mb-01")  # ATX
        itx_case = Product.objects.get(id="case-01")  # Mini-ITX only
        parts = {"motherboard": atx_mb, "case": itx_case}

        result = evaluate_compatibility(parts)
        self.assertFalse(result["is_compatible"])
        self.assertIn(3, [e["rule_id"] for e in result["errors"]])

    def test_rule_10_ram_modules_exceed_slots(self):
        """4 RAM sticks on a 2-slot motherboard triggers Rule 10 Error."""
        itx_mb = Product.objects.get(id="mb-03")  # 2 memory slots
        cpu = Product.objects.get(id="cpu-01")
        parts = {
            "cpu": cpu,
            "motherboard": itx_mb,
            "ram": Product(
                id="test-ram-4stick",
                category=Category.objects.get(id="ram"),
                name="Test 4-Stick Kit",
                specs={"type": "DDR4", "modules": 4, "capacity_gb": 32},
            ),
        }
        result = evaluate_compatibility(parts)
        self.assertFalse(result["is_compatible"])
        self.assertIn(10, [e["rule_id"] for e in result["errors"]])

    def test_rule_13_unverified_noctua_cooler_tdp_warning(self):
        """Noctua cooler with empty TDP triggers Rule 13 Warning (Honesty rule)."""
        noctua_cooler = Product.objects.get(id="cooler-02")  # Noctua NH-D15 (empty TDP)
        cpu = Product.objects.get(id="cpu-06")
        parts = {"cpu": cpu, "cpu_cooler": noctua_cooler}

        result = evaluate_compatibility(parts)
        self.assertTrue(result["is_compatible"])  # Warnings don't fail compatibility
        warn_rules = [w["rule_id"] for w in result["warnings"]]
        self.assertIn(13, warn_rules)
        self.assertIn("Could not verify cooler TDP rating", result["warnings"][0]["message"])

    def test_django_build_model_integration(self):
        """Build model items are correctly evaluated via evaluate_build."""
        build = Build.objects.create(name="Integration Test Build")
        cpu = Product.objects.get(id="cpu-01")
        mb = Product.objects.get(id="mb-01")
        BuildItem.objects.create(build=build, product=cpu, category=cpu.category)
        BuildItem.objects.create(build=build, product=mb, category=mb.category)

        report = evaluate_build(build)
        self.assertTrue(report["is_compatible"])
        self.assertEqual(len(report["errors"]), 0)
