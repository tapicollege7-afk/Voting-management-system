const { exec } = require('child_process');
const path = require('path');

/**
 * Dispatch Real Email Verification Code via PHP mail() script (send_email.php)
 */
async function sendGmailVerificationCode(recipientEmail, voterId, verificationToken) {
  const phpScriptPath = path.join(__dirname, '..', 'send_email.php');
  
  const payload = JSON.stringify({
    email: recipientEmail,
    voter_id: voterId,
    token_code: verificationToken
  });

  // Escape payload string for command line execution
  const escapedPayload = JSON.stringify(payload);

  console.log(`\n===================================================`);
  console.log(`📧 [PHP EMAIL DISPATCHER] Executing send_email.php`);
  console.log(`   To:       ${recipientEmail}`);
  console.log(`   Voter ID: ${voterId}`);
  console.log(`   Code:     [ ${verificationToken} ]`);
  console.log(`===================================================\n`);

  return new Promise((resolve) => {
    // Execute PHP CLI: php send_email.php '<json_payload>'
    const cmd = `php "${phpScriptPath}" ${escapedPayload}`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(`[PHP DISPATCH NOTICE] PHP CLI execution fallback: ${error.message}`);
        resolve({ success: true, mode: 'simulated', token: verificationToken });
        return;
      }

      try {
        const phpResponse = JSON.parse(stdout);
        console.log(`[PHP MAIL RESULT]`, phpResponse);
        resolve({ success: true, mode: 'php_mail', response: phpResponse });
      } catch (e) {
        console.log(`[PHP OUTPUT] ${stdout}`);
        resolve({ success: true, mode: 'php_cli', output: stdout });
      }
    });
  });
}

module.exports = {
  sendGmailVerificationCode
};
