import React from 'react';

export default function Navbar({ currentRoute, navigateTo, onOpenSettings }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand" onClick={() => navigateTo('hub')}>
          <div className="brand-icon">🗳️</div>
          <div>
            <div className="brand-title">VotePulse</div>
            <div className="brand-subtitle">Secure Online Voting Platform</div>
          </div>
          {currentRoute === 'voter' && <span className="brand-badge">Voter Module</span>}
          {currentRoute === 'admin' && <span className="brand-badge" style={{ background: '#d97706' }}>Admin Console</span>}
          {currentRoute === 'audit' && <span className="brand-badge" style={{ background: '#2563eb' }}>Audit Tool</span>}
        </div>

        <div className="header-nav">
          {currentRoute !== 'hub' && (
            <button className="btn btn-secondary" onClick={() => navigateTo('hub')} style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}>
              🏠 Home
            </button>
          )}
          <button className="icon-btn" onClick={onOpenSettings} title="System Settings">
            ⚙️
          </button>
        </div>
      </div>
    </header>
  );
}
