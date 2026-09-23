import React from 'react';
import { Shield, ExternalLink, Cpu, Terminal, Lock, GitBranch } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="pcloom-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              <div className="footer-logo-hex">
                <Shield size={20} className="shield-icon" />
              </div>
              <span className="footer-brand-title">PCLoom</span>
            </div>
            <p className="footer-brand-tagline">
              Architectural PC Build Configurator backed by a pure-function rule compatibility engine and concurrency-safe atomic inventory reservation.
            </p>
            <div className="footer-social-links">
              <a
                href="https://github.com/navneetrsofficial"
                target="_blank"
                rel="noreferrer"
                className="footer-github-link"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                <span>github.com/navneetrsofficial</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Engineering Highlights */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Engineering Core</h4>
            <ul className="footer-list">
              <li>
                <Cpu size={14} className="list-icon" />
                <span>10+ Rule Compatibility Engine</span>
              </li>
              <li>
                <Lock size={14} className="list-icon" />
                <span>PostgreSQL `SELECT FOR UPDATE` Row Locks</span>
              </li>
              <li>
                <Terminal size={14} className="list-icon" />
                <span>Django REST Framework & Redis / Celery</span>
              </li>
              <li>
                <Shield size={14} className="list-icon" />
                <span>Idempotent Webhook Processing</span>
              </li>
            </ul>
          </div>

          {/* Dataset & Specs */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Dataset Integrity</h4>
            <ul className="footer-list">
              <li><span>80 Verified Components (8 Categories)</span></li>
              <li><span>AM4, AM5 & LGA1700 Socket Parity</span></li>
              <li><span>DDR4 vs DDR5 Pinout Validation</span></li>
              <li><span>Physical Clearance (GPU / Cooler / PSU)</span></li>
              <li><span>Noctua NSPR Thermal Standards</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} PcLoom Configurator. Built with precision for high-performance PC enthusiasts.</p>
          <div className="footer-bottom-badge">
            <span className="dot-green" />
            <span>All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
