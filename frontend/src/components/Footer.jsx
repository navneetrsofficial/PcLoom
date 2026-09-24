import React from 'react';
import {
  Layers,
  ArrowUpRight,
  Mail,
  Cpu,
  Sparkles,
  Database,
  Share2,
  Zap,
  GitCompare
} from 'lucide-react';
import './Footer.css';

export default function Footer({
  onNavigate = () => {},
  onShareBuild = () => {},
  onOpenCompare = () => {}
}) {
  const handleQuickLink = (linkName) => {
    switch (linkName) {
      case 'Home':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'Build Creator':
        onNavigate('Build');
        break;
      case 'Components':
        onNavigate('Components');
        break;
      case 'Compare':
        onOpenCompare();
        break;
      case 'Recommendations':
        onNavigate('Recommendations');
        break;
      case 'My Builds':
        onNavigate('My Builds');
        break;
      default:
        break;
    }
  };

  const handleFeatureClick = (featureName) => {
    switch (featureName) {
      case 'Compatibility Engine':
      case 'Power Estimation':
        onNavigate('Build');
        break;
      case 'Smart Recommendations':
        onNavigate('Recommendations');
        break;
      case 'Component Database':
        onNavigate('Components');
        break;
      case 'Build Sharing':
        onShareBuild();
        break;
      case 'Side-by-Side Comparison':
        onOpenCompare();
        break;
      default:
        break;
    }
  };

  return (
    <footer className="pcloom-footer" id="pcloom-footer">
      {/* Subtle Glowing Header Divider */}
      <div className="footer-top-divider" />

      <div className="footer-container">
        {/* Main 4-Column Grid */}
        <div className="footer-grid">
          {/* Column 1: Brand Section */}
          <div className="footer-brand-col">
            <div className="footer-brand-header" onClick={() => handleQuickLink('Home')}>
              <div className="footer-brand-logo-icon">
                <Layers size={20} className="logo-svg-glyph" />
              </div>
              <span className="footer-brand-title">PcLoom</span>
            </div>

            <p className="footer-brand-tagline">
              Build smarter PCs with confidence.
            </p>

            <p className="footer-brand-desc">
              Real-time compatibility checks, intelligent build recommendations, and component insights for PC enthusiasts.
            </p>

            <div className="footer-status-pill">
              <span className="status-ping-dot" />
              <span className="status-text">Compatibility Engine Active</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-nav-list">
              <li>
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={() => handleQuickLink('Home')}
                >
                  <span>Home</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={() => handleQuickLink('Build Creator')}
                >
                  <span>Build Creator</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={() => handleQuickLink('Components')}
                >
                  <span>Components</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={() => handleQuickLink('Compare')}
                >
                  <span>Compare</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={() => handleQuickLink('Recommendations')}
                >
                  <span>Recommendations</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={() => handleQuickLink('My Builds')}
                >
                  <span>My Builds</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Core Features */}
          <div className="footer-col">
            <h4 className="footer-col-title">Core Features</h4>
            <ul className="footer-nav-list">
              <li>
                <button
                  type="button"
                  className="footer-link-btn feature-link"
                  onClick={() => handleFeatureClick('Compatibility Engine')}
                >
                  <Cpu size={14} className="feature-icon" />
                  <span>Compatibility Engine</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-btn feature-link"
                  onClick={() => handleFeatureClick('Smart Recommendations')}
                >
                  <Sparkles size={14} className="feature-icon" />
                  <span>Smart Recommendations</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-btn feature-link"
                  onClick={() => handleFeatureClick('Component Database')}
                >
                  <Database size={14} className="feature-icon" />
                  <span>Component Database</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-btn feature-link"
                  onClick={() => handleFeatureClick('Build Sharing')}
                >
                  <Share2 size={14} className="feature-icon" />
                  <span>Build Sharing</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-btn feature-link"
                  onClick={() => handleFeatureClick('Power Estimation')}
                >
                  <Zap size={14} className="feature-icon" />
                  <span>Power Estimation</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-btn feature-link"
                  onClick={() => handleFeatureClick('Side-by-Side Comparison')}
                >
                  <GitCompare size={14} className="feature-icon" />
                  <span>Side-by-Side Comparison</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div className="footer-col">
            <h4 className="footer-col-title">Connect</h4>
            <ul className="footer-nav-list">
              <li>
                <a
                  href="https://github.com/navneetrsofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-connect-link"
                  title="GitHub Profile — navneetrsofficial"
                >
                  <div className="connect-icon-box">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                      <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                  </div>
                  <div className="connect-text-group">
                    <span className="connect-name">GitHub</span>
                    <span className="connect-subtext">navneetrsofficial</span>
                  </div>
                  <ArrowUpRight size={13} className="connect-arrow" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/navneet-sharma-881b88411"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-connect-link"
                  title="LinkedIn Profile — Navneet Sharma"
                >
                  <div className="connect-icon-box">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </div>
                  <div className="connect-text-group">
                    <span className="connect-name">LinkedIn</span>
                    <span className="connect-subtext">Navneet Sharma</span>
                  </div>
                  <ArrowUpRight size={13} className="connect-arrow" />
                </a>
              </li>
              <li>
                <a
                  href="mailto:navneetrs.official@gmail.com?subject=Inquiry%20regarding%20PcLoom"
                  className="footer-connect-link footer-email-link"
                  title="Send Email to navneetrs.official@gmail.com"
                >
                  <div className="connect-icon-box">
                    <Mail size={15} />
                  </div>
                  <div className="connect-text-group">
                    <span className="connect-name">Email</span>
                    <span className="connect-subtext">navneetrs.official@gmail.com</span>
                  </div>
                  <ArrowUpRight size={13} className="connect-arrow" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Engineering Metrics & Creator Attributions */}
        <div className="footer-bottom-bar">
          <div className="footer-metrics-strip">
            <span>80+ Components</span>
            <span className="metric-dot">•</span>
            <span>13 Compatibility Rules</span>
            <span className="metric-dot">•</span>
            <span>Smart Recommendations</span>
          </div>

          <div className="footer-copyright">
            <span>© 2026 PcLoom. All Rights Reserved. Built by Navneet Sharma.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
