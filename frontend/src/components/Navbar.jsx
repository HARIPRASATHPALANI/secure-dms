import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, FileText, PlusCircle, Search, ShieldAlert, LogOut, User } from 'lucide-react';
import { authService } from '../services/authService';

export const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = async () => {
    await authService.logout();
    if (onLogout) onLogout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1300px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand / Logo */}
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            padding: '0.5rem',
            borderRadius: '8px',
            boxShadow: '0 0 15px rgba(37, 99, 235, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.04em', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              Casevault <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.4)' }}>DMS</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Legal & Law Enforcement Portal
            </div>
          </div>
        </Link>

        {/* Navigation Items */}
        {user && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link to="/dashboard" className={`btn ${isActive('/dashboard') ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
              <Shield size={16} /> Dashboard
            </Link>
            <Link to="/view" className={`btn ${isActive('/view') ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
              <Search size={16} /> VIEW
            </Link>
            <Link to="/update" className={`btn ${isActive('/update') ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
              <FileText size={16} /> UPDATE
            </Link>
            <Link to="/new-case" className={`btn ${isActive('/new-case') ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
              <PlusCircle size={16} /> NEW CASE
            </Link>
            {(user.role === 'ADMIN' || user.role === 'AUDITOR') && (
              <Link to="/audit-logs" className={`btn ${isActive('/audit-logs') ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
                <ShieldAlert size={16} /> AUDIT TRAIL
              </Link>
            )}
          </nav>
        )}

        {/* User Info & Logout */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
                <User size={14} color="#60a5fa" /> {user.fullName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end', marginTop: '0.1rem' }}>
                <span className={`badge ${user.role === 'ADMIN' ? 'badge-rose' : 'badge-blue'}`}>
                  {user.role}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'JetBrains Mono' }}>
                  [{user.badgeNumber}]
                </span>
              </div>
            </div>

            <button
              onClick={handleLogoutClick}
              className="btn btn-secondary"
              title="Secure Logout"
              style={{ padding: '0.55rem 0.85rem', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
