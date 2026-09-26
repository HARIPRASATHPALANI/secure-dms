import React, { useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw, Filter, Calendar, User, Activity, AlertTriangle } from 'lucide-react';
import { securityService } from '../services/securityService';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await securityService.getAuditLogs();
      if (res.success) {
        setLogs(res.logs);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (!filterAction) return true;
    return l.action.includes(filterAction);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldAlert size={24} color="#f43f5e" /> COMPLIANCE & FORENSIC AUDIT TRAIL
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.2rem' }}>
            Immutable System Log Register • Security Threat Tracking
          </p>
        </div>

        <button onClick={fetchLogs} className="btn btn-secondary" style={{ padding: '0.5rem 0.9rem' }}>
          <RefreshCw size={16} /> Refresh Audit Trail
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={16} color="#60a5fa" /> Action Filter:
        </div>

        <button
          onClick={() => setFilterAction('')}
          className={`btn ${!filterAction ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
        >
          All Events
        </button>

        <button
          onClick={() => setFilterAction('REAUTH')}
          className={`btn ${filterAction === 'REAUTH' ? 'btn-danger' : 'btn-secondary'}`}
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
        >
          Security Re-Auth Alerts
        </button>

        <button
          onClick={() => setFilterAction('CASE')}
          className={`btn ${filterAction === 'CASE' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
        >
          Case Events
        </button>

        <button
          onClick={() => setFilterAction('DOC')}
          className={`btn ${filterAction === 'DOC' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
        >
          Document Uploads
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="glass-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action Type</th>
                <th>Entity</th>
                <th>User / Badge</th>
                <th>IP Address</th>
                <th>Event Telemetry Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                    Loading audit trail logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No audit records match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isSecurityAlert = log.action.includes('LOCKOUT') || log.action.includes('ALERT');
                  return (
                    <tr key={log.id} style={{ background: isSecurityAlert ? 'rgba(244, 63, 94, 0.05)' : 'transparent' }}>
                      <td style={{ fontSize: '0.8rem', color: '#9ca3af', fontFamily: 'JetBrains Mono' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge ${isSecurityAlert ? 'badge-rose' : log.action.includes('SUCCESS') ? 'badge-green' : 'badge-blue'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f3f4f6' }}>{log.entity}</span>
                      </td>
                      <td>
                        {log.username ? (
                          <div style={{ fontSize: '0.85rem' }}>
                            <div style={{ fontWeight: 700, color: '#ffffff' }}>{log.full_name || log.username}</div>
                            <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontFamily: 'JetBrains Mono' }}>[{log.role}]</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>SYSTEM / ANONYMOUS</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', fontFamily: 'JetBrains Mono', color: '#38bdf8' }}>
                        {log.ip_address}
                      </td>
                      <td style={{ fontSize: '0.8rem', fontFamily: 'JetBrains Mono', color: isSecurityAlert ? '#f87171' : '#d1d5db', maxWidth: '350px', wordBreak: 'break-word' }}>
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
