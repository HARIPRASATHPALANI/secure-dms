import React, { useEffect, useState } from 'react';
import { Search, Filter, Folder, FileText, Download, Eye, Calendar, User, ShieldCheck, Tag, RefreshCw } from 'lucide-react';
import { caseService } from '../services/caseService';
import { documentService } from '../services/documentService';
import { DocumentViewerModal } from '../components/DocumentViewerModal';

export const ViewModule = () => {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  
  // Search & Filters
  const [caseSearch, setCaseSearch] = useState('');
  const [caseTypeFilter, setCaseTypeFilter] = useState('');
  const [docSearch, setDocSearch] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('');

  // Selected document for modal
  const [viewingDocument, setViewingDocument] = useState(null);

  const fetchCases = async () => {
    setLoadingCases(true);
    try {
      const res = await caseService.getCases({
        search: caseSearch,
        case_type: caseTypeFilter
      });
      if (res.success) {
        setCases(res.cases);
        if (res.cases.length > 0 && !selectedCase) {
          handleSelectCase(res.cases[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch cases:', err);
    } finally {
      setLoadingCases(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [caseSearch, caseTypeFilter]);

  const handleSelectCase = async (caseObj) => {
    setSelectedCase(caseObj);
    setLoadingDocs(true);
    try {
      const res = await documentService.getDocumentsByCase(caseObj.id);
      if (res.success) {
        setDocuments(res.documents);
      }
    } catch (err) {
      console.error('Failed to fetch case documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(docSearch.toLowerCase()) ||
                          doc.document_id.toLowerCase().includes(docSearch.toLowerCase()) ||
                          (doc.description && doc.description.toLowerCase().includes(docSearch.toLowerCase()));
    const matchesType = !docTypeFilter || doc.document_type === docTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Search size={24} color="#22d3ee" /> MODULE 2 — VIEW REPOSITORY
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.2rem' }}>
            Centralized Case Files & Evidentiary Document Registry
          </p>
        </div>

        <button onClick={fetchCases} className="btn btn-secondary" style={{ padding: '0.5rem 0.9rem' }}>
          <RefreshCw size={16} /> Refresh Registry
        </button>
      </div>

      {/* Main Grid: Cases Sidebar & Case Documents View */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Cases Explorer */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Folder size={18} color="#22d3ee" /> Select Police Case ({cases.length})
          </div>

          {/* Search & Filter Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
                placeholder="Search by ID, title, location..."
                value={caseSearch}
                onChange={(e) => setCaseSearch(e.target.value)}
              />
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            </div>

            <select
              className="input-field"
              style={{ fontSize: '0.85rem' }}
              value={caseTypeFilter}
              onChange={(e) => setCaseTypeFilter(e.target.value)}
            >
              <option value="">All Case Types</option>
              <option value="Criminal">Criminal</option>
              <option value="Civil">Civil</option>
              <option value="Cybercrime">Cybercrime</option>
              <option value="Narcotics">Narcotics</option>
              <option value="Financial">Financial Fraud</option>
            </select>
          </div>

          {/* Case List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '550px', overflowY: 'auto' }}>
            {loadingCases ? (
              <div style={{ color: '#9ca3af', textAlign: 'center', padding: '1.5rem', fontSize: '0.85rem' }}>
                Loading case records...
              </div>
            ) : cases.length === 0 ? (
              <div style={{ color: '#6b7280', textAlign: 'center', padding: '1.5rem', fontSize: '0.85rem' }}>
                No matching cases found.
              </div>
            ) : (
              cases.map((c) => {
                const isSelected = selectedCase && selectedCase.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCase(c)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(34, 211, 238, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${isSelected ? 'rgba(34, 211, 238, 0.4)' : 'rgba(255, 255, 255, 0.05)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: '#38bdf8', fontWeight: 700 }}>
                        {c.case_id}
                      </span>
                      <span className={`badge ${c.priority === 'CRITICAL' ? 'badge-rose' : c.priority === 'HIGH' ? 'badge-amber' : 'badge-blue'}`}>
                        {c.priority}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.3rem' }}>
                      {c.case_name}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{c.case_type} • {c.document_count || 0} Docs</span>
                      <span className={`badge ${c.status === 'UNDER_INVESTIGATION' ? 'badge-amber' : 'badge-green'}`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column: Case Documents Detail */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {selectedCase ? (
            <>
              {/* Selected Case Header */}
              <div style={{ background: '#0b0f19', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', fontFamily: 'JetBrains Mono', color: '#38bdf8', fontWeight: 700 }}>
                    {selectedCase.case_id}
                  </span>
                  <span className="badge badge-amber">{selectedCase.status}</span>
                </div>

                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                  {selectedCase.case_name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                  {selectedCase.description}
                </p>

                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.78rem', color: '#6b7280', flexWrap: 'wrap' }}>
                  <div>Location: <strong style={{ color: '#d1d5db' }}>{selectedCase.location}</strong></div>
                  <div>Created By: <strong style={{ color: '#d1d5db' }}>{selectedCase.creator_name}</strong></div>
                  <div>Registered: <strong style={{ color: '#d1d5db' }}>{new Date(selectedCase.created_at).toLocaleDateString()}</strong></div>
                </div>
              </div>

              {/* Document Filters */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                  <input
                    type="text"
                    className="input-field"
                    style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
                    placeholder="Search documents by title or code..."
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                  />
                  <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                </div>

                <select
                  className="input-field"
                  style={{ width: '200px', fontSize: '0.85rem' }}
                  value={docTypeFilter}
                  onChange={(e) => setDocTypeFilter(e.target.value)}
                >
                  <option value="">All Document Types</option>
                  <option value="FIR">FIR</option>
                  <option value="Police Report">Police Report</option>
                  <option value="Witness Statement">Witness Statement</option>
                  <option value="Charge Sheet">Charge Sheet</option>
                  <option value="Court Filing">Court Filing</option>
                  <option value="Forensic Report">Forensic Report</option>
                  <option value="Judgment">Judgment</option>
                  <option value="Legal Notice">Legal Notice</option>
                </select>
              </div>

              {/* Documents Table */}
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Document Code / Title</th>
                      <th>Type</th>
                      <th>Uploaded By</th>
                      <th>Version</th>
                      <th>Upload Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingDocs ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                          Fetching evidentiary documents...
                        </td>
                      </tr>
                    ) : filteredDocuments.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                          No documents associated with this case yet. Use UPDATE module to attach files.
                        </td>
                      </tr>
                    ) : (
                      filteredDocuments.map((doc) => (
                        <tr key={doc.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: '#ffffff' }}>{doc.title}</div>
                            <div style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: '#38bdf8' }}>{doc.document_id}</div>
                          </td>
                          <td>
                            <span className="badge badge-blue">{doc.document_type}</span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.85rem', color: '#d1d5db' }}>{doc.uploader_name}</span>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: '#10b981' }}>{doc.version || 'v1.0'}</span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                            {new Date(doc.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => setViewingDocument(doc)}
                                className="btn btn-secondary"
                                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                                title="Inspect Metadata"
                              >
                                <Eye size={14} /> View
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await documentService.downloadDocument(doc.id);
                                  } catch (err) {
                                    console.error('Download failed:', err);
                                    alert(err.message || 'Failed to download document');
                                  }
                                }}
                                className="btn btn-primary"
                                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                                title="Download File"
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#6b7280' }}>
              Select a case from the sidebar to inspect associated legal documents.
            </div>
          )}
        </div>

      </div>

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={!!viewingDocument}
        document={viewingDocument}
        onClose={() => setViewingDocument(null)}
      />

    </div>
  );
};
