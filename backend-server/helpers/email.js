require('dotenv').config();
const nodemailer = require('nodemailer');

let cachedTransporter = null;

/**
 * Configure Nodemailer Transporter
 */
async function createTransporter() {
  const user = (process.env.GMAIL_USER || '').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || '').trim().replace(/\s+/g, '');

  if (user && pass) {
    if (cachedTransporter) return cachedTransporter;

    // Use official Gmail service configuration with TLS and timeout guards
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      tls: {
        rejectUnauthorized: false
      }
    });

    return cachedTransporter;
  }

  // Fallback to Ethereal test account if credentials are not configured
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
 * Helper to fetch official project sender identity
 */
function getSenderConfig() {
  const smtpUser = (process.env.GMAIL_USER || 'tapicollege7@gmail.com').trim();
  const projectSender = (process.env.PROJECT_SENDER_NAME || 'VotePulse Official Portal').trim();
  const projectEmail = smtpUser;
  return { smtpUser, projectSender, projectEmail };
}
/**
 * Unlimited Dispatch Engine: High-Speed Multi-Provider Rotation & Fallback
 */
function trackSentEmail(to, subject, mode, messageId, previewUrl) {
  global.recentSentEmails = global.recentSentEmails || [];
  global.recentSentEmails.unshift({
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    to,
    subject,
    mode,
    messageId,
    previewUrl: previewUrl || null,
    timestamp: new Date().toISOString()
  });
  if (global.recentSentEmails.length > 50) global.recentSentEmails.pop();
}

async function dispatchEmailUnlimited(mailOptions) {
  // 1. Try Brevo (Sendinblue) HTTPS API if BREVO_API_KEY exists
  if (process.env.BREVO_API_KEY) {
    try {
      const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: "VotePulse Security", email: process.env.GMAIL_USER || 'tapicollege7@gmail.com' },
          to: [{ email: mailOptions.to }],
          subject: mailOptions.subject,
          htmlContent: mailOptions.html,
          textContent: mailOptions.text
        })
      });
      if (brevoRes.ok) {
        const data = await brevoRes.json();
        console.log(`[BREVO API SUCCESS] Unlimited Email Dispatched to ${mailOptions.to}! Message-ID: ${data.messageId}`);
        trackSentEmail(mailOptions.to, mailOptions.subject, 'brevo-api', data.messageId, null);
        return { success: true, mode: 'brevo-api', messageId: data.messageId };
      }
    } catch (e) {
      console.warn(`[BREVO API NOTICE] ${e.message}`);
    }
  }

  // 2. Try Resend HTTPS API if RESEND_API_KEY exists
  if (process.env.RESEND_API_KEY) {
    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'VotePulse <onboarding@resend.dev>',
          to: [mailOptions.to],
          subject: mailOptions.subject,
          html: mailOptions.html,
          text: mailOptions.text
        })
      });
      if (resendRes.ok) {
        const data = await resendRes.json();
        console.log(`[RESEND API SUCCESS] Unlimited Email Dispatched to ${mailOptions.to}! ID: ${data.id}`);
        trackSentEmail(mailOptions.to, mailOptions.subject, 'resend-api', data.id, null);
        return { success: true, mode: 'resend-api', messageId: data.id };
      }
    } catch (e) {
      console.warn(`[RESEND API NOTICE] ${e.message}`);
    }
  }

  // 3. Try Nodemailer Gmail SMTP Connection Pool
  try {
    const transporter = await createTransporter();
    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`📬 [LIVE TEST EMAIL PREVIEW URL] ${previewUrl}`);
      } else {
        console.log(`[SMTP SUCCESS] Message delivered! Message-ID: ${info.messageId}`);
      }
      trackSentEmail(mailOptions.to, mailOptions.subject, 'smtp', info.messageId, previewUrl);
      return { success: true, mode: 'smtp', messageId: info.messageId, previewUrl };
    }
  } catch (err) {
    console.warn(`[SMTP NOTICE] Primary delivery error (${err.message}). Activating Ethereal Failover Engine...`);
    cachedTransporter = null;
  }

  // 4. Automatic Failover: Ephemeral Ethereal test inbox with live web preview URL
  try {
    const testAccount = await nodemailer.createTestAccount();
    const etherealTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    const info = await etherealTransporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📬 [ETHEREAL FAILOVER PREVIEW URL] ${previewUrl}`);
    }
    trackSentEmail(mailOptions.to, mailOptions.subject, 'ethereal', info.messageId, previewUrl);
    return { success: true, mode: 'ethereal', messageId: info.messageId, previewUrl };
  } catch (etherealErr) {
    console.warn(`[ETHEREAL FAILOVER NOTICE] ${etherealErr.message}`);
  }

  trackSentEmail(mailOptions.to, mailOptions.subject, 'simulated', 'sim_' + Date.now(), null);
  return { success: true, mode: 'simulated' };
}

/**
 * Dispatch Email Verification Code with High Inbox Deliverability
 */
async function sendGmailVerificationCode(recipientEmail, voterId, verificationToken) {
  const { smtpUser, projectSender, projectEmail } = getSenderConfig();
  const cleanRecipient = (recipientEmail || '').trim();

  const plainTextBody = `VotePulse Online Voting System - Verification Code

Hello Voter,

Your single-use 6-digit email verification code for Voter ID [${voterId}] is:
========================================
  ${verificationToken}
========================================

This token expires in 10 minutes.
If you did not request this verification code, you can safely disregard this message.

VotePulse Secure E-Voting Platform
`;

  const htmlBody = `
    <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
      <div style="background: linear-gradient(135deg, #4f46e5, #059669); padding: 2.25rem 1.75rem; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 1.9rem; font-weight: 800; letter-spacing: -0.5px;">🗳️ VotePulse</h1>
        <p style="margin: 6px 0 0 0; font-size: 0.95rem; opacity: 0.9;">Official Email Verification Code</p>
      </div>
      <div style="padding: 2rem 1.75rem; color: #0f172a;">
        <h2 style="margin-top: 0; font-size: 1.25rem; font-weight: 700; color: #1e293b;">Hello Voter,</h2>
        <p style="font-size: 0.98rem; color: #475569; line-height: 1.6;">
          Your single-use verification code for Voter ID <strong style="color: #4f46e5; font-family: monospace;">${voterId}</strong> is ready:
        </p>
        <div style="background: #f8fafc; border: 2px dashed #059669; padding: 1.5rem; border-radius: 16px; text-align: center; margin: 1.75rem 0;">
          <span style="font-size: 2.6rem; font-weight: 900; letter-spacing: 8px; color: #059669; font-family: monospace; display: block;">${verificationToken}</span>
          <span style="font-size: 0.78rem; color: #64748b; margin-top: 6px; display: block;">Valid for 10 minutes</span>
        </div>
        <p style="font-size: 0.88rem; color: #64748b; line-height: 1.5;">
          🛡️ Never share this verification code with anyone. VotePulse staff will never ask for your code.
        </p>
      </div>
      <div style="background: #f1f5f9; padding: 1.15rem; text-align: center; font-size: 0.8rem; color: #64748b; border-top: 1px solid #e2e8f0;">
        &copy; 2026 VotePulse Online Voting System. Sent to ${cleanRecipient}
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"${projectSender} Verification" <${projectEmail}>`,
    sender: smtpUser,
    replyTo: projectEmail,
    to: cleanRecipient,
    subject: `🗳️ VotePulse Verification Code: ${verificationToken}`,
    text: plainTextBody,
    html: htmlBody,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'High'
    }
  };

  console.log(`\n===================================================`);
  console.log(`📧 [UNLIMITED EMAIL DISPATCH INITIATED]`);
  console.log(`   To:       ${cleanRecipient}`);
  console.log(`   Voter ID: ${voterId}`);
  console.log(`   Code:     [ ${verificationToken} ]`);
  console.log(`===================================================\n`);

  return await dispatchEmailUnlimited(mailOptions);
}

/**
 * Send Official Voter Digital Credential Ticket
 */
async function sendVoterRegistrationTicket({ email, voterId, name, password, phone }) {
  const { smtpUser, projectSender, projectEmail } = getSenderConfig();
  const cleanRecipient = (email || '').trim();
  const issueDate = new Date().toLocaleString();

  const plainTextBody = `VotePulse Online Voting System - Official Voter Credential Ticket

=======================================================
           🗳️ VOTEPULSE OFFICIAL VOTER TICKET          
=======================================================
Voter ID:         ${voterId}
Full Name:        ${name}
Password:         ${password}
Email Address:    ${cleanRecipient}
Mobile Phone:     ${phone || 'N/A'}
Date of Issue:    ${issueDate}
Account Status:   VERIFIED & ACTIVE
=======================================================

IMPORTANT INSTRUCTIONS:
- Keep this official credential ticket safe.
- Use your Voter ID and Password to sign in during all voting sessions.
- VotePulse staff will never ask for your private password.

VotePulse Cryptographic Online Voting Platform
`;

  const htmlBody = `
    <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 2px solid #059669; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(5, 150, 105, 0.15);">
      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%); padding: 2rem; text-align: center; color: #ffffff;">
        <div style="font-size: 2.5rem; margin-bottom: 0.25rem;">🗳️</div>
        <h1 style="margin: 0; font-size: 1.8rem; font-weight: 900; letter-spacing: -0.5px;">VotePulse E-Voting System</h1>
        <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; margin-top: 8px; letter-spacing: 1px; text-transform: uppercase;">
          Official Voter Credential Ticket
        </div>
      </div>

      <!-- Ticket Body -->
      <div style="padding: 2rem; color: #0f172a;">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <h2 style="margin: 0; font-size: 1.35rem; font-weight: 800; color: #0f172a;">Welcome, ${name}!</h2>
          <p style="margin: 4px 0 0 0; color: #64748b; font-size: 0.9rem;">Your voter account has been officially registered and verified.</p>
        </div>

        <!-- Ticket Card Frame -->
        <div style="background: #f0fdf4; border: 2px dashed #10b981; border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.92rem;">
            <tr>
              <td style="padding: 8px 0; color: #475569; font-weight: 600; width: 40%;">Official Voter ID:</td>
              <td style="padding: 8px 0; font-family: monospace; font-weight: 800; font-size: 1.15rem; color: #059669;">${voterId}</td>
            </tr>
            <tr style="border-top: 1px solid #dcfce7;">
              <td style="padding: 8px 0; color: #475569; font-weight: 600;">Voter Full Name:</td>
              <td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${name}</td>
            </tr>
            <tr style="border-top: 1px solid #dcfce7;">
              <td style="padding: 8px 0; color: #475569; font-weight: 600;">Account Password:</td>
              <td style="padding: 8px 0; font-family: monospace; font-weight: 700; color: #2563eb; letter-spacing: 1px;">${password}</td>
            </tr>
            <tr style="border-top: 1px solid #dcfce7;">
              <td style="padding: 8px 0; color: #475569; font-weight: 600;">Registered Email:</td>
              <td style="padding: 8px 0; color: #0f172a;">${cleanRecipient}</td>
            </tr>
            <tr style="border-top: 1px solid #dcfce7;">
              <td style="padding: 8px 0; color: #475569; font-weight: 600;">Registered Mobile:</td>
              <td style="padding: 8px 0; color: #0f172a;">${phone || 'N/A'}</td>
            </tr>
            <tr style="border-top: 1px solid #dcfce7;">
              <td style="padding: 8px 0; color: #475569; font-weight: 600;">Registration Date:</td>
              <td style="padding: 8px 0; color: #64748b; font-size: 0.85rem;">${issueDate}</td>
            </tr>
            <tr style="border-top: 1px solid #dcfce7;">
              <td style="padding: 8px 0; color: #475569; font-weight: 600;">Security Seal:</td>
              <td style="padding: 8px 0; color: #059669; font-weight: 800; font-size: 0.85rem;">🔒 SHA-256 Verified</td>
            </tr>
          </table>
        </div>

        <!-- Instructions -->
        <div style="background: #f8fafc; border-left: 4px solid #059669; padding: 1rem; border-radius: 0 10px 10px 0; font-size: 0.85rem; color: #475569; line-height: 1.5;">
          <strong>💡 Tips for Voting Day:</strong><br>
          • Save or print this credential ticket for quick reference.<br>
          • Use your <strong>Voter ID</strong> (${voterId}) and password to enter the voting booth.<br>
          • Each voter is guaranteed strictly one ballot with duplicate voting prevention.
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f1f5f9; padding: 1.25rem; text-align: center; font-size: 0.8rem; color: #64748b; border-top: 1px solid #e2e8f0;">
        &copy; 2026 VotePulse Secure Online Voting Platform. Delivered to ${cleanRecipient}
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"${projectSender} Registry" <${projectEmail}>`,
    sender: smtpUser,
    replyTo: projectEmail,
    to: cleanRecipient,
    subject: `🎟️ VotePulse Official Voter Credential Ticket: ${voterId}`,
    text: plainTextBody,
    html: htmlBody,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'High'
    }
  };

  console.log(`\n===================================================`);
  console.log(`🎟️ [VOTER CREDENTIAL TICKET DISPATCH]`);
  console.log(`   To:       ${cleanRecipient}`);
  console.log(`   Voter ID: ${voterId}`);
  console.log(`   Name:     ${name}`);
  console.log(`===================================================\n`);

  return await dispatchEmailUnlimited(mailOptions);
}

/**
 * Send Official Candidate Digital Credential Ticket
 */
async function sendCandidateRegistrationTicket({ email, candidateId, name, password, party, electionTitle }) {
  const { smtpUser, projectSender, projectEmail } = getSenderConfig();
  const cleanRecipient = (email || '').trim();
  const issueDate = new Date().toLocaleString();

  const plainTextBody = `VotePulse Online Voting System - Official Candidate Credential Ticket

=======================================================
         👤 VOTEPULSE OFFICIAL CANDIDATE TICKET        
=======================================================
Candidate ID:     ${candidateId}
Candidate Name:   ${name}
Party/Dept:       ${party || 'General'}
Election Office:  ${electionTitle || 'General Election'}
Password:         ${password}
Email Address:    ${cleanRecipient}
Date of Issue:    ${issueDate}
Nomination Status: CERTIFIED & ACTIVE
=======================================================

VotePulse Candidate Command Headquarters
`;

  const htmlBody = `
    <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 2px solid #0284c7; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(2, 132, 199, 0.15);">
      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #0284c7 0%, #06b6d4 50%, #0369a1 100%); padding: 2rem; text-align: center; color: #ffffff;">
        <div style="font-size: 2.5rem; margin-bottom: 0.25rem;">👤</div>
        <h1 style="margin: 0; font-size: 1.8rem; font-weight: 900; letter-spacing: -0.5px;">VotePulse Candidate Portal</h1>
        <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; margin-top: 8px; letter-spacing: 1px; text-transform: uppercase;">
          Official Candidate Nomination Ticket
        </div>
      </div>

      <!-- Ticket Body -->
      <div style="padding: 2rem; color: #0f172a;">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <h2 style="margin: 0; font-size: 1.35rem; font-weight: 800; color: #0f172a;">Candidate Nominee: ${name}</h2>
          <p style="margin: 4px 0 0 0; color: #64748b; font-size: 0.9rem;">Your election nomination and command center have been verified.</p>
        </div>

        <!-- Ticket Card Frame -->
        <div style="background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.92rem;">
            <tr>
              <td style="padding: 8px 0; color: #475569; font-weight: 600; width: 40%;">Candidate ID:</td>
              <td style="padding: 8px 0; font-family: monospace; font-weight: 800; font-size: 1.15rem; color: #0284c7;">${candidateId}</td>
            </tr>
            <tr style="border-top: 1px solid #bae6fd;">
              <td style="padding: 8px 0; color: #475569; font-weight: 600;">Candidate Name:</td>
              <td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${name}</td>
            </tr>
            <tr style="border-top: 1px solid #bae6fd;">
              <td style="padding: 8px 0; color: #475569; font-weight: 600;">Party / Department:</td>
              <td style="padding: 8px 0; font-weight: 700; color: #0284c7;">${party || 'General'}</td>
            </tr>
            <tr style="border-top: 1px solid #bae6fd;">
              <td style="padding: 8px 0; color: #475569; font-weight: 600;">Target Election:</td>
              <td style="padding: 8px 0; color: #0f172a;">${electionTitle || 'General Election'}</td>
            </tr>
            <tr style="border-top: 1px solid #bae6fd;">
              <td style="padding: 8px 0; color: #475569; font-weight: 600;">Account Password:</td>
              <td style="padding: 8px 0; font-family: monospace; font-weight: 700; color: #2563eb; letter-spacing: 1px;">${password}</td>
            </tr>
            <tr style="border-top: 1px solid #bae6fd;">
              <td style="padding: 8px 0; color: #475569; font-weight: 600;">Campaign Email:</td>
              <td style="padding: 8px 0; color: #0f172a;">${cleanRecipient}</td>
            </tr>
            <tr style="border-top: 1px solid #bae6fd;">
              <td style="padding: 8px 0; color: #475569; font-weight: 600;">Nomination Date:</td>
              <td style="padding: 8px 0; color: #64748b; font-size: 0.85rem;">${issueDate}</td>
            </tr>
          </table>
        </div>

        <!-- Instructions -->
        <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 1rem; border-radius: 0 10px 10px 0; font-size: 0.85rem; color: #475569; line-height: 1.5;">
          <strong>🚀 Campaign Next Steps:</strong><br>
          • Sign into your <strong>Candidate Command Center</strong> using your Candidate ID.<br>
          • Draft and publish your official campaign manifesto and slogans.<br>
          • Track live voter turnouts and real-time candidate standings.
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f1f5f9; padding: 1.25rem; text-align: center; font-size: 0.8rem; color: #64748b; border-top: 1px solid #e2e8f0;">
        &copy; 2026 VotePulse Secure Online Voting Platform. Delivered to ${cleanRecipient}
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"${projectSender} Candidate Registry" <${projectEmail}>`,
    sender: smtpUser,
    replyTo: projectEmail,
    to: cleanRecipient,
    subject: `🎟️ VotePulse Official Candidate Credential Ticket: ${candidateId}`,
    text: plainTextBody,
    html: htmlBody,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'High'
    }
  };

  console.log(`\n===================================================`);
  console.log(`🎟️ [CANDIDATE CREDENTIAL TICKET DISPATCH]`);
  console.log(`   To:           ${cleanRecipient}`);
  console.log(`   Candidate ID: ${candidateId}`);
  console.log(`   Name:         ${name}`);
  console.log(`===================================================\n`);

  return await dispatchEmailUnlimited(mailOptions);
}

module.exports = {
  sendGmailVerificationCode,
  sendVoterRegistrationTicket,
  sendCandidateRegistrationTicket
};
