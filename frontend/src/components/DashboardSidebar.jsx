import React from 'react';
import {
  Home,
  LayoutGrid,
  ArrowLeftRight,
  ShoppingCart,
  Bookmark,
  Sparkles,
  Share2,
  Box,
  ArrowRight,
  User
} from 'lucide-react';
import './DashboardSidebar.css';

export default function DashboardSidebar({
  activeTab = 'Build',
  onTabChange = () => {},
  cartCount = 2,
  onOpenImagine = () => {},
  onOpenAiRecommendations = () => {},
  isSavedBuildsOpen = false
}) {
  const menuItems = [
    { id: 'Build', label: 'Build', icon: Home },
    { id: 'Components', label: 'Components', icon: LayoutGrid },
    { id: 'Compare', label: 'Compare', icon: ArrowLeftRight },
    { id: 'Cart', label: 'Cart', icon: ShoppingCart, badge: cartCount },
    { id: 'My Builds', label: 'My Builds', icon: Bookmark },
    { id: 'Recommendations', label: 'Recommendations', icon: Sparkles },
    { id: 'Imagine', label: 'Imagine', icon: Box, isSpecial: true },
    { id: 'Profile', label: 'Customer Profile', icon: User }
  ];

  const handleItemClick = (item) => {
    if (item.id === 'Imagine') {
      onOpenImagine();
      return;
    }
    onTabChange(item.id);
  };

  return (
    <aside className="dashboard-sidebar">
      {/* Navigation List */}
      <nav className="sidebar-nav-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.id === 'My Builds' && isSavedBuildsOpen);
          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav-btn ${isActive ? 'btn-active' : ''} ${
                item.isSpecial ? 'btn-special-imagine' : ''
              }`}
              onClick={() => handleItemClick(item)}
            >
              <div className="sidebar-btn-left">
                <Icon size={17} className="sidebar-icon" />
                <span className="sidebar-label">{item.label}</span>
              </div>
              {item.badge && item.badge > 0 && (
                <span className="sidebar-badge">{item.badge}</span>
              )}
              {item.isSpecial && (
                <span className="imagine-tag">45° Rig</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Promo Card: "Not sure where to start?" */}
      <div className="sidebar-bottom-card">
        <div className="promo-pc-thumb">
          <img
            src="/images/ai_card_pc.png"
            alt="Custom Gaming PC"
            className="promo-pc-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <h4 className="promo-title">Not sure where to start?</h4>
        <p className="promo-desc">
          Get AI-powered build recommendations based on your budget and use case.
        </p>
        <button
          type="button"
          className="promo-action-btn"
          onClick={onOpenAiRecommendations}
        >
          <span>Get Recommendations</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </aside>
  );
}
