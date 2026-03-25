import express from 'express';
import reportController from '../controllers/report.controller.js';
import authMiddleware from '../middlewares/authmiddleware.js';

const router = express.Router();

/**
 * @route   POST /reports/send
 * @desc    Send a report email to a single recipient
 * @access  Private
 * @body    { reportType: 'overall'|'compliance'|'activity'|'audit', recipientEmail: string }
 */
router.post('/send', authMiddleware, reportController.sendReport);

/**
 * @route   POST /reports/bulk
 * @desc    Send a report email to multiple recipients
 * @access  Private
 * @body    { reportType: 'overall'|'compliance'|'activity'|'audit', recipients: string[] }
 */
router.post('/bulk', authMiddleware, reportController.sendBulkReports);

/**
 * @route   POST /reports/schedule
 * @desc    Schedule automated report delivery
 * @access  Private
 * @body    { scheduleId: string, reportType: string, recipients: string[], schedule: 'daily'|'weekly'|'monthly'|'custom' }
 */
router.post('/schedule', authMiddleware, reportController.scheduleReport);

/**
 * @route   GET /reports/schedules
 * @desc    Get all active scheduled reports
 * @access  Private
 */
router.get('/schedules', authMiddleware, reportController.getScheduledReports);

/**
 * @route   DELETE /reports/schedules/:scheduleId
 * @desc    Cancel a scheduled report
 * @access  Private
 */
router.delete('/schedules/:scheduleId', authMiddleware, reportController.cancelSchedule);

/**
 * @route   POST /reports/request
 * @desc    User requests a report (for regular users only)
 * @access  Private
 * @body    { reportType: 'overall'|'compliance'|'activity'|'audit', email: string }
 */
router.post('/request', authMiddleware, reportController.requestReport);

/**
 * @route   GET /reports/requests
 * @desc    Get all report requests (admin only)
 * @access  Private (Admin)
 */
router.get('/requests', authMiddleware, reportController.getReportRequests);

/**
 * @route   GET /reports/requests/pending
 * @desc    Get all pending report requests (admin only)
 * @access  Private (Admin)
 */
router.get('/requests/pending', authMiddleware, reportController.getPendingRequests);

/**
 * @route   POST /reports/requests/:requestId/approve
 * @desc    Approve a report request and send report (admin only)
 * @access  Private (Admin)
 * @body    { adminNotes: string }
 */
router.post('/requests/:requestId/approve', authMiddleware, reportController.approveAndSendRequest);

/**
 * @route   POST /reports/requests/:requestId/reject
 * @desc    Reject a report request (admin only)
 * @access  Private (Admin)
 * @body    { adminNotes: string }
 */
router.post('/requests/:requestId/reject', authMiddleware, reportController.rejectRequest);

export default router;
