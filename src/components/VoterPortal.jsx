import React, { useState, useEffect, useRef } from 'react';

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

  // OTP Engine State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [currentOtpCode, setCurrentOtpCode] = useState('');
  const [pushToastCode, setPushToastCode] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [pendingUser, setPendingUser] = useState(null);

  // Voting Dashboard State
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedCandidateName, setVotedCandidateName] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showVoteConfirmModal, setShowVoteConfirmModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const otpInputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Check saved session
  useEffect(() => {
    const saved = localStorage.getItem('votepulse_voter');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Timer Countdown
  useEffect(() => {
    let interval = null;
    if (showOtpModal && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, timerSeconds]);

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
    setTimeout(() => setAlertMsg(null), 5000);
  };

  const playAudioChime = () => {
    try {
      const soundEnabled = localStorage.getItem('votepulse_sound_enabled') !== 'false';
      if (soundEnabled) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {}
  };

  const triggerOtpDelivery = (code, userObj) => {
    setCurrentOtpCode(code);
    setPushToastCode(code);
    setShowToast(true);
    setPendingUser(userObj);
    setOtpDigits(['', '', '', '', '', '']);
    setTimerSeconds(300);
    setShowOtpModal(true);
    playAudioChime();

    setTimeout(() => {
      setShowToast(false);
    }, 12000);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginVoterId || !loginPassword) return showAlert("Please enter Voter ID and Password.");

    let generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    let userObj = { voter_id: loginVoterId, name: loginVoterId, email: `${loginVoterId.toLowerCase()}@votepulse.org` };

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voter_id: loginVoterId, password: loginPassword })
      });
      if (res.ok) {
        const data = await res.json();
        if (!data.success) return showAlert(data.message);
        userObj = data.user;
        generatedOtp = data.otp_preview || generatedOtp;
      }
    } catch (err) {}

    triggerOtpDelivery(generatedOtp, userObj);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regVoterId || !regName || !regPassword) return showAlert("Please fill out all required fields.");

    let generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    let userObj = { voter_id: regVoterId, name: regName, email: regEmail, phone: regPhone };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voter_id: regVoterId, name: regName, email: regEmail, phone: regPhone, password: regPassword })
      });
      if (res.ok) {
        const data = await res.json();
        if (!data.success) return showAlert(data.message);
        userObj = data.voter;
        generatedOtp = data.otp_preview || generatedOtp;
      }
    } catch (err) {}

    triggerOtpDelivery(generatedOtp, userObj);
  };

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      otpInputRefs[index + 1].current?.focus();
    }

    const fullCode = newDigits.join('');
    if (fullCode.length === 6) {
      verifyOtpCode(fullCode);
    }
  };

  const autoFillToastOtp = () => {
    if (pushToastCode) {
      const arr = pushToastCode.split('');
      setOtpDigits(arr);
      setShowToast(false);
      verifyOtpCode(pushToastCode);
    }
  };

  const verifyOtpCode = async (codeToVerify) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length !== 6) return showAlert("Please enter all 6 digits.");

    let verified = code === currentOtpCode;

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voter_id: pendingUser.voter_id, otp_code: code })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) verified = true;
      }
    } catch (err) {}

    if (verified) {
      localStorage.setItem('votepulse_voter', JSON.stringify(pendingUser));
      setUser(pendingUser);
      setShowOtpModal(false);
      showAlert(`Welcome, ${pendingUser.name}! Real-time OTP Verified.`, 'success');
    } else {
      showAlert("Invalid OTP code. Please check the push toast alert.");
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

    try {
      const res = await fetch(`/api/voter/status/${user.voter_id}/${elecId}`);
      if (res.ok) {
        const data = await res.json();
        voted = data.has_voted;
        if (data.candidate_name) candName = data.candidate_name;
      }
    } catch (err) {}

    setHasVoted(voted);
    setVotedCandidateName(candName);

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
      if (res.ok) {
        const data = await res.json();
        if (!data.success) {
          return showAlert(data.message);
        }
      }
    } catch (err) {}

    localStorage.setItem(`votepulse_voted_${user.voter_id}_${selectedElectionId}`, 'true');
    localStorage.setItem(`votepulse_voted_cand_${user.voter_id}_${selectedElectionId}`, selectedCandidate.name);

    setHasVoted(true);
    setVotedCandidateName(selectedCandidate.name);
    showAlert(`🎉 Vote Successfully Cast for ${selectedCandidate.name}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('votepulse_voter');
    setUser(null);
  };

  // Render Login / Register View if not logged in
  if (!user) {
    return (
      <div class="main-container">
        {/* Floating Push Alert Toast */}
        {showToast && (
          <div class="realtime-push-toast">
            <div style={{ fontSize: '1.8rem' }}>📱</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#b45309' }}>SMS PUSH ALERT NOTIFICATION</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Your OTP is: <strong style={{ color: '#059669', fontSize: '1.1rem' }}>{pushToastCode}</strong></div>
              <button class="btn btn-emerald" style={{ padding: '3px 8px', fontSize: '0.75rem', marginTop: '4px' }} onClick={autoFillToastOtp}>⚡ Auto-Fill OTP</button>
            </div>
          </div>
        )}

        {/* Global Alert Banner */}
        {alertMsg && (
          <div style={{ padding: '1rem', borderRadius: '10px', marginBottom: '1rem', fontWeight: 600, background: alertMsg.type === 'error' ? '#fef2f2' : '#ecfdf5', color: alertMsg.type === 'error' ? '#dc2626' : '#047857', border: `1px solid ${alertMsg.type === 'error' ? '#fecaca' : '#a7f3d0'}` }}>
            {alertMsg.text}
          </div>
        )}

        <div class="auth-box">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 800 }}>Voter Access Portal</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign in or register to participate in active e-voting polls.</p>
          </div>

          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: '10px', marginBottom: '1.5rem' }}>
            <button class={`theme-option-btn ${authTab === 'login' ? 'active' : ''}`} onClick={() => setAuthTab('login')}>Voter Login</button>
            <button class={`theme-option-btn ${authTab === 'register' ? 'active' : ''}`} onClick={() => setAuthTab('register')}>New Registration</button>
          </div>

          {authTab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div class="form-group">
                <label class="form-label">Voter ID / Registered Email</label>
                <input class="form-input" type="text" placeholder="e.g. VOT-202601" value={loginVoterId} onChange={e => setLoginVoterId(e.target.value)} required />
              </div>
              <div class="form-group">
                <label class="form-label">Password</label>
                <input class="form-input" type="password" placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
              </div>
              <button class="btn btn-emerald" style={{ width: '100%', padding: '0.85rem' }} type="submit">
                Sign In & Generate Real-Time OTP &rarr;
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <div class="form-group">
                <label class="form-label">Desired Voter ID</label>
                <input class="form-input" type="text" placeholder="e.g. VOT-8899" value={regVoterId} onChange={e => setRegVoterId(e.target.value)} required />
              </div>
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input class="form-input" type="text" placeholder="John Doe" value={regName} onChange={e => setRegName(e.target.value)} required />
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input class="form-input" type="email" placeholder="voter@example.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
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
                Register & Send OTP Code &rarr;
              </button>
            </form>
          )}
        </div>

        {/* 6-DIGIT OTP VERIFICATION MODAL */}
        {showOtpModal && (
          <div class="modal-backdrop">
            <div class="modal-content" style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>🔐 Enter 6-Digit Real-Time OTP</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '6px 0 1rem 0' }}>Code sent for Voter ID: <strong>{pendingUser?.voter_id}</strong></p>

              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, display: 'inline-block' }}>
                ⏱️ Code Expires in {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
              </div>

              <div class="otp-digits-row">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpInputRefs[idx]}
                    class="otp-digit-input"
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleDigitChange(idx, e.target.value)}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button class="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowOtpModal(false)}>Cancel</button>
                <button class="btn btn-emerald" style={{ flex: 1 }} onClick={() => verifyOtpCode()}>Verify & Enter &rarr;</button>
              </div>
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
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Logged in as: </span>
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
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-emerald)', textTransform: uppercase }}>SELECTED ELECTION POLL</span>
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

          {/* Already Voted Receipt Screen vs Candidate Grid */}
          {hasVoted ? (
            <div class="already-voted-box">
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🛡️</div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginBottom: '0.5rem' }}>Ballot Verified & Sealed</h2>
              <p style={{ color: 'var(--text-main)', marginBottom: '1.25rem' }}>Your single vote has been recorded on the server. Multiple voting is strictly prohibited.</p>

              <div style={{ background: 'rgba(5, 150, 105, 0.12)', border: '2px solid #059669', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '1px' }}>✅ CONFIRMED BALLOT SELECTION</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '6px 0' }}>Voted For: <span style={{ color: '#059669' }}>{votedCandidateName || 'Selected Candidate'}</span></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verified Digital Vote Record</div>
              </div>

              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', background: 'rgba(0,0,0,0.04)', padding: '1rem', borderRadius: '10px', textAlign: 'left', color: 'var(--text-main)', maxWidth: '440px', margin: '0 auto' }}>
                VOTER ID: {user.voter_id}<br />
                ELECTION: {selectedElection?.title}<br />
                VOTED CANDIDATE: {votedCandidateName || 'Selected Candidate'}<br />
                STATUS: VERIFIED & SEALED<br />
                TIMESTAMP: {new Date().toLocaleString()}<br />
                DIGITAL RECEIPT: #{Math.floor(100000 + Math.random() * 900000)}
              </div>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Official Ballot Candidates</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Review the manifesto of each candidate below and select your preferred candidate to cast your vote.</p>

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
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Confirm Your Official Ballot Selection</h2>
            <p style={{ margin: '1rem 0', fontSize: '1rem' }}>Are you sure you want to cast your single vote for:</p>
            <div style={{ background: 'rgba(37, 99, 235, 0.1)', border: '1px solid #2563eb', padding: '1rem', borderRadius: '12px', fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem' }}>
              {selectedCandidate.name} ({selectedCandidate.department})
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button class="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowVoteConfirmModal(false)}>Cancel</button>
              <button class="btn btn-emerald" style={{ flex: 1 }} onClick={submitVote}>Confirm & Cast Vote &rarr;</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
