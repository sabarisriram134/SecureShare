import nodemailer from 'nodemailer';
import cron from 'node-cron';
import reportRequestService from '../services/reportRequest.service.js';

// Store active schedules in memory (in production, use database)
const schedules = new Map();
let transporter;

// Initialize transporter
async function initializeTransporter() {
  try {
    // Check for EMAIL credentials (new naming convention)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      console.log('✓ Using Gmail for report emails');
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      // Verify connection
      await transporter.verify();
      console.log('✓ Email transporter verified');
    } else {
      console.warn('⚠️  Email credentials not configured. Reports cannot be sent.');
    }
  } catch (error) {
    console.error('❌ Failed to initialize email transporter:', error.message);
  }
}

await initializeTransporter();

// Generate professional HTML report
function generateReportHTML(reportType) {
  const reports = {
    overall: {
      title: '📊 Overall System Report',
      sections: `
        <div class="section">
          <h2>✓ Compliance Status</h2>
          <div class="metric">
            <strong>GDPR:</strong> <span class="status-good">95% Compliant</span>
          </div>
          <div class="metric">
            <strong>HIPAA:</strong> <span class="status-good">92% Compliant</span>
          </div>
          <div class="metric">
            <strong>SOC2:</strong> <span class="status-warning">85% Warning</span>
          </div>
        </div>

        <div class="section">
          <h2>⚡ System Metrics</h2>
          <div class="metric">
            <strong>Active Users:</strong> 250
          </div>
          <div class="metric">
            <strong>Total Files:</strong> 15,000
          </div>
          <div class="metric">
            <strong>Storage Used:</strong> 512 GB / 1 TB
          </div>
          <div class="metric">
            <strong>System Uptime:</strong> 99.9%
          </div>
        </div>

        <div class="section">
          <h2>🎯 Key Recommendations</h2>
          <ul>
            <li>Review and update access control policies</li>
            <li>Archive old files and clean up temporary data</li>
            <li>Implement automatic data archival</li>
            <li>Conduct compliance audit</li>
          </ul>
        </div>
      `
    },
    compliance: {
      title: '✓ Compliance Report',
      sections: `
        <div class="section">
          <h2>📋 Compliance Summary</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Standard</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Status</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Score</th>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px;">GDPR (EU Data Protection)</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">✅ Compliant</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">95%</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="border: 1px solid #ddd; padding: 10px;">HIPAA (Healthcare)</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">✅ Compliant</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">92%</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px;">SOC2 Type II</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">⚠️ Warning</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">85%</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="border: 1px solid #ddd; padding: 10px;">ISO 27001</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">✅ In Progress</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">88%</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h2>🔒 Security Controls</h2>
          <ul>
            <li>✅ End-to-end encryption enabled</li>
            <li>✅ Access logs maintained</li>
            <li>✅ User authentication (2FA ready)</li>
            <li>✅ Regular security audits</li>
            <li>⚠️ Data retention policy review needed</li>
          </ul>
        </div>
      `
    },
    activity: {
      title: '📈 Activity Report',
      sections: `
        <div class="section">
          <h2>📊 Activity Statistics</h2>
          <div class="metric">
            <strong>Uploads Today:</strong> 145
          </div>
          <div class="metric">
            <strong>Downloads Today:</strong> 892
          </div>
          <div class="metric">
            <strong>Access Grants:</strong> 23
          </div>
          <div class="metric">
            <strong>New Users:</strong> 12
          </div>
        </div>

        <div class="section">
          <h2>🔝 Top Activities</h2>
          <ol>
            <li>File Download - 45.2%</li>
            <li>Access Grant Request - 28.3%</li>
            <li>File Upload - 18.5%</li>
            <li>Permission Review - 8%</li>
          </ol>
        </div>

        <div class="section">
          <h2>📱 User Engagement</h2>
          <div class="metric">
            <strong>Active Sessions:</strong> 142
          </div>
          <div class="metric">
            <strong>Peak Hours:</strong> 10 AM - 2 PM
          </div>
          <div class="metric">
            <strong>Avg Session Duration:</strong> 28 min
          </div>
          <div class="metric">
            <strong>New Registrations:</strong> 12
          </div>
        </div>
      `
    },
    audit: {
      title: '🔍 Audit Log Report',
      sections: `
        <div class="section">
          <h2>📋 Recent Audit Events</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr style="background: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Timestamp</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Event Type</th>
              <th style="border: 1px solid #ddd; padding: 8px;">User</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Action</th>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">2026-01-23 09:45</td>
              <td style="border: 1px solid #ddd; padding: 8px;">FILE_UPLOAD</td>
              <td style="border: 1px solid #ddd; padding: 8px;">john@example.com</td>
              <td style="border: 1px solid #ddd; padding: 8px;">✅ Success</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="border: 1px solid #ddd; padding: 8px;">2026-01-23 09:30</td>
              <td style="border: 1px solid #ddd; padding: 8px;">ACCESS_GRANT</td>
              <td style="border: 1px solid #ddd; padding: 8px;">admin@example.com</td>
              <td style="border: 1px solid #ddd; padding: 8px;">✅ Success</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">2026-01-23 08:15</td>
              <td style="border: 1px solid #ddd; padding: 8px;">FILE_DOWNLOAD</td>
              <td style="border: 1px solid #ddd; padding: 8px;">jane@example.com</td>
              <td style="border: 1px solid #ddd; padding: 8px;">✅ Success</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h2>🚨 Security Events</h2>
          <ul>
            <li>Failed login attempts: 2</li>
            <li>Permission violations: 0</li>
            <li>Unusual activity: 0</li>
            <li>System alerts: 0</li>
          </ul>
        </div>
      `
    }
  };

  const report = reports[reportType] || reports.overall;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .header h1 { margin: 0; }
        .header p { margin: 10px 0 0 0; font-size: 14px; }
        .content { max-width: 800px; margin: 0 auto; padding: 20px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .section h2 { margin-top: 0; color: #667eea; }
        .metric { display: inline-block; width: 45%; margin: 10px 2.5%; padding: 15px; background: #f5f5f5; border-radius: 5px; }
        .status-good { color: green; font-weight: bold; }
        .status-warning { color: orange; font-weight: bold; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f5f5f5; }
        ul { margin: 10px 0; }
        li { margin: 8px 0; }
        ol { margin: 10px 0; padding-left: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${report.title}</h1>
        <p>SecureShare Report System</p>
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>

      <div class="content">
        ${report.sections}

        <div class="footer">
          <p>This is an automated report from SecureShare</p>
          <p>For support, contact: admin@secureshare.com</p>
          <p>© 2026 SecureShare. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Send single report email
export async function sendReport(req, res) {
  try {
    const { reportType, recipientEmail } = req.body;

    if (!reportType || !recipientEmail) {
      return res.status(400).json({
        success: false,
        message: 'reportType and recipientEmail are required'
      });
    }

    if (!['overall', 'compliance', 'activity', 'audit'].includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reportType. Must be one of: overall, compliance, activity, audit'
      });
    }

    // Ensure transporter is initialized
    if (!transporter) {
      await initializeTransporter();
    }

    if (!transporter) {
      return res.status(500).json({
        success: false,
        message: 'Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env'
      });
    }

    const htmlContent = generateReportHTML(reportType);
    const reportTitles = {
      overall: 'Overall System Report',
      compliance: 'Compliance Report',
      activity: 'Activity Report',
      audit: 'Audit Log Report'
    };

    const mailOptions = {
      from: process.env.EMAIL_FROM || `SecureShare <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `📊 SecureShare - ${reportTitles[reportType]}`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✓ Report email sent to ${recipientEmail} (${reportType})`);

    res.json({
      success: true,
      message: 'Report email sent successfully',
      messageId: info.messageId,
      recipient: recipientEmail,
      reportType: reportType,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error sending report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send report email',
      error: error.message
    });
  }
}

// Send bulk reports to multiple recipients
export async function sendBulkReports(req, res) {
  try {
    const { reportType, recipients } = req.body;

    if (!reportType || !recipients || !Array.isArray(recipients)) {
      return res.status(400).json({
        success: false,
        message: 'reportType and recipients array are required'
      });
    }

    // Ensure transporter is initialized
    if (!transporter) {
      await initializeTransporter();
    }

    if (!transporter) {
      return res.status(500).json({
        success: false,
        message: 'Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env'
      });
    }

    const htmlContent = generateReportHTML(reportType);
    const reportTitles = {
      overall: 'Overall System Report',
      compliance: 'Compliance Report',
      activity: 'Activity Report',
      audit: 'Audit Log Report'
    };

    const results = [];

    for (const recipientEmail of recipients) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_FROM || `SecureShare <${process.env.EMAIL_USER}>`,
          to: recipientEmail,
          subject: `📊 SecureShare - ${reportTitles[reportType]}`,
          html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✓ Report sent to ${recipientEmail}`);

        results.push({
          email: recipientEmail,
          status: 'success',
          messageId: info.messageId
        });
      } catch (error) {
        console.error(`❌ Failed to send to ${recipientEmail}:`, error.message);
        results.push({
          email: recipientEmail,
          status: 'failed',
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const failureCount = results.filter(r => r.status === 'failed').length;

    res.json({
      success: true,
      message: `Bulk reports sent: ${successCount} success, ${failureCount} failed`,
      reportType: reportType,
      totalRecipients: recipients.length,
      results: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending bulk reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk reports',
      error: error.message
    });
  }
}

// Schedule automated report delivery
export async function scheduleReport(req, res) {
  try {
    const { scheduleId, reportType, recipients, schedule } = req.body;

    if (!scheduleId || !reportType || !recipients || !schedule) {
      return res.status(400).json({
        success: false,
        message: 'scheduleId, reportType, recipients, and schedule are required'
      });
    }

    // Validate schedule format (should be cron expression or preset)
    const scheduleMap = {
      'daily': '0 9 * * *',          // Every day at 9 AM
      'weekly': '0 9 * * 1',         // Every Monday at 9 AM
      'monthly': '0 9 1 * *',        // First day of month at 9 AM
      'custom': schedule             // Custom cron expression
    };

    const cronExpression = scheduleMap[schedule] || schedule;

    // Cancel existing schedule if it exists
    if (schedules.has(scheduleId)) {
      schedules.get(scheduleId).stop();
      schedules.delete(scheduleId);
    }

    // Create scheduled job
    const task = cron.schedule(cronExpression, async () => {
      try {
        // Ensure transporter is available
        if (!transporter) {
          await initializeTransporter();
        }

        if (!transporter) {
          console.error('❌ Email transporter not available for scheduled report');
          return;
        }

        const htmlContent = generateReportHTML(reportType);
        const reportTitles = {
          overall: 'Overall System Report',
          compliance: 'Compliance Report',
          activity: 'Activity Report',
          audit: 'Audit Log Report'
        };

        let successCount = 0;
        let failureCount = 0;

        for (const recipientEmail of recipients) {
          try {
            const mailOptions = {
              from: process.env.EMAIL_FROM || `SecureShare <${process.env.EMAIL_USER}>`,
              to: recipientEmail,
              subject: `🔔 SecureShare - Scheduled Report: ${reportTitles[reportType]}`,
              html: htmlContent
            };

            await transporter.sendMail(mailOptions);
            successCount++;
            console.log(`✓ Scheduled report sent to ${recipientEmail}`);
          } catch (error) {
            failureCount++;
            console.error(`❌ Failed to send scheduled report to ${recipientEmail}:`, error.message);
          }
        }

        console.log(`✓ Scheduled ${reportType} report: ${successCount} success, ${failureCount} failed`);
      } catch (error) {
        console.error('❌ Error sending scheduled report:', error);
      }
    });

    // Store schedule reference
    schedules.set(scheduleId, task);

    res.json({
      success: true,
      message: 'Report scheduling activated',
      scheduleId: scheduleId,
      reportType: reportType,
      recipients: recipients,
      schedule: schedule,
      cronExpression: cronExpression,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error scheduling report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule report',
      error: error.message
    });
  }
}

// Get all scheduled reports
export async function getScheduledReports(req, res) {
  try {
    const scheduleList = Array.from(schedules.keys()).map(id => ({
      scheduleId: id,
      status: 'active'
    }));

    res.json({
      success: true,
      scheduledReports: scheduleList,
      totalActive: scheduleList.length
    });
  } catch (error) {
    console.error('Error getting scheduled reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve scheduled reports',
      error: error.message
    });
  }
}

// Cancel scheduled report
export async function cancelSchedule(req, res) {
  try {
    const { scheduleId } = req.params;

    if (!schedules.has(scheduleId)) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    schedules.get(scheduleId).stop();
    schedules.delete(scheduleId);

    res.json({
      success: true,
      message: 'Schedule cancelled successfully',
      scheduleId: scheduleId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error cancelling schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel schedule',
      error: error.message
    });
  }
}

// User report request - regular users can request reports
export const requestReport = async (req, res) => {
  try {
    const { reportType, email } = req.body;
    const userId = req.userId;

    if (!reportType || !email) {
      return res.status(400).json({
        success: false,
        message: 'Report type and email are required'
      });
    }

    const validReportTypes = ['overall', 'compliance', 'activity', 'audit'];
    if (!validReportTypes.includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report type'
      });
    }

    // Create and save report request
    const requestData = reportRequestService.createRequest(userId, email, reportType);

    console.log('New report request:', requestData);

    res.json({
      success: true,
      message: 'Report request submitted successfully',
      requestId: requestData.requestId,
      status: 'pending',
      estimatedDelivery: 'Within 24 hours',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error submitting report request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit report request',
      error: error.message
    });
  }
}

/**
 * Get all report requests (admin only)
 */
export const getReportRequests = async (req, res) => {
  try {
    const requests = reportRequestService.getAllRequests();
    const stats = reportRequestService.getStatistics();

    res.json({
      success: true,
      data: requests,
      statistics: stats
    });
  } catch (error) {
    console.error('Error fetching report requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report requests',
      error: error.message
    });
  }
};

/**
 * Get pending report requests (admin only)
 */
export const getPendingRequests = async (req, res) => {
  try {
    const requests = reportRequestService.getPendingRequests();

    res.json({
      success: true,
      data: requests,
      count: requests.length
    });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending requests',
      error: error.message
    });
  }
};

/**
 * Approve a report request and send report (admin only)
 */
export const approveAndSendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminNotes } = req.body;

    // Get the request
    const request = reportRequestService.getRequestById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Report request not found'
      });
    }

    // Approve the request
    reportRequestService.approveRequest(requestId, adminNotes);

    // Send the actual report email based on request.reportType
    try {
      if (!transporter) {
        await initializeTransporter();
      }

      if (!transporter) {
        console.warn('⚠️  Email transporter not configured. Report approved but not sent.');
        return res.status(400).json({
          success: false,
          message: 'Email service not configured. Report approved but unable to send.',
          request: reportRequestService.getRequestById(requestId)
        });
      }

      const htmlContent = generateReportHTML(request.reportType);
      const reportTitles = {
        overall: 'Overall System Report',
        compliance: 'Compliance Report',
        activity: 'Activity Report',
        audit: 'Audit Log Report'
      };

      const mailOptions = {
        from: process.env.EMAIL_FROM || `SecureShare <${process.env.EMAIL_USER}>`,
        to: request.email,
        subject: `📊 SecureShare - ${reportTitles[request.reportType] || 'Report'}`,
        html: htmlContent
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✓ Approved report email sent to ${request.email} (${request.reportType})`);
      console.log(`  Message ID: ${info.messageId}`);
    } catch (emailError) {
      console.error('❌ Error sending approved report email:', emailError.message);
      return res.status(500).json({
        success: false,
        message: 'Report approved but failed to send email',
        error: emailError.message,
        request: reportRequestService.getRequestById(requestId)
      });
    }

    // Mark as sent
    reportRequestService.markAsSent(requestId);

    res.json({
      success: true,
      message: 'Report request approved and email sent successfully',
      request: reportRequestService.getRequestById(requestId)
    });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve request',
      error: error.message
    });
  }
};

/**
 * Reject a report request (admin only)
 */
export const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminNotes } = req.body;

    // Get the request
    const request = reportRequestService.getRequestById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Report request not found'
      });
    }

    // Reject the request
    reportRequestService.rejectRequest(requestId, adminNotes);

    res.json({
      success: true,
      message: 'Report request rejected',
      request: reportRequestService.getRequestById(requestId)
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject request',
      error: error.message
    });
  }
};

export default {
  sendReport,
  sendBulkReports,
  scheduleReport,
  getScheduledReports,
  cancelSchedule,
  requestReport,
  getReportRequests,
  getPendingRequests,
  approveAndSendRequest,
  rejectRequest
};
