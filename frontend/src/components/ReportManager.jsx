import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './ReportManager.css';

export default function ReportManager() {
  const [activeTab, setActiveTab] = useState('send');
  const [reportType, setReportType] = useState('overall');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [bulkRecipients, setBulkRecipients] = useState('');
  const [scheduleId, setScheduleId] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [scheduledReports, setScheduledReports] = useState([]);

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  // Send single report
  const handleSendReport = async (e) => {
    e.preventDefault();
    if (!recipientEmail) {
      showMessage('Please enter a recipient email', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/reports/send', {
        reportType,
        recipientEmail
      });

      showMessage(`✅ Report sent to ${recipientEmail}!`, 'success');
      setRecipientEmail('');
    } catch (error) {
      showMessage(`❌ Error: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Send bulk reports
  const handleSendBulk = async (e) => {
    e.preventDefault();
    if (!bulkRecipients) {
      showMessage('Please enter recipient emails (comma-separated)', 'error');
      return;
    }

    const recipients = bulkRecipients
      .split(',')
      .map(email => email.trim())
      .filter(email => email);

    setLoading(true);
    try {
      const response = await api.post('/reports/bulk', {
        reportType,
        recipients
      });

      const successCount = response.data.results.filter(r => r.status === 'success').length;
      showMessage(`✅ Sent to ${successCount}/${recipients.length} recipients!`, 'success');
      setBulkRecipients('');
    } catch (error) {
      showMessage(`❌ Error: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Schedule report
  const handleScheduleReport = async (e) => {
    e.preventDefault();
    if (!scheduleId || !bulkRecipients) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    const recipients = bulkRecipients
      .split(',')
      .map(email => email.trim())
      .filter(email => email);

    setLoading(true);
    try {
      const response = await api.post('/reports/schedule', {
        scheduleId,
        reportType,
        recipients,
        schedule: scheduleFrequency
      });

      showMessage(`✅ Report scheduled successfully!`, 'success');
      setScheduleId('');
      setBulkRecipients('');
      fetchScheduledReports();
    } catch (error) {
      showMessage(`❌ Error: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch scheduled reports
  const fetchScheduledReports = async () => {
    try {
      const response = await api.get('/reports/schedules');
      setScheduledReports(response.data.scheduledReports || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  // Cancel scheduled report
  const handleCancelSchedule = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/reports/schedules/${id}`);
      showMessage('✅ Schedule cancelled!', 'success');
      fetchScheduledReports();
    } catch (error) {
      showMessage(`❌ Error: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch schedules on mount and when switching tabs
  useEffect(() => {
    if (activeTab === 'schedule') {
      fetchScheduledReports();
    }
  }, [activeTab]);

  return (
    <div className="report-manager-container">
      <div className="report-header">
        <h2>📊 Report Manager</h2>
        <p>Send compliance, activity, and audit reports</p>
      </div>

      <div className="report-tabs">
        <button
          className={`tab-button ${activeTab === 'send' ? 'active' : ''}`}
          onClick={() => setActiveTab('send')}
        >
          📧 Send Report
        </button>
        <button
          className={`tab-button ${activeTab === 'bulk' ? 'active' : ''}`}
          onClick={() => setActiveTab('bulk')}
        >
          📬 Bulk Send
        </button>
        <button
          className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          ⏰ Schedule
        </button>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {/* Send Single Report */}
      {activeTab === 'send' && (
        <form className="report-form" onSubmit={handleSendReport}>
          <div className="form-group">
            <label>Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="form-input"
            >
              <option value="overall">📊 Overall System Report</option>
              <option value="compliance">✓ Compliance Report</option>
              <option value="activity">📈 Activity Report</option>
              <option value="audit">🔍 Audit Log Report</option>
            </select>
          </div>

          <div className="form-group">
            <label>Recipient Email</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="user@example.com"
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Sending...' : '📧 Send Report'}
          </button>
        </form>
      )}

      {/* Bulk Send */}
      {activeTab === 'bulk' && (
        <form className="report-form" onSubmit={handleSendBulk}>
          <div className="form-group">
            <label>Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="form-input"
            >
              <option value="overall">📊 Overall System Report</option>
              <option value="compliance">✓ Compliance Report</option>
              <option value="activity">📈 Activity Report</option>
              <option value="audit">🔍 Audit Log Report</option>
            </select>
          </div>

          <div className="form-group">
            <label>Recipient Emails (comma-separated)</label>
            <textarea
              value={bulkRecipients}
              onChange={(e) => setBulkRecipients(e.target.value)}
              placeholder="user1@example.com, user2@example.com, user3@example.com"
              className="form-textarea"
              rows="4"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Sending...' : '📬 Send to All'}
          </button>
        </form>
      )}

      {/* Schedule Reports */}
      {activeTab === 'schedule' && (
        <div className="schedule-container">
          <form className="report-form" onSubmit={handleScheduleReport}>
            <div className="form-group">
              <label>Schedule ID</label>
              <input
                type="text"
                value={scheduleId}
                onChange={(e) => setScheduleId(e.target.value)}
                placeholder="e.g., weekly-compliance-report"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="form-input"
              >
                <option value="overall">📊 Overall System Report</option>
                <option value="compliance">✓ Compliance Report</option>
                <option value="activity">📈 Activity Report</option>
                <option value="audit">🔍 Audit Log Report</option>
              </select>
            </div>

            <div className="form-group">
              <label>Frequency</label>
              <select
                value={scheduleFrequency}
                onChange={(e) => setScheduleFrequency(e.target.value)}
                className="form-input"
              >
                <option value="daily">📅 Daily (9 AM)</option>
                <option value="weekly">📅 Weekly (Monday 9 AM)</option>
                <option value="monthly">📅 Monthly (1st day 9 AM)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Recipients (comma-separated)</label>
              <textarea
                value={bulkRecipients}
                onChange={(e) => setBulkRecipients(e.target.value)}
                placeholder="user1@example.com, user2@example.com"
                className="form-textarea"
                rows="4"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Scheduling...' : '⏰ Schedule Report'}
            </button>
          </form>

          {/* Active Schedules */}
          <div className="schedules-list">
            <h3>📋 Active Schedules</h3>
            {scheduledReports.length === 0 ? (
              <p className="empty-message">No scheduled reports yet</p>
            ) : (
              <div className="schedules-grid">
                {scheduledReports.map((schedule) => (
                  <div key={schedule.scheduleId} className="schedule-card">
                    <h4>{schedule.scheduleId}</h4>
                    <p>Status: <span className="status-active">● Active</span></p>
                    <button
                      onClick={() => handleCancelSchedule(schedule.scheduleId)}
                      className="btn btn-danger btn-small"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
