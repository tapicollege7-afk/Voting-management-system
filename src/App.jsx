import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import VoterPortal from './components/VoterPortal';
import AdminConsole from './components/AdminConsole';
import BallotAuditTool from './components/BallotAuditTool';
import SettingsModal from './components/SettingsModal';

export default function App() {
  // Direct Routing: '/' -> voter, '/admin' -> admin, '/audit' -> audit
  const getInitialRoute = () => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/audit')) return 'audit';
    return 'voter'; // Default route '/' is Voter Portal directly
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const [theme, setTheme] = useState(localStorage.getItem('votepulse_theme') || 'dark');
  const [fontScale, setFontScale] = useState(parseFloat(localStorage.getItem('votepulse_font_scale') || '1'));
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // In-Memory Sessions Only (Auto Logout on Page Departure / Back Navigation)
  const [voterUser, setVoterUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);

  // PWA Install Prompt State
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('votepulse_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', fontScale);
    localStorage.setItem('votepulse_font_scale', fontScale.toString());
  }, [fontScale]);

  // PWA Install Prompt Capture
  useEffect(() => {
    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault(); // Prevent auto-prompt
      setInstallPrompt(e); // Save event for later
      setShowInstallBanner(true); // Show our custom banner
      console.log('✅ [PWA] beforeinstallprompt captured — install banner shown');
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setInstallPrompt(null);
      console.log('✅ [PWA] App installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      console.log('[PWA] User install choice:', result.outcome);
      if (result.outcome === 'accepted') {
        setShowInstallBanner(false);
        setInstallPrompt(null);
      }
    } catch (err) {
      console.warn('[PWA] Install prompt error:', err);
    }
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    // Dismiss for this session, but not permanently
    sessionStorage.setItem('pwa_banner_dismissed', '1');
  };

  // Navigate with strict session auto-logout on route change
  const navigateTo = (newRoute) => {
    setVoterUser(null);
    setAdminUser(null);
    localStorage.removeItem('votepulse_voter');
    localStorage.removeItem('votepulse_admin');
    setCurrentRoute(newRoute);
  };

  return (
    <div>
      <Navbar
        currentRoute={currentRoute}
        navigateTo={navigateTo}
        theme={theme}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* PWA Install Banner */}
      {showInstallBanner && !isInstalled && (
        <div style={{
          position: 'fixed',
          bottom: '1.25rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 8px 32px rgba(79, 70, 229, 0.5), 0 2px 8px rgba(0,0,0,0.4)',
          maxWidth: '420px',
          width: 'calc(100% - 2rem)',
          animation: 'slideUp 0.4s ease-out',
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateX(-50%) translateY(20px); }
              to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
          `}</style>
          <div style={{ fontSize: '2rem', flexShrink: 0 }}>📱</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
              Install VotePulse App
            </div>
            <div style={{ fontSize: '0.78rem', opacity: 0.85, lineHeight: 1.4 }}>
              Add to home screen for instant access. Works offline!
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button
              onClick={handleInstallClick}
              style={{
                background: '#ffffff',
                color: '#4f46e5',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Install
            </button>
            <button
              onClick={dismissInstallBanner}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main>
        {currentRoute === 'voter' && (
          <VoterPortal
            user={voterUser}
            setUser={setVoterUser}
          />
        )}

        {currentRoute === 'admin' && (
          <AdminConsole
            adminUser={adminUser}
            setAdminUser={setAdminUser}
          />
        )}

        {currentRoute === 'audit' && (
          <BallotAuditTool />
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        fontScale={fontScale}
        setFontScale={setFontScale}
      />
    </div>
  );
}
