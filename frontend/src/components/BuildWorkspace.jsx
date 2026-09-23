import React, { useState, useEffect, useMemo } from 'react';
import {
  Cpu,
  Tv,
  CircuitBoard,
  MemoryStick,
  HardDrive,
  Zap,
  Fan,
  Box,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Check,
  Trash2,
  ShoppingCart,
  Bookmark,
  Sparkles,
  Search,
  Filter,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Star
} from 'lucide-react';
import { fetchProducts } from '../services/api';
import { getComponentImage, formatSpecs } from '../utils/hardwareImages';
import DynamicRigPreview from './DynamicRigPreview';
import './BuildWorkspace.css';

const BUILD_CATEGORIES = [
  { id: 'cpu', label: 'CPU (Processor)', icon: Cpu, isMulti: false },
  { id: 'cooler', label: 'CPU Cooler', icon: Fan, isMulti: false },
  { id: 'motherboard', label: 'Motherboard', icon: CircuitBoard, isMulti: false },
  { id: 'ram', label: 'RAM (Memory)', icon: MemoryStick, isMulti: true },
  { id: 'gpu', label: 'Graphics Card (GPU)', icon: Tv, isMulti: true },
  { id: 'storage', label: 'Storage (SSD/HDD)', icon: HardDrive, isMulti: true },
  { id: 'psu', label: 'Power Supply (PSU)', icon: Zap, isMulti: false },
  { id: 'case', label: 'Cabinet (Case)', icon: Box, isMulti: false }
];

export default function BuildWorkspace({
  build = {},
  onAddToBuild = () => {},
  onRemoveFromBuild = () => {},
  onClearBuild = () => {},
  onOpenCart = () => {},
  onSaveBuild = () => {},
  onToggleCompare = () => {},
  compareList = [],
  compatReport = null,
  isSingleBuild = true,
  onToggleSingleBuild = () => {}
}) {
  const [selectedCategory, setSelectedCategory] = useState('cpu');
  const [workspaceMode, setWorkspaceMode] = useState('picker'); // 'picker' or 'preview'
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortBy, setSortBy] = useState('Popularity');
  const [showWarningsModal, setShowWarningsModal] = useState(false);

  // Fetch real backend data for selected category
  useEffect(() => {
    setLoading(true);
    fetchProducts(selectedCategory === 'cooler' ? 'cpu_cooler' : selectedCategory).then((data) => {
      if (data && data.length > 0) {
        setCatalogProducts(data);
      } else {
        setCatalogProducts([]);
      }
      setLoading(false);
    });
  }, [selectedCategory]);

  // Extract equipped items for telemetry
  const allEquippedItems = useMemo(() => {
    const list = [];
    Object.entries(build).forEach(([cat, val]) => {
      if (!val) return;
      if (Array.isArray(val)) {
        val.forEach((item) => list.push({ ...item, category: cat }));
      } else {
        list.push({ ...val, category: cat });
      }
    });
    return list;
  }, [build]);

  // Total price in INR
  const totalPrice = useMemo(() => {
    return allEquippedItems.reduce((sum, item) => {
      const p = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
      const inr = p < 2000 ? Math.round(p * 85) : Math.round(p);
      const qty = item.quantity || 1;
      return sum + inr * qty;
    }, 0);
  }, [allEquippedItems]);

  // Estimated system power draw
  const estimatedPower = useMemo(() => {
    return allEquippedItems.reduce((sum, item) => {
      const tdp = item.specs?.tdp_w || (item.specs?.wattage_w ? 0 : 40);
      return sum + parseInt(tdp, 10);
    }, 50); // baseline system draw
  }, [allEquippedItems]);

  const psuWattage = parseInt(build.psu?.specs?.wattage_w || 750, 10);
  const compatScore = compatReport?.compatibility_score ?? (allEquippedItems.length >= 4 ? 92 : allEquippedItems.length * 20);
  const isCompatible = compatReport?.is_compatible ?? true;
  const ratingText = compatReport?.rating || (compatScore >= 85 ? 'Excellent' : 'Compatible');

  // Filter products by search and brand
  const filteredProducts = useMemo(() => {
    return catalogProducts
      .filter((p) => {
        if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name?.toLowerCase().includes(q);
          const matchBrand = p.brand?.toLowerCase().includes(q);
          if (!matchName && !matchBrand) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const pa = typeof a.price === 'number' ? a.price : parseFloat(a.price) || 0;
        const pb = typeof b.price === 'number' ? b.price : parseFloat(b.price) || 0;
        if (sortBy === 'Price: Low to High') return pa - pb;
        if (sortBy === 'Price: High to Low') return pb - pa;
        if (sortBy === 'Rating') return (b.rating || 4.7) - (a.rating || 4.7);
        return 0;
      });
  }, [catalogProducts, selectedBrand, searchQuery, sortBy]);

  const availableBrands = useMemo(() => {
    const brands = new Set(catalogProducts.map((p) => p.brand).filter(Boolean));
    return ['All', ...Array.from(brands)];
  }, [catalogProducts]);

  return (
    <div className="build-workspace-root">
      {/* ----------------------------------------------------------------------
          1. TOP WORKSPACE TELEMETRY HUD BAR
          ---------------------------------------------------------------------- */}
      <header className="workspace-hud-bar">
        {/* Left: Compatibility Score Ring */}
        <div
          className="hud-stat-box score-stat-box"
          onClick={() => compatReport?.errors?.length > 0 && setShowWarningsModal(true)}
          title="Click to view rule verification breakdown"
        >
          <div className="hud-score-ring">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`circle-progress ${!isCompatible ? 'stroke-danger' : 'stroke-success'}`}
                strokeDasharray={`${compatScore}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="score-center-val">{compatScore}</span>
          </div>
          <div className="hud-stat-info">
            <div className="hud-stat-label">Compatibility</div>
            <div className={`hud-stat-status ${!isCompatible ? 'text-danger' : 'text-success'}`}>
              <CheckCircle2 size={13} />
              <span>{ratingText}</span>
            </div>
          </div>
        </div>

        {/* Center-Left: Power Consumption Gauge */}
        <div className="hud-stat-box power-stat-box">
          <div className="hud-stat-info">
            <div className="hud-stat-label">Estimated Wattage</div>
            <div className="hud-power-val">
              <Zap size={15} className="text-warning" />
              <span>~ {estimatedPower}W</span>
              <span className="hud-power-sub">/ {psuWattage}W Rated</span>
            </div>
          </div>
          <div className="hud-power-track">
            <div
              className="hud-power-bar"
              style={{ width: `${Math.min(100, Math.round((estimatedPower / psuWattage) * 100))}%` }}
            />
          </div>
        </div>

        {/* Center-Right: Total Cost */}
        <div className="hud-stat-box cost-stat-box">
          <div className="hud-stat-info">
            <div className="hud-stat-label">Total Build Cost</div>
            <div className="hud-price-val">₹ {totalPrice.toLocaleString('en-IN')}</div>
          </div>
          <span className="hud-parts-count-tag">
            {allEquippedItems.length} Part{allEquippedItems.length === 1 ? '' : 's'} Selected
          </span>
        </div>

        {/* Right: Primary Workspace Controls */}
        <div className="hud-actions-group">
          {/* Workspace Mode Switcher */}
          <div className="mode-segmented-control">
            <button
              type="button"
              className={`mode-segment-btn ${workspaceMode === 'picker' ? 'segment-active' : ''}`}
              onClick={() => setWorkspaceMode('picker')}
            >
              <span>Component Studio</span>
            </button>
            <button
              type="button"
              className={`mode-segment-btn ${workspaceMode === 'preview' ? 'segment-active' : ''}`}
              onClick={() => setWorkspaceMode('preview')}
            >
              <Sparkles size={13} />
              <span>Dynamic Rig Preview</span>
            </button>
          </div>

          <button type="button" className="hud-btn-cart" onClick={onOpenCart}>
            <ShoppingCart size={15} />
            <span>Review Build</span>
            <span className="cart-badge-pill">{allEquippedItems.length}</span>
          </button>

          <button type="button" className="hud-btn-save" onClick={onSaveBuild}>
            <Bookmark size={14} />
            <span>Save</span>
          </button>
        </div>
      </header>

      {/* ----------------------------------------------------------------------
          2. WORKSPACE BODY: (Component Studio vs Dynamic Assembly Preview)
          ---------------------------------------------------------------------- */}
      {workspaceMode === 'preview' ? (
        <div className="workspace-preview-stage">
          <DynamicRigPreview
            build={build}
            totalPrice={totalPrice}
            estimatedPower={estimatedPower}
            compatScore={compatScore}
            isCompatible={isCompatible}
            warnings={compatReport?.warnings || []}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setWorkspaceMode('picker');
            }}
          />
        </div>
      ) : (
        <div className="workspace-studio-layout">
          {/* Left Categories Rail */}
          <aside className="workspace-categories-rail">
            <div className="rail-heading-box">
              <span className="rail-title">System Slots</span>
              <button
                type="button"
                className="rail-clear-link"
                onClick={onClearBuild}
                title="Clear all equipped components"
              >
                Reset
              </button>
            </div>

            <div className="rail-categories-list">
              {BUILD_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                const rawVal = build[cat.id];
                const equippedCount = Array.isArray(rawVal) ? rawVal.length : (rawVal ? 1 : 0);
                const firstPart = Array.isArray(rawVal) ? rawVal[0] : rawVal;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`rail-category-card ${isSelected ? 'rail-card-active' : ''} ${
                      equippedCount > 0 ? 'rail-card-equipped' : ''
                    }`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <div className="rail-card-icon-box">
                      <Icon size={16} />
                    </div>

                    <div className="rail-card-text">
                      <span className="rail-cat-name">{cat.label}</span>
                      <span className="rail-cat-state">
                        {equippedCount > 1
                          ? `${equippedCount} parts equipped`
                          : firstPart
                          ? firstPart.name
                          : '+ Select component'}
                      </span>
                    </div>

                    {equippedCount > 0 && (
                      <span className="rail-check-badge">
                        <Check size={12} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Center Hardware Picker Stage */}
          <section className="workspace-picker-stage">
            {/* Filter and Search Bar */}
            <div className="picker-toolbar">
              <div className="search-input-box">
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  placeholder={`Search ${selectedCategory.toUpperCase()} models, chipsets...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-text-input"
                />
              </div>

              {/* Brand Filter */}
              <div className="toolbar-select-box">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="toolbar-select"
                >
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>
                      Brand: {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="toolbar-select-box">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="toolbar-select"
                >
                  <option value="Popularity">Sort: Popularity</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                  <option value="Rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Hardware Cards Grid */}
            <div className="picker-products-grid">
              {loading ? (
                <div className="picker-loading-view">
                  <div className="loading-spinner" />
                  <p>Querying verified hardware specifications...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="picker-empty-view">
                  <Box size={36} className="empty-box-icon" />
                  <p>No components match your search filters.</p>
                </div>
              ) : (
                filteredProducts.map((item, idx) => {
                  const cardImg = getComponentImage(selectedCategory, item);
                  const { l1, l2 } = formatSpecs(selectedCategory, item);
                  const p = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
                  const inrPrice = p < 2000 ? Math.round(p * 85) : Math.round(p);

                  // Check if this item is currently equipped
                  const rawVal = build[selectedCategory];
                  const isEquipped = Array.isArray(rawVal)
                    ? rawVal.some((pItem) => pItem.id === item.id)
                    : rawVal?.id === item.id;

                  const isCompared = compareList.some((c) => c.id === item.id);
                  const isMultiCategory = ['gpu', 'storage', 'ram'].includes(selectedCategory);

                  return (
                    <div
                      key={item.id}
                      className={`builder-product-card ${isEquipped ? 'card-is-equipped' : ''}`}
                    >
                      {/* Product Thumbnail */}
                      <div className="builder-card-img-box">
                        <img src={cardImg} alt={item.name} className="builder-card-img" />
                      </div>

                      {/* Info */}
                      <div className="builder-card-info">
                        <span className="builder-card-brand">{item.brand}</span>
                        <h4 className="builder-card-title" title={item.name}>
                          {item.name}
                        </h4>
                        <div className="builder-card-specs">
                          <p className="spec-bullet">{l1}</p>
                          <p className="spec-bullet">{l2}</p>
                        </div>

                        {/* Price & Rating */}
                        <div className="builder-card-meta">
                          <span className="builder-card-price">
                            ₹ {inrPrice.toLocaleString('en-IN')}
                          </span>
                          <div className="builder-card-rating">
                            <Star size={11} className="star-icon" />
                            <span>{item.rating || 4.8}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="builder-card-actions">
                          <button
                            type="button"
                            className={`btn-builder-add ${isEquipped ? 'btn-equipped' : ''}`}
                            onClick={() =>
                              onAddToBuild({
                                ...item,
                                category: selectedCategory,
                                price: inrPrice,
                                image: cardImg,
                                specsLine1: l1,
                                specsLine2: l2
                              })
                            }
                          >
                            {isEquipped ? (
                              isMultiCategory ? (
                                <>
                                  <Plus size={13} />
                                  <span>Add Another</span>
                                </>
                              ) : (
                                <>
                                  <Check size={13} />
                                  <span>Equipped</span>
                                </>
                              )
                            ) : (
                              <>
                                <Plus size={13} />
                                <span>Equip to Build</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            className={`btn-builder-compare ${isCompared ? 'btn-compared' : ''}`}
                            onClick={() =>
                              onToggleCompare({
                                ...item,
                                category: selectedCategory,
                                price: inrPrice,
                                image: cardImg,
                                specsLine1: l1,
                                specsLine2: l2
                              })
                            }
                            title={isCompared ? 'Remove from comparison' : 'Add to side-by-side compare'}
                          >
                            {isCompared ? <Check size={13} /> : <span>Compare</span>}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
