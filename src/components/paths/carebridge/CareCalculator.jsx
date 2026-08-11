import { useState, useMemo } from "react";

/* ─── CARE TYPE PRESETS ──────────────────────────────────────────
   Dollar figures grounded in 2025-2026 cost-of-care survey data
   (CareScout/Genworth, A Place for Mom) and home-care industry
   benchmarks. Directional, not scraped from any live source. ─── */
const CARE_PRESETS = {
  homecare: {
    label:"Home Care Agency", icon:"🏠",
    valueLabel:"Average Monthly Client Value", losLabel:"Average Length of Service",
    avgMonthlyValue:2800, avgLOS:18, isEpisodic:false,
    monthlyInquiries:25, currentCensus:45, staffCount:30, searchRate:1.2,
    hint:"Based on the ~$32-35/hr 2025-2026 national median rate, blended across lighter and heavier weekly-hour clients."
  },
  assistedliving: {
    label:"Assisted Living Facility", icon:"🏢",
    valueLabel:"Average Monthly Resident Value", losLabel:"Average Length of Stay",
    avgMonthlyValue:5900, avgLOS:22, isEpisodic:false,
    monthlyInquiries:15, currentCensus:62, staffCount:35, searchRate:0.8,
    hint:"Based on the ~$5,900-$6,200 national median monthly rate for a private room. Average stay of 22 months is a widely-cited industry figure."
  },
  memorycare: {
    label:"Memory Care / Dementia Care", icon:"🧠",
    valueLabel:"Average Monthly Resident Value", losLabel:"Average Length of Stay",
    avgMonthlyValue:7200, avgLOS:30, isEpisodic:false,
    monthlyInquiries:8, currentCensus:24, staffCount:20, searchRate:0.3,
    hint:"Memory care typically runs 20-25% above standard assisted living, with a longer average stay."
  },
  hospice: {
    label:"Hospice & End-of-Life Care", icon:"🕊️",
    valueLabel:"Average Case Value", losLabel:"Average Episode Length",
    avgMonthlyValue:7000, avgLOS:1, isEpisodic:true,
    monthlyInquiries:12, currentCensus:35, staffCount:18, searchRate:0.35,
    hint:"Modeled from Medicare's routine-home-care per-diem rate across a typical episode, kept intentionally conservative. Stay in logistics and communication territory here — never care documentation."
  },
  disability: {
    label:"Disability Support Services", icon:"♿",
    valueLabel:"Average Monthly Client Value", losLabel:"Average Length of Service",
    avgMonthlyValue:2400, avgLOS:30, isEpisodic:false,
    monthlyInquiries:10, currentCensus:40, staffCount:25, searchRate:0.5,
    hint:"Harder to benchmark nationally since funding spans many state and private programs — adjust freely for your target."
  },
  adultday: {
    label:"Adult Day Care Center", icon:"👶",
    valueLabel:"Average Monthly Participant Value", losLabel:"Average Length of Service",
    avgMonthlyValue:850, avgLOS:20, isEpisodic:false,
    monthlyInquiries:10, currentCensus:30, staffCount:8, searchRate:0.3,
    hint:"Based on the ~$100/day 2025-2026 median rate at typical part-time (2-3 day/week) attendance."
  },
};

const POP_SIZES = [
  {id:"town",  label:"Small Town (~5K seniors)",     pop:5000},
  {id:"small", label:"Small City (~18K seniors)",    pop:18000},
  {id:"mid",   label:"Mid-Size Metro (~55K seniors)",pop:55000},
  {id:"large", label:"Large Metro (~150K seniors)",  pop:150000},
  {id:"metro", label:"Major Metro (~400K seniors)",  pop:400000},
];

const RESPONSE = [
  {id:"instant", label:"Under 5 minutes — live answer or instant acknowledgment", keep:0.90},
  {id:"fast",    label:"Within 1 hour",                                          keep:0.60},
  {id:"today",   label:"Same business day",                                      keep:0.33},
  {id:"tmrw",    label:"Next day",                                               keep:0.17},
  {id:"slow",    label:"2+ days, voicemail, or no follow-up",                    keep:0.07},
];

const RECENCY = [
  {id:"fresh",  label:"Less than 1 month ago",  multiplier:1.00},
  {id:"recent", label:"1 – 3 months ago",        multiplier:0.90},
  {id:"stale",  label:"3 – 6 months ago",        multiplier:0.74},
  {id:"old",    label:"6 – 12 months ago",       multiplier:0.55},
  {id:"dead",   label:"Over 12 months ago",      multiplier:0.35},
];

const COMM_LEVELS = [
  {id:"none",      label:"No formal updates — phone and word of mouth only", risk:0.12},
  {id:"reactive",  label:"Only when a family calls in and asks",             risk:0.09},
  {id:"basic",     label:"Occasional email or text, not on a set schedule",  risk:0.05},
  {id:"automated", label:"Regular automated updates already in place",       risk:0.01},
];

const C = {
  bg:"#F5F0E4", bg2:"#F8F5EE", bg3:"#FBF8F1", border:"#FBF8F1",
  text:"#201A16", muted:"#6E6459", dim:"#6E6459",
  indigo:"#7A5A00", green:"#0D7A5F", amber:"#C99A3B",
  pink:"#8B2E1F", red:"#8B0000", purple:"#7A5A00", teal:"#0D7A5F",
};

/* Reused directly from the Prospecting Guide's own Client Mix Calculator,
   so the 12-month math ties out across the whole system. */
const PACKAGE_TIERS = [
  {id:"foundation", name:"Foundation",       icon:"🌱", price:"$100 – $200/mo", mid:150, color:C.teal},
  {id:"growth",     name:"Growth",           icon:"⚡", price:"$250 – $450/mo", mid:350, color:C.indigo},
  {id:"full",       name:"Full Care System", icon:"🏆", price:"$500 – $850/mo", mid:675, color:C.pink},
];

/* ─── HELPERS ────────────────────────────────────────────── */
const fmt  = (n) => n >= 1000 ? `$${(n/1000).toFixed(1)}K` : `$${Math.round(n).toLocaleString()}`;
const fmt1 = (n) => (Math.round(n*10)/10).toFixed(1);
const fmtI = (n) => Math.round(n).toLocaleString();

function Slider({value, min, max, step=1, onChange, color=C.teal}) {
  return (
    <div style={{position:"relative",height:6,background:C.border,borderRadius:999,marginTop:10}}>
      <div style={{position:"absolute",left:0,top:0,height:"100%",borderRadius:999,
        background:color,width:`${((value-min)/(max-min))*100}%`,transition:"width .15s"}}/>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(+e.target.value)}
        style={{position:"absolute",top:"50%",left:0,width:"100%",
          transform:"translateY(-50%)",opacity:0,cursor:"pointer",height:24,margin:0}}/>
    </div>
  );
}

function Field({label, hint, children}) {
  return (
    <div style={{marginBottom:22}}>
      <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:hint?3:8}}>{label}</div>
      {hint&&<div style={{fontSize:11.5,color:C.dim,marginBottom:8,lineHeight:1.5}}>{hint}</div>}
      {children}
    </div>
  );
}

function ScoreBar({value, max, color, label}) {
  const pct = Math.min(100, Math.round((value/max)*100));
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:12.5,color:C.muted}}>{label}</span>
        <span style={{fontSize:13,fontWeight:700,color}}>{fmt(value)}<span style={{fontSize:11,fontWeight:400,color:C.dim}}>/mo</span></span>
      </div>
      <div style={{height:8,background:C.border,borderRadius:999,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:999,transition:"width .4s"}}/>
      </div>
    </div>
  );
}

function StatBlock({icon, label, value, sub, color}) {
  return (
    <div style={{background:color+"10",border:"1px solid "+color+"35",borderRadius:12,
      padding:"16px 14px",textAlign:"center",flex:1,minWidth:0}}>
      <div style={{fontSize:20,marginBottom:6}}>{icon}</div>
      <div style={{fontSize:"clamp(20px,5vw,26px)",fontWeight:800,color,lineHeight:1.1}}>{value}</div>
      <div style={{fontSize:11.5,color:C.muted,marginTop:5,fontWeight:600}}>{label}</div>
      {sub&&<div style={{fontSize:10.5,color:C.dim,marginTop:2}}>{sub}</div>}
    </div>
  );
}

function ServiceCard({icon, name, price, problem, pitch, tool, setup, roiLine, color, isTop}) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={()=>setOpen(o=>!o)}
      style={{background:isTop?color+"14":C.bg2,border:`1px solid ${isTop?color:C.border}`,
        borderRadius:12,overflow:"hidden",cursor:"pointer",marginBottom:10,
        boxShadow:isTop?"0 0 0 2px "+color+"30":"none"}}>
      <div style={{padding:"13px 16px",display:"flex",alignItems:"center",gap:12}}>
        {isTop&&<span style={{fontSize:10,fontWeight:700,color:color,background:color+"20",
          borderRadius:20,padding:"2px 9px",flexShrink:0,whiteSpace:"nowrap"}}>★ TOP PRIORITY</span>}
        <span style={{fontSize:22,flexShrink:0}}>{icon}</span>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:14,color:C.text}}>{name}</div>
          <div style={{fontSize:12,color:color,fontWeight:600,marginTop:2}}>{price}</div>
        </div>
        <span style={{color:C.dim,fontSize:19,transform:open?"rotate(90deg)":"none",
          transition:"transform .2s",flexShrink:0}}>›</span>
      </div>
      {open&&(
        <div style={{padding:"0 16px 16px",borderTop:"1px solid "+C.border}}>
          {[
            ["🔍 The Problem Signal",problem,C.indigo],
            ["🎤 The Pitch (word for word)",pitch,C.green],
            ["🔧 The Tool",tool,C.amber],
            ["⚙️ Setup Steps",setup,C.purple],
            ["📈 Expected ROI",roiLine,color],
          ].map(([lbl,val,col])=>(
            <div key={lbl} style={{marginTop:12}}>
              <div style={{fontSize:10,fontWeight:700,color:col,textTransform:"",
                letterSpacing:".07em",marginBottom:5}}>{lbl}</div>
              <p style={{fontSize:13,color:C.muted,margin:0,lineHeight:1.65,
                borderLeft:`2px solid ${col}40`,paddingLeft:10,fontStyle:lbl.includes("Pitch")?"italic":"normal"}}>
                {val}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────── */
export default function SeniorHomeCarePerformanceCalculator() {
  /* ── Identity / market inputs ── */
  const [agencyName, setAgencyName]       = useState("");
  const [competitorName, setCompetitorName] = useState("");
  const [cityName, setCityName]           = useState("");
  const [seniorPop, setSeniorPop]         = useState(55000);

  /* ── Care profile ── */
  const [careKey, setCareKey]             = useState("homecare");
  const [avgMonthlyValue, setAvgMonthlyValue] = useState(2800);
  const [avgLOS, setAvgLOS]               = useState(18);
  const [currentCensus, setCurrentCensus] = useState(45);
  const [staffCount, setStaffCount]       = useState(30);

  /* ── Referral / reviews ── */
  const [yourReviews, setYourReviews]     = useState(22);
  const [compReviews, setCompReviews]     = useState(140);
  const [lastReview, setLastReview]       = useState("stale");
  const [yourRating, setYourRating]       = useState(4.3);

  /* ── Intake speed ── */
  const [monthlyInquiries, setMonthlyInquiries] = useState(25);
  const [responseId, setResponseId]       = useState("today");

  /* ── Family communication ── */
  const [updateHours, setUpdateHours]     = useState(8);
  const [hourlyStaffCost, setHourlyStaffCost] = useState(24);
  const [commLevel, setCommLevel]         = useState("reactive");

  /* ── Staff scheduling ── */
  const [missedShifts, setMissedShifts]   = useState(12);
  const [costPerShift, setCostPerShift]   = useState(95);
  const [turnoverRate, setTurnoverRate]   = useState(68);

  const [tab, setTab]                     = useState("profile");

  const care = CARE_PRESETS[careKey];
  const agencyLabel = agencyName.trim() || "This agency";
  const compLabel   = competitorName.trim() || "a nearby competitor";
  const cityLabel   = cityName.trim() || "your service area";

  const applyPreset = (key) => {
    const p = CARE_PRESETS[key];
    setCareKey(key);
    setAvgMonthlyValue(p.avgMonthlyValue);
    setAvgLOS(p.avgLOS);
    setMonthlyInquiries(p.monthlyInquiries);
    setCurrentCensus(p.currentCensus);
    setStaffCount(p.staffCount);
  };

  const recMult = (id) => RECENCY.find(r=>r.id===id)?.multiplier ?? 0.5;

  /* Relationship value shown on the Profile tab; near-term value is the
     conservative, capped figure the loss calculators actually use. */
  const relationshipValue = care.isEpisodic ? avgMonthlyValue : avgMonthlyValue*avgLOS;
  const nearTermValue     = care.isEpisodic ? avgMonthlyValue : avgMonthlyValue*Math.min(avgLOS,3);
  const currentMonthlyRevenue = care.isEpisodic ? monthlyInquiries*avgMonthlyValue : currentCensus*avgMonthlyValue;

  /* ── 1. INTAKE SPEED LOSS (→ Rapid-Response Intake System) ── */
  const intake = useMemo(()=>{
    const keep = RESPONSE.find(r=>r.id===responseId)?.keep ?? 0.07;
    const inquiriesLost = monthlyInquiries*(1-keep);
    const conv = 0.28;
    const familiesLost = inquiriesLost*conv;
    const loss = familiesLost*nearTermValue;
    return {keep,inquiriesLost,familiesLost,loss};
  },[responseId,monthlyInquiries,nearTermValue]);
  const intakeLoss = intake.loss;

  /* ── 2. MARKET / REFERRAL GAP LOSS (→ Referral & Testimonial System) ── */
  const market = useMemo(()=>{
    const pop = Math.max(500,seniorPop||0);
    const rate = care.searchRate;
    const monthlySearches = pop*rate/1000;
    const highIntent = monthlySearches*0.30;

    const ratingFactor = Math.min(1.0,Math.max(0.5,yourRating/5));
    const yourTrust = Math.max(0.001,yourReviews)*recMult(lastReview)*ratingFactor;
    const compTrust = Math.max(0.001,compReviews)*1.0;
    let share = yourTrust/(yourTrust+compTrust);
    share = Math.min(0.96,Math.max(0.04,share));

    const lostSearchers = highIntent*(1-share);
    const conv = 0.20;
    const monthlyFamiliesLost = lostSearchers*conv;
    const weeklyFamiliesLost = monthlyFamiliesLost/4.33;
    const dailyFamiliesLost = monthlyFamiliesLost/30;
    const loss = monthlyFamiliesLost*nearTermValue;

    return {pop,monthlySearches,highIntent,share,lostSearchers,
      monthlyFamiliesLost,weeklyFamiliesLost,dailyFamiliesLost,loss};
  },[seniorPop,careKey,yourReviews,compReviews,lastReview,yourRating,nearTermValue]);
  const referralLoss = market.loss;

  /* ── 3. FAMILY COMMUNICATION LOSS (→ Family Update Portal) ── */
  const familyComm = useMemo(()=>{
    const staffTimeCost = updateHours*4.33*hourlyStaffCost;
    const risk = COMM_LEVELS.find(c=>c.id===commLevel)?.risk ?? 0;
    const retentionRevenue = currentCensus*risk*avgMonthlyValue;
    const loss = staffTimeCost+retentionRevenue;
    return {staffTimeCost,risk,retentionRevenue,loss};
  },[updateHours,hourlyStaffCost,commLevel,currentCensus,avgMonthlyValue]);
  const familyCommLoss = familyComm.loss;

  /* ── 4. STAFF SCHEDULING LOSS (→ Staff Scheduling & Shift Communication) ── */
  const scheduling = useMemo(()=>{
    const directCost = missedShifts*costPerShift;
    const annualReplacements = staffCount*(turnoverRate/100);
    const monthlyTurnoverCost = (annualReplacements*2600)/12;
    const loss = directCost+monthlyTurnoverCost;
    return {directCost,annualReplacements,monthlyTurnoverCost,loss};
  },[missedShifts,costPerShift,staffCount,turnoverRate]);
  const schedulingLoss = scheduling.loss;

  const totalLoss = intakeLoss+referralLoss+familyCommLoss+schedulingLoss;

  const priorities = useMemo(()=>[
    {id:"intake",loss:intakeLoss,icon:"🚨",name:"Rapid-Response Intake System",price:"$75 – $150/month (or free pilot first)",
     problem:`${agencyLabel} receives an estimated ${monthlyInquiries} new family inquiries a month, with a current response time of "${RESPONSE.find(r=>r.id===responseId)?.label}". At that speed, roughly ${Math.round(intake.keep*100)}% of families stay — the rest are likely calling ${compLabel} before ${agencyLabel} calls back.`,
     pitch:`"When a family calls you in the middle of a care crisis, how fast do they actually hear back? Families are calling three or four agencies inside the same hour, and whoever responds warmly and quickly is usually the one who gets chosen. I can build a system that acknowledges every inquiry within minutes and alerts your team instantly — so ${agencyLabel} is the first warm voice a family hears, not the third agency they try. This one change alone is worth an estimated ${fmt(intakeLoss)} a month."`,
     tool:"GoHighLevel (GHL) Workflows connected to the existing intake form and phone line — no new phone number required.",
     setup:"GHL → Automations → New Workflow → Trigger: form submitted or missed call → Action: instant SMS/email acknowledgment to the family + instant alert to on-call staff → CRM log for follow-up",
     roiLine:`Recovering just 25% of ${agencyLabel}'s estimated ${fmt(intakeLoss)} monthly loss = ${fmt(intakeLoss*0.25)} — several times the $75-$150/month Foundation price`,
     color:C.pink},
    {id:"referral",loss:referralLoss,icon:"🌟",name:"Referral & Testimonial System",price:"$75 – $150/month",
     problem:`${agencyLabel} has ${yourReviews} reviews vs ${compLabel}'s ${compReviews}. Scaled to ${cityLabel}'s senior population, this gap is estimated to cost ${fmt1(market.dailyFamiliesLost)} families a day and ${fmt1(market.monthlyFamiliesLost)} a month — choosing ${compLabel} instead.`,
     pitch:`"Families who've had a genuinely good experience with ${agencyLabel} are your most powerful marketing asset, but right now almost nothing is capturing that. I can set up an automated system that reaches out after a positive care milestone, asks for a quick testimonial, and makes it easy to refer another family going through the same thing. Based on ${cityLabel}'s market alone, closing even part of the gap with ${compLabel} is worth an estimated ${fmt(referralLoss)} a month."`,
     tool:"GoHighLevel Reputation Management, or a simple Zapier-triggered request flow.",
     setup:"GHL → Reputation → Settings → Request → configure review link → Automation → 2-message sequence after a positive care milestone, with a referral ask built into the same message",
     roiLine:`Recovering 20% of ${agencyLabel}'s estimated ${fmt(referralLoss)} monthly gap = ${fmt(referralLoss*0.20)} — pays for this tier many times over`,
     color:C.teal},
    {id:"family",loss:familyCommLoss,icon:"💌",name:"Family Update Portal",price:"$100 – $200/month",
     problem:`${agencyLabel}'s staff spends an estimated ${fmt1(updateHours)} hours a week on manual "how's mom doing" calls, on top of a communication style best described as: "${COMM_LEVELS.find(c=>c.id===commLevel)?.label}". That's ${fmt(familyComm.staffTimeCost)} a month in staff time alone, before counting families who quietly disengage.`,
     pitch:`"Right now, how do families find out how their loved one is doing day to day? If it's mostly them calling in, that's real staff time you could spend on actual care. I can set up simple, warm automated updates — sent on a schedule, in your voice — so families feel reassured without calling in, and your team gets roughly ${fmt1(updateHours)} hours a week back."`,
     tool:"Klaviyo or a similar email/SMS tool, connected to the Agency CRM's family contact list.",
     setup:"Klaviyo (or similar) → automated periodic update template → staff fills in a brief note → system sends a personalized update to the family contact on file",
     roiLine:`${fmt(familyComm.staffTimeCost)}/month in reclaimed staff time, plus an estimated ${fmt(familyComm.retentionRevenue)}/month in reduced churn risk from families who feel kept in the loop`,
     color:C.indigo},
    {id:"schedule",loss:schedulingLoss,icon:"📅",name:"Staff Scheduling & Shift Communication",price:"$100 – $200/month",
     problem:`${agencyLabel} runs roughly ${staffCount} caregivers, with an estimated ${missedShifts} missed or uncovered shifts a month. At an industry-typical ${turnoverRate}% annual turnover and about $2,600 to replace each caregiver, scheduling chaos is worth an estimated ${fmt(schedulingLoss)} a month.`,
     pitch:`"How much time does scheduling and confirming shifts take every week right now? I can set up automatic shift reminders and confirmations for your caregivers. It won't fix turnover on its own, but agencies that reduce scheduling chaos consistently see fewer missed shifts and a calmer team — which is exactly where retention starts."`,
     tool:"Google Sheets or Airtable schedule, connected through Zapier or Make.",
     setup:"Sheets/Airtable schedule → Zapier/Make automation → automated SMS reminder 24 hours and 2 hours before each shift → confirmation tracked back to the schedule",
     roiLine:`Even a 20% reduction in missed shifts saves an estimated ${fmt(scheduling.directCost*0.20)}/month directly — before any impact on turnover`,
     color:C.amber},
  ].sort((a,b)=>b.loss-a.loss),[intakeLoss,referralLoss,familyCommLoss,schedulingLoss,agencyLabel,compLabel,
    cityLabel,monthlyInquiries,responseId,intake,yourReviews,compReviews,market,updateHours,commLevel,
    familyComm,staffCount,missedShifts,turnoverRate,scheduling]);

  const topPriority = priorities[0];

  const TABS=[
    {id:"profile",  label:"🏥 Agency"},
    {id:"intake",   label:"🚨 Intake Speed"},
    {id:"referral", label:"🌟 Referral & Reviews"},
    {id:"market",   label:"🏙️ Market Reach"},
    {id:"family",   label:"💌 Family Comm"},
    {id:"schedule", label:"📅 Scheduling"},
    {id:"report",   label:"💰 Report"},
  ];

  return (
    <div style={{fontFamily:"'Inter',system-ui,-apple-system,sans-serif",
      background:C.bg,minHeight:"100vh",color:C.text}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        input[type=range]{-webkit-appearance:none;appearance:none;background:transparent;width:100%;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;
          border-radius:50%;background:#0D7A5F;cursor:pointer;margin-top:-6px;border:2px solid #F5F0E4;}
        input[type=range]::-webkit-slider-runnable-track{height:6px;border-radius:999px;background:transparent;}
        select{background:#F8F5EE;color:#201A16;border:1px solid #FBF8F1;border-radius:8px;
          padding:10px 12px;width:100%;font-size:14px;font-family:inherit;outline:none;}
        select:focus{border-color:#0D7A5F;}
        input[type=number],input[type=text]{background:#F8F5EE;color:#201A16;border:1px solid #FBF8F1;
          border-radius:8px;padding:10px 12px;width:100%;font-size:14px;font-family:inherit;outline:none;}
        input[type=number]:focus,input[type=text]:focus{border-color:#0D7A5F;}
        .tab-btn:hover{color:#0D7A5F!important;}
        .chip:hover{border-color:#0D7A5F!important;color:#0D7A5F!important;}
      `}</style>

      {/* HEADER */}
      <div style={{background:"linear-gradient(160deg,#F8F5EE 0%,#F8F5EE 60%,#F5F0E4 100%)",
        padding:"22px 16px 18px",borderBottom:"1px solid #FBF8F1"}}>
        <div style={{maxWidth:860,margin:"0 auto"}}>
          <div style={{fontSize:10,fontWeight:700,color:C.teal,textTransform:"",
            letterSpacing:".12em",marginBottom:7,display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:C.teal,
              boxShadow:"0 0 6px "+C.teal,display:"inline-block"}}/>
            Senior & Home Care Revenue Leak Finder
          </div>
          <h1 style={{margin:"0 0 7px",fontSize:"clamp(20px,4vw,30px)",fontWeight:800,lineHeight:1.15,
            background:"linear-gradient(135deg,#201A16 30%,#0D7A5F 100%)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            Senior & Home Care Performance Calculator
          </h1>
          <p style={{fontSize:12.5,color:"#6E6459",maxWidth:600,lineHeight:1.65}}>
            Enter a target agency's real numbers to see how many families — and how much recurring
            revenue — they're losing to slow response, thin reviews, and communication gaps. Use it
            live on a discovery call, or record it as a Loom, exactly like your SMB Revenue Leak Finder.
          </p>
          {agencyName.trim()&&(
            <div style={{marginTop:10,display:"inline-flex",alignItems:"center",gap:7,
              background:C.teal+"18",border:"1px solid "+C.teal+"35",borderRadius:20,padding:"5px 13px"}}>
              <span style={{fontSize:12,color:"#0D7A5F",fontWeight:600}}>
                📍 Analyzing: {agencyLabel}{cityName.trim()?` in ${cityLabel}`:""}
                {competitorName.trim()?` vs ${compLabel}`:""}
              </span>
            </div>
          )}
          <div style={{marginTop:12,background:"#F5F0E4",border:"1px solid "+C.teal+"30",
            borderRadius:10,padding:"11px 14px"}}>
            <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.6}}>
              <strong style={{color:C.teal}}>How this fits your Care Bridge system:</strong> this is
              the discovery-call companion to your 45-Day Plan — Week 3's mystery-shop audit feeds the
              Intake Speed tab, and the Report tab prices out the same 4 Bridge Components and package
              tiers from your Packages tab.
            </p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{background:"#F8F5EE",borderBottom:"1px solid #FBF8F1",
        position:"sticky",top:0,zIndex:20}}>
        <div style={{maxWidth:860,margin:"0 auto",display:"flex",padding:"0 8px",overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className="tab-btn" style={{
              background:"transparent",border:"none",
              borderBottom:tab===t.id?"2px solid "+C.teal:"2px solid transparent",
              color:tab===t.id?"#0D7A5F":"#D9CFBB",
              padding:"12px 13px",fontSize:12.5,fontWeight:tab===t.id?600:500,
              cursor:"pointer",whiteSpace:"nowrap",transition:"color .15s",fontFamily:"inherit"}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:860,margin:"0 auto",padding:"18px 13px 60px"}}>

        {/* ── LIVE SUMMARY STRIP ── */}
        {totalLoss>0&&(
          <div style={{background:"linear-gradient(135deg,#F8F5EE,#FBF8F1)",
            border:"1px solid #FBF8F1",borderRadius:11,padding:"12px 16px",
            marginBottom:16,display:"flex",gap:16,flexWrap:"wrap",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:C.red,textTransform:"",
                letterSpacing:".09em",marginBottom:3}}>Estimated Monthly Revenue at Risk</div>
              <div style={{fontSize:26,fontWeight:800,color:C.red}}>{fmt(totalLoss)}</div>
            </div>
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              {[
                {lbl:"Intake Speed",val:intakeLoss,col:C.pink},
                {lbl:"Referral Gap",val:referralLoss,col:C.teal},
                {lbl:"Family Comm",val:familyCommLoss,col:C.indigo},
                {lbl:"Scheduling",val:schedulingLoss,col:C.amber},
              ].map(x=>(
                <div key={x.lbl} style={{textAlign:"center"}}>
                  <div style={{fontSize:11,color:C.dim,marginBottom:3}}>{x.lbl}</div>
                  <div style={{fontSize:16,fontWeight:800,color:x.col}}>{fmt(x.val)}</div>
                </div>
              ))}
            </div>
            {topPriority&&(
              <div style={{background:topPriority.color+"18",border:"1px solid "+topPriority.color+"35",
                borderRadius:8,padding:"8px 14px",textAlign:"center"}}>
                <div style={{fontSize:10,color:topPriority.color,fontWeight:700,marginBottom:2}}>Lead With</div>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>{topPriority.icon} {topPriority.name}</div>
              </div>
            )}
          </div>
        )}

        {/* ── AGENCY PROFILE ── */}
        {tab==="profile"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>Agency Profile</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px"}}>
              Name the agency, its competitor, and its service area. This personalizes every pitch
              script and drives the Market Reach calculation.
            </p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:6}}>
              <Field label="Agency Name">
                <input type="text" value={agencyName} placeholder="e.g. Hearthstone Home Care"
                  onChange={e=>setAgencyName(e.target.value)}/>
              </Field>
              <Field label="Top Competitor's Name">
                <input type="text" value={competitorName} placeholder="e.g. Comfort Keepers of [City]"
                  onChange={e=>setCompetitorName(e.target.value)}/>
              </Field>
            </div>

            <Field label="City / Service Area" hint="Used to personalize pitch scripts and label the report.">
              <input type="text" value={cityName} placeholder="e.g. Tulsa, OK"
                onChange={e=>setCityName(e.target.value)}/>
            </Field>

            <Field label={`Senior Population (65+) in Service Area: ${fmtI(seniorPop)}`}
              hint="Search '[county] population 65 and over' on Census.gov, or check your Area Agency on Aging's coverage area — or tap a quick estimate below.">
              <input type="number" value={seniorPop} min={500} max={2000000} step={500}
                onChange={e=>setSeniorPop(+e.target.value)}/>
              <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:10}}>
                {POP_SIZES.map(c=>(
                  <button key={c.id} className="chip" onClick={()=>setSeniorPop(c.pop)}
                    style={{background:seniorPop===c.pop?C.teal+"22":C.bg2,
                      border:"1px solid "+(seniorPop===c.pop?C.teal:C.border),
                      color:seniorPop===c.pop?"#0D7A5F":C.muted,
                      borderRadius:20,padding:"6px 13px",fontSize:12,fontWeight:600,
                      cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
                    {c.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Care Type">
              <select value={careKey} onChange={e=>applyPreset(e.target.value)}>
                {Object.entries(CARE_PRESETS).map(([k,v])=>(
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </Field>

            <Field label={`${care.valueLabel}: ${fmt(avgMonthlyValue)}`} hint={care.hint}>
              <Slider value={avgMonthlyValue} min={200} max={15000} step={50}
                onChange={setAvgMonthlyValue} color={C.teal}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>$200</span><span>$15,000</span>
              </div>
            </Field>

            {!care.isEpisodic&&(
              <Field label={`${care.losLabel}: ${avgLOS} months`}
                hint="How long a typical client or resident stays with one agency, on average.">
                <Slider value={avgLOS} min={1} max={48} step={1}
                  onChange={setAvgLOS} color={C.teal}/>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                  <span>1 mo</span><span>48 mo</span>
                </div>
              </Field>
            )}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:6}}>
              <Field label={`Current Active ${care.isEpisodic?"Daily Census":"Clients/Residents"}: ${currentCensus}`}>
                <Slider value={currentCensus} min={2} max={300} step={1}
                  onChange={setCurrentCensus} color={C.indigo}/>
              </Field>
              <Field label={`Caregivers/Staff on Roster: ${staffCount}`}>
                <Slider value={staffCount} min={2} max={150} step={1}
                  onChange={setStaffCount} color={C.indigo}/>
              </Field>
            </div>

            <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:10,
              padding:"13px 14px",marginTop:4}}>
              <div style={{fontSize:11,fontWeight:700,color:C.dim,
                textTransform:"",letterSpacing:".07em",marginBottom:10}}>
                {care.isEpisodic?"Average Case Value":"Average Relationship Value"}
              </div>
              <div style={{fontSize:28,fontWeight:800,color:C.text}}>
                {fmt(relationshipValue)}
              </div>
              <div style={{fontSize:12,color:C.dim,marginTop:3}}>
                {care.isEpisodic
                  ? "What one hospice case is worth, on average, across its full episode."
                  : `${fmt(avgMonthlyValue)}/month × ${avgLOS}-month average length of service`}
              </div>
              <div style={{fontSize:11,color:C.dim,marginTop:8,paddingTop:8,borderTop:"1px solid "+C.border}}>
                Estimated current monthly revenue: <strong style={{color:C.text}}>{fmt(currentMonthlyRevenue)}</strong>
              </div>
            </div>
          </div>
        )}

        {/* ── INTAKE SPEED ── */}
        {tab==="intake"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>🚨 Intake Speed Audit</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              Families in a care crisis typically call three or four agencies within the same hour.
              The one who responds fastest — and warmest — is usually the one who gets chosen.
            </p>
            <Field label={`Estimated Monthly New Inquiries (calls, forms, walk-ins): ${monthlyInquiries}`}
              hint="Every channel counts — phone, website form, referral call, walk-in.">
              <Slider value={monthlyInquiries} min={0} max={150} step={1}
                onChange={setMonthlyInquiries} color={C.pink}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>0</span><span>150/month</span>
              </div>
            </Field>
            <Field label="How fast does the agency currently respond to a new inquiry?"
              hint="Be honest — if it's whoever picks up the phone whenever they're free, select 'same business day' or worse.">
              <select value={responseId} onChange={e=>setResponseId(e.target.value)}>
                {RESPONSE.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </Field>
            <div style={{background:intakeLoss>10000?C.pink+"10":C.bg2,
              border:"1px solid "+(intakeLoss>10000?C.pink:C.border),
              borderRadius:11,padding:"14px 15px",marginTop:4}}>
              <div style={{fontSize:11,fontWeight:700,
                color:intakeLoss>10000?C.pink:C.dim,
                textTransform:"",letterSpacing:".07em",marginBottom:10}}>
                Intake Speed Diagnosis
              </div>
              {[
                ["Monthly new inquiries",monthlyInquiries,C.muted],
                ["Current response speed",RESPONSE.find(r=>r.id===responseId)?.label||"",C.amber],
                ["Families retained at this speed",Math.round(intake.keep*100)+"%",C.amber],
                ["Families lost to slower/no response",fmt1(intake.familiesLost)+"/month",C.red],
                ["Estimated revenue at risk",fmt(intakeLoss),C.red],
                ["Fix","Rapid-Response Intake System",C.pink],
                ["Price","$75 – $150/month (or free pilot first)",C.pink],
              ].map(([lbl,val,col])=>(
                <div key={lbl} style={{display:"flex",justifyContent:"space-between",
                  padding:"7px 0",borderBottom:"1px solid #FBF8F1"}}>
                  <span style={{fontSize:12.5,color:C.muted}}>{lbl}</span>
                  <span style={{fontSize:13,fontWeight:600,color:col}}>{String(val)}</span>
                </div>
              ))}
              {care.isEpisodic ? (
                <p style={{fontSize:11.5,color:C.dim,margin:"10px 0 0",lineHeight:1.5}}>
                  Uses the full {fmt(nearTermValue)} average case value — hospice cases don't carry
                  the same "near-term" discount as an ongoing relationship.
                </p>
              ) : (
                <p style={{fontSize:11.5,color:C.dim,margin:"10px 0 0",lineHeight:1.5}}>
                  Uses a conservative near-term value of {fmt(nearTermValue)} per family — the first
                  {" "}{Math.min(avgLOS,3)} months only, not the full {fmt(relationshipValue)} average
                  relationship value shown on the Agency tab.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── REFERRAL & REVIEWS ── */}
        {tab==="referral"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>🌟 Referral & Review Health</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              Families researching care lean heavily on reviews and word of mouth. AI tools (ChatGPT,
              Google AI Mode, Perplexity) weight review count and recency about equally.
            </p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:22}}>
              <Field label={`${agencyLabel}'s Google Reviews`}>
                <input type="number" value={yourReviews}
                  onChange={e=>setYourReviews(+e.target.value)} min={0} max={9999}/>
              </Field>
              <Field label={`${compLabel}'s Reviews`}>
                <input type="number" value={compReviews}
                  onChange={e=>setCompReviews(+e.target.value)} min={0} max={9999}/>
              </Field>
            </div>
            <Field label="When was the last Google review posted?"
              hint="A stale review profile reads as an inactive agency, to families and to AI search alike.">
              <select value={lastReview} onChange={e=>setLastReview(e.target.value)}>
                {RECENCY.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </Field>
            <Field label={`Current Star Rating: ${yourRating}`}>
              <Slider value={yourRating} min={1.0} max={5.0} step={0.1}
                onChange={setYourRating} color={C.amber}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>1.0 ★</span><span>5.0 ★</span>
              </div>
            </Field>
            <div style={{background:referralLoss>5000?C.red+"10":C.bg2,
              border:"1px solid "+(referralLoss>5000?C.red:C.border),
              borderRadius:11,padding:"14px 15px",marginTop:4}}>
              <div style={{fontSize:11,fontWeight:700,
                color:referralLoss>5000?C.red:C.dim,
                textTransform:"",letterSpacing:".07em",marginBottom:10}}>
                Referral Gap Diagnosis
              </div>
              {[
                [agencyLabel,yourReviews+" reviews",C.muted],
                [compLabel,compReviews+" reviews",C.text],
                ["Gap",Math.round(((compReviews-yourReviews)/Math.max(compReviews,1))*100)+"% behind",C.red],
                ["Est. families lost / month",fmt1(market.monthlyFamiliesLost),C.red],
                ["Estimated monthly revenue lost",fmt(referralLoss),C.red],
                ["Fix","Referral & Testimonial System",C.teal],
                ["Price","$75 – $150/month",C.teal],
              ].map(([lbl,val,col])=>(
                <div key={lbl} style={{display:"flex",justifyContent:"space-between",
                  padding:"7px 0",borderBottom:"1px solid #FBF8F1"}}>
                  <span style={{fontSize:12.5,color:C.muted}}>{lbl}</span>
                  <span style={{fontSize:13,fontWeight:600,color:col}}>{val}</span>
                </div>
              ))}
              <p style={{fontSize:11.5,color:C.dim,margin:"10px 0 0",lineHeight:1.5}}>
                See the <strong style={{color:"#0D7A5F"}}>🏙️ Market Reach</strong> tab for the full
                daily / weekly / monthly breakdown and the methodology behind these numbers.
              </p>
            </div>
          </div>
        )}

        {/* ── MARKET REACH ── */}
        {tab==="market"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>
              🏙️ Market Reach — {agencyLabel}{cityName.trim()?` in ${cityLabel}`:""}
            </h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              Combining {cityLabel}'s senior population with typical search behavior for{" "}
              {care.label.toLowerCase()} and the trust gap vs {compLabel}, here is the estimated
              family loss — broken down by day, week, and month.
            </p>

            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
              <StatBlock icon="🌅" label="Families Lost / Day"
                value={fmt1(market.dailyFamiliesLost)} color={C.red}/>
              <StatBlock icon="📆" label="Families Lost / Week"
                value={fmt1(market.weeklyFamiliesLost)} color={C.amber}/>
              <StatBlock icon="🗓️" label="Families Lost / Month"
                value={fmt1(market.monthlyFamiliesLost)} color={C.pink}/>
            </div>

            <div style={{background:"linear-gradient(135deg,#F5F0E4,#F5F0E4)",
              border:"1px solid "+C.red+"35",borderRadius:12,padding:"16px",marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,color:C.red,textTransform:"",
                letterSpacing:".09em",marginBottom:6}}>What This Means</div>
              <p style={{fontSize:14,color:C.text,lineHeight:1.7,margin:0}}>
                {agencyLabel} is losing an estimated <strong style={{color:C.red}}>{fmt1(market.dailyFamiliesLost)} families every day</strong> to
                {" "}{compLabel} — worth roughly <strong style={{color:C.red}}>{fmt(referralLoss)} a month</strong>,
                or <strong style={{color:C.red}}>{fmt(referralLoss*12)} a year</strong>, from the reputation gap alone.
              </p>
            </div>

            <div style={{fontSize:12,fontWeight:700,color:C.dim,textTransform:"",
              letterSpacing:".08em",marginBottom:10}}>How This Is Calculated</div>
            <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:11,
              padding:"14px 15px",marginBottom:16}}>
              {[
                ["1. Senior population (65+) in service area",fmtI(market.pop)+" people",C.muted],
                [`2. Est. monthly ${care.label.toLowerCase()} searches here`,fmt1(market.monthlySearches)+"/month",C.muted],
                ["3. High-intent (decision-ready) searchers (~30%)",fmt1(market.highIntent)+"/month",C.muted],
                [`4. ${agencyLabel}'s visibility share vs ${compLabel}`,Math.round(market.share*100)+"%",C.amber],
                ["5. Families choosing the competitor instead",fmt1(market.lostSearchers)+"/month",C.red],
                ["6. Of those, estimated real families lost (~20% convert)",fmt1(market.monthlyFamiliesLost)+"/month",C.red],
              ].map(([lbl,val,col],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",
                  padding:"8px 0",borderBottom:i<5?"1px solid #FBF8F1":"none",gap:10}}>
                  <span style={{fontSize:12.5,color:C.muted,flex:1}}>{lbl}</span>
                  <span style={{fontSize:13,fontWeight:700,color:col,whiteSpace:"nowrap"}}>{val}</span>
                </div>
              ))}
            </div>

            <div style={{background:C.amber+"10",border:"1px solid "+C.amber+"30",
              borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:11,fontWeight:700,color:C.amber,marginBottom:6}}>
                ℹ️ How to Read This Number
              </div>
              <p style={{fontSize:12,color:C.muted,margin:0,lineHeight:1.6}}>
                This is a modeled estimate built from national cost-of-care benchmarks and typical
                local search behavior, not live scraped data on this specific agency. It combines
                {" "}{cityLabel}'s approximate senior population, typical search frequency for{" "}
                {care.label.toLowerCase()}, and the trust gap between {agencyLabel}'s review profile
                and {compLabel}'s. Use it to start an honest, directional conversation — not as a
                scientifically verified figure.
              </p>
            </div>
          </div>
        )}

        {/* ── FAMILY COMMUNICATION ── */}
        {tab==="family"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>💌 Family Communication Audit</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              If the only way a family finds out how their loved one is doing is by calling in,
              that's staff time you're paying for twice — once to provide care, once to explain it.
            </p>
            <Field label={`Staff Hours/Week on Manual Family Update Calls: ${updateHours}`}
              hint="Add up the time spent on 'how's mom doing' calls across the whole team.">
              <Slider value={updateHours} min={0} max={40} step={0.5}
                onChange={setUpdateHours} color={C.indigo}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>0 hrs</span><span>40 hrs/week</span>
              </div>
            </Field>
            <Field label={`Loaded Hourly Cost of That Staff Time: ${fmt(hourlyStaffCost)}/hr`}
              hint="Wages plus taxes and overhead for the office or care-coordination staff fielding these calls.">
              <Slider value={hourlyStaffCost} min={15} max={45} step={1}
                onChange={setHourlyStaffCost} color={C.indigo}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>$15</span><span>$45/hr</span>
              </div>
            </Field>
            <Field label="How does the agency currently keep families updated?"
              hint="Matches your Agency CRM's own Current Communication field.">
              <select value={commLevel} onChange={e=>setCommLevel(e.target.value)}>
                {COMM_LEVELS.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <div style={{background:familyCommLoss>3000?C.indigo+"10":C.bg2,
              border:"1px solid "+(familyCommLoss>3000?C.indigo:C.border),
              borderRadius:11,padding:"14px 15px",marginTop:4}}>
              <div style={{fontSize:11,fontWeight:700,
                color:familyCommLoss>3000?C.indigo:C.dim,
                textTransform:"",letterSpacing:".07em",marginBottom:10}}>
                Family Communication Diagnosis
              </div>
              {[
                ["Staff hours/month on manual updates",fmt1(updateHours*4.33),C.muted],
                ["Monthly staff-time cost",fmt(familyComm.staffTimeCost),C.amber],
                ["Estimated retention risk",Math.round(familyComm.risk*100)+"% of current census",C.red],
                ["Revenue at retention risk",fmt(familyComm.retentionRevenue),C.red],
                ["Total estimated monthly cost",fmt(familyCommLoss),C.red],
                ["Fix","Family Update Portal",C.indigo],
                ["Price","$100 – $200/month",C.indigo],
              ].map(([lbl,val,col])=>(
                <div key={lbl} style={{display:"flex",justifyContent:"space-between",
                  padding:"7px 0",borderBottom:"1px solid #FBF8F1"}}>
                  <span style={{fontSize:12.5,color:C.muted}}>{lbl}</span>
                  <span style={{fontSize:13,fontWeight:600,color:col}}>{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STAFF SCHEDULING ── */}
        {tab==="schedule"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>📅 Staff Scheduling Audit</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              Caregiver turnover runs 65–75% a year industry-wide, and every uncovered shift adds
              strain that pushes the next departure closer.
            </p>
            <Field label={`Missed or Uncovered Shifts per Month: ${missedShifts}`}
              hint="Shifts that needed a last-minute call, a scramble, or went uncovered entirely.">
              <Slider value={missedShifts} min={0} max={60} step={1}
                onChange={setMissedShifts} color={C.amber}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>0</span><span>60/month</span>
              </div>
            </Field>
            <Field label={`Average Cost per Missed Shift: ${fmt(costPerShift)}`}
              hint="Overtime premium, emergency backfill, or admin time spent scrambling to cover it.">
              <Slider value={costPerShift} min={30} max={250} step={5}
                onChange={setCostPerShift} color={C.amber}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>$30</span><span>$250</span>
              </div>
            </Field>
            <Field label={`Estimated Annual Caregiver Turnover: ${turnoverRate}%`}
              hint="Industry average runs 65–75%. Replacing one caregiver costs roughly $2,600 in hiring, background checks, and training.">
              <Slider value={turnoverRate} min={20} max={100} step={1}
                onChange={setTurnoverRate} color={C.red}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>20%</span><span>100%</span>
              </div>
            </Field>
            <div style={{background:schedulingLoss>2000?C.amber+"10":C.bg2,
              border:"1px solid "+(schedulingLoss>2000?C.amber:C.border),
              borderRadius:11,padding:"14px 15px",marginTop:4}}>
              <div style={{fontSize:11,fontWeight:700,
                color:schedulingLoss>2000?C.amber:C.dim,
                textTransform:"",letterSpacing:".07em",marginBottom:10}}>
                Scheduling Chaos Diagnosis
              </div>
              {[
                ["Missed shifts / month",missedShifts,C.muted],
                ["Direct cost of missed shifts",fmt(scheduling.directCost),C.amber],
                ["Est. caregiver replacements / year",fmt1(scheduling.annualReplacements),C.red],
                ["Monthly turnover cost (@ $2,600/hire)",fmt(scheduling.monthlyTurnoverCost),C.red],
                ["Total estimated monthly cost",fmt(schedulingLoss),C.red],
                ["Fix","Staff Scheduling & Shift Communication",C.amber],
                ["Price","$100 – $200/month",C.amber],
              ].map(([lbl,val,col])=>(
                <div key={lbl} style={{display:"flex",justifyContent:"space-between",
                  padding:"7px 0",borderBottom:"1px solid #FBF8F1"}}>
                  <span style={{fontSize:12.5,color:C.muted}}>{lbl}</span>
                  <span style={{fontSize:13,fontWeight:600,color:col}}>{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FULL REPORT ── */}
        {tab==="report"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>
              💰 Full Revenue Report — {agencyLabel}
            </h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              This is your discovery call asset. Record a Loom of this screen with the agency's real
              numbers filled in — it closes better than any proposal.
            </p>

            <div style={{background:"linear-gradient(135deg,#F5F0E4,#F5F0E4)",
              border:"1px solid "+C.red+"40",borderRadius:12,padding:"18px",marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,color:C.red,textTransform:"",
                letterSpacing:".1em",marginBottom:4}}>Total Estimated Monthly Revenue at Risk</div>
              <div style={{fontSize:"clamp(32px,6vw,48px)",fontWeight:800,color:C.red,
                marginBottom:8}}>{fmt(totalLoss)}</div>
              <div style={{fontSize:12.5,color:C.dim}}>
                {fmt(totalLoss*12)} per year — if nothing changes
              </div>
              <div style={{marginTop:16}}>
                <ScoreBar value={intakeLoss}     max={totalLoss||1} color={C.pink}   label="🚨 Intake Speed Loss"/>
                <ScoreBar value={referralLoss}   max={totalLoss||1} color={C.teal}   label="🌟 Referral Gap Loss"/>
                <ScoreBar value={familyCommLoss} max={totalLoss||1} color={C.indigo} label="💌 Family Comm Loss"/>
                <ScoreBar value={schedulingLoss} max={totalLoss||1} color={C.amber}  label="📅 Scheduling Loss"/>
              </div>
            </div>

            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:C.dim,textTransform:"",
                letterSpacing:".08em",marginBottom:10}}>Families Lost to {compLabel}</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <StatBlock icon="🌅" label="Per Day" value={fmt1(market.dailyFamiliesLost)} color={C.red}/>
                <StatBlock icon="📆" label="Per Week" value={fmt1(market.weeklyFamiliesLost)} color={C.amber}/>
                <StatBlock icon="🗓️" label="Per Month" value={fmt1(market.monthlyFamiliesLost)} color={C.pink}/>
              </div>
            </div>

            <div style={{background:topPriority.color+"12",border:"1px solid "+topPriority.color+"35",
              borderRadius:12,padding:"14px 16px",marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,color:topPriority.color,
                textTransform:"",letterSpacing:".09em",marginBottom:8}}>
                ★ Your #1 Priority — Lead With This
              </div>
              <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:4}}>
                {topPriority.icon} {topPriority.name}
              </div>
              <div style={{fontSize:13,color:C.muted,marginBottom:6,lineHeight:1.6}}>
                Biggest single gap: <strong style={{color:C.red}}>{fmt(topPriority.loss)}/month</strong>
                {" "}estimated. Service price: <strong style={{color:C.green}}>{topPriority.price}</strong>.
              </div>
              <div style={{fontSize:12,color:topPriority.color,fontWeight:600}}>
                Don't pitch all four at once. Lead with this one, offered as a free pilot first —
                upsell the rest once trust is established.
              </div>
            </div>

            <div style={{fontSize:12,fontWeight:700,color:C.dim,textTransform:"",
              letterSpacing:".08em",marginBottom:10}}>All 4 Bridge Components — Ranked by Impact</div>
            {priorities.map((p,i)=>(
              <ServiceCard key={p.id} {...p} isTop={i===0}/>
            ))}

            <div style={{background:C.bg2,border:"1px solid "+C.border,
              borderRadius:12,padding:"14px 16px",marginTop:8}}>
              <div style={{fontSize:11,fontWeight:700,color:C.dim,
                textTransform:"",letterSpacing:".08em",marginBottom:12}}>
                12-Month Value Per Agency (Full Upsell Ladder)
              </div>
              {[
                {m:"Month 1-2", s:"Foundation — Rapid-Response Intake",          running:PACKAGE_TIERS[0].mid, col:C.teal},
                {m:"Month 3-4", s:"Growth — + Family Update Portal",             running:PACKAGE_TIERS[1].mid, col:C.indigo},
                {m:"Month 5+",  s:"Full Care System — + Scheduling + Referrals", running:PACKAGE_TIERS[2].mid, col:C.pink},
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",
                  alignItems:"center",padding:"9px 0",borderBottom:"1px solid #FBF8F1"}}>
                  <div>
                    <div style={{fontSize:11,color:C.dim,marginBottom:2}}>{r.m}</div>
                    <div style={{fontSize:13,color:C.text,fontWeight:500}}>{r.s}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:11,color:C.dim}}>Running total</div>
                    <div style={{fontSize:15,fontWeight:800,color:r.col}}>{fmt(r.running)}/mo</div>
                  </div>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",
                alignItems:"center",paddingTop:12}}>
                <span style={{fontSize:14,fontWeight:700,color:C.text}}>12-Month Agency Value</span>
                <span style={{fontSize:22,fontWeight:800,color:C.green}}>{fmt(PACKAGE_TIERS[2].mid*12)}</span>
              </div>
              <p style={{fontSize:11.5,color:C.dim,margin:"6px 0 0",lineHeight:1.6}}>
                Conservative. One agency, fully upsold, staying 12 months = {fmt(PACKAGE_TIERS[2].mid*12)}.
                Five such agencies = {fmt(PACKAGE_TIERS[2].mid*12*5)}/year in recurring revenue — on top
                of whatever your SMB pipeline already generates.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
