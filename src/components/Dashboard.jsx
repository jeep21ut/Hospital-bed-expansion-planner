import { C, READINESS_AREAS, RAG, WARDS } from '../data/constants';

const fmt  = n => Number(n).toLocaleString('en-US');
const fmtM = n => '$' + (n / 1_000_000).toFixed(1) + 'M';
const pct  = (n, d) => d ? Math.round((n / d) * 100) + '%' : '—';

function KPICard({ label, value, sub, color, warn }) {
  return (
    <div style={{
      background: C.white, borderRadius: 6, padding: '16px 20px',
      borderLeft: `4px solid ${color || C.blue}`,
      boxShadow: '0 1px 4px rgba(0,0,0,.08)', flex: '1 1 160px',
    }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || C.darkBlue }}>{value}</div>
      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: warn ? '#b00' : C.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// Simple horizontal bar (CSS)
function HBar({ pct: p, color, bg = '#e8edf5', height = 10 }) {
  return (
    <div style={{ background: bg, borderRadius: height, height, overflow: 'hidden' }}>
      <div style={{ width: Math.min(100, p) + '%', height, background: color, borderRadius: height, transition: 'width .4s' }} />
    </div>
  );
}

// Mini SVG sparkline for surge curve
function SurgeCurve({ data, width = 320, height = 80 }) {
  if (!data || data.length === 0) return null;
  const maxC = Math.max(...data.map(d => d.totalLimit));
  const xs = data.map((_, i) => (i / (data.length - 1)) * width);
  const ys = v => height - (v / maxC) * height;

  const cLine  = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xs[i].toFixed(1)},${ys(d.census).toFixed(1)}`).join(' ');
  const hLine  = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xs[i].toFixed(1)},${ys(d.hardLimit).toFixed(1)}`).join(' ');
  const tLine  = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xs[i].toFixed(1)},${ys(d.totalLimit).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: height }}>
      <path d={tLine} fill="none" stroke="#5AAC45" strokeWidth={1} strokeDasharray="4 2" />
      <path d={hLine} fill="none" stroke="#D32F2F" strokeWidth={1.5} strokeDasharray="4 2" />
      <path d={cLine} fill="none" stroke={C.blue}  strokeWidth={2} />
    </svg>
  );
}

export default function Dashboard({ scenario, derived }) {
  const a = scenario.assumptions;
  const peakOverHard  = derived.peakDay.census > derived.totalHard;
  const peakOverTotal = derived.peakDay.census > derived.totalCapacity;

  return (
    <div>
      <h2 style={{ color: C.darkBlue, marginBottom: 4 }}>{scenario.name}</h2>
      <p style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>{scenario.description}</p>

      {/* ── KPI Row ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <KPICard label="Current Hard Beds"   value={fmt(derived.totalCurrentHard)}
          sub={`+ ${fmt(derived.totalCurrentSurge)} surge (soft)`} />
        <KPICard label="Projected Hard Beds" value={fmt(derived.totalHard)}
          color={C.green} sub={`+${fmt(derived.totalAdded)} permanent`} />
        <KPICard label="Total Capacity"      value={fmt(derived.totalCapacity)}
          sub="Hard + surge beds" />
        <KPICard label="Surge Peak Census"   value={fmt(derived.peakDay.census)}
          color={peakOverHard ? '#D32F2F' : C.blue}
          warn={peakOverHard}
          sub={peakOverHard ? (peakOverTotal ? '⚠ Exceeds total capacity' : '⚠ Exceeds hard beds — surge activated') : `Day ${derived.peakDay.day}`} />
        <KPICard label="MILCON + Equipment"  value={fmtM(derived.totalCapital + derived.equipCost)}
          color={C.darkBlue} sub={`+${fmtM(derived.incrementalOM)}/yr O&M`} />
        <KPICard label="RN Gap (surge)"      value={fmt(derived.rnSurgeGap)}
          color={derived.rnSurgeGap > 0 ? '#D32F2F' : C.green}
          warn={derived.rnSurgeGap > 0}
          sub={derived.rnSurgeGap > 0 ? `~${fmtM(derived.travelRNCost)} travel nurse cost` : 'Staffing adequate'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* ── Ward capacity bars ──────────────────────────────────────────── */}
        <div style={{ background: C.white, borderRadius: 6, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
          <h3 style={{ color: C.darkBlue, fontSize: 14, marginBottom: 16 }}>Bed Capacity by Ward</h3>
          {derived.wardData.map(w => {
            const maxBeds = w.hardTotal + w.surgeTotal;
            return (
              <div key={w.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                  <span style={{ color: C.gray }}>{w.name}</span>
                  <span style={{ color: C.muted }}>{w.hardBeds}→<strong>{w.hardTotal}</strong> hard &nbsp;|&nbsp; {w.surgeTotal} surge</span>
                </div>
                <div style={{ display: 'flex', gap: 2, height: 10 }}>
                  <div style={{ flex: w.hardBeds, background: C.blue, borderRadius: '4px 0 0 4px' }} title={`Existing: ${w.hardBeds}`} />
                  {w.added > 0 && <div style={{ flex: w.added, background: C.green }} title={`New: ${w.added}`} />}
                  {w.surgeTotal > 0 && <div style={{ flex: w.surgeTotal, background: '#e0e8f0', borderRadius: '0 4px 4px 0' }} title={`Surge: ${w.surgeTotal}`} />}
                </div>
              </div>
            );
          })}
          <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 11 }}>
            <span style={{ color: C.blue }}>■ Existing</span>
            <span style={{ color: C.green }}>■ New (permanent)</span>
            <span style={{ color: '#b0c0d8' }}>■ Surge (soft)</span>
          </div>
        </div>

        {/* ── Surge census curve ──────────────────────────────────────────── */}
        <div style={{ background: C.white, borderRadius: 6, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
          <h3 style={{ color: C.darkBlue, fontSize: 14, marginBottom: 4 }}>60-Day Surge Census Projection</h3>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>
            {fmt(a.surgeAdmitRatePerDay)} admits/day × {a.surgeDurationDays} days &nbsp;|&nbsp; blended ALOS {derived.blendedALOS.toFixed(1)} days
          </div>
          <SurgeCurve data={derived.surgeCurve} height={100} />
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11 }}>
            <span style={{ color: C.blue }}>— Census</span>
            <span style={{ color: '#D32F2F' }}>— Hard bed limit</span>
            <span style={{ color: '#5AAC45' }}>— Total capacity</span>
          </div>
          {derived.sdBottleneck > 0 && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#fff3cd', borderRadius: 4, fontSize: 12, color: '#856404' }}>
              ⚠ Step-down bottleneck: {fmt(derived.icuStepDownFlow)} ICU step-downs compete for {fmt((derived.wardData.find(w=>w.id==='stepdown')||{}).hardTotal||0)} step-down beds. Deficit: <strong>{fmt(derived.sdBottleneck)}</strong> beds.
            </div>
          )}
        </div>
      </div>

      {/* ── Demand projection table ─────────────────────────────────────────── */}
      <div style={{ background: C.white, borderRadius: 6, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.07)', marginBottom: 24 }}>
        <h3 style={{ color: C.darkBlue, fontSize: 14, marginBottom: 12 }}>
          Long-Range Demand Projection &nbsp;
          <span style={{ fontWeight: 400, color: C.muted, fontSize: 12 }}>({a.populationGrowthRate}%/yr growth, {a.avgOccupancyTarget}% target occupancy)</span>
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.darkBlue, color: '#fff' }}>
              {['Year','Projected Daily Census','Beds Required','Hard Beds Available','Total w/ Surge','Gap (Hard)'].map(h =>
                <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Year' ? 'left' : 'right' }}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {derived.demandByYear.map((row, i) => {
              const gap  = row.bedsNeed - row.hardAvail;
              const over = gap > 0;
              return (
                <tr key={row.yr} style={{ background: i % 2 ? '#f8fafd' : C.white }}>
                  <td style={{ padding: '7px 12px', fontWeight: 600 }}>{row.yr}</td>
                  <td style={{ padding: '7px 12px', textAlign: 'right' }}>{fmt(row.census)}</td>
                  <td style={{ padding: '7px 12px', textAlign: 'right' }}>{fmt(row.bedsNeed)}</td>
                  <td style={{ padding: '7px 12px', textAlign: 'right' }}>{fmt(row.hardAvail)}</td>
                  <td style={{ padding: '7px 12px', textAlign: 'right' }}>{fmt(row.totalAvail)}</td>
                  <td style={{ padding: '7px 12px', textAlign: 'right', color: over ? '#D32F2F' : '#155724', fontWeight: 600 }}>
                    {over ? '+' + fmt(gap) + ' SHORT' : fmt(-gap) + ' BUFFER'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Directorate readiness ────────────────────────────────────────────── */}
      <div style={{ background: C.white, borderRadius: 6, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
        <h3 style={{ color: C.darkBlue, fontSize: 14, marginBottom: 14 }}>Directorate Readiness (EOC Status)</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {READINESS_AREAS.map(area => {
            const score = scenario.readiness?.[area.id] || 1;
            const rag   = RAG(score);
            return (
              <div key={area.id} style={{
                border: `1px solid ${rag.border}`, background: rag.bg,
                borderRadius: 6, padding: '10px 16px', minWidth: 160, flex: '1 1 160px',
              }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: rag.text }}>{rag.label.toUpperCase()}</div>
                <div style={{ fontSize: 13, color: C.gray, marginTop: 2 }}>{area.label}</div>
                <div style={{ marginTop: 6 }}>
                  {[1,2,3,4,5].map(i => (
                    <span key={i} style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%',
                      background: i <= score ? rag.border : '#ddd', marginRight: 3 }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
