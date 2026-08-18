import React, { useEffect, useState } from 'react';

export default function HubGateway({ navigateTo, onOpenSettings }) {
  const [stats, setStats] = useState({
    total_voters: 0,
    active_elections: 0,
    total_candidates: 0,
    total_votes_cast: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (e) {
      console.warn("Using offline stats display.", e);
    }
  };

  return (
    <div className="main-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-badge">🔒 Real-Time Gmail Verification & Caesar-Cipher Encrypted Voting</div>
        <h1 className="hero-title">Online Voting & Election Management System</h1>
        <p className="hero-description">
          An enterprise e-Voting engine featuring real-time Gmail token authentication, strict server-side single-vote enforcement, and Caesar-Cipher & SHA-256 cryptographic sealing.
        </p>
      </section>

      {/* Portal Gateway Cards (Clean Public Voter Access & Preferences) */}
      <section className="portal-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {/* Voter App Card */}
        <div className="portal-card">
          <div>
            <div className="card-icon">🗳️</div>
            <h2 className="card-title">Voter Portal</h2>
            <p className="card-desc">For registered voters to cast secure, single-instance votes with real-time Gmail email verification.</p>
            <ul className="feature-list">
              <li>Real Gmail Address Verification</li>
              <li>Caesar Cipher & SHA-256 Sealed Receipts</li>
              <li>Interactive Digital Ballot & Candidate Profiles</li>
              <li>Strict Duplicate-Vote Protection ("Already Voted" Screen)</li>
            </ul>
          </div>
          <button className="btn btn-emerald" onClick={() => navigateTo('voter')}>
            Open Voter App &rarr;
          </button>
        </div>

        {/* System Settings Card */}
        <div className="portal-card">
          <div>
            <div className="card-icon">⚙️</div>
            <h2 className="card-title">Preferences & Display Settings</h2>
            <p className="card-desc">Customize system theme, text scaling, and display preferences.</p>
            <ul className="feature-list">
              <li>Light Mode ☀️ & Dark Mode 🌙 System Switch</li>
              <li>Text Font Scale Settings (100% to 130%)</li>
              <li>Responsive Desktop & Mobile Display</li>
              <li>Real-Time Session Management</li>
            </ul>
          </div>
          <button className="btn btn-secondary" onClick={onOpenSettings}>
            ⚙️ Open Settings Menu
          </button>
        </div>
      </section>

      {/* Live System Metrics Section */}
      <section className="stats-section">
        <h2 className="stats-title">Live System Metrics & Performance</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">{stats.total_voters}</div>
            <div className="stat-label">Registered Voters</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.active_elections}</div>
            <div className="stat-label">Active Elections</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.total_candidates}</div>
            <div className="stat-label">Verified Candidates</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.total_votes_cast}</div>
            <div className="stat-label">Total Votes Cast</div>
          </div>
        </div>
      </section>
    </div>
  );
}
