// Admin Module State
let adminState = {
  adminUser: null,
  stats: null,
  elections: [],
  candidates: [],
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
      btnDark.style.background = '#d97706';
      btnDark.style.color = 'white';
      btnLight.style.background = 'transparent';
      btnLight.style.color = 'var(--text-muted)';
    } else {
      btnLight.style.background = '#d97706';
      btnLight.style.color = 'white';
      btnDark.style.background = 'transparent';
      btnDark.style.color = 'var(--text-muted)';
    }
  }
}

function openSettingsModal() {
  document.getElementById('settingsModal').classList.add('show');
}

function closeSettingsModal() {
  document.getElementById('settingsModal').classList.remove('show');
}

function showAdminAlert(msg, type = 'error') {
  const box = document.getElementById('adminGlobalAlert');
  if (!box) return;
  box.innerHTML = `<div style="padding:1rem; border-radius:10px; margin-bottom:1rem; font-weight:600; ${type === 'error' ? 'background:#fef2f2; border:1px solid #fecaca; color:#dc2626;' : 'background:#ecfdf5; border:1px solid #a7f3d0; color:#047857;'}">${msg}</div>`;
  setTimeout(() => { box.innerHTML = ''; }, 5000);
}

function handleAdminLogin(e) {
  e.preventDefault();
  const id = document.getElementById('adminIdInput').value.trim();
  const pass = document.getElementById('adminPassInput').value.trim();

  if (pass === 'admin123' || pass === 'voter123') {
    adminState.adminUser = { id, role: 'admin' };
    localStorage.setItem('votepulse_admin', JSON.stringify(adminState.adminUser));
    document.getElementById('adminAuthOverlay').style.display = 'none';
    fetchAdminStats();
  } else {
    document.getElementById('adminAuthAlert').innerHTML = `<div style="color:#dc2626; margin-bottom:1rem; font-size:0.9rem; font-weight:600;">Invalid admin password. Default password is <strong>admin123</strong></div>`;
  }
}

function checkAdminAuth() {
  const saved = localStorage.getItem('votepulse_admin');
  if (saved) {
    adminState.adminUser = JSON.parse(saved);
    document.getElementById('adminAuthOverlay').style.display = 'none';
    fetchAdminStats();
  }
}

function adminLogout() {
  localStorage.removeItem('votepulse_admin');
  adminState.adminUser = null;
  document.getElementById('adminAuthOverlay').style.display = 'flex';
}

function switchTab(tabId, btnElement) {
  document.querySelectorAll('.nav-item button').forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');

  document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');

  const panel = document.getElementById(`tab-${tabId}`);
  if (panel) panel.style.display = 'block';

  const titleMap = {
    'dashboard': 'System Overview & Audit Logs',
    'elections': 'Manage Elections & Polls',
    'candidates': 'Candidate Directory & Registration',
    'voters': 'Registered Voter Directory',
    'results': 'Live Tally & Analytical Reports'
  };
  document.getElementById('pageTitle').textContent = titleMap[tabId] || 'Admin Console';

  if (tabId === 'voters') loadVoters();
  if (tabId === 'results') initResultsView();
}

async function fetchAdminStats() {
  try {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();

    if (data.success) {
      adminState.stats = data.stats;
      adminState.elections = data.elections;
      adminState.candidates = data.candidates;

      document.getElementById('metricVoters').textContent = data.stats.total_voters || 0;
      document.getElementById('metricElections').textContent = data.stats.active_elections || 0;
      document.getElementById('metricCandidates').textContent = data.stats.total_candidates || 0;
      document.getElementById('metricVotes').textContent = data.stats.total_votes_cast || 0;

      renderRecentVotes(data.recent_votes);
      renderElectionsTable();
      renderCandidatesTable();
      populateDropdowns();
    }
  } catch (err) {
    showAdminAlert("Failed to load admin stats: " + err.message);
  }
}

function renderRecentVotes(votes = []) {
  const tbody = document.getElementById('recentVotesTable');
  if (!votes || votes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="color:var(--text-muted); text-align:center;">No voting activity recorded yet. Create an election to begin.</td></tr>`;
    return;
  }

  tbody.innerHTML = votes.map(v => `
    <tr>
      <td style="font-family:monospace;">${v.id}</td>
      <td>${v.election_id}</td>
      <td><strong>${v.voter_id}</strong></td>
      <td>${new Date(v.timestamp).toLocaleString()}</td>
      <td><span class="status-badge active">SEALED & RECORDED</span></td>
    </tr>
  `).join('');
}

// Elections CRUD
async function handleCreateElection(e) {
  e.preventDefault();
  const title = document.getElementById('elecTitle').value.trim();
  const category = document.getElementById('elecCategory').value;
  const description = document.getElementById('elecDesc').value.trim();

  try {
    const res = await fetch('/api/elections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, category, description })
    });
    const data = await res.json();

    if (data.success) {
      showAdminAlert("New election created successfully!", 'success');
      e.target.reset();
      fetchAdminStats();
    } else {
      showAdminAlert(data.message);
    }
  } catch (err) {
    showAdminAlert("Error creating election: " + err.message);
  }
}

function renderElectionsTable() {
  const tbody = document.getElementById('electionsTable');
  if (adminState.elections.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="color:var(--text-muted);">No elections configured yet. Use the form above to add an election.</td></tr>`;
    return;
  }

  tbody.innerHTML = adminState.elections.map(e => `
    <tr>
      <td style="font-family:monospace;">${e.id}</td>
      <td><strong>${e.title}</strong></td>
      <td>${e.category}</td>
      <td><span class="status-badge ${e.status === 'active' ? 'active' : 'completed'}">${e.status}</span></td>
      <td>
        ${e.status === 'active' 
          ? `<button class="btn-admin-secondary" style="padding:4px 10px; font-size:0.8rem;" onclick="toggleElectionStatus('${e.id}', 'completed')">Close Poll</button>`
          : `<button class="btn-admin-primary" style="padding:4px 10px; font-size:0.8rem;" onclick="toggleElectionStatus('${e.id}', 'active')">Activate</button>`
        }
      </td>
    </tr>
  `).join('');
}

async function toggleElectionStatus(id, newStatus) {
  try {
    const res = await fetch(`/api/elections/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();

    if (data.success) {
      showAdminAlert(`Election status changed to ${newStatus}`, 'success');
      fetchAdminStats();
    }
  } catch (err) {
    showAdminAlert("Status update failed.");
  }
}

// Candidates CRUD
async function handleAddCandidate(e) {
  e.preventDefault();
  const election_id = document.getElementById('candElectionSelect').value;
  const name = document.getElementById('candName').value.trim();
  const department = document.getElementById('candDept').value.trim();
  const photo_url = document.getElementById('candPhoto').value.trim();
  const manifesto = document.getElementById('candManifesto').value.trim();

  try {
    const res = await fetch('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ election_id, name, department, photo_url, manifesto })
    });
    const data = await res.json();

    if (data.success) {
      showAdminAlert("Candidate registered successfully!", 'success');
      e.target.reset();
      fetchAdminStats();
    }
  } catch (err) {
    showAdminAlert("Error registering candidate: " + err.message);
  }
}

function renderCandidatesTable() {
  const tbody = document.getElementById('candidatesTable');
  if (adminState.candidates.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="color:var(--text-muted);">No candidates registered yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = adminState.candidates.map(c => `
    <tr>
      <td style="font-family:monospace;">${c.id}</td>
      <td><strong>${c.name}</strong></td>
      <td>${c.department}</td>
      <td>${c.election_id}</td>
      <td><strong style="color:var(--accent-amber); font-size:1.1rem;">${c.vote_count || 0}</strong></td>
    </tr>
  `).join('');
}

function populateDropdowns() {
  const candSelect = document.getElementById('candElectionSelect');
  const resultsSelect = document.getElementById('resultsElectionDropdown');

  if (adminState.elections.length === 0) {
    if (candSelect) candSelect.innerHTML = `<option value="">-- No Elections Available --</option>`;
    if (resultsSelect) resultsSelect.innerHTML = `<option value="">-- No Elections Available --</option>`;
    return;
  }

  const options = adminState.elections.map(e => 
    `<option value="${e.id}">${e.title}</option>`
  ).join('');

  if (candSelect) candSelect.innerHTML = options;
  if (resultsSelect) resultsSelect.innerHTML = options;

  if (adminState.elections.length > 0 && !adminState.currentResultElectionId) {
    adminState.currentResultElectionId = adminState.elections[0].id;
  }
}

// Voter Roll Directory
async function loadVoters() {
  const tbody = document.getElementById('votersTable');
  try {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();

    tbody.innerHTML = `
      <tr>
        <td style="font-family:monospace;">ADM-9999</td>
        <td><strong>System Administrator</strong></td>
        <td>admin@votepulse.org</td>
        <td><span class="status-badge completed" style="background:#fef3c7; color:#b45309;">ADMIN</span></td>
        <td>2026-08-01</td>
      </tr>
    `;
  } catch (e) {
    console.error(e);
  }
}

// Live Tally & Analytical Reports
function initResultsView() {
  if (adminState.elections.length > 0) {
    const elecId = document.getElementById('resultsElectionDropdown').value || adminState.elections[0].id;
    loadElectionResults(elecId);
  } else {
    document.getElementById('resultsContainer').innerHTML = '<p style="color:var(--text-muted);">No active elections to display results.</p>';
  }
}

async function loadElectionResults(electionId) {
  if (!electionId) return;
  adminState.currentResultElectionId = electionId;
  const container = document.getElementById('resultsContainer');
  container.innerHTML = '<p style="color:var(--text-muted);">Fetching live election results...</p>';

  try {
    const res = await fetch(`/api/admin/results/${electionId}`);
    const data = await res.json();

    if (!data.success) {
      container.innerHTML = '<p style="color:var(--danger);">Error fetching election results.</p>';
      return;
    }

    if (data.candidates.length === 0) {
      container.innerHTML = '<p style="color:var(--text-muted);">No candidates recorded for this election poll yet.</p>';
      return;
    }

    container.innerHTML = `
      <div style="margin-bottom:1.5rem; background:#f8fafc; border:1px solid #e2e8f0; padding:1rem; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h3 style="font-size:1.1rem; font-weight:700;">${data.election.title}</h3>
          <span style="font-size:0.85rem; color:var(--text-muted);">${data.election.category}</span>
        </div>
        <div style="text-align:right;">
          <div style="font-size:1.6rem; font-weight:800; color:var(--accent-amber);">${data.total_votes_cast}</div>
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Total Ballots Counted</div>
        </div>
      </div>
    ` + data.candidates.map(c => `
      <div class="result-row">
        <div class="result-meta">
          <div>
            <strong>${c.name}</strong> <span style="font-weight:400; color:var(--text-muted);">(${c.department})</span>
          </div>
          <div>
            <strong style="color:var(--accent-emerald); font-size:1.1rem;">${c.vote_count} votes</strong> (${c.percentage}%)
          </div>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${c.percentage}%;"></div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = '<p style="color:var(--danger);">Error rendering live chart.</p>';
  }
}

// Export CSV Report
async function exportCSVReport() {
  if (!adminState.currentResultElectionId) return;

  try {
    const res = await fetch(`/api/admin/results/${adminState.currentResultElectionId}`);
    const data = await res.json();

    if (!data.success || !data.candidates) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Election Title,${data.election.title}\n`;
    csvContent += `Total Votes Cast,${data.total_votes_cast}\n\n`;
    csvContent += "Candidate ID,Candidate Name,Department,Vote Count,Percentage\n";

    data.candidates.forEach(c => {
      csvContent += `${c.candidate_id},"${c.name}","${c.department}",${c.vote_count},${c.percentage}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `VotePulse_Result_Report_${data.election.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showAdminAlert("CSV Report exported successfully!", 'success');
  } catch (err) {
    showAdminAlert("Failed to generate CSV report.");
  }
}

function setupPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/admin/sw.js')
      .then(reg => console.log('Admin PWA SW registered:', reg.scope))
      .catch(err => console.warn('Admin SW failed:', err));
  }
}
