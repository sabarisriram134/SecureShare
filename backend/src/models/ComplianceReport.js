/**
 * Compliance Report Model
 * Stores generated compliance reports and violation logs
 */

module.exports = {
  complianceReportSchema: {
    id: String,
    reportId: String,
    standard: String, // GDPR, HIPAA, SOC2
    generatedDate: Date,
    period: {
      startDate: Date,
      endDate: Date
    },
    status: String, // compliant, non-compliant, warning
    violations: [
      {
        ruleId: String,
        ruleName: String,
        severity: String, // critical, high, medium, low
        description: String,
        affectedRecords: Number,
        timestamp: Date,
        resolution: String
      }
    ],
    summary: {
      totalChecks: Number,
      passedChecks: Number,
      failedChecks: Number,
      complianceScore: Number // 0-100
    },
    recommendations: [String],
    auditTrail: [
      {
        action: String,
        timestamp: Date,
        performedBy: String,
        details: Object
      }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }
};
