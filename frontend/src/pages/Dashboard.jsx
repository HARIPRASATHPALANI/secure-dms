import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileEdit, FolderPlus, Shield, FileText, AlertTriangle, Activity, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { caseService } from '../services/caseService';

export const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalCases: 0,
    totalDocuments: 0,
    recentCases: [],
    recentAlerts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await caseService.getMetrics();
        if (res.success) {
          setMetrics(res.metrics);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.9) 100%)',
        borderLeft: '4px solid #3b82f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
            Law Enforcement Document Management Control Center
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
            Welcome back, {user ? user.fullName : 'Officer'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginTop: '0.2rem' }}>
            Badge ID: <span style={{ color: '#f3f4f6', fontFamily: 'JetBrains Mono' }}>{user ? user.badgeNumber : 'N/A'}</span> • Access Role: <span className="badge badge-blue">{user ? user.role : 'USER'}</span>
          </p>
        </div>

        {/* Top Summary Stats */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>Active Cases</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>{loading ? '...' : metrics.totalCases}</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>Evidentiary Docs</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>{loading ? '...' : metrics.totalDocuments}</div>
          </div>
        </div>
      </div>

      {/* Core 3 Major Operational Modules */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={20} color="#60a5fa" /> Core Document Operations
        </h3>

        <div className="modules-grid">
          
          {/* 1. UPDATE Module Card */}
          <div className="module-card card-update" onClick={() => navigate('/update')}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '0.65rem', borderRadius: '12px', color: '#fbbf24' }}>
                  <FileEdit size={28} />
                </div>
                <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                  🔒 Re-Auth Protected (Max 2 Attempts)
                </span>
              </div>
              <h3 style={{ color: '#ffffff' }}>1. UPDATE</h3>
              <p style={{ marginTop: '0.4rem', lineHeight: 1.5 }}>
                Upload new evidentiary documents, attach metadata (FIR, Charge sheet, Witness statement), update versioning & legal remarks.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem', marginTop: '1.5rem' }}>
              Access Update Module <ArrowRight size={16} />
            </div>
          </div>

          {/* 2. VIEW Module Card */}
          <div className="module-card card-view" onClick={() => navigate('/view')}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '0.65rem', borderRadius: '12px', color: '#22d3ee' }}>
                  <Search size={28} />
                </div>
                <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                  🔓 Direct Access
                </span>
              </div>
              <h3 style={{ color: '#ffffff' }}>2. VIEW</h3>
              <p style={{ marginTop: '0.4rem', lineHeight: 1.5 }}>
                Browse existing police cases, search by Case ID or name, filter documents, inspect metadata, and download files.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#22d3ee', fontWeight: 700, fontSize: '0.9rem', marginTop: '1.5rem' }}>
              Access View Module <ArrowRight size={16} />
            </div>
          </div>

          {/* 3. NEW CASE Module Card */}
          <div className="module-card card-newcase" onClick={() => navigate('/new-case')}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.65rem', borderRadius: '12px', color: '#34d399' }}>
                  <FolderPlus size={28} />
                </div>
                <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                  🔒 Re-Auth Protected (Max 2 Attempts)
                </span>
              </div>
              <h3 style={{ color: '#ffffff' }}>3. NEW CASE</h3>
              <p style={{ marginTop: '0.4rem', lineHeight: 1.5 }}>
                Register a new investigation case into the centralized repository, assign priority levels, type classification & jurisdiction.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 700, fontSize: '0.9rem', marginTop: '1.5rem' }}>
              Access New Case Module <ArrowRight size={16} />
            </div>
          </div>

        </div>
      </div>

      {/* Recent Activity & Security Telemetry */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Recent Cases Section */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="#60a5fa" /> Recent Active Cases
            </h4>
            <button onClick={() => navigate('/view')} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
              View All
            </button>
          </div>

          {metrics.recentCases && metrics.recentCases.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {metrics.recentCases.map((c) => (
                <div key={c.id} style={{
                  background: 'rgba(255,255,255,0.02)',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f3f4f6' }}>{c.case_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'JetBrains Mono' }}>{c.case_id} • {c.location}</div>
                  </div>
                  <span className={`badge ${c.status === 'UNDER_INVESTIGATION' ? 'badge-amber' : c.status === 'IN_COURT' ? 'badge-rose' : 'badge-green'}`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#6b7280', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
              No active cases loaded.
            </div>
          )}
        </div>

        {/* Security Alert Log Telemetry */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="#f43f5e" /> Telegram Security Telemetry
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#f43f5e', fontFamily: 'JetBrains Mono' }}>
              Live Telemetry
            </span>
          </div>

          {metrics.recentAlerts && metrics.recentAlerts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {metrics.recentAlerts.map((a) => (
                <div key={a.id} style={{
                  background: 'rgba(244, 63, 94, 0.08)',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(244, 63, 94, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <AlertTriangle size={14} /> Unauthorized Attempt ({a.module_name})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#d1d5db', fontFamily: 'JetBrains Mono' }}>
                      User: {a.username} • Attempt Count: {a.attempt_count}
                    </div>
                  </div>
                  <span className={`badge ${a.telegram_sent ? 'badge-green' : 'badge-amber'}`}>
                    {a.telegram_sent ? 'Telegram Alerted' : 'Logged'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#10b981', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} /> Zero suspicious login threats detected. System secure.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
