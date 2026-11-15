const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const DeliveryBoy = require('../models/DeliveryBoy');

const authenticate = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_bookheaven_academic_project_2026');

    let account;
    if (decoded.role === 'customer') {
      account = await User.findById(decoded.id);
    } else if (decoded.role === 'admin') {
      account = await Admin.findById(decoded.id);
    } else if (decoded.role === 'deliveryBoy') {
      account = await DeliveryBoy.findById(decoded.id);
    }

    if (!account) {
      return res.status(401).json({
        success: false,
        message: 'Account associated with this token no longer exists.'
      });
    }

    // Verify session validity via authVersion (invalidates old JWTs after password reset/change)
    if (decoded.authVersion !== undefined && account.authVersion !== undefined && decoded.authVersion !== account.authVersion) {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired due to a recent password change. Please log in again.'
      });
    }

    // Deactivated delivery boys cannot access protected endpoints
    if (decoded.role === 'deliveryBoy' && account.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your delivery account has been deactivated by the administrator.'
      });
    }

    req.user = account;
    req.user.role = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this resource.`
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
