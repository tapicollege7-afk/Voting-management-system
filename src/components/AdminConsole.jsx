import React, { useState, useEffect } from 'react';
import BallotAuditTool from './BallotAuditTool';

export default function AdminConsole({ adminUser, setAdminUser }) {
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Stats & Data
  const [stats, setStats] = useState({ total_voters: 0, active_elections: 0, total_candidates: 0, total_votes_cast: 0 });
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [voters, setVoters] = useState([]);
  const [selectedResultElectionId, setSelectedResultElectionId] = useState('');

  // Modals
  const [showCreateElectionModal, setShowCreateElectionModal] = useState(false);
  const [showCreateCandModal, setShowCreateCandModal] = useState(false);
  const [showCreateVoterModal, setShowCreateVoterModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // Forms
  const [elecId, setElecId] = useState('');
  const [elecTitle, setElecTitle] = useState('');
  const [elecCategory, setElecCategory] = useState('General Poll');
  const [elecDesc, setElecDesc] = useState('');

  const [candElectionId, setCandElectionId] = useState('');
  const [candId, setCandId] = useState('');
  const [candName, setCandName] = useState('');
  const [candParty, setCandParty] = useState('');
  const [candManifesto, setCandManifesto] = useState('');

  const [newVoterId, setNewVoterId] = useState('');
  const [newVoterName, setNewVoterName] = useState('');
  const [newVoterEmail, setNewVoterEmail] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('votepulse_admin');
    if (saved) {
      try { setAdminUser(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (adminUser) {
      fetchAdminStats();
    }
  }, [adminUser]);

  const showAlert = (msg, type = 'error') => {
    setAlertMsg({ text: msg, type });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPass === 'admin123' || adminPass === 'voter123') {
      const u = { id: adminId || 'ADM-9999', role: 'admin' };
      localStorage.setItem('votepulse_admin', JSON.stringify(u));
      setAdminUser(u);
    } else {
      showAlert("Invalid Admin password. Default is admin123.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('votepulse_admin');
    setAdminUser(null);
  };

  const fetchAdminStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setElections(data.elections);
          setCandidates(data.candidates);
          setVoters(data.voters || []);
          if (data.elections.length > 0 && !selectedResultElectionId) {
            setSelectedResultElectionId(data.elections[0].id);
          }
          return;
        }
      }
    } catch (err) {}

    // Fallback Local Storage Read
    const localElecs = localStorage.getItem('votepulse_admin_elections');
    const localCands = localStorage.getItem('votepulse_admin_candidates');
    const localVoters = localStorage.getItem('votepulse_admin_voters');

    const elecsArr = localElecs ? JSON.parse(localElecs) : [];
    const candsArr = localCands ? JSON.parse(localCands) : [];
    const votersArr = localVoters ? JSON.parse(localVoters) : [];

    setElections(elecsArr);
    setCandidates(candsArr);
    setVoters(votersArr);

    const totalVotes = candsArr.reduce((sum, c) => sum + (c.vote_count || 0), 0);
    setStats({
      total_voters: votersArr.length + 1,
      active_elections: elecsArr.filter(e => e.status === 'active').length,
      total_candidates: candsArr.length,
      total_votes_cast: totalVotes
    });

    if (elecsArr.length > 0 && !selectedResultElectionId) {
      setSelectedResultElectionId(elecsArr[0].id);
    }
  };

  const saveLocalData = (elecsArr, candsArr, votersArr) => {
    localStorage.setItem('votepulse_admin_elections', JSON.stringify(elecsArr));
    localStorage.setItem('votepulse_admin_candidates', JSON.stringify(candsArr));
    localStorage.setItem('votepulse_admin_voters', JSON.stringify(votersArr));
  };

  // Create Election
  const handleCreateElection = async (e) => {
    e.preventDefault();
    const newElec = { id: elecId || 'ELEC-' + Date.now(), title: elecTitle, category: elecCategory, description: elecDesc, status: 'active' };

    try {
      await fetch('/api/elections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newElec)
      });
    } catch (err) {}

    const updated = [...elections, newElec];
    setElections(updated);
    saveLocalData(updated, candidates, voters);
    setShowCreateElectionModal(false);
    setElecId(''); setElecTitle(''); setElecDesc('');
    showAlert("New election created & activated!", 'success');
    fetchAdminStats();
  };

  // Toggle Election Status
  const toggleElectionStatus = async (id, newStatus) => {
    const updated = elections.map(e => e.id === id ? { ...e, status: newStatus } : e);
    setElections(updated);
    try {
      await fetch(`/api/elections/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {}
    saveLocalData(updated, candidates, voters);
    showAlert(`Election status changed to ${newStatus}`, 'success');
    fetchAdminStats();
  };

  // Create Candidate
  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    const targetElecId = candElectionId || (elections.length > 0 ? elections[0].id : '');
    const newCand = {
      id: candId || 'CAND-' + Date.now(),
      election_id: targetElecId,
      name: candName,
      department: candParty,
      party: candParty,
      manifesto: candManifesto,
      photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
      vote_count: 0
    };

    try {
      await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCand)
      });
    } catch (err) {}

    const updated = [...candidates, newCand];
    setCandidates(updated);
    saveLocalData(elections, updated, voters);
    setShowCreateCandModal(false);
    setCandId(''); setCandName(''); setCandParty(''); setCandManifesto('');
    showAlert("Candidate registered successfully!", 'success');
    fetchAdminStats();
  };

  const deleteCandidate = (id) => {
    if (window.confirm("Remove candidate?")) {
      const updated = candidates.filter(c => c.id !== id);
      setCandidates(updated);
      saveLocalData(elections, updated, voters);
      showAlert("Candidate removed.", 'success');
      fetchAdminStats();
    }
  };

  // Create Voter
  const handleCreateVoter = (e) => {
    e.preventDefault();
    const newVoter = { voter_id: newVoterId, name: newVoterName, email: newVoterEmail, created_at: new Date().toISOString() };
    const updated = [...voters, newVoter];
    setVoters(updated);
    saveLocalData(elections, candidates, updated);
    setShowCreateVoterModal(false);
    setNewVoterId(''); setNewVoterName(''); setNewVoterEmail('');
    showAlert("New voter registered!", 'success');
    fetchAdminStats();
  };

  // CSV Export
  const exportCSV = () => {
    if (!selectedResultElectionId) return;
    const election = elections.find(e => e.id === selectedResultElectionId);
    const cands = candidates.filter(c => c.election_id === selectedResultElectionId);
    const totalVotes = cands.reduce((sum, c) => sum + (c.vote_count || 0), 0);

    let csv = "data:text/csv;charset=utf-8,";
    csv += `Election Title,${election ? election.title : 'Results'}\n`;
    csv += `Total Ballots Counted,${totalVotes}\n\n`;
    csv += "Candidate ID,Candidate Name,Party/Department,Vote Count,Percentage\n";

    cands.forEach(c => {
      const votes = c.vote_count || 0;
      const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
      csv += `${c.id},"${c.name}","${c.party || c.department}",${votes},${pct}%\n`;
    });

    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.href = uri;
    link.download = `VotePulse_Election_Report_${selectedResultElectionId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert("CSV Report downloaded successfully!", 'success');
  };

  // Render Login Modal if not authenticated as Admin
  if (!adminUser) {
    return (
      <div className="main-container">
        {alertMsg && (
          <div style={{ padding: '1rem', borderRadius: '10px', marginBottom: '1rem', fontWeight: 600, background: alertMsg.type === 'error' ? '#fef2f2' : '#ecfdf5', color: alertMsg.type === 'error' ? '#dc2626' : '#047857', border: `1px solid ${alertMsg.type === 'error' ? '#fecaca' : '#a7f3d0'}` }}>
            {alertMsg.text}
          </div>
        )}

        <div className="auth-box">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚡</div>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 800 }}>Admin Console Sign In</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Authorized Election Administrator Login.</p>
          </div>

          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label className="form-label">Administrator ID</label>
              <input className="form-input" type="text" placeholder="ADM-9999" value={adminId} onChange={e => setAdminId(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={adminPass} onChange={e => setAdminPass(e.target.value)} required />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} type="submit">
              Access Admin Dashboard &rarr;
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Active Admin Dashboard View
  const selectedResultElection = elections.find(e => e.id === selectedResultElectionId);
  const selectedResultCandidates = candidates.filter(c => c.election_id === selectedResultElectionId);
  const totalResultVotes = selectedResultCandidates.reduce((sum, c) => sum + (c.vote_count || 0), 0);

  return (
    <div className="main-container">
      {/* Admin Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '0.85rem 1.25rem', borderRadius: '12px' }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Admin Session: </span>
          <span style={{ color: '#d97706', fontWeight: 800 }}>{adminUser.id}</span>
        </div>
        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }} onClick={handleLogout}>Logout</button>
      </div>

      {alertMsg && (
        <div style={{ padding: '1rem', borderRadius: '10px', marginBottom: '1rem', fontWeight: 600, background: alertMsg.type === 'error' ? '#fef2f2' : '#ecfdf5', color: alertMsg.type === 'error' ? '#dc2626' : '#047857', border: `1px solid ${alertMsg.type === 'error' ? '#fecaca' : '#a7f3d0'}` }}>
          {alertMsg.text}
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-item">
          <div className="stat-number">{stats.active_elections}</div>
          <div className="stat-label">Active Elections</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{stats.total_candidates}</div>
          <div className="stat-label">Registered Candidates</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{stats.total_voters}</div>
          <div className="stat-label">Registered Voters</div>
        </div>
        <div className="stat-item">
          <div className="stat-number" style={{ color: '#d97706' }}>{stats.total_votes_cast}</div>
          <div className="stat-label">Total Votes Cast</div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: '12px', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button className={`theme-option-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Overview</button>
        <button className={`theme-option-btn ${activeTab === 'elections' ? 'active' : ''}`} onClick={() => setActiveTab('elections')}>🗳️ Elections ({elections.length})</button>
        <button className={`theme-option-btn ${activeTab === 'candidates' ? 'active' : ''}`} onClick={() => setActiveTab('candidates')}>👤 Candidates ({candidates.length})</button>
        <button className={`theme-option-btn ${activeTab === 'voters' ? 'active' : ''}`} onClick={() => setActiveTab('voters')}>👥 Voters Directory</button>
        <button className={`theme-option-btn ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>📈 Live Tally & Reports</button>
        <button className={`theme-option-btn ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>🔍 Internal Ballot Audit</button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="portal-card">
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>Active Election Summary</h2>
          {elections.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No elections configured. Go to Elections tab to create a poll.</p>
          ) : (
            <div>
              {elections.map(e => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--card-border)', borderRadius: '10px', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{e.title}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{e.category} — ID: {e.id}</span>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', background: e.status === 'active' ? '#ecfdf5' : '#f1f5f9', color: e.status === 'active' ? '#047857' : '#64748b' }}>
                    {e.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ELECTIONS */}
      {activeTab === 'elections' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Elections Lifecycle</h2>
            <button className="btn btn-primary" onClick={() => setShowCreateElectionModal(true)}>+ Create New Election</button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {elections.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No elections created yet.</td></tr>
                ) : (
                  elections.map(e => (
                    <tr key={e.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{e.id}</td>
                      <td><strong>{e.title}</strong></td>
                      <td>{e.category}</td>
                      <td><span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', background: e.status === 'active' ? '#ecfdf5' : '#f1f5f9', color: e.status === 'active' ? '#047857' : '#64748b' }}>{e.status}</span></td>
                      <td>
                        {e.status === 'active' ? (
                          <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.78rem' }} onClick={() => toggleElectionStatus(e.id, 'completed')}>Close Poll</button>
                        ) : (
                          <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.78rem' }} onClick={() => toggleElectionStatus(e.id, 'active')}>Activate</button>
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

      {/* TAB 3: CANDIDATES */}
      {activeTab === 'candidates' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Candidate Directory</h2>
            <button className="btn btn-primary" onClick={() => setShowCreateCandModal(true)}>+ Register New Candidate</button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Party / Department</th>
                  <th>Election ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No candidates registered yet.</td></tr>
                ) : (
                  candidates.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{c.id}</td>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.party || c.department}</td>
                      <td>{c.election_id}</td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.78rem', color: 'var(--danger)' }} onClick={() => deleteCandidate(c.id)}>Remove</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: VOTERS DIRECTORY */}
      {activeTab === 'voters' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Registered Voters Directory</h2>
            <button className="btn btn-primary" onClick={() => setShowCreateVoterModal(true)}>+ Register New Voter</button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Voter ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Registered On</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>ADM-9999</td>
                  <td><strong>System Administrator</strong></td>
                  <td>admin@votepulse.org</td>
                  <td>2026-08-01</td>
                </tr>
                {voters.map((v, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{v.voter_id}</td>
                    <td><strong>{v.name}</strong></td>
                    <td>{v.email}</td>
                    <td>{new Date(v.created_at || Date.now()).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: LIVE TALLY & CSV REPORT */}
      {activeTab === 'results' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Live Tally & Analytical Reports</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select an election poll to review candidate percentages and export CSV report.</p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <select className="form-input" style={{ width: 'auto' }} value={selectedResultElectionId} onChange={e => setSelectedResultElectionId(e.target.value)}>
                {elections.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>

              <button className="btn btn-emerald" onClick={exportCSV}>
                📥 Export CSV Report
              </button>
            </div>
          </div>

          {!selectedResultElection ? (
            <div className="already-voted-box">No election poll selected.</div>
          ) : (
            <div className="portal-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedResultElection.title}</h3>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedResultElection.category}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{totalResultVotes}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Ballots Counted</div>
                </div>
              </div>

              {selectedResultCandidates.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No candidates registered for this poll.</p>
              ) : (
                selectedResultCandidates.map(c => {
                  const votes = c.vote_count || 0;
                  const pct = totalResultVotes > 0 ? Math.round((votes / totalResultVotes) * 100) : 0;
                  return (
                    <div key={c.id} style={{ marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 700 }}>
                        <span>{c.name} ({c.party || c.department})</span>
                        <span style={{ color: 'var(--accent-emerald)' }}>{votes} votes ({pct}%)</span>
                      </div>
                      <div style={{ height: '10px', background: 'rgba(0,0,0,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-emerald)', transition: 'width 0.5s ease' }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: INTERNAL BALLOT AUDIT (Admin Internal Use Only) */}
      {activeTab === 'audit' && (
        <BallotAuditTool />
      )}

      {/* CREATE ELECTION MODAL */}
      {showCreateElectionModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>+ Create New Election</h2>
            <form onSubmit={handleCreateElection}>
              <div className="form-group">
                <label className="form-label">Election ID</label>
                <input className="form-input" type="text" placeholder="ELEC-2026-01" value={elecId} onChange={e => setElecId(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Election Title</label>
                <input className="form-input" type="text" placeholder="General Election 2026" value={elecTitle} onChange={e => setElecTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={elecCategory} onChange={e => setElecCategory(e.target.value)}>
                  <option value="General Poll">General Poll</option>
                  <option value="Departmental Poll">Departmental Poll</option>
                  <option value="Executive Council">Executive Council</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} placeholder="Election details..." value={elecDesc} onChange={e => setElecDesc(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} type="button" onClick={() => setShowCreateElectionModal(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 1 }} type="submit">Create & Activate &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CANDIDATE MODAL */}
      {showCreateCandModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>+ Register New Candidate</h2>
            <form onSubmit={handleCreateCandidate}>
              <div className="form-group">
                <label className="form-label">Target Election Poll</label>
                <select className="form-input" value={candElectionId} onChange={e => setCandElectionId(e.target.value)}>
                  {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Candidate ID</label>
                <input className="form-input" type="text" placeholder="CAND-101" value={candId} onChange={e => setCandId(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="Candidate Name" value={candName} onChange={e => setCandName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Party / Department</label>
                <input className="form-input" type="text" placeholder="Progress Party / Computer Science" value={candParty} onChange={e => setCandParty(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Manifesto Statement</label>
                <textarea className="form-input" rows={2} placeholder="Empowering innovation..." value={candManifesto} onChange={e => setCandManifesto(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} type="button" onClick={() => setShowCreateCandModal(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 1 }} type="submit">Register Candidate &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE VOTER MODAL */}
      {showCreateVoterModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>+ Register New Voter</h2>
            <form onSubmit={handleCreateVoter}>
              <div className="form-group">
                <label className="form-label">Voter ID</label>
                <input className="form-input" type="text" placeholder="VOT-9900" value={newVoterId} onChange={e => setNewVoterId(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="Voter Name" value={newVoterName} onChange={e => setNewVoterName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="voter@example.com" value={newVoterEmail} onChange={e => setNewVoterEmail(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} type="button" onClick={() => setShowCreateVoterModal(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 1 }} type="submit">Save Voter &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
