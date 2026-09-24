import React, { useState, useEffect } from 'react';
import { Shield, Wrench, Layers, Scale, Sparkles, ShoppingBag, Search, ChevronRight } from 'lucide-react';
import './StickyNavbar.css';

export default function StickyNavbar({
  build,
  totalParts,
  totalPrice,
  isCompatible,
  onStartBuilding,
  onExploreComponents,
  onOpenCompare,
  onSearchChange,
  searchQuery = ''
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky navbar once user scrolls past hero section (~450px)
      if (window.scrollY > 450) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky-navbar ${isVisible ? 'navbar-visible' : 'navbar-hidden'}`}>
      <div className="sticky-navbar-inner">
        {/* Logo */}
        <a
          href="#hero"
          className="sticky-brand"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <div className="brand-icon-hex">
            <Shield size={18} className="shield-icon" />
          </div>
          <span className="brand-text">PCLoom</span>
        </a>

        {/* Navigation Links */}
        <nav className="sticky-nav-links">
          <button
            type="button"
            className="sticky-link"
            onClick={onStartBuilding}
          >
            <Wrench size={15} />
            <span>Build Creator</span>
          </button>

          <button
            type="button"
            className="sticky-link"
            onClick={onExploreComponents}
          >
            <Layers size={15} />
            <span>Components</span>
          </button>

          <button
            type="button"
            className="sticky-link"
            onClick={onOpenCompare}
          >
            <Scale size={15} />
            <span>Compare</span>
          </button>

          <a
            href="#presets"
            className="sticky-link"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('presets')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Sparkles size={15} />
            <span>Pre-builts</span>
          </a>
        </nav>

        {/* Live Build Badge & CTA */}
        <div className="sticky-actions">
          {totalParts > 0 && (
            <div className={`sticky-build-pill ${isCompatible ? 'pill-valid' : 'pill-alert'}`}>
              <span className="build-count">{totalParts}/8 parts</span>
              <span className="build-price">${totalPrice.toLocaleString()}</span>
            </div>
          )}

          <button className="sticky-cta-btn" onClick={onStartBuilding}>
            <span>{totalParts > 0 ? 'Review Build' : 'Start Building'}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
