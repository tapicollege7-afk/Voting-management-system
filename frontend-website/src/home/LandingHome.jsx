import React, { useState, useEffect } from 'react';

export default function LandingHome({ navigateTo }) {
  const [elections, setElections] = useState([]);
  const [stats, setStats] = useState({
    active_elections: 1,
    total_candidates: 1,
    total_voters: 1,
    total_votes_cast: 2
  });
  const [loading, setLoading] = useState(true);
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    fetchHomeData();
    const timer = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchHomeData = async () => {
    try {
      const [elecRes, statsRes] = await Promise.all([
        fetch('/api/elections').catch(() => null),
        fetch('/api/admin/stats').catch(() => null)
      ]);

      if (elecRes && elecRes.ok) {
        const elecData = await elecRes.json();
        if (elecData.success && Array.isArray(elecData.elections)) {
          setElections(elecData.elections);
        }
      }

      if (statsRes && statsRes.ok) {
        const sData = await statsRes.json();
        if (sData.success && sData.stats) {
          setStats(sData.stats);
        }
      }
    } catch (e) {
      console.warn('Home telemetry notice:', e);
    } finally {
      setLoading(false);
    }
  };

  const portalCards = [
    {
      id: 'voter',
      icon: '🗳️',
      title: 'Voter Portal',
      subtitle: 'Student & Faculty E-Voting',
      badge: 'Single-Vote Enforced',
      badgeColor: '#10b981',
      description: 'Authenticate with your official Voter ID, view live authorized ballots, and securely cast your cryptographically sealed vote.',
      features: [
        'Deterministic SHA-256 ballot seal',
        'Cryptographic Caesar Cipher hash receipt',
        'Strict 1-Voter-1-Vote concurrency lock'
      ],
      actionText: 'Enter Voter Booth →',
      actionStyle: {
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: '#ffffff',
        boxShadow: '0 4px 15px rgba(16,185,129,0.35)'
      },
      cardBorder: 'rgba(16,185,129,0.3)',
      accentGradient: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(6,182,212,0.08))'
    },
    {
      id: 'candidate',
      icon: '👤',
      title: 'Candidate Portal',
      subtitle: 'Nomination & Campaign Hub',
      badge: 'Admin Verified',
      badgeColor: '#06b6d4',
      description: 'Submit your candidacy nomination, draft your official manifesto, and access real-time campaign analytics once approved by the commission.',
      features: [
        'Registration ticket sent directly to email',
        'Commission approval workflow before ballot entry',
        'Real-time voter standings & rank analytics'
      ],
      actionText: 'Enter Candidate Portal →',
      actionStyle: {
        background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
        color: '#ffffff',
        boxShadow: '0 4px 15px rgba(6,182,212,0.35)'
      },
      cardBorder: 'rgba(6,182,212,0.3)',
      accentGradient: 'linear-gradient(135deg, rgba(6,182,212,0.18), rgba(99,102,241,0.08))'
    },
    {
      id: 'admin',
      icon: '🛡️',
      title: 'Admin Console',
      subtitle: 'Election Commission Oversight',
      badge: 'Authorized Personnel Only',
      badgeColor: '#f59e0b',
      description: 'Create and schedule polls, review and approve pending candidate nominations, manage voter directories, and export certified results.',
      features: [
        'Candidate application approval & denial controls',
        'Live percentage breakdown & automated winner calculation',
        'Instant CSV reports & database integrity telemetry'
      ],
      actionText: 'Open Admin Console →',
      actionStyle: {
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        color: '#ffffff',
        boxShadow: '0 4px 15px rgba(245,158,11,0.35)'
      },
      cardBorder: 'rgba(245,158,11,0.3)',
      accentGradient: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(239,68,68,0.08))'
    },
    {
      id: 'audit',
      icon: '🔍',
      title: 'Ballot Audit Tool',
      subtitle: 'Public Cryptographic Ledger',
      badge: 'Public & Tamper-Proof',
      badgeColor: '#6366f1',
      description: 'Independently inspect and verify that any cast ballot was recorded without alterations using its cryptographic seal, preserving voter anonymity.',
      features: [
        'Verify SHA-256 seal & Caesar cipher hash',
        'Zero-PII leakage (Voter ID strictly masked)',
        'Bit-flip tamper detection & verification'
      ],
      actionText: 'Audit Sealed Ballot →',
      actionStyle: {
        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        color: '#ffffff',
        boxShadow: '0 4px 15px rgba(99,102,241,0.35)'
      },
      cardBorder: 'rgba(99,102,241,0.3)',
      accentGradient: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(168,85,247,0.08))'
    }
  ];

  return (
    <div className="main-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>
      
      {/* ─── Hero Section ────────────────────────────────────────────────────── */}
      <div style={{
        textAlign: 'center',
        padding: '3rem 1.5rem 2.5rem',
        borderRadius: '24px',
        background: 'radial-gradient(ellipse at top, rgba(99,102,241,0.15) 0%, rgba(6,182,212,0.05) 50%, transparent 80%)',
        marginBottom: '2.5rem',
        position: 'relative'
      }}>
        {/* Verification badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(16,185,129,0.12)',
          border: '1px solid rgba(16,185,129,0.35)',
          color: '#10b981',
          padding: '6px 16px',
          borderRadius: '30px',
          fontSize: '0.82rem',
          fontWeight: 800,
          marginBottom: '1.25rem',
          letterSpacing: '0.5px'
        }}>
          <span style={{ fontSize: '0.9rem' }}>🛡️</span>
          <span>CRYPTOGRAPHICALLY SEALED ONLINE E-VOTING SYSTEM</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
          fontWeight: 900,
          lineHeight: 1.15,
          marginBottom: '1.25rem',
          background: 'linear-gradient(135deg, #ffffff 30%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px'
        }}>
          Empowering Democratic Integrity <br />
          <span style={{
            background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Secure, Transparent & Verifiable
          </span>
        </h1>

        <p style={{
          color: 'var(--text-muted)',
          fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
          maxWidth: '720px',
          margin: '0 auto 2rem',
          lineHeight: 1.6
        }}>
          VotePulse provides next-generation campus and organizational elections with end-to-end ballot sealing, administrator-supervised candidate verification, and independent public auditability.
        </p>

        {/* Hero Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn"
            onClick={() => navigateTo('voter')}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.95rem',
              padding: '0.85rem 1.8rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
              cursor: 'pointer'
            }}
          >
            <span>🗳️ Enter Voter Booth</span>
            <span>&rarr;</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigateTo('candidate')}
            style={{
              padding: '0.85rem 1.6rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>👤 Candidate Portal</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigateTo('audit')}
            style={{
              padding: '0.85rem 1.6rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🔍 Audit Ballot</span>
          </button>
        </div>
      </div>

      {/* ─── Platform Live Telemetry Counters ─────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '3rem'
      }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: '18px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(99,102,241,0.1))',
            border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem'
          }}>🗳️</div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{stats.active_elections ?? 1}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase' }}>Active Polls</div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: '18px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.1))',
            border: '1px solid rgba(16,185,129,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem'
          }}>👤</div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>{stats.total_candidates ?? 1}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase' }}>Verified Candidates</div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: '18px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(6,182,212,0.1))',
            border: '1px solid rgba(6,182,212,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem'
          }}>👥</div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#06b6d4', lineHeight: 1 }}>{stats.total_voters ?? 1}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase' }}>Registered Voters</div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: '18px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.1))',
            border: '1px solid rgba(245,158,11,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem'
          }}>🏆</div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>{stats.total_votes_cast ?? 2}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase' }}>Ballots Sealed</div>
          </div>
        </div>
      </div>

      {/* ─── Role Gateway Selection Cards ─────────────────────────────────────── */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            Select Your Electoral Gateway
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Choose your authorized role below to proceed into the designated portal.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '1.5rem'
        }}>
          {portalCards.map(card => (
            <div
              key={card.id}
              style={{
                background: 'var(--bg-card)',
                border: `1.5px solid ${card.cardBorder}`,
                borderRadius: '22px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 16px 36px rgba(0,0,0,0.35)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              {/* Card top accent line */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, height: '6px',
                background: card.badgeColor
              }} />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{
                    width: '54px', height: '54px', borderRadius: '16px',
                    background: card.accentGradient,
                    border: `1px solid ${card.cardBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.8rem'
                  }}>
                    {card.icon}
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: '12px',
                    fontSize: '0.72rem', fontWeight: 800,
                    background: 'rgba(255,255,255,0.06)',
                    color: card.badgeColor,
                    border: `1px solid ${card.cardBorder}`
                  }}>
                    {card.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '2px' }}>{card.title}</h3>
                <div style={{ fontSize: '0.8rem', color: card.badgeColor, fontWeight: 700, marginBottom: '0.85rem' }}>{card.subtitle}</div>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {card.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.85rem' }}>
                  {card.features.map((feat, idx) => (
                    <div key={idx} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: card.badgeColor, fontWeight: 900 }}>✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="btn"
                onClick={() => navigateTo(card.id)}
                style={{
                  ...card.actionStyle,
                  width: '100%',
                  padding: '0.75rem',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                {card.actionText}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Live Active Elections Snapshot ───────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: '22px',
        padding: '2rem',
        marginBottom: '3.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
              🗳️ Active Election Polls
            </h3>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Currently running campus and faculty elections.
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigateTo('voter')}
            style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}
          >
            Go to Voter Booth →
          </button>
        </div>

        {elections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🗳️</div>
            <p>No active elections right now. Check back soon or contact the administrator.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {elections.map(elec => {
              const diff = elec.end_time ? new Date(elec.end_time).getTime() - nowTick : null;
              const isExpired = diff !== null && diff <= 0;
              const isClosed = elec.status !== 'active' || isExpired;
              let timeStr = null;
              if (diff !== null && !isExpired) {
                const totalSecs = Math.floor(diff / 1000);
                const hrs = Math.floor(totalSecs / 3600);
                const mins = Math.floor((totalSecs % 3600) / 60);
                const secs = totalSecs % 60;
                timeStr = hrs >= 24 ? `${Math.floor(hrs / 24)}d ${hrs % 24}h` : `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
              }

              return (
                <div
                  key={elec.id}
                  style={{
                    background: 'rgba(0,0,0,0.18)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    borderLeft: `4px solid ${!isClosed ? '#10b981' : '#64748b'}`
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>{elec.title}</div>
                      <span style={{
                        padding: '2px 8px', borderRadius: '12px',
                        fontSize: '0.68rem', fontWeight: 800,
                        background: !isClosed ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)',
                        color: !isClosed ? '#10b981' : '#64748b'
                      }}>
                        {!isClosed ? '● LIVE' : 'CONCLUDED'}
                      </span>
                      {timeStr && (
                        <span style={{
                          padding: '2px 7px', borderRadius: '10px',
                          fontSize: '0.68rem', fontWeight: 700,
                          background: 'rgba(99,102,241,0.15)', color: '#818cf8',
                          border: '1px solid rgba(99,102,241,0.3)'
                        }}>
                          ⏱️ {timeStr}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {elec.category} · ID: {elec.id}
                      {elec.end_time && <span> · Deadline: {new Date(elec.end_time).toLocaleDateString()} {new Date(elec.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                    </div>
                  </div>

                  {!isClosed ? (
                    <button
                      type="button"
                      className="btn"
                      onClick={() => navigateTo('voter')}
                      style={{
                        background: 'rgba(16,185,129,0.15)',
                        color: '#10b981',
                        border: '1px solid rgba(16,185,129,0.3)',
                        padding: '0.5rem 1rem',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Vote Now →
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigateTo('voter')}
                      style={{
                        padding: '0.5rem 0.9rem',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        opacity: 0.75,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      View Results
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── How VotePulse Works: 3-Step Process ──────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          How VotePulse Ensures Democratic Secrecy
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Designed with 3-tier checks and balances for zero-tampering and transparent verification.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
          textAlign: 'left'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: '18px',
            padding: '1.5rem'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📝</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '4px' }}>1. Candidate Nomination</div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Candidates register directly with their official manifesto. Details are emailed immediately, and an administrator must verify and approve the candidacy before it appears on the voter ballot.
            </p>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: '18px',
            padding: '1.5rem'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔒</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '4px' }}>2. Cryptographic Ballot Sealing</div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Voters authenticate with their unique Voter ID. Votes are sealed using Caesar Cipher encryption and SHA-256 hash seals. Strict concurrency locks prevent double-voting.
            </p>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: '18px',
            padding: '1.5rem'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '4px' }}>3. Independent Public Audit</div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Any voter or independent observer can query the cryptographic audit tool with their receipt hash to prove their ballot was sealed without alteration—while keeping voter identity private.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <div style={{
        textAlign: 'center',
        paddingTop: '2rem',
        borderTop: '1px solid var(--border-glass)',
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 800, color: 'var(--primary)' }}>VotePulse</span>
          <span>© 2026 Academic & Institutional E-Voting Platform</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button type="button" onClick={() => navigateTo('voter')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem' }}>Voter</button>
          <button type="button" onClick={() => navigateTo('candidate')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem' }}>Candidate</button>
          <button type="button" onClick={() => navigateTo('admin')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem' }}>Admin</button>
          <button type="button" onClick={() => navigateTo('audit')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem' }}>Audit</button>
        </div>
      </div>

    </div>
  );
}
