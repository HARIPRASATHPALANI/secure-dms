import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileEdit, Upload, Shield, CheckCircle2, AlertCircle, FileText, ArrowLeft } from 'lucide-react';
import { caseService } from '../services/caseService';
import { documentService } from '../services/documentService';
import { ReAuthModal } from '../components/ReAuthModal';
import { getReAuthToken } from '../services/api';
import { ToastNotification } from '../components/ToastNotification';

export const UpdateModule = ({ user }) => {
  const navigate = useNavigate();

  // Guard state
  const [isReAuthenticated, setIsReAuthenticated] = useState(false);
  const [showReAuthModal, setShowReAuthModal] = useState(false);

  // Cases list for select dropdown
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [existingDocs, setExistingDocs] = useState([]);

  // Form Fields
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('FIR');
  const [version, setVersion] = useState('v1.0');
  const [description, setDescription] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Upload status
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Check if valid re-auth token already exists in current session
    const token = getReAuthToken('UPDATE');
    if (token) {
      setIsReAuthenticated(true);
      fetchCases();
    } else {
      setShowReAuthModal(true);
    }
  }, []);

  const fetchCases = async () => {
    try {
      const res = await caseService.getCases();
      if (res.success) {
        setCases(res.cases);
        if (res.cases.length > 0) {
          setSelectedCaseId(res.cases[0].id.toString());
          fetchExistingDocs(res.cases[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load cases list:', err);
    }
  };

  const fetchExistingDocs = async (caseId) => {
    try {
      const res = await documentService.getDocumentsByCase(caseId);
      if (res.success) {
        setExistingDocs(res.documents);
      }
    } catch (err) {
      console.error('Failed to fetch existing documents:', err);
    }
  };

  const handleCaseChange = (e) => {
    const val = e.target.value;
    setSelectedCaseId(val);
    if (val) {
      fetchExistingDocs(val);
    }
  };

  const handleReAuthSuccess = () => {
    setIsReAuthenticated(true);
    setShowReAuthModal(false);
    fetchCases();
    setToast({ type: 'success', message: 'Secondary authentication verified. Update access unlocked.' });
  };

  const handleReAuthClose = () => {
    if (!isReAuthenticated) {
      navigate('/dashboard');
    } else {
      setShowReAuthModal(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setToast({ type: 'error', message: 'File size exceeds maximum 15MB limit.' });
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCaseId || !title || !documentType || !selectedFile) {
      setToast({ type: 'error', message: 'Please complete all required fields and select a file.' });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('case_id', selectedCaseId);
      formData.append('title', title);
      formData.append('document_type', documentType);
      formData.append('version', version);
      formData.append('description', description);
      formData.append('remarks', remarks);
      formData.append('file', selectedFile);

      const res = await documentService.uploadDocument(formData);

      setUploading(false);
      if (res.success) {
        setToast({ type: 'success', message: 'Document uploaded and indexed into case file successfully.' });
        setTitle('');
        setDescription('');
        setRemarks('');
        setSelectedFile(null);
        fetchExistingDocs(selectedCaseId);
      }
    } catch (err) {
      setUploading(false);
      setToast({ type: 'error', message: err.message || 'Failed to upload document.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Toast Notification */}
      <ToastNotification
        type={toast?.type}
        message={toast?.message}
        onClose={() => setToast(null)}
      />

      {/* Re-Auth Guard Modal */}
      <ReAuthModal
        isOpen={showReAuthModal}
        moduleName="UPDATE"
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
            <FileEdit size={24} color="#f59e0b" /> MODULE 1 — UPDATE & UPLOAD DOCUMENT
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.2rem' }}>
            Index Evidentiary Document Files & Legal Metadata
          </p>
        </div>

        <span className="badge badge-amber" style={{ padding: '0.4rem 0.8rem' }}>
          <Shield size={14} /> Step-Up Re-Auth Verified
        </span>
      </div>

      {/* Main Grid: Upload Form + Existing Documents Sidebar */}
      {isReAuthenticated && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Left Column: Document Upload Form */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
              <Upload size={20} color="#f59e0b" /> Upload Evidentiary Document
            </h3>

            <form onSubmit={handleSubmit}>
              
              {/* Select Case */}
              <div className="form-group">
                <label className="form-label">Target Case *</label>
                <select
                  className="input-field"
                  value={selectedCaseId}
                  onChange={handleCaseChange}
                  required
                >
                  <option value="">-- Select Target Case --</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.case_id} — {c.case_name} ({c.case_type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Title & Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Document Title *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Seizure Memo Exhibit B"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Document Type *</label>
                  <select
                    className="input-field"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    required
                  >
                    <option value="FIR">FIR (First Information Report)</option>
                    <option value="Police Report">Police Report</option>
                    <option value="Witness Statement">Witness Statement</option>
                    <option value="Charge Sheet">Charge Sheet</option>
                    <option value="Court Filing">Court Filing</option>
                    <option value="Forensic Report">Forensic Report</option>
                    <option value="Judgment">Judgment / Order</option>
                    <option value="Legal Notice">Legal Notice</option>
                    <option value="Other">Other Case Evidence</option>
                  </select>
                </div>
              </div>

              {/* Version & File Upload */}
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Version</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="v1.0"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Document File (PDF, PNG, JPG, DOCX - Max 15MB) *</label>
                  <input
                    type="file"
                    className="input-field"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.docx"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Document Description</label>
                <textarea
                  className="input-field"
                  placeholder="Summary of evidentiary content contained in this document..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Remarks */}
              <div className="form-group">
                <label className="form-label">Legal Remarks / Confidentiality Classification</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. HIGHLY CONFIDENTIAL - Sealed under Court Order"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
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
                  disabled={uploading}
                  style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
                >
                  {uploading ? 'Encrypting & Indexing File...' : 'Upload & Save Document'}
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Existing Case Documents List */}
          <div className="glass-card">
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
              <FileText size={18} color="#f59e0b" /> Existing Case Documents ({existingDocs.length})
            </h4>

            {existingDocs.length === 0 ? (
              <div style={{ color: '#6b7280', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
                No documents uploaded for this case yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto' }}>
                {existingDocs.map((doc) => (
                  <div key={doc.id} style={{
                    background: 'rgba(255,255,255,0.02)',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.04)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: '#38bdf8' }}>
                        {doc.document_id}
                      </span>
                      <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>{doc.version || 'v1.0'}</span>
                    </div>

                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>
                      {doc.title}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Type: {doc.document_type}</span>
                      <span>By: {doc.uploader_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
