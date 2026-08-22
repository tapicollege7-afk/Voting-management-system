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
        </div>

        <div className="header-nav" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className={`btn ${currentRoute === 'voter' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 1rem', fontSize: '0.84rem' }}
            onClick={() => navigateTo('voter')}
          >
            🗳️ Voter Portal
          </button>

          <button
            className={`btn ${currentRoute === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.84rem',
              background: currentRoute === 'admin' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : undefined,
              color: currentRoute === 'admin' ? '#ffffff' : undefined,
              boxShadow: currentRoute === 'admin' ? '0 4px 15px rgba(245,158,11,0.4)' : undefined,
            }}
            onClick={() => navigateTo('admin')}
          >
            ⚡ Admin Console
          </button>

          <button className="icon-btn" onClick={onOpenSettings} title="System Settings">
            ⚙️
          </button>
        </div>
      </div>
    </header>
  );
}
