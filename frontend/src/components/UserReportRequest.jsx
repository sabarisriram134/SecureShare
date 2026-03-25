import React, { useState } from 'react';
import { api } from '../services/api';
import '../styles/UserReportRequest.css';

export default function UserReportRequest() {
  const [reportType, setReportType] = useState('overall');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [submittedRequests, setSubmittedRequests] = useState([]);

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleRequestReport = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      showMessage('❌ Please enter your email address', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/reports/request', {
        reportType: reportType,
        email: email
      });

      showMessage('✅ Report request submitted! Admin will send it shortly.', 'success');
      
      // Add to submitted requests
      setSubmittedRequests([...submittedRequests, {
        id: submittedRequests.length + 1,
        type: reportType,
        date: new Date().toLocaleString(),
        status: 'Pending'
      }]);
    } catch (error) {
      showMessage(`❌ Error: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-report-container">
      <div className="report-request-header">
        <h2>📊 Request Report</h2>
        <p>Submit a request for the admin to send you a report</p>
      </div>

      {message && (
        <div className={`report-message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="report-request-card">
        <form onSubmit={handleRequestReport}>
          <div className="form-group">
            <label>Choose Report Type</label>
            <p className="label-info">Select the type of report you'd like to receive</p>
            
            <div className="report-options">
              <label className={`report-option ${reportType === 'overall' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="reportType"
                  value="overall"
                  checked={reportType === 'overall'}
                  onChange={(e) => setReportType(e.target.value)}
                />
                <div className="option-content">
                  <h4>📊 Overall System Report</h4>
                  <p>Comprehensive system metrics, compliance status, and recommendations</p>
                </div>
              </label>

              <label className={`report-option ${reportType === 'compliance' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="reportType"
                  value="compliance"
                  checked={reportType === 'compliance'}
                  onChange={(e) => setReportType(e.target.value)}
                />
                <div className="option-content">
                  <h4>✓ Compliance Report</h4>
                  <p>GDPR, HIPAA, SOC2 compliance status and security controls</p>
                </div>
              </label>

              <label className={`report-option ${reportType === 'activity' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="reportType"
                  value="activity"
                  checked={reportType === 'activity'}
                  onChange={(e) => setReportType(e.target.value)}
                />
                <div className="option-content">
                  <h4>📈 Activity Report</h4>
                  <p>System activity statistics, metrics, and user engagement</p>
                </div>
              </label>

              <label className={`report-option ${reportType === 'audit' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="reportType"
                  value="audit"
                  checked={reportType === 'audit'}
                  onChange={(e) => setReportType(e.target.value)}
                />
                <div className="option-content">
                  <h4>🔍 Audit Log Report</h4>
                  <p>Recent audit events, security incidents, and system logs</p>
                </div>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <p className="label-info">We'll send the report to this email address</p>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="btn btn-request" disabled={loading}>
            {loading ? '⏳ Submitting Request...' : '📧 Request Report'}
          </button>
        </form>

        <div className="info-box">
          <h3>ℹ️ How It Works</h3>
          <ul>
            <li>✅ Submit your report request</li>
            <li>⏳ Admin will review and send it to you</li>
            <li>📧 You'll receive the report via email</li>
            <li>🔄 You can request reports anytime</li>
          </ul>
        </div>
      </div>

      {submittedRequests.length > 0 && (
        <div className="submitted-requests">
          <h3>📋 Your Request History</h3>
          <div className="requests-list">
            {submittedRequests.map((request) => (
              <div key={request.id} className="request-item">
                <div className="request-info">
                  <h4>{request.type}</h4>
                  <p>{request.date}</p>
                </div>
                <span className={`request-status ${request.status.toLowerCase()}`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
