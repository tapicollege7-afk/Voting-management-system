import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import VoterPortal from './components/VoterPortal';
import CandidatePortal from './components/CandidatePortal';
import AdminConsole from './components/AdminConsole';
import BallotAuditTool from './components/BallotAuditTool';
import SettingsModal from './components/SettingsModal';

export default function App() {
  // Direct Routing Resolution: checks hash, pathname, search params, and sessionStorage
  const getInitialRoute = () => {
    const hash = window.location.hash.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    const stored = (sessionStorage.getItem('votepulse_active_route') || '').toLowerCase();

    if (hash.includes('candidate') || pathname.includes('candidate') || search.includes('candidate') || stored === 'candidate') {
      return 'candidate';
    }
    if (hash.includes('admin') || pathname.includes('admin') || search.includes('admin') || stored === 'admin') {
      return 'admin';
    }
    if (hash.includes('audit') || pathname.includes('audit') || search.includes('audit') || stored === 'audit') {
      return 'audit';
    }
    return 'voter';
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const [theme, setTheme] = useState(localStorage.getItem('votepulse_theme') || 'dark');
  const [fontScale, setFontScale] = useState(parseFloat(localStorage.getItem('votepulse_font_scale') || '1'));
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // User Sessions
  const [voterUser, setVoterUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);

  // Theme and Font Scale effects
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('votepulse_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', fontScale);
    localStorage.setItem('votepulse_font_scale', fontScale.toString());
  }, [fontScale]);

  // PWA Install Prompt State
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setInstallPrompt(null);
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
      if (result.outcome === 'accepted') {
        setShowInstallBanner(false);
        setInstallPrompt(null);
      }
    } catch (_) {}
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', '1');
  };

  // Sync hash and pathname changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();

      if (hash.includes('candidate') || pathname.includes('candidate') || search.includes('candidate')) {
        setCurrentRoute('candidate');
        sessionStorage.setItem('votepulse_active_route', 'candidate');
      } else if (hash.includes('admin') || pathname.includes('admin') || search.includes('admin')) {
        setCurrentRoute('admin');
        sessionStorage.setItem('votepulse_active_route', 'admin');
      } else if (hash.includes('audit') || pathname.includes('audit') || search.includes('audit')) {
        setCurrentRoute('audit');
        sessionStorage.setItem('votepulse_active_route', 'audit');
      } else {
        setCurrentRoute('voter');
        sessionStorage.setItem('votepulse_active_route', 'voter');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigate between modules cleanly
  const navigateTo = (newRoute) => {
    sessionStorage.setItem('votepulse_active_route', newRoute);
    if (newRoute === 'voter') {
      window.location.hash = '';
    } else {
      window.location.hash = newRoute;
    }
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

        {currentRoute === 'candidate' && (
          <CandidatePortal />
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
