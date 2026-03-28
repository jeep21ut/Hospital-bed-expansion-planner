import { useState } from 'react';

const WARDS = [
  { id: 'med-surg', name: 'Medical/Surgical', currentBeds: 40 },
  { id: 'icu', name: 'ICU', currentBeds: 16 },
  { id: 'pediatrics', name: 'Pediatrics', currentBeds: 20 },
  { id: 'maternity', name: 'Maternity', currentBeds: 18 },
  { id: 'psychiatric', name: 'Psychiatric', currentBeds: 12 },
];

export default function App() {
  const [expansions, setExpansions] = useState(
    Object.fromEntries(WARDS.map((w) => [w.id, 0]))
  );

  const handleChange = (id, value) => {
    const parsed = parseInt(value, 10);
    setExpansions((prev) => ({ ...prev, [id]: isNaN(parsed) || parsed < 0 ? 0 : parsed }));
  };

  const totalCurrent = WARDS.reduce((sum, w) => sum + w.currentBeds, 0);
  const totalAdded = Object.values(expansions).reduce((sum, v) => sum + v, 0);
  const totalProjected = totalCurrent + totalAdded;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 720, margin: '40px auto', padding: '0 16px' }}>
      <header style={{ borderBottom: '2px solid #003366', paddingBottom: 12, marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: '#003366', fontSize: '1.5rem' }}>
          MAMC Expansion Planner
        </h1>
        <p style={{ margin: '4px 0 0', color: '#555', fontSize: '0.9rem' }}>
          Defense Health Agency — Madigan Army Medical Center
        </p>
      </header>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#003366', color: '#fff' }}>
            <th style={th}>Ward</th>
            <th style={th}>Current Beds</th>
            <th style={th}>Beds to Add</th>
            <th style={th}>Projected Total</th>
          </tr>
        </thead>
        <tbody>
          {WARDS.map((ward, i) => {
            const added = expansions[ward.id];
            return (
              <tr key={ward.id} style={{ background: i % 2 === 0 ? '#f5f8ff' : '#fff' }}>
                <td style={td}>{ward.name}</td>
                <td style={{ ...td, textAlign: 'center' }}>{ward.currentBeds}</td>
                <td style={{ ...td, textAlign: 'center' }}>
                  <input
                    type="number"
                    min="0"
                    value={added}
                    onChange={(e) => handleChange(ward.id, e.target.value)}
                    style={{ width: 70, padding: '4px 8px', border: '1px solid #aaa', borderRadius: 4, textAlign: 'center' }}
                  />
                </td>
                <td style={{ ...td, textAlign: 'center', fontWeight: added > 0 ? 'bold' : 'normal', color: added > 0 ? '#005a00' : 'inherit' }}>
                  {ward.currentBeds + added}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: '#003366', color: '#fff', fontWeight: 'bold' }}>
            <td style={td}>Total</td>
            <td style={{ ...td, textAlign: 'center' }}>{totalCurrent}</td>
            <td style={{ ...td, textAlign: 'center' }}>+{totalAdded}</td>
            <td style={{ ...td, textAlign: 'center' }}>{totalProjected}</td>
          </tr>
        </tfoot>
      </table>

      {totalAdded > 0 && (
        <div style={{ marginTop: 20, padding: '12px 16px', background: '#e8f5e9', border: '1px solid #66bb6a', borderRadius: 6 }}>
          <strong>Expansion Summary:</strong> Adding {totalAdded} bed{totalAdded !== 1 ? 's' : ''} across{' '}
          {Object.values(expansions).filter((v) => v > 0).length} ward
          {Object.values(expansions).filter((v) => v > 0).length !== 1 ? 's' : ''}.
          Projected facility capacity: <strong>{totalProjected} beds</strong>.
        </div>
      )}
    </div>
  );
}

const th = { padding: '10px 14px', textAlign: 'left', fontWeight: '600' };
const td = { padding: '10px 14px', borderBottom: '1px solid #ddd' };
