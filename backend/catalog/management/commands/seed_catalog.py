import csv
from decimal import Decimal
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from catalog.models import Category, SpecDefinition, Product

# Categories metadata: (id, name, slug, order, description)
CATEGORIES = [
    ("cpu", "Central Processing Unit (CPU)", "cpu", 1, "Desktop processors"),
    ("motherboard", "Motherboard", "motherboard", 2, "Mainboards & chipsets"),
    ("ram", "Memory (RAM)", "ram", 3, "DDR4 & DDR5 memory kits"),
    ("gpu", "Graphics Card (GPU)", "gpu", 4, "Dedicated GPUs"),
    ("storage", "Storage Drive", "storage", 5, "NVMe M.2 & SATA SSDs"),
    ("psu", "Power Supply Unit (PSU)", "psu", 6, "Modular & non-modular power supplies"),
    ("case", "PC Case", "case", 7, "Tower and small-form-factor enclosures"),
    ("cpu_cooler", "CPU Cooler", "cpu-cooler", 8, "Air and liquid CPU coolers"),
]

# Spec Definitions per category: (key, label, unit, data_type, higher_is_better)
SPEC_DEFS = {
    "cpu": [
        ("socket", "Socket", "", "string", None),
        ("cores", "Cores", "", "integer", True),
        ("threads", "Threads", "", "integer", True),
        ("base_clock_ghz", "Base Clock", "GHz", "float", True),
        ("boost_clock_ghz", "Boost Clock", "GHz", "float", True),
        ("tdp_w", "Thermal Design Power (TDP)", "W", "integer", False),
        ("integrated_graphics", "Integrated Graphics", "", "boolean", None),
    ],
    "motherboard": [
        ("socket", "Socket", "", "string", None),
        ("chipset", "Chipset", "", "string", None),
        ("form_factor", "Form Factor", "", "string", None),
        ("memory_type", "Supported Memory", "", "string", None),
        ("memory_slots", "RAM Slots", "", "integer", True),
        ("max_memory_gb", "Max Memory", "GB", "integer", True),
        ("m2_slots", "M.2 Slots", "", "integer", True),
        ("sata_ports", "SATA Ports", "", "integer", True),
    ],
    "ram": [
        ("type", "Memory Type", "", "string", None),
        ("speed_mhz", "Speed", "MHz", "integer", True),
        ("modules", "Stick Count", "", "integer", None),
        ("capacity_gb", "Total Capacity", "GB", "integer", True),
        ("cas_latency", "CAS Latency (CL)", "", "integer", False),
    ],
    "gpu": [
        ("chipset", "GPU Chipset", "", "string", None),
        ("vram_gb", "VRAM", "GB", "integer", True),
        ("length_mm", "Card Length", "mm", "integer", False),
        ("tdp_w", "Power Draw (TDP)", "W", "integer", False),
        ("power_connectors", "Power Connectors", "", "string", None),
    ],
    "storage": [
        ("type", "Drive Type", "", "string", None),
        ("interface", "Bus Interface", "", "string", None),
        ("capacity_gb", "Capacity", "GB", "integer", True),
        ("form_factor", "Form Factor", "", "string", None),
    ],
    "psu": [
        ("wattage_w", "Total Wattage", "W", "integer", True),
        ("efficiency", "Efficiency Rating", "", "string", None),
        ("modular", "Modularity", "", "string", None),
        ("form_factor", "Form Factor", "", "string", None),
        ("connectors", "Included Connectors", "", "string", None),
    ],
    "case": [
        ("supported_form_factors", "Supported Motherboards", "", "list", None),
        ("max_gpu_length_mm", "Max GPU Clearance", "mm", "integer", True),
        ("max_cooler_height_mm", "Max Cooler Clearance", "mm", "integer", True),
        ("psu_form_factor", "PSU Form Factor", "", "string", None),
    ],
    "cpu_cooler": [
        ("type", "Cooler Type", "", "string", None),
        ("height_mm", "Cooler Height", "mm", "integer", False),
        ("supported_sockets", "Supported Sockets", "", "list", None),
        ("tdp_rating_w", "Cooling Capacity", "W", "integer", True),
    ],
}

# Real-world benchmark prices for the 80 components (USD)
BASE_PRICES = {
    # CPUs
    "cpu-01": Decimal("134.99"),  # Ryzen 5 5600X
    "cpu-02": Decimal("189.99"),  # Ryzen 7 5800X
    "cpu-03": Decimal("169.99"),  # Ryzen 7 5700G
    "cpu-04": Decimal("199.99"),  # Ryzen 5 7600
    "cpu-05": Decimal("299.99"),  # Ryzen 7 7700X
    "cpu-06": Decimal("389.99"),  # Ryzen 7 7800X3D
    "cpu-07": Decimal("529.99"),  # Ryzen 9 7950X
    "cpu-08": Decimal("129.99"),  # Core i5-12400
    "cpu-09": Decimal("249.99"),  # Core i5-13600K
    "cpu-10": Decimal("219.99"),  # Core i7-12700K
    # Motherboards
    "mb-01": Decimal("119.99"),   # MSI B550-A PRO
    "mb-02": Decimal("89.99"),    # Gigabyte B550M DS3H
    "mb-03": Decimal("169.99"),   # ASUS ROG STRIX B550-I
    "mb-04": Decimal("209.99"),   # MSI MAG B650 TOMAHAWK
    "mb-05": Decimal("149.99"),   # ASRock B650M Pro RS
    "mb-06": Decimal("279.99"),   # ASUS ROG STRIX B650E-I
    "mb-07": Decimal("109.99"),   # MSI PRO B660M-A DDR4
    "mb-08": Decimal("179.99"),   # Gigabyte B760 AORUS ELITE DDR4
    "mb-09": Decimal("199.99"),   # MSI MAG B760 TOMAHAWK WIFI (DDR5)
    "mb-10": Decimal("239.99"),   # ASUS ROG STRIX B760-I (DDR5)
    # RAM
    "ram-01": Decimal("38.99"),   # Vengeance LPX 16GB (2x8) DDR4-3200
    "ram-02": Decimal("34.99"),   # T-Force Vulcan Z 16GB DDR4-3200
    "ram-03": Decimal("49.99"),   # Trident Z RGB 16GB DDR4-3200
    "ram-04": Decimal("59.99"),   # Ripjaws V 32GB (2x16) DDR4-3600
    "ram-05": Decimal("64.99"),   # Vengeance RGB Pro 32GB DDR4-3600
    "ram-06": Decimal("129.99"),  # Ripjaws V 64GB (2x32) DDR4-3200
    "ram-07": Decimal("94.99"),   # Crucial Pro 32GB (2x16) DDR5-5600
    "ram-08": Decimal("104.99"),  # Flare X5 32GB (2x16) DDR5-6000
    "ram-09": Decimal("114.99"),  # Trident Z5 RGB 32GB DDR5-6000
    "ram-10": Decimal("189.99"),  # Vengeance 64GB (2x32) DDR5-6000
    # GPUs
    "gpu-01": Decimal("1799.99"), # TUF Gaming RTX 4090 OC
    "gpu-02": Decimal("899.99"),  # Speedster MERC 310 RX 7900 XTX
    "gpu-03": Decimal("699.99"),  # Dual GeForce RTX 4070 SUPER
    "gpu-04": Decimal("999.99"),  # RTX 4080 SUPER WINDFORCE
    "gpu-05": Decimal("499.99"),  # PULSE Radeon RX 7800 XT
    "gpu-06": Decimal("549.99"),  # GeForce RTX 4070 WINDFORCE
    "gpu-07": Decimal("379.99"),  # Radeon RX 7600 XT GAMING OC
    "gpu-08": Decimal("299.99"),  # Dual RTX 4060 EVO OC
    "gpu-09": Decimal("279.99"),  # Fighter Radeon RX 6650 XT
    "gpu-10": Decimal("259.99"),  # SWFT 210 Radeon RX 7600
    # Storage
    "storage-01": Decimal("89.99"),  # 980 PRO 1TB NVMe
    "storage-02": Decimal("159.99"), # 990 PRO 2TB NVMe
    "storage-03": Decimal("62.99"),  # Crucial P3 Plus 1TB
    "storage-04": Decimal("114.99"), # Crucial P3 Plus 2TB
    "storage-05": Decimal("74.99"),  # WD_BLACK SN770 1TB
    "storage-06": Decimal("139.99"), # WD_BLACK SN850X 2TB
    "storage-07": Decimal("79.99"),  # KC3000 1TB
    "storage-08": Decimal("54.99"),  # 870 EVO 500GB SATA
    "storage-09": Decimal("79.99"),  # 870 EVO 1TB SATA
    "storage-10": Decimal("49.99"),  # MX500 500GB SATA
    # PSUs
    "psu-01": Decimal("44.99"),   # EVGA 500 W1 500W
    "psu-02": Decimal("59.99"),   # MSI MAG A550BN 550W
    "psu-03": Decimal("69.99"),   # Corsair CX650M 650W
    "psu-04": Decimal("74.99"),   # Thermaltake Toughpower GX2 600W
    "psu-05": Decimal("84.99"),   # EVGA 600 GD 600W
    "psu-06": Decimal("64.99"),   # MSI MAG A650BN 650W
    "psu-07": Decimal("109.99"),  # Corsair RM750e 750W
    "psu-08": Decimal("134.99"),  # Corsair RM850x 850W
    "psu-09": Decimal("164.99"),  # Seasonic FOCUS GX-1000 1000W
    "psu-10": Decimal("144.99"),  # Cooler Master V850 SFX Gold
    # Cases
    "case-01": Decimal("89.99"),  # NR200 Mini-ITX
    "case-02": Decimal("129.99"), # Fractal Ridge Mini-ITX
    "case-03": Decimal("99.99"),  # SSUPD Meshlicious
    "case-04": Decimal("59.99"),  # Q300L Micro-ATX
    "case-05": Decimal("74.99"),  # ASUS Prime AP201
    "case-06": Decimal("104.99"), # Corsair 4000D AIRFLOW
    "case-07": Decimal("89.99"),  # NZXT H5 Flow
    "case-08": Decimal("139.99"), # Lian Li LANCOOL 216
    "case-09": Decimal("169.99"), # Fractal Torrent ATX
    "case-10": Decimal("159.99"), # Lian Li O11 Dynamic EVO
    # CPU Coolers
    "cooler-01": Decimal("35.90"),  # Peerless Assassin 120 SE
    "cooler-02": Decimal("109.95"), # Noctua NH-D15
    "cooler-03": Decimal("54.99"),  # DeepCool AK620
    "cooler-04": Decimal("89.90"),  # Dark Rock Pro 4
    "cooler-05": Decimal("34.99"),  # Hyper 212 Black Edition
    "cooler-06": Decimal("44.95"),  # Noctua NH-L9i-17xx
    "cooler-07": Decimal("44.95"),  # Noctua NH-L9a-AM5
    "cooler-08": Decimal("99.99"),  # Liquid Freezer II 240
    "cooler-09": Decimal("114.99"), # Kraken 240
    "cooler-10": Decimal("139.99"), # iCUE H100i RGB ELITE
}


class Command(BaseCommand):
    help = "Seed the catalog with verified categories, specs, and products from CSV data files."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Categories & SpecDefinitions..."))
        data_dir = settings.BASE_DIR.parent / "data"

        if not data_dir.exists():
            self.stdout.write(self.style.ERROR(f"Data directory not found at: {data_dir}"))
            return

        # 1. Create or update Categories
        cat_map = {}
        for cat_id, name, slug, order, desc in CATEGORIES:
            cat, _ = Category.objects.update_or_create(
                id=cat_id,
                defaults={
                    "name": name,
                    "slug": slug,
                    "order": order,
                    "description": desc,
                },
            )
            cat_map[cat_id] = cat
            self.stdout.write(f"  * Category: {cat.name} ({cat.id})")

        # 2. Create or update SpecDefinitions
        for cat_id, defs in SPEC_DEFS.items():
            cat = cat_map[cat_id]
            for key, label, unit, data_type, higher_is_better in defs:
                SpecDefinition.objects.update_or_create(
                    category=cat,
                    key=key,
                    defaults={
                        "label": label,
                        "unit": unit,
                        "data_type": data_type,
                        "higher_is_better": higher_is_better,
                    },
                )

        # 3. Seed Products from CSV files
        csv_files = {
            "cpu": data_dir / "cpu.csv",
            "motherboard": data_dir / "motherboard.csv",
            "ram": data_dir / "ram.csv",
            "gpu": data_dir / "gpu.csv",
            "storage": data_dir / "storage.csv",
            "psu": data_dir / "psu.csv",
            "case": data_dir / "case.csv",
            "cpu_cooler": data_dir / "cpu_cooler.csv",
        }

        total_seeded = 0

        for cat_id, csv_path in csv_files.items():
            if not csv_path.exists():
                self.stdout.write(self.style.WARNING(f"CSV missing: {csv_path}"))
                continue

            category = cat_map[cat_id]
            spec_defs = {sd.key: sd for sd in SpecDefinition.objects.filter(category=category)}

            with open(csv_path, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    part_id = row["id"].strip()
                    name = row["name"].strip()
                    brand = row["brand"].strip()
                    source_url = row.get("source_url", "").strip()
                    notes = row.get("notes", "").strip()

                    # Build structured specs dictionary
                    specs = {}
                    for key, spec_def in spec_defs.items():
                        val_str = row.get(key, "").strip() if key in row else ""

                        if val_str == "" or val_str.lower() == "none":
                            specs[key] = None
                            continue

                        # Cast according to spec definition data_type
                        if spec_def.data_type == "integer":
                            try:
                                specs[key] = int(val_str)
                            except ValueError:
                                specs[key] = None
                        elif spec_def.data_type == "float":
                            try:
                                specs[key] = float(val_str)
                            except ValueError:
                                specs[key] = None
                        elif spec_def.data_type == "boolean":
                            specs[key] = val_str.lower() in ("true", "1", "yes")
                        elif spec_def.data_type == "list":
                            # Multi-value specs (e.g. "AM4; AM5; LGA1700")
                            items = [x.strip() for x in val_str.split(";") if x.strip()]
                            specs[key] = items
                        else:
                            specs[key] = val_str

                    price = BASE_PRICES.get(part_id, Decimal("99.99"))

                    Product.objects.update_or_create(
                        id=part_id,
                        defaults={
                            "category": category,
                            "name": name,
                            "brand": brand,
                            "price": price,
                            "stock": 50,  # Healthy demo initial stock
                            "specs": specs,
                            "source_url": source_url,
                            "notes": notes,
                            "is_active": True,
                        },
                    )
                    total_seeded += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded {len(cat_map)} categories and {total_seeded} products!"
            )
        )
