// Server-side validation functions

function validateVoterRegistration(req, res, next) {
  const { voter_id, name, email, password } = req.body;
  const errors = [];

  if (!voter_id || voter_id.trim().length < 3) {
    errors.push("Voter ID is required and must be at least 3 characters.");
  }
  if (!name || name.trim().length < 2) {
    errors.push("Full name is required.");
  }
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    errors.push("A valid email address is required.");
  }
  if (!password || password.length < 4) {
    errors.push("Password must be at least 4 characters long.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors.join(" ") });
  }

  next();
}

function validateOTPRequest(req, res, next) {
  const { voter_id } = req.body;
  if (!voter_id || voter_id.trim() === "") {
    return res.status(400).json({ success: false, message: "Voter ID or Email is required for OTP request." });
  }
  next();
}

function validateOTPVerify(req, res, next) {
  const { voter_id, otp_code } = req.body;
  if (!voter_id || !otp_code) {
    return res.status(400).json({ success: false, message: "Both Voter ID and 6-digit OTP code are required." });
  }
  if (!/^\d{6}$/.test(otp_code)) {
    return res.status(400).json({ success: false, message: "OTP code must be exactly 6 digits." });
  }
  next();
}

function validateVoteCast(req, res, next) {
  const { election_id, voter_id, candidate_id } = req.body;
  const errors = [];

  if (!election_id) errors.push("Election ID is required.");
  if (!voter_id) errors.push("Voter ID is required.");
  if (!candidate_id) errors.push("Candidate selection is required.");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }

  next();
}

module.exports = {
  validateVoterRegistration,
  validateOTPRequest,
  validateOTPVerify,
  validateVoteCast
};
