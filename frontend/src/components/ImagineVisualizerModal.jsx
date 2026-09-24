import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Box,
  Layers,
  ArrowRight,
  Cpu,
  Tv,
  Fan,
  CircuitBoard,
  MemoryStick,
  HardDrive,
  Zap,
  Bookmark
} from 'lucide-react';
import DynamicRigPreview from './DynamicRigPreview';
import { getComponentImage, formatSpecs } from '../utils/hardwareImages';
import './ImagineVisualizerModal.css';

const COMPONENT_ORDER = [
  { key: 'cpu', label: 'CPU', fullName: 'Processor (CPU)' },
  { key: 'cooler', label: 'Cooler', fullName: 'CPU Cooler' },
  { key: 'motherboard', label: 'Motherboard', fullName: 'Motherboard' },
  { key: 'ram', label: 'RAM', fullName: 'Memory (RAM)' },
  { key: 'gpu', label: 'GPU', fullName: 'Graphics Card (GPU)' },
  { key: 'storage', label: 'Storage', fullName: 'Solid State Storage (SSD)' },
  { key: 'psu', label: 'PSU', fullName: 'Power Supply Unit (PSU)' },
  { key: 'case', label: 'Case', fullName: 'Chassis / Cabinet' },
];

export default function ImagineVisualizerModal({
  isOpen = false,
  onClose = () => {},
  savedBuilds = [],
  selectedBuildId = null,
  onSelectBuildId = () => {},
  onGoToBuilder = () => {}
}) {
  const [activeView, setActiveView] = useState('dynamic'); // 'dynamic' or 'single'
  const [singleIndex, setSingleIndex] = useState(0);

  // Determine which build to visualize
  const currentBuild = savedBuilds.find((b) => b.id === selectedBuildId) || savedBuilds[0] || null;
  const buildParts = currentBuild?.parts || {};

  if (!isOpen) return null;

  const currentCategoryObj = COMPONENT_ORDER[singleIndex];
  const currentCategoryKey = currentCategoryObj.key;
  const rawPart = buildParts[currentCategoryKey];
  const currentPart = Array.isArray(rawPart) ? rawPart[0] : rawPart;

  const totalPrice = currentBuild?.totalPrice || Object.values(buildParts).reduce((sum, item) => {
    if (!item) return sum;
    const actualItem = Array.isArray(item) ? item[0] : item;
    const p = typeof actualItem?.price === 'number' ? actualItem.price : parseFloat(actualItem?.price) || 0;
    return sum + (p < 2000 ? Math.round(p * 85) : Math.round(p));
  }, 0);

  const installedCount = Object.values(buildParts).filter((p) => {
    if (!p) return false;
    if (Array.isArray(p)) return p.length > 0;
    return true;
  }).length;

  const handleNextPart = () => {
    setSingleIndex((prev) => (prev + 1) % COMPONENT_ORDER.length);
  };

  const handlePrevPart = () => {
    setSingleIndex((prev) => (prev - 1 + COMPONENT_ORDER.length) % COMPONENT_ORDER.length);
  };

  return (
    <div className="imagine-modal-overlay" onClick={onClose}>
      <div className="imagine-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="imagine-modal-header">
          <div className="imagine-header-title-box">
            <div className="imagine-badge">
              <Sparkles size={14} />
              <span>Dynamic Architecture Visualizer</span>
            </div>
            <h2 className="imagine-title">
              {currentBuild ? currentBuild.name : 'System Hardware Assembly'}
            </h2>
            <p className="imagine-desc">
              Reactive architectural blueprint generated specifically for your selected components.
            </p>
          </div>

          <div className="imagine-header-controls">
            {savedBuilds.length > 0 && (
              <div className="view-mode-toggle">
                <button
                  type="button"
                  className={`mode-btn ${activeView === 'dynamic' ? 'mode-active' : ''}`}
                  onClick={() => setActiveView('dynamic')}
                >
                  <span>Chassis Assembly View</span>
                </button>
                <button
                  type="button"
                  className={`mode-btn ${activeView === 'single' ? 'mode-active' : ''}`}
                  onClick={() => setActiveView('single')}
                >
                  <span>Component Inspector</span>
                </button>
              </div>
            )}

            <button type="button" className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="imagine-modal-body">
          {savedBuilds.length === 0 ? (
            /* EMPTY STATE */
            <div className="imagine-empty-state">
              <div className="empty-chassis-glyph">
                <Box size={48} className="glyph-box" />
                <Sparkles size={22} className="glyph-sparkle" />
              </div>
              <h3 className="empty-state-title">Please Save a Build First</h3>
              <p className="empty-state-desc">
                The visualizer generates custom rig schematics tailored to your exact components.
                Choose your hardware, click <strong>"Save Build"</strong> inside your cart, and return here to visualize your custom rig!
              </p>
              <button
                type="button"
                className="empty-action-btn"
                onClick={() => {
                  onClose();
                  onGoToBuilder();
                }}
              >
                <span>Assemble & Save a Build Now</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <>
              {/* Build Selector Bar */}
              <div className="saved-build-selector-bar">
                <div className="selector-left">
                  <span className="selector-label">Active Saved Build:</span>
                  <select
                    className="saved-builds-select"
                    value={currentBuild?.id}
                    onChange={(e) => onSelectBuildId(e.target.value)}
                  >
                    {savedBuilds.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} (₹ {(b.totalPrice || 0).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="combo-signatures">
                  <span className="sig-pill sig-cost">
                    Total: ₹ {totalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="sig-pill sig-count">
                    {installedCount} Components Mounted
                  </span>
                </div>
              </div>

              {activeView === 'dynamic' ? (
                /* Dynamic Assembly Preview */
                <div className="dynamic-assembly-embed">
                  <DynamicRigPreview
                    build={buildParts}
                    totalPrice={totalPrice}
                    estimatedPower={520}
                    compatScore={92}
                    isCompatible={true}
                    onSelectCategory={() => {}}
                  />
                </div>
              ) : (
                /* Single Component Inspector View */
                <div className="single-inspector-layout">
                  {/* Category Navigation Pills */}
                  <div className="inspector-nav-pills">
                    {COMPONENT_ORDER.map((item, idx) => {
                      const part = Array.isArray(buildParts[item.key])
                        ? buildParts[item.key][0]
                        : buildParts[item.key];
                      const isInstalled = Boolean(part && (part.name || part.id));
                      const isSelected = singleIndex === idx;

                      return (
                        <button
                          key={item.key}
                          type="button"
                          className={`nav-pill ${isSelected ? 'pill-selected' : ''}`}
                          onClick={() => setSingleIndex(idx)}
                        >
                          <span
                            className="pill-dot"
                            style={{
                              background: isInstalled ? '#10b981' : '#64748b',
                              boxShadow: isInstalled ? '0 0 8px rgba(16, 185, 129, 0.6)' : 'none'
                            }}
                          />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Main Component Card with Next / Prev Carousel Arrows */}
                  <div className="inspector-showcase-card">
                    <button
                      type="button"
                      className="carousel-arrow"
                      onClick={handlePrevPart}
                      title="Previous Component"
                      aria-label="Previous component"
                    >
                      <ChevronLeft size={22} />
                    </button>

                    <div className="inspector-card-content">
                      {currentPart && (currentPart.name || currentPart.id) ? (
                        <>
                          <div className="inspector-artwork-box">
                            <img
                              src={getComponentImage(currentCategoryKey, currentPart)}
                              alt={currentPart.name || currentCategoryObj.label}
                              className="inspector-part-img"
                            />
                            <span className="inspect-angle-tag">Hardware Visualizer Artwork</span>
                          </div>

                          <div className="inspector-details-box">
                            <div className="inspect-eyebrow">
                              <span className="inspect-cat-badge">{currentCategoryObj.fullName}</span>
                              <span className="inspect-status-badge badge-active">Mounted in Rig</span>
                            </div>

                            <h3 className="inspect-part-title">{currentPart.name}</h3>

                            <div className="inspect-specs-grid">
                              {currentPart.brand && (
                                <div className="inspect-spec-row">
                                  <span className="spec-k">Manufacturer / Brand</span>
                                  <span className="spec-v">{currentPart.brand}</span>
                                </div>
                              )}
                              <div className="inspect-spec-row">
                                <span className="spec-k">Architectural Spec 1</span>
                                <span className="spec-v">{formatSpecs(currentCategoryKey, currentPart).l1}</span>
                              </div>
                              <div className="inspect-spec-row">
                                <span className="spec-k">Architectural Spec 2</span>
                                <span className="spec-v">{formatSpecs(currentCategoryKey, currentPart).l2}</span>
                              </div>
                            </div>

                            <div className="inspect-footer-row">
                              <div className="inspect-price-box">
                                <span className="spec-k" style={{ display: 'block', fontSize: '0.72rem' }}>Component Value</span>
                                <span className="inspect-price">
                                  ₹ {(currentPart.price ? (currentPart.price < 2000 ? currentPart.price * 85 : currentPart.price) : 0).toLocaleString('en-IN')}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="inspect-swap-btn"
                                onClick={() => {
                                  onClose();
                                  onGoToBuilder();
                                }}
                              >
                                Replace in PC Builder →
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="inspector-artwork-box" style={{ background: 'rgba(15, 23, 42, 0.3)' }}>
                            <Box size={56} style={{ color: '#475569', strokeWidth: 1.5 }} />
                            <span className="inspect-angle-tag">Slot Unoccupied</span>
                          </div>

                          <div className="inspector-details-box">
                            <div className="inspect-eyebrow">
                              <span className="inspect-cat-badge">{currentCategoryObj.fullName}</span>
                              <span className="inspect-status-badge badge-pending">Slot Available</span>
                            </div>

                            <h3 className="inspect-part-title">No {currentCategoryObj.label} Selected</h3>

                            <div className="empty-inspect-prompt">
                              <p>
                                This saved rig does not currently have a {currentCategoryObj.fullName} mounted. Choosing one in the builder completes your configuration and unlocks full telemetry.
                              </p>
                              <button
                                type="button"
                                className="inspect-choose-btn"
                                onClick={() => {
                                  onClose();
                                  onGoToBuilder();
                                }}
                              >
                                + Select {currentCategoryObj.label} in PC Builder
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      className="carousel-arrow"
                      onClick={handleNextPart}
                      title="Next Component"
                      aria-label="Next component"
                    >
                      <ChevronRight size={22} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
