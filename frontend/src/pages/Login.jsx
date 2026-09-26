import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';

export const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg('');

    try {
      console.log('STEP 1: Starting Entra login'); const data = await authService.login(); console.log('STEP 2: Entra login completed', data);

      setLoading(false);

      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }

      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Microsoft Entra ID authentication failed.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(ellipse at center, #111827 0%, #030712 100%)'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            borderRadius: '16px',
            boxShadow: '0 0 30px rgba(37, 99, 235, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: '#ffffff'
          }}>
            <Shield size={34} />
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Casevault <span style={{ color: '#60a5fa' }}>DMS</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            Secure Digital Document Management Portal
          </p>
          <div style={{
            fontSize: '0.7rem',
            color: '#10b981',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginTop: '0.5rem',
            fontFamily: 'JetBrains Mono',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <CheckCircle2 size={12} /> Restricted Access • Salt Hashed Auth
          </div>
        </div>

        {/* Card Form */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          {errorMsg && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem',
              fontSize: '0.85rem',
              color: '#f87171',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={18} flexShrink={0} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{
              textAlign: 'center',
              marginBottom: '1rem',
              color: '#d1d5db',
              fontSize: '0.9rem'
            }}>
              Sign in using your Microsoft Entra ID account.
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.25rem', padding: '0.8rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating with Microsoft...' : 'Sign in with Microsoft Entra ID'}
            </button>
          </form>


        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
          Official Law Enforcement & Judicial Document Repository System v1.0
        </div>
      </div>
    </div>
  );
};
