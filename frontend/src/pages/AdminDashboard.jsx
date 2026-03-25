import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api';
import gsap from 'gsap';
import '../styles/AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const contentRef = useRef(null);
  const tabsRef = useRef([]);
  
  const [activeTab, setActiveTab] = useState('reports');
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [requests, setRequests] = useState([]);
  const [requestStats, setRequestStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Report form state
  const [reportType, setReportType] = useState('overall');
  const [recipients, setRecipients] = useState('');
  const [scheduleId, setScheduleId] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState('daily');

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      const response = await api.get('/reports/schedules');
      setSchedules(response.data.scheduledReports || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  // Fetch report requests
  const fetchRequests = async () => {
    try {
      const response = await api.get('/reports/requests');
      setRequests(response.data.data || []);
      setRequestStats(response.data.statistics || {});
    } catch (error) {
      console.error('Error fetching report requests:', error);
    }
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'schedules') fetchSchedules();
    if (activeTab === 'requests') fetchRequests();
    
    // Animate admin cards on tab change
    if (contentRef.current) {
      const cards = contentRef.current.querySelectorAll('.admin-card');
      gsap.fromTo(cards, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'cubic-bezier(0.23, 1, 0.32, 1)' }
      );
    }
  }, [activeTab]);

  // Send bulk report
  const handleSendBulkReport = async (e) => {
    e.preventDefault();
    if (!recipients) {
      showMessage('Please enter recipient emails', 'error');
      return;
    }

    const recipientList = recipients
      .split(',')
      .map(email => email.trim())
      .filter(email => email);

    try {
      const response = await api.post('/reports/bulk', {
        reportType,
        recipients: recipientList
      });

      const successCount = response.data.results.filter(r => r.status === 'success').length;
      showMessage(`✅ Sent to ${successCount}/${recipientList.length} recipients!`, 'success');
      setRecipients('');
    } catch (error) {
      showMessage(`❌ Error: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  // Schedule report
  const handleScheduleReport = async (e) => {
    e.preventDefault();
    if (!scheduleId || !recipients) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    const recipientList = recipients
      .split(',')
      .map(email => email.trim())
      .filter(email => email);

    try {
      const response = await api.post('/reports/schedule', {
        scheduleId,
        reportType,
        recipients: recipientList,
        schedule: scheduleFrequency
      });

      showMessage('✅ Report scheduled successfully!', 'success');
      setScheduleId('');
      setRecipients('');
      fetchSchedules();
    } catch (error) {
      showMessage(`❌ Error: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  // Approve and send report request
  const handleApproveRequest = async (requestId) => {
    try {
      await api.post(`/reports/requests/${requestId}/approve`, {
        adminNotes: 'Report approved and sent'
      });
      showMessage('✅ Report sent successfully!', 'success');
      fetchRequests();
    } catch (error) {
      showMessage(`❌ Error: ${error.message}`, 'error');
    }
  };

  // Reject report request
  const handleRejectRequest = async (requestId) => {
    try {
      await api.post(`/reports/requests/${requestId}/reject`, {
        adminNotes: 'Request rejected by admin'
      });
      showMessage('✅ Request rejected!', 'success');
      fetchRequests();
    } catch (error) {
      showMessage(`❌ Error: ${error.message}`, 'error');
    }
  };

  // Delete schedule
  const handleDeleteSchedule = async (id) => {
    if (window.confirm('Are you sure you want to cancel this schedule?')) {
      try {
        await api.delete(`/reports/schedules/${id}`);
        showMessage('✅ Schedule cancelled!', 'success');
        fetchSchedules();
      } catch (error) {
        showMessage(`❌ Error: ${error.message}`, 'error');
      }
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        showMessage('✅ User deleted!', 'success');
        fetchUsers();
      } catch (error) {
        showMessage(`❌ Error: ${error.message}`, 'error');
      }
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <div>
            <h1>👑 Admin Control Panel</h1>
            <p>Manage users, reports, scheduling, and system settings</p>
          </div>
          <button
            className="btn btn-danger btn-logout"
            onClick={handleLogout}
            title="Exit admin panel"
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📧 Send Reports
        </button>
        <button
          className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          ⏰ Schedule Reports
        </button>
        <button
          className={`tab-btn ${activeTab === 'schedules' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedules')}
        >
          📋 Active Schedules
        </button>
        <button
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          📬 User Requests ({requestStats.pending || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      {message && (
        <div className={`admin-message ${messageType}`}>
          {message}
        </div>
      )}

      <div ref={contentRef}>
        {/* Send Reports Tab */}
        {activeTab === 'reports' && (
          <div className="admin-content">
          <div className="admin-card">
            <h2>📧 Send Bulk Reports</h2>
            <form onSubmit={handleSendBulkReport}>
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
                <label>Recipients (comma-separated emails)</label>
                <textarea
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="user1@example.com, user2@example.com, admin@example.com"
                  className="form-textarea"
                  rows="4"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                📧 Send Reports Now
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Reports Tab */}
      {activeTab === 'schedule' && (
        <div className="admin-content">
          <div className="admin-card">
            <h2>⏰ Schedule Automated Reports</h2>
            <form onSubmit={handleScheduleReport}>
              <div className="form-row">
                <div className="form-group">
                  <label>Schedule ID</label>
                  <input
                    type="text"
                    value={scheduleId}
                    onChange={(e) => setScheduleId(e.target.value)}
                    placeholder="e.g., daily-overall-report"
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
              </div>

              <div className="form-group">
                <label>Recipients (comma-separated emails)</label>
                <textarea
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="admin@example.com, manager@example.com"
                  className="form-textarea"
                  rows="4"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                ⏰ Schedule Report
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Active Schedules Tab */}
      {activeTab === 'schedules' && (
        <div className="admin-content">
          <div className="admin-card">
            <h2>📋 Active Schedules</h2>
            {schedules.length === 0 ? (
              <p className="empty-state">No active schedules</p>
            ) : (
              <div className="schedules-table">
                {schedules.map((schedule) => (
                  <div key={schedule.scheduleId} className="schedule-row">
                    <div className="schedule-info">
                      <h4>{schedule.scheduleId}</h4>
                      <p>Status: <span className="status-active">● Active</span></p>
                    </div>
                    <button
                      onClick={() => handleDeleteSchedule(schedule.scheduleId)}
                      className="btn btn-danger btn-small"
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

      {/* User Requests Tab */}
      {activeTab === 'requests' && (
        <div className="admin-content">
          <div className="admin-card">
            <h2>📬 User Report Requests</h2>
            
            {/* Statistics */}
            <div className="request-stats">
              <div className="stat-box">
                <div className="stat-number">{requestStats.total || 0}</div>
                <div className="stat-label">Total Requests</div>
              </div>
              <div className="stat-box">
                <div className="stat-number" style={{ color: '#ff9800' }}>{requestStats.pending || 0}</div>
                <div className="stat-label">⏳ Pending</div>
              </div>
              <div className="stat-box">
                <div className="stat-number" style={{ color: '#4caf50' }}>{requestStats.approved || 0}</div>
                <div className="stat-label">✅ Approved</div>
              </div>
              <div className="stat-box">
                <div className="stat-number" style={{ color: '#2196f3' }}>{requestStats.sent || 0}</div>
                <div className="stat-label">📨 Sent</div>
              </div>
              <div className="stat-box">
                <div className="stat-number" style={{ color: '#f44336' }}>{requestStats.rejected || 0}</div>
                <div className="stat-label">❌ Rejected</div>
              </div>
            </div>

            {/* Requests Table */}
            {requests.length === 0 ? (
              <p className="empty-state">No report requests at this time</p>
            ) : (
              <div className="requests-table-container">
                <table className="requests-table">
                  <thead>
                    <tr>
                      <th className="row-number">#</th>
                      <th>User Email</th>
                      <th>Report Type</th>
                      <th>Status</th>
                      <th>Requested Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request, index) => (
                      <tr key={request.id} className={`request-row status-${request.status}`}>
                        <td className="row-number-cell">{index + 1}</td>
                        <td className="email-cell">{request.email}</td>
                        <td className="type-cell">
                          {request.reportType === 'compliance' && '📋 Compliance'}
                          {request.reportType === 'activity' && '📊 Activity'}
                          {request.reportType === 'audit' && '🔍 Audit'}
                          {request.reportType === 'overall' && '📈 Overall'}
                        </td>
                        <td className="status-cell">
                          {request.status === 'pending' && <span className="status-badge pending">⏳ Pending</span>}
                          {request.status === 'approved' && <span className="status-badge approved">✅ Approved</span>}
                          {request.status === 'sent' && <span className="status-badge sent">📨 Sent</span>}
                          {request.status === 'rejected' && <span className="status-badge rejected">❌ Rejected</span>}
                        </td>
                        <td className="date-cell">
                          {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="actions-cell">
                          {request.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApproveRequest(request.id)}
                                className="btn btn-success btn-small"
                                title="Approve and send report"
                              >
                                ✅ Approve
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                className="btn btn-danger btn-small"
                                title="Reject request"
                              >
                                ❌ Reject
                              </button>
                            </>
                          ) : (
                            <span className="status-completed">
                              {request.status === 'sent' && '✓ Sent'}
                              {request.status === 'approved' && '◐ Approved'}
                              {request.status === 'rejected' && '✗ Rejected'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-content">
          <div className="admin-card">
            <h2>👥 User Management</h2>
            {users.length === 0 ? (
              <p className="empty-state">No users found</p>
            ) : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Files</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={user.emailVerified ? 'status-verified' : 'status-unverified'}>
                            {user.emailVerified ? '✅ Verified' : '❌ Unverified'}
                          </span>
                        </td>
                        <td>{user.files ? user.files.length : 0}</td>
                        <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="btn btn-danger btn-small"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="admin-content">
          <div className="admin-card">
            <h2>⚙️ System Settings</h2>
            <div className="settings-grid">
              <div className="setting-item">
                <h3>📧 Email Configuration</h3>
                <p>Gmail Service</p>
                <span className="status-active">● Configured</span>
              </div>
              <div className="setting-item">
                <h3>🔐 Security</h3>
                <p>User Authentication</p>
                <span className="status-active">● Enabled</span>
              </div>
              <div className="setting-item">
                <h3>📊 Reports</h3>
                <p>Automated Scheduling</p>
                <span className="status-active">● Enabled</span>
              </div>
              <div className="setting-item">
                <h3>💾 Storage</h3>
                <p>File Management</p>
                <span className="status-active">● Enabled</span>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
