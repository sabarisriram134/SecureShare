/**
 * Compliance Tests
 * Unit tests for compliance service
 */

const complianceService = require('../services/compliance.service');
const complianceUtils = require('../utils/compliance.utils');

describe('Compliance Service', () => {
  describe('getComplianceStatus', () => {
    it('should return status for valid standard', async () => {
      const status = await complianceService.getComplianceStatus('GDPR');
      expect(status).toBeDefined();
      expect(status.standard).toBe('GDPR');
      expect(status.enabled).toBeDefined();
    });

    it('should throw error for invalid standard', async () => {
      try {
        await complianceService.getComplianceStatus('INVALID');
        fail('Should throw error');
      } catch (error) {
        expect(error.message).toContain('Unknown compliance standard');
      }
    });
  });

  describe('generateComplianceReport', () => {
    it('should generate valid report', async () => {
      const report = await complianceService.generateComplianceReport(
        'GDPR',
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(report).toBeDefined();
      expect(report.standard).toBe('GDPR');
      expect(report.summary).toBeDefined();
      expect(report.summary.complianceScore).toBeGreaterThanOrEqual(0);
      expect(report.summary.complianceScore).toBeLessThanOrEqual(100);
    });
  });

  describe('logEvent', () => {
    it('should log event successfully', async () => {
      const event = await complianceService.logEvent({
        userId: 'user123',
        action: 'FILE_UPLOAD',
        resourceType: 'file',
        resourceId: 'file123'
      });

      expect(event).toBeDefined();
      expect(event.id).toBeDefined();
      expect(event.timestamp).toBeDefined();
    });
  });
});

describe('Compliance Utilities', () => {
  describe('sanitizeData', () => {
    it('should sanitize sensitive fields', () => {
      const data = { email: 'test@example.com', name: 'John', phone: '555-1234' };
      const sanitized = complianceUtils.sanitizeData(data, 'strict');

      expect(sanitized.email).toBe('[REDACTED]');
      expect(sanitized.phone).toBe('[REDACTED]');
      expect(sanitized.name).toBe('John');
    });
  });

  describe('isWithinRetention', () => {
    it('should check retention period correctly', () => {
      const now = new Date();
      const result = complianceUtils.isWithinRetention(now, 365);
      expect(result).toBe(true);
    });
  });
});
