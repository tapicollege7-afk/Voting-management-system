import React, { useState, useEffect, useCallback } from 'react';
import BallotAuditTool from './BallotAuditTool';

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
function BarChart({ candidates, totalVotes }) {
  if (!candidates || candidates.length === 0) return (
    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No candidate data.</p>
  );
  const max = Math.max(...candidates.map(c => c.vote_count || 0), 1);
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {candidates.map((c, i) => {
        const votes = c.vote_count || 0;
        const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
        const barW = max > 0 ? Math.round((votes / max) * 100) : 0;
        const color = colors[i % colors.length];
        return (
          <div key={c.id || i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem', fontWeight: 700 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
                {c.name}
                {c.party || c.department ? <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({c.party || c.department})</span> : null}
              </span>
              <span style={{ color, fontWeight: 800 }}>{votes} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({pct}%)</span></span>
            </div>
            <div style={{ height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{
                width: `${barW}%`, height: '100%', background: color,
                borderRadius: '10px', transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: `0 0 8px ${color}55`
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color = 'var(--primary)', trend }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
      borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column',
      gap: '0.5rem', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 30px rgba(0,0,0,0.25)`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color, borderRadius: '20px 20px 0 0' }} />
      <div style={{ fontSize: '1.8rem' }}>{icon}</div>
      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.2rem', fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      {trend && <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>↑ {trend}</div>}
    </div>
  );
}

// ─── Alert Toast ──────────────────────────────────────────────────────────────
function AlertToast({ msg }) {
  if (!msg) return null;
  const isSuccess = msg.type === 'success';
  return (
    <div style={{
      position: 'fixed', top: '5rem', right: '1.5rem', zIndex: 9999,
      background: isSuccess ? 'linear-gradient(135deg,#059669,#10b981)' : 'linear-gradient(135deg,#dc2626,#ef4444)',
      color: '#fff', borderRadius: '14px', padding: '0.85rem 1.5rem',
      fontWeight: 700, fontSize: '0.88rem', maxWidth: '350px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
      animation: 'floatUp 0.35s ease-out',
      display: 'flex', alignItems: 'center', gap: '10px',
    }}>
      <span style={{ fontSize: '1.2rem' }}>{isSuccess ? '✅' : '❌'}</span>
      {msg.text}
    </div>
  );
}

// ─── Admin Login Page ─────────────────────────────────────────────────────────
function AdminLogin({ onLogin, alertMsg }) {
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(adminId, adminPass);
  };

  return (
    <div className="main-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <AlertToast msg={alertMsg} />
      <div style={{ width: '100%', maxWidth: '460px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '24px', margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.2rem', boxShadow: '0 12px 40px rgba(245,158,11,0.4)',
          }}>⚡</div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.4rem' }}>
            Admin Console
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Authorized election administrators only
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'var(--bg-card)', backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-glass)', borderRadius: '28px',
          padding: '2.5rem', boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
        }}>
          {/* Security Notice */}
          <div style={{
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1.75rem',
            display: 'flex', alignItems: 'flex-start', gap: '10px',
          }}>
            <span style={{ fontSize: '1.1rem' }}>🔐</span>
            <div style={{ fontSize: '0.78rem', color: '#f59e0b', lineHeight: 1.5 }}>
              <strong>Secure Access</strong> — Restricted to authorized election administrators.
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                className="form-input"
                type="text"
                placeholder="Administrator ID"
                value={adminId}
                onChange={e => setAdminId(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={adminPass}
                onChange={e => setAdminPass(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', fontSize: '1rem',
                }}
              >{showPass ? '🙈' : '👁️'}</button>
            </div>
            <button
              className="btn"
              type="submit"
              style={{
                width: '100%', padding: '0.9rem',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white', boxShadow: '0 4px 20px rgba(245,158,11,0.4)',
                fontSize: '1rem', borderRadius: '14px', fontWeight: 800,
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(245,158,11,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(245,158,11,0.4)'; }}
            >
              🔑 Access Admin Dashboard
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); let t = window.location.pathname.replace(/\/admin(\.html)?\/?$/i, '/'); if (!t.endsWith('/')) t += '/'; window.location.href = t; }} style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}>
              ← Go to Voter Portal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Console ───────────────────────────────────────────────────────
export default function AdminConsole({ adminUser, setAdminUser }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [alertMsg, setAlertMsg] = useState(null);

  // Data State
  const [stats, setStats] = useState({ total_voters: 0, active_elections: 0, total_candidates: 0, total_votes_cast: 0 });
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [voters, setVoters] = useState([]);
  const [selectedResultElectionId, setSelectedResultElectionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [showCreateElectionModal, setShowCreateElectionModal] = useState(false);
  const [showCreateCandModal, setShowCreateCandModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Election Form
  const [elecId, setElecId] = useState('');
  const [elecTitle, setElecTitle] = useState('');
  const [elecCategory, setElecCategory] = useState('General Poll');
  const [elecDesc, setElecDesc] = useState('');

  // Candidate Form
  const [candElectionId, setCandElectionId] = useState('');
  const [candId, setCandId] = useState('');
  const [candName, setCandName] = useState('');
  const [candParty, setCandParty] = useState('');
  const [candManifesto, setCandManifesto] = useState('');

  // Search
  const [voterSearch, setVoterSearch] = useState('');
  const [candSearch, setCandSearch] = useState('');

  // ─── Effects ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('votepulse_admin');
    if (saved) {
      try { setAdminUser(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (adminUser) fetchAdminStats();
  }, [adminUser]);

  // ─── Alerts ──────────────────────────────────────────────────────────────
  const showAlert = (text, type = 'error') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 4500);
  };

  // ─── Login / Logout ───────────────────────────────────────────────────────
  const handleAdminLogin = (id, pass) => {
    if (pass === 'admin123' || pass === 'voter123') {
      const u = { id: id || 'ADM-9999', role: 'admin', loginTime: new Date().toISOString() };
      localStorage.setItem('votepulse_admin', JSON.stringify(u));
      setAdminUser(u);
    } else {
      showAlert('Invalid Administrator ID or password.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('votepulse_admin');
    setAdminUser(null);
  };

  // ─── Data Fetching ────────────────────────────────────────────────────────
  const fetchAdminStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats || {});
          setElections(data.elections || []);
          setCandidates(data.candidates || []);
          setVoters(data.voters || []);
          if ((data.elections || []).length > 0 && !selectedResultElectionId) {
            setSelectedResultElectionId(data.elections[0].id);
          }
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {}

    // Fallback to localStorage
    const elecsArr = JSON.parse(localStorage.getItem('votepulse_admin_elections') || '[]');
    const candsArr = JSON.parse(localStorage.getItem('votepulse_admin_candidates') || '[]');
    const votersArr = JSON.parse(localStorage.getItem('votepulse_admin_voters') || '[]');

    setElections(elecsArr);
    setCandidates(candsArr);
    setVoters(votersArr);
    const totalVotes = candsArr.reduce((s, c) => s + (c.vote_count || 0), 0);
    setStats({
      total_voters: votersArr.length + 1,
      active_elections: elecsArr.filter(e => e.status === 'active').length,
      total_candidates: candsArr.length,
      total_votes_cast: totalVotes,
    });
    if (elecsArr.length > 0 && !selectedResultElectionId) {
      setSelectedResultElectionId(elecsArr[0].id);
    }
    setIsLoading(false);
  }, [selectedResultElectionId]);

  const saveLocal = (el, ca, vo) => {
    if (el !== undefined) localStorage.setItem('votepulse_admin_elections', JSON.stringify(el));
    if (ca !== undefined) localStorage.setItem('votepulse_admin_candidates', JSON.stringify(ca));
    if (vo !== undefined) localStorage.setItem('votepulse_admin_voters', JSON.stringify(vo));
  };

  // ─── Create Election ──────────────────────────────────────────────────────
  const handleCreateElection = async (e) => {
    e.preventDefault();
    const newElec = {
      id: elecId || 'ELEC-' + Date.now(),
      title: elecTitle, category: elecCategory,
      description: elecDesc, status: 'active',
      created_at: new Date().toISOString(),
    };
    try {
      await fetch('/api/elections', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newElec),
      });
    } catch (_) {}
    const updated = [...elections, newElec];
    setElections(updated);
    saveLocal(updated, candidates, voters);
    setShowCreateElectionModal(false);
    setElecId(''); setElecTitle(''); setElecDesc('');
    showAlert('Election created & activated! 🎉', 'success');
    fetchAdminStats();
  };

  // ─── Toggle Election Status ───────────────────────────────────────────────
  const toggleElectionStatus = async (id, newStatus) => {
    const updated = elections.map(e => e.id === id ? { ...e, status: newStatus } : e);
    setElections(updated);
    saveLocal(updated, candidates, voters);
    try {
      await fetch(`/api/elections/${id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (_) {}
    showAlert(`Election ${newStatus === 'active' ? 'activated' : 'closed'}!`, 'success');
    fetchAdminStats();
  };

  // ─── Delete Election ──────────────────────────────────────────────────────
  const deleteElection = (id) => {
    const updated = elections.filter(e => e.id !== id);
    const updatedCands = candidates.filter(c => c.election_id !== id);
    setElections(updated);
    setCandidates(updatedCands);
    saveLocal(updated, updatedCands, voters);
    setShowDeleteConfirm(null);
    showAlert('Election deleted.', 'success');
    fetchAdminStats();
  };

  // ─── Create Candidate ─────────────────────────────────────────────────────
  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    const targetId = candElectionId || (elections.length > 0 ? elections[0].id : '');
    const newCand = {
      id: candId || 'CAND-' + Date.now(),
      election_id: targetId, name: candName,
      department: candParty || 'General', party: candParty || 'General',
      manifesto: candManifesto || '',
      photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(candName)}&background=6366f1&color=fff&size=300`,
      vote_count: 0,
    };
    try {
      await fetch('/api/candidates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCand),
      });
    } catch (_) {}
    const updated = [...candidates, newCand];
    setCandidates(updated);
    saveLocal(elections, updated, voters);
    setShowCreateCandModal(false);
    setCandId(''); setCandName(''); setCandParty(''); setCandManifesto('');
    showAlert('Candidate registered! 👤', 'success');
    fetchAdminStats();
  };

  // ─── Delete Candidate ─────────────────────────────────────────────────────
  const deleteCandidate = (id) => {
    const updated = candidates.filter(c => c.id !== id);
    setCandidates(updated);
    saveLocal(elections, updated, voters);
    showAlert('Candidate removed.', 'success');
    fetchAdminStats();
  };

  // ─── CSV Export ───────────────────────────────────────────────────────────
  const exportCSV = () => {
    if (!selectedResultElectionId) return showAlert('Please select an election first.');
    const election = elections.find(e => e.id === selectedResultElectionId);
    const cands = candidates.filter(c => c.election_id === selectedResultElectionId);
    const totalVotes = cands.reduce((s, c) => s + (c.vote_count || 0), 0);

    let csv = 'data:text/csv;charset=utf-8,';
    csv += `Election Title,${election ? election.title : 'Results'}\n`;
    csv += `Total Ballots,${totalVotes}\nExport Date,${new Date().toLocaleDateString()}\n\n`;
    csv += 'Candidate ID,Name,Party/Department,Votes,Percentage\n';
    cands.forEach(c => {
      const votes = c.vote_count || 0;
      const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
      csv += `${c.id},"${c.name}","${c.party || c.department}",${votes},${pct}%\n`;
    });

    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `VotePulse_Report_${selectedResultElectionId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert('CSV Report downloaded! 📥', 'success');
  };

  // ─── Not Logged In ────────────────────────────────────────────────────────
  if (!adminUser) {
    return <AdminLogin onLogin={handleAdminLogin} alertMsg={alertMsg} />;
  }

  // ─── Computed values for Results tab ─────────────────────────────────────
  const selectedElection = elections.find(e => e.id === selectedResultElectionId);
  const selectedCandidates = candidates.filter(c => c.election_id === selectedResultElectionId);
  const totalResultVotes = selectedCandidates.reduce((s, c) => s + (c.vote_count || 0), 0);

  // Filtered data
  const filteredVoters = voters.filter(v =>
    !voterSearch ||
    (v.name || '').toLowerCase().includes(voterSearch.toLowerCase()) ||
    (v.voter_id || '').toLowerCase().includes(voterSearch.toLowerCase()) ||
    (v.email || '').toLowerCase().includes(voterSearch.toLowerCase())
  );
  const filteredCandidates = candidates.filter(c =>
    !candSearch ||
    (c.name || '').toLowerCase().includes(candSearch.toLowerCase()) ||
    (c.party || c.department || '').toLowerCase().includes(candSearch.toLowerCase())
  );

  const handleDeleteUser = async (voterId, name) => {
    if (voterId.toUpperCase() === 'ADM-9999') {
      showAlert('System Primary Administrator (ADM-9999) cannot be deleted.', 'error');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user "${name}" (${voterId})? This action is permanent.`)) return;

    try {
      const res = await fetch(`/api/admin/users/${voterId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showAlert(`User "${name}" deleted successfully.`, 'success');
        setVoters(prev => prev.filter(v => v.voter_id !== voterId));
      } else {
        showAlert(data.message || 'Failed to delete user.');
      }
    } catch (err) {
      showAlert('Error connecting to server.');
    }
  };

  // ─── Tab definitions ──────────────────────────────────────────────────────
  const tabs = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'elections', icon: '🗳️', label: `Elections (${elections.length})` },
    { id: 'candidates', icon: '👤', label: `Candidates (${candidates.length})` },
    { id: 'voters', icon: '👥', label: `Voters (${voters.length})` },
    { id: 'results', icon: '📈', label: 'Results' },
    { id: 'audit', icon: '🔍', label: 'Ballot Audit' },
    { id: 'database', icon: '🗄️', label: 'Database UI' },
  ];

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="main-container">
      <AlertToast msg={alertMsg} />

      {/* ── Admin Header Bar ─────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.08))',
        border: '1px solid rgba(245,158,11,0.3)', borderRadius: '16px',
        padding: '1rem 1.5rem', marginBottom: '1.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(245,158,11,0.35)',
          }}>⚡</div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admin Session</div>
            <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '1rem' }}>{adminUser.id}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={(e) => { e.preventDefault(); let t = window.location.pathname.replace(/\/admin(\.html)?\/?$/i, '/'); if (!t.endsWith('/')) t += '/'; window.location.href = t; }}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            🗳️ Voter Portal
          </button>
          <button
            onClick={fetchAdminStats}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {isLoading ? '⏳' : '🔄'} Refresh
          </button>
          <button
            onClick={handleLogout}
            className="btn"
            style={{
              padding: '0.45rem 0.9rem', fontSize: '0.82rem',
              background: 'rgba(239,68,68,0.15)', color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px',
            }}
          >🚪 Logout</button>
        </div>
      </div>

      {/* ── KPI Stat Cards ───────────────────────────────────────────────── */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <StatCard icon="🗳️" label="Active Elections" value={stats.active_elections ?? 0} color="#6366f1" />
        <StatCard icon="👤" label="Candidates" value={stats.total_candidates ?? 0} color="#10b981" />
        <StatCard icon="👥" label="Registered Voters" value={stats.total_voters ?? 0} color="#06b6d4" />
        <StatCard icon="🏆" label="Votes Cast" value={stats.total_votes_cast ?? 0} color="#f59e0b" />
      </div>

      {/* ── Tab Bar ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: '6px', flexWrap: 'wrap',
        background: 'rgba(0,0,0,0.2)', padding: '5px',
        borderRadius: '14px', marginBottom: '2rem',
        border: '1px solid var(--border-glass)',
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: '1 1 auto', padding: '0.55rem 0.9rem', borderRadius: '10px',
              border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
              transition: 'all 0.2s ease', whiteSpace: 'nowrap',
              background: activeTab === t.id
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'transparent',
              color: activeTab === t.id ? '#fff' : 'var(--text-muted)',
              boxShadow: activeTab === t.id ? '0 4px 12px rgba(245,158,11,0.35)' : 'none',
            }}
          >{t.icon} {t.label}</button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB 1 ─ OVERVIEW
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
          {/* Quick Summary */}
          <div className="portal-card">
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📋 Election Summary
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>
                {elections.length} Total
              </span>
            </h2>
            {elections.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🗳️</div>
                <p>No elections yet. Go to Elections tab to create one.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {elections.map(e => (
                  <div key={e.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.85rem 1rem', borderRadius: '12px',
                    background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-glass)',
                  }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{e.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{e.category} · {e.id}</div>
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800,
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      background: e.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)',
                      color: e.status === 'active' ? '#10b981' : '#64748b',
                      border: `1px solid ${e.status === 'active' ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.3)'}`,
                    }}>{e.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Chart for first election */}
          <div className="portal-card">
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📈 Live Vote Tally
              {selectedElection && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '4px' }}>
                  — {selectedElection.title}
                </span>
              )}
            </h2>
            {elections.length > 0 && (
              <select
                className="form-input"
                style={{ marginBottom: '1.25rem', fontSize: '0.85rem' }}
                value={selectedResultElectionId}
                onChange={e => setSelectedResultElectionId(e.target.value)}
              >
                {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            )}
            <BarChart candidates={selectedCandidates} totalVotes={totalResultVotes} />
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <span>Total Ballots: <strong style={{ color: 'var(--primary)' }}>{totalResultVotes}</strong></span>
              <span>Candidates: <strong>{selectedCandidates.length}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 2 ─ ELECTIONS
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'elections' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>🗳️ Elections Management</h2>
            <button className="btn btn-primary" onClick={() => setShowCreateElectionModal(true)}>
              + Create New Election
            </button>
          </div>

          {elections.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px dashed var(--border-glass)', borderRadius: '20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗳️</div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No Elections Yet</h3>
              <p>Click "Create New Election" to set up your first poll.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {elections.map(e => (
                <div key={e.id} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                  borderRadius: '18px', padding: '1.25rem 1.5rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: '1rem',
                  borderLeft: `4px solid ${e.status === 'active' ? '#10b981' : '#64748b'}`,
                }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem' }}>{e.title}</span>
                      <span style={{
                        padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                        background: e.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)',
                        color: e.status === 'active' ? '#10b981' : '#64748b',
                        border: `1px solid ${e.status === 'active' ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.3)'}`,
                      }}>{e.status}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>{e.id}</span>
                      {' · '}{e.category}
                      {e.description && <span> · {e.description.slice(0, 60)}{e.description.length > 60 ? '…' : ''}</span>}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Candidates: <strong>{candidates.filter(c => c.election_id === e.id).length}</strong>
                      {' · '}Votes: <strong>{candidates.filter(c => c.election_id === e.id).reduce((s, c) => s + (c.vote_count || 0), 0)}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    {e.status === 'active' ? (
                      <button className="btn btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }} onClick={() => toggleElectionStatus(e.id, 'completed')}>
                        ⏹ Close Poll
                      </button>
                    ) : (
                      <button className="btn btn-emerald" style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }} onClick={() => toggleElectionStatus(e.id, 'active')}>
                        ▶ Activate
                      </button>
                    )}
                    <button
                      onClick={() => setShowDeleteConfirm(e)}
                      style={{
                        padding: '0.45rem 0.9rem', fontSize: '0.82rem', borderRadius: '10px',
                        background: 'rgba(239,68,68,0.12)', color: '#ef4444',
                        border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer', fontWeight: 700,
                      }}
                    >🗑 Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 3 ─ CANDIDATES
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'candidates' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>👤 Candidate Registry</h2>
            <button className="btn btn-primary" onClick={() => setShowCreateCandModal(true)}>
              + Register Candidate
            </button>
          </div>

          {/* Search */}
          <input
            className="form-input"
            placeholder="🔍 Search candidates by name or party..."
            value={candSearch}
            onChange={e => setCandSearch(e.target.value)}
            style={{ marginBottom: '1.25rem', fontSize: '0.9rem' }}
          />

          {filteredCandidates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px dashed var(--border-glass)', borderRadius: '20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{candSearch ? 'No results found' : 'No Candidates Yet'}</h3>
              <p>{candSearch ? 'Try a different search.' : 'Click "Register Candidate" to add candidates.'}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {filteredCandidates.map(c => {
                const elec = elections.find(e => e.id === c.election_id);
                const totalForElec = candidates.filter(cc => cc.election_id === c.election_id).reduce((s, cc) => s + (cc.vote_count || 0), 0);
                const pct = totalForElec > 0 ? Math.round(((c.vote_count || 0) / totalForElec) * 100) : 0;
                return (
                  <div key={c.id} style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                    borderRadius: '20px', overflow: 'hidden', transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--border-glass-glow)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border-glass)'; }}>
                    {/* Avatar */}
                    <div style={{
                      height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(16,185,129,0.15))',
                      borderBottom: '1px solid var(--border-glass)',
                    }}>
                      <div style={{
                        width: '60px', height: '60px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #10b981)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', fontWeight: 900, color: '#fff',
                        border: '3px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
                      }}>
                        {(c.name || '?')[0].toUpperCase()}
                      </div>
                    </div>

                    <div style={{ padding: '1.25rem' }}>
                      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', fontWeight: 800, marginBottom: '2px' }}>{c.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '4px' }}>{c.party || c.department}</div>
                      {c.manifesto && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                          "{c.manifesto.slice(0, 80)}{c.manifesto.length > 80 ? '…' : ''}"
                        </div>
                      )}

                      {/* Vote bar */}
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Votes</span>
                          <span style={{ color: '#10b981' }}>{c.vote_count || 0} ({pct}%)</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #10b981)', transition: 'width 0.8s ease', borderRadius: '6px' }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {elec ? elec.title.slice(0, 22) + (elec.title.length > 22 ? '…' : '') : c.election_id}
                        </span>
                        <button
                          onClick={() => { if (window.confirm(`Remove candidate "${c.name}"?`)) deleteCandidate(c.id); }}
                          style={{
                            background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)',
                            borderRadius: '8px', padding: '3px 10px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700,
                          }}
                        >Remove</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 4 ─ VOTERS
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'voters' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>👥 Voters Directory</h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '4px 12px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
              {voters.length + 1} registered
            </span>
          </div>

          <input
            className="form-input"
            placeholder="🔍 Search voters by ID, name, or email..."
            value={voterSearch}
            onChange={e => setVoterSearch(e.target.value)}
            style={{ marginBottom: '1.25rem', fontSize: '0.9rem' }}
          />

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Voter ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Registered</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* Admin Row */}
                <tr style={{ background: 'rgba(245,158,11,0.06)' }}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>0</td>
                  <td><span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#f59e0b' }}>ADM-9999</span></td>
                  <td><strong>System Administrator</strong></td>
                  <td style={{ color: 'var(--text-muted)' }}>admin@votepulse.org</td>
                  <td style={{ color: 'var(--text-muted)' }}>—</td>
                  <td style={{ color: 'var(--text-muted)' }}>2026-08-01</td>
                  <td><span style={{ padding: '2px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>ADMIN</span></td>
                  <td><span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>Protected</span></td>
                </tr>
                {filteredVoters.length === 0 && !voterSearch ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No voters registered yet.</td></tr>
                ) : filteredVoters.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No results for "{voterSearch}"</td></tr>
                ) : (
                  filteredVoters.map((v, i) => (
                    <tr key={i}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{i + 1}</td>
                      <td><span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary)' }}>{v.voter_id}</span></td>
                      <td><strong>{v.name}</strong></td>
                      <td style={{ color: 'var(--text-muted)' }}>{v.email}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{v.phone || '—'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{v.created_at ? new Date(v.created_at).toLocaleDateString() : '—'}</td>
                      <td><span style={{ padding: '2px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800, background: v.role==='admin'?'rgba(245,158,11,0.15)':'rgba(99,102,241,0.12)', color: v.role==='admin'?'#f59e0b':'var(--primary)', border: v.role==='admin'?'1px solid rgba(245,158,11,0.3)':'1px solid rgba(99,102,241,0.25)' }}>{(v.role || 'VOTER').toUpperCase()}</span></td>
                      <td>
                        {v.voter_id === 'ADM-9999' ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>Protected</span>
                        ) : (
                          <button
                            className="btn-danger-glass"
                            onClick={() => handleDeleteUser(v.voter_id, v.name)}
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 5 ─ LIVE RESULTS
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'results' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>📈 Live Tally & Reports</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>Real-time vote count per candidate with cryptographic receipt support.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <select
                className="form-input"
                style={{ width: 'auto', minWidth: '180px', fontSize: '0.85rem' }}
                value={selectedResultElectionId}
                onChange={e => setSelectedResultElectionId(e.target.value)}
              >
                {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
              <button className="btn btn-emerald" onClick={exportCSV} style={{ whiteSpace: 'nowrap' }}>
                📥 Export CSV
              </button>
            </div>
          </div>

          {!selectedElection ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px dashed var(--border-glass)', borderRadius: '20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <p>No election selected. Create an election first.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Election Info Bar */}
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                borderRadius: '18px', padding: '1.25rem 1.5rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
                borderLeft: `4px solid ${selectedElection.status === 'active' ? '#10b981' : '#64748b'}`,
              }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{selectedElection.title}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedElection.category} · ID: {selectedElection.id}</div>
                </div>
                <div style={{ display: 'flex', gap: '2rem', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>{totalResultVotes}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Ballots</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>{selectedCandidates.length}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Candidates</div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="portal-card">
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem' }}>🏆 Vote Distribution</h3>
                {selectedCandidates.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No candidates in this election. Register candidates first.
                  </div>
                ) : (
                  <BarChart candidates={selectedCandidates} totalVotes={totalResultVotes} />
                )}
              </div>

              {/* Leaderboard */}
              {selectedCandidates.length > 0 && (
                <div className="portal-card">
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem' }}>🥇 Leaderboard</h3>
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Candidate</th>
                          <th>Party / Dept</th>
                          <th>Votes</th>
                          <th>Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...selectedCandidates]
                          .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
                          .map((c, i) => {
                            const votes = c.vote_count || 0;
                            const pct = totalResultVotes > 0 ? Math.round((votes / totalResultVotes) * 100) : 0;
                            const medals = ['🥇', '🥈', '🥉'];
                            return (
                              <tr key={c.id} style={{ background: i === 0 ? 'rgba(245,158,11,0.05)' : 'transparent' }}>
                                <td style={{ fontSize: '1.2rem' }}>{medals[i] || (i + 1)}</td>
                                <td><strong>{c.name}</strong></td>
                                <td style={{ color: 'var(--text-muted)' }}>{c.party || c.department}</td>
                                <td><strong style={{ color: 'var(--primary)' }}>{votes}</strong></td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden', minWidth: '60px' }}>
                                      <div style={{ width: `${pct}%`, height: '100%', background: i === 0 ? '#f59e0b' : 'var(--primary)', borderRadius: '6px' }} />
                                    </div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: i === 0 ? '#f59e0b' : 'var(--primary)', minWidth: '32px' }}>{pct}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 6 ─ BALLOT AUDIT
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'audit' && <BallotAuditTool />}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 7 ─ DATABASE UI VISUALIZER
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'database' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 className="gradient-text-neon" style={{ fontSize: '1.4rem', fontWeight: 800 }}>🗄️ Database Visualizer & Manager</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>Real-time metrics for Hybrid SQL (SQLite) & NoSQL (MongoDB) storage engines.</p>
            </div>
            <button className="btn btn-secondary" onClick={fetchAdminStats} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              🔄 Refresh DB Status
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="card glass-card">
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>DB ARCHITECTURE MODE</h4>
              <h2 style={{ color: '#38bdf8', marginTop: '0.5rem', fontSize: '1.3rem', fontWeight: 800 }}>Hybrid SQL + NoSQL</h2>
            </div>
            <div className="card glass-card">
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>RELATIONAL SQL ENGINE</h4>
              <h2 style={{ color: '#10b981', marginTop: '0.5rem', fontSize: '1.1rem', fontWeight: 800 }}>SQLite 3 Active</h2>
            </div>
            <div className="card glass-card">
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>NOSQL DOCUMENT ENGINE</h4>
              <h2 style={{ color: '#c084fc', marginTop: '0.5rem', fontSize: '1.1rem', fontWeight: 800 }}>MongoDB Ingest Stream</h2>
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 800 }}>📊 Live Storage Schemas & Document Counts</h3>
            <div className="table-container glass-table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Collection / Table Name</th>
                    <th>Engine Type</th>
                    <th>Primary Key Index</th>
                    <th>Total Document Count</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>users</td><td>SQL & NoSQL</td><td>voter_id (UNIQUE)</td><td>{voters.length + 1}</td><td><span className="badge-voter">OPTIMAL</span></td></tr>
                  <tr><td>elections</td><td>SQL & NoSQL</td><td>id (PRIMARY KEY)</td><td>{elections.length}</td><td><span className="badge-voter">OPTIMAL</span></td></tr>
                  <tr><td>candidates</td><td>SQL & NoSQL</td><td>id (FOREIGN KEY)</td><td>{candidates.length}</td><td><span className="badge-voter">OPTIMAL</span></td></tr>
                  <tr><td>votes</td><td>NoSQL & SQL</td><td>sha256_hash (SEAL)</td><td>{stats.total_votes_cast || 0}</td><td><span className="badge-voter">ENCRYPTED</span></td></tr>
                  <tr><td>gmail_tokens</td><td>NoSQL</td><td>voter_id (TTL 10m)</td><td>Active</td><td><span className="badge-admin">AUTO-EXPIRE</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MODAL: CREATE ELECTION
      ══════════════════════════════════════════════════════════════════ */}
      {showCreateElectionModal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowCreateElectionModal(false); }}>
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>🗳️ Create New Election</h2>
              <button onClick={() => setShowCreateElectionModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form onSubmit={handleCreateElection}>
              <div className="form-group">
                <label className="form-label">Election ID <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(auto-generated if empty)</span></label>
                <input className="form-input" type="text" placeholder="ELEC-2026-01" value={elecId} onChange={e => setElecId(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Election Title *</label>
                <input className="form-input" type="text" placeholder="Student Council Election 2026" value={elecTitle} onChange={e => setElecTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={elecCategory} onChange={e => setElecCategory(e.target.value)}>
                  <option value="General Poll">General Poll</option>
                  <option value="Departmental Poll">Departmental Poll</option>
                  <option value="Executive Council">Executive Council</option>
                  <option value="Faculty Election">Faculty Election</option>
                  <option value="Club/Society Election">Club / Society Election</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} placeholder="Brief election description..." value={elecDesc} onChange={e => setElecDesc(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} type="button" onClick={() => setShowCreateElectionModal(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 2 }} type="submit">Create & Activate →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MODAL: REGISTER CANDIDATE
      ══════════════════════════════════════════════════════════════════ */}
      {showCreateCandModal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowCreateCandModal(false); }}>
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>👤 Register Candidate</h2>
              <button onClick={() => setShowCreateCandModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            {elections.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <p>Create an election first before registering candidates.</p>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => { setShowCreateCandModal(false); setShowCreateElectionModal(true); }}>Create Election</button>
              </div>
            ) : (
              <form onSubmit={handleCreateCandidate}>
                <div className="form-group">
                  <label className="form-label">Target Election *</label>
                  <select className="form-input" value={candElectionId} onChange={e => setCandElectionId(e.target.value)} required>
                    <option value="">Select Election…</option>
                    {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Candidate ID <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                  <input className="form-input" type="text" placeholder="CAND-101" value={candId} onChange={e => setCandId(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" type="text" placeholder="Rahul Sharma" value={candName} onChange={e => setCandName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Party / Department</label>
                  <input className="form-input" type="text" placeholder="Computer Science Dept." value={candParty} onChange={e => setCandParty(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Manifesto</label>
                  <textarea className="form-input" rows={2} placeholder="Candidate's vision and promises..." value={candManifesto} onChange={e => setCandManifesto(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} type="button" onClick={() => setShowCreateCandModal(false)}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex: 2 }} type="submit">Register Candidate →</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MODAL: DELETE ELECTION CONFIRM
      ══════════════════════════════════════════════════════════════════ */}
      {showDeleteConfirm && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowDeleteConfirm(null); }}>
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div style={{ textAlign: 'center', padding: '1rem 0 1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Delete Election?</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                This will permanently delete <strong>"{showDeleteConfirm.title}"</strong> and all its candidates.
                This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button
                className="btn"
                style={{ flex: 1, background: 'linear-gradient(135deg,#dc2626,#ef4444)', color: '#fff', boxShadow: '0 4px 12px rgba(239,68,68,0.4)' }}
                onClick={() => deleteElection(showDeleteConfirm.id)}
              >🗑 Delete Forever</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
