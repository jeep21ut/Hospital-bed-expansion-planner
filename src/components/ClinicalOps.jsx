import { C, WARDS, PPE_PER_PATIENT_DAY, PPE_UNIT_COST } from '../data/constants';

const fmt  = n => Number(n).toLocaleString('en-US');
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

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ flex: '1 1 150px', background: '#f4f6fb', borderLeft: `3px solid ${color || C.blue}`,
      borderRadius: 4, padding: '12px 16px' }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: color || C.darkBlue }}>{value}</div>
      <div style={{ fontSize: 11, color: C.muted }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export default function ClinicalOps({ scenario, updateScenario, derived }) {
  const a = scenario.assumptions;

  // Discharge rate at steady-state: admissions = discharges = census / ALOS
  const blendedALOS = derived.blendedALOS;
  const normalCensus = derived.totalHard * ((a.currentOccupancy || 78) / 100);
  const dailyDischarges = Math.round(normalCensus / blendedALOS);
  const dailyAdmissions = dailyDischarges; // steady state

  // Surge daily throughput
  const surgeCensus     = derived.peakDay.census;
  const surgeDailyAdmit = a.surgeAdmitRatePerDay || 0;
  const surgeDailyDC    = Math.round(surgeCensus / blendedALOS);

  // Bed turnover rate (annual): admissions per bed per year
  const annualTurnover = (dailyAdmissions * 365) / derived.totalHard;

  // ADT throughput: beds need to be cleaned + prepped between patients
  // EVS turnover time: ~45 min/bed average; at dailyDischarges turnover events
  const evsHoursPerDay = dailyDischarges * 0.75; // 45 min = 0.75 hr
  const evsFTEsForTurnover = Math.ceil(evsHoursPerDay / 8); // 8-hr shift

  // Pharmacy workload
  const avgMedsPerPatient = 8; // average medication orders per patient per day
  const dailyMedOrders = Math.round(normalCensus * avgMedsPerPatient);
  const surgeOrders    = Math.round(surgeCensus  * avgMedsPerPatient);
  const pharmVerificationsPerHour = 40;
  const pharmFTEsNormal = Math.ceil((dailyMedOrders / pharmVerificationsPerHour) / 8);
  const pharmFTEsSurge  = Math.ceil((surgeOrders    / pharmVerificationsPerHour) / 8);

  // PPE daily burn rates by ward
  const ppeBurnByWard = derived.wardData.map(w => {
    const tier = (w.id === 'neg-press' || w.id === 'psych') ? 'airborne'
               : w.id === 'icu' ? 'droplet' : 'standard';
    const p = PPE_PER_PATIENT_DAY[tier];
    const census = w.hardTotal * ((a.currentOccupancy || 78) / 100);
    return {
      ...w, tier, census: Math.round(census),
      n95Daily:    Math.round(census * p.n95),
      gownDaily:   Math.round(census * p.gown),
      gloveDaily:  Math.round(census * p.gloves),
      shieldDaily: Math.round(census * p.shield),
      dailyCost: census * (p.n95 * PPE_UNIT_COST.n95 + p.gown * PPE_UNIT_COST.gown +
                           p.gloves * PPE_UNIT_COST.gloves + p.shield * PPE_UNIT_COST.shield),
    };
  });
  const totalN95Daily    = ppeBurnByWard.reduce((s, w) => s + w.n95Daily, 0);
  const totalGownDaily   = ppeBurnByWard.reduce((s, w) => s + w.gownDaily, 0);
  const totalDailyCost   = ppeBurnByWard.reduce((s, w) => s + w.dailyCost, 0);

  return (
    <div>
      {/* ── Patient Flow Summary ──────────────────────────────────────────────── */}
      <Section title="Daily Patient Flow (Steady State)">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <StatCard label="Daily Admissions"       value={fmt(dailyAdmissions)} color={C.green}   />
          <StatCard label="Daily Discharges"       value={fmt(dailyDischarges)} color={C.blue}    />
          <StatCard label="Daily Census (normal)"  value={fmt(Math.round(normalCensus))} color={C.darkBlue} />
          <StatCard label="Blended ALOS"           value={blendedALOS.toFixed(1) + ' days'} color={C.muted} />
          <StatCard label="Annual Bed Turnover"    value={annualTurnover.toFixed(1) + '×'} sub="admissions/bed/yr" color='#FF8C00' />
        </div>

        <div style={{ padding: '12px 16px', background: '#f0f4ff', borderRadius: 4, fontSize: 13, marginBottom: 12 }}>
          <strong>Surge peak (day {derived.peakDay.day}):</strong>
          &nbsp; {fmt(surgeDailyAdmit)} admissions/day &nbsp;|&nbsp;
          {fmt(surgeDailyDC)} discharges/day &nbsp;|&nbsp;
          {fmt(surgeCensus)} census
          {derived.sdBottleneck > 0 && (
            <span style={{ color: '#D32F2F', fontWeight: 600 }}>
              &nbsp;⚠ Step-down bottleneck: {fmt(derived.sdBottleneck)} excess IMC patients
            </span>
          )}
        </div>

        {/* Step-down flow diagram (text-based) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12, color: C.gray }}>
          {[
            { label: 'ICU Peak Census', value: fmt(derived.wardData.find(w=>w.id==='icu')?.peakSurgeCensus || 0), color: '#7B1010' },
            { label: '→' },
            { label: `ICU→Step-Down (${a.icuStepdownPct}%)`, value: fmt(derived.icuStepDownFlow), color: '#b04060' },
            { label: '→' },
            { label: 'Step-Down Capacity', value: fmt(derived.wardData.find(w=>w.id==='stepdown')?.hardTotal || 0),
              color: derived.sdBottleneck > 0 ? '#D32F2F' : C.green },
            { label: '→' },
            { label: 'Discharge / Med-Surg', value: '…', color: C.blue },
          ].map((item, i) =>
            item.label === '→'
              ? <span key={i} style={{ fontSize: 18, color: C.muted }}>→</span>
              : (
                <div key={i} style={{ padding: '8px 12px', background: '#f4f6fb',
                  borderLeft: `3px solid ${item.color}`, borderRadius: 4, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{item.label}</div>
                </div>
              )
          )}
        </div>
      </Section>

      {/* ── ADT & Bed Turnover ───────────────────────────────────────────────── */}
      <Section title="ADT Throughput & Bed Turnover"
        sub="Bed turnover time directly affects census management. EVS capacity must keep pace with discharge volume.">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <StatCard label="Daily Discharge Events"     value={fmt(dailyDischarges)}         color={C.blue} />
          <StatCard label="EVS Hours/Day (turnover)"   value={evsHoursPerDay.toFixed(0) + ' hrs'} color='#FF8C00' />
          <StatCard label="EVS FTEs for Turnover"      value={evsFTEsForTurnover}            color='#FF8C00'
            sub="Above routine cleaning FTEs" />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: C.darkBlue, color: '#fff' }}>
              {['Ward','Beds','Est. Daily Discharges','ALOS (days)','Turnover Events/yr'].map(h =>
                <th key={h} style={{ padding: '7px 10px', textAlign: h === 'Ward' ? 'left' : 'right' }}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {derived.wardData.map((w, i) => {
              const wardCensus = w.hardTotal * ((a.currentOccupancy || 78) / 100);
              const wardDCDaily = wardCensus / w.alos;
              return (
                <tr key={w.id} style={{ background: i % 2 ? '#f8fafd' : C.white }}>
                  <td style={{ padding: '6px 10px' }}>{w.name}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right' }}>{w.hardTotal}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right' }}>{wardDCDaily.toFixed(1)}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right' }}>{w.alos}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'right' }}>{Math.round(wardDCDaily * 365)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>

      {/* ── Pharmacy Workload ────────────────────────────────────────────────── */}
      <Section title="Pharmacy Workload">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <StatCard label="Daily Med Orders (normal)" value={fmt(dailyMedOrders)} color={C.darkBlue}
            sub={`${avgMedsPerPatient} orders/pt/day × ${fmt(Math.round(normalCensus))} census`} />
          <StatCard label="Daily Med Orders (surge)"  value={fmt(surgeOrders)}    color='#D32F2F'
            sub={`At peak census ${fmt(surgeCensus)}`} />
          <StatCard label="Pharmacist FTEs (normal)"  value={pharmFTEsNormal}     color={C.blue}    />
          <StatCard label="Pharmacist FTEs (surge)"   value={pharmFTEsSurge}      color='#D32F2F'   />
        </div>
        <p style={{ fontSize: 12, color: C.muted }}>
          Assumes {pharmVerificationsPerHour} verifications/hr per pharmacist on 8-hr shift. Coordinate with GENESIS pharmacy module team for order volume projections and automated dispensing cabinet placement in new units.
        </p>
      </Section>

      {/* ── PPE Burn Rate ────────────────────────────────────────────────────── */}
      <Section title="Daily PPE Burn Rate by Ward"
        sub="Calculated at current baseline occupancy. Standard = contact precautions; Droplet = ICU; Airborne = neg-pressure/BH.">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <StatCard label="N95 Masks/Day (total)"  value={fmt(totalN95Daily)}  color='#9966CC' />
          <StatCard label="Isolation Gowns/Day"    value={fmt(totalGownDaily)} color='#FF8C00' />
          <StatCard label="Daily PPE Cost"         value={fmtK(totalDailyCost)} color='#D32F2F' />
          <StatCard label="30-Day Stockpile Cost"  value={fmtK(totalDailyCost * 30)} color='#D32F2F' />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: C.darkBlue, color: '#fff' }}>
              {['Ward','Precautions','Census','N95/day','Gowns/day','Gloves/day','Shields/day','Daily Cost'].map(h =>
                <th key={h} style={{ padding: '7px 10px', textAlign: h === 'Ward' || h === 'Precautions' ? 'left' : 'right' }}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {ppeBurnByWard.filter(w => w.census > 0).map((w, i) => (
              <tr key={w.id} style={{ background: i % 2 ? '#f8fafd' : C.white }}>
                <td style={{ padding: '6px 10px' }}>{w.name}</td>
                <td style={{ padding: '6px 10px', color: C.muted, textTransform: 'capitalize' }}>{w.tier}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{w.census}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmt(w.n95Daily)}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmt(w.gownDaily)}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmt(w.gloveDaily)}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right' }}>{fmt(w.shieldDaily)}</td>
                <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600 }}>{fmtK(w.dailyCost)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: C.darkBlue, color: '#fff', fontWeight: 700 }}>
              <td colSpan={2} style={{ padding: '7px 10px' }}>Total</td>
              <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(Math.round(normalCensus))}</td>
              <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(totalN95Daily)}</td>
              <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmt(totalGownDaily)}</td>
              <td colSpan={2} />
              <td style={{ padding: '7px 10px', textAlign: 'right' }}>{fmtK(totalDailyCost)}</td>
            </tr>
          </tfoot>
        </table>
      </Section>
    </div>
  );
}
