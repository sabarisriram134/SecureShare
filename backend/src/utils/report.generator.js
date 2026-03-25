/**
 * Report Generator Utility
 * Creates formatted reports for email distribution
 */

const logger = require('./logger');

class ReportGenerator {
  // Generate compliance summary report
  generateComplianceSummary(complianceData) {
    try {
      const report = {
        title: 'Compliance Summary Report',
        generatedDate: new Date().toLocaleDateString(),
        generatedTime: new Date().toLocaleTimeString(),
        standards: this.formatStandards(complianceData.standards),
        violations: this.formatViolations(complianceData.violations),
        overallScore: complianceData.overallScore || 0,
        status: this.getStatusLabel(complianceData.overallScore),
        recommendations: complianceData.recommendations || []
      };

      return report;
    } catch (error) {
      logger.error('Error generating compliance summary:', error);
      throw error;
    }
  }

  // Generate activity report
  generateActivityReport(activityData) {
    try {
      const report = {
        title: 'System Activity Report',
        period: {
          startDate: activityData.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: activityData.endDate || new Date()
        },
        statistics: {
          totalOperations: activityData.totalOperations || 0,
          uploads: activityData.uploads || 0,
          downloads: activityData.downloads || 0,
          shares: activityData.shares || 0,
          deletions: activityData.deletions || 0,
          accessGrants: activityData.accessGrants || 0,
          accessRevokes: activityData.accessRevokes || 0
        },
        topUsers: activityData.topUsers || [],
        topFiles: activityData.topFiles || [],
        securityEvents: activityData.securityEvents || []
      };

      return report;
    } catch (error) {
      logger.error('Error generating activity report:', error);
      throw error;
    }
  }

  // Generate audit report
  generateAuditReport(auditData) {
    try {
      const report = {
        title: 'Audit Log Report',
        period: {
          startDate: auditData.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: auditData.endDate || new Date()
        },
        totalRecords: auditData.totalRecords || 0,
        byAction: this.groupByAction(auditData.logs),
        byUser: this.groupByUser(auditData.logs),
        failedOperations: auditData.failedOperations || [],
        criticalEvents: auditData.criticalEvents || []
      };

      return report;
    } catch (error) {
      logger.error('Error generating audit report:', error);
      throw error;
    }
  }

  // Generate storage report
  generateStorageReport(storageData) {
    try {
      const report = {
        title: 'Storage Usage Report',
        generatedDate: new Date().toLocaleDateString(),
        totalStorage: this.formatBytes(storageData.totalStorage || 0),
        usedStorage: this.formatBytes(storageData.usedStorage || 0),
        availableStorage: this.formatBytes((storageData.totalStorage || 0) - (storageData.usedStorage || 0)),
        usagePercentage: this.calculatePercentage(storageData.usedStorage, storageData.totalStorage),
        topStorageUsers: storageData.topUsers || [],
        fileDistribution: storageData.distribution || {}
      };

      return report;
    } catch (error) {
      logger.error('Error generating storage report:', error);
      throw error;
    }
  }

  // Generate overall system report
  generateOverallReport(data) {
    try {
      const report = {
        title: 'SecureShare - Overall System Report',
        generatedDate: new Date().toLocaleDateString(),
        generatedTime: new Date().toLocaleTimeString(),
        period: data.period || {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date()
        },
        sections: {
          compliance: this.generateComplianceSummary(data.compliance || {}),
          activity: this.generateActivityReport(data.activity || {}),
          audit: this.generateAuditReport(data.audit || {}),
          storage: this.generateStorageReport(data.storage || {})
        },
        keyMetrics: data.keyMetrics || {},
        alerts: data.alerts || [],
        recommendations: data.recommendations || []
      };

      return report;
    } catch (error) {
      logger.error('Error generating overall report:', error);
      throw error;
    }
  }

  // Helper: Format standards data
  formatStandards(standards) {
    return Object.entries(standards).map(([name, data]) => ({
      name,
      status: data.status || 'unknown',
      score: data.score || 0,
      rulesChecked: data.rulesChecked || 0,
      rulesPassed: data.rulesPassed || 0
    }));
  }

  // Helper: Format violations
  formatViolations(violations) {
    if (!Array.isArray(violations)) return [];
    return violations.map(v => ({
      rule: v.rule,
      severity: v.severity,
      count: v.count,
      description: v.description
    })).sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99);
    });
  }

  // Helper: Get status label
  getStatusLabel(score) {
    if (score >= 90) return 'COMPLIANT';
    if (score >= 70) return 'WARNING';
    return 'NON-COMPLIANT';
  }

  // Helper: Group logs by action
  groupByAction(logs) {
    const grouped = {};
    if (!Array.isArray(logs)) return grouped;

    logs.forEach(log => {
      grouped[log.action] = (grouped[log.action] || 0) + 1;
    });

    return grouped;
  }

  // Helper: Group logs by user
  groupByUser(logs) {
    const grouped = {};
    if (!Array.isArray(logs)) return grouped;

    logs.forEach(log => {
      grouped[log.userId] = (grouped[log.userId] || 0) + 1;
    });

    return grouped;
  }

  // Helper: Format bytes
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // Helper: Calculate percentage
  calculatePercentage(used, total) {
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
  }

  // Convert report to HTML string
  reportToHTML(report, reportType = 'overall') {
    try {
      const headerColor = '#667eea';
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
            .container { max-width: 800px; margin: 0 auto; background: #fff; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 5px 0 0 0; opacity: 0.9; }
            .section { padding: 20px; border-bottom: 1px solid #eee; }
            .section h2 { color: ${headerColor}; margin: 0 0 15px 0; font-size: 20px; }
            .section h3 { color: #555; margin: 15px 0 10px 0; font-size: 16px; }
            .metric { display: inline-block; margin: 10px 20px 10px 0; }
            .metric-label { color: #999; font-size: 12px; }
            .metric-value { font-size: 24px; font-weight: bold; color: ${headerColor}; }
            .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .table th { background: #f5f5f5; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid ${headerColor}; }
            .table td { padding: 10px; border-bottom: 1px solid #eee; }
            .table tr:hover { background: #f9f9f9; }
            .status-compliant { color: #28a745; font-weight: bold; }
            .status-warning { color: #ffc107; font-weight: bold; }
            .status-non-compliant { color: #dc3545; font-weight: bold; }
            .severity-critical { color: #dc3545; }
            .severity-high { color: #ff6b6b; }
            .severity-medium { color: #ffc107; }
            .severity-low { color: #28a745; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 12px; }
            .recommendation { background: #e7f3ff; padding: 12px; border-left: 4px solid ${headerColor}; margin: 10px 0; }
            .alert { background: #fff3cd; padding: 12px; border-left: 4px solid #ffc107; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${report.title}</h1>
              <p>Generated: ${report.generatedDate} ${report.generatedTime || ''}</p>
            </div>

            ${reportType === 'overall' ? this.renderOverallReport(report) : this.renderSectionReport(report, reportType)}

            <div class="footer">
              <p>This is an automated report from SecureShare. Please do not reply to this email.</p>
              <p>&copy; 2024 SecureShare - Secure File Sharing Platform</p>
            </div>
          </div>
        </body>
        </html>
      `;
      return html;
    } catch (error) {
      logger.error('Error converting report to HTML:', error);
      throw error;
    }
  }

  // Helper: Render overall report
  renderOverallReport(report) {
    return `
      ${this.renderMetricsSection(report.keyMetrics)}
      ${this.renderComplianceSection(report.sections.compliance)}
      ${this.renderActivitySection(report.sections.activity)}
      ${this.renderAuditSection(report.sections.audit)}
      ${this.renderStorageSection(report.sections.storage)}
      ${this.renderAlertsAndRecommendations(report.alerts, report.recommendations)}
    `;
  }

  // Helper: Render section report
  renderSectionReport(report, type) {
    const section = report.sections ? report.sections[type] : report;
    switch (type) {
      case 'compliance':
        return this.renderComplianceSection(section);
      case 'activity':
        return this.renderActivitySection(section);
      case 'audit':
        return this.renderAuditSection(section);
      case 'storage':
        return this.renderStorageSection(section);
      default:
        return '';
    }
  }

  // Render metrics section
  renderMetricsSection(metrics) {
    const metricsHTML = Object.entries(metrics).map(([key, value]) => `
      <div class="metric">
        <div class="metric-label">${key}</div>
        <div class="metric-value">${value}</div>
      </div>
    `).join('');

    return `
      <div class="section">
        <h2>Key Metrics</h2>
        ${metricsHTML}
      </div>
    `;
  }

  // Render compliance section
  renderComplianceSection(compliance) {
    const standardsHTML = compliance.standards.map(std => `
      <tr>
        <td>${std.name}</td>
        <td class="status-${std.status.toLowerCase()}">${std.status.toUpperCase()}</td>
        <td>${std.score}/100</td>
        <td>${std.rulesPassed}/${std.rulesChecked}</td>
      </tr>
    `).join('');

    const violationsHTML = compliance.violations.slice(0, 10).map(v => `
      <tr>
        <td>${v.rule}</td>
        <td><span class="severity-${v.severity}">${v.severity.toUpperCase()}</span></td>
        <td>${v.count}</td>
      </tr>
    `).join('');

    return `
      <div class="section">
        <h2>Compliance Status</h2>
        <div class="metric">
          <div class="metric-label">Overall Score</div>
          <div class="metric-value">${compliance.overallScore}/100</div>
        </div>
        <div class="metric">
          <div class="metric-label">Status</div>
          <div class="metric-value status-${compliance.status.toLowerCase()}">${compliance.status}</div>
        </div>

        <h3>Standards Summary</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Standard</th>
              <th>Status</th>
              <th>Score</th>
              <th>Rules</th>
            </tr>
          </thead>
          <tbody>
            ${standardsHTML}
          </tbody>
        </table>

        <h3>Recent Violations</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Rule</th>
              <th>Severity</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            ${violationsHTML || '<tr><td colspan="3">No violations detected</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  // Render activity section
  renderActivitySection(activity) {
    const statsHTML = Object.entries(activity.statistics).map(([key, value]) => `
      <div class="metric">
        <div class="metric-label">${key.replace(/([A-Z])/g, ' $1').toUpperCase()}</div>
        <div class="metric-value">${value}</div>
      </div>
    `).join('');

    return `
      <div class="section">
        <h2>System Activity</h2>
        ${statsHTML}
      </div>
    `;
  }

  // Render audit section
  renderAuditSection(audit) {
    const criticalHTML = (audit.criticalEvents || []).slice(0, 5).map(event => `
      <div class="alert">
        <strong>${event.action}</strong> - ${event.timestamp} - ${event.details}
      </div>
    `).join('');

    return `
      <div class="section">
        <h2>Audit Summary</h2>
        <div class="metric">
          <div class="metric-label">Total Records</div>
          <div class="metric-value">${audit.totalRecords}</div>
        </div>
        ${criticalHTML ? `<h3>Critical Events</h3>${criticalHTML}` : ''}
      </div>
    `;
  }

  // Render storage section
  renderStorageSection(storage) {
    return `
      <div class="section">
        <h2>Storage Usage</h2>
        <div class="metric">
          <div class="metric-label">Used Storage</div>
          <div class="metric-value">${storage.usedStorage}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Available Storage</div>
          <div class="metric-value">${storage.availableStorage}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Usage</div>
          <div class="metric-value">${storage.usagePercentage}%</div>
        </div>
      </div>
    `;
  }

  // Render alerts and recommendations
  renderAlertsAndRecommendations(alerts, recommendations) {
    const alertsHTML = (alerts || []).map(alert => `
      <div class="alert">
        <strong>${alert.title}</strong> - ${alert.description}
      </div>
    `).join('');

    const recommendationsHTML = (recommendations || []).map(rec => `
      <div class="recommendation">
        <strong>${rec.title || 'Recommendation'}</strong> - ${rec.description || rec}
      </div>
    `).join('');

    return `
      ${alertsHTML ? `
        <div class="section">
          <h2>Alerts</h2>
          ${alertsHTML}
        </div>
      ` : ''}
      ${recommendationsHTML ? `
        <div class="section">
          <h2>Recommendations</h2>
          ${recommendationsHTML}
        </div>
      ` : ''}
    `;
  }
}

module.exports = new ReportGenerator();
