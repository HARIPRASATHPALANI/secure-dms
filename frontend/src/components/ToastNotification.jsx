import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastNotification = ({ type = 'success', message, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.85rem 1.25rem',
      borderRadius: '10px',
      background: isSuccess ? '#064e3b' : '#881337',
      border: `1px solid ${isSuccess ? '#10b981' : '#f43f5e'}`,
      color: '#ffffff',
      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
      fontSize: '0.9rem',
      fontWeight: 500,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      {isSuccess ? <CheckCircle2 size={20} color="#34d399" /> : <AlertCircle size={20} color="#f87171" />}
      <span>{message}</span>
      <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', marginLeft: '0.5rem' }}>
        <X size={16} />
      </button>
    </div>
  );
};
