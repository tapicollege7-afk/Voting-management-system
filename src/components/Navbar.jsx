import React from 'react';

export default function Navbar({ currentRoute, navigateTo, onOpenSettings }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand" onClick={() => navigateTo('voter')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">🗳️</div>
          <div>
            <div className="brand-title">VotePulse</div>
            <div className="brand-subtitle">Secure Online Voting Platform</div>
          </div>
          <span className="brand-badge">Voter Portal</span>
        </div>

        <div className="header-nav" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="icon-btn" onClick={onOpenSettings} title="System Settings">
            ⚙️
          </button>
        </div>
      </div>
    </header>
  );
}
