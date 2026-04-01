import { C, WARDS } from '../data/constants';

const fmt  = n => Number(n).toLocaleString('en-US');
const fmtM = n => '$' + (n / 1_000_000).toFixed(1) + 'M';

function Section({ title, sub, children }) {
  return (
    <div style={{ background: C.white, borderRadius: 6, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.07)', marginBottom: 20 }}>
      <h3 style={{ color: C.darkBlue, fontSize: 14, marginBottom: sub ? 4 : 16 }}>{title}</h3>
      {sub && <p style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>{sub}</p>}
      {children}
    </div>
  );
}

function GapBar({ needed, available, label }) {
  const max = Math.max(needed, available, 1);
  const avPct = (available / max) * 100;
  const nePct = (needed  / max) * 100;
  const gap   = needed - available;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
        <span style={{ color: C.gray }}>{label}</span>
        <span style={{ color: gap > 0 ? '#D32F2F' : '#155724', fontWeight: 600 }}>
          {gap > 0 ? `SHORT ${fmt(gap)}` : `BUFFER ${fmt(-gap)}`}
        </span>
      </div>
      <div style={{ position: 'relative', height: 14, background: '#e8edf5', borderRadius: 7 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: 14, borderRadius: 7,
          width: avPct + '%', background: gap > 0 ? '#D32F2F' : C.green, opacity: 0.9 }} />
        <div style={{ position: 'absolute', left: 0, top: 0, height: 14,
          width: nePct + '%', border: '2px solid ' + C.darkBlue, borderRadius: 7, background: 'transparent' }} />
      </div>
      <div style={{ display: 'flex', fontSize: 11, color: C.muted, marginTop: 3, gap: 12 }}>
        <span>On-board: {fmt(available)}</span>
        <span>Required: {fmt(needed)}</span>
      </div>
    </div>
  );
}

export default function StaffingCalculator({ scenario, updateScenario, derived }) {
  const st = scenario.staffing;

  const setStaff = (key, val) => updateScenario(s => ({
    ...s, staffing: { ...s.staffing, [key]: val },
  }));
  const setStrength = (role, val) => updateScenario(s => ({
    ...s, staffing: { ...s.staffing, currentStrength: { ...s.staffing.currentStrength, [role]: val } },
  }));

  return (
    <div>
      {/* ── Staffing Parameters ──────────────────────────────────────────────── */}
      <Section title="Staffing Parameters"
        sub="Adjust vacancy rate, surge absenteeism, and travel nurse assumptions. All FTE calculations use a 4.2× coverage factor (3 shifts × PTO/weekend relief).">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { label: 'Vacancy Rate (%)', key: 'vacancyRate',         min: 0, max: 40 },
            { label: 'Surge Absentee Rate (%)', key: 'absenteeRateSurge', min: 0, max: 40 },
            { label: 'Travel Nurse Cost Multiplier', key: 'travelNurseMultiplier', min: 1, max: 5, step: 0.1 },
          ].map(({ label, key, min, max, step = 1 }) => (
            <div key={key}>
              <label style={{ fontSize: 12, color: C.muted, display: 'block', marginBottom: 6 }}>{label}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="range" min={min} max={max} step={step} value={st[key]}
                  onChange={e => setStaff(key, Number(e.target.value))} style={{ flex: 1 }} />
                <span style={{ width: 44, textAlign: 'right', fontWeight: 700, color: C.darkBlue }}>{st[key]}{key === 'vacancyRate' || key === 'absenteeRateSurge' ? '%' : '×'}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: '10px 14px', background: '#f0f4ff', borderRadius: 4, fontSize: 13 }}>
          <strong>Effective RN workforce:</strong> {fmt(derived.effectiveRN)} on-board &nbsp;→&nbsp;
          <strong style={{ color: '#D32F2F' }}>{fmt(derived.surgeRN)}</strong> available during surge (after {st.absenteeRateSurge}% absenteeism)
          &nbsp;|&nbsp; Travel nurse surge cost: <strong>{fmtM(derived.travelRNCost)}</strong>/yr
        </div>
      </Section>

      {/* ── Current Strength ─────────────────────────────────────────────────── */}
      <Section title="Current Authorized Strength (On-Board)"
        sub="Enter current on-board FTEs by role. These drive the gap analysis below.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            { key: 'RN',            label: 'Registered Nurses (RN)'      },
            { key: 'LPN',           label: 'Licensed Practical Nurses'   },
            { key: 'CNA',           label: 'CNAs / Patient Care Techs'   },
            { key: 'clerk',         label: 'Ward Clerks / Unit Coord.'   },
            { key: 'pharmacist',    label: 'Pharmacists (PharmD)'        },
            { key: 'pharmacy_tech', label: 'Pharmacy Technicians'        },
            { key: 'rt',            label: 'Respiratory Therapists'      },
            { key: 'pct',           label: 'Patient Care Techs (PCT)'    },
            { key: 'evs',           label: 'Environmental Services (EVS)'},
            { key: 'case_manager',  label: 'Case Managers'               },
            { key: 'social_worker', label: 'Social Workers'              },
            { key: 'pt',            label: 'Physical Therapists'         },
            { key: 'ot',            label: 'Occupational Therapists'     },
          ].map(({ key, label }) => (
            <div key={key}>
              <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 3 }}>{label}</label>
              <input type="number" min={0} value={st.currentStrength[key] || 0}
                onChange={e => setStrength(key, Number(e.target.value))}
                style={{ width: '100%', padding: '5px 8px', border: `1px solid ${C.border}`, borderRadius: 3, fontSize: 13 }} />
            </div>
          ))}
        </div>
      </Section>

      {/* ── Gap Analysis ─────────────────────────────────────────────────────── */}
      <Section title="FTE Gap Analysis (Projected vs. On-Board)">
        <GapBar needed={derived.totalRNNeed}  available={derived.effectiveRN}  label="Registered Nurses (RN) — Normal ops" />
        <GapBar needed={derived.totalRNNeed}  available={derived.surgeRN}      label="Registered Nurses (RN) — Surge (incl. absenteeism)" />
        <GapBar needed={derived.totalLPNNeed} available={Math.round(st.currentStrength.LPN * (1 - st.vacancyRate/100))} label="Licensed Practical Nurses (LPN)" />
        <GapBar needed={derived.totalRTNeed}  available={st.currentStrength.rt || 0}  label="Respiratory Therapists (RT)" />
        <GapBar needed={derived.totalPCTNeed} available={st.currentStrength.pct || 0} label="Patient Care Techs (PCT)" />
        <GapBar needed={derived.totalEVSNeed} available={st.currentStrength.evs || 0} label="Environmental Services (EVS)" />
        {derived.rnSurgeGap > 0 && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#f8d7da', border: '1px solid #D32F2F', borderRadius: 6, fontSize: 13, color: '#721c24' }}>
            <strong>⚠ Surge staffing shortfall:</strong> {fmt(derived.rnSurgeGap)} additional RNs required.
            Estimated travel nurse annualized cost: <strong>{fmtM(derived.travelRNCost)}</strong> at {st.travelNurseMultiplier}× burdened rate.
            Recommend activating agency contracts and MEDCOM augmentation authority <strong>at least 18 months prior to activation.</strong>
          </div>
        )}
      </Section>

      {/* ── Per-Ward FTE Detail ──────────────────────────────────────────────── */}
      <Section title="Per-Ward FTE Requirements">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: C.darkBlue, color: '#fff' }}>
              {['Ward','Beds','RN FTEs','LPN FTEs','RT FTEs','PCT FTEs','EVS FTEs','Clerks','Case Mgrs','Pharm'].map(h =>
                <th key={h} style={{ padding: '7px 10px', textAlign: h === 'Ward' ? 'left' : 'right' }}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {derived.wardData.map((w, i) => (
              <tr key={w.id} style={{ background: i % 2 ? '#f8fafd' : C.white }}>
                <td style={{ padding: '6px 10px' }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: w.color, marginRight: 6 }} />
                  {w.name}
                </td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{w.hardTotal}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600 }}>{fmt(w.rnNeed)}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmt(w.lpnNeed)}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmt(w.ancFTEs.rt)}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmt(w.ancFTEs.pct)}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmt(w.ancFTEs.evs)}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmt(w.ancFTEs.clk)}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmt(w.ancFTEs.cm)}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmt(w.ancFTEs.ph)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: C.darkBlue, color: '#fff', fontWeight: 700 }}>
              <td style={{ padding: '7px 10px' }}>Total</td>
              <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(derived.totalHard)}</td>
              <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(derived.totalRNNeed)}</td>
              <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(derived.totalLPNNeed)}</td>
              <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(derived.totalRTNeed)}</td>
              <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(derived.totalPCTNeed)}</td>
              <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(derived.totalEVSNeed)}</td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </Section>
    </div>
  );
}
