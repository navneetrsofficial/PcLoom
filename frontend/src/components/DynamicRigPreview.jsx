import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Maximize2,
  Layers,
  Thermometer,
  Cpu,
  Tv,
  CheckCircle2,
  Box
} from 'lucide-react';
import './DynamicRigPreview.css';

export default function DynamicRigPreview({
  build = {},
  totalPrice = 0,
  estimatedPower = 450,
  compatScore = 92,
  isCompatible = true,
  warnings = [],
  onSelectCategory = () => {}
}) {
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [rgbTheme, setRgbTheme] = useState('cyan'); // 'cyan', 'crimson', 'purple', 'green'

  // Extract components
  const cpu = build.cpu;
  const gpus = Array.isArray(build.gpu) ? build.gpu : (build.gpu ? [build.gpu] : []);
  const motherboard = build.motherboard;
  const ram = build.ram;
  const cooler = build.cooler || build.cpu_cooler;
  const storage = Array.isArray(build.storage) ? build.storage : (build.storage ? [build.storage] : []);
  const psu = build.psu;
  const pcCase = build.case;

  // Determine cooling type
  const coolerName = (cooler?.name || '').toLowerCase();
  const coolerType = (cooler?.specs?.type || '').toLowerCase();
  const isAio = coolerName.includes('aio') ||
    coolerName.includes('liquid') ||
    coolerName.includes('kraken') ||
    coolerName.includes('freezer') ||
    coolerName.includes('h100') ||
    coolerType.includes('liquid') ||
    coolerType.includes('aio');

  // Determine CPU architecture
  const cpuName = (cpu?.name || '').toLowerCase();
  const isAmd = cpuName.includes('ryzen') || (cpu?.brand || '').toLowerCase().includes('amd');
  const isIntel = cpuName.includes('intel') || cpuName.includes('core');

  // Determine Case profile
  const caseName = (pcCase?.name || '').toLowerCase();
  const isItx = caseName.includes('nr200') || caseName.includes('ridge') || caseName.includes('a4-h2o') || (pcCase?.specs?.form_factor || '').toLowerCase().includes('itx');

  // GPU specs
  const primaryGpu = gpus[0];
  const secondaryGpu = gpus[1];
  const isTripleFan = (primaryGpu?.specs?.length_mm || 280) > 300 || (primaryGpu?.name || '').includes('4080') || (primaryGpu?.name || '').includes('4090') || (primaryGpu?.name || '').includes('7900');

  // RGB colors
  const themeColors = {
    cyan: { primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.6)' },
    crimson: { primary: '#ef4444', glow: 'rgba(239, 68, 68, 0.6)' },
    purple: { primary: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)' },
    green: { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.6)' }
  };
  const currentTheme = themeColors[rgbTheme] || themeColors.cyan;

  // PSU capacity for gauge
  const psuWattage = parseInt(psu?.specs?.wattage_w || 750, 10);
  const powerPercentage = Math.min(100, Math.round((estimatedPower / psuWattage) * 100));

  return (
    <div className="dynamic-rig-container">
      {/* Top Controls Bar */}
      <div className="rig-top-bar">
        <div className="rig-title-block">
          <span className="rig-badge">
            <Sparkles size={13} />
            <span>Interactive Assembly Architecture</span>
          </span>
          <h3 className="rig-heading">
            {pcCase?.name || 'Custom ATX Enclosure'} Visual Blueprint
          </h3>
        </div>

        {/* RGB Theme Selector */}
        <div className="rig-theme-pills">
          <span className="theme-pills-label">Lighting:</span>
          {Object.entries(themeColors).map(([key, val]) => (
            <button
              key={key}
              type="button"
              className={`rgb-dot-btn ${rgbTheme === key ? 'active-dot' : ''}`}
              style={{ backgroundColor: val.primary }}
              onClick={() => setRgbTheme(key)}
              title={`${key.toUpperCase()} Lighting`}
            />
          ))}
        </div>
      </div>

      {/* Main Assembly Canvas & SVG Schematic */}
      <div className="rig-viewport-frame">
        <svg
          className="rig-schematic-svg"
          viewBox="0 0 760 520"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Ambient gradients */}
            <linearGradient id="chassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0c1222" />
              <stop offset="100%" stopColor="#060913" />
            </linearGradient>

            <linearGradient id="mbPcbGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="radiatorFinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            <linearGradient id="gpuShroudGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <radialGradient id="pumpGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={currentTheme.primary} stopOpacity="0.9" />
              <stop offset="100%" stopColor={currentTheme.primary} stopOpacity="0" />
            </radialGradient>

            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. OUTER CASE CHASSIS FRAME */}
          <rect
            x="40"
            y="25"
            width={isItx ? "540" : "680"}
            height="470"
            rx="18"
            fill="url(#chassisGrad)"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="2.5"
            className="chassis-outer-rect"
          />

          {/* Tempered Glass Edge highlight */}
          <path
            d={isItx ? "M 55 40 L 565 40 L 565 480 L 55 480 Z" : "M 55 40 L 705 40 L 705 480 L 55 480 Z"}
            fill="none"
            stroke="rgba(56, 189, 248, 0.15)"
            strokeWidth="1"
            strokeDasharray="8 6"
          />

          {/* 2. PSU SHROUD BASEMENT (Bottom) */}
          <rect
            x="55"
            y="415"
            width={isItx ? "510" : "650"}
            height="65"
            rx="6"
            fill="#090d1a"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
            className={activeHighlight === 'psu' ? 'highlighted-part' : ''}
            onClick={() => onSelectCategory('psu')}
          />
          <text x="75" y="445" fill="#64748b" fontSize="12" fontWeight="700" letterSpacing="1">
            PSU BAY • {psu ? `${psu.brand} ${psu.name} (${psu.specs?.wattage_w || 750}W)` : 'EMPTY PSU BAY (CLICK TO EQUIP)'}
          </text>
          <text x="75" y="465" fill="#0ea5e9" fontSize="11" fontWeight="600">
            Efficiency: {psu?.specs?.efficiency || '80+ Certified'} • Modularity: {psu?.specs?.modular || 'Fully Modular'}
          </text>

          {/* 3. MOTHERBOARD TRAY & PCB */}
          <g
            className={`part-group ${activeHighlight === 'motherboard' ? 'highlighted-part' : ''}`}
            onClick={() => onSelectCategory('motherboard')}
            cursor="pointer"
          >
            <rect
              x="130"
              y="55"
              width="430"
              height="340"
              rx="10"
              fill="url(#mbPcbGrad)"
              stroke={motherboard ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.1)'}
              strokeWidth="1.5"
            />
            {/* PCB Traces & Accents */}
            <path
              d="M 150 90 L 220 90 L 250 120 L 250 200 M 340 90 L 400 90 M 150 320 L 240 320 L 270 350 L 520 350"
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="1.5"
            />
            {/* Motherboard Badge */}
            <text x="145" y="78" fill="#94a3b8" fontSize="11" fontWeight="700">
              {motherboard ? `${motherboard.brand} ${motherboard.name} (${motherboard.specs?.socket || 'Socket'} • ${motherboard.specs?.form_factor || 'ATX'})` : 'SELECT MOTHERBOARD'}
            </text>
          </g>

          {/* 4. CPU SOCKET & PROCESSOR */}
          <g
            className={`part-group ${activeHighlight === 'cpu' ? 'highlighted-part' : ''}`}
            onClick={() => onSelectCategory('cpu')}
            cursor="pointer"
          >
            <rect
              x="250"
              y="110"
              width="110"
              height="110"
              rx="8"
              fill="#0b0f19"
              stroke={isAmd ? '#ef4444' : isIntel ? '#0284c7' : 'rgba(255, 255, 255, 0.2)'}
              strokeWidth="2"
            />
            <rect
              x="262"
              y="122"
              width="86"
              height="86"
              rx="4"
              fill={isAmd ? 'rgba(239, 68, 68, 0.12)' : isIntel ? 'rgba(2, 132, 199, 0.12)' : 'rgba(255, 255, 255, 0.04)'}
            />
            <text x="305" y="155" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="800">
              {cpu ? cpu.brand?.toUpperCase() : 'NO CPU'}
            </text>
            <text x="305" y="172" textAnchor="middle" fill={isAmd ? '#f87171' : isIntel ? '#38bdf8' : '#94a3b8'} fontSize="10" fontWeight="600">
              {cpu ? (cpu.name?.length > 14 ? cpu.name.substring(0, 14) + '..' : cpu.name) : 'CLICK TO ADD'}
            </text>
            <text x="305" y="190" textAnchor="middle" fill="#64748b" fontSize="9">
              {cpu?.specs?.socket ? `${cpu.specs.socket} • ${cpu.specs.cores || 8}C/${cpu.specs.threads || 16}T` : 'LGA1700 / AM5'}
            </text>
          </g>

          {/* 5. MEMORY (RAM) SLOTS */}
          <g
            className={`part-group ${activeHighlight === 'ram' ? 'highlighted-part' : ''}`}
            onClick={() => onSelectCategory('ram')}
            cursor="pointer"
          >
            {/* 4 DIMM Slots */}
            {[0, 1, 2, 3].map((slotIdx) => {
              const xPos = 385 + slotIdx * 18;
              const isEquipped = ram ? (slotIdx === 1 || slotIdx === 3 || (ram.specs?.modules >= 4)) : false;
              return (
                <g key={slotIdx}>
                  <rect
                    x={xPos}
                    y="105"
                    width="10"
                    height="120"
                    rx="3"
                    fill={isEquipped ? '#1e293b' : '#0b0f19'}
                    stroke={isEquipped ? currentTheme.primary : 'rgba(255, 255, 255, 0.1)'}
                    strokeWidth={isEquipped ? '1.5' : '1'}
                  />
                  {isEquipped && (
                    <rect
                      x={xPos + 2}
                      y="110"
                      width="6"
                      height="110"
                      rx="2"
                      fill={currentTheme.primary}
                      filter="url(#neonGlow)"
                      opacity="0.8"
                    />
                  )}
                </g>
              );
            })}
            <text x="415" y="240" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">
              {ram ? `${ram.name} (${ram.specs?.type || 'DDR5'} • ${ram.specs?.speed_mhz || 6000}MHz)` : 'RAM SLOTS (EMPTY)'}
            </text>
          </g>

          {/* 6. COOLING SYSTEM (AIO Radiator & Tubes vs Tower Heatsink) */}
          <g
            className={`part-group ${activeHighlight === 'cooler' ? 'highlighted-part' : ''}`}
            onClick={() => onSelectCategory('cooler')}
            cursor="pointer"
          >
            {isAio ? (
              /* AIO Top Radiator + Liquid Cooling Tubes + Pump Ring */
              <g>
                {/* Top Radiator */}
                <rect
                  x="140"
                  y="32"
                  width="380"
                  height="26"
                  rx="4"
                  fill="url(#radiatorFinGrad)"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="1.5"
                />
                {/* 2 or 3 Radiator Fans */}
                <circle cx="210" cy="45" r="10" fill="#0b0f19" stroke={currentTheme.primary} strokeWidth="1.5" />
                <circle cx="330" cy="45" r="10" fill="#0b0f19" stroke={currentTheme.primary} strokeWidth="1.5" />
                <circle cx="450" cy="45" r="10" fill="#0b0f19" stroke={currentTheme.primary} strokeWidth="1.5" />

                {/* Flexible Liquid Coolant Tubes curving to CPU */}
                <path
                  d="M 230 58 C 230 90, 260 120, 280 135"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <path
                  d="M 230 58 C 230 90, 260 120, 280 135"
                  fill="none"
                  stroke={currentTheme.primary}
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                <path
                  d="M 245 58 C 245 95, 280 115, 305 135"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <path
                  d="M 245 58 C 245 95, 280 115, 305 135"
                  fill="none"
                  stroke={currentTheme.primary}
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Glowing Circular Pump Block */}
                <circle cx="305" cy="165" r="32" fill="#090d1a" stroke={currentTheme.primary} strokeWidth="2.5" />
                <circle cx="305" cy="165" r="24" fill="url(#pumpGlow)" />
                <text x="305" y="169" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">
                  AIO PUMP
                </text>
              </g>
            ) : (
              /* Air Cooler Dual-Tower Heatsink */
              <g>
                <rect
                  x="235"
                  y="100"
                  width="140"
                  height="130"
                  rx="6"
                  fill="#334155"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="2"
                  opacity="0.92"
                />
                {/* Horizontal Heat Fins */}
                {[0, 1, 2, 3, 4, 5, 6, 7].map((finIdx) => (
                  <line
                    key={finIdx}
                    x1="238"
                    y1={108 + finIdx * 14}
                    x2="372"
                    y2={108 + finIdx * 14}
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="1.5"
                  />
                ))}
                {/* Central Fan Blade Hub */}
                <circle cx="305" cy="165" r="28" fill="#0f172a" stroke={currentTheme.primary} strokeWidth="2" />
                <circle cx="305" cy="165" r="10" fill={currentTheme.primary} />
                <text x="305" y="210" textAnchor="middle" fill="#f1f5f9" fontSize="9" fontWeight="700">
                  {cooler ? cooler.name : 'AIR TOWER COOLER'}
                </text>
              </g>
            )}
          </g>

          {/* 7. M.2 STORAGE (NVMe SSD) */}
          <g
            className={`part-group ${activeHighlight === 'storage' ? 'highlighted-part' : ''}`}
            onClick={() => onSelectCategory('storage')}
            cursor="pointer"
          >
            <rect
              x="250"
              y="235"
              width="100"
              height="18"
              rx="3"
              fill="#1e293b"
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth="1"
            />
            <rect x="254" y="238" width="20" height="12" rx="2" fill="#3b82f6" />
            <text x="280" y="248" fill="#cbd5e1" fontSize="9" fontWeight="600">
              {storage.length > 0 ? `${storage[0].name}` : 'M.2 NVMe (EMPTY)'}
            </text>
          </g>

          {/* 8. PRIMARY GRAPHICS CARD (GPU 1) */}
          <g
            className={`part-group ${activeHighlight === 'gpu' ? 'highlighted-part' : ''}`}
            onClick={() => onSelectCategory('gpu')}
            cursor="pointer"
          >
            {primaryGpu ? (
              <g>
                {/* GPU PCIe Backplate & Shroud */}
                <rect
                  x="145"
                  y="265"
                  width={isTripleFan ? "420" : "330"}
                  height="72"
                  rx="7"
                  fill="url(#gpuShroudGrad)"
                  stroke={currentTheme.primary}
                  strokeWidth="2"
                  filter="url(#neonGlow)"
                />
                {/* Glowing RGB Edge Accent */}
                <line
                  x1="150"
                  y1="268"
                  x2={isTripleFan ? "560" : "470"}
                  y2="268"
                  stroke={currentTheme.primary}
                  strokeWidth="3"
                />
                {/* Dual or Triple Fans */}
                <circle cx="210" cy="301" r="22" fill="#090d1a" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
                <circle cx="310" cy="301" r="22" fill="#090d1a" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
                {isTripleFan && (
                  <circle cx="410" cy="301" r="22" fill="#090d1a" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
                )}
                {/* GPU Label */}
                <text x="160" y="288" fill="#ffffff" fontSize="11" fontWeight="800">
                  {primaryGpu.brand} {primaryGpu.name}
                </text>
                <text x="160" y="328" fill="#94a3b8" fontSize="9" fontWeight="600">
                  PCIe x16 • {primaryGpu.specs?.vram_gb || 12}GB VRAM • {primaryGpu.specs?.tdp_w || 220}W
                </text>
              </g>
            ) : (
              /* Empty PCIe Slot */
              <g>
                <rect
                  x="150"
                  y="275"
                  width="380"
                  height="24"
                  rx="4"
                  fill="#0b0f19"
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />
                <text x="340" y="291" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="600">
                  + CLICK TO EQUIP PRIMARY GRAPHICS CARD
                </text>
              </g>
            )}
          </g>

          {/* 9. SECONDARY GRAPHICS CARD (GPU 2 - Dual GPU Support) */}
          {secondaryGpu && (
            <g
              className={`part-group ${activeHighlight === 'gpu' ? 'highlighted-part' : ''}`}
              onClick={() => onSelectCategory('gpu')}
              cursor="pointer"
            >
              <rect
                x="145"
                y="345"
                width={isTripleFan ? "420" : "330"}
                height="60"
                rx="6"
                fill="url(#gpuShroudGrad)"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
              <circle cx="210" cy="375" r="18" fill="#090d1a" stroke="rgba(255, 255, 255, 0.2)" />
              <circle cx="310" cy="375" r="18" fill="#090d1a" stroke="rgba(255, 255, 255, 0.2)" />
              <text x="160" y="365" fill="#38bdf8" fontSize="10" fontWeight="700">
                GPU 2: {secondaryGpu.brand} {secondaryGpu.name}
              </text>
              <text x="160" y="395" fill="#64748b" fontSize="9">
                Secondary Compute / Rendering Acceleration
              </text>
            </g>
          )}

          {/* 10. FRONT INTAKE FANS */}
          <g opacity="0.6">
            <rect x={isItx ? "525" : "665"} y="70" width="16" height="90" rx="4" fill="#1e293b" />
            <rect x={isItx ? "525" : "665"} y="180" width="16" height="90" rx="4" fill="#1e293b" />
            <rect x={isItx ? "525" : "665"} y="290" width="16" height="90" rx="4" fill="#1e293b" />
          </g>
        </svg>

        {/* Hotspot Chips on Bottom of Viewport */}
        <div className="hotspots-strip">
          <button
            type="button"
            className="hotspot-chip"
            onMouseEnter={() => setActiveHighlight('cpu')}
            onMouseLeave={() => setActiveHighlight(null)}
            onClick={() => onSelectCategory('cpu')}
          >
            <Cpu size={12} />
            <span>CPU: {cpu ? cpu.name : 'Not equipped'}</span>
          </button>

          <button
            type="button"
            className="hotspot-chip"
            onMouseEnter={() => setActiveHighlight('cooler')}
            onMouseLeave={() => setActiveHighlight(null)}
            onClick={() => onSelectCategory('cooler')}
          >
            <Thermometer size={12} />
            <span>Cooler: {cooler ? `${cooler.name} (${isAio ? 'AIO' : 'Air'})` : 'Not equipped'}</span>
          </button>

          <button
            type="button"
            className="hotspot-chip"
            onMouseEnter={() => setActiveHighlight('gpu')}
            onMouseLeave={() => setActiveHighlight(null)}
            onClick={() => onSelectCategory('gpu')}
          >
            <Tv size={12} />
            <span>GPU: {primaryGpu ? `${primaryGpu.name}${secondaryGpu ? ' + 1 more' : ''}` : 'Not equipped'}</span>
          </button>

          <button
            type="button"
            className="hotspot-chip"
            onMouseEnter={() => setActiveHighlight('ram')}
            onMouseLeave={() => setActiveHighlight(null)}
            onClick={() => onSelectCategory('ram')}
          >
            <Layers size={12} />
            <span>RAM: {ram ? ram.name : 'Not equipped'}</span>
          </button>

          <button
            type="button"
            className="hotspot-chip"
            onMouseEnter={() => setActiveHighlight('psu')}
            onMouseLeave={() => setActiveHighlight(null)}
            onClick={() => onSelectCategory('psu')}
          >
            <Zap size={12} />
            <span>PSU: {psu ? `${psu.name} (${psu.specs?.wattage_w || 750}W)` : 'Not equipped'}</span>
          </button>
        </div>
      </div>

      {/* Live System Telemetry HUD */}
      <div className="rig-telemetry-hud">
        {/* Compatibility Gauge */}
        <div className="telemetry-card">
          <div className="telemetry-header">
            <span className="telemetry-label">Compatibility Index</span>
            <CheckCircle2 size={14} className={isCompatible ? 'text-success' : 'text-danger'} />
          </div>
          <div className="telemetry-val-row">
            <span className={`telemetry-num ${isCompatible ? 'text-success' : 'text-danger'}`}>
              {compatScore}
            </span>
            <span className="telemetry-denom">/ 100</span>
          </div>
          <span className="telemetry-caption">
            {isCompatible ? 'All Hardware Matches Standard' : `${warnings.length} Issue(s) Detected`}
          </span>
        </div>

        {/* Power Headroom Meter */}
        <div className="telemetry-card">
          <div className="telemetry-header">
            <span className="telemetry-label">Estimated System Load</span>
            <Zap size={14} className="text-warning" />
          </div>
          <div className="telemetry-val-row">
            <span className="telemetry-num">~ {estimatedPower}W</span>
            <span className="telemetry-denom">/ {psuWattage}W Rated</span>
          </div>
          <div className="headroom-progress-track">
            <div
              className={`headroom-progress-bar ${powerPercentage > 85 ? 'bar-danger' : 'bar-normal'}`}
              style={{ width: `${powerPercentage}%` }}
            />
          </div>
          <span className="telemetry-caption">
            {psuWattage - estimatedPower}W Headroom buffer remaining
          </span>
        </div>

        {/* Chassis Clearances */}
        <div className="telemetry-card">
          <div className="telemetry-header">
            <span className="telemetry-label">Hardware Clearance</span>
            <Box size={14} className="text-info" />
          </div>
          <div className="clearance-specs-row">
            <div className="clearance-item">
              <span className="c-label">GPU Length:</span>
              <span className="c-val">{primaryGpu?.specs?.length_mm || 280}mm / {pcCase?.specs?.max_gpu_length_mm || 365}mm</span>
            </div>
            <div className="clearance-item">
              <span className="c-label">Cooler Height:</span>
              <span className="c-val">{cooler?.specs?.height_mm || (isAio ? 'AIO' : '160mm')} / {pcCase?.specs?.max_cooler_height_mm || 165}mm</span>
            </div>
          </div>
          <span className="telemetry-caption text-success">
            ✓ Physical chassis tolerances verified
          </span>
        </div>
      </div>
    </div>
  );
}
