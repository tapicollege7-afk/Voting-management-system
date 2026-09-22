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

  console.log(`Election & Candidate Tests Completed: ${passed} passed, ${failed} failed.`);
  return { passed, failed, createdElectionId, createdCandidateId };
}

module.exports = { runElectionCandidateIntegrationTests };

if (require.main === module) {
  runElectionCandidateIntegrationTests().then(({ failed }) => {
    process.exit(failed > 0 ? 1 : 0);
  });
}
