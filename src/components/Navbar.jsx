import React, { useState, useEffect, useRef } from 'react';

export default function Navbar({ currentRoute, navigateTo, onOpenSettings }) {
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [adminIdInput, setAdminIdInput] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [tapCount, setTapCount] = useState(0);
  const lastTapTimeRef = useRef(0);

  // Trigger 1: Secret Triple Click on Brand Logo
  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastTapTimeRef.current < 1200) {
      const newCount = tapCount + 1;
      setTapCount(newCount);
      if (newCount >= 3) {
        setShowSecretModal(true);
        setTapCount(0);
      }
    } else {
      setTapCount(1);
    }
    lastTapTimeRef.current = now;
  };

  // Trigger 2: Secret Keyboard Shortcut (Ctrl + Shift + A or Cmd + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setShowSecretModal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reactive VOTER ACCESS Button Click -> Go directly to Admin Module!
  const handleVoterAccessClick = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 250);
  };

  const handleSecretLogin = (e) => {
    e.preventDefault();
    if (!adminIdInput.trim() || !adminPassInput.trim()) {
      setErrorMsg('Passcode required.');
      return;
    }
    if (adminPassInput === 'admin123' || adminPassInput === 'voter123') {
      setShowSecretModal(false);
      window.location.href = 'admin.html';
    } else {
      setErrorMsg('Invalid Administrator Passcode.');
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="header-container">
          <div
            className="brand"
            onClick={() => navigateTo('voter')}
            style={{ cursor: 'pointer', userSelect: 'none' }}
            title="VotePulse Platform"
          >
            <div
              className="brand-icon"
              onClick={(e) => { e.stopPropagation(); handleLogoClick(); }}
              style={{
                filter: tapCount > 0 ? `drop-shadow(0 0 12px #f59e0b)` : 'none',
                transform: tapCount > 0 ? `scale(${1 + tapCount * 0.1})` : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              title="Secret Logo Gate (Triple-Click)"
            >⚡</div>
            <div>
              <div className="brand-title">VotePulse</div>
              <div className="brand-subtitle">Secure Online Voting Platform</div>
            </div>
          </div>

          <div className="header-nav" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Reactive VOTER ACCESS Button -> Navigates to Admin Module */}
            <button
              className="btn-voter-access-reactive"
              onClick={handleVoterAccessClick}
              title="Click to Switch to Admin Module"
            >
              <span className="voter-access-pulse"></span>
              <span style={{ fontSize: '0.9rem' }}>🛡️</span>
              <span>{isRedirecting ? '⚡ SWITCHING TO ADMIN...' : 'VOTER ACCESS'}</span>
            </button>

            <button className="icon-btn" onClick={onOpenSettings} title="System Settings">
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* ════ secret admin gate modal ════ */}
      {showSecretModal && (
        <div
          className="modal-backdrop"
          onClick={e => { if (e.target === e.currentTarget) setShowSecretModal(false); }}
          style={{ zIndex: 99999, background: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(24px)' }}
        >
          <div className="modal-content glass-panel" style={{ maxWidth: '420px', textAlign: 'center', padding: '2rem', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem', animation: 'floatUp 0.4s ease' }}>🔑</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Secret Administrator Gateway
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '8px 0 1.5rem 0' }}>
              Restricted cryptographic access portal. Enter authorized credentials to proceed.
            </p>

            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.65rem', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '1rem', fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSecretLogin}>
              <div className="form-group">
                <input
                  className="form-input"
                  type="text"
                  placeholder="Administrator ID (e.g. ADM-9999)"
                  value={adminIdInput}
                  onChange={e => setAdminIdInput(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  className="form-input"
                  type="password"
                  placeholder="Passcode"
                  value={adminPassInput}
                  onChange={e => setAdminPassInput(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button className="btn btn-secondary" type="button" onClick={() => setShowSecretModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button className="btn" type="submit" style={{ flex: 1, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', fontWeight: 800 }}>
                  Enter Gate &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
