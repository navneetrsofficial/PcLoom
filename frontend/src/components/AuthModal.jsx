import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, CheckCircle, ShieldCheck } from 'lucide-react';
import { loginUser, registerUser } from '../services/api';
import './AuthModal.css';

export default function AuthModal({
  isOpen = false,
  onClose = () => {},
  onAuthSuccess = () => {},
  showNotification = () => {},
  initialTab = 'register' // 'login' or 'register'
}) {
  const [tab, setTab] = useState(initialTab); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (tab === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        const res = await registerUser({ name: name.trim(), email: email.trim(), password });
        showNotification(`Welcome to PcLoom, ${res.user.name || res.user.email}! Account created.`);
        onAuthSuccess(res.user);
        onClose();
      } catch (err) {
        setError(err.message || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Login
      if (!email.trim()) {
        setError('Please enter your email.');
        return;
      }
      if (!password) {
        setError('Please enter your password.');
        return;
      }

      setLoading(true);
      try {
        const res = await loginUser({ email: email.trim(), password });
        showNotification(`Welcome back, ${res.user.name || res.user.email}!`);
        onAuthSuccess(res.user);
        onClose();
      } catch (err) {
        setError(err.message || 'Invalid email or password.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          className="auth-close-btn"
          onClick={onClose}
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="auth-modal-header">
          <div className="auth-header-icon-wrap">
            <ShieldCheck size={28} className="auth-header-shield" />
          </div>
          <h2 className="auth-modal-title">
            {tab === 'register' ? 'Create Your Account' : 'Sign In to PcLoom'}
          </h2>
          <p className="auth-modal-subtitle">
            {tab === 'register'
              ? 'Join our community of builders, track custom orders & save rigs.'
              : 'Access your saved PC builds, telemetry, and order history.'}
          </p>
        </div>

        {/* Tabs: Sign In / Create Account */}
        <div className="auth-tabs-row">
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'register' ? 'tab-active' : ''}`}
            onClick={() => {
              setTab('register');
              setError(null);
            }}
          >
            <UserPlus size={15} />
            <span>Create Account</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'login' ? 'tab-active' : ''}`}
            onClick={() => {
              setTab('login');
              setError(null);
            }}
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-error-banner">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form-body">
          {tab === 'register' && (
            <div className="auth-input-group">
              <label className="auth-input-label">Full Name</label>
              <div className="auth-input-wrapper">
                <User size={16} className="auth-field-icon" />
                <input
                  type="text"
                  className="auth-text-input"
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-input-group">
            <label className="auth-input-label">Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={16} className="auth-field-icon" />
              <input
                type="email"
                className="auth-text-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-input-label">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-field-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-text-input"
                placeholder={tab === 'register' ? 'Minimum 6 characters' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {tab === 'register' && (
            <div className="auth-input-group">
              <label className="auth-input-label">Confirm Password</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-field-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-text-input"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner-label">Processing...</span>
            ) : tab === 'register' ? (
              <>
                <UserPlus size={16} />
                <span>Create Account</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="auth-modal-footer">
          {tab === 'register' ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => {
                  setTab('login');
                  setError(null);
                }}
              >
                Sign In here
              </button>
            </p>
          ) : (
            <p>
              New to PcLoom?{' '}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => {
                  setTab('register');
                  setError(null);
                }}
              >
                Create an account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
