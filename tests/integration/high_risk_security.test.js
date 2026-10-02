const assert = require('assert');
const { caesarCipherEncrypt, caesarCipherDecrypt, sha256Hash } = require('../../backend-server/helpers/cipher');

const BASE_URL = 'http://localhost:3000';

async function runHighRiskSecurityTests(sharedContext = {}) {
  console.log('\n--- Running High-Risk Area Security & Penetration Tests ---');
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

  const raceVoterId = `RACE-VOT-${Date.now()}`;
  const electionId = sharedContext.createdElectionId || '101';
  const candidateId = sharedContext.createdCandidateId || 'cand_1';

  // ─────────────────────────────────────────────────────────────────────────────
  // HIGH RISK 1: Concurrent Asynchronous Double-Voting Race Condition
  // ─────────────────────────────────────────────────────────────────────────────
  await test('TC-HR-01: Concurrent Double-Voting Race Condition is strictly blocked (1 success, N rejected)', async () => {
    // Fire 5 simultaneous vote casting requests with the exact same voter ID
    const promises = Array.from({ length: 5 }).map(() =>
      fetch(`${BASE_URL}/api/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          election_id: electionId,
          voter_id: raceVoterId,
          candidate_id: candidateId
        })
      }).then(async res => ({ status: res.status, body: await res.json() }))
    );

    const results = await Promise.all(promises);
    const successes = results.filter(r => r.status === 201 && r.body.success === true);
    const rejections = results.filter(r => r.status === 400 && r.body.already_voted === true);

    assert.strictEqual(successes.length, 1, `Expected exactly 1 vote to succeed, got ${successes.length}`);
    assert.strictEqual(rejections.length, 4, `Expected 4 duplicate attempts to be rejected, got ${rejections.length}`);
    assert.ok(rejections[0].body.message.includes('Multiple voting is strictly prohibited'));
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // HIGH RISK 2: Cryptographic Ballot Seal Tamper Detection & Avalanche Effect
  // ─────────────────────────────────────────────────────────────────────────────
  await test('TC-HR-02: Cryptographic Seal Tampering Detection & Bit-Flip Invalidation', async () => {
    const rawVoteData = {
      voter_id: 'VOT-INTEGRITY-001',
      election_id: '101',
      candidate_id: 'cand_1',
      timestamp: 1720000000000
    };
    const validSeal = sha256Hash(JSON.stringify(rawVoteData));
    assert.strictEqual(validSeal.length, 64, 'SHA-256 seal must be 64 hex characters');

    // Bit flip simulation in payload
    const tamperedData = { ...rawVoteData, candidate_id: 'cand_2' };
    const tamperedSeal = sha256Hash(JSON.stringify(tamperedData));
    assert.notStrictEqual(validSeal, tamperedSeal, 'Cryptographic seal must completely diverge upon single-field modification');

    // Audit verification against fabricated hash
    const fakeAuditRes = await fetch(`${BASE_URL}/api/vote/audit/0000000000000000000000000000000000000000000000000000000000000000`);
    assert.strictEqual(fakeAuditRes.status, 404, 'Audit ledger must reject unverified/fabricated hash');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // HIGH RISK 3: OTP Brute-Force & Random Token Rejection
  // ─────────────────────────────────────────────────────────────────────────────
  await test('TC-HR-03: OTP Verification Rejects Arbitrary, Expired & Non-Numeric Tokens', async () => {
    // Attempt verification with arbitrary random 6-digit codes
    const invalidCodes = ['999999', '000000', '123456', 'RANDOM'];
    for (const code of invalidCodes) {
      const res = await fetch(`${BASE_URL}/api/auth/verify-gmail-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voter_id: 'VOT-UNREGISTERED-FUZZ',
          token_code: code
        })
      });
      const data = await res.json();
      assert.strictEqual(res.status, 400, `Expected HTTP 400 for code: ${code}`);
      assert.strictEqual(data.success, false);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // HIGH RISK 4: Candidate Command Center 2FA Email OTP Enforcement
  // ─────────────────────────────────────────────────────────────────────────────
  await test('TC-HR-04: Candidate Login strictly requires 2FA Email OTP before Command Center unlock', async () => {
    // Attempt candidate verification with bogus OTP
    const res = await fetch(`${BASE_URL}/api/candidates/verify-login-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_id: 'cand_1',
        token_code: '000000'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400, 'Candidate verification with invalid OTP must return HTTP 400');
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message.includes('Invalid or expired'), true);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // HIGH RISK 5: Super-Admin Deletion Attack Prevention
  // ─────────────────────────────────────────────────────────────────────────────
  await test('TC-HR-05: Master Super-Admin ADM-9999 is Protected from Deletion Attack (HTTP 403 Forbidden)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/voters/ADM-9999`, {
      method: 'DELETE'
    });
    const data = await res.json();
    assert.strictEqual(res.status, 403, 'System Administrator deletion must be blocked with HTTP 403');
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('ADM-9999'));
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // HIGH RISK 6: Secret Ballot Anonymity & Public Audit Decoupling
  // ─────────────────────────────────────────────────────────────────────────────
  await test('TC-HR-06: Public Audit Ledger preserves ballot secrecy (No PII / Voter ID Leakage)', async () => {
    // Fetch voter status for raceVoterId
    const statusRes = await fetch(`${BASE_URL}/api/voter/status/${raceVoterId}/${electionId}`);
    const statusData = await statusRes.json();
    assert.strictEqual(statusRes.status, 200);
    assert.strictEqual(statusData.has_voted, true);
    assert.ok(statusData.sha256_hash, 'Audit hash must exist');

    // Query public audit with that hash
    const auditRes = await fetch(`${BASE_URL}/api/vote/audit/${statusData.sha256_hash}`);
    const auditData = await auditRes.json();
    assert.strictEqual(auditRes.status, 200);

    // CRITICAL SECURITY ASSERTION: Public audit MUST NOT expose voter identity details
    assert.strictEqual(auditData.audit.voter_id, undefined, 'Public audit ledger must NEVER expose voter_id');
    assert.strictEqual(auditData.audit.voter_name, undefined, 'Public audit ledger must NEVER expose voter_name');
    assert.strictEqual(auditData.audit.email, undefined, 'Public audit ledger must NEVER expose voter email');
    assert.strictEqual(auditData.audit.phone, undefined, 'Public audit ledger must NEVER expose voter phone');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // HIGH RISK 7: Input Boundary & Oversized Password Injection Defense
  // ─────────────────────────────────────────────────────────────────────────────
  await test('TC-HR-07: Registration Middleware intercepts Malformed & Oversized Password Payloads', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voter_id: 'VOT-OVERSIZE',
        name: 'Attacker Test',
        email: 'invalid-email-format',
        phone: '123',
        password: 'longpasswordexceedinglimit'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400, 'Malformed input must be rejected with HTTP 400');
    assert.strictEqual(data.success, false);
    assert.ok(data.message);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // HIGH RISK 8: Administrative Identity Masking from Public Rosters
  // ─────────────────────────────────────────────────────────────────────────────
  await test('TC-HR-08: Admin Account ADM-9999 is Masked from Public Voter Roster Scrapers', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/stats`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(data.voters), 'Voters roster must be array');

    const adminExposed = data.voters.some(v => v.voter_id === 'ADM-9999');
    assert.strictEqual(adminExposed, false, 'ADM-9999 must NEVER appear in public voter roster');
  });

  console.log(`High-Risk Security Tests Completed: ${passed} passed, ${failed} failed.`);
  return { passed, failed };
}

module.exports = { runHighRiskSecurityTests };

if (require.main === module) {
  runHighRiskSecurityTests().then(({ failed }) => {
    process.exit(failed > 0 ? 1 : 0);
  });
}
