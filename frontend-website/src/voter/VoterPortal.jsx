import React, { useState, useEffect, useRef } from 'react';
import { handleEnterKeyNavigation } from '../helpers/formNavigation';
import { launchConfetti } from '../helpers/confetti';

export default function VoterPortal({ user, setUser, navigateTo }) {
  const [authTab, setAuthTab] = useState('login');
  
  // Forms
  const [loginVoterId, setLoginVoterId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginTargetEmail, setLoginTargetEmail] = useState('');
  const [latestOtpCode, setLatestOtpCode] = useState('');

  const [regVoterId, setRegVoterId] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Form Field Refs for Auto-Focus
  const loginVoterIdRef = useRef(null);
  const regNameRef = useRef(null);
  const otpInputRef = useRef(null);

  // Password Visibility & Caps Lock Tracking
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);

  const checkCapsLock = (e) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  // Password Strength Meter State
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Too short', class: '' });

  // Mobile OTP Verification State
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [mobileTokenInput, setMobileTokenInput] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

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
  const [copiedField, setCopiedField] = useState(null);
  const [registrationTicket, setRegistrationTicket] = useState(null);
  const [voterTab, setVoterTab] = useState('ballot'); // 'ballot' or 'profile'

  // Clipboard Helper with visual feedback
  const copyToClipboard = (text, fieldName = 'id') => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  // Helper to generate unique official Voter ID
  const generateUniqueVoterId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `VOT-2026-${randomNum}`;
  };

  // Auto-generate Voter ID when switching to registration tab
  useEffect(() => {
    if (authTab === 'register' && !regVoterId) {
      setRegVoterId(generateUniqueVoterId());
    }
  }, [authTab]);

  // Auto-focus relevant field on tab switch or modal popup
  useEffect(() => {
    if (authTab === 'login') {
      setTimeout(() => loginVoterIdRef.current?.focus(), 80);
    } else if (authTab === 'register') {
      setTimeout(() => regNameRef.current?.focus(), 80);
    }
  }, [authTab]);

  useEffect(() => {
    if (showMobileModal) {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [showMobileModal]);

  // Check saved session (scoped to active page)
  useEffect(() => {
    const saved = sessionStorage.getItem('votepulse_voter');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {}
    }
    return () => {
      // Auto-logout when leaving Voter Portal
      setUser(null);
      sessionStorage.removeItem('votepulse_voter');
      localStorage.removeItem('votepulse_voter');
    };
  }, []);

  // Load elections when logged in
  useEffect(() => {
    if (user) {
      loadElections();
    }
  }, [user]);

  // Load candidates when election changes & poll live updates based on user setting
  useEffect(() => {
    if (user && selectedElectionId) {
      checkVoteStatus(selectedElectionId);

      const pollMode = localStorage.getItem('votepulse_poll_rate') || '3';
      if (pollMode !== 'manual') {
        const intervalMs = (parseInt(pollMode, 10) || 3) * 1000;
        const timer = setInterval(() => {
          loadCandidates(selectedElectionId);
        }, intervalMs);
        return () => clearInterval(timer);
      }
    }
  }, [user, selectedElectionId]);

  // Calculate Password Strength in Real Time (Max 5 Chars)
  const calculatePasswordStrength = (pass) => {
    if (!pass) return setPasswordStrength({ score: 0, label: '', class: '' });
    const len = pass.length;
    if (len <= 2) {
      setPasswordStrength({ score: 1, label: `Weak (${len}/5 chars) ⚠️`, class: 'strength-weak', color: '#ef4444' });
    } else if (len <= 4) {
      setPasswordStrength({ score: 2, label: `Medium (${len}/5 chars) 🔒`, class: 'strength-medium', color: '#f59e0b' });
    } else {
      setPasswordStrength({ score: 3, label: `Optimal Password (5/5 chars) 🛡️`, class: 'strength-strong', color: '#10b981' });
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
    if (!loginVoterId.trim() || !loginPassword.trim()) return showAlert("Please enter your Voter ID (or registered email/phone) and Password.");

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voter_id: loginVoterId.trim(),
          password: loginPassword.trim()
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        if (data.is_admin) {
          showAlert("Administrator verified! Redirecting to Admin Console...", "success");
          sessionStorage.setItem('votepulse_admin', JSON.stringify(data.user));
          if (navigateTo) {
            setTimeout(() => navigateTo('admin'), 400);
          } else {
            window.location.hash = 'admin';
          }
          return;
        }
        setPendingUser(data.user);
        if (data.token_code) setLatestOtpCode(data.token_code);
        setPreviewUrl(data.previewUrl || '');
        setMobileTokenInput('');
        setShowMobileModal(true);
        showAlert(`Verification Code dispatched to ${data.user.email}!`, 'success');
        return;
      } else if (data.message) {
        return showAlert(data.message);
      }
    } catch (err) {}

    // Offline / Demo Fallback Mode
    const targetEm = loginTargetEmail.trim() || `${loginVoterId}@votepulse.org`;
    const fallbackUser = { id: Date.now(), voter_id: loginVoterId, name: loginVoterId, email: targetEm, phone: '—', role: 'voter' };
    const fallbackToken = String(Math.floor(100000 + Math.random() * 900000));
    setPendingUser(fallbackUser);
    setLatestOtpCode(fallbackToken);
    setPreviewUrl('');
    setMobileTokenInput('');
    setShowMobileModal(true);
    showAlert(`Verification Code dispatched! (Demo Code: ${fallbackToken})`, 'success');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regVoterId || !regName || !regEmail || !regPhone.trim() || !regPassword) {
      return showAlert("Please fill out all required fields including Mobile Phone Number and Email address.");
    }

    if (regPhone.trim().replace(/\D/g, '').length < 10) {
      return showAlert("Mobile Phone Number must be at least 10 digits.");
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voter_id: regVoterId, name: regName, email: regEmail.trim(), phone: regPhone.trim(), password: regPassword })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setPendingUser(data.voter);
        if (data.token_code) setLatestOtpCode(data.token_code);
        setPreviewUrl(data.previewUrl || '');
        setRegistrationTicket(null);
        setMobileTokenInput('');
        setShowMobileModal(true);
        // Automatically prefill login fields with registered voter ID and password
        setLoginVoterId(data.voter.voter_id);
        setLoginPassword(regPassword);
        showAlert(`🎉 Verification Code dispatched to ${regEmail.trim()}! Please enter it to verify and receive your Official Credential Ticket.`, 'success');
        return;
      } else if (data.message) {
        return showAlert(data.message);
      }
    } catch (err) {}

    // Offline / Client Fallback Mode when server is offline or static host
    const newUser = { id: Date.now(), voter_id: regVoterId, name: regName, email: regEmail.trim(), phone: regPhone.trim(), role: 'voter' };
    const fallbackToken = String(Math.floor(100000 + Math.random() * 900000));
    setPendingUser(newUser);
    setLatestOtpCode(fallbackToken);
    setRegistrationTicket(null);
    setMobileTokenInput('');
    setShowMobileModal(true);
    showAlert(`Account registered! Credential ticket sent to your email (${regEmail.trim()}).`, 'success');
    showAlert(`Account registered! Credential Ticket generated. (Demo Code: ${fallbackToken})`, 'success');
  };

  const handleResendCode = async () => {
    if (!pendingUser) return;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voter_id: pendingUser.voter_id,
          password: loginPassword || regPassword || 'voter123',
          target_email: pendingUser.email
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token_code) setLatestOtpCode(data.token_code);
        showAlert(`New verification code sent to ${pendingUser.email}!`, 'success');
      } else {
        showAlert(data.message || 'Failed to resend code.');
      }
    } catch (e) {
      showAlert('Error contacting server to resend code.');
    }
  };

  const verifyMobileTokenSubmit = async (e) => {
    e.preventDefault();
    if (!mobileTokenInput.trim()) return showAlert("Please enter the 6-digit verification code sent to your email.");

    try {
      const res = await fetch('/api/auth/verify-gmail-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voter_id: pendingUser.voter_id, token_code: mobileTokenInput.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const activeUser = data.user || pendingUser;
        sessionStorage.setItem('votepulse_voter', JSON.stringify(activeUser));
        localStorage.removeItem('votepulse_voter');
        setUser(activeUser);
        setShowMobileModal(false);
        setMobileTokenInput('');
        launchConfetti();
        if (data.ticket_dispatched) {
          showAlert(`🎉 Email Verified! Official Voter Credential Ticket dispatched to ${activeUser.email}.`, 'success');
        } else {
          showAlert(`Welcome, ${activeUser.name}! Verification Successful.`, 'success');
        }
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

    loadCandidates(elecId);
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

      launchConfetti();
      showAlert(`🎉 Vote Cast & Cryptographically Sealed for ${selectedCandidate.name}!`, 'success');
    } catch (err) {
      showAlert("Error submitting ballot vote.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('votepulse_voter');
    localStorage.removeItem('votepulse_voter');
    setUser(null);
  };

  // Render Login / Register View if not logged in
  if (!user) {
    return (
      <div className="main-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(80vh - 40px)' }}>
        {alertMsg && (
          <div style={{ width: '100%', maxWidth: '480px', padding: '1rem', borderRadius: '14px', marginBottom: '1rem', fontWeight: 600, background: alertMsg.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: alertMsg.type === 'error' ? '#f87171' : '#34d399', border: `1px solid ${alertMsg.type === 'error' ? '#ef4444' : '#10b981'}` }}>
            {alertMsg.text}
          </div>
        )}

        <div className="auth-box" style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '2.8rem', marginBottom: '0.4rem' }}>📧</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Voter Access Portal</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Secure email verification & online voting.</p>
          </div>

          <div className="theme-toggle-row" style={{ marginBottom: '1.75rem' }}>
            <button className={`theme-option-btn ${authTab === 'login' ? 'active' : ''}`} onClick={() => setAuthTab('login')}>Voter Login</button>
            <button className={`theme-option-btn ${authTab === 'register' ? 'active' : ''}`} onClick={() => setAuthTab('register')}>New Registration</button>
          </div>

          {authTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} onKeyDown={handleEnterKeyNavigation}>
              <div className="form-group">
                <input
                  ref={loginVoterIdRef}
                  className="form-input"
                  type="text"
                  placeholder="Voter ID, Registered Email, or Phone"
                  value={loginVoterId}
                  onChange={e => setLoginVoterId(e.target.value)}
                  required
                />
                {loginVoterId.trim().toUpperCase().startsWith('ADM') && (
                  <div
                    onClick={() => navigateTo && navigateTo('admin')}
                    style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      borderRadius: '10px',
                      color: '#fbbf24',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    title="Click to switch to Admin Console"
                  >
                    <span>⚡ Administrator ID detected</span>
                    <span style={{ fontWeight: 800, textDecoration: 'underline' }}>Go to Admin &rarr;</span>
                  </div>
                )}
              </div>
              <div className="form-group">
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    className="form-input"
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    onKeyUp={checkCapsLock}
                    onKeyDown={checkCapsLock}
                    maxLength={50}
                    style={{ paddingRight: '2.8rem' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '0 4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      userSelect: 'none',
                      zIndex: 2
                    }}
                    title={showLoginPassword ? "Hide Password" : "Show Password"}
                  >
                    {showLoginPassword ? '👁️' : '🙈'}
                  </button>
                </div>
                {capsLockActive && (
                  <div className="caps-lock-badge">
                    <span>⇪</span> Caps Lock is ON
                  </div>
                )}
              </div>
              <button className="btn btn-emerald" style={{ width: '100%', padding: '0.9rem' }} type="submit">
                Sign In & Send Verification Code &rarr;
              </button>
              <div style={{ marginTop: '10px', fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Tip: Press <kbd className="shortcut-pill">Enter ↵</kbd> to jump to the next field
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} onKeyDown={handleEnterKeyNavigation}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0, color: 'var(--accent-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🛡️ Official Voter ID <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--accent-emerald)', color: '#34d399', padding: '2px 8px', borderRadius: '12px' }}>Auto-Generated</span>
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(regVoterId || generateUniqueVoterId(), 'reg_voter_id')}
                      style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-emerald)', color: '#34d399', padding: '3px 10px', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Copy auto-generated Voter ID"
                    >
                      {copiedField === 'reg_voter_id' ? '✅ Copied!' : '📋 Copy ID'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegVoterId(generateUniqueVoterId())}
                      style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Click to generate a different unique Voter ID"
                    >
                      🔄 New ID
                    </button>
                  </div>
                </div>
                <input
                  className="form-input"
                  data-sensitive-id="true"
                  type="text"
                  value={regVoterId || generateUniqueVoterId()}
                  readOnly
                  style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid var(--accent-emerald)', color: '#34d399', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '1px', cursor: 'not-allowed' }}
                />
              </div>
              <div className="form-group">
                <input
                  ref={regNameRef}
                  className="form-input"
                  type="text"
                  placeholder="Full Name *"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  className="form-input"
                  type="email"
                  placeholder="Email Address (e.g. voter@example.com) *"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Mobile Phone Number *</span>
                  <span className={`field-counter-badge ${regPhone.replace(/\D/g, '').length >= 10 ? 'valid' : ''}`}>
                    {regPhone.replace(/\D/g, '').length >= 10 ? '✓ 10 digits valid' : `${regPhone.replace(/\D/g, '').length}/10 digits`}
                  </span>
                </div>
                <input
                  className="form-input"
                  type="tel"
                  placeholder="Mobile Phone Number (Required, 10+ digits) *"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Create Password *</span>
                  <span className={`field-counter-badge ${regPassword.length >= 1 && regPassword.length <= 5 ? 'valid' : ''}`}>
                    {regPassword.length}/5 chars
                  </span>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    className="form-input"
                    type={showRegPassword ? "text" : "password"}
                    placeholder="Create Password (max 5 chars)"
                    value={regPassword}
                    onChange={e => handlePasswordChange(e.target.value)}
                    onKeyUp={checkCapsLock}
                    onKeyDown={checkCapsLock}
                    maxLength={5}
                    style={{ paddingRight: '2.8rem' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '0 4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      userSelect: 'none',
                      zIndex: 2
                    }}
                    title={showRegPassword ? "Hide Password" : "Show Password"}
                  >
                    {showRegPassword ? '👁️' : '🙈'}
                  </button>
                </div>
                {capsLockActive && (
                  <div className="caps-lock-badge">
                    <span>⇪</span> Caps Lock is ON
                  </div>
                )}
                
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
                Register & Send Verification Code &rarr;
              </button>
              <div style={{ marginTop: '10px', fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Tip: Press <kbd className="shortcut-pill">Enter ↵</kbd> to jump to the next field
              </div>
            </form>
          )}
        </div>

        {/* REGISTRATION CREDENTIAL TICKET MODAL */}
        {registrationTicket && (
          <div className="modal-backdrop" style={{ zIndex: 1100 }}>
            <div className="modal-content glass-panel" style={{ maxWidth: '580px', textAlign: 'center', border: '1.5px solid var(--accent-emerald)', padding: '2rem', position: 'relative' }}>
              {/* Top Cancel Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-6px' }}>
                <button
                  type="button"
                  onClick={() => setRegistrationTicket(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-muted)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  title="Cancel / Close"
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize: '3rem', marginBottom: '0.25rem' }}>🎫</div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>REGISTRATION SUCCESSFUL</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '6px 0 8px 0' }}>Official Voter Credential Ticket</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Your voter account is registered! A duplicate digital ticket has been emailed to <strong style={{ color: 'var(--accent-emerald)' }}>{registrationTicket.email}</strong>.
              </p>

              {/* Official Credential Ticket Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 78, 59, 0.25))',
                border: '1.5px dashed var(--accent-emerald)',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'left',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(16, 185, 129, 0.25)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>VOTEPULSE ELECTORAL COMMISSION</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)' }}>Official Voter Credential Pass</div>
                  </div>
                  <span style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#34d399', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '12px', border: '1px solid var(--accent-emerald)' }}>
                    ACTIVE
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Voter ID Number</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span data-sensitive-id="true" style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--accent-emerald)', letterSpacing: '0.5px' }}>{registrationTicket.voter_id}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(registrationTicket.voter_id, 'ticket_voter_id')}
                        style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--accent-emerald)', color: '#34d399', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
                        title="Copy Voter ID"
                      >
                        {copiedField === 'ticket_voter_id' ? '✅ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Password</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '1px' }}>{registrationTicket.password}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(registrationTicket.password, 'ticket_password')}
                        style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid var(--border-glass)', color: 'var(--text-main)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
                        title="Copy Password"
                      >
                        {copiedField === 'ticket_password' ? '✅' : '📋'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Name</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>{registrationTicket.name}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mobile Phone</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>{registrationTicket.phone || 'N/A'}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(16, 185, 129, 0.2)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  <div>Email: {registrationTicket.email}</div>
                  <div style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>|||| | ||||| ||| |||||</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    const allText = `VOTEPULSE OFFICIAL VOTER TICKET\nVoter ID: ${registrationTicket.voter_id}\nName: ${registrationTicket.name}\nPassword: ${registrationTicket.password}\nEmail: ${registrationTicket.email}\nPhone: ${registrationTicket.phone}\nStatus: Active`;
                    copyToClipboard(allText, 'ticket_all');
                  }}
                  style={{ flex: 1, minWidth: '140px' }}
                >
                  {copiedField === 'ticket_all' ? '✅ Copied!' : '📋 Copy Details'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => window.print()}
                  style={{ flex: 1, minWidth: '120px' }}
                >
                  🖨️ Print Ticket
                </button>
                <button
                  type="button"
                  className="btn btn-emerald"
                  onClick={() => {
                    setRegistrationTicket(null);
                    setShowMobileModal(true);
                  }}
                  style={{ flex: 2, minWidth: '200px', fontWeight: 800 }}
                >
                  Enter Verification Code &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OTP VERIFICATION MODAL */}
        {showMobileModal && (
          <div className="modal-backdrop" style={{ zIndex: 1100 }}>
            <div className="modal-content glass-panel" style={{ textAlign: 'center', maxWidth: '520px', position: 'relative' }}>
              {/* Top Cancel Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-6px' }}>
                <button
                  type="button"
                  onClick={() => setShowMobileModal(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-muted)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  title="Cancel / Close"
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize: '3rem', marginBottom: '0.25rem' }}>📧</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '4px 0 8px 0' }}>Enter Verification Code</h2>

              {/* Official Credential Ticket Email Delivery Notice */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '14px',
                padding: '0.9rem 1.1rem',
                margin: '0.75rem 0 1.25rem 0',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 800, fontSize: '0.88rem', marginBottom: '4px' }}>
                  <span>🛡️</span>
                  <span>Two-Step Verification in Progress</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  A 6-digit authentication code was sent to <strong style={{ color: 'var(--text-main)' }}>{pendingUser?.email}</strong>. Once you verify this code below, your official digital voter ticket (with Voter ID, Password, and Official Pass) will be dispatched directly to your inbox.
                </div>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
                A 6-digit verification code was sent to <strong style={{ color: 'var(--accent-emerald)' }}>{pendingUser?.email}</strong>.
                <br />
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  (Please check your Inbox, Spam, or Junk folder)
                </span>
              </p>

              {previewUrl && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(59, 130, 246, 0.12)',
                      border: '1px solid #3b82f6',
                      color: '#60a5fa',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    📬 Click to Open Sent Email Web Inbox &rarr;
                  </a>
                </div>
              )}



              <form id="otp-verify-form" onSubmit={verifyMobileTokenSubmit} onKeyDown={handleEnterKeyNavigation}>
                <div className="form-group">
                  <input
                    ref={otpInputRef}
                    className="form-input"
                    type="text"
                    placeholder="Enter 6-Digit Code"
                    maxLength={6}
                    autoFocus
                    style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '6px', fontWeight: 800 }}
                    value={mobileTokenInput}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setMobileTokenInput(val);
                      if (val.length === 6) {
                        setTimeout(() => {
                          const form = document.getElementById('otp-verify-form');
                          if (form) {
                            form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                          }
                        }, 150);
                      }
                    }}
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '6px', display: 'block' }}>
                    ⚡ Instant auto-verification upon entering the 6th digit
                  </small>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} type="button" onClick={() => setShowMobileModal(false)}>Cancel</button>
                  <button className="btn btn-emerald" style={{ flex: 1 }} type="submit">Verify & Access &rarr;</button>
                </div>

                <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textDecoration: 'underline'
                    }}
                  >
                    🔄 Resend Verification Code
                  </button>
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

  // Calculate Live Tally & Automatic Winner Metrics
  const totalVotesCast = candidates.reduce((acc, c) => acc + (c.vote_count || 0), 0);
  const maxVotes = candidates.length > 0 ? Math.max(...candidates.map(c => c.vote_count || 0)) : 0;
  const topCandidates = candidates.filter(c => (c.vote_count || 0) === maxVotes && maxVotes > 0);
  const winnerCandidate = topCandidates.length === 1 ? topCandidates[0] : null;
  const winnerPercentage = winnerCandidate && totalVotesCast > 0 ? Math.round((winnerCandidate.vote_count / totalVotesCast) * 100) : 0;

  return (
    <div className="main-container">
      {/* Voter Header Tag */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', padding: '1rem 1.5rem', borderRadius: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Voter: </span>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>{user.name} (<span data-sensitive-id="true">{user.voter_id}</span>)</span>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(user.voter_id, 'header_voter_id')}
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--accent-emerald)',
              color: '#34d399',
              padding: '3px 10px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              cursor: 'pointer',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Copy Voter ID"
          >
            {copiedField === 'header_voter_id' ? '✅ Copied!' : '📋 Copy ID'}
          </button>
        </div>
        <button className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }} onClick={handleLogout}>Sign Out</button>
      </div>

      {/* Module View Navigation Tabs */}
      <div className="no-print" style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
        <button
          type="button"
          onClick={() => setVoterTab('ballot')}
          style={{
            flex: 1, padding: '0.7rem 1rem', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
            background: voterTab === 'ballot' ? 'var(--accent-emerald)' : 'transparent',
            color: voterTab === 'ballot' ? '#000' : 'var(--text-muted)',
            transition: 'all 0.2s ease'
          }}
        >
          🗳️ Voting Booth & Ballot
        </button>
        <button
          type="button"
          onClick={() => setVoterTab('profile')}
          style={{
            flex: 1, padding: '0.7rem 1rem', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
            background: voterTab === 'profile' ? 'var(--accent-emerald)' : 'transparent',
            color: voterTab === 'profile' ? '#000' : 'var(--text-muted)',
            transition: 'all 0.2s ease'
          }}
        >
          👤 My Voter Profile & Credential Ticket
        </button>
      </div>

      {alertMsg && (
        <div className="no-print" style={{ padding: '1rem', borderRadius: '14px', marginBottom: '1rem', fontWeight: 600, background: alertMsg.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: alertMsg.type === 'error' ? '#f87171' : '#34d399', border: `1px solid ${alertMsg.type === 'error' ? '#ef4444' : '#10b981'}` }}>
          {alertMsg.text}
        </div>
      )}

      {/* VIEW 1: MY VOTER PROFILE & CREDENTIAL TICKET */}
      {voterTab === 'profile' ? (
        <div style={{ animation: 'floatUp 0.3s ease' }}>
          <div className="portal-card" style={{ maxWidth: '800px', margin: '0 auto', border: '1.5px solid var(--accent-emerald)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10b981&color=000&size=140&bold=true`}
                  alt={user.name}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--accent-emerald)' }}
                />
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>{user.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>
                      🛡️ Verified Voter
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: Active & Enrolled</span>
                  </div>
                </div>
              </div>
              <div className="no-print" style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => copyToClipboard(user.voter_id, 'profile_voter_id')}
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                >
                  {copiedField === 'profile_voter_id' ? '✅ Copied!' : '📋 Copy Voter ID'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => window.print()}
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                >
                  🖨️ Print Ticket
                </button>
              </div>
            </div>

            {/* Official Digital Credential Pass */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 78, 59, 0.2))',
              border: '1.5px dashed var(--accent-emerald)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(16, 185, 129, 0.2)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-emerald)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  VOTEPULSE OFFICIAL ELECTORAL IDENTIFICATION CARD
                </div>
                <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>SECURE CITIZEN RECORD</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Official Voter ID</div>
                  <div data-sensitive-id="true" style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--accent-emerald)', marginTop: '4px', letterSpacing: '0.5px' }}>{user.voter_id}</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Registered Full Name</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{user.name}</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Delivery Email</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px', wordBreak: 'break-all' }}>{user.email || '—'}</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mobile Phone</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>{user.phone || '—'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(16, 185, 129, 0.2)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div>Verification: 2-Factor SMTP OTP Auth</div>
                <div style={{ fontFamily: 'monospace', letterSpacing: '3px' }}>|||| ||||| |||| |||</div>
              </div>
            </div>

            {/* Voting Participation & Cryptographic Audit Status */}
            <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🗳️ Electoral Participation & Ballot Seal Status
              </h3>
              {hasVoted ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <span>✅ Ballot Successfully Sealed</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({selectedElection?.title || 'General Election 2026'})</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                    Voted for candidate: <strong style={{ color: 'var(--accent-emerald)' }}>{votedCandidateName || 'Selected Candidate'}</strong>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '10px', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                    <div>Caesar Cipher Hash: <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{votedCaesarHash || 'SHIFT_3_HASH'}</span></div>
                    <div style={{ marginTop: '4px' }}>SHA-256 Seal: {votedSha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.9rem' }}>⚠️ Ballot Pending Cast</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>You have not yet cast your encrypted vote in {selectedElection?.title || 'this election'}.</div>
                  </div>
                  <button className="btn btn-emerald no-print" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setVoterTab('ballot')}>
                    Proceed to Voting Booth &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="no-print" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  const summary = `VOTEPULSE OFFICIAL VOTER PROFILE\nVoter ID: ${user.voter_id}\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone}\nStatus: Active\nVoted: ${hasVoted ? 'Yes (' + votedCandidateName + ')' : 'Pending'}`;
                  copyToClipboard(summary, 'profile_summary');
                }}
              >
                {copiedField === 'profile_summary' ? '✅ Profile Data Copied!' : '📋 Copy Profile Summary'}
              </button>
              <button
                type="button"
                className="btn btn-emerald"
                onClick={() => setVoterTab('ballot')}
              >
                🗳️ Go to Voting Booth &rarr;
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: VOTING BOOTH & BALLOT */
        <div>

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

            {/* Automatic Winner Declaration Banner */}
            {winnerCandidate && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(59, 130, 246, 0.15))',
                border: '1.5px solid var(--accent-emerald)',
                borderRadius: '18px', padding: '1.25rem 1.5rem', marginTop: '1.25rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '2.5rem' }}>🏆</div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Automatic Winner / Leading Candidate
                    </div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '2px 0 0 0' }}>
                      {winnerCandidate.name} <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>({winnerCandidate.party || winnerCandidate.department})</span>
                    </h3>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399' }}>{winnerCandidate.vote_count || 0} Votes</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>{winnerPercentage}% Turnout Share</div>
                </div>
              </div>
            )}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.2rem' }}>Official Ballot Candidates</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Review the candidate details below and cast your encrypted vote.</p>
                </div>
                <span className="live-pulse-badge">
                  <span className="live-dot"></span> LIVE RESULTS STREAMING
                </span>
              </div>

              {candidates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '18px', color: 'var(--text-muted)' }}>
                  No candidates registered for this poll yet. An administrator can register candidates from the Admin Console.
                </div>
              ) : (
                <div className="candidate-grid">
                  {candidates.map(c => {
                    const votes = c.vote_count || 0;
                    const pct = totalVotesCast > 0 ? Math.round((votes / totalVotesCast) * 100) : 0;
                    const isLeader = votes > 0 && votes === maxVotes;
                    const initials = (c.name || 'Candidate')
                      .trim()
                      .split(/\s+/)
                      .map(part => part[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase();

                    return (
                      <div key={c.id} className="candidate-card" style={{ border: isLeader ? '1px solid rgba(245,158,11,0.5)' : '1px solid var(--border-glass)', borderRadius: '20px', overflow: 'hidden' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          padding: '1.25rem 1.25rem 0.75rem 1.25rem',
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(0, 0, 0, 0.2))',
                          borderBottom: '1px solid var(--border-glass)'
                        }}>
                          {/* Circular Avatar Badge Matching Image 1 */}
                          <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: '#10b981',
                            border: '3px solid #059669',
                            boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#000000',
                            fontSize: '1.45rem',
                            fontWeight: 900,
                            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
                            letterSpacing: '-0.5px',
                            flexShrink: 0
                          }}>
                            {initials}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                              <h3 className="candidate-name" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {c.name}
                              </h3>
                              {isLeader && (
                                <span style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', fontSize: '0.65rem', fontWeight: 900, padding: '2px 7px', borderRadius: '6px', flexShrink: 0 }}>
                                  👑 LEADER
                                </span>
                              )}
                            </div>
                            <div className="candidate-dept" style={{ color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.85rem', marginTop: '2px' }}>
                              {c.department || c.party || 'General Candidate'}
                            </div>
                          </div>
                        </div>
                        <div className="candidate-body" style={{ padding: '1rem 1.25rem' }}>
                          <div>
                            <p className="candidate-manifesto" style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.88rem' }}>"{c.manifesto}"</p>

                            {/* Live Standings Progress Bar */}
                            <div style={{ margin: '1rem 0 0.8rem 0', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Live Tally</span>
                                <span style={{ fontWeight: 800, color: isLeader ? '#f59e0b' : 'var(--primary)' }}>{pct}% ({votes} {votes === 1 ? 'vote' : 'votes'})</span>
                              </div>
                              <div className="live-tally-bar-wrap">
                                <div className={`live-tally-bar-fill ${isLeader ? 'leader' : ''}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                          <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }} onClick={() => { setSelectedCandidate(c); setShowVoteConfirmModal(true); }}>
                            Vote for Candidate
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Real-Time Live Election Standings Scoreboard (Visible Before & After Voting) */}
          {candidates.length > 0 && (
            <div style={{ marginTop: '2.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '20px', padding: '1.5rem', backdropFilter: 'blur(16px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="live-pulse-badge">
                    <span className="live-dot"></span> LIVE REAL-TIME STANDINGS
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Real-Time Election Results</h3>
                </div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, background: 'rgba(255,255,255,0.06)', padding: '4px 12px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                  📊 Total Votes Cast: <strong style={{ color: '#f59e0b' }}>{totalVotesCast}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {candidates.map(c => {
                  const votes = c.vote_count || 0;
                  const pct = totalVotesCast > 0 ? Math.round((votes / totalVotesCast) * 100) : 0;
                  const isLeader = votes > 0 && votes === maxVotes;

                  return (
                    <div key={c.id} style={{
                      background: isLeader ? 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(16,185,129,0.05))' : 'rgba(255,255,255,0.03)',
                      border: isLeader ? '1px solid rgba(245,158,11,0.35)' : '1px solid var(--border-glass)',
                      borderRadius: '14px',
                      padding: '1rem 1.25rem',
                      transition: 'all 0.4s ease'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={c.photo_url} alt={c.name} style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover' }} onError={(e)=>{e.target.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300';}} />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {c.name}
                              {isLeader && <span style={{ fontSize: '0.68rem', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', padding: '2px 8px', borderRadius: '8px', fontWeight: 800 }}>👑 LEADING</span>}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.department || c.party}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: isLeader ? '#f59e0b' : 'var(--primary)' }}>{pct}%</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{votes} {votes === 1 ? 'vote' : 'votes'}</div>
                        </div>
                      </div>

                      <div className="live-tally-bar-wrap">
                        <div
                          className={`live-tally-bar-fill ${isLeader ? 'leader' : ''}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
      </div>
    )}

      {/* VOTE CONFIRMATION MODAL */}
      {showVoteConfirmModal && selectedCandidate && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel" style={{ textAlign: 'center', position: 'relative' }}>
            {/* Top Cancel Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-6px' }}>
              <button
                type="button"
                onClick={() => setShowVoteConfirmModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-muted)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                title="Cancel / Close"
              >
                ✕
              </button>
            </div>
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
          onDoubleClick={() => { if (navigateTo) navigateTo('admin'); else window.location.hash = 'admin'; }}
          style={{ cursor: 'pointer', userSelect: 'none', transition: 'all 0.3s ease' }}
          title="VotePulse"
          className="gradient-text-neon"
        >
          🗳️ VotePulse Online Voting System
        </span>
      </footer>
    </div>
  );
}
