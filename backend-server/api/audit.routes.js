const express = require('express');
const router = express.Router();
const db = require('../../database');

// Public Cryptographic Ballot Audit Query Endpoint
router.get('/vote/audit/:hash', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const { hash } = req.params;
    const auditResult = await db.auditBallotByHash(hash);

    if (auditResult) {
      res.json({ success: true, audit: auditResult });
    } else {
      res.status(404).json({ success: false, message: "No matching sealed ballot found for the provided cryptographic hash." });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
