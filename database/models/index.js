/**
 * Database Model Registry
 * Provides model references for all core system entities.
 */
const VoterSchema = require('./voter.schema');
const AdminSchema = require('./admin.schema');
const CandidateSchema = require('./candidate.schema');
const ElectionSchema = require('./election.schema');

module.exports = {
  VoterSchema,
  AdminSchema,
  CandidateSchema,
  ElectionSchema
};
