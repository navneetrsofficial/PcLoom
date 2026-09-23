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

const COMPONENT_ORDER = ['cpu', 'cooler', 'motherboard', 'ram', 'gpu', 'storage', 'psu', 'case'];

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

  const currentCategoryKey = COMPONENT_ORDER[singleIndex];
  const currentPart = buildParts[currentCategoryKey];

  const totalPrice = currentBuild?.totalPrice || Object.values(buildParts).reduce((sum, item) => {
    if (!item) return sum;
    const p = typeof item?.price === 'number' ? item.price : parseFloat(item?.price) || 0;
    return sum + (p < 2000 ? Math.round(p * 85) : Math.round(p));
  }, 0);

  const installedCount = Object.values(buildParts).filter(Boolean).length;

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
                /* Single Component Inspector Carousel */
                <div className="single-part-carousel-view">
                  <div className="carousel-nav-header">
                    <button type="button" className="carousel-nav-btn" onClick={handlePrevPart}>
                      <ChevronLeft size={18} />
                      <span>Previous</span>
                    </button>

                    <div className="carousel-counter">
                      <span>{currentCategoryKey.toUpperCase()}</span>
                      <span className="counter-dots">
                        {singleIndex + 1} of {COMPONENT_ORDER.length}
                      </span>
                    </div>

                    <button type="button" className="carousel-nav-btn" onClick={handleNextPart}>
                      <span>Next</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div className="carousel-card-body">
                    {currentPart ? (
                      <div className="single-product-display">
                        <div className="single-product-img-box">
                          <img
                            src={getComponentImage(currentCategoryKey, currentPart)}
                            alt={currentPart.name}
                            className="single-hero-img"
                          />
                        </div>

                        <div className="single-product-details">
                          <span className="single-category-tag">
                            {currentCategoryKey.toUpperCase()}
                          </span>
                          <h3 className="single-product-title">{currentPart.name}</h3>
                          <span className="single-product-brand">Brand: {currentPart.brand}</span>

                          <div className="single-specs-box">
                            <h4>Architectural Specifications:</h4>
                            <p>{formatSpecs(currentCategoryKey, currentPart).l1}</p>
                            <p>{formatSpecs(currentCategoryKey, currentPart).l2}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="single-empty-slot">
                        <Box size={40} className="empty-slot-icon" />
                        <h4>No component selected for {currentCategoryKey.toUpperCase()}</h4>
                      </div>
                    )}
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
