import React, { useState, useRef, useEffect } from 'react';
import { FastForward, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import './HeroSection.css';

export default function HeroSection({
  onStartBuilding = () => {},
  onExploreCatalog = () => {},
  onOpenCompare = () => {},
  onSearch = () => {},
  theme = 'dark',
  onToggleTheme = () => {},
  currentUser = null,
  onOpenAuth = () => {}
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Pre-decode the hero backdrop image into GPU memory during playback
    const backdropImg = new Image();
    backdropImg.src = '/images/hero-bg.jpg';
    if (backdropImg.decode) {
      backdropImg.decode().catch(() => {});
    }

    const video = videoRef.current;
    if (!video) return;

    // Reset and enable audio
    video.currentTime = 0;
    video.muted = false;

    const startPlay = async () => {
      try {
        // Attempt unmuted playback with original audio
        video.muted = false;
        await video.play();
        setIsPlaying(true);
        setIsMuted(false);
      } catch (err) {
        console.warn('Browser autoplay policy restricted unmuted audio. Starting muted with interactive unmute fallback:', err);
        try {
          // If browser restricts unmuted autoplay, start muted so video doesn't stall
          video.muted = true;
          await video.play();
          setIsPlaying(true);
          setIsMuted(true);
        } catch (mutedErr) {
          console.warn('Autoplay blocked completely by browser:', mutedErr);
          setIsPlaying(false);
          setIsIntroComplete(true);
        }
      }
    };

    startPlay();

    // Browser policy fallback: automatically unmute on the very first user interaction
    const handleFirstUserInteraction = () => {
      if (video && video.muted) {
        video.muted = false;
        setIsMuted(false);
      }
      window.removeEventListener('pointerdown', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
    };

    window.addEventListener('pointerdown', handleFirstUserInteraction, { once: true });
    window.addEventListener('keydown', handleFirstUserInteraction, { once: true });

    const handleTimeUpdate = () => {
      // Seamlessly trigger handover at ~4.74s before the video unloads
      if (video.duration && video.currentTime >= video.duration - 0.05) {
        video.pause();
        setIsPlaying(false);
        setIsIntroComplete(true);
      }
    };

    const handleEnded = () => {
      video.pause();
      setIsPlaying(false);
      setIsIntroComplete(true);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      window.removeEventListener('pointerdown', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
    };
  }, []);

  const toggleMute = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleReplayIntro = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.muted = false;
      setIsMuted(false);
      video.play().catch(() => {});
    }
    setIsIntroComplete(false);
    setIsPlaying(true);
  };

  const handleSkipIntro = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
    setIsPlaying(false);
    setIsIntroComplete(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <section className="hero-viewport-section" id="hero">
      {/* 
        LAYER 1 (Base Layer - Always Rendered):
        100% Crisp download.jpeg Backdrop & Interactive Elements.
        Always painted in VRAM underneath, eliminating any repaint blink or blank frames!
      */}
      <div
        className={`hero-stage-16-9 ${
          isIntroComplete ? 'stage-interactive' : 'stage-inert'
        }`}
      >
        {/* Logo Hitbox */}
        <a
          href="#hero"
          className="hitbox-item hitbox-logo"
          title="PcLoom Home (Replay Intro)"
          onClick={(e) => {
            e.preventDefault();
            handleReplayIntro();
          }}
        />

        {/* Nav Links Hitboxes */}
        <a
          href="#hero"
          className="hitbox-item hitbox-nav-home"
          title="Home (Replay Intro)"
          onClick={(e) => {
            e.preventDefault();
            handleReplayIntro();
          }}
        />
        <button
          type="button"
          className="hitbox-item hitbox-nav-build"
          title="Build Creator"
          onClick={onStartBuilding}
        />
        <button
          type="button"
          className="hitbox-item hitbox-nav-compare"
          title="Compare Components"
          onClick={onOpenCompare}
        />
        <button
          type="button"
          className="hitbox-item hitbox-nav-catalog"
          title="Components Catalog"
          onClick={onExploreCatalog}
        />
        <button
          type="button"
          className="hitbox-item hitbox-nav-recommend"
          title="Recommendations"
          onClick={onStartBuilding}
        />

        {/* Working Search Form Hitbox */}
        <form className="hitbox-search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="hero-live-search-input"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* User Profile Hitbox */}
        <button
          type="button"
          id="hero-user-auth"
          className="hitbox-item hitbox-user"
          title={currentUser ? `Account: ${currentUser.name || currentUser.email}` : "Sign In / Register"}
          onClick={onOpenAuth}
        />

        {/* Theme Toggle Hitbox */}
        <button
          type="button"
          id="hero-theme-toggle"
          className={`hitbox-item hitbox-moon ${theme === 'light' ? 'is-light' : 'is-dark'}`}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          onClick={onToggleTheme}
        >
          {theme === 'light' && (
            <Sun size={17} className="hero-theme-glyph sun-glyph" />
          )}
        </button>

        {/* Primary Action Button: 'Start Building ->' */}
        <button
          id="hero-start-building"
          className="hitbox-action-btn hitbox-start-building"
          title="Start Building Custom PC"
          onClick={onStartBuilding}
        >
          <span className="hitbox-hover-sheen" />
        </button>

        {/* Secondary Action Button: 'Explore Components' */}
        <button
          id="hero-explore-components"
          className="hitbox-action-btn hitbox-explore-components"
          title="Explore Verified Hardware Components"
          onClick={onExploreCatalog}
        >
          <span className="hitbox-hover-sheen" />
        </button>
      </div>

      {/* 
        LAYER 2 (Video Top Layer):
        Plays on top of Layer 1. When video ends, smoothly fades out to Layer 1
        with 0ms black-frame delay and zero blink!
      */}
      <div
        className={`hero-video-wrapper ${
          isIntroComplete ? 'video-faded-out' : 'video-playing'
        }`}
      >
        <video
          ref={videoRef}
          className="hero-cinematic-video"
          src="/videos/main1.mp4"
          playsInline
          preload="auto"
        />

        {!isIntroComplete && isPlaying && (
          <div className="hero-top-controls">
            <button
              type="button"
              className={`hero-control-pill-btn ${isMuted ? 'audio-alert' : ''}`}
              onClick={toggleMute}
              title={isMuted ? 'Unmute Original Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              <span>{isMuted ? 'Unmute Sound' : 'Sound On'}</span>
            </button>

            <button
              type="button"
              className="hero-control-pill-btn"
              onClick={handleSkipIntro}
              title="Skip intro animation"
            >
              <span>Skip Intro</span>
              <FastForward size={13} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
