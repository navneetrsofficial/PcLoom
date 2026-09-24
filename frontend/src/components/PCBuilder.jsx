import React, { useState } from 'react';
import {
  Cpu, Fan, CircuitBoard, Boxes, HardDrive, Tv, Box, Zap,
  CheckCircle2, AlertTriangle, XCircle, Plus, Trash2, RefreshCw,
  Share2, ShieldCheck, ArrowRight, Info
} from 'lucide-react';
import './PCBuilder.css';

export default function PCBuilder({
  build,
  onOpenSelector,
  onRemovePart,
  onClearBuild,
  compatibilityData
}) {
  const [copiedShare, setCopiedShare] = useState(false);

  const slots = [
    { key: 'cpu', label: 'Processor (CPU)', icon: Cpu, hint: 'Select AM4, AM5, or LGA1700' },
    { key: 'cooler', label: 'CPU Cooler', icon: Fan, hint: 'Air or 240/360mm AIO' },
    { key: 'motherboard', label: 'Motherboard', icon: CircuitBoard, hint: 'Must match CPU socket & RAM generation' },
    { key: 'ram', label: 'Memory (RAM)', icon: Boxes, hint: 'DDR4 or DDR5 dual-channel kit' },
    { key: 'storage', label: 'Storage (SSD)', icon: HardDrive, hint: 'M.2 NVMe PCIe Gen 4.0' },
    { key: 'gpu', label: 'Graphics Card (GPU)', icon: Tv, hint: 'Check case length clearance' },
    { key: 'case', label: 'Case Chassis', icon: Box, hint: 'Supports ATX/mATX, cooler & GPU limits' },
    { key: 'psu', label: 'Power Supply (PSU)', icon: Zap, hint: 'Recommended +25% safety headroom' }
  ];

  const { isCompatible, hasWarnings, issues, warnings, passed, power } = compatibilityData;

  const totalPrice = Object.values(build).reduce((sum, item) => sum + (item ? item.price : 0), 0);
  const partsCount = Object.values(build).filter(Boolean).length;

  const handleShareBuild = () => {
    const lines = ['--- PcLoom PC Build Specification ---'];
    slots.forEach(({ key, label }) => {
      const part = build[key];
      if (part) {
        lines.push(`${label}: ${part.brand} ${part.name} - $${part.price}`);
      }
    });
    lines.push(`Total Build Cost: $${totalPrice}`);
    lines.push(`Estimated Peak Draw: ${power.estimatedDraw}W (Recommended PSU: ${power.recommendedPsu}W)`);
    lines.push(`Compatibility Status: ${isCompatible ? '100% Compatible' : 'Incompatible'}`);
    lines.push('Built on PcLoom (https://github.com/navneetrsofficial)');

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <section className="builder-section" id="builder">
      <div className="builder-container">
        {/* Section Header */}
        <div className="builder-header">
          <div className="builder-eyebrow">
            <span className="eyebrow-badge">Interactive Configurator</span>
            <span className="eyebrow-rule">10+ Rule Engine Active</span>
          </div>
          <h2 className="builder-title">
            Architect Your <span className="highlight-gradient">Custom PC</span>
          </h2>
          <p className="builder-desc">
            Select high-performance components with real-time hardware validation. Our multi-dimensional engine checks socket compatibility, memory standards, physical clearance, and power headroom.
          </p>
        </div>

        {/* Top Control Bar: Total Price, Power Gauge, Quick Actions */}
        <div className="builder-stats-bar">
          <div className="stats-card cost-card">
            <span className="stats-label">Total Estimated Cost</span>
            <div className="stats-val-row">
              <span className="stats-value">${totalPrice.toLocaleString()}</span>
              <span className="stats-subtext">({partsCount} of 8 components)</span>
            </div>
          </div>

          {/* Power Meter Card */}
          <div className="stats-card power-card">
            <div className="power-card-header">
              <span className="stats-label">Power & Headroom Gauge</span>
              <span className={`power-status-tag ${power.selectedPsuWattage && power.selectedPsuWattage < power.estimatedDraw ? 'tag-danger' : 'tag-safe'}`}>
                {power.selectedPsuWattage > 0
                  ? `${power.headroomPercent}% Headroom`
                  : 'Requires PSU'}
              </span>
            </div>

            <div className="power-progress-track">
              <div
                className={`power-progress-fill ${power.selectedPsuWattage && power.selectedPsuWattage < power.estimatedDraw ? 'fill-danger' : 'fill-gradient'}`}
                style={{
                  width: `${Math.min(100, power.selectedPsuWattage > 0 ? (power.estimatedDraw / power.selectedPsuWattage) * 100 : (power.estimatedDraw / 1000) * 100)}%`
                }}
              />
            </div>

            <div className="power-meta-row">
              <span>Draw: <strong>{power.estimatedDraw}W</strong></span>
              <span>Rec. PSU: <strong>{power.recommendedPsu}W</strong></span>
              <span>Selected: <strong>{power.selectedPsuWattage > 0 ? `${power.selectedPsuWattage}W` : 'None'}</strong></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="stats-actions">
            <button
              className="action-btn secondary-btn"
              onClick={handleShareBuild}
              title="Copy build specification to clipboard"
            >
              <Share2 size={16} />
              <span>{copiedShare ? 'Copied to Clipboard!' : 'Share Build'}</span>
            </button>
            <button
              className="action-btn danger-outline-btn"
              onClick={onClearBuild}
              disabled={partsCount === 0}
              title="Reset all slots"
            >
              <Trash2 size={16} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Compatibility Engine Alert Panel */}
        <div className={`compat-status-banner ${partsCount === 0 ? 'banner-idle' : isCompatible ? (hasWarnings ? 'banner-warning' : 'banner-valid') : 'banner-invalid'}`}>
          <div className="banner-icon-area">
            {partsCount === 0 ? (
              <Info size={24} className="icon-blue" />
            ) : isCompatible ? (
              hasWarnings ? <AlertTriangle size={24} className="icon-amber" /> : <CheckCircle2 size={24} className="icon-emerald" />
            ) : (
              <XCircle size={24} className="icon-red" />
            )}
          </div>

          <div className="banner-text-area">
            <div className="banner-title">
              {partsCount === 0 && 'Configurator Ready: Select components below to evaluate physical and thermal compatibility.'}
              {partsCount > 0 && isCompatible && !hasWarnings && 'All Components 100% Compatible — Zero Physical or Thermal Conflicts Detected.'}
              {partsCount > 0 && isCompatible && hasWarnings && 'Compatible with Advisory Warnings (Check thermal/wattage notes below).'}
              {partsCount > 0 && !isCompatible && `Compatibility Conflict Detected (${issues.length} Critical Issue${issues.length > 1 ? 's' : ''})`}
            </div>

            {/* Critical Issues List */}
            {issues.length > 0 && (
              <ul className="compat-issue-list">
                {issues.map((issue, idx) => (
                  <li key={idx} className="issue-item">
                    <strong>{issue.title}:</strong> {issue.message}
                  </li>
                ))}
              </ul>
            )}

            {/* Warnings List */}
            {warnings.length > 0 && (
              <ul className="compat-warning-list">
                {warnings.map((warn, idx) => (
                  <li key={idx} className="warning-item">
                    <strong>{warn.title}:</strong> {warn.message}
                  </li>
                ))}
              </ul>
            )}

            {/* Passed checks badges */}
            {passed.length > 0 && (
              <div className="compat-passed-chips">
                {passed.map((p, idx) => (
                  <span key={idx} className="passed-chip">
                    <CheckCircle2 size={12} /> {p}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Grid: Component Slots (Left) & 2D Imagine Case Diagram (Right) */}
        <div className="builder-main-layout">
          {/* Component Slots Column */}
          <div className="slots-column">
            {slots.map(({ key, label, icon: Icon, hint }) => {
              const part = build[key];
              return (
                <div key={key} className={`component-slot-card ${part ? 'slot-filled' : 'slot-empty'}`}>
                  <div className="slot-icon-box">
                    <Icon size={22} className="slot-svg-icon" />
                  </div>

                  <div className="slot-details">
                    <div className="slot-type-label">{label}</div>
                    {part ? (
                      <div className="slot-product-info">
                        <div className="product-brand-name">
                          <span className="brand-tag">{part.brand}</span>
                          <span className="product-title">{part.name}</span>
                        </div>
                        <div className="product-specs-summary">
                          {key === 'cpu' && `${part.specs.socket} • ${part.specs.cores}C/${part.specs.threads}T • ${part.specs.tdp_w}W TDP`}
                          {key === 'cooler' && `${part.specs.type} • ${part.specs.height_mm}mm Height • ${part.specs.tdp_rating_w ? `${part.specs.tdp_rating_w}W TDP` : 'NSPR Rating'}`}
                          {key === 'motherboard' && `${part.specs.socket} • ${part.specs.chipset} • ${part.specs.memory_type} • ${part.specs.form_factor}`}
                          {key === 'ram' && `${part.specs.type} • ${part.specs.speed_mhz}MHz • ${part.specs.capacity_gb}GB (${part.specs.modules}x)`}
                          {key === 'storage' && `${part.specs.capacity_gb}GB • ${part.specs.form_factor} • ${part.specs.interface}`}
                          {key === 'gpu' && `${part.specs.chipset} • ${part.specs.vram_gb}GB • ${part.specs.length_mm}mm • ${part.specs.tdp_w}W`}
                          {key === 'case' && `${part.specs.supported_form_factors} • Max GPU: ${part.specs.max_gpu_length_mm}mm`}
                          {key === 'psu' && `${part.specs.wattage_w}W • ${part.specs.efficiency} • ${part.specs.modular}`}
                        </div>
                      </div>
                    ) : (
                      <div className="slot-placeholder-hint">{hint}</div>
                    )}
                  </div>

                  {part && (
                    <div className="slot-price-tag">
                      ${part.price}
                    </div>
                  )}

                  <div className="slot-actions">
                    {part ? (
                      <>
                        <button
                          className="slot-btn btn-change"
                          onClick={() => onOpenSelector(key)}
                          title="Change component"
                        >
                          <RefreshCw size={14} />
                          <span>Change</span>
                        </button>
                        <button
                          className="slot-btn btn-remove"
                          onClick={() => onRemovePart(key)}
                          title="Remove from build"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <button
                        className="slot-btn btn-select-part"
                        onClick={() => onOpenSelector(key)}
                      >
                        <Plus size={16} />
                        <span>Select Part</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2D Imagine Interactive Chassis View (Right Column) */}
          <div className="imagine-diagram-column">
            <div className="imagine-card">
              <div className="imagine-header">
                <div className="imagine-title-group">
                  <span className="imagine-badge">2D Schematic</span>
                  <h3 className="imagine-title">Chassis Visualization</h3>
                </div>
                <div className="imagine-status-tag">
                  {build.case ? build.case.name : 'Standard Mid-Tower ATX'}
                </div>
              </div>

              {/* SVG Case Diagram */}
              <div className="case-svg-container">
                <svg viewBox="0 0 400 480" className="case-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Case Outer Frame */}
                  <rect x="20" y="20" width="360" height="440" rx="16" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="#0b0f19" />
                  {/* Glass Side Tint */}
                  <rect x="30" y="30" width="340" height="420" rx="12" fill="rgba(30, 41, 59, 0.4)" stroke="rgba(255,255,255,0.06)" />

                  {/* Motherboard Tray */}
                  <rect
                    x="50" y="50" width="240" height="300" rx="8"
                    fill={build.motherboard ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255,255,255,0.02)'}
                    stroke={build.motherboard ? '#38bdf8' : 'rgba(255,255,255,0.1)'}
                    strokeWidth="1.5"
                    strokeDasharray={build.motherboard ? 'none' : '4 4'}
                  />
                  <text x="65" y="75" fill={build.motherboard ? '#38bdf8' : '#64748b'} fontSize="11" fontWeight="700">
                    {build.motherboard ? `MOTHERBOARD: ${build.motherboard.specs.form_factor}` : 'MOTHERBOARD TRAY (EMPTY)'}
                  </text>

                  {/* CPU Socket Area */}
                  <rect
                    x="90" y="95" width="80" height="80" rx="6"
                    fill={build.cpu ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255,255,255,0.03)'}
                    stroke={build.cpu ? '#a855f7' : 'rgba(255,255,255,0.15)'}
                    strokeWidth="1.5"
                  />
                  <text x="130" y="140" textAnchor="middle" fill={build.cpu ? '#e9d5ff' : '#64748b'} fontSize="10" fontWeight="600">
                    {build.cpu ? build.cpu.specs.socket : 'CPU SLOT'}
                  </text>

                  {/* CPU Cooler / AIO Pump Block */}
                  {build.cooler && (
                    <circle
                      cx="130" cy="135" r="32"
                      fill="rgba(236, 72, 153, 0.2)"
                      stroke="#ec4899"
                      strokeWidth="2"
                    />
                  )}

                  {/* Top Radiator / Exhaust Fans */}
                  <rect
                    x="50" y="32" width="240" height="14" rx="3"
                    fill={build.cooler ? 'rgba(236, 72, 153, 0.35)' : 'rgba(255,255,255,0.06)'}
                    stroke={build.cooler ? '#ec4899' : 'rgba(255,255,255,0.1)'}
                  />

                  {/* RAM Slots */}
                  <g transform="translate(185, 95)">
                    {[0, 10, 20, 30].map((offset, i) => (
                      <rect
                        key={i}
                        x={offset} y="0" width="6" height="75" rx="2"
                        fill={build.ram ? '#22c55e' : 'rgba(255,255,255,0.05)'}
                        stroke={build.ram ? '#4ade80' : 'rgba(255,255,255,0.1)'}
                      />
                    ))}
                    <text x="18" y="90" textAnchor="middle" fill={build.ram ? '#86efac' : '#64748b'} fontSize="9">
                      {build.ram ? build.ram.specs.type : 'RAM'}
                    </text>
                  </g>

                  {/* GPU PCIe Card */}
                  <rect
                    x="50" y="210" width="230" height="55" rx="6"
                    fill={build.gpu ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.03)'}
                    stroke={build.gpu ? '#3b82f6' : 'rgba(255,255,255,0.15)'}
                    strokeWidth="1.5"
                    strokeDasharray={build.gpu ? 'none' : '4 4'}
                  />
                  <text x="165" y="242" textAnchor="middle" fill={build.gpu ? '#93c5fd' : '#64748b'} fontSize="11" fontWeight="700">
                    {build.gpu ? `${build.gpu.brand} ${build.gpu.specs.chipset}` : 'PCIe x16 GPU SLOT (EMPTY)'}
                  </text>

                  {/* Storage M.2 Slot */}
                  <rect
                    x="90" y="185" width="70" height="16" rx="3"
                    fill={build.storage ? 'rgba(20, 184, 166, 0.3)' : 'rgba(255,255,255,0.04)'}
                    stroke={build.storage ? '#14b8a6' : 'rgba(255,255,255,0.1)'}
                  />
                  <text x="125" y="197" textAnchor="middle" fill={build.storage ? '#5eead4' : '#64748b'} fontSize="8" fontWeight="600">
                    {build.storage ? 'NVMe M.2' : 'M.2'}
                  </text>

                  {/* Front Intake Fans */}
                  <g transform="translate(305, 60)">
                    {[0, 100, 200].map((offset, i) => (
                      <circle
                        key={i}
                        cx="30" cy={35 + offset} r="28"
                        fill="rgba(168, 85, 247, 0.08)"
                        stroke="rgba(168, 85, 247, 0.4)"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                      />
                    ))}
                  </g>

                  {/* Rear Exhaust Fan */}
                  <circle
                    cx="32" cy="115" r="18"
                    fill="rgba(56, 189, 248, 0.08)"
                    stroke="rgba(56, 189, 248, 0.3)"
                  />

                  {/* Bottom PSU Shroud Compartment */}
                  <rect
                    x="30" y="370" width="340" height="75" rx="8"
                    fill={build.psu ? 'rgba(245, 158, 11, 0.15)' : 'rgba(15, 23, 42, 0.8)'}
                    stroke={build.psu ? '#f59e0b' : 'rgba(255,255,255,0.1)'}
                    strokeWidth="1.5"
                  />
                  <text x="120" y="415" fill={build.psu ? '#fcd34d' : '#64748b'} fontSize="11" fontWeight="700">
                    {build.psu ? `PSU: ${build.psu.specs.wattage_w}W ${build.psu.specs.efficiency}` : 'PSU CHAMBER (EMPTY)'}
                  </text>
                </svg>
              </div>

              {/* Component Quick Legend */}
              <div className="imagine-legend">
                <div className="legend-chip">
                  <span className="legend-dot dot-cyan" />
                  <span>Motherboard</span>
                </div>
                <div className="legend-chip">
                  <span className="legend-dot dot-purple" />
                  <span>CPU / Cooler</span>
                </div>
                <div className="legend-chip">
                  <span className="legend-dot dot-blue" />
                  <span>GPU</span>
                </div>
                <div className="legend-chip">
                  <span className="legend-dot dot-amber" />
                  <span>PSU</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
