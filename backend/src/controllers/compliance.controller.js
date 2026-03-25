/**
 * Compliance Controller
 * Handles compliance-related API requests
 */

const complianceService = require('../services/compliance.service');
const logger = require('../utils/logger');

// Get compliance status
exports.getComplianceStatus = async (req, res) => {
  try {
    const { standard } = req.query;
    const status = await complianceService.getComplianceStatus(standard);
    res.json({ success: true, data: status });
  } catch (error) {
    logger.error('Error getting compliance status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Generate compliance report
exports.generateReport = async (req, res) => {
  try {
    const { standard, startDate, endDate } = req.body;
    const report = await complianceService.generateComplianceReport(
      standard,
      startDate,
      endDate
    );
    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('Error generating compliance report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get violations
exports.getViolations = async (req, res) => {
  try {
    const { severity, limit = 50 } = req.query;
    const violations = await complianceService.getViolations(severity, limit);
    res.json({ success: true, data: violations });
  } catch (error) {
    logger.error('Error fetching violations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Audit trail
exports.getAuditTrail = async (req, res) => {
  try {
    const { userId, action, startDate, endDate, limit = 100 } = req.query;
    const trail = await complianceService.getAuditTrail({
      userId,
      action,
      startDate,
      endDate,
      limit
    });
    res.json({ success: true, data: trail });
  } catch (error) {
    logger.error('Error fetching audit trail:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Log event
exports.logEvent = async (req, res) => {
  try {
    const { action, resourceType, resourceId, details } = req.body;
    const event = await complianceService.logEvent({
      userId: req.user?.id,
      action,
      resourceType,
      resourceId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      details
    });
    res.json({ success: true, data: event });
  } catch (error) {
    logger.error('Error logging event:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Send compliance report via email
exports.sendComplianceReportEmail = async (req, res) => {
  try {
    const { email, reportType = 'compliance', customData = {} } = req.body;
    const userEmail = email || req.user?.email;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    const result = await complianceService.sendComplianceReportEmail(
      userEmail,
      reportType,
      customData
    );

    res.json({
      success: true,
      message: `Compliance report sent to ${userEmail}`,
      data: result
    });
  } catch (error) {
    logger.error('Error sending compliance report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Send activity report via email
exports.sendActivityReportEmail = async (req, res) => {
  try {
    const { email, customData = {} } = req.body;
    const userEmail = email || req.user?.email;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    const result = await complianceService.sendActivityReportEmail(
      userEmail,
      customData
    );

    res.json({
      success: true,
      message: `Activity report sent to ${userEmail}`,
      data: result
    });
  } catch (error) {
    logger.error('Error sending activity report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Send audit report via email
exports.sendAuditReportEmail = async (req, res) => {
  try {
    const { email, customData = {} } = req.body;
    const userEmail = email || req.user?.email;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    const result = await complianceService.sendAuditReportEmail(
      userEmail,
      customData
    );

    res.json({
      success: true,
      message: `Audit report sent to ${userEmail}`,
      data: result
    });
  } catch (error) {
    logger.error('Error sending audit report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Send overall system report via email
exports.sendOverallReportEmail = async (req, res) => {
  try {
    const { email, customData = {} } = req.body;
    const userEmail = email || req.user?.email;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    const result = await complianceService.sendOverallReportEmail(
      userEmail,
      customData
    );

    res.json({
      success: true,
      message: `Overall system report sent to ${userEmail}`,
      data: result
    });
  } catch (error) {
    logger.error('Error sending overall report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Send report to multiple users
exports.sendReportToMultipleUsers = async (req, res) => {
  try {
    const { emails, reportType = 'overall', customData = {} } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Email list is required'
      });
    }

    const results = await complianceService.sendReportToMultipleUsers(
      emails,
      reportType,
      customData
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({
      success: true,
      message: `Reports sent: ${successful} succeeded, ${failed} failed`,
      data: results
    });
  } catch (error) {
    logger.error('Error sending reports to multiple users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Schedule automated reports
exports.scheduleAutomatedReports = async (req, res) => {
  try {
    const { frequency = 'weekly', reportType = 'overall', emails = [] } = req.body;

    const result = await complianceService.scheduleAutomatedReports(
      frequency,
      reportType,
      emails
    );

    res.json({
      success: true,
      message: `Automated reports scheduled (${frequency})`,
      data: result
    });
  } catch (error) {
    logger.error('Error scheduling automated reports:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
