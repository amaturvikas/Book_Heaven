const os = require('os');

/**
 * Detect the server's local network IPv4 address (for LAN access on mobile devices).
 */
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        // Skip autoconfigured link-local addresses
        if (!net.address.startsWith('169.254.')) {
          return net.address;
        }
      }
    }
  }
  return null;
}

/**
 * Validates whether a string is a well-formed HTTP/HTTPS URL.
 */
function isValidHttpUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

/**
 * Resolves the appropriate frontend base URL for password reset links.
 * Works seamlessly across:
 *  1. Production deployments (Render, Vercel, Railway, AWS, etc.)
 *  2. Mobile phones connected via local Wi-Fi / LAN
 *  3. Laptop / desktop development on localhost
 */
function resolveClientBaseUrl(req) {
  const isProduction = process.env.NODE_ENV === 'production';
  const configuredAppUrl = process.env.APP_URL || process.env.CLIENT_URL;

  // 1. In Production, ALWAYS prioritize the explicitly configured production URL
  if (isProduction && configuredAppUrl && isValidHttpUrl(configuredAppUrl)) {
    return configuredAppUrl.replace(/\/+$/, '');
  }

  // 2. Check if the frontend client explicitly provided its origin in the request body
  const bodyClientUrl = req.body && req.body.clientUrl;
  if (bodyClientUrl && isValidHttpUrl(bodyClientUrl)) {
    return bodyClientUrl.replace(/\/+$/, '');
  }

  // 3. Check request Origin or Referer header
  const originHeader = req.get('origin');
  if (originHeader && isValidHttpUrl(originHeader)) {
    return originHeader.replace(/\/+$/, '');
  }

  // 4. In development, if configured URL does not contain localhost, use it
  if (configuredAppUrl && isValidHttpUrl(configuredAppUrl)) {
    const parsed = new URL(configuredAppUrl);
    if (parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
      return configuredAppUrl.replace(/\/+$/, '');
    }
  }

  // 5. In local development where the client accessed via localhost or APP_URL is localhost:
  // Detect local Wi-Fi/LAN IP so mobile devices on the same network can reach the link!
  const localIp = getLocalIpAddress();
  if (!isProduction && localIp) {
    const port = (configuredAppUrl && isValidHttpUrl(configuredAppUrl))
      ? new URL(configuredAppUrl).port || '5173'
      : '5173';
    return `http://${localIp}:${port}`;
  }

  // 6. Default fallback
  return (configuredAppUrl || 'http://localhost:5173').replace(/\/+$/, '');
}

/**
 * Builds the complete password reset URL and mobile/desktop alternatives.
 *
 * @param {object} req - Express request object
 * @param {string} routePrefix - e.g. '' (customer), '/admin', or '/delivery-boy'
 * @param {string} rawToken - Generated single-use reset token
 * @returns {object} { primaryUrl, localUrl, lanUrl, isDev }
 */
function buildPasswordResetUrls(req, routePrefix, rawToken) {
  const isProduction = process.env.NODE_ENV === 'production';
  const prefix = routePrefix ? `/${routePrefix.replace(/^\/+|\/+$/g, '')}` : '';
  const tokenPath = `/reset-password/${encodeURIComponent(rawToken)}`;
  const relativePath = `${prefix}${tokenPath}`;

  const resolvedBase = resolveClientBaseUrl(req);
  const primaryUrl = `${resolvedBase}${relativePath}`;

  // In development, also compute localhost and LAN URLs for developer convenience
  let localUrl = null;
  let lanUrl = null;

  if (!isProduction) {
    const localIp = getLocalIpAddress();
    const port = '5173';
    localUrl = `http://localhost:${port}${relativePath}`;
    if (localIp) {
      lanUrl = `http://${localIp}:${port}${relativePath}`;
    }
  }

  return {
    primaryUrl,
    localUrl,
    lanUrl,
    isProduction
  };
}

module.exports = {
  getLocalIpAddress,
  isValidHttpUrl,
  resolveClientBaseUrl,
  buildPasswordResetUrls
};
