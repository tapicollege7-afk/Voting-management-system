const crypto = require('crypto');

/**
 * Caesar Cipher Shift Encryption
 * Shifts alphabetic and numeric characters by the specified shift value (default: 3)
 */
function caesarCipherEncrypt(str, shift = 3) {
  if (!str) return '';
  return str.split('').map(char => {
    const code = char.charCodeAt(0);

    // Uppercase letters A-Z (65-90)
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((code - 65 + shift) % 26) + 65);
    }
    // Lowercase letters a-z (97-122)
    if (code >= 97 && code <= 122) {
      return String.fromCharCode(((code - 97 + shift) % 26) + 97);
    }
    // Numbers 0-9 (48-57)
    if (code >= 48 && code <= 57) {
      return String.fromCharCode(((code - 48 + shift) % 10) + 48);
    }

    return char;
  }).join('');
}

/**
 * Caesar Cipher Shift Decryption
 * Reverses character shift encryption to restore original plain text
 */
function caesarCipherDecrypt(str, shift = 3) {
  if (!str) return '';
  return str.split('').map(char => {
    const code = char.charCodeAt(0);

    // Uppercase letters A-Z (65-90)
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
    }
    // Lowercase letters a-z (97-122)
    if (code >= 97 && code <= 122) {
      return String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
    }
    // Numbers 0-9 (48-57)
    if (code >= 48 && code <= 57) {
      return String.fromCharCode(((code - 48 - shift + 10) % 10) + 48);
    }

    return char;
  }).join('');
}

/**
 * SHA-256 Cryptographic Hash Generator
 */
function sha256Hash(data) {
  if (!data) return '';
  const str = typeof data === 'object' ? JSON.stringify(data) : String(data);
  return crypto.createHash('sha256').update(str).digest('hex');
}

module.exports = {
  caesarCipherEncrypt,
  caesarCipherDecrypt,
  sha256Hash
};
