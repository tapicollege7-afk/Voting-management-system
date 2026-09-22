const { runAllUnitTests } = require('./run_unit_tests');
const { runAllIntegrationTests } = require('./run_integration_tests');
const { runAllSystemTests } = require('./run_system_tests');

async function runMasterTestSuite() {
  console.log('\n================================================================');
  console.log('       VOTEPULSE COMPLETE 3-TIER QUALITY ASSURANCE SUITE        ');
  console.log('================================================================\n');

  const startTime = Date.now();

  // Tier 1: Unit Tests
  const tier1 = await runAllUnitTests();
  if (tier1.totalFailed > 0) {
    console.error(`\n❌ Tier 1 Unit Tests Failed (${tier1.totalFailed} failure(s)). Aborting pipeline.`);
    return { success: false, tier: 1, ...tier1 };
  }

  // Tier 2: Integration Tests
  const tier2 = await runAllIntegrationTests();
  if (tier2.totalFailed > 0) {
    console.error(`\n❌ Tier 2 Integration Tests Failed (${tier2.totalFailed} failure(s)). Aborting pipeline.`);
    return { success: false, tier: 2, ...tier2 };
  }

  // Tier 3: System Tests
  const tier3 = await runAllSystemTests();
  if (tier3.totalFailed > 0) {
    console.error(`\n❌ Tier 3 System Tests Failed (${tier3.totalFailed} failure(s)). Aborting pipeline.`);
    return { success: false, tier: 3, ...tier3 };
  }

  const durationMs = Date.now() - startTime;
  const grandTotalPassed = tier1.totalPassed + tier2.totalPassed + tier3.totalPassed;
  const grandTotalFailed = tier1.totalFailed + tier2.totalFailed + tier3.totalFailed;

  console.log('\n================================================================');
  console.log('               🎉 ALL QUALITY GATES PASSED! 🎉                   ');
  console.log(`  Tier 1 Unit Tests:        ${tier1.totalPassed} passed, 0 failed`);
  console.log(`  Tier 2 Integration Tests: ${tier2.totalPassed} passed, 0 failed`);
  console.log(`  Tier 3 System Tests:      ${tier3.totalPassed} passed, 0 failed`);
  console.log('----------------------------------------------------------------');
  console.log(`  TOTAL TESTS EXECUTED:     ${grandTotalPassed}`);
  console.log(`  OVERALL STATUS:           100% GREEN (ALL PASSING)`);
  console.log(`  EXECUTION TIME:           ${(durationMs / 1000).toFixed(2)}s`);
  console.log(`  LIVE APPLICATION URL:     http://localhost:3000`);
  console.log('================================================================\n');

  return { success: true, grandTotalPassed, grandTotalFailed, durationMs };
}

module.exports = { runMasterTestSuite };

if (require.main === module) {
  runMasterTestSuite().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}
