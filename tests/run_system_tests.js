const { runSystemApiTests } = require('./system/system_api.test');

async function runAllSystemTests() {
  console.log('====================================================');
  console.log('        TIER 3: SYSTEM TEST SUITE EXECUTION         ');
  console.log('====================================================');

  const sysRes = await runSystemApiTests();

  console.log('\n----------------------------------------------------');
  console.log(`TIER 3 SUMMARY: ${sysRes.passed} PASSED, ${sysRes.failed} FAILED`);
  console.log('----------------------------------------------------');

  return { totalPassed: sysRes.passed, totalFailed: sysRes.failed };
}

module.exports = { runAllSystemTests };

if (require.main === module) {
  runAllSystemTests().then(({ totalFailed }) => {
    process.exit(totalFailed > 0 ? 1 : 0);
  });
}
