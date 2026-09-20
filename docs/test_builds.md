# Test Builds (5 Known-Good & 5 Known-Bad)

All builds strictly use one part ID per category from the 80-part catalog:
`[CPU, Motherboard, RAM, GPU, Storage, PSU, Case, CPU Cooler]`

---

## 1. Known-Good Builds

### Good Build 1: Flagship AMD AM5 ATX Gaming Rig
* **Parts**:
  * CPU: `cpu-06` (AMD Ryzen 7 7800X3D)
  * Motherboard: `mb-04` (MSI MAG B650 TOMAHAWK WIFI)
  * RAM: `ram-08` (G.Skill Flare X5 32GB 2x16GB DDR5-6000 CL30)
  * GPU: `gpu-04` (Gigabyte GeForce RTX 4080 SUPER WINDFORCE V2 16G)
  * Storage: `storage-01` (Samsung 980 PRO 1TB NVMe M.2)
  * PSU: `psu-08` (Corsair RM850x 850W)
  * Case: `case-06` (Corsair 4000D AIRFLOW)
  * Cooler: `cooler-01` (Thermalright Peerless Assassin 120 SE)
* **Compatibility Verification**:
  * Socket AM5 on AM5 motherboard (Match).
  * DDR5 RAM on DDR5 motherboard, 2 sticks in 4 slots (Match).
  * ATX motherboard in ATX case (Fits).
  * GPU length 330 mm < 360 mm case clearance (Fits).
  * Cooler height 155 mm < 170 mm case clearance (Fits).
  * AM5 cooler socket supported (Match).
  * Total power draw: ~120W + 320W + 50W = ~490W. PSU: 850W (>40% safe headroom).
* **Expected Result**: **PASS** (Fully Compatible)

---

### Good Build 2: Budget Intel Core i5 Micro-ATX Build
* **Parts**:
  * CPU: `cpu-08` (Intel Core i5-12400)
  * Motherboard: `mb-07` (MSI PRO B660M-A DDR4)
  * RAM: `ram-01` (Corsair Vengeance LPX 16GB 2x8GB DDR4-3200)
  * GPU: `gpu-08` (ASUS Dual GeForce RTX 4060 EVO OC)
  * Storage: `storage-03` (Crucial P3 Plus 1TB NVMe M.2)
  * PSU: `psu-06` (MSI MAG A650BN 650W)
  * Case: `case-05` (ASUS Prime AP201 Micro-ATX)
  * Cooler: `cooler-05` (Cooler Master Hyper 212 Black)
* **Compatibility Verification**:
  * Socket LGA1700 on LGA1700 motherboard (Match).
  * DDR4 RAM on DDR4 motherboard, 2 sticks in 4 slots (Match).
  * Micro-ATX motherboard in Micro-ATX case (Fits).
  * GPU length 227 mm < 338 mm case clearance (Fits).
  * Cooler height 152 mm < 170 mm case clearance (Fits).
  * LGA1700 cooler socket supported (Match).
  * Total power draw: ~65W + 115W + 50W = ~230W. PSU: 650W.
* **Expected Result**: **PASS** (Fully Compatible)

---

### Good Build 3: Mainstream AMD AM4 ATX Gaming Build
* **Parts**:
  * CPU: `cpu-01` (AMD Ryzen 5 5600X)
  * Motherboard: `mb-01` (MSI B550-A PRO)
  * RAM: `ram-04` (G.Skill Ripjaws V 32GB 2x16GB DDR4-3600)
  * GPU: `gpu-05` (Sapphire PULSE AMD Radeon RX 7800 XT)
  * Storage: `storage-02` (Samsung 990 PRO 2TB NVMe M.2)
  * PSU: `psu-04` (Corsair RM750e 750W)
  * Case: `case-08` (Fractal Design North)
  * Cooler: `cooler-08` (ARCTIC Liquid Freezer II 240)
* **Compatibility Verification**:
  * Socket AM4 on AM4 motherboard (Match).
  * DDR4 RAM on DDR4 motherboard (Match).
  * ATX motherboard in ATX case (Fits).
  * GPU length 280 mm < 355 mm case clearance (Fits).
  * AIO pump block 53 mm < 170 mm clearance (Fits).
  * AM4 socket supported (Match).
  * Total draw: ~65W + 263W + 50W = ~378W. PSU: 750W.
* **Expected Result**: **PASS** (Fully Compatible)

---

### Good Build 4: High-End Intel Core i7 Enthusiast Build
* **Parts**:
  * CPU: `cpu-10` (Intel Core i7-12700K)
  * Motherboard: `mb-10` (MSI MAG Z790 TOMAHAWK WIFI)
  * RAM: `ram-07` (Corsair Vengeance 32GB 2x16GB DDR5-5600)
  * GPU: `gpu-01` (ASUS TUF Gaming GeForce RTX 4090 OC)
  * Storage: `storage-04` (Western Digital Black SN850X 2TB NVMe M.2)
  * PSU: `psu-10` (Corsair RM1000x 1000W)
  * Case: `case-09` (Lian Li LANCOOL 216)
  * Cooler: `cooler-03` (DeepCool AK620)
* **Compatibility Verification**:
  * Socket LGA1700 on LGA1700 motherboard (Match).
  * DDR5 RAM on DDR5 motherboard (Match).
  * ATX motherboard in ATX case (Fits).
  * GPU length 348 mm < 392 mm case clearance (Fits).
  * Cooler height 160 mm < 180 mm case clearance (Fits).
  * LGA1700 cooler socket supported (Match).
  * Total draw: ~125W + 450W + 50W = ~625W. PSU: 1000W (>35% headroom).
* **Expected Result**: **PASS** (Fully Compatible)

---

### Good Build 5: Compact Micro-ATX Intel Build
* **Parts**:
  * CPU: `cpu-07` (Intel Core i3-12100F)
  * Motherboard: `mb-07` (MSI PRO B660M-A DDR4)
  * RAM: `ram-02` (TeamGroup T-Force Vulcan Z 16GB 2x8GB DDR4-3200)
  * GPU: `gpu-09` (MSI GeForce RTX 4060 Ti VENTUS 2X BLACK 8G OC)
  * Storage: `storage-05` (Kingston NV2 1TB NVMe M.2)
  * PSU: `psu-03` (Corsair CX550 550W)
  * Case: `case-04` (Fractal Design Pop Mini Air)
  * Cooler: `cooler-05` (Cooler Master Hyper 212 Black)
* **Compatibility Verification**:
  * Socket LGA1700 on LGA1700 motherboard (Match).
  * DDR4 RAM on DDR4 motherboard (Match).
  * Micro-ATX motherboard fits Pop Mini Air (Fits).
  * GPU length 199 mm < 365 mm case clearance (Fits).
  * Cooler height 152 mm < 170 mm case clearance (Fits).
  * Total draw: ~58W + 160W + 50W = ~268W. PSU: 550W.
* **Expected Result**: **PASS** (Fully Compatible)

---

## 2. Known-BAD Builds

### Bad Build 1: CPU / Motherboard Socket Mismatch
* **Parts**: `cpu-04`, `mb-07`, `ram-01`, `gpu-08`, `storage-01`, `psu-06`, `case-06`, `cooler-01`
* **Failing Rule**: **Rule 1** (CPU socket matches motherboard socket)
* **Severity**: **Error**
* **Plain-Language Message**: *"AM5 CPU on an LGA1700 motherboard"*

---

### Bad Build 2: RAM Generation Mismatch
* **Parts**: `cpu-08`, `mb-10`, `ram-03`, `gpu-07`, `storage-01`, `psu-04`, `case-06`, `cooler-01`
* **Failing Rule**: **Rule 2** (RAM type matches what the motherboard supports)
* **Severity**: **Error**
* **Plain-Language Message**: *"DDR4 RAM installed in a DDR5 motherboard"*

---

### Bad Build 3: Case GPU Clearance Failure (GPU physically too long)
* **Parts**: `cpu-01`, `mb-03`, `ram-01`, `gpu-01`, `storage-01`, `psu-08`, `case-01`, `cooler-05`
* **Failing Rule**: **Rule 4** (GPU length fits within the case's GPU clearance)
* **Severity**: **Error**
* **Plain-Language Message**: *"GPU length (348 mm) exceeds the case's maximum GPU clearance (330 mm)"*

---

### Bad Build 4: Case Cooler Clearance Failure (Tower cooler too tall for slim case)
* **Parts**: `cpu-01`, `mb-03`, `ram-01`, `gpu-10`, `storage-01`, `psu-04`, `case-02`, `cooler-01`
* **Failing Rule**: **Rule 5** (CPU cooler height fits within the case's cooler clearance)
* **Severity**: **Error**
* **Plain-Language Message**: *"CPU cooler height (155 mm) exceeds the case's maximum cooler clearance (70 mm)"*

---

### Bad Build 5: Insufficient PSU Headroom (High draw on low-wattage PSU)
* **Parts**: `cpu-10`, `mb-08`, `ram-03`, `gpu-05`, `storage-01`, `psu-02`, `case-06`, `cooler-03`
* **Calculation**:
  * Core i7-12700K base TDP: 125W (Max Turbo Power: 190W)
  * Radeon RX 7800 XT TDP: 263W
  * Motherboard / RAM / Storage / Fans: ~50W
  * Estimated Draw: 438W base (up to 503W turbo)
  * PSU Wattage: 550W (MSI MAG A550BN)
  * Headroom: 550W - 438W = 112W (only 20.3% headroom above base; 47W / 8.5% above turbo). Recommended headroom is >= 25%–30%.
* **Failing Rule**: **Rule 8** (PSU wattage leaves recommended headroom above estimated draw)
* **Severity**: **Warning**
* **Plain-Language Message**: *"PSU wattage (550W) covers estimated draw (438W) but provides insufficient recommended headroom (less than 25% buffer)"*
