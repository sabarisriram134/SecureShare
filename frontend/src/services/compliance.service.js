/**
 * Frontend Compliance Service
 * API calls for compliance operations
 */

import api from './api';

const complianceService = {
  // Get compliance status
  async getStatus(standard) {
    try {
      const response = await api.get('/compliance/status', {
        params: { standard }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching compliance status:', error);
      throw error;
    }
  },

  // Get compliance reports
  async getReports(limit = 10) {
    try {
      const response = await api.get('/compliance/reports', {
        params: { limit }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  // Generate new report
  async generateReport(standard, startDate, endDate) {
    try {
      const response = await api.post('/compliance/report/generate', {
        standard,
        startDate,
        endDate
      });
      return response.data.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },

  // Get violations
  async getViolations(severity, limit = 50) {
    try {
      const response = await api.get('/compliance/violations', {
        params: { severity, limit }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching violations:', error);
      throw error;
    }
  },

  // Get audit trail
  async getAuditTrail(options = {}) {
    try {
      const response = await api.get('/compliance/audit-trail', {
        params: options
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      throw error;
    }
  },

  // Log event
  async logEvent(action, resourceType, resourceId, details = {}) {
    try {
      const response = await api.post('/compliance/log-event', {
        action,
        resourceType,
        resourceId,
        details
      });
      return response.data.data;
    } catch (error) {
      console.error('Error logging event:', error);
      throw error;
    }
  },

  // Send compliance report via email
  async sendComplianceReport(email = null, customData = {}) {
    try {
      const response = await api.post('/compliance/report/send-compliance', {
        email,
        reportType: 'compliance',
        customData
      });
      return response.data;
    } catch (error) {
      console.error('Error sending compliance report:', error);
      throw error;
    }
  },

  // Send activity report via email
  async sendActivityReport(email = null, customData = {}) {
    try {
      const response = await api.post('/compliance/report/send-activity', {
        email,
        customData
      });
      return response.data;
    } catch (error) {
      console.error('Error sending activity report:', error);
      throw error;
    }
  },

  // Send audit report via email
  async sendAuditReport(email = null, customData = {}) {
    try {
      const response = await api.post('/compliance/report/send-audit', {
        email,
        customData
      });
      return response.data;
    } catch (error) {
      console.error('Error sending audit report:', error);
      throw error;
    }
  },

  // Send overall system report via email
  async sendOverallReport(email = null, customData = {}) {
    try {
      const response = await api.post('/compliance/report/send-overall', {
        email,
        customData
      });
      return response.data;
    } catch (error) {
      console.error('Error sending overall report:', error);
      throw error;
    }
  },

  // Send report to multiple users
  async sendBulkReport(emails, reportType = 'overall', customData = {}) {
    try {
      const response = await api.post('/compliance/report/send-bulk', {
        emails,
        reportType,
        customData
      });
      return response.data;
    } catch (error) {
      console.error('Error sending bulk reports:', error);
      throw error;
    }
  },

  // Schedule automated reports
  async scheduleAutomatedReports(frequency = 'weekly', reportType = 'overall', emails = []) {
    try {
      const response = await api.post('/compliance/report/schedule', {
        frequency,
        reportType,
        emails
      });
      return response.data;
    } catch (error) {
      console.error('Error scheduling automated reports:', error);
      throw error;
    }
  }
};

export default complianceService;
