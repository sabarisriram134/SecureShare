/**
 * Compliance Badge Component
 * Displays compliance status for files
 */

import React from 'react';
import './ComplianceBadge.css';

const ComplianceBadge = ({ status, standard, score }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant':
        return 'badge-success';
      case 'warning':
        return 'badge-warning';
      case 'non-compliant':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant':
        return '✓';
      case 'warning':
        return '⚠';
      case 'non-compliant':
        return '✗';
      default:
        return '?';
    }
  };

  return (
    <div className={`compliance-badge ${getStatusColor(status)}`}>
      <span className="badge-icon">{getStatusIcon(status)}</span>
      <div className="badge-content">
        <div className="badge-title">{standard}</div>
        {score !== undefined && <div className="badge-score">{score}%</div>}
      </div>
    </div>
  );
};

export default ComplianceBadge;
