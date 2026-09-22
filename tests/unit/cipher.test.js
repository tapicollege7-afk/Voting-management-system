const assert = require('assert');
const { caesarCipherEncrypt, caesarCipherDecrypt, sha256Hash } = require('../../backend-server/helpers/cipher');

function runCipherUnitTests() {
  console.log('\n--- Running Cipher & Hash Unit Tests ---');
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

  // 1. Empty & Null Inputs
  test('caesarCipherEncrypt returns empty string for null or empty input', () => {
    assert.strictEqual(caesarCipherEncrypt(''), '');
    assert.strictEqual(caesarCipherEncrypt(null), '');
    assert.strictEqual(caesarCipherEncrypt(undefined), '');
  });

  test('caesarCipherDecrypt returns empty string for null or empty input', () => {
    assert.strictEqual(caesarCipherDecrypt(''), '');
    assert.strictEqual(caesarCipherDecrypt(null), '');
    assert.strictEqual(caesarCipherDecrypt(undefined), '');
  });

  // 2. Alphabetic Shift
  test('caesarCipherEncrypt correctly shifts lowercase letters', () => {
    assert.strictEqual(caesarCipherEncrypt('abc', 3), 'def');
    assert.strictEqual(caesarCipherEncrypt('xyz', 3), 'abc');
  });

  test('caesarCipherEncrypt correctly shifts uppercase letters', () => {
    assert.strictEqual(caesarCipherEncrypt('ABC', 3), 'DEF');
    assert.strictEqual(caesarCipherEncrypt('XYZ', 3), 'ABC');
  });

  // 3. Numeric Digits
  test('caesarCipherEncrypt correctly shifts numeric digits', () => {
    assert.strictEqual(caesarCipherEncrypt('123', 3), '456');
    assert.strictEqual(caesarCipherEncrypt('789', 3), '012');
  });

  // 4. Special Characters Preservation
  test('caesarCipherEncrypt preserves punctuation and symbols', () => {
    const raw = 'VOT-2026-9999@univ.edu!';
    const encrypted = caesarCipherEncrypt(raw, 3);
    assert.strictEqual(encrypted.includes('-'), true);
    assert.strictEqual(encrypted.includes('@'), true);
    assert.strictEqual(encrypted.includes('.'), true);
    assert.strictEqual(encrypted.includes('!'), true);
  });

  // 5. Symmetric Round-Trip (Decryption of Encryption restores exact plain text)
  test('caesarCipherDecrypt reverses encryption with 100% fidelity', () => {
    const samples = [
      'VOTER-2026-7842',
      'user.test+99@domain.org',
      'ADM-9999_SuperAdmin!',
      'QuickBrownFox1234567890'
    ];
    for (const sample of samples) {
      const encrypted = caesarCipherEncrypt(sample, 3);
      const decrypted = caesarCipherDecrypt(encrypted, 3);
      assert.strictEqual(decrypted, sample, `Failed roundtrip for ${sample}`);
    }
  });

  // 6. SHA-256 Hashing Tests
  test('sha256Hash produces a 64-character hex string', () => {
    const hash = sha256Hash('votepulse_ballot_test');
    assert.strictEqual(typeof hash, 'string');
    assert.strictEqual(hash.length, 64);
    assert.strictEqual(/^[0-9a-f]{64}$/.test(hash), true);
  });

  test('sha256Hash is deterministic for string and object inputs', () => {
    const h1 = sha256Hash('admin123');
    const h2 = sha256Hash('admin123');
    assert.strictEqual(h1, h2);

    const objA = { election: '101', candidate: 'cand_1' };
    const objB = { election: '101', candidate: 'cand_1' };
    assert.strictEqual(sha256Hash(objA), sha256Hash(objB));
  });

  test('sha256Hash returns empty string for empty input', () => {
    assert.strictEqual(sha256Hash(''), '');
    assert.strictEqual(sha256Hash(null), '');
  });

  console.log(`Cipher Unit Tests Completed: ${passed} passed, ${failed} failed.`);
  return { passed, failed };
}

module.exports = { runCipherUnitTests };

if (require.main === module) {
  const { failed } = runCipherUnitTests();
  process.exit(failed > 0 ? 1 : 0);
}
