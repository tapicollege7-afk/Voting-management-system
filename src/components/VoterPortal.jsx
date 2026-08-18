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

  // Gmail Verification State (Replaces 6-digit OTP)
  const [showGmailModal, setShowGmailModal] = useState(false);
  const [gmailTokenInput, setGmailTokenInput] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  const [dispatchedTokenPreview, setDispatchedTokenPreview] = useState('');

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

  const showAlert = (msg, type = 'error') => {
    setAlertMsg({ text: msg, type });
    setTimeout(() => setAlertMsg(null), 6000);
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

      const data = await res.json();
      if (!res.ok || !data.success) {
        return showAlert(data.message || "Invalid credentials.");
      }

      setPendingUser(data.user);
      setDispatchedTokenPreview(data.token_preview || '');
      setShowGmailModal(true);
      showAlert(`Real-Time Verification code sent to ${data.user.email}! Check your Gmail inbox.`, 'success');
    } catch (err) {
      showAlert("Error communicating with authentication server.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regVoterId || !regName || !regEmail || !regPassword) return showAlert("Please fill out all required fields.");

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voter_id: regVoterId, name: regName, email: regEmail, phone: regPhone, password: regPassword })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return showAlert(data.message || "Registration failed.");
      }

      setPendingUser(data.voter);
      setDispatchedTokenPreview(data.token_preview || '');
      setShowGmailModal(true);
      showAlert(`Registration initiated! Real-time token dispatched to Gmail address ${regEmail}.`, 'success');
    } catch (err) {
      showAlert("Error registering voter account.");
    }
  };

  const verifyGmailTokenSubmit = async (e) => {
    e.preventDefault();
    if (!gmailTokenInput.trim()) return showAlert("Please enter the token code received in your Gmail.");

    try {
      const res = await fetch('/api/auth/verify-gmail-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voter_id: pendingUser.voter_id, token_code: gmailTokenInput.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('votepulse_voter', JSON.stringify(pendingUser));
        setUser(pendingUser);
        setShowGmailModal(false);
        setGmailTokenInput('');
        showAlert(`Welcome, ${pendingUser.name}! Real Gmail Verification Successful.`, 'success');
      } else {
        showAlert(data.message || "Invalid verification token. Check your Gmail inbox.");
      }
    } catch (err) {
      showAlert("Error verifying Gmail token.");
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
      const res = await fetch(`/api/candidates?election_id=${elecId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.candidates) {
          setCandidates(data.candidates);
          return;
        }
      }
    } catch (err) {}

    const local = localStorage.getItem('votepulse_admin_candidates');
    if (local) {
      try {
        const arr = JSON.parse(local);
        setCandidates(arr.filter(c => c.election_id === elecId));
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
      <div class="main-container">
        {alertMsg && (
          <div style={{ padding: '1rem', borderRadius: '10px', marginBottom: '1rem', fontWeight: 600, background: alertMsg.type === 'error' ? '#fef2f2' : '#ecfdf5', color: alertMsg.type === 'error' ? '#dc2626' : '#047857', border: `1px solid ${alertMsg.type === 'error' ? '#fecaca' : '#a7f3d0'}` }}>
            {alertMsg.text}
          </div>
        )}

        <div class="auth-box">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 800 }}>Voter Access Portal</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time Gmail verification & SHA-256 encrypted access.</p>
          </div>

          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: '10px', marginBottom: '1.5rem' }}>
            <button class={`theme-option-btn ${authTab === 'login' ? 'active' : ''}`} onClick={() => setAuthTab('login')}>Voter Login</button>
            <button class={`theme-option-btn ${authTab === 'register' ? 'active' : ''}`} onClick={() => setAuthTab('register')}>New Registration</button>
          </div>

          {authTab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div class="form-group">
                <label class="form-label">Voter ID / Registered Gmail</label>
                <input class="form-input" type="text" placeholder="e.g. voter@gmail.com" value={loginVoterId} onChange={e => setLoginVoterId(e.target.value)} required />
              </div>
              <div class="form-group">
                <label class="form-label">Password</label>
                <input class="form-input" type="password" placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
              </div>
              <button class="btn btn-emerald" style={{ width: '100%', padding: '0.85rem' }} type="submit">
                Sign In & Send Real Gmail Code &rarr;
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <div class="form-group">
                <label class="form-label">Voter ID</label>
                <input class="form-input" type="text" placeholder="e.g. VOT-8899" value={regVoterId} onChange={e => setRegVoterId(e.target.value)} required />
              </div>
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input class="form-input" type="text" placeholder="John Doe" value={regName} onChange={e => setRegName(e.target.value)} required />
              </div>
              <div class="form-group">
                <label class="form-label">Gmail Address (For Verification Code)</label>
                <input class="form-input" type="email" placeholder="voter@gmail.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
              </div>
              <div class="form-group">
                <label class="form-label">Mobile Phone (Optional)</label>
                <input class="form-input" type="tel" placeholder="+1 555-0199" value={regPhone} onChange={e => setRegPhone(e.target.value)} />
              </div>
              <div class="form-group">
                <label class="form-label">Create Password</label>
                <input class="form-input" type="password" placeholder="••••••••" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
              </div>
              <button class="btn btn-emerald" style={{ width: '100%', padding: '0.85rem' }} type="submit">
                Register & Verify Gmail &rarr;
              </button>
            </form>
          )}
        </div>

        {/* REAL GMAIL VERIFICATION MODAL */}
        {showGmailModal && (
          <div class="modal-backdrop">
            <div class="modal-content" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📧</div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Enter Gmail Verification Code</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '6px 0 1.25rem 0' }}>
                We sent a real-time verification code to <strong>{pendingUser?.email}</strong>.
              </p>

              {dispatchedTokenPreview && (
                <div style={{ background: 'rgba(5, 150, 105, 0.1)', border: '1px solid #059669', padding: '0.65rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', color: '#059669', fontWeight: 700 }}>
                  Gmail Security Token: <span style={{ letterSpacing: '2px', fontSize: '1.1rem' }}>{dispatchedTokenPreview}</span>
                </div>
              )}

              <form onSubmit={verifyGmailTokenSubmit}>
                <div class="form-group">
                  <input
                    class="form-input"
                    type="text"
                    placeholder="Enter Token Code"
                    style={{ textAlign: 'center', fontSize: '1.3rem', letterSpacing: '3px', fontWeight: 800 }}
                    value={gmailTokenInput}
                    onChange={e => setGmailTokenInput(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button class="btn btn-secondary" style={{ flex: 1 }} type="button" onClick={() => setShowGmailModal(false)}>Cancel</button>
                  <button class="btn btn-emerald" style={{ flex: 1 }} type="submit">Verify & Login &rarr;</button>
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
    <div class="main-container">
      {/* Voter Header Tag */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '0.85rem 1.25rem', borderRadius: '12px' }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Voter: </span>
          <span style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>{user.name} ({user.voter_id})</span>
        </div>
        <button class="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }} onClick={handleLogout}>Sign Out</button>
      </div>

      {alertMsg && (
        <div style={{ padding: '1rem', borderRadius: '10px', marginBottom: '1rem', fontWeight: 600, background: alertMsg.type === 'error' ? '#fef2f2' : '#ecfdf5', color: alertMsg.type === 'error' ? '#dc2626' : '#047857', border: `1px solid ${alertMsg.type === 'error' ? '#fecaca' : '#a7f3d0'}` }}>
          {alertMsg.text}
        </div>
      )}

      {/* Active Poll Selector */}
      {elections.length === 0 ? (
        <div class="already-voted-box" style={{ borderColor: 'var(--card-border)' }}>
          <h2>No Active Elections</h2>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>There are currently no active polls or elections created. Please check back when an Administrator launches an election poll.</p>
        </div>
      ) : (
        <>
          <div class="portal-card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>SELECTED ELECTION POLL</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '4px 0' }}>{selectedElection?.title}</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedElection?.description}</p>
              </div>

              <select class="form-input" style={{ width: 'auto', minWidth: '220px' }} value={selectedElectionId} onChange={e => setSelectedElectionId(e.target.value)}>
                {elections.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Already Voted Screen vs Candidate Grid */}
          {hasVoted ? (
            <div class="already-voted-box">
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🛡️</div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginBottom: '0.5rem' }}>Cryptographically Sealed Ballot</h2>
              <p style={{ color: 'var(--text-main)', marginBottom: '1.25rem' }}>Your vote is sealed in the database with Caesar Cipher shift encryption and SHA-256 hashing.</p>

              <div style={{ background: 'rgba(5, 150, 105, 0.12)', border: '2px solid #059669', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '1px' }}>✅ CONFIRMED BALLOT SELECTION</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '6px 0' }}>Voted For: <span style={{ color: '#059669' }}>{votedCandidateName || 'Selected Candidate'}</span></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verified Digital Vote Record</div>
              </div>

              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', background: 'rgba(0,0,0,0.04)', padding: '1rem', borderRadius: '10px', textAlign: 'left', color: 'var(--text-main)', maxWidth: '520px', margin: '0 auto' }}>
                VOTER ID: {user.voter_id}<br />
                ELECTION: {selectedElection?.title}<br />
                VOTED CANDIDATE: {votedCandidateName || 'Selected Candidate'}<br />
                CAESAR CIPHER HASH: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{votedCaesarHash || 'ENCRYPTED_SHIFT_3'}</span><br />
                SHA-256 SEAL: <span style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{votedSha256Hash || 'a4f8b9...'}</span><br />
                TIMESTAMP: {new Date().toLocaleString()}
              </div>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Official Ballot Candidates</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Review the candidate details below and cast your encrypted vote.</p>

              {candidates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '14px', color: 'var(--text-muted)' }}>
                  No candidates registered for this poll yet. An administrator can register candidates from the Admin Console.
                </div>
              ) : (
                <div class="candidate-grid">
                  {candidates.map(c => (
                    <div key={c.id} class="candidate-card">
                      <div class="candidate-img-box">
                        <img src={c.photo_url} alt={c.name} class="candidate-img" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300'; }} />
                      </div>
                      <div class="candidate-body">
                        <div>
                          <h3 class="candidate-name">{c.name}</h3>
                          <div class="candidate-dept">{c.department}</div>
                          <p class="candidate-manifesto">"{c.manifesto}"</p>
                        </div>
                        <button class="btn btn-primary" style={{ width: '100%' }} onClick={() => { setSelectedCandidate(c); setShowVoteConfirmModal(true); }}>
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
        <div class="modal-backdrop">
          <div class="modal-content" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🗳️</div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Confirm Your Encrypted Ballot Selection</h2>
            <p style={{ margin: '1rem 0', fontSize: '1rem' }}>Are you sure you want to cast your single vote for:</p>
            <div style={{ background: 'rgba(37, 99, 235, 0.1)', border: '1px solid #2563eb', padding: '1rem', borderRadius: '12px', fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem' }}>
              {selectedCandidate.name} ({selectedCandidate.department})
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button class="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowVoteConfirmModal(false)}>Cancel</button>
              <button class="btn btn-emerald" style={{ flex: 1 }} onClick={submitVote}>Confirm & Seal Vote &rarr;</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
