const express = require('express');
const router = express.Router();
const db = require('../../database');

// Admin Metrics & Tally (includes voter list excluding system admins)
router.get('/stats', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const stats = await db.getStats();
    const elections = await db.getElections();
    const candidates = await db.getCandidates();
    const votersRaw = await db.getAllVoters();
    const voters = (votersRaw || []).filter(u => u.role !== 'admin' && !(u.voter_id || '').toUpperCase().startsWith('ADM-'));

    res.json({
      success: true,
      stats,
      elections,
      candidates,
      voters
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Delete User (Voter or Admin) - Supports DELETE, POST, and GET
const handleDeleteUserRoute = async (req, res) => {
  try {
    const voter_id = req.params.voter_id || req.body?.voter_id || req.query?.voter_id;
    if (!voter_id) return res.status(400).json({ success: false, message: "Voter ID is required." });

    if (voter_id.toUpperCase() === 'ADM-9999') {
      return res.status(403).json({ success: false, message: "System Primary Administrator (ADM-9999) cannot be deleted." });
    }

    const result = await db.deleteUser(voter_id);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

router.delete('/users/:voter_id', handleDeleteUserRoute);
router.delete('/voters/:voter_id', handleDeleteUserRoute);
router.post('/users/delete', handleDeleteUserRoute);
router.post('/voters/delete', handleDeleteUserRoute);
router.get('/users/delete/:voter_id', handleDeleteUserRoute);
router.get('/voters/delete/:voter_id', handleDeleteUserRoute);

// Admin: Bulk Delete All Voters
router.delete('/voters/all', async (req, res) => {
  try {
    const result = await db.deleteAllVoters();
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Bulk Delete All Elections
router.delete('/elections/all', async (req, res) => {
  try {
    const result = await db.deleteAllElections();
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Purge / Factory Reset All System Data Permanently from Database
const handleResetDatabase = async (req, res) => {
  try {
    const result = await db.purgeAllData();
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

router.post('/reset-database', handleResetDatabase);
router.delete('/reset-database', handleResetDatabase);

// Admin: Visual Database Engine Metadata & Health
router.get('/db-info', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const metadata = await db.getDatabaseMetadata();
    res.json({ success: true, metadata });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Live Tally Breakdown
router.get('/results/:election_id', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const { election_id } = req.params;
    const elections = await db.getElections();
    const election = elections.find(e => e.id === election_id);
    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found." });
    }

    const candidates = await db.getCandidates(election_id);
    const totalVotes = candidates.reduce((sum, c) => sum + (c.vote_count || 0), 0);

    const breakdown = candidates.map(c => {
      const count = c.vote_count || 0;
      const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
      return {
        candidate_id: c.id,
        name: c.name,
        department: c.department || c.party,
        vote_count: count,
        percentage
      };
    });

    res.json({
      success: true,
      election,
      total_votes_cast: totalVotes,
      candidates: breakdown
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
