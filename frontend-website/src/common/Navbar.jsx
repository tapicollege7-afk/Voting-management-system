import React, { useState, useEffect, useRef } from 'react';
import { handleEnterKeyNavigation } from '../helpers/formNavigation';

export default function Navbar({ currentRoute, navigateTo, onOpenSettings }) {
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [adminIdInput, setAdminIdInput] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
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

  // Keyboard Shortcuts (Alt+1 = Voter, Alt+2 = Candidate, Alt+3 = Admin, Alt+4 = Audit, Alt+S = Settings)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey) {
        if (e.key === '1') { e.preventDefault(); navigateTo('voter'); }
        if (e.key === '2') { e.preventDefault(); navigateTo('candidate'); }
        if (e.key === '3') { e.preventDefault(); navigateTo('admin'); }
        if (e.key === '4') { e.preventDefault(); navigateTo('audit'); }
        if (e.key === 's' || e.key === 'S') { e.preventDefault(); onOpenSettings(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateTo, onOpenSettings]);

  // Reactive quick access
  const handleVoterAccessClick = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      if (currentRoute === 'admin') {
        navigateTo('voter');
      } else {
        navigateTo('admin');
      }
      setIsRedirecting(false);
    }, 280);
  };

  // Secret admin submit
  const handleSecretAdminSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const enteredId = adminIdInput.trim();
    const enteredPass = adminPassInput.trim();

    if (!enteredId) {
      setErrorMsg('Please enter an Administrator ID.');
      return;
    }
    if (!enteredId.toUpperCase().startsWith('ADM')) {
      setErrorMsg('Admin IDs must begin with ADM (e.g. ADM-9999).');
      return;
    }
    if (enteredPass !== 'admin123' && enteredPass !== 'voter123') {
      setErrorMsg('Incorrect administrative security password.');
      return;
    }

    const adminSession = {
      id: enteredId.toUpperCase(),
      role: 'admin',
      loginTime: new Date().toISOString()
    };
    sessionStorage.setItem('votepulse_admin', JSON.stringify(adminSession));
    setShowSecretModal(false);
    setAdminIdInput('');
    setAdminPassInput('');
    navigateTo('admin');
  };

  return (
    <>
      <header className="app-header navbar-glass no-print">
        <div className="header-container navbar-container">
          <div
            className="brand"
            onClick={handleLogoClick}
            title="VotePulse Platform (Triple click for Master Admin Gate)"
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            <div className="brand-logo">VP</div>
            <div>
              <div className="brand-title">VotePulse</div>
              <div className="brand-subtitle">Secure Online Voting Platform</div>
            </div>
          </div>

          <div className="header-nav" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Module Selector Navigation Pills */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <button
                className={`nav-pill ${currentRoute === 'voter' ? 'active' : ''}`}
                onClick={() => navigateTo('voter')}
                title="Voter Portal (Shortcut: Alt+1)"
                style={{
                  padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '0.82rem', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.25s ease',
                  background: currentRoute === 'voter' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                  color: currentRoute === 'voter' ? '#ffffff' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: '5px'
                }}
              >
                <span>🗳️ Voter</span>
                <span className="shortcut-pill" style={{ opacity: currentRoute === 'voter' ? 0.9 : 0.6, fontSize: '0.65rem', padding: '1px 5px' }}>Alt+1</span>
              </button>

              <button
                className={`nav-pill ${currentRoute === 'candidate' ? 'active' : ''}`}
                onClick={() => navigateTo('candidate')}
                title="Candidate Portal (Shortcut: Alt+2)"
                style={{
                  padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '0.82rem', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.25s ease',
                  background: currentRoute === 'candidate' ? 'linear-gradient(135deg, #06b6d4, #0284c7)' : 'transparent',
                  color: currentRoute === 'candidate' ? '#ffffff' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: '5px'
                }}
              >
                <span>👤 Candidate</span>
                <span className="shortcut-pill" style={{ opacity: currentRoute === 'candidate' ? 0.9 : 0.6, fontSize: '0.65rem', padding: '1px 5px' }}>Alt+2</span>
              </button>

              <button
                className={`nav-pill ${currentRoute === 'admin' ? 'active' : ''}`}
                onClick={() => navigateTo('admin')}
                title="Admin Console (Shortcut: Alt+3)"
                style={{
                  padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '0.82rem', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.25s ease',
                  background: currentRoute === 'admin' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
                  color: currentRoute === 'admin' ? '#ffffff' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: '5px'
                }}
              >
                <span>🛡️ Admin</span>
                <span className="shortcut-pill" style={{ opacity: currentRoute === 'admin' ? 0.9 : 0.6, fontSize: '0.65rem', padding: '1px 5px' }}>Alt+3</span>
              </button>

              <button
                className={`nav-pill ${currentRoute === 'audit' ? 'active' : ''}`}
                onClick={() => navigateTo('audit')}
                title="Ballot Audit Tool (Shortcut: Alt+4)"
                style={{
                  padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '0.82rem', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.25s ease',
                  background: currentRoute === 'audit' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                  color: currentRoute === 'audit' ? '#ffffff' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: '5px'
                }}
              >
                <span>🔍 Audit</span>
                <span className="shortcut-pill" style={{ opacity: currentRoute === 'audit' ? 0.9 : 0.6, fontSize: '0.65rem', padding: '1px 5px' }}>Alt+4</span>
              </button>
            </div>

            {/* Reactive VOTER / ADMIN QUICK TOGGLE BUTTON */}
            <button
              className="btn-voter-access-reactive"
              onClick={handleVoterAccessClick}
              title={currentRoute === 'admin' ? "Click to Switch to Voter Portal" : "Click to Switch to Admin Module"}
            >
              <span className="voter-access-pulse"></span>
              <span style={{ fontSize: '0.9rem' }}>{currentRoute === 'admin' ? '🗳️' : '⚡'}</span>
              <span>{isRedirecting ? 'SWITCHING...' : (currentRoute === 'admin' ? 'VOTER PORTAL' : 'QUICK ADMIN')}</span>
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
          <div className="modal-content glass-panel" style={{ maxWidth: '420px', textAlign: 'center', padding: '2rem', border: '1px solid rgba(245, 158, 11, 0.4)', position: 'relative' }}>
            {/* Top Cancel Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-6px' }}>
              <button
                type="button"
                onClick={() => setShowSecretModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-muted)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                title="Cancel / Close"
              >
                ✕
              </button>
            </div>
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

            <form onSubmit={handleSecretLogin} onKeyDown={handleEnterKeyNavigation}>
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
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    className="form-input"
                    type={showAdminPassword ? "text" : "password"}
                    placeholder="Administrator Passcode"
                    maxLength={50}
                    value={adminPassInput}
                    onChange={e => setAdminPassInput(e.target.value)}
                    style={{ paddingRight: '2.8rem' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '0 4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      userSelect: 'none',
                      zIndex: 2
                    }}
                    title={showAdminPassword ? "Hide Password" : "Show Password"}
                  >
                    {showAdminPassword ? '👁️' : '🙈'}
                  </button>
                </div>
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
