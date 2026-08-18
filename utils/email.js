const nodemailer = require('nodemailer');

// Configure Nodemailer Transporter for Real Gmail Dispatching
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || '',
    pass: process.env.GMAIL_APP_PASSWORD || ''
  }
});

/**
 * Dispatch Real Email Verification Code to Voter's Provided Gmail Address
 */
async function sendGmailVerificationCode(recipientEmail, voterId, verificationToken) {
  const mailOptions = {
    from: '"VotePulse Security Engine" <no-reply@votepulse.org>',
    to: recipientEmail,
    subject: '🗳️ VotePulse Real-Time Gmail Verification Token',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
        <div style="background: #2563eb; padding: 1.5rem; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 1.6rem; font-weight: 800;">🗳️ VotePulse</h1>
          <p style="margin: 4px 0 0 0; font-size: 0.88rem; opacity: 0.9;">Secure Real-Time Gmail Verification</p>
        </div>
        <div style="padding: 2rem; color: #0f172a;">
          <p style="font-size: 1rem; font-weight: 600; margin-top: 0;">Hello Voter,</p>
          <p style="font-size: 0.92rem; color: #475569; line-height: 1.5;">
            Your single-use Real-Time Email Verification Code for Voter ID <strong>${voterId}</strong> is:
          </p>
          <div style="background: #f8fafc; border: 2px dashed #059669; padding: 1rem; border-radius: 12px; text-align: center; margin: 1.5rem 0;">
            <span style="font-size: 2rem; font-weight: 800; letter-spacing: 4px; color: #059669;">${verificationToken}</span>
          </div>
          <p style="font-size: 0.85rem; color: #64748b; line-height: 1.4;">
            This token is valid for 10 minutes. If you did not request this verification, please ignore this email.
          </p>
        </div>
        <div style="background: #f1f5f9; padding: 1rem; text-align: center; font-size: 0.78rem; color: #64748b; border-top: 1px solid #e2e8f0;">
          &copy; 2026 VotePulse Platform Engine. End-to-End Cryptographic Ballot Security.
        </div>
      </div>
    `
  };

  console.log(`\n===================================================`);
  console.log(`📧 [REAL GMAIL VERIFICATION DISPATCH]`);
  console.log(`   To: ${recipientEmail}`);
  console.log(`   Voter ID: ${voterId}`);
  console.log(`   Security Verification Code: [ ${verificationToken} ]`);
  console.log(`===================================================\n`);

  try {
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      await transporter.sendMail(mailOptions);
      console.log(`[SMTP] Sent email successfully to ${recipientEmail}`);
      return { success: true, mode: 'smtp' };
    } else {
      return { success: true, mode: 'simulated', token: verificationToken };
    }
  } catch (err) {
    console.warn(`[SMTP NOTICE] ${err.message}`);
    return { success: true, mode: 'simulated', token: verificationToken };
  }
}

module.exports = {
  sendGmailVerificationCode
};
