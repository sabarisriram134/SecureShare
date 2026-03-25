/**
 * Compliance Utilities
 * Helper functions for compliance operations
 */

const logger = require('./logger');

/**
 * Check if operation meets compliance requirements
 */
exports.isCompliant = (operation, rules) => {
  try {
    for (const rule of rules) {
      if (!rule.check(operation)) {
        return false;
      }
    }
    return true;
  } catch (error) {
    logger.error('Error checking compliance:', error);
    return false;
  }
};

/**
 * Sanitize data for compliance
 */
exports.sanitizeData = (data, level = 'moderate') => {
  try {
    const levels = {
      strict: ['email', 'phone', 'ssn'],
      moderate: ['email', 'phone'],
      permissive: []
    };

    const fieldsToRemove = levels[level] || [];
    const sanitized = { ...data };

    fieldsToRemove.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  } catch (error) {
    logger.error('Error sanitizing data:', error);
    return data;
  }
};

/**
 * Format audit log entry
 */
exports.formatAuditEntry = (entry) => {
  return {
    id: entry.id,
    action: entry.action,
    userId: entry.userId,
    timestamp: new Date(entry.timestamp).toISOString(),
    resource: `${entry.resourceType}:${entry.resourceId}`,
    status: entry.status,
    ipAddress: entry.ipAddress
  };
};

/**
 * Generate compliance hash for integrity check
 */
exports.generateComplianceHash = (data) => {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
};

/**
 * Check data retention period
 */
exports.isWithinRetention = (createdDate, retentionDays) => {
  const now = new Date();
  const created = new Date(createdDate);
  const daysDiff = Math.floor((now - created) / (1000 * 60 * 60 * 24));
  return daysDiff <= retentionDays;
};

/**
 * Format compliance report summary
 */
exports.formatReportSummary = (report) => {
  const passRate = (report.summary.passedChecks / report.summary.totalChecks) * 100;
  return {
    standard: report.standard,
    period: `${report.period.startDate} to ${report.period.endDate}`,
    complianceScore: `${passRate.toFixed(2)}%`,
    violations: report.violations.length,
    status: passRate >= 90 ? 'COMPLIANT' : 'NON-COMPLIANT'
  };
};
