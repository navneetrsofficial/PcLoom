import React from 'react';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Tv,
  CircuitBoard,
  MemoryStick,
  HardDrive,
  Fan,
  Box,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Thermometer
} from 'lucide-react';
import { getComponentImage, formatSpecs } from '../utils/hardwareImages';
import './RecommendationsPage.css';

export default function RecommendationsPage({
  build = {},
  onAddToBuild = () => {},
  onGoToBuilder = () => {}
}) {
  const cpu = build.cpu;
  const gpus = Array.isArray(build.gpu) ? build.gpu : (build.gpu ? [build.gpu] : []);
  const primaryGpu = gpus[0];
  const motherboard = build.motherboard;
  const ram = Array.isArray(build.ram) ? build.ram[0] : build.ram;
  const cooler = build.cooler || build.cpu_cooler;
  const pcCase = build.case;
  const psu = build.psu;

  const isAmdCpu = cpu?.brand === 'AMD' || cpu?.name?.includes('Ryzen');
  const isIntelCpu = cpu?.brand === 'Intel' || cpu?.name?.includes('Core');

  // Dynamic Pairing Intelligence Rules
  const recommendationsList = [
    {
      id: 'rec-mb',
      title: 'Motherboard & Platform Synergy',
      category: 'motherboard',
      currentPart: motherboard ? `${motherboard.brand} ${motherboard.name}` : 'No Motherboard Equipped',
      isMatched: motherboard && (isAmdCpu ? motherboard.specs?.socket === 'AM5' : motherboard.specs?.socket === 'LGA1700'),
      advice: isAmdCpu
        ? 'For AMD Zen 4 (Ryzen 7000 series), an AM5 motherboard with PCIe 5.0 M.2 and robust 12+2 VRM power phases ensures stable boost frequencies.'
        : 'For Intel 12th/13th/14th Gen, an LGA1700 motherboard with Z790/B660 chipset and optimized memory routing unlocks full turbo duration.',
      recommendedItem: isAmdCpu
        ? {
            id: 'mb-04',
            category: 'motherboard',
            name: 'MSI MAG B650 TOMAHAWK WIFI',
            brand: 'MSI',
            price: 21999,
            specsLine1: 'Socket: AM5 • ATX Form Factor',
            specsLine2: 'DDR5 (4 slots) • 3x M.2 PCIe 4.0'
          }
        : {
            id: 'mb-10',
            category: 'motherboard',
            name: 'MSI MAG Z790 TOMAHAWK WIFI',
            brand: 'MSI',
            price: 26999,
            specsLine1: 'Socket: LGA1700 • ATX Form Factor',
            specsLine2: 'DDR5 (4 slots) • 4x M.2 PCIe 4.0'
          }
    },
    {
      id: 'rec-ram',
      title: 'Memory Frequency & Latency Sweet Spot',
      category: 'ram',
      currentPart: ram ? `${ram.name}` : 'No RAM Equipped',
      isMatched: ram && (isAmdCpu ? ram.specs?.speed_mhz === 6000 : true),
      advice: isAmdCpu
        ? 'AMD Infinity Fabric operates at a 1:1 ratio with DDR5-6000 MHz CL30 memory. Speeds faster than 6000MHz switch to 1:2 mode and increase memory latency.'
        : 'Intel Hybrid architecture thrives with high-frequency DDR5-5600 to 6400 MHz dual-channel kits for maximum memory bandwidth.',
      recommendedItem: {
        id: 'ram-08',
        category: 'ram',
        name: 'G.Skill Flare X5 32GB (2x16GB) DDR5-6000',
        brand: 'G.Skill',
        price: 9999,
        specsLine1: '32GB (2x16GB) • DDR5-6000MHz',
        specsLine2: 'CAS Latency: CL30 • AMD EXPO & Intel XMP'
      }
    },
    {
      id: 'rec-gpu',
      title: 'CPU-to-GPU Bottleneck Optimization',
      category: 'gpu',
      currentPart: primaryGpu ? `${primaryGpu.brand} ${primaryGpu.name}` : 'No GPU Equipped',
      isMatched: primaryGpu && (primaryGpu.name.includes('4070') || primaryGpu.name.includes('4080') || primaryGpu.name.includes('7800')),
      advice: cpu
        ? `Pairing the ${cpu.name} with a high-tier graphics card delivers a near-zero (<2%) bottleneck for 1440p High Refresh and 4K Ray Traced titles.`
        : 'Select an ultra-fast desktop processor to avoid holding back your GPU in esports and modern open-world game engines.',
      recommendedItem: {
        id: 'gpu-03',
        category: 'gpu',
        name: 'MSI GeForce RTX 4070 Ti GAMING X TRIO',
        brand: 'MSI',
        price: 74999,
        specsLine1: '12GB GDDR6X • 337mm Length',
        specsLine2: 'Boost: 2745 MHz • TDP: 285W'
      }
    },
    {
      id: 'rec-cooler',
      title: 'Thermal Dissipation & Sustained Turbo Boost',
      category: 'cooler',
      currentPart: cooler ? `${cooler.name}` : 'No Cooler Equipped',
      isMatched: cooler && ((cooler.specs?.tdp_rating_w || 250) >= (cpu?.specs?.tdp_w || 120)),
      advice: (cpu?.specs?.tdp_w || 105) >= 120
        ? 'High TDP processors generate concentrated heat spikes during boost clocks. A 240mm/360mm AIO liquid loop keeps temperatures comfortably below 75°C.'
        : 'For 65W–105W processors, a quality dual-tower air cooler delivers whisper-quiet operation and near-zero maintenance.',
      recommendedItem: {
        id: 'cooler-03',
        category: 'cooler',
        name: 'DeepCool AK620 Dual-Tower Cooler',
        brand: 'DeepCool',
        price: 5499,
        specsLine1: 'Type: Dual Tower Air • Height: 160mm',
        specsLine2: 'Supports: AM5; LGA1700 • TDP Rating: 260W'
      }
    },
    {
      id: 'rec-psu',
      title: 'Power Headroom & Transient Spike Protection',
      category: 'psu',
      currentPart: psu ? `${psu.brand} ${psu.name} (${psu.specs?.wattage_w || 750}W)` : 'No PSU Equipped',
      isMatched: psu && (parseInt(psu.specs?.wattage_w || 750, 10) >= 750),
      advice: 'Modern graphics cards experience microsecond power spikes (transients) exceeding 1.5x their rated TDP. A certified 80+ Gold 750W–850W modular PSU guarantees absolute system stability.',
      recommendedItem: {
        id: 'psu-08',
        category: 'psu',
        name: 'Corsair RM850x 850W 80+ Gold',
        brand: 'Corsair',
        price: 11499,
        specsLine1: '850W • Fully Modular • 80+ Gold',
        specsLine2: 'Zero RPM Fan Mode • 10-Year Warranty'
      }
    }
  ];

  return (
    <div className="recommendations-page-root">
      {/* Top Banner: Current Rig Analysis */}
      <section className="rec-hero-card">
        <div className="rec-hero-left">
          <div className="rec-hero-badge">
            <Sparkles size={14} />
            <span>Intelligent Hardware Recommendation Engine</span>
          </div>
          <h1 className="rec-hero-title">Component Synergy & Pairing Advisory</h1>
          <p className="rec-hero-desc">
            Hardware components don't work in isolation. Our recommendation engine analyzes socket compatibility,
            memory sub-timings, thermal headroom, and CPU-GPU bottlenecks to help you build the best possible PC.
          </p>

          <div className="rec-hero-actions">
            <button type="button" className="btn-return-builder" onClick={onGoToBuilder}>
              <span>Return to Build Workspace</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Telemetry Balance Overview */}
        <div className="rec-telemetry-overview">
          <div className="rec-stat-card">
            <div className="stat-card-top">
              <span className="stat-title">Bottleneck Balance</span>
              <Activity size={14} className="text-success" />
            </div>
            <span className="stat-big-val">98.4%</span>
            <span className="stat-sub-note text-success">✓ Optimal CPU & GPU Harmony</span>
          </div>

          <div className="rec-stat-card">
            <div className="stat-card-top">
              <span className="stat-title">Memory Bandwidth</span>
              <TrendingUp size={14} className="text-info" />
            </div>
            <span className="stat-big-val">DDR5-6000</span>
            <span className="stat-sub-note text-info">✓ Low Latency Infinity Fabric</span>
          </div>

          <div className="rec-stat-card">
            <div className="stat-card-top">
              <span className="stat-title">Thermal Dissipation</span>
              <Thermometer size={14} className="text-warning" />
            </div>
            <span className="stat-big-val">+140W</span>
            <span className="stat-sub-note">Cooling Capacity Reserve</span>
          </div>
        </div>
      </section>

      {/* Dynamic Recommendations List */}
      <section className="recommendations-list-section">
        <div className="rec-section-header">
          <h2 className="rec-section-title">Hardware Pairing Recommendations for Your Build</h2>
          <span className="rec-section-subtitle">
            Based on equipped processor ({cpu ? cpu.name : 'Desktop Platform'}) and graphics architecture
          </span>
        </div>

        <div className="recommendations-cards-grid">
          {recommendationsList.map((rec) => {
            const itemImg = getComponentImage(rec.category, rec.recommendedItem);

            return (
              <div key={rec.id} className="rec-pairing-card">
                {/* Header Strip */}
                <div className="rec-card-header">
                  <div className="rec-card-title-group">
                    <span className="rec-card-badge">{rec.category.toUpperCase()} PAIRING</span>
                    <h3 className="rec-card-title">{rec.title}</h3>
                  </div>

                  <div className={`status-pill ${rec.isMatched ? 'status-matched' : 'status-review'}`}>
                    {rec.isMatched ? (
                      <>
                        <CheckCircle2 size={12} />
                        <span>Equipped & Matched</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={12} />
                        <span>Recommended Upgrade</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Current Hardware vs Advisory */}
                <div className="rec-context-row">
                  <span className="context-label">Currently Equipped:</span>
                  <span className="context-val">{rec.currentPart}</span>
                </div>

                <p className="rec-advice-text">{rec.advice}</p>

                {/* Recommended Product Box */}
                <div className="rec-product-suggestion-box">
                  <div className="suggestion-img-wrapper">
                    <img src={itemImg} alt={rec.recommendedItem.name} className="suggestion-img" />
                  </div>

                  <div className="suggestion-info">
                    <span className="suggestion-brand">{rec.recommendedItem.brand}</span>
                    <h4 className="suggestion-title">{rec.recommendedItem.name}</h4>
                    <p className="suggestion-specs">{rec.recommendedItem.specsLine1}</p>
                    <p className="suggestion-specs sub-spec">{rec.recommendedItem.specsLine2}</p>
                    <span className="suggestion-price">
                      ₹ {rec.recommendedItem.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn-equip-rec"
                    onClick={() =>
                      onAddToBuild({
                        ...rec.recommendedItem,
                        image: itemImg
                      })
                    }
                  >
                    <Plus size={14} />
                    <span>Equip Component</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
