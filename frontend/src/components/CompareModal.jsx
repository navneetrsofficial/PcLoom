import React, { useMemo } from 'react';
import { X, Check, Trash2, Plus, Sparkles, Scale } from 'lucide-react';
import './CompareModal.css';

const SPEC_LABEL_MAP = {
  cores: 'Cores',
  threads: 'Threads',
  base_clock_ghz: 'Base Clock (GHz)',
  boost_clock_ghz: 'Boost Clock (GHz)',
  socket: 'Socket Type',
  tdp_w: 'TDP / Draw (W)',
  integrated_graphics: 'iGPU',
  vram_gb: 'VRAM (GB)',
  memory_gb: 'VRAM (GB)',
  chipset: 'Chipset',
  boost_clock_mhz: 'Boost Clock (MHz)',
  length_mm: 'Card Length (mm)',
  form_factor: 'Form Factor',
  memory_type: 'RAM Type',
  memory_slots: 'RAM Slots',
  max_memory_gb: 'Max RAM (GB)',
  capacity_gb: 'Capacity (GB)',
  speed_mhz: 'Speed (MHz)',
  cas_latency: 'CAS Latency (CL)',
  interface: 'Interface Bus',
  read_mb_s: 'Read Speed (MB/s)',
  write_mb_s: 'Write Speed (MB/s)',
  wattage_w: 'Rated Wattage (W)',
  efficiency: '80+ Rating',
  modular: 'Modularity',
  height_mm: 'Cooler Height (mm)',
  type: 'Type / Architecture',
  supported_sockets: 'Supported Sockets',
  max_gpu_length_mm: 'Max GPU Clearance (mm)',
  max_cooler_height_mm: 'Max Cooler Clearance (mm)'
};

export default function CompareModal({
  isOpen,
  onClose,
  compareList = [],
  onRemoveFromCompare = () => {},
  onClearCompare = () => {},
  onSelectComponent = () => {}
}) {
  if (!isOpen) return null;

  // Union of all spec keys present in any compared item
  const allSpecKeys = useMemo(() => {
    const keys = new Set();
    compareList.forEach((item) => {
      const s = item.specs || {};
      Object.keys(s).forEach((k) => {
        if (!['id', 'name', 'brand', 'source_url', 'notes'].includes(k)) {
          keys.add(k);
        }
      });
    });
    return Array.from(keys);
  }, [compareList]);

  return (
    <div className="compare-modal-backdrop" onClick={onClose}>
      <div className="compare-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Compact Header */}
        <div className="compare-modal-header">
          <div className="modal-title-group">
            <span className="modal-badge">
              <Scale size={12} />
              <span>Specification Matrix</span>
            </span>
            <h3 className="modal-title">Hardware Side-by-Side Comparison</h3>
          </div>

          <div className="modal-actions-group">
            {compareList.length > 0 && (
              <button type="button" className="clear-compare-btn" onClick={onClearCompare}>
                <Trash2 size={13} />
                <span>Clear All ({compareList.length})</span>
              </button>
            )}
            <button type="button" className="close-modal-btn" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="compare-modal-body">
          {compareList.length === 0 ? (
            <div className="compare-empty-view">
              <Sparkles size={36} className="sparkle-icon" />
              <h4>No components selected for comparison</h4>
              <p>
                Click "Compare" on any components in the builder or encyclopedia to evaluate their architecture, clock speeds, and thermal envelopes side-by-side.
              </p>
              <button type="button" className="browse-parts-btn" onClick={onClose}>
                Browse Hardware Catalog
              </button>
            </div>
          ) : (
            <div className="comparison-table-wrapper">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th className="spec-label-col sticky-col">Specification</th>
                    {compareList.map((item) => {
                      const p = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
                      const formattedPrice = p < 2000 ? Math.round(p * 85) : Math.round(p);
                      return (
                        <th key={item.id} className="item-header-col">
                          <div className="item-header-card">
                            <button
                              type="button"
                              className="remove-col-btn"
                              onClick={() => onRemoveFromCompare(item.id)}
                              title="Remove from comparison"
                            >
                              <X size={13} />
                            </button>

                            {item.image && (
                              <div className="compare-col-img-box">
                                <img src={item.image} alt={item.name} className="compare-col-img" />
                              </div>
                            )}

                            <span className="col-brand">{item.brand}</span>
                            <h4 className="col-title" title={item.name}>
                              {item.name}
                            </h4>
                            <div className="col-price">
                              ₹ {formattedPrice.toLocaleString('en-IN')}
                            </div>
                            <button
                              type="button"
                              className="col-add-btn"
                              onClick={() => {
                                onSelectComponent(item);
                                onClose();
                              }}
                            >
                              <Plus size={13} />
                              <span>Equip to Build</span>
                            </button>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {/* Category */}
                  <tr>
                    <td className="spec-label-cell sticky-col">Category</td>
                    {compareList.map((item) => (
                      <td key={item.id} className="spec-val-cell uppercase-text">
                        {item.category?.toUpperCase() || 'HARDWARE'}
                      </td>
                    ))}
                  </tr>

                  {/* Brand */}
                  <tr>
                    <td className="spec-label-cell sticky-col">Brand</td>
                    {compareList.map((item) => (
                      <td key={item.id} className="spec-val-cell">
                        {item.brand || '—'}
                      </td>
                    ))}
                  </tr>

                  {/* Dynamic Hardware Specs */}
                  {allSpecKeys.map((key) => {
                    const label = SPEC_LABEL_MAP[key] || key.replace(/_/g, ' ');
                    return (
                      <tr key={key}>
                        <td className="spec-label-cell sticky-col">{label}</td>
                        {compareList.map((item) => {
                          const val = item.specs ? item.specs[key] : null;
                          let displayVal = '—';
                          if (val !== undefined && val !== null && val !== '') {
                            if (typeof val === 'boolean') {
                              displayVal = val ? 'Yes' : 'No';
                            } else {
                              displayVal = String(val);
                            }
                          }
                          return (
                            <td key={item.id} className="spec-val-cell">
                              {displayVal}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
