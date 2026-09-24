import React from 'react';
import {
  X,
  Bookmark,
  Sparkles,
  ArrowRight,
  Trash2,
  Calendar,
  Layers,
  Cpu,
  Tv
} from 'lucide-react';
import './SavedBuildsModal.css';

export default function SavedBuildsModal({
  isOpen = false,
  onClose = () => {},
  savedBuilds = [],
  onLoadBuild = () => {},
  onImagineBuild = () => {},
  onDeleteBuild = () => {},
  onGoToBuilder = () => {}
}) {
  if (!isOpen) return null;

  return (
    <div className="saved-modal-overlay" onClick={onClose}>
      <div className="saved-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="saved-modal-header">
          <div className="saved-header-left">
            <div className="saved-header-badge">
              <Bookmark size={13} />
              <span>Saved Configurations</span>
            </div>
            <h3 className="saved-modal-title">Your Saved PC Builds</h3>
          </div>

          <button type="button" className="saved-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="saved-modal-body">
          {savedBuilds.length === 0 ? (
            <div className="saved-empty-state">
              <Bookmark size={40} className="empty-bookmark-icon" />
              <h4>No Saved Builds Yet</h4>
              <p>
                Configure your dream PC and click <strong>"Save Build"</strong> inside your cart panel.
                Saved builds can be loaded back into the builder anytime and viewed in the <strong>45° Imagine Visualizer</strong>!
              </p>
              <button
                type="button"
                className="saved-start-btn"
                onClick={() => {
                  onClose();
                  onGoToBuilder();
                }}
              >
                <span>Assemble a Build Now</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="saved-builds-list">
              {savedBuilds.map((b) => {
                const partsCount = Object.values(b.parts || {}).filter(Boolean).length;
                return (
                  <div key={b.id} className="saved-build-card">
                    <div className="saved-card-top">
                      <div className="saved-name-group">
                        <h4 className="saved-build-name">{b.name}</h4>
                        <div className="saved-meta-row">
                          <span className="saved-date">
                            <Calendar size={12} />
                            {b.createdAt || 'Recent Build'}
                          </span>
                          <span className="saved-parts-count">
                            <Layers size={12} />
                            {partsCount} Components
                          </span>
                        </div>
                      </div>

                      <div className="saved-price-group">
                        <span className="saved-price-label">Total Cost</span>
                        <span className="saved-price-num">
                          ₹ {(b.totalPrice || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Quick Hardware Highlights */}
                    <div className="saved-highlights-row">
                      {b.parts?.cpu && (
                        <div className="highlight-chip">
                          <Cpu size={12} />
                          <span>{b.parts.cpu.name}</span>
                        </div>
                      )}
                      {b.parts?.gpu && (
                        <div className="highlight-chip">
                          <Tv size={12} />
                          <span>{b.parts.gpu.name}</span>
                        </div>
                      )}
                      {b.parts?.ram && (
                        <div className="highlight-chip">
                          <span>{b.parts.ram.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="saved-card-actions">
                      <button
                        type="button"
                        className="saved-load-btn"
                        onClick={() => onLoadBuild(b)}
                      >
                        <span>Load into Builder</span>
                        <ArrowRight size={13} />
                      </button>

                      <button
                        type="button"
                        className="saved-imagine-btn"
                        onClick={() => onImagineBuild(b)}
                      >
                        <Sparkles size={13} />
                        <span>Imagine (45° View)</span>
                      </button>

                      <button
                        type="button"
                        className="saved-delete-btn"
                        onClick={() => onDeleteBuild(b.id)}
                        title="Delete saved build"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
