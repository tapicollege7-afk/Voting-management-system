import React, { useState, useEffect, useRef } from 'react';
import { Navbar, SettingsModal } from './common';
import VoterPortal from './voter';
import CandidatePortal from './candidate';
import AdminConsole from './admin';
import BallotAuditTool from './audit';

export default function App() {
  // Direct Routing Resolution: checks hash, pathname, search params, and sessionStorage
  const getInitialRoute = () => {
    const hash = window.location.hash.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    const stored = (sessionStorage.getItem('votepulse_active_route') || '').toLowerCase();

    // 1. Explicit URL Hash priority
    if (hash.includes('candidate')) return 'candidate';
    if (hash.includes('admin')) return 'admin';
    if (hash.includes('audit')) return 'audit';
    if (hash.includes('voter')) return 'voter';

    // 2. Explicit Pathname priority
    if (pathname.includes('candidate')) return 'candidate';
    if (pathname.includes('admin')) return 'admin';
    if (pathname.includes('audit')) return 'audit';
    if (pathname.includes('voter')) return 'voter';

    // 3. Search query params priority
    if (search.includes('candidate')) return 'candidate';
    if (search.includes('admin')) return 'admin';
    if (search.includes('audit')) return 'audit';
    if (search.includes('voter')) return 'voter';

    // 4. Stored session fallback
    if (['candidate', 'admin', 'audit', 'voter'].includes(stored)) {
      return stored;
    }

    return 'voter';
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const [theme, setTheme] = useState(localStorage.getItem('votepulse_theme') || 'dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // User Sessions
  const [voterUser, setVoterUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);

  // Theme and Module Routing effects
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('votepulse_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-module', currentRoute);
  }, [currentRoute]);

  // PWA Install Prompt State
  const [installPrompt, setInstallPrompt] = useState(() => window.deferredPWAInstallPrompt || null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }

    if (window.deferredPWAInstallPrompt) {
      setInstallPrompt(window.deferredPWAInstallPrompt);
      if (!sessionStorage.getItem('pwa_banner_dismissed')) {
        setShowInstallBanner(true);
      }
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      window.deferredPWAInstallPrompt = e;
      setInstallPrompt(e);
      if (!sessionStorage.getItem('pwa_banner_dismissed')) {
        setShowInstallBanner(true);
      }
    };

    window.onPWAInstallPromptReady = (e) => {
      setInstallPrompt(e);
      if (!sessionStorage.getItem('pwa_banner_dismissed')) {
        setShowInstallBanner(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setInstallPrompt(null);
      window.deferredPWAInstallPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const activePrompt = window.deferredPWAInstallPrompt || installPrompt;
    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const result = await activePrompt.userChoice;
        if (result.outcome === 'accepted') {
          setShowInstallBanner(false);
          setInstallPrompt(null);
          window.deferredPWAInstallPrompt = null;
          setIsInstalled(true);
          return;
        }
      } catch (err) {
        console.warn('Native PWA install prompt error:', err);
      }
    }

    // Direct Windows Application Shortcut Download (.url file opens as native app shortcut on Windows)
    const urlShortcutContent = `[InternetShortcut]\r\nURL=${window.location.origin}/#voter\r\nIconIndex=0\r\n`;
    const blob = new Blob([urlShortcutContent], { type: 'application/x-mswinurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VotePulse-App.url';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowInstallBanner(false);
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', '1');
  };

  // Auto-logout helper: terminates active sessions when switching to another module
  const clearModuleSessions = () => {
    setAdminUser(null);
    setVoterUser(null);
    sessionStorage.removeItem('votepulse_admin');
    sessionStorage.removeItem('votepulse_voter');
    sessionStorage.removeItem('votepulse_candidate_session');
    localStorage.removeItem('votepulse_admin');
    localStorage.removeItem('votepulse_voter');
    localStorage.removeItem('votepulse_candidate_session');
  };

  // Sync hash and pathname changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();

      let target = 'voter';
      if (hash.includes('candidate') || pathname.includes('candidate') || search.includes('candidate')) {
        target = 'candidate';
      } else if (hash.includes('admin') || pathname.includes('admin') || search.includes('admin')) {
        target = 'admin';
      } else if (hash.includes('audit') || pathname.includes('audit') || search.includes('audit')) {
        target = 'audit';
      }

      setCurrentRoute(prev => {
        if (prev !== target) {
          clearModuleSessions();
        }
        return target;
      });
      sessionStorage.setItem('votepulse_active_route', target);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigate between modules cleanly - auto logs out when leaving current module
  const navigateTo = (newRoute) => {
    if (newRoute !== currentRoute) {
      clearModuleSessions();
    }
    sessionStorage.setItem('votepulse_active_route', newRoute);
    if (newRoute === 'voter') {
      window.location.hash = '';
    } else {
      window.location.hash = newRoute;
    }
    setCurrentRoute(newRoute);
  };

  // Global Keyboard Shortcuts: Alt+1 (Voter), Alt+2 (Candidate), Alt+3 (Admin), Alt+4 (Audit)
  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      if (e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          navigateTo('voter');
        } else if (e.key === '2') {
          e.preventDefault();
          navigateTo('candidate');
        } else if (e.key === '3') {
          e.preventDefault();
          navigateTo('admin');
        } else if (e.key === '4') {
          e.preventDefault();
          navigateTo('audit');
        }
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, []);

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
            navigateTo={navigateTo}
          />
        )}

        {currentRoute === 'candidate' && (
          <CandidatePortal
            user={voterUser}
            setUser={setVoterUser}
            navigateTo={navigateTo}
          />
        )}

        {currentRoute === 'admin' && (
          <AdminConsole
            adminUser={adminUser}
            setAdminUser={setAdminUser}
            navigateTo={navigateTo}
          />
        )}

        {currentRoute === 'audit' && (
          <BallotAuditTool
            navigateTo={navigateTo}
          />
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
      />
    </div>
  );
}
