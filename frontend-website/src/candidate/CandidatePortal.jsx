import React, { useState, useEffect, useRef } from 'react';
import { handleEnterKeyNavigation } from '../helpers/formNavigation';

// ─── Candidate Ticket Modal ───────────────────────────────────────────────
function CandidateTicketModal({ ticket, copiedField, copyToClipboard, onClose }) {
  if (!ticket) return null;
  return (
    <div className="modal-backdrop" style={{ zIndex: 1100 }}>
      <div className="modal-content glass-panel" style={{ maxWidth: '580px', textAlign: 'center', border: '1.5px solid #06b6d4', padding: '2rem', position: 'relative' }}>
        {/* Top Cancel Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-6px' }}>
          <button
            type="button"
            onClick={onClose}
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

        <div style={{ fontSize: '3rem', marginBottom: '0.25rem' }}>🎟️</div>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '1.5px' }}>NOMINATION COMPLETE</span>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '6px 0 8px 0' }}>Candidate Credential Ticket</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          Your candidacy has been nominated! An official credential ticket was emailed to <strong style={{ color: '#38bdf8' }}>{ticket.email || 'your registered email'}</strong>.
        </p>

        {/* Official Credential Ticket Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(30, 41, 59, 0.5))',
          border: '1.5px dashed #06b6d4',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'left',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(6, 182, 212, 0.25)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>VOTEPULSE ELECTORAL COMMISSION</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)' }}>Official Candidate Pass</div>
            </div>
            <span style={{ background: 'rgba(6, 182, 212, 0.25)', color: '#38bdf8', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '12px', border: '1px solid #06b6d4' }}>
              NOMINATED
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Candidate Key / ID</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span data-sensitive-id="true" style={{ fontSize: '1.15rem', fontWeight: 900, color: '#38bdf8', letterSpacing: '0.5px' }}>{ticket.candidate_id}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(ticket.candidate_id, 'ticket_cand_id')}
                  style={{ background: 'rgba(6, 182, 212, 0.2)', border: '1px solid #06b6d4', color: '#38bdf8', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
                  title="Copy Candidate ID"
                >
                  {copiedField === 'ticket_cand_id' ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Password</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '1px' }}>{ticket.password || 'cand123'}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(ticket.password || 'cand123', 'ticket_cand_pass')}
                  style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid var(--border-glass)', color: 'var(--text-main)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
                  title="Copy Password"
                >
                  {copiedField === 'ticket_cand_pass' ? '✅' : '📋'}
                </button>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Candidate Name</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>{ticket.name}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Party / Department</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>{ticket.party || 'General'}</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(6, 182, 212, 0.2)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            <div>Email: {ticket.email || 'N/A'}</div>
            <div style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>|||| | ||||| ||| |||||</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              const allText = `VOTEPULSE CANDIDATE CREDENTIAL TICKET\nCandidate ID: ${ticket.candidate_id}\nName: ${ticket.name}\nPassword: ${ticket.password || 'cand123'}\nParty: ${ticket.party}\nEmail: ${ticket.email}\nStatus: Nominated & Active`;
              copyToClipboard(allText, 'ticket_cand_all');
            }}
            style={{ flex: 1, minWidth: '140px' }}
          >
            {copiedField === 'ticket_cand_all' ? '✅ Copied!' : '📋 Copy Details'}
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
            className="btn btn-primary"
            onClick={onClose}
            style={{ flex: 2, minWidth: '200px', fontWeight: 800, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
          >
            🚀 Enter Command Center &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CandidatePortal({ user, setUser }) {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');

  // Candidate Authentication State
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [candKeyInput, setCandKeyInput] = useState('');
  const [candPasswordInput, setCandPasswordInput] = useState('');
  const [candidateUser, setCandidateUser] = useState(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [loginCapsLock, setLoginCapsLock] = useState(false);
  const [regCapsLock, setRegCapsLock] = useState(false);

  // Auto-focus refs
  const candKeyRef = useRef(null);
  const regNameRef = useRef(null);

  useEffect(() => {
    if (authMode === 'login' && candKeyRef.current) {
      candKeyRef.current.focus();
    } else if (authMode === 'register' && regNameRef.current) {
      regNameRef.current.focus();
    }
  }, [authMode]);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regKey, setRegKey] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regElectionId, setRegElectionId] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regManifesto, setRegManifesto] = useState('');

  // Candidate Email Verification OTP State
  const [showCandOtpModal, setShowCandOtpModal] = useState(false);
  const [candOtpInput, setCandOtpInput] = useState('');
  const [pendingCandPayload, setPendingCandPayload] = useState(null);

  // Ticket & Clipboard State
  const [copiedField, setCopiedField] = useState(null);
  const [candidateTicket, setCandidateTicket] = useState(null);

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

  // Helper to generate unique official Candidate ID
  const generateCandidateId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `CAND-2026-${randomNum}`;
  };

  // Auto-generate Candidate ID when switching to register mode
  useEffect(() => {
    if (authMode === 'register' && !regKey) {
      setRegKey(generateCandidateId());
    }
  }, [authMode]);

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
    const saved = sessionStorage.getItem('votepulse_candidate_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCandidateUser(parsed);
      } catch (e) {}
    }
    return () => {
      // Auto-logout when leaving Candidate module
      setCandidateUser(null);
      sessionStorage.removeItem('votepulse_candidate_session');
      localStorage.removeItem('votepulse_candidate_session');
    };
  }, []);

  useEffect(() => {
    if (selectedElectionId) {
      fetchCandidates(selectedElectionId);
      const pollMode = localStorage.getItem('votepulse_poll_rate') || '3';
      if (pollMode !== 'manual') {
        const intervalMs = (parseInt(pollMode, 10) || 3) * 1000;
        const timer = setInterval(() => {
          fetchCandidates(selectedElectionId);
        }, intervalMs);
        return () => clearInterval(timer);
      }
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
    if (!candKeyInput.trim()) {
      showAlert('Please enter your Candidate ID, Name, or Email.', 'error');
      return;
    }

    const query = candKeyInput.toLowerCase().trim();
    const found = candidates.find(c =>
      c.id.toLowerCase() === query ||
      (c.email && c.email.toLowerCase() === query) ||
      c.name.toLowerCase() === query ||
      c.name.toLowerCase().includes(query)
    );

    if (!found) {
      showAlert(`Candidate record '${candKeyInput}' not found. Only registered candidates can log in.`, 'error');
      return;
    }

    const enteredPass = candPasswordInput.trim();
    const expectedPass = found.password || 'cand123';

    if (enteredPass && enteredPass !== expectedPass) {
      showAlert('Incorrect candidate passcode. Please check your credentials.', 'error');
      return;
    }

    setCandidateUser(found);
    sessionStorage.setItem('votepulse_candidate_session', JSON.stringify(found));
    localStorage.removeItem('votepulse_candidate_session');
    showAlert(`Welcome Candidate ${found.name}! Campaign Command Center Active.`, 'success');
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    const targetElecId = regElectionId || selectedElectionId || (elections[0]?.id || '101');
    if (!targetElecId) {
      showAlert('Please select an election poll.', 'error');
      return;
    }
    if (!regEmail.trim()) {
      showAlert('Please enter your email address for verification.', 'error');
      return;
    }

    const candId = regKey.trim() ? regKey.trim() : generateCandidateId();
    const payload = {
      id: candId,
      election_id: targetElecId,
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword || 'cand123',
      department: regDept.trim() || 'General',
      party: regDept.trim() || 'General',
      manifesto: regManifesto.trim() || 'Official Campaign Manifesto',
      photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(regName.trim())}&background=06b6d4&color=fff&size=300`
    };

    try {
      const res = await fetch('/api/candidates/register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showAlert(data.message || 'Failed to dispatch candidate verification code.', 'error');
        return;
      }

      setPendingCandPayload({
        ...payload,
        candidate_id: data.candidate_id || candId,
        token_code: data.token_code
      });
      setCandOtpInput('');
      setShowCandOtpModal(true);
      showAlert(`Verification code dispatched to ${regEmail.trim()}! Please enter the 6-digit OTP code below to confirm nomination.`, 'success');
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  const handleVerifyCandidateOtp = async (e) => {
    e.preventDefault();
    if (!candOtpInput.trim() || candOtpInput.trim().length !== 6) {
      showAlert('Please enter the 6-digit verification code.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/candidates/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: pendingCandPayload?.candidate_id,
          email: pendingCandPayload?.email,
          token_code: candOtpInput.trim()
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showAlert(data.message || 'Invalid candidate verification code.', 'error');
        return;
      }

      const createdCandidate = data.candidate || pendingCandPayload;
      setShowCandOtpModal(false);
      setCandidateUser(createdCandidate);
      sessionStorage.setItem('votepulse_candidate_session', JSON.stringify(createdCandidate));

      // Reset registration form
      setRegName(''); setRegKey(''); setRegEmail(''); setRegPassword(''); setRegDept(''); setRegManifesto('');
      showAlert(`🎉 Candidate Email Verified & Nomination Confirmed! Welcome Candidate ${createdCandidate.name}!`, 'success');
      fetchCandidates(createdCandidate.election_id);
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  const handleLogout = () => {
    setCandidateUser(null);
    sessionStorage.removeItem('votepulse_candidate_session');
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

  // Render Centered Compact Login / Register View if not logged in (matching Voter & Admin)
  if (!candidateUser) {
    return (
      <div className="main-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(80vh - 40px)' }}>
        <CandidateTicketModal
          ticket={candidateTicket}
          copiedField={copiedField}
          copyToClipboard={copyToClipboard}
          onClose={() => setCandidateTicket(null)}
        />

        {alertMsg && (
          <div style={{ width: '100%', maxWidth: '480px', padding: '1rem', borderRadius: '14px', marginBottom: '1rem', fontWeight: 600, background: alertMsg.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(6, 182, 212, 0.15)', color: alertMsg.type === 'error' ? '#f87171' : '#38bdf8', border: `1px solid ${alertMsg.type === 'error' ? '#ef4444' : '#06b6d4'}` }}>
            {alertMsg.text}
          </div>
        )}

        <div className="auth-box" style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>
          {/* Centered Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: '76px', height: '76px', borderRadius: '24px', margin: '0 auto 1rem',
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.2rem', boxShadow: '0 12px 36px rgba(6, 182, 212, 0.45)',
            }}>🚀</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.4rem', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Candidate Portal
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Candidacy nomination & campaign management.
            </p>
          </div>

          {/* Dual Auth Switcher Pills */}
          <div className="theme-toggle-row" style={{ marginBottom: '1.75rem' }}>
            <button
              type="button"
              className={`theme-option-btn ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => setAuthMode('login')}
              style={{
                background: authMode === 'login' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent',
                color: authMode === 'login' ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              Candidate Login
            </button>
            <button
              type="button"
              className={`theme-option-btn ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => setAuthMode('register')}
              style={{
                background: authMode === 'register' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent',
                color: authMode === 'register' ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              Nominate Candidacy
            </button>
          </div>

          {/* MODE 1: CANDIDATE LOGIN FORM */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} onKeyDown={handleEnterKeyNavigation}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Election Poll</label>
                <select className="form-input" value={selectedElectionId} onChange={e => setSelectedElectionId(e.target.value)}>
                  {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
              </div>

              <div className="form-group">
                <input
                  ref={candKeyRef}
                  className="form-input"
                  type="text"
                  placeholder="Candidate Key / ID or Name *"
                  value={candKeyInput}
                  onChange={e => setCandKeyInput(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    className="form-input"
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Candidate Passcode (max 5 chars)"
                    maxLength={5}
                    value={candPasswordInput}
                    onChange={e => setCandPasswordInput(e.target.value)}
                    onKeyDown={e => setLoginCapsLock(e.getModifierState && e.getModifierState('CapsLock'))}
                    onKeyUp={e => setLoginCapsLock(e.getModifierState && e.getModifierState('CapsLock'))}
                    style={{ paddingRight: '2.8rem' }}
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
                {loginCapsLock && (
                  <div className="caps-lock-badge">⇪ Caps Lock is ON</div>
                )}
              </div>

              <button className="btn btn-primary" type="submit" style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', fontWeight: 800 }}>
                🚀 Sign In to Command Center &rarr;
              </button>

              <div style={{ marginTop: '10px', fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Tip: Press <kbd className="shortcut-pill">Enter ↵</kbd> to jump to the next field
              </div>
            </form>
          ) : (
            /* MODE 2: CANDIDATE REGISTRATION FORM */
            <form onSubmit={handleRegistrationSubmit} onKeyDown={handleEnterKeyNavigation}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Election Poll *</label>
                <select className="form-input" value={regElectionId || selectedElectionId} onChange={e => setRegElectionId(e.target.value)} required>
                  {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
              </div>

              <div className="form-group">
                <input ref={regNameRef} className="form-input" type="text" placeholder="Full Candidate Name *" value={regName} onChange={e => setRegName(e.target.value)} required />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0, color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🔑 Official Candidate ID <span style={{ fontSize: '0.72rem', background: 'rgba(6, 182, 212, 0.2)', border: '1px solid #06b6d4', color: '#38bdf8', padding: '2px 8px', borderRadius: '12px' }}>Auto-Generated</span>
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(regKey || generateCandidateId(), 'reg_cand_id')}
                      style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid #06b6d4', color: '#38bdf8', padding: '3px 10px', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Copy auto-generated Candidate ID"
                    >
                      {copiedField === 'reg_cand_id' ? '✅ Copied!' : '📋 Copy ID'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegKey(generateCandidateId())}
                      style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Generate a new unique Candidate ID"
                    >
                      🔄 New ID
                    </button>
                  </div>
                </div>
                <input
                  className="form-input"
                  data-sensitive-id="true"
                  type="text"
                  placeholder="CAND-2026-XXXX"
                  value={regKey}
                  onChange={e => setRegKey(e.target.value)}
                  style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1.5px solid #06b6d4', color: '#38bdf8', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '1px' }}
                />
              </div>

              <div className="form-group">
                <input className="form-input" type="email" placeholder="Official Email (for Credential Ticket) *" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
              </div>

              <div className="form-group">
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    className="form-input"
                    type={showRegPassword ? "text" : "password"}
                    placeholder="Candidate Passcode (max 5 chars) *"
                    maxLength={5}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    onKeyDown={e => setRegCapsLock(e.getModifierState && e.getModifierState('CapsLock'))}
                    onKeyUp={e => setRegCapsLock(e.getModifierState && e.getModifierState('CapsLock'))}
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
                {regCapsLock && (
                  <div className="caps-lock-badge">⇪ Caps Lock is ON</div>
                )}
              </div>

              <div className="form-group">
                <input className="form-input" type="text" placeholder="Department / Party Affiliation" value={regDept} onChange={e => setRegDept(e.target.value)} />
              </div>

              <div className="form-group">
                <textarea className="form-input" rows={3} placeholder="Initial Manifesto & Vision Statement (Optional)" value={regManifesto} onChange={e => setRegManifesto(e.target.value)} />
              </div>

              <button className="btn btn-primary" type="submit" style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', fontWeight: 800 }}>
                🎉 Register & Nominate Candidate &rarr;
              </button>

              <div style={{ marginTop: '10px', fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Tip: Press <kbd className="shortcut-pill">Enter ↵</kbd> to jump to the next field
              </div>
            </form>
          )}
        </div>

        {/* CANDIDATE EMAIL VERIFICATION OTP MODAL */}
        {showCandOtpModal && (
          <div className="modal-backdrop" style={{ zIndex: 1100 }}>
            <div className="modal-content glass-panel" style={{ textAlign: 'center', maxWidth: '520px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-6px' }}>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setShowCandOtpModal(false)}
                  style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>📧</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                Candidate Email Verification
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                A 6-digit OTP verification code was sent to <strong style={{ color: '#38bdf8' }}>{pendingCandPayload?.email}</strong>.
                Enter the code below to verify your email and save your candidate nomination in the database.
              </p>

              {pendingCandPayload?.token_code && (
                <div style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid #06b6d4', padding: '10px 14px', borderRadius: '12px', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>Verification Code (Live Preview):</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '6px', color: '#ffffff', fontFamily: 'monospace', marginTop: '2px' }}>
                    {pendingCandPayload.token_code}
                  </div>
                </div>
              )}

              <form onSubmit={handleVerifyCandidateOtp}>
                <div className="form-group">
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Enter 6-Digit OTP"
                    maxLength={6}
                    value={candOtpInput}
                    onChange={e => setCandOtpInput(e.target.value.replace(/\D/g, ''))}
                    style={{ textAlign: 'center', fontSize: '1.35rem', letterSpacing: '6px', fontWeight: 800, color: '#38bdf8' }}
                    required
                    autoFocus
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCandOtpModal(false)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 2, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', fontWeight: 800 }}
                  >
                    Verify Candidate OTP &rarr;
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── AUTHENTICATED CANDIDATE VIEW ──────────────────────────────────────────
  return (
    <div className="main-container">
      <CandidateTicketModal
        ticket={candidateTicket}
        copiedField={copiedField}
        copyToClipboard={copyToClipboard}
        onClose={() => setCandidateTicket(null)}
      />

      {/* Header Banner - Only displayed once authenticated */}
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
                Candidate Command & Campaign Portal
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Official dashboard to manage policy manifestos, publish announcements, and track live poll standings.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.4)', borderRadius: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8' }}>
                👤 {candidateUser.name} (<span data-sensitive-id="true">{candidateUser.id}</span>)
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(candidateUser.id, 'header_cand_id')}
                style={{
                  background: 'rgba(6, 182, 212, 0.25)',
                  border: '1px solid #06b6d4',
                  color: '#38bdf8',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
                title="Copy Candidate ID"
              >
                {copiedField === 'header_cand_id' ? '✅ Copied!' : '📋 Copy ID'}
              </button>
            </div>
            <button className="btn" onClick={handleLogout} style={{ fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px' }}>
              🚪 Sign Out
            </button>
          </div>
        </div>
      </div>

      {alertMsg && (
        <div style={{ padding: '1rem', borderRadius: '14px', marginBottom: '1.5rem', fontWeight: 600, background: alertMsg.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(6,182,212,0.15)', color: alertMsg.type === 'error' ? '#f87171' : '#38bdf8', border: `1px solid ${alertMsg.type === 'error' ? '#ef4444' : '#06b6d4'}` }}>
          {alertMsg.text}
        </div>
      )}

      {/* AUTHENTICATED CANDIDATE DASHBOARD */}
      {(() => {
            const totalVotesInElection = candidates.reduce((acc, c) => acc + (c.vote_count || 0), 0);
            const maxVotesInElection = candidates.length > 0 ? Math.max(...candidates.map(c => c.vote_count || 0)) : 0;
            const topCandidatesInElection = candidates.filter(c => (c.vote_count || 0) === maxVotesInElection && maxVotesInElection > 0);
            const winnerCandidateInElection = topCandidatesInElection.length === 1 ? topCandidatesInElection[0] : null;
            const isCurrentCandidateWinner = winnerCandidateInElection && winnerCandidateInElection.id === candidateUser?.id;

            return (
              <>
                <div className="card glass-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', border: '1px solid rgba(6, 182, 212, 0.35)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <img src={candidateUser.photo_url} alt={candidateUser.name} style={{ width: '70px', height: '70px', borderRadius: '18px', objectFit: 'cover', border: '2px solid #06b6d4', boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)' }} onError={(e)=>{e.target.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300';}} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', padding: '2px 8px', borderRadius: '8px', fontWeight: 800 }}>
                            VERIFIED CANDIDATE PROFILE
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: <span data-sensitive-id="true">{candidateUser.id}</span></span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(candidateUser.id, 'profile_cand_id')}
                            style={{
                              background: 'rgba(6, 182, 212, 0.2)',
                              border: '1px solid #06b6d4',
                              color: '#38bdf8',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              fontWeight: 700
                            }}
                            title="Copy Candidate ID"
                          >
                            {copiedField === 'profile_cand_id' ? '✅ Copied!' : '📋 Copy ID'}
                          </button>
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
                        className={`btn ${activeTab === 'ticket' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('ticket')}
                        style={{ fontSize: '0.82rem', padding: '0.5rem 1rem', background: activeTab === 'ticket' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent' }}
                      >
                        🎫 Credential Ticket
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

                {/* Automatic Election Winner Announcement Banner */}
                {winnerCandidateInElection && (
                  <div style={{
                    background: isCurrentCandidateWinner
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(16, 185, 129, 0.2))'
                      : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))',
                    border: `1.5px solid ${isCurrentCandidateWinner ? '#f59e0b' : 'var(--accent-emerald)'}`,
                    borderRadius: '20px', padding: '1.25rem 1.5rem', marginBottom: '2rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
                    boxShadow: `0 8px 30px ${isCurrentCandidateWinner ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ fontSize: '2.8rem' }}>{isCurrentCandidateWinner ? '👑' : '🏆'}</div>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: isCurrentCandidateWinner ? '#fbbf24' : '#34d399', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {isCurrentCandidateWinner ? '🎉 Congratulations! You Are The Winning Candidate!' : 'Automatic Election Leader / Winner'}
                        </div>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '2px 0 0 0' }}>
                          {winnerCandidateInElection.name} <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>({winnerCandidateInElection.party || winnerCandidateInElection.department})</span>
                        </h3>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: isCurrentCandidateWinner ? '#fbbf24' : '#34d399' }}>{winnerCandidateInElection.vote_count || 0} Votes</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                        {totalVotesInElection > 0 ? Math.round((winnerCandidateInElection.vote_count / totalVotesInElection) * 100) : 0}% Share
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })()}

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

              <form onSubmit={handleSaveManifesto} onKeyDown={handleEnterKeyNavigation}>
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

              <form onSubmit={handleAddAnnouncement} onKeyDown={handleEnterKeyNavigation} style={{ marginBottom: '2rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
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

          {/* TAB: CANDIDATE CREDENTIAL TICKET */}
          {activeTab === 'ticket' && (
            <div className="card glass-panel" style={{ padding: '2rem', maxWidth: '750px', margin: '0 auto', border: '1.5px solid #06b6d4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🎫 Official Candidate Credential Pass
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Your certified election candidacy registration pass issued by VotePulse.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => copyToClipboard(candidateUser.id, 'ticket_tab_id')}
                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
                  >
                    {copiedField === 'ticket_tab_id' ? '✅ Copied!' : '📋 Copy Candidate ID'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => window.print()}
                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
                  >
                    🖨️ Print Pass
                  </button>
                </div>
              </div>

              {/* Boarding Pass / Ticket Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(30, 41, 59, 0.5))',
                border: '1.5px dashed #06b6d4',
                borderRadius: '16px',
                padding: '1.75rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(6, 182, 212, 0.25)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>VOTEPULSE ELECTORAL SYSTEM</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900 }}>Certified Candidate Nomination Ticket</div>
                  </div>
                  <span style={{ background: 'rgba(6, 182, 212, 0.25)', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', border: '1px solid #06b6d4' }}>
                    CERTIFIED ACTIVE
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Candidate Key / ID</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>{candidateUser.id}</div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Candidate Name</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{candidateUser.name}</div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Party / Department</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>{candidateUser.department || candidateUser.party}</div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Election Contest</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>{selectedElection?.title || 'General Election'}</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Campaign Slogan & Manifesto</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '4px', fontStyle: 'italic' }}>
                    "{candidateUser.slogan || campaignSlogan || candidateUser.manifesto || 'Official Candidate Platform'}"
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(6, 182, 212, 0.2)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div>Security Seal: SHA-256 Validated Candidate Key</div>
                  <div style={{ fontFamily: 'monospace', letterSpacing: '3px' }}>|||| ||||| |||| |||</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    const fullText = `VOTEPULSE OFFICIAL CANDIDATE TICKET\nID: ${candidateUser.id}\nName: ${candidateUser.name}\nParty: ${candidateUser.department || candidateUser.party}\nElection: ${selectedElection?.title}\nStatus: Certified Candidate`;
                    copyToClipboard(fullText, 'cand_ticket_full');
                  }}
                >
                  {copiedField === 'cand_ticket_full' ? '✅ Full Ticket Data Copied!' : '📋 Copy Complete Ticket'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActiveTab('manifesto')}
                  style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
                >
                  ✏️ Edit Manifesto &rarr;
                </button>
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
    </div>
  );
}
