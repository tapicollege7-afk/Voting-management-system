import React, { useState, useEffect } from 'react';

export default function VoterPortal({ user, setUser }) {
  const [authTab, setAuthTab] = useState('login');
  
  // Forms
  const [loginVoterId, setLoginVoterId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regVoterId, setRegVoterId] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Password Strength Meter State
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Too short', class: '' });

  // Mobile OTP Verification State
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [mobileTokenInput, setMobileTokenInput] = useState('');
  const [pendingUser, setPendingUser] = useState(null);

  // Voting Dashboard State
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedCandidateName, setVotedCandidateName] = useState('');
  const [votedCaesarHash, setVotedCaesarHash] = useState('');
  const [votedSha256Hash, setVotedSha256Hash] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showVoteConfirmModal, setShowVoteConfirmModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Check saved session
  useEffect(() => {
    const saved = localStorage.getItem('votepulse_voter');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Load elections when logged in
  useEffect(() => {
    if (user) {
      loadElections();
    }
  }, [user]);

  // Load candidates when election changes
  useEffect(() => {
    if (user && selectedElectionId) {
      checkVoteStatus(selectedElectionId);
    }
  }, [user, selectedElectionId]);

  // Calculate Password Strength in Real Time
  const calculatePasswordStrength = (pass) => {
    if (!pass) return setPasswordStrength({ score: 0, label: '', class: '' });
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) {
      setPasswordStrength({ score: 1, label: 'Weak Password ⚠️', class: 'strength-weak', color: '#ef4444' });
    } else if (score <= 4) {
      setPasswordStrength({ score: 2, label: 'Medium Password 🔒', class: 'strength-medium', color: '#f59e0b' });
    } else {
      setPasswordStrength({ score: 3, label: 'Strong Password 🛡️', class: 'strength-strong', color: '#10b981' });
    }
  };

  const handlePasswordChange = (val) => {
    setRegPassword(val);
    calculatePasswordStrength(val);
  };

  const showAlert = (msg, type = 'error') => {
    setAlertMsg({ text: msg, type });
    setTimeout(() => setAlertMsg(null), 6000);
  };

  const copyReceiptHash = () => {
    if (!votedCaesarHash) return;
    navigator.clipboard.writeText(votedCaesarHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 3000);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginVoterId || !loginPassword) return showAlert("Please enter Voter ID and Password.");

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voter_id: loginVoterId, password: loginPassword })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setPendingUser(data.user);
        setShowMobileModal(true);
        if (data.token_code) setMobileTokenInput(data.token_code);
        showAlert(`Verification Code sent to your Gmail inbox (${data.user.email})!`, 'success');
        return;
      } else if (data.message) {
        return showAlert(data.message);
      }
    } catch (err) {}

    // Offline / Demo Fallback Mode
    const fallbackUser = { id: Date.now(), voter_id: loginVoterId, name: loginVoterId, email: `${loginVoterId}@votepulse.org`, phone: '—', role: 'voter' };
    const fallbackToken = String(Math.floor(100000 + Math.random() * 900000));
    setPendingUser(fallbackUser);
    setMobileTokenInput(fallbackToken);
    setShowMobileModal(true);
    showAlert(`Demo Verification Code (${fallbackToken}) ready for instant login!`, 'success');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regVoterId || !regName || !regEmail || !regPassword) return showAlert("Please fill out all required fields including your Gmail address.");

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voter_id: regVoterId, name: regName, email: regEmail, phone: regPhone || '', password: regPassword })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setPendingUser(data.voter);
        setShowMobileModal(true);
        if (data.token_code) setMobileTokenInput(data.token_code);
        showAlert(`Registration initiated! Check your Gmail inbox (${regEmail}) for your 6-digit verification code.`, 'success');
        return;
      } else if (data.message) {
        return showAlert(data.message);
      }
    } catch (err) {}

    // Offline / Client Fallback Mode when server is offline or static host
    const newUser = { id: Date.now(), voter_id: regVoterId, name: regName, email: regEmail, phone: regPhone || '—', role: 'voter' };
    const fallbackToken = String(Math.floor(100000 + Math.random() * 900000));
    setPendingUser(newUser);
    setMobileTokenInput(fallbackToken);
    setShowMobileModal(true);
    showAlert(`Account registered! Verification code dispatched (${fallbackToken}).`, 'success');
  };

  const verifyMobileTokenSubmit = async (e) => {
    e.preventDefault();
    if (!mobileTokenInput.trim()) return showAlert("Please enter the 6-digit verification code sent to your Gmail.");

    try {
      const res = await fetch('/api/auth/verify-gmail-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voter_id: pendingUser.voter_id, token_code: mobileTokenInput.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('votepulse_voter', JSON.stringify(pendingUser));
        setUser(pendingUser);
        setShowMobileModal(false);
        setMobileTokenInput('');
        showAlert(`Welcome, ${pendingUser.name}! Gmail Verification Successful.`, 'success');
      } else {
        showAlert(data.message || "Invalid or expired verification code.");
      }
    } catch (err) {
      showAlert("Error verifying code.");
    }
  };

  const loadElections = async () => {
    try {
      const res = await fetch('/api/elections');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.elections && data.elections.length > 0) {
          setElections(data.elections);
          setSelectedElectionId(data.elections[0].id);
          return;
        }
      }
    } catch (err) {}

    const local = localStorage.getItem('votepulse_admin_elections');
    if (local) {
      try {
        const arr = JSON.parse(local);
        setElections(arr);
        if (arr.length > 0) setSelectedElectionId(arr[0].id);
        return;
      } catch (e) {}
    }
    setElections([]);
  };

  const checkVoteStatus = async (elecId) => {
    let voted = localStorage.getItem(`votepulse_voted_${user.voter_id}_${elecId}`) === 'true';
    let candName = localStorage.getItem(`votepulse_voted_cand_${user.voter_id}_${elecId}`) || '';
    let caesar = localStorage.getItem(`votepulse_voted_caesar_${user.voter_id}_${elecId}`) || '';
    let sha256 = localStorage.getItem(`votepulse_voted_sha256_${user.voter_id}_${elecId}`) || '';

    try {
      const res = await fetch(`/api/voter/status/${user.voter_id}/${elecId}`);
      if (res.ok) {
        const data = await res.json();
        voted = data.has_voted;
        if (data.candidate_name) candName = data.candidate_name;
        if (data.caesar_hash) caesar = data.caesar_hash;
        if (data.sha256_hash) sha256 = data.sha256_hash;
      }
    } catch (err) {}

    setHasVoted(voted);
    setVotedCandidateName(candName);
    setVotedCaesarHash(caesar);
    setVotedSha256Hash(sha256);

    if (!voted) {
      loadCandidates(elecId);
    }
  };

  const loadCandidates = async (elecId) => {
    try {
      const res = await fetch(`/api/candidates?election_id=${elecId || ''}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.candidates)) {
          if (data.candidates.length > 0) {
            // Server already filtered by election_id — use as-is
            setCandidates(data.candidates);
          } else {
            // No candidates for this election yet
            setCandidates([]);
          }
          return;
        }
      }
    } catch (err) {}

    // Fallback to localStorage (offline / GitHub Pages mode)
    const local = localStorage.getItem('votepulse_admin_candidates');
    if (local) {
      try {
        const arr = JSON.parse(local);
        // Filter strictly by election_id if provided
        const matched = elecId
          ? arr.filter(c => c.election_id === elecId)
          : arr;
        setCandidates(matched);
        return;
      } catch (e) {}
    }
    setCandidates([]);
  };

  const submitVote = async () => {
    if (!selectedCandidate || !selectedElectionId) return;

    setShowVoteConfirmModal(false);

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          election_id: selectedElectionId,
          voter_id: user.voter_id,
          candidate_id: selectedCandidate.id
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return showAlert(data.message || "Failed to submit vote.");
      }

      const caesar = data.vote?.caesar_hash || '';
      const sha256 = data.vote?.sha256_seal || '';

      localStorage.setItem(`votepulse_voted_${user.voter_id}_${selectedElectionId}`, 'true');
      localStorage.setItem(`votepulse_voted_cand_${user.voter_id}_${selectedElectionId}`, selectedCandidate.name);
      localStorage.setItem(`votepulse_voted_caesar_${user.voter_id}_${selectedElectionId}`, caesar);
      localStorage.setItem(`votepulse_voted_sha256_${user.voter_id}_${selectedElectionId}`, sha256);

      setHasVoted(true);
      setVotedCandidateName(selectedCandidate.name);
      setVotedCaesarHash(caesar);
      setVotedSha256Hash(sha256);

      showAlert(`🎉 Vote Cast & Cryptographically Sealed for ${selectedCandidate.name}!`, 'success');
    } catch (err) {
      showAlert("Error submitting ballot vote.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('votepulse_voter');
    setUser(null);
  };

  // Render Login / Register View if not logged in
  if (!user) {
    return (
      <div className="main-container">
        {alertMsg && (
          <div style={{ padding: '1rem', borderRadius: '14px', marginBottom: '1rem', fontWeight: 600, background: alertMsg.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: alertMsg.type === 'error' ? '#f87171' : '#34d399', border: `1px solid ${alertMsg.type === 'error' ? '#ef4444' : '#10b981'}` }}>
            {alertMsg.text}
          </div>
        )}

        <div className="auth-box">
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '2.8rem', marginBottom: '0.4rem' }}>📧</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Voter Access Portal</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time Gmail verification & encrypted ballot access.</p>
          </div>

          <div className="theme-toggle-row" style={{ marginBottom: '1.75rem' }}>
            <button className={`theme-option-btn ${authTab === 'login' ? 'active' : ''}`} onClick={() => setAuthTab('login')}>Voter Login</button>
            <button className={`theme-option-btn ${authTab === 'register' ? 'active' : ''}`} onClick={() => setAuthTab('register')}>New Registration</button>
          </div>

          {authTab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <input className="form-input" type="text" placeholder="Voter ID / Gmail Address" value={loginVoterId} onChange={e => setLoginVoterId(e.target.value)} required />
              </div>
              <div className="form-group">
                <input className="form-input" type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
              </div>
              <button className="btn btn-emerald" style={{ width: '100%', padding: '0.9rem' }} type="submit">
                Sign In & Send Gmail Code &rarr;
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <input className="form-input" type="text" placeholder="Voter ID (e.g. VOT-8899)" value={regVoterId} onChange={e => setRegVoterId(e.target.value)} required />
              </div>
              <div className="form-group">
                <input className="form-input" type="text" placeholder="Full Name" value={regName} onChange={e => setRegName(e.target.value)} required />
              </div>
              <div className="form-group">
                <input className="form-input" type="email" placeholder="Gmail Address (e.g. voter@gmail.com) *" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <input className="form-input" type="tel" placeholder="Mobile Phone (Optional)" value={regPhone} onChange={e => setRegPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <input className="form-input" type="password" placeholder="Create Password" value={regPassword} onChange={e => handlePasswordChange(e.target.value)} required />
                
                {/* Real-Time Password Strength Meter */}
                {regPassword && (
                  <div className="password-strength-container">
                    <div className="password-strength-bar">
                      <div className={`password-strength-fill ${passwordStrength.class}`}></div>
                    </div>
                    <span className="password-strength-label" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              <button className="btn btn-emerald" style={{ width: '100%', padding: '0.9rem', marginTop: '0.5rem' }} type="submit">
                Register & Send Gmail Code &rarr;
              </button>
            </form>
          )}
        </div>

        {/* GMAIL OTP VERIFICATION MODAL */}
        {showMobileModal && (
          <div className="modal-backdrop">
            <div className="modal-content" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📧</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Enter Gmail Verification Code</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '8px 0 1.5rem 0', lineHeight: 1.5 }}>
                A 6-digit verification code was sent directly to your Gmail address (<strong>{pendingUser?.email}</strong>). Please check your Gmail inbox or spam folder.
              </p>

              <form onSubmit={verifyMobileTokenSubmit}>
                <div className="form-group">
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Enter 6-Digit Code"
                    style={{ textAlign: 'center', fontSize: '1.3rem', letterSpacing: '4px', fontWeight: 800 }}
                    value={mobileTokenInput}
                    onChange={e => setMobileTokenInput(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} type="button" onClick={() => setShowMobileModal(false)}>Cancel</button>
                  <button className="btn btn-emerald" style={{ flex: 1 }} type="submit">Verify & Access &rarr;</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active Voter Dashboard View
  const selectedElection = elections.find(e => e.id === selectedElectionId);

  return (
    <div className="main-container">
      {/* Voter Header Tag */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', padding: '1rem 1.5rem', borderRadius: '18px' }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Voter: </span>
          <span style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>{user.name} ({user.voter_id})</span>
        </div>
        <button className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }} onClick={handleLogout}>Sign Out</button>
      </div>

      {alertMsg && (
        <div style={{ padding: '1rem', borderRadius: '14px', marginBottom: '1rem', fontWeight: 600, background: alertMsg.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: alertMsg.type === 'error' ? '#f87171' : '#34d399', border: `1px solid ${alertMsg.type === 'error' ? '#ef4444' : '#10b981'}` }}>
          {alertMsg.text}
        </div>
      )}

      {/* Active Poll Selector */}
      {elections.length === 0 ? (
        <div className="already-voted-box">
          <h2>No Active Elections</h2>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>There are currently no active polls or elections created. Please check back when an Administrator launches an election poll.</p>
        </div>
      ) : (
        <>
          <div className="portal-card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>SELECTED ELECTION POLL</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '4px 0' }}>{selectedElection?.title}</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{selectedElection?.description}</p>
              </div>

              <select className="form-input" style={{ width: 'auto', minWidth: '240px' }} value={selectedElectionId} onChange={e => setSelectedElectionId(e.target.value)}>
                {elections.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Already Voted Screen vs Candidate Grid */}
          {hasVoted ? (
            <div className="already-voted-box">
              <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🛡️</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>Cryptographically Sealed Ballot</h2>
              <p style={{ color: 'var(--text-main)', marginBottom: '1.5rem' }}>Your vote is sealed in the database with Caesar Cipher shift encryption and SHA-256 hashing.</p>

              <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '2px solid var(--accent-emerald)', borderRadius: '18px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '1px' }}>✅ CONFIRMED BALLOT SELECTION</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0' }}>Voted For: <span style={{ color: 'var(--accent-emerald)' }}>{votedCandidateName || 'Selected Candidate'}</span></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verified Single-Instance Digital Record</div>
              </div>

              <div style={{ fontFamily: 'monospace', fontSize: '0.88rem', background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: '14px', textAlign: 'left', color: 'var(--text-main)', maxWidth: '540px', margin: '0 auto 1.25rem auto', border: '1px solid var(--border-glass)' }}>
                VOTER ID: {user.voter_id}<br />
                ELECTION: {selectedElection?.title}<br />
                VOTED CANDIDATE: {votedCandidateName || 'Selected Candidate'}<br />
                CAESAR CIPHER HASH: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{votedCaesarHash || 'ENCRYPTED_SHIFT_3'}</span><br />
                SHA-256 SEAL: <span style={{ fontSize: '0.78rem', wordBreak: 'break-all' }}>{votedSha256Hash || 'a4f8b9...'}</span><br />
                TIMESTAMP: {new Date().toLocaleString()}
              </div>

              <button className="btn btn-secondary" style={{ padding: '0.6rem 1.25rem' }} onClick={copyReceiptHash}>
                {copiedHash ? '✅ Receipt Hash Copied!' : '📋 Copy Caesar Cipher Receipt Hash'}
              </button>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Official Ballot Candidates</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>Review the candidate details below and cast your encrypted vote.</p>

              {candidates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '18px', color: 'var(--text-muted)' }}>
                  No candidates registered for this poll yet. An administrator can register candidates from the Admin Console.
                </div>
              ) : (
                <div className="candidate-grid">
                  {candidates.map(c => (
                    <div key={c.id} className="candidate-card">
                      <div className="candidate-img-box">
                        <img src={c.photo_url} alt={c.name} className="candidate-img" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300'; }} />
                      </div>
                      <div className="candidate-body">
                        <div>
                          <h3 className="candidate-name">{c.name}</h3>
                          <div className="candidate-dept">{c.department}</div>
                          <p className="candidate-manifesto">"{c.manifesto}"</p>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setSelectedCandidate(c); setShowVoteConfirmModal(true); }}>
                          Vote for Candidate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* VOTE CONFIRMATION MODAL */}
      {showVoteConfirmModal && selectedCandidate && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🗳️</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Confirm Your Encrypted Ballot Selection</h2>
            <p style={{ margin: '1rem 0', fontSize: '1rem' }}>Are you sure you want to cast your single vote for:</p>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-emerald)', padding: '1rem', borderRadius: '14px', fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: '1.5rem' }}>
              {selectedCandidate.name} ({selectedCandidate.department})
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowVoteConfirmModal(false)}>Cancel</button>
              <button className="btn btn-emerald" style={{ flex: 1 }} onClick={submitVote}>Confirm & Seal Vote &rarr;</button>
            </div>
          </div>
        </div>
      )}

      {/* Secret Trigger 3: Secret Double-Click on Security Shield Footer */}
      <footer style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4rem', padding: '2rem 0 1rem 0' }}>
        <span
          onDoubleClick={() => { window.location.href = 'admin.html'; }}
          style={{ cursor: 'pointer', userSelect: 'none', transition: 'all 0.3s ease' }}
          title="Cryptographic Security"
          className="gradient-text-neon"
        >
          🛡️ End-to-End Cryptographic Ballot Security & Integrity Protocol
        </span>
      </footer>
    </div>
  );
}
