import React, { useState, useMemo } from 'react';
import {
  Cpu, Fan, CircuitBoard, Boxes, HardDrive, Tv, Box, Zap,
  Search, Filter, Plus, Check, Scale, AlertCircle, ArrowUpDown
} from 'lucide-react';
import { ALL_COMPONENTS, CATEGORIES } from '../data/componentsData';
import './ComponentCatalog.css';

const ICON_MAP = {
  cpu: Cpu,
  cooler: Fan,
  motherboard: CircuitBoard,
  ram: Boxes,
  storage: HardDrive,
  gpu: Tv,
  case: Box,
  psu: Zap
};

export default function ComponentCatalog({
  build,
  onSelectComponent,
  onAddToCompare,
  compareList = [],
  initialCategory = 'all',
  externalSearchQuery = ''
}) {
  const [selectedCat, setSelectedCat] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
  const [sortBy, setSortBy] = useState('featured');

  // Keep search in sync if external query changes
  React.useEffect(() => {
    if (externalSearchQuery) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  const filteredComponents = useMemo(() => {
    return ALL_COMPONENTS.filter((item) => {
      const matchCat = selectedCat === 'all' || item.category === selectedCat;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        Object.values(item.specs).some((val) => String(val).toLowerCase().includes(q));

      return matchCat && matchSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [selectedCat, searchQuery, sortBy]);

  // Check if a component has an obvious conflict with current build
  const checkItemCompatibility = (item) => {
    if (item.category === 'cpu' && build.motherboard) {
      if (item.specs.socket !== build.motherboard.specs.socket) {
        return { compatible: false, reason: `Requires ${item.specs.socket} board` };
      }
    }
    if (item.category === 'motherboard' && build.cpu) {
      if (item.specs.socket !== build.cpu.specs.socket) {
        return { compatible: false, reason: `Requires ${build.cpu.specs.socket} CPU` };
      }
    }
    if (item.category === 'ram' && build.motherboard) {
      if (item.specs.type.toUpperCase() !== build.motherboard.specs.memory_type.toUpperCase()) {
        return { compatible: false, reason: `Board requires ${build.motherboard.specs.memory_type}` };
      }
    }
    if (item.category === 'gpu' && build.case) {
      if (Number(item.specs.length_mm) > Number(build.case.specs.max_gpu_length_mm)) {
        return { compatible: false, reason: `Too long for case (${item.specs.length_mm}mm > ${build.case.specs.max_gpu_length_mm}mm)` };
      }
    }
    if (item.category === 'cooler' && build.case) {
      if (Number(item.specs.height_mm) > Number(build.case.specs.max_cooler_height_mm)) {
        return { compatible: false, reason: `Too tall for case (${item.specs.height_mm}mm > ${build.case.specs.max_cooler_height_mm}mm)` };
      }
    }
    return { compatible: true };
  };

  return (
    <section className="catalog-section" id="catalog">
      <div className="catalog-container">
        {/* Header */}
        <div className="catalog-header">
          <div className="catalog-eyebrow">
            <span>Official Component Database</span>
          </div>
          <h2 className="catalog-title">
            Explore Verified <span className="highlight-gradient">Hardware</span>
          </h2>
          <p className="catalog-desc">
            Browse through 80 rigorously verified components across 8 categories. Every part is vetted against official manufacturer schematics for pinouts, tolerances, and clearance.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="catalog-controls-card">
          {/* Category Chips */}
          <div className="category-chips-row">
            <button
              className={`cat-chip ${selectedCat === 'all' ? 'active-chip' : ''}`}
              onClick={() => setSelectedCat('all')}
            >
              <span>All Parts</span>
              <span className="chip-count">{ALL_COMPONENTS.length}</span>
            </button>

            {CATEGORIES.map((cat) => {
              const Icon = ICON_MAP[cat.id] || Box;
              const count = ALL_COMPONENTS.filter((c) => c.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  className={`cat-chip ${selectedCat === cat.id ? 'active-chip' : ''}`}
                  onClick={() => setSelectedCat(cat.id)}
                >
                  <Icon size={14} />
                  <span>{cat.name}</span>
                  <span className="chip-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Bar */}
          <div className="catalog-subcontrols">
            <div className="catalog-search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by part name, brand, socket, chipset..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                  ✕
                </button>
              )}
            </div>

            <div className="catalog-sort-box">
              <ArrowUpDown size={15} className="sort-icon" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="featured">Featured / Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Components Grid */}
        <div className="components-grid">
          {filteredComponents.map((item) => {
            const Icon = ICON_MAP[item.category] || Box;
            const isInstalled = build[item.category]?.id === item.id;
            const isCompared = compareList.some((c) => c.id === item.id);
            const compat = checkItemCompatibility(item);

            return (
              <div key={item.id} className={`component-card ${isInstalled ? 'card-installed' : ''}`}>
                {/* Top Badge Row */}
                <div className="card-top-row">
                  <div className="card-brand-tag">{item.brand}</div>
                  {!compat.compatible ? (
                    <div className="card-compat-pill pill-conflict" title={compat.reason}>
                      <AlertCircle size={12} />
                      <span>Conflict</span>
                    </div>
                  ) : isInstalled ? (
                    <div className="card-compat-pill pill-selected">
                      <Check size={12} />
                      <span>In Build</span>
                    </div>
                  ) : (
                    <div className="card-compat-pill pill-fit">
                      <span>Compatible</span>
                    </div>
                  )}
                </div>

                {/* Card Main Info */}
                <div className="card-main-info">
                  <div className="card-icon-round">
                    <Icon size={22} />
                  </div>
                  <h3 className="card-title" title={item.name}>{item.name}</h3>
                </div>

                {/* Specs Pills List */}
                <div className="card-specs-container">
                  {item.category === 'cpu' && (
                    <>
                      <span className="spec-pill">Socket: {item.specs.socket}</span>
                      <span className="spec-pill">{item.specs.cores} Cores / {item.specs.threads} Threads</span>
                      <span className="spec-pill">Base: {item.specs.base_clock_ghz} GHz</span>
                      <span className="spec-pill">{item.specs.tdp_w}W TDP</span>
                    </>
                  )}
                  {item.category === 'gpu' && (
                    <>
                      <span className="spec-pill">{item.specs.chipset}</span>
                      <span className="spec-pill">{item.specs.vram_gb}GB VRAM</span>
                      <span className="spec-pill">{item.specs.length_mm}mm Length</span>
                      <span className="spec-pill">{item.specs.tdp_w}W TDP</span>
                    </>
                  )}
                  {item.category === 'motherboard' && (
                    <>
                      <span className="spec-pill">{item.specs.socket}</span>
                      <span className="spec-pill">{item.specs.chipset}</span>
                      <span className="spec-pill">{item.specs.form_factor}</span>
                      <span className="spec-pill">{item.specs.memory_type}</span>
                    </>
                  )}
                  {item.category === 'ram' && (
                    <>
                      <span className="spec-pill">{item.specs.type}</span>
                      <span className="spec-pill">{item.specs.speed_mhz} MHz</span>
                      <span className="spec-pill">{item.specs.capacity_gb}GB ({item.specs.modules}x)</span>
                      <span className="spec-pill">CL{item.specs.cas_latency}</span>
                    </>
                  )}
                  {item.category === 'storage' && (
                    <>
                      <span className="spec-pill">{item.specs.capacity_gb}GB</span>
                      <span className="spec-pill">{item.specs.form_factor}</span>
                      <span className="spec-pill">{item.specs.interface}</span>
                    </>
                  )}
                  {item.category === 'cooler' && (
                    <>
                      <span className="spec-pill">{item.specs.type}</span>
                      <span className="spec-pill">{item.specs.height_mm}mm Height</span>
                      <span className="spec-pill">{item.specs.tdp_rating_w ? `${item.specs.tdp_rating_w}W TDP` : 'NSPR Standard'}</span>
                    </>
                  )}
                  {item.category === 'case' && (
                    <>
                      <span className="spec-pill">{item.specs.supported_form_factors}</span>
                      <span className="spec-pill">Max GPU: {item.specs.max_gpu_length_mm}mm</span>
                      <span className="spec-pill">Max Cooler: {item.specs.max_cooler_height_mm}mm</span>
                    </>
                  )}
                  {item.category === 'psu' && (
                    <>
                      <span className="spec-pill">{item.specs.wattage_w}W</span>
                      <span className="spec-pill">{item.specs.efficiency}</span>
                      <span className="spec-pill">{item.specs.modular}</span>
                    </>
                  )}
                </div>

                {/* Bottom Row: Price & Actions */}
                <div className="card-footer-row">
                  <div className="card-price-box">
                    <span className="card-price-label">Price</span>
                    <span className="card-price-val">${item.price}</span>
                  </div>

                  <div className="card-actions-group">
                    <button
                      className={`card-btn-compare ${isCompared ? 'btn-compared-active' : ''}`}
                      onClick={() => onAddToCompare(item)}
                      title="Add to side-by-side comparison"
                    >
                      <Scale size={14} />
                      <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                    </button>

                    <button
                      className={`card-btn-add ${isInstalled ? 'btn-installed' : ''}`}
                      onClick={() => onSelectComponent(item)}
                    >
                      {isInstalled ? (
                        <>
                          <Check size={14} />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          <span>Add to Build</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredComponents.length === 0 && (
          <div className="catalog-empty-state">
            <p>No components found matching your search or filters.</p>
            <button className="reset-filter-btn" onClick={() => { setSelectedCat('all'); setSearchQuery(''); }}>
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
