const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

async function runAdminIntegrationTests(sharedContext = {}) {
  console.log('\n--- Running Admin API Integration Tests ---');
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

  // 1. Get Admin Statistics
  await test('GET /api/admin/stats returns metrics and candidate/voter lists', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/stats`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.stats, 'Must return stats object');
    assert.ok(Array.isArray(data.elections), 'Must return elections array');
    assert.ok(Array.isArray(data.voters), 'Must return voters array');
  });

  // 2. Master Privacy Filter (ADM-9999 Must NEVER appear in voter lists)
  await test('GET /api/admin/stats excludes ADM-9999 from public voter roster', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/stats`);
    const data = await res.json();
    const hasAdminInVoters = data.voters.some(v => (v.voter_id || '').toUpperCase().startsWith('ADM-'));
    assert.strictEqual(hasAdminInVoters, false, 'Admins starting with ADM- must not leak into voter list');
  });

  // 3. Live Election Results Tally
  await test('GET /api/admin/results/:election_id calculates candidate percentages', async () => {
    const targetElection = sharedContext.createdElectionId || '101';
    const res = await fetch(`${BASE_URL}/api/admin/results/${targetElection}`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.election);
    assert.ok(typeof data.total_votes_cast === 'number');
    assert.ok(Array.isArray(data.candidates));
  });

  // 4. Master Admin Deletion Protection
  await test('DELETE /api/admin/voters/ADM-9999 is blocked with HTTP 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/voters/ADM-9999`, {
      method: 'DELETE'
    });
    const data = await res.json();
    assert.strictEqual(res.status, 403, 'System Primary Admin cannot be deleted');
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message.includes('ADM-9999'), true);
  });

  // 5. Cleanup Test Artifacts (Candidate & Election)
  if (sharedContext.createdCandidateId) {
    await test('DELETE /api/candidates/:id cleans up test candidate', async () => {
      const res = await fetch(`${BASE_URL}/api/candidates/${sharedContext.createdCandidateId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
    });
  }

  if (sharedContext.createdElectionId) {
    await test('DELETE /api/elections/:id cleans up test election', async () => {
      const res = await fetch(`${BASE_URL}/api/elections/${sharedContext.createdElectionId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
    });
  }

  console.log(`Admin API Tests Completed: ${passed} passed, ${failed} failed.`);
  return { passed, failed };
}

module.exports = { runAdminIntegrationTests };

if (require.main === module) {
  runAdminIntegrationTests().then(({ failed }) => {
    process.exit(failed > 0 ? 1 : 0);
  });
}
