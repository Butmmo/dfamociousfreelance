import { useState, useMemo } from "react";

/* ─── GENRE PRESETS (pool = est. monthly new-listener discovery volume for the genre) ─── */
const GENRES = {
  business:    {label:"Business & Entrepreneurship",            icon:"💼", color:"#7A5A00", avgDownloads:900,  cpm:28, pool:20000, loyalBase:320},
  health:      {label:"Health & Wellness",                      icon:"💪", color:"#0D7A5F", avgDownloads:1050, cpm:22, pool:28000, loyalBase:380},
  truecrime:   {label:"True Crime",                              icon:"🕵️", color:"#7A5A00", avgDownloads:2400, cpm:20, pool:48000, loyalBase:850},
  comedy:      {label:"Comedy & Entertainment",                  icon:"🎭", color:"#C99A3B", avgDownloads:2000, cpm:18, pool:44000, loyalBase:700},
  interview:   {label:"Interview & Conversational",              icon:"🎤", color:"#0D7A5F", avgDownloads:950,  cpm:20, pool:24000, loyalBase:340},
  selfimprove: {label:"Self-Improvement & Personal Development", icon:"🧠", color:"#8B2E1F", avgDownloads:1000, cpm:24, pool:25000, loyalBase:360},
  gaming:      {label:"Gaming & Pop Culture",                    icon:"🎮", color:"#7A5A00", avgDownloads:1750, cpm:16, pool:40000, loyalBase:620},
  sports:      {label:"Sports Commentary",                       icon:"⚽", color:"#7A5A00", avgDownloads:1300, cpm:18, pool:27000, loyalBase:450},
};

const CLIP_RECENCY = [
  {id:"fresh",  label:"Less than 1 week ago",       multiplier:1.00},
  {id:"recent", label:"1 – 2 weeks ago",             multiplier:0.85},
  {id:"stale",  label:"2 – 4 weeks ago",             multiplier:0.60},
  {id:"old",    label:"1 – 3 months ago",            multiplier:0.35},
  {id:"dead",   label:"Over 3 months ago, or never", multiplier:0.15},
];

const FREQUENCY = [
  {id:"weekly",    label:"Weekly, on schedule",          keep:0.90},
  {id:"biweekly",  label:"Every 2 weeks",                keep:0.65},
  {id:"monthly",   label:"Monthly",                      keep:0.40},
  {id:"irregular", label:"Irregular / no fixed schedule", keep:0.20},
];

const C = {
  bg:"#F5F0E4", bg2:"#F8F5EE", bg3:"#FBF8F1", border:"#FBF8F1",
  text:"#201A16", muted:"#6E6459", dim:"#6E6459",
  indigo:"#7A5A00", green:"#0D7A5F", amber:"#C99A3B",
  pink:"#8B2E1F", red:"#8B0000", purple:"#7A5A00", teal:"#0D7A5F",
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
export default function PodcastPerformanceCalculator() {
  /* ── Identity ── */
  const [showName, setShowName]         = useState("");
  const [competitorName, setCompName]   = useState("");

  /* ── Genre / show profile ── */
  const [genreKey, setGenreKey]         = useState("business");
  const [discoveryPool, setPool]        = useState(20000);
  const [avgDownloads, setDownloads]    = useState(900);
  const [episodesPerMonth, setEpisodes] = useState(4);
  const [adsPerEp, setAds]              = useState(2);
  const [cpm, setCpm]                   = useState(28);

  /* ── Clip gap ── */
  const [yourClips, setYourClips]       = useState(0);
  const [benchClips, setBenchClips]     = useState(5);
  const [lastClip, setLastClip]         = useState("dead");

  /* ── Production quality ── */
  const [roughPct, setRoughPct]         = useState(55);

  /* ── Consistency ── */
  const [loyalBase, setLoyalBase]       = useState(320);
  const [freqId, setFreqId]             = useState("irregular");

  const [tab, setTab]                   = useState("show");

  const genre     = GENRES[genreKey];
  const showLabel = showName.trim() || "This show";
  const compLabel = competitorName.trim() || "a comparable show";

  const applyGenre = (key) => {
    const g = GENRES[key];
    setGenreKey(key);
    setPool(g.pool);
    setDownloads(g.avgDownloads);
    setCpm(g.cpm);
    setLoyalBase(g.loyalBase);
  };

  const clipRecencyMult = (id) => CLIP_RECENCY.find(r=>r.id===id)?.multiplier ?? 0.5;
  const freqKeep        = (id) => FREQUENCY.find(f=>f.id===id)?.keep ?? 0.3;

  const perListenerMonthlyValue = useMemo(()=>
    (cpm/1000)*adsPerEp*episodesPerMonth
  ,[cpm,adsPerEp,episodesPerMonth]);

  const monthlyShowRevenue = useMemo(()=>
    avgDownloads*episodesPerMonth*adsPerEp*(cpm/1000)
  ,[avgDownloads,episodesPerMonth,adsPerEp,cpm]);

  /* ── Clip presence + genre discovery pool → new-listener loss ── */
  const growth = useMemo(()=>{
    const pool          = Math.max(500, discoveryPool||0);
    const highIntent     = pool*0.30;                                    // actively looking for a new show this cycle

    const yourPresence   = Math.max(0.05, yourClips)*clipRecencyMult(lastClip);
    const benchPresence  = Math.max(0.05, benchClips)*1.0;               // conservative: assume comparable show is fully active
    let share             = yourPresence/(yourPresence+benchPresence);
    share                  = Math.min(0.95, Math.max(0.05, share));

    const listenersLostRaw     = highIntent*(1-share);
    const monthlyListenersLost = listenersLostRaw*0.40;                  // 40% of those become an actual new listener
    const weeklyListenersLost  = monthlyListenersLost/4.33;
    const dailyListenersLost   = monthlyListenersLost/30;
    const monthlyLoss          = monthlyListenersLost*perListenerMonthlyValue;

    return {pool, highIntent, share, listenersLostRaw, monthlyListenersLost,
      weeklyListenersLost, dailyListenersLost, monthlyLoss};
  },[discoveryPool,yourClips,benchClips,lastClip,perListenerMonthlyValue]);

  const discoveryLoss = growth.monthlyLoss;

  const productionLoss = useMemo(()=>{
    const totalListens = avgDownloads*episodesPerMonth;
    const affected      = totalListens*(roughPct/100);
    const churned       = affected*0.35;
    return Math.round(churned*perListenerMonthlyValue);
  },[avgDownloads,episodesPerMonth,roughPct,perListenerMonthlyValue]);

  const consistencyLoss = useMemo(()=>{
    const keep = freqKeep(freqId);
    const lost = loyalBase*(1-keep);
    return Math.round(lost*perListenerMonthlyValue);
  },[loyalBase,freqId,perListenerMonthlyValue]);

  const totalLost = discoveryLoss+productionLoss+consistencyLoss;

  const priorities = useMemo(()=>[
    {id:"clips",loss:discoveryLoss,icon:"✂️",name:"Social Clip Creation",price:"$500-$700/month (Starter tier)",
     problem:`${showLabel} is currently posting ${yourClips} social clip${yourClips===1?"":"s"} per episode, versus ${compLabel} at ${benchClips}. Most new podcast listeners find a show through a clip, not the platform itself — based on typical ${genre.label.toLowerCase()} discovery volume, this gap is estimated to cost ${showLabel} ${fmt1(growth.dailyListenersLost)} new listeners a day, ${fmtI(growth.weeklyListenersLost)} a week, and ${fmtI(growth.monthlyListenersLost)} a month.`,
     pitch:`"Right now, almost nobody is finding ${showLabel} through a clip — and that's genuinely one of the fastest ways shows in ${genre.label.toLowerCase()} are growing today. I can cut ${benchClips} short, captioned, vertical clips from every episode and post them consistently across TikTok, Reels, and Shorts. Based on the gap versus a show like ${compLabel}, that's an estimated ${fmtI(growth.monthlyListenersLost)} new listeners a month you're not reaching right now. I'll start with one free sample clip from a recent episode — no cost, just so you can see what it looks like."`,
     tool:"CapCut — free account, no watermark on exports, built for vertical captioned clips.",
     setup:"CapCut → import episode audio/video → auto-captions → trim to the 3 strongest 30-60 sec moments → export vertical 9:16 → post natively to TikTok, Reels, and YouTube Shorts within 24-48 hrs of the episode going live.",
     roiLine:`Recovering just 15% of ${showLabel}'s estimated ${fmt(discoveryLoss)} monthly loss = ${fmt(Math.round(discoveryLoss*0.15))} in added sponsorship-ready audience value — against a Starter package that runs $500-$700/month.`,
     color:C.amber},
    {id:"editing",loss:productionLoss,icon:"🎧",name:"Full Episode Editing",price:"$500-$700/month (included in every tier)",
     problem:`Approximately ${roughPct}% of ${showLabel}'s episodes are estimated to have noticeable audio or pacing issues — background noise, dead air, no real edit pass. Listeners who hit a rough episode are far less likely to come back for the next one, which is estimated to cost ${showLabel} ${fmt(productionLoss)} a month in listener churn.`,
     pitch:`"Here's something most hosts don't realize: a listener who hits one rough, unedited episode is much less likely to come back for the next one — even when the content itself is great. I can take your raw audio and turn it into a clean, professionally-paced episode every time: noise reduction, leveling, cutting dead air and filler words, a consistent intro and outro. I'll edit one full episode for free first, so you can hear the difference directly against your current version."`,
     tool:"Audacity — free, unlimited, no watermark or time cap, and genuinely capable of professional-quality editing.",
     setup:"Audacity → Noise Reduction → normalize levels → cut dead air and filler words → add intro/outro → export the finished episode. A typical 45-60 minute episode takes roughly 1-3 hours.",
     roiLine:`Recovering 30% of ${showLabel}'s estimated ${fmt(productionLoss)} monthly churn loss = ${fmt(Math.round(productionLoss*0.30))}/month — and it's the foundation every other service builds on.`,
     color:C.indigo},
    {id:"publish",loss:consistencyLoss,icon:"📡",name:"Show Notes, Publishing & Distribution",price:"$800-$1,800/month (Growth & Full Production)",
     problem:`${showLabel}'s current posting frequency is "${FREQUENCY.find(f=>f.id===freqId)?.label}" — at this pace, only an estimated ${Math.round(freqKeep(freqId)*100)}% of the loyal, returning audience stays fully engaged between episodes. That's roughly ${fmt(consistencyLoss)} a month in listener drop-off from inconsistency alone.`,
     pitch:`"Consistency is what actually builds a podcast audience — a host who publishes on an irregular schedule loses momentum even with great content. I can take over show notes, timestamps, and publishing across every platform on a fixed weekly schedule, so listeners always know when the next episode is coming and new listeners can actually find you in search. That alone usually recovers a meaningful chunk of the drop-off you're seeing right now."`,
     tool:"Buzzsprout or Spotify for Podcasters (free tier) for scheduled publishing, plus a Notion Show CRM to track the release calendar.",
     setup:"Buzzsprout/Spotify for Podcasters → set a fixed weekly release day → write show notes and timestamps within 24 hrs of the edit → schedule the cross-platform publish → log it in the Show CRM.",
     roiLine:`Recovering 35% of ${showLabel}'s estimated ${fmt(consistencyLoss)} monthly drop-off = ${fmt(Math.round(consistencyLoss*0.35))}/month — the Growth and Full Production tiers both include this as standard.`,
     color:C.pink},
  ].sort((a,b)=>b.loss-a.loss),[discoveryLoss,productionLoss,consistencyLoss,showLabel,compLabel,genre,yourClips,benchClips,growth,roughPct,freqId,loyalBase]);

  const topPriority = priorities[0];

  const TABS = [
    {id:"show",        label:"🎙️ Show"},
    {id:"clips",       label:"✂️ Clips"},
    {id:"growth",      label:"📡 Growth Loss"},
    {id:"editing",     label:"🎧 Production"},
    {id:"consistency", label:"📅 Consistency"},
    {id:"report",      label:"💰 Report"},
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
        .chip:hover{border-color:#7A5A00!important;color:#C99A3B!important;}
      `}</style>

      {/* HEADER */}
      <div style={{background:"linear-gradient(160deg,#F8F5EE 0%,#F8F5EE 60%,#F5F0E4 100%)",
        padding:"22px 16px 18px",borderBottom:"1px solid #FBF8F1"}}>
        <div style={{maxWidth:820,margin:"0 auto"}}>
          <div style={{fontSize:10,fontWeight:700,color:C.green,textTransform:"",
            letterSpacing:".12em",marginBottom:7,display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:C.green,
              boxShadow:"0 0 6px "+C.green,display:"inline-block"}}/>
            Podcast Growth Leak Finder
          </div>
          <h1 style={{margin:"0 0 7px",fontSize:"clamp(20px,4vw,30px)",fontWeight:800,lineHeight:1.15,
            background:"linear-gradient(135deg,#201A16 30%,#C99A3B 100%)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            Podcast Production & Growth Performance Calculator
          </h1>
          <p style={{fontSize:12.5,color:"#6E6459",maxWidth:560,lineHeight:1.65}}>
            Enter a podcast host's numbers to discover exactly how many listeners — and how much
            sponsorship-ready growth — they are losing to weak production. Use this live on a
            discovery call or record it as a Loom.
          </p>
          {showName.trim()&&(
            <div style={{marginTop:10,display:"inline-flex",alignItems:"center",gap:7,
              background:"#7A5A0018",border:"1px solid #7A5A0035",borderRadius:20,padding:"5px 13px"}}>
              <span style={{fontSize:12,color:"#C99A3B",fontWeight:600}}>
                📍 Analyzing: {showLabel} ({genre.icon} {genre.label})
                {competitorName.trim()?` vs ${compLabel}`:""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div style={{background:"#F8F5EE",borderBottom:"1px solid #FBF8F1",
        position:"sticky",top:0,zIndex:20}}>
        <div style={{maxWidth:820,margin:"0 auto",display:"flex",padding:"0 8px",overflowX:"auto"}}>
          {TABS.map(t=>(
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

        {/* ── LIVE SUMMARY STRIP ── */}
        {totalLost>0&&(
          <div style={{background:"linear-gradient(135deg,#F8F5EE,#FBF8F1)",
            border:"1px solid #FBF8F1",borderRadius:11,padding:"12px 16px",
            marginBottom:16,display:"flex",gap:16,flexWrap:"wrap",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:C.red,textTransform:"",
                letterSpacing:".09em",marginBottom:3}}>Est. Monthly Growth & Revenue at Risk</div>
              <div style={{fontSize:26,fontWeight:800,color:C.red}}>{fmt(totalLost)}</div>
            </div>
            <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
              {[
                {lbl:"Clip Gap",val:discoveryLoss,col:C.amber},
                {lbl:"Production Gap",val:productionLoss,col:C.indigo},
                {lbl:"Consistency Gap",val:consistencyLoss,col:C.pink},
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

        {/* ── SHOW PROFILE ── */}
        {tab==="show"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>Show Profile</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px"}}>
              Name the show, its genre, and a comparable show it's competing with for new listeners.
              This personalizes every pitch script and drives the Growth Loss calculation.
            </p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:6}}>
              <Field label="Show Name">
                <input type="text" value={showName} placeholder="e.g. The Startup Hour"
                  onChange={e=>setShowName(e.target.value)}/>
              </Field>
              <Field label="Comparable Show's Name">
                <input type="text" value={competitorName} placeholder="e.g. Founders Weekly"
                  onChange={e=>setCompName(e.target.value)}/>
              </Field>
            </div>

            <Field label="Genre">
              <select value={genreKey} onChange={e=>applyGenre(e.target.value)}>
                {Object.entries(GENRES).map(([k,v])=>(
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </Field>

            <Field label={`Est. Monthly Genre Discovery Volume: ${fmtI(discoveryPool)}`}
              hint="A modeled estimate of how many people are actively discovering new shows in this genre each month via clips, charts, and search. Adjust based on your own genre research — this isn't a live scraped number.">
              <Slider value={discoveryPool} min={2000} max={80000} step={500}
                onChange={setPool} color={genre.color}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>2,000</span><span>80,000/month</span>
              </div>
            </Field>

            <Field label={`Average Downloads Per Episode (first 30 days): ${fmtI(avgDownloads)}`}
              hint="Downloads for a single episode, not the whole feed.">
              <Slider value={avgDownloads} min={100} max={8000} step={50}
                onChange={setDownloads} color={genre.color}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>100</span><span>8,000</span>
              </div>
            </Field>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Field label={`Episodes Published / Month: ${episodesPerMonth}`}>
                <Slider value={episodesPerMonth} min={1} max={16} step={1}
                  onChange={setEpisodes} color={C.green}/>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                  <span>1</span><span>16</span>
                </div>
              </Field>
              <Field label={`Sponsored Ad Slots / Episode: ${adsPerEp}`}>
                <Slider value={adsPerEp} min={0} max={4} step={1}
                  onChange={setAds} color={C.green}/>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                  <span>0</span><span>4</span>
                </div>
              </Field>
            </div>

            <Field label={`Sponsorship CPM (per 1,000 downloads): $${cpm}`}
              hint="Typical host-read sponsorship rates run roughly $15-$30 per 1,000 downloads, depending on genre and audience value.">
              <Slider value={cpm} min={8} max={40} step={1}
                onChange={setCpm} color={C.amber}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>$8</span><span>$40</span>
              </div>
            </Field>

            <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:10,
              padding:"13px 14px",marginTop:4}}>
              <div style={{fontSize:11,fontWeight:700,color:C.dim,
                textTransform:"",letterSpacing:".07em",marginBottom:10}}>
                Estimated Monthly Show Revenue
              </div>
              <div style={{fontSize:28,fontWeight:800,color:C.text}}>
                {fmt(monthlyShowRevenue)}
              </div>
              <div style={{fontSize:12,color:C.dim,marginTop:3}}>
                {fmtI(avgDownloads)} downloads × {episodesPerMonth} episodes × {adsPerEp} ad slots × ${cpm} CPM
              </div>
            </div>
          </div>
        )}

        {/* ── CLIP GAP ── */}
        {tab==="clips"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>✂️ Clip Gap Audit</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              Most new podcast listeners discover a show through a clip, not the platform itself.
              A show posting zero or few clips is invisible to that entire discovery channel.
            </p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:22}}>
              <Field label={`${showLabel}'s Clips / Episode: ${yourClips}`}>
                <Slider value={yourClips} min={0} max={8} step={1}
                  onChange={setYourClips} color={C.amber}/>
              </Field>
              <Field label={`${compLabel}'s Clips / Episode: ${benchClips}`}>
                <Slider value={benchClips} min={0} max={8} step={1}
                  onChange={setBenchClips} color={C.amber}/>
              </Field>
            </div>
            <Field label="When was the last clip posted from this show?"
              hint="A show with strong episodes but zero clip presence is one of the most provable, fixable gaps you can find.">
              <select value={lastClip} onChange={e=>setLastClip(e.target.value)}>
                {CLIP_RECENCY.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </Field>
            {/* Clip Diagnosis */}
            <div style={{background:discoveryLoss>300?C.amber+"10":C.bg2,
              border:"1px solid "+(discoveryLoss>300?C.amber:C.border),
              borderRadius:11,padding:"14px 15px",marginTop:4}}>
              <div style={{fontSize:11,fontWeight:700,
                color:discoveryLoss>300?C.amber:C.dim,
                textTransform:"",letterSpacing:".07em",marginBottom:10}}>
                Clip Gap Diagnosis
              </div>
              {[
                [`${showLabel}`,yourClips+" clips/episode",C.muted],
                [`${compLabel}`,benchClips+" clips/episode",C.text],
                ["Visibility share",Math.round(growth.share*100)+"%",C.amber],
                ["Est. new listeners lost / month",fmtI(growth.monthlyListenersLost),C.red],
                ["Estimated monthly value lost",fmt(discoveryLoss),C.red],
                ["Service to fix this","Social Clip Creation",C.amber],
                ["Price","$500 – $700/month (Starter)",C.green],
              ].map(([lbl,val,col])=>(
                <div key={lbl} style={{display:"flex",justifyContent:"space-between",
                  padding:"7px 0",borderBottom:"1px solid #FBF8F1"}}>
                  <span style={{fontSize:12.5,color:C.muted}}>{lbl}</span>
                  <span style={{fontSize:13,fontWeight:600,color:col}}>{val}</span>
                </div>
              ))}
              <p style={{fontSize:11.5,color:C.dim,margin:"10px 0 0",lineHeight:1.5}}>
                See the <strong style={{color:"#C99A3B"}}>📡 Growth Loss</strong> tab for the full
                daily / weekly / monthly breakdown and the methodology behind these numbers.
              </p>
            </div>
          </div>
        )}

        {/* ── GROWTH LOSS ── */}
        {tab==="growth"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>
              📡 Growth Loss — {showLabel}
            </h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              Combining {genre.label.toLowerCase()}'s discovery volume with the clip-presence gap vs
              {" "}{compLabel}, here is the estimated new-listener loss — broken down by day, week, and month.
            </p>

            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
              <StatBlock icon="🌅" label="New Listeners Lost / Day"
                value={fmt1(growth.dailyListenersLost)} color={C.red}/>
              <StatBlock icon="📆" label="New Listeners Lost / Week"
                value={fmtI(growth.weeklyListenersLost)} color={C.amber}/>
              <StatBlock icon="🗓️" label="New Listeners Lost / Month"
                value={fmtI(growth.monthlyListenersLost)} color={C.pink}/>
            </div>

            <div style={{background:"linear-gradient(135deg,#F5F0E4,#F5F0E4)",
              border:"1px solid "+C.red+"35",borderRadius:12,padding:"16px",marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,color:C.red,textTransform:"",
                letterSpacing:".09em",marginBottom:6}}>What This Means</div>
              <p style={{fontSize:14,color:C.text,lineHeight:1.7,margin:0}}>
                {showLabel} is losing an estimated <strong style={{color:C.red}}>{fmt1(growth.dailyListenersLost)} new listeners every day</strong> to
                {" "}{compLabel} or a similarly-positioned show — worth roughly <strong style={{color:C.red}}>{fmt(discoveryLoss)} a month</strong>,
                or <strong style={{color:C.red}}>{fmt(discoveryLoss*12)} a year</strong>, simply
                because of the clip-presence gap.
              </p>
            </div>

            <div style={{fontSize:12,fontWeight:700,color:C.dim,textTransform:"",
              letterSpacing:".08em",marginBottom:10}}>How This Is Calculated</div>
            <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:11,
              padding:"14px 15px",marginBottom:16}}>
              {[
                [`1. Est. monthly ${genre.label.toLowerCase()} discovery volume`,fmtI(growth.pool)+"/month",C.muted],
                ["2. High-intent, decision-ready listeners (~30%)",fmtI(growth.highIntent)+"/month",C.muted],
                [`3. ${showLabel}'s visibility share vs ${compLabel}`,Math.round(growth.share*100)+"%",C.amber],
                [`4. Listeners discovering ${compLabel} (or similar) instead`,fmtI(growth.listenersLostRaw)+"/month",C.red],
                ["5. Of those, estimated new listeners converted (~40%)",fmtI(growth.monthlyListenersLost)+"/month",C.red],
                ["6. Monthly value at current CPM and ad load",fmt(discoveryLoss)+"/month",C.red],
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
                This is a modeled estimate, not live scraped data. It combines a typical discovery
                volume for {genre.label.toLowerCase()} shows, and the presence gap between
                {" "}{showLabel}'s clip output and {compLabel}'s. Use it to start an honest,
                directional conversation with the host — not as a scientifically verified figure.
              </p>
            </div>
          </div>
        )}

        {/* ── PRODUCTION QUALITY ── */}
        {tab==="editing"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>🎧 Production Quality Audit</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              A listener who hits one rough, unedited episode is far less likely to come back for
              the next one — even when the content itself is good.
            </p>
            <Field label={`Estimated % of Episodes With Noticeable Audio/Pacing Issues: ${roughPct}%`}
              hint="Background noise, dead air, no real edit pass. If they're self-editing with no real process, or not editing at all, the honest number is often 50-70%.">
              <Slider value={roughPct} min={0} max={90} step={1}
                onChange={setRoughPct} color={C.indigo}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>0%</span><span>90%</span>
              </div>
            </Field>
            {/* Production Diagnosis */}
            <div style={{background:productionLoss>300?C.indigo+"10":C.bg2,
              border:"1px solid "+(productionLoss>300?C.indigo:C.border),
              borderRadius:11,padding:"14px 15px",marginTop:4}}>
              <div style={{fontSize:11,fontWeight:700,
                color:productionLoss>300?C.indigo:C.dim,
                textTransform:"",letterSpacing:".07em",marginBottom:10}}>
                Production Gap Diagnosis
              </div>
              {[
                ["Monthly listens (all episodes)",fmtI(avgDownloads*episodesPerMonth),C.muted],
                ["Listens affected by rough episodes",fmtI(avgDownloads*episodesPerMonth*(roughPct/100)),C.red],
                ["Estimated listener churn (~35%)",fmtI(avgDownloads*episodesPerMonth*(roughPct/100)*0.35),C.red],
                ["Estimated revenue lost monthly",fmt(productionLoss),C.red],
                ["Fix","Full Episode Editing",C.indigo],
                ["Price","$500 – $700/month (Starter, included in every tier)",C.green],
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

        {/* ── CONSISTENCY ── */}
        {tab==="consistency"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>📅 Consistency & Momentum Audit</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              A host who publishes on an irregular schedule loses momentum even with great content —
              consistency is what actually compounds an audience over time.
            </p>
            <Field label={`Estimated Loyal / Returning Listener Base: ${loyalBase}`}
              hint="Roughly how many people listen to this show regularly, episode after episode.">
              <Slider value={loyalBase} min={50} max={3000} step={10}
                onChange={setLoyalBase} color={C.pink}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>50</span><span>3,000</span>
              </div>
            </Field>
            <Field label="Current posting frequency"
              hint="Be honest — an inconsistent gap of even a few weeks is enough to lose real momentum.">
              <select value={freqId} onChange={e=>setFreqId(e.target.value)}>
                {FREQUENCY.map(f=><option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
            </Field>
            {/* Consistency Diagnosis */}
            <div style={{background:consistencyLoss>200?C.pink+"10":C.bg2,
              border:"1px solid "+(consistencyLoss>200?C.pink:C.border),
              borderRadius:11,padding:"14px 15px",marginTop:4}}>
              <div style={{fontSize:11,fontWeight:700,
                color:consistencyLoss>200?C.pink:C.dim,
                textTransform:"",letterSpacing:".07em",marginBottom:10}}>
                Consistency Gap Diagnosis
              </div>
              {[
                ["Loyal / returning listener base",loyalBase+" listeners",C.muted],
                ["Current posting frequency",FREQUENCY.find(f=>f.id===freqId)?.label||"",C.amber],
                ["Retention at this frequency",Math.round(freqKeep(freqId)*100)+"%",C.amber],
                ["Listeners at risk of drop-off",Math.round(loyalBase*(1-freqKeep(freqId)))+" listeners/month",C.red],
                ["Estimated revenue lost monthly",fmt(consistencyLoss),C.red],
                ["Fix","Show Notes, Publishing & Distribution",C.pink],
                ["Price","$800 – $1,800/month (Growth & Full Production)",C.green],
              ].map(([lbl,val,col])=>(
                <div key={lbl} style={{display:"flex",justifyContent:"space-between",
                  padding:"7px 0",borderBottom:"1px solid #FBF8F1"}}>
                  <span style={{fontSize:12.5,color:C.muted}}>{lbl}</span>
                  <span style={{fontSize:13,fontWeight:600,color:col}}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── GROWTH REPORT ── */}
        {tab==="report"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>
              💰 Full Growth Report — {showLabel}
            </h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              This is your discovery call asset. Record a Loom of this screen with the host's
              numbers filled in. It closes better than any proposal.
            </p>

            {/* Growth & Revenue at Risk Summary */}
            <div style={{background:"linear-gradient(135deg,#F5F0E4,#F5F0E4)",
              border:"1px solid "+C.red+"40",borderRadius:12,padding:"18px",marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,color:C.red,textTransform:"",
                letterSpacing:".1em",marginBottom:4}}>Total Estimated Monthly Growth & Revenue at Risk</div>
              <div style={{fontSize:"clamp(32px,6vw,48px)",fontWeight:800,color:C.red,
                marginBottom:8}}>{fmt(totalLost)}</div>
              <div style={{fontSize:12.5,color:C.dim}}>
                {fmt(totalLost*12)} per year — if nothing changes
              </div>
              <div style={{marginTop:16}}>
                <ScoreBar value={discoveryLoss}   max={totalLost||1} color={C.amber}  label="✂️ Clip Gap Loss"/>
                <ScoreBar value={productionLoss}  max={totalLost||1} color={C.indigo} label="🎧 Production Gap Loss"/>
                <ScoreBar value={consistencyLoss} max={totalLost||1} color={C.pink}   label="📅 Consistency Gap Loss"/>
              </div>
            </div>

            {/* New Listeners Lost */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:C.dim,textTransform:"",
                letterSpacing:".08em",marginBottom:10}}>New Listeners Lost to {compLabel}</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <StatBlock icon="🌅" label="Per Day" value={fmt1(growth.dailyListenersLost)} color={C.red}/>
                <StatBlock icon="📆" label="Per Week" value={fmtI(growth.weeklyListenersLost)} color={C.amber}/>
                <StatBlock icon="🗓️" label="Per Month" value={fmtI(growth.monthlyListenersLost)} color={C.pink}/>
              </div>
            </div>

            {/* Priority Recommendation */}
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
                Biggest single leak: <strong style={{color:C.red}}>{fmt(topPriority.loss)}/month</strong>
                {" "}estimated. Service price: <strong style={{color:C.green}}>{topPriority.price}</strong>.
              </div>
              <div style={{fontSize:12,color:topPriority.color,fontWeight:600}}>
                Do NOT pitch all three at once. Lead with this one only.
                Upsell the others once trust is established.
              </div>
            </div>

            {/* All 3 Services in Priority Order */}
            <div style={{fontSize:12,fontWeight:700,color:C.dim,textTransform:"",
              letterSpacing:".08em",marginBottom:10}}>All 3 Services — Ranked by Impact</div>
            {priorities.map((p,i)=>(
              <ServiceCard key={p.id} {...p} isTop={i===0}/>
            ))}

            {/* 12-Month Package Value */}
            <div style={{background:C.bg2,border:"1px solid "+C.border,
              borderRadius:12,padding:"14px 16px",marginTop:8}}>
              <div style={{fontSize:11,fontWeight:700,color:C.dim,
                textTransform:"",letterSpacing:".08em",marginBottom:12}}>
                12-Month Value Per Client (Starter → Growth → Full Production)
              </div>
              {[
                {m:"Month 1-2", s:"Starter — Editing + Clips",          p:600,  col:C.amber},
                {m:"Month 3-4", s:"Growth — + More Clips + Show Notes", p:1000, col:C.indigo},
                {m:"Month 5+",  s:"Full Production — Full Publishing",  p:1550, col:C.pink},
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",
                  alignItems:"center",padding:"9px 0",borderBottom:"1px solid #FBF8F1"}}>
                  <div>
                    <div style={{fontSize:11,color:C.dim,marginBottom:2}}>{r.m}</div>
                    <div style={{fontSize:13,color:C.text,fontWeight:500}}>{r.s}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:11,color:C.dim}}>Rate at this stage</div>
                    <div style={{fontSize:15,fontWeight:800,color:r.col}}>{fmt(r.p)}/mo</div>
                  </div>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",
                alignItems:"center",paddingTop:12}}>
                <span style={{fontSize:14,fontWeight:700,color:C.text}}>12-Month Client Value</span>
                <span style={{fontSize:22,fontWeight:800,color:C.green}}>{fmt(600*2+1000*2+1550*8)}</span>
              </div>
              <div style={{fontSize:11.5,color:C.dim,marginTop:6,lineHeight:1.6}}>
                2 months Starter, 2 months Growth, 8 months Full Production — one client on this
                trajectory for a year = {fmt(600*2+1000*2+1550*8)}, right in line with the
                Full Production tier's own stated $15,600-$21,600/year range.
                Five such clients = {fmt((600*2+1000*2+1550*8)*5)}/year in recurring revenue.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
