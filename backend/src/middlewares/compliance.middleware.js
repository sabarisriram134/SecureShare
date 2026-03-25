/**
 * Compliance Middleware
 * Enforces compliance rules and logs all operations
 */

const complianceConfig = require('../config/compliance');
const logger = require('../utils/logger');

// Middleware to enforce compliance
const enforceCompliance = (req, res, next) => {
  try {
    // Add compliance metadata to request
    req.compliance = {
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
      enforceLevel: req.user?.complianceLevel || complianceConfig.defaults.enforceLevel
    };

    // Check for required encryption
    if (complianceConfig.flags.REQUIRE_ENCRYPTION && req.method === 'POST') {
      const contentType = req.get('content-type');
      if (!contentType?.includes('application/json')) {
        logger.warn('Non-JSON POST detected, may violate encryption rules', {
          path: req.path,
          userId: req.user?.id
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Compliance middleware error:', error);
    res.status(500).json({ success: false, error: 'Compliance check failed' });
  }
};

// Middleware to log operations
const logOperation = (req, res, next) => {
  const originalJson = res.json;

  res.json = function(data) {
    const success = data?.success !== false;
    const action = `${req.method}_${req.path}`;

    logger.info('Operation completed', {
      action,
      userId: req.user?.id,
      status: success ? 'success' : 'failure',
      timestamp: new Date(),
      ip: req.ip
    });

    return originalJson.call(this, data);
  };

  next();
};

// Middleware to check compliance level
const checkComplianceLevel = (requiredLevel) => {
  return (req, res, next) => {
    const userLevel = req.user?.complianceLevel || complianceConfig.defaults.enforceLevel;

    const levels = {
      permissive: 1,
      moderate: 2,
      strict: 3
    };

    if (levels[userLevel] < levels[requiredLevel]) {
      logger.warn('Compliance level insufficient', {
        required: requiredLevel,
        actual: userLevel,
        userId: req.user?.id
      });

      return res.status(403).json({
        success: false,
        error: 'Insufficient compliance level for this operation'
      });
    }

    next();
  };
};

module.exports = {
  enforceCompliance,
  logOperation,
  checkComplianceLevel
};
