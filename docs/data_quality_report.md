# Data Quality Report

This report summarizes data integrity, missing fields, derived values, source licenses, and spot-check results for the 80 PC components collected.

---

## 1. Category Breakdown & Missing Fields

| Category | Row Count | Required Fields Status | Empty Fields & Rationale |
| :--- | :---: | :--- | :--- |
| **CPU** | 10 | All required fields populated | None. Sockets, core counts, clocks, and TDP are complete. |
| **Motherboard** | 10 | All required fields populated | None. Form factors, RAM slots, M.2 slots, and SATA counts are complete. |
| **RAM** | 10 | All required fields populated | None. Speed, module count, and CAS latency are complete. |
| **GPU** | 10 | All required fields populated | None. Lengths, TDP, VRAM, and power connectors are complete. |
| **Storage** | 10 | All required fields populated | None. Types, interfaces, capacity, and form factors are complete. |
| **PSU** | 10 | All required fields populated | None. Wattages, efficiencies, modularity, and connectors are complete. |
| **Case** | 10 | All required fields populated | None. Motherboard support, GPU clearance, and cooler clearance are complete. |
| **CPU Cooler** | 10 | 7 populated; 3 missing `tdp_rating_w` | `cooler-02` (Noctua NH-D15), `cooler-06` (Noctua NH-L9i-17xx), and `cooler-07` (Noctua NH-L9a-AM5) have empty `tdp_rating_w`. **Reason**: Noctua explicitly refuses to publish wattage TDP ratings, using their proprietary NSPR rating instead. Per project honesty rules, these values were left empty rather than guessed. |

---

## 2. Values Derived or Sourced from Manufacturer / Wikipedia

1. **Hybrid Architecture Clocks (Intel Alder Lake / Raptor Lake)**:
   * Processors with hybrid P-core + E-core architectures (e.g. `cpu-09` i5-13600K and `cpu-10` i7-12700K) list the **Performance-core (P-core)** base clock in `base_clock_ghz` and maximum Turbo frequency in `boost_clock_ghz`.
2. **GPU Dimensions**:
   * ASUS TUF RTX 4090 OC physical length is 348.2 mm; normalized to integer `348` mm in `length_mm`.
   * ASUS Dual RTX 4060 EVO OC length is 227.2 mm; normalized to integer `227` mm.
3. **Case Clearances**:
   * Clearances represent default manufacturer interior setups (horizontal GPU mounting without optional side brackets).
4. **RAM `modules` Count**:
   * Represents physical stick count (1, 2, or 4) to support Rule 10 (RAM sticks vs motherboard slots validation).

---

## 3. Spot-Check Results (5 Components Verified Against Source)

1. **`cpu-01` (AMD Ryzen 5 5600X)**
   * **Source**: Wikipedia Zen 3 Desktop Table (`https://en.wikipedia.org/wiki/Ryzen#Zen_3`)
   * **Recorded**: Socket AM4, 6 cores, 12 threads, 3.7 GHz base, 4.6 GHz boost, 65W TDP, integrated graphics: false.
   * **Result**: **100% Match**

2. **`mb-01` (MSI B550-A PRO)**
   * **Source**: MSI Official Specification Page (`https://www.msi.com/Motherboard/B550-A-PRO/Specification`)
   * **Recorded**: Socket AM4, B550 chipset, ATX, DDR4, 4 slots, 128GB max, 2 M.2 slots, 6 SATA ports.
   * **Result**: **100% Match**

3. **`gpu-01` (ASUS TUF Gaming GeForce RTX 4090 OC Edition)**
   * **Source**: ASUS Official Tech Specs (`https://www.asus.com/motherboards-components/graphics-cards/tuf-gaming/tuf-rtx4090-o24g-gaming/techspec/`)
   * **Recorded**: Chipset RTX 4090, 24GB VRAM, 348 mm length, 450W TDP, 1x 16-pin power connector.
   * **Result**: **100% Match**

4. **`case-01` (Cooler Master MasterBox NR200)**
   * **Source**: Cooler Master Official Product Page (`https://www.coolermaster.com/en-global/products/masterbox-nr200/`)
   * **Recorded**: Mini-ITX form factor, max GPU length 330 mm, max cooler height 155 mm, SFX/SFX-L PSU support.
   * **Result**: **100% Match**

5. **`cooler-01` (Thermalright Peerless Assassin 120 SE)**
   * **Source**: Thermalright Official Specifications (`https://www.thermalright.com/product/peerless-assassin-120-se/`)
   * **Recorded**: Air Cooler, height 155 mm, supported sockets: AM4; AM5; LGA1700, TDP rating: 245W.
   * **Result**: **100% Match**

---

## 4. Sources and Licenses

* **Wikipedia (Wikimedia Foundation)**:
  * URLs: `https://en.wikipedia.org/wiki/Ryzen`, `https://en.wikipedia.org/wiki/Alder_Lake`, `https://en.wikipedia.org/wiki/Raptor_Lake`
  * License: Creative Commons Attribution-ShareAlike (CC BY-SA 4.0).
* **Official Manufacturer Specification Pages & Datasheets**:
  * Brands: ASUS, MSI, Gigabyte, ASRock, Corsair, G.Skill, Kingston, Crucial, TeamGroup, XFX, Sapphire, ZOTAC, Samsung, Western Digital, Seagate, EVGA, Seasonic, be quiet!, Cooler Master, Fractal Design, NZXT, Lian Li, Phanteks, Thermalright, DeepCool, Noctua, ARCTIC.
  * License: Proprietary manufacturer technical documentation, accessed publicly for factual specification data.
