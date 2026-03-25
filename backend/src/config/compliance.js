/**
 * Compliance Configuration
 * Defines compliance rules, standards, and enforcement levels
 */

const complianceConfig = {
  // Compliance Standards
  standards: {
    GDPR: {
      enabled: true,
      description: 'General Data Protection Regulation',
      rules: ['data_minimization', 'right_to_be_forgotten', 'data_portability', 'consent_management']
    },
    HIPAA: {
      enabled: true,
      description: 'Health Insurance Portability and Accountability Act',
      rules: ['access_controls', 'audit_controls', 'encryption', 'integrity_controls']
    },
    SOC2: {
      enabled: true,
      description: 'Service Organization Control 2',
      rules: ['access_controls', 'change_management', 'monitoring', 'incident_response']
    }
  },

  // Compliance Flags
  flags: {
    AUDIT_ALL_OPERATIONS: true,
    REQUIRE_ENCRYPTION: true,
    LOG_RETENTION_DAYS: 365,
    REQUIRE_2FA: false,
    AUTO_ANONYMIZE_AFTER_DAYS: 90
  },

  // Data Classification Levels
  classification: {
    PUBLIC: 1,
    INTERNAL: 2,
    CONFIDENTIAL: 3,
    RESTRICTED: 4
  },

  // Enforcement Levels
  enforcement: {
    STRICT: 'strict',
    MODERATE: 'moderate',
    PERMISSIVE: 'permissive'
  },

  // Default Configuration
  defaults: {
    enforceLevel: 'moderate',
    requireApproval: false,
    retentionPolicy: 'automatic',
    archiveAfterDays: 365
  }
};

export default complianceConfig;
