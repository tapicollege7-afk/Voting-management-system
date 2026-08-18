import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HubGateway from './components/HubGateway';
import VoterPortal from './components/VoterPortal';
import AdminConsole from './components/AdminConsole';
import BallotAuditTool from './components/BallotAuditTool';
import SettingsModal from './components/SettingsModal';

export default function App() {
  // Support route switching and standalone /admin route
  const getInitialRoute = () => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/voter')) return 'voter';
    if (path.startsWith('/audit')) return 'audit';
    return 'hub';
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const [theme, setTheme] = useState(localStorage.getItem('votepulse_theme') || 'dark');
  const [fontScale, setFontScale] = useState(parseFloat(localStorage.getItem('votepulse_font_scale') || '1'));
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // In-Memory Sessions (Cleared on Route Change / Back Navigation)
  const [voterUser, setVoterUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('votepulse_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', fontScale);
    localStorage.setItem('votepulse_font_scale', fontScale.toString());
  }, [fontScale]);

  // Navigate with strict session auto-logout on back navigation / route change
  const navigateTo = (newRoute) => {
    // Clear sessions when leaving module or returning home
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

      <main>
        {currentRoute === 'hub' && (
          <HubGateway
            navigateTo={navigateTo}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

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
