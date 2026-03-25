/**
 * Send Report Script
 * Demonstrates sending various report types via email
 */

import complianceService from '../services/compliance.service.js';
import logger from '../utils/logger.js';

async function sendReports() {
  try {
    const testEmail = process.env.TEST_EMAIL || 'user@example.com';
    
    logger.info('Starting report sending demonstration...');
    console.log(`\n📧 Sending reports to: ${testEmail}\n`);

    // 1. Send Overall System Report
    console.log('1️⃣  Sending Overall System Report...');
    const overallResult = await complianceService.sendOverallReportEmail(testEmail);
    console.log('✓ Overall Report Sent:', overallResult.messageId);

    // 2. Send Compliance Report
    console.log('\n2️⃣  Sending Compliance Report...');
    const complianceResult = await complianceService.sendComplianceReportEmail(
      testEmail,
      'compliance'
    );
    console.log('✓ Compliance Report Sent:', complianceResult.messageId);

    // 3. Send Activity Report
    console.log('\n3️⃣  Sending Activity Report...');
    const activityResult = await complianceService.sendActivityReportEmail(testEmail);
    console.log('✓ Activity Report Sent:', activityResult.messageId);

    // 4. Send Audit Report
    console.log('\n4️⃣  Sending Audit Report...');
    const auditResult = await complianceService.sendAuditReportEmail(testEmail);
    console.log('✓ Audit Report Sent:', auditResult.messageId);

    // 5. Send to Multiple Users
    console.log('\n5️⃣  Sending to Multiple Users...');
    const multipleEmails = [
      'admin@secureshare.com',
      'compliance@secureshare.com',
      'audit@secureshare.com'
    ];
    const bulkResults = await complianceService.sendReportToMultipleUsers(
      multipleEmails,
      'overall'
    );
    console.log('✓ Bulk Reports Sent:');
    bulkResults.forEach(result => {
      console.log(`  - ${result.email}: ${result.success ? '✓' : '✗'}`);
    });

    // 6. Schedule Automated Reports
    console.log('\n6️⃣  Scheduling Automated Reports...');
    const scheduleResult = await complianceService.scheduleAutomatedReports(
      'weekly',
      'overall',
      [testEmail]
    );
    console.log('✓ Automated Reports Scheduled:', scheduleResult);

    console.log('\n✅ All reports sent successfully!\n');
    logger.info('Report sending demonstration completed');

  } catch (error) {
    logger.error('Error sending reports:', error);
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  sendReports().then(() => {
    process.exit(0);
  });
}

module.exports = sendReports;
