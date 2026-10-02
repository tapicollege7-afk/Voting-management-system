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

// Elections: Create Election (with optional Auto Poll Close end_time)
router.post('/elections', async (req, res) => {
  try {
    const { title, description, category, end_time, auto_close } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Election title and description are required." });
    }
    const newElection = await db.createElection({ title, description, category, end_time, auto_close });
    res.status(201).json({ success: true, message: "Election created successfully.", election: newElection });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Elections: Update Status & optional end_time
router.patch('/elections/:id/status', async (req, res) => {
  try {
    const { status, end_time } = req.body;
    const updated = await db.updateElectionStatus(req.params.id, status, end_time);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Election not found." });
    }
    res.json({ success: true, message: `Election status updated to '${status}'.`, election: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Elections: Update Auto Close Schedule (end_time, auto_close)
router.patch('/elections/:id/schedule', async (req, res) => {
  try {
    const { end_time, auto_close } = req.body;
    const updated = await db.updateElectionSchedule(req.params.id, { end_time, auto_close });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Election not found." });
    }
    res.json({ success: true, message: "Election close schedule updated successfully.", election: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Elections: Manual / Background check trigger
router.post('/elections/check-auto-close', async (req, res) => {
  try {
    await db.checkAndAutoCloseElections();
    const elections = await db.getElections();
    res.json({ success: true, message: "Auto-close check executed.", elections });
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
