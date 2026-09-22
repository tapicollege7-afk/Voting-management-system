import React, { useState } from 'react';

export default function BallotAuditTool() {
  const [hashInput, setHashInput] = useState('');
  const [auditResult, setAuditResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAuditSearch = async (e) => {
    e.preventDefault();
    if (!hashInput.trim()) return;

    setLoading(true);
    setAuditResult(null);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/vote/audit/${encodeURIComponent(hashInput.trim())}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setAuditResult(data.audit);
      } else {
        setErrorMsg(data.message || "No sealed ballot matching this hash was found.");
      }
    } catch (err) {
      setErrorMsg("Error querying ballot audit server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="main-container">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '2.8rem', marginBottom: '0.5rem' }}>🔍</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Cryptographic Ballot Audit Tool</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
          Independently verify that your cast vote is accurately sealed and un-altered in the database using your Caesar Cipher or SHA-256 Receipt Hash.
        </p>
      </div>

      <div class="auth-box" style={{ maxWidth: '580px', margin: '0 auto 2rem auto' }}>
        <form onSubmit={handleAuditSearch}>
          <div class="form-group">
            <label class="form-label">Enter Caesar Cipher or SHA-256 Receipt Hash</label>
            <input
              class="form-input"
              type="text"
              placeholder="e.g. KHOOR_8899 or sha256:a4f8..."
              value={hashInput}
              onChange={e => setHashInput(e.target.value)}
              required
            />
          </div>
          <button class="btn btn-emerald" style={{ width: '100%' }} type="submit" disabled={loading}>
            {loading ? 'Verifying Hash...' : '🔒 Audit & Verify Ballot Integrity'}
          </button>
        </form>

        {errorMsg && (
          <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem' }}>
            ❌ {errorMsg}
          </div>
        )}

        {auditResult && (
          <div style={{ marginTop: '1.5rem', background: 'rgba(5, 150, 105, 0.08)', border: '2px solid #059669', borderRadius: '14px', padding: '1.25rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              <span>✅ VERIFIED & UN-ALTERED BALLOT</span>
            </div>

            <div style={{ display: 'grid', gap: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
              <div><strong>Receipt ID:</strong> <span style={{ fontFamily: 'monospace' }}>{auditResult.receipt_id}</span></div>
              <div><strong>Election Poll:</strong> {auditResult.election_title}</div>
              <div><strong>Masked Voter ID:</strong> {auditResult.voter_id_masked}</div>
              <div><strong>Confirmed Candidate:</strong> <span style={{ color: '#059669', fontWeight: 800 }}>{auditResult.candidate_name}</span></div>
              <div><strong>Timestamp:</strong> {new Date(auditResult.timestamp).toLocaleString()}</div>
              <div><strong>Caesar Cipher Hash:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{auditResult.caesar_encrypted_hash}</span></div>
              <div><strong>SHA-256 Seal:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>{auditResult.sha256_seal}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
