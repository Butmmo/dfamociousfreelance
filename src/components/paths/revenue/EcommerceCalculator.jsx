import { useState, useMemo } from "react";

/* ─── NICHE PRESETS (defaults drawn from AOV / abandonment benchmarks per niche) ─── */
const NICHE_PRESETS = {
  skincare:    {label:"Skincare & Beauty",            icon:"🧴", aov:85,  monthlyOrders:250, abandonRate:74, monthlySubscribers:180, totalCustomers:3000, repeatRate:22},
  supplements: {label:"Supplements & Wellness",        icon:"💊", aov:70,  monthlyOrders:300, abandonRate:68, monthlySubscribers:220, totalCustomers:4000, repeatRate:35},
  pet:         {label:"Pet Products",                  icon:"🐾", aov:80,  monthlyOrders:200, abandonRate:58, monthlySubscribers:140, totalCustomers:2500, repeatRate:30},
  jewelry:     {label:"Jewelry & Accessories",          icon:"💍", aov:280, monthlyOrders:90,  abandonRate:78, monthlySubscribers:100, totalCustomers:1500, repeatRate:15},
  baby:        {label:"Baby & Kids Products",           icon:"👶", aov:110, monthlyOrders:150, abandonRate:68, monthlySubscribers:120, totalCustomers:2000, repeatRate:25},
  coffee:      {label:"Coffee & Specialty Food",        icon:"☕", aov:65,  monthlyOrders:280, abandonRate:66, monthlySubscribers:200, totalCustomers:3500, repeatRate:40},
  fitness:     {label:"Athletic & Fitness Apparel",     icon:"🏋️", aov:130, monthlyOrders:180, abandonRate:76, monthlySubscribers:150, totalCustomers:2200, repeatRate:24},
  tech:        {label:"Tech Accessories & Gadgets",     icon:"📱", aov:200, monthlyOrders:140, abandonRate:77, monthlySubscribers:160, totalCustomers:1800, repeatRate:18},
  other:       {label:"Other Ecommerce Store",          icon:"🛍️", aov:95,  monthlyOrders:200, abandonRate:70, monthlySubscribers:150, totalCustomers:2500, repeatRate:25},
};

const CART_STATUS = [
  {id:"none",    label:"No abandoned cart flow at all",              rate:0.00},
  {id:"basic",   label:"One generic email, sent inconsistently",     rate:0.03},
  {id:"partial", label:"1-2 emails, no urgency or incentive",        rate:0.06},
  {id:"full",    label:"Full 3-email sequence with an incentive",    rate:0.095},
];
const ACHIEVABLE_CART_RATE = 0.11;

const WELCOME_STATUS = [
  {id:"none",  label:"Nothing — new subscribers get zero follow-up", rate:0.02},
  {id:"basic", label:"One generic welcome email",                    rate:0.05},
  {id:"full",  label:"Full 4-5 email welcome series",                rate:0.095},
];
const ACHIEVABLE_WELCOME_RATE = 0.11;

const POST_STATUS = [
  {id:"none",  label:"Shipping confirmation only, nothing else",                     uplift:0},
  {id:"basic", label:"A single thank-you or review-request email",                   uplift:3},
  {id:"full",  label:"Full flow — thank-you, shipping, review request, cross-sell",   uplift:7},
];
const ACHIEVABLE_POST_UPLIFT = 8;

const WINBACK_STATUS = [
  {id:"none",  label:"Nothing — lapsed customers never hear from us again", rate:0.00},
  {id:"basic", label:"An occasional manual sale email to the full list",    rate:0.015},
  {id:"full",  label:"Full automated win-back sequence with a return offer",rate:0.04},
];
const ACHIEVABLE_WINBACK_RATE = 0.05;

const PACKAGE_TIERS = [
  {id:"starter", name:"Starter",              price:"$297–$397/mo",   value:"$3,564–$4,764/yr",  desc:"Abandoned Cart Recovery only",              color:"#7A5A00"},
  {id:"growth",  name:"Growth",                price:"$500–$700/mo",   value:"$6,000–$8,400/yr",  desc:"All 4 core flows + monthly campaigns",       color:"#0D7A5F"},
  {id:"full",    name:"Full Revenue System",   price:"$800–$1,200/mo", value:"$9,600–$14,400/yr", desc:"Everything in Growth + SMS + optimization",  color:"#8B2E1F"},
];

const C = {
  bg:"#F5F0E4", bg2:"#F8F5EE", bg3:"#FBF8F1", border:"#FBF8F1",
  text:"#201A16", muted:"#6E6459", dim:"#6E6459",
  indigo:"#7A5A00", green:"#0D7A5F", amber:"#C99A3B",
  pink:"#8B2E1F", red:"#8B0000", purple:"#7A5A00", teal:"#0D7A5F",
};

/* ─── HELPERS ────────────────────────────────────────────── */
const fmt  = (n) => n >= 1000 ? `$${(n/1000).toFixed(1)}K` : `$${Math.round(n).toLocaleString()}`;
const fmtI = (n) => Math.round(n).toLocaleString();

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
            ["🔍 The Problem Signal",problem,C.indigo],
            ["🎤 The Pitch (word for word)",pitch,C.green],
            ["🔧 The Tool",tool,C.amber],
            ["⚙️ Klaviyo Setup",setup,C.purple],
            ["📈 Expected ROI",roiLine,color],
          ].map(([lbl,val,col])=>(
            <div key={lbl} style={{marginTop:12}}>
              <div style={{fontSize:10,fontWeight:700,color:col,textTransform:"uppercase",
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
export default function EcommercePerformanceCalculator() {
  /* ── Store / niche profile ── */
  const [storeName, setStoreName]     = useState("");
  const [nicheKey, setNicheKey]       = useState("skincare");
  const [aov, setAov]                 = useState(NICHE_PRESETS.skincare.aov);
  const [monthlyOrders, setOrders]    = useState(NICHE_PRESETS.skincare.monthlyOrders);

  /* ── Cart recovery ── */
  const [abandonRate, setAbandon]     = useState(NICHE_PRESETS.skincare.abandonRate);
  const [cartStatus, setCartStatus]   = useState("partial");

  /* ── Welcome series ── */
  const [monthlySubs, setSubs]        = useState(NICHE_PRESETS.skincare.monthlySubscribers);
  const [welcomeStatus, setWelcomeStatus] = useState("basic");

  /* ── Post-purchase ── */
  const [repeatRate, setRepeatRate]   = useState(NICHE_PRESETS.skincare.repeatRate);
  const [postStatus, setPostStatus]   = useState("none");

  /* ── Win-back ── */
  const [totalCustomers, setTotalCustomers] = useState(NICHE_PRESETS.skincare.totalCustomers);
  const [lapsedPct, setLapsedPct]     = useState(45);
  const [winbackStatus, setWinbackStatus] = useState("none");

  /* ── Email attribution cross-check ── */
  const [emailAttribution, setEmailAttribution] = useState(14);

  const [tab, setTab] = useState("profile");

  const niche = NICHE_PRESETS[nicheKey];
  const storeLabel = storeName.trim() || "This store";

  const applyPreset = (key) => {
    const p = NICHE_PRESETS[key];
    setNicheKey(key);
    setAov(p.aov);
    setOrders(p.monthlyOrders);
    setAbandon(p.abandonRate);
    setSubs(p.monthlySubscribers);
    setRepeatRate(p.repeatRate);
    setTotalCustomers(p.totalCustomers);
  };

  /* ── Cart recovery model ── */
  const cart = useMemo(()=>{
    const rate = Math.min(95, Math.max(1, abandonRate));
    const checkoutStarts = monthlyOrders / (1 - rate/100);
    const abandoners = Math.max(0, checkoutStarts - monthlyOrders);
    const currentRate = CART_STATUS.find(s=>s.id===cartStatus)?.rate ?? 0;
    const currentRecovered = abandoners * currentRate;
    const achievableRecovered = abandoners * ACHIEVABLE_CART_RATE;
    const gapOrders = Math.max(0, achievableRecovered - currentRecovered);
    const opportunity = gapOrders * aov;
    return {checkoutStarts, abandoners, currentRecovered, achievableRecovered, gapOrders, opportunity};
  },[abandonRate, monthlyOrders, cartStatus, aov]);

  /* ── Welcome series model ── */
  const welcome = useMemo(()=>{
    const currentRate = WELCOME_STATUS.find(s=>s.id===welcomeStatus)?.rate ?? 0;
    const currentConverted = monthlySubs * currentRate;
    const achievableConverted = monthlySubs * ACHIEVABLE_WELCOME_RATE;
    const gapOrders = Math.max(0, achievableConverted - currentConverted);
    const opportunity = gapOrders * aov;
    return {currentConverted, achievableConverted, gapOrders, opportunity};
  },[monthlySubs, welcomeStatus, aov]);

  /* ── Post-purchase model ── */
  const post = useMemo(()=>{
    const currentUplift = POST_STATUS.find(s=>s.id===postStatus)?.uplift ?? 0;
    const gapPts = Math.max(0, ACHIEVABLE_POST_UPLIFT - currentUplift);
    const gapOrders = monthlyOrders * (gapPts/100);
    const opportunity = gapOrders * aov;
    return {gapPts, gapOrders, opportunity};
  },[postStatus, monthlyOrders, aov]);

  /* ── Win-back model ── */
  const winback = useMemo(()=>{
    const lapsed = totalCustomers * (lapsedPct/100);
    const currentRate = WINBACK_STATUS.find(s=>s.id===winbackStatus)?.rate ?? 0;
    const currentRecovered = lapsed * currentRate;
    const achievableRecovered = lapsed * ACHIEVABLE_WINBACK_RATE;
    const gapOrders = Math.max(0, achievableRecovered - currentRecovered);
    const opportunity = gapOrders * aov;
    return {lapsed, currentRecovered, achievableRecovered, gapOrders, opportunity};
  },[totalCustomers, lapsedPct, winbackStatus, aov]);

  const totalOpportunity = cart.opportunity + welcome.opportunity + post.opportunity + winback.opportunity;

  const attributionBand = useMemo(()=>{
    if(emailAttribution < 20) return {label:"Underinvested", color:C.red};
    if(emailAttribution < 30) return {label:"Below Benchmark", color:C.amber};
    if(emailAttribution < 40) return {label:"At Benchmark", color:C.green};
    return {label:"Top Tier", color:C.indigo};
  },[emailAttribution]);

  const recommendedTier = useMemo(()=>{
    const meaningfulGaps = [cart.opportunity, welcome.opportunity, post.opportunity, winback.opportunity]
      .filter(v=>v>100).length;
    if(meaningfulGaps<=1) return "starter";
    if(meaningfulGaps<=3) return "growth";
    return "full";
  },[cart,welcome,post,winback]);

  const priorities = useMemo(()=>[
    {id:"cart", loss:cart.opportunity, icon:"🛒", name:"Abandoned Cart Recovery",
     price:"$297–$397/mo (Starter)",
     problem:`${storeLabel} has an estimated ${fmtI(cart.abandoners)} abandoned checkouts a month at a ${abandonRate}% cart abandonment rate. At the current flow status, only about ${fmtI(cart.currentRecovered)} of those get recovered — a full 3-email sequence typically recovers closer to ${fmtI(cart.achievableRecovered)}, worth roughly ${fmt(cart.opportunity)} a month in revenue currently walking away at checkout.`,
     pitch:`"I added something to your cart and checked what happens next. For a store doing roughly ${fmt(monthlyOrders*aov)} a month, a properly built abandoned cart sequence typically recovers around 10% of what's currently leaving at checkout — for ${storeLabel} that's an estimated ${fmt(cart.opportunity)} a month, running on autopilot once it's live."`,
     tool:"Klaviyo — Flows → Abandoned Checkout template",
     setup:"Klaviyo → Flows → Abandoned Checkout template → customize into a 3-email sequence at 1hr, 24hr, 72hr → add a discount incentive on the final email only → activate",
     roiLine:`Recovering this gap (${fmt(cart.opportunity)}/month) alone covers the $297–$397 Starter price ${Math.max(1,Math.round(cart.opportunity/347))}x over, every month.`,
     color:C.indigo},
    {id:"welcome", loss:welcome.opportunity, icon:"👋", name:"Welcome Series",
     price:"Bundled in Growth ($500–$700/mo)",
     problem:`${storeLabel} gains roughly ${monthlySubs} new subscribers a month. At the current welcome flow status, an estimated ${fmtI(welcome.currentConverted)} convert into a first purchase — a full 4-5 email welcome series typically lifts that to around ${fmtI(welcome.achievableConverted)}, worth roughly ${fmt(welcome.opportunity)} a month in first-purchase revenue currently left uncaptured.`,
     pitch:`"Right now, someone who joins your list gets ${(WELCOME_STATUS.find(s=>s.id===welcomeStatus)?.label||"").toLowerCase()}. A proper welcome series introduces the brand and gives a reason to buy before they forget you exist — for a list your size that's typically worth around ${fmt(welcome.opportunity)} a month in first purchases you're not capturing yet."`,
     tool:"Klaviyo — Flows → Welcome Series template",
     setup:"Klaviyo → Flows → Welcome Series template → customize into a 4-5 email sequence with brand story + first-purchase incentive → connect to signup popup → activate",
     roiLine:`Not sold on its own — it's one of the four flows bundled into the $500–$700 Growth package once Cart Recovery has proven the relationship.`,
     color:C.green},
    {id:"post", loss:post.opportunity, icon:"📦", name:"Post-Purchase Flow",
     price:"Bundled in Growth ($500–$700/mo)",
     problem:`${storeLabel}'s repeat purchase rate sits around ${repeatRate}%. The current post-purchase flow status leaves an estimated ${post.gapPts} points of achievable lift on the table — worth roughly ${fmtI(post.gapOrders)} additional repeat orders and ${fmt(post.opportunity)} a month at current order volume.`,
     pitch:`"After someone buys, does anything happen besides a shipping email? A good post-purchase flow builds trust, times a review request right, and suggests the next purchase — stores that add this typically see a real bump in repeat purchase rate. For ${storeLabel} that's roughly ${fmt(post.opportunity)} a month in incremental repeat revenue."`,
     tool:"Klaviyo — Flows → Post-Purchase template",
     setup:"Klaviyo → Flows → Post-Purchase template → customize thank-you + shipping updates + review request timed to delivery + cross-sell suggestion → activate",
     roiLine:`Also bundled into the $500–$700 Growth package — the natural third flow once Cart Recovery and Welcome are live and trusted.`,
     color:C.amber},
    {id:"winback", loss:winback.opportunity, icon:"🔄", name:"Win-Back / Re-engagement",
     price:"Bundled in Growth ($500–$700/mo)",
     problem:`An estimated ${fmtI(winback.lapsed)} of ${storeLabel}'s customers haven't purchased in 60+ days. At the current win-back status, only about ${fmtI(winback.currentRecovered)} get re-engaged a month — a full automated sequence typically recovers closer to ${fmtI(winback.achievableRecovered)}, worth roughly ${fmt(winback.opportunity)} a month at near-zero acquisition cost.`,
     pitch:`"You likely have ${fmtI(winback.lapsed)} past customers who haven't bought in months. Reaching them again costs a fraction of acquiring someone new — a win-back sequence with a real reason to return typically recovers a steady trickle of them every month. For ${storeLabel} that's roughly ${fmt(winback.opportunity)} a month, essentially free once it's built."`,
     tool:"Klaviyo — Flows → Win-Back / Re-engagement template",
     setup:"Klaviyo → Flows → Win-Back template → segment by \"no purchase in 60+ days\" → customize a compelling return offer → activate",
     roiLine:`The natural fourth flow in the Growth package — usually the easiest upsell once the first three are proven.`,
     color:C.pink},
  ].sort((a,b)=>b.loss-a.loss),
  [cart,welcome,post,winback,storeLabel,monthlyOrders,aov,abandonRate,monthlySubs,welcomeStatus,repeatRate]);

  const topPriority = priorities[0];

  const TABS = [
    {id:"profile", label:"🏪 Store"},
    {id:"cart",    label:"🛒 Cart Recovery"},
    {id:"welcome", label:"👋 Welcome"},
    {id:"post",    label:"📦 Post-Purchase"},
    {id:"winback", label:"🔄 Win-Back"},
    {id:"report",  label:"💰 Report"},
  ];

  return (
    <div style={{fontFamily:"'Inter',system-ui,-apple-system,sans-serif",
      background:C.bg,minHeight:"100vh",color:C.text}}>
      <style>{`
        *{box-sizing:border-box;}
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
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",color:C.teal,
            textTransform:"uppercase",marginBottom:7,display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:C.teal,
              boxShadow:"0 0 6px "+C.teal,display:"inline-block"}}/>
            Revenue Recovery Engine — Discovery Call Tool
          </div>
          <h1 style={{margin:"0 0 7px",fontSize:"clamp(21px,4.5vw,33px)",fontWeight:800,lineHeight:1.15,
            background:"linear-gradient(135deg,#201A16 30%,#0D7A5F 100%)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            Ecommerce Performance Calculator
          </h1>
          <p style={{fontSize:12.5,color:"#D9CFBB",maxWidth:560,lineHeight:1.65}}>
            Enter a prospect's real numbers to see exactly how much revenue is leaking out of their own
            checkout, welcome, post-purchase, and win-back funnel. Use it live on a discovery call or
            record it as a Loom.
          </p>
          {storeName.trim()&&(
            <div style={{marginTop:10,display:"inline-flex",alignItems:"center",gap:7,
              background:C.teal+"18",border:"1px solid "+C.teal+"35",borderRadius:20,padding:"5px 13px"}}>
              <span style={{fontSize:12,color:"#0D7A5F",fontWeight:600}}>
                📍 Analyzing: {storeLabel} — {niche.icon} {niche.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div style={{background:"#F8F5EE",borderBottom:"1px solid #FBF8F1",position:"sticky",top:0,zIndex:20}}>
        <div style={{maxWidth:820,margin:"0 auto",display:"flex",padding:"0 8px",overflowX:"auto"}}>
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

      <div style={{maxWidth:820,margin:"0 auto",padding:"18px 13px 60px"}}>

        {/* LIVE SUMMARY STRIP */}
        {totalOpportunity>0&&(
          <div style={{background:"linear-gradient(135deg,#F8F5EE,#FBF8F1)",
            border:"1px solid #FBF8F1",borderRadius:11,padding:"12px 16px",
            marginBottom:16,display:"flex",gap:16,flexWrap:"wrap",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:C.red,textTransform:"uppercase",
                letterSpacing:".09em",marginBottom:3}}>Estimated Monthly Revenue at Risk</div>
              <div style={{fontSize:26,fontWeight:800,color:C.red}}>{fmt(totalOpportunity)}</div>
            </div>
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              {[
                {lbl:"Cart",val:cart.opportunity,col:C.indigo},
                {lbl:"Welcome",val:welcome.opportunity,col:C.green},
                {lbl:"Post-Purchase",val:post.opportunity,col:C.amber},
                {lbl:"Win-Back",val:winback.opportunity,col:C.pink},
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

        {/* ── STORE PROFILE ── */}
        {tab==="profile"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>Store Profile</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px"}}>
              Name the store and pick its niche. This personalizes every pitch script and sets sensible
              starting numbers for the four flow tabs — adjust anything to match the real prospect.
            </p>

            <Field label="Store Name">
              <input type="text" value={storeName} placeholder="e.g. Northbound Skincare"
                onChange={e=>setStoreName(e.target.value)}/>
            </Field>

            <Field label="Niche" hint="Matches the 8 niches in your Prospecting Guide — sets sensible defaults below.">
              <select value={nicheKey} onChange={e=>applyPreset(e.target.value)}>
                {Object.entries(NICHE_PRESETS).map(([k,v])=>(
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </Field>

            <Field label={`Average Order Value: ${fmt(aov)}`}
              hint="What a single order is worth on average. Ask on the call, or check the store's product prices.">
              <Slider value={aov} min={20} max={600} step={5} onChange={setAov} color={C.indigo}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>$20</span><span>$600</span>
              </div>
            </Field>

            <Field label={`Monthly Orders: ${monthlyOrders}`}
              hint="Approximately how many orders does this store complete per month?">
              <Slider value={monthlyOrders} min={10} max={2000} step={10} onChange={setOrders} color={C.indigo}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>10</span><span>2,000/mo</span>
              </div>
            </Field>

            <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:10,
              padding:"13px 14px",marginTop:4}}>
              <div style={{fontSize:11,fontWeight:700,color:C.dim,
                textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>
                Estimated Monthly Revenue
              </div>
              <div style={{fontSize:28,fontWeight:800,color:C.text}}>{fmt(monthlyOrders*aov)}</div>
              <div style={{fontSize:12,color:C.dim,marginTop:3}}>
                {monthlyOrders} orders × {fmt(aov)} avg order value
              </div>
            </div>
          </div>
        )}

        {/* ── CART RECOVERY ── */}
        {tab==="cart"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>🛒 Cart Recovery Audit</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              Add something to cart on their site and leave. Whether a recovery email arrives — and how
              good it is — tells you exactly where they sit below.
            </p>
            <Field label={`Cart Abandonment Rate: ${abandonRate}%`}
              hint="Global average runs around 70%. Apparel and jewelry trend higher; pet and grocery trend lower.">
              <Slider value={abandonRate} min={30} max={95} step={1} onChange={setAbandon} color={C.indigo}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>30%</span><span>95%</span>
              </div>
            </Field>
            <Field label="Current abandoned cart flow status" hint="Be honest — most stores you'll audit sit at 'none' or 'partial.'">
              <select value={cartStatus} onChange={e=>setCartStatus(e.target.value)}>
                {CART_STATUS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
            <div style={{background:cart.opportunity>300?C.indigo+"10":C.bg2,
              border:"1px solid "+(cart.opportunity>300?C.indigo:C.border),
              borderRadius:11,padding:"14px 15px",marginTop:4}}>
              <div style={{fontSize:11,fontWeight:700,color:cart.opportunity>300?C.indigo:C.dim,
                textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Cart Recovery Diagnosis</div>
              {[
                ["Monthly checkout starts",fmtI(cart.checkoutStarts),C.muted],
                ["Monthly abandoned checkouts",fmtI(cart.abandoners),C.red],
                ["Currently recovered",fmtI(cart.currentRecovered)+"/mo",C.muted],
                ["Achievable with a full flow",fmtI(cart.achievableRecovered)+"/mo",C.indigo],
                ["Estimated revenue left on the table",fmt(cart.opportunity),C.red],
                ["Fix","Abandoned Cart Recovery flow (Klaviyo)",C.indigo],
                ["Price","$297 – $397/month (Starter)",C.green],
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

        {/* ── WELCOME SERIES ── */}
        {tab==="welcome"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>👋 Welcome Series Audit</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              Sign up for their list. What arrives in the first hour — one generic email, or nothing at
              all — is the single biggest tell of how this flow is set up today.
            </p>
            <Field label={`Monthly New Subscribers: ${monthlySubs}`}
              hint="Estimate how many people join the email list per month — from a popup, checkout opt-in, etc.">
              <Slider value={monthlySubs} min={0} max={1000} step={10} onChange={setSubs} color={C.green}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>0</span><span>1,000/mo</span>
              </div>
            </Field>
            <Field label="Current welcome flow status">
              <select value={welcomeStatus} onChange={e=>setWelcomeStatus(e.target.value)}>
                {WELCOME_STATUS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
            <div style={{background:welcome.opportunity>300?C.green+"10":C.bg2,
              border:"1px solid "+(welcome.opportunity>300?C.green:C.border),
              borderRadius:11,padding:"14px 15px",marginTop:4}}>
              <div style={{fontSize:11,fontWeight:700,color:welcome.opportunity>300?C.green:C.dim,
                textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Welcome Series Diagnosis</div>
              {[
                ["Monthly new subscribers",monthlySubs+"/mo",C.muted],
                ["Current first-purchase conversion",fmtI(welcome.currentConverted)+"/mo",C.muted],
                ["Achievable with a full series",fmtI(welcome.achievableConverted)+"/mo",C.green],
                ["Estimated revenue left uncaptured",fmt(welcome.opportunity),C.red],
                ["Fix","Welcome Series flow (Klaviyo)",C.green],
                ["Price","Bundled in Growth, $500 – $700/month",C.green],
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

        {/* ── POST-PURCHASE ── */}
        {tab==="post"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>📦 Post-Purchase Audit</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              Buy something (or check recent order confirmations). Anything beyond a shipping update means
              this flow already has a head start.
            </p>
            <Field label={`Current 90-Day Repeat Purchase Rate: ${repeatRate}%`}
              hint="Roughly what share of customers buy again within 90 days? Ask, or estimate conservatively.">
              <Slider value={repeatRate} min={0} max={60} step={1} onChange={setRepeatRate} color={C.amber}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>0%</span><span>60%</span>
              </div>
            </Field>
            <Field label="Current post-purchase flow status">
              <select value={postStatus} onChange={e=>setPostStatus(e.target.value)}>
                {POST_STATUS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
            <div style={{background:post.opportunity>300?C.amber+"10":C.bg2,
              border:"1px solid "+(post.opportunity>300?C.amber:C.border),
              borderRadius:11,padding:"14px 15px",marginTop:4}}>
              <div style={{fontSize:11,fontWeight:700,color:post.opportunity>300?C.amber:C.dim,
                textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Post-Purchase Diagnosis</div>
              {[
                ["Current repeat purchase rate",repeatRate+"%",C.muted],
                ["Achievable lift with a full flow",post.gapPts+" points",C.amber],
                ["Incremental repeat orders / month",fmtI(post.gapOrders),C.amber],
                ["Estimated revenue left on the table",fmt(post.opportunity),C.red],
                ["Fix","Post-Purchase flow (Klaviyo)",C.amber],
                ["Price","Bundled in Growth, $500 – $700/month",C.green],
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

        {/* ── WIN-BACK ── */}
        {tab==="winback"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>🔄 Win-Back Audit</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              Ask when they last emailed customers who haven't bought in 60+ days. Most stores you audit
              will say "never" — that's the whole pitch right there.
            </p>
            <Field label={`Total Active Customer List: ${fmtI(totalCustomers)}`}
              hint="Total people who have ever purchased and are still on the list.">
              <input type="number" value={totalCustomers} min={50} max={500000} step={50}
                onChange={e=>setTotalCustomers(+e.target.value)}/>
            </Field>
            <Field label={`Estimated % Lapsed (no purchase in 60+ days): ${lapsedPct}%`}
              hint="If they've never run a win-back flow, this is often 40-60% of the full list.">
              <Slider value={lapsedPct} min={0} max={90} step={1} onChange={setLapsedPct} color={C.pink}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>0%</span><span>90%</span>
              </div>
            </Field>
            <Field label="Current win-back flow status">
              <select value={winbackStatus} onChange={e=>setWinbackStatus(e.target.value)}>
                {WINBACK_STATUS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
            <div style={{background:winback.opportunity>300?C.pink+"10":C.bg2,
              border:"1px solid "+(winback.opportunity>300?C.pink:C.border),
              borderRadius:11,padding:"14px 15px",marginTop:4}}>
              <div style={{fontSize:11,fontWeight:700,color:winback.opportunity>300?C.pink:C.dim,
                textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Win-Back Diagnosis</div>
              {[
                ["Lapsed customers (60+ days)",fmtI(winback.lapsed),C.muted],
                ["Currently re-engaged / month",fmtI(winback.currentRecovered),C.muted],
                ["Achievable with a full sequence",fmtI(winback.achievableRecovered)+"/mo",C.pink],
                ["Estimated revenue left on the table",fmt(winback.opportunity),C.red],
                ["Fix","Win-Back / Re-engagement flow (Klaviyo)",C.pink],
                ["Price","Bundled in Growth, $500 – $700/month",C.green],
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

        {/* ── REVENUE REPORT ── */}
        {tab==="report"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>
              💰 Full Revenue Report — {storeLabel}
            </h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              This is your discovery call asset. Record a Loom of this screen with the prospect's real
              numbers filled in. It closes better than any proposal.
            </p>

            <div style={{background:"linear-gradient(135deg,#0F0814,#F5F0E4)",
              border:"1px solid "+C.red+"40",borderRadius:12,padding:"18px",marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,color:C.red,textTransform:"uppercase",
                letterSpacing:".1em",marginBottom:4}}>Total Estimated Monthly Revenue at Risk</div>
              <div style={{fontSize:"clamp(32px,6vw,48px)",fontWeight:800,color:C.red,marginBottom:8}}>
                {fmt(totalOpportunity)}
              </div>
              <div style={{fontSize:12.5,color:C.dim}}>{fmt(totalOpportunity*12)} per year — if nothing changes</div>
              <div style={{marginTop:16}}>
                <ScoreBar value={cart.opportunity}    max={totalOpportunity||1} color={C.indigo} label="🛒 Cart Recovery Loss"/>
                <ScoreBar value={welcome.opportunity} max={totalOpportunity||1} color={C.green}  label="👋 Welcome Series Loss"/>
                <ScoreBar value={post.opportunity}    max={totalOpportunity||1} color={C.amber}  label="📦 Post-Purchase Loss"/>
                <ScoreBar value={winback.opportunity} max={totalOpportunity||1} color={C.pink}   label="🔄 Win-Back Loss"/>
              </div>
            </div>

            <div style={{background:C.amber+"10",border:"1px solid "+C.amber+"30",
              borderRadius:10,padding:"12px 14px",marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:C.amber,marginBottom:6}}>
                ℹ️ How to Read These Numbers
              </div>
              <p style={{fontSize:12,color:C.muted,margin:0,lineHeight:1.6}}>
                These are modeled estimates built from typical flow-performance ranges, not this store's
                live data. Swap every slider for the real number the moment you have it — from an audit,
                Klaviyo's own analytics, or the prospect directly. Use this to start an honest, directional
                conversation, not as a scientifically verified figure.
              </p>
            </div>

            <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:11,
              padding:"14px 15px",marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
                <div style={{fontSize:11,fontWeight:700,color:C.dim,textTransform:"uppercase",letterSpacing:".08em"}}>
                  Cross-Check: % of Revenue From Email
                </div>
                <span style={{fontSize:11,fontWeight:700,color:attributionBand.color}}>{attributionBand.label}</span>
              </div>
              <p style={{fontSize:11.5,color:C.dim,margin:"0 0 8px",lineHeight:1.5}}>
                Ask directly on the call: "What % of monthly revenue currently comes from email?" Industry
                average sits around 27%. Below 20% signals real underinvestment; 40%+ is top tier.
              </p>
              <Slider value={emailAttribution} min={0} max={50} step={1} onChange={setEmailAttribution} color={attributionBand.color}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.dim,marginTop:4}}>
                <span>0%</span><span style={{fontWeight:700,color:C.text}}>{emailAttribution}%</span><span>50%</span>
              </div>
            </div>

            <div style={{background:topPriority.color+"12",border:"1px solid "+topPriority.color+"35",
              borderRadius:12,padding:"14px 16px",marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,color:topPriority.color,
                textTransform:"uppercase",letterSpacing:".09em",marginBottom:8}}>
                ★ Your #1 Priority — Lead The Conversation With This
              </div>
              <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:4}}>
                {topPriority.icon} {topPriority.name}
              </div>
              <div style={{fontSize:13,color:C.muted,marginBottom:6,lineHeight:1.6}}>
                Biggest single leak: <strong style={{color:C.red}}>{fmt(topPriority.loss)}/month</strong> estimated.
                Service price: <strong style={{color:C.green}}>{topPriority.price}</strong>.
              </div>
              <div style={{fontSize:12,color:topPriority.color,fontWeight:600}}>
                This is which gap to open the conversation with — not the build order. Once they're a
                client, still build Abandoned Cart first regardless: it's the fastest, most provable
                win, and it banks trust before you pitch the rest.
              </div>
            </div>

            <div style={{fontSize:12,fontWeight:700,color:C.dim,textTransform:"uppercase",
              letterSpacing:".08em",marginBottom:10}}>All 4 Flows — Ranked by Impact</div>
            {priorities.map((p,i)=>(
              <ServiceCard key={p.id} {...p} isTop={i===0}/>
            ))}

            <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:12,
              padding:"14px 16px",marginTop:8}}>
              <div style={{fontSize:11,fontWeight:700,color:C.dim,textTransform:"uppercase",
                letterSpacing:".08em",marginBottom:12}}>
                Which Package Fits — Based on This Store's Gaps
              </div>
              {PACKAGE_TIERS.map(t=>{
                const isRec = t.id===recommendedTier;
                return (
                  <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                    padding:"11px 12px",marginBottom:8,borderRadius:9,
                    background:isRec?t.color+"14":"transparent",
                    border:"1px solid "+(isRec?t.color:C.border)}}>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
                        <span style={{fontSize:13,fontWeight:700,color:C.text}}>{t.name}</span>
                        {isRec&&<span style={{fontSize:9.5,fontWeight:700,color:t.color,background:t.color+"20",
                          borderRadius:20,padding:"1px 8px"}}>RECOMMENDED HERE</span>}
                      </div>
                      <div style={{fontSize:11.5,color:C.dim}}>{t.desc}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:14,fontWeight:800,color:t.color}}>{t.price}</div>
                      <div style={{fontSize:10.5,color:C.dim}}>{t.value}</div>
                    </div>
                  </div>
                );
              })}
              <p style={{fontSize:11.5,color:C.dim,margin:"6px 0 0",lineHeight:1.6}}>
                Most students still open with Starter regardless, prove results in 2–3 months, then
                upsell — this just tells you which ceiling this specific store can realistically support.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
