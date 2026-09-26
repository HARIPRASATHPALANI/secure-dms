import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderPlus, Shield, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { caseService } from '../services/caseService';
import { ReAuthModal } from '../components/ReAuthModal';
import { getReAuthToken } from '../services/api';
import { ToastNotification } from '../components/ToastNotification';

export const NewCaseModule = ({ user }) => {
  const navigate = useNavigate();

  // Guard state
  const [isReAuthenticated, setIsReAuthenticated] = useState(false);
  const [showReAuthModal, setShowReAuthModal] = useState(false);

  // Form Fields
  const [caseId, setCaseId] = useState('');
  const [caseName, setCaseName] = useState('');
  const [caseType, setCaseType] = useState('Criminal');
  const [status, setStatus] = useState('UNDER_INVESTIGATION');
  const [priority, setPriority] = useState('HIGH');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Check if valid re-auth token already exists in current session
    const token = getReAuthToken('NEW_CASE');
    if (token) {
      setIsReAuthenticated(true);
      generateNewCaseId();
    } else {
      setShowReAuthModal(true);
    }
  }, []);

  const generateNewCaseId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    setCaseId(`CASE-${year}-${random}`);
  };

  const handleReAuthSuccess = () => {
    setIsReAuthenticated(true);
    setShowReAuthModal(false);
    generateNewCaseId();
    setToast({ type: 'success', message: 'Secondary authentication verified. Case registration unlocked.' });
  };

  const handleReAuthClose = () => {
    if (!isReAuthenticated) {
      navigate('/dashboard');
    } else {
      setShowReAuthModal(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caseId || !caseName || !caseType || !location) {
      setToast({ type: 'error', message: 'Please complete all required fields.' });
      return;
    }

    setLoading(true);

    try {
      const res = await caseService.createCase({
        case_id: caseId,
        case_name: caseName,
        case_type: caseType,
        status,
        priority,
        location,
        description
      });

      setLoading(false);
      if (res.success) {
        setToast({ type: 'success', message: `Case '${res.case.case_id}' registered successfully!` });
        setTimeout(() => {
          navigate('/view');
        }, 1200);
      }
    } catch (err) {
      setLoading(false);
      setToast({ type: 'error', message: err.message || 'Failed to register case.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      
      {/* Toast Notification */}
      <ToastNotification
        type={toast?.type}
        message={toast?.message}
        onClose={() => setToast(null)}
      />

      {/* Re-Auth Guard Modal */}
      <ReAuthModal
        isOpen={showReAuthModal}
        moduleName="NEW_CASE"
        user={user}
        onClose={handleReAuthClose}
        onSuccess={handleReAuthSuccess}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FolderPlus size={24} color="#34d399" /> MODULE 3 — REGISTER NEW CASE
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.2rem' }}>
            Initiate Official Police & Legal Investigation Registry Entry
          </p>
        </div>

        <span className="badge badge-green" style={{ padding: '0.4rem 0.8rem' }}>
          <Shield size={14} /> Step-Up Re-Auth Verified
        </span>
      </div>

      {/* Registration Form */}
      {isReAuthenticated && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            
            {/* Case ID & Auto Generator */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'end' }} className="form-group">
              <div>
                <label className="form-label">Case ID / Reference Code *</label>
                <input
                  type="text"
                  className="input-field font-mono"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  placeholder="CASE-YYYY-XXXX"
                  required
                />
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={generateNewCaseId}
                title="Generate unique Case ID"
                style={{ padding: '0.75rem 1rem' }}
              >
                <RefreshCw size={16} /> Auto ID
              </button>
            </div>

            {/* Case Name */}
            <div className="form-group">
              <label className="form-label">Case Title / Name *</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. State vs. Cyber Security Breach at Central Power Grid"
                value={caseName}
                onChange={(e) => setCaseName(e.target.value)}
                required
              />
            </div>

            {/* Case Type & Priority */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Case Classification *</label>
                <select
                  className="input-field"
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value)}
                  required
                >
                  <option value="Criminal">Criminal</option>
                  <option value="Civil">Civil</option>
                  <option value="Cybercrime">Cybercrime</option>
                  <option value="Narcotics">Narcotics Control</option>
                  <option value="Financial">Financial Fraud</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority Rating *</label>
                <select
                  className="input-field"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  required
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            {/* Status & Location */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Initial Case Status *</label>
                <select
                  className="input-field"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                >
                  <option value="OPEN">OPEN</option>
                  <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
                  <option value="IN_COURT">IN COURT / SUB-JUDICE</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Jurisdiction / Location *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Special Crime Branch, Zone 4"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Case Overview & Initial Incident Details</label>
              <textarea
                className="input-field"
                placeholder="Comprehensive summary of allegations, incident reports, and primary suspect background..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                {loading ? 'Registering Case Entry...' : 'Submit & Register Case'}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
