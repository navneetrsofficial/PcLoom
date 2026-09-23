import React from 'react';
import { ArrowRight, Zap, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { POPULAR_BUILDS } from '../data/dashboardData';
import './PopularBuilds.css';

const TIER_COLORS = {
  'build-budget': { accent: '#38bdf8', glow: 'rgba(56, 189, 248, 0.25)', label: 'Entry 1080p Value' },
  'build-midrange': { accent: '#10b981', glow: 'rgba(16, 185, 129, 0.25)', label: 'Sweet-Spot 1440p' },
  'build-highend': { accent: '#a855f7', glow: 'rgba(168, 85, 247, 0.25)', label: 'Enthusiast 4K Max' }
};

export default function PopularBuilds({
  onLoadPreset = () => {},
  onViewAll = () => {}
}) {
  return (
    <section className="popular-builds-section">
      {/* Section Header */}
      <div className="popular-header-row">
        <div className="popular-titles">
          <div className="popular-eyebrow">
            <Sparkles size={13} />
            <span>Curated Configurations</span>
          </div>
          <h2 className="popular-heading">Popular Verified Builds</h2>
          <p className="popular-subheading">
            Turnkey configurations benchmarked for specific budgets, gaming resolutions, and workloads.
          </p>
        </div>

        <button
          type="button"
          className="view-all-link-btn"
          onClick={onViewAll}
        >
          <span>Explore All Hardware</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Full-Row Showcase Cards */}
      <div className="popular-showcase-rows">
        {POPULAR_BUILDS.map((preset) => {
          const tier = TIER_COLORS[preset.id] || TIER_COLORS['build-midrange'];

          return (
            <div
              key={preset.id}
              className="popular-row-card"
              style={{ '--tier-accent': tier.accent, '--tier-glow': tier.glow }}
            >
              {/* Left: Rig Visual Showcase taking full left block */}
              <div className="row-rig-visual-block">
                <div className="visual-backdrop-glow" />
                <img
                  src="/images/hero_rig_45.png"
                  alt={preset.title}
                  className="row-rig-img"
                />
                <span className="row-tier-badge" style={{ backgroundColor: tier.accent }}>
                  {preset.tag}
                </span>
              </div>

              {/* Center: Title, Tier, Specs Pills, and FPS Target */}
              <div className="row-main-details">
                <div className="row-title-strip">
                  <h3 className="row-build-title">{preset.title}</h3>
                  <span className="row-sub-tag">{tier.label}</span>
                </div>

                <div className="row-specs-wrap">
                  <span className="row-spec-pill">{preset.cpu}</span>
                  <span className="row-spec-pill">{preset.gpu}</span>
                  <span className="row-spec-pill">{preset.ram}</span>
                  <span className="row-spec-pill">{preset.storage}</span>
                </div>

                <div className="row-performance-strip">
                  <Zap size={13} className="fps-zap-icon" style={{ color: tier.accent }} />
                  <span className="fps-label">Performance Target:</span>
                  <span className="fps-value">{preset.fpsTarget}</span>
                  <span className="bullet-sep">•</span>
                  <ShieldCheck size={13} className="verified-icon" />
                  <span className="verified-text">100% Tested & Verified Compatibility</span>
                </div>
              </div>

              {/* Right: Price & Load Button */}
              <div className="row-action-block">
                <div className="row-price-group">
                  <span className="row-price-label">All-Inclusive Price</span>
                  <span className="row-price-num">{preset.price}</span>
                </div>

                <button
                  type="button"
                  className="row-load-btn"
                  onClick={() => onLoadPreset(preset)}
                >
                  <span>Load Into Builder</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
