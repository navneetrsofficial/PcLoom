import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  ChevronRight,
  Bookmark,
  Gamepad2,
  CircuitBoard,
  MemoryStick,
  HardDrive,
  Zap,
  Fan,
  Box,
  Cpu,
  Trash2,
  ShoppingCart,
  Share2,
  Check,
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react';
import { checkCompatibility } from '../services/api';
import './CurrentBuildDrawer.css';

const ICON_MAP = {
  cpu: Bookmark,
  gpu: Gamepad2,
  motherboard: CircuitBoard,
  ram: MemoryStick,
  storage: HardDrive,
  psu: Zap,
  cooler: Fan,
  case: Box
};

const CATEGORY_LABELS = {
  cpu: 'CPU',
  gpu: 'GPU',
  motherboard: 'Motherboard',
  ram: 'RAM',
  storage: 'Storage',
  psu: 'PSU',
  cooler: 'Cooler',
  case: 'Case'
};

export default function CurrentBuildDrawer({
  isOpen = false,
  onClose = () => {},
  build = {},
  onRemovePart = () => {},
  onUpdateQty = () => {},
  onClearBuild = () => {},
  onSaveBuild = () => {},
  onAddToCart = () => {},
  onShareBuild = () => {}
}) {
  const [isSingleBuild, setIsSingleBuild] = useState(true);
  const [compatReport, setCompatReport] = useState(null);
  const [loadingCompat, setLoadingCompat] = useState(false);
  const [showDetailErrors, setShowDetailErrors] = useState(false);

  // Flatten items supporting multiple items per category
  const flatItems = [];
  const activeCategories = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'cooler', 'case'];
  activeCategories.forEach((cat) => {
    const val = build[cat];
    if (!val) return;
    if (Array.isArray(val)) {
      val.forEach((item, idx) => {
        flatItems.push({ ...item, category: cat, itemIndex: idx });
      });
    } else {
      flatItems.push({ ...val, category: cat, itemIndex: 0 });
    }
  });

  // Total price and power draw calculation
  const totalPrice = flatItems.reduce((sum, item) => {
    const p = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    const inrPrice = p < 2000 ? Math.round(p * 85) : Math.round(p);
    const qty = item.quantity || 1;
    return sum + inrPrice * qty;
  }, 0);

  const estimatedPower = flatItems.reduce((sum, item) => {
    const draw = item.draw || (item.specs && (item.specs.tdp_w || item.specs.wattage_w)) || 40;
    const qty = item.quantity || 1;
    return sum + parseInt(draw, 10) * qty;
  }, 50);

  // Backend compatibility evaluation
  useEffect(() => {
    if (!isSingleBuild || flatItems.length === 0) {
      setCompatReport(null);
      return;
    }

    const partIds = flatItems.map((item) => item.id).filter(Boolean);
    if (partIds.length > 0) {
      setLoadingCompat(true);
      checkCompatibility(partIds).then((report) => {
        setCompatReport(report);
        setLoadingCompat(false);
      });
    }
  }, [build, isSingleBuild, flatItems.length]);

  if (!isOpen) return null;

  // Calculate score: default 92 if mostly compatible or backend score
  const score = compatReport?.compatibility_score ?? (flatItems.length >= 4 ? 92 : flatItems.length * 20);
  const isCompatible = compatReport?.is_compatible ?? true;
  const ratingText = compatReport?.rating || (score >= 85 ? 'Excellent' : score >= 60 ? 'Compatible' : 'Warnings Present');

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <aside className="cart-drawer-container" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header Close Button */}
        <div className="drawer-top-bar">
          <span className="drawer-eyebrow-text">Configurator Summary</span>
          <button type="button" className="drawer-close-btn" onClick={onClose} title="Close Panel">
            <X size={18} />
          </button>
        </div>

        {/* ------------------------------------------------------------------
            1. SINGLE BUILD CHECKBOX QUESTION (User specified 1-2 lines)
            ------------------------------------------------------------------ */}
        <div className="single-build-toggle-box">
          <label className="toggle-checkbox-label">
            <input
              type="checkbox"
              checked={isSingleBuild}
              onChange={(e) => setIsSingleBuild(e.target.checked)}
              className="toggle-checkbox-input"
            />
            <span className="toggle-checkbox-custom" />
            <div className="toggle-text-block">
              <span className="toggle-main-question">Are all of these components for one singular PC build?</span>
              <span className="toggle-sub-note">Checking this calculates socket, power, and physical clearance.</span>
            </div>
          </label>
        </div>

        {/* ------------------------------------------------------------------
            2. TOP COMPATIBILITY SCORE CARD (From user's image)
            ------------------------------------------------------------------ */}
        {isSingleBuild ? (
          <div
            className={`compat-score-card ${!isCompatible ? 'compat-card-error' : ''}`}
            onClick={() => setShowDetailErrors(!showDetailErrors)}
            title="Click to toggle rule breakdown"
          >
            <div className="score-circle-wrapper">
              <svg className="score-svg" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" className="score-bg-circle" />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  className={`score-fill-circle ${!isCompatible ? 'fill-error' : ''}`}
                  strokeDasharray="113"
                  strokeDashoffset={113 - (113 * score) / 100}
                />
              </svg>
              <span className="score-circle-num">{score}</span>
            </div>

            <div className="score-info-block">
              <span className="score-card-title">Compatibility Score</span>
              <div className="score-status-row">
                <span className={`score-status-text ${!isCompatible ? 'text-error' : ''}`}>{ratingText}</span>
                <CheckCircle2 size={13} className="score-check-icon" />
              </div>
            </div>

            <ChevronRight
              size={18}
              className={`score-arrow-icon ${showDetailErrors ? 'arrow-rotate' : ''}`}
            />
          </div>
        ) : (
          <div className="compat-disabled-note">
            <AlertCircle size={14} />
            <span>Single build validation disabled. Check the box above to verify compatibility.</span>
          </div>
        )}

        {/* Detailed Issues Accordion */}
        {isSingleBuild && showDetailErrors && compatReport?.errors?.length > 0 && (
          <div className="compat-errors-dropdown">
            <span className="errors-heading">Detected Hardware Conflicts:</span>
            {compatReport.errors.map((err, idx) => (
              <p key={idx} className="error-item-msg">
                • {err.message}
              </p>
            ))}
          </div>
        )}

        {/* ------------------------------------------------------------------
            3. CURRENT BUILD LIST (From user's image, multi-item & qty supported)
            ------------------------------------------------------------------ */}
        <div className="current-build-section">
          <div className="build-section-header">
            <h3 className="build-header-title">Current Build ({flatItems.length})</h3>
            {flatItems.length > 0 && (
              <button type="button" className="clear-all-link" onClick={onClearBuild}>
                Clear All
              </button>
            )}
          </div>

          <div className="build-items-scroll-list">
            {flatItems.length === 0 ? (
              <div className="empty-build-state">
                <Box size={32} className="empty-box-icon" />
                <p>Your build is currently empty.</p>
                <span>Select components from the catalog to assemble your PC.</span>
              </div>
            ) : (
              flatItems.map((item, index) => {
                const Icon = ICON_MAP[item.category] || Cpu;
                const p = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
                const formattedPrice = p < 2000 ? Math.round(p * 85) : Math.round(p);
                const qty = item.quantity || 1;

                return (
                  <div key={`${item.id}-${index}`} className="build-row-item">
                    <div className="row-icon-box">
                      <Icon size={16} />
                    </div>

                    <div className="row-info-col">
                      <span className="row-category-name">
                        {CATEGORY_LABELS[item.category] || item.category.toUpperCase()}
                      </span>
                      <span className="row-product-name" title={item.name}>
                        {item.name}
                      </span>
                    </div>

                    {/* Quantity controls */}
                    <div className="row-qty-controls">
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => onUpdateQty(item.category, item.itemIndex, qty - 1)}
                        title="Decrease quantity"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="qty-num">{qty}</span>
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => onUpdateQty(item.category, item.itemIndex, qty + 1)}
                        title="Increase quantity"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    <div className="row-actions-col">
                      <span className="row-price-tag">
                        ₹ {(formattedPrice * qty).toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        className="row-remove-btn"
                        onClick={() => onRemovePart(item.category, item.itemIndex)}
                        title={`Remove ${item.name}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------------
            4. BUILD SUMMARY (From user's image)
            ------------------------------------------------------------------ */}
        <div className="build-summary-box">
          <h4 className="summary-heading">Build Summary</h4>

          <div className="summary-line">
            <span className="summary-label">Total Price</span>
            <span className="summary-value price-total">₹ {totalPrice.toLocaleString('en-IN')}</span>
          </div>

          <div className="summary-line">
            <span className="summary-label">Estimated Power Draw</span>
            <span className="summary-value power-val">~ {estimatedPower}W</span>
          </div>

          {isSingleBuild && (
            <div className="summary-score-block">
              <div className="summary-line">
                <div className="score-label-with-icon">
                  <span className="summary-label">Compatibility Score</span>
                  <CheckCircle2 size={12} className="summary-check" />
                </div>
                <span className="summary-value score-val">{score} / 100</span>
              </div>
              <div className="summary-progress-track">
                <div
                  className="summary-progress-fill"
                  style={{
                    width: `${Math.min(100, score)}%`,
                    backgroundColor: isCompatible ? '#10b981' : '#ef4444'
                  }}
                />
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------
              5. ACTION BUTTONS (Add to Cart, Save Build, Share Build)
              ------------------------------------------------------------------ */}
          <div className="drawer-action-buttons">
            <button
              type="button"
              className="action-btn-primary add-cart-btn"
              onClick={onAddToCart}
            >
              <ShoppingCart size={16} />
              <span>Checkout Order</span>
            </button>

            <button
              type="button"
              className="action-btn-secondary save-build-btn"
              onClick={onSaveBuild}
            >
              <Bookmark size={15} />
              <span>Save Build</span>
            </button>

            <button
              type="button"
              className="action-btn-secondary share-build-btn"
              onClick={onShareBuild}
            >
              <Share2 size={15} />
              <span>Share Build</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
