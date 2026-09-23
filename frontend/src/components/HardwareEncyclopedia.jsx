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
  Search,
  SlidersHorizontal,
  Table,
  LayoutGrid,
  Sparkles,
  Check,
  Plus,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Flame,
  Scale,
  X,
  Star,
  Layers,
  Thermometer
} from 'lucide-react';
import { fetchProducts } from '../services/api';
import { getComponentImage, formatSpecs } from '../utils/hardwareImages';
import './HardwareEncyclopedia.css';

const ENCYCLOPEDIA_CATEGORIES = [
  { id: 'cpu', label: 'Processors (CPU)', icon: Cpu, desc: 'Central Processing Units' },
  { id: 'gpu', label: 'Graphics Cards (GPU)', icon: Tv, desc: 'Dedicated Video Accelerators' },
  { id: 'motherboard', label: 'Motherboards', icon: CircuitBoard, desc: 'System Boards & Chipsets' },
  { id: 'ram', label: 'Memory (RAM)', icon: MemoryStick, desc: 'DDR4 & DDR5 Dual-Channel Kits' },
  { id: 'storage', label: 'Storage Drives', icon: HardDrive, desc: 'PCIe NVMe SSDs & HDDs' },
  { id: 'psu', label: 'Power Supplies (PSU)', icon: Zap, desc: '80+ Certified Modular Units' },
  { id: 'cooler', label: 'CPU Coolers', icon: Fan, desc: 'Liquid AIOs & Tower Air Sinks' },
  { id: 'case', label: 'Chassis & Enclosures', icon: Box, desc: 'Mid-Tower & Compact SFF Cases' }
];

export default function HardwareEncyclopedia({
  onAddToBuild = () => {},
  onToggleCompare = () => {},
  compareList = [],
  build = {}
}) {
  const [activeCategory, setActiveCategory] = useState('cpu');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedSocket, setSelectedSocket] = useState('All');
  const [viewFormat, setViewFormat] = useState('grid'); // 'grid' or 'table'
  const [inspectingItem, setInspectingItem] = useState(null);

  // Fetch verified products for active category
  useEffect(() => {
    setLoading(true);
    fetchProducts(activeCategory === 'cooler' ? 'cpu_cooler' : activeCategory).then((data) => {
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts([]);
      }
      setLoading(false);
    });
  }, [activeCategory]);

  // Extract available brands
  const brands = useMemo(() => {
    const set = new Set(products.map((p) => p.brand).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filtered hardware
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
      if (selectedSocket !== 'All') {
        const socket = p.specs?.socket || p.specs?.supported_sockets || '';
        if (!socket.includes(selectedSocket)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchBrand = p.brand?.toLowerCase().includes(q);
        const matchNotes = p.notes?.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchNotes) return false;
      }
      return true;
    });
  }, [products, selectedBrand, selectedSocket, searchQuery]);

  return (
    <div className="encyclopedia-root">
      {/* ----------------------------------------------------------------------
          1. TOP HORIZONTAL CATEGORY NAVIGATION BAR
          ---------------------------------------------------------------------- */}
      <header className="encyclopedia-header-nav">
        <div className="category-scroll-strip">
          {ENCYCLOPEDIA_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`horizontal-cat-tab ${isActive ? 'cat-tab-active' : ''}`}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSelectedBrand('All');
                  setSelectedSocket('All');
                  setSearchQuery('');
                }}
              >
                <Icon size={16} className="cat-tab-icon" />
                <span className="cat-tab-label">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ----------------------------------------------------------------------
          2. RESEARCH TOOLBAR (Search, Brand, Sockets, View Toggle)
          ---------------------------------------------------------------------- */}
      <div className="encyclopedia-toolbar">
        <div className="toolbar-search-field">
          <Search size={15} className="toolbar-search-icon" />
          <input
            type="text"
            placeholder={`Search ${activeCategory.toUpperCase()} hardware specifications, model numbers...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="toolbar-search-input"
          />
        </div>

        <div className="toolbar-filters-group">
          {/* Brand Selector */}
          <div className="toolbar-dropdown-box">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="encyclopedia-select"
            >
              {brands.map((b) => (
                <option key={b} value={b}>
                  Brand: {b}
                </option>
              ))}
            </select>
          </div>

          {/* Socket / Architecture Filter if CPU/Motherboard/Cooler */}
          {['cpu', 'motherboard', 'cooler'].includes(activeCategory) && (
            <div className="toolbar-dropdown-box">
              <select
                value={selectedSocket}
                onChange={(e) => setSelectedSocket(e.target.value)}
                className="encyclopedia-select"
              >
                <option value="All">Socket: All Platforms</option>
                <option value="AM5">AMD Socket AM5</option>
                <option value="AM4">AMD Socket AM4</option>
                <option value="LGA1700">Intel LGA1700</option>
              </select>
            </div>
          )}

          {/* View Toggle: Grid Cards vs Table View */}
          <div className="view-toggle-buttons">
            <button
              type="button"
              className={`view-btn ${viewFormat === 'grid' ? 'view-active' : ''}`}
              onClick={() => setViewFormat('grid')}
              title="Grid Card View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              className={`view-btn ${viewFormat === 'table' ? 'view-active' : ''}`}
              onClick={() => setViewFormat('table')}
              title="Technical Specification Table"
            >
              <Table size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------------
          3. HARDWARE DATABASE VIEW (GRID VS TABLE)
          ---------------------------------------------------------------------- */}
      {loading ? (
        <div className="encyclopedia-loading-box">
          <div className="encyclopedia-spinner" />
          <p>Loading hardware encyclopedia database...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="encyclopedia-empty-state">
          <Box size={40} className="empty-state-icon" />
          <h4>No hardware matches your research query</h4>
          <p>Try clearing filters or searching for alternative chipsets or brand names.</p>
        </div>
      ) : viewFormat === 'grid' ? (
        /* Rich Hardware Card Grid */
        <div className="encyclopedia-card-grid">
          {filteredProducts.map((item) => {
            const cardImg = getComponentImage(activeCategory, item);
            const { l1, l2 } = formatSpecs(activeCategory, item);
            const p = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
            const inrPrice = p < 2000 ? Math.round(p * 85) : Math.round(p);
            const isCompared = compareList.some((c) => c.id === item.id);

            return (
              <div key={item.id} className="encyclopedia-card">
                {/* Image and Header */}
                <div
                  className="encyclopedia-img-wrapper"
                  onClick={() => setInspectingItem({ ...item, cardImg, inrPrice, l1, l2 })}
                  title="Click to view deep-dive architecture specs"
                >
                  <img src={cardImg} alt={item.name} className="encyclopedia-img" />
                  <span className="inspect-hover-badge">
                    <Sparkles size={11} />
                    <span>Deep-Dive</span>
                  </span>
                </div>

                <div className="encyclopedia-card-content">
                  <div className="card-brand-row">
                    <span className="brand-tag">{item.brand}</span>
                    <span className="price-tag">₹ {inrPrice.toLocaleString('en-IN')}</span>
                  </div>

                  <h3
                    className="card-name-title"
                    title={item.name}
                    onClick={() => setInspectingItem({ ...item, cardImg, inrPrice, l1, l2 })}
                  >
                    {item.name}
                  </h3>

                  <div className="card-specs-container">
                    <div className="spec-row-item">{l1}</div>
                    <div className="spec-row-item">{l2}</div>
                  </div>

                  {/* Actions */}
                  <div className="card-bottom-actions">
                    <button
                      type="button"
                      className="btn-deep-dive"
                      onClick={() => setInspectingItem({ ...item, cardImg, inrPrice, l1, l2 })}
                    >
                      <Sparkles size={13} />
                      <span>Specifications</span>
                    </button>

                    <button
                      type="button"
                      className="btn-add-to-build"
                      onClick={() =>
                        onAddToBuild({
                          ...item,
                          category: activeCategory,
                          price: inrPrice,
                          image: cardImg,
                          specsLine1: l1,
                          specsLine2: l2
                        })
                      }
                      title="Add to active PC build"
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>

                    <button
                      type="button"
                      className={`btn-compare-pill ${isCompared ? 'btn-compared-active' : ''}`}
                      onClick={() =>
                        onToggleCompare({
                          ...item,
                          category: activeCategory,
                          price: inrPrice,
                          image: cardImg,
                          specsLine1: l1,
                          specsLine2: l2
                        })
                      }
                      title="Compare side-by-side"
                    >
                      <Scale size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Rich PCPartPicker-Style Technical Table */
        <div className="encyclopedia-table-frame">
          <table className="encyclopedia-data-table">
            <thead>
              <tr>
                <th className="th-img">Photo</th>
                <th className="th-name">Product Model</th>
                <th className="th-brand">Brand</th>
                <th className="th-specs">Key Architecture Specifications</th>
                <th className="th-price">MSRP / Price</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((item) => {
                const cardImg = getComponentImage(activeCategory, item);
                const { l1, l2 } = formatSpecs(activeCategory, item);
                const p = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
                const inrPrice = p < 2000 ? Math.round(p * 85) : Math.round(p);
                const isCompared = compareList.some((c) => c.id === item.id);

                return (
                  <tr key={item.id} className="encyclopedia-table-row">
                    <td className="td-img">
                      <img src={cardImg} alt={item.name} className="table-thumb-img" />
                    </td>
                    <td className="td-name">
                      <span
                        className="table-item-name-link"
                        onClick={() => setInspectingItem({ ...item, cardImg, inrPrice, l1, l2 })}
                      >
                        {item.name}
                      </span>
                    </td>
                    <td className="td-brand">
                      <span className="brand-chip">{item.brand}</span>
                    </td>
                    <td className="td-specs">
                      <div className="table-specs-summary">
                        <span>{l1}</span>
                        <span className="sub-spec">{l2}</span>
                      </div>
                    </td>
                    <td className="td-price">
                      <span className="table-price-num">₹ {inrPrice.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="td-actions">
                      <div className="table-actions-cluster">
                        <button
                          type="button"
                          className="table-btn-inspect"
                          onClick={() => setInspectingItem({ ...item, cardImg, inrPrice, l1, l2 })}
                          title="View architectural encyclopedia"
                        >
                          Specs
                        </button>
                        <button
                          type="button"
                          className="table-btn-add"
                          onClick={() =>
                            onAddToBuild({
                              ...item,
                              category: activeCategory,
                              price: inrPrice,
                              image: cardImg,
                              specsLine1: l1,
                              specsLine2: l2
                            })
                          }
                          title="Add to build"
                        >
                          <Plus size={13} />
                        </button>
                        <button
                          type="button"
                          className={`table-btn-compare ${isCompared ? 'table-compared-active' : ''}`}
                          onClick={() =>
                            onToggleCompare({
                              ...item,
                              category: activeCategory,
                              price: inrPrice,
                              image: cardImg,
                              specsLine1: l1,
                              specsLine2: l2
                            })
                          }
                          title="Compare"
                        >
                          <Scale size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          4. IN-DEPTH HARDWARE INSPECTOR MODAL
          ---------------------------------------------------------------------- */}
      {inspectingItem && (
        <div className="inspector-modal-backdrop" onClick={() => setInspectingItem(null)}>
          <div className="inspector-modal-window" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="inspector-header">
              <div className="inspector-header-left">
                <span className="inspector-badge">
                  <ShieldCheck size={13} />
                  <span>Hardware Encyclopedia Profile</span>
                </span>
                <h2 className="inspector-title">{inspectingItem.name}</h2>
                <span className="inspector-subtitle">
                  Manufacturer: {inspectingItem.brand} • MSRP: ₹ {inspectingItem.inrPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <button
                type="button"
                className="inspector-close-btn"
                onClick={() => setInspectingItem(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="inspector-body">
              {/* Top Overview: Image + Key Metrics */}
              <div className="inspector-overview-row">
                <div className="inspector-img-showcase">
                  <img
                    src={inspectingItem.cardImg}
                    alt={inspectingItem.name}
                    className="inspector-large-img"
                  />
                </div>

                <div className="inspector-metrics-grid">
                  <div className="metric-box">
                    <span className="metric-label">Thermal Envelop (TDP)</span>
                    <span className="metric-val">
                      {inspectingItem.specs?.tdp_w ? `${inspectingItem.specs.tdp_w}W` : 'Standard'}
                    </span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Socket / Interface</span>
                    <span className="metric-val">
                      {inspectingItem.specs?.socket || inspectingItem.specs?.interface || inspectingItem.specs?.supported_form_factors || 'PCIe Standard'}
                    </span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Performance Tier</span>
                    <span className="metric-val text-success">
                      Tier S / Enthusiast
                    </span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Customer Rating</span>
                    <span className="metric-val text-warning">
                      ★ {inspectingItem.rating || 4.8} / 5.0
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Architectural Specifications Matrix */}
              <div className="inspector-specs-table-box">
                <h4 className="inspector-section-heading">Detailed Architectural Specifications</h4>
                <div className="inspector-specs-grid">
                  {Object.entries(inspectingItem.specs || {}).map(([key, val]) => (
                    <div key={key} className="spec-tile">
                      <span className="spec-tile-key">{key.replace(/_/g, ' ').toUpperCase()}</span>
                      <span className="spec-tile-val">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compatibility & Recommended Pairings */}
              <div className="inspector-pairings-box">
                <h4 className="inspector-section-heading">
                  <Sparkles size={14} />
                  <span>Recommended Hardware Pairings & Clearance Guidelines</span>
                </h4>
                <div className="pairings-recommendations-list">
                  <div className="pairing-card">
                    <span className="pairing-title">Compatible Platform:</span>
                    <span className="pairing-detail">
                      Pairs with {inspectingItem.specs?.socket || 'ATX System'} Motherboards and minimum 650W 80+ Gold certified PSU.
                    </span>
                  </div>
                  <div className="pairing-card">
                    <span className="pairing-title">Recommended Memory:</span>
                    <span className="pairing-detail">
                      Low-latency DDR5-6000MHz CL30 or DDR4-3600MHz Dual-Channel Kit for optimum throughput.
                    </span>
                  </div>
                  <div className="pairing-card">
                    <span className="pairing-title">Cooling Guidance:</span>
                    <span className="pairing-detail">
                      Recommend 240mm/360mm AIO liquid loop or high-performance dual-tower air cooler for maximum boost clock sustained duration.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="inspector-footer">
              <button
                type="button"
                className="inspector-btn-add"
                onClick={() => {
                  onAddToBuild({
                    ...inspectingItem,
                    category: activeCategory,
                    price: inspectingItem.inrPrice,
                    image: inspectingItem.cardImg,
                    specsLine1: inspectingItem.l1,
                    specsLine2: inspectingItem.l2
                  });
                  setInspectingItem(null);
                }}
              >
                <Plus size={15} />
                <span>Add to Current PC Build</span>
              </button>

              <button
                type="button"
                className="inspector-btn-compare"
                onClick={() => {
                  onToggleCompare({
                    ...inspectingItem,
                    category: activeCategory,
                    price: inspectingItem.inrPrice,
                    image: inspectingItem.cardImg,
                    specsLine1: inspectingItem.l1,
                    specsLine2: inspectingItem.l2
                  });
                  setInspectingItem(null);
                }}
              >
                <Scale size={15} />
                <span>Add to Compare Matrix</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
