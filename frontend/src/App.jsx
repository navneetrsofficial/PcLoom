import React, { useState, useEffect, useMemo } from 'react';
import HeroSection from './components/HeroSection';
import DashboardNavbar from './components/DashboardNavbar';
import DashboardSidebar from './components/DashboardSidebar';
import BuildWorkspace from './components/BuildWorkspace';
import HardwareEncyclopedia from './components/HardwareEncyclopedia';
import RecommendationsPage from './components/RecommendationsPage';
import ProfilePage from './components/ProfilePage';
import PopularBuilds from './components/PopularBuilds';
import CurrentBuildDrawer from './components/CurrentBuildDrawer';
import SavedBuildsModal from './components/SavedBuildsModal';
import ImagineVisualizerModal from './components/ImagineVisualizerModal';
import CompareModal from './components/CompareModal';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { PRODUCTS_BY_CATEGORY } from './data/dashboardData';
import {
  createSavedBuild,
  fetchSavedBuilds,
  deleteSavedBuild as apiDeleteBuild,
  checkCompatibility,
  fetchCurrentUser,
  getStoredAuth,
  clearStoredAuth
} from './services/api';
import './App.css';

export default function App() {
  // Pre-seed with AMD Ryzen 7 7800X3D + RTX 4070 SUPER build matching user's image
  const [build, setBuild] = useState({
    cpu: PRODUCTS_BY_CATEGORY.cpu[0], // AMD Ryzen 7 7800X3D
    gpu: [
      {
        id: 'gpu-custom-4070s',
        category: 'gpu',
        brand: 'NVIDIA',
        name: 'NVIDIA RTX 4070 SUPER',
        price: 59999,
        quantity: 1,
        image: '/images/gpu_thumb.jpg',
        specs: { memory_gb: 12, memory_type: 'GDDR6X', tdp_w: 220, length_mm: 242 }
      }
    ],
    motherboard: {
      id: 'mb-custom-b650',
      category: 'motherboard',
      brand: 'MSI',
      name: 'MSI B650 Gaming Plus WiFi',
      price: 18999,
      quantity: 1,
      image: '/images/mb_thumb.jpg',
      specs: { socket: 'AM5', form_factor: 'ATX', memory_type: 'DDR5' }
    },
    ram: [
      {
        id: 'ram-custom-vengeance',
        category: 'ram',
        brand: 'Corsair',
        name: 'Corsair Vengeance 32GB (16x2)',
        price: 8999,
        quantity: 1,
        image: '/images/ram_thumb.jpg',
        specs: { capacity_gb: 32, type: 'DDR5', speed_mhz: 6000 }
      }
    ],
    storage: [
      {
        id: 'ssd-custom-980pro',
        category: 'storage',
        brand: 'Samsung',
        name: 'Samsung 980 PRO 1TB',
        price: 7999,
        quantity: 1,
        image: '/images/ssd_thumb.jpg',
        specs: { capacity_gb: 1000, interface: 'PCIe 4.0' }
      }
    ],
    psu: {
      id: 'psu-custom-rm850e',
      category: 'psu',
      brand: 'Corsair',
      name: 'Corsair RM850e 850W',
      price: 7499,
      quantity: 1,
      image: '/images/psu_thumb.jpg',
      specs: { wattage_w: 850, efficiency_rating: '80+ Gold' }
    },
    cooler: {
      id: 'clr-custom-ak620',
      category: 'cooler',
      brand: 'DeepCool',
      name: 'DeepCool AK620',
      price: 5499,
      quantity: 1,
      image: '/images/cooler_thumb.jpg',
      specs: { type: 'Dual Tower Air', height_mm: 160 }
    },
    case: {
      id: 'cs-custom-h5flow',
      category: 'case',
      brand: 'NZXT',
      name: 'NZXT H5 Flow',
      price: 7999,
      quantity: 1,
      image: '/images/hero_rig_45.png',
      specs: { form_factor: 'ATX Mid Tower', max_gpu_length_mm: 365, max_cooler_height_mm: 165 }
    }
  });

  // Saved builds system (persisted in localStorage + backend)
  const [savedBuilds, setSavedBuilds] = useState(() => {
    try {
      const stored = localStorage.getItem('pcloom_saved_builds');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      {
        id: 'saved-build-01',
        name: 'AMD 1440p Pure Gaming Rig',
        createdAt: 'Today',
        totalPrice: 151993,
        parts: {
          cpu: PRODUCTS_BY_CATEGORY.cpu[0],
          gpu: { id: 'gpu-01', name: 'NVIDIA RTX 4070 SUPER', price: 59999, brand: 'NVIDIA' },
          ram: { id: 'ram-01', name: 'Corsair Vengeance 32GB (16x2)', price: 8999, brand: 'Corsair' },
          cooler: { id: 'clr-01', name: 'DeepCool AK620', price: 5499, brand: 'DeepCool' },
          case: { id: 'cs-01', name: 'NZXT H5 Flow', price: 7999, brand: 'NZXT' }
        }
      }
    ];
  });

  const [activeNav, setActiveNav] = useState('Build'); // 'Build' (workspace) or 'Components' (encyclopedia)
  const [searchQuery, setSearchQuery] = useState('');
  const [compareList, setCompareList] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSavedBuildsOpen, setIsSavedBuildsOpen] = useState(false);
  const [isImagineOpen, setIsImagineOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedImagineBuildId, setSelectedImagineBuildId] = useState('saved-build-01');
  const [activeNotification, setActiveNotification] = useState(null);
  const [compatReport, setCompatReport] = useState(null);

  // Multi-user authentication state
  const [currentUser, setCurrentUser] = useState(() => getStoredAuth()?.user || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('register');

  useEffect(() => {
    fetchCurrentUser().then((user) => {
      if (user) setCurrentUser(user);
    });
  }, []);

  const handleOpenAuth = (tab = 'register') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    clearStoredAuth();
    setCurrentUser(null);
    showNotification('You have signed out successfully.');
  };

  // Theme state: 'dark' | 'light', persisted in localStorage
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('pcloom_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('pcloom_theme', theme);
    } catch {}
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      showNotification(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} Mode`);
      return next;
    });
  };

  // Sync saved builds to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pcloom_saved_builds', JSON.stringify(savedBuilds));
    } catch (e) {}
  }, [savedBuilds]);

  // Sync saved builds from backend on mount
  useEffect(() => {
    fetchSavedBuilds().then((backendList) => {
      if (backendList && backendList.length > 0) {
        setSavedBuilds((prev) => {
          const ids = new Set(prev.map((b) => b.id));
          const newItems = backendList.filter((b) => !ids.has(b.id));
          return [...prev, ...newItems];
        });
      }
    });
  }, []);

  // Compute total parts count (including multiple items)
  const currentBuildPartsCount = useMemo(() => {
    let count = 0;
    Object.values(build).forEach((val) => {
      if (!val) return;
      if (Array.isArray(val)) count += val.length;
      else count += 1;
    });
    return count;
  }, [build]);

  // Run backend compatibility check on build changes
  useEffect(() => {
    const partIds = [];
    Object.values(build).forEach((val) => {
      if (!val) return;
      if (Array.isArray(val)) {
        val.forEach((item) => item.id && partIds.push(item.id));
      } else if (val.id) {
        partIds.push(val.id);
      }
    });

    if (partIds.length > 0) {
      checkCompatibility(partIds).then((report) => {
        if (report) setCompatReport(report);
      });
    }
  }, [build]);

  const showNotification = (msg) => {
    setActiveNotification(msg);
    setTimeout(() => {
      setActiveNotification((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const scrollToDashboard = () => {
    const el = document.getElementById('dashboard-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Handlers for Hero Section
  const handleStartBuilding = () => {
    setActiveNav('Build');
    showNotification('Launching Active PC Build Workspace...');
    scrollToDashboard();
  };

  const handleExploreCatalog = () => {
    setActiveNav('Components');
    showNotification('Opening Hardware Encyclopedia...');
    scrollToDashboard();
  };

  const handleOpenCompare = () => {
    setIsCompareOpen(true);
  };

  // Add component to active build (supports multi-item for GPU, Storage, RAM)
  const handleAddToBuild = (item) => {
    const isMulti = ['gpu', 'storage', 'ram'].includes(item.category);
    setBuild((prev) => {
      const existing = prev[item.category];
      if (isMulti) {
        if (!existing) {
          return { ...prev, [item.category]: [{ ...item, quantity: 1 }] };
        }
        if (Array.isArray(existing)) {
          const foundIdx = existing.findIndex((e) => e.id === item.id);
          if (foundIdx >= 0) {
            const nextList = [...existing];
            nextList[foundIdx] = {
              ...nextList[foundIdx],
              quantity: (nextList[foundIdx].quantity || 1) + 1
            };
            return { ...prev, [item.category]: nextList };
          }
          return { ...prev, [item.category]: [...existing, { ...item, quantity: 1 }] };
        }
        if (existing.id === item.id) {
          return { ...prev, [item.category]: [{ ...existing, quantity: (existing.quantity || 1) + 1 }] };
        }
        return { ...prev, [item.category]: [existing, { ...item, quantity: 1 }] };
      }
      return { ...prev, [item.category]: { ...item, quantity: 1 } };
    });
    showNotification(`Equipped ${item.name} to Build!`);
  };

  // Remove component from active build
  const handleRemovePart = (category, itemIndex) => {
    setBuild((prev) => {
      const next = { ...prev };
      const val = next[category];
      if (Array.isArray(val)) {
        if (itemIndex !== undefined) {
          const nextArr = val.filter((_, idx) => idx !== itemIndex);
          if (nextArr.length === 0) {
            delete next[category];
          } else {
            next[category] = nextArr;
          }
        } else {
          delete next[category];
        }
      } else {
        delete next[category];
      }
      return next;
    });
    showNotification(`Removed component from build.`);
  };

  // Update item quantity
  const handleUpdateQty = (category, itemIndex, newQty) => {
    if (newQty <= 0) {
      handleRemovePart(category, itemIndex);
      return;
    }
    setBuild((prev) => {
      const next = { ...prev };
      const val = next[category];
      if (Array.isArray(val)) {
        const nextArr = [...val];
        if (nextArr[itemIndex]) {
          nextArr[itemIndex] = { ...nextArr[itemIndex], quantity: newQty };
          next[category] = nextArr;
        }
      } else if (val) {
        next[category] = { ...val, quantity: newQty };
      }
      return next;
    });
  };

  // Clear entire build
  const handleClearBuild = () => {
    setBuild({});
    showNotification('Cleared all components from current build.');
  };

  // Compare Toggle
  const handleToggleCompare = (item) => {
    setCompareList((prev) => {
      const exists = prev.some((c) => c.id === item.id);
      if (exists) {
        showNotification(`Removed ${item.name} from comparison.`);
        return prev.filter((c) => c.id !== item.id);
      } else {
        if (prev.length >= 4) {
          showNotification('You can compare a maximum of 4 components simultaneously.');
          return prev;
        }
        showNotification(`Added ${item.name} to comparison matrix.`);
        return [...prev, item];
      }
    });
  };

  // Save current build to backend & savedBuilds state
  const handleSaveCurrentBuild = async () => {
    if (currentBuildPartsCount === 0) {
      showNotification('Cannot save an empty build! Add components first.');
      return;
    }

    const cpuItem = Array.isArray(build.cpu) ? build.cpu[0] : build.cpu;
    const gpuItem = Array.isArray(build.gpu) ? build.gpu[0] : build.gpu;
    const cpuName = cpuItem?.name?.split(' ')[1] || 'Custom';
    const gpuName = gpuItem?.name?.split(' ')[1] || 'Gaming';
    const buildName = prompt('Enter a name for your custom build:', `${cpuName} ${gpuName} Rig`) || `${cpuName} PC Build`;

    let totalInr = 0;
    Object.values(build).forEach((val) => {
      if (!val) return;
      if (Array.isArray(val)) {
        val.forEach((item) => {
          const p = typeof item?.price === 'number' ? item.price : parseFloat(item?.price) || 0;
          const inr = p < 2000 ? Math.round(p * 85) : Math.round(p);
          totalInr += inr * (item.quantity || 1);
        });
      } else {
        const p = typeof val?.price === 'number' ? val.price : parseFloat(val?.price) || 0;
        const inr = p < 2000 ? Math.round(p * 85) : Math.round(p);
        totalInr += inr * (val.quantity || 1);
      }
    });

    const newSaved = {
      id: `build-${Date.now()}`,
      name: buildName,
      createdAt: 'Just Now',
      totalPrice: totalInr,
      parts: { ...build }
    };

    setSavedBuilds((prev) => [newSaved, ...prev]);
    setSelectedImagineBuildId(newSaved.id);
    showNotification(`Saved "${buildName}" successfully!`);

    // Async sync to Django backend
    createSavedBuild(buildName, build).catch(() => {});
  };

  // Load a saved build into active configurator
  const handleLoadSavedBuild = (savedBuild) => {
    if (savedBuild.parts) {
      setBuild(savedBuild.parts);
      setIsSavedBuildsOpen(false);
      setIsCartOpen(true);
      showNotification(`Loaded "${savedBuild.name}" into Configurator!`);
    }
  };

  // Imagine a specific saved build
  const handleImagineSavedBuild = (savedBuild) => {
    setSelectedImagineBuildId(savedBuild.id);
    setIsSavedBuildsOpen(false);
    setIsImagineOpen(true);
  };

  // Delete a saved build
  const handleDeleteSavedBuild = (id) => {
    setSavedBuilds((prev) => prev.filter((b) => b.id !== id));
    apiDeleteBuild(id).catch(() => {});
    showNotification('Build deleted from saved list.');
  };

  // Share build link
  const handleShareBuild = () => {
    navigator.clipboard.writeText(window.location.href);
    showNotification('Shareable build link copied to clipboard!');
  };

  // Load popular preset
  const handleLoadPreset = (preset) => {
    showNotification(`Loaded "${preset.title}" into Configurator!`);
    scrollToDashboard();
  };

  return (
    <div className="pcloom-app-root" data-theme={theme}>
      {/* Toast Feedback */}
      {activeNotification && (
        <div className="app-toast-notification">
          <span>{activeNotification}</span>
        </div>
      )}

      {/* 1. Pristine 4K Cinematic Hero Section with Audio */}
      <HeroSection
        onStartBuilding={handleStartBuilding}
        onExploreCatalog={handleExploreCatalog}
        onOpenCompare={handleOpenCompare}
        onSearch={(q) => {
          setSearchQuery(q);
          setActiveNav('Components');
          scrollToDashboard();
        }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currentUser={currentUser}
        onOpenAuth={() => handleOpenAuth('register')}
      />

      {/* 2. Main Gaming Dashboard Container */}
      <section className="dashboard-wrapper-section" id="dashboard-section">
        {/* Sticky Top Navbar */}
        <DashboardNavbar
          activeNav={activeNav}
          onNavClick={(item) => {
            if (item === 'Compare') {
              setIsCompareOpen(true);
              return;
            }
            if (item === 'My Builds' || item === 'Saved Builds') {
              setIsSavedBuildsOpen(true);
              return;
            }
            if (item === 'Profile') {
              setActiveNav('Profile');
              scrollToDashboard();
              return;
            }
            setActiveNav(item);
          }}
          cartCount={currentBuildPartsCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenProfile={() => {
            setActiveNav('Profile');
            scrollToDashboard();
          }}
          isSavedBuildsOpen={isSavedBuildsOpen}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          currentUser={currentUser}
          onOpenAuth={() => handleOpenAuth('login')}
          onLogout={handleLogout}
        />

        {/* Main Content Layout: Sidebar + Center Workspace / Encyclopedia */}
        <div className="dashboard-content-layout">
          {/* Left Sidebar */}
          <DashboardSidebar
            activeTab={activeNav}
            onTabChange={(tab) => {
              if (tab === 'Cart') {
                setIsCartOpen(true);
                return;
              }
              if (tab === 'Saved Builds' || tab === 'My Builds') {
                setIsSavedBuildsOpen(true);
                return;
              }
              if (tab === 'Compare') {
                setIsCompareOpen(true);
                return;
              }
              if (tab === 'Profile') {
                setActiveNav('Profile');
                scrollToDashboard();
                return;
              }
              setActiveNav(tab);
            }}
            cartCount={currentBuildPartsCount}
            onOpenImagine={() => setIsImagineOpen(true)}
            onOpenAiRecommendations={() => {
              setActiveNav('Recommendations');
              scrollToDashboard();
            }}
            isSavedBuildsOpen={isSavedBuildsOpen}
          />

          {/* Center Column: Build Workspace, Hardware Encyclopedia, Recommendations, Profile, or My Builds */}
          <main className="dashboard-center-column">
            {activeNav === 'Build' && (
              <>
                <BuildWorkspace
                  build={build}
                  onAddToBuild={handleAddToBuild}
                  onRemoveFromBuild={handleRemovePart}
                  onClearBuild={handleClearBuild}
                  onOpenCart={() => setIsCartOpen(true)}
                  onSaveBuild={handleSaveCurrentBuild}
                  onToggleCompare={handleToggleCompare}
                  compareList={compareList}
                  compatReport={compatReport}
                />

                <PopularBuilds
                  onLoadPreset={handleLoadPreset}
                  onViewAll={() => {
                    setActiveNav('Components');
                    showNotification('Opening Hardware Encyclopedia...');
                  }}
                />
              </>
            )}

            {activeNav === 'Components' && (
              <HardwareEncyclopedia
                onAddToBuild={handleAddToBuild}
                onToggleCompare={handleToggleCompare}
                compareList={compareList}
                build={build}
              />
            )}

            {activeNav === 'Recommendations' && (
              <RecommendationsPage
                build={build}
                onAddToBuild={handleAddToBuild}
                onGoToBuilder={() => {
                  setActiveNav('Build');
                  scrollToDashboard();
                }}
              />
            )}

            {activeNav === 'Profile' && (
              <ProfilePage
                onGoToBuilder={() => {
                  setActiveNav('Build');
                  scrollToDashboard();
                }}
                showNotification={showNotification}
                currentUser={currentUser}
              />
            )}

            {activeNav === 'My Builds' && (
              <div className="inpage-saved-builds-view">
                <div className="inpage-saved-header">
                  <div className="inpage-title-box">
                    <h2 className="inpage-title">My Saved PC Builds</h2>
                    <p className="inpage-subtitle">
                      Access, customize, or load your saved rigs directly into the builder studio.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-inpage-new-build"
                    onClick={() => {
                      setActiveNav('Build');
                      scrollToDashboard();
                    }}
                  >
                    <span>Assemble New Rig</span>
                  </button>
                </div>

                <div className="inpage-saved-grid">
                  {savedBuilds.length === 0 ? (
                    <div className="inpage-empty-box">
                      <p>No custom builds saved yet. Configure components and click "Save Build" to store rigs here!</p>
                      <button
                        type="button"
                        className="btn-inpage-new-build mt-3"
                        onClick={() => {
                          setActiveNav('Build');
                          scrollToDashboard();
                        }}
                      >
                        Start Building Now
                      </button>
                    </div>
                  ) : (
                    savedBuilds.map((b) => (
                      <div key={b.id} className="inpage-build-card">
                        <div className="inpage-card-top">
                          <h4 className="inpage-card-title">{b.name}</h4>
                          <span className="inpage-card-price">
                            ₹ {(b.totalPrice || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="inpage-card-meta">
                          Created: {b.createdAt || 'Recent'} • {Object.values(b.parts || {}).filter(Boolean).length} Components
                        </p>
                        <div className="inpage-card-chips">
                          {b.parts?.cpu && <span className="inpage-chip">{b.parts.cpu.name}</span>}
                          {b.parts?.gpu && (
                            <span className="inpage-chip">
                              {Array.isArray(b.parts.gpu) ? b.parts.gpu[0]?.name : b.parts.gpu?.name}
                            </span>
                          )}
                        </div>
                        <div className="inpage-card-actions">
                          <button
                            type="button"
                            className="btn-card-load"
                            onClick={() => handleLoadSavedBuild(b)}
                          >
                            Load Into Builder
                          </button>
                          <button
                            type="button"
                            className="btn-card-imagine"
                            onClick={() => handleImagineSavedBuild(b)}
                          >
                            Imagine 45° Rig
                          </button>
                          <button
                            type="button"
                            className="btn-card-del"
                            onClick={() => handleDeleteSavedBuild(b.id)}
                            title="Delete Build"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </section>

      {/* Modern Professional SaaS Footer */}
      <Footer
        onNavigate={(tab) => {
          if (tab === 'Home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (tab === 'Compare') {
            setIsCompareOpen(true);
          } else if (tab === 'My Builds') {
            setIsSavedBuildsOpen(true);
          } else {
            setActiveNav(tab);
            scrollToDashboard();
          }
        }}
        onShareBuild={handleShareBuild}
        onOpenCompare={() => setIsCompareOpen(true)}
      />

      {/* 3. Add to Cart / Current Build Slide-in Drawer */}
      <CurrentBuildDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        build={build}
        onRemovePart={handleRemovePart}
        onUpdateQty={handleUpdateQty}
        onClearBuild={handleClearBuild}
        onSaveBuild={handleSaveCurrentBuild}
        onAddToCart={() => showNotification(`Added build with ${currentBuildPartsCount} components to checkout cart!`)}
        onShareBuild={handleShareBuild}
      />

      {/* 4. Saved Builds Modal */}
      <SavedBuildsModal
        isOpen={isSavedBuildsOpen}
        onClose={() => setIsSavedBuildsOpen(false)}
        savedBuilds={savedBuilds}
        onLoadBuild={handleLoadSavedBuild}
        onImagineBuild={handleImagineSavedBuild}
        onDeleteBuild={handleDeleteSavedBuild}
        onGoToBuilder={() => {
          setActiveNav('Build');
          scrollToDashboard();
        }}
      />

      {/* 5. Imagine Build Visualizer for Saved Builds (Dynamic Assembly Preview) */}
      <ImagineVisualizerModal
        isOpen={isImagineOpen}
        onClose={() => setIsImagineOpen(false)}
        savedBuilds={savedBuilds}
        selectedBuildId={selectedImagineBuildId}
        onSelectBuildId={setSelectedImagineBuildId}
        onGoToBuilder={() => {
          setActiveNav('Build');
          scrollToDashboard();
        }}
      />

      {/* 6. Compact Rescaled Hardware Specification Comparison Matrix Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        compareList={compareList}
        onRemoveFromCompare={(id) => {
          setCompareList((prev) => prev.filter((item) => item.id !== id));
        }}
        onClearCompare={() => setCompareList([])}
        onSelectComponent={(item) => handleAddToBuild(item)}
      />

      {/* 7. Sign In & Registration Modal (Amazon-style Multi-User Auth) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        showNotification={showNotification}
        initialTab={authModalTab}
      />
    </div>
  );
}
