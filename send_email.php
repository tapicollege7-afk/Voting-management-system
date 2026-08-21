<?php
/**
 * VotePulse PHP Email Dispatcher
 * Dispatches real-time email verification tokens using PHP mail()
 */

// Allow JSON payload from CLI arguments or HTTP POST
$inputData = null;

if (php_sapi_name() === 'cli') {
    // Read JSON string passed as CLI argument
    if (isset($argv[1])) {
        $inputData = json_decode($argv[1], true);
    }
} else {
    // Read JSON POST payload
    $rawInput = file_get_contents('php://input');
    $inputData = json_decode($rawInput, true);
}

if (!$inputData || !isset($inputData['email']) || !isset($inputData['token_code'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid payload. Email and token_code required."]);
    exit(1);
}

$to = $inputData['email'];
$voterId = isset($inputData['voter_id']) ? $inputData['voter_id'] : 'VOTER';
$tokenCode = $inputData['token_code'];

$subject = "🗳️ VotePulse Real-Time Verification Token";

// HTML Email Body
$message = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>VotePulse Verification</title>
</head>
<body style='font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;'>
    <div style='max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);'>
        <div style='background: #2563eb; padding: 1.5rem; text-align: center; color: white;'>
            <h1 style='margin: 0; font-size: 1.6rem; font-weight: 800;'>🗳️ VotePulse</h1>
            <p style='margin: 4px 0 0 0; font-size: 0.88rem; opacity: 0.9;'>PHP Real-Time Email Authentication</p>
        </div>
        <div style='padding: 2rem; color: #0f172a;'>
            <h3 style='margin-top: 0; color: #1e1b4b;'>Hello Voter,</h3>
            <p style='font-size: 0.95rem; color: #475569; line-height: 1.5;'>
                Your single-use Real-Time Email Verification Code for Voter ID <strong>" . htmlspecialchars($voterId) . "</strong> is:
            </p>
            <div style='background: #f8fafc; border: 2px dashed #059669; padding: 1rem; border-radius: 12px; text-align: center; margin: 1.5rem 0;'>
                <span style='font-size: 2.2rem; font-weight: 800; letter-spacing: 4px; color: #059669; font-family: monospace;'>" . htmlspecialchars($tokenCode) . "</span>
            </div>
            <p style='font-size: 0.85rem; color: #64748b;'>
                This token is valid for 10 minutes. If you did not request this verification, please ignore this email.
            </p>
        </div>
        <div style='background: #f1f5f9; padding: 1rem; text-align: center; font-size: 0.78rem; color: #64748b; border-top: 1px solid #e2e8f0;'>
            &copy; 2026 VotePulse Engine. End-to-End Cryptographic Security.
        </div>
    </div>
</body>
</html>
";

// Headers for HTML Mail
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: VotePulse Security Engine <no-reply@votepulse.org>\r\n";
$headers .= "Reply-To: no-reply@votepulse.org\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Send email using PHP mail()
$mailSent = @mail($to, $subject, $message, $headers);

$response = [
    "success" => true,
    "method" => "PHP mail()",
    "recipient" => $to,
    "voter_id" => $voterId,
    "mail_sent" => $mailSent ? true : false,
    "timestamp" => date("Y-m-d H:i:s")
];

header('Content-Type: application/json');
echo json_encode($response);
?>
