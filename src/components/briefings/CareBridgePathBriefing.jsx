import { useState, useMemo } from "react";

const HIGHS = [
  {icon:"🧓", color:"#0D7A5F", name:"An Unusually Strong Demographic Tailwind",
   body:"Roughly 10,000 Americans turn 65 every single day, a pace that continues through the end of this decade. By 2030, close to one in five Americans will be 65 or older. This is about as close to a structural, non-cyclical demand curve as exists in any small-business market — it doesn't wait on consumer confidence, interest rates, or a trend cycle to stay true.",
   stat:"U.S. home care market: ~$173.6B in 2026, growing 4.1%/year (IBISWorld); global home healthcare ~$458B, projected 10.5% CAGR through 2033."},
  {icon:"🏠", color:"#7A5A00", name:"The Underlying Preference Points the Same Direction",
   body:"Roughly 87-90% of seniors say they'd rather stay in their own home than move into a facility. That preference is exactly why home care specifically — not senior care broadly — is one of the fastest-growing segments of this market, and it's the segment this system is built around.",
   stat:"Multiple industry surveys (Statista, NCH Stats, Definitive Healthcare) converge on the same 87-90% range."},
  {icon:"❤️", color:"#8B2E1F", name:"A Genuinely Universal Warm-Network Advantage",
   body:"Nearly everyone has a family story somewhere close to this — an aging parent, a grandparent, an extended family member who needed care. That gives this path one of the strongest personal-connection advantages of any doorway into this world, arguably even more universal than the Ministry system's version of the same principle, since it doesn't depend on a shared faith community.",
   stat:null},
  {icon:"📞", color:"#C99A3B", name:"A Gap You Can Prove, Not Just Claim",
   body:"The mystery-shopper audit this system teaches is one of the most concrete pieces of evidence available in any prospecting approach — you're not asking an owner to imagine a problem, you're calling their business yourself, timing exactly how long it takes them to respond, and showing them the number. Few pitches anywhere start from evidence that specific.",
   stat:null},
  {icon:"🩺", color:"#0D7A5F", name:"Work That's Meaningful, Not Just Profitable",
   body:"This exists to help families in a moment of real need respond and connect faster — not to manufacture urgency around a discretionary purchase. For a student who wants work that feels meaningful alongside being paid, that's a real, not incidental, advantage.",
   stat:null},
];

const LOWS = [
  {icon:"🏢", color:"#8B0000", name:"Real, Named Competition Already Exists",
   body:"The framing that this is \"a market virtually no digital agency serves\" is optimistic. Purpose-built home care CRM and intake platforms — WellSky, AxisCare, AlayaCare, Aaniie, Axxess, CareFunnels, and others — are real, funded, and actively selling into agencies today. This is not an empty field, and a beneficiary should know that going in rather than discovering it on a discovery call.",
   stat:"At least half a dozen established, purpose-built platforms actively market to this exact buyer as of 2026."},
  {icon:"🤖", color:"#8B0000", name:"AI-Powered Intake Tools Are the Fastest-Moving Threat",
   body:"AI call-summarization and auto-response platforms — Sage Care is one current example — are the newest, fastest-growing category in this space, aimed at the exact same \"the phone doesn't get answered fast enough\" problem. The free-tools, Zapier-based approach this system teaches is genuinely effective today, but it's worth watching how quickly cheap, self-service AI tools compress that advantage over the next few years.",
   stat:null},
  {icon:"😔", color:"#C99A3B", name:"Emotionally Heavier Than Most Alternative Paths",
   body:"Memory care, hospice, and crisis-moment home care conversations carry real emotional weight. That isn't a fit for every personality, and pretending otherwise wouldn't be honest. A beneficiary who finds this kind of subject matter draining rather than motivating should weigh that seriously before committing their one shot at a path.",
   stat:null},
  {icon:"⏱️", color:"#C99A3B", name:"A Genuinely Slower, More Local Sales Motion",
   body:"Owner-operators in this industry are chronically time-starved — well over half of agencies report ongoing caregiver shortages, and a large share of new caregiver hires leave within the first few months. That's exactly the chaos this system is built to fix, but it also means some of the best-fit prospects are too underwater in the moment to take a meeting the week you reach out. This system leans on in-person visits as the strongest approach, which also makes it inherently local and slower to scale than a fully remote path.",
   stat:"Over half of home care agencies report ongoing caregiver shortages; industry turnover among new hires runs very high in year one."},
  {icon:"🚧", color:"#C99A3B", name:"A Real, Ongoing Compliance Line — Not a One-Time Checkbox",
   body:"The core playbook already draws this boundary sensibly: logistics and communication, never medical records. But it's a live judgment call in every single agency conversation, not something decided once and forgotten. A beneficiary who isn't comfortable holding that line consistently, conversation after conversation, probably shouldn't run this system without close guidance early on.",
   stat:null},
  {icon:"💵", color:"#7A5A00", name:"A Lower Per-Client Ceiling Than Some Other Paths",
   body:"The Full Care System package tops out around $7,200/year per agency — a strong, real number, but smaller than what some other doorways into this world can command from a single client. Reaching a comparable total income here takes more clients, though the tradeoff is genuinely less crowded prospecting per client than a hyper-competitive niche would offer.",
   stat:null},
];

const STANDOUT = [
  {icon:"🌍", color:"#0D7A5F", name:"The Warm-Network Advantage Travels Almost Anywhere",
   body:"Because nearly every family, everywhere, eventually touches elder care in some form, this path doesn't depend on the specific city, culture, or language a beneficiary starts in the way some other doorways do. The starting relationship — a parent, a grandparent, a family friend — is close to universal."},
  {icon:"🔬", color:"#7A5A00", name:"Proof Beats Persuasion Here More Than Almost Anywhere Else",
   body:"The mystery-shopper audit turns \"trust me, this is a problem\" into \"here is the exact number of minutes it took your own business to respond to me.\" Very few doorways into freelance digital work let a beginner generate evidence that concrete, that fast, with zero budget."},
  {icon:"🎯", color:"#8B2E1F", name:"It Competes on Delivery Model, Not Features",
   body:"The named competitors above are mostly self-service software a busy owner has to learn and maintain themselves. This path competes by being a person who sets it up, customizes it, and runs it for them — which is a genuinely different value proposition than a subscription tool, and one the smallest, least tech-comfortable agencies specifically respond to."},
];

const DURABILITY_STATS = [
  {label:"Americans turning 65, per day (U.S.)", value:"~10,000", color:"#0D7A5F"},
  {label:"Share of U.S. population 65+ by 2030", value:"~20%", color:"#7A5A00"},
  {label:"U.S. home care market size, 2026", value:"$173.6B", color:"#C99A3B"},
  {label:"U.S. home care market annual growth", value:"4.1-4.6%", color:"#8B2E1F"},
  {label:"Global home healthcare market CAGR (through 2033)", value:"~10.5%", color:"#0D7A5F"},
  {label:"Seniors preferring to age at home", value:"87-90%", color:"#7A5A00"},
];

const COMPETITORS = [
  {tier:"Enterprise Agency Management Systems", color:"#8B0000",
   names:"WellSky, AxisCare, AlayaCare, Axxess",
   note:"Comprehensive platforms covering scheduling, Electronic Visit Verification, billing, and compliance. Generally built for agencies large enough to have dedicated admin staff and IT budget — and generally not focused on first-contact response speed specifically."},
  {tier:"Lead & Intake-Focused Platforms", color:"#C99A3B",
   names:"CareFunnels, Aaniie, WelcomeHome",
   note:"The closest direct competitors to this system's actual pitch — purpose-built CRM and marketing tools aimed at exactly the intake and referral problem this system solves."},
  {tier:"AI Intake Automation (fastest-growing)", color:"#7A5A00",
   names:"Sage Care and a growing wave of similar tools",
   note:"The newest category, and the one worth watching most closely. Built specifically around call summarization, auto-drafted follow-ups, and reducing the exact admin burden this system's Family Update Portal also targets."},
];

const FIT_FACTORS = [
  {key:"emotional", label:"Emotional Readiness", max:20,
   help:"Memory care, hospice, and crisis-moment conversations are part of this world.",
   options:[
     {label:"I have real personal experience with this and find it motivating, not draining", points:20},
     {label:"No direct experience, but I feel genuinely comfortable with emotionally heavy conversations", points:14},
     {label:"I'd need to build comfort with this over time", points:6},
     {label:"This kind of subject matter drains me rather than motivates me", points:0},
   ]},
  {key:"local", label:"Comfort With Local, In-Person Work", max:20,
   help:"This system's strongest approach is an in-person visit, not a cold digital message.",
   options:[
     {label:"I genuinely prefer face-to-face relationship building over pure digital outreach", points:20},
     {label:"I'm comfortable doing both as needed", points:13},
     {label:"I'd strongly prefer a fully remote, digital-only path", points:0},
   ]},
  {key:"pace", label:"Patience for a Slower, Relationship-Paced Sales Cycle", max:20,
   help:"Owner-operators here are time-starved; trust builds over weeks, not a single message.",
   options:[
     {label:"I'm fine building trust patiently over several real conversations", points:20},
     {label:"I can do this, but I'd prefer it move faster than it typically will", points:11},
     {label:"I want to move fast and scale outreach volume quickly", points:2},
   ]},
  {key:"compliance", label:"Comfort Holding a Compliance Boundary Consistently", max:20,
   help:"Logistics and communication only — never medical records — on every single call.",
   options:[
     {label:"I'm comfortable being the one who consistently holds this line, conversation after conversation", points:20},
     {label:"I'd want close guidance on this early on", points:10},
     {label:"I'd rather not be responsible for a compliance-adjacent judgment call at all", points:0},
   ]},
  {key:"place", label:"Interest in Hyper-Local, Place-Based Business Building",
   max:20,
   help:"This path is inherently rooted in one city or region, unlike fully remote doorways.",
   options:[
     {label:"I want to build something known and trusted in my own local area specifically", points:20},
     {label:"I'm neutral between local and global approaches", points:12},
     {label:"I specifically want fully remote, borderless work", points:2},
   ]},
];

const FIT_BANDS = [
  {min:80, max:100, label:"Strong Fit", icon:"🟢", color:"#0D7A5F",
   action:"This path lines up well with how you're wired. If you only get one choice, this is a legitimate one to commit to."},
  {min:50, max:79, label:"Workable Fit", icon:"🟡", color:"#C99A3B",
   action:"Real strengths here, alongside at least one real friction point. Worth choosing deliberately, with eyes open about which factor scored lowest for you."},
  {min:0, max:49, label:"Consider Another Path",icon:"🔴", color:"#8B0000",
   action:"More than one factor here cuts against how you'd want to work. If another of the seven doors lines up better with your own honest answers, that's worth weighing seriously before the 24 hours run out."},
];

function Chevron({open}) {
  return <span style={{color:"#D9CFBB",fontSize:19,display:"inline-block",
    transform:open?"rotate(90deg)":"none",transition:"transform .2s",flexShrink:0}}>›</span>;
}

function ProgressBar({value,color,height=6}) {
  return (
    <div style={{background:"#FBF8F1",borderRadius:999,height,overflow:"hidden"}}>
      <div style={{width:`${value}%`,height:"100%",background:color,
        borderRadius:999,transition:"width .3s"}}/>
    </div>
  );
}

function SLabel({text,color}) {
  return (
    <div style={{fontSize:10,fontWeight:700,color,textTransform:"uppercase",
      letterSpacing:".08em",marginBottom:7}}>{text}</div>
  );
}

function ExpandCard({icon,name,color,children,defaultOpen=false,badge}) {
  const [open,setOpen] = useState(defaultOpen);
  return (
    <div onClick={()=>setOpen(o=>!o)}
      style={{background:open?"#FBF8F1":"#F8F5EE",border:`1px solid ${open?color:"#FBF8F1"}`,
        borderRadius:11,cursor:"pointer",overflow:"hidden",marginBottom:9}}>
      <div style={{padding:"13px 15px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:36,height:36,borderRadius:9,background:color+"18",
          border:`1px solid ${color}35`,display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:17,flexShrink:0}}>{icon}</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:14,color:"#201A16"}}>{name}</div>
          {badge&&<div style={{fontSize:11,color,marginTop:2}}>{badge}</div>}
        </div>
        <Chevron open={open}/>
      </div>
      {open&&(
        <div style={{padding:"0 15px 16px",borderTop:"1px solid #FBF8F1"}}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function CareBridgePathBriefing() {
  const [tab,setTab] = useState("overview");
  const [sel,setSel] = useState({});

  const selectOption = (key,idx) => setSel(p=>({...p,[key]:idx}));
  const resetFit = () => setSel({});

  const totalScore = useMemo(()=>{
    return FIT_FACTORS.reduce((sum,f)=>{
      const idx = sel[f.key];
      return idx===undefined ? sum : sum + f.options[idx].points;
    },0);
  },[sel]);
  const answeredCount = Object.keys(sel).length;
  const allAnswered = answeredCount === FIT_FACTORS.length;
  const band = useMemo(()=>
    FIT_BANDS.find(b=>totalScore>=b.min && totalScore<=b.max) || FIT_BANDS[FIT_BANDS.length-1]
  ,[totalScore]);

  const TABS = [
    {id:"overview",   label:"📖 Overview"},
    {id:"highs",      label:"✅ The Highs"},
    {id:"lows",       label:"⚠️ The Lows"},
    {id:"standout",   label:"🌟 What Stands Out"},
    {id:"durability",label:"📈 Durability"},
    {id:"competition",label:"🏁 Competitive Landscape"},
    {id:"fit",        label:"🧭 Is This Your Path?"},
  ];

  return (
    <div style={{fontFamily:"'Inter',system-ui,-apple-system,sans-serif",
      background:"#F5F0E4", minHeight:"100vh", color:"#201A16"}}>

      {/* HEADER */}
      <div style={{background:"linear-gradient(160deg,#F8F5EE 0%,#F8F5EE 60%,#F5F0E4 100%)",
        padding:"22px 16px 18px", borderBottom:"1px solid #FBF8F1"}}>
        <div style={{maxWidth:860, margin:"0 auto"}}>
          <div style={{fontSize:10, fontWeight:700, letterSpacing:".12em", color:"#0D7A5F",
            textTransform:"uppercase", marginBottom:7, display:"flex", alignItems:"center", gap:6}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"#0D7A5F",
              boxShadow:"0 0 6px #0D7A5F",display:"inline-block"}}/>
            DBI Path Briefing — Read Before You Choose
          </div>
          <h1 style={{margin:"0 0 7px", fontSize:"clamp(20px,4.3vw,32px)", fontWeight:800,
            lineHeight:1.15, background:"linear-gradient(135deg,#201A16 30%,#C99A3B 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>
            The Care Bridge — An Honest Path Briefing
          </h1>
          <p style={{margin:"0 0 14px", fontSize:12.5, color:"#D9CFBB", maxWidth:580, lineHeight:1.65}}>
            Real highs, real lows, real competition, and an honest read on how durable this doorway
            actually is — built to help you make one good decision, not to talk you into one.
          </p>
          <div style={{background:"#F5F0E4", border:"1px solid #0D7A5F30", borderRadius:10,
            padding:"11px 14px", marginBottom:14}}>
            <p style={{fontSize:12.5, color:"#6E6459", margin:0, lineHeight:1.6}}>
              <strong style={{color:"#0D7A5F"}}>What this is:</strong> a plain-language look at The
              Care Bridge system — its actual services, its genuine strengths, its real weaknesses,
              and how it compares to what already exists in this market — so your choice is informed
              by evidence, not just enthusiasm for the pitch.
            </p>
          </div>
          <div style={{background:"#F8F5EE", borderRadius:10, padding:"11px 14px",
            border:"1px solid #FBF8F1", display:"flex", flexWrap:"wrap", gap:"10px 22px"}}>
            {[
              ["5","Genuine highs"],
              ["6","Honest lows"],
              ["3","Standout traits"],
              ["3","Named competitor tiers"],
            ].map(([n,l],i)=>(
              <div key={i} style={{display:"flex", flexDirection:"column"}}>
                <span style={{fontSize:17, fontWeight:800, color:"#C99A3B"}}>{n}</span>
                <span style={{fontSize:10.5, color:"#D9CFBB"}}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{background:"#F8F5EE", borderBottom:"1px solid #FBF8F1", position:"sticky", top:0, zIndex:20}}>
        <div style={{maxWidth:860, margin:"0 auto", display:"flex", padding:"0 8px", overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              background:"transparent", border:"none",
              borderBottom:tab===t.id?"2px solid #7A5A00":"2px solid transparent",
              color:tab===t.id?"#C99A3B":"#D9CFBB",
              padding:"12px 13px", fontSize:12.5, fontWeight:tab===t.id?600:500,
              cursor:"pointer", whiteSpace:"nowrap", transition:"all .15s", fontFamily:"inherit"}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:860, margin:"0 auto", padding:"18px 13px 60px"}}>

        {/* OVERVIEW */}
        {tab==="overview"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>What The Care Bridge Actually Is</h2>
            <p style={{fontSize:13,color:"#6E6459",margin:"0 0 16px",lineHeight:1.7}}>
              A 45-day system for building 4 communication and operations tools — a rapid-response
              intake system, a family update portal, staff scheduling automation, and a referral
              system — for home care agencies, assisted living communities, memory care and hospice
              providers, disability support services, and adult day care centers. Built entirely on
              free tools (Notion, Zapier or Make, Google Forms and Sheets), sold through direct,
              in-person, warm approach rather than cold digital outreach.
            </p>
            <div style={{background:"#F5F0E4",border:"1px solid #0D7A5F25",borderRadius:12,padding:"16px",marginBottom:16}}>
              <SLabel text="Real, Current Pricing" color="#0D7A5F"/>
              {[
                {t:"Foundation (intake only)",v:"$75-$150/mo · $900-$1,800/yr"},
                {t:"Growth (+ family updates)",v:"$175-$350/mo · $2,100-$4,200/yr"},
                {t:"Full Care System (everything)",v:"$350-$600/mo · $4,200-$7,200/yr"},
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",
                  borderBottom:"1px solid #FBF8F1"}}>
                  <span style={{fontSize:13,color:"#6E6459"}}>{r.t}</span>
                  <span style={{fontSize:13,fontWeight:700,color:"#0D7A5F"}}>{r.v}</span>
                </div>
              ))}
            </div>
            <p style={{fontSize:12.5,color:"#D9CFBB",lineHeight:1.65}}>
              Everything on the next six tabs is an honest expansion on one question: given all of
              that, is this a doorway worth committing your one shot to? Read The Lows as carefully
              as The Highs — that's the point of this document.
            </p>
          </div>
        )}

        {/* HIGHS */}
        {tab==="highs"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>The Highs</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 16px",lineHeight:1.6}}>
              Genuine strengths, each checked against real, current industry data rather than
              asserted as fact.
            </p>
            {HIGHS.map(h=>(
              <ExpandCard key={h.name} icon={h.icon} name={h.name} color={h.color}>
                <p style={{fontSize:13,color:"#6E6459",margin:"12px 0 0",lineHeight:1.7,
                  borderLeft:`2px solid ${h.color}40`,paddingLeft:10}}>{h.body}</p>
                {h.stat&&(
                  <div style={{marginTop:10,background:h.color+"10",border:`1px solid ${h.color}25`,
                    borderRadius:7,padding:"8px 11px",fontSize:12,color:h.color,lineHeight:1.5}}>
                    📊 {h.stat}
                  </div>
                )}
              </ExpandCard>
            ))}
          </div>
        )}

        {/* LOWS */}
        {tab==="lows"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>The Lows</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 16px",lineHeight:1.6}}>
              Real trade-offs and risks — the same rigor applied to the case against this path as
              the case for it.
            </p>
            {LOWS.map(l=>(
              <ExpandCard key={l.name} icon={l.icon} name={l.name} color={l.color}>
                <p style={{fontSize:13,color:"#6E6459",margin:"12px 0 0",lineHeight:1.7,
                  borderLeft:`2px solid ${l.color}40`,paddingLeft:10}}>{l.body}</p>
                {l.stat&&(
                  <div style={{marginTop:10,background:l.color+"10",border:`1px solid ${l.color}25`,
                    borderRadius:7,padding:"8px 11px",fontSize:12,color:l.color,lineHeight:1.5}}>
                    📊 {l.stat}
                  </div>
                )}
              </ExpandCard>
            ))}
          </div>
        )}

        {/* STANDOUT */}
        {tab==="standout"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>What Makes It Stand Out</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 16px",lineHeight:1.6}}>
              Not "better than every other path" — but genuinely distinctive in a few specific ways.
            </p>
            {STANDOUT.map(s=>(
              <ExpandCard key={s.name} icon={s.icon} name={s.name} color={s.color} defaultOpen>
                <p style={{fontSize:13,color:"#6E6459",margin:"12px 0 0",lineHeight:1.7,
                  borderLeft:`2px solid ${s.color}40`,paddingLeft:10}}>{s.body}</p>
              </ExpandCard>
            ))}
          </div>
        )}

        {/* DURABILITY */}
        {tab==="durability"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Durability & Market Volatility</h2>
            <p style={{fontSize:13,color:"#6E6459",margin:"0 0 16px",lineHeight:1.7}}>
              This is one of the most structurally durable demand curves available to any of the
              seven doors — population aging is locked in for decades regardless of interest rates,
              recessions, or platform trend cycles. The honest caveat: durability of <em>demand</em>
              is not the same as ease for the <em>agencies themselves</em>, who face a real,
              persistent staffing crisis that shapes how much bandwidth they have to adopt anything
              new, including this system.
            </p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
              {DURABILITY_STATS.map(d=>(
                <div key={d.label} style={{background:d.color+"10",border:`1px solid ${d.color}30`,
                  borderRadius:11,padding:"13px 14px"}}>
                  <div style={{fontSize:"clamp(17px,4vw,21px)",fontWeight:800,color:d.color}}>{d.value}</div>
                  <div style={{fontSize:11,color:"#6E6459",marginTop:4,lineHeight:1.4}}>{d.label}</div>
                </div>
              ))}
            </div>
            <div style={{background:"#F5F0E4",border:"1px solid #C99A3B25",borderRadius:12,padding:"16px"}}>
              <SLabel text="The Honest Counterweight" color="#C99A3B"/>
              <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.65}}>
                Over half of home care agencies report chronic caregiver shortages, and a large share
                of new hires leave within their first few months. That instability is exactly the
                chaos this system's Staff Scheduling component targets — but it also means agency
                owners are often too consumed by day-to-day survival to prioritize a new system,
                however good it is. Durable demand doesn't automatically mean an easy sale.
              </p>
            </div>
          </div>
        )}

        {/* COMPETITION */}
        {tab==="competition"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Competitive Landscape</h2>
            <p style={{fontSize:13,color:"#6E6459",margin:"0 0 16px",lineHeight:1.7}}>
              The core playbook's framing — "a market virtually no digital agency serves" — deserves
              an update. Real, named competitors exist. What still holds up is a genuine, defensible
              underserved segment within that competition.
            </p>
            {COMPETITORS.map(c=>(
              <div key={c.tier} style={{background:"#F8F5EE",border:`1px solid ${c.color}35`,
                borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:700,color:c.color,textTransform:"uppercase",
                  letterSpacing:".07em",marginBottom:6}}>{c.tier}</div>
                <div style={{fontSize:13.5,fontWeight:600,color:"#201A16",marginBottom:6}}>{c.names}</div>
                <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.6}}>{c.note}</p>
              </div>
            ))}
            <div style={{marginTop:6,background:"#F5F0E4",border:"1px solid #0D7A5F25",
              borderRadius:12,padding:"16px"}}>
              <SLabel text="Where The Real Opening Still Is" color="#0D7A5F"/>
              <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.65}}>
                Roughly 35,000+ home care agencies operate in the U.S. once non-Medicare, private-pay
                operators are included — most of them small, owner-operated, and priced out of or
                overwhelmed by a $300-1,000+/month enterprise platform with a learning curve attached.
                A done-for-you human who sets up something simple for $75-600/month is a genuinely
                different value proposition to that specific owner than another piece of software to
                self-serve onto. That gap is real — it's just smaller and more contested than "no
                competition" suggests.
              </p>
            </div>
          </div>
        )}

        {/* FIT */}
        {tab==="fit"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Is This Your Path?</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 16px",lineHeight:1.6}}>
              Answer honestly about yourself, not about who you'd like to be. This exists to help
              you use your one choice well, in whichever direction it points.
            </p>

            <div style={{background:"#F5F0E4",border:`1px solid ${band.color}35`,borderRadius:12,
              padding:"16px",marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:12,fontWeight:600,color:"#6E6459"}}>
                  {allAnswered ? "Fit Score" : `${answeredCount} of ${FIT_FACTORS.length} answered`}
                </span>
                <span style={{fontSize:20,fontWeight:800,color:band.color}}>{totalScore} / 100</span>
              </div>
              <ProgressBar value={totalScore} color={band.color} height={8}/>
              {allAnswered&&(
                <div style={{marginTop:12,display:"flex",gap:10,alignItems:"flex-start"}}>
                  <span style={{fontSize:22}}>{band.icon}</span>
                  <div>
                    <div style={{fontWeight:800,fontSize:14,color:band.color,marginBottom:3}}>{band.label}</div>
                    <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.55}}>{band.action}</p>
                  </div>
                </div>
              )}
              {answeredCount>0&&(
                <div onClick={resetFit} style={{marginTop:12,fontSize:11.5,color:"#D9CFBB",
                  cursor:"pointer",textDecoration:"underline",display:"inline-block"}}>
                  Reset and answer again
                </div>
              )}
            </div>

            {FIT_FACTORS.map(f=>(
              <div key={f.key} style={{marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                  <span style={{fontSize:13.5,fontWeight:700,color:"#201A16"}}>{f.label}</span>
                  <span style={{fontSize:10.5,color:"#D9CFBB"}}>max {f.max} pts</span>
                </div>
                <p style={{fontSize:12,color:"#D9CFBB",margin:"0 0 8px",lineHeight:1.5}}>{f.help}</p>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {f.options.map((o,oi)=>{
                    const isSel = sel[f.key]===oi;
                    return (
                      <div key={oi} onClick={()=>selectOption(f.key,oi)}
                        style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,
                          padding:"10px 12px",borderRadius:8,cursor:"pointer",
                          background:isSel?"#0D7A5F15":"#F8F5EE",
                          border:`1px solid ${isSel?"#0D7A5F":"#FBF8F1"}`}}>
                        <span style={{fontSize:12.5,color:isSel?"#201A16":"#6E6459",lineHeight:1.4}}>{o.label}</span>
                        <span style={{fontSize:12,fontWeight:800,color:isSel?"#0D7A5F":"#D9CFBB",flexShrink:0}}>+{o.points}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
