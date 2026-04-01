import { C, ROLES, READINESS_AREAS, RAG } from '../data/constants';
import { exportHICS } from '../data/model';

const fmt  = n => Number(n).toLocaleString('en-US');
const fmtM = n => '$' + (n / 1_000_000).toFixed(1) + 'M';

function KPI({ label, value, color }) {
  return (
    <div style={{ flex: '1 1 130px', padding: '12px 16px', background: '#f4f6fb',
      borderLeft: `3px solid ${color || C.blue}`, borderRadius: 4 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: color || C.darkBlue }}>{value}</div>
      <div style={{ fontSize: 11, color: C.muted }}>{label}</div>
    </div>
  );
}

// Content definitions per role
function briefContent(role, scenario, derived, roleLabel) {
  const a   = scenario.assumptions;
  const fin = scenario.financial;

  const common = {
    scenario: scenario.name,
    preparedFor: roleLabel,
    date: new Date().toLocaleDateString('en-US', { dateStyle: 'full' }),
  };

  switch (role) {
    case 'director':
    case 'deputy-clin':
    case 'deputy-admin':
    case 'med-planner':
      return {
        ...common,
        title: 'Executive Capacity Expansion Summary',
        kpis: [
          { label: 'Current Hard Beds',  value: fmt(derived.totalCurrentHard),  color: C.darkBlue },
          { label: 'Projected Hard Beds',value: fmt(derived.totalHard),          color: C.green    },
          { label: 'Total w/ Surge',     value: fmt(derived.totalCapacity),      color: C.blue     },
          { label: 'Surge Peak Census',  value: fmt(derived.peakDay.census),     color: derived.peakDay.census > derived.totalHard ? '#D32F2F' : C.blue },
          { label: 'MILCON + Equipment', value: fmtM(derived.totalCapital + derived.equipCost), color: C.darkBlue },
          { label: 'Annual Incr. O&M',   value: fmtM(derived.incrementalOM),    color: '#FF8C00'  },
        ],
        bullets: [
          `Beneficiary population growing at ${a.populationGrowthRate}%/yr; ${a.projectionYears}-year demand model shows ${fmt(derived.demandByYear.slice(-1)[0]?.bedsNeed)} beds required by ${derived.demandByYear.slice(-1)[0]?.yr}.`,
          derived.peakDay.census > derived.totalHard
            ? `⚠ Surge model peak (${fmt(derived.peakDay.census)}) exceeds projected hard bed capacity by ${fmt(derived.peakDay.census - derived.totalHard)} — surge (soft) beds will be activated.`
            : `Surge model peak (${fmt(derived.peakDay.census)} on day ${derived.peakDay.day}) is within projected capacity.`,
          derived.rnSurgeGap > 0
            ? `Staffing: ${fmt(derived.rnSurgeGap)} additional RNs required for surge; estimated travel nurse cost ${fmtM(derived.travelRNCost)}/yr.`
            : 'Staffing: Current RN strength is sufficient for projected hard bed capacity.',
          derived.sdBottleneck > 0
            ? `⚠ Step-down bottleneck: ${fmt(derived.sdBottleneck)} ICU step-down patients will lack step-down beds — monitor closely and consider additional IMC beds.`
            : 'No step-down bottleneck identified at current ALOS/ICU assumptions.',
          `Total 5-year investment estimate: ${fmtM(derived.totalCapital + derived.equipCost + derived.incrementalOM * 5)}.`,
        ],
      };

    case 'finance':
      return {
        ...common,
        title: 'Financial Planning Summary',
        kpis: [
          { label: 'MILCON Capital',       value: fmtM(derived.totalCapital),    color: C.darkBlue },
          { label: 'Equipment',            value: fmtM(derived.equipCost),        color: C.blue     },
          { label: 'PPE Stockpile',        value: fmtM(derived.ppeCost),          color: '#9966CC'  },
          { label: 'Annual Incr. O&M',     value: fmtM(derived.incrementalOM),   color: '#FF8C00'  },
          { label: 'Travel Nurse (surge)', value: fmtM(derived.travelRNCost),    color: '#D32F2F'  },
        ],
        bullets: [
          `MILCON capital: ${fmtM(derived.totalCapital)}. Capital adjustment applied: ${fin.capitalAdjPct > 0 ? '+' : ''}${fin.capitalAdjPct}%.`,
          `FY budget phasing: ${Object.entries(fin.capitalPhasingPct || {}).filter(([,v])=>v>0).map(([fy,pct])=>`FY${fy} ${pct}%`).join(', ')}.`,
          `Annual incremental O&M: ${fmtM(derived.incrementalOM)} beginning in activation year.`,
          fin.includeEquipment ? `Equipment (vents, IV pumps, monitors): ${fmtM(derived.equipCost)}.` : 'Equipment not included in this estimate.',
          fin.includePPE ? `PPE surge stockpile (${fin.surgeDaysForPPECalc} days): ${fmtM(derived.ppeCost)}.` : 'PPE not included in this estimate.',
          `5-year total (MILCON + equip + O&M): ${fmtM(derived.totalCapital + derived.equipCost + derived.incrementalOM * 5)}.`,
        ],
      };

    case 'hr':
      return {
        ...common,
        title: 'Human Resources Staffing Brief',
        kpis: [
          { label: 'RN FTEs Required',    value: fmt(derived.totalRNNeed),    color: C.darkBlue },
          { label: 'RN On-Board',         value: fmt(derived.effectiveRN),    color: C.blue     },
          { label: 'RN Surge Gap',        value: fmt(derived.rnSurgeGap),     color: derived.rnSurgeGap > 0 ? '#D32F2F' : C.green },
          { label: 'LPN FTEs Required',   value: fmt(derived.totalLPNNeed),   color: C.darkBlue },
          { label: 'RT FTEs Required',    value: fmt(derived.totalRTNeed),    color: '#FF8C00'  },
        ],
        bullets: [
          `All FTE calculations use a 4.2× coverage factor (3 shifts × PTO/weekend relief).`,
          `Current vacancy rate: ${scenario.staffing.vacancyRate}%. Effective RN workforce: ${fmt(derived.effectiveRN)}.`,
          `During a surge event with ${scenario.staffing.absenteeRateSurge}% absenteeism: only ${fmt(derived.surgeRN)} RNs available vs ${fmt(derived.totalRNNeed)} required.`,
          derived.rnSurgeGap > 0
            ? `⚠ Pre-position agency contracts for ${fmt(derived.rnSurgeGap)} travel RNs. Estimated cost: ${fmtM(derived.travelRNCost)}/yr at ${scenario.staffing.travelNurseMultiplier}× burdened rate.`
            : 'Staffing gap is within current capacity. Monitor vacancy rate quarterly.',
          `Ancillary staff also required: ${fmt(derived.totalRTNeed)} RTs, ${fmt(derived.totalPCTNeed)} PCTs, ${fmt(derived.totalEVSNeed)} EVS FTEs.`,
          `Recommend initiating clinical recruitment at least 18 months before activation date.`,
        ],
      };

    case 'logistics':
      return {
        ...common,
        title: 'Logistics & Supply Chain Brief',
        kpis: [
          { label: 'Ventilators Required',  value: fmt(Math.round(derived.wardData.reduce((s,w)=>s+w.equipment.vent,0))), color: '#D32F2F' },
          { label: 'IV Pumps Required',     value: fmt(derived.wardData.reduce((s,w)=>s+w.equipment.ivp,0)),              color: C.darkBlue },
          { label: 'Monitors Required',     value: fmt(Math.round(derived.wardData.reduce((s,w)=>s+w.equipment.mon,0))),   color: C.blue     },
          { label: 'Equipment Total',       value: fmtM(derived.equipCost),                                               color: '#FF8C00'  },
          { label: 'PPE Stockpile',         value: fmtM(derived.ppeCost),                                                 color: '#9966CC'  },
        ],
        bullets: [
          `Equipment procurement lead time: 12–24 months for ventilators; 6–12 months for IV pumps and monitors. Begin procurement 24 months before activation.`,
          `ACS sites requiring portable O₂: ${derived.acsO2Tanks > 0 ? derived.acsO2Tanks + ' cylinder deliveries/day estimated' : 'None — all ACS sites have piped O₂ or are unoccupied'}.`,
          `PPE 30-day surge stockpile: ${fmtM(derived.ppeCost)}.`,
          `Total equipment investment: ${fmtM(derived.equipCost)}.`,
          `Recommend DLA long-term vendor agreements for critical medical equipment categories.`,
        ],
      };

    case 'facilities':
    case 'maintenance':
      return {
        ...common,
        title: 'Facilities & Engineering Brief',
        kpis: [
          { label: 'New Permanent Beds', value: fmt(derived.totalAdded),          color: C.green    },
          { label: 'Peak O₂ Demand',     value: fmt(Math.round(derived.totalO2LPM)) + ' LPM', color: '#D32F2F' },
          { label: 'MILCON Capital',     value: fmtM(derived.totalCapital),       color: C.darkBlue },
        ],
        bullets: [
          `Planning start: ${scenario.facilities?.planningStartYYYYMM || 'TBD'}. Total project duration ~37 months.`,
          `O₂ peak demand at full occupancy: ${fmt(Math.round(derived.totalO2LPM))} L/min. ${derived.totalO2LPM > 400 ? '⚠ Manifold capacity study required.' : 'Within standard manifold range.'}`,
          `Negative pressure rooms (${derived.wardData.find(w=>w.id==='neg-press')?.hardTotal || 8} beds) require dedicated HVAC design.`,
          `Initiate NEPA/environmental review concurrent with design to avoid permit delays.`,
          `Include 15% contingency in MILCON request based on current market conditions.`,
        ],
      };

    case 'eoc':
      return {
        ...common,
        title: 'Emergency Operations Center (EOC) Brief',
        kpis: [
          { label: 'Hard Bed Capacity',  value: fmt(derived.totalHard),           color: C.darkBlue },
          { label: 'Surge Capacity',     value: fmt(derived.totalCapacity),        color: C.blue     },
          { label: 'ACS Beds',           value: fmt(derived.acsBeds),              color: '#FF8C00'  },
          { label: 'Surge Peak Census',  value: fmt(derived.peakDay.census),       color: derived.peakDay.census > derived.totalHard ? '#D32F2F' : C.green },
          { label: 'Surge Peak Day',     value: 'Day ' + derived.peakDay.day,     color: C.muted    },
        ],
        bullets: [
          `Surge model: ${fmt(scenario.assumptions.surgeAdmitRatePerDay)} admits/day for ${scenario.assumptions.surgeDurationDays} days → peak census ${fmt(derived.peakDay.census)} on day ${derived.peakDay.day}.`,
          derived.peakDay.census > derived.totalCapacity
            ? `🚨 CRITICAL: Surge peak EXCEEDS total capacity. Request mutual aid / regional transfer coordination.`
            : derived.peakDay.census > derived.totalHard
            ? `⚠ Surge peak exceeds hard beds. Activate surge (soft) bed CONOPS. ${fmt(derived.totalCapacity - derived.peakDay.census)} bed buffer remains.`
            : `✅ Surge peak within hard bed capacity. ${fmt(derived.totalHard - derived.peakDay.census)} bed buffer.`,
          derived.sdBottleneck > 0
            ? `⚠ Step-down bottleneck: activate transfer agreements to manage ${fmt(derived.sdBottleneck)} displaced IMC patients.`
            : 'No step-down bottleneck at current assumptions.',
          `ACS sites available: ${(scenario.acsSites || []).length} sites, ${fmt(derived.acsBeds)} beds. Non-piped O₂ needs: ${derived.acsO2Tanks} cylinder deliveries/day.`,
          `Highest risks: ${scenario.risks.filter(r=>r.likelihood*r.impact>=15).map(r=>r.title).join('; ') || 'None critical at this time'}.`,
        ],
      };

    default:
      return {
        ...common,
        title: `${roleLabel} — Planning Brief`,
        kpis: [
          { label: 'Current Hard Beds',   value: fmt(derived.totalCurrentHard),  color: C.darkBlue },
          { label: 'Projected Hard Beds', value: fmt(derived.totalHard),          color: C.green    },
          { label: 'Total Capacity',      value: fmt(derived.totalCapacity),      color: C.blue     },
          { label: 'Surge Peak Census',   value: fmt(derived.peakDay.census),     color: C.blue     },
        ],
        bullets: [
          `Scenario: ${scenario.name}.`,
          `Beneficiary growth: ${a.populationGrowthRate}%/yr; target occupancy ${a.avgOccupancyTarget}%.`,
          `${fmt(derived.totalAdded)} permanent new beds planned; ${fmt(derived.totalCurrentSurge)} surge (soft) beds available.`,
          `Contact your functional lead for detailed planning information specific to your directorate.`,
        ],
      };
  }
}

export default function Briefs({ scenario, derived, role, roleLabel }) {
  const content = briefContent(role, scenario, derived, roleLabel);

  return (
    <div>
      {/* Print / HICS export bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, justifyContent: 'flex-end' }}>
        <button onClick={() => exportHICS(scenario, derived, roleLabel)}
          style={{ border: `1px solid ${C.blue}`, borderRadius: 4, padding: '7px 18px',
            background: C.white, color: C.blue, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          Export HICS Brief (Print)
        </button>
        <button onClick={() => window.print()}
          style={{ border: `1px solid ${C.muted}`, borderRadius: 4, padding: '7px 18px',
            background: C.white, color: C.gray, cursor: 'pointer', fontSize: 13 }}>
          Print This View
        </button>
      </div>

      {/* Brief card */}
      <div style={{ background: C.white, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,.1)',
        overflow: 'hidden', maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ background: C.darkBlue, color: '#fff', padding: '20px 28px' }}>
          <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>MAMC EXPANSION PLANNER — PLANNING BRIEF</div>
          <h2 style={{ margin: 0, fontSize: 18 }}>{content.title}</h2>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <span>Scenario: <strong>{content.scenario}</strong></span>
            <span>Prepared for: <strong>{content.preparedFor}</strong></span>
            <span>Date: <strong>{content.date}</strong></span>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ padding: '18px 28px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {content.kpis.map(k => <KPI key={k.label} {...k} />)}
          </div>
        </div>

        {/* Bullets */}
        <div style={{ padding: '18px 28px', borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ color: C.darkBlue, fontSize: 13, marginBottom: 12 }}>Key Planning Considerations</h3>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {content.bullets.map((b, i) => (
              <li key={i} style={{ fontSize: 13, color: C.gray, marginBottom: 8, lineHeight: 1.5 }}>{b}</li>
            ))}
          </ul>
        </div>

        {/* Readiness panel */}
        <div style={{ padding: '18px 28px', borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ color: C.darkBlue, fontSize: 13, marginBottom: 12 }}>Directorate Readiness Status</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {READINESS_AREAS.map(area => {
              const score = scenario.readiness?.[area.id] || 1;
              const rag   = RAG(score);
              return (
                <div key={area.id} style={{ padding: '6px 12px', background: rag.bg,
                  border: `1px solid ${rag.border}`, borderRadius: 4, fontSize: 11 }}>
                  <span style={{ fontWeight: 700, color: rag.text }}>{rag.label}</span>
                  <span style={{ color: C.gray, marginLeft: 6 }}>{area.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 28px', background: '#f8fafd' }}>
          <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>
            FOUO — FOR OFFICIAL USE ONLY. Generated by MAMC Expansion Planner. Not for public release.
            All estimates are planning-level and subject to change pending detailed design and programming.
          </p>
        </div>
      </div>

      {/* Role selector prompt */}
      <p style={{ textAlign: 'center', color: C.muted, fontSize: 12, marginTop: 16 }}>
        Viewing as <strong>{roleLabel}</strong>. Change role in the top bar to see a different directorate's brief.
      </p>
    </div>
  );
}
