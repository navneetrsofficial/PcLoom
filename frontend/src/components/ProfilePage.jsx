import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Home,
  Briefcase,
  CheckCircle2,
  Bookmark,
  Package,
  CreditCard,
  Sliders,
  Shield,
  Save,
  ArrowRight,
  Clock,
  Sparkles,
  FileText,
  Truck,
  Download,
  Cpu,
  Tv
} from 'lucide-react';
import './ProfilePage.css';

export default function ProfilePage({
  onGoToBuilder = () => {},
  showNotification = () => {}
}) {
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('pcloom_customer_profile');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      fullName: 'Naveen Kumar',
      email: 'naveen.pcbuilder@example.com',
      phone: '+91 98765 43210',
      alternatePhone: '+91 91234 56789',
      addressType: 'Home', // 'Home', 'Work', 'Other'
      addressLine1: 'Plot No. 42, Cyber Gateway Layout, Outer Ring Road',
      addressLine2: 'Apartment 4B, Tower 2, Horizon Residency',
      landmark: 'Near Technopark Gate 3, Opposite EcoWorld',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560103',
      country: 'India',
      deliveryNotes: 'High-value PC hardware shipment. Please call customer 30 minutes before arrival. Leave with security only if security OTP is provided.',
      needGst: true,
      companyName: 'Naveen Digital Tech Labs Pvt Ltd',
      gstin: '29ABCDE1234F1Z5',
      primaryUseCase: 'Gaming & 3D Rendering',
      cpuPlatformPref: 'AMD AM5 (Zen 4 / Zen 5)',
      gpuLineupPref: 'NVIDIA GeForce RTX 40-Series',
      formFactorPreference: 'ATX Mid Tower',
      aestheticPreference: 'Cyberpunk Neon ARGB',
      targetBudget: '₹ 1,50,000 - ₹ 2,00,000',
      experienceLevel: 'Enthusiast Builder'
    };
  });

  const [activeTab, setActiveTab] = useState('account'); // 'account', 'preferences', 'orders'
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (field, val) => {
    setProfile((prev) => ({ ...prev, [field]: val }));
    setIsSaved(false);
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem('pcloom_customer_profile', JSON.stringify(profile));
    } catch (err) {}
    setIsSaved(true);
    showNotification('Customer Profile & Delivery details updated successfully!');
    setTimeout(() => setIsSaved(false), 3200);
  };

  return (
    <div className="profile-page-root">
      {/* 1. Profile Hero Identity Header */}
      <section className="profile-hero-card">
        <div className="profile-avatar-block">
          <div className="avatar-circle">
            <User size={36} />
          </div>
          <div className="profile-name-block">
            <div className="profile-tag-row">
              <span className="profile-verified-badge">
                <Shield size={12} />
                <span>Verified Builder Account</span>
              </span>
              <span className="profile-tier-badge">
                <Sparkles size={11} />
                <span>PcLoom Elite Member</span>
              </span>
            </div>
            <h1 className="profile-name-title">{profile.fullName || 'Customer Profile'}</h1>
            <p className="profile-email-sub">
              {profile.email} • {profile.phone} • {profile.city}, {profile.state}
            </p>
          </div>
        </div>

        <div className="profile-header-actions">
          <button type="button" className="btn-return-studio" onClick={onGoToBuilder}>
            <span>Back to Build Studio</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* 2. Profile Tabs Strip */}
      <div className="profile-tabs-strip">
        <button
          type="button"
          className={`profile-tab-btn ${activeTab === 'account' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          <User size={15} />
          <span>Customer & Delivery Details</span>
        </button>

        <button
          type="button"
          className={`profile-tab-btn ${activeTab === 'preferences' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <Sliders size={15} />
          <span>Hardware & Rig Preferences</span>
        </button>

        <button
          type="button"
          className={`profile-tab-btn ${activeTab === 'orders' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Package size={15} />
          <span>Orders & Live Tracking</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      <div className="profile-content-container">
        {activeTab === 'account' && (
          <form className="profile-form-grid" onSubmit={handleSave}>
            {/* Section 1: Customer Contact Information */}
            <div className="form-card-section">
              <div className="section-title-wrap">
                <h3 className="form-section-title">
                  <User size={16} />
                  <span>Personal Contact Information</span>
                </h3>
                <span className="section-hint">Used for order updates, courier tracking, and verification</span>
              </div>

              <div className="form-fields-grid">
                <div className="field-group">
                  <label className="field-label">Customer Full Name *</label>
                  <div className="field-input-box">
                    <User size={15} className="field-icon" />
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="e.g. Naveen Kumar"
                      required
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Email Address (for invoices & dispatch OTP) *</label>
                  <div className="field-input-box">
                    <Mail size={15} className="field-icon" />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Primary Mobile Number (WhatsApp Updates) *</label>
                  <div className="field-input-box">
                    <Phone size={15} className="field-icon" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Alternate Contact Number (Courier Backup)</label>
                  <div className="field-input-box">
                    <Phone size={15} className="field-icon" />
                    <input
                      type="tel"
                      value={profile.alternatePhone}
                      onChange={(e) => handleChange('alternatePhone', e.target.value)}
                      placeholder="+91 91234 56789"
                      className="field-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Full Delivery & Shipping Address */}
            <div className="form-card-section">
              <div className="section-title-wrap">
                <h3 className="form-section-title">
                  <MapPin size={16} />
                  <span>Default Shipping & Delivery Address</span>
                </h3>
                <span className="section-hint">Hardware is packed in double-cushioned anti-static crates</span>
              </div>

              {/* Address Type Selector */}
              <div className="address-type-selector">
                <label className="field-label">Address Type:</label>
                <div className="address-type-chips">
                  {[
                    { id: 'Home', icon: Home, label: 'Home (All-day Delivery)' },
                    { id: 'Work', icon: Briefcase, label: 'Office / Work (10 AM - 6 PM)' },
                    { id: 'Other', icon: Building, label: 'Other / Studio' }
                  ].map((type) => {
                    const TypeIcon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        className={`type-chip ${profile.addressType === type.id ? 'chip-active' : ''}`}
                        onClick={() => handleChange('addressType', type.id)}
                      >
                        <TypeIcon size={14} />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-fields-grid">
                <div className="field-group full-width-field">
                  <label className="field-label">Street Address / House No. / Area *</label>
                  <div className="field-input-box">
                    <Home size={15} className="field-icon" />
                    <input
                      type="text"
                      value={profile.addressLine1}
                      onChange={(e) => handleChange('addressLine1', e.target.value)}
                      placeholder="e.g. Plot No. 42, Cyber Gateway Layout, Outer Ring Road"
                      required
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Apartment / Suite / Flat & Tower</label>
                  <div className="field-input-box">
                    <Building size={15} className="field-icon" />
                    <input
                      type="text"
                      value={profile.addressLine2}
                      onChange={(e) => handleChange('addressLine2', e.target.value)}
                      placeholder="e.g. Tower B, Flat 402, Horizon Residency"
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Nearby Landmark</label>
                  <div className="field-input-box">
                    <MapPin size={15} className="field-icon" />
                    <input
                      type="text"
                      value={profile.landmark}
                      onChange={(e) => handleChange('landmark', e.target.value)}
                      placeholder="e.g. Near Technopark Gate 3, Opposite EcoWorld"
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">City / Town *</label>
                  <div className="field-input-box">
                    <input
                      type="text"
                      value={profile.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="City"
                      required
                      className="field-input no-icon"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">State / Province *</label>
                  <div className="field-input-box">
                    <input
                      type="text"
                      value={profile.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      placeholder="State"
                      required
                      className="field-input no-icon"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">PIN / Postal Code *</label>
                  <div className="field-input-box">
                    <input
                      type="text"
                      value={profile.pinCode}
                      onChange={(e) => handleChange('pinCode', e.target.value)}
                      placeholder="e.g. 560103"
                      required
                      className="field-input no-icon"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Country *</label>
                  <div className="field-input-box">
                    <input
                      type="text"
                      value={profile.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                      placeholder="Country"
                      required
                      className="field-input no-icon"
                    />
                  </div>
                </div>

                <div className="field-group full-width-field">
                  <label className="field-label">Special Delivery & Handling Instructions for Courier</label>
                  <div className="field-input-box">
                    <textarea
                      rows={2}
                      value={profile.deliveryNotes}
                      onChange={(e) => handleChange('deliveryNotes', e.target.value)}
                      placeholder="e.g. Fragile glass side panel - handle with extreme care. Please call 30 mins before delivery."
                      className="field-textarea"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Business & GST Tax Invoicing */}
            <div className="form-card-section">
              <div className="section-title-wrap">
                <div className="gst-toggle-header">
                  <h3 className="form-section-title">
                    <FileText size={16} />
                    <span>Business & GST Invoicing Details</span>
                  </h3>
                  <label className="gst-toggle-switch">
                    <input
                      type="checkbox"
                      checked={profile.needGst}
                      onChange={(e) => handleChange('needGst', e.target.checked)}
                    />
                    <span className="gst-toggle-text">Claim 18% Input Tax Credit (ITC)</span>
                  </label>
                </div>
                <span className="section-hint">Provide registered business info to receive official GST invoices for tax write-offs</span>
              </div>

              {profile.needGst && (
                <div className="form-fields-grid mt-3">
                  <div className="field-group">
                    <label className="field-label">Registered Legal Business Name *</label>
                    <div className="field-input-box">
                      <Briefcase size={15} className="field-icon" />
                      <input
                        type="text"
                        value={profile.companyName}
                        onChange={(e) => handleChange('companyName', e.target.value)}
                        placeholder="e.g. Naveen Digital Tech Labs Pvt Ltd"
                        className="field-input"
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <label className="field-label">GSTIN (15-Character Tax Number) *</label>
                    <div className="field-input-box">
                      <FileText size={15} className="field-icon" />
                      <input
                        type="text"
                        value={profile.gstin}
                        onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                        placeholder="e.g. 29ABCDE1234F1Z5"
                        maxLength={15}
                        className="field-input"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar: Save Button */}
            <div className="form-submit-row">
              <button type="submit" className="btn-save-profile">
                <Save size={16} />
                <span>Save All Customer Details</span>
              </button>

              {isSaved && (
                <div className="save-confirmed-pill">
                  <CheckCircle2 size={14} />
                  <span>Profile & Delivery Details Saved Successfully</span>
                </div>
              )}
            </div>
          </form>
        )}

        {activeTab === 'preferences' && (
          <div className="profile-preferences-card">
            <div className="section-title-wrap">
              <h3 className="form-section-title">
                <Sliders size={16} />
                <span>Customer Hardware & Build Customization Preferences</span>
              </h3>
              <p className="section-hint">
                PcLoom algorithms prioritize components and compatibility recommendations tuned to your selected preferences.
              </p>
            </div>

            <div className="preferences-options-grid">
              <div className="pref-box">
                <span className="pref-label">Primary Rig Use Case</span>
                <select
                  value={profile.primaryUseCase}
                  onChange={(e) => handleChange('primaryUseCase', e.target.value)}
                  className="pref-select"
                >
                  <option value="Gaming & 3D Rendering">Gaming & 3D Rendering (Ray Tracing, Blender, Unreal Engine)</option>
                  <option value="Competitive Esports">Competitive Esports (High Refresh 240Hz/360Hz CS2, Valorant)</option>
                  <option value="AI & Machine Learning">AI & Machine Learning / Local LLM Workstation</option>
                  <option value="Software Dev & DevOps">Software Engineering & Docker / Virtualization</option>
                  <option value="Audio & Video Production">4K/8K Video Production & DaVinci Resolve</option>
                </select>
              </div>

              <div className="pref-box">
                <span className="pref-label">Preferred CPU Platform</span>
                <select
                  value={profile.cpuPlatformPref}
                  onChange={(e) => handleChange('cpuPlatformPref', e.target.value)}
                  className="pref-select"
                >
                  <option value="AMD AM5 (Zen 4 / Zen 5)">AMD AM5 (Ryzen 7000 / 9000 & 3D V-Cache)</option>
                  <option value="Intel LGA1700 (13th/14th Gen)">Intel LGA1700 (Core i5 / i7 / i9)</option>
                  <option value="No Platform Preference">Neutral / Best Price-to-Performance Ratio</option>
                </select>
              </div>

              <div className="pref-box">
                <span className="pref-label">Preferred GPU Architecture</span>
                <select
                  value={profile.gpuLineupPref}
                  onChange={(e) => handleChange('gpuLineupPref', e.target.value)}
                  className="pref-select"
                >
                  <option value="NVIDIA GeForce RTX 40-Series">NVIDIA GeForce RTX 40-Series (DLSS 3.5, CUDA)</option>
                  <option value="AMD Radeon RX 7000">AMD Radeon RX 7000 (RDNA 3, DisplayPort 2.1)</option>
                  <option value="Any Verified GPU">Any Brand with Best Frame Rates</option>
                </select>
              </div>

              <div className="pref-box">
                <span className="pref-label">Chassis Form Factor</span>
                <select
                  value={profile.formFactorPreference}
                  onChange={(e) => handleChange('formFactorPreference', e.target.value)}
                  className="pref-select"
                >
                  <option value="ATX Mid Tower">ATX Mid Tower (Optimal Airflow, Dual 360mm Rads)</option>
                  <option value="Micro-ATX">Micro-ATX (Compact Desktop Powerhouse)</option>
                  <option value="Mini-ITX SFF">Mini-ITX SFF (Small Form Factor Sandwich/Cube)</option>
                </select>
              </div>

              <div className="pref-box">
                <span className="pref-label">Aesthetic & Lighting Theme</span>
                <select
                  value={profile.aestheticPreference}
                  onChange={(e) => handleChange('aestheticPreference', e.target.value)}
                  className="pref-select"
                >
                  <option value="Cyberpunk Neon ARGB">Cyberpunk Neon ARGB (Vibrant Teal / Magenta)</option>
                  <option value="Stealth Blackout">Stealth Blackout (Zero LEDs, Anodized Metal)</option>
                  <option value="Minimalist Pure White">Minimalist Pure White (Ice White LEDs)</option>
                  <option value="Full Spectrum RGB">Full Spectrum Chroma RGB</option>
                </select>
              </div>

              <div className="pref-box">
                <span className="pref-label">Target Hardware Budget Range</span>
                <input
                  type="text"
                  value={profile.targetBudget}
                  onChange={(e) => handleChange('targetBudget', e.target.value)}
                  className="pref-input"
                  placeholder="e.g. ₹ 1,50,000 - ₹ 2,00,000"
                />
              </div>

              <div className="pref-box">
                <span className="pref-label">PC Building Experience Level</span>
                <select
                  value={profile.experienceLevel}
                  onChange={(e) => handleChange('experienceLevel', e.target.value)}
                  className="pref-select"
                >
                  <option value="First-Time Builder">First-Time Builder (Request Full Assembly Service)</option>
                  <option value="Enthusiast Builder">Enthusiast Builder (DIY Assembly at Home)</option>
                  <option value="Extreme Overclocker">Extreme Overclocker (Custom Loop / High Tuning)</option>
                </select>
              </div>
            </div>

            <div className="form-submit-row mt-4">
              <button type="button" className="btn-save-profile" onClick={handleSave}>
                <Save size={16} />
                <span>Save Hardware Preferences</span>
              </button>

              {isSaved && (
                <div className="save-confirmed-pill">
                  <CheckCircle2 size={14} />
                  <span>Hardware Preferences Updated!</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="profile-orders-container">
            <div className="section-title-wrap">
              <h3 className="form-section-title">
                <Package size={16} />
                <span>Customer Orders & Build Assembly Status</span>
              </h3>
              <p className="section-hint">
                Every custom PC undergoes 24 hours of MemTest86, Cinebench R24, and 3DMark thermal stress tests before dispatch.
              </p>
            </div>

            <div className="orders-cards-stack">
              {/* Order Card 1 */}
              <div className="order-item-card">
                <div className="order-top-strip">
                  <div className="order-id-group">
                    <span className="order-id-num">Order #PCL-98412</span>
                    <span className="order-date-tag">Placed on Sep 22, 2026</span>
                    <span className="order-courier-tag">
                      <Truck size={12} />
                      <span>BlueDart Apex Express: BD83921094IN</span>
                    </span>
                  </div>
                  <span className="order-status-badge status-in-progress">
                    <Clock size={12} />
                    <span>Assembly & 24h Stress Testing</span>
                  </span>
                </div>

                <div className="order-summary-row">
                  <div className="order-details-col">
                    <h4 className="order-rig-name">Custom AMD 1440p Pure Gaming Rig</h4>
                    <p className="order-parts-summary">
                      AMD Ryzen 7 7800X3D • NVIDIA RTX 4070 SUPER • Corsair Vengeance 32GB DDR5-6000 • Samsung 980 PRO 1TB • NZXT H5 Flow • Corsair RM850e
                    </p>
                    <div className="order-destination">
                      <MapPin size={13} />
                      <span>Deliver to: {profile.fullName}, {profile.addressLine1}, {profile.city} - {profile.pinCode}</span>
                    </div>
                  </div>
                  <div className="order-price-col">
                    <span className="order-cost-label">Total Amount Paid</span>
                    <span className="order-cost-num">₹ 1,51,993</span>
                    <button
                      type="button"
                      className="btn-download-invoice"
                      onClick={() => showNotification('Downloading Official GST Tax Invoice for Order #PCL-98412...')}
                    >
                      <Download size={13} />
                      <span>Tax Invoice (PDF)</span>
                    </button>
                  </div>
                </div>

                {/* 4-Stage Visual Progress Bar */}
                <div className="order-tracking-bar">
                  <div className="tracking-step step-done">
                    <span className="step-dot">✓</span>
                    <span className="step-name">Order Confirmed</span>
                    <span className="step-time">Sep 22, 10:14 AM</span>
                  </div>
                  <div className="tracking-step step-done">
                    <span className="step-dot">✓</span>
                    <span className="step-name">Parts Quality Inspected</span>
                    <span className="step-time">Sep 22, 02:40 PM</span>
                  </div>
                  <div className="tracking-step step-active">
                    <span className="step-dot">⚙</span>
                    <span className="step-name">Assembly & Thermal Benchmarking</span>
                    <span className="step-time">In Progress</span>
                  </div>
                  <div className="tracking-step">
                    <span className="step-dot">📦</span>
                    <span className="step-name">Dispatched & Out for Delivery</span>
                    <span className="step-time">Est. Sep 25</span>
                  </div>
                </div>
              </div>

              {/* Order Card 2 (Delivered Reference) */}
              <div className="order-item-card order-completed-card">
                <div className="order-top-strip">
                  <div className="order-id-group">
                    <span className="order-id-num">Order #PCL-77102</span>
                    <span className="order-date-tag">Delivered on Aug 14, 2026</span>
                  </div>
                  <span className="order-status-badge status-delivered">
                    <CheckCircle2 size={12} />
                    <span>Delivered & Verified</span>
                  </span>
                </div>

                <div className="order-summary-row">
                  <div className="order-details-col">
                    <h4 className="order-rig-name">Samsung 980 PRO 2TB NVMe PCIe 4.0 SSD</h4>
                    <p className="order-parts-summary">Single Component Upgrade Order • Standard Sealed Retail Pack</p>
                  </div>
                  <div className="order-price-col">
                    <span className="order-cost-label">Total Amount</span>
                    <span className="order-cost-num">₹ 14,999</span>
                    <button
                      type="button"
                      className="btn-download-invoice"
                      onClick={() => showNotification('Downloading Official GST Tax Invoice for Order #PCL-77102...')}
                    >
                      <Download size={13} />
                      <span>Tax Invoice (PDF)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
