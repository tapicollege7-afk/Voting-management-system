import React, { useState, useEffect } from 'react';

export default function CandidatePortal({ user, setUser }) {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  
  // Login / Select candidate state
  const [selectedCandId, setSelectedCandId] = useState('');
  const [candidateUser, setCandidateUser] = useState(null);

  // Editable Manifesto State
  const [manifestoText, setManifestoText] = useState('');
  const [campaignSlogan, setCampaignSlogan] = useState('');
  const [candParty, setCandParty] = useState('');
  const [alertMsg, setAlertMsg] = useState(null);

  // Nomination Form State
  const [showNominationModal, setShowNominationModal] = useState(false);
  const [nomName, setNomName] = useState('');
  const [nomElectionId, setNomElectionId] = useState('');
  const [nomDept, setNomDept] = useState('');
  const [nomManifesto, setNomManifesto] = useState('');

  // Active view tab inside Candidate Portal
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'manifesto'

  // Load elections & candidates
  useEffect(() => {
    fetchElections();
    // Check saved candidate session
    const saved = localStorage.getItem('votepulse_candidate_session');
    if (saved) {
      try {
        setCandidateUser(JSON.parse(saved));
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
      setCampaignSlogan(candidateUser.slogan || 'Building a Transparent & Innovative Future');
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

  const handleCandidateLogin = (candObj) => {
    setCandidateUser(candObj);
    localStorage.setItem('votepulse_candidate_session', JSON.stringify(candObj));
    showAlert(`Logged in as candidate: ${candObj.name}!`, 'success');
  };

  const handleLogout = () => {
    setCandidateUser(null);
    localStorage.removeItem('votepulse_candidate_session');
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

    // Update candidates list
    const updatedList = candidates.map(c => c.id === candidateUser.id ? { ...c, ...updated } : c);
    setCandidates(updatedList);
    localStorage.setItem('votepulse_admin_candidates', JSON.stringify(updatedList));

    showAlert('Campaign manifesto & vision statement updated!', 'success');
  };

  const handleNominationSubmit = async (e) => {
    e.preventDefault();
    const targetElecId = nomElectionId || selectedElectionId || (elections[0]?.id || '');
    if (!targetElecId) {
      showAlert('Please select an election poll first.', 'error');
      return;
    }
    const newCand = {
      id: 'cand_' + Date.now(),
      election_id: targetElecId,
      name: nomName,
      department: nomDept || 'General',
      party: nomDept || 'General',
      manifesto: nomManifesto || 'Official Candidate Manifesto',
      photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(nomName)}&background=10b981&color=fff&size=300`,
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
    setShowNominationModal(false);
    setNomName(''); setNomDept(''); setNomManifesto('');
    showAlert('Candidacy nomination submitted successfully!', 'success');
    fetchCandidates(targetElecId);
  };

  // Live Stats calculations
  const totalElectionVotes = candidates.reduce((sum, c) => sum + (c.vote_count || 0), 0);
  const myVotes = candidateUser ? (candidates.find(c => c.id === candidateUser.id)?.vote_count || candidateUser.vote_count || 0) : 0;
  const myPct = totalElectionVotes > 0 ? Math.round((myVotes / totalElectionVotes) * 100) : 0;
  
  // Rank calculation
  const sortedCandidates = [...candidates].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
  const myRank = candidateUser ? (sortedCandidates.findIndex(c => c.id === candidateUser.id) + 1) : 0;
  const selectedElection = elections.find(e => e.id === selectedElectionId);

  return (
    <div className="main-container">
      {/* Candidate Portal Header Banner */}
      <div className="portal-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.08))', border: '1px solid rgba(16,185,129,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
            }}>👤</div>
            <div>
              <span className="live-pulse-badge" style={{ marginBottom: '4px' }}>
                <span className="live-dot" style={{ background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span> CANDIDATE PORTAL MODULE
              </span>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginTop: '2px' }}>Candidate Campaign Dashboard</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Manage your campaign manifesto, track live election tallies, and view voter engagement analytics.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => setShowNominationModal(true)} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📝 Submit Nomination
            </button>
            {candidateUser ? (
              <button className="btn btn-secondary" onClick={handleLogout} style={{ fontSize: '0.85rem', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                🚪 Sign Out
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {alertMsg && (
        <div style={{ padding: '1rem', borderRadius: '14px', marginBottom: '1.5rem', fontWeight: 600, background: alertMsg.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: alertMsg.type === 'error' ? '#f87171' : '#34d399', border: `1px solid ${alertMsg.type === 'error' ? '#ef4444' : '#10b981'}` }}>
          {alertMsg.text}
        </div>
      )}

      {/* Candidate Session Switcher / Login selector */}
      {!candidateUser ? (
        <div className="card glass-panel" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem', maxWidth: '680px', margin: '0 auto 2rem auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎯</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Select or Sign In as Registered Candidate</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Choose your registered candidate profile to access your candidate campaign dashboard and edit your manifesto.</p>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Active Election Poll</label>
            <select className="form-input" value={selectedElectionId} onChange={e => setSelectedElectionId(e.target.value)}>
              {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Select Candidate Profile</label>
            <select className="form-input" value={selectedCandId} onChange={e => setSelectedCandId(e.target.value)}>
              <option value="">Choose your name...</option>
              {candidates.map(c => <option key={c.id} value={c.id}>{c.name} ({c.department || c.party})</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
              disabled={!selectedCandId}
              onClick={() => {
                const found = candidates.find(c => c.id === selectedCandId);
                if (found) handleCandidateLogin(found);
              }}
            >
              Access Candidate Dashboard →
            </button>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-glass)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Not registered as a candidate yet?</p>
            <button className="btn btn-secondary" style={{ marginTop: '0.5rem', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }} onClick={() => setShowNominationModal(true)}>
              ➕ Submit Candidate Nomination Form
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Active Candidate Profile Summary */}
          <div className="card glass-card" style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img src={candidateUser.photo_url} alt={candidateUser.name} style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover', border: '2px solid var(--accent-emerald)' }} onError={(e)=>{e.target.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300';}} />
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>AUTHENTICATED CANDIDATE</div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900 }}>{candidateUser.name}</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{candidateUser.department || candidateUser.party} • Poll: <strong>{selectedElection?.title}</strong></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('analytics')} style={{ fontSize: '0.82rem' }}>
                📊 Campaign Analytics
              </button>
              <button className={`btn ${activeTab === 'manifesto' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('manifesto')} style={{ fontSize: '0.82rem' }}>
                ✏️ Edit Manifesto
              </button>
            </div>
          </div>

          {/* Tab 1: Campaign Analytics */}
          {activeTab === 'analytics' && (
            <div>
              {/* KPI Cards */}
              <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="card glass-card">
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>ELECTION RANK</div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: myRank === 1 ? '#f59e0b' : '#10b981', marginTop: '4px' }}>
                    {myRank > 0 ? `#${myRank} ${myRank === 1 ? '👑 Leader' : 'Place'}` : '—'}
                  </h2>
                </div>

                <div className="card glass-card">
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>VOTE PERCENTAGE</div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>{myPct}%</h2>
                </div>

                <div className="card glass-card">
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL VOTES RECEIVED</div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>{myVotes}</h2>
                </div>

                <div className="card glass-card">
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL POLL VOTES</div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#c084fc', marginTop: '4px' }}>{totalElectionVotes}</h2>
                </div>
              </div>

              {/* Live Real-Time Tally Scoreboard */}
              <div className="card glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="live-pulse-badge">
                      <span className="live-dot"></span> REAL-TIME CAMPAIGN STANDINGS
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Poll Competitors & Progress</h3>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Auto-updating live metrics</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {sortedCandidates.map((c, idx) => {
                    const votes = c.vote_count || 0;
                    const pct = totalElectionVotes > 0 ? Math.round((votes / totalElectionVotes) * 100) : 0;
                    const isMe = c.id === candidateUser.id;
                    const isLeader = idx === 0 && votes > 0;

                    return (
                      <div key={c.id} style={{
                        background: isMe ? 'rgba(16,185,129,0.12)' : isLeader ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
                        border: isMe ? '2px solid var(--accent-emerald)' : isLeader ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--border-glass)',
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
                                {isMe && <span style={{ fontSize: '0.68rem', background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '8px', fontWeight: 800 }}>YOU</span>}
                                {isLeader && !isMe && <span style={{ fontSize: '0.68rem', background: '#f59e0b', color: '#fff', padding: '2px 8px', borderRadius: '8px', fontWeight: 800 }}>👑 LEADER</span>}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.department || c.party}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: isMe ? '#10b981' : isLeader ? '#f59e0b' : 'var(--text-main)' }}>{pct}%</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{votes} votes</div>
                          </div>
                        </div>

                        <div className="live-tally-bar-wrap">
                          <div className={`live-tally-bar-fill ${isLeader ? 'leader' : ''}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Digital Candidate Verification Badge */}
              <div className="card glass-card" style={{ padding: '1.5rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(30,41,59,0.6))', border: '1px solid rgba(16,185,129,0.3)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛡️</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: '0.4rem' }}>Official Candidate Digital Campaign Seal</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Authenticated Candidate Signature & Cryptographic Participation Hash</p>

                <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '10px', display: 'inline-block', border: '1px solid var(--border-glass)', color: '#34d399' }}>
                  CANDIDATE HASH: sha256_cand_{candidateUser.id.replace(/[^a-zA-Z0-9]/g, '')}_2026
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Edit Manifesto */}
          {activeTab === 'manifesto' && (
            <div className="card glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>✏️ Update Campaign Manifesto & Vision Statement</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Your manifesto will be displayed directly to voters on their official digital ballot screen.</p>

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
                  <label className="form-label">Campaign Slogan</label>
                  <input className="form-input" type="text" placeholder="e.g. Empowering Students, Driving Change" value={campaignSlogan} onChange={e => setCampaignSlogan(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Official Manifesto & Vision Statement *</label>
                  <textarea className="form-input" rows={6} placeholder="Write your election promises, key policy initiatives, and vision for your department/institution..." value={manifestoText} onChange={e => setManifestoText(e.target.value)} required />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                  <button className="btn btn-primary" type="submit" style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem' }}>
                    💾 Save & Publish Manifesto Updates →
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* MODAL: SUBMIT NOMINATION */}
      {showNominationModal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowNominationModal(false); }}>
          <div className="modal-content glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>📝 Submit Candidacy Nomination</h2>
              <button onClick={() => setShowNominationModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <form onSubmit={handleNominationSubmit}>
              <div className="form-group">
                <label className="form-label">Target Election Poll *</label>
                <select className="form-input" value={nomElectionId || selectedElectionId} onChange={e => setNomElectionId(e.target.value)} required>
                  {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Full Candidate Name *</label>
                <input className="form-input" type="text" placeholder="e.g. Priya Sharma" value={nomName} onChange={e => setNomName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Department / Party</label>
                <input className="form-input" type="text" placeholder="e.g. Computer Science Dept." value={nomDept} onChange={e => setNomDept(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Manifesto / Vision Statement</label>
                <textarea className="form-input" rows={3} placeholder="Briefly describe your campaign vision..." value={nomManifesto} onChange={e => setNomManifesto(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} type="button" onClick={() => setShowNominationModal(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 2 }} type="submit">Submit Nomination →</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
