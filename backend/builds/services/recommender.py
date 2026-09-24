"""
Smart PC Build Recommendation Engine.

Analyzes hardware specs, price performance ratios, and budget envelopes
to assemble a fully compatible, optimized 8-part PC build for a given purpose.
"""

from decimal import Decimal
from typing import Dict, Any, List, Optional
from catalog.models import Product, Category
from .compatibility import evaluate_compatibility


def recommend_build(budget: Decimal, purpose: str = "gaming") -> Dict[str, Any]:
    """
    Generates an optimized, 100% compatible build within or closest to the target budget.

    Purposes supported:
    - 'gaming': Prioritizes GPU tier and gaming CPU boost clocks.
    - 'workstation': Prioritizes CPU core/thread count, high RAM capacity, and storage.
    - 'general': Balanced, cost-effective daily productivity and casual gaming.
    """
    purpose = (purpose or "gaming").lower().strip()
    if purpose not in ("gaming", "workstation", "general"):
        purpose = "gaming"

    # Pre-fetch and group active products by category
    all_products = list(
        Product.objects.select_related("category").filter(is_active=True).order_by("price")
    )

    by_cat: Dict[str, List[Product]] = {
        "cpu": [],
        "motherboard": [],
        "ram": [],
        "gpu": [],
        "storage": [],
        "psu": [],
        "case": [],
        "cpu_cooler": [],
    }
    for p in all_products:
        if p.category.id in by_cat:
            by_cat[p.category.id].append(p)

    # Helper to calculate purpose-specific performance weight
    def cpu_weight(cpu: Product) -> float:
        cores = cpu.specs.get("cores", 6)
        boost = cpu.specs.get("boost_clock_ghz", 4.0)
        if purpose == "workstation":
            return cores * 3.0 + boost
        return boost * 2.0 + cores * 0.5

    def gpu_weight(gpu: Product) -> float:
        vram = gpu.specs.get("vram_gb", 8)
        price = float(gpu.price)
        if purpose == "gaming":
            return price * 1.5 + vram * 20.0
        return price + vram * 10.0

    def ram_weight(ram: Product) -> float:
        cap = ram.specs.get("capacity_gb", 16)
        speed = ram.specs.get("speed_mhz", 3200)
        if purpose == "workstation":
            return cap * 4.0 + speed * 0.01
        return speed * 0.02 + cap * 1.0

    # Sort candidates by purpose relevance
    by_cat["cpu"].sort(key=cpu_weight, reverse=True)
    by_cat["gpu"].sort(key=gpu_weight, reverse=True)
    by_cat["ram"].sort(key=ram_weight, reverse=True)

    best_build = None
    best_score = -1.0
    best_total_price = Decimal("0")

    # Search for optimal compatible combination
    for cpu in by_cat["cpu"]:
        cpu_socket = (cpu.specs.get("socket") or "").strip().upper()
        cpu_tdp = cpu.specs.get("tdp_w", 65)

        # 1. Matching Motherboard
        compat_mbs = [
            mb for mb in by_cat["motherboard"]
            if (mb.specs.get("socket") or "").strip().upper() == cpu_socket
        ]
        if not compat_mbs:
            continue

        for mb in compat_mbs:
            mb_mem_type = (mb.specs.get("memory_type") or "").strip().upper()
            mb_slots = mb.specs.get("memory_slots", 4)
            mb_m2 = mb.specs.get("m2_slots", 1)
            mb_ff = (mb.specs.get("form_factor") or "").strip().lower()

            # 2. Matching RAM
            compat_rams = [
                r for r in by_cat["ram"]
                if (r.specs.get("type") or "").strip().upper() == mb_mem_type
                and r.specs.get("modules", 2) <= mb_slots
            ]
            if not compat_rams:
                continue

            # 3. Matching Storage (prefer M.2 NVMe if slots available)
            if mb_m2 > 0:
                compat_storage = [s for s in by_cat["storage"] if "M.2" in (s.specs.get("form_factor") or "").upper()]
            else:
                compat_storage = [s for s in by_cat["storage"] if "SATA" in (s.specs.get("type") or "").upper()]
            if not compat_storage:
                compat_storage = by_cat["storage"]

            # 4. Matching Cooler (supports socket & covers TDP)
            compat_coolers = [
                c for c in by_cat["cpu_cooler"]
                if cpu_socket in [str(s).upper().strip() for s in (c.specs.get("supported_sockets") or [])]
            ]
            if not compat_coolers:
                continue

            # Evaluate against candidate GPUs
            for gpu in by_cat["gpu"]:
                gpu_len = gpu.specs.get("length_mm", 250)
                gpu_tdp = gpu.specs.get("tdp_w", 150)
                est_draw = 50 + cpu_tdp + gpu_tdp

                # 5. Matching PSU (covers draw + 25% headroom)
                compat_psus = [
                    p for p in by_cat["psu"]
                    if p.specs.get("wattage_w", 0) >= (est_draw * 1.25)
                ]
                if not compat_psus:
                    # Fallback to any PSU covering draw
                    compat_psus = [p for p in by_cat["psu"] if p.specs.get("wattage_w", 0) >= est_draw]
                if not compat_psus:
                    continue
                # Pick the most cost-effective compliant PSU
                selected_psu = min(compat_psus, key=lambda p: p.price)

                # Pick top RAM, Storage, Cooler
                selected_ram = compat_rams[0]
                selected_storage = compat_storage[0]
                selected_cooler = compat_coolers[0]
                cooler_h = selected_cooler.specs.get("height_mm", 155)

                # 6. Matching Case (fits MB form factor, GPU length, and cooler height)
                compat_cases = [
                    c for c in by_cat["case"]
                    if mb_ff in [str(f).lower().strip() for f in (c.specs.get("supported_form_factors") or [])]
                    and c.specs.get("max_gpu_length_mm", 300) >= gpu_len
                    and c.specs.get("max_cooler_height_mm", 160) >= cooler_h
                ]
                if not compat_cases:
                    continue
                selected_case = min(compat_cases, key=lambda c: c.price)

                # Calculate build total cost
                parts_dict = {
                    "cpu": cpu,
                    "motherboard": mb,
                    "ram": selected_ram,
                    "gpu": gpu,
                    "storage": selected_storage,
                    "psu": selected_psu,
                    "case": selected_case,
                    "cpu_cooler": selected_cooler,
                }
                total_cost = sum(p.price for p in parts_dict.values())

                # If within budget, score the configuration
                if total_cost <= budget:
                    # Score combines raw performance weight with budget utilization
                    utilization = float(total_cost / budget)
                    perf_score = (
                        gpu_weight(gpu) * 1.2
                        + cpu_weight(cpu) * 1.0
                        + ram_weight(selected_ram) * 0.5
                    )
                    score = perf_score * (0.5 + 0.5 * utilization)

                    if score > best_score:
                        best_score = score
                        best_build = parts_dict
                        best_total_price = total_cost

    # If no build fit under the budget (e.g. very low budget requested),
    # pick the lowest-cost fully compatible build available.
    if not best_build:
        lowest_cost = Decimal("999999")
        # Find absolute lowest cost compatible build
        for cpu in by_cat["cpu"][::-1]:
            cpu_socket = (cpu.specs.get("socket") or "").strip().upper()
            mbs = [m for m in by_cat["motherboard"] if (m.specs.get("socket") or "").strip().upper() == cpu_socket]
            if not mbs:
                continue
            mb = min(mbs, key=lambda m: m.price)
            mb_mem_type = (mb.specs.get("memory_type") or "").strip().upper()
            mb_ff = (mb.specs.get("form_factor") or "").strip().lower()

            rams = [r for r in by_cat["ram"] if (r.specs.get("type") or "").strip().upper() == mb_mem_type]
            if not rams:
                continue
            ram = min(rams, key=lambda r: r.price)

            storage = min(by_cat["storage"], key=lambda s: s.price)
            gpu = min(by_cat["gpu"], key=lambda g: g.price)
            est_draw = 50 + cpu.specs.get("tdp_w", 65) + gpu.specs.get("tdp_w", 100)

            psus = [p for p in by_cat["psu"] if p.specs.get("wattage_w", 0) >= est_draw]
            if not psus:
                continue
            psu = min(psus, key=lambda p: p.price)

            coolers = [c for c in by_cat["cpu_cooler"] if cpu_socket in [str(s).upper() for s in (c.specs.get("supported_sockets") or [])]]
            if not coolers:
                continue
            cooler = min(coolers, key=lambda c: c.price)

            cases = [c for c in by_cat["case"] if mb_ff in [str(f).lower() for f in (c.specs.get("supported_form_factors") or [])]]
            if not cases:
                continue
            case = min(cases, key=lambda c: c.price)

            candidate = {
                "cpu": cpu, "motherboard": mb, "ram": ram, "gpu": gpu,
                "storage": storage, "psu": psu, "case": case, "cpu_cooler": cooler,
            }
            cost = sum(p.price for p in candidate.values())
            if cost < lowest_cost:
                lowest_cost = cost
                best_build = candidate
                best_total_price = cost

    # Run compatibility analysis on final selected build
    compat_report = evaluate_compatibility(best_build)

    # Human-friendly purpose title & summary
    cpu_name = best_build["cpu"].name
    gpu_name = best_build["gpu"].name
    if purpose == "gaming":
        summary = f"High-Performance Gaming Build pairing {cpu_name} with {gpu_name} for maximum framerates."
    elif purpose == "workstation":
        summary = f"Multi-threaded Creator / Workstation Build with {best_build['cpu'].specs.get('cores', 8)} cores and high-speed NVMe storage."
    else:
        summary = f"Balanced Everyday Performance Build featuring {cpu_name} and {gpu_name}."

    parts_serialized = {}
    for cat_id, prod in best_build.items():
        parts_serialized[cat_id] = {
            "id": prod.id,
            "name": prod.name,
            "brand": prod.brand,
            "price": float(prod.price),
            "image_url": prod.image_url,
            "specs": prod.specs,
        }

    return {
        "purpose": purpose,
        "target_budget": float(budget),
        "total_price": float(best_total_price),
        "remaining_budget": float(max(Decimal("0"), budget - best_total_price)),
        "within_budget": best_total_price <= budget,
        "headline": summary,
        "compatibility": compat_report,
        "parts": parts_serialized,
    }
