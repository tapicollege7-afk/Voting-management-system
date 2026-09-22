const { runCipherUnitTests } = require('./unit/cipher.test');
const { runValidationUnitTests } = require('./unit/validation.test');
const { runDbUnitTests } = require('./unit/db.test');

async function runAllUnitTests() {
  console.log('====================================================');
  console.log('         TIER 1: UNIT TEST SUITE EXECUTION         ');
  console.log('====================================================');

  const cipherRes = runCipherUnitTests();
  const validationRes = runValidationUnitTests();
  const dbRes = await runDbUnitTests();

  const totalPassed = cipherRes.passed + validationRes.passed + dbRes.passed;
  const totalFailed = cipherRes.failed + validationRes.failed + dbRes.failed;

  console.log('\n----------------------------------------------------');
  console.log(`TIER 1 SUMMARY: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log('----------------------------------------------------');

  return { totalPassed, totalFailed };
}

module.exports = { runAllUnitTests };

if (require.main === module) {
  runAllUnitTests().then(({ totalFailed }) => {
    process.exit(totalFailed > 0 ? 1 : 0);
  });
}
