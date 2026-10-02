const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

async function runElectionCandidateIntegrationTests() {
  console.log('\n--- Running Election & Candidate Integration Tests ---');
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

  let createdElectionId = '';
  let createdCandidateId = '';

  // 1. Get Elections List
  await test('GET /api/elections returns list of active elections', async () => {
    const res = await fetch(`${BASE_URL}/api/elections`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.elections));
  });

  // 2. Create New Election
  await test('POST /api/elections creates a new election', async () => {
    const res = await fetch(`${BASE_URL}/api/elections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Test Integration Election ${Date.now()}`,
        description: 'Temporary election for integration testing',
        category: 'Testing'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.election?.id);
    createdElectionId = data.election.id;
  });

  // 3. Update Election Status
  await test('PATCH /api/elections/:id/status updates status', async () => {
    const res = await fetch(`${BASE_URL}/api/elections/${createdElectionId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.election.status, 'active');
  });

  // 4. Add Candidate to Election
  await test('POST /api/candidates registers a new candidate', async () => {
    const res = await fetch(`${BASE_URL}/api/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        election_id: createdElectionId,
        name: 'Test Candidate Alpha',
        department: 'Quality Assurance',
        manifesto: 'Ensure 100% test coverage and reliability.',
        photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.candidate?.id);
    createdCandidateId = data.candidate.id;
  });

  // 5. Get Candidates for Election
  await test('GET /api/candidates?election_id=... returns registered candidates', async () => {
    const res = await fetch(`${BASE_URL}/api/candidates?election_id=${createdElectionId}`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.candidates));
    assert.ok(data.candidates.some(c => c.id === createdCandidateId));
  });

  // 6. Update Auto Poll Close Schedule
  await test('PATCH /api/elections/:id/schedule updates auto close schedule', async () => {
    const futureTime = new Date(Date.now() + 3600 * 1000).toISOString();
    const res = await fetch(`${BASE_URL}/api/elections/${createdElectionId}/schedule`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ end_time: futureTime, auto_close: true })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.election.end_time, futureTime);
    assert.strictEqual(data.election.auto_close, true);
  });

  // 7. Auto Poll Close by Time: Expired election is marked completed & rejects vote
  await test('Auto Poll Close: expired election automatically transitions to completed and rejects vote', async () => {
    // Create temporary expired election
    const expiredElecRes = await fetch(`${BASE_URL}/api/elections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Auto Close Expired Test Poll',
        description: 'Testing poll auto-close expiration',
        category: 'Testing',
        end_time: new Date(Date.now() - 5000).toISOString(),
        auto_close: true
      })
    });
    const expiredElecData = await expiredElecRes.json();
    assert.strictEqual(expiredElecRes.status, 201);
    const expiredElecId = expiredElecData.election.id;

    // Add candidate to this election
    const candRes = await fetch(`${BASE_URL}/api/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        election_id: expiredElecId,
        name: 'Expired Poll Candidate',
        department: 'Testing'
      })
    });
    const candData = await candRes.json();
    const expiredCandId = candData.candidate.id;

    // Fetch elections - triggers checkAndAutoCloseElections and reflects completed
    const listRes = await fetch(`${BASE_URL}/api/elections`);
    const listData = await listRes.json();
    const closedElec = listData.elections.find(e => e.id === expiredElecId);
    assert.ok(closedElec, 'Expired election should exist in elections list');
    assert.strictEqual(closedElec.status, 'completed', 'Expired election should automatically be completed');

    // Attempting to cast vote on expired election must be strictly rejected
    const voteRes = await fetch(`${BASE_URL}/api/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        election_id: expiredElecId,
        voter_id: `VOT-EXPIRED-TEST-${Date.now()}`,
        candidate_id: expiredCandId
      })
    });
    const voteData = await voteRes.json();
    assert.strictEqual(voteRes.status, 400, 'Vote on expired election must return HTTP 400');
    assert.strictEqual(voteData.success, false);
    assert.strictEqual(voteData.poll_closed, true);

    // Clean up expired test election
    await fetch(`${BASE_URL}/api/elections/${expiredElecId}`, { method: 'DELETE' });
  });

  console.log(`Election & Candidate Tests Completed: ${passed} passed, ${failed} failed.`);
  return { passed, failed, createdElectionId, createdCandidateId };
}

module.exports = { runElectionCandidateIntegrationTests };

if (require.main === module) {
  runElectionCandidateIntegrationTests().then(({ failed }) => {
    process.exit(failed > 0 ? 1 : 0);
  });
}
