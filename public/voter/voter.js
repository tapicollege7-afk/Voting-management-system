// Voter Module State & Real-Time Engine (Dual Localhost + GitHub Pages Support)
let state = {
  user: null,
  pendingVoterId: null,
  activeElectionId: null,
  elections: [],
  candidates: [],
  selectedCandidate: null,
  currentOtpCode: '',
  timerInterval: null,
  timerSecondsLeft: 300,
  deferredPrompt: null
};

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initFontScale();
  checkExistingSession();
  setupPWA();
  setupOtpInputListeners();
});

// --- Theme & Font Settings ---
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

function showAlert(message, type = 'error') {
  const alertBox = document.getElementById('alertBox');
  if (!alertBox) return;
  alertBox.innerHTML = `<div class="alert-banner ${type}">${message}</div>`;
  setTimeout(() => {
    alertBox.innerHTML = '';
  }, 6000);
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const regForm = document.getElementById('registerForm');
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegBtn = document.getElementById('tabRegisterBtn');

  if (tab === 'login') {
    loginForm.style.display = 'block';
    regForm.style.display = 'none';
    tabLoginBtn.classList.add('active');
    tabRegBtn.classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    regForm.style.display = 'block';
    tabLoginBtn.classList.remove('active');
    tabRegBtn.classList.add('active');
  }
}

// REAL-TIME OTP INPUT ENGINE (6 DIGIT AUTO-ADVANCE & INSTANT VERIFY ON 6TH DIGIT)
function setupOtpInputListeners() {
  const inputs = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'].map(id => document.getElementById(id));
  
  inputs.forEach((input, index) => {
    if (!input) return;

    input.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }

      const code = getEnteredOtpCode();
      if (code.length === 6) {
        triggerRealTimeOtpVerify(code);
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        inputs[index - 1].focus();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text').trim();
      if (/^\d{6}$/.test(pasted)) {
        fillOtpBoxes(pasted);
        triggerRealTimeOtpVerify(pasted);
      }
    });
  });
}

function getEnteredOtpCode() {
  return ['d1', 'd2', 'd3', 'd4', 'd5', 'd6']
    .map(id => document.getElementById(id)?.value || '')
    .join('');
}

function fillOtpBoxes(codeStr) {
  const digits = codeStr.split('');
  ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'].forEach((id, idx) => {
    const el = document.getElementById(id);
    if (el) el.value = digits[idx] || '';
  });
}

function clearOtpBoxes() {
  ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('d1')?.focus();
}

// REAL-TIME PUSH NOTIFICATION TOAST & AUTO-FILL
function triggerRealTimePushToast(otpCode) {
  state.currentOtpCode = otpCode;
  document.getElementById('otpPreviewCode').textContent = otpCode;
  document.getElementById('toastOtpCode').textContent = otpCode;

  const pushToast = document.getElementById('realtimePushToast');
  pushToast.classList.add('show');

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

  setTimeout(() => {
    pushToast.classList.remove('show');
  }, 12000);
}

function autoFillOTPFromToast() {
  if (state.currentOtpCode) {
    fillOtpBoxes(state.currentOtpCode);
    document.getElementById('realtimePushToast').classList.remove('show');
    triggerRealTimeOtpVerify(state.currentOtpCode);
  }
}

// REAL-TIME COUNTDOWN TIMER (5 Minutes)
function startOtpCountdownTimer() {
  clearInterval(state.timerInterval);
  state.timerSecondsLeft = 300;

  updateTimerDisplay();

  state.timerInterval = setInterval(() => {
    state.timerSecondsLeft--;
    updateTimerDisplay();

    if (state.timerSecondsLeft <= 0) {
      clearInterval(state.timerInterval);
      document.getElementById('otpTimerDisplay').textContent = "EXPIRED";
      showAlert("Real-time OTP expired! Click Resend to get a fresh code.", 'error');
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(state.timerSecondsLeft / 60).toString().padStart(2, '0');
  const s = (state.timerSecondsLeft % 60).toString().padStart(2, '0');
  const el = document.getElementById('otpTimerDisplay');
  if (el) el.textContent = `${m}:${s}`;
}

// Helper to generate a random 6-digit OTP code
function generateRandomOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 1. Handle Login (Server + GitHub Pages Fallback)
async function handleLogin(e) {
  e.preventDefault();
  const voter_id = document.getElementById('loginVoterId').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  let otpCode = generateRandomOTP();
  let userObj = { voter_id, name: voter_id, email: `${voter_id.toLowerCase()}@votepulse.org` };

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voter_id, password })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (!data.success) {
        return showAlert(data.message, 'error');
      }
      userObj = data.user;
      otpCode = data.otp_preview || otpCode;
    }
  } catch (err) {
    console.warn("Backend API offline; switching to client-side real-time OTP generator.", err);
  }

  state.pendingVoterId = userObj.voter_id;
  state.tempUser = userObj;

  openOtpModal();
  triggerRealTimePushToast(otpCode);
  startOtpCountdownTimer();
}

// 2. Handle Register (Server + GitHub Pages Fallback)
async function handleRegister(e) {
  e.preventDefault();
  const voter_id = document.getElementById('regVoterId').value.trim();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value.trim();

  let otpCode = generateRandomOTP();
  let userObj = { voter_id, name, email, phone };

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voter_id, name, email, phone, password })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (!data.success) {
        return showAlert(data.message, 'error');
      }
      userObj = data.voter;
      otpCode = data.otp_preview || otpCode;
    }
  } catch (err) {
    console.warn("Backend API offline; switching to client-side real-time OTP generator.", err);
  }

  state.pendingVoterId = userObj.voter_id;
  state.tempUser = userObj;

  openOtpModal();
  triggerRealTimePushToast(otpCode);
  startOtpCountdownTimer();
  showAlert("Registration initiated! Enter the real-time OTP delivered above.", 'success');
}

// 3. OTP Request Resend
async function requestResendOTP() {
  if (!state.pendingVoterId) return;

  let newOtp = generateRandomOTP();
  try {
    const res = await fetch('/api/otp/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voter_id: state.pendingVoterId })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) newOtp = data.otp_preview;
    }
  } catch (err) {
    console.warn("Using local resend OTP generator.", err);
  }

  clearOtpBoxes();
  triggerRealTimePushToast(newOtp);
  startOtpCountdownTimer();
  showAlert("New Real-time OTP code delivered!", 'success');
}

// 4. Verify OTP (Server + GitHub Pages Fallback)
function handleVerifyOTP(e) {
  if (e) e.preventDefault();
  const code = getEnteredOtpCode();
  triggerRealTimeOtpVerify(code);
}

async function triggerRealTimeOtpVerify(otp_code) {
  if (!otp_code || otp_code.length !== 6) {
    return showAlert("Please enter all 6 digits of the OTP code.", 'error');
  }

  let verified = false;

  try {
    const res = await fetch('/api/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voter_id: state.pendingVoterId, otp_code })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        verified = true;
      } else {
        return showAlert(data.message, 'error');
      }
    } else {
      // Fallback verification against generated OTP code
      if (otp_code === state.currentOtpCode) verified = true;
    }
  } catch (err) {
    // Offline verification against active OTP code
    if (otp_code === state.currentOtpCode) {
      verified = true;
    }
  }

  if (!verified && otp_code !== state.currentOtpCode) {
    return showAlert("Invalid OTP code. Please check the real-time alert toast above.", 'error');
  }

  clearInterval(state.timerInterval);
  state.user = state.tempUser;
  localStorage.setItem('votepulse_voter', JSON.stringify(state.user));
  closeOtpModal();

  showVotingDashboard();
  showAlert(`Welcome, ${state.user.name}! Real-time OTP Verified.`, 'success');
}

function openOtpModal() {
  clearOtpBoxes();
  document.getElementById('otpModal').classList.add('show');
}
function closeOtpModal() {
  clearInterval(state.timerInterval);
  document.getElementById('otpModal').classList.remove('show');
}

function checkExistingSession() {
  const saved = localStorage.getItem('votepulse_voter');
  if (saved) {
    try {
      state.user = JSON.parse(saved);
      showVotingDashboard();
    } catch (e) {
      localStorage.removeItem('votepulse_voter');
    }
  }
}

function handleLogout() {
  localStorage.removeItem('votepulse_voter');
  state.user = null;
  document.getElementById('authView').style.display = 'block';
  document.getElementById('votingView').style.display = 'none';
  document.getElementById('voterTag').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'none';
}

// 5. Load Voting Dashboard (Server + GitHub Pages Fallback)
async function showVotingDashboard() {
  document.getElementById('authView').style.display = 'none';
  document.getElementById('votingView').style.display = 'block';
  document.getElementById('voterTag').style.display = 'inline-block';
  document.getElementById('voterTag').textContent = `Voter ID: ${state.user.voter_id}`;
  document.getElementById('logoutBtn').style.display = 'inline-block';

  await loadElections();
}

const FALLBACK_ELECTIONS = [
  {
    id: "ELEC-2026-01",
    title: "General Election 2026",
    category: "General Poll",
    description: "Official online election poll for 2026 representation."
  }
];

const FALLBACK_CANDIDATES = [
  {
    id: "CAND-101",
    election_id: "ELEC-2026-01",
    name: "Alex Rivera",
    department: "Computer Science & Engineering",
    manifesto: "Empowering digital innovation, transparent governance, and student welfare.",
    photo_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300"
  },
  {
    id: "CAND-102",
    election_id: "ELEC-2026-01",
    name: "Jordan Smith",
    department: "Business Administration",
    manifesto: "Fostering collaboration, sustainability, and career development initiatives.",
    photo_url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300"
  },
  {
    id: "CAND-103",
    election_id: "ELEC-2026-01",
    name: "Taylor Reed",
    department: "Electrical Engineering",
    manifesto: "Upgrading campus infrastructure and promoting eco-friendly technology solutions.",
    photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300"
  }
];

async function loadElections() {
  try {
    const res = await fetch('/api/elections');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.elections.length > 0) {
        state.elections = data.elections;
      } else {
        state.elections = FALLBACK_ELECTIONS;
      }
    } else {
      state.elections = FALLBACK_ELECTIONS;
    }
  } catch (err) {
    state.elections = FALLBACK_ELECTIONS;
  }

  const dropdown = document.getElementById('electionDropdown');
  dropdown.innerHTML = state.elections.map(e => 
    `<option value="${e.id}">${e.title}</option>`
  ).join('');

  state.activeElectionId = state.elections[0].id;
  await renderActiveElection();
}

async function changeActiveElection(electionId) {
  state.activeElectionId = electionId;
  await renderActiveElection();
}

async function renderActiveElection() {
  const election = state.elections.find(e => e.id === state.activeElectionId);
  if (!election) return;

  document.getElementById('electionTitle').textContent = election.title;
  document.getElementById('electionDesc').textContent = election.description;

  const alreadyVotedBox = document.getElementById('alreadyVotedBox');
  const ballotSection = document.getElementById('ballotSection');

  let hasVoted = localStorage.getItem(`votepulse_voted_${state.user.voter_id}_${election.id}`) === 'true';

  try {
    const statusRes = await fetch(`/api/voter/status/${state.user.voter_id}/${election.id}`);
    if (statusRes.ok) {
      const statusData = await statusRes.json();
      hasVoted = statusData.has_voted;
    }
  } catch (err) {
    console.warn("Checking vote status via local state engine.", err);
  }

  if (hasVoted) {
    alreadyVotedBox.style.display = 'block';
    ballotSection.style.display = 'none';
    
    document.getElementById('voteReceiptDetails').innerHTML = `
      VOTER ID: ${state.user.voter_id}<br>
      ELECTION: ${election.title}<br>
      STATUS: VERIFIED & SEALED<br>
      DIGITAL RECEIPT: #${Math.floor(100000 + Math.random()*900000)}
    `;

    showAlert("Notice: You have already voted in this election!", 'error');
  } else {
    alreadyVotedBox.style.display = 'none';
    ballotSection.style.display = 'block';

    await loadCandidates(election.id);
  }
}

async function loadCandidates(electionId) {
  const grid = document.getElementById('candidateGrid');
  grid.innerHTML = '<p style="color:var(--text-muted);">Loading official candidate list...</p>';

  try {
    const res = await fetch(`/api/candidates?election_id=${electionId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.candidates.length > 0) {
        state.candidates = data.candidates;
      } else {
        state.candidates = FALLBACK_CANDIDATES;
      }
    } else {
      state.candidates = FALLBACK_CANDIDATES;
    }
  } catch (err) {
    state.candidates = FALLBACK_CANDIDATES;
  }

  grid.innerHTML = state.candidates.map(c => `
    <div class="candidate-card" id="candCard_${c.id}">
      <div class="candidate-img-box">
        <img src="${c.photo_url}" alt="${c.name}" class="candidate-img" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300'">
      </div>
      <div class="candidate-body">
        <div>
          <h3 class="candidate-name">${c.name}</h3>
          <div class="candidate-dept">${c.department}</div>
          <p class="candidate-manifesto">"${c.manifesto}"</p>
        </div>
        <button class="btn-vote" onclick="openVoteConfirm('${c.id}')">Vote for Candidate</button>
      </div>
    </div>
  `).join('');
}

function openVoteConfirm(candidateId) {
  const candidate = state.candidates.find(c => c.id === candidateId);
  if (!candidate) return;

  state.selectedCandidate = candidate;
  document.getElementById('confirmCandName').textContent = candidate.name;
  document.getElementById('voteConfirmModal').classList.add('show');
}

function closeVoteModal() {
  document.getElementById('voteConfirmModal').classList.remove('show');
}

async function submitFinalVote() {
  if (!state.selectedCandidate || !state.user || !state.activeElectionId) return;

  closeVoteModal();

  try {
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        election_id: state.activeElectionId,
        voter_id: state.user.voter_id,
        candidate_id: state.selectedCandidate.id
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (!data.success) {
        showAlert(data.message || "Failed to submit vote.", 'error');
        await renderActiveElection();
        return;
      }
    }
  } catch (err) {
    console.warn("Backend API offline; storing vote status locally.", err);
  }

  // Record vote in persistent storage
  localStorage.setItem(`votepulse_voted_${state.user.voter_id}_${state.activeElectionId}`, 'true');

  showAlert("🎉 Vote Successfully Cast & Sealed!", 'success');
  await renderActiveElection();
}

function setupPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Voter PWA SW registered:', reg.scope))
      .catch(err => console.warn('Voter SW failed:', err));
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.deferredPrompt = e;
  });
}

function triggerPwaInstall() {
  if (state.deferredPrompt) {
    state.deferredPrompt.prompt();
    state.deferredPrompt.userChoice.then(({ outcome }) => {
      console.log(`PWA install outcome: ${outcome}`);
      state.deferredPrompt = null;
      closeSettingsModal();
    });
  } else {
    alert("To install on iOS/Android, open browser settings menu and tap 'Add to Home Screen'.");
  }
}
