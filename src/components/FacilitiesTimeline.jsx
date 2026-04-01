import { C, PHASES, WARDS } from '../data/constants';

const fmt = n => Number(n).toLocaleString('en-US');

// Parse 'YYYY-MM' string to a Date
function parseYM(ym) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1);
}
// Add months to a date
function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}
// Format date as MMM YYYY
function fmtDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
// Month diff between two dates
function monthDiff(a, b) {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
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

export default function FacilitiesTimeline({ scenario, updateScenario, derived }) {
  const fac = scenario.facilities;

  const setFac = (key, val) => updateScenario(s => ({
    ...s, facilities: { ...s.facilities, [key]: val },
  }));

  const planStart = parseYM(fac.planningStartYYYYMM || '2026-04');

  // Build phase timeline
  let cursor = new Date(planStart);
  const phaseTimeline = PHASES.map(ph => {
    const start = new Date(cursor);
    const end   = addMonths(cursor, ph.months);
    cursor = new Date(end);
    return { ...ph, start, end };
  });

  const totalMonths = monthDiff(planStart, cursor);
  const projectEnd  = new Date(cursor);
  const today = new Date();

  // O2 demand analysis
  const totalO2 = derived.totalO2LPM;
  // Average hospital O2 manifold: 150-200 LPM per standard zone
  // Rough rule: needs upgrade if > 400 LPM; major upgrade if > 800 LPM
  const o2Status = totalO2 > 800 ? { color: '#D32F2F', label: 'Critical — major O₂ infrastructure upgrade required', bg: '#ffeaea' }
                 : totalO2 > 400 ? { color: '#856404', label: 'Caution — O₂ manifold capacity study required',        bg: '#fff3cd' }
                 :                  { color: '#155724', label: 'Adequate — verify flow rates during commissioning',     bg: '#d4edda' };

  // Per-ward activation dates
  const wardActivations = WARDS.map(ward => {
    const sw = scenario.wards.find(w => w.id === ward.id) || {};
    const fy = sw.activationFY || 2028;
    // FY starts Oct 1; rough activation in Q3
    const approxDate = new Date(fy, 3, 1); // April of activation FY
    return { ...ward, fy, approxDate, added: sw.addedBeds || 0 };
  }).filter(w => w.added > 0);

  return (
    <div>
      {/* ── Planning Start ─────────────────────────────────────────────────── */}
      <Section title="Project Timeline Configuration">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 12, color: C.muted, display: 'block', marginBottom: 4 }}>
              Planning Phase Start (YYYY-MM)
            </label>
            <input type="month" value={fac.planningStartYYYYMM || '2026-04'}
              onChange={e => setFac('planningStartYYYYMM', e.target.value)}
              style={{ padding: '6px 10px', border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 14, color: C.darkBlue }} />
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            <div>Project start: <strong>{fmtDate(planStart)}</strong></div>
            <div>Estimated activation: <strong>{fmtDate(projectEnd)}</strong></div>
            <div>Total duration: <strong>{totalMonths} months</strong></div>
          </div>
        </div>
      </Section>

      {/* ── Gantt Chart ─────────────────────────────────────────────────────── */}
      <Section title="Master Construction Phasing (Gantt)" sub="Phases shown for the overall facility expansion. Individual ward activation dates are set in the Scenarios tab.">
        {/* Month ruler */}
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 640 }}>
            {/* Ruler */}
            <div style={{ display: 'flex', marginBottom: 4 }}>
              <div style={{ width: 180, flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', position: 'relative', height: 20 }}>
                {phaseTimeline.map(ph => (
                  <div key={ph.id} style={{ flex: ph.months, fontSize: 10, color: C.muted, borderLeft: `1px solid ${C.border}`, paddingLeft: 3 }}>
                    {fmtDate(ph.start)}
                  </div>
                ))}
                <div style={{ fontSize: 10, color: C.muted, paddingLeft: 3, borderLeft: `1px solid ${C.border}` }}>
                  {fmtDate(projectEnd)}
                </div>
              </div>
            </div>

            {/* Phase bars */}
            {phaseTimeline.map(ph => (
              <div key={ph.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ width: 180, flexShrink: 0, fontSize: 12, color: C.gray, paddingRight: 12 }}>
                  {ph.label}
                  <div style={{ fontSize: 10, color: C.muted }}>{ph.months} months</div>
                </div>
                <div style={{ flex: 1, background: '#e8edf5', borderRadius: 4, height: 28, position: 'relative' }}>
                  {/* grey background rail */}
                  <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 28, background: '#f0f4fa', borderRadius: 4 }} />
                  {/* phase block */}
                  <div style={{
                    position: 'absolute',
                    left: (monthDiff(planStart, ph.start) / totalMonths * 100) + '%',
                    width: (ph.months / totalMonths * 100) + '%',
                    height: 28, background: ph.color, borderRadius: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 11, fontWeight: 600,
                    boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                  }}>
                    {ph.months >= 3 ? fmtDate(ph.start) + ' – ' + fmtDate(ph.end) : ''}
                  </div>
                  {/* Today indicator */}
                  {today >= planStart && today <= projectEnd && (() => {
                    const todayPct = monthDiff(planStart, today) / totalMonths * 100;
                    return (
                      <div style={{ position: 'absolute', left: todayPct + '%', top: -4, bottom: -4,
                        width: 2, background: C.darkBlue, zIndex: 10 }} title="Today" />
                    );
                  })()}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 11, flexWrap: 'wrap' }}>
              {PHASES.map(ph => (
                <span key={ph.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 2, background: ph.color }} />
                  {ph.label}
                </span>
              ))}
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ display: 'inline-block', width: 2, height: 12, background: C.darkBlue }} />
                Today
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Ward Activation Schedule ─────────────────────────────────────────── */}
      <Section title="Ward Activation Schedule">
        {wardActivations.length === 0 ? (
          <p style={{ color: C.muted, fontSize: 13 }}>No permanent bed expansions planned. Add beds in the Scenarios tab.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.darkBlue, color: '#fff' }}>
                {['Ward','Unit','Beds Added','Activation FY','Est. Date','Capital'].map(h =>
                  <th key={h} style={{ padding: '8px 12px', textAlign: h.startsWith('Beds') || h === 'Capital' ? 'right' : 'left' }}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {wardActivations.map((w, i) => {
                const wd = derived.wardData.find(d => d.id === w.id);
                return (
                  <tr key={w.id} style={{ background: i % 2 ? '#f8fafd' : C.white }}>
                    <td style={{ padding: '7px 12px' }}>
                      <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: w.color, marginRight: 6 }} />
                      {w.name}
                    </td>
                    <td style={{ padding: '7px 12px', color: C.muted }}>{w.unit}</td>
                    <td style={{ padding: '7px 12px', textAlign: 'right', fontWeight: 600 }}>+{w.added}</td>
                    <td style={{ padding: '7px 12px' }}>FY{w.fy}</td>
                    <td style={{ padding: '7px 12px', color: C.muted }}>{fmtDate(w.approxDate)}</td>
                    <td style={{ padding: '7px 12px', textAlign: 'right' }}>
                      {wd?.capCost > 0 ? '$' + (wd.capCost / 1_000_000).toFixed(1) + 'M' : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Section>

      {/* ── O2 Infrastructure Assessment ─────────────────────────────────────── */}
      <Section title="O₂ Infrastructure Assessment">
        <div style={{ padding: '14px 18px', background: o2Status.bg, borderRadius: 6,
          border: `1px solid ${o2Status.color}`, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: o2Status.color, fontSize: 14 }}>{o2Status.label}</div>
          <div style={{ fontSize: 13, color: C.gray, marginTop: 4 }}>
            Estimated peak O₂ demand at full occupancy: <strong>{fmt(Math.round(derived.totalO2LPM))} L/min</strong>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: C.darkBlue, color: '#fff' }}>
              {['Ward','Beds','O₂ (L/min)','% of Total','Notes'].map(h =>
                <th key={h} style={{ padding: '7px 10px', textAlign: h === 'Ward' ? 'left' : 'right' }}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {derived.wardData.filter(w => w.o2LPM > 0).sort((a, b) => b.o2LPM - a.o2LPM).map((w, i) => (
              <tr key={w.id} style={{ background: i % 2 ? '#f8fafd' : C.white }}>
                <td style={{ padding: '6px 10px' }}>{w.name}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{w.hardTotal}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600 }}>{fmt(Math.round(w.o2LPM))}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>
                  {Math.round((w.o2LPM / derived.totalO2LPM) * 100)}%
                </td>
                <td style={{ padding: '6px 10px', color: C.muted, fontSize: 11 }}>
                  {w.id === 'icu' ? 'Includes vent + hi-flow O₂' : w.id === 'neg-press' ? 'Negative pressure HVAC also required' : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: C.darkBlue, color: '#fff', fontWeight: 700 }}>
              <td style={{ padding: '7px 10px' }}>Total</td>
              <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(derived.totalHard)}</td>
              <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(Math.round(derived.totalO2LPM))} L/min</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
        <p style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>
          Commission a certified O₂ flow/pressure study before construction award. ICU and negative-pressure rooms drive the majority of demand. Ensure LOX tank capacity and manifold regulator sizing are included in the design package.
        </p>
      </Section>
    </div>
  );
}
