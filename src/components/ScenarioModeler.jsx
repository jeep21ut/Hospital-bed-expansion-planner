import { useState } from 'react';
import { C, WARDS, ACS_TEMPLATES, FISCAL_YEARS } from '../data/constants';
import { defaultScenario, calcDerived } from '../data/model';

const fmt  = n => Number(n).toLocaleString('en-US');
const fmtM = n => '$' + (n / 1_000_000).toFixed(1) + 'M';

function Section({ title, children }) {
  return (
    <div style={{ background: C.white, borderRadius: 6, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.07)', marginBottom: 20 }}>
      <h3 style={{ color: C.darkBlue, fontSize: 14, marginBottom: 16 }}>{title}</h3>
      {children}
    </div>
  );
}

function NumInput({ value, onChange, min = 0, max, step = 1, style }) {
  return (
    <input type="number" value={value} min={min} max={max} step={step}
      onChange={e => onChange(Number(e.target.value))}
      style={{ width: 80, padding: '4px 6px', border: `1px solid ${C.border}`, borderRadius: 3, fontSize: 13, textAlign: 'right', ...style }} />
  );
}

function RangeInput({ value, onChange, min, max, step = 0.5 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1 }} />
      <span style={{ width: 40, textAlign: 'right', fontSize: 13, fontWeight: 600, color: C.darkBlue }}>{value}</span>
    </div>
  );
}

export default function ScenarioModeler({ plan, setPlan, scenario, updateScenario, derived }) {
  const [compareId, setCompareId] = useState(null);
  const compareSc = compareId ? plan.scenarios.find(s => s.id === compareId) : null;

  // Shortcut updaters
  const setAssumption = (key, val) => updateScenario(s => ({
    ...s, assumptions: { ...s.assumptions, [key]: val },
  }));

  const setWardField = (wardId, key, val) => updateScenario(s => ({
    ...s,
    wards: s.wards.map(w => w.id === wardId ? { ...w, [key]: val } : w),
  }));

  const renameScenario = () => {
    const name = prompt('Rename scenario:', scenario.name);
    if (name) updateScenario(s => ({ ...s, name }));
  };

  // ACS helpers
  const addACS = () => updateScenario(s => ({
    ...s,
    acsSites: [...(s.acsSites || []), {
      id: String(Date.now()), type: 'cafeteria', label: 'New ACS Site',
      beds: 20, hasO2: false, hasPlumbing: true, sqft: 1600,
    }],
  }));
  const updateACS = (id, key, val) => updateScenario(s => ({
    ...s,
    acsSites: s.acsSites.map(site => site.id === id ? { ...site, [key]: val } : site),
  }));
  const removeACS = id => updateScenario(s => ({
    ...s, acsSites: s.acsSites.filter(site => site.id !== id),
  }));

  const a = scenario.assumptions;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ color: C.darkBlue, margin: 0 }}>{scenario.name}</h2>
          <p style={{ color: C.muted, fontSize: 12, margin: '4px 0 0' }}>{scenario.description}</p>
        </div>
        <button onClick={renameScenario}
          style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 14px', background: C.white, cursor: 'pointer', fontSize: 13 }}>
          Rename
        </button>
      </div>

      {/* ── Demand Assumptions ──────────────────────────────────────────────── */}
      <Section title="Demand & Population Assumptions">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <label style={{ fontSize: 12, color: C.muted, display: 'block', marginBottom: 4 }}>
              Beneficiary Population Growth Rate (%/yr)
            </label>
            <RangeInput value={a.populationGrowthRate} min={0} max={8} step={0.5}
              onChange={v => setAssumption('populationGrowthRate', v)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: C.muted, display: 'block', marginBottom: 4 }}>
              Target Occupancy (%)
            </label>
            <RangeInput value={a.avgOccupancyTarget} min={60} max={95} step={1}
              onChange={v => setAssumption('avgOccupancyTarget', v)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: C.muted, display: 'block', marginBottom: 4 }}>
              Current Baseline Occupancy (%)
            </label>
            <RangeInput value={a.currentOccupancy} min={50} max={100} step={1}
              onChange={v => setAssumption('currentOccupancy', v)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: C.muted, display: 'block', marginBottom: 4 }}>
              Projection Horizon (years)
            </label>
            <RangeInput value={a.projectionYears} min={1} max={10} step={1}
              onChange={v => setAssumption('projectionYears', v)} />
          </div>
        </div>
      </Section>

      {/* ── Surge Assumptions ───────────────────────────────────────────────── */}
      <Section title="Surge / Incident Modeling">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          <div>
            <label style={{ fontSize: 12, color: C.muted, display: 'block', marginBottom: 4 }}>
              Surge Admission Rate (patients/day)
            </label>
            <RangeInput value={a.surgeAdmitRatePerDay} min={0} max={200} step={5}
              onChange={v => setAssumption('surgeAdmitRatePerDay', v)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: C.muted, display: 'block', marginBottom: 4 }}>
              Surge Duration (days)
            </label>
            <RangeInput value={a.surgeDurationDays} min={1} max={120} step={1}
              onChange={v => setAssumption('surgeDurationDays', v)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: C.muted, display: 'block', marginBottom: 4 }}>
              ICU → Step-Down Transfer Rate (%)
            </label>
            <RangeInput value={a.icuStepdownPct} min={0} max={100} step={5}
              onChange={v => setAssumption('icuStepdownPct', v)} />
          </div>
        </div>
        <div style={{ marginTop: 14, padding: '10px 14px', background: '#f0f4ff', borderRadius: 4, fontSize: 13, color: C.darkBlue }}>
          <strong>Surge peak census: {fmt(derived.peakDay.census)} patients on day {derived.peakDay.day}</strong>
          &nbsp;|&nbsp; Hard bed limit: {fmt(derived.totalHard)}
          &nbsp;|&nbsp; Total (with surge beds): {fmt(derived.totalCapacity)}
          {derived.peakDay.census > derived.totalHard && (
            <span style={{ color: '#D32F2F', fontWeight: 600 }}>
              &nbsp;⚠ Peak exceeds hard bed capacity by {fmt(derived.peakDay.census - derived.totalHard)}
            </span>
          )}
        </div>
      </Section>

      {/* ── Ward Expansion Table ─────────────────────────────────────────────── */}
      <Section title="Ward-Level Expansion Plan">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.darkBlue, color: '#fff' }}>
              {['','Ward','Unit','Current (Hard)','Surge Beds','Add Permanent','Activation FY','ALOS (days)','Projected Total','Capital'].map(h =>
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {WARDS.map((ward, i) => {
              const sw   = scenario.wards.find(w => w.id === ward.id) || {};
              const en   = sw.enabled !== false;
              const alos = sw.alosOverride ?? ward.alos;
              const wd   = derived.wardData.find(w => w.id === ward.id) || {};
              return (
                <tr key={ward.id} style={{ background: !en ? '#f5f5f5' : i % 2 ? '#f8fafd' : C.white, opacity: en ? 1 : 0.5 }}>
                  <td style={{ padding: '6px 10px' }}>
                    <input type="checkbox" checked={en}
                      onChange={e => setWardField(ward.id, 'enabled', e.target.checked)} />
                  </td>
                  <td style={{ padding: '6px 10px' }}>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: ward.color, marginRight: 6 }} />
                    {ward.name}
                  </td>
                  <td style={{ padding: '6px 10px', color: C.muted }}>{ward.unit}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right' }}>{ward.hardBeds}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', color: C.muted }}>{ward.surgeBeds}</td>
                  <td style={{ padding: '6px 10px' }}>
                    <NumInput value={sw.addedBeds || 0} min={0} max={200}
                      onChange={v => setWardField(ward.id, 'addedBeds', v)} />
                  </td>
                  <td style={{ padding: '6px 10px' }}>
                    <select value={sw.activationFY || 2028}
                      onChange={e => setWardField(ward.id, 'activationFY', Number(e.target.value))}
                      style={{ fontSize: 12, padding: '3px 4px', border: `1px solid ${C.border}`, borderRadius: 3 }}>
                      {FISCAL_YEARS.map(fy => <option key={fy} value={fy}>FY{fy}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '6px 10px' }}>
                    <NumInput value={alos} min={0.5} max={30} step={0.5}
                      onChange={v => setWardField(ward.id, 'alosOverride', v)}
                      style={{ width: 60 }} />
                  </td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600 }}>
                    {wd.hardTotal || ward.hardBeds}
                  </td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', color: C.muted }}>
                    {wd.capCost > 0 ? fmtM(wd.capCost) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: C.darkBlue, color: '#fff', fontWeight: 700 }}>
              <td colSpan={3} style={{ padding: '8px 10px' }}>Totals</td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>{fmt(derived.totalCurrentHard)}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>{fmt(derived.totalCurrentSurge)}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>+{fmt(derived.totalAdded)}</td>
              <td colSpan={2} />
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>{fmt(derived.totalHard)}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right' }}>{fmtM(derived.totalCapital)}</td>
            </tr>
          </tfoot>
        </table>
      </Section>

      {/* ── Alternative Care Sites ───────────────────────────────────────────── */}
      <Section title="Alternative Care Sites (ACS)">
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
          ACS locations provide additional soft capacity during surges. Non-plumbed sites require portable sanitation; sites without piped O₂ require cylinder/LOX delivery.
        </p>
        {(scenario.acsSites || []).map(site => (
          <div key={site.id} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10, padding: '10px 14px', background: '#f8fafd', borderRadius: 4, border: `1px solid ${C.border}` }}>
            <input value={site.label} onChange={e => updateACS(site.id, 'label', e.target.value)}
              style={{ flex: 2, fontSize: 13, padding: '4px 6px', border: `1px solid ${C.border}`, borderRadius: 3 }} />
            <select value={site.type} onChange={e => {
                const t = ACS_TEMPLATES.find(x => x.id === e.target.value);
                updateACS(site.id, 'type', e.target.value);
                if (t) { updateACS(site.id, 'hasO2', t.hasO2); updateACS(site.id, 'hasPlumbing', t.hasPlumbing); }
              }}
              style={{ fontSize: 12, padding: '4px 6px', border: `1px solid ${C.border}`, borderRadius: 3 }}>
              {ACS_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <label style={{ fontSize: 12, color: C.muted }}>Beds:</label>
            <NumInput value={site.beds} min={1} max={500} onChange={v => updateACS(site.id, 'beds', v)} style={{ width: 70 }} />
            <label style={{ fontSize: 12 }}>
              <input type="checkbox" checked={site.hasO2} onChange={e => updateACS(site.id, 'hasO2', e.target.checked)} />
              {' '}Piped O₂
            </label>
            <label style={{ fontSize: 12 }}>
              <input type="checkbox" checked={site.hasPlumbing} onChange={e => updateACS(site.id, 'hasPlumbing', e.target.checked)} />
              {' '}Plumbing
            </label>
            {!site.hasPlumbing && (
              <span style={{ fontSize: 11, color: '#856404', background: '#fff3cd', padding: '2px 6px', borderRadius: 3 }}>
                +{Math.ceil(site.beds / 20)} portable toilets needed
              </span>
            )}
            <button onClick={() => removeACS(site.id)}
              style={{ border: 'none', background: '#fee', color: '#c00', cursor: 'pointer', borderRadius: 3, padding: '4px 8px', fontSize: 12 }}>✕</button>
          </div>
        ))}
        <button onClick={addACS}
          style={{ border: `1px dashed ${C.blue}`, borderRadius: 4, padding: '8px 18px', background: 'transparent', color: C.blue, cursor: 'pointer', fontSize: 13, marginTop: 6 }}>
          + Add ACS Location
        </button>
        {derived.acsBeds > 0 && (
          <div style={{ marginTop: 12, fontSize: 13, color: C.darkBlue }}>
            <strong>ACS total: {fmt(derived.acsBeds)} additional beds</strong>
            {derived.acsO2Tanks > 0 && <span style={{ color: '#856404' }}> — {derived.acsO2Tanks} O₂ cylinder deliveries/day estimated for non-piped sites</span>}
          </div>
        )}
      </Section>

      {/* ── Scenario Comparison ─────────────────────────────────────────────── */}
      {plan.scenarios.length > 1 && (
        <Section title="Scenario Comparison">
          <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13 }}>Compare with:</span>
            <select value={compareId || ''} onChange={e => setCompareId(e.target.value || null)}
              style={{ fontSize: 13, padding: '4px 8px', border: `1px solid ${C.border}`, borderRadius: 3 }}>
              <option value="">— select scenario —</option>
              {plan.scenarios.filter(s => s.id !== scenario.id).map(s =>
                <option key={s.id} value={s.id}>{s.name}</option>
              )}
            </select>
          </div>
          {compareSc && (() => {
            const cDer = calcDerived(compareSc);
            const rows = [
              ['Hard Beds (projected)',    fmt(derived.totalHard),    fmt(cDer.totalHard)],
              ['Total Capacity',           fmt(derived.totalCapacity), fmt(cDer.totalCapacity)],
              ['Surge Peak Census',        fmt(derived.peakDay.census),fmt(cDer.peakDay.census)],
              ['MILCON Capital',           fmtM(derived.totalCapital), fmtM(cDer.totalCapital)],
              ['Annual Incr. O&M',         fmtM(derived.incrementalOM),fmtM(cDer.incrementalOM)],
              ['RN FTEs Required',         fmt(derived.totalRNNeed),   fmt(cDer.totalRNNeed)],
              ['RN Surge Gap',             fmt(derived.rnSurgeGap),    fmt(cDer.rnSurgeGap)],
            ];
            return (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: C.darkBlue, color: '#fff' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Metric</th>
                    <th style={{ padding: '8px 12px' }}>{scenario.name}</th>
                    <th style={{ padding: '8px 12px' }}>{compareSc.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(([label, a, b], i) => (
                    <tr key={label} style={{ background: i % 2 ? '#f8fafd' : C.white }}>
                      <td style={{ padding: '7px 12px' }}>{label}</td>
                      <td style={{ padding: '7px 12px', textAlign: 'center', fontWeight: 600 }}>{a}</td>
                      <td style={{ padding: '7px 12px', textAlign: 'center' }}>{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
        </Section>
      )}
    </div>
  );
}
