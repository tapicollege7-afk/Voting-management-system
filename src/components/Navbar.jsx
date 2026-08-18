import React from 'react';

export default function Navbar({ currentRoute, navigateTo, theme, onOpenSettings }) {
  return (
    <header class="app-header">
      <div class="header-container">
        <div class="brand" onClick={() => navigateTo('hub')}>
          <div class="brand-icon">🗳️</div>
          <div>
            <div class="brand-title">VotePulse</div>
            <div class="brand-subtitle">Secure Online Voting Platform</div>
          </div>
          {currentRoute === 'voter' && <span class="brand-badge">Voter Module</span>}
          {currentRoute === 'admin' && <span class="brand-badge" style={{ background: '#d97706' }}>Admin Console</span>}
        </div>

        <div class="header-nav">
          {currentRoute !== 'hub' && (
            <button class="btn btn-secondary" onClick={() => navigateTo('hub')} style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}>
              🏠 Home
            </button>
          )}
          <button class="icon-btn" onClick={onOpenSettings} title="System Settings">
            ⚙️
          </button>
        </div>
      </div>
    </header>
  );
}
