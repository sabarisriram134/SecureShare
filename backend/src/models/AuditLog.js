/**
 * Audit Log Model - Extended
 * Tracks all system operations for compliance and security
 */

module.exports = {
  // Audit Log Schema
  auditLogSchema: {
    id: String,
    userId: String,
    action: String, // upload, download, share, revoke, delete, etc.
    resourceType: String, // file, user, access, etc.
    resourceId: String,
    timestamp: Date,
    ipAddress: String,
    userAgent: String,
    status: String, // success, failure
    errorMessage: String,
    complianceFlags: [String], // GDPR, HIPAA, SOC2, etc.
    dataClassification: String, // PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED
    details: Object, // Additional context
    createdAt: { type: Date, default: Date.now }
  },

  // Action Types
  actionTypes: {
    FILE_UPLOAD: 'file_upload',
    FILE_DOWNLOAD: 'file_download',
    FILE_DELETE: 'file_delete',
    FILE_SHARE: 'file_share',
    ACCESS_GRANT: 'access_grant',
    ACCESS_REVOKE: 'access_revoke',
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',
    USER_CREATE: 'user_create',
    USER_DELETE: 'user_delete',
    PASSWORD_CHANGE: 'password_change',
    SETTINGS_UPDATE: 'settings_update'
  }
};
