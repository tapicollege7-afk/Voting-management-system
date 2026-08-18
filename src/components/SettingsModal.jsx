import React, { useState } from 'react';

export default function SettingsModal({ isOpen, onClose, theme, setTheme, fontScale, setFontScale }) {
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem('votepulse_sound_enabled') !== 'false');
  const [pushEnabled, setPushEnabled] = useState(localStorage.getItem('votepulse_push_enabled') !== 'false');

  if (!isOpen) return null;

  const toggleSound = (val) => {
    setSoundEnabled(val);
    localStorage.setItem('votepulse_sound_enabled', val.toString());
  };

  const togglePush = (val) => {
    setPushEnabled(val);
    localStorage.setItem('votepulse_push_enabled', val.toString());
  };

  const clearCache = () => {
    localStorage.clear();
    alert("Local preferences and sessions reset!");
    window.location.reload();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>⚙️ System Settings</h2>
          <button className="icon-btn" onClick={onClose} style={{ border: 'none' }}>✕</button>
        </div>

        {/* Section 1: Appearance & Theme */}
        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>🎨 Appearance & Display</div>
          <div className="theme-toggle-row">
            <button
              className={`theme-option-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
            >
              ☀️ Light Mode
            </button>
            <button
              className={`theme-option-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              🌙 Dark Mode
            </button>
          </div>
        </div>

        {/* Section 2: Font Scaling */}
        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>🔍 Text Font Scaling</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className={`btn btn-secondary ${fontScale === 1 ? 'btn-primary' : ''}`} style={{ flex: 1, padding: '0.5rem' }} onClick={() => setFontScale(1)}>100%</button>
            <button className={`btn btn-secondary ${fontScale === 1.15 ? 'btn-primary' : ''}`} style={{ flex: 1, padding: '0.5rem' }} onClick={() => setFontScale(1.15)}>115%</button>
            <button className={`btn btn-secondary ${fontScale === 1.3 ? 'btn-primary' : ''}`} style={{ flex: 1, padding: '0.5rem' }} onClick={() => setFontScale(1.3)}>130%</button>
          </div>
        </div>

        {/* Section 3: Audio & Notifications */}
        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>🔔 Audio & Alerts</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem' }}>Sound Chimes</span>
            <input type="checkbox" checked={soundEnabled} onChange={(e) => toggleSound(e.target.checked)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem' }}>Real-Time Push Alerts</span>
            <input type="checkbox" checked={pushEnabled} onChange={(e) => togglePush(e.target.checked)} />
          </div>
        </div>

        {/* Clear Cache */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <button className="btn btn-secondary" style={{ color: 'var(--danger)', fontSize: '0.85rem' }} onClick={clearCache}>
            🗑️ Clear Saved Local Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
