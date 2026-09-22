const { runAuthIntegrationTests } = require('./integration/auth_flow.test');
const { runElectionCandidateIntegrationTests } = require('./integration/election_candidate.test');
const { runVotingEngineIntegrationTests } = require('./integration/voting_engine.test');
const { runAdminIntegrationTests } = require('./integration/admin_api.test');

async function runAllIntegrationTests() {
  console.log('====================================================');
  console.log('      TIER 2: INTEGRATION TEST SUITE EXECUTION      ');
  console.log('====================================================');

  const authRes = await runAuthIntegrationTests();
  const elecRes = await runElectionCandidateIntegrationTests();

  const sharedContext = {
    testVoterId: authRes.testVoterId,
    createdElectionId: elecRes.createdElectionId,
    createdCandidateId: elecRes.createdCandidateId
  };

  const voteRes = await runVotingEngineIntegrationTests(sharedContext);
  const adminRes = await runAdminIntegrationTests(sharedContext);

  const totalPassed = authRes.passed + elecRes.passed + voteRes.passed + adminRes.passed;
  const totalFailed = authRes.failed + elecRes.failed + voteRes.failed + adminRes.failed;

  console.log('\n----------------------------------------------------');
  console.log(`TIER 2 SUMMARY: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log('----------------------------------------------------');

  return { totalPassed, totalFailed };
}

module.exports = { runAllIntegrationTests };

if (require.main === module) {
  runAllIntegrationTests().then(({ totalFailed }) => {
    process.exit(totalFailed > 0 ? 1 : 0);
  });
}
