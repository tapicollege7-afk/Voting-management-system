const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

async function runAuthIntegrationTests() {
  console.log('\n--- Running Authentication & OTP Integration Tests ---');
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

  const testVoterId = `TEST-VOT-${Date.now()}`;
  const testEmail = `testvoter_${Date.now()}@example.com`;
  let dispatchedOtp = '';

  // 1. Register Voter
  await test('POST /api/auth/register creates new voter and issues OTP token', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voter_id: testVoterId,
        name: 'Automated Test Voter',
        email: testEmail,
        phone: '9876543210',
        password: 'pass1'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201, `Expected status 201, got ${res.status}: ${JSON.stringify(data)}`);
    assert.strictEqual(data.success, true);
    assert.ok(data.token_code, 'Must return generated token code');
    dispatchedOtp = data.token_code;
  });

  // 2. Prevent Duplicate Email Registration
  await test('POST /api/auth/register blocks duplicate email registration', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voter_id: `OTHER-${Date.now()}`,
        name: 'Another Voter',
        email: testEmail,
        phone: '9876543210',
        password: 'pass2'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400, 'Expected status 400 for duplicate email');
    assert.strictEqual(data.success, false);
  });

  // 3. Reject Invalid OTP Code
  await test('POST /api/auth/verify-gmail-token rejects invalid OTP code', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/verify-gmail-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voter_id: testVoterId,
        token_code: '000000'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
  });

  // 4. Verify Valid OTP Code
  await test('POST /api/auth/verify-gmail-token accepts valid 6-digit OTP code', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/verify-gmail-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voter_id: testVoterId,
        token_code: dispatchedOtp
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
  });

  // 5. Login Voter with Valid Credentials
  await test('POST /api/auth/login succeeds with valid credentials', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voter_id: testVoterId,
        password: 'pass1'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.user);
    assert.strictEqual(data.user.voter_id, testVoterId);
  });

  // 6. Login Voter Rejects Incorrect Password
  await test('POST /api/auth/login rejects incorrect password with HTTP 401', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voter_id: testVoterId,
        password: 'wrongpassword'
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
  });

  console.log(`Auth Integration Tests Completed: ${passed} passed, ${failed} failed.`);
  return { passed, failed, testVoterId };
}

module.exports = { runAuthIntegrationTests };

if (require.main === module) {
  runAuthIntegrationTests().then(({ failed }) => {
    process.exit(failed > 0 ? 1 : 0);
  });
}
