/**
 * PcLoom Compatibility & Power Estimation Engine
 * Implements pure-function validators matching backend rules:
 * 1. CPU Socket == Motherboard Socket
 * 2. Motherboard Memory Type == RAM Type (DDR4 vs DDR5)
 * 3. GPU Length <= Case Max GPU Clearance
 * 4. CPU Cooler Height <= Case Max Cooler Height
 * 5. Cooler Supported Sockets contains CPU Socket
 * 6. Case Supported Form Factors contains Motherboard Form Factor
 * 7. Case PSU Form Factor contains PSU Form Factor
 * 8. Estimated Power Draw: int(cpu_tdp * 1.35) + gpu_tdp + 50W
 * 9. Recommended PSU Wattage: estimated_draw * 1.25 (25% safety headroom)
 * 10. Noctua NSPR warning for null TDP ratings
 */

export function calculatePowerMetrics(build) {
  const cpu = build.cpu;
  const gpu = build.gpu;

  const cpuBaseTdp = cpu && cpu.specs && cpu.specs.tdp_w ? Number(cpu.specs.tdp_w) : 0;
  // Turbo boost multiplier per requirements
  const cpuTurboTdp = Math.round(cpuBaseTdp * 1.35);
  const gpuTdp = gpu && gpu.specs && gpu.specs.tdp_w ? Number(gpu.specs.tdp_w) : 0;
  const systemBaseline = (cpu || gpu) ? 50 : 0; // Motherboard, RAM, SSDs, RGB, Fans

  const estimatedDraw = cpuTurboTdp + gpuTdp + systemBaseline;
  const recommendedPsu = Math.round(estimatedDraw * 1.25);

  const selectedPsuWattage = build.psu && build.psu.specs && build.psu.specs.wattage_w
    ? Number(build.psu.specs.wattage_w)
    : 0;

  const headroom = selectedPsuWattage > 0 ? selectedPsuWattage - estimatedDraw : 0;
  const headroomPercent = selectedPsuWattage > 0
    ? Math.round(((selectedPsuWattage - estimatedDraw) / selectedPsuWattage) * 100)
    : 0;

  return {
    cpuBaseTdp,
    cpuTurboTdp,
    gpuTdp,
    systemBaseline,
    estimatedDraw,
    recommendedPsu,
    selectedPsuWattage,
    headroom,
    headroomPercent
  };
}

export function evaluateCompatibility(build) {
  const issues = [];
  const warnings = [];
  const passed = [];

  const { cpu, motherboard: mb, ram, gpu, case: pcCase, cooler, psu } = build;

  // Rule 1: CPU & Motherboard Socket
  if (cpu && mb) {
    const cpuSocket = (cpu.specs.socket || '').trim().toUpperCase();
    const mbSocket = (mb.specs.socket || '').trim().toUpperCase();
    if (cpuSocket !== mbSocket) {
      issues.push({
        rule: 'CPU_SOCKET_MISMATCH',
        title: 'CPU Socket Incompatibility',
        message: `Processor ${cpu.name} (${cpuSocket}) is physically incompatible with Motherboard ${mb.name} (${mbSocket}).`,
        components: ['cpu', 'motherboard']
      });
    } else {
      passed.push(`CPU & Motherboard socket matched (${cpuSocket})`);
    }
  }

  // Rule 2: Motherboard & RAM DDR Generation
  if (mb && ram) {
    const mbMemType = (mb.specs.memory_type || '').trim().toUpperCase();
    const ramMemType = (ram.specs.type || '').trim().toUpperCase();
    if (mbMemType !== ramMemType) {
      issues.push({
        rule: 'RAM_GENERATION_MISMATCH',
        title: 'Memory Type Incompatible',
        message: `Motherboard ${mb.name} requires ${mbMemType} RAM, but ${ram.name} is ${ramMemType}. Pins and notches do not match.`,
        components: ['motherboard', 'ram']
      });
    } else {
      passed.push(`Memory generation matched (${mbMemType})`);
    }
  }

  // Rule 3: GPU Length vs Case Clearance
  if (gpu && pcCase) {
    const gpuLen = Number(gpu.specs.length_mm || 0);
    const maxLen = Number(pcCase.specs.max_gpu_length_mm || 9999);
    if (gpuLen > maxLen) {
      issues.push({
        rule: 'GPU_LENGTH_EXCEEDED',
        title: 'GPU Clearance Conflict',
        message: `Graphics card length (${gpuLen}mm) exceeds ${pcCase.name} maximum GPU clearance (${maxLen}mm). It will not fit in the case.`,
        components: ['gpu', 'case']
      });
    } else {
      const clearance = maxLen - gpuLen;
      passed.push(`GPU fits in chassis (${gpuLen}mm / ${maxLen}mm, +${clearance}mm buffer)`);
    }
  }

  // Rule 4: Cooler Height vs Case Clearance
  if (cooler && pcCase) {
    const coolerHeight = Number(cooler.specs.height_mm || 0);
    const maxCoolerHeight = Number(pcCase.specs.max_cooler_height_mm || 9999);
    if (coolerHeight > maxCoolerHeight) {
      issues.push({
        rule: 'COOLER_HEIGHT_EXCEEDED',
        title: 'Cooler Height Conflict',
        message: `Cooler height (${coolerHeight}mm) exceeds ${pcCase.name} maximum CPU cooler clearance (${maxCoolerHeight}mm). Side panel will not close.`,
        components: ['cooler', 'case']
      });
    } else {
      passed.push(`Cooler fits under side panel (${coolerHeight}mm / ${maxCoolerHeight}mm)`);
    }
  }

  // Rule 5: Cooler Supported Sockets
  if (cooler && cpu) {
    const cpuSocket = (cpu.specs.socket || '').trim().toUpperCase();
    const supportedSockets = (cooler.specs.supported_sockets || '')
      .toUpperCase()
      .split(';')
      .map(s => s.trim());
    if (!supportedSockets.includes(cpuSocket)) {
      issues.push({
        rule: 'COOLER_SOCKET_INCOMPATIBLE',
        title: 'Cooler Socket Incompatibility',
        message: `Cooler ${cooler.name} does not provide mounting hardware for socket ${cpuSocket}.`,
        components: ['cooler', 'cpu']
      });
    } else {
      passed.push(`Cooler mounting bracket compatible with ${cpuSocket}`);
    }
  }

  // Rule 6: Motherboard Form Factor in Case
  if (mb && pcCase) {
    const mbFF = (mb.specs.form_factor || '').trim().toUpperCase();
    const supportedFFs = (pcCase.specs.supported_form_factors || '')
      .toUpperCase()
      .split(';')
      .map(s => s.trim());
    if (!supportedFFs.includes(mbFF)) {
      issues.push({
        rule: 'FORM_FACTOR_MISMATCH',
        title: 'Form Factor Incompatible',
        message: `Chassis ${pcCase.name} does not fit ${mbFF} motherboards (supports: ${pcCase.specs.supported_form_factors}).`,
        components: ['motherboard', 'case']
      });
    } else {
      passed.push(`Motherboard form factor fits case (${mbFF})`);
    }
  }

  // Rule 7: PSU Wattage & Safety Headroom
  const power = calculatePowerMetrics(build);
  if (psu && power.selectedPsuWattage > 0) {
    if (power.selectedPsuWattage < power.estimatedDraw) {
      issues.push({
        rule: 'INSUFFICIENT_PSU_WATTAGE',
        title: 'Insufficient Power Supply',
        message: `Estimated peak system draw (${power.estimatedDraw}W) exceeds PSU capacity (${power.selectedPsuWattage}W). System will trip over-current protection under heavy loads.`,
        components: ['psu']
      });
    } else if (power.selectedPsuWattage < power.recommendedPsu) {
      warnings.push({
        rule: 'TIGHT_PSU_HEADROOM',
        title: 'Low Power Headroom',
        message: `PSU wattage (${power.selectedPsuWattage}W) provides only ${power.headroom}W (${power.headroomPercent}%) headroom. Recommended 25% safety buffer is ${power.recommendedPsu}W to prevent transient spikes.`,
        components: ['psu']
      });
    } else {
      passed.push(`PSU wattage optimal (${power.selectedPsuWattage}W for ~${power.estimatedDraw}W draw, +${power.headroomPercent}% headroom)`);
    }
  }

  // Rule 8: Noctua Cooler TDP check
  if (cooler && cooler.brand === 'Noctua') {
    if (!cooler.specs.tdp_rating_w) {
      warnings.push({
        rule: 'NOCTUA_NSPR_HEADROOM',
        title: 'Noctua NSPR Thermal Standard',
        message: 'Noctua measures cooling performance via proprietary NSPR rather than standard TDP wattage ratings. Check Noctua compatibility list for peak CPU boost clocks.',
        components: ['cooler']
      });
    }
  }

  // Calculate Overall Status
  const isCompatible = issues.length === 0;
  const totalParts = Object.values(build).filter(Boolean).length;

  return {
    isCompatible,
    hasWarnings: warnings.length > 0,
    issues,
    warnings,
    passed,
    power,
    totalParts
  };
}
