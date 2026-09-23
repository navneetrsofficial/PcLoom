/**
 * Hardware Image Resolver Utility
 * Maps hardware items to realistic verified product artwork.
 */

export function getComponentImage(category, item = {}) {
  const cat = (category || item.category || item.category_id || '').toLowerCase();
  const name = (item.name || '').toLowerCase();
  const brand = (item.brand || '').toLowerCase();

  if (cat === 'cpu') {
    if (brand.includes('intel') || name.includes('core') || name.includes('i3') || name.includes('i5') || name.includes('i7') || name.includes('i9')) {
      return '/images/intel_box.png';
    }
    return '/images/amd_box.png';
  }

  if (cat === 'gpu') {
    return '/images/gpu_thumb.jpg';
  }

  if (cat === 'motherboard') {
    return '/images/mb_thumb.jpg';
  }

  if (cat === 'ram') {
    return '/images/ram_thumb.jpg';
  }

  if (cat === 'storage') {
    return '/images/ssd_thumb.jpg';
  }

  if (cat === 'psu') {
    return '/images/psu_thumb.jpg';
  }

  if (cat === 'cooler' || cat === 'cpu_cooler') {
    return '/images/cooler_thumb.jpg';
  }

  if (cat === 'case') {
    return '/images/hero_rig_45.png';
  }

  return '/images/hero_rig_45.png';
}

/**
 * Format component specifications into clean lines for cards and lists.
 */
export function formatSpecs(category, item = {}) {
  const cat = (category || item.category || item.category_id || '').toLowerCase();
  const s = item.specs || {};

  if (cat === 'cpu') {
    const l1 = s.cores ? `${s.cores} Cores / ${s.threads} Threads • ${s.base_clock_ghz}/${s.boost_clock_ghz} GHz` : (item.specsLine1 || '');
    const l2 = s.socket ? `Socket: ${s.socket} • TDP: ${s.tdp_w}W` : (item.specsLine2 || '');
    return { l1: l1 || 'High-performance Desktop CPU', l2: l2 || 'AM5 / LGA1700' };
  }

  if (cat === 'gpu') {
    const l1 = (s.vram_gb || s.memory_gb) ? `${s.vram_gb || s.memory_gb}GB VRAM • ${s.chipset || 'PCIe 4.0'}` : (item.specsLine1 || '');
    const l2 = s.length_mm ? `Length: ${s.length_mm}mm • TDP: ${s.tdp_w}W` : (item.specsLine2 || '');
    return { l1: l1 || 'Dedicated Gaming GPU', l2: l2 || 'Ray Tracing & DLSS' };
  }

  if (cat === 'motherboard') {
    const l1 = s.socket ? `Socket: ${s.socket} • ${s.form_factor || 'ATX'}` : (item.specsLine1 || '');
    const l2 = s.memory_type ? `RAM: ${s.memory_type} (${s.memory_slots || 4} slots) • Max: ${s.max_memory_gb || 128}GB` : (item.specsLine2 || '');
    return { l1: l1 || 'Gaming Motherboard', l2: l2 || 'PCIe Gen 4/5 Architecture' };
  }

  if (cat === 'ram') {
    const l1 = s.capacity_gb ? `${s.capacity_gb}GB (${s.modules || '2x'} modules) • ${s.type || 'DDR5'}-${s.speed_mhz || 6000}` : (item.specsLine1 || '');
    const l2 = s.cas_latency ? `CAS Latency: CL${s.cas_latency} • Dual Channel` : (item.specsLine2 || '');
    return { l1: l1 || 'High-Speed Memory Kit', l2: l2 || 'Low-Latency Heat Spreader' };
  }

  if (cat === 'storage') {
    const l1 = s.capacity_gb ? `${s.capacity_gb >= 1000 ? `${s.capacity_gb / 1000}TB` : `${s.capacity_gb}GB`} • ${s.interface || 'PCIe 4.0 NVMe'}` : (item.specsLine1 || '');
    const l2 = s.read_mb_s ? `Read: ${s.read_mb_s} MB/s • Write: ${s.write_mb_s || 5000} MB/s` : (s.form_factor ? `Form Factor: ${s.form_factor}` : (item.specsLine2 || ''));
    return { l1: l1 || 'Fast Solid-State Storage', l2: l2 || 'M.2 2280 Form Factor' };
  }

  if (cat === 'psu') {
    const l1 = s.wattage_w ? `${s.wattage_w}W • Efficiency: ${s.efficiency || s.efficiency_rating || '80+ Gold'}` : (item.specsLine1 || '');
    const l2 = s.modular ? `Modularity: ${s.modular} • ${s.form_factor || 'ATX'}` : (item.specsLine2 || '');
    return { l1: l1 || 'Certified Power Supply Unit', l2: l2 || 'Active PFC Protection' };
  }

  if (cat === 'cooler' || cat === 'cpu_cooler') {
    const l1 = s.type ? `Type: ${s.type} • Height: ${s.height_mm ? `${s.height_mm}mm` : 'AIO'}` : (item.specsLine1 || '');
    const l2 = s.supported_sockets ? `Sockets: ${s.supported_sockets}` : (item.specsLine2 || '');
    return { l1: l1 || 'Precision Thermal Solution', l2: l2 || 'PWM Fluid Dynamic Fans' };
  }

  if (cat === 'case') {
    const l1 = s.supported_form_factors ? `Supports: ${s.supported_form_factors}` : (s.form_factor ? `Form Factor: ${s.form_factor}` : (item.specsLine1 || ''));
    const l2 = s.max_gpu_length_mm ? `Max GPU: ${s.max_gpu_length_mm}mm • Max Cooler: ${s.max_cooler_height_mm || 165}mm` : (item.specsLine2 || '');
    return { l1: l1 || 'Tempered Glass PC Chassis', l2: l2 || 'Optimized Airflow Inlets' };
  }

  return { l1: item.specsLine1 || 'Hardware Component', l2: item.specsLine2 || 'Verified Specifications' };
}
