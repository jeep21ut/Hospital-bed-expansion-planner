import { WARDS, FISCAL_YEARS, READINESS_AREAS, ANCILLARY_RATIOS,
         EQUIP_PER_BED, EQUIP_UNIT_COST, PPE_PER_PATIENT_DAY, PPE_UNIT_COST } from './constants';

const STORAGE_KEY = 'mamc-expansion-plan-v2';

// Coverage factor: 3 shifts × relief factor (weekends, PTO, sick) ≈ 4.2
const COV = 4.2;

// ─── Default scenario ──────────────────────────────────────────────────────────
export function defaultScenario(name = 'Baseline Plan') {
  return {
    id: String(Date.now()),
    name,
    description: 'Initial MAMC bed expansion planning scenario.',
    createdAt: new Date().toISOString(),

    // ── Demand / patient-flow assumptions ────────────────────────────────────
    assumptions: {
      populationGrowthRate: 2.5,  // % annual beneficiary growth (DEERS-based)
      avgOccupancyTarget: 85,     // % target inpatient occupancy
      currentOccupancy: 78,       // % current baseline occupancy
      projectionYears: 5,
      // Surge modeling
      surgeAdmitRatePerDay: 20,   // additional admissions/day during surge
      surgeDurationDays: 30,      // how long the admission surge lasts
      icuStepdownPct: 65,         // % of ICU discharges that step down (vs. direct d/c)
    },

    // ── Per-ward inputs ───────────────────────────────────────────────────────
    wards: WARDS.map(w => ({
      id: w.id,
      addedBeds: 0,           // permanent new beds planned
      activationFY: 2028,
      enabled: true,
      // ALOS override (days); null = use ward default from constants
      alosOverride: null,
    })),

    // ── Staffing ──────────────────────────────────────────────────────────────
    staffing: {
      // Current authorized on-board strength (not vacancies)
      currentStrength: {
        RN: 420, LPN: 185, CNA: 98, clerk: 52,
        pharmacist: 34, pharmacy_tech: 72,
        rt: 45,           // Respiratory Therapists
        pct: 110,         // Patient Care Techs
        evs: 85,          // Environmental Services
        case_manager: 38, social_worker: 26,
        pt: 20, ot: 14,
      },
      vacancyRate: 12,           // % current vacancy (authorized vs on-board)
      absenteeRateSurge: 15,     // % additional absenteeism during a surge event
      travelNurseMultiplier: 2.8,// cost multiplier vs. organic RN burdened cost
      organicRNAnnualCost: 95_000,// burdened annual cost per RN FTE ($)
    },

    // ── Financial ─────────────────────────────────────────────────────────────
    financial: {
      capitalAdjPct: 0,   // % adjustment on base MILCON estimates
      omAdjPct: 0,        // % adjustment on base O&M estimates
      // % of total capital obligated each FY (must sum to 100)
      capitalPhasingPct: { 2026: 5, 2027: 45, 2028: 40, 2029: 10, 2030: 0 },
      includeEquipment: true,
      includePPE: true,
      surgeDaysForPPECalc: 30,
    },

    // ── Facilities ────────────────────────────────────────────────────────────
    facilities: {
      planningStartYYYYMM: '2026-04',
    },

    // ── Alternative Care Sites ────────────────────────────────────────────────
    acsSites: [],

    // ── Risk register ─────────────────────────────────────────────────────────
    risks: defaultRisks(),

    // ── EOC readiness (1=Red … 5=Green) ──────────────────────────────────────
    readiness: Object.fromEntries(READINESS_AREAS.map(a => [a.id, 2])),
  };
}

function defaultRisks() {
  return [
    { id: '1', title: 'Staffing shortfalls delay bed activation',             category: 'Workforce',   likelihood: 4, impact: 4, status: 'Open', owner: 'HR',          phase: 'activation',   mitigation: 'Begin recruitment 18 months prior; coordinate with MEDCOM for augmentation authority.' },
    { id: '2', title: 'MILCON cost overruns exceed authorization ceiling',     category: 'Financial',   likelihood: 3, impact: 4, status: 'Open', owner: 'Finance',     phase: 'construction', mitigation: 'Include 15% contingency in MILCON request; pursue phased construction approach.' },
    { id: '3', title: 'GENESIS interface delays bed management go-live',       category: 'Informatics', likelihood: 3, impact: 3, status: 'Open', owner: 'Informatics', phase: 'equipping',    mitigation: 'Engage DHA GENESIS PMO 24 months out; develop parallel manual tracking CONOPS.' },
    { id: '4', title: 'Supply chain delays for specialty medical equipment',   category: 'Logistics',   likelihood: 3, impact: 3, status: 'Open', owner: 'Logistics',   phase: 'construction', mitigation: 'Award procurement contracts 24 months prior; identify qualified alternate vendors.' },
    { id: '5', title: 'Beneficiary population growth exceeds demand model',   category: 'Planning',    likelihood: 2, impact: 3, status: 'Open', owner: 'Med Planner', phase: 'planning',     mitigation: 'Annual revalidation against DEERS data; design for modular expansion.' },
    { id: '6', title: 'Environmental / NEPA compliance delays permits',        category: 'Facilities',  likelihood: 2, impact: 3, status: 'Open', owner: 'Facilities',  phase: 'planning',     mitigation: 'Initiate NEPA review concurrent with design; engage Installation staff early.' },
    { id: '7', title: 'Staff absenteeism during surge degrades coverage',      category: 'Workforce',   likelihood: 4, impact: 4, status: 'Open', owner: 'HR',          phase: 'activation',   mitigation: 'Pre-position agency/travel nurse contracts; activate augmentation authority.' },
    { id: '8', title: 'O2 infrastructure insufficient for surge flow demand',  category: 'Facilities',  likelihood: 3, impact: 5, status: 'Open', owner: 'Facilities',  phase: 'equipping',    mitigation: 'Commission O2 flow study; upgrade manifold / add LOX tank capacity as needed.' },
  ];
}

// ─── Default plan (container for all scenarios) ────────────────────────────────
export function defaultPlan() {
  const s = defaultScenario('Baseline Plan');
  return { activeScenarioId: s.id, scenarios: [s] };
}

// ─── Core derived calculations ─────────────────────────────────────────────────
export function calcDerived(scenario) {
  const a = scenario.assumptions;
  const totalCurrentHard  = WARDS.reduce((s, w) => s + w.hardBeds,  0);
  const totalCurrentSurge = WARDS.reduce((s, w) => s + w.surgeBeds, 0);

  // Per-ward numbers
  const wardData = WARDS.map(ward => {
    const sw      = scenario.wards.find(w => w.id === ward.id) || {};
    const enabled = sw.enabled !== false;
    const added   = enabled ? (sw.addedBeds || 0) : 0;
    const alos    = sw.alosOverride ?? ward.alos;
    const hardTotal   = ward.hardBeds + added;
    const surgeTotal  = ward.surgeBeds;            // surge beds unchanged (convert in-place)

    // Staffing – RN / LPN
    const rnNeed  = Math.ceil((hardTotal / ward.rnRatio) * COV);
    const lpnNeed = ward.lpnRatio ? Math.ceil((hardTotal / ward.lpnRatio) * COV) : 0;

    // Ancillary staff (apply same COV factor)
    const anc = ANCILLARY_RATIOS[ward.id] || {};
    const ancFTEs = {
      rt:  anc.rt  ? Math.ceil((hardTotal / anc.rt)  * COV) : 0,
      pct: anc.pct ? Math.ceil((hardTotal / anc.pct) * COV) : 0,
      evs: anc.evs ? Math.ceil((hardTotal / anc.evs) * COV) : 0,
      clk: anc.clk ? Math.ceil((hardTotal / anc.clk) * COV) : 0,
      cm:  anc.cm  ? Math.ceil((hardTotal / anc.cm)  * COV) : 0,
      ph:  anc.ph  ? Math.ceil((hardTotal / anc.ph)  * COV) : 0,
    };

    // Equipment
    const eq = EQUIP_PER_BED[ward.id] || {};
    const equipment = {
      ivp:  Math.ceil((hardTotal + surgeTotal) * (eq.ivp  || 0)),
      mon:  Math.ceil((hardTotal + surgeTotal) * (eq.mon  || 0)),
      vent: Math.ceil((hardTotal + surgeTotal) * (eq.vent || 0)),
      suc:  Math.ceil((hardTotal + surgeTotal) * (eq.suc  || 0)),
    };

    // O2 demand (L/min at full occupancy)
    const o2LPM = hardTotal * ward.o2LPM;

    // Capital / O&M
    const capAdj = 1 + (scenario.financial.capitalAdjPct || 0) / 100;
    const omAdj  = 1 + (scenario.financial.omAdjPct      || 0) / 100;
    const capCost = added * ward.capitalPerBed * capAdj;
    const omCost  = hardTotal * ward.omPerBed * omAdj;
    const omBase  = ward.hardBeds * ward.omPerBed;

    // Surge: peak census if surge admissions hit this ward (proportional split)
    const wardSharePct = ward.hardBeds / totalCurrentHard;
    const surgeAdmitsPerDay = (a.surgeAdmitRatePerDay || 0) * wardSharePct;
    const peakSurgeCensus   = Math.round(surgeAdmitsPerDay * alos); // steady-state peak

    return {
      ...ward, added, alos, hardTotal, surgeTotal,
      rnNeed, lpnNeed, ancFTEs, equipment, o2LPM,
      capCost, omCost, omIncremental: omCost - omBase,
      peakSurgeCensus,
    };
  });

  // ── Aggregate capacity ──────────────────────────────────────────────────────
  const totalAdded       = wardData.reduce((s, w) => s + w.added,        0);
  const totalHard        = wardData.reduce((s, w) => s + w.hardTotal,    0);
  const totalSurge       = wardData.reduce((s, w) => s + w.surgeTotal,   0);
  const totalCapacity    = totalHard + totalSurge;
  const totalO2LPM       = wardData.reduce((s, w) => s + w.o2LPM,        0);

  // ── Demand projection (planning horizon) ───────────────────────────────────
  const growthRate   = (a.populationGrowthRate || 2.5) / 100;
  const targetOcc    = (a.avgOccupancyTarget   || 85)  / 100;
  const currentCensus= totalCurrentHard * ((a.currentOccupancy || 78) / 100);
  const demandByYear = Array.from({ length: a.projectionYears || 5 }, (_, i) => {
    const yr       = new Date().getFullYear() + i + 1;
    const census   = Math.round(currentCensus * Math.pow(1 + growthRate, i + 1));
    const bedsNeed = Math.ceil(census / targetOcc);
    return { yr, census, bedsNeed, hardAvail: totalHard, totalAvail: totalCapacity };
  });

  // ── Surge census curve (daily, 60-day window) ──────────────────────────────
  const surgeDays = a.surgeDurationDays || 30;
  const R  = a.surgeAdmitRatePerDay || 0;
  // Use a blended ALOS across all wards weighted by bed count
  const blendedALOS = wardData.reduce((s, w) => s + w.alos * w.hardBeds, 0) / totalCurrentHard;
  const surgeCurve = Array.from({ length: 60 }, (_, d) => {
    // Cumulative admissions - cumulative discharges (simplified: discharge rate = census/ALOS)
    let admitCum = 0;
    for (let i = 0; i <= d; i++) admitCum += (i < surgeDays ? R : 0);
    const census = Math.min(Math.round(admitCum * (1 - Math.exp(-(d + 1) / blendedALOS))), totalCapacity);
    return { day: d + 1, census, hardLimit: totalHard, totalLimit: totalCapacity };
  });

  // Peak day
  const peakDay    = surgeCurve.reduce((m, p) => p.census > m.census ? p : m, surgeCurve[0]);

  // Step-down bottleneck: ICU step-downs competing for stepdown beds
  const icuWard     = wardData.find(w => w.id === 'icu');
  const sdWard      = wardData.find(w => w.id === 'stepdown');
  const icuPeakCensus   = icuWard  ? icuWard.peakSurgeCensus  : 0;
  const sdPeakCensus    = sdWard   ? sdWard.peakSurgeCensus   : 0;
  const icuStepDownFlow = Math.round(icuPeakCensus * ((a.icuStepdownPct || 65) / 100));
  const sdBottleneck    = sdWard   ? Math.max(0, icuStepDownFlow - sdWard.hardTotal) : 0;

  // ── Financial totals ────────────────────────────────────────────────────────
  const totalCapital    = wardData.reduce((s, w) => s + w.capCost,        0);
  const totalOM         = wardData.reduce((s, w) => s + w.omCost,         0);
  const incrementalOM   = wardData.reduce((s, w) => s + w.omIncremental,  0);

  const equipCost = scenario.financial.includeEquipment
    ? wardData.reduce((s, w) =>
        s + w.equipment.ivp  * EQUIP_UNIT_COST.ivp
          + w.equipment.mon  * EQUIP_UNIT_COST.mon
          + w.equipment.vent * EQUIP_UNIT_COST.vent
          + w.equipment.suc  * EQUIP_UNIT_COST.suc, 0)
    : 0;

  const ppeDays = scenario.financial.surgeDaysForPPECalc || 30;
  const ppeCost = scenario.financial.includePPE
    ? wardData.reduce((s, w) => {
        const tier = (w.id === 'neg-press' || w.id === 'psych') ? 'airborne'
                   : w.id === 'icu' ? 'droplet' : 'standard';
        const p = PPE_PER_PATIENT_DAY[tier];
        const patDays = w.hardTotal * ppeDays;
        return s + patDays * (
          p.n95 * PPE_UNIT_COST.n95 + p.gown * PPE_UNIT_COST.gown +
          p.gloves * PPE_UNIT_COST.gloves + p.shield * PPE_UNIT_COST.shield
        );
      }, 0)
    : 0;

  // Capital phasing by FY
  const capitalPhasing = FISCAL_YEARS.map(fy => ({
    fy,
    capital: totalCapital * ((scenario.financial.capitalPhasingPct?.[fy] || 0) / 100),
    equipment: fy === 2028 ? equipCost : 0,   // equipment in activation FY
    om: fy >= 2028 ? incrementalOM : 0,
  }));

  // ── Staffing totals ─────────────────────────────────────────────────────────
  const totalRNNeed  = wardData.reduce((s, w) => s + w.rnNeed,  0);
  const totalLPNNeed = wardData.reduce((s, w) => s + w.lpnNeed, 0);
  const totalRTNeed  = wardData.reduce((s, w) => s + w.ancFTEs.rt,  0);
  const totalPCTNeed = wardData.reduce((s, w) => s + w.ancFTEs.pct, 0);
  const totalEVSNeed = wardData.reduce((s, w) => s + w.ancFTEs.evs, 0);

  const { currentStrength, vacancyRate, absenteeRateSurge, travelNurseMultiplier, organicRNAnnualCost } = scenario.staffing;
  const effectiveRN  = Math.round(currentStrength.RN  * (1 - vacancyRate / 100));
  const surgeRN      = Math.round(effectiveRN * (1 - (absenteeRateSurge || 15) / 100));
  const rnGap        = Math.max(0, totalRNNeed - effectiveRN);
  const rnSurgeGap   = Math.max(0, totalRNNeed - surgeRN);
  const travelRNCost = rnSurgeGap * organicRNAnnualCost * (travelNurseMultiplier || 2.8);

  // ── ACS capacity ────────────────────────────────────────────────────────────
  const acsBeds     = (scenario.acsSites || []).reduce((s, site) => s + (site.beds || 0), 0);
  const acsO2Tanks  = (scenario.acsSites || []).filter(s => !s.hasO2 && s.beds > 0)
                        .reduce((s, site) => s + Math.ceil(site.beds * 0.3), 0); // 30% on O2 tanks

  return {
    totalCurrentHard, totalCurrentSurge, totalAdded, totalHard, totalSurge, totalCapacity,
    totalO2LPM, wardData,
    demandByYear, surgeCurve, peakDay, blendedALOS,
    sdBottleneck, icuStepDownFlow,
    totalCapital, totalOM, incrementalOM, equipCost, ppeCost, capitalPhasing,
    totalRNNeed, totalLPNNeed, totalRTNeed, totalPCTNeed, totalEVSNeed,
    effectiveRN, surgeRN, rnGap, rnSurgeGap, travelRNCost,
    acsBeds, acsO2Tanks,
  };
}

// ─── localStorage ──────────────────────────────────────────────────────────────
export function loadPlan() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
export function savePlan(plan) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(plan)); } catch { /* quota */ }
}

// ─── JSON export / import ──────────────────────────────────────────────────────
export function exportPlanJSON(plan) {
  const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), {
    href: url, download: `mamc-plan-${new Date().toISOString().slice(0,10)}.json`,
  }).click();
  URL.revokeObjectURL(url);
}
export function importPlanJSON(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = e => { try { res(JSON.parse(e.target.result)); } catch { rej(new Error('Invalid file')); } };
    r.onerror = () => rej(new Error('Read error'));
    r.readAsText(file);
  });
}

// ─── HICS brief export (HTML → print window) ──────────────────────────────────
export function exportHICS(scenario, derived, roleLabel) {
  const d   = new Date();
  const fmt = n => n.toLocaleString('en-US');
  const fmtM = n => '$' + (n / 1_000_000).toFixed(1) + 'M';

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>HICS Brief — ${scenario.name}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:11pt;margin:20mm;}
  h1{font-size:14pt;color:#092068;border-bottom:2pt solid #092068;padding-bottom:4px;}
  h2{font-size:11pt;color:#092068;margin-top:16px;}
  table{width:100%;border-collapse:collapse;margin-top:8px;}
  th{background:#092068;color:#fff;padding:5px 8px;text-align:left;font-size:9pt;}
  td{padding:4px 8px;border-bottom:1px solid #ccc;font-size:9pt;}
  .kpi{display:inline-block;border:1px solid #5A92CA;padding:8px 14px;margin:4px;border-radius:4px;}
  .kpi .val{font-size:16pt;font-weight:bold;color:#092068;}
  .kpi .lbl{font-size:8pt;color:#666;}
  @media print{body{margin:10mm;}}
</style></head><body>
<h1>MAMC Expansion Planner — HICS Daily Brief</h1>
<p><strong>Scenario:</strong> ${scenario.name} &nbsp;|&nbsp;
   <strong>Prepared for:</strong> ${roleLabel} &nbsp;|&nbsp;
   <strong>Date:</strong> ${d.toLocaleDateString('en-US',{dateStyle:'full'})}</p>

<h2>Capacity Summary</h2>
<div>
  <div class="kpi"><div class="val">${fmt(derived.totalCurrentHard)}</div><div class="lbl">Current Hard Beds</div></div>
  <div class="kpi"><div class="val">${fmt(derived.totalHard)}</div><div class="lbl">Projected Hard Beds</div></div>
  <div class="kpi"><div class="val">${fmt(derived.totalSurge)}</div><div class="lbl">Surge (Soft) Beds</div></div>
  <div class="kpi"><div class="val">${fmt(derived.totalCapacity)}</div><div class="lbl">Total Capacity</div></div>
  <div class="kpi"><div class="val">${fmt(derived.peakDay.census)}</div><div class="lbl">Surge Peak Census</div></div>
</div>

<h2>Staffing</h2>
<table><tr><th>Role</th><th>Required</th><th>Effective On-Board</th><th>Surge Gap</th></tr>
<tr><td>RN</td><td>${fmt(derived.totalRNNeed)}</td><td>${fmt(derived.effectiveRN)}</td><td>${fmt(derived.rnSurgeGap)}</td></tr>
<tr><td>LPN</td><td>${fmt(derived.totalLPNNeed)}</td><td>—</td><td>—</td></tr>
<tr><td>Resp. Therapist</td><td>${fmt(derived.totalRTNeed)}</td><td>—</td><td>—</td></tr>
</table>

<h2>Financial</h2>
<table><tr><th>Item</th><th>Estimate</th></tr>
<tr><td>MILCON Capital</td><td>${fmtM(derived.totalCapital)}</td></tr>
<tr><td>Equipment</td><td>${fmtM(derived.equipCost)}</td></tr>
<tr><td>Annual Incremental O&amp;M</td><td>${fmtM(derived.incrementalOM)}</td></tr>
<tr><td>Surge PPE (${scenario.financial.surgeDaysForPPECalc || 30} days)</td><td>${fmtM(derived.ppeCost)}</td></tr>
<tr><td>Travel Nurse Surge Cost (annualized)</td><td>${fmtM(derived.travelRNCost)}</td></tr>
</table>

<h2>Risk Status</h2>
<table><tr><th>Risk</th><th>L</th><th>I</th><th>Status</th><th>Owner</th></tr>
${scenario.risks.map(r => `<tr><td>${r.title}</td><td>${r.likelihood}</td><td>${r.impact}</td><td>${r.status}</td><td>${r.owner}</td></tr>`).join('')}
</table>

<p style="margin-top:24px;font-size:8pt;color:#666;">
FOUO — FOR OFFICIAL USE ONLY. Generated by MAMC Expansion Planner. Not for public release.
</p></body></html>`;

  const w = window.open('', '_blank', 'width=900,height=700');
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 500);
}
