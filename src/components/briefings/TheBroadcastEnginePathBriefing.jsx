import { useState, useMemo } from "react";

const C = {
  bg:"#F5F0E4", bg2:"#F8F5EE", bg3:"#FBF8F1", border:"#FBF8F1",
  text:"#201A16", muted:"#6E6459", dim:"#6E6459",
  indigo:"#7A5A00", green:"#0D7A5F", amber:"#C99A3B",
  pink:"#8B2E1F", red:"#8B0000", purple:"#7A5A00", teal:"#0D7A5F", orange:"#7A5A00",
};

const QUICK_FACTS = [
  {value:"$28B+", label:"Global podcast industry value, 2026", color:C.green},
  {value:"~650M", label:"Monthly global listeners, still climbing", color:C.indigo},
  {value:"4.5M+", label:"Podcasts registered worldwide", color:C.amber},
  {value:"#1", label:"YouTube's current rank as a podcast platform", color:C.pink},
];

const HIGHS = [
  {icon:"📈", tag:"Market", color:C.green,
   title:"A real, still-growing market — not a fad",
   why:"Global podcast ad revenue passed roughly $4.46 billion in 2025, and industry value estimates for 2026 run from about $28 billion to $40 billion depending on methodology. Global monthly listenership sits near 650 million and is still climbing around 7% a year, a growth line that's held since roughly 2019.",
   watch:"This is steady, compounding growth, not a gold rush — closer to how streaming video matured than to a viral moment. Expect a market that keeps getting a little bigger every year, not an overnight category explosion."},
  {icon:"🎥", tag:"Timing", color:C.indigo,
   title:"The YouTube shift is a fresh, provable gap",
   why:"YouTube has passed Spotify and Apple Podcasts combined to become the single most-used podcast platform in the world. Plenty of shows with real engagement on audio platforms still have a weak or missing YouTube presence — a specific, checkable gap you can point to by name in outreach.",
   watch:"This gap won't stay open forever. Once it's common knowledge that a show \"should\" be on YouTube, pointing that out stops being news to hosts — the value shifts from spotting the gap to actually closing it well."},
  {icon:"🔒", tag:"Positioning", color:C.purple,
   title:"Genre-lock removes your competition inside DFS",
   why:"Each beneficiary on this path locks to one of 8 genres, so you're never pitching the same show as a fellow student in the program.",
   watch:"This only manages competition inside DFS. It says nothing about the much larger outside market — see Competitiveness for that half of the picture."},
  {icon:"🎧", tag:"Sales Motion", color:C.teal,
   title:"You can prove the work before anyone has to trust you",
   why:"A free sample clip is something a host can listen to and judge directly — a lower trust barrier for a first yes than a pitch that asks someone to imagine a system working for them.",
   watch:"This cuts both ways: the sample has to actually be good. See The Lows on the trained-ear skill this depends on."},
  {icon:"🆓", tag:"Cost To Start", color:C.amber,
   title:"Genuinely free to start",
   why:"Audacity is unlimited and free, and CapCut's free tier covers social clips — the entire core skillset. Even the paid AI upgrades competitors lean on, like Descript or Auphonic, run only about $10-50 a month.",
   watch:"A low barrier for you is a low barrier for everyone else too. See Competitiveness for what that means for how crowded the entry level already is."},
  {icon:"🪜", tag:"Pricing", color:C.pink,
   title:"A real, demonstrated upsell ladder",
   why:"Starter, Growth, and Full Production roughly track what the wider market already charges — entry-level managed editing around $500-1,000 a month, full-service agencies $1,500-3,000. The pricing isn't invented; it mirrors a real market.",
   watch:"The top of that ladder is real money over a year, but only if a client sticks around long enough to climb it. See the podfading point in The Lows."},
];

const LOWS = [
  {icon:"⏱️", tag:"Structural", color:C.red,
   title:"This is hours worked, not a system built once",
   why:"A typical 45-60 minute episode takes roughly 1-3 hours to edit by hand — every month, for every client, indefinitely. Unlike an automation-based system that's configured once and mostly runs itself, your client capacity is capped by your own weekly hours until you eventually hire or train help.",
   silver:"It also means real skill compounds. Editing the same show's format gets faster with repetition, and the craft itself is genuinely yours, not a vendor's."},
  {icon:"🤖", tag:"Tech Risk", color:C.orange,
   title:"AI already handles the base layer",
   why:"Descript, Auphonic, and Adobe Podcast Enhance now do mechanical cleanup — noise reduction, leveling, filler-word removal — for $10-50 a month, self-serve. What they can't do yet is editorial judgment: deciding which five minutes of an hour-long interview earn their place, or which fifteen seconds makes the best clip.",
   silver:"That means your real value has to live in judgment and consistency, not the mechanical task. It's a genuine position to hold — but one you have to consciously earn, not one the retainer price defends by itself."},
  {icon:"🥊", tag:"Competition", color:C.red,
   title:"You are not entering a blue ocean",
   why:"Real, structured competition already exists at every price point you'll compete in — Fiverr and Upwork freelancers, independent boutique editors, and full production agencies with portfolios and referral networks already built.",
   silver:"Genre specialization and warm, relationship-based outreach — instead of one more anonymous marketplace listing — is a real, if modest, wedge. See Competitiveness for exactly where it's sharpest."},
  {icon:"👻", tag:"Churn Risk", color:C.amber,
   title:"A slice of your leads will \"podfade\"",
   why:"Of the 4.5 million-plus podcasts registered worldwide, only a fraction are genuinely active and posting consistently — the rest have gone quiet, an industry pattern sometimes nicknamed podfading. A hot lead can go dark before you ever hear back, and a signed client can vanish a few months in for reasons that have nothing to do with your work.",
   silver:"This is exactly why the Show CRM's consistency and engagement signals matter — they're filtering for durability, not just current sound quality."},
  {icon:"👂", tag:"Skill Dependency", color:C.purple,
   title:"Quality depends on a trained ear, not just following steps",
   why:"The difference between a professional-sounding edit and an amateur one is mostly judgment — pacing, what silence to leave in, how heavy a hand to use — and real industry guides describe this as a skill built through deliberate practice, not a checklist you run once.",
   silver:"That's also what makes it genuinely hard to fake. A real demo reel carries more weight here than in more templated systems."},
  {icon:"🎢", tag:"Income Pattern", color:C.indigo,
   title:"Freelance rhythm, not a steady paycheck",
   why:"Inconsistent workload and irregular client timing are among the most commonly cited downsides of freelance editing work generally — a quiet month can follow a busy one, especially early on.",
   silver:"Recurring monthly retainers, rather than one-off gigs, are specifically meant to smooth this out once you're running 3-4 clients at once."},
];

const COMPETITIVE_TIERS = [
  {tier:"AI Self-Serve Tools", icon:"🤖", color:C.orange, price:"$10-50/month",
   examples:"Descript, Auphonic, Adobe Podcast Enhance",
   note:"Handles mechanical cleanup well. No editorial judgment, no relationship, no accountability if a deadline slips."},
  {tier:"Freelancer Marketplaces", icon:"🛒", color:C.amber, price:"$25-150/episode",
   examples:"Fiverr, Upwork, and similar",
   note:"Enormous quality variance and mostly price-driven buyers. Genuinely excellent editors exist here, indistinguishable from the rest until a client has already paid."},
  {tier:"Boutique Solo Editors", icon:"🎚️", color:C.teal, price:"$75-250/episode",
   examples:"Independent editors with their own client roster",
   note:"Often the best value in the market when a host finds a good one — but hard to evaluate from the outside, which is exactly where a strong sample and genre fit can win."},
  {tier:"Full-Service Agencies", icon:"🏢", color:C.indigo, price:"$500-$3,000+/month",
   examples:"Established production houses with process and bench depth",
   note:"Backup capacity and structure, at a higher cost and with less of a personal relationship with any single editor."},
];

const COMPARE_ROWS = [
  {label:"Core work model", broadcast:"Hands-on production, redone every single episode", other:"Automation configured once, then mostly runs itself"},
  {label:"Monthly price range", broadcast:"$500 – $1,800 per client", other:"$75 – $600 per client"},
  {label:"Proof before the sale", broadcast:"A finished sample clip a prospect can hear immediately", other:"A working demo or Loom of a system — a step more abstract"},
  {label:"What caps your capacity", broadcast:"Your own hours in a week", other:"How many automations you can configure and maintain"},
  {label:"Client durability risk", broadcast:"Real — shows regularly go quiet (\"podfading\")", other:"Lower — agencies and facilities are ongoing operating businesses"},
  {label:"Core skill required", broadcast:"A trained creative and technical ear", other:"Systems thinking plus warm, in-person sales relationships"},
  {label:"Outside market competition", broadcast:"Established and structured — agencies, marketplaces, and AI tools all already compete here", other:"Largely unaddressed by any dedicated competitor"},
];

const FIT_QUESTIONS = [
  {id:"handson", label:"Doing hands-on creative work every week, indefinitely",
   options:[
     {label:"Genuinely enjoy it — that's the appeal, not a cost", points:2},
     {label:"Fine with it, as long as it pays reasonably well", points:1},
     {label:"I'd rather build a system once and let it run", points:0},
   ]},
  {id:"income", label:"Living with some months quieter than others",
   options:[
     {label:"Comfortable — I can budget around it", points:2},
     {label:"Manageable once I have 3-4 steady clients", points:1},
     {label:"I'd strongly prefer predictable income", points:0},
   ]},
  {id:"ear", label:"Having, or wanting to build, a trained editing ear",
   options:[
     {label:"Yes — genuinely excited to develop this", points:2},
     {label:"Somewhat — I'd need real practice time first", points:1},
     {label:"Not really my strength or interest", points:0},
   ]},
  {id:"competition", label:"Working in a market with real competitors already in it",
   options:[
     {label:"Fine — I'll out-execute on genre fit and relationships", points:2},
     {label:"Would prefer a more wide-open opportunity", points:1},
     {label:"Existing competition makes me genuinely hesitant", points:0},
   ]},
  {id:"churn", label:"Clients who may quietly stop publishing rather than formally cancel",
   options:[
     {label:"Fine — I can manage that kind of churn", points:2},
     {label:"Workable, but I'd want a bigger pipeline to buffer it", points:1},
     {label:"I'd rather have more institutional, stable clients", points:0},
   ]},
];

/* ============================================================
   SHARED COMPONENTS
   ============================================================ */

function Chevron({open}) {
  return (
    <span style={{color:C.dim,fontSize:19,display:"inline-block",
      transform:open?"rotate(90deg)":"none",transition:"transform .2s",flexShrink:0}}>›</span>
  );
}

function SLabel({text,color}) {
  return (
    <div style={{fontSize:10,fontWeight:700,color,textTransform:"uppercase",
      letterSpacing:".08em",marginBottom:7}}>{text}</div>
  );
}

function StatBlock({value,label,color}) {
  return (
    <div style={{background:color+"10",border:"1px solid "+color+"35",borderRadius:12,
      padding:"14px 12px",textAlign:"center",flex:1,minWidth:130}}>
      <div style={{fontSize:"clamp(18px,4vw,24px)",fontWeight:800,color,lineHeight:1.1}}>{value}</div>
      <div style={{fontSize:11,color:C.muted,marginTop:6,fontWeight:600,lineHeight:1.4}}>{label}</div>
    </div>
  );
}

function Detail({label,text,color}) {
  return (
    <div style={{marginTop:12}}>
      <div style={{fontSize:10,fontWeight:700,color,textTransform:"uppercase",
        letterSpacing:".07em",marginBottom:5}}>{label}</div>
      <p style={{fontSize:13,color:C.muted,margin:0,lineHeight:1.65,
        borderLeft:"2px solid "+color+"40",paddingLeft:10}}>{text}</p>
    </div>
  );
}

function ExpandCard({icon,title,tag,color,isOpen,onToggle,children}) {
  return (
    <div onClick={onToggle}
      style={{background:isOpen?"#FBF8F1":C.bg2,border:"1px solid "+(isOpen?color:C.border),
        borderRadius:12,cursor:"pointer",overflow:"hidden"}}>
      <div style={{padding:"13px 15px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:36,height:36,borderRadius:9,background:color+"18",
          border:"1px solid "+color+"35",display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:18,flexShrink:0}}>{icon}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,fontSize:14,color:C.text,lineHeight:1.35}}>{title}</div>
          {tag&&<div style={{fontSize:10.5,color,marginTop:2,fontWeight:600,
            textTransform:"uppercase",letterSpacing:".04em"}}>{tag}</div>}
        </div>
        <Chevron open={isOpen}/>
      </div>
      {isOpen&&(
        <div style={{padding:"0 15px 16px",borderTop:"1px solid "+C.border}}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PATH FIT CHECK
   ============================================================ */

function PathFitCheck() {
  const [answers,setAnswers] = useState({});
  const select = (id,idx) => setAnswers(p=>({...p,[id]:idx}));

  const total = useMemo(()=>FIT_QUESTIONS.reduce((sum,q)=>{
    const idx = answers[q.id];
    return idx===undefined ? sum : sum+q.options[idx].points;
  },0),[answers]);
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount===FIT_QUESTIONS.length;
  const maxPoints = FIT_QUESTIONS.length*2;

  const band = total>=8
    ? {label:"Strong match", color:C.green,
       text:"The daily reality of this path — hands-on production, genre depth, real competition to out-execute — lines up well with what you're looking for."}
    : total>=4
    ? {label:"Workable, with eyes open", color:C.amber,
       text:"This can work, but re-read The Lows once more before you commit. A few of these realities aren't a natural fit yet, and that's better to know now than in month two."}
    : {label:"Worth comparing carefully", color:C.red,
       text:"Nothing here disqualifies you, but the daily shape of this path may sit against the grain of what you actually want. Worth genuinely weighing it against a more automation-based system before you lock it in."};

  return (
    <div>
      <div style={{background:"#F5F0E4",border:"1px solid "+(allAnswered?band.color+"40":C.border),
        borderRadius:13,padding:"16px 16px 14px",marginBottom:18}}>
        {allAnswered?(
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
              marginBottom:10,flexWrap:"wrap",gap:8}}>
              <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                <span style={{fontSize:32,fontWeight:800,color:band.color,lineHeight:1}}>{total}</span>
                <span style={{fontSize:12,color:C.dim}}>/ {maxPoints}</span>
              </div>
              <div style={{background:band.color+"18",border:"1px solid "+band.color+"45",borderRadius:999,
                padding:"5px 13px",fontSize:13,fontWeight:700,color:band.color,whiteSpace:"nowrap"}}>
                {band.label}
              </div>
            </div>
            <p style={{fontSize:12.5,color:C.muted,margin:0,lineHeight:1.55}}>{band.text}</p>
          </>
        ):(
          <p style={{fontSize:12.5,color:C.dim,margin:0,lineHeight:1.6}}>
            Answer the {FIT_QUESTIONS.length} questions below honestly — {answeredCount} of {FIT_QUESTIONS.length} so far.
            This isn't a score anyone else sees; it's just for you.
          </p>
        )}
      </div>

      {FIT_QUESTIONS.map(q=>(
        <div key={q.id} style={{marginBottom:16}}>
          <SLabel text={q.label} color={C.teal}/>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {q.options.map((o,idx)=>(
              <button key={idx} onClick={()=>select(q.id,idx)} style={{
                display:"flex",alignItems:"center",gap:9,textAlign:"left",
                background:answers[q.id]===idx?C.teal+"14":C.bg2,
                border:"1px solid "+(answers[q.id]===idx?C.teal+"60":C.border),
                borderRadius:9,padding:"9px 11px",cursor:"pointer",fontFamily:"inherit"}}>
                <span style={{width:15,height:15,borderRadius:"50%",flexShrink:0,
                  border:"2px solid "+(answers[q.id]===idx?C.teal:"#D9CFBB"),
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {answers[q.id]===idx&&<span style={{width:7,height:7,borderRadius:"50%",background:C.teal}}/>}
                </span>
                <span style={{flex:1,fontSize:12.5,
                  color:answers[q.id]===idx?C.text:C.muted,lineHeight:1.4}}>{o.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   MAIN
   ============================================================ */

export default function TheBroadcastEnginePathBriefing() {
  const [tab,setTab] = useState("overview");
  const [openHigh,setOpenHigh] = useState(null);
  const [openLow,setOpenLow] = useState(null);
  const [openTier,setOpenTier] = useState(null);

  const TABS = [
    {id:"overview", label:"🧭 Overview"},
    {id:"highs", label:"✅ The Highs"},
    {id:"lows", label:"⚠️ The Lows"},
    {id:"durability", label:"📈 Durability & Volatility"},
    {id:"competitiveness", label:"⚔️ Competitiveness"},
    {id:"compare", label:"🆚 vs. Other Systems"},
    {id:"fit", label:"🎯 Is This Your Path?"},
  ];

  return (
    <div style={{fontFamily:"'Inter',system-ui,-apple-system,sans-serif",
      background:C.bg,minHeight:"100vh",color:C.text}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        .tab-btn:hover{color:#C99A3B!important;}
      `}</style>

      {/* HEADER */}
      <div style={{background:"linear-gradient(160deg,#F8F5EE 0%,#F8F5EE 60%,#F5F0E4 100%)",
        padding:"22px 16px 18px",borderBottom:"1px solid #FBF8F1"}}>
        <div style={{maxWidth:880,margin:"0 auto"}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",color:C.green,
            textTransform:"uppercase",marginBottom:7,display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:C.green,
              boxShadow:"0 0 6px "+C.green,display:"inline-block"}}/>
            DFS Path Briefing · The Broadcast Engine
          </div>
          <h1 style={{margin:"0 0 7px",fontSize:"clamp(21px,4.5vw,33px)",fontWeight:800,
            lineHeight:1.15,background:"linear-gradient(135deg,#201A16 30%,#C99A3B 100%)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            Is The Broadcast Engine Your Path?
          </h1>
          <p style={{margin:"0 0 14px",fontSize:12.5,color:"#D9CFBB",maxWidth:600,lineHeight:1.65}}>
            An honest briefing on the podcast production system — the highs, the lows, how durable the
            demand really is, and how it stacks up against the market and the other systems in front of
            you. Built to inform this choice, not sell it to you.
          </p>
          <div style={{background:"#F5F0E4",border:"1px solid "+C.green+"30",borderRadius:10,
            padding:"11px 14px",marginBottom:14}}>
            <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.6}}>
              <strong style={{color:C.green}}>How to use this:</strong> this is a one-time choice, so
              it's worth ten real minutes before you commit. Read The Highs and The Lows in full — both,
              not just the flattering half — before you land on the Fit Check at the end.
            </p>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {QUICK_FACTS.map((f,i)=>(
              <StatBlock key={i} value={f.value} label={f.label} color={f.color}/>
            ))}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{background:"#F8F5EE",borderBottom:"1px solid #FBF8F1",position:"sticky",top:0,zIndex:20}}>
        <div style={{maxWidth:880,margin:"0 auto",display:"flex",padding:"0 8px",overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className="tab-btn" style={{
              background:"transparent",border:"none",
              borderBottom:tab===t.id?"2px solid "+C.indigo:"2px solid transparent",
              color:tab===t.id?"#C99A3B":"#D9CFBB",
              padding:"12px 13px",fontSize:12.5,fontWeight:tab===t.id?600:500,
              cursor:"pointer",whiteSpace:"nowrap",transition:"color .15s",fontFamily:"inherit"}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:880,margin:"0 auto",padding:"18px 13px 60px"}}>

        {/* OVERVIEW */}
        {tab==="overview"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>What This Actually Is</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 16px",lineHeight:1.6}}>
              Editing episodes, writing show notes, cutting social clips, and publishing consistently for
              podcast hosts who don't have time to do it themselves — sold as a monthly retainer. Built on
              production and editing skill, not automation.
            </p>

            <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:12,
              padding:"15px 16px",marginBottom:16}}>
              <SLabel text="Who This Path Actually Rewards" color={C.teal}/>
              <p style={{fontSize:13,color:C.muted,margin:0,lineHeight:1.65}}>
                Every DFS system rewards a different kind of person. This one is the natural home for
                someone with a creative or technical production instinct — an ear for pacing, patience for
                repetitive craft work, and comfort doing real hands-on production every week rather than
                configuring a system once. If that's not you, that's useful to know now, not five weeks in.
              </p>
            </div>

            <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:12,
              padding:"15px 16px",marginBottom:16}}>
              <SLabel text="What You're Actually Selling" color={C.indigo}/>
              <p style={{fontSize:13,color:C.muted,margin:0,lineHeight:1.65}}>
                Four components, sold as a ladder: full episode editing, show notes and timestamps, social
                clip creation, and publishing and distribution — packaged as Starter ($500-$700/month),
                Growth ($800-$1,200/month), and Full Production ($1,300-$1,800/month). See vs. Other
                Systems for how that ladder compares to the rest of DFS.
              </p>
            </div>

            <div style={{background:C.amber+"10",border:"1px solid "+C.amber+"30",borderRadius:10,
              padding:"13px 14px"}}>
              <div style={{fontSize:11,fontWeight:700,color:C.amber,marginBottom:6}}>The One-Line Honest Take</div>
              <p style={{fontSize:12.5,color:C.muted,margin:0,lineHeight:1.6}}>
                This is the DFS path that looks most like a real freelance service business — genuine
                hours of craft work, dressed up as a retainer — rather than a system you build once and
                let run. That's neither good nor bad by itself. It just changes what kind of week you're
                actually signing up for.
              </p>
            </div>
          </div>
        )}

        {/* HIGHS */}
        {tab==="highs"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>✅ The Highs</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 16px",lineHeight:1.6}}>
              Tap a card for the evidence behind it — and the catch worth keeping in mind alongside it.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {HIGHS.map((h,i)=>(
                <ExpandCard key={i} icon={h.icon} title={h.title} tag={h.tag} color={h.color}
                  isOpen={openHigh===i} onToggle={()=>setOpenHigh(openHigh===i?null:i)}>
                  <Detail label="Why This Is True" text={h.why} color={h.color}/>
                  <Detail label="Keep In Mind" text={h.watch} color={C.dim}/>
                </ExpandCard>
              ))}
            </div>
          </div>
        )}

        {/* LOWS */}
        {tab==="lows"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>⚠️ The Lows</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 16px",lineHeight:1.6}}>
              Genuine downsides, stated plainly — plus the honest silver lining that comes with each one.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {LOWS.map((l,i)=>(
                <ExpandCard key={i} icon={l.icon} title={l.title} tag={l.tag} color={l.color}
                  isOpen={openLow===i} onToggle={()=>setOpenLow(openLow===i?null:i)}>
                  <Detail label="Why This Is Real" text={l.why} color={l.color}/>
                  <Detail label="Silver Lining" text={l.silver} color={C.green}/>
                </ExpandCard>
              ))}
            </div>
          </div>
        )}

        {/* DURABILITY */}
        {tab==="durability"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>📈 Durability & Market Volatility</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 16px",lineHeight:1.6}}>
              Two separate questions: is podcasting itself durable, and is this specific service durable
              within it? The honest answer is yes to the first, and "durable, with real caveats" to the
              second.
            </p>

            <div style={{background:"linear-gradient(135deg,#0A1610,#F5F0E4)",border:"1px solid "+C.green+"35",
              borderRadius:12,padding:"16px",marginBottom:16}}>
              <SLabel text="The Medium Itself Is Durable" color={C.green}/>
              <p style={{fontSize:14,color:C.text,lineHeight:1.7,margin:0}}>
                Global podcast listenership has climbed roughly every year since 2019 and is forecast to
                keep growing toward <strong style={{color:C.green}}>770 million listeners by 2030</strong>.
                This is secular, compounding growth, not a pandemic-era spike that's since faded.
              </p>
            </div>

            <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:11,
              padding:"14px 15px",marginBottom:16}}>
              <SLabel text="What Actually Funds This Business" color={C.indigo}/>
              <p style={{fontSize:13,color:C.muted,margin:0,lineHeight:1.65}}>
                US podcast ad spend reached roughly $2.9 billion in 2025 with continued double-digit
                growth — real money that gives hosts, especially monetized ones, an actual budget line for
                production quality. That budget is the reason this service has a market at all.
              </p>
            </div>

            <div style={{fontSize:12,fontWeight:700,color:C.dim,textTransform:"uppercase",
              letterSpacing:".08em",marginBottom:10}}>Two Real Volatility Risks</div>

            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:16}}>
              <div style={{background:C.orange+"10",border:"1px solid "+C.orange+"30",borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:12.5,fontWeight:700,color:C.orange,marginBottom:5}}>🤖 AI keeps compressing the base layer</div>
                <p style={{fontSize:12.5,color:C.muted,margin:0,lineHeight:1.6}}>
                  Self-serve tools already handle mechanical cleanup for $10-50 a month. As they improve
                  further, the defensible part of this business keeps having to move further up into
                  judgment and taste — not the raw editing task itself.
                </p>
              </div>
              <div style={{background:C.amber+"10",border:"1px solid "+C.amber+"30",borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:12.5,fontWeight:700,color:C.amber,marginBottom:5}}>📡 Platform shifts redefine "growth" overnight</div>
                <p style={{fontSize:12.5,color:C.muted,margin:0,lineHeight:1.6}}>
                  The YouTube shift is the clearest recent example — audio-only production is already
                  behind where listener attention has moved. Whatever platform matters most could look
                  different again in a few years, and deliverables have to move with it.
                </p>
              </div>
            </div>

            <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:10,padding:"13px 14px"}}>
              <SLabel text="Compared To A 'Build Once' System" color={C.dim}/>
              <p style={{fontSize:12.5,color:C.muted,margin:0,lineHeight:1.6}}>
                Because the core deliverable here — the edit itself — has to be redone by hand every month
                for every client, this path's income durability looks more like traditional freelance
                services than the more software-like durability of an automation-based system elsewhere in
                DFS. Neither is wrong; they just age differently.
              </p>
            </div>
          </div>
        )}

        {/* COMPETITIVENESS */}
        {tab==="competitiveness"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>⚔️ Competitiveness</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 16px",lineHeight:1.6}}>
              A real, structured market already exists at every price point below. Tap a tier for what it
              actually offers.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:18}}>
              {COMPETITIVE_TIERS.map((t,i)=>(
                <ExpandCard key={i} icon={t.icon} title={t.tier} tag={t.price} color={t.color}
                  isOpen={openTier===i} onToggle={()=>setOpenTier(openTier===i?null:i)}>
                  <Detail label="Examples" text={t.examples} color={t.color}/>
                  <Detail label="What It Actually Offers" text={t.note} color={C.dim}/>
                </ExpandCard>
              ))}
            </div>

            <div style={{background:"linear-gradient(135deg,#0F0814,#F5F0E4)",border:"1px solid "+C.teal+"35",
              borderRadius:12,padding:"16px"}}>
              <SLabel text="Where The Real Wedge Is" color={C.teal}/>
              <p style={{fontSize:13,color:C.text,margin:"0 0 10px",lineHeight:1.65}}>
                Chart positions roughly <strong style={{color:C.teal}}>30 through 150</strong> in a genre
                category are the sweet spot — proven engagement, but rarely already locked up by an agency
                chasing the visible top 10. Layer genre specialization and warm, personalized outreach —
                instead of one more anonymous marketplace listing — on top of that, and there's a real
                opening here.
              </p>
              <p style={{fontSize:12,color:C.dim,margin:0,lineHeight:1.6}}>
                That's an opening, not an empty field. Go in expecting to out-execute specific competitors,
                not to find no competitors at all.
              </p>
            </div>
          </div>
        )}

        {/* COMPARE */}
        {tab==="compare"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>🆚 vs. Other DFS Systems</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 16px",lineHeight:1.6}}>
              A structural comparison against an automation-based DFS system, using that system's own real
              materials to work from — not a claim about all seven paths, only the honest shape of this one
              against that one.
            </p>

            <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:12,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"1.1fr 1fr 1fr",background:"#0A1120",
                borderBottom:"1px solid "+C.border,padding:"10px 12px",gap:8}}>
                <span></span>
                <span style={{fontSize:10.5,fontWeight:700,color:C.indigo,textTransform:"uppercase",letterSpacing:".05em"}}>Broadcast Engine</span>
                <span style={{fontSize:10.5,fontWeight:700,color:C.teal,textTransform:"uppercase",letterSpacing:".05em"}}>Automation-Based System</span>
              </div>
              {COMPARE_ROWS.map((r,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"1.1fr 1fr 1fr",padding:"11px 12px",gap:8,
                  borderBottom:i<COMPARE_ROWS.length-1?"1px solid #10192B":"none"}}>
                  <span style={{fontSize:12,fontWeight:600,color:C.muted,lineHeight:1.4}}>{r.label}</span>
                  <span style={{fontSize:12,color:C.text,lineHeight:1.45}}>{r.broadcast}</span>
                  <span style={{fontSize:12,color:C.text,lineHeight:1.45}}>{r.other}</span>
                </div>
              ))}
            </div>

            <p style={{fontSize:11.5,color:C.dim,margin:"12px 0 0",lineHeight:1.6}}>
              Neither model is strictly better. One trades a lower price ceiling for lower weekly hours and
              a more durable client base; the other trades real weekly production work for a higher price
              ceiling and a more provable first demo. Which one fits depends on which week you'd rather
              have.
            </p>
          </div>
        )}

        {/* FIT */}
        {tab==="fit"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>🎯 Is This Your Path?</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 18px",lineHeight:1.6}}>
              Five honest questions. There's no passing or failing score — only a read on how well this
              path's actual daily reality lines up with what you want.
            </p>
            <PathFitCheck/>

            <div style={{marginTop:20,background:"#F5F0E4",border:"1px solid "+C.border,borderRadius:12,padding:"16px"}}>
              <SLabel text="The Bottom Line" color={C.amber}/>
              <p style={{fontSize:13,color:C.muted,margin:0,lineHeight:1.7}}>
                The Broadcast Engine is a real, growing market with genuine free tools to start and a
                pricing ladder that mirrors what the wider market already pays. It's also the DFS path most
                like traditional freelance work — real hours, real competition already in the market, and
                clients who can quietly go quiet on you. None of that makes it a bad choice. It makes it a
                specific one, best suited to someone who actually wants to spend their weeks producing, not
                just selling a system that runs itself.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
