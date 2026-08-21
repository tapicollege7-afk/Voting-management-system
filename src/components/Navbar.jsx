import React from 'react';

export default function Navbar({ currentRoute, navigateTo, onOpenSettings }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand">
          <div className="brand-icon">🗳️</div>
          <div>
            <div className="brand-title">VotePulse</div>
            <div className="brand-subtitle">Secure Online Voting Platform</div>
          </div>
          {currentRoute === 'voter' && <span className="brand-badge">Voter Access</span>}
          {currentRoute === 'admin' && <span className="brand-badge" style={{ background: 'rgba(217, 119, 6, 0.2)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}>Admin Portal</span>}
          {currentRoute === 'audit' && <span className="brand-badge" style={{ background: 'rgba(37, 99, 235, 0.2)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.4)' }}>Audit Portal</span>}
        </div>

        <div className="header-nav">
          <button className="icon-btn" onClick={onOpenSettings} title="System Settings">
            ⚙️
          </button>
        </div>
      </div>
    </header>
  );
}
