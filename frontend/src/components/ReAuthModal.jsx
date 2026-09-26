import React, { useState } from 'react';
import { ShieldAlert, Lock, AlertTriangle, KeyRound, CheckCircle2, X } from 'lucide-react';
import { securityService } from '../services/securityService';

export const ReAuthModal = ({ isOpen, onClose, onSuccess, moduleName, user }) => {
  const [username, setUsername] = useState(user ? user.username : '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(2);
  const [isAlertTriggered, setIsAlertTriggered] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Please enter your password to re-authenticate.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const targetUser = username || (user ? user.username : '');
      const res = await securityService.verifyReAuth(targetUser, password, moduleName);

      if (res.success) {
        setLoading(false);
        setPassword('');
        setErrorMsg('');
        onSuccess(res.reauthToken);
      }
    } catch (err) {
      setLoading(false);
      setPassword('');

      if (err.message.includes('1 attempt remaining')) {
        setRemainingAttempts(1);
        setErrorMsg('Invalid credentials. 1 attempt remaining.');
      } else if (err.message.includes('SECURITY ALERT') || err.message.includes('Two failed') || remainingAttempts <= 1) {
        setRemainingAttempts(0);
        setIsAlertTriggered(true);
        setErrorMsg('SECURITY ALERT: Unauthorized access attempt recorded. Telemetry dispatched to Administrator via Telegram.');
      } else {
        setErrorMsg(err.message || 'Secondary authentication failed.');
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className={`modal-container ${isAlertTriggered ? 'alert-lockout' : ''}`}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              background: isAlertTriggered ? 'rgba(244, 63, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)',
              padding: '0.4rem',
              borderRadius: '8px',
              color: isAlertTriggered ? '#f43f5e' : '#60a5fa'
            }}>
              {isAlertTriggered ? <ShieldAlert size={22} /> : <Lock size={22} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                Secondary Authentication Required
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                Target Module: <span style={{ color: '#60a5fa', fontWeight: 700 }}>{moduleName}</span>
              </p>
            </div>
          </div>

          {!isAlertTriggered && (
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Security Notice / Attempt Counter */}
        {!isAlertTriggered && (
          <div style={{
            background: remainingAttempts === 1 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(59, 130, 246, 0.08)',
            border: `1px solid ${remainingAttempts === 1 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: remainingAttempts === 1 ? '#fbbf24' : '#93c5fd'
          }}>
            <AlertTriangle size={18} flexShrink={0} />
            <div>
              <strong>Security Protocol Notice:</strong> Accessing sensitive operational modules requires step-up credential verification. Maximum allowed attempts: <strong>2</strong>.
            </div>
          </div>
        )}

        {/* Critical Alert Box on Attempt 2 Failure */}
        {isAlertTriggered ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.2)',
              border: '2px solid #f43f5e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: '#f43f5e'
            }}>
              <ShieldAlert size={32} />
            </div>
            <h4 style={{ color: '#f43f5e', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              ACCESS DENIED & ALERT DISPATCHED
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#d1d5db', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Two consecutive failed authentication attempts detected. A <strong>Suspicious Activity Alert</strong> containing event telemetry has been automatically dispatched to the Administrator via <strong>Telegram Security Bot</strong>.
            </p>
            <div style={{
              background: '#04070d',
              border: '1px dashed rgba(244, 63, 94, 0.4)',
              borderRadius: '8px',
              padding: '0.75rem',
              fontSize: '0.75rem',
              fontFamily: 'JetBrains Mono',
              color: '#f87171',
              textAlign: 'left',
              marginBottom: '1.5rem'
            }}>
              <div>[TELEGRAM_ALERT_DISPATCHED]: TRUE</div>
              <div>[ATTEMPT_COUNT]: 2 / 2 EXCEEDED</div>
              <div>[TARGET_MODULE]: {moduleName}</div>
              <div>[STATUS]: INCIDENT LOGGED TO AUDIT TRAIL</div>
            </div>
            <button onClick={onClose} className="btn btn-danger" style={{ width: '100%' }}>
              Acknowledge Security Lock & Exit
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {errorMsg && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '0.85rem',
                color: '#f87171',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertTriangle size={18} flexShrink={0} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                required
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <KeyRound size={14} color="#f59e0b" />
                Remaining attempts: <strong style={{ color: remainingAttempts === 1 ? '#f43f5e' : '#10b981' }}>{remainingAttempts}</strong>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Verifying...' : 'Authenticate'}
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
