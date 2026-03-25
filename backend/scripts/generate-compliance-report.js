/**
 * Generate Compliance Report Script
 * Generates compliance reports for different standards
 */

const complianceService = require('../services/compliance.service');
const complianceUtils = require('../utils/compliance.utils');
const logger = require('../utils/logger');

async function generateReport() {
  try {
    logger.info('Starting compliance report generation...');

    const standards = ['GDPR', 'HIPAA', 'SOC2'];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = new Date();

    const reports = [];

    for (const standard of standards) {
      logger.info(`Generating report for ${standard}...`);

      const report = await complianceService.generateComplianceReport(
        standard,
        startDate,
        endDate
      );

      const summary = complianceUtils.formatReportSummary(report);
      reports.push(summary);

      logger.info(`${standard} Report:`, JSON.stringify(summary, null, 2));
    }

    console.log('\n=== COMPLIANCE REPORTS ===\n');
    console.table(reports);

    logger.info('Compliance report generation completed successfully');
  } catch (error) {
    logger.error('Error generating compliance report:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  generateReport().then(() => {
    process.exit(0);
  });
}

module.exports = generateReport;
