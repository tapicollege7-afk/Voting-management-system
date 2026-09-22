const assert = require('assert');
const db = require('../../database');

async function runDbUnitTests() {
  console.log('\n--- Running Database Layer Unit Tests ---');
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

  // 1. Password Verification
  await test('verifyUserPassword correctly checks hashed passwords', () => {
    const { sha256Hash } = require('../../backend-server/helpers/cipher');
    const user = { password_hash: sha256Hash('admin123') };
    assert.strictEqual(db.verifyUserPassword(user, 'admin123'), true);
    assert.strictEqual(db.verifyUserPassword(user, 'wrongpass'), false);
  });

  // 2. Admin User Exists
  await test('findUserByVoterId finds System Administrator by ID case-insensitively', async () => {
    const admin = await db.findUserByVoterId('adm-9999');
    assert.ok(admin, 'Admin user ADM-9999 must exist');
    assert.strictEqual(admin.voter_id.toUpperCase(), 'ADM-9999');
    assert.strictEqual(admin.role, 'admin');
  });

  await test('findUserByVoterId finds Admin by email', async () => {
    const admin = await db.findUserByVoterId('admin@votepulse.org');
    assert.ok(admin, 'Admin must be findable by email');
    assert.strictEqual(admin.voter_id.toUpperCase(), 'ADM-9999');
  });

  // 3. Elections and Candidates
  await test('getElections returns elections array', async () => {
    const elections = await db.getElections();
    assert.ok(Array.isArray(elections), 'Elections must be an array');
  });

  await test('getCandidates returns candidates array', async () => {
    const candidates = await db.getCandidates('101');
    assert.ok(Array.isArray(candidates), 'Candidates must be an array');
  });

  // 4. Database Metadata
  await test('getDatabaseMetadata returns active engine and connection status', async () => {
    const meta = await db.getDatabaseMetadata();
    assert.ok(meta, 'Metadata must be returned');
    assert.ok(meta.engine, 'Must report engine type');
    assert.ok(typeof meta.connected === 'boolean', 'Must report boolean connected flag');
  });

  console.log(`Database Layer Unit Tests Completed: ${passed} passed, ${failed} failed.`);
  return { passed, failed };
}

module.exports = { runDbUnitTests };

if (require.main === module) {
  runDbUnitTests().then(({ failed }) => {
    process.exit(failed > 0 ? 1 : 0);
  });
}
