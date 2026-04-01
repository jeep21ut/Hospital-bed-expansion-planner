import { useState, useMemo, useEffect, useCallback } from 'react';
import { defaultPlan, loadPlan, savePlan, calcDerived } from './data/model';
import { TABS, ROLES, C } from './data/constants';
import Nav from './components/Nav';
import Dashboard       from './components/Dashboard';
import ScenarioModeler from './components/ScenarioModeler';
import StaffingCalc    from './components/StaffingCalculator';
import FinancialModel  from './components/FinancialModel';
import FacilitiesTimeline from './components/FacilitiesTimeline';
import ClinicalOps     from './components/ClinicalOps';
import RiskRegister    from './components/RiskRegister';
import Briefs          from './components/Briefs';

const COMPONENT = {
  dashboard:  Dashboard,
  scenarios:  ScenarioModeler,
  staffing:   StaffingCalc,
  financial:  FinancialModel,
  facilities: FacilitiesTimeline,
  'clin-ops': ClinicalOps,
  risk:       RiskRegister,
  briefs:     Briefs,
};

export default function App() {
  const [plan,    setPlanRaw] = useState(() => loadPlan() || defaultPlan());
  const [role,    setRole]    = useState('director');
  const [tab,     setTab]     = useState('dashboard');
  const [saved,   setSaved]   = useState(true);

  // Auto-save to localStorage whenever plan changes
  const setPlan = useCallback(updater => {
    setPlanRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      savePlan(next);
      setSaved(true);
      return next;
    });
  }, []);

  // Active scenario
  const scenario = useMemo(
    () => plan.scenarios.find(s => s.id === plan.activeScenarioId) || plan.scenarios[0],
    [plan]
  );

  // All derived calculations — recompute only when scenario changes
  const derived = useMemo(() => calcDerived(scenario), [scenario]);

  // Updater helpers passed to child components
  const updateScenario = useCallback(updater => {
    setPlan(p => ({
      ...p,
      scenarios: p.scenarios.map(s =>
        s.id === p.activeScenarioId
          ? { ...(typeof updater === 'function' ? updater(s) : updater), id: s.id }
          : s
      ),
    }));
  }, [setPlan]);

  // Guard active tab against role change
  const visibleTabs = TABS.filter(t => t.roles.includes(role));
  useEffect(() => {
    if (!visibleTabs.find(t => t.id === tab)) setTab(visibleTabs[0]?.id || 'dashboard');
  }, [role]); // eslint-disable-line

  const ActiveComponent = COMPONENT[tab] || Dashboard;
  const roleLabel = ROLES.find(r => r.id === role)?.label || role;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 14 }}>
      <Nav
        plan={plan} setPlan={setPlan}
        role={role} setRole={setRole}
        tab={tab}   setTab={setTab}
        visibleTabs={visibleTabs}
        saved={saved}
        scenario={scenario}
      />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px' }}>
        <ActiveComponent
          plan={plan}
          setPlan={setPlan}
          scenario={scenario}
          updateScenario={updateScenario}
          derived={derived}
          role={role}
          roleLabel={roleLabel}
        />
      </main>
    </div>
  );
}
