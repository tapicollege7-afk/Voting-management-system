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
        <div class="hero-badge">🔒 End-to-End Encrypted & Authenticated Voting</div>
        <h1 class="hero-title">Online Voting & Election Management System</h1>
        <p class="hero-description">
          A multi-portal e-Voting engine featuring real-time 6-digit OTP verification, strict server-side single-vote enforcement, live election analytics, and role-based administration.
        </p>
      </section>

      {/* Portal Gateway Cards */}
      <section class="portal-grid">
        {/* Voter App Card */}
        <div class="portal-card">
          <div>
            <div class="card-icon">🗳️</div>
            <h2 class="card-title">Voter Portal</h2>
            <p class="card-desc">For registered voters to cast secure, single-instance votes with real-time OTP authentication.</p>
            <ul class="feature-list">
              <li>Secure Voter Login & Registration</li>
              <li>Real-Time 6-Digit OTP Verification</li>
              <li>Interactive Digital Ballot & Candidate Profiles</li>
              <li>Strict Duplicate-Vote Protection ("Already Voted" Screen)</li>
            </ul>
          </div>
          <button class="btn btn-emerald" onClick={() => navigateTo('voter')}>
            Open Voter App &rarr;
          </button>
        </div>

        {/* Admin Dashboard Card */}
        <div class="portal-card">
          <div>
            <div class="card-icon">⚡</div>
            <h2 class="card-title">Admin Dashboard</h2>
            <p class="card-desc">For election commissioners to manage polls, candidates, voters, and real-time tallying.</p>
            <ul class="feature-list">
              <li>Election Creation & Status Control</li>
              <li>Candidate & Voter Directory Management</li>
              <li>Real-Time Vote Counting & Analytics</li>
              <li>Exportable Election Result Reports</li>
            </ul>
          </div>
          <button class="btn btn-primary" onClick={() => navigateTo('admin')}>
            Open Admin Dashboard &rarr;
          </button>
        </div>

        {/* System Settings & PWA Card */}
        <div class="portal-card">
          <div>
            <div class="card-icon">⚙️</div>
            <h2 class="card-title">Preferences & Mobile App</h2>
            <p class="card-desc">Customize system theme, text scaling, audio alerts, and install mobile app.</p>
            <ul class="feature-list">
              <li>Light Mode ☀️ & Dark Mode 🌙 System Switch</li>
              <li>Audio Chimes & Push Notification Preferences</li>
              <li>Text Font Scale Settings (100% to 130%)</li>
              <li>Installable Mobile App & Desktop PWA</li>
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
