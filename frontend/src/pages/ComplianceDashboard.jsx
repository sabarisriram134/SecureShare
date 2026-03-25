/**
 * Compliance Dashboard Page
 * Displays compliance status and reports
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import complianceService from '../services/compliance.service';
import ComplianceBadge from '../components/ComplianceBadge';

const ComplianceDashboard = () => {
  const { user } = useAuth();
  const [complianceStatus, setComplianceStatus] = useState(null);
  const [reports, setReports] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      const [status, reps, vios] = await Promise.all([
        complianceService.getStatus(),
        complianceService.getReports(),
        complianceService.getViolations()
      ]);

      setComplianceStatus(status);
      setReports(reps);
      setViolations(vios);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching compliance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (standard) => {
    try {
      const report = await complianceService.generateReport(standard);
      setReports(prev => [...prev, report]);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading compliance dashboard...</div>;

  return (
    <div className="compliance-dashboard">
      <h1>Compliance Dashboard</h1>

      {error && <div className="error-alert">{error}</div>}

      {/* Compliance Status Summary */}
      <section className="status-section">
        <h2>Compliance Status</h2>
        <div className="status-grid">
          <ComplianceBadge status="compliant" standard="GDPR" score={95} />
          <ComplianceBadge status="compliant" standard="HIPAA" score={92} />
          <ComplianceBadge status="warning" standard="SOC2" score={85} />
        </div>
      </section>

      {/* Recent Reports */}
      <section className="reports-section">
        <h2>Recent Reports</h2>
        <div className="reports-list">
          {reports.length === 0 ? (
            <p>No reports generated yet</p>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="report-card">
                <h3>{report.standard}</h3>
                <p>Generated: {new Date(report.generatedDate).toLocaleDateString()}</p>
                <p>Score: {report.summary.complianceScore}%</p>
                <button onClick={() => window.location.href = `/report/${report.id}`}>
                  View Details
                </button>
              </div>
            ))
          )}
        </div>
        <div className="generate-report">
          <button onClick={() => handleGenerateReport('GDPR')}>Generate GDPR Report</button>
          <button onClick={() => handleGenerateReport('HIPAA')}>Generate HIPAA Report</button>
          <button onClick={() => handleGenerateReport('SOC2')}>Generate SOC2 Report</button>
        </div>
      </section>

      {/* Violations */}
      <section className="violations-section">
        <h2>Recent Violations</h2>
        <div className="violations-list">
          {violations.length === 0 ? (
            <p>No violations detected</p>
          ) : (
            violations.map((violation) => (
              <div key={violation.id} className={`violation-item severity-${violation.severity}`}>
                <h4>{violation.ruleName}</h4>
                <p>{violation.description}</p>
                <span className="severity-badge">{violation.severity}</span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Audit Trail */}
      <section className="audit-section">
        <h2>Audit Trail</h2>
        <button onClick={() => window.location.href = '/audit-log'}>View Full Audit Log</button>
      </section>
    </div>
  );
};

export default ComplianceDashboard;
