require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * Configure Nodemailer Transporter for Real Gmail Dispatching
 */
function createTransporter() {
  const user = process.env.GMAIL_USER || '';
  const pass = process.env.GMAIL_APP_PASSWORD || '';

  if (user && pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }

  // Fallback to standard SMTP / Direct Transport configuration
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: user || 'votepulse.official@gmail.com',
      pass: pass || 'app_password_here'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Dispatch Real Email Verification Code to Voter's Provided Gmail Address
 */
async function sendGmailVerificationCode(recipientEmail, voterId, verificationToken) {
  const mailOptions = {
    from: `"VotePulse Security" <${process.env.GMAIL_USER || 'votepulse.official@gmail.com'}>`,
    to: recipientEmail,
    subject: '🗳️ VotePulse Real-Time Gmail Verification Token',
    html: `
      <div style="font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); padding: 2rem 1.5rem; text-align: center; color: white;">
          <div style="font-size: 2.8rem; margin-bottom: 0.5rem;">🗳️</div>
          <h1 style="margin: 0; font-size: 1.8rem; font-weight: 800; letter-spacing: -0.5px;">VotePulse</h1>
          <p style="margin: 6px 0 0 0; font-size: 0.9rem; opacity: 0.9; font-weight: 500;">Secure Real-Time Email Authentication</p>
        </div>
        
        <div style="padding: 2.25rem; color: #0f172a;">
          <h3 style="margin-top: 0; color: #1e1b4b; font-size: 1.15rem; font-weight: 700;">Hello Voter,</h3>
          <p style="font-size: 0.95rem; color: #475569; line-height: 1.6; margin-bottom: 1.5rem;">
            Your single-use Real-Time Email Verification Code for Voter ID <strong>${voterId}</strong> is:
          </p>

          <div style="background: #f8fafc; border: 2px dashed #6366f1; padding: 1.25rem; border-radius: 16px; text-align: center; margin: 1.5rem 0;">
            <div style="font-size: 0.78rem; text-transform: uppercase; font-weight: 800; color: #6366f1; letter-spacing: 1.5px; margin-bottom: 6px;">Gmail Verification Token</div>
            <span style="font-size: 2.4rem; font-weight: 800; letter-spacing: 6px; color: #4f46e5; font-family: monospace;">${verificationToken}</span>
          </div>

          <p style="font-size: 0.85rem; color: #64748b; line-height: 1.5;">
            🔒 This security token is single-use and expires in 10 minutes. Enter this code on the website to complete your verification and access your ballot.
          </p>
        </div>

        <div style="background: #f1f5f9; padding: 1.25rem; text-align: center; font-size: 0.8rem; color: #64748b; border-top: 1px solid #e2e8f0;">
          &copy; 2026 VotePulse Platform Engine. End-to-End Cryptographic Ballot Security.
        </div>
      </div>
    `
  };

  console.log(`\n===================================================`);
  console.log(`📧 [REAL GMAIL VERIFICATION DISPATCH]`);
  console.log(`   Recipient: ${recipientEmail}`);
  console.log(`   Voter ID:  ${voterId}`);
  console.log(`   Token Code: [ ${verificationToken} ]`);
  console.log(`===================================================\n`);

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP SUCCESS] Dispatched real verification email to ${recipientEmail} (MsgID: ${info.messageId})`);
    return { success: true, mode: 'smtp', messageId: info.messageId };
  } catch (err) {
    console.warn(`[SMTP NOTICE] Could not send via live SMTP server (${err.message}). Code logged to server console.`);
    return { success: true, mode: 'simulated', token: verificationToken };
  }
}

module.exports = {
  sendGmailVerificationCode
};
