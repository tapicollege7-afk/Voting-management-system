// Admin Module State & Engine (Dual Localhost + GitHub Pages Support)
let adminState = {
  adminUser: null,
  stats: null,
  elections: [],
  candidates: [],
  voters: [],
  currentResultElectionId: null
};

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  checkAdminAuth();
  setupPWA();
});

// --- Theme & Settings Manager ---
function initTheme() {
  const savedTheme = localStorage.getItem('votepulse_theme') || 'light';
  setTheme(savedTheme);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('votepulse_theme', theme);

  const btnLight = document.getElementById('themeBtnLight');
  const btnDark = document.getElementById('themeBtnDark');

  if (btnLight && btnDark) {
    if (theme === 'dark') {
      btnDark.classList.add('active');
      btnLight.classList.remove('active');
    } else {
      btnLight.classList.add('active');
      btnDark.classList.remove('active');
    }
  }
}

function initFontScale() {
  const savedScale = localStorage.getItem('votepulse_font_scale') || '1';
  setFontScale(parseFloat(savedScale));
}

function setFontScale(scale) {
  document.documentElement.style.setProperty('--font-scale', scale);
  localStorage.setItem('votepulse_font_scale', scale.toString());
}

function openSettingsModal() {
  document.getElementById('settingsModal').classList.add('show');
}

function closeSettingsModal() {
  document.getElementById('settingsModal').classList.remove('show');
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('show');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('show');
}

function showAdminAlert(msg, type = 'error') {
  const box = document.getElementById('adminAlertBox');
  if (!box) return;
  box.innerHTML = `<div class="alert-banner ${type}" style="padding:1rem; border-radius:10px; margin-bottom:1rem; font-weight:600; ${type === 'error' ? 'background:#fef2f2; border:1px solid #fecaca; color:#dc2626;' : 'background:#ecfdf5; border:1px solid #a7f3d0; color:#047857;'}">${msg}</div>`;
  setTimeout(() => { box.innerHTML = ''; }, 6000);
}

function handleAdminLogin(e) {
  if (e) e.preventDefault();
  const id = document.getElementById('adminLoginId').value.trim();
  const pass = document.getElementById('adminLoginPass').value.trim();

  if (pass === 'admin123' || pass === 'voter123') {
    adminState.adminUser = { id, role: 'admin' };
    localStorage.setItem('votepulse_admin', JSON.stringify(adminState.adminUser));
    showAdminDashboard();
  } else {
    showAdminAlert("Invalid password. Default admin password is admin123", 'error');
  }
}

function checkAdminAuth() {
  const saved = localStorage.getItem('votepulse_admin');
  if (saved) {
    try {
      adminState.adminUser = JSON.parse(saved);
      showAdminDashboard();
      return;
    } catch (e) {
      localStorage.removeItem('votepulse_admin');
    }
  }
  document.getElementById('adminAuthView').style.display = 'block';
  document.getElementById('adminSidebar').style.display = 'none';
  document.getElementById('adminMainContent').style.display = 'none';
}

function handleAdminLogout() {
  localStorage.removeItem('votepulse_admin');
  adminState.adminUser = null;
  document.getElementById('adminAuthView').style.display = 'block';
  document.getElementById('adminSidebar').style.display = 'none';
  document.getElementById('adminMainContent').style.display = 'none';
  document.getElementById('adminTag').style.display = 'none';
  document.getElementById('adminLogoutBtn').style.display = 'none';
}

function showAdminDashboard() {
  document.getElementById('adminAuthView').style.display = 'none';
  document.getElementById('adminSidebar').style.display = 'block';
  document.getElementById('adminMainContent').style.display = 'block';
  document.getElementById('adminTag').style.display = 'inline-block';
  document.getElementById('adminTag').textContent = `Admin ID: ${adminState.adminUser.id}`;
  document.getElementById('adminLogoutBtn').style.display = 'inline-block';

  fetchAdminStats();
}

function switchTab(tabId) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

  const activeBtn = Array.from(document.querySelectorAll('.nav-item')).find(b => b.getAttribute('onclick')?.includes(tabId));
  if (activeBtn) activeBtn.classList.add('active');

  const pane = document.getElementById(`tab-${tabId}`);
  if (pane) pane.classList.add('active');

  if (tabId === 'voters') renderVotersTable();
  if (tabId === 'results') initResultsView();
}

async function fetchAdminStats() {
  try {
    const res = await fetch('/api/admin/stats');
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        adminState.stats = data.stats;
        adminState.elections = data.elections;
        adminState.candidates = data.candidates;
        adminState.voters = data.voters || [];
      } else {
        useLocalAdminData();
      }
    } else {
      useLocalAdminData();
    }
  } catch (err) {
    useLocalAdminData();
  }

  updateMetricsUI();
  renderElectionsTable();
  renderCandidatesTable();
  renderVotersTable();
  populateDropdowns();
}

function useLocalAdminData() {
  const savedElections = localStorage.getItem('votepulse_admin_elections');
  const savedCandidates = localStorage.getItem('votepulse_admin_candidates');
  const savedVoters = localStorage.getItem('votepulse_admin_voters');

  adminState.elections = savedElections ? JSON.parse(savedElections) : [];
  adminState.candidates = savedCandidates ? JSON.parse(savedCandidates) : [];
  adminState.voters = savedVoters ? JSON.parse(savedVoters) : [];
}

function saveLocalAdminData() {
  localStorage.setItem('votepulse_admin_elections', JSON.stringify(adminState.elections));
  localStorage.setItem('votepulse_admin_candidates', JSON.stringify(adminState.candidates));
  localStorage.setItem('votepulse_admin_voters', JSON.stringify(adminState.voters));
}

function updateMetricsUI() {
  const totalVotes = adminState.candidates.reduce((acc, c) => acc + (c.vote_count || 0), 0);
  document.getElementById('dashTotalElections').textContent = adminState.elections.length;
  document.getElementById('dashTotalCandidates').textContent = adminState.candidates.length;
  document.getElementById('dashTotalVoters').textContent = adminState.voters.length + 1; // including Admin
  document.getElementById('dashTotalVotes').textContent = totalVotes;

  const activeElec = adminState.elections.find(e => e.status === 'active');
  const summaryBox = document.getElementById('activeElectionSummary');
  if (activeElec) {
    summaryBox.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="font-size:1.1rem; color:var(--text-main);">${activeElec.title}</strong>
          <div style="font-size:0.85rem; color:var(--text-muted);">${activeElec.category} - ID: ${activeElec.id}</div>
        </div>
        <span class="status-badge active" style="background:#ecfdf5; color:#047857; padding:4px 10px; border-radius:20px; font-weight:700; font-size:0.8rem;">ACTIVE POLL</span>
      </div>
    `;
  } else {
    summaryBox.innerHTML = `<p style="color:var(--text-muted);">No active elections running currently.</p>`;
  }
}

// Elections Management
async function handleCreateElection(e) {
  e.preventDefault();
  const id = document.getElementById('newElecId').value.trim();
  const title = document.getElementById('newElecTitle').value.trim();
  const category = document.getElementById('newElecCategory').value.trim();
  const description = document.getElementById('newElecDesc').value.trim();

  const newElec = { id, title, category, description, status: 'active' };

  try {
    const res = await fetch('/api/elections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newElec)
    });
    if (res.ok) {
      const data = await res.json();
      if (!data.success) return showAdminAlert(data.message, 'error');
    }
  } catch (err) {
    console.warn("Saving election locally.", err);
  }

  adminState.elections.push(newElec);
  saveLocalAdminData();
  closeModal('createElectionModal');
  e.target.reset();

  showAdminAlert("New election created & activated!", 'success');
  fetchAdminStats();
}

function renderElectionsTable() {
  const tbody = document.getElementById('electionsTableBody');
  if (!tbody) return;

  if (adminState.elections.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="color:var(--text-muted); text-align:center;">No elections configured yet. Click "+ Create New Election" above.</td></tr>`;
    return;
  }

  tbody.innerHTML = adminState.elections.map(e => `
    <tr>
      <td style="font-family:monospace; font-weight:700;">${e.id}</td>
      <td><strong>${e.title}</strong></td>
      <td>${e.category}</td>
      <td><span style="padding:3px 8px; border-radius:12px; font-size:0.75rem; font-weight:800; text-transform:uppercase; ${e.status === 'active' ? 'background:#ecfdf5; color:#047857;' : 'background:#f1f5f9; color:#64748b;'}">${e.status}</span></td>
      <td>
        ${e.status === 'active' 
          ? `<button class="btn-sm btn-outline" style="padding:3px 8px; font-size:0.78rem;" onclick="toggleElectionStatus('${e.id}', 'completed')">Close Poll</button>`
          : `<button class="btn-primary" style="padding:3px 8px; font-size:0.78rem;" onclick="toggleElectionStatus('${e.id}', 'active')">Activate</button>`
        }
      </td>
    </tr>
  `).join('');
}

async function toggleElectionStatus(id, newStatus) {
  const elec = adminState.elections.find(e => e.id === id);
  if (elec) elec.status = newStatus;

  try {
    await fetch(`/api/elections/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
  } catch (e) {}

  saveLocalAdminData();
  showAdminAlert(`Election status updated to ${newStatus}`, 'success');
  fetchAdminStats();
}

// Candidates Management
async function handleCreateCandidate(e) {
  e.preventDefault();
  const election_id = document.getElementById('candElectionSelect').value;
  const id = document.getElementById('newCandId').value.trim();
  const name = document.getElementById('newCandName').value.trim();
  const party = document.getElementById('newCandParty').value.trim();
  const manifesto = document.getElementById('newCandManifesto').value.trim();

  const newCand = {
    id,
    election_id,
    name,
    department: party,
    party,
    manifesto,
    photo_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300",
    vote_count: 0
  };

  try {
    const res = await fetch('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCand)
    });
    if (res.ok) {
      const data = await res.json();
      if (!data.success) return showAdminAlert(data.message, 'error');
    }
  } catch (err) {
    console.warn("Saving candidate locally.", err);
  }

  adminState.candidates.push(newCand);
  saveLocalAdminData();
  closeModal('createCandidateModal');
  e.target.reset();

  showAdminAlert("Candidate registered successfully!", 'success');
  fetchAdminStats();
}

function renderCandidatesTable() {
  const tbody = document.getElementById('candidatesTableBody');
  if (!tbody) return;

  if (adminState.candidates.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="color:var(--text-muted); text-align:center;">No candidates registered. Click "+ Register New Candidate".</td></tr>`;
    return;
  }

  tbody.innerHTML = adminState.candidates.map(c => `
    <tr>
      <td style="font-family:monospace; font-weight:700;">${c.id}</td>
      <td><strong>${c.name}</strong></td>
      <td>${c.party || c.department}</td>
      <td>${c.election_id}</td>
      <td>
        <button class="btn-sm btn-outline" style="color:var(--danger); border-color:#fecaca;" onclick="deleteCandidate('${c.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function deleteCandidate(candId) {
  if (confirm("Are you sure you want to remove this candidate?")) {
    adminState.candidates = adminState.candidates.filter(c => c.id !== candId);
    saveLocalAdminData();
    showAdminAlert("Candidate removed.", 'success');
    fetchAdminStats();
  }
}

function populateDropdowns() {
  const select = document.getElementById('candElectionSelect');
  const resultsSelect = document.getElementById('resultsElectionSelect');

  if (adminState.elections.length === 0) {
    if (select) select.innerHTML = `<option value="">-- No Elections --</option>`;
    if (resultsSelect) resultsSelect.innerHTML = `<option value="">-- No Elections --</option>`;
    return;
  }

  const options = adminState.elections.map(e => `<option value="${e.id}">${e.title}</option>`).join('');
  if (select) select.innerHTML = options;
  if (resultsSelect) resultsSelect.innerHTML = options;

  if (!adminState.currentResultElectionId && adminState.elections.length > 0) {
    adminState.currentResultElectionId = adminState.elections[0].id;
  }
}

// Voter Registration
function handleAdminCreateVoter(e) {
  e.preventDefault();
  const voter_id = document.getElementById('adminVoterId').value.trim();
  const name = document.getElementById('adminVoterName').value.trim();
  const email = document.getElementById('adminVoterEmail').value.trim();
  const phone = document.getElementById('adminVoterPhone').value.trim();

  const newVoter = { voter_id, name, email, phone, created_at: new Date().toISOString() };
  adminState.voters.push(newVoter);
  saveLocalAdminData();

  closeModal('createVoterModal');
  e.target.reset();
  showAdminAlert("New voter registered!", 'success');
  renderVotersTable();
  updateMetricsUI();
}

function renderVotersTable() {
  const tbody = document.getElementById('votersTableBody');
  if (!tbody) return;

  let rows = `
    <tr>
      <td style="font-family:monospace; font-weight:700;">ADM-9999</td>
      <td><strong>System Administrator</strong></td>
      <td>admin@votepulse.org</td>
      <td>+1 555-0199</td>
      <td>2026-08-01</td>
    </tr>
  `;

  rows += adminState.voters.map(v => `
    <tr>
      <td style="font-family:monospace; font-weight:700;">${v.voter_id}</td>
      <td><strong>${v.name}</strong></td>
      <td>${v.email}</td>
      <td>${v.phone || 'N/A'}</td>
      <td>${new Date(v.created_at || Date.now()).toLocaleDateString()}</td>
    </tr>
  `).join('');

  tbody.innerHTML = rows;
}

// Results View
function initResultsView() {
  if (adminState.elections.length > 0) {
    const selectedId = document.getElementById('resultsElectionSelect').value || adminState.elections[0].id;
    loadResultsForSelected(selectedId);
  }
}

function loadResultsForSelected(electionId) {
  adminState.currentResultElectionId = electionId;
  const election = adminState.elections.find(e => e.id === electionId);
  const candidates = adminState.candidates.filter(c => c.election_id === electionId);

  document.getElementById('resultsPollTitle').textContent = election ? election.title : 'Election Results';

  const totalVotes = candidates.reduce((acc, c) => acc + (c.vote_count || 0), 0);
  document.getElementById('resultsPollTotalVotes').textContent = `Total Ballots Recorded: ${totalVotes}`;

  const barsArea = document.getElementById('resultsCandidateBars');

  if (candidates.length === 0) {
    barsArea.innerHTML = `<p style="color:var(--text-muted);">No candidates registered for this poll.</p>`;
    return;
  }

  barsArea.innerHTML = candidates.map(c => {
    const votes = c.vote_count || 0;
    const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
    return `
      <div class="result-candidate-item">
        <div class="result-candidate-header">
          <span>${c.name} (${c.party || c.department})</span>
          <span style="color:var(--accent);">${votes} votes (${pct}%)</span>
        </div>
        <div class="bar-bg">
          <div class="bar-fill" style="width: ${pct}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function exportResultsCSV() {
  if (!adminState.currentResultElectionId) return;

  const election = adminState.elections.find(e => e.id === adminState.currentResultElectionId);
  const candidates = adminState.candidates.filter(c => c.election_id === adminState.currentResultElectionId);
  const totalVotes = candidates.reduce((acc, c) => acc + (c.vote_count || 0), 0);

  let csv = "data:text/csv;charset=utf-8,";
  csv += `Election Title,${election ? election.title : 'Results'}\n`;
  csv += `Total Ballots Counted,${totalVotes}\n\n`;
  csv += "Candidate ID,Candidate Name,Party/Department,Vote Count,Percentage\n";

  candidates.forEach(c => {
    const votes = c.vote_count || 0;
    const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
    csv += `${c.id},"${c.name}","${c.party || c.department}",${votes},${pct}%\n`;
  });

  const uri = encodeURI(csv);
  const a = document.createElement('a');
  a.href = uri;
  a.download = `VotePulse_Election_Report_${adminState.currentResultElectionId}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  showAdminAlert("CSV Election Report downloaded successfully!", 'success');
}

function setupPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Admin PWA SW registered:', reg.scope))
      .catch(err => console.warn('Admin SW failed:', err));
  }
}
