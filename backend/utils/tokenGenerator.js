const crypto = require('crypto');

/**
 * Generates a cryptographically secure random token (64 hex characters)
 */
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hashes a token using SHA-256 for secure database storage
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  generateRandomToken,
  hashToken
};
