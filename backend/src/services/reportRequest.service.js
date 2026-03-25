/**
 * Report Request Service
 * Manages user report requests (in-memory storage for now)
 */

// In-memory storage for report requests
const reportRequests = [];
let requestCounter = 0;

export const reportRequestService = {
  // Create a new report request
  createRequest: (userId, email, reportType) => {
    const request = {
      id: ++requestCounter,
      requestId: `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      email,
      reportType,
      status: 'pending', // pending, approved, sent, rejected
      createdAt: new Date().toISOString(),
      approvedAt: null,
      sentAt: null,
      adminNotes: ''
    };
    
    reportRequests.unshift(request); // Add to beginning (newest first)
    return request;
  },

  // Get all report requests
  getAllRequests: () => {
    return reportRequests;
  },

  // Get pending requests only
  getPendingRequests: () => {
    return reportRequests.filter(r => r.status === 'pending');
  },

  // Get request by ID
  getRequestById: (id) => {
    return reportRequests.find(r => r.id === parseInt(id));
  },

  // Update request status
  updateRequest: (id, updates) => {
    const request = reportRequests.find(r => r.id === parseInt(id));
    if (request) {
      Object.assign(request, updates);
      return request;
    }
    return null;
  },

  // Approve a request
  approveRequest: (id, adminNotes = '') => {
    const request = reportRequests.find(r => r.id === parseInt(id));
    if (request) {
      request.status = 'approved';
      request.approvedAt = new Date().toISOString();
      request.adminNotes = adminNotes;
      return request;
    }
    return null;
  },

  // Mark request as sent
  markAsSent: (id) => {
    const request = reportRequests.find(r => r.id === parseInt(id));
    if (request) {
      request.status = 'sent';
      request.sentAt = new Date().toISOString();
      return request;
    }
    return null;
  },

  // Reject a request
  rejectRequest: (id, adminNotes = '') => {
    const request = reportRequests.find(r => r.id === parseInt(id));
    if (request) {
      request.status = 'rejected';
      request.adminNotes = adminNotes;
      return request;
    }
    return null;
  },

  // Get statistics
  getStatistics: () => {
    return {
      total: reportRequests.length,
      pending: reportRequests.filter(r => r.status === 'pending').length,
      approved: reportRequests.filter(r => r.status === 'approved').length,
      sent: reportRequests.filter(r => r.status === 'sent').length,
      rejected: reportRequests.filter(r => r.status === 'rejected').length
    };
  }
};

export default reportRequestService;
