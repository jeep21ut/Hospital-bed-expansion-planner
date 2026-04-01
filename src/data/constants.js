// ─── Ward / Bed Definitions ────────────────────────────────────────────────────
// hardBeds:      currently licensed & staffed beds (permanent capacity)
// surgeBeds:     soft "convert in place" capacity (PACU→ICU, doubles, cots)
// capitalPerBed: MILCON cost per NEW permanent bed ($)
// omPerBed:      annual O&M per total bed (existing + new) ($)
// rnRatio:       patients per RN per 12-hr shift
// lpnRatio:      patients per LPN per 12-hr shift (null = RN-only unit)
// o2LPM:         estimated peak O2 demand per occupied bed (L/min)
// alos:          default Average Length of Stay (days)
// ventPct:       % of beds requiring a ventilator at surge peak

export const WARDS = [
  { id: 'ed',        name: 'Emergency / Holds',       unit: 'ED',              hardBeds: 12, surgeBeds: 8,  capitalPerBed:   550_000, omPerBed: 165_000, rnRatio: 3,   lpnRatio: null, o2LPM: 10, alos: 0.5, ventPct: 0,    color: '#D32F2F' },
  { id: 'icu',       name: 'ICU / SICU',              unit: 'Critical Care',   hardBeds: 20, surgeBeds: 6,  capitalPerBed: 1_200_000, omPerBed: 280_000, rnRatio: 2,   lpnRatio: null, o2LPM: 35, alos: 4.5, ventPct: 60,   color: '#7B1010' },
  { id: 'stepdown',  name: 'Step-Down / Telemetry',   unit: 'IMC / Telem',     hardBeds: 16, surgeBeds: 4,  capitalPerBed:   700_000, omPerBed: 160_000, rnRatio: 3,   lpnRatio: 6,    o2LPM: 8,  alos: 3.0, ventPct: 5,    color: '#b04060' },
  { id: 'med-surg',  name: 'Medical / Surgical',      unit: '4W / 5W',         hardBeds: 48, surgeBeds: 12, capitalPerBed:   450_000, omPerBed: 110_000, rnRatio: 5.5, lpnRatio: 11,   o2LPM: 4,  alos: 3.5, ventPct: 0,    color: '#5A92CA' },
  { id: 'neg-press', name: 'Neg Pressure / Isolation',unit: 'Isolation',       hardBeds: 8,  surgeBeds: 0,  capitalPerBed:   900_000, omPerBed: 200_000, rnRatio: 3,   lpnRatio: null, o2LPM: 6,  alos: 6.0, ventPct: 15,   color: '#6A0DAD' },
  { id: 'peds',      name: 'Pediatrics',              unit: 'PEDS',            hardBeds: 18, surgeBeds: 4,  capitalPerBed:   500_000, omPerBed: 130_000, rnRatio: 4,   lpnRatio: 8,    o2LPM: 3,  alos: 2.5, ventPct: 5,    color: '#5AAC45' },
  { id: 'ob',        name: 'OB / Maternity',          unit: 'L&D / Postpartum',hardBeds: 22, surgeBeds: 4,  capitalPerBed:   550_000, omPerBed: 140_000, rnRatio: 3.5, lpnRatio: 7,    o2LPM: 3,  alos: 2.5, ventPct: 0,    color: '#C8960C' },
  { id: 'psych',     name: 'Psychiatric / BH',        unit: 'Behavioral Hlth', hardBeds: 30, surgeBeds: 0,  capitalPerBed:   350_000, omPerBed: 120_000, rnRatio: 7,   lpnRatio: 10,   o2LPM: 1,  alos: 8.0, ventPct: 0,    color: '#9966CC' },
  { id: 'ortho',     name: 'Orthopedics',             unit: 'Ortho / Sports',  hardBeds: 24, surgeBeds: 4,  capitalPerBed:   500_000, omPerBed: 120_000, rnRatio: 5,   lpnRatio: 10,   o2LPM: 3,  alos: 2.5, ventPct: 0,    color: '#FF8C00' },
  { id: 'oncology',  name: 'Oncology / Hematology',   unit: 'Oncology',        hardBeds: 12, surgeBeds: 2,  capitalPerBed:   600_000, omPerBed: 150_000, rnRatio: 4.5, lpnRatio: 9,    o2LPM: 4,  alos: 4.0, ventPct: 0,    color: '#20B2AA' },
  { id: 'neuro',     name: 'Neurology / Neurosurg',   unit: 'Neuro',           hardBeds: 16, surgeBeds: 2,  capitalPerBed:   600_000, omPerBed: 140_000, rnRatio: 4.5, lpnRatio: 9,    o2LPM: 4,  alos: 4.0, ventPct: 10,   color: '#4169E1' },
  { id: 'rehab',     name: 'Rehabilitation',          unit: 'PMR',             hardBeds: 18, surgeBeds: 0,  capitalPerBed:   400_000, omPerBed: 100_000, rnRatio: 6,   lpnRatio: 8,    o2LPM: 2,  alos: 12,  ventPct: 0,    color: '#228B22' },
];

// ─── Roles ─────────────────────────────────────────────────────────────────────
export const ROLES = [
  { id: 'director',      label: 'Hospital Director',           abbr: 'DIR'   },
  { id: 'deputy-clin',   label: 'Dep Cdr Clinical',            abbr: 'DCC'   },
  { id: 'deputy-admin',  label: 'Dep Cdr Admin / Resources',   abbr: 'DCA'   },
  { id: 'med-planner',   label: 'Medical Planner',             abbr: 'PLAN'  },
  { id: 'finance',       label: 'Finance (Resource Mgmt)',     abbr: 'FINS'  },
  { id: 'hr',            label: 'Human Resources',             abbr: 'HR'    },
  { id: 'logistics',     label: 'Logistics (S4)',              abbr: 'LOG'   },
  { id: 'facilities',    label: 'Facilities / Engineer',       abbr: 'FAC'   },
  { id: 'informatics',   label: 'Informatics / GENESIS',       abbr: 'INFO'  },
  { id: 'patient-admin', label: 'Patient Administration',      abbr: 'PAD'   },
  { id: 'clinical',      label: 'Clinical Support / Nursing',  abbr: 'NSG'   },
  { id: 'pharmacy',      label: 'Clinical Pharmaceutical',     abbr: 'PHARM' },
  { id: 'eoc',           label: 'Emergency Operations Ctr',    abbr: 'EOC'   },
  { id: 'public-affairs',label: 'Public Affairs',              abbr: 'PA'    },
  { id: 'maintenance',   label: 'Medical Maintenance',         abbr: 'MAINT' },
  { id: 'patient-log',   label: 'Patient Logistics Ctr (PLC)', abbr: 'PLC'   },
];

const ALL = ROLES.map(r => r.id);

// ─── Tabs ──────────────────────────────────────────────────────────────────────
export const TABS = [
  { id: 'dashboard',  label: 'Dashboard',    roles: ALL },
  { id: 'scenarios',  label: 'Scenarios',    roles: ['director','deputy-clin','deputy-admin','med-planner','finance'] },
  { id: 'staffing',   label: 'Staffing',     roles: ['director','deputy-clin','deputy-admin','hr','clinical','med-planner'] },
  { id: 'financial',  label: 'Financial',    roles: ['director','deputy-admin','finance','med-planner'] },
  { id: 'facilities', label: 'Facilities',   roles: ['director','deputy-admin','facilities','logistics','maintenance','med-planner'] },
  { id: 'clin-ops',   label: 'Clinical Ops', roles: ['director','deputy-clin','med-planner','patient-admin','clinical','pharmacy','patient-log','informatics'] },
  { id: 'risk',       label: 'Risk / EOC',   roles: ['director','deputy-clin','deputy-admin','eoc','med-planner','logistics'] },
  { id: 'briefs',     label: 'Briefs',       roles: ALL },
];

// ─── Ancillary staff ratios (patients per FTE per shift) ───────────────────────
// Keyed by ward id; null = not applicable
export const ANCILLARY_RATIOS = {
  //            RT     Pharm  PCT    EVS    Clerk  CaseMgr
  'icu':      { rt: 4,  ph: 20, pct: 3,  evs: 15, clk: 25, cm: 15 },
  'stepdown': { rt: 8,  ph: 25, pct: 4,  evs: 18, clk: 30, cm: 18 },
  'ed':       { rt: 6,  ph: 20, pct: 4,  evs: 12, clk: 20, cm: 20 },
  'neg-press':{ rt: 4,  ph: 20, pct: 3,  evs: 10, clk: 25, cm: 15 },
  'med-surg': { rt: 12, ph: 30, pct: 6,  evs: 20, clk: 35, cm: 20 },
  'peds':     { rt: 10, ph: 28, pct: 5,  evs: 18, clk: 30, cm: 22 },
  'ob':       { rt: 15, ph: 30, pct: 5,  evs: 20, clk: 30, cm: 20 },
  'psych':    { rt: null,ph:30, pct: 8,  evs: 20, clk: 35, cm: 12 },
  'ortho':    { rt: 15, ph: 30, pct: 6,  evs: 20, clk: 35, cm: 18 },
  'oncology': { rt: 12, ph: 20, pct: 5,  evs: 18, clk: 30, cm: 15 },
  'neuro':    { rt: 8,  ph: 25, pct: 5,  evs: 18, clk: 30, cm: 18 },
  'rehab':    { rt: 10, ph: 35, pct: 5,  evs: 20, clk: 40, cm: 14 },
};

// ─── Equipment per occupied bed ────────────────────────────────────────────────
export const EQUIP_PER_BED = {
  //           IV pumps  Monitors  Vents*  Suction
  'icu':      { ivp: 4, mon: 1, vent: 0.6, suc: 1 },
  'stepdown': { ivp: 3, mon: 1, vent: 0.05,suc: 0.5 },
  'ed':       { ivp: 2, mon: 1, vent: 0.1, suc: 0.5 },
  'neg-press':{ ivp: 3, mon: 1, vent: 0.15,suc: 1 },
  'med-surg': { ivp: 2, mon: 0.5,vent: 0,  suc: 0.3 },
  'peds':     { ivp: 2, mon: 0.8,vent: 0.05,suc:0.4 },
  'ob':       { ivp: 2, mon: 1, vent: 0,  suc: 0.3 },
  'psych':    { ivp: 0.5,mon:0, vent: 0,  suc: 0 },
  'ortho':    { ivp: 2, mon: 0.5,vent: 0,  suc: 0.3 },
  'oncology': { ivp: 3, mon: 0.5,vent: 0,  suc: 0.3 },
  'neuro':    { ivp: 2, mon: 1, vent: 0.1, suc: 0.5 },
  'rehab':    { ivp: 1, mon: 0.2,vent: 0,  suc: 0 },
};

// Unit costs for equipment (per item, $)
export const EQUIP_UNIT_COST = { ivp: 8_000, mon: 12_000, vent: 35_000, suc: 1_500 };

// ─── PPE burn rates (units per patient-day, isolation precautions) ─────────────
export const PPE_PER_PATIENT_DAY = {
  standard: { n95: 2,  gown: 4,  gloves: 6,  shield: 0.5 },
  droplet:  { n95: 4,  gown: 8,  gloves: 12, shield: 1   },
  airborne: { n95: 6,  gown: 12, gloves: 16, shield: 2   }, // neg-press / BH
};

// Unit cost for PPE ($)
export const PPE_UNIT_COST = { n95: 1.80, gown: 0.90, gloves: 0.15, shield: 3.00 };

// ─── Alternative Care Site (ACS) templates ─────────────────────────────────────
export const ACS_TEMPLATES = [
  { id: 'cafeteria', label: 'Cafeteria',          sqftPerBed: 80,  hasO2: false, hasPlumbing: true,  maxBeds: 60  },
  { id: 'gym',       label: 'Gymnasium',          sqftPerBed: 80,  hasO2: false, hasPlumbing: false, maxBeds: 120 },
  { id: 'conf',      label: 'Conference Rooms',   sqftPerBed: 60,  hasO2: false, hasPlumbing: false, maxBeds: 30  },
  { id: 'tent',      label: 'Parking Lot Tent',   sqftPerBed: 70,  hasO2: false, hasPlumbing: false, maxBeds: 200 },
  { id: 'annex',     label: 'Building Annex',     sqftPerBed: 100, hasO2: true,  hasPlumbing: true,  maxBeds: 80  },
];

// ─── Fiscal years ──────────────────────────────────────────────────────────────
export const FISCAL_YEARS = [2026, 2027, 2028, 2029, 2030];

// ─── Construction phases ────────────────────────────────────────────────────────
export const PHASES = [
  { id: 'planning',     label: 'Planning & Design',         months: 12, color: '#5A92CA' },
  { id: 'construction', label: 'Construction / Renovation', months: 18, color: '#FF8C00' },
  { id: 'equipping',    label: 'Equipping & Commission',    months:  4, color: '#C8960C' },
  { id: 'activation',   label: 'Activation & Training',     months:  3, color: '#5AAC45' },
];

// ─── Risk ─────────────────────────────────────────────────────────────────────
export const RISK_CATEGORIES = ['Workforce','Financial','Informatics','Logistics','Facilities','Planning','Clinical','Policy'];
export const LIKELIHOOD_LABELS = ['Rare','Unlikely','Possible','Likely','Almost Certain'];
export const IMPACT_LABELS     = ['Negligible','Minor','Moderate','Major','Catastrophic'];

// ─── EOC readiness areas ────────────────────────────────────────────────────────
export const READINESS_AREAS = [
  { id: 'clinical',  label: 'Clinical Readiness',   owner: 'deputy-clin'   },
  { id: 'staffing',  label: 'Staffing / Manning',   owner: 'hr'            },
  { id: 'supply',    label: 'Supply & Equipment',   owner: 'logistics'     },
  { id: 'facilities',label: 'Facilities Readiness', owner: 'facilities'    },
  { id: 'it',        label: 'IT / GENESIS',         owner: 'informatics'   },
  { id: 'finance',   label: 'Funding Obligated',    owner: 'finance'       },
  { id: 'padmin',    label: 'Patient Admin Ready',  owner: 'patient-admin' },
  { id: 'pharmacy',  label: 'Pharmacy Readiness',   owner: 'pharmacy'      },
];

export const RAG = s =>
  s >= 4 ? { bg: '#d4edda', border: '#5AAC45', text: '#155724', label: 'Green' } :
  s >= 3 ? { bg: '#fff3cd', border: '#C8960C', text: '#856404', label: 'Amber' } :
           { bg: '#f8d7da', border: '#D32F2F', text: '#721c24', label: 'Red'   };

// DHA brand colours
export const C = {
  darkBlue: '#092068', blue: '#5A92CA', green: '#5AAC45',
  yellow: '#FFD041', maroon: '#582831', gray: '#333333',
  bg: '#f4f6fb', white: '#ffffff', border: '#d0daea',
  muted: '#6b8faa',
};
