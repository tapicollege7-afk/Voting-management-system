import React, { useState, useEffect } from 'react';

export default function CandidatePortal({ user, setUser }) {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');

  // Candidate Authentication State
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [candKeyInput, setCandKeyInput] = useState('');
  const [candPasswordInput, setCandPasswordInput] = useState('');
  const [candidateUser, setCandidateUser] = useState(null);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regKey, setRegKey] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regElectionId, setRegElectionId] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regManifesto, setRegManifesto] = useState('');

  // Manifesto & Campaign Command State
  const [manifestoText, setManifestoText] = useState('');
  const [campaignSlogan, setCampaignSlogan] = useState('');
  const [candParty, setCandParty] = useState('');
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'Campus Infrastructure Plan Launched', date: '2026-08-28', content: 'Our team released the 5-point plan for digital labs & library extension.' }
  ]);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');

  const [alertMsg, setAlertMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'manifesto', 'announcements', 'badge'

  useEffect(() => {
    fetchElections();
    const saved = localStorage.getItem('votepulse_candidate_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCandidateUser(parsed);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (selectedElectionId) {
      fetchCandidates(selectedElectionId);
      const timer = setInterval(() => {
        fetchCandidates(selectedElectionId);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [selectedElectionId]);

  useEffect(() => {
    if (candidateUser) {
      setManifestoText(candidateUser.manifesto || '');
      setCampaignSlogan(candidateUser.slogan || 'Driving Innovation & Student Welfare');
      setCandParty(candidateUser.department || candidateUser.party || 'General');
    }
  }, [candidateUser]);

  const fetchElections = async () => {
    try {
      const res = await fetch('/api/elections');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.elections)) {
          setElections(data.elections);
          if (data.elections.length > 0 && !selectedElectionId) {
            setSelectedElectionId(data.elections[0].id);
          }
          return;
        }
      }
    } catch (e) {}
    const local = localStorage.getItem('votepulse_admin_elections');
    if (local) {
      try {
        const arr = JSON.parse(local);
        setElections(arr);
        if (arr.length > 0 && !selectedElectionId) setSelectedElectionId(arr[0].id);
      } catch (e) {}
    }
  };

  const fetchCandidates = async (elecId) => {
    try {
      const res = await fetch(`/api/candidates?election_id=${elecId || ''}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.candidates)) {
          setCandidates(data.candidates);
          return;
        }
      }
    } catch (e) {}
    const local = localStorage.getItem('votepulse_admin_candidates');
    if (local) {
      try {
        const arr = JSON.parse(local);
        const matched = elecId ? arr.filter(c => c.election_id === elecId) : arr;
        setCandidates(matched);
      } catch (e) {}
    }
  };

  const showAlert = (msg, type = 'success') => {
    setAlertMsg({ text: msg, type });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!candKeyInput.trim()) return;

    const query = candKeyInput.toLowerCase().trim();
    const found = candidates.find(c =>
      c.id.toLowerCase() === query ||
      c.name.toLowerCase().includes(query)
    );

    if (found) {
      setCandidateUser(found);
      localStorage.setItem('votepulse_candidate_session', JSON.stringify(found));
      showAlert(`Welcome Candidate ${found.name}! Campaign Command Center Active.`, 'success');
    } else {
      const newCand = {
        id: 'cand_' + Date.now(),
        election_id: selectedElectionId || elections[0]?.id || '101',
        name: candKeyInput,
        department: 'Campaign Headquarters',
        party: 'Independent',
        manifesto: 'Official Candidate Campaign Manifesto',
        photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(candKeyInput)}&background=06b6d4&color=fff&size=300`,
        vote_count: 0
      };
      setCandidateUser(newCand);
      localStorage.setItem('votepulse_candidate_session', JSON.stringify(newCand));
      showAlert(`Candidate session initialized for ${candKeyInput}!`, 'success');
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    const targetElecId = regElectionId || selectedElectionId || (elections[0]?.id || '');
    if (!targetElecId) {
      showAlert('Please select an election poll.', 'error');
      return;
    }

    const candId = regKey.trim() ? regKey.trim() : 'cand_' + Date.now();
    const newCand = {
      id: candId,
      election_id: targetElecId,
      name: regName,
      department: regDept || 'General',
      party: regDept || 'General',
      manifesto: regManifesto || 'Official Campaign Manifesto',
      photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(regName)}&background=06b6d4&color=fff&size=300`,
      vote_count: 0
    };

    try {
      await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCand)
      });
    } catch (e) {}

    const updated = [...candidates, newCand];
    setCandidates(updated);
    localStorage.setItem('votepulse_admin_candidates', JSON.stringify(updated));

    // Log in automatically
    setCandidateUser(newCand);
    localStorage.setItem('votepulse_candidate_session', JSON.stringify(newCand));

    // Reset registration form
    setRegName(''); setRegKey(''); setRegEmail(''); setRegPassword(''); setRegDept(''); setRegManifesto('');
    showAlert(`🎉 Candidate Registration Complete! Logged in as ${newCand.name}.`, 'success');
    fetchCandidates(targetElecId);
  };

  const handleLogout = () => {
    setCandidateUser(null);
    localStorage.removeItem('votepulse_candidate_session');
    showAlert('Signed out from Candidate Command Portal.', 'info');
  };

  const handleSaveManifesto = (e) => {
    e.preventDefault();
    if (!candidateUser) return;
    const updated = {
      ...candidateUser,
      manifesto: manifestoText,
      slogan: campaignSlogan,
      department: candParty
    };
    setCandidateUser(updated);
    localStorage.setItem('votepulse_candidate_session', JSON.stringify(updated));

    const updatedList = candidates.map(c => c.id === candidateUser.id ? { ...c, ...updated } : c);
    setCandidates(updatedList);
    localStorage.setItem('votepulse_admin_candidates', JSON.stringify(updatedList));

    showAlert('✨ Campaign Manifesto & Slogan Published to Ballot System!', 'success');
  };

  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;
    const newAnn = {
      id: Date.now(),
      title: newAnnTitle,
      date: new Date().toISOString().split('T')[0],
      content: newAnnContent
    };
    setAnnouncements([newAnn, ...announcements]);
    setNewAnnTitle('');
    setNewAnnContent('');
    showAlert('📢 Campaign Announcement Published to Voters!', 'success');
  };

  // Live Stats calculations
  const totalElectionVotes = candidates.reduce((sum, c) => sum + (c.vote_count || 0), 0);
  const myVotes = candidateUser ? (candidates.find(c => c.id === candidateUser.id)?.vote_count || candidateUser.vote_count || 0) : 0;
  const myPct = totalElectionVotes > 0 ? Math.round((myVotes / totalElectionVotes) * 100) : 0;
  
  const sortedCandidates = [...candidates].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
  const myRank = candidateUser ? (sortedCandidates.findIndex(c => c.id === candidateUser.id) + 1) : 0;
  const leaderVotes = sortedCandidates[0]?.vote_count || 0;
  const marginToLeader = leaderVotes - myVotes;
  const selectedElection = elections.find(e => e.id === selectedElectionId);

  return (
    <div className="main-container">
      {/* Header Banner */}
      <div className="portal-card" style={{
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(99, 102, 241, 0.14))',
        border: '1px solid rgba(6, 182, 212, 0.45)',
        boxShadow: '0 8px 32px rgba(6, 182, 212, 0.18)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '18px',
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.7rem', boxShadow: '0 6px 20px rgba(6, 182, 212, 0.45)',
            }}>🚀</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="live-pulse-badge" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', border: '1px solid rgba(6, 182, 212, 0.5)' }}>
                  <span className="live-dot" style={{ background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }}></span> CANDIDATE COMMAND CENTER
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>[SYSTEM ROUTE: CANDIDATE PORTAL]</span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, background: 'linear-gradient(135deg, #38bdf8, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Candidate Authentication & Campaign Portal
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Dedicated platform for candidates to log in, register nominations, edit policy manifestos, and track campaign standings.
              </p>
            </div>
          </div>

          {candidateUser && (
            <button className="btn" onClick={handleLogout} style={{ fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px' }}>
              🚪 Sign Out ({candidateUser.name})
            </button>
          )}
        </div>
      </div>

      {alertMsg && (
        <div style={{ padding: '1rem', borderRadius: '14px', marginBottom: '1.5rem', fontWeight: 600, background: alertMsg.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(6,182,212,0.15)', color: alertMsg.type === 'error' ? '#f87171' : '#38bdf8', border: `1px solid ${alertMsg.type === 'error' ? '#ef4444' : '#06b6d4'}` }}>
          {alertMsg.text}
        </div>
      )}

      {/* CANDIDATE AUTHENTICATION SYSTEM (LOGIN / SIGN UP TABS) */}
      {!candidateUser ? (
        <div className="card glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem', maxWidth: '720px', margin: '0 auto 2rem auto', border: '1px solid rgba(6, 182, 212, 0.35)' }}>
          {/* Dual Auth Switcher Pills */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '16px', marginBottom: '2rem', border: '1px solid var(--border-glass)' }}>
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              style={{
                flex: 1, padding: '0.7rem', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '0.9rem',
                cursor: 'pointer', transition: 'all 0.25s ease',
                background: authMode === 'login' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent',
                color: authMode === 'login' ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              🔐 Candidate Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              style={{
                flex: 1, padding: '0.7rem', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '0.9rem',
                cursor: 'pointer', transition: 'all 0.25s ease',
                background: authMode === 'register' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent',
                color: authMode === 'register' ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              📝 Register / Nominate Candidate
            </button>
          </div>

          {/* MODE 1: CANDIDATE LOGIN FORM */}
          {authMode === 'login' ? (
            <div>
              <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: '#38bdf8', fontWeight: 800, letterSpacing: '1px', marginBottom: '4px' }}>CANDIDATE SIGN IN</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.5rem' }}>Access Your Campaign Dashboard</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Enter your registered Candidate Name or Candidate ID Key to access your command center.</p>

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label">Active Election Poll</label>
                  <select className="form-input" value={selectedElectionId} onChange={e => setSelectedElectionId(e.target.value)}>
                    {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Candidate Key / Name *</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g. Rahul, Kholii, or CAND-101"
                    value={candKeyInput}
                    onChange={e => setCandKeyInput(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Candidate Passcode <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="••••••••"
                    value={candPasswordInput}
                    onChange={e => setCandPasswordInput(e.target.value)}
                  />
                </div>

                {/* Registered Candidates Quick Select List */}
                {candidates.length > 0 && (
                  <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Quick Login as Candidate:</span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {candidates.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setCandidateUser(c);
                            localStorage.setItem('votepulse_candidate_session', JSON.stringify(c));
                            showAlert(`Logged in as Candidate ${c.name}!`, 'success');
                          }}
                          style={{
                            background: 'rgba(6, 182, 212, 0.12)',
                            border: '1px solid rgba(6, 182, 212, 0.35)',
                            color: '#38bdf8',
                            padding: '6px 12px',
                            borderRadius: '10px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          👤 {c.name} ({c.department || c.party})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button className="btn btn-primary" type="submit" style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', fontWeight: 800 }}>
                  🚀 Sign In to Candidate Command Center →
                </button>
              </form>
            </div>
          ) : (
            /* MODE 2: CANDIDATE REGISTRATION FORM */
            <div>
              <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: '#38bdf8', fontWeight: 800, letterSpacing: '1px', marginBottom: '4px' }}>NEW CANDIDATE REGISTRATION</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.5rem' }}>Register Candidacy Nomination</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Create a candidate account to run for an election poll and publish your campaign manifesto.</p>

              <form onSubmit={handleRegistrationSubmit}>
                <div className="form-group">
                  <label className="form-label">Target Election Poll *</label>
                  <select className="form-input" value={regElectionId || selectedElectionId} onChange={e => setRegElectionId(e.target.value)} required>
                    {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Candidate Name *</label>
                  <input className="form-input" type="text" placeholder="e.g. Priya Sharma" value={regName} onChange={e => setRegName(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Candidate Access Key / ID <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(auto-generated if blank)</span></label>
                  <input className="form-input" type="text" placeholder="CAND-KEY-2026" value={regKey} onChange={e => setRegKey(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-input" type="email" placeholder="candidate@institution.edu" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-input" type="password" placeholder="Create a secure password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Department / Party Affiliation</label>
                  <input className="form-input" type="text" placeholder="e.g. Computer Science Dept." value={regDept} onChange={e => setRegDept(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Manifesto & Vision Statement</label>
                  <textarea className="form-input" rows={4} placeholder="Describe your key campaign initiatives, promises, and vision..." value={regManifesto} onChange={e => setRegManifesto(e.target.value)} />
                </div>

                <button className="btn btn-primary" type="submit" style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', fontWeight: 800 }}>
                  🎉 Register & Launch Campaign Dashboard →
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* AUTHENTICATED CANDIDATE DASHBOARD */}
          <div className="card glass-card" style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid rgba(6, 182, 212, 0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <img src={candidateUser.photo_url} alt={candidateUser.name} style={{ width: '70px', height: '70px', borderRadius: '18px', objectFit: 'cover', border: '2px solid #06b6d4', boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)' }} onError={(e)=>{e.target.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300';}} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', padding: '2px 8px', borderRadius: '8px', fontWeight: 800 }}>
                      VERIFIED CANDIDATE PROFILE
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {candidateUser.id}</span>
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '2px' }}>{candidateUser.name}</h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Party / Dept: <strong style={{ color: 'var(--text-main)' }}>{candidateUser.department || candidateUser.party}</strong> • Poll: <strong style={{ color: '#38bdf8' }}>{selectedElection?.title}</strong>
                  </div>
                </div>
              </div>

              {/* Module Tab Selector */}
              <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.25)', padding: '6px', borderRadius: '14px', border: '1px solid var(--border-glass)', flexWrap: 'wrap' }}>
                <button
                  className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveTab('overview')}
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1rem', background: activeTab === 'overview' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent' }}
                >
                  📊 Campaign Analytics
                </button>
                <button
                  className={`btn ${activeTab === 'manifesto' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveTab('manifesto')}
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1rem', background: activeTab === 'manifesto' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent' }}
                >
                  ✏️ Edit Manifesto
                </button>
                <button
                  className={`btn ${activeTab === 'announcements' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveTab('announcements')}
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1rem', background: activeTab === 'announcements' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent' }}
                >
                  📢 Announcements ({announcements.length})
                </button>
                <button
                  className={`btn ${activeTab === 'badge' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveTab('badge')}
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1rem', background: activeTab === 'badge' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent' }}
                >
                  🛡️ Campaign Badge
                </button>
              </div>
            </div>
          </div>

          {/* TAB 1: CAMPAIGN ANALYTICS */}
          {activeTab === 'overview' && (
            <div>
              <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="card glass-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>CAMPAIGN RANK</div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: myRank === 1 ? '#f59e0b' : '#38bdf8', marginTop: '4px' }}>
                    {myRank > 0 ? `#${myRank} ${myRank === 1 ? '👑 Leader' : 'Place'}` : '—'}
                  </h2>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {myRank === 1 ? 'Leading candidate overall!' : `${marginToLeader} votes behind leader`}
                  </div>
                </div>

                <div className="card glass-card" style={{ borderLeft: '4px solid #38bdf8' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>VOTE SHARE PERCENTAGE</div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>{myPct}%</h2>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Real-time ballot share</div>
                </div>

                <div className="card glass-card" style={{ borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>VOTES SECURED</div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>{myVotes}</h2>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Confirmed encrypted ballots</div>
                </div>

                <div className="card glass-card" style={{ borderLeft: '4px solid #c084fc' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL ELECTION VOTES</div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#c084fc', marginTop: '4px' }}>{totalElectionVotes}</h2>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>All candidates combined</div>
                </div>
              </div>

              {/* Real-time Competitor Breakdown */}
              <div className="card glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="live-pulse-badge" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', border: '1px solid rgba(6, 182, 212, 0.5)' }}>
                      <span className="live-dot" style={{ background: '#38bdf8' }}></span> LIVE CANDIDATE STANDINGS
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Poll Standings & Competitors</h3>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Auto-updating live streaming</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {sortedCandidates.map((c, idx) => {
                    const votes = c.vote_count || 0;
                    const pct = totalElectionVotes > 0 ? Math.round((votes / totalElectionVotes) * 100) : 0;
                    const isMe = c.id === candidateUser.id;
                    const isLeader = idx === 0 && votes > 0;

                    return (
                      <div key={c.id} style={{
                        background: isMe ? 'rgba(6, 182, 212, 0.12)' : isLeader ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255,255,255,0.03)',
                        border: isMe ? '2px solid #06b6d4' : isLeader ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-glass)',
                        borderRadius: '14px',
                        padding: '1rem 1.25rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontWeight: 900, color: 'var(--text-muted)', width: '20px' }}>#{idx + 1}</span>
                            <img src={c.photo_url} alt={c.name} style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover' }} onError={(e)=>{e.target.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300';}} />
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {c.name}
                                {isMe && <span style={{ fontSize: '0.68rem', background: '#06b6d4', color: '#fff', padding: '2px 8px', borderRadius: '8px', fontWeight: 800 }}>YOUR CAMPAIGN</span>}
                                {isLeader && !isMe && <span style={{ fontSize: '0.68rem', background: '#f59e0b', color: '#fff', padding: '2px 8px', borderRadius: '8px', fontWeight: 800 }}>👑 LEADER</span>}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.department || c.party}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: isMe ? '#38bdf8' : isLeader ? '#f59e0b' : 'var(--text-main)' }}>{pct}%</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{votes} votes</div>
                          </div>
                        </div>

                        <div className="live-tally-bar-wrap">
                          <div className={`live-tally-bar-fill ${isLeader ? 'leader' : ''}`} style={{ width: `${pct}%`, background: isMe ? 'linear-gradient(90deg, #06b6d4, #3b82f6)' : undefined }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANIFESTO STUDIO */}
          {activeTab === 'manifesto' && (
            <div className="card glass-panel" style={{ padding: '2rem', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.8rem' }}>✏️</span>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 900 }}>Campaign Manifesto & Slogan Studio</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Customize your campaign promises and manifesto text. This updates live on the voter ballot screen.</p>
                </div>
              </div>

              <form onSubmit={handleSaveManifesto}>
                <div className="form-group">
                  <label className="form-label">Candidate Name</label>
                  <input className="form-input" type="text" value={candidateUser.name} disabled style={{ opacity: 0.7 }} />
                </div>

                <div className="form-group">
                  <label className="form-label">Department / Party Affiliation</label>
                  <input className="form-input" type="text" value={candParty} onChange={e => setCandParty(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Official Campaign Slogan</label>
                  <input className="form-input" type="text" placeholder="e.g. Empowering Students, Driving Transparency & Innovation" value={campaignSlogan} onChange={e => setCampaignSlogan(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Full Campaign Manifesto & Vision Statement *</label>
                  <textarea className="form-input" rows={7} placeholder="Detail your election promises, key policy initiatives, student welfare goals, and vision..." value={manifestoText} onChange={e => setManifestoText(e.target.value)} required />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                  <button className="btn btn-primary" type="submit" style={{ padding: '0.75rem 1.75rem', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', fontWeight: 800 }}>
                    💾 Save & Publish Manifesto to Ballot →
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: CAMPAIGN ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="card glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '0.5rem' }}>📢 Campaign Announcements & Updates</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Post official campaign announcements, event invites, and policy updates.</p>

              <form onSubmit={handleAddAnnouncement} style={{ marginBottom: '2rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: '#38bdf8' }}>Post New Campaign Update</h4>
                <div className="form-group">
                  <label className="form-label">Announcement Title *</label>
                  <input className="form-input" type="text" placeholder="e.g. Student Health & Welfare Townhall Meeting" value={newAnnTitle} onChange={e => setNewAnnTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Update Content *</label>
                  <textarea className="form-input" rows={3} placeholder="Share update details, key highlights, or event links..." value={newAnnContent} onChange={e => setNewAnnContent(e.target.value)} required />
                </div>
                <button className="btn btn-primary" type="submit" style={{ padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
                  📢 Publish Update
                </button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {announcements.map(ann => (
                  <div key={ann.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', padding: '1.25rem', borderRadius: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <h4 style={{ fontWeight: 800, fontSize: '1rem', color: '#38bdf8' }}>{ann.title}</h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ann.date}</span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL BADGE */}
          {activeTab === 'badge' && (
            <div className="card glass-card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '640px', margin: '0 auto', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(30, 41, 59, 0.8))', border: '2px solid rgba(6, 182, 212, 0.4)' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🛡️</div>
              <span style={{ fontSize: '0.78rem', background: '#06b6d4', color: '#fff', padding: '3px 10px', borderRadius: '8px', fontWeight: 800, textTransform: 'uppercase' }}>
                OFFICIAL DIGITAL CAMPAIGN BADGE
              </span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginTop: '8px' }}>{candidateUser.name}</h2>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Candidate for <strong>{selectedElection?.title}</strong></div>

              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', padding: '1.5rem', borderRadius: '16px', textAlign: 'left', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>CANDIDATE ID: <strong style={{ color: '#38bdf8' }}>{candidateUser.id}</strong></div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0' }}>DEPARTMENT / PARTY: <strong style={{ color: 'var(--text-main)' }}>{candidateUser.department || candidateUser.party}</strong></div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>STATUS: <span style={{ color: '#34d399', fontWeight: 800 }}>VERIFIED CANDIDACY</span></div>
                <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontFamily: 'monospace', marginTop: '10px', wordBreak: 'break-all' }}>
                  SHA256_SEAL: sha256_cand_{candidateUser.id.replace(/[^a-zA-Z0-9]/g, '')}_authenticated
                </div>
              </div>

              <button className="btn btn-secondary" onClick={() => showAlert('Candidate Badge image & hash copied to clipboard!', 'success')}>
                📋 Copy Candidate Verification Seal
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
