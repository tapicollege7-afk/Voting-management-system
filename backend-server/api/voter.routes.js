const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../../database');
const { sendGmailVerificationCode, sendVoterRegistrationTicket } = require('../helpers/email');
const { validateVoterRegistration, validateVoteCast } = require('../checks/validation');
const { caesarCipherDecrypt } = require('../helpers/cipher');

// Authentication: Register Voter
// Global in-memory pending registration store (Unverified users are NOT saved to DB until OTP is entered)
global.pendingRegistrations = global.pendingRegistrations || new Map();

// Authentication: Register Voter (Sends OTP, Deferred DB Save)
router.post('/auth/register', validateVoterRegistration, async (req, res) => {
  try {
    const { voter_id, name, email, phone, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    
    // Check if user is ALREADY saved in database or pending registration
    const existingUser = await db.findUserByVoterId(cleanEmail);
    const existingPending = global.pendingRegistrations && (
      global.pendingRegistrations.get(cleanEmail) ||
      Array.from(global.pendingRegistrations.values()).find(p => p.email === cleanEmail)
    );

    if ((existingUser && existingUser.email && existingUser.email.toLowerCase() === cleanEmail) || existingPending) {
      return res.status(400).json({ success: false, message: "This email address is already registered. Please log in or verify OTP." });
    }

    const finalVoterId = (voter_id || `VOT-2026-${Math.floor(1000 + Math.random() * 9000)}`).trim();
    const token_code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in temporary pending map - NOT saved to User DB table yet!
    const pendingPayload = {
      voter_id: finalVoterId,
      name: name.trim(),
      email: cleanEmail,
      phone: (phone || '').trim(),
      password,
      token_code,
      created_at: new Date().toISOString()
    };

    global.pendingRegistrations.set(finalVoterId.toLowerCase(), pendingPayload);
    global.pendingRegistrations.set(cleanEmail, pendingPayload);

    // Dispatch real verification email with OTP code via SMTP
    const emailResult = await sendGmailVerificationCode(cleanEmail, finalVoterId, token_code);

    return res.status(201).json({
      success: true,
      message: `Registration initiated! Verification code dispatched to ${cleanEmail}. Account will be created in database once OTP is verified.`,
      token_code,
      previewUrl: emailResult?.previewUrl,
      ticket: {
        voter_id: finalVoterId,
        name: name.trim(),
        email: cleanEmail,
        phone: (phone || '').trim(),
        created_at: pendingPayload.created_at
      },
      voter: {
        voter_id: finalVoterId,
        name: name.trim(),
        email: cleanEmail,
        phone: (phone || '').trim()
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Authentication: Login Voter & Request Real Verification Code
router.post('/auth/login', async (req, res) => {
  try {
    const { voter_id, password, target_email, email } = req.body;
    if (!voter_id || !password) {
      return res.status(400).json({ success: false, message: "Voter ID and password are required." });
    }

    const cleanInput = voter_id.trim();

    // Check if this is a pending registration waiting for OTP
    const pending = global.pendingRegistrations?.get(cleanInput.toLowerCase());
    if (pending && pending.password === password) {
      const emailResult = await sendGmailVerificationCode(pending.email, pending.voter_id, pending.token_code);
      return res.json({
        success: true,
        pending: true,
        message: `Pending registration found! Verification code dispatched to ${pending.email}.`,
        token_code: pending.token_code,
        previewUrl: emailResult?.previewUrl,
        user: {
          voter_id: pending.voter_id,
          name: pending.name,
          email: pending.email,
          phone: pending.phone,
          role: 'voter'
        }
      });
    }

    const user = await db.findUserByVoterId(cleanInput);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid Voter ID or credentials." });
    }

    if (!db.verifyUserPassword(user, password)) {
      return res.status(401).json({ success: false, message: "Incorrect password." });
    }

    // Direct access for Administrator accounts
    if (user.role === 'admin' || (user.voter_id || '').toUpperCase().startsWith('ADM')) {
      return res.json({
        success: true,
        is_admin: true,
        message: "Administrator credentials verified! Redirecting to Admin Console...",
        user: {
          id: user.voter_id || 'ADM-9999',
          voter_id: user.voter_id || 'ADM-9999',
          name: user.name || 'System Administrator',
          email: user.email || 'admin@votepulse.org',
          role: 'admin'
        }
      });
    }

    // Dispatch verification code directly to the voter's registered email
    const recipientEmail = (user.email || '').trim();
    if (!recipientEmail || !/\S+@\S+\.\S+/.test(recipientEmail)) {
      return res.status(400).json({ success: false, message: "A valid email address is required to receive the verification code." });
    }

    const gmailToken = await db.createGmailToken(user.voter_id, recipientEmail, 'login');

    // Send real verification email via SMTP directly to recipientEmail
    const emailResult = await sendGmailVerificationCode(recipientEmail, user.voter_id, gmailToken.token_code);

    return res.json({
      success: true,
      message: `Credentials verified. Verification code sent to ${recipientEmail}.`,
      token_code: gmailToken.token_code,
      previewUrl: emailResult?.previewUrl,
      user: {
        id: user.id,
        voter_id: user.voter_id,
        name: user.name,
        email: recipientEmail,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Verification Endpoint: Verify Gmail OTP & Save Registration to Database ONLY NOW
router.post('/auth/verify-gmail-token', async (req, res) => {
  try {
    const { voter_id, token_code } = req.body;
    if (!voter_id || !token_code) {
      return res.status(400).json({ success: false, message: "Voter ID and verification token code are required." });
    }

    const cleanInput = voter_id.trim().toLowerCase();
    const cleanCode = token_code.trim();

    // Check temporary pending registration map
    const pending = global.pendingRegistrations?.get(cleanInput);
    if (pending && pending.token_code === cleanCode) {
      // NOW save user permanently to database ONLY after successful OTP verification!
      const newUser = await db.createUser({
        voter_id: pending.voter_id,
        name: pending.name,
        email: pending.email,
        phone: pending.phone,
        password: pending.password
      });

      // Clear from pending map
      global.pendingRegistrations.delete(pending.voter_id.toLowerCase());
      global.pendingRegistrations.delete(pending.email.toLowerCase());

      // Dispatch official Voter Credential Ticket email
      await sendVoterRegistrationTicket({
        email: newUser.email,
        voterId: newUser.voter_id,
        name: newUser.name,
        password: pending.password,
        phone: newUser.phone
      });

      return res.json({
        success: true,
        message: "OTP verified successfully! Voter account created and saved to database.",
        user: {
          id: newUser.id,
          voter_id: newUser.voter_id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: 'voter'
        }
      });
    }

    // Fallback for existing user login tokens
    const verifyResult = await db.verifyGmailToken(voter_id, token_code);
    if (verifyResult && verifyResult !== false && (typeof verifyResult !== 'object' || verifyResult.valid !== false)) {
      const user = await db.findUserByVoterId(voter_id);
      return res.json({
        success: true,
        message: "Email verification successful!",
        user: user ? {
          id: user.id,
          voter_id: user.voter_id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        } : null
      });
    }

    return res.status(400).json({ success: false, message: "Invalid or expired verification token code." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Mobile OTP Token Verification Endpoint Alias
router.post('/auth/verify-mobile-token', async (req, res) => {
  try {
    const { voter_id, token_code } = req.body;
    const verifyResult = await db.verifyGmailToken(voter_id, token_code);
    if (verifyResult) {
      const user = await db.findUserByVoterId(voter_id);
      let ticketDispatched = false;

      if (user && (typeof verifyResult === 'object' && verifyResult.type === 'registration')) {
        const plainPass = user.caesar_password ? caesarCipherDecrypt(user.caesar_password) : (user.password_hash || '******');
        await sendVoterRegistrationTicket({
          email: user.email,
          voterId: user.voter_id,
          name: user.name,
          password: plainPass,
          phone: user.phone
        });
        ticketDispatched = true;
      }

      return res.json({
        success: true,
        message: ticketDispatched
          ? "Verification successful! Your Official Voter Credential Ticket has been emailed to you."
          : "Verification successful. Access granted.",
        ticket_dispatched: ticketDispatched,
        user: user ? {
          id: user.id,
          voter_id: user.voter_id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        } : undefined
      });
    }
    return res.status(400).json({ success: false, message: "Invalid or expired verification code." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Voter Eligibility & Past Voting Status Query
router.get('/voter/status/:voter_id/:election_id', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const { voter_id, election_id } = req.params;
    const voteDetails = await db.getVoteDetails(election_id, voter_id.toUpperCase());
    res.json({
      success: true,
      voter_id: voter_id.toUpperCase(),
      election_id,
      has_voted: voteDetails.has_voted,
      candidate_id: voteDetails.candidate_id || null,
      candidate_name: voteDetails.candidate_name || null,
      candidate_party: voteDetails.candidate_party || null,
      timestamp: voteDetails.timestamp || null,
      receipt_id: voteDetails.receipt_id || null,
      caesar_hash: voteDetails.caesar_hash || null,
      sha256_hash: voteDetails.sha256_hash || null,
      message: voteDetails.has_voted ? "You have already voted in this election." : "Voter is eligible to vote."
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Voting Engine: Cast Vote (STRICT SINGLE-VOTE + CAESAR CIPHER SEALING)
router.post('/vote', validateVoteCast, async (req, res) => {
  try {
    const { election_id, voter_id, candidate_id } = req.body;
    const cleanVoterId = voter_id.toUpperCase();

    const alreadyVoted = await db.hasVoted(election_id, cleanVoterId);
    if (alreadyVoted) {
      return res.status(400).json({
        success: false,
        already_voted: true,
        message: "You have already voted in this election! Multiple voting is strictly prohibited by server-side verification."
      });
    }

    const voteRecord = await db.castVote(election_id, cleanVoterId, candidate_id);

    return res.status(201).json({
      success: true,
      message: "🎉 Your vote has been securely cast and sealed with Caesar Cipher shift encryption & SHA-256 hash!",
      vote: {
        receipt_id: voteRecord.id,
        election_id: voteRecord.election_id,
        voter_id: voteRecord.voter_id,
        candidate_name: voteRecord.candidate_name,
        timestamp: voteRecord.timestamp,
        caesar_hash: voteRecord.caesar_hash,
        sha256_seal: voteRecord.sha256_hash || voteRecord.sha256_seal,
        sha256_hash: voteRecord.sha256_hash || voteRecord.sha256_seal
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
