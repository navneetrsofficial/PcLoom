import React from 'react';
import { Search, ShoppingCart, User, Layers, Sun, Moon } from 'lucide-react';
import './DashboardNavbar.css';

export default function DashboardNavbar({
  activeNav = 'Build',
  onNavClick = () => {},
  cartCount = 2,
  searchQuery = '',
  onSearchChange = () => {},
  onOpenCart = () => {},
  onOpenProfile = () => {},
  isSavedBuildsOpen = false,
  theme = 'dark',
  onToggleTheme = () => {},
  currentUser = null,
  onOpenAuth = () => {},
  onLogout = () => {}
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

        {/* Right Actions: Search, Theme Toggle, Cart, Profile / Auth */}
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

          {/* Theme Toggle Button */}
          <button
            type="button"
            className="navbar-icon-btn theme-toggle-btn"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <Sun size={18} className="theme-toggle-glyph sun-glyph" />
            ) : (
              <Moon size={18} className="theme-toggle-glyph moon-glyph" />
            )}
          </button>

          <button
            type="button"
            className="navbar-icon-btn cart-btn"
            onClick={onOpenCart}
            title="View Cart"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {/* User Profile or Sign In / Sign Up */}
          {currentUser ? (
            <div className="user-profile-nav-group">
              <button
                type="button"
                className={`navbar-icon-btn profile-btn ${activeNav === 'Profile' ? 'profile-btn-active' : ''}`}
                onClick={onOpenProfile}
                title={`Logged in as ${currentUser.name || currentUser.email}. View Profile.`}
              >
                <div className="profile-avatar-circle user-initials-badge">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User size={16} />}
                </div>
              </button>
              <button
                type="button"
                className="navbar-logout-btn"
                onClick={onLogout}
                title="Sign Out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="navbar-auth-btn"
              onClick={onOpenAuth}
              title="Sign In or Register an Account"
            >
              <User size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
