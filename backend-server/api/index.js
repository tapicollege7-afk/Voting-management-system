const express = require('express');
const router = express.Router();

const voterRoutes = require('./voter.routes');
const adminRoutes = require('./admin.routes');
const candidateRoutes = require('./candidate.routes');
const electionRoutes = require('./election.routes');
const auditRoutes = require('./audit.routes');

// Flow 1: Voter operations (auth, status, vote)
router.use('/', voterRoutes);

// Flow 2: Admin operations (stats, voters, users, reset, db-info, results)
router.use('/admin', adminRoutes);

// Flow 3: Candidate operations (list, add, delete)
router.use('/', candidateRoutes);

// Flow 4: Election operations (list, create, update, delete)
router.use('/', electionRoutes);

// Flow 5: Audit operations (cryptographic ballot audit)
router.use('/', auditRoutes);

module.exports = router;
