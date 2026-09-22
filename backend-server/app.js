const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const db = require('../database');
const apiRoutes = require('./api');

const app = express();
const INITIAL_PORT = parseInt(process.env.PORT || '3000', 10);
const rootDir = path.resolve(__dirname, '..');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable browser caching for static files
const noCacheOptions = {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
};

// ===== PWA CRITICAL: Service Worker must be served at root scope =====
app.get('/sw.js', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'application/javascript');
  const distSw = path.join(rootDir, 'dist', 'sw.js');
  if (fs.existsSync(distSw)) {
    return res.sendFile(distSw);
  }
  res.sendFile(path.join(rootDir, 'sw.js'));
});

// Manifest must be at root scope for PWA install eligibility
app.get('/manifest.json', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'application/manifest+json');
  const distManifest = path.join(rootDir, 'dist', 'manifest.json');
  if (fs.existsSync(distManifest)) {
    return res.sendFile(distManifest);
  }
  res.sendFile(path.join(rootDir, 'manifest.json'));
});

// Serve Static React App & Public Assets
const distDir = path.join(rootDir, 'dist');
if (fs.existsSync(distDir)) {
  app.use('/', express.static(distDir, noCacheOptions));
}
app.use('/', express.static(path.join(rootDir, 'public'), noCacheOptions));

// --- REST API ENDPOINTS ---

// Health & System Info
app.get('/api/health', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const stats = await db.getStats();
    res.json({
      status: 'ok',
      system: 'VotePulse Secure Online Voting Engine',
      timestamp: new Date().toISOString(),
      stats
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Recent Outbox Emails Endpoint (Zero-Config Mailbox Inspection)
app.get('/api/emails/recent', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    success: true,
    emails: global.recentSentEmails || []
  });
});

// Mount modular flow-based API routes
app.use('/api', apiRoutes);

// Catch-all API error handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

// --- Module Navigation SPA Redirects ---
app.get('/admin', (req, res) => res.redirect('/#admin'));
app.get('/admin.html', (req, res) => res.redirect('/#admin'));
app.get('/candidate', (req, res) => res.redirect('/#candidate'));
app.get('/audit', (req, res) => res.redirect('/#audit'));

// Fallback for React SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const distIndex = path.join(rootDir, 'dist', 'index.html');
  if (fs.existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  res.sendFile(path.join(rootDir, 'index.html'));
});

// MongoDB Database Engine Connection & Server Startup
async function startServer(portToUse = INITIAL_PORT) {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/votepulse';
    await db.connect(mongoUri);
  } catch (err) {
    console.warn("⚠️ Server launched. Note: MongoDB connection failed. Make sure mongod is running.");
  }

  const server = app.listen(portToUse, () => {
    console.log(`===================================================`);
    console.log(`  🍃 VotePulse MongoDB E-Voting Server Running (Port ${portToUse})`);
    console.log(`  Access online at: http://localhost:${portToUse}`);
    console.log(`  Database Engine: MongoDB (NoSQL Document Store)`);
    console.log(`  Architecture: 3-Tier Modular Flow (Voter -> Admin -> Candidate)`);
    console.log(`===================================================`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${portToUse} is occupied. Trying Port ${portToUse + 1}...`);
      startServer(portToUse + 1);
    } else {
      console.error("Server startup error:", err);
    }
  });

  return server;
}

if (require.main === module) {
  startServer(INITIAL_PORT);
}

module.exports = { app, startServer };
