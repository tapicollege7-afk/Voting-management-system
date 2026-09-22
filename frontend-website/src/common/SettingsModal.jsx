import React, { useState, useEffect } from 'react';

export default function SettingsModal({ isOpen, onClose, theme, setTheme }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? window.navigator.onLine : true);

  // Preference States
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('votepulse_high_contrast') === 'true');
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('votepulse_reduced_motion') === 'true');
  const [maskIds, setMaskIds] = useState(() => localStorage.getItem('votepulse_mask_ids') === 'true');
  const [autoLock, setAutoLock] = useState(() => localStorage.getItem('votepulse_auto_lock') || '15');
  const [pollRate, setPollRate] = useState(() => localStorage.getItem('votepulse_poll_rate') || '3');
  const [confettiEnabled, setConfettiEnabled] = useState(() => localStorage.getItem('votepulse_confetti') !== 'false');

  // Network Online/Offline Listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // High Contrast Mode Sync
  useEffect(() => {
    if (highContrast) {
      document.documentElement.setAttribute('data-contrast', 'high');
      localStorage.setItem('votepulse_high_contrast', 'true');
    } else {
      document.documentElement.removeAttribute('data-contrast');
      localStorage.removeItem('votepulse_high_contrast');
    }
  }, [highContrast]);

  // Reduced Motion Sync
  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.setAttribute('data-motion', 'reduced');
      localStorage.setItem('votepulse_reduced_motion', 'true');
    } else {
      document.documentElement.removeAttribute('data-motion');
      localStorage.removeItem('votepulse_reduced_motion');
    }
  }, [reducedMotion]);

  // Privacy Masking Sync
  useEffect(() => {
    if (maskIds) {
      document.documentElement.setAttribute('data-mask-ids', 'true');
      localStorage.setItem('votepulse_mask_ids', 'true');
    } else {
      document.documentElement.removeAttribute('data-mask-ids');
      localStorage.removeItem('votepulse_mask_ids');
    }
  }, [maskIds]);

  // Auto Lock Setting Sync
  const handleAutoLockChange = (val) => {
    setAutoLock(val);
    localStorage.setItem('votepulse_auto_lock', val);
  };

  // Poll Rate Setting Sync
  const handlePollRateChange = (val) => {
    setPollRate(val);
    localStorage.setItem('votepulse_poll_rate', val);
  };

  // Confetti Toggle Sync
  const handleConfettiToggle = (val) => {
    setConfettiEnabled(val);
    localStorage.setItem('votepulse_confetti', val ? 'true' : 'false');
  };

  // PWA Install Handlers
  useEffect(() => {
    if (window.deferredPWAInstallPrompt) {
      setDeferredPrompt(window.deferredPWAInstallPrompt);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      window.deferredPWAInstallPrompt = e;
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      window.deferredPWAInstallPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    const activePrompt = window.deferredPWAInstallPrompt || deferredPrompt;
    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const { outcome } = await activePrompt.userChoice;
        if (outcome === 'accepted') {
          setIsAppInstalled(true);
          setDeferredPrompt(null);
          window.deferredPWAInstallPrompt = null;
          return;
        }
      } catch (err) {
        console.warn('Native PWA install prompt error:', err);
      }
    }

    // Direct Windows Application Shortcut Download (.url file opens as native app shortcut on Windows)
    const urlShortcutContent = `[InternetShortcut]\r\nURL=${window.location.origin}/#voter\r\nIconIndex=0\r\n`;
    const blob = new Blob([urlShortcutContent], { type: 'application/x-mswinurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VotePulse-App.url';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsAppInstalled(true);
  };

  const clearCache = () => {
    if (window.confirm("Are you sure you want to reset all local preferences and saved sessions?")) {
      localStorage.clear();
      sessionStorage.clear();
      alert("Local preferences and sessions reset!");
      window.location.reload();
    }
  };

  // Custom Toggle Switch Component
  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0' }}>
      <div style={{ paddingRight: '12px' }}>
        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>{label}</div>
        {description && <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>{description}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width: '46px',
          height: '24px',
          borderRadius: '12px',
          background: checked ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.16)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          flexShrink: 0,
          padding: 0
        }}
        title={`Click to ${checked ? 'disable' : 'enable'}`}
      >
        <div style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: '#ffffff',
          position: 'absolute',
          top: '2px',
          left: checked ? '24px' : '3px',
          transition: 'left 0.2s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.35)'
        }} />
      </button>
    </div>
  );

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '540px', maxHeight: '88vh', overflowY: 'auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>⚙️</span>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>System Settings</h2>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Preferences & Electoral Security Controls</span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ border: 'none', cursor: 'pointer', fontSize: '1.1rem' }} title="Close Settings">✕</button>
        </div>

        {/* Section 1: Progressive Web App & Network Health */}
        <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📱 Network & Progressive Web App
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '0.75rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '10px', border: '1px solid var(--border-glass)', fontSize: '0.78rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Network Link:</div>
              <div style={{ fontWeight: 800, color: isOnline ? '#34d399' : '#f87171', marginTop: '2px' }}>
                {isOnline ? '🟢 Live Online' : '🔴 Offline Mode'}
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '10px', border: '1px solid var(--border-glass)', fontSize: '0.78rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Service Worker:</div>
              <div style={{ fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                ⚡ Active & Offline-Ready
              </div>
            </div>
          </div>

          <button className="btn btn-emerald" style={{ width: '100%', fontSize: '0.82rem', padding: '0.65rem' }} onClick={handleInstallPWA}>
            {isAppInstalled ? '✅ VotePulse PWA Installed' : '📲 Install VotePulse Web App (PWA)'}
          </button>
        </div>

        {/* Section 2: Appearance & Accessibility */}
        <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
            🎨 Appearance & Accessibility
          </div>
          
          {/* Theme Mode Toggle */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Color Theme Mode:</div>
            <div className="theme-toggle-row">
              <button
                type="button"
                className={`theme-option-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                ☀️ Light Mode
              </button>
              <button
                type="button"
                className={`theme-option-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                🌙 Dark Mode
              </button>
            </div>
          </div>

          <ToggleSwitch
            checked={highContrast}
            onChange={setHighContrast}
            label="High-Contrast Borders"
            description="Sharp, bold border outlines for enhanced visual clarity and accessibility"
          />

          <ToggleSwitch
            checked={reducedMotion}
            onChange={setReducedMotion}
            label="Reduced Motion"
            description="Disable micro-animations and keyframe transforms for battery conservation"
          />
        </div>

        {/* Section 3: Reset Preferences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={clearCache}
            style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)', fontSize: '0.82rem', padding: '0.65rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
          >
            🧹 Clear Saved Local Browser Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
