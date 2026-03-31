import React, { useState, useEffect } from "react";

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Source+Code+Pro:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} body{-webkit-font-smoothing:antialiased;} ::-webkit-scrollbar{width:6px;height:6px;} ::-webkit-scrollbar-track{background:var(--bg1);} ::-webkit-scrollbar-thumb{background:var(--dhaBlue);border-radius:3px;opacity:.4;} input[type=range]{-webkit-appearance:none;appearance:none;background:transparent;width:100%;cursor:pointer;} input[type=range]::-webkit-slider-runnable-track{height:4px;background:var(--track);border-radius:2px;} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;background:var(--dhaBlue);border-radius:50%;margin-top:-6px;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3);} select{appearance:none;-webkit-appearance:none;} textarea:focus,input:focus,select:focus{outline:2px solid var(--dhaBlue);outline-offset:1px;} button{font-family:inherit;} @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}} @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}} @keyframes pulseDot{0%,100%{opacity:1}50%{opacity:.3}} .fade-up{animation:fadeUp .3s ease both;} .pulse{animation:pulseDot 1.5s ease-in-out infinite;}`;

const DHA = {
  darkBlue: "#092068",
  blue:     "#5A92CA",
  bgBlue:   "#9EBDDB",
  green:    "#5AAC45",
  yellow:   "#FFD041",
  maroon:   "#582831",
  gray:     "#333333",
};

function makeTheme(dark) {
  return dark ? {
    ...DHA,
    bg0:"#040d2a", bg1:"#071333", bg2:"#0c1d48", bg3:"#132358", bg4:"#1a2d6a",
    bgHdr:"#040d2a", bgSide:"#071333",
    text:"#ffffff", textSub:"#c8d8ee", muted:"#9EBDDB", dim:"#5A92CA", faint:"#1e3070",
    accent:"#FFD041", accentBg:"rgba(255,208,65,.12)", link:"#9EBDDB",
    border:"rgba(90,146,202,.25)", borderHdr:"rgba(255,208,65,.4)", borderCard:"rgba(90,146,202,.2)",
    ok:"#5AAC45", warn:"#FFD041", danger:"#582831", info:"#5A92CA",
    critBg:"rgba(88,40,49,.25)", critText:"#e86060",
    highBg:"rgba(220,100,40,.15)", highText:"#e89050",
    medBg:"rgba(255,208,65,.12)", medText:"#FFD041",
    lowBg:"rgba(90,172,69,.12)", lowText:"#5AAC45",
    vars:`--bg1:#071333;--dhaBlue:#5A92CA;--track:#0c1d48;`,
    isDark:true,
  } : {
    ...DHA,
    bg0:"#f4f6fb", bg1:"#ffffff", bg2:"#f0f4fa", bg3:"#e4ecf6", bg4:"#d8e6f2",
    bgHdr:"#092068", bgSide:"#092068",
    text:"#333333", textSub:"#092068", muted:"#3a5e8a", dim:"#6b8faa", faint:"#c5d8ea",
    accent:"#092068", accentBg:"rgba(9,32,104,.06)", link:"#5A92CA",
    border:"rgba(9,32,104,.15)", borderHdr:"rgba(255,208,65,.5)", borderCard:"rgba(9,32,104,.1)",
    ok:"#3a8a30", warn:"#b07800", danger:"#582831", info:"#5A92CA",
    critBg:"rgba(88,40,49,.08)", critText:"#582831",
    highBg:"rgba(160,70,20,.08)", highText:"#a04010",
    medBg:"rgba(176,120,0,.08)", medText:"#806000",
    lowBg:"rgba(58,138,48,.08)", lowText:"#3a8a30",
    vars:`--bg1:#ffffff;--dhaBlue:#5A92CA;--track:#e4ecf6;`,
    isDark:false,
  };
}

const ThemeCtx = React.createContext(makeTheme(false));
const useT = () => React.useContext(ThemeCtx);

const MAMC = {
  name:"Madigan Army Medical Center", short:"MAMC",
  location:"Joint Base Lewis-McChord, WA",
  address:"9040A Jackson Ave, JBLM, WA 98431",
  currentBeds:220, surgeBeds:318, catchment:284000, beneficiaries:100000,
  trauma:"II", traumaRank:"1 of 2 in Army Medicine",
  mtf:"WARCH", uic:"W6NJ1A",
  surgeriesPerDay:45, rxPerDay:4000, deliveriesPerDay:8, outpatientPerYear:1000000,
  gmePrograms:35, est:1944,
};

const SCENARIOS = {
  steady:{ id:"steady", name:"STEADY STATE",  full:"Enhanced Peacetime Capacity",   color:DHA.green,  beds:75,  icu:.15, trauma:.10, time:"12-24 mo",   mult:1.2, supply:60  },
  dsrf:  { id:"dsrf",   name:"DSRF",           full:"Division Support Ready Force",  color:DHA.yellow, beds:100, icu:.20, trauma:.15, time:"30-90 days", mult:1.5, supply:90  },
  lsco:  { id:"lsco",   name:"LSCO",           full:"Large Scale Combat Operations", color:DHA.maroon, beds:150, icu:.25, trauma:.20, time:"<30 days",   mult:2.2, supply:180 },
};

const TABS = [
  {id:"ops",      icon:"⊕", label:"Command Dashboard",  sub:"Live ops overview"},
  {id:"scenario", icon:"◉", label:"Scenario Analysis",  sub:"Mission planning"},
  {id:"beds",     icon:"▦", label:"Bed Architecture",   sub:"Capacity planning"},
  {id:"personnel",icon:"◎", label:"Personnel Surge",    sub:"Manning analysis"},
  {id:"infra",    icon:"◬", label:"Infrastructure",     sub:"Physical plant"},
  {id:"supply",   icon:"◆", label:"Supply Chain",       sub:"Logistics"},
  {id:"clinical", icon:"✦", label:"Clinical Services",  sub:"Medical capabilities"},
  {id:"imd",      icon:"⬡", label:"IT / IMD",           sub:"Information systems"},
  {id:"risk",     icon:"⚠", label:"Risk Register",      sub:"Compliance & threats"},
  {id:"finance",  icon:"◇", label:"Cost Analysis",      sub:"Budget planning"},
  {id:"timeline", icon:"▷", label:"Phased Timeline",    sub:"Execution roadmap"},
  {id:"brief",    icon:"★", label:"Command Brief",      sub:"Readiness report"},
];

const INIT = {
  scenario:"dsrf",
  beds:{ medSurg:35, icu:18, trauma:14, ortho:10, burn:4, bh:7, rehab:6, surge:0, iso:6 },
  pers:{ md:22, rn:85, pa:14, crna:8, medic:55, allied:32, admin:20, contract:18 },
  persSource:{ ad:40, usar:35, civ:25 },
  infra:{ or:false, icu:false, ed:false, ct:true, lab:true, pharm:true, blood:true, decon:false, helipad:false, gen:false, water:false, o2:false, mod:false, neg:false },
  supply:{ days:45, blood:500, rx:30, wb:true, pharm:true, spd:false, waste:false, food:false, laundry:false, mort:false, cold:false, dla:false },
  clin:{ level:"II", burn:false, neuro:true, card:true, ortho:true, ptsd:true, tbi:true, wound:true, dial:true, pt:true, rad:true, path:true, anest:true },
  it:{ genesis:true, tele:false, tptp:false, cyber:false, comms:false, bw:false, ato:false, iomt:false, spo:true, cab:true, sipr:false, bi:false },
  risk:{ masspas:"Partial", tjc:true, dha:false, nfpa:false, osha:true, hipaa:true, cbrne:false, hics:false, opsec:false, atfp:false },
  fin:{ con:45, equip:18, pers:28, it:8, cont:12, src:{ dhp:60, mil:25, rdt:15 } },
  phases:[
    {id:"p1", label:"Phase 1", name:"Planning & Authorization",   start:"FEB 2026", end:"JUN 2026"},
    {id:"p2", label:"Phase 2", name:"Infrastructure & Personnel", start:"JUL 2026", end:"DEC 2026"},
    {id:"p3", label:"Phase 3", name:"Systems & Equipment",        start:"JAN 2027", end:"JUN 2027"},
    {id:"p4", label:"Phase 4", name:"Certification & Training",   start:"JUL 2027", end:"NOV 2027"},
    {id:"foc", label:"FOC",   name:"Full Operational Capability", start:"DEC 2027", end:"DEC 2027"},
  ],
  notes:"",
};

function sumBeds(s){ return Object.values(s.beds).reduce((a,b)=>a+b,0); }
function sumPers(s){ return Object.values(s.pers).reduce((a,b)=>a+b,0); }
function sumBudget(s){ return s.fin.con+s.fin.equip+s.fin.pers+s.fin.it+s.fin.cont; }
function getJulian(d){ return Math.floor((d-new Date(d.getFullYear(),0,0))/86400000); }

function calcReadiness(s){
  const sc=SCENARIOS[s.scenario];
  const nb=sumBeds(s), tp=sumPers(s);
  const d={
    beds:    Math.min(nb/sc.beds,1),
    pers:    Math.min(tp/(sc.beds*sc.mult*2.2),1),
    infra:   Object.values(s.infra).filter(Boolean).length/Object.keys(s.infra).length,
    supply:  Object.values(s.supply).filter(v=>v===true).length/(Object.keys(s.supply).length-3)*.6+Math.min(s.supply.days/sc.supply,1)*.4,
    clinical:Object.values(s.clin).filter(v=>v===true).length/(Object.keys(s.clin).length-1),
    it:      Object.values(s.it).filter(Boolean).length/Object.keys(s.it).length,
    risk:    Object.values(s.risk).filter(v=>v===true).length/(Object.keys(s.risk).length-1),
    finance: Math.min(sumBudget(s)/130,1),
  };
  const W={beds:.20,pers:.18,infra:.15,supply:.12,clinical:.12,it:.10,risk:.08,finance:.05};
  return {
    score:Math.round(Object.entries(d).reduce((sum,[k,v])=>sum+v*W[k],0)*100),
    domains:Object.fromEntries(Object.entries(d).map(([k,v])=>[k,Math.round(v*100)])),
  };
}

function Ring({ value, max=100, size=80, color, label }) {
  const T=useT();
  const c=color||(value>=80?T.ok:value>=60?T.warn:value>=40?T.highText:T.critText);
  const r=size*.38, cx=size/2, cy=size/2, circ=2*Math.PI*r;
  const dash=Math.min(value/max,1)*circ;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.isDark?"rgba(255,255,255,.08)":"rgba(0,0,0,.08)"} strokeWidth={size*.07}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={c} strokeWidth={size*.07}
          strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={circ*.25}
          strokeLinecap="round" style={{transition:"stroke-dasharray 1.2s ease"}}/>
        <text x={cx} y={cy+4} textAnchor="middle" fill={c} fontSize={size*.22} fontWeight="700"
          fontFamily="'Libre Franklin',sans-serif">{value}</text>
      </svg>
      {label&&<span style={{fontSize:9,color:T.muted,fontFamily:"'Source Code Pro',monospace",letterSpacing:1.5,textTransform:"uppercase"}}>{label}</span>}
    </div>
  );
}

function Bar({ value, max=100, color, height=6, label, showVal }) {
  const T=useT();
  const c=color||T.blue;
  const pct=Math.min(value/max,1)*100;
  return (
    <div>
      {(label||showVal)&&(
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
          {label&&<span style={{fontSize:11,color:T.muted,fontFamily:"'Libre Franklin',sans-serif"}}>{label}</span>}
          {showVal&&<span style={{fontSize:11,color:c,fontFamily:"'Source Code Pro',monospace",fontWeight:600}}>{value}%</span>}
        </div>
      )}
      <div style={{height,background:T.isDark?"rgba(255,255,255,.1)":"rgba(0,0,0,.08)",borderRadius:height/2,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:c,borderRadius:height/2,transition:"width 1s ease"}}/>
      </div>
    </div>
  );
}

function Card({ title, children, accent, badge, style:sx, noPad, className }) {
  const T=useT();
  const a=accent||T.blue;
  return (
    <div className={className} style={{
      background:T.bg1, border:`1px solid ${T.borderCard}`, borderTop:`3px solid ${a}`,
      borderRadius:4, marginBottom:14, overflow:"hidden",
      boxShadow:T.isDark?"0 2px 12px rgba(0,0,0,.4)":"0 1px 4px rgba(9,32,104,.08)",
      ...sx,
    }}>
      {title&&(
        <div style={{padding:"10px 16px",borderBottom:`1px solid ${T.borderCard}`,background:T.isDark?`${a}12`:`${a}08`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:10,fontWeight:700,letterSpacing:2,color:a,fontFamily:"'Libre Franklin',sans-serif",textTransform:"uppercase"}}>{title}</span>
          {badge}
        </div>
      )}
      <div style={noPad?{}:{padding:16}}>{children}</div>
    </div>
  );
}

function Stat({ label, value, sub, color, progress }) {
  const T=useT();
  const c=color||T.blue;
  return (
    <div style={{background:T.bg1,border:`1px solid ${T.borderCard}`,borderLeft:`4px solid ${c}`,borderRadius:4,padding:"14px 16px",boxShadow:T.isDark?"0 2px 8px rgba(0,0,0,.3)":"0 1px 3px rgba(9,32,104,.07)"}}>
      <div style={{fontSize:9,fontWeight:700,letterSpacing:2,color:T.muted,fontFamily:"'Libre Franklin',sans-serif",textTransform:"uppercase",marginBottom:5}}>{label}</div>
      <div style={{fontSize:24,fontWeight:800,color:c,fontFamily:"'Libre Franklin',sans-serif",lineHeight:1,letterSpacing:.5}}>{value}</div>
      {sub&&<div style={{fontSize:10,color:T.dim,fontFamily:"'EB Garamond',serif",marginTop:4}}>{sub}</div>}
      {progress!==undefined&&<div style={{marginTop:8}}><Bar value={progress} color={c} height={4}/></div>}
    </div>
  );
}

function Slider({ label, value, onChange, min, max, unit="", color, warn, danger, note }) {
  const T=useT();
  const c=color||T.blue;
  const active=danger&&value<=danger?T.danger:warn&&value<=warn?T.warn:c;
  const pct=(value-min)/(max-min)*100;
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
        <span style={{fontSize:12,color:T.muted,fontFamily:"'Libre Franklin',sans-serif"}}>{label}</span>
        <span style={{fontSize:14,fontWeight:700,color:active,fontFamily:"'Libre Franklin',sans-serif"}}>{value}<span style={{fontSize:10,fontWeight:400,opacity:.7}}>{unit}</span></span>
      </div>
      <div style={{position:"relative",height:6,background:T.isDark?"rgba(255,255,255,.1)":"rgba(0,0,0,.08)",borderRadius:3}}>
        <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${pct}%`,background:active,borderRadius:3,transition:"width .3s"}}/>
        <input type="range" min={min} max={max} value={value} onChange={e=>onChange(+e.target.value)}
          style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0,zIndex:2,cursor:"pointer"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
        <span style={{fontSize:9,color:T.dim,fontFamily:"'Source Code Pro',monospace"}}>{min}{unit}</span>
        {note&&<span style={{fontSize:9,color:active,fontFamily:"'Source Code Pro',monospace"}}>{note}</span>}
        <span style={{fontSize:9,color:T.dim,fontFamily:"'Source Code Pro',monospace"}}>{max}{unit}</span>
      </div>
    </div>
  );
}

function Toggle({ label, desc, value, onChange, req }) {
  const T=useT();
  return (
    <div onClick={()=>onChange(!value)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",marginBottom:5,background:value?(T.isDark?`${DHA.blue}15`:`${DHA.blue}08`):T.bg2,border:`1px solid ${value?`${DHA.blue}40`:T.borderCard}`,borderRadius:4,cursor:"pointer",transition:"all .15s"}}>
      <div style={{width:36,height:20,borderRadius:10,flexShrink:0,position:"relative",background:value?DHA.blue:(T.isDark?"rgba(255,255,255,.12)":"rgba(0,0,0,.12)"),transition:"background .2s"}}>
        <div style={{position:"absolute",top:2,left:value?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.3)"}}/>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:12,color:value?T.text:T.muted,fontFamily:"'Libre Franklin',sans-serif",fontWeight:value?600:400}}>{label}</div>
        {desc&&<div style={{fontSize:10,color:T.dim,fontFamily:"'EB Garamond',serif",marginTop:1,lineHeight:1.4,fontStyle:"italic"}}>{desc}</div>}
      </div>
      {req&&!value&&<span style={{fontSize:9,fontWeight:700,color:T.critText,fontFamily:"'Source Code Pro',monospace",letterSpacing:1}}>REQ'D</span>}
      {value&&<span style={{fontSize:10,color:DHA.blue,fontFamily:"'Source Code Pro',monospace",fontWeight:700}}>✓</span>}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  const T=useT();
  return (
    <div style={{marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
      <span style={{fontSize:12,color:T.muted,fontFamily:"'Libre Franklin',sans-serif"}}>{label}</span>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{background:T.bg3,border:`1px solid ${T.border}`,color:T.text,padding:"5px 10px",fontSize:11,fontFamily:"'Source Code Pro',monospace",borderRadius:3,cursor:"pointer"}}>
        {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
      </select>
    </div>
  );
}

function Badge({ level }) {
  const T=useT();
  const cfg={ CRITICAL:{bg:T.critBg,color:T.critText}, HIGH:{bg:T.highBg,color:T.highText}, MED:{bg:T.medBg,color:T.medText}, LOW:{bg:T.lowBg,color:T.lowText} };
  const s=cfg[level]||cfg.MED;
  return <span style={{padding:"2px 8px",background:s.bg,color:s.color,border:`1px solid ${s.color}40`,borderRadius:2,fontSize:9,fontFamily:"'Source Code Pro',monospace",fontWeight:700,letterSpacing:1.5}}>{level}</span>;
}

function Dot({ on, label }) {
  const T=useT();
  const c=on?T.ok:T.critText;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5}}>
      <span style={{width:8,height:8,borderRadius:"50%",background:c,display:"inline-block"}}/>
      {label&&<span style={{fontSize:10,color:c,fontFamily:"'Source Code Pro',monospace",fontWeight:600}}>{label}</span>}
    </span>
  );
}

function Radar({ data, size=160 }) {
  const T=useT();
  const n=data.length, cx=size/2, cy=size/2, r=size*.36;
  const pts=data.map((d,i)=>{
    const a=(i/n)*2*Math.PI-Math.PI/2, v=d.value/100;
    return {x:cx+Math.cos(a)*r*v,y:cy+Math.sin(a)*r*v,lx:cx+Math.cos(a)*(r+16),ly:cy+Math.sin(a)*(r+16)+4,label:d.label};
  });
  const fill=T.isDark?`${DHA.blue}20`:`${DHA.blue}15`;
  return (
    <svg width={size} height={size}>
      {[.25,.5,.75,1].map(l=>{
        const gp=data.map((_,i)=>{const a=(i/n)*2*Math.PI-Math.PI/2;return `${cx+Math.cos(a)*r*l},${cy+Math.sin(a)*r*l}`;}).join(" ");
        return <polygon key={l} points={gp} fill="none" stroke={T.isDark?"rgba(158,189,219,.15)":"rgba(9,32,104,.1)"} strokeWidth={1}/>;
      })}
      {data.map((_,i)=>{const a=(i/n)*2*Math.PI-Math.PI/2;return <line key={i} x1={cx} y1={cy} x2={cx+Math.cos(a)*r} y2={cy+Math.sin(a)*r} stroke={T.isDark?"rgba(158,189,219,.12)":"rgba(9,32,104,.08)"} strokeWidth={1}/>;;})}
      <polygon points={pts.map(p=>`${p.x},${p.y}`).join(" ")} fill={fill} stroke={DHA.blue} strokeWidth={1.5} style={{transition:"all .8s ease"}}/>
      {pts.map((p,i)=>(
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3} fill={DHA.blue}/>
          <text x={p.lx} y={p.ly} textAnchor="middle" fill={T.muted} fontSize={7} fontFamily="'Source Code Pro',monospace">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

const CLOCKS = [
  {label:"JBLM",        tz:"America/Los_Angeles",abbr:"PT",  role:"LOCAL"},
  {label:"ZULU",        tz:"UTC",                abbr:"Z",   role:"ZULU"},
  {label:"PENTAGON",    tz:"America/New_York",   abbr:"ET",  role:"DHA HQ"},
  {label:"HONOLULU",    tz:"Pacific/Honolulu",   abbr:"HT",  role:"PACOM"},
  {label:"YOKOTA",      tz:"Asia/Tokyo",         abbr:"JST", role:"JPAC"},
  {label:"CAMP HUMPH.", tz:"Asia/Seoul",         abbr:"KST", role:"USFK"},
  {label:"RAMSTEIN",    tz:"Europe/Berlin",      abbr:"CET", role:"EUCOM"},
  {label:"BAGHDAD",     tz:"Asia/Baghdad",       abbr:"AST", role:"CENTCOM"},
];

function WorldClock({ time }) {
  const T=useT();
  const julian=getJulian(time);
  return (
    <div style={{background:DHA.darkBlue,borderBottom:`1px solid rgba(255,208,65,.35)`,display:"flex",alignItems:"stretch",height:36,overflowX:"auto"}}>
      <div style={{width:4,background:DHA.yellow,flexShrink:0}}/>
      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",justifyContent:"center",flexShrink:0,borderRight:`1px solid rgba(255,208,65,.2)`,background:`${DHA.yellow}18`}}>
        <div style={{fontSize:6,letterSpacing:2,color:`${DHA.yellow}cc`,fontFamily:"'Source Code Pro',monospace",fontWeight:700}}>JULIAN</div>
        <div style={{fontSize:14,fontWeight:800,color:DHA.yellow,fontFamily:"'Libre Franklin',sans-serif",lineHeight:1,letterSpacing:1}}>
          {time.getFullYear()}{String(julian).padStart(3,"0")}
        </div>
      </div>
      {CLOCKS.map((c,i)=>{
        const t=time.toLocaleTimeString("en-US",{timeZone:c.tz,hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"});
        const dt=time.toLocaleDateString("en-US",{timeZone:c.tz,month:"short",day:"numeric"});
        const isLocal=c.role==="LOCAL", isZulu=c.role==="ZULU";
        return (
          <div key={i} style={{padding:"0 12px",display:"flex",flexDirection:"column",justifyContent:"center",flexShrink:0,borderRight:`1px solid rgba(255,255,255,.08)`,minWidth:92,background:isLocal?`${DHA.blue}25`:isZulu?"rgba(255,208,65,.08)":"transparent"}}>
            <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:1}}>
              <span style={{fontSize:7,fontWeight:700,letterSpacing:1.5,color:isLocal?DHA.yellow:isZulu?`${DHA.yellow}cc`:"rgba(255,255,255,.5)",fontFamily:"'Source Code Pro',monospace"}}>{c.label}</span>
              <span style={{fontSize:6,color:"rgba(255,255,255,.3)",fontFamily:"'Source Code Pro',monospace"}}>{c.role}</span>
            </div>
            <div style={{fontSize:13,fontWeight:700,color:isLocal?DHA.yellow:isZulu?`${DHA.yellow}cc`:"rgba(255,255,255,.7)",fontFamily:"'Libre Franklin',sans-serif",letterSpacing:.5}}>{t}</div>
            <div style={{fontSize:7,color:"rgba(255,255,255,.3)",fontFamily:"'Source Code Pro',monospace"}}>{dt} {c.abbr}</div>
          </div>
        );
      })}
      <div style={{flex:1}}/>
      <div style={{padding:"0 14px",display:"flex",flexDirection:"column",justifyContent:"center",flexShrink:0,textAlign:"right",borderLeft:`1px solid rgba(255,208,65,.2)`,background:`${DHA.yellow}10`}}>
        <div style={{fontSize:9,fontWeight:700,color:DHA.yellow,fontFamily:"'Libre Franklin',sans-serif",letterSpacing:1.5}}>DEFENSE HEALTH AGENCY</div>
        <div style={{fontSize:7,color:"rgba(255,255,255,.4)",fontFamily:"'Source Code Pro',monospace",letterSpacing:.5}}>DHA PACIFIC NORTHWEST · MTF WARCH</div>
      </div>
      <div style={{width:4,background:DHA.yellow,flexShrink:0}}/>
    </div>
  );
}

function Ticker({ state }) {
  const rd=calcReadiness(state);
  const sc=SCENARIOS[state.scenario];
  const nb=sumBeds(state);
  const items=[
    `◈ MAMC EXPANSION PLANNING SYSTEM`,`▦ SCENARIO: ${sc.full}`,
    `▷ BED TARGET: ${nb}/${sc.beds}`,`◉ READINESS: ${rd.score}/100`,
    `◇ BUDGET: $${sumBudget(state)}M`,`⊕ ATO: ${state.it.ato?"CURRENT":"OPEN"}`,
    `⚠ DHA APPROVAL: ${state.risk.dha?"OBTAINED":"PENDING"}`,
    `★ MASSPAS: ${state.risk.masspas}`,`◆ SUPPLY: ${state.supply.days}d`,
    `✦ JBLM · JOINT BASE LEWIS-MCCHORD · WA`,`◈ UNCLASSIFIED // FOUO`,
  ];
  const text=items.join("   ·   ");
  return (
    <div style={{height:22,background:DHA.darkBlue,borderBottom:`1px solid rgba(255,208,65,.2)`,overflow:"hidden"}}>
      <div style={{display:"inline-block",whiteSpace:"nowrap",animation:"marquee 55s linear infinite",color:`${DHA.yellow}cc`,fontSize:8,letterSpacing:1.5,fontFamily:"'Source Code Pro',monospace",lineHeight:"22px",padding:"0 20px"}}>{text+"   ·   "+text}</div>
    </div>
  );
}

function FloorPlan({ state }) {
  const T=useT();
  const sc=SCENARIOS[state.scenario];
  const nb=sumBeds(state);
  const wings=[
    {id:"medSurg",label:"MED/SURG",   color:DHA.blue,   x:10, y:40, w:120,h:70, v:state.beds.medSurg},
    {id:"icu",    label:"ICU",        color:DHA.green,  x:140,y:40, w:90, h:70, v:state.beds.icu},
    {id:"trauma", label:"TRAUMA/SICU",color:DHA.maroon, x:240,y:40, w:90, h:70, v:state.beds.trauma},
    {id:"ortho",  label:"ORTHO",      color:"#7a5a20",  x:10, y:125,w:80, h:55, v:state.beds.ortho},
    {id:"burn",   label:"BURN",       color:"#9a3a20",  x:100,y:125,w:65, h:55, v:state.beds.burn},
    {id:"bh",     label:"BH/PTSD",    color:"#5a3a80",  x:175,y:125,w:80, h:55, v:state.beds.bh},
    {id:"rehab",  label:"REHAB",      color:DHA.darkBlue,x:265,y:125,w:65,h:55, v:state.beds.rehab},
    {id:"surge",  label:"SURGE",      color:DHA.gray,   x:10, y:195,w:140,h:45, v:state.beds.surge},
    {id:"iso",    label:"ISOLATION",  color:"#7a2060",  x:160,y:195,w:80, h:45, v:state.beds.iso},
  ];
  const bg=T.isDark?"#040d2a":"#f0f4fb";
  const grid=T.isDark?"rgba(90,146,202,.12)":"rgba(9,32,104,.07)";
  const outline=T.isDark?`${DHA.yellow}30`:`${DHA.darkBlue}20`;
  return (
    <svg viewBox="0 0 345 255" style={{width:"100%",background:bg,borderRadius:3,border:`1px solid ${T.borderCard}`}}>
      {Array.from({length:7},(_,i)=><line key={`h${i}`} x1={0} y1={i*36} x2={345} y2={i*36} stroke={grid} strokeWidth={.5}/>)}
      {Array.from({length:10},(_,i)=><line key={`v${i}`} x1={i*38} y1={0} x2={i*38} y2={255} stroke={grid} strokeWidth={.5}/>)}
      <rect x={5} y={5} width={335} height={245} fill="none" stroke={outline} strokeWidth={1} strokeDasharray="5,3"/>
      <text x={172} y={20} textAnchor="middle" fill={T.isDark?`${DHA.yellow}55`:`${DHA.darkBlue}40`} fontSize={7} fontFamily="'Source Code Pro',monospace">EXISTING MAMC — {MAMC.currentBeds} BEDS AUTHORIZED</text>
      {wings.map(w=>{
        const active=w.v>0;
        return (
          <g key={w.id} opacity={active?1:.3}>
            <rect x={w.x} y={w.y} width={w.w} height={w.h} fill={`${w.color}18`} stroke={w.color} strokeWidth={active?1.5:.5} rx={2}/>
            {active&&Array.from({length:Math.min(w.v,12)},(_,i)=>{
              const cols=Math.ceil(Math.sqrt(Math.min(w.v,12)));
              return <rect key={i} x={w.x+8+(i%cols)*(w.w-16)/Math.max(cols-1,1)-3} y={w.y+20+Math.floor(i/cols)*(w.h-30)/Math.max(Math.ceil(Math.min(w.v,12)/cols)-1,1)-2} width={6} height={4} fill={`${w.color}80`} rx={1}/>;
            })}
            <text x={w.x+w.w/2} y={w.y+13} textAnchor="middle" fill={w.color} fontSize={7} fontFamily="'Source Code Pro',monospace" fontWeight={700}>{w.label}</text>
            <text x={w.x+w.w/2} y={w.y+w.h-5} textAnchor="middle" fill={`${w.color}cc`} fontSize={9} fontFamily="'Libre Franklin',sans-serif" fontWeight={700}>{w.v}</text>
          </g>
        );
      })}
      <text x={172} y={248} textAnchor="middle" fill={T.muted} fontSize={7} fontFamily="'Source Code Pro',monospace">+{nb} NEW BEDS · TOTAL: {MAMC.currentBeds+nb} · TARGET: {sc.beds} · {nb>=sc.beds?"✓ MET":"DEFICIT: "+(sc.beds-nb)}</text>
    </svg>
  );
}

function OpsPage({ state, setState }) {
  const T=useT();
  const rd=calcReadiness(state);
  const sc=SCENARIOS[state.scenario];
  const nb=sumBeds(state), total=MAMC.currentBeds+nb;
  const scColor=rd.score>=80?T.ok:rd.score>=60?T.warn:rd.score>=40?T.highText:T.critText;
  const radarData=[
    {label:"BEDS",    value:rd.domains.beds},
    {label:"PERS",    value:rd.domains.pers},
    {label:"INFRA",   value:rd.domains.infra},
    {label:"SUPPLY",  value:rd.domains.supply},
    {label:"CLINICAL",value:rd.domains.clinical},
    {label:"IT/IMD",  value:rd.domains.it},
    {label:"RISK",    value:rd.domains.risk},
    {label:"FINANCE", value:rd.domains.finance},
  ];
  const alerts=[
    {c:"CRITICAL",m:"DHA MTF Expansion Approval not obtained — gating requirement for all construction",show:!state.risk.dha},
    {c:"CRITICAL",m:"ATO/RMF not current — no new systems may deploy (DoDI 8510.01)",show:!state.it.ato},
    {c:"HIGH",    m:`Bed plan ${sc.beds-nb} short of ${sc.name} target (${sc.beds} beds required)`,show:nb<sc.beds},
    {c:"HIGH",    m:`WA MASSPAS license status: ${state.risk.masspas} — new beds cannot open without approval`,show:state.risk.masspas!=="Approved"},
    {c:"HIGH",    m:"NFPA 99 Type 1 emergency generator not planned — TJC life-safety requirement",show:!state.infra.gen},
    {c:"HIGH",    m:`Supply buffer ${state.supply.days}d below ${sc.supply}d ${sc.name} requirement`,show:state.supply.days<sc.supply},
    {c:"HIGH",    m:"Theater Patient Tracking (TPTP) not integrated — required for LSCO patient flow",show:!state.it.tptp},
    {c:"MED",     m:"CBRNE decontamination station not planned — required for DSRF/LSCO certification",show:!state.infra.decon},
    {c:"MED",     m:"HICS/ICS mass casualty plan not exercised — operational readiness requirement",show:!state.risk.hics},
  ].filter(a=>a.show);
  return (
    <div className="fade-up">
      <div style={{padding:"16px 20px",marginBottom:14,background:T.isDark?`${sc.color}15`:`${sc.color}10`,border:`2px solid ${sc.color}40`,borderRadius:4,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:2.5,color:sc.color,fontFamily:"'Libre Franklin',sans-serif",marginBottom:4}}>ACTIVE OPERATIONAL SCENARIO</div>
          <div style={{fontSize:20,fontWeight:800,color:T.text,fontFamily:"'Libre Franklin',sans-serif"}}>{sc.full.toUpperCase()}</div>
          <div style={{fontSize:11,color:T.dim,fontFamily:"'EB Garamond',serif",marginTop:3,fontStyle:"italic"}}>Bed target: +{sc.beds} · Window: {sc.time} · Supply: {sc.supply}-day buffer</div>
        </div>
        <div style={{display:"flex",gap:16,alignItems:"center"}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:8,letterSpacing:2,color:T.muted,fontFamily:"'Source Code Pro',monospace"}}>BED TARGET</div>
            <div style={{fontSize:36,fontWeight:900,color:sc.color,fontFamily:"'Libre Franklin',sans-serif",lineHeight:1}}>+{sc.beds}</div>
          </div>
          <Ring value={rd.score} size={100} label="READINESS"/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        <Stat label="New Beds Planned" value={nb} sub={`Target: ${sc.beds} · ${nb>=sc.beds?"✓ Met":"Deficit: "+(sc.beds-nb)}`} color={nb>=sc.beds?T.ok:T.warn} progress={Math.min(nb/sc.beds*100,100)}/>
        <Stat label="Total Post-Expansion" value={total} sub={`${MAMC.currentBeds} existing + ${nb} new`} color={T.blue} progress={Math.min(total/350*100,100)}/>
        <Stat label="Personnel Surge" value={`+${sumPers(state)}`} sub={`Augmenting ${MAMC.catchment/1000}K catchment`} color={T.isDark?DHA.bgBlue:DHA.darkBlue} progress={Math.min(sumPers(state)/300*100,100)}/>
        <Stat label="Total Budget" value={`$${sumBudget(state)}M`} sub="DHP + MILCON + supplemental" color={DHA.yellow} progress={Math.min(sumBudget(state)/150*100,100)}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 190px 1fr",gap:12,marginBottom:14}}>
        <Card title="Readiness by Domain" accent={T.blue}>
          {radarData.map(d=>{
            const c=d.value>=80?T.ok:d.value>=60?T.warn:d.value>=40?T.highText:T.critText;
            const names={BEDS:"Bed Capacity",PERS:"Personnel",INFRA:"Infrastructure",SUPPLY:"Logistics",CLINICAL:"Clinical Services",["IT/IMD"]:"IT / IMD",RISK:"Risk/Compliance",FINANCE:"Financial"};
            return <div key={d.label} style={{marginBottom:10}}><Bar label={names[d.label]} value={d.value} color={c} showVal/></div>;
          })}
        </Card>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
          <Card style={{width:"100%",textAlign:"center"}} noPad>
            <div style={{padding:"16px 12px"}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:2,color:T.muted,fontFamily:"'Libre Franklin',sans-serif",marginBottom:8}}>OVERALL READINESS</div>
              <Ring value={rd.score} size={100} color={scColor}/>
              <div style={{marginTop:10,padding:"4px 10px",borderRadius:2,background:T.isDark?`${scColor}18`:`${scColor}10`,border:`1px solid ${scColor}40`,fontSize:9,fontWeight:700,letterSpacing:1.5,color:scColor,fontFamily:"'Libre Franklin',sans-serif"}}>
                {rd.score>=80?"MISSION READY":rd.score>=60?"CONDITIONALLY READY":rd.score>=40?"PARTIALLY READY":"CRITICAL GAPS"}
              </div>
            </div>
          </Card>
          <Radar data={radarData} size={168}/>
        </div>
        <Card title="Bed Distribution Map" accent={DHA.blue}>
          <FloorPlan state={state}/>
        </Card>
      </div>
      <Card title={`Planning Alerts — ${alerts.length} Active`} accent={alerts.some(a=>a.c==="CRITICAL")?T.critText:T.warn}>
        {alerts.length===0?(
          <div style={{padding:"16px",textAlign:"center",color:T.ok,fontFamily:"'Libre Franklin',sans-serif",fontSize:12}}>✓ No critical planning alerts — all major requirements addressed</div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {alerts.map((a,i)=>(
              <div key={i} style={{padding:"10px 12px",background:T[`${a.c.toLowerCase()}Bg`]||T.medBg,border:`1px solid ${(T[`${a.c.toLowerCase()}Text`]||T.medText)}30`,borderLeft:`3px solid ${T[`${a.c.toLowerCase()}Text`]||T.medText}`,borderRadius:3,display:"flex",gap:8,alignItems:"flex-start"}}>
                <Badge level={a.c}/>
                <span style={{fontSize:11,color:T.muted,fontFamily:"'EB Garamond',serif",lineHeight:1.5}}>{a.m}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card title="MAMC Verified Baseline — Official Sources" accent={DHA.darkBlue}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
          {[
            {l:"Operational Beds",  v:"~220",     s:"Expandable to 318 (disaster)",     c:T.blue},
            {l:"Disaster Surge",    v:"318",      s:"Official stated surge capacity",    c:DHA.bgBlue},
            {l:"Trauma Level",      v:"Level II", s:"1 of only 2 in Army Medicine",     c:T.critText},
            {l:"Army MTF Rank",     v:"2nd",      s:"Largest MTF in United States",      c:T.warn},
            {l:"TRICARE Catchment", v:"284,000",  s:"Beneficiaries, western WA",         c:T.ok},
            {l:"Surgeries / Day",   v:"45+",      s:"Daily surgical volume",             c:T.highText},
            {l:"Prescriptions/Day", v:"~4,000",   s:"Daily Rx fill volume",              c:T.blue},
            {l:"GME Programs",      v:"35",       s:"Residency/fellowship programs",     c:T.ok},
          ].map(({l,v,s,c})=>(
            <div key={l} style={{padding:"10px 12px",background:T.bg2,borderRadius:3,border:`1px solid ${T.borderCard}`,borderLeft:`3px solid ${c}`}}>
              <div style={{fontSize:8,fontWeight:700,letterSpacing:1.5,color:T.muted,fontFamily:"'Source Code Pro',monospace",textTransform:"uppercase",marginBottom:3}}>{l}</div>
              <div style={{fontSize:16,fontWeight:800,color:c,fontFamily:"'Libre Franklin',sans-serif",lineHeight:1}}>{v}</div>
              <div style={{fontSize:9,color:T.dim,fontFamily:"'EB Garamond',serif",marginTop:2,fontStyle:"italic"}}>{s}</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[
            {title:"Key Partnerships",color:DHA.blue,items:["Tacoma Trauma Trust (St. Joseph MC + MultiCare Tacoma General)","Gourley VA-DoD Clinic (2nd fully integrated VA/DoD in nation)","Puget Sound MTF Network: Naval Hosp. Bremerton + 62nd Med Sq"]},
            {title:"Unique Capabilities",color:DHA.darkBlue,items:["Intrepid Spirit Center — TBI/PTSD (opened 2018, #6 nationally)","Armed Services Blood Bank Center PNW — on-site","Andersen Simulation Center — 1st ACS-accredited DoD sim facility","Largest BH provider count in Army (embedded BH teams, 2011+)"]},
            {title:"Existing Imaging",color:DHA.green,items:["CT (trauma-capable) — operational","MRI — operational","Interventional Radiology — operational","Nuclear Medicine — operational","Radiation Oncology — operational","Ultrasound (incl. Antenatal Diagnostic Center)"]},
          ].map(({title,color,items})=>(
            <div key={title} style={{padding:"12px",background:T.isDark?`${color}10`:T.bg2,borderRadius:3,border:`1px solid ${color}30`}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color,fontFamily:"'Libre Franklin',sans-serif",textTransform:"uppercase",marginBottom:8}}>{title}</div>
              {items.map(it=>(
                <div key={it} style={{display:"flex",gap:6,marginBottom:4}}>
                  <span style={{color,flexShrink:0,marginTop:1}}>›</span>
                  <span style={{fontSize:10,color:T.muted,fontFamily:"'EB Garamond',serif",lineHeight:1.5}}>{it}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ScenarioPage({ state, setState }) {
  const T=useT();
  return (
    <div className="fade-up">
      <Card title="Select Operational Scenario" accent={DHA.darkBlue} badge={<span style={{fontSize:9,color:T.muted,fontFamily:"'Source Code Pro',monospace"}}>Selection recalculates all targets</span>}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {Object.entries(SCENARIOS).map(([key,sc])=>{
            const active=state.scenario===key;
            return (
              <div key={key} onClick={()=>setState(p=>({...p,scenario:key}))} style={{padding:18,borderRadius:4,cursor:"pointer",background:active?(T.isDark?`${sc.color}15`:`${sc.color}08`):T.bg2,border:`2px solid ${active?sc.color:T.borderCard}`,transition:"all .2s"}}>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:2.5,color:sc.color,fontFamily:"'Libre Franklin',sans-serif",marginBottom:5}}>{sc.name}</div>
                <div style={{fontSize:15,fontWeight:700,color:T.text,fontFamily:"'Libre Franklin',sans-serif",marginBottom:8}}>{sc.full}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {[["Bed Target",`+${sc.beds}`],["Window",sc.time],["ICU Ratio",`${(sc.icu*100).toFixed(0)}%`],["Supply Buf",`${sc.supply}d`]].map(([k,v])=>(
                    <div key={k} style={{padding:"6px 8px",background:T.isDark?`${sc.color}10`:`${sc.color}06`,borderRadius:3}}>
                      <div style={{fontSize:8,color:T.dim,fontFamily:"'Source Code Pro',monospace",letterSpacing:1}}>{k}</div>
                      <div style={{fontSize:13,fontWeight:700,color:sc.color,fontFamily:"'Libre Franklin',sans-serif"}}>{v}</div>
                    </div>
                  ))}
                </div>
                {active&&<div style={{marginTop:10,textAlign:"center",padding:"5px",background:`${sc.color}15`,borderRadius:3}}><span style={{fontSize:9,fontWeight:700,letterSpacing:2,color:sc.color,fontFamily:"'Source Code Pro',monospace"}}>◉ ACTIVE</span></div>}
              </div>
            );
          })}
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card title="Scenario Comparison" accent={DHA.blue}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:"'Libre Franklin',sans-serif"}}>
            <thead>
              <tr>{["Factor","Steady","DSRF","LSCO"].map(h=>(
                <th key={h} style={{padding:"7px 8px",textAlign:h==="Factor"?"left":"center",color:T.muted,fontSize:9,letterSpacing:1.5,fontWeight:700,borderBottom:`1px solid ${T.borderCard}`,textTransform:"uppercase"}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {[["Bed Target","+75","+100","+150"],["Window","12-24 mo","30-90 d","<30 days"],["ICU Ratio","15%","20%","25%"],["Staff Mult","x1.2","x1.5","x2.2"],["Supply Buffer","60d","90d","180d"],["ROLE Level","III+","III Surge","III Theater"],["Emergency Auth","No","Possible","Required"],["MILCON Viable","Yes","Partial","Modular Only"]].map(([f,...vals])=>(
                <tr key={f} style={{borderBottom:`1px solid ${T.borderCard}`}}>
                  <td style={{padding:"7px 8px",color:T.muted,fontFamily:"'EB Garamond',serif"}}>{f}</td>
                  {vals.map((v,i)=>{const sc=["steady","dsrf","lsco"][i];const a=state.scenario===sc;return <td key={i} style={{padding:"7px 8px",textAlign:"center",color:a?SCENARIOS[sc].color:T.dim,fontWeight:a?700:400}}>{v}</td>;})}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="JBLM Theater Context" accent={DHA.green}>
          {[
            {u:"7th Infantry Division",      r:"Primary patient population; LSCO mass casualty generator",         c:T.critText},
            {u:"I Corps HQ / JBLM",          r:"Corps-level medical authority; MAMC serves as theater medical hub", c:T.highText},
            {u:"62d Airlift Wing (McChord)",  r:"STRATEVAC APOE; MEDEVAC; C-17 medical configurations",             c:T.warn},
            {u:"62d Medical Brigade",        r:"Forward medical assets feeding MAMC from division support areas",   c:T.ok},
            {u:"18th Medical Command",       r:"Theater medical coordination; MAMC reporting chain",                c:T.blue},
            {u:"Port of Tacoma",             r:"Strategic sealift bulk medical resupply; critical LOC",             c:T.muted},
          ].map(({u,r,c})=>(
            <div key={u} style={{padding:"8px 0",borderBottom:`1px solid ${T.borderCard}`,display:"flex",gap:10}}>
              <div style={{width:3,background:c,borderRadius:2,flexShrink:0}}/>
              <div><div style={{fontSize:11,fontWeight:700,color:c,fontFamily:"'Libre Franklin',sans-serif"}}>{u}</div><div style={{fontSize:10,color:T.dim,fontFamily:"'EB Garamond',serif",marginTop:1,fontStyle:"italic"}}>{r}</div></div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function BedsPage({ state, setState }) {
  const T=useT();
  const set=(k,v)=>setState(p=>({...p,beds:{...p.beds,[k]:v}}));
  const sc=SCENARIOS[state.scenario]; const nb=sumBeds(state); const total=MAMC.currentBeds+nb;
  const beds=[
    {k:"medSurg",l:"Medical / Surgical",          max:50,c:DHA.blue},
    {k:"icu",    l:"Intensive Care Unit (ICU)",    max:30,c:DHA.green},
    {k:"trauma", l:"Trauma / Surgical ICU",        max:25,c:DHA.maroon},
    {k:"ortho",  l:"Orthopedic / Surgical",        max:20,c:"#7a5a20"},
    {k:"burn",   l:"Burn Unit",                    max:15,c:"#9a3a20"},
    {k:"bh",     l:"Behavioral Health (PTSD/TBI)", max:20,c:"#5a3a80"},
    {k:"rehab",  l:"Rehabilitation (PT/OT)",       max:20,c:DHA.darkBlue},
    {k:"surge",  l:"Surge / Flex Ward",            max:50,c:DHA.gray},
    {k:"iso",    l:"Isolation / Infectious Disease",max:15,c:"#7a2060"},
  ];
  return (
    <div className="fade-up">
      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:12}}>
        <div>
          <Card title="Bed Allocation Matrix" accent={DHA.blue} badge={<span style={{fontSize:12,fontWeight:700,color:nb>=sc.beds?T.ok:T.warn,fontFamily:"'Libre Franklin',sans-serif"}}>{nb} / {sc.beds}</span>}>
            <FloorPlan state={state}/>
            <div style={{height:14}}/>
            {beds.map(b=><Slider key={b.k} label={b.l} value={state.beds[b.k]} min={0} max={b.max} unit=" beds" color={b.c} onChange={v=>set(b.k,v)}/>)}
          </Card>
        </div>
        <div>
          <Card title="Capacity Summary" accent={T.blue}>
            <div style={{textAlign:"center",padding:"10px 0 14px"}}><Ring value={Math.round(Math.min(nb/sc.beds,1)*100)} size={90}/><div style={{fontSize:9,color:T.muted,fontFamily:"'Source Code Pro',monospace",marginTop:5,letterSpacing:1.5}}>BED TARGET %</div></div>
            {[[MAMC.currentBeds,"Current MAMC Beds",T.dim],[nb,"New Beds Planned",T.ok],[total,"Total Post-Expansion",T.blue],[sc.beds,`${sc.name} Target`,sc.color],[300,"NATO ROLE III Min.",T.warn]].map(([v,l,c])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.borderCard}`}}>
                <span style={{fontSize:11,color:T.muted,fontFamily:"'EB Garamond',serif"}}>{l}</span>
                <span style={{fontSize:14,fontWeight:700,color:c,fontFamily:"'Libre Franklin',sans-serif"}}>{v}</span>
              </div>
            ))}
          </Card>
          <Card title="Ratio Analysis" accent={T.ok}>
            {[{l:"ICU Ratio",c:state.beds.icu/total*100,t:sc.icu*100},{l:"Trauma Ratio",c:state.beds.trauma/total*100,t:sc.trauma*100},{l:"BH Ratio",c:state.beds.bh/total*100,t:5},{l:"Isolation Ratio",c:state.beds.iso/total*100,t:4}].map(({l,c,t})=>{
              const col=c>=t?T.ok:T.warn;
              return <div key={l} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,color:T.muted,fontFamily:"'EB Garamond',serif"}}>{l}</span><span style={{fontSize:10,fontFamily:"'Source Code Pro',monospace"}}><span style={{color:col}}>{c.toFixed(1)}%</span><span style={{color:T.dim}}> / {t}%</span></span></div><Bar value={c} max={t*1.5+1} color={col} height={5}/></div>;
            })}
          </Card>
        </div>
      </div>
    </div>
  );
}

function PersonnelPage({ state, setState }) {
  const T=useT();
  const set=(k,v)=>setState(p=>({...p,pers:{...p.pers,[k]:v}}));
  const tp=sumPers(state); const sc=SCENARIOS[state.scenario];
  const roles=[
    {k:"md",      l:"Physicians (MD/DO)",          max:80, c:T.critText},
    {k:"rn",      l:"RNs (ICU/CCRN/Med-Surg)",     max:300,c:T.ok},
    {k:"pa",      l:"Physician Assistants (PA-C)",  max:50, c:T.warn},
    {k:"crna",    l:"CRNAs / Anesthesiologists",    max:30, c:T.highText},
    {k:"medic",   l:"68W Combat Medics / LPNs",     max:250,c:T.blue},
    {k:"allied",  l:"Allied Health Specialists",    max:120,c:DHA.bgBlue},
    {k:"admin",   l:"Admin / GS Civilians",         max:100,c:T.muted},
    {k:"contract",l:"CIVMED / Contractors",         max:100,c:T.isDark?DHA.bgBlue:DHA.darkBlue},
  ];
  return (
    <div className="fade-up">
      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:12}}>
        <div>
          <Card title="Personnel Augmentation Plan" accent={DHA.blue} badge={<span style={{fontSize:12,fontWeight:700,color:DHA.blue,fontFamily:"'Libre Franklin',sans-serif"}}>+{tp} Total</span>}>
            {roles.map(r=><Slider key={r.k} label={r.l} value={state.pers[r.k]} min={0} max={r.max} color={r.c} onChange={v=>set(r.k,v)}/>)}
          </Card>
          <Card title="Activation Source Mix" accent={DHA.green}>
            <Slider label="Active Duty Organic (MAMC)" value={state.persSource.ad} min={0} max={100} unit="%" color={T.ok} onChange={v=>setState(p=>({...p,persSource:{...p.persSource,ad:v}}))}/>
            <Slider label="USAR / ARNG Augmentation" value={state.persSource.usar} min={0} max={100} unit="%" color={T.warn} onChange={v=>setState(p=>({...p,persSource:{...p.persSource,usar:v}}))}/>
            <Slider label="CIVMED / Contract Personnel" value={state.persSource.civ} min={0} max={100} unit="%" color={T.blue} onChange={v=>setState(p=>({...p,persSource:{...p.persSource,civ:v}}))}/>
          </Card>
        </div>
        <div>
          <Card title="Staffing Analysis" accent={T.warn}>
            <div style={{textAlign:"center",padding:"10px 0 14px"}}><Ring value={Math.round(Math.min(tp/(sc.beds*sc.mult*2.5),1)*100)} size={90} label="COVERAGE"/></div>
            {roles.map(r=><div key={r.k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.borderCard}`}}><span style={{fontSize:11,color:T.muted,fontFamily:"'EB Garamond',serif"}}>{r.l.split(" ")[0]}</span><span style={{fontSize:13,fontWeight:700,color:r.c,fontFamily:"'Libre Franklin',sans-serif"}}>{state.pers[r.k]}</span></div>)}
          </Card>
          <Card title="Nurse Staffing Requirements" accent={T.ok}>
            {[["ICU (1:2 ratio)",state.beds.icu*6],["Trauma ICU (1:2)",state.beds.trauma*6],["Med/Surg (1:4)",Math.ceil(state.beds.medSurg/4)*3],["Ortho (1:4)",Math.ceil(state.beds.ortho/4)*3],["BH (1:5)",Math.ceil(state.beds.bh/5)*3]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${T.borderCard}`}}>
                <span style={{fontSize:11,color:T.muted,fontFamily:"'EB Garamond',serif"}}>{l}</span>
                <span style={{fontSize:12,fontWeight:700,color:T.ok,fontFamily:"'Libre Franklin',sans-serif"}}>{v} RNs</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfraPage({ state, setState }) {
  const T=useT();
  const setI=(k,v)=>setState(p=>({...p,infra:{...p.infra,[k]:v}}));
  const items=[
    {k:"or",    l:"Additional OR Suites (+4)",           d:"~$3.5-5.5M/suite; laminar flow, boom systems",          req:true, cat:"Surgical"},
    {k:"icu",   l:"ICU Physical Expansion",              d:"Expand footprint; isolation rooms; telemetry",           req:true, cat:"Critical Care"},
    {k:"ed",    l:"Emergency Department Expansion",      d:"Trauma bays; resus rooms; MASCAL throughput",            req:true, cat:"Emergency"},
    {k:"ct",    l:"Advanced Imaging (CT already exists)",d:"CT trauma-capable — exists; MRI, fluoroscopy planned",   req:false,cat:"Diagnostic"},
    {k:"lab",   l:"Laboratory / Pathology (exists)",     d:"STAT trauma labs; POC surge capacity",                   req:false,cat:"Diagnostic"},
    {k:"pharm", l:"Pharmacy Expansion (exists)",         d:"DEA Schedule II vault; IV automation; LSCO formulary",   req:false,cat:"Pharmacy"},
    {k:"blood", l:"Blood Bank — ASBP PNW (on-site)",     d:"WBB program; emergency release; cold storage redundancy",req:false,cat:"Blood"},
    {k:"decon", l:"CBRNE Decontamination Station",       d:"Mass decon corridor; warm/hot zone separation",          req:true, cat:"CBRNE"},
    {k:"helipad",l:"Helipad Expansion / 2nd LZ",         d:"Simultaneous MEDEVAC in mass casualty",                  req:false,cat:"MEDEVAC"},
    {k:"gen",   l:"Emergency Generator Upgrade (NFPA 99 Type 1)",d:"10-second transfer; life-safety; TJC mandatory", req:true, cat:"Utilities"},
    {k:"water", l:"Potable Water Surge Storage (72-hour)",d:"On-site storage; sterile water for CSSD, dialysis",     req:true, cat:"Utilities"},
    {k:"o2",    l:"Medical Gas / O2 Plant Upgrade",      d:"Liquid O2 expansion; vacuum/air for ORs and ICU",        req:true, cat:"Utilities"},
    {k:"mod",   l:"Modular / Prefab Surge Wards",        d:"ISO container units; 6-12 month expedited capacity",     req:false,cat:"Surge"},
    {k:"neg",   l:"Negative Pressure / AIIR Rooms",      d:"ASHRAE 170; 10+ ACH; CBRN isolation capable",           req:false,cat:"Infection Ctrl"},
  ];
  const checked=Object.values(state.infra).filter(Boolean).length;
  return (
    <div className="fade-up">
      <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:12}}>
        <div>{[...new Set(items.map(i=>i.cat))].map(cat=>(
          <Card key={cat} title={cat} accent={DHA.blue}>
            {items.filter(i=>i.cat===cat).map(i=><Toggle key={i.k} label={i.l} desc={i.d} value={state.infra[i.k]} onChange={v=>setI(i.k,v)} req={i.req}/>)}
          </Card>
        ))}</div>
        <div>
          <Card title="Completion Status" accent={DHA.green}><div style={{textAlign:"center",padding:"10px 0 14px"}}><Ring value={Math.round(checked/items.length*100)} size={90} label="INFRA READY"/></div></Card>
          <Card title="Regulatory Path" accent={DHA.darkBlue}>
            {[["USACE","All construction >$750K on JBLM"],["DPW","Utilities, siting, ATFP"],["OEHS","NEPA/SEPA environmental"],["NFPA 99/101","Health care occupancy cert"],["MASSPAS","WA DSHS facility inspection"],["TJC Survey","Accreditation update required"],["ATFP","Force protection siting"]].map(([k,v])=>(
              <div key={k} style={{padding:"5px 0",borderBottom:`1px solid ${T.borderCard}`,fontSize:10,fontFamily:"'EB Garamond',serif",color:T.muted}}><span style={{color:DHA.blue,fontWeight:700,fontFamily:"'Libre Franklin',sans-serif"}}>{k}:</span> {v}</div>
            ))}
          </Card>
          <Card title="Cost Benchmarks (MILCON)" accent={DHA.yellow}>
            {[["New OR Suite","$3.5-5.5M"],["ICU Bed (new)","$250-400K"],["Med/Surg Bed","$100-180K"],["Modular Bed","$60-110K"],["Generator Upg.","$500K-2M"]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${T.borderCard}`,fontSize:10,fontFamily:"'Libre Franklin',sans-serif"}}><span style={{color:T.muted}}>{k}</span><span style={{color:T.warn,fontWeight:700}}>{v}</span></div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

function SupplyPage({ state, setState }) {
  const T=useT();
  const setS=(k,v)=>setState(p=>({...p,supply:{...p.supply,[k]:v}}));
  const sc=SCENARIOS[state.scenario];
  return (
    <div className="fade-up">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>
          <Card title="Supply Chain Parameters" accent={DHA.yellow}>
            <Slider label="Medical Supply Buffer" value={state.supply.days} min={7} max={180} unit=" days" warn={sc.supply*.6} danger={30} color={DHA.blue} note={state.supply.days<sc.supply?"⚠ BELOW TARGET":"✓ ADEQUATE"} onChange={v=>setS("days",v)}/>
            <Slider label="Blood Products (pRBC+FFP+PLT)" value={state.supply.blood} min={100} max={5000} unit=" units" warn={500} danger={200} color={DHA.maroon} onChange={v=>setS("blood",v)}/>
            <Slider label="Pharmacy / Formulary Buffer" value={state.supply.rx} min={7} max={120} unit=" days" warn={30} danger={14} color={DHA.blue} note={state.supply.rx<30?"⚠ BELOW MINIMUM":"✓"} onChange={v=>setS("rx",v)}/>
          </Card>
          <Card title="Logistics Capabilities" accent={DHA.blue}>
            {[
              {k:"wb",     l:"Walking Blood Bank (WBB) Program",    d:"ASBP activation; emergency O-neg release; JBLM donor registry"},
              {k:"pharm",  l:"Expanded Inpatient Pharmacy",          d:"DEA Schedule II vault; high-alert IV automation"},
              {k:"spd",    l:"Sterile Processing (SPD) Expansion",   d:"Surgical instrument reprocessing; AAMI ST79 compliance"},
              {k:"waste",  l:"Medical Waste / RCRA Compliance",      d:"Red bag, sharps, chemo surge; JBLM DPW coordination"},
              {k:"food",   l:"Patient Food Service Surge",           d:"Therapeutic diets, tube feeding; expanded census"},
              {k:"laundry",l:"Linen / Laundry Surge",               d:"4 lb/patient/day; isolation linen separate"},
              {k:"mort",   l:"Mortuary Affairs Coordination",        d:"54th QM Co (MA) at JBLM; JPAC protocols"},
              {k:"cold",   l:"Cold Chain Storage",                   d:"Vaccines, biologics, blood; generator-backed"},
              {k:"dla",    l:"DLA Contingency Contract",             d:"Prime Vendor activation; surge ordering authorization"},
            ].map(i=><Toggle key={i.k} label={i.l} desc={i.d} value={state.supply[i.k]} onChange={v=>setS(i.k,v)}/>)}
          </Card>
        </div>
        <div>
          <Card title="Supply Chain Risks" accent={T.critText}>
            {[
              {r:"DLA Lead Times (LSCO)",   s:"CRITICAL",n:"Contested logistics; 2-4x normal lead times; pre-position now"},
              {r:"Blood Resupply",           s:"CRITICAL",n:"Type-specific blood scarce in LSCO; WBB program essential"},
              {r:"Controlled Substances",    s:"HIGH",    n:"DEA allocation limits; State board notification; pre-position"},
              {r:"Pharmaceutical Shortage",  s:"HIGH",    n:"ASHP shortage list; pre-position critical LSCO items"},
              {r:"Cold Chain Integrity",     s:"HIGH",    n:"Generator backup required for all refrigerated storage"},
              {r:"JBLM Gate Access",         s:"MED",     n:"Force protection delays resupply; coordinate dedicated lane"},
              {r:"Port of Tacoma",           s:"LOW",     n:"LOC disruption; alternate air resupply via McChord"},
            ].map(({r,s,n})=>(
              <div key={r} style={{padding:"9px 11px",marginBottom:6,background:T[`${s.toLowerCase()}Bg`],border:`1px solid ${T[`${s.toLowerCase()}Text`]}30`,borderLeft:`3px solid ${T[`${s.toLowerCase()}Text`]}`,borderRadius:3}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,fontWeight:700,color:T.text,fontFamily:"'Libre Franklin',sans-serif"}}>{r}</span><Badge level={s}/></div>
                <div style={{fontSize:10,color:T.dim,fontFamily:"'EB Garamond',serif",fontStyle:"italic"}}>{n}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

function ClinicalPage({ state, setState }) {
  const T=useT();
  const setC=(k,v)=>setState(p=>({...p,clin:{...p.clin,[k]:v}}));
  return (
    <div className="fade-up">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>
          <Card title="Trauma Configuration" accent={DHA.maroon}>
            <Select label="Trauma Level Target" value={state.clin.level} options={[{v:"I",l:"Level I — Comprehensive (24/7 in-house)"},{v:"II",l:"Level II — Major Trauma (Current MAMC)"},{v:"III",l:"Level III — Prompt Surgery"}]} onChange={v=>setC("level",v)}/>
            <div style={{padding:"10px 12px",background:T.critBg,border:`1px solid ${T.critText}25`,borderRadius:3,fontSize:10,color:T.muted,fontFamily:"'EB Garamond',serif",lineHeight:1.8,fontStyle:"italic"}}>
              <div style={{color:T.critText,fontWeight:700,fontStyle:"normal",marginBottom:3}}>Level I Requirements (if upgrading):</div>
              <div>• 24/7 in-house attending trauma surgeon (not on-call)</div>
              <div>• 1,200+ trauma admissions/year (LSCO: easily met)</div>
              <div>• Neurosurgery, ortho, cardiology 24/7 call</div>
              <div>• ACS trauma verification — multi-year process unless waived</div>
            </div>
          </Card>
          <Card title="Surgical Services" accent={T.critText}>
            {[
              {k:"burn", l:"Burn Care (Level I Capability)",                  d:"Transfer MOU with UW Harborview (35 min); isolated ward"},
              {k:"neuro",l:"Neurosurgery / TBI (already exists at MAMC)",    d:"24/7 neurosurgeon; ICP monitoring; dominant LSCO injury"},
              {k:"card", l:"Cardiology / Cardiothoracic (already exists)",   d:"Penetrating cardiac trauma; open chest capability"},
              {k:"ortho",l:"Orthopedics / Extremity Trauma (already exists)",d:"Limb salvage, amputation; dominant LSCO blast injury"},
            ].map(i=><Toggle key={i.k} label={i.l} desc={i.d} value={state.clin[i.k]} onChange={v=>setC(i.k,v)} req={i.k==="burn"}/>)}
          </Card>
          <Card title="Behavioral Health & Rehab" accent={"#5a3a80"}>
            {[
              {k:"ptsd",l:"PTSD / Combat Stress Program",              d:"Largest BH provider in Army; embedded BH teams since 2011"},
              {k:"tbi", l:"TBI Program (Intrepid Spirit Center — exists)",d:"Opened 2018; #6 nationally; mTBI to severe TBI continuum"},
              {k:"pt",  l:"Physical / Occupational Therapy (exists)",   d:"Inpatient rehab; adaptive reconditioning; WTU integration"},
              {k:"dial",l:"Dialysis / Renal Replacement (exists)",      d:"Nephrology clinic operational; CRRT for rhabdomyolysis"},
            ].map(i=><Toggle key={i.k} label={i.l} desc={i.d} value={state.clin[i.k]} onChange={v=>setC(i.k,v)}/>)}
          </Card>
        </div>
        <div>
          <Card title="LSCO Injury Pattern (Historical)" accent={DHA.yellow}>
            {[
              {t:"Penetrating Trauma (GSW/Blast)",p:35,c:T.critText,n:"OR surge, SICU-intensive"},
              {t:"Extremity Trauma / Amputation", p:28,c:T.highText,n:"TQ to OR to Ortho to Rehab pathway"},
              {t:"Traumatic Brain Injury (TBI)",  p:15,c:"#5a3a80",n:"ICP, neuro ICU, BH"},
              {t:"Burns (incendiary, fuel fire)",  p:8, c:T.warn,   n:"Transfer to Harborview for severe"},
              {t:"Behavioral Health (Combat Stress)",p:7,c:T.blue,  n:"Surge within 30-60 days post-conflict"},
              {t:"Poly-trauma / Multi-system",    p:7, c:T.muted,   n:"SICU dominant; highest acuity"},
            ].map(({t,p,c,n})=>(
              <div key={t} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:11,color:T.muted,fontFamily:"'EB Garamond',serif"}}>{t}</span>
                  <span style={{fontSize:11,fontWeight:700,color:c,fontFamily:"'Libre Franklin',sans-serif"}}>{p}%</span>
                </div>
                <Bar value={p} max={40} color={c} height={5}/>
                <div style={{fontSize:9,color:T.dim,fontFamily:"'EB Garamond',serif",marginTop:2,fontStyle:"italic"}}>{n}</div>
              </div>
            ))}
          </Card>
          <Card title="Civilian Partner Network" accent={DHA.green}>
            {[
              {n:"UW Harborview MC",            d:"Level I Trauma, Burn; Tacoma Trauma Trust; 35-45 min",   c:T.critText},
              {n:"MultiCare Tacoma General",    d:"Tacoma Trauma Trust partner; Level II; 20-25 min",       c:T.highText},
              {n:"CHI Franciscan St. Joseph",   d:"Regional surge capacity; 20 min Tacoma",                 c:T.warn},
              {n:"VA Puget Sound (Am. Lake)",   d:"PTSD/TBI veterans; co-located JBLM campus",              c:T.blue},
              {n:"NDMS FMS Teams (DHHS)",       d:"Federal Medical Stations; MASCAL overflow national asset",c:T.ok},
            ].map(({n,d,c})=>(
              <div key={n} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:`1px solid ${T.borderCard}`}}>
                <div style={{width:3,background:c,borderRadius:2,flexShrink:0}}/>
                <div><div style={{fontSize:11,fontWeight:700,color:c,fontFamily:"'Libre Franklin',sans-serif"}}>{n}</div><div style={{fontSize:10,color:T.dim,fontFamily:"'EB Garamond',serif",fontStyle:"italic",marginTop:1}}>{d}</div></div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

function IMDPage({ state, setState }) {
  const T=useT();
  const setIT=(k,v)=>setState(p=>({...p,it:{...p.it,[k]:v}}));
  return (
    <div className="fade-up">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>
          <Card title="Clinical Information Systems" accent={DHA.blue} badge={<Dot on={state.it.genesis&&state.it.ato} label={state.it.genesis&&state.it.ato?"COMPLIANT":"GAPS"}/>}>
            {[
              {k:"genesis",l:"MHS Genesis (Cerner) EHR — ADT Reconfigured",  d:"ADT module must be reconfigured for expanded beds; test in staging before production",req:true},
              {k:"tele",   l:"Telehealth / Teleconsult Platform",            d:"LSCO remote specialist consultation; bandwidth-tested"},
              {k:"tptp",   l:"Theater Patient Tracking (TPTP / JPTA)",       d:"Joint Patient Tracking Application; LSCO patient flow; MEDPROS integration",req:true},
              {k:"bi",     l:"Power BI Analytics Dashboard",                 d:"Bed management, throughput analytics; DHA J-6 data standards"},
            ].map(i=><Toggle key={i.k} label={i.l} desc={i.d} value={state.it[i.k]} onChange={v=>setIT(i.k,v)} req={i.req}/>)}
          </Card>
          <Card title="Cybersecurity & RMF" accent={T.critText} badge={<Dot on={state.it.ato&&state.it.cyber} label={state.it.ato?"ATO CURRENT":"ATO OPEN"}/>}>
            {[
              {k:"ato",   l:"ATO Current — RMF Authority to Operate (DoDI 8510.01)",d:"All new systems require RMF package; IMD ISSO/ISSM coordination; 60-180d",req:true},
              {k:"iomt",  l:"IoMT Medical Device ATO Program",                      d:"Every bedside monitor/infusion pump/vent = separate ATO package",req:true},
              {k:"cyber", l:"Cybersecurity Controls (DoD 8140 / NIST 800-171)",     d:"HBSS endpoint; CMMC-aligned; IMD SOC integration",req:true},
              {k:"sipr",  l:"SIPRNET / NIPRNET Separation in Expansion Wings",      d:"Expansion wings require proper infrastructure; JBLM NEC coordination"},
            ].map(i=><Toggle key={i.k} label={i.l} desc={i.d} value={state.it[i.k]} onChange={v=>setIT(i.k,v)} req={i.req}/>)}
          </Card>
        </div>
        <div>
          <Card title="Infrastructure & Communications" accent={DHA.darkBlue}>
            {[
              {k:"bw",   l:"Network Bandwidth Upgrade (JBLM NEC)",          d:"Expansion wings: structured cabling, fiber, wireless APs"},
              {k:"comms",l:"Backup PACE Communications (HF/SATCOM)",         d:"PACE: Primary IP, Alternate SATCOM, Contingency HF, Emergency landline"},
              {k:"spo",  l:"SharePoint Online Migration (Jul 2026 deadline)",d:"SP2016 to SPO; all expansion docs must migrate; IMD IMO lead",req:true},
              {k:"cab",  l:"CAB / CCB Process Active for All IT Changes",    d:"No shadow IT; all deployments through IMD Change Advisory Board"},
            ].map(i=><Toggle key={i.k} label={i.l} desc={i.d} value={state.it[i.k]} onChange={v=>setIT(i.k,v)} req={i.req}/>)}
          </Card>
          <Card title="IMD CIO Impact Assessment" accent={DHA.yellow}>
            <div style={{padding:"10px 12px",background:T.isDark?`${DHA.yellow}10`:T.bg3,border:`1px solid ${DHA.yellow}30`,borderRadius:3,marginBottom:10,fontSize:10,color:T.warn,fontFamily:"'Libre Franklin',sans-serif",fontWeight:700}}>⚠ IMD (~90 positions) likely requires augmentation during expansion phase</div>
            {[
              ["Genesis ADT reconfig",   "2-4 sprints; Cerner/DHA PMO coordination"],
              ["New wing network build",  "NEC + IMD; cabling, fiber, Wi-Fi infrastructure"],
              ["IoMT ATO packages",       "60-120d per device class; each device = separate package"],
              ["TPTP integration",        "DHA J-6; test with 62d Medical Brigade"],
              ["SharePoint migration",    "IMD IMO lead; Jul 2026 hard deadline"],
              ["CAB surge cadence",       "Increase meeting frequency during construction phases"],
            ].map(([k,v])=>(
              <div key={k} style={{padding:"4px 0",borderBottom:`1px solid ${T.borderCard}`,fontSize:10,fontFamily:"'EB Garamond',serif",color:T.muted}}><span style={{color:DHA.blue,fontWeight:700,fontFamily:"'Libre Franklin',sans-serif"}}>{k}:</span> {v}</div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

function RiskPage({ state, setState }) {
  const T=useT();
  const setR=(k,v)=>setState(p=>({...p,risk:{...p.risk,[k]:v}}));
  const risks=[
    {s:"CRITICAL",p:"HIGH",c:"Personnel",t:"Staffing Shortfall vs LSCO Surge",      d:"LSCO mass casualty surge will exceed organic MAMC staffing. RC mobilization, TCS, and emergency CIVMED hiring must execute simultaneously.",m:"Pre-position RC mobilization orders now. Execute CIVMED emergency hiring authority. Establish TCS with WRNMMC and BAMC."},
    {s:"CRITICAL",p:"HIGH",c:"IT/Cyber",  t:"ATO Gap — Systems Cannot Deploy",       d:"RMF ATO packages for expansion systems require 60-180+ days. Deploying without ATO violates DoDI 8510.01.",m:"Begin RMF packages immediately. Engage IMD ISSO now. Request expedited ATO under emergency authority if needed."},
    {s:"CRITICAL",p:"MED", c:"Governance",t:"DHA Facility Expansion Approval Not Obtained",d:"No physical expansion can begin without DHA MTF governance approval. This is the gating action for all construction and MILCON.",m:"Submit DHA expansion proposal with scenario analysis, cost estimate, and timeline immediately."},
    {s:"HIGH",    p:"HIGH",c:"Regulatory", t:"WA MASSPAS License Required",          d:"WA State DSHS licensing required for new licensed beds. Normal process: 6-18 months.",m:"Pre-application with WA DSHS now. Request expedited review under emergency provisions."},
    {s:"HIGH",    p:"HIGH",c:"Infrastructure",t:"18-36 Month Construction Lead Time",d:"Physical expansion cannot be completed in time for near-term DSRF or LSCO activation.",m:"Prioritize modular/prefab procurement now. Identify existing spaces for surge conversion."},
    {s:"HIGH",    p:"HIGH",c:"IT/Clinical",t:"MHS Genesis ADT Cannot Scale Without Config",d:"Expansion requires Genesis ADT reconfiguration. Untested configurations cause patient safety events.",m:"Engage Cerner/DHA Genesis PMO immediately. Build and test in staging; never go live untested."},
    {s:"HIGH",    p:"MED", c:"Logistics",  t:"Supply Chain in Contested LSCO Environment",d:"DLA lead times 2-4x normal during LSCO. Port of Tacoma may be congested.",m:"Increase on-hand supply to 90-180 days. Pre-position DLA contingency contracts."},
    {s:"HIGH",    p:"MED", c:"Utilities",  t:"NFPA 99 Generator Insufficient for Expansion",d:"Expanded clinical spaces require Type 1 Essential Electrical System coverage. Undersized generator fails TJC.",m:"Commission electrical load study. Size generator at expansion peak + 25% margin."},
  ];
  return (
    <div className="fade-up">
      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:12}}>
        <div>
          <Card title={`Risk Register — ${risks.filter(r=>r.s==="CRITICAL").length} Critical · ${risks.filter(r=>r.s==="HIGH").length} High`} accent={T.critText}>
            {risks.map((r,i)=>{
              const c=r.s==="CRITICAL"?T.critText:T.highText;
              return (
                <div key={i} style={{padding:"12px",marginBottom:8,background:T[`${r.s.toLowerCase()}Bg`],border:`1px solid ${c}25`,borderLeft:`3px solid ${c}`,borderRadius:3}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:5,flexWrap:"wrap"}}>
                    <Badge level={r.s}/><span style={{fontSize:9,color:T.dim,fontFamily:"'Source Code Pro',monospace"}}>{r.c}</span>
                    <span style={{fontSize:8,color:T.dim,fontFamily:"'Source Code Pro',monospace",marginLeft:"auto"}}>PROB: {r.p}</span>
                  </div>
                  <div style={{fontSize:12,fontWeight:700,color:T.text,fontFamily:"'Libre Franklin',sans-serif",marginBottom:4}}>{r.t}</div>
                  <div style={{fontSize:10,color:T.muted,fontFamily:"'EB Garamond',serif",lineHeight:1.6,marginBottom:6,fontStyle:"italic"}}>{r.d}</div>
                  <div style={{padding:"6px 10px",background:T.isDark?`${DHA.green}10`:`${DHA.green}08`,border:`1px solid ${DHA.green}25`,borderRadius:3}}>
                    <span style={{fontSize:9,fontWeight:700,color:T.ok,fontFamily:"'Libre Franklin',sans-serif"}}>MITIGATION: </span>
                    <span style={{fontSize:10,color:T.muted,fontFamily:"'EB Garamond',serif"}}>{r.m}</span>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
        <div>
          <Card title="Compliance Checklist" accent={DHA.darkBlue}>
            <Select label="MASSPAS Status" value={state.risk.masspas} options={["Not Started","Pre-Application","Partial","Filed","Inspected","Approved"].map(v=>({v,l:v}))} onChange={v=>setR("masspas",v)}/>
            {[
              {k:"tjc",  l:"TJC Accreditation Current"},
              {k:"dha",  l:"DHA Expansion Approval Obtained",req:true},
              {k:"nfpa", l:"NFPA 99/101 Compliant",req:true},
              {k:"osha", l:"OSHA / Safety Compliant"},
              {k:"hipaa",l:"HIPAA / Privacy Act Current"},
              {k:"cbrne",l:"CBRNE MASCAL Plan Exercised",req:true},
              {k:"hics", l:"HICS / ICS Plan Exercised"},
              {k:"opsec",l:"OPSEC Updated for Expansion"},
              {k:"atfp", l:"ATFP Force Protection Updated"},
            ].map(i=><Toggle key={i.k} label={i.l} value={state.risk[i.k]} onChange={v=>setR(i.k,v)} req={i.req}/>)}
          </Card>
        </div>
      </div>
    </div>
  );
}

function FinancePage({ state, setState }) {
  const T=useT();
  const setF=(k,v)=>setState(p=>({...p,fin:{...p.fin,[k]:v}}));
  const total=sumBudget(state); const nb=sumBeds(state);
  return (
    <div className="fade-up">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>
          <Card title="Budget Allocation" accent={DHA.yellow} badge={<span style={{fontSize:18,fontWeight:800,color:DHA.yellow,fontFamily:"'Libre Franklin',sans-serif"}}>${total}M</span>}>
            <Slider label="Construction / MILCON" value={state.fin.con} min={0} max={250} unit="M" color={T.highText} note={`~$${nb>0?(state.fin.con/nb*1000).toFixed(0):"—"}K/bed`} onChange={v=>setF("con",v)}/>
            <Slider label="Medical Equipment" value={state.fin.equip} min={0} max={100} unit="M" color={DHA.yellow} onChange={v=>setF("equip",v)}/>
            <Slider label="Personnel (1st Year)" value={state.fin.pers} min={0} max={200} unit="M" color={T.ok} onChange={v=>setF("pers",v)}/>
            <Slider label="IT / IMD Systems" value={state.fin.it} min={0} max={60} unit="M" color={T.blue} onChange={v=>setF("it",v)}/>
            <Slider label="Contingency Reserve" value={state.fin.cont} min={0} max={60} unit="M" color={T.muted} note={`${Math.round(state.fin.cont/total*100)}% of total`} onChange={v=>setF("cont",v)}/>
            <div style={{padding:"12px 14px",background:T.isDark?`${DHA.yellow}15`:`${DHA.yellow}08`,border:`1px solid ${DHA.yellow}30`,borderRadius:3,display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
              <span style={{fontSize:12,color:T.muted,fontFamily:"'Libre Franklin',sans-serif"}}>Total Planned Budget</span>
              <span style={{fontSize:24,fontWeight:800,color:DHA.yellow,fontFamily:"'Libre Franklin',sans-serif"}}>${total}M</span>
            </div>
          </Card>
          <Card title="Funding Source Mix" accent={DHA.green}>
            <Slider label="Defense Health Program (DHP)" value={state.fin.src.dhp} min={0} max={100} unit="%" color={T.ok} onChange={v=>setState(p=>({...p,fin:{...p.fin,src:{...p.fin.src,dhp:v}}}))}/>
            <Slider label="Military Construction (MILCON)" value={state.fin.src.mil} min={0} max={100} unit="%" color={T.blue} onChange={v=>setState(p=>({...p,fin:{...p.fin,src:{...p.fin.src,mil:v}}}))}/>
            <Slider label="RDT&E / Supplemental" value={state.fin.src.rdt} min={0} max={100} unit="%" color={T.muted} onChange={v=>setState(p=>({...p,fin:{...p.fin,src:{...p.fin.src,rdt:v}}}))}/>
          </Card>
        </div>
        <div>
          <Card title="Cost Benchmarks" accent={DHA.darkBlue}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:T.blue,fontFamily:"'Libre Franklin',sans-serif",textTransform:"uppercase",marginBottom:8}}>Construction (MILCON)</div>
            {[["New OR Suite","$3.5-5.5M"],["ICU Bed (new)","$250-400K"],["Med/Surg Bed","$100-180K"],["Modular Bed","$60-110K"],["ED Bay","$400-700K"],["Helipad (new)","$800K-1.5M"],["Generator Upgrade","$500K-2M"]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${T.borderCard}`,fontSize:10,fontFamily:"'Libre Franklin',sans-serif"}}><span style={{color:T.muted}}>{k}</span><span style={{color:T.warn,fontWeight:700}}>{v}</span></div>
            ))}
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:T.ok,fontFamily:"'Libre Franklin',sans-serif",textTransform:"uppercase",marginTop:12,marginBottom:8}}>Personnel (Annual)</div>
            {[["Trauma Surgeon (O-5/6)","$250-350K"],["ICU RN (GS-9/11)","$85-110K"],["CRNA (contracted)","$180-250K"],["68W Combat Medic","$45-65K"],["CIVMED Contract Nurse","$100-140K"]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${T.borderCard}`,fontSize:10,fontFamily:"'Libre Franklin',sans-serif"}}><span style={{color:T.muted}}>{k}</span><span style={{color:T.ok,fontWeight:700}}>{v}</span></div>
            ))}
          </Card>
          <Card title="Cost-Per-Bed Analysis" accent={T.highText}>
            <div style={{textAlign:"center",padding:"16px 0"}}>
              <div style={{fontSize:36,fontWeight:800,color:T.highText,fontFamily:"'Libre Franklin',sans-serif",lineHeight:1}}>${nb>0?(total/nb*1000).toFixed(0):"—"}K</div>
              <div style={{fontSize:10,color:T.muted,fontFamily:"'Source Code Pro',monospace",marginTop:4,letterSpacing:1.5}}>ESTIMATED COST PER NEW BED</div>
            </div>
            <div style={{fontSize:10,color:T.muted,fontFamily:"'EB Garamond',serif",lineHeight:1.8}}>
              <div>Benchmark: $500K-$2M / bed (new construction)</div>
              <div>Modular/surge: $100-$300K / bed</div>
              <div style={{marginTop:6,color:total/Math.max(nb,1)<0.5?T.critText:total/Math.max(nb,1)>3?T.warn:T.ok,fontWeight:700}}>
                {total/Math.max(nb,1)<0.5?"⚠ Budget likely underestimated":total/Math.max(nb,1)>3?"⚠ Budget may exceed typical range":"✓ Cost per bed within expected range"}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TimelinePage({ state, setState }) {
  const T=useT();
  const setP=(i,k,v)=>setState(p=>{const ph=[...p.phases];ph[i]={...ph[i],[k]:v};return {...p,phases:ph};});
  const colors=[DHA.bgBlue,DHA.yellow,T.highText,DHA.green,DHA.darkBlue];
  const phaseTasks=[
    ["DHA MTF expansion approval submission","USACE / DPW design coordination kickoff","MASSPAS pre-application to WA DSHS","HRC specialty fill requests submitted","CIVMED emergency hiring authority request","IMD RMF ATO packages initiated for all new systems","DLA contingency contract pre-solicitation","MILCON authorization request to Congress"],
    ["Construction / renovation begin (USACE prime contract award)","Modular/prefab surge ward procurement and installation","Medical equipment procurement via DLA/ESC","USAR/ARNG mobilization orders executed","GS civilian hiring actions completed","SharePoint Online migration complete (Jul 2026 deadline)","MHS Genesis ADT reconfiguration in staging environment","TPTP integration planning with DHA J-6"],
    ["Medical equipment installation and acceptance testing","IoMT ATO packages submitted for all new devices","JBLM NEC network infrastructure upgrade complete","MHS Genesis ADT tested and validated in staging","Blood bank expansion; WBB program active","TPTP integrated with MAMC and 62d Medical Brigade","Power BI bed management dashboard deployed","Cybersecurity controls upgraded; ISSE review complete"],
    ["TJC Joint Commission survey for expansion areas","NFPA 99/101 fire/life safety certification","Staff credentialing and privileging — all new providers","MHS Genesis go-live in expanded beds (production)","HICS/ICS mass casualty full-scale exercise","CBRNE tabletop and functional exercise","ORI / DHA operational readiness review","WA MASSPAS licensing inspection and approval"],
  ];
  return (
    <div className="fade-up">
      <Card title="Phased Execution Timeline" accent={DHA.darkBlue} badge={<span style={{fontSize:11,fontWeight:700,color:DHA.green,fontFamily:"'Libre Franklin',sans-serif"}}>FOC: {state.phases[4].start}</span>}>
        <div style={{marginBottom:16}}>
          <svg viewBox="0 0 700 120" style={{width:"100%",background:T.bg2,borderRadius:3,border:`1px solid ${T.borderCard}`}}>
            {["FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC","JAN","FEB","MAR","APR","MAY","JUN"].map((m,i)=>(
              <g key={i}><line x1={80+i*36} y1={0} x2={80+i*36} y2={120} stroke={T.isDark?"rgba(255,255,255,.06)":"rgba(0,0,0,.05)"} strokeWidth={1}/><text x={80+i*36+18} y={12} textAnchor="middle" fill={T.dim} fontSize={6} fontFamily="'Source Code Pro',monospace">{m}</text></g>
            ))}
            <line x1={80} y1={18} x2={700} y2={18} stroke={T.isDark?"rgba(255,255,255,.1)":"rgba(0,0,0,.08)"} strokeWidth={.5}/>
            {state.phases.slice(0,5).map((p,i)=>{
              const c=colors[i]; const y=22+i*18; const sx=80+i*40; const w=(5-i)*40+20;
              return (
                <g key={p.id}>
                  <text x={4} y={y+11} fill={T.muted} fontSize={7} fontFamily="'Source Code Pro',monospace">{p.label}</text>
                  <rect x={sx} y={y} width={w} height={14} rx={2} fill={`${c}22`} stroke={c} strokeWidth={1}/>
                  <text x={sx+w/2} y={y+10} textAnchor="middle" fill={c} fontSize={7} fontFamily="'Source Code Pro',monospace" fontWeight={700}>{p.start} - {p.end}</text>
                </g>
              );
            })}
            <line x1={108} y1={18} x2={108} y2={110} stroke={DHA.yellow} strokeWidth={1} strokeDasharray="3,2" opacity={.6}/>
            <text x={110} y={26} fill={DHA.yellow} fontSize={6} fontFamily="'Source Code Pro',monospace" fontWeight={700}>NOW</text>
          </svg>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
          {state.phases.map((p,i)=>(
            <div key={p.id} style={{padding:10,background:T.isDark?`${colors[i]}10`:`${colors[i]}06`,border:`1px solid ${colors[i]}30`,borderRadius:3}}>
              <div style={{fontSize:8,fontWeight:700,letterSpacing:2,color:colors[i],fontFamily:"'Libre Franklin',sans-serif",marginBottom:7}}>{p.label}</div>
              <input value={p.start} onChange={e=>setP(i,"start",e.target.value)} style={{width:"100%",background:T.bg3,border:`1px solid ${T.border}`,color:T.text,padding:"4px 7px",fontSize:10,borderRadius:2,fontFamily:"'Source Code Pro',monospace",marginBottom:4,boxSizing:"border-box"}}/>
              <input value={p.end} onChange={e=>setP(i,"end",e.target.value)} style={{width:"100%",background:T.bg3,border:`1px solid ${T.border}`,color:colors[i],padding:"4px 7px",fontSize:10,borderRadius:2,fontFamily:"'Source Code Pro',monospace",boxSizing:"border-box",fontWeight:700}}/>
            </div>
          ))}
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {phaseTasks.map((tasks,i)=>(
          <Card key={i} title={`${state.phases[i].label}: ${state.phases[i].name}`} accent={colors[i]}>
            {tasks.map(t=><div key={t} style={{display:"flex",gap:6,marginBottom:5}}><span style={{color:colors[i],flexShrink:0}}>›</span><span style={{fontSize:10,color:T.muted,fontFamily:"'EB Garamond',serif",lineHeight:1.5}}>{t}</span></div>)}
          </Card>
        ))}
      </div>
    </div>
  );
}

function BriefPage({ state, setState }) {
  const T=useT();
  const rd=calcReadiness(state); const sc=SCENARIOS[state.scenario];
  const nb=sumBeds(state); const total=MAMC.currentBeds+nb; const fb=sumBudget(state);
  const cpb=nb>0?(fb/nb*1000).toFixed(0):"—";
  const sc_c=rd.score>=80?T.ok:rd.score>=60?T.warn:rd.score>=40?T.highText:T.critText;
  const statusLabel=rd.score>=80?"MISSION READY":rd.score>=60?"CONDITIONALLY READY":rd.score>=40?"PARTIALLY READY":"CRITICAL GAPS";
  const radarData=[{label:"BEDS",value:rd.domains.beds},{label:"PERS",value:rd.domains.pers},{label:"INFRA",value:rd.domains.infra},{label:"SUPPLY",value:rd.domains.supply},{label:"CLINICAL",value:rd.domains.clinical},{label:"IT/IMD",value:rd.domains.it},{label:"RISK",value:rd.domains.risk},{label:"FINANCE",value:rd.domains.finance}];
  return (
    <div className="fade-up">
      <div style={{padding:"20px 24px",marginBottom:14,background:T.isDark?`${sc_c}15`:`${sc_c}08`,border:`2px solid ${sc_c}40`,borderRadius:4,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14}}>
        <div>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:2.5,color:sc_c,fontFamily:"'Libre Franklin',sans-serif",marginBottom:5}}>MAMC EXPANSION · {sc.full.toUpperCase()} · READINESS ASSESSMENT</div>
          <div style={{fontSize:26,fontWeight:900,color:T.text,fontFamily:"'Libre Franklin',sans-serif"}}>{statusLabel}</div>
          <div style={{fontSize:11,color:T.dim,fontFamily:"'EB Garamond',serif",marginTop:5,fontStyle:"italic"}}>{MAMC.currentBeds} beds to {total} total | +{nb} expansion | ${fb}M budget | FOC: {state.phases[4].start}</div>
        </div>
        <div style={{display:"flex",gap:14,alignItems:"center"}}><Radar data={radarData} size={150}/><Ring value={rd.score} size={120} color={sc_c}/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
        <Card title="Domain Scores" accent={sc_c}>
          {radarData.map(d=>{const c=d.value>=80?T.ok:d.value>=60?T.warn:d.value>=40?T.highText:T.critText;const names={BEDS:"Bed Capacity",PERS:"Personnel",INFRA:"Infrastructure",SUPPLY:"Logistics",CLINICAL:"Clinical Services",["IT/IMD"]:"IT / IMD",RISK:"Risk/Compliance",FINANCE:"Financial"};return <div key={d.label} style={{marginBottom:9}}><Bar label={names[d.label]} value={d.value} color={c} showVal/></div>;})}
        </Card>
        <Card title="Key Metrics" accent={DHA.darkBlue}>
          {[
            [`Beds vs target`,`${nb}/${sc.beds} (${nb>=sc.beds?"✓ MET":"DEFICIT "+(sc.beds-nb)})`,nb>=sc.beds?T.ok:T.warn],
            [`Post-expansion total`,`${total} (${total>=300?"✓ ROLE III+":"⚠ Below 300"})`,total>=300?T.ok:T.warn],
            ["ATO status",state.it.ato?"✓ Current":"⚠ NOT CURRENT",state.it.ato?T.ok:T.critText],
            ["DHA approval",state.risk.dha?"✓ Obtained":"⚠ NOT OBTAINED",state.risk.dha?T.ok:T.critText],
            ["MASSPAS",state.risk.masspas,state.risk.masspas==="Approved"?T.ok:T.warn],
            ["Generator (NFPA 99)",state.infra.gen?"✓ Planned":"⚠ Not planned",state.infra.gen?T.ok:T.critText],
            ["Supply buffer",`${state.supply.days}d (target: ${sc.supply}d)`,state.supply.days>=sc.supply?T.ok:T.warn],
            ["Total budget",`$${fb}M`,DHA.yellow],
          ].map(([l,v,c])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.borderCard}`,gap:8}}>
              <span style={{fontSize:10,color:T.muted,fontFamily:"'EB Garamond',serif"}}>{l}</span>
              <span style={{fontSize:10,fontWeight:700,color:c,fontFamily:"'Libre Franklin',sans-serif",textAlign:"right"}}>{v}</span>
            </div>
          ))}
        </Card>
        <Card title="Commander's Assessment" accent={DHA.darkBlue}>
          <div style={{padding:"10px 12px",background:T.isDark?`${sc_c}12`:`${sc_c}08`,border:`1px solid ${sc_c}30`,borderRadius:3,marginBottom:10,fontSize:11,color:sc_c,fontFamily:"'EB Garamond',serif",lineHeight:1.7,fontStyle:"italic"}}>
            {rd.score>=80&&"All major domains adequately planned. Recommend DHA approval submission, full-scale MASCAL exercise, and ORI scheduling."}
            {rd.score>=60&&rd.score<80&&"Core requirements addressed but critical gaps remain. Do not submit for DHA approval until ATO, personnel, and infrastructure are complete."}
            {rd.score>=40&&rd.score<60&&"Significant planning gaps. Mission failure risk is HIGH if LSCO activates before gaps are addressed. Immediate action required."}
            {rd.score<40&&"CRITICAL: Expansion not viable in current planning posture. Command review required immediately."}
          </div>
          <div style={{fontSize:10,color:T.muted,fontFamily:"'Libre Franklin',sans-serif",fontWeight:700,marginBottom:6}}>OPEN TOP ACTIONS:</div>
          {[["DHA Approval",state.risk.dha],["ATO Current",state.it.ato],["Personnel Pipeline",sumPers(state)>=150],["MASSPAS Approved",state.risk.masspas==="Approved"],["Bed Target Met",nb>=sc.beds]].filter(([,v])=>!v).slice(0,4).map(([l])=>(
            <div key={l} style={{fontSize:10,color:T.critText,fontFamily:"'Libre Franklin',sans-serif",marginBottom:3}}>⚠ {l} — OPEN</div>
          ))}
          {[["DHA",state.risk.dha],["ATO",state.it.ato],["Manning",sumPers(state)>=150],["MASSPAS",state.risk.masspas==="Approved"],["Beds",nb>=sc.beds]].every(([,v])=>v)&&<div style={{color:T.ok,fontWeight:700,fontFamily:"'Libre Franklin',sans-serif",fontSize:11}}>✓ All top actions complete</div>}
        </Card>
      </div>
      <Card title="Executive Summary — Command Brief" accent={DHA.darkBlue}>
        <div style={{padding:"16px 18px",background:T.isDark?`${DHA.darkBlue}40`:T.bg2,borderRadius:3,border:`1px solid ${T.borderCard}`,fontFamily:"'EB Garamond',serif",fontSize:11,color:T.muted,lineHeight:2.1}}>
          <div style={{color:T.text,fontWeight:700,fontSize:13,fontFamily:"'Libre Franklin',sans-serif",marginBottom:10}}>
            MAMC {sc.beds}-BED EXPANSION PLAN — {new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"}).toUpperCase()}
          </div>
          {[
            ["FACILITY",       "Madigan Army Medical Center (MAMC) · JBLM, Pierce County, WA · MTF: "+MAMC.mtf],
            ["SCENARIO",       `${sc.full} (${sc.name}) · Activation window: ${sc.time}`],
            ["CURRENT CAPACITY",`${MAMC.currentBeds} operational beds (surge: ${MAMC.surgeBeds}) · Level ${state.clin.level} Trauma · ${(MAMC.catchment/1000).toFixed(0)}K TRICARE beneficiaries`],
            ["EXPANSION PLAN", `+${nb} beds to ${total} total · ${nb>=sc.beds?"MEETS":"DOES NOT MEET"} ${sc.name} target of ${sc.beds} beds`],
            ["PERSONNEL SURGE",`+${sumPers(state)} personnel · ${state.persSource.ad}% AD / ${state.persSource.usar}% USAR / ${state.persSource.civ}% CIVMED`],
            ["BUDGET",         `$${fb}M total (DHP + MILCON + supplemental) · ~$${cpb}K/bed`],
            ["IT / IMD",       "ATO: "+(state.it.ato?"CURRENT":"OPEN")+" · MHS Genesis: "+(state.it.genesis?"CONFIGURED":"PENDING")+" · TPTP: "+(state.it.tptp?"INTEGRATED":"PENDING")+" · SPO: "+(state.it.spo?"MIGRATED":"IN PROGRESS")],
            ["FOC TARGET",     `${state.phases[4].start} · Phase 1 start: ${state.phases[0].start}`],
            ["OVERALL READINESS",`${rd.score}/100 — ${statusLabel}`],
          ].map(([k,v])=>(
            <div key={k}><span style={{color:DHA.darkBlue,fontWeight:700,fontFamily:"'Libre Franklin',sans-serif"}}>{k}: </span>{v}</div>
          ))}
        </div>
      </Card>
      <Card title="Commander's Notes" accent={DHA.blue}>
        <textarea value={state.notes} onChange={e=>setState(p=>({...p,notes:e.target.value}))} placeholder="Enter planning notes, key decisions, action items, assumptions, or briefing remarks..."
          style={{width:"100%",minHeight:110,background:T.bg2,border:`1px solid ${T.border}`,color:T.text,padding:"12px 14px",fontSize:11,fontFamily:"'EB Garamond',serif",borderRadius:3,resize:"vertical",lineHeight:1.8}}/>
      </Card>
    </div>
  );
}

export default function App() {
  const [tab,  setTab]  = useState("ops");
  const [plan, setPlan] = useState(INIT);
  const [dark, setDark] = useState(false);
  const [side, setSide] = useState(false);
  const [time, setTime] = useState(new Date());

  const T = makeTheme(dark);

  useEffect(()=>{
    let el=document.getElementById("dha-css");
    if(!el){ el=document.createElement("style"); el.id="dha-css"; document.head.appendChild(el); }
    el.textContent=CSS+`:root{${T.vars}}`;
    const t=setInterval(()=>setTime(new Date()),1000);
    return ()=>clearInterval(t);
  },[dark]);

  const rd=calcReadiness(plan);
  const sc=SCENARIOS[plan.scenario];
  const sc_c=rd.score>=80?T.ok:rd.score>=60?T.warn:rd.score>=40?T.highText:T.critText;
  const nb=sumBeds(plan);

  function statusLabel(s){ return s>=80?"MISSION READY":s>=60?"COND. READY":s>=40?"PARTIAL READY":"CRITICAL GAPS"; }

  const pages={
    ops:      <OpsPage       state={plan} setState={setPlan}/>,
    scenario: <ScenarioPage  state={plan} setState={setPlan}/>,
    beds:     <BedsPage      state={plan} setState={setPlan}/>,
    personnel:<PersonnelPage state={plan} setState={setPlan}/>,
    infra:    <InfraPage     state={plan} setState={setPlan}/>,
    supply:   <SupplyPage    state={plan} setState={setPlan}/>,
    clinical: <ClinicalPage  state={plan} setState={setPlan}/>,
    imd:      <IMDPage       state={plan} setState={setPlan}/>,
    risk:     <RiskPage      state={plan} setState={setPlan}/>,
    finance:  <FinancePage   state={plan} setState={setPlan}/>,
    timeline: <TimelinePage  state={plan} setState={setPlan}/>,
    brief:    <BriefPage     state={plan} setState={setPlan}/>,
  };

  return (
    <ThemeCtx.Provider value={T}>
      <div style={{minHeight:"100vh",background:T.bg0,color:T.text,fontFamily:"'EB Garamond',serif",transition:"background .3s,color .3s"}}>

        <div style={{position:"sticky",top:0,zIndex:400}}>
          <WorldClock time={time}/>

          <div style={{background:DHA.darkBlue,borderBottom:`3px solid ${DHA.yellow}`}}>
            <div style={{padding:"0 16px",display:"flex",alignItems:"center",height:54,gap:0}}>

              <div style={{display:"flex",alignItems:"center",gap:10,marginRight:18,paddingRight:18,borderRight:`1px solid rgba(255,208,65,.25)`,flexShrink:0}}>
                <div style={{width:38,height:38,borderRadius:"50%",background:`radial-gradient(circle at 40% 35%, ${DHA.yellow}40, ${DHA.darkBlue})`,border:`2px solid ${DHA.yellow}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,boxShadow:`0 0 14px ${DHA.yellow}40`}}>✦</div>
                <div>
                  <div style={{fontSize:7,letterSpacing:3,color:`${DHA.yellow}cc`,fontFamily:"'Source Code Pro',monospace"}}>DEFENSE HEALTH AGENCY</div>
                  <div style={{fontSize:13,fontWeight:800,color:"#ffffff",fontFamily:"'Libre Franklin',sans-serif",letterSpacing:1.5,lineHeight:1.1}}>MAMC EXPANSION PLANNER</div>
                  <div style={{fontSize:7,letterSpacing:1.5,color:`${DHA.bgBlue}88`,fontFamily:"'Source Code Pro',monospace"}}>DSRF / LSCO SUPPORT OPERATIONS</div>
                </div>
              </div>

              <div style={{display:"flex",gap:5,marginRight:14,paddingRight:14,borderRight:`1px solid rgba(255,255,255,.12)`,flexShrink:0}}>
                {Object.entries(SCENARIOS).map(([k,sc2])=>(
                  <button key={k} onClick={()=>setPlan(p=>({...p,scenario:k}))} style={{padding:"4px 12px",borderRadius:3,cursor:"pointer",border:`1px solid ${plan.scenario===k?sc2.color:"rgba(255,255,255,.2)"}`,background:plan.scenario===k?`${sc2.color}28`:"rgba(255,255,255,.05)",color:plan.scenario===k?sc2.color:"rgba(255,255,255,.6)",fontSize:8,fontFamily:"'Source Code Pro',monospace",fontWeight:700,letterSpacing:2,transition:"all .2s"}}>
                    {sc2.name}
                  </button>
                ))}
              </div>

              <div style={{display:"flex",flex:1,overflow:"hidden"}}>
                {[
                  {l:"BEDS",     v:`${nb}/${sc.beds}`,             c:nb>=sc.beds?DHA.green:DHA.yellow},
                  {l:"TOTAL",    v:`${MAMC.currentBeds+nb}`,        c:DHA.bgBlue},
                  {l:"READINESS",v:`${rd.score}%`,                  c:sc_c},
                  {l:"BUDGET",   v:`$${sumBudget(plan)}M`,          c:DHA.yellow},
                  {l:"ATO",      v:plan.it.ato?"CURRENT":"OPEN",    c:plan.it.ato?DHA.green:"#e06060"},
                  {l:"DHA APPR", v:plan.risk.dha?"YES":"PENDING",   c:plan.risk.dha?DHA.green:"#e06060"},
                  {l:"MASSPAS",  v:plan.risk.masspas,               c:plan.risk.masspas==="Approved"?DHA.green:DHA.yellow},
                ].map(({l,v,c})=>(
                  <div key={l} style={{padding:"0 11px",borderRight:"1px solid rgba(255,255,255,.08)",flexShrink:0}}>
                    <div style={{fontSize:6.5,letterSpacing:2,color:"rgba(255,255,255,.45)",fontFamily:"'Source Code Pro',monospace"}}>{l}</div>
                    <div style={{fontSize:11,fontWeight:700,color:c,fontFamily:"'Libre Franklin',sans-serif"}}>{v}</div>
                  </div>
                ))}
              </div>

              <button onClick={()=>setDark(d=>!d)} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",marginLeft:8,background:dark?"rgba(255,208,65,.15)":"rgba(255,255,255,.1)",border:`1px solid ${dark?`${DHA.yellow}50`:"rgba(255,255,255,.25)"}`,borderRadius:20,cursor:"pointer",transition:"all .2s",flexShrink:0}}>
                <span style={{fontSize:14}}>{dark?"☀️":"🌙"}</span>
                <span style={{fontSize:8,fontWeight:700,letterSpacing:1.5,color:dark?DHA.yellow:"rgba(255,255,255,.7)",fontFamily:"'Source Code Pro',monospace"}}>{dark?"LIGHT":"DARK"}</span>
              </button>

              <div style={{width:40,height:40,borderRadius:"50%",border:`2px solid ${sc_c}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:sc_c,fontFamily:"'Libre Franklin',sans-serif",fontWeight:900,marginLeft:10,flexShrink:0,boxShadow:`0 0 10px ${sc_c}50`}}>{rd.score}</div>
            </div>
            <Ticker state={plan}/>
          </div>
        </div>

        <div style={{display:"flex",minHeight:"calc(100vh - 114px)"}}>
          <div style={{width:side?48:195,flexShrink:0,background:DHA.darkBlue,borderRight:`1px solid rgba(255,208,65,.2)`,transition:"width .25s",overflow:"hidden",display:"flex",flexDirection:"column",position:"sticky",top:114,height:"calc(100vh - 114px)"}}>
            <div style={{height:3,background:DHA.yellow,flexShrink:0}}/>
            <div style={{flex:1,overflowY:"auto",padding:"6px 4px"}}>
              {TABS.map(t=>{
                const active=tab===t.id;
                const domRd={ops:rd.score,scenario:100,beds:rd.domains.beds,personnel:rd.domains.pers,infra:rd.domains.infra,supply:rd.domains.supply,clinical:rd.domains.clinical,imd:rd.domains.it,risk:rd.domains.risk,finance:rd.domains.finance,timeline:100,brief:rd.score};
                const dr=domRd[t.id]??0;
                const dc=dr>=80?DHA.green:dr>=60?DHA.yellow:dr>=40?"#d97030":"#c03030";
                return (
                  <button key={t.id} onClick={()=>setTab(t.id)} style={{width:"100%",padding:side?"10px 0":"8px 10px",background:active?`${DHA.yellow}18`:"transparent",border:"none",borderLeft:`3px solid ${active?DHA.yellow:"transparent"}`,borderRadius:0,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:8,marginBottom:0,justifyContent:side?"center":"flex-start",transition:"all .15s"}}>
                    <span style={{fontSize:13,color:active?DHA.yellow:"rgba(255,255,255,.5)",flexShrink:0}}>{t.icon}</span>
                    {!side&&(
                      <>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:9,fontWeight:active?700:400,color:active?DHA.yellow:"rgba(255,255,255,.65)",fontFamily:"'Libre Franklin',sans-serif",letterSpacing:.5}}>{t.label}</div>
                          <div style={{fontSize:8,color:"rgba(255,255,255,.35)",fontFamily:"'EB Garamond',serif",marginTop:1,fontStyle:"italic"}}>{t.sub}</div>
                        </div>
                        {!["ops","scenario","timeline","brief"].includes(t.id)&&(
                          <div style={{width:20,height:20,borderRadius:"50%",border:`1.5px solid ${dc}60`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:dc,fontFamily:"'Libre Franklin',sans-serif",fontWeight:700,flexShrink:0,background:`${dc}18`}}>{dr}</div>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
            <button onClick={()=>setSide(s=>!s)} style={{padding:9,background:`${DHA.darkBlue}cc`,border:"none",borderTop:`1px solid rgba(255,208,65,.2)`,color:DHA.yellow,cursor:"pointer",fontSize:9,textAlign:"center",fontFamily:"'Source Code Pro',monospace",letterSpacing:2}}>{side?"▶ EXP":"◀ COL"}</button>
          </div>

          <div style={{flex:1,padding:"20px 24px",overflowY:"auto",minWidth:0,background:T.bg0,transition:"background .3s"}}>
            <div style={{marginBottom:16,paddingBottom:12,borderBottom:`2px solid ${DHA.darkBlue}20`,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
              <div>
                <div style={{fontSize:8,fontWeight:700,letterSpacing:2.5,color:DHA.darkBlue,fontFamily:"'Libre Franklin',sans-serif",marginBottom:3,opacity:.7}}>DEFENSE HEALTH AGENCY · {MAMC.name.toUpperCase()}</div>
                <h2 style={{fontSize:20,fontWeight:800,color:T.isDark?"#fff":DHA.darkBlue,fontFamily:"'Libre Franklin',sans-serif",letterSpacing:1,margin:0}}>{TABS.find(t=>t.id===tab)?.label.toUpperCase()}</h2>
                <div style={{fontSize:9,letterSpacing:1.5,color:T.muted,fontFamily:"'Source Code Pro',monospace",marginTop:3}}>SCENARIO: {sc.name} · {sc.time} · JBLM, PIERCE COUNTY, WA</div>
              </div>
              <div style={{textAlign:"right",fontSize:8,color:T.dim,fontFamily:"'Source Code Pro',monospace",lineHeight:1.9}}>
                <div style={{color:DHA.maroon,fontWeight:700,letterSpacing:1}}>UNCLASSIFIED // FOR OFFICIAL USE ONLY</div>
                <div>MTF: {MAMC.mtf} · UIC: {MAMC.uic}</div>
                <div style={{color:sc_c,fontWeight:700,letterSpacing:1}}>READINESS: {rd.score}/100 — {statusLabel(rd.score)}</div>
              </div>
            </div>
            {pages[tab]}
            <div style={{height:40}}/>
          </div>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}
