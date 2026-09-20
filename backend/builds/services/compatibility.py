"""
Rule-Based PC Compatibility Engine.

Architecture:
- Modular, individual rule functions (data + rules, rather than one monolithic block).
- Returns structured results:
  - is_compatible: bool (False if any ERROR exists)
  - estimated_power_w: int
  - errors: list of issue dicts
  - warnings: list of issue dicts
  - summary: high-level plain English summary
"""

from typing import Dict, List, Optional, Any


class CompatibilityIssue:
    def __init__(
        self,
        rule_id: int,
        severity: str,  # 'ERROR' | 'WARNING'
        rule_name: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.rule_id = rule_id
        self.severity = severity.upper()
        self.rule_name = rule_name
        self.message = message
        self.details = details or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "rule_id": self.rule_id,
            "severity": self.severity,
            "rule_name": self.rule_name,
            "message": self.message,
            "details": self.details,
        }


# =====================================================================
# INDIVIDUAL RULE CHECKERS
# =====================================================================

def rule_01_cpu_motherboard_socket(parts: Dict[str, Any]) -> Optional[CompatibilityIssue]:
    """Rule 1 (Error): CPU socket must match Motherboard socket."""
    cpu = parts.get("cpu")
    mb = parts.get("motherboard")
    if not cpu or not mb:
        return None

    cpu_socket = (cpu.specs.get("socket") or "").strip().upper()
    mb_socket = (mb.specs.get("socket") or "").strip().upper()

    if cpu_socket and mb_socket and cpu_socket != mb_socket:
        return CompatibilityIssue(
            rule_id=1,
            severity="ERROR",
            rule_name="CPU / Motherboard Socket Match",
            message=f"{cpu_socket} CPU on an {mb_socket} motherboard",
            details={
                "cpu_id": cpu.id,
                "cpu_socket": cpu_socket,
                "motherboard_id": mb.id,
                "motherboard_socket": mb_socket,
            },
        )
    return None


def rule_02_ram_motherboard_type(parts: Dict[str, Any]) -> Optional[CompatibilityIssue]:
    """Rule 2 (Error): RAM type (DDR4/DDR5) must match Motherboard supported memory."""
    ram = parts.get("ram")
    mb = parts.get("motherboard")
    if not ram or not mb:
        return None

    ram_type = (ram.specs.get("type") or "").strip().upper()
    mb_type = (mb.specs.get("memory_type") or "").strip().upper()

    if ram_type and mb_type and ram_type != mb_type:
        return CompatibilityIssue(
            rule_id=2,
            severity="ERROR",
            rule_name="RAM / Motherboard Memory Generation",
            message=f"{ram_type} RAM installed in a {mb_type} motherboard",
            details={
                "ram_id": ram.id,
                "ram_type": ram_type,
                "motherboard_id": mb.id,
                "motherboard_memory_type": mb_type,
            },
        )
    return None


def rule_03_motherboard_case_form_factor(parts: Dict[str, Any]) -> Optional[CompatibilityIssue]:
    """Rule 3 (Error): Motherboard form factor must be supported by the Case."""
    mb = parts.get("motherboard")
    case = parts.get("case")
    if not mb or not case:
        return None

    mb_ff = (mb.specs.get("form_factor") or "").strip()
    supported = case.specs.get("supported_form_factors") or []

    if isinstance(supported, str):
        supported_list = [s.strip().lower() for s in supported.split(";") if s.strip()]
    else:
        supported_list = [str(s).strip().lower() for s in supported]

    if mb_ff and supported_list and mb_ff.lower() not in supported_list:
        return CompatibilityIssue(
            rule_id=3,
            severity="ERROR",
            rule_name="Motherboard / Case Form Factor Clearance",
            message=f"{mb_ff} motherboard does not fit in case supporting only {', '.join(supported_list)}",
            details={
                "motherboard_id": mb.id,
                "form_factor": mb_ff,
                "case_id": case.id,
                "supported_form_factors": supported_list,
            },
        )
    return None


def rule_04_gpu_case_clearance(parts: Dict[str, Any]) -> Optional[CompatibilityIssue]:
    """Rule 4 (Error): GPU length must fit within Case GPU clearance."""
    gpu = parts.get("gpu")
    case = parts.get("case")
    if not gpu or not case:
        return None

    gpu_len = gpu.specs.get("length_mm")
    max_len = case.specs.get("max_gpu_length_mm")

    if gpu_len and max_len and gpu_len > max_len:
        return CompatibilityIssue(
            rule_id=4,
            severity="ERROR",
            rule_name="GPU Length vs Case Clearance",
            message=f"GPU length ({gpu_len} mm) exceeds the case's maximum GPU clearance ({max_len} mm)",
            details={
                "gpu_id": gpu.id,
                "gpu_length_mm": gpu_len,
                "case_id": case.id,
                "max_gpu_length_mm": max_len,
            },
        )
    return None


def rule_05_cooler_case_clearance(parts: Dict[str, Any]) -> Optional[CompatibilityIssue]:
    """Rule 5 (Error): CPU cooler height must fit within Case cooler clearance."""
    cooler = parts.get("cpu_cooler")
    case = parts.get("case")
    if not cooler or not case:
        return None

    cooler_h = cooler.specs.get("height_mm")
    max_h = case.specs.get("max_cooler_height_mm")

    if cooler_h and max_h and cooler_h > max_h:
        return CompatibilityIssue(
            rule_id=5,
            severity="ERROR",
            rule_name="CPU Cooler Height vs Case Clearance",
            message=f"CPU cooler height ({cooler_h} mm) exceeds the case's maximum cooler clearance ({max_h} mm)",
            details={
                "cooler_id": cooler.id,
                "cooler_height_mm": cooler_h,
                "case_id": case.id,
                "max_cooler_height_mm": max_h,
            },
        )
    return None


def rule_06_cooler_cpu_socket(parts: Dict[str, Any]) -> Optional[CompatibilityIssue]:
    """Rule 6 (Error): CPU cooler must support the CPU socket."""
    cooler = parts.get("cpu_cooler")
    cpu = parts.get("cpu")
    if not cooler or not cpu:
        return None

    cpu_socket = (cpu.specs.get("socket") or "").strip().upper()
    supported = cooler.specs.get("supported_sockets") or []

    if isinstance(supported, str):
        supported_sockets = [s.strip().upper() for s in supported.split(";") if s.strip()]
    else:
        supported_sockets = [str(s).strip().upper() for s in supported]

    if cpu_socket and supported_sockets and cpu_socket not in supported_sockets:
        return CompatibilityIssue(
            rule_id=6,
            severity="ERROR",
            rule_name="CPU Cooler Socket Support",
            message=f"Cooler does not list support for CPU socket {cpu_socket}",
            details={
                "cooler_id": cooler.id,
                "supported_sockets": supported_sockets,
                "cpu_id": cpu.id,
                "cpu_socket": cpu_socket,
            },
        )
    return None


def rule_07_and_08_psu_wattage_and_headroom(parts: Dict[str, Any]) -> List[CompatibilityIssue]:
    """
    Rule 7 (Error): PSU wattage covers estimated total power draw.
    Rule 8 (Warning): PSU wattage leaves recommended headroom (>= 25% safety margin).
    """
    issues = []
    psu = parts.get("psu")
    if not psu:
        return issues

    # Calculate estimated draw
    estimated_draw = calculate_estimated_draw(parts)
    psu_wattage = psu.specs.get("wattage_w", 0)

    if not psu_wattage:
        return issues

    # Rule 7: Total deficit (Error)
    if psu_wattage < estimated_draw:
        issues.append(
            CompatibilityIssue(
                rule_id=7,
                severity="ERROR",
                rule_name="PSU Total Wattage Sufficiency",
                message=f"PSU wattage ({psu_wattage}W) is insufficient for estimated system draw ({estimated_draw}W)",
                details={"psu_wattage_w": psu_wattage, "estimated_draw_w": estimated_draw},
            )
        )
        return issues

    # Rule 8: Headroom check (Warning)
    # Headroom is deficient if headroom is under 25% of PSU capacity (draw exceeds 75% of PSU)
    headroom_w = psu_wattage - estimated_draw
    headroom_pct = (headroom_w / psu_wattage) * 100

    if headroom_pct < 25.0:
        issues.append(
            CompatibilityIssue(
                rule_id=8,
                severity="WARNING",
                rule_name="PSU Recommended Headroom",
                message=f"PSU wattage ({psu_wattage}W) covers estimated draw ({estimated_draw}W) but provides insufficient recommended headroom (less than 25% buffer)",
                details={
                    "psu_wattage_w": psu_wattage,
                    "estimated_draw_w": estimated_draw,
                    "headroom_w": headroom_w,
                    "headroom_pct": round(headroom_pct, 1),
                },
            )
        )

    return issues


def rule_09_storage_interface_slots(parts: Dict[str, Any]) -> Optional[CompatibilityIssue]:
    """Rule 9 (Error): Motherboard must provide matching storage slots (M.2 / SATA)."""
    storage = parts.get("storage")
    mb = parts.get("motherboard")
    if not storage or not mb:
        return None

    storage_form = (storage.specs.get("form_factor") or "").upper()
    storage_type = (storage.specs.get("type") or "").upper()

    if "M.2" in storage_form or "NVME" in storage_type:
        m2_slots = mb.specs.get("m2_slots", 0)
        if m2_slots < 1:
            return CompatibilityIssue(
                rule_id=9,
                severity="ERROR",
                rule_name="Storage Interface Availability",
                message="M.2 NVMe SSD selected but motherboard has 0 M.2 slots",
                details={"motherboard_id": mb.id, "m2_slots": m2_slots},
            )
    elif "SATA" in storage_type or "2.5" in storage_form:
        sata_ports = mb.specs.get("sata_ports", 0)
        if sata_ports < 1:
            return CompatibilityIssue(
                rule_id=9,
                severity="ERROR",
                rule_name="Storage Interface Availability",
                message="SATA SSD selected but motherboard has 0 SATA ports",
                details={"motherboard_id": mb.id, "sata_ports": sata_ports},
            )
    return None


def rule_10_ram_slots_count(parts: Dict[str, Any]) -> Optional[CompatibilityIssue]:
    """Rule 10 (Error): Number of RAM sticks cannot exceed motherboard RAM slots."""
    ram = parts.get("ram")
    mb = parts.get("motherboard")
    if not ram or not mb:
        return None

    modules = ram.specs.get("modules", 1)
    slots = mb.specs.get("memory_slots", 4)

    if modules and slots and modules > slots:
        return CompatibilityIssue(
            rule_id=10,
            severity="ERROR",
            rule_name="RAM Physical Slot Capacity",
            message=f"RAM kit contains {modules} modules, but motherboard only has {slots} memory slots",
            details={"modules": modules, "motherboard_slots": slots},
        )
    return None


def rule_11_ram_capacity_limit(parts: Dict[str, Any]) -> Optional[CompatibilityIssue]:
    """Rule 11 (Error): RAM capacity cannot exceed motherboard max memory."""
    ram = parts.get("ram")
    mb = parts.get("motherboard")
    if not ram or not mb:
        return None

    capacity = ram.specs.get("capacity_gb", 0)
    max_capacity = mb.specs.get("max_memory_gb", 128)

    if capacity and max_capacity and capacity > max_capacity:
        return CompatibilityIssue(
            rule_id=11,
            severity="ERROR",
            rule_name="RAM Max Capacity Support",
            message=f"RAM capacity ({capacity} GB) exceeds motherboard maximum supported capacity ({max_capacity} GB)",
            details={"capacity_gb": capacity, "max_memory_gb": max_capacity},
        )
    return None


def rule_12_and_13_cooler_tdp_rating(parts: Dict[str, Any]) -> Optional[CompatibilityIssue]:
    """
    Rule 12 (Warning): Cooler rated TDP must cover CPU TDP.
    Rule 13 (Warning): Missing cooler TDP (e.g. Noctua NSPR) triggers 'could not verify' warning.
    """
    cooler = parts.get("cpu_cooler")
    cpu = parts.get("cpu")
    if not cooler or not cpu:
        return None

    cooler_tdp = cooler.specs.get("tdp_rating_w")
    cpu_tdp = cpu.specs.get("tdp_w")

    # Rule 13: Unverifiable rating (Honesty rule)
    if cooler_tdp is None:
        return CompatibilityIssue(
            rule_id=13,
            severity="WARNING",
            rule_name="Unverifiable Cooler TDP Rating",
            message=f"Could not verify cooler TDP rating against CPU TDP ({cooler.brand} does not publish standard wattage TDP ratings)",
            details={"cooler_id": cooler.id, "cpu_tdp_w": cpu_tdp},
        )

    # Rule 12: Cooler TDP lower than CPU TDP
    if cpu_tdp and cooler_tdp and cooler_tdp < cpu_tdp:
        return CompatibilityIssue(
            rule_id=12,
            severity="WARNING",
            rule_name="Cooler TDP vs CPU TDP",
            message=f"Cooler rated capacity ({cooler_tdp}W) is lower than CPU TDP ({cpu_tdp}W); high temperatures or thermal throttling may occur under load",
            details={"cooler_tdp_w": cooler_tdp, "cpu_tdp_w": cpu_tdp},
        )

    return None


# =====================================================================
# POWER ESTIMATOR
# =====================================================================

def calculate_estimated_draw(parts: Dict[str, Any]) -> int:
    """
    Calculates estimated system wattage draw.
    Baseline: 50W (Motherboard, RAM sticks, storage, fans, chipset).
    + CPU TDP (or 65W default)
    + GPU TDP (or 0W if using integrated graphics)
    """
    draw = 50  # Base platform wattage

    cpu = parts.get("cpu")
    if cpu:
        draw += cpu.specs.get("tdp_w", 65)

    gpu = parts.get("gpu")
    if gpu:
        draw += gpu.specs.get("tdp_w", 0)

    return draw


# =====================================================================
# CORE ENGINE EVALUATOR
# =====================================================================

ALL_RULES = [
    rule_01_cpu_motherboard_socket,
    rule_02_ram_motherboard_type,
    rule_03_motherboard_case_form_factor,
    rule_04_gpu_case_clearance,
    rule_05_cooler_case_clearance,
    rule_06_cooler_cpu_socket,
    rule_07_and_08_psu_wattage_and_headroom,
    rule_09_storage_interface_slots,
    rule_10_ram_slots_count,
    rule_11_ram_capacity_limit,
    rule_12_and_13_cooler_tdp_rating,
]


def evaluate_compatibility(parts: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates a dictionary of components mapped by category_id ('cpu', 'motherboard', etc.).
    Returns comprehensive compatibility report.
    """
    issues: List[CompatibilityIssue] = []

    for rule_fn in ALL_RULES:
        result = rule_fn(parts)
        if result is None:
            continue
        if isinstance(result, list):
            issues.extend(result)
        else:
            issues.append(result)

    errors = [i.to_dict() for i in issues if i.severity == "ERROR"]
    warnings = [i.to_dict() for i in issues if i.severity == "WARNING"]
    estimated_draw = calculate_estimated_draw(parts)

    is_compatible = len(errors) == 0

    if is_compatible and not warnings:
        summary = "All selected components are fully compatible."
    elif is_compatible and warnings:
        summary = f"Components are compatible with {len(warnings)} warning(s) to review."
    else:
        summary = f"Compatibility check failed with {len(errors)} error(s) and {len(warnings)} warning(s)."

    return {
        "is_compatible": is_compatible,
        "summary": summary,
        "estimated_power_w": estimated_draw,
        "errors": errors,
        "warnings": warnings,
        "total_issues": len(issues),
    }


def evaluate_build(build) -> Dict[str, Any]:
    """Convenience wrapper to evaluate a Django Build instance."""
    parts = {}
    for item in build.items.select_related("product", "category"):
        parts[item.category.id] = item.product
    return evaluate_compatibility(parts)
