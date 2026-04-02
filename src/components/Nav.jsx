import { useRef } from 'react';
import { ROLES, C } from '../data/constants';
import { defaultScenario, exportPlanJSON, importPlanJSON } from '../data/model';
import WorldClock from './WorldClock';

export default function Nav({ plan, setPlan, role, setRole, tab, setTab, visibleTabs, saved, scenario }) {
  const importRef = useRef();

  const addScenario = () => {
    const name = prompt('New scenario name:', 'Scenario ' + (plan.scenarios.length + 1));
    if (!name) return;
    const s = defaultScenario(name);
    setPlan(p => ({ ...p, activeScenarioId: s.id, scenarios: [...p.scenarios, s] }));
  };

  const switchScenario = id => setPlan(p => ({ ...p, activeScenarioId: id }));

  const handleImport = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imported = await importPlanJSON(file);
      setPlan(imported);
    } catch { alert('Could not import plan file.'); }
    e.target.value = '';
  };

  const hdr = { background: C.darkBlue, color: '#fff' };
  const btnBase = { border: 'none', cursor: 'pointer', borderRadius: 3, padding: '4px 10px', fontSize: 12 };

  return (
    <header>
      {/* World clock + Julian date */}
      <WorldClock />

      {/* Top bar */}
      <div style={{ ...hdr, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Branding */}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: 0.5 }}>MAMC Expansion Planner</div>
          <div style={{ fontSize: 11, opacity: 0.75 }}>Defense Health Agency — Madigan Army Medical Center</div>
        </div>

        {/* Scenario selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, opacity: 0.8 }}>Scenario:</span>
          <select
            value={plan.activeScenarioId}
            onChange={e => switchScenario(e.target.value)}
            style={{ fontSize: 12, padding: '3px 6px', borderRadius: 3, border: 'none', background: '#1a3580', color: '#fff', cursor: 'pointer' }}
          >
            {plan.scenarios.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={addScenario} title="Add scenario"
            style={{ ...btnBase, background: '#2a4a90', color: '#fff', fontWeight: 700, padding: '4px 8px' }}>+</button>
        </div>

        {/* Role selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, opacity: 0.8 }}>Viewing as:</span>
          <select
            value={role} onChange={e => setRole(e.target.value)}
            style={{ fontSize: 12, padding: '3px 6px', borderRadius: 3, border: 'none', background: '#1a3580', color: '#fff', cursor: 'pointer' }}
          >
            {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => exportPlanJSON(plan)}
            style={{ ...btnBase, background: C.blue, color: '#fff' }} title="Export plan as JSON">
            Export
          </button>
          <button onClick={() => importRef.current.click()}
            style={{ ...btnBase, background: '#4a6090', color: '#fff' }} title="Import plan JSON">
            Import
          </button>
          <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
          <button onClick={() => window.print()}
            style={{ ...btnBase, background: '#4a6090', color: '#fff' }} title="Print current view">
            Print
          </button>
        </div>

        {/* Save indicator */}
        <div style={{ fontSize: 11, opacity: 0.6, minWidth: 60 }}>
          {saved ? '✓ Saved' : '…saving'}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: '#0d2878', display: 'flex', gap: 2, padding: '0 20px', overflowX: 'auto' }}>
        {visibleTabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              border: 'none', cursor: 'pointer', padding: '9px 16px', fontSize: 13,
              background: tab === t.id ? C.bg : 'transparent',
              color: tab === t.id ? C.darkBlue : '#c8d8f0',
              borderRadius: '4px 4px 0 0',
              fontWeight: tab === t.id ? 700 : 400,
              transition: 'background .15s',
            }}>
            {t.label}
          </button>
        ))}
      </div>
    </header>
  );
}
