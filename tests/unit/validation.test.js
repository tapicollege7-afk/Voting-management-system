const assert = require('assert');
const {
  validateVoterRegistration,
  validateOTPRequest,
  validateOTPVerify,
  validateVoteCast
} = require('../../backend-server/checks/validation');

function mockRes() {
  const res = {
    statusCode: null,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    }
  };
  return res;
}

function runValidationUnitTests() {
  console.log('\n--- Running Validation Middleware Unit Tests ---');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. validateVoterRegistration
  test('validateVoterRegistration passes for valid payload', () => {
    const req = {
      body: {
        voter_id: 'VOT-2026-1001',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        password: 'pass'
      }
    };
    const res = mockRes();
    let nextCalled = false;
    validateVoterRegistration(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(res.statusCode, null);
  });

  test('validateVoterRegistration rejects short voter ID (< 3 chars)', () => {
    const req = {
      body: {
        voter_id: 'V1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        password: 'pass'
      }
    };
    const res = mockRes();
    let nextCalled = false;
    validateVoterRegistration(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.success, false);
  });

  test('validateVoterRegistration rejects invalid email format', () => {
    const req = {
      body: {
        voter_id: 'VOT-1001',
        name: 'John Doe',
        email: 'invalid-email',
        phone: '9876543210',
        password: 'pass'
      }
    };
    const res = mockRes();
    let nextCalled = false;
    validateVoterRegistration(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.message.includes('valid email'), true);
  });

  test('validateVoterRegistration rejects password longer than 5 chars', () => {
    const req = {
      body: {
        voter_id: 'VOT-1001',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        password: 'toolongpassword'
      }
    };
    const res = mockRes();
    let nextCalled = false;
    validateVoterRegistration(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.message.includes('Password must be between 1 and 5 characters'), true);
  });

  // 2. validateOTPRequest
  test('validateOTPRequest passes with valid voter_id', () => {
    const req = { body: { voter_id: 'VOT-1001' } };
    const res = mockRes();
    let nextCalled = false;
    validateOTPRequest(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
  });

  test('validateOTPRequest rejects empty voter_id', () => {
    const req = { body: { voter_id: '   ' } };
    const res = mockRes();
    let nextCalled = false;
    validateOTPRequest(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
  });

  // 3. validateOTPVerify
  test('validateOTPVerify passes with 6-digit numeric code', () => {
    const req = { body: { voter_id: 'VOT-1001', otp_code: '123456' } };
    const res = mockRes();
    let nextCalled = false;
    validateOTPVerify(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
  });

  test('validateOTPVerify rejects non-6-digit code', () => {
    const req = { body: { voter_id: 'VOT-1001', otp_code: '12345' } };
    const res = mockRes();
    let nextCalled = false;
    validateOTPVerify(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.message.includes('must be exactly 6 digits'), true);
  });

  test('validateOTPVerify rejects non-numeric code', () => {
    const req = { body: { voter_id: 'VOT-1001', otp_code: 'abcdef' } };
    const res = mockRes();
    let nextCalled = false;
    validateOTPVerify(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
  });

  // 4. validateVoteCast
  test('validateVoteCast passes with election_id, voter_id, and candidate_id', () => {
    const req = {
      body: {
        election_id: '101',
        voter_id: 'VOT-1001',
        candidate_id: 'cand_1'
      }
    };
    const res = mockRes();
    let nextCalled = false;
    validateVoteCast(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
  });

  test('validateVoteCast rejects missing candidate_id', () => {
    const req = {
      body: {
        election_id: '101',
        voter_id: 'VOT-1001'
      }
    };
    const res = mockRes();
    let nextCalled = false;
    validateVoteCast(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.message.includes('Candidate selection is required'), true);
  });

  console.log(`Validation Unit Tests Completed: ${passed} passed, ${failed} failed.`);
  return { passed, failed };
}

module.exports = { runValidationUnitTests };

if (require.main === module) {
  const { failed } = runValidationUnitTests();
  process.exit(failed > 0 ? 1 : 0);
}
