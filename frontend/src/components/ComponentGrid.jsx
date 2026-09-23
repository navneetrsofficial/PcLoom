import React, { useState, useEffect, useMemo } from 'react';
import {
  Gamepad2,
  Monitor,
  Sparkles,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Star,
  Plus,
  Check,
  Cpu,
  CircuitBoard,
  MemoryStick,
  HardDrive,
  Zap,
  Fan,
  Box,
  Layers,
  Filter
} from 'lucide-react';
import { fetchProducts } from '../services/api';
import { CATEGORIES as LOCAL_CATEGORIES, PRODUCTS_BY_CATEGORY as FALLBACK_PRODUCTS } from '../data/dashboardData';
import './ComponentGrid.css';

const CATEGORY_ICONS = {
  cpu: Cpu,
  gpu: Gamepad2,
  motherboard: CircuitBoard,
  ram: MemoryStick,
  storage: HardDrive,
  psu: Zap,
  cooler: Fan,
  case: Box
};

// Map each category to its high-resolution product image
function getComponentImage(category, item) {
  if (item && item.id) {
    return `/images/products/${item.id}.jpg`;
  }
  if (category === 'cpu') {
    return item.brand === 'Intel' || item.name.includes('Core')
      ? '/images/intel_box.png'
      : '/images/amd_box.png';
  }
  if (category === 'gpu') return '/images/gpu_thumb.jpg';
  if (category === 'motherboard') return '/images/mb_thumb.jpg';
  if (category === 'ram') return '/images/ram_thumb.jpg';
  if (category === 'cooler' || category === 'cpu_cooler') return '/images/cooler_thumb.jpg';
  if (category === 'storage') return '/images/ssd_thumb.jpg';
  if (category === 'psu') return '/images/psu_thumb.jpg';
  if (category === 'case') return '/images/hero_rig_45.png';
  return '/images/hero_rig_45.png';
}

// Format structured backend specs into clean 2-line specs
function formatSpecs(category, item) {
  const s = item.specs || {};
  if (category === 'cpu') {
    const l1 = s.cores ? `${s.cores} Cores / ${s.threads} Threads • ${s.base_clock_ghz}/${s.boost_clock_ghz} GHz` : item.specsLine1;
    const l2 = s.socket ? `Socket: ${s.socket} • TDP: ${s.tdp_w}W` : item.specsLine2;
    return { l1: l1 || 'High-performance CPU', l2: l2 || 'AM5 / LGA1700' };
  }
  if (category === 'gpu') {
    const l1 = s.memory_gb ? `${s.memory_gb}GB ${s.memory_type} • Boost: ${s.boost_clock_mhz} MHz` : item.specsLine1;
    const l2 = s.length_mm ? `Length: ${s.length_mm}mm • TDP: ${s.tdp_w}W` : item.specsLine2;
    return { l1: l1 || 'High-end GPU', l2: l2 || 'Ray Tracing & DLSS' };
  }
  if (category === 'motherboard') {
    const l1 = s.socket ? `Socket: ${s.socket} • Form Factor: ${s.form_factor}` : item.specsLine1;
    const l2 = s.memory_type ? `RAM: ${s.memory_type} (${s.memory_slots} slots) • Max: ${s.max_memory_gb}GB` : item.specsLine2;
    return { l1: l1 || 'ATX Motherboard', l2: l2 || 'PCIe 4.0 / 5.0' };
  }
  if (category === 'ram') {
    const l1 = s.capacity_gb ? `${s.capacity_gb}GB (${s.modules}) • ${s.type}-${s.speed_mhz}` : item.specsLine1;
    const l2 = s.cas_latency ? `CAS Latency: CL${s.cas_latency} • Dual Channel` : item.specsLine2;
    return { l1: l1 || 'DDR4 / DDR5 Memory', l2: l2 || 'Dual Channel Kit' };
  }
  if (category === 'storage') {
    const l1 = s.capacity_gb ? `${s.capacity_gb}GB ${s.interface} • ${s.form_factor}` : item.specsLine1;
    const l2 = s.read_mb_s ? `Read: ${s.read_mb_s} MB/s • Write: ${s.write_mb_s} MB/s` : item.specsLine2;
    return { l1: l1 || 'NVMe PCIe SSD', l2: l2 || 'High Speed Gen 4' };
  }
  if (category === 'psu') {
    const l1 = s.wattage_w ? `${s.wattage_w}W • Efficiency: ${s.efficiency_rating}` : item.specsLine1;
    const l2 = s.modular ? `Modular: ${s.modular} • Form Factor: ${s.form_factor}` : item.specsLine2;
    return { l1: l1 || 'Modular Power Supply', l2: l2 || '80+ Certified' };
  }
  if (category === 'cooler' || category === 'cpu_cooler') {
    const l1 = s.type ? `Type: ${s.type} • Height: ${s.height_mm}mm` : item.specsLine1;
    const l2 = s.supported_sockets ? `Sockets: ${s.supported_sockets}` : item.specsLine2;
    return { l1: l1 || 'CPU Cooling Solution', l2: l2 || 'Air / AIO Liquid' };
  }
  if (category === 'case') {
    const l1 = s.form_factor ? `Form Factor: ${s.form_factor} Chassis` : item.specsLine1;
    const l2 = s.max_gpu_length_mm ? `Max GPU: ${s.max_gpu_length_mm}mm • Max Cooler: ${s.max_cooler_height_mm}mm` : item.specsLine2;
    return { l1: l1 || 'Tempered Glass Case', l2: l2 || 'High Airflow Design' };
  }
  return { l1: item.specsLine1 || 'Hardware Component', l2: item.specsLine2 || 'Verified Specification' };
}

export default function ComponentGrid({
  mode = 'Build', // 'Build' (curated by use-case) or 'Components' (all catalog)
  selectedCategory = 'cpu',
  onSelectCategory = () => {},
  build = {},
  onAddToBuild = () => {},
  onToggleCompare = () => {},
  compareList = []
}) {
  const [useCaseMode, setUseCaseMode] = useState('Gaming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState('Popularity');
  const [backendProducts, setBackendProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Normalize category id for backend (cpu_cooler <-> cooler)
  const queryCatId = selectedCategory === 'cooler' ? 'cpu_cooler' : selectedCategory;

  // Fetch real backend data whenever selectedCategory changes
  useEffect(() => {
    setIsLoading(true);
    fetchProducts(queryCatId).then((data) => {
      if (data && data.length > 0) {
        setBackendProducts(data);
      } else {
        // Fallback to local data if backend isn't ready
        setBackendProducts(FALLBACK_PRODUCTS[selectedCategory] || []);
      }
      setIsLoading(false);
    });
  }, [selectedCategory, queryCatId]);

  const rawProducts = backendProducts.length > 0 ? backendProducts : (FALLBACK_PRODUCTS[selectedCategory] || []);

  // Filter products based on Mode (Build curated use-cases vs Components full catalog), Brand, Search, Price
  const filteredProducts = useMemo(() => {
    return rawProducts
      .filter((p) => {
        // Build Mode: Apply smart use-case curation
        if (mode === 'Build') {
          if (useCaseMode === 'Gaming') {
            // Favor high-clock CPUs, mid/high GPUs, DDR5
            if (p.category_id === 'cpu' && p.specs?.cores && parseInt(p.specs.cores, 10) > 16) return false;
          } else if (useCaseMode === 'Workstation') {
            // Favor high core count, high TDP
            if (p.category_id === 'cpu' && p.specs?.cores && parseInt(p.specs.cores, 10) < 8) return false;
          } else if (useCaseMode === 'General') {
            // Favor budget/value
            if (p.specs?.tdp_w && parseInt(p.specs.tdp_w, 10) > 150) return false;
          }
        }

        // Brand filter
        if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name?.toLowerCase().includes(q);
          const matchBrand = p.brand?.toLowerCase().includes(q);
          const matchNotes = p.notes?.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchNotes) return false;
        }

        // Price filter
        const priceNum = typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0;
        const inrPrice = priceNum < 2000 ? priceNum * 85 : priceNum;
        if (selectedPriceRange === 'Under 25k' && inrPrice >= 25000) return false;
        if (selectedPriceRange === '25k - 40k' && (inrPrice < 25000 || inrPrice > 40000)) return false;
        if (selectedPriceRange === 'Above 40k' && inrPrice <= 40000) return false;

        return true;
      })
      .sort((a, b) => {
        const pa = typeof a.price === 'number' ? a.price : parseFloat(a.price) || 0;
        const pb = typeof b.price === 'number' ? b.price : parseFloat(b.price) || 0;
        if (sortBy === 'Price: Low to High') return pa - pb;
        if (sortBy === 'Price: High to Low') return pb - pa;
        if (sortBy === 'Rating') return (b.rating || 4.7) - (a.rating || 4.7);
        return 0; // Default Popularity
      });
  }, [rawProducts, mode, useCaseMode, selectedBrand, searchQuery, selectedPriceRange, sortBy]);

  const availableBrands = useMemo(() => {
    const brands = new Set(rawProducts.map((p) => p.brand).filter(Boolean));
    return ['All', ...Array.from(brands)];
  }, [rawProducts]);

  return (
    <div className="dashboard-main-content dashboard-animate-in">
      {/* ----------------------------------------------------------------------
          HEADER BANNER:
          In "Build" mode: Curated use-case builder (Gaming, Workstation, General)
          In "Components" mode: Full Component Catalog Header
          ---------------------------------------------------------------------- */}
      {mode === 'Build' ? (
        <section className="builder-header-banner">
          <div className="banner-left-col">
            <h1 className="banner-title">Build Your Dream PC</h1>
            <p className="banner-subtitle">
              Choose your components, check compatibility in real-time, and create the perfect build for your needs.
            </p>

            <div className="use-case-pills">
              <button
                type="button"
                className={`pill-btn ${useCaseMode === 'Gaming' ? 'pill-active' : ''}`}
                onClick={() => setUseCaseMode('Gaming')}
              >
                <Gamepad2 size={16} />
                <span>Gaming</span>
              </button>

              <button
                type="button"
                className={`pill-btn ${useCaseMode === 'Workstation' ? 'pill-active' : ''}`}
                onClick={() => setUseCaseMode('Workstation')}
              >
                <Monitor size={16} />
                <span>Workstation</span>
              </button>

              <button
                type="button"
                className={`pill-btn ${useCaseMode === 'General' ? 'pill-active' : ''}`}
                onClick={() => setUseCaseMode('General')}
              >
                <Sparkles size={15} />
                <span>General</span>
              </button>
            </div>
          </div>

          <div className="banner-right-col">
            <div className="banner-rig-container">
              <img
                src="/images/hero_rig_45.png"
                alt="45 Degree Gaming PC Showcase"
                className="banner-rig-img"
              />
            </div>
          </div>
        </section>
      ) : (
        <section className="components-catalog-header-banner">
          <div className="components-header-left">
            <div className="catalog-header-badge">
              <Layers size={13} />
              <span>Full Hardware Catalog</span>
            </div>
            <h1 className="banner-title">Verified Components Database</h1>
            <p className="banner-subtitle">
              Browse all 8 categories and 80 verified parts loaded directly from our PostgreSQL hardware database.
            </p>
          </div>
          <div className="catalog-header-stats">
            <div className="stat-pill">
              <span className="stat-num">80</span>
              <span className="stat-label">Live Parts</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">8</span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------------
          CATEGORY SELECTOR & PRODUCT CARDS SECTION
          ---------------------------------------------------------------------- */}
      <section className="category-and-products-layout">
        {/* Left Sub-Sidebar: Categories List */}
        <div className="category-sub-sidebar">
          {LOCAL_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] || Cpu;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`category-item-btn ${isSelected ? 'cat-active' : ''}`}
                onClick={() => onSelectCategory(cat.id)}
              >
                <div className="cat-btn-left">
                  <Icon size={16} className="cat-icon" />
                  <span className="cat-label">{cat.label}</span>
                </div>
                <span className="cat-count-badge">10 items</span>
              </button>
            );
          })}
        </div>

        {/* Right Content: Category Title, Filter Bar & 4x2 Cards Grid */}
        <div className="products-main-panel">
          {/* Category Header */}
          <div className="cat-header-block">
            <h2 className="current-cat-title">
              {selectedCategory.toUpperCase()} Components
            </h2>
            <p className="current-cat-desc">
              Showing verified {selectedCategory.toUpperCase()} hardware from our database.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="products-filter-bar">
            {/* Search Input */}
            <div className="filter-search-box">
              <Search size={14} className="filter-search-icon" />
              <input
                type="text"
                placeholder={`Search ${selectedCategory.toUpperCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-search-input"
              />
            </div>

            {/* Brand Dropdown */}
            <div className="filter-dropdown-wrapper">
              <select
                className="filter-select"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b === 'All' ? 'Brand' : b}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="dropdown-arrow" />
            </div>

            {/* Price Range Dropdown */}
            <div className="filter-dropdown-wrapper">
              <select
                className="filter-select"
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
              >
                <option value="All">Price Range</option>
                <option value="Under 25k">Under ₹25,000</option>
                <option value="25k - 40k">₹25,000 - ₹40,000</option>
                <option value="Above 40k">Above ₹40,000</option>
              </select>
              <ChevronDown size={14} className="dropdown-arrow" />
            </div>

            {/* Right: Sort By Dropdown */}
            <div className="filter-sort-wrapper">
              <div className="sort-select-box">
                <span className="sort-prefix">Sort by:</span>
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="Popularity">Popularity</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                  <option value="Rating">Rating</option>
                </select>
                <ChevronDown size={14} className="dropdown-arrow" />
              </div>
            </div>
          </div>

          {/* 4x2 Responsive Cards Grid */}
          <div className="products-grid-4x2">
            {filteredProducts.map((item, index) => {
              const isAdded = build[selectedCategory]?.id === item.id;
              const isCompared = compareList.some((c) => c.id === item.id);
              const pNum = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
              const formattedPrice = pNum < 2000 ? Math.round(pNum * 85) : Math.round(pNum);
              const { l1, l2 } = formatSpecs(selectedCategory, item);
              const cardImage = getComponentImage(selectedCategory, item);

              return (
                <div
                  key={item.id}
                  className="product-card card-entrance-anim"
                  style={{ animationDelay: `${Math.min(0.4, index * 0.05)}s` }}
                >
                  {/* Top-Right Badge */}
                  {item.badge && (
                    <div className="card-top-badge">{item.badge}</div>
                  )}

                  {/* Product Image */}
                  <div className="card-image-box">
                    <img
                      src={cardImage}
                      alt={item.name}
                      className="card-product-img"
                    />
                  </div>

                  {/* Card Info */}
                  <div className="card-info-content">
                    <h3 className="card-title" title={item.name}>
                      {item.brand ? `${item.brand} ` : ''}{item.name}
                    </h3>

                    <div className="card-specs-lines">
                      <p className="spec-line">{l1}</p>
                      <p className="spec-line">{l2}</p>
                    </div>

                    {/* Price and Star Rating Row */}
                    <div className="card-meta-row">
                      <span className="card-price">₹ {formattedPrice.toLocaleString('en-IN')}</span>
                      <div className="card-rating">
                        <Star size={12} className="star-icon" />
                        <span className="rating-num">{item.rating || 4.7}</span>
                        <span className="reviews-num">({item.reviewsCount || '1.2k'})</span>
                      </div>
                    </div>

                    {/* Actions: "Add to Build" + Compare Checkbox */}
                    <div className="card-actions-row">
                      <button
                        type="button"
                        className={`add-build-btn ${isAdded ? 'btn-added' : ''}`}
                        onClick={() => onAddToBuild({
                          ...item,
                          category: selectedCategory,
                          price: formattedPrice,
                          image: cardImage,
                          specsLine1: l1,
                          specsLine2: l2
                        })}
                      >
                        {isAdded ? (
                          <>
                            <Check size={14} />
                            <span>Added</span>
                          </>
                        ) : (
                          <span>Add to Build</span>
                        )}
                      </button>

                      <button
                        type="button"
                        className={`compare-checkbox-btn ${isCompared ? 'compared-active' : ''}`}
                        onClick={() => onToggleCompare({
                          ...item,
                          category: selectedCategory,
                          price: formattedPrice,
                          image: cardImage,
                          specsLine1: l1,
                          specsLine2: l2
                        })}
                        title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
                      >
                        {isCompared && <Check size={13} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
