require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * Configure Nodemailer Transporter
 */
async function createTransporter() {
  const user = (process.env.GMAIL_USER || '').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || '').trim().replace(/\s+/g, '');

  if (user && pass) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass }
    });
  }

  // If no credentials in .env, create Ethereal test account for real web preview URL
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch (err) {
    return null;
  }
}

/**
 * Dispatch Email Verification Code
 */
async function sendGmailVerificationCode(recipientEmail, voterId, verificationToken) {
  const mailOptions = {
    from: `"VotePulse Security Engine" <${process.env.GMAIL_USER || 'no-reply@votepulse.org'}>`,
    to: recipientEmail,
    subject: '🗳️ VotePulse Real-Time Gmail Verification Token',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4f46e5, #059669); padding: 2rem 1.5rem; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 1.8rem; font-weight: 800;">🗳️ VotePulse</h1>
          <p style="margin: 6px 0 0 0; font-size: 0.9rem;">Real-Time Email Verification Token</p>
        </div>
        <div style="padding: 2rem; color: #0f172a;">
          <h3 style="margin-top: 0;">Hello Voter,</h3>
          <p style="font-size: 0.95rem; color: #475569; line-height: 1.5;">
            Your single-use Real-Time Email Verification Code for Voter ID <strong>${voterId}</strong> is:
          </p>
          <div style="background: #f8fafc; border: 2px dashed #059669; padding: 1.25rem; border-radius: 14px; text-align: center; margin: 1.5rem 0;">
            <span style="font-size: 2.4rem; font-weight: 800; letter-spacing: 6px; color: #059669; font-family: monospace;">${verificationToken}</span>
          </div>
          <p style="font-size: 0.85rem; color: #64748b;">
            This token is valid for 10 minutes. If you did not request this code, please ignore this email.
          </p>
        </div>
        <div style="background: #f1f5f9; padding: 1rem; text-align: center; font-size: 0.78rem; color: #64748b;">
          &copy; 2026 VotePulse Security. End-to-End Cryptographic Ballot Security.
        </div>
      </div>
    `
  };

  console.log(`\n===================================================`);
  console.log(`📧 [EMAIL VERIFICATION DISPATCH]`);
  console.log(`   To:       ${recipientEmail}`);
  console.log(`   Voter ID: ${voterId}`);
  console.log(`   Code:     [ ${verificationToken} ]`);
  console.log(`===================================================\n`);

  try {
    const transporter = await createTransporter();
    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`📬 [LIVE TEST EMAIL PREVIEW URL] ${previewUrl}`);
      } else {
        console.log(`[SMTP SUCCESS] Email delivered to ${recipientEmail}`);
      }
      return { success: true, mode: 'smtp', previewUrl };
    }
  } catch (err) {
    console.warn(`[SMTP NOTICE] ${err.message}`);
  }

  return { success: true, mode: 'simulated', token: verificationToken };
}

module.exports = {
  sendGmailVerificationCode
};
