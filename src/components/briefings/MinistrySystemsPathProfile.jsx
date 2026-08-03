import { useState } from "react";

/* ─── DESIGN TOKENS (shared with the rest of the Digital Ministry Systems family) ─── */
const C = {
  bg:"#F5F0E4", bg2:"#F8F5EE", bg3:"#FBF8F1", border:"#FBF8F1",
  text:"#201A16", muted:"#6E6459", dim:"#6E6459",
  indigo:"#7A5A00", green:"#0D7A5F", amber:"#C99A3B",
  pink:"#8B2E1F", red:"#8B0000", purple:"#7A5A00",
};

/* ─── PATH SNAPSHOT ─── */
const SNAPSHOT = [
  {icon:"🆓", label:"Startup Cost", value:"~$0", sub:"Free tools until revenue justifies more", color:C.green},
  {icon:"⚔️", label:"Competition", value:"Low", sub:"Rated Low in 7 of 10 ranked countries", color:C.green},
  {icon:"🏛️", label:"Durability", value:"High", sub:"Tied to enduring institutions, not trends", color:C.green},
  {icon:"🐢", label:"Sales Cycle", value:"Slow", sub:"Relationship-first, never cold outreach", color:C.amber},
  {icon:"💰", label:"Revenue Ceiling", value:"Modest", sub:"$2K–$45K/yr per the guide's own scenarios", color:C.amber},
  {icon:"🤝", label:"Best Fit", value:"Relationship-Driven", sub:"Needs real or buildable faith-community ties", color:C.indigo},
];

/* ─── CORE LOOP (compressed from the 60-Day Playbook, not a replacement for it) ─── */
const CORE_LOOP = [
  {n:"1", t:"Audit your own parish", d:"Find one real, specific gap — paper sign-ups, envelope-only giving, scattered WhatsApp announcements."},
  {n:"2", t:"Run a free pilot", d:"One event, no cost, just to prove the concept — never a paid pitch to your own community first."},
  {n:"3", t:"Document the case study", d:"Real numbers, a real testimonial, in the coordinator's own words."},
  {n:"4", t:"Work your warm network", d:"Other parishes, your diocese, your denominational conference — never a cold list."},
  {n:"5", t:"Present and close", d:"Lead with the tier that solves their single biggest pain point first."},
  {n:"6", t:"Deliver and support", d:"Build it, test it twice, launch it softly, stay responsive."},
  {n:"7", t:"Expand the relationship", d:"Upsell the next real need, then ask for a referral inside the network."},
];

/* ─── HIGHS & PERKS ─── */
const HIGHS = [
  {icon:"🔒", title:"Structurally non-saturating", color:C.indigo,
   body:"Every student's addressable market is their own parish, diocese, and denominational network — which by definition doesn't overlap with any other student's. This is the one path in the scholarship that genuinely cannot be crowded out by classmates working the same list, because there is no shared list."},
  {icon:"🆓", title:"Runs on free tools until it doesn't need to", color:C.green,
   body:"Notion, Google Forms and Sheets, Zapier or Make's free tier, and WhatsApp Business cover the entire pilot phase. Nothing has to be purchased before the first dollar of revenue exists."},
  {icon:"⚔️", title:"Low competition almost everywhere you'd start", color:C.amber,
   body:"Global ChMS incumbents like Tithe.ly, Pushpay, and Planning Center are real, but their footprint stops at large, wealthy, English-first congregations. The small-and-mid parish market — the vast majority of the world's congregations — is largely untouched."},
  {icon:"🎯", title:"Solves pain that already exists, in plain sight", color:C.pink,
   body:"Paper sign-up sheets, envelope-only giving, and WhatsApp-only announcements aren't a manufactured problem — they're the default state of most congregations. You're not convincing anyone a need exists; you're pointing at one they already feel."},
  {icon:"🌐", title:"One relationship can open dozens of doors", color:C.purple,
   body:"A diocese, denominational network, or conference structure is slower to close, but by far the highest referral multiplier of any client type — one institutional relationship can introduce the system to every parish underneath it."},
  {icon:"🤝", title:"A sales motion built on consent, not pressure", color:C.green,
   body:"Every script in this system leads with a free pilot and ends with 'no pressure either way.' If aggressive closing tactics have never sat right with you, this is the one path in the scholarship built entirely around their absence."},
  {icon:"❤️", title:"The work and the community aren't in tension", color:C.red,
   body:"For an aspirant with real ties to a faith community, this is a rare doorway where building income and genuinely serving people you already care about are the same action, not a trade-off."},
];

/* ─── LOWS & PITFALLS ─── */
const LOWS = [
  {icon:"📉", title:"A meaningfully lower revenue ceiling", color:C.red,
   body:"The system's own Strong-case scenario — a mature, 9-10 client practice anchored by one diocesan relationship — tops out around $20,000–$45,000 a year. Package prices are deliberately kept at $50–$400 a month, because that's what most congregation budgets can actually bear. If the single biggest possible number is what matters most to you, be honest with yourself about that before you choose."},
  {icon:"🐢", title:"A slower trust-building cycle, on purpose", color:C.amber,
   body:"This system does not do cold outreach. Growth is bounded, at first, by the size of your own warm network, and institutional deals move at committee speed, not closing-call speed. If you need income fast, this is not the fastest doorway in the scholarship."},
  {icon:"🏛️", title:"Committees and boards slow the biggest deals", color:C.indigo,
   body:"The client type with the highest referral value — a diocese or denominational network — is explicitly the slowest to close, because it usually requires committee or board approval. The upside is real; so is the wait."},
  {icon:"🔑", title:"It only starts if you have — or will build — real ties", color:C.purple,
   body:"This isn't a system you can run from a spreadsheet of strangers. If you have no connection to any faith community today and no real interest in building one authentically over time, the entire warm-network engine never turns on."},
  {icon:"⚖️", title:"A real emotional and ethical tightrope", color:C.pink,
   body:"Monetizing anything connected to your own church takes genuine care. The system handles this by insisting your first project is always a free pilot, never a paid pitch — but the discomfort of that first conversation is still real, and not everyone will feel at ease navigating it."},
  {icon:"🌍", title:"Localization complexity if you go beyond your home market", color:C.green,
   body:"Expanding into a second country means a new payment rail — M-Pesa, PIX, GCash, Paystack — and, in most of the strongest markets, real language localization, not just translation."},
  {icon:"🪙", title:"The best markets are also the most budget-constrained", color:C.amber,
   body:"The lowest-competition, highest-growth countries in this guide are frequently the same ones where capacity to pay, not desire, is the real limiting factor. Expect more free and discounted pilot work here than in a higher-ticket path."},
];

/* ─── DURABILITY ─── */
const DURABILITY_POINTS = [
  {icon:"🏛️", title:"Tied to some of the oldest continuously-operating institutions in existence",
   body:"Parishes, dioceses, and denominations regularly outlast the businesses that serve them by generations. That's a structurally different foundation than a client base built on a platform trend or a content format's popularity cycle."},
  {icon:"📋", title:"The pain points don't go out of style",
   body:"Knowing how many people are coming to a retreat, giving people an easy way to give, and making sure an announcement actually reaches the congregation are operational needs, not fads. They don't depend on an algorithm changing in this system's favor."},
  {icon:"📡", title:"No platform or algorithm risk",
   body:"A business built on top of a social platform's trends can lose its footing overnight if the algorithm shifts. A parish's need for a working registration form doesn't depend on any platform's goodwill at all."},
  {icon:"📈", title:"Concentrated in genuinely growing communities",
   body:"Nigeria and Kenya are already home to roughly two-thirds of Africa's largest congregations between them. Brazil's Evangelical and Pentecostal movement has multiplied for two decades and, per some demographers, may overtake Catholicism there within years. Diaspora congregations in the US and UK are reportedly among the fastest-growing anywhere in those countries."},
];

const DURABILITY_CAVEAT = "Durability isn't uniform everywhere, and it's worth saying plainly: church attendance among historically native congregations in mature Western markets like the UK has declined for decades. The strongest, most durable demand in this guide is concentrated in the Global South and in fast-growing diaspora communities — not spread evenly across the whole world.";

/* ─── COMPETITION (same 10 countries as the Global Ministry Prospecting Guide) ─── */
const COMPETITION = [
  {flag:"🇳🇬", name:"Nigeria", level:"Low-to-Medium", color:C.green, note:"Global ChMS incumbents have almost no footprint outside a handful of the largest megachurches; the small-and-mid parish market is wide open."},
  {flag:"🇰🇪", name:"Kenya", level:"Low", color:C.green, note:"Near-total absence of Western ChMS platforms outside a handful of the largest Nairobi churches."},
  {flag:"🇬🇭", name:"Ghana", level:"Low", color:C.green, note:"Culturally adjacent to Nigeria's charismatic movement, with very little formal digital-tools competition yet."},
  {flag:"🇺🇬", name:"Uganda", level:"Low", color:C.green, note:"Very few parishes here have ever been formally pitched a digital tool of any kind."},
  {flag:"🇿🇦", name:"South Africa", level:"Medium", color:C.amber, note:"A few Western vendors already sell into the largest urban congregations — the clearer opening is mid-size, township, and rural congregations."},
  {flag:"🇵🇭", name:"Philippines", level:"Low-to-Medium", color:C.green, note:"Near-universal GCash adoption with very little dedicated ministry-tech competition yet."},
  {flag:"🇧🇷", name:"Brazil", level:"Low", color:C.green, note:"Real opportunity, though it requires genuine Portuguese localization of every script and tool, not just translation."},
  {flag:"🇲🇽", name:"Mexico", level:"Low", color:C.green, note:"Similar story to Brazil — low competition, but real Spanish localization is required."},
  {flag:"🇺🇸", name:"United States", level:"High overall — Low in one niche", color:C.red, note:"A dozen well-funded ChMS platforms are already embedded in most mid-size and large congregations. The opening is inside it: African, Filipino, and Latino immigrant congregations the mature incumbents rarely design for."},
  {flag:"🇬🇧", name:"United Kingdom", level:"High overall — Low in one niche", color:C.red, note:"Mainstream UK ChMS options rarely target the fast-growing African-led diaspora congregations specifically — that's the opening, alongside real GDPR awareness."},
];

/* ─── INCOME ─── */
const PACKAGES = [
  {name:"Foundation", icon:"🌱", color:C.green, price:"$50-$100/month",
   includes:["Event registration & automated confirmation","Basic communication hub (email/SMS reminders)","Monthly headcount and attendance summary"]},
  {name:"Growth", icon:"⚡", color:C.indigo, price:"$150-$250/month",
   includes:["Everything in Foundation","Digital giving & stewardship system","Automated giving receipts and monthly report"]},
  {name:"Full Ministry", icon:"🏆", color:C.pink, price:"$250-$400/month",
   includes:["Everything in Growth","Digital formation / course platform","Priority support and a quarterly strategy check-in"]},
];

const REVENUE_SCENARIOS = [
  {name:"Conservative", icon:"🌱", color:C.indigo, clients:"3-5 ministries", mix:"Mostly Foundation tier",
   range:"$2,000 – $6,000/year", note:"A realistic first-12-months outcome working your own parish plus one or two warm referrals."},
  {name:"Solid", icon:"⚡", color:C.amber, clients:"6-8 ministries", mix:"Mixed Foundation and Growth, one Full Ministry",
   range:"$8,000 – $20,000/year", note:"A well-run practice after 12-24 months, once referrals start compounding inside one diocese or network."},
  {name:"Strong", icon:"🏆", color:C.green, clients:"9-10 ministries", mix:"Majority Growth/Full Ministry, plus one institutional relationship",
   range:"$20,000 – $45,000/year", note:"A mature practice usually anchored by one diocese or denomination worth more than several parishes combined."},
];

/* ─── IS THIS YOU ─── */
const FIT_YES = [
  "You already have — or are genuinely willing to build — real ties to a faith community",
  "You'd rather grow slowly through trust than push through a cold list",
  "A modest, steady ceiling is an acceptable trade for a market that's very hard to saturate",
  "You get real energy from serving a community you're already part of",
  "You're patient with committees, boards, and institutional decision-making",
  "You don't need your first dollar of income this week",
];

const FIT_NO = [
  "You have no connection to any faith community and no real interest in building one",
  "You need the fastest possible route to first income in the scholarship",
  "High-volume, cold outreach is genuinely more your speed than warm relationships",
  "Money conversations inside your own community feel like a hard no, not just uncomfortable",
  "You're optimizing for the single biggest ceiling in the scholarship, not the most durable floor",
  "You have zero interest in ever learning a new payment rail or language, if you go global later",
];

/* ─── FAQ ─── */
const FAQS = [
  {q:"I don't currently belong to a church or ministry — can I still choose this path?",
   a:"Honestly, this is the one path in the scholarship that depends on relationship access more than any other. You can still build one — the system's own guidance is to attend as a genuine visitor, build a real relationship over time, then offer a free pilot — but that takes real time. If you have no interest in ever doing that, a different path will likely suit you better."},
  {q:"Will my pastor or church think I'm just trying to profit from my own community?",
   a:"Not if you follow the system as designed: your very first project, at your own parish, is always a free pilot — never a paid pitch. You're proving a concept for people you already care about, not selling to them. The paid relationship comes later, or with other parishes, once there's real proof it works."},
  {q:"Does this only work for Christian churches?",
   a:"No. The same core system — event registration, giving automation, communication, digital formation — applies to mosques, synagogues, temples, and small nonprofits just as directly. The names change; the pain points are nearly identical almost everywhere."},
  {q:"The income ceiling looks smaller than other paths in the scholarship — is this the weaker choice?",
   a:"It's a different trade-off, not a weaker one. This path is honestly priced for what congregation budgets can bear, and its numbers reflect that. What it offers in exchange is a market that's structurally very hard to saturate, and demand tied to some of the most durable institutions that exist. Which trade-off is 'better' depends entirely on what you're optimizing for."},
  {q:"What if my very first pilot doesn't go well?",
   a:"Treat it as real information, not a verdict. The 60-Day Playbook's own retrospective step exists for exactly this — note what didn't work, adjust, and remember a free pilot was always framed as a test to the people you ran it for, not a guarantee."},
  {q:"How fast could I realistically get my first paying client?",
   a:"The 60-Day Playbook is built around a first paying client by roughly day 35, after a free pilot, a documented case study, and warm outreach to your own network. That's slower than a cold-outreach system's fastest possible close, and it's the honest, structural trade for how this path is built."},
  {q:"I've decided on this path — what's the very first thing I should actually do?",
   a:"Open the 60-Day Playbook and start Day 1: free account setup at zero cost, followed immediately by an honest audit of your own parish or ministry on Day 2. Everything else in this whole system builds from that first real, specific gap."},
];

/* ─── HELPER COMPONENTS ─── */
function Chevron({open}) {
  return <span style={{color:C.dim,fontSize:19,display:"inline-block",
    transform:open?"rotate(90deg)":"none",transition:"transform .2s",flexShrink:0}}>›</span>;
}

function SLabel({text,color}) {
  return (
    <div style={{fontSize:10,fontWeight:700,color,textTransform:"uppercase",
      letterSpacing:".08em",marginBottom:7}}>{text}</div>
  );
}

function Snapshot({icon,label,value,sub,color}) {
  return (
    <div style={{background:color+"10",border:"1px solid "+color+"35",borderRadius:12,
      padding:"14px 12px",textAlign:"center"}}>
      <div style={{fontSize:18,marginBottom:5}}>{icon}</div>
      <div style={{fontSize:15,fontWeight:800,color,lineHeight:1.2}}>{value}</div>
      <div style={{fontSize:10.5,color:C.muted,marginTop:4,fontWeight:600}}>{label}</div>
      {sub&&<div style={{fontSize:9.5,color:C.dim,marginTop:3,lineHeight:1.4}}>{sub}</div>}
    </div>
  );
}

function ExpandCard({icon,title,tag,tagColor,color,isOpen,onClick,children}) {
  return (
    <div onClick={onClick}
      style={{background:isOpen?"#FBF8F1":C.bg2,
        border:`1px solid ${isOpen?color:C.border}`,
        borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
      <div style={{padding:"13px 15px",display:"flex",alignItems:"center",gap:12}}>
        {icon&&
          <div style={{width:34,height:34,borderRadius:9,background:color+"18",
            border:`1px solid ${color}35`,display:"flex",alignItems:"center",
            justifyContent:"center",fontSize:16,flexShrink:0}}>{icon}</div>}
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,fontSize:13.5,color:C.text,lineHeight:1.35}}>{title}</div>
          {tag&&<div style={{fontSize:11,color:tagColor||color,marginTop:2}}>{tag}</div>}
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

/* ─── MAIN ───────────────────────────────────────────────── */
export default function MinistrySystemsPathProfile() {
  const [tab,setTab]                 = useState("overview");
  const [openHigh,setOpenHigh]       = useState(null);
  const [openLow,setOpenLow]         = useState(null);
  const [openCountry,setOpenCountry] = useState(null);
  const [openFaq,setOpenFaq]         = useState(null);
  const [fitChecked,setFitChecked]   = useState({});

  const toggleFit = (key) => setFitChecked(p=>({...p,[key]:!p[key]}));
  const yesCount = FIT_YES.filter((_,i)=>fitChecked["yes"+i]).length;
  const noCount  = FIT_NO.filter((_,i)=>fitChecked["no"+i]).length;

  const TABS = [
    {id:"overview",   label:"📋 Overview"},
    {id:"highs",      label:"✅ Highs & Perks"},
    {id:"lows",       label:"⚠️ Lows & Pitfalls"},
    {id:"durability", label:"🧭 Durability"},
    {id:"competition",label:"⚔️ Competition"},
    {id:"income",     label:"💰 Realistic Income"},
    {id:"fit",        label:"🙋 Is This You?"},
    {id:"faq",        label:"❓ Honest FAQ"},
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
        padding:"22px 16px 18px",borderBottom:"1px solid "+C.border}}>
        <div style={{maxWidth:880,margin:"0 auto"}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",color:C.green,
            textTransform:"uppercase",marginBottom:7,display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:C.green,
              boxShadow:"0 0 6px "+C.green,display:"inline-block"}}/>
            DFS Path Selection · One of 7 Doorways
          </div>
          <h1 style={{margin:"0 0 7px",fontSize:"clamp(21px,4.5vw,33px)",fontWeight:800,
            lineHeight:1.15,background:"linear-gradient(135deg,#201A16 30%,#C99A3B 100%)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            Digital Ministry Systems: The Path Profile
          </h1>
          <p style={{margin:"0 0 14px",fontSize:12.5,color:"#D9CFBB",maxWidth:600,lineHeight:1.65}}>
            Everything worth knowing before your one-time path choice — the highs, the lows, and an
            honest read on how durable and how competitive this doorway really is.
          </p>
          <div style={{background:"#F5F0E4",border:"1px solid "+C.green+"30",borderRadius:10,
            padding:"11px 14px"}}>
            <p style={{fontSize:12.5,color:C.muted,margin:0,lineHeight:1.6}}>
              <strong style={{color:C.green}}>Why this exists:</strong> the 60-Day Playbook, the
              Global Ministry Prospecting Guide, and the Ministry Performance Calculator all assume
              you've already chosen this path. This is the document for before that — a plain-spoken
              case for and against Digital Ministry Systems, built entirely from what those three
              playbooks already show to be true.
            </p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{background:"#F8F5EE",borderBottom:"1px solid "+C.border,position:"sticky",top:0,zIndex:20}}>
        <div style={{maxWidth:880,margin:"0 auto",display:"flex",padding:"0 8px",overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className="tab-btn" style={{
              background:"transparent",border:"none",
              borderBottom:tab===t.id?"2px solid "+C.indigo:"2px solid transparent",
              color:tab===t.id?"#C99A3B":C.dim,
              padding:"12px 13px",fontSize:12.5,fontWeight:tab===t.id?600:500,
              cursor:"pointer",whiteSpace:"nowrap",transition:"all .15s",fontFamily:"inherit"}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:880,margin:"0 auto",padding:"18px 13px 60px"}}>

        {/* OVERVIEW */}
        {tab==="overview"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>Path Snapshot</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 14px",lineHeight:1.6}}>
              The whole document in six numbers. Every one of them is unpacked in the tabs above.
            </p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(135px,1fr))",
              gap:10,marginBottom:22}}>
              {SNAPSHOT.map(s=><Snapshot key={s.label} {...s}/>)}
            </div>

            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>What This Path Actually Is</h2>
            <p style={{fontSize:13,color:C.muted,margin:"0 0 16px",lineHeight:1.7}}>
              Digital Ministry Systems is freelance digital-operations work for churches, parishes,
              dioceses, faith-based schools, and the ministries, NGOs, and media outfits that orbit
              them. In practice: replacing paper sign-up sheets with a real registration system,
              giving congregants an online way to give, building a communication hub that reaches
              people beyond the pulpit, and — for larger ministries — a digital formation platform for
              teaching content. It's built almost entirely on free tools and paid for through modest,
              recurring monthly retainers.
            </p>

            <div style={{background:C.indigo+"10",border:"1px solid "+C.indigo+"30",borderRadius:12,
              padding:"16px",marginBottom:20}}>
              <SLabel text="What Makes It Stand Out" color={C.indigo}/>
              <p style={{fontSize:13.5,color:C.text,margin:0,lineHeight:1.7}}>
                Two things, and they compound each other. First, your addressable market is your own
                network — your parish, diocese, and denomination — which structurally cannot overlap
                with another student's, so this is the one path in the scholarship that can't be
                crowded out from the inside. Second, the client base is tied to some of the most
                durable institutions humans have ever built, not to a platform trend or an algorithm's
                mood. Slower to start; genuinely hard to run out of room in.
              </p>
            </div>

            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>The Core Loop</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 14px",lineHeight:1.6}}>
              The compressed version. See the full 60-Day Playbook for every day's detail.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:22}}>
              {CORE_LOOP.map(s=>(
                <div key={s.n} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:10,
                  padding:"11px 14px",display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{width:22,height:22,borderRadius:6,background:C.indigo+"18",
                    border:"1px solid "+C.indigo+"35",display:"flex",alignItems:"center",
                    justifyContent:"center",fontSize:11,fontWeight:800,color:C.indigo,flexShrink:0,marginTop:1}}>
                    {s.n}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:C.text,marginBottom:2}}>{s.t}</div>
                    <p style={{fontSize:12,color:C.muted,margin:0,lineHeight:1.5}}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>Who This Path Was Built For</h2>
            <p style={{fontSize:13,color:C.muted,margin:0,lineHeight:1.7}}>
              Someone with real ties to a faith community — or a genuine willingness to build them —
              who would rather grow slowly through trust than push through a cold list, and who isn't
              chasing the single biggest number in the scholarship so much as a doorway that's
              genuinely hard to ever run out of room in. The Is This You? tab makes that concrete.
            </p>
          </div>
        )}

        {/* HIGHS */}
        {tab==="highs"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>Highs & Perks</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 16px",lineHeight:1.6}}>
              Seven real strengths, each grounded in what the other three playbooks already show —
              not aspirational marketing copy.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {HIGHS.map((h,i)=>(
                <ExpandCard key={h.title} icon={h.icon} title={h.title} color={h.color}
                  isOpen={openHigh===i} onClick={()=>setOpenHigh(openHigh===i?null:i)}>
                  <p style={{fontSize:13,color:C.muted,margin:"12px 0 0",lineHeight:1.65,
                    borderLeft:"2px solid "+h.color+"40",paddingLeft:10}}>{h.body}</p>
                </ExpandCard>
              ))}
            </div>
          </div>
        )}

        {/* LOWS */}
        {tab==="lows"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>Lows & Pitfalls</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 16px",lineHeight:1.6}}>
              Seven honest trade-offs. None of these are disqualifying on their own — but going in
              with eyes open beats finding out on day 40.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {LOWS.map((l,i)=>(
                <ExpandCard key={l.title} icon={l.icon} title={l.title} color={l.color}
                  isOpen={openLow===i} onClick={()=>setOpenLow(openLow===i?null:i)}>
                  <p style={{fontSize:13,color:C.muted,margin:"12px 0 0",lineHeight:1.65,
                    borderLeft:"2px solid "+l.color+"40",paddingLeft:10}}>{l.body}</p>
                </ExpandCard>
              ))}
            </div>
          </div>
        )}

        {/* DURABILITY */}
        {tab==="durability"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>Market Durability</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 16px",lineHeight:1.6}}>
              How exposed this path is to demand suddenly drying up — and where that exposure
              genuinely differs by region.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:16}}>
              {DURABILITY_POINTS.map(d=>(
                <div key={d.title} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:11,
                  padding:"14px 15px",display:"flex",gap:12}}>
                  <span style={{fontSize:20,flexShrink:0}}>{d.icon}</span>
                  <div>
                    <div style={{fontWeight:700,fontSize:13.5,color:C.text,marginBottom:4}}>{d.title}</div>
                    <p style={{fontSize:12.5,color:C.muted,margin:0,lineHeight:1.6}}>{d.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:C.amber+"10",border:"1px solid "+C.amber+"30",borderRadius:10,
              padding:"14px 15px"}}>
              <SLabel text="Where This Doesn't Hold Evenly" color={C.amber}/>
              <p style={{fontSize:12.5,color:C.muted,margin:0,lineHeight:1.6}}>{DURABILITY_CAVEAT}</p>
            </div>
          </div>
        )}

        {/* COMPETITION */}
        {tab==="competition"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>Competitive Landscape</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 16px",lineHeight:1.6}}>
              The same 10 countries as the Global Ministry Prospecting Guide, read specifically for
              how crowded each market already is.
            </p>
            <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:11,
              padding:"14px 15px",marginBottom:16}}>
              <SLabel text="The Competitive Thesis" color={C.indigo}/>
              <p style={{fontSize:12.5,color:C.muted,margin:0,lineHeight:1.6}}>
                Incumbents like Tithe.ly, Pushpay, and Planning Center are real and well-funded — but
                they're built for, and sold into, large, wealthy, English-first congregations. That
                leaves small-and-mid parishes, non-English markets, and immigrant diaspora
                congregations largely uncontested, even inside the world's most mature markets.
              </p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {COMPETITION.map((c,i)=>(
                <ExpandCard key={c.name} icon={c.flag} title={c.name} tag={c.level} tagColor={c.color}
                  color={c.color} isOpen={openCountry===i}
                  onClick={()=>setOpenCountry(openCountry===i?null:i)}>
                  <p style={{fontSize:13,color:C.muted,margin:"12px 0 0",lineHeight:1.65,
                    borderLeft:"2px solid "+c.color+"40",paddingLeft:10}}>{c.note}</p>
                </ExpandCard>
              ))}
            </div>
          </div>
        )}

        {/* INCOME */}
        {tab==="income"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>Realistic Income</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 16px",lineHeight:1.6}}>
              The same numbers as the Prospecting Guide's Revenue Model — nothing bigger invented
              for this document.
            </p>
            <SLabel text="Package Pricing" color={C.green}/>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
              {PACKAGES.map(p=>(
                <div key={p.name} style={{background:C.bg2,border:"1px solid "+p.color+"35",
                  borderRadius:12,overflow:"hidden"}}>
                  <div style={{padding:"13px 15px",borderBottom:"1px solid "+C.border,
                    display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      <span style={{fontSize:20}}>{p.icon}</span>
                      <span style={{fontWeight:700,fontSize:14,color:C.text}}>{p.name}</span>
                    </div>
                    <span style={{fontSize:14,fontWeight:800,color:p.color,whiteSpace:"nowrap"}}>{p.price}</span>
                  </div>
                  <div style={{padding:"11px 15px"}}>
                    {p.includes.map((item,j)=>(
                      <div key={j} style={{display:"flex",gap:8,marginBottom:6,alignItems:"flex-start"}}>
                        <span style={{color:p.color,fontSize:12,flexShrink:0,marginTop:2}}>✓</span>
                        <span style={{fontSize:12.5,color:C.muted,lineHeight:1.5}}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <SLabel text="12-24 Month Practice Scenarios" color={C.amber}/>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
              {REVENUE_SCENARIOS.map(r=>(
                <div key={r.name} style={{background:C.bg2,border:"1px solid "+r.color+"35",
                  borderRadius:12,overflow:"hidden"}}>
                  <div style={{padding:"13px 15px",borderBottom:"1px solid "+C.border,
                    display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      <span style={{fontSize:20}}>{r.icon}</span>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color:C.text}}>{r.name}</div>
                        <div style={{fontSize:11,color:C.dim,marginTop:2}}>{r.clients} · {r.mix}</div>
                      </div>
                    </div>
                    <span style={{fontSize:14,fontWeight:800,color:r.color,whiteSpace:"nowrap",textAlign:"right"}}>{r.range}</span>
                  </div>
                  <div style={{padding:"11px 15px"}}>
                    <p style={{fontSize:12.5,color:C.muted,margin:0,lineHeight:1.55}}>{r.note}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{background:C.green+"10",border:"1px solid "+C.green+"25",borderRadius:12,padding:"15px"}}>
              <SLabel text="Being Honest About the Ceiling" color={C.green}/>
              <p style={{fontSize:12.5,color:C.muted,margin:0,lineHeight:1.65}}>
                This path was never built to advertise the single biggest number in the scholarship —
                it was built to be the hardest doorway to ever run out of room in. At program scale,
                even the Conservative scenario above, run across 100,000 students, adds up to roughly
                $300M–$500M a year in value delivered across 300,000–500,000 ministries worldwide —
                real, without needing to inflate what any one relationship is worth.
              </p>
            </div>
          </div>
        )}

        {/* FIT */}
        {tab==="fit"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>Is This You?</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 16px",lineHeight:1.6}}>
              Tap whatever's true for you. There's no passing score — this is a mirror, not a gate.
            </p>

            <SLabel text={"Likely a strong fit if... (" + yesCount + "/" + FIT_YES.length + ")"} color={C.green}/>
            <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:20}}>
              {FIT_YES.map((f,i)=>{
                const key="yes"+i, checked=!!fitChecked[key];
                return (
                  <div key={key} onClick={()=>toggleFit(key)}
                    style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 12px",
                      background:checked?C.green+"12":C.bg2,border:"1px solid "+(checked?C.green+"50":C.border),
                      borderRadius:9,cursor:"pointer"}}>
                    <div style={{width:18,height:18,borderRadius:5,border:"2px solid "+(checked?C.green:C.dim),
                      background:checked?C.green:"transparent",display:"flex",alignItems:"center",
                      justifyContent:"center",flexShrink:0,marginTop:1,fontSize:10,color:C.bg,fontWeight:800}}>
                      {checked?"✓":""}
                    </div>
                    <span style={{fontSize:13,color:checked?C.text:C.muted,lineHeight:1.5}}>{f}</span>
                  </div>
                );
              })}
            </div>

            <SLabel text={"Worth thinking twice if... (" + noCount + "/" + FIT_NO.length + ")"} color={C.red}/>
            <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:20}}>
              {FIT_NO.map((f,i)=>{
                const key="no"+i, checked=!!fitChecked[key];
                return (
                  <div key={key} onClick={()=>toggleFit(key)}
                    style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 12px",
                      background:checked?C.red+"12":C.bg2,border:"1px solid "+(checked?C.red+"50":C.border),
                      borderRadius:9,cursor:"pointer"}}>
                    <div style={{width:18,height:18,borderRadius:5,border:"2px solid "+(checked?C.red:C.dim),
                      background:checked?C.red:"transparent",display:"flex",alignItems:"center",
                      justifyContent:"center",flexShrink:0,marginTop:1,fontSize:10,color:C.bg,fontWeight:800}}>
                      {checked?"✓":""}
                    </div>
                    <span style={{fontSize:13,color:checked?C.text:C.muted,lineHeight:1.5}}>{f}</span>
                  </div>
                );
              })}
            </div>

            <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:10,padding:"13px 14px"}}>
              <p style={{fontSize:12,color:C.dim,margin:0,lineHeight:1.6}}>
                A lot of checks on the first list and few on the second is a good sign, not a
                guarantee. A lot on the second list doesn't rule this path out — it just means going
                in aware of exactly what you'd be signing up to work through.
              </p>
            </div>
          </div>
        )}

        {/* FAQ */}
        {tab==="faq"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:C.text}}>Honest FAQ</h2>
            <p style={{fontSize:12.5,color:C.dim,margin:"0 0 14px",lineHeight:1.6}}>
              The questions worth asking before your 24 hours are up — not after.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {FAQS.map((f,i)=>{
                const isOpen=openFaq===i;
                return (
                  <div key={i} onClick={()=>setOpenFaq(isOpen?null:i)}
                    style={{background:isOpen?"#FBF8F1":C.bg2,
                      border:"1px solid "+(isOpen?C.indigo:C.border),
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"12px 14px",display:"flex",alignItems:"flex-start",gap:9}}>
                      <span style={{color:C.indigo,fontSize:13,fontWeight:800,flexShrink:0,marginTop:1}}>Q</span>
                      <span style={{flex:1,fontSize:13.5,fontWeight:600,color:"#201A16",lineHeight:1.45}}>{f.q}</span>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 14px 13px",borderTop:"1px solid "+C.border}}>
                        <div style={{display:"flex",gap:9,marginTop:11,alignItems:"flex-start"}}>
                          <span style={{color:C.green,fontSize:13,fontWeight:800,flexShrink:0}}>A</span>
                          <p style={{fontSize:13,color:C.muted,margin:0,lineHeight:1.65}}>{f.a}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
