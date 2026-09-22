const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

async function runVotingEngineIntegrationTests(sharedContext = {}) {
  console.log('\n--- Running Voting Engine & Audit Integration Tests ---');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}: ${err.message}`);
      failed++;
    }
  }

  const voterId = sharedContext.testVoterId || `VOT-TEST-${Date.now()}`;
  const electionId = sharedContext.createdElectionId || '101';
  let candidateId = sharedContext.createdCandidateId || 'cand_1';
  let recordedSha256 = '';

  // 1. Cast Valid Ballot
  await test('POST /api/vote successfully records and seals first vote', async () => {
    const res = await fetch(`${BASE_URL}/api/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        election_id: electionId,
        voter_id: voterId,
        candidate_id: candidateId
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201, `Failed casting vote: ${JSON.stringify(data)}`);
    assert.strictEqual(data.success, true);
    assert.ok(data.vote?.receipt_id);
    assert.ok(data.vote?.sha256_seal);
    assert.ok(data.vote?.caesar_hash);
    recordedSha256 = data.vote.sha256_seal;
  });

  // 2. Double-Voting Prevention (CRITICAL SECURITY TEST)
  await test('POST /api/vote strictly rejects duplicate vote attempt from same voter', async () => {
    const res = await fetch(`${BASE_URL}/api/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        election_id: electionId,
        voter_id: voterId,
        candidate_id: candidateId
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400, 'Duplicate vote must return HTTP 400');
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.already_voted, true);
    assert.strictEqual(data.message.includes('Multiple voting is strictly prohibited'), true);
  });

  // 3. Voter Status Query
  await test('GET /api/voter/status/:voter_id/:election_id reflects has_voted = true', async () => {
    const res = await fetch(`${BASE_URL}/api/voter/status/${voterId}/${electionId}`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.has_voted, true);
    assert.ok(data.sha256_hash);
  });

  // 4. Public Cryptographic Ballot Audit Lookup
  await test('GET /api/vote/audit/:hash locates matching verified ballot seal', async () => {
    const res = await fetch(`${BASE_URL}/api/vote/audit/${recordedSha256}`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.audit);
    assert.strictEqual(data.audit.sha256_hash, recordedSha256);
    assert.strictEqual(data.audit.election_id, electionId);
  });

  // 5. Audit Lookup Rejects Fake Hash
  await test('GET /api/vote/audit/:hash returns HTTP 404 for invalid hash', async () => {
    const res = await fetch(`${BASE_URL}/api/vote/audit/fakehash1234567890abcdef1234567890abcdef`);
    const data = await res.json();
    assert.strictEqual(res.status, 404);
    assert.strictEqual(data.success, false);
  });

  console.log(`Voting Engine Tests Completed: ${passed} passed, ${failed} failed.`);
  return { passed, failed };
}

module.exports = { runVotingEngineIntegrationTests };

if (require.main === module) {
  runVotingEngineIntegrationTests().then(({ failed }) => {
    process.exit(failed > 0 ? 1 : 0);
  });
}
