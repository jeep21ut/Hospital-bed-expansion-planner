import { useState } from 'react';
import { C, RISK_CATEGORIES, LIKELIHOOD_LABELS, IMPACT_LABELS, READINESS_AREAS, RAG } from '../data/constants';

const fmt = n => Number(n).toLocaleString('en-US');

function riskScore(r) { return r.likelihood * r.impact; }
function riskColor(score) {
  return score >= 15 ? { bg: '#f8d7da', text: '#721c24', border: '#D32F2F', label: 'CRITICAL'  }
       : score >= 9  ? { bg: '#fff3cd', text: '#856404', border: '#C8960C', label: 'HIGH'      }
       : score >= 4  ? { bg: '#fff9e6', text: '#7a6000', border: '#FFD041', label: 'MEDIUM'    }
       :               { bg: '#d4edda', text: '#155724', border: '#5AAC45', label: 'LOW'       };
}

function Section({ title, sub, children }) {
  return (
    <div style={{ background: C.white, borderRadius: 6, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.07)', marginBottom: 20 }}>
      <h3 style={{ color: C.darkBlue, fontSize: 14, marginBottom: sub ? 4 : 16 }}>{title}</h3>
      {sub && <p style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>{sub}</p>}
      {children}
    </div>
  );
}

export default function RiskRegister({ scenario, updateScenario }) {
  const [editId, setEditId] = useState(null);
  const risks = scenario.risks || [];
  const readiness = scenario.readiness || {};

  const updateRisk = (id, key, val) => updateScenario(s => ({
    ...s,
    risks: s.risks.map(r => r.id === id ? { ...r, [key]: val } : r),
  }));

  const addRisk = () => {
    const newRisk = {
      id: String(Date.now()), title: 'New Risk Item', category: 'Planning',
      likelihood: 2, impact: 2, status: 'Open', owner: '', phase: 'planning', mitigation: '',
    };
    updateScenario(s => ({ ...s, risks: [...s.risks, newRisk] }));
    setEditId(newRisk.id);
  };

  const removeRisk = id => updateScenario(s => ({ ...s, risks: s.risks.filter(r => r.id !== id) }));

  const setReadiness = (area, val) => updateScenario(s => ({
    ...s, readiness: { ...s.readiness, [area]: val },
  }));

  const sorted = [...risks].sort((a, b) => riskScore(b) - riskScore(a));

  return (
    <div>
      {/* ── Risk Matrix ───────────────────────────────────────────────────────── */}
      <Section title="Risk Matrix (Likelihood × Impact)"
        sub="Hover over cells to see risks. Click a risk row below to edit.">
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(5, 1fr)', gap: 2, minWidth: 480 }}>
            {/* Header row */}
            <div style={{ fontSize: 11, color: C.muted, textAlign: 'center', paddingBottom: 4, gridColumn: 1 }}>↑ Likelihood</div>
            {IMPACT_LABELS.map(h => (
              <div key={h} style={{ fontSize: 10, color: C.muted, textAlign: 'center', paddingBottom: 4 }}>{h}</div>
            ))}

            {/* Grid rows (likelihood 5→1) */}
            {[5,4,3,2,1].map(lik => (
              [0,...IMPACT_LABELS.map((_,i) => i+1)].map(imp => {
                if (imp === 0) return (
                  <div key={`l${lik}`} style={{ fontSize: 10, color: C.muted, textAlign: 'right', paddingRight: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {LIKELIHOOD_LABELS[lik-1]}
                  </div>
                );
                const score = lik * imp;
                const col   = riskColor(score);
                const cellRisks = risks.filter(r => r.likelihood === lik && r.impact === imp);
                return (
                  <div key={`${lik}-${imp}`} style={{
                    background: col.bg, border: `1px solid ${col.border}`,
                    borderRadius: 3, padding: '6px 4px', minHeight: 44,
                    fontSize: 10, textAlign: 'center', cursor: cellRisks.length ? 'pointer' : 'default',
                  }}
                    title={cellRisks.map(r => r.title).join('\n') || ''}>
                    <div style={{ fontWeight: 700, color: col.text }}>{score}</div>
                    {cellRisks.map(r => (
                      <div key={r.id} style={{ background: col.border, color: '#fff',
                        borderRadius: 2, padding: '1px 3px', marginTop: 2, fontSize: 9,
                        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: 80 }}
                        title={r.title}>
                        {r.title.slice(0, 20)}{r.title.length > 20 ? '…' : ''}
                      </div>
                    ))}
                  </div>
                );
              })
            ))}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>← Impact →</div>
        </div>
      </Section>

      {/* ── Risk Table ────────────────────────────────────────────────────────── */}
      <Section title="Risk Register">
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={addRisk}
            style={{ border: `1px solid ${C.blue}`, borderRadius: 4, padding: '6px 16px',
              background: C.white, color: C.blue, cursor: 'pointer', fontSize: 13 }}>
            + Add Risk
          </button>
        </div>

        {sorted.map(r => {
          const score = riskScore(r);
          const col   = riskColor(score);
          const isEdit = editId === r.id;
          return (
            <div key={r.id} style={{ border: `1px solid ${col.border}`, background: col.bg,
              borderRadius: 6, marginBottom: 10, overflow: 'hidden' }}>
              {/* Risk header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer' }}
                onClick={() => setEditId(isEdit ? null : r.id)}>
                <div style={{ background: col.border, color: '#fff', borderRadius: 4,
                  padding: '3px 8px', fontSize: 11, fontWeight: 700, minWidth: 70, textAlign: 'center' }}>
                  {col.label} ({score})
                </div>
                <div style={{ flex: 1, fontWeight: 600, fontSize: 13, color: col.text }}>{r.title}</div>
                <div style={{ fontSize: 11, color: C.muted }}>
                  {LIKELIHOOD_LABELS[r.likelihood-1]} × {IMPACT_LABELS[r.impact-1]}
                </div>
                <div style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10,
                  background: r.status === 'Closed' ? '#d4edda' : r.status === 'Mitigated' ? '#fff3cd' : '#f8d7da',
                  color: r.status === 'Closed' ? '#155724' : r.status === 'Mitigated' ? '#856404' : '#721c24' }}>
                  {r.status}
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>{r.owner}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{isEdit ? '▲' : '▼'}</div>
              </div>

              {/* Expand to edit */}
              {isEdit && (
                <div style={{ padding: '14px 18px', borderTop: `1px solid ${col.border}`, background: '#fff' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 3 }}>Title</label>
                      <input value={r.title} onChange={e => updateRisk(r.id, 'title', e.target.value)}
                        style={{ width: '100%', padding: '5px 8px', border: `1px solid ${C.border}`, borderRadius: 3, fontSize: 13 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 3 }}>Category</label>
                      <select value={r.category} onChange={e => updateRisk(r.id, 'category', e.target.value)}
                        style={{ width: '100%', padding: '5px 8px', border: `1px solid ${C.border}`, borderRadius: 3, fontSize: 13 }}>
                        {RISK_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 3 }}>Owner</label>
                      <input value={r.owner} onChange={e => updateRisk(r.id, 'owner', e.target.value)}
                        style={{ width: '100%', padding: '5px 8px', border: `1px solid ${C.border}`, borderRadius: 3, fontSize: 13 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 3 }}>Likelihood (1–5)</label>
                      <input type="range" min={1} max={5} value={r.likelihood}
                        onChange={e => updateRisk(r.id, 'likelihood', Number(e.target.value))} style={{ width: '100%' }} />
                      <div style={{ fontSize: 11, color: C.muted }}>{LIKELIHOOD_LABELS[r.likelihood-1]}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 3 }}>Impact (1–5)</label>
                      <input type="range" min={1} max={5} value={r.impact}
                        onChange={e => updateRisk(r.id, 'impact', Number(e.target.value))} style={{ width: '100%' }} />
                      <div style={{ fontSize: 11, color: C.muted }}>{IMPACT_LABELS[r.impact-1]}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 3 }}>Status</label>
                      <select value={r.status} onChange={e => updateRisk(r.id, 'status', e.target.value)}
                        style={{ width: '100%', padding: '5px 8px', border: `1px solid ${C.border}`, borderRadius: 3, fontSize: 13 }}>
                        {['Open','Mitigated','Closed','Watch'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 3 }}>Mitigation Plan</label>
                    <textarea value={r.mitigation} rows={2}
                      onChange={e => updateRisk(r.id, 'mitigation', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', border: `1px solid ${C.border}`, borderRadius: 3, fontSize: 13, resize: 'vertical' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button onClick={() => removeRisk(r.id)}
                      style={{ border: 'none', background: '#fee', color: '#c00', cursor: 'pointer', borderRadius: 3, padding: '5px 12px', fontSize: 12 }}>
                      Remove risk
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Section>

      {/* ── EOC Readiness ─────────────────────────────────────────────────────── */}
      <Section title="EOC Directorate Readiness (Update)">
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
          Set the readiness level for each directorate. 1 = Red (not started), 3 = Amber (in progress), 5 = Green (ready). These drive the Dashboard readiness panel.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {READINESS_AREAS.map(area => {
            const score = readiness[area.id] || 1;
            const rag   = RAG(score);
            return (
              <div key={area.id} style={{ padding: '12px 16px', background: rag.bg,
                border: `1px solid ${rag.border}`, borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 13, color: rag.text }}>{area.label}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                    background: rag.border, color: '#fff' }}>{rag.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="range" min={1} max={5} step={1} value={score}
                    onChange={e => setReadiness(area.id, Number(e.target.value))} style={{ flex: 1 }} />
                  <span style={{ width: 20, fontWeight: 700, color: rag.text }}>{score}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
