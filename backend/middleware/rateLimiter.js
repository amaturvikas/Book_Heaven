const rateLimit = require('express-rate-limit');

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 password reset requests per 15 min
  message: {
    success: false,
    message: 'Too many password reset requests. Please wait a few minutes before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'API rate limit exceeded. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  authRateLimiter,
  passwordResetLimiter,
  apiLimiter
};
