import React from 'react';
import { Search, ShoppingCart, User, Layers } from 'lucide-react';
import './DashboardNavbar.css';

export default function DashboardNavbar({
  activeNav = 'Build',
  onNavClick = () => {},
  cartCount = 2,
  searchQuery = '',
  onSearchChange = () => {},
  onOpenCart = () => {},
  onOpenProfile = () => {},
  isSavedBuildsOpen = false
}) {
  const navItems = ['Build', 'Components', 'Compare', 'Recommendations', 'My Builds', 'Profile'];

  return (
    <header className="dashboard-top-navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div className="navbar-brand" onClick={() => onNavClick('Build')}>
          <div className="brand-logo-icon">
            <Layers size={18} className="logo-svg-glyph" />
          </div>
          <span className="brand-name">PcLoom</span>
        </div>

        {/* Navigation Links */}
        <nav className="navbar-links" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isItemActive =
              activeNav === item ||
              (item === 'My Builds' && isSavedBuildsOpen);

            return (
              <button
                key={item}
                type="button"
                className={`nav-link-btn ${isItemActive ? 'nav-active' : ''}`}
                onClick={() => onNavClick(item)}
              >
                {item}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Search, Cart, Profile */}
        <div className="navbar-actions">
          <div className="navbar-search-box">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="navbar-icon-btn cart-btn"
            onClick={onOpenCart}
            title="View Cart"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          <button
            type="button"
            className={`navbar-icon-btn profile-btn ${activeNav === 'Profile' ? 'profile-btn-active' : ''}`}
            onClick={onOpenProfile}
            title="User Profile & Settings"
          >
            <div className="profile-avatar-circle">
              <User size={16} />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
