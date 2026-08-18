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
    <div class="main-container">
      {/* Hero Section */}
      <section class="hero">
        <div class="hero-badge">🔒 Real-Time Gmail Verification & Caesar-Cipher Encrypted Voting</div>
        <h1 class="hero-title">Online Voting & Election Management System</h1>
        <p class="hero-description">
          An enterprise e-Voting engine featuring real-time Gmail token authentication, strict server-side single-vote enforcement, Caesar-Cipher & SHA-256 cryptographic sealing, and public ballot verification.
        </p>
      </section>

      {/* Portal Gateway Cards (Admin Dashboard REMOVED from Central Hub) */}
      <section class="portal-grid">
        {/* Voter App Card */}
        <div class="portal-card">
          <div>
            <div class="card-icon">🗳️</div>
            <h2 class="card-title">Voter Portal</h2>
            <p class="card-desc">For registered voters to cast secure, single-instance votes with real-time Gmail email verification.</p>
            <ul class="feature-list">
              <li>Real Gmail Address Verification</li>
              <li>Caesar Cipher & SHA-256 Sealed Receipts</li>
              <li>Interactive Digital Ballot & Candidate Profiles</li>
              <li>Strict Duplicate-Vote Protection ("Already Voted" Screen)</li>
            </ul>
          </div>
          <button class="btn btn-emerald" onClick={() => navigateTo('voter')}>
            Open Voter App &rarr;
          </button>
        </div>

        {/* Cryptographic Ballot Audit Tool Card (New Feature) */}
        <div class="portal-card">
          <div>
            <div class="card-icon">🔍</div>
            <h2 class="card-title">Cryptographic Ballot Audit</h2>
            <p class="card-desc">Independent public verification tool for voters to audit their encrypted ballot seal.</p>
            <ul class="feature-list">
              <li>Verify Caesar Cipher Shift Hashes</li>
              <li>Inspect SHA-256 Cryptographic Seals</li>
              <li>Confirm Un-Altered Database Vote Records</li>
              <li>Instant Public Transparency & Auditability</li>
            </ul>
          </div>
          <button class="btn btn-primary" onClick={() => navigateTo('audit')}>
            Audit Ballot Hash &rarr;
          </button>
        </div>

        {/* System Settings Card */}
        <div class="portal-card">
          <div>
            <div class="card-icon">⚙️</div>
            <h2 class="card-title">Preferences & Display Settings</h2>
            <p class="card-desc">Customize system theme, text scaling, and display preferences.</p>
            <ul class="feature-list">
              <li>Light Mode ☀️ & Dark Mode 🌙 System Switch</li>
              <li>Text Font Scale Settings (100% to 130%)</li>
              <li>Responsive Desktop & Mobile Display</li>
              <li>Real-Time Session Management</li>
            </ul>
          </div>
          <button class="btn btn-secondary" onClick={onOpenSettings}>
            ⚙️ Open Settings Menu
          </button>
        </div>
      </section>

      {/* Live System Metrics Section */}
      <section class="stats-section">
        <h2 class="stats-title">Live System Metrics & Performance</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{stats.total_voters}</div>
            <div class="stat-label">Registered Voters</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{stats.active_elections}</div>
            <div class="stat-label">Active Elections</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{stats.total_candidates}</div>
            <div class="stat-label">Verified Candidates</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{stats.total_votes_cast}</div>
            <div class="stat-label">Total Votes Cast</div>
          </div>
        </div>
      </section>
    </div>
  );
}
