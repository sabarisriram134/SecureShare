/**
 * Compliance Routes
 * API endpoints for compliance management
 */

const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/compliance.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { enforceCompliance } = require('../middlewares/compliance.middleware');

// Apply auth and compliance middleware
router.use(authMiddleware);
router.use(enforceCompliance);

// Get compliance status
router.get('/status', complianceController.getComplianceStatus);

// Generate compliance report
router.post('/report/generate', complianceController.generateReport);

// Get violations
router.get('/violations', complianceController.getViolations);

// Get audit trail
router.get('/audit-trail', complianceController.getAuditTrail);

// Log event
router.post('/log-event', complianceController.logEvent);

// Send reports via email
router.post('/report/send-compliance', complianceController.sendComplianceReportEmail);
router.post('/report/send-activity', complianceController.sendActivityReportEmail);
router.post('/report/send-audit', complianceController.sendAuditReportEmail);
router.post('/report/send-overall', complianceController.sendOverallReportEmail);

// Send report to multiple users
router.post('/report/send-bulk', complianceController.sendReportToMultipleUsers);

// Schedule automated reports
router.post('/report/schedule', complianceController.scheduleAutomatedReports);

module.exports = router;
