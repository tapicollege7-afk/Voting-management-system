const express = require('express');
const router = express.Router();
const db = require('../../database');

// Elections: Get Elections List
router.get('/elections', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const elections = await db.getElections();
    res.json({ success: true, elections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Elections: Create Election
router.post('/elections', async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Election title and description are required." });
    }
    const newElection = await db.createElection({ title, description, category });
    res.status(201).json({ success: true, message: "Election created successfully.", election: newElection });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Elections: Update Status
router.patch('/elections/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await db.updateElectionStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Election not found." });
    }
    res.json({ success: true, message: `Election status updated to '${status}'.`, election: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Elections: Delete Election
const handleDeleteElection = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Election ID is required." });
    }
    const result = await db.deleteElection(id);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

router.delete('/elections/:id', handleDeleteElection);
router.post('/elections/:id/delete', handleDeleteElection);

module.exports = router;
