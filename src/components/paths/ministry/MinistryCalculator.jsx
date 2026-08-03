import { useState, useMemo } from "react";

/* ─── MINISTRY PRESETS (per the 7 types from the Global Prospecting Guide) ─── */
const PRESETS = {
  parish:   {label:"Local Parish / Congregation",       monthlyVisitors:60,  monthlyEnq:15, monthlyCalls:45, missedPct:40},
  diocese:  {label:"Diocese / Denominational Network",  monthlyVisitors:90,  monthlyEnq:25, monthlyCalls:80, missedPct:32},
  school:   {label:"Faith-Based School / Seminary",     monthlyVisitors:110, monthlyEnq:30, monthlyCalls:90, missedPct:28},
  youth:    {label:"Youth & Campus Ministry",            monthlyVisitors:70,  monthlyEnq:20, monthlyCalls:35, missedPct:45},
  relief:   {label:"Relief & Development NGO",           monthlyVisitors:65,  monthlyEnq:18, monthlyCalls:50, missedPct:38},
  media:    {label:"Media & Broadcast Ministry",         monthlyVisitors:150, monthlyEnq:40, monthlyCalls:25, missedPct:50},
  diaspora: {label:"Diaspora Congregation",              monthlyVisitors:80,  monthlyEnq:22, monthlyCalls:60, missedPct:42},
};

const CONGREGATION_SIZES = [
  {id:"small",  label:"Small (under 100)"},
  {id:"medium", label:"Medium (100–500)"},
  {id:"large",  label:"Large (500+)"},
];

const RECENCY = [
  {id:"fresh",  label:"Updated within the last month",  multiplier:1.00},
  {id:"recent", label:"1 – 3 months ago",               multiplier:0.90},
  {id:"stale",  label:"3 – 6 months ago",                multiplier:0.74},
  {id:"old",    label:"6 – 12 months ago",                multiplier:0.55},
  {id:"dead",   label:"Over 12 months ago",               multiplier:0.35},
];

const RESPONSE = [
  {id:"instant", label:"Under 1 hour (automated)", keep:0.85},
  {id:"fast",    label:"Same day",                  keep:0.55},
  {id:"today",   label:"1 – 2 days",                keep:0.30},
  {id:"tmrw",    label:"3 – 5 days",                keep:0.16},
  {id:"slow",    label:"A week or more, or never",  keep:0.07},
];

const C = {
  bg:"#F5F0E4", bg2:"#F8F5EE", bg3:"#FBF8F1", border:"#FBF8F1",
  text:"#201A16", muted:"#6E6459", dim:"#6E6459",
  indigo:"#7A5A00", green:"#0D7A5F", amber:"#C99A3B",
  pink:"#8B2E1F", red:"#8B0000", purple:"#7A5A00",
};

/* ─── HELPERS ────────────────────────────────────────────── */
const fmt   = (n) => n >= 1000 ? `$${(n/1000).toFixed(1)}K` : `$${Math.round(n).toLocaleString()}`;
const fmt1  = (n) => (Math.round(n*10)/10).toFixed(1);
const fmtI  = (n) => Math.round(n).toLocaleString();

function Slider({value, min, max, step=1, onChange, color=C.indigo}) {
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

function ScoreBar({value, max, color, label, formatFn=fmtI, suffix=" people/mo"}) {
  const pct = Math.min(100, Math.round((value/(max||1))*100));
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:12.5,color:C.muted}}>{label}</span>
        <span style={{fontSize:13,fontWeight:700,color}}>{formatFn(value)}<span style={{fontSize:11,fontWeight:400,color:C.dim}}>{suffix}</span></span>
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
          borderRadius:20,padding:"2px 9px",flexShrink:0,whiteSpace:"nowrap"}}>★ LEAD WITH THIS</span>}
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
            ["🔍 The Signal",problem,C.indigo],
            ["🎤 How To Bring It Up",pitch,C.green],
            ["🔧 The Tool",tool,C.amber],
            ["⚙️ Quick Setup",setup,C.purple],
            ["📈 Is It Worth It",roiLine,color],
          ].map(([lbl,val,col])=>(
            <div key={lbl} style={{marginTop:12}}>
              <div style={{fontSize:10,fontWeight:700,color:col,textTransform:"uppercase",
                letterSpacing:".07em",marginBottom:5}}>{lbl}</div>
              <p style={{fontSize:13,color:C.muted,margin:0,lineHeight:1.65,
                borderLeft:`2px solid ${col}40`,paddingLeft:10,fontStyle:lbl.includes("Bring")?"italic":"normal"}}>
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
export default function MinistryPerformanceCalculator() {
  /* ── Identity ── */
  const [ministryName, setMinistryName] = useState("");
  const [cityName, setCityName]         = useState("");
  const [congSize, setCongSize]         = useState("small");

  /* ── Ministry profile ── */
  const [typeKey, setTypeKey]         = useState("parish");
  const [monthlyVisitors, setVisitors]= useState(60);

  /* ── Online presence ── */
  const [yourReviews, setYourRev]     = useState(18);
  const [lastUpdated, setLastUpdated] = useState("stale");
  const [yourRating, setRating]       = useState(4.3);

  /* ── Response speed ── */
  const [monthlyEnq, setEnq]          = useState(15);
  const [responseId, setResp]         = useState("today");

  /* ── Calls ── */
  const [monthlyCalls, setCalls]      = useState(45);
  const [missedPct, setMissed]        = useState(40);

  const [tab, setTab]                 = useState("profile");

  const type = PRESETS[typeKey];
  const ministryLabel = ministryName.trim() || "This ministry";
  const cityLabel      = cityName.trim() || "your community";

  const applyPreset = (key) => {
    const p = PRESETS[key];
    setTypeKey(key);
    setVisitors(p.monthlyVisitors);
    setEnq(p.monthlyEnq);
    setCalls(p.monthlyCalls);
    setMissed(p.missedPct);
  };

  /* ── Online Presence Gap — bounded by monthlyVisitors, never by city population.
        This replaces a population × search-share model that could (and did, in the
        SMB version this is adapted from) estimate more "lost customers" than the
        business's own total monthly customer count. Every number below is a share
        of a real, self-reported figure, so it can never run away from reality. ── */
  const visibility = useMemo(()=>{
    const ratingFactor  = Math.min(1, Math.max(0.5, yourRating/5));
    const recencyFactor = RECENCY.find(r=>r.id===lastUpdated)?.multiplier ?? 0.5;
    const reviewFactor  = Math.min(1, Math.max(0, yourReviews)/50);       // caps out at 50+ reviews
    const trustScore    = recencyFactor * ratingFactor * (0.4 + 0.6*reviewFactor); // bounded ~0.14–1.0
    const visitors       = Math.max(0, monthlyVisitors);
    const missed          = visitors * (1-trustScore) * 0.5;              // 0.5 = assumed follow-through if trust were perfect
    return {trustScore, missed};
  },[yourRating,lastUpdated,yourReviews,monthlyVisitors]);
  const visibilityGap = visibility.missed;

  /* ── Response Speed Gap — bounded by monthlyEnq (already realistic, self-reported) ── */
  const speedGap = useMemo(()=>{
    const keep = RESPONSE.find(r=>r.id===responseId)?.keep ?? 0.07;
    const lost = monthlyEnq*(1-keep);
    const followThrough = 0.30;
    return lost*followThrough;
  },[responseId,monthlyEnq]);

  /* ── Missed Call Gap — bounded by monthlyCalls (already realistic, self-reported) ── */
  const callGap = useMemo(()=>{
    const missed = monthlyCalls*(missedPct/100);
    const giveUpRate = 0.5;
    return missed*giveUpRate;
  },[monthlyCalls,missedPct]);

  const totalGap = visibilityGap+speedGap+callGap;
  const dailyGap   = totalGap/30;
  const weeklyGap  = totalGap/4.33;

  /* ── Foundation-tier cost, straight from Digital Ministry Systems — not a new
        price list invented for this calculator. ── */
  const FOUNDATION_LOW = 50, FOUNDATION_HIGH = 100;
  const costPerConnection = totalGap>0 ? (FOUNDATION_LOW/totalGap) : 0;

  const priorities = useMemo(()=>[
    {id:"presence",gap:visibilityGap,icon:"🌐",name:"Online Presence Refresh",price:"Foundation tier — $50-100/month",
     problem:`${ministryLabel}'s online presence (Google Business profile, website, or social pages) was last meaningfully updated ${RECENCY.find(r=>r.id===lastUpdated)?.label.toLowerCase()}, with ${yourReviews} reviews and a ${fmt1(yourRating)}★ average. For someone in ${cityLabel} checking a ministry out for the first time before ever walking in, that first impression is estimated to cost about ${fmt1(visibilityGap)} people a month who look, don't feel confident, and don't follow up.`,
     pitch:`"I noticed it's been a while since your online presence was refreshed — for someone checking you out before their first visit, that's often the whole impression they get. I can set up something simple that keeps this current automatically, and gently invites a few words from people after they visit. Small thing, but first impressions carry a lot of weight for someone who's never been before."`,
     tool:"Google Business Profile (free) + WhatsApp Business or Zapier-based follow-up",
     setup:"Google Business Profile → update hours, photos, service times. Zapier/WhatsApp Business → auto-send a warm follow-up + gentle review-ask 2 days after a first-time visitor's info is captured.",
     roiLine:`At the Foundation tier ($50-100/month), that's roughly ${fmt(costPerConnection)}–${fmt(costPerConnection*2)} per person this reaches — most parishes find that an easy yes even if only a handful become regulars.`,
     color:C.indigo},
    {id:"speed",gap:speedGap,icon:"⚡",name:"Inquiry Response Automation",price:"Foundation tier — $50-100/month",
     problem:`${ministryLabel} receives approximately ${monthlyEnq} online inquiries a month (plan-your-visit forms, prayer requests, membership questions) with a current response time of "${RESPONSE.find(r=>r.id===responseId)?.label}". At that speed, an estimated ${Math.round((RESPONSE.find(r=>r.id===responseId)?.keep||0)*100)}% of that initial interest is still there by the time anyone replies.`,
     pitch:`"When someone fills out a 'plan your visit' or 'get in touch' form, how quickly do they hear back right now? For a lot of parishes it's a few days — and by then some of that first nudge has faded. I can set up an instant, warm auto-reply, and make sure someone still personally follows up within a day. Doesn't cost much, and nobody who reaches out gets forgotten."`,
     tool:"Google Forms + Zapier + WhatsApp Business or email auto-reply",
     setup:"Google Form → 'Plan Your Visit' / 'Get in Touch' → Zapier trigger → instant WhatsApp/email reply + a task for staff to personally follow up within 24 hours.",
     roiLine:`Recovering even a third of the estimated ${fmt1(speedGap)} people/month lost here already justifies the Foundation tier on its own.`,
     color:C.green},
    {id:"calls",gap:callGap,icon:"📞",name:"Missed Call Recovery",price:"Foundation tier — often free to $50/month",
     problem:`Approximately ${Math.round(monthlyCalls*(missedPct/100))} calls a month to ${ministryLabel} go unanswered (a ${missedPct}% miss rate). These are often people calling about a wedding, a funeral, a pastoral need, or simply what time the service starts — high-intent, time-sensitive calls.`,
     pitch:`"If someone calls about a wedding, a funeral, or just what time the service starts, and nobody picks up, what happens right now? For most small parishes, that call just doesn't get returned, and the person often doesn't try again. A simple auto-text when a call is missed — with the service times and a 'we'll call you back today' — closes that gap without anyone having to sit by the phone."`,
     tool:"Google Voice or carrier voicemail-to-text + Zapier",
     setup:"Google Voice/carrier → forward missed calls → Zapier → auto-text with service times, website link, and a same-day callback promise.",
     roiLine:`This is usually the cheapest fix of the three — often free to set up — for an estimated ${fmt1(callGap)} missed connections a month.`,
     color:C.amber},
  ].sort((a,b)=>b.gap-a.gap),[visibilityGap,speedGap,callGap,ministryLabel,cityLabel,yourReviews,yourRating,lastUpdated,monthlyEnq,responseId,monthlyCalls,missedPct,costPerConnection]);

  const topPriority = priorities[0];

  const TABS2=[
    {id:"profile", label:"🏛️ Ministry"},
    {id:"presence",label:"🌐 Online Presence"},
    {id:"speed",   label:"⚡ Response Speed"},
    {id:"calls",   label:"📞 Missed Calls"},
    {id:"report",  label:"📋 Report"},
  ];

  return (
    <div style={{fontFamily:"'Inter',system-ui,-apple-system,sans-serif",
      background:C.bg,minHeight:"100vh",color:C.text}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        input[type=range]{-webkit-appearance:none;appearance:none;background:transparent;width:100%;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;
          border-radius:50%;background:#7A5A00;cursor:pointer;margin-top:-6px;border:2px solid #F5F0E4;}
        input[type=range]::-webkit-slider-runnable-track{height:6px;border-radius:999px;background:transparent;}
        select{background:#F8F5EE;color:#201A16;border:1px solid #FBF8F1;border-radius:8px;
          padding:10px 12px;width:100%;font-size:14px;font-family:inherit;outline:none;}
        select:focus{border-color:#7A5A00;}
        input[type=number],input[type=text]{background:#F8F5EE;color:#201A16;border:1px solid #FBF8F1;
          border-radius:8px;padding:10px 12px;width:100%;font-size:14px;font-family:inherit;outline:none;}
        input[type=number]:focus,input[type=text]:focus{border-color:#7A5A00;}
        .tab-btn:hover{color:#C99A3B!important;}
      `}</style>

      {/* HEADER */}
      <div style={{background:"linear-gradient(160deg,#F8F5EE 0%,#F8F5EE 60%,#F5F0E4 100%)",
        padding:"22px 16px 18px",borderBottom:"1px solid #FBF8F1"}}>
        <div style={{maxWidth:820,margin:"0 auto"}}>
          <div style={{fontSize:10,fontWeight:700,color:C.green,textTransform:"uppercase",
            letterSpacing:".12em",marginBottom:7,display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:C.green,
              boxShadow:"0 0 6px "+C.green,display:"inline-block"}}/>
            Ministry Engagement Gap Finder
          </div>
          <h1 style={{margin:"0 0 7px",fontSize:"clamp(20px,4vw,30px)",fontWeight:800,lineHeight:1.15,
            background:"linear-gradient(135deg,#201A16 30%,#C99A3B 100%)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            Ministry Performance Calculator
          </h1>
          <p style={{fontSize:12.5,color:"#D9CFBB",maxWidth:560,lineHeight:1.65}}>
            Enter a ministry's real numbers to see how many real people — first-time visitors,
            inquiries, and calls — are quietly slipping through the cracks each month. Use this
            live in a conversation, or record it as a Loom with their numbers filled in.
          </p>
          {ministryName.trim()&&(
            <div style={{marginTop:10,display:"inline-flex",alignItems:"center",gap:7,
              background:"#7A5A0018",border:"1px solid #7A5A0035",borderRadius:20,padding:"5px 13px"}}>
              <span style={{fontSize:12,color:"#C99A3B",fontWeight:600}}>
                📍 {ministryLabel}{cityName.trim()?` in ${cityLabel}`:""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div style={{background:"#F8F5EE",borderBottom:"1px solid #FBF8F1",
        position:"sticky",top:0,zIndex:20}}>
        <div style={{maxWidth:820,margin:"0 auto",display:"flex",padding:"0 8px",overflowX:"auto"}}>
          {TABS2.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className="tab-btn" style={{
              background:"transparent",border:"none",
              borderBottom:tab===t.id?"2px solid #7A5A00":"2px solid transparent",
              color:tab===t.id?"#C99A3B":"#D9CFBB",
              padding:"12px 13px",fontSize:12.5,fontWeight:tab===t.id?600:500,
              cursor:"pointer",whiteSpace:"nowrap",transition:"color .15s",fontFamily:"inherit"}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:820,margin:"0 auto",padding:"18px 13px 60px"}}>

        {/* ── MINISTRY PROFILE ── */}
        {tab==="profile"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>Ministry Profile</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              Start here. Everything downstream uses these numbers — take a minute to get them
              close to real rather than accepting the defaults.
            </p>

            <Field label="Ministry Name" hint="Used to personalize the report — never shared or stored anywhere.">
              <input type="text" value={ministryName} onChange={e=>setMinistryName(e.target.value)}
                placeholder="e.g. St. Andrew's Parish"/>
            </Field>
            <Field label="City / Community">
              <input type="text" value={cityName} onChange={e=>setCityName(e.target.value)}
                placeholder="e.g. Port Harcourt"/>
            </Field>

            <Field label="Ministry Type" hint="Loads realistic starting defaults — adjust anything on the next tabs.">
              <select value={typeKey} onChange={e=>applyPreset(e.target.value)}>
                {Object.entries(PRESETS).map(([k,p])=>(
                  <option key={k} value={k}>{p.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Congregation Size">
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {CONGREGATION_SIZES.map(s=>(
                  <button key={s.id} onClick={()=>setCongSize(s.id)}
                    style={{flex:"1 1 auto",padding:"9px 12px",borderRadius:8,cursor:"pointer",
                      border:`1px solid ${congSize===s.id?C.indigo:C.border}`,
                      background:congSize===s.id?C.indigo+"18":C.bg2,
                      color:congSize===s.id?"#C99A3B":C.muted,fontSize:12.5,fontWeight:600}}>
                    {s.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={`Estimated Monthly Online Visitors: ${monthlyVisitors}`}
              hint="People who find you online — website, Google, social media — before ever walking in. An honest guess is fine; this drives the Online Presence tab.">
              <Slider value={monthlyVisitors} min={10} max={300} step={5}
                onChange={setVisitors} color={C.indigo}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>10</span><span>300/month</span>
              </div>
            </Field>
          </div>
        )}

        {/* ── ONLINE PRESENCE ── */}
        {tab==="presence"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>Online Presence Gap</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              This estimates how many of {ministryLabel}'s {monthlyVisitors} monthly online visitors
              lose confidence and don't follow up, based on how current and trusted the online
              presence looks — never more than the {monthlyVisitors} you entered on the Ministry tab.
            </p>

            <Field label={`Number of Online Reviews / Testimonials: ${yourReviews}`}>
              <Slider value={yourReviews} min={0} max={100} step={1}
                onChange={setYourRev} color={C.indigo}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>0</span><span>100+</span>
              </div>
            </Field>

            <Field label={`Average Rating: ${fmt1(yourRating)}★`}>
              <Slider value={yourRating} min={2.5} max={5} step={0.1}
                onChange={setRating} color={C.indigo}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>2.5★</span><span>5★</span>
              </div>
            </Field>

            <Field label="When Was Your Online Presence Last Meaningfully Updated?"
              hint="Google Business profile, website, or main social page — hours, photos, service times.">
              <select value={lastUpdated} onChange={e=>setLastUpdated(e.target.value)}>
                {RECENCY.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </Field>

            <div style={{background:visibilityGap>15?C.indigo+"10":C.bg2,
              border:"1px solid "+(visibilityGap>15?C.indigo:C.border),
              borderRadius:11,padding:"14px 15px",marginTop:4}}>
              <div style={{fontSize:11,fontWeight:700,
                color:visibilityGap>15?C.indigo:C.dim,
                textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>
                Presence Diagnosis
              </div>
              {[
                ["Monthly online visitors",monthlyVisitors,C.muted],
                ["Trust/visibility score",`${Math.round(visibility.trustScore*100)}%`,C.indigo],
                ["Estimated people who don't follow up",fmt1(visibilityGap),C.indigo],
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

        {/* ── RESPONSE SPEED ── */}
        {tab==="speed"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>Response Speed Gap</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              How fast a "plan your visit," prayer request, or membership inquiry gets a reply —
              bounded by the actual number of inquiries you receive, never inflated beyond it.
            </p>

            <Field label={`Estimated Monthly Online Inquiries: ${monthlyEnq}`}
              hint="Visit-planning forms, prayer requests, membership or event questions.">
              <Slider value={monthlyEnq} min={2} max={100} step={1}
                onChange={setEnq} color={C.green}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>2</span><span>100/month</span>
              </div>
            </Field>

            <Field label="Current Typical Response Time">
              <select value={responseId} onChange={e=>setResp(e.target.value)}>
                {RESPONSE.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </Field>

            <div style={{background:speedGap>4?C.green+"10":C.bg2,
              border:"1px solid "+(speedGap>4?C.green:C.border),
              borderRadius:11,padding:"14px 15px",marginTop:4}}>
              <div style={{fontSize:11,fontWeight:700,
                color:speedGap>4?C.green:C.dim,
                textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>
                Response Diagnosis
              </div>
              {[
                ["Monthly online inquiries",monthlyEnq,C.muted],
                ["Interest still warm at current speed",`${Math.round((RESPONSE.find(r=>r.id===responseId)?.keep||0)*100)}%`,C.green],
                ["Estimated inquiries that go cold",fmt1(speedGap),C.green],
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

        {/* ── MISSED CALLS ── */}
        {tab==="calls"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>Missed Call Gap</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              Calls about weddings, funerals, pastoral needs, or simple service-time questions —
              bounded by the actual call volume you enter below.
            </p>
            <Field label={`Estimated Monthly Inbound Calls: ${monthlyCalls}`}>
              <Slider value={monthlyCalls} min={5} max={300} step={5}
                onChange={setCalls} color={C.amber}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>5</span><span>300/month</span>
              </div>
            </Field>
            <Field label={`Estimated % of Calls That Go Unanswered: ${missedPct}%`}
              hint="For a single pastor or a small volunteer team, 35-50% is common.">
              <Slider value={missedPct} min={0} max={85} step={1}
                onChange={setMissed} color={C.amber}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>0%</span><span>85%</span>
              </div>
            </Field>
            <div style={{background:callGap>8?C.amber+"10":C.bg2,
              border:"1px solid "+(callGap>8?C.amber:C.border),
              borderRadius:11,padding:"14px 15px",marginTop:4}}>
              <div style={{fontSize:11,fontWeight:700,
                color:callGap>8?C.amber:C.dim,
                textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>
                Missed Call Diagnosis
              </div>
              {[
                ["Monthly inbound calls",monthlyCalls,C.muted],
                ["Missed calls per month",Math.round(monthlyCalls*(missedPct/100)),C.amber],
                ["Estimated people who don't call back",fmt1(callGap),C.amber],
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

        {/* ── REPORT ── */}
        {tab==="report"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>
              📋 Ministry Engagement Report — {ministryLabel}
            </h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              This is your discovery-conversation asset. Record a Loom of this screen with real
              numbers filled in — it's a far warmer opener than a proposal.
            </p>

            <div style={{background:"linear-gradient(135deg,#F5F0E4,#F5F0E4)",
              border:"1px solid "+C.indigo+"40",borderRadius:12,padding:"18px",marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,color:C.indigo,textTransform:"uppercase",
                letterSpacing:".1em",marginBottom:4}}>Estimated Missed Connections</div>
              <div style={{fontSize:"clamp(32px,6vw,48px)",fontWeight:800,color:C.indigo,
                marginBottom:8}}>{fmt1(totalGap)} <span style={{fontSize:"0.4em",color:C.dim,fontWeight:600}}>people/month</span></div>
              <div style={{fontSize:12.5,color:C.dim}}>
                Real people who reached out, or almost did, and didn't get followed through with —
                not a dollar figure, and never more than the numbers you entered.
              </div>
              <div style={{marginTop:16}}>
                <ScoreBar value={visibilityGap} max={totalGap||1} color={C.indigo} label="🌐 Online Presence Gap"/>
                <ScoreBar value={speedGap}      max={totalGap||1} color={C.green}  label="⚡ Response Speed Gap"/>
                <ScoreBar value={callGap}       max={totalGap||1} color={C.amber}  label="📞 Missed Call Gap"/>
              </div>
            </div>

            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:C.dim,textTransform:"uppercase",
                letterSpacing:".08em",marginBottom:10}}>Roughly, Per Day / Week / Month</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <StatBlock icon="🌅" label="Per Day" value={fmt1(dailyGap)} color={C.indigo}/>
                <StatBlock icon="📆" label="Per Week" value={fmt1(weeklyGap)} color={C.green}/>
                <StatBlock icon="🗓️" label="Per Month" value={fmt1(totalGap)} color={C.amber}/>
              </div>
            </div>

            <div style={{background:topPriority.color+"12",border:"1px solid "+topPriority.color+"35",
              borderRadius:12,padding:"14px 16px",marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,color:topPriority.color,
                textTransform:"uppercase",letterSpacing:".09em",marginBottom:8}}>
                ★ Biggest Single Gap — Lead With This
              </div>
              <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:4}}>
                {topPriority.icon} {topPriority.name}
              </div>
              <div style={{fontSize:13,color:C.muted,marginBottom:6,lineHeight:1.6}}>
                Estimated <strong style={{color:topPriority.color}}>{fmt1(topPriority.gap)} people/month</strong>{" "}
                affected. Service: <strong style={{color:C.green}}>{topPriority.price}</strong>.
              </div>
              <div style={{fontSize:12,color:topPriority.color,fontWeight:600}}>
                Don't lead with all three at once — this is the one worth a real conversation first.
                The other two are natural next steps once trust is there.
              </div>
            </div>

            <div style={{fontSize:12,fontWeight:700,color:C.dim,textTransform:"uppercase",
              letterSpacing:".08em",marginBottom:10}}>All 3 Gaps — Ranked by Size</div>
            {priorities.map((p,i)=>(
              <ServiceCard key={p.id} {...p} isTop={i===0}/>
            ))}

            <div style={{background:C.bg2,border:"1px solid "+C.border,
              borderRadius:12,padding:"14px 16px",marginTop:8}}>
              <div style={{fontSize:11,fontWeight:700,color:C.dim,
                textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>
                12-Month Value Per Ministry — same tiers as the 60-Day Playbook
              </div>
              {[
                {t:"Foundation tier",v:"$600 – $1,200/year",col:C.indigo},
                {t:"Growth tier",v:"$1,800 – $3,000/year",col:C.green},
                {t:"Full Ministry tier",v:"$3,000 – $4,800/year",col:C.amber},
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",
                  padding:"9px 0",borderBottom:"1px solid #FBF8F1"}}>
                  <span style={{fontSize:13,color:C.muted}}>{r.t}</span>
                  <span style={{fontSize:15,fontWeight:700,color:r.col}}>{r.v}</span>
                </div>
              ))}
              <p style={{fontSize:11.5,color:C.dim,marginTop:10,lineHeight:1.6}}>
                This report exists to make the case for the Foundation tier honestly — with real,
                bounded numbers, not a bigger figure invented to make the pitch feel more dramatic.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
