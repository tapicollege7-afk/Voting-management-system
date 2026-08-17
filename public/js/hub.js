// Hub JavaScript Logic & Advanced Settings Manager
let deferredPrompt;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initFontScale();
  fetchLiveStats();
  setupPWAInstallPrompt();
  registerServiceWorker();
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

function toggleSoundPref(enabled) {
  localStorage.setItem('votepulse_sound_enabled', enabled ? 'true' : 'false');
}

function togglePushPref(enabled) {
  localStorage.setItem('votepulse_push_enabled', enabled ? 'true' : 'false');
}

function clearSystemCache() {
  if (confirm("Are you sure you want to reset saved theme and local user preferences?")) {
    localStorage.clear();
    location.reload();
  }
}

// --- Settings Modal ---
function openSettingsModal() {
  document.getElementById('settingsModal').classList.add('show');
}

function closeSettingsModal() {
  document.getElementById('settingsModal').classList.remove('show');
}

function openAppDownloadGuide() {
  closeSettingsModal();
  document.getElementById('guideModal').classList.add('show');
}

function closeGuideModal() {
  document.getElementById('guideModal').classList.remove('show');
}

function scrollToStats() {
  document.getElementById('statsSection')?.scrollIntoView({ behavior: 'smooth' });
}

// --- PWA & Metrics ---
async function fetchLiveStats() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    if (data && data.stats) {
      document.getElementById('statVoters').textContent = data.stats.total_voters || '0';
      document.getElementById('statElections').textContent = data.stats.active_elections || '0';
      document.getElementById('statCandidates').textContent = data.stats.total_candidates || '0';
      document.getElementById('statVotes').textContent = data.stats.total_votes_cast || '0';
    }
  } catch (err) {
    console.warn("Could not fetch live system metrics:", err);
  }
}

function setupPWAInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

function triggerPwaInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(({ outcome }) => {
      console.log(`PWA install outcome: ${outcome}`);
      deferredPrompt = null;
      closeSettingsModal();
    });
  } else {
    openAppDownloadGuide();
  }
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Relative service worker path for GitHub Pages compatibility
    const swPath = window.location.pathname.includes('/public/') ? './sw.js' : './public/sw.js';
    navigator.serviceWorker.register(swPath)
      .then(reg => console.log('VotePulse Hub Service Worker registered:', reg.scope))
      .catch(err => console.warn('Service Worker registration failed:', err));
  }
}
