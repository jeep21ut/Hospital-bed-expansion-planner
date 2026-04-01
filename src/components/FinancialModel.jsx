import { C, FISCAL_YEARS } from '../data/constants';

const fmt  = n => Number(n).toLocaleString('en-US');
const fmtM = n => '$' + (n / 1_000_000).toFixed(1) + 'M';
const fmtK = n => '$' + (n / 1_000).toFixed(0) + 'K';

function Section({ title, sub, children }) {
  return (
    <div style={{ background: C.white, borderRadius: 6, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.07)', marginBottom: 20 }}>
      <h3 style={{ color: C.darkBlue, fontSize: 14, marginBottom: sub ? 4 : 16 }}>{title}</h3>
      {sub && <p style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>{sub}</p>}
      {children}
    </div>
  );
}

function CostBar({ label, value, max, color }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
        <span style={{ color: C.gray }}>{label}</span>
        <span style={{ fontWeight: 600, color }}>{fmtM(value)}</span>
      </div>
      <div style={{ background: '#e8edf5', borderRadius: 4, height: 10 }}>
        <div style={{ width: Math.min(100, (value / max) * 100) + '%', height: 10, background: color, borderRadius: 4 }} />
      </div>
    </div>
  );
}

export default function FinancialModel({ scenario, updateScenario, derived }) {
  const fin = scenario.financial;

  const setFin = (key, val) => updateScenario(s => ({
    ...s, financial: { ...s.financial, [key]: val },
  }));
  const setPhasing = (fy, val) => updateScenario(s => {
    const pct = { ...s.financial.capitalPhasingPct, [fy]: Number(val) };
    return { ...s, financial: { ...s.financial, capitalPhasingPct: pct } };
  });

  const totalInvestment = derived.totalCapital + derived.equipCost + derived.ppeCost;
  const maxWardCap = Math.max(...derived.wardData.map(w => w.capCost), 1);
  const maxWardOM  = Math.max(...derived.wardData.map(w => w.omCost),  1);

  const phasingSum = FISCAL_YEARS.reduce((s, fy) => s + (fin.capitalPhasingPct?.[fy] || 0), 0);

  return (
    <div>
      {/* ── Summary ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        {[
          { label: 'MILCON Capital',          value: derived.totalCapital,   color: C.darkBlue },
          { label: 'Equipment',               value: derived.equipCost,      color: C.blue     },
          { label: 'PPE (surge stockpile)',    value: derived.ppeCost,        color: '#9966CC'  },
          { label: 'Total Investment',         value: totalInvestment,        color: C.green    },
          { label: 'Annual Incremental O&M',   value: derived.incrementalOM,  color: '#FF8C00'  },
          { label: 'Travel Nurse (surge/yr)',  value: derived.travelRNCost,   color: '#D32F2F'  },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ flex: '1 1 160px', background: C.white, borderRadius: 6, padding: '14px 18px',
            borderLeft: `4px solid ${color}`, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color }}>{fmtM(value)}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Adjustments ──────────────────────────────────────────────────────── */}
      <Section title="Cost Estimate Adjustments">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 16 }}>
          {[
            { label: 'Capital cost adjustment (%)', key: 'capitalAdjPct', min: -30, max: 50 },
            { label: 'O&M cost adjustment (%)',     key: 'omAdjPct',      min: -20, max: 30 },
          ].map(({ label, key, min, max }) => (
            <div key={key}>
              <label style={{ fontSize: 12, color: C.muted, display: 'block', marginBottom: 6 }}>{label}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="range" min={min} max={max} step={1} value={fin[key]}
                  onChange={e => setFin(key, Number(e.target.value))} style={{ flex: 1 }} />
                <span style={{ width: 44, textAlign: 'right', fontWeight: 700,
                  color: fin[key] > 0 ? '#D32F2F' : fin[key] < 0 ? C.green : C.darkBlue }}>
                  {fin[key] > 0 ? '+' : ''}{fin[key]}%
                </span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { key: 'includeEquipment', label: 'Include equipment costs' },
            { key: 'includePPE',       label: 'Include PPE stockpile costs' },
          ].map(({ key, label }) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={fin[key]} onChange={e => setFin(key, e.target.checked)} />
              {label}
            </label>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.muted }}>
            PPE surge days:
            <input type="number" min={1} max={365} value={fin.surgeDaysForPPECalc || 30}
              onChange={e => setFin('surgeDaysForPPECalc', Number(e.target.value))}
              style={{ width: 60, padding: '3px 6px', border: `1px solid ${C.border}`, borderRadius: 3, fontSize: 13 }} />
          </div>
        </div>
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* ── Capital by Ward ──────────────────────────────────────────────── */}
        <Section title="Capital Cost by Ward">
          {derived.wardData.filter(w => w.capCost > 0).map(w => (
            <CostBar key={w.id} label={w.name} value={w.capCost} max={maxWardCap} color={w.color} />
          ))}
          {derived.wardData.every(w => w.capCost === 0) && (
            <p style={{ color: C.muted, fontSize: 13 }}>No permanent beds added yet. Use the Scenarios tab to add beds.</p>
          )}
        </Section>

        {/* ── Annual O&M by Ward ───────────────────────────────────────────── */}
        <Section title="Projected Annual O&M by Ward">
          {derived.wardData.map(w => (
            <CostBar key={w.id} label={w.name} value={w.omCost} max={maxWardOM} color={w.color} />
          ))}
        </Section>
      </div>

      {/* ── FY Budget Phasing ─────────────────────────────────────────────────── */}
      <Section title="FY Capital Phasing"
        sub={`Distribute ${fmtM(derived.totalCapital)} MILCON capital across fiscal years (must sum to 100%). Equipment costs assumed in activation year.`}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          {FISCAL_YEARS.map(fy => (
            <div key={fy} style={{ flex: '1 1 100px' }}>
              <label style={{ fontSize: 12, color: C.muted, display: 'block', marginBottom: 4 }}>FY{fy} (%)</label>
              <input type="number" min={0} max={100} value={fin.capitalPhasingPct?.[fy] || 0}
                onChange={e => setPhasing(fy, e.target.value)}
                style={{ width: '100%', padding: '6px 8px', border: `1px solid ${C.border}`, borderRadius: 3,
                  fontSize: 14, textAlign: 'right', fontWeight: 600,
                  background: (fin.capitalPhasingPct?.[fy] || 0) > 0 ? '#f0f8ff' : C.white }} />
            </div>
          ))}
          <div style={{ flex: '1 1 100px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{ padding: '6px 10px', borderRadius: 3, textAlign: 'right', fontWeight: 700, fontSize: 14,
              background: Math.abs(phasingSum - 100) < 0.5 ? '#d4edda' : '#f8d7da',
              color: Math.abs(phasingSum - 100) < 0.5 ? '#155724' : '#721c24',
              border: `1px solid ${Math.abs(phasingSum - 100) < 0.5 ? '#5AAC45' : '#D32F2F'}` }}>
              {phasingSum}% total
            </div>
          </div>
        </div>

        {/* Stacked bar visual */}
        <div style={{ display: 'flex', gap: 2, height: 32, borderRadius: 4, overflow: 'hidden' }}>
          {FISCAL_YEARS.map((fy, i) => {
            const pct = fin.capitalPhasingPct?.[fy] || 0;
            const colors = [C.darkBlue, C.blue, '#FF8C00', '#C8960C', '#9966CC'];
            return pct > 0 ? (
              <div key={fy} style={{ flex: pct, background: colors[i], display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 600, minWidth: 0 }}
                title={`FY${fy}: ${pct}% = ${fmtM(derived.totalCapital * pct/100)}`}>
                {pct >= 8 ? `FY${fy}` : ''}
              </div>
            ) : null;
          })}
        </div>

        {/* FY cost table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 16 }}>
          <thead>
            <tr style={{ background: C.darkBlue, color: '#fff' }}>
              {['FY','MILCON Capital','Equipment','Incremental O&M','FY Total'].map(h =>
                <th key={h} style={{ padding: '7px 12px', textAlign: h === 'FY' ? 'left' : 'right' }}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {derived.capitalPhasing.map((row, i) => {
              const rowTotal = row.capital + row.equipment + row.om;
              return (
                <tr key={row.fy} style={{ background: i % 2 ? '#f8fafd' : C.white }}>
                  <td style={{ padding: '7px 12px', fontWeight: 600 }}>FY{row.fy}</td>
                  <td style={{ padding: '7px 12px', textAlign: 'right' }}>{row.capital  > 0 ? fmtM(row.capital)    : '—'}</td>
                  <td style={{ padding: '7px 12px', textAlign: 'right' }}>{row.equipment> 0 ? fmtM(row.equipment)  : '—'}</td>
                  <td style={{ padding: '7px 12px', textAlign: 'right' }}>{row.om       > 0 ? fmtM(row.om)         : '—'}</td>
                  <td style={{ padding: '7px 12px', textAlign: 'right', fontWeight: 600 }}>{rowTotal > 0 ? fmtM(rowTotal) : '—'}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: C.darkBlue, color: '#fff', fontWeight: 700 }}>
              <td style={{ padding: '7px 12px' }}>5-Year Total</td>
              <td style={{ padding: '7px 12px', textAlign: 'right' }}>{fmtM(derived.totalCapital)}</td>
              <td style={{ padding: '7px 12px', textAlign: 'right' }}>{fmtM(derived.equipCost)}</td>
              <td style={{ padding: '7px 12px', textAlign: 'right' }}>{fmtM(derived.incrementalOM * 5)}</td>
              <td style={{ padding: '7px 12px', textAlign: 'right' }}>{fmtM(totalInvestment + derived.incrementalOM * 4)}</td>
            </tr>
          </tfoot>
        </table>
      </Section>

      {/* ── Equipment Detail ────────────────────────────────────────────────── */}
      {fin.includeEquipment && (
        <Section title="Equipment Requirements by Ward"
          sub="Quantities reflect hard beds + surge beds at full occupancy. Unit costs are budgetary estimates.">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.darkBlue, color: '#fff' }}>
                {['Ward','IV Pumps','Monitors','Ventilators','Suction Units','Ward Subtotal'].map(h =>
                  <th key={h} style={{ padding: '7px 10px', textAlign: h === 'Ward' ? 'left' : 'right' }}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {derived.wardData.map((w, i) => {
                const eq   = w.equipment;
                const cost = eq.ivp * 8000 + eq.mon * 12000 + eq.vent * 35000 + eq.suc * 1500;
                return (
                  <tr key={w.id} style={{ background: i % 2 ? '#f8fafd' : C.white }}>
                    <td style={{ padding: '6px 10px' }}>{w.name}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmt(eq.ivp)}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmt(eq.mon)}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmt(eq.vent)}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmt(eq.suc)}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600 }}>{fmtK(cost)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: C.darkBlue, color: '#fff', fontWeight: 700 }}>
                <td style={{ padding: '7px 10px' }}>Total</td>
                <td colSpan={4} />
                <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmtM(derived.equipCost)}</td>
              </tr>
            </tfoot>
          </table>
        </Section>
      )}
    </div>
  );
}
