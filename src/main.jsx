import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Register VotePulse Progressive Web App (PWA) Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('⚡ [PWA SW] Service Worker active:', reg.scope))
      .catch((err) => console.warn('⚠️ [PWA SW] Service Worker registration failed:', err));
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
