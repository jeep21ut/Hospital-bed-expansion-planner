import { useState, useEffect } from 'react';
import { C } from '../data/constants';

const CLOCKS = [
  { label: 'JBLM',        tz: 'America/Los_Angeles', abbr: 'PST/PDT', role: 'LOCAL'   },
  { label: 'ZULU',        tz: 'UTC',                 abbr: 'Z',       role: 'ZULU'    },
  { label: 'PENTAGON',    tz: 'America/New_York',    abbr: 'ET',      role: 'DHA HQ'  },
  { label: 'HONOLULU',    tz: 'Pacific/Honolulu',    abbr: 'HT',      role: 'PACOM'   },
  { label: 'YOKOTA',      tz: 'Asia/Tokyo',          abbr: 'JST',     role: 'JPAC'    },
  { label: 'CAMP HUMPH.', tz: 'Asia/Seoul',          abbr: 'KST',     role: 'USFK'    },
  { label: 'RAMSTEIN',    tz: 'Europe/Berlin',       abbr: 'CET',     role: 'EUCOM'   },
  { label: 'BAGHDAD',     tz: 'Asia/Baghdad',        abbr: 'AST',     role: 'CENTCOM' },
];

function getJulian(d) {
  return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86_400_000);
}

export default function WorldClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const julian = getJulian(now);
  const julianStr = `${now.getFullYear()}${String(julian).padStart(3, '0')}`;

  return (
    <div style={{
      background: C.darkBlue,
      borderBottom: `1px solid rgba(255,208,65,.35)`,
      display: 'flex',
      alignItems: 'stretch',
      height: 36,
      overflowX: 'auto',
      userSelect: 'none',
    }}>
      {/* Left accent */}
      <div style={{ width: 4, background: C.yellow, flexShrink: 0 }} />

      {/* Julian date block */}
      <div style={{
        padding: '0 14px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        flexShrink: 0,
        borderRight: `1px solid rgba(255,208,65,.25)`,
        background: 'rgba(255,208,65,.1)',
      }}>
        <div style={{ fontSize: 6, letterSpacing: 2, color: `${C.yellow}cc`, fontWeight: 700, fontFamily: 'monospace' }}>
          JULIAN
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.yellow, lineHeight: 1, letterSpacing: 1, fontFamily: 'monospace' }}>
          {julianStr}
        </div>
      </div>

      {/* Clock cells */}
      {CLOCKS.map((c, i) => {
        const timeStr = now.toLocaleTimeString('en-US', {
          timeZone: c.tz, hour12: false,
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
        const dateStr = now.toLocaleDateString('en-US', {
          timeZone: c.tz, month: 'short', day: 'numeric',
        });
        const isLocal = c.role === 'LOCAL';
        const isZulu  = c.role === 'ZULU';

        return (
          <div key={i} style={{
            padding: '0 11px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            flexShrink: 0,
            minWidth: isLocal ? 112 : 90,
            borderRight: `1px solid rgba(255,255,255,.08)`,
            borderLeft: isLocal ? `3px solid ${C.yellow}` : undefined,
            background: isLocal
              ? `${C.blue}35`
              : isZulu ? 'rgba(255,208,65,.07)' : 'transparent',
          }}>
            {/* Label row */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 1 }}>
              <span style={{
                fontSize: 7, fontWeight: 700, letterSpacing: 1.5,
                color: isLocal ? C.yellow : isZulu ? `${C.yellow}cc` : 'rgba(255,255,255,.55)',
                fontFamily: 'monospace',
              }}>
                {c.label}
              </span>
              {isLocal ? (
                <span style={{
                  fontSize: 6, fontWeight: 700, letterSpacing: 0.8,
                  color: C.yellow,
                  background: 'rgba(255,208,65,.22)',
                  padding: '1px 4px', borderRadius: 2,
                  fontFamily: 'monospace',
                }}>
                  ◈ LOCAL
                </span>
              ) : (
                <span style={{ fontSize: 6, color: 'rgba(255,255,255,.3)', fontFamily: 'monospace' }}>
                  {c.role}
                </span>
              )}
            </div>

            {/* Time */}
            <div style={{
              fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
              color: isLocal ? C.yellow : isZulu ? `${C.yellow}cc` : 'rgba(255,255,255,.75)',
              fontFamily: 'monospace',
            }}>
              {timeStr}
            </div>

            {/* Date + abbr */}
            <div style={{
              fontSize: 7,
              color: isLocal ? C.yellow : 'rgba(255,255,255,.3)',
              fontWeight: isLocal ? 700 : 400,
              fontFamily: 'monospace',
            }}>
              {dateStr} {c.abbr}
            </div>
          </div>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* Right DHA stamp */}
      <div style={{
        padding: '0 14px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        flexShrink: 0, textAlign: 'right',
        borderLeft: `1px solid rgba(255,208,65,.2)`,
        background: 'rgba(255,208,65,.08)',
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: C.yellow, letterSpacing: 1.5, fontFamily: 'monospace' }}>
          DEFENSE HEALTH AGENCY
        </div>
        <div style={{ fontSize: 7, color: 'rgba(255,255,255,.4)', letterSpacing: 0.5, fontFamily: 'monospace' }}>
          DHA PACIFIC NORTHWEST · MTF WARCH
        </div>
      </div>

      {/* Right accent */}
      <div style={{ width: 4, background: C.yellow, flexShrink: 0 }} />
    </div>
  );
}
