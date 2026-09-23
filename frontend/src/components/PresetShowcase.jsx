import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Layers } from 'lucide-react';
import { ALL_COMPONENTS } from '../data/componentsData';
import './PresetShowcase.css';

export default function PresetShowcase({ onLoadPreset }) {
  const getPart = (id) => ALL_COMPONENTS.find((p) => p.id === id);

  const presets = [
    {
      id: 'apex-ultra',
      title: 'Apex Ultra 4K',
      subtitle: 'Enthusiast Gaming & Ray-Tracing Beast',
      badge: 'Flagship Tier',
      gradient: 'from-purple-600 to-indigo-600',
      price: 3490,
      specsSummary: 'Ryzen 7 7800X3D • RTX 4080 Super • 32GB DDR5-6000 • 360mm AIO',
      partsMap: {
        cpu: 'cpu-03', // 7800X3D
        cooler: 'cooler-04', // Galahad II 360
        motherboard: 'mb-03', // ROG Strix B650E-E
        ram: 'ram-08', // 32GB DDR5-6000
        storage: 'storage-02', // 990 PRO 2TB
        gpu: 'gpu-02', // RTX 4080 Super
        case: 'case-04', // Lian Li O11 Dynamic EVO
        psu: 'psu-05' // RM850x 850W
      }
    },
    {
      id: 'studio-titan',
      title: 'Studio Titan Pro',
      subtitle: '3D Rendering, Unreal Engine & 8K Editing',
      badge: 'Creator Workstation',
      gradient: 'from-blue-600 to-cyan-600',
      price: 2890,
      specsSummary: 'Intel i7-14700K • RTX 4070 Ti Super • 64GB DDR5 • 2TB PCIe 4.0',
      partsMap: {
        cpu: 'cpu-08', // i7-14700K
        cooler: 'cooler-03', // Liquid Freezer III 360
        motherboard: 'mb-08', // Z790 Tomahawk
        ram: 'ram-10', // 64GB DDR5
        storage: 'storage-04', // SN850X 2TB
        gpu: 'gpu-03', // RTX 4070 Ti Super
        case: 'case-03', // Fractal Design North
        psu: 'psu-05' // 850W
      }
    },
    {
      id: 'vanguard-stealth',
      title: 'Vanguard Stealth',
      subtitle: 'High-FPS 1440p Esports & Clean Efficiency',
      badge: 'Sweetspot Value',
      gradient: 'from-emerald-600 to-teal-600',
      price: 1390,
      specsSummary: 'Ryzen 5 7600 • RTX 4060 • 32GB DDR5 • Peerless Assassin',
      partsMap: {
        cpu: 'cpu-04', // Ryzen 5 7600
        cooler: 'cooler-01', // Peerless Assassin 120 SE
        motherboard: 'mb-05', // B650M Pro RS
        ram: 'ram-06', // 32GB DDR5
        storage: 'storage-01', // 980 PRO 1TB
        gpu: 'gpu-05', // RTX 4060
        case: 'case-02', // NZXT H5 Flow
        psu: 'psu-03' // RM750e 750W
      }
    }
  ];

  const handleApply = (partsMap) => {
    const fullBuild = {};
    Object.entries(partsMap).forEach(([slot, partId]) => {
      const part = getPart(partId);
      if (part) fullBuild[slot] = part;
    });
    onLoadPreset(fullBuild);
    const builderEl = document.getElementById('builder');
    if (builderEl) {
      builderEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="presets-section" id="presets">
      <div className="presets-container">
        {/* Header */}
        <div className="presets-header">
          <div className="presets-eyebrow">
            <Sparkles size={14} />
            <span>Engineered Blueprints</span>
          </div>
          <h2 className="presets-title">
            Factory-Verified <span className="highlight-gradient">Pre-Builts</span>
          </h2>
          <p className="presets-desc">
            Load battle-tested component combinations with 100% verified mechanical fitment, zero thermal throttling, and optimal electrical headroom.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="presets-grid">
          {presets.map((preset) => (
            <div key={preset.id} className="preset-card">
              <div className="preset-top-banner">
                <span className="preset-badge">{preset.badge}</span>
                <span className="preset-price-val">${preset.price.toLocaleString()}</span>
              </div>

              <h3 className="preset-card-title">{preset.title}</h3>
              <p className="preset-card-subtitle">{preset.subtitle}</p>

              <div className="preset-specs-box">
                <p className="specs-headline">{preset.specsSummary}</p>
              </div>

              <div className="preset-guarantees-row">
                <div className="guarantee-item">
                  <ShieldCheck size={14} className="text-emerald" />
                  <span>100% Fit Guaranteed</span>
                </div>
                <div className="guarantee-item">
                  <Zap size={14} className="text-amber" />
                  <span>25%+ Power Headroom</span>
                </div>
              </div>

              <button
                className="preset-load-btn"
                onClick={() => handleApply(preset.partsMap)}
              >
                <span>Load into Configurator</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
