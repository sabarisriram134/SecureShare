/**
 * Compliance Context
 * Manages compliance state across the application
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import complianceService from '../services/compliance.service';

const ComplianceContext = createContext();

export const useCompliance = () => {
  const context = useContext(ComplianceContext);
  if (!context) {
    throw new Error('useCompliance must be used within ComplianceProvider');
  }
  return context;
};

export const ComplianceProvider = ({ children }) => {
  const [complianceStatus, setComplianceStatus] = useState(null);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const status = await complianceService.getStatus();
      setComplianceStatus(status);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching compliance status:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchViolations = async () => {
    try {
      const vios = await complianceService.getViolations();
      setViolations(vios);
    } catch (err) {
      console.error('Error fetching violations:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchViolations();
  }, []);

  const value = {
    complianceStatus,
    violations,
    loading,
    error,
    fetchStatus,
    fetchViolations
  };

  return (
    <ComplianceContext.Provider value={value}>
      {children}
    </ComplianceContext.Provider>
  );
};
