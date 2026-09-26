import React from 'react';
import { FileText, Download, X, Calendar, User, ShieldCheck, Tag, Info, Database } from 'lucide-react';
import { documentService } from '../services/documentService';

export const DocumentViewerModal = ({ document, isOpen, onClose }) => {
  if (!isOpen || !document) return null;

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '750px', width: '90%' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.6rem', borderRadius: '10px', color: '#60a5fa' }}>
              <FileText size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-blue">{document.document_type}</span>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontFamily: 'JetBrains Mono', background: 'rgba(16,185,129,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  {document.version || 'v1.0'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>
                {document.title}
              </h3>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Metadata Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem', background: '#0b0f19', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Tag size={12} /> Document Code
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#f3f4f6' }}>
              {document.document_id}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <User size={12} /> Uploaded By
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f3f4f6' }}>
              {document.uploader_name || 'Authorized Officer'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={12} /> Upload Date
            </div>
            <div style={{ fontSize: '0.9rem', color: '#f3f4f6' }}>
              {new Date(document.created_at).toLocaleString()}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Database size={12} /> File Size & Type
            </div>
            <div style={{ fontSize: '0.9rem', color: '#f3f4f6' }}>
              {formatBytes(document.file_size)} ({document.original_name.split('.').pop().toUpperCase()})
            </div>
          </div>
        </div>

        {/* Description & Remarks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Info size={12} /> Description
            </label>
            <div style={{ fontSize: '0.9rem', color: '#d1d5db', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              {document.description || 'No detailed description recorded.'}
            </div>
          </div>

          {document.remarks && (
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f59e0b' }}>
                <ShieldCheck size={12} /> Confidential Legal Remarks
              </label>
              <div style={{ fontSize: '0.9rem', color: '#fbbf24', background: 'rgba(245,158,11,0.08)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)' }}>
                {document.remarks}
              </div>
            </div>
          )}
        </div>

        {/* Evidentiary Integrity Seal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#10b981' }}>
            <ShieldCheck size={16} /> Verifiable Evidentiary Record • Access Logged
          </div>

          <button
            onClick={async () => {
              try {
                await documentService.downloadDocument(document.id);
              } catch (err) {
                console.error('Download failed:', err);
                alert(err.message || 'Failed to download document');
              }
            }}
            className="btn btn-primary"
          >
            <Download size={16} /> Download File
          </button>
        </div>

      </div>
    </div>
  );
};
