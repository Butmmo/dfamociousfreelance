import { useState, useEffect, useMemo } from "react";

const TARGETS = [
  {icon:"🏠", name:"Real Estate Agents & Team Leaders", tag:"High-ticket, referral-driven",
   why:"Commission income makes marketing spend feel normal, and referral business lives or dies on visible credibility — yet most agents only post listings, not authority.",
   pain:"Posts are 90% listing photos and \"just closed\" graphics, with zero personal story or expertise showing through.",
   budget:"$500 – $1,800/mo typical, higher for team leads and luxury or commercial brokers.",
   triggers:["Closed a notable or luxury deal","Promoted to team lead or opened a brokerage","Won a local production award"],
   find:["LinkedIn: search \"real estate team lead\" or \"broker owner\"","Local and regional REALTOR association rankings and award pages","Real estate-specific Facebook groups (cross-check for a thin LinkedIn presence)"],
   angle:"Reference their most recent closed deal or award by name, then show what a \"story behind the deal\" rewrite of one of their posts could look like."},
  {icon:"💪", name:"Corporate Wellness & Executive Health Coaches", tag:"B2B-facing, not consumer fitness",
   why:"On LinkedIn specifically this only works for coaches selling into companies or to executives — general consumer fitness content lives on Instagram and TikTok, not here.",
   pain:"Strong credentials and real client results, but content that reads like a resume instead of a point of view — nothing that makes an HR buyer stop scrolling.",
   budget:"$500 – $1,500/mo.",
   triggers:["Landed a new corporate wellness contract","Spoke at an HR or benefits conference","Published a client outcome or case study they can talk about"],
   find:["LinkedIn: search \"corporate wellness consultant\" or \"executive health coach\"","HR and benefits conference speaker and exhibitor lists","Corporate wellness vendor directories used by HR buyers"],
   angle:"Lead with their strongest client outcome and show how a case-study-style post would read to an HR decision-maker."},
  {icon:"💻", name:"B2B SaaS Founders & CEOs", tag:"Funded, time-starved, pipeline-hungry",
   why:"Founder content is one of the cheapest sources of inbound pipeline a startup has, and every founder knows it — they just can't sustain the posting cadence once the company scales.",
   pain:"A burst of posts right after a funding announcement, then silence for months once the day job takes back over.",
   budget:"$800 – $4,000+/mo depending on funding stage.",
   triggers:["Just closed a funding round","Launched on Product Hunt or shipped a major feature","Hired their first VP or scaled past 10 employees"],
   find:["LinkedIn: title search \"Founder\" AND \"SaaS\" or a specific category","Product Hunt daily launches — filter for founders who are active but inconsistent","Funding-announcement roundups and startup newsletters"],
   angle:"Reference the specific launch or raise, then show how consistent posting compounds the one-time visibility spike they just got."},
  {icon:"💰", name:"Independent Financial Advisors & RIAs", tag:"Trust-first, compliance-aware",
   why:"Advice is commoditized and trust is the entire sale — but this is the one persona where compliance review is a real part of the workflow, not an afterthought.",
   pain:"Either silent on LinkedIn entirely, or posting compliance-approved generic market updates that could have come from any advisor at any firm.",
   budget:"$700 – $2,500/mo, often paid from a firm marketing budget rather than personally.",
   triggers:["Moved to a new RIA or broker-dealer","Hit a visible AUM or client-count milestone","Earned a new designation (CFP, CFA, etc.)"],
   find:["LinkedIn: search \"financial advisor\" or \"wealth manager\" plus a city or niche","CFP Board and NAPFA advisor directories","Firm \"meet the team\" pages for independent RIAs"],
   angle:"Ask early whether their compliance team needs to review posts before they go out — raising it first builds trust instead of losing the deal to it later."},
  {icon:"🎯", name:"Executive & Leadership Coaches", tag:"Authority is the entire product",
   why:"Unlike almost everyone else on this list, visible authority isn't marketing for an executive coach's business — it IS the business. High-conviction, contrarian takes perform unusually well here.",
   pain:"Deep expertise and strong opinions in conversation, but a LinkedIn feed that's either empty or full of generic \"leadership tips\" anyone could write.",
   budget:"$800 – $2,500/mo.",
   triggers:["Launched a new cohort or group program","Earned an ICF or similar credential","Landed a nameable client or company they can reference"],
   find:["LinkedIn: search \"executive coach\" or \"leadership coach\"","ICF (International Coaching Federation) member directory","Guest lists from leadership and management podcasts"],
   angle:"Rewrite one of their existing \"tips\" posts as a specific, opinionated story instead — the contrast usually speaks for itself."},
  {icon:"🧑‍💼", name:"Recruiters & Executive Search Consultants", tag:"Visibility drives both sides of the desk",
   why:"Content here does double duty — it attracts candidates AND the companies who hire recruiters, which makes the ROI case unusually easy to make.",
   pain:"Posts open roles constantly, but rarely shares the market insight and career advice that actually builds a following on either side.",
   budget:"$500 – $2,000/mo, often tied to placement-fee income so it can run seasonal.",
   triggers:["Placed a notable executive","Opened a new practice area or industry vertical","Hiring activity in their niche is visibly up"],
   find:["LinkedIn: search \"recruiter\" or \"talent acquisition\" plus an industry","HR and TA conference attendee and speaker lists","Executive search firm \"our team\" pages"],
   angle:"Point to a recent placement or hiring trend in their specific niche as the opening hook for a sample post."},
  {icon:"📈", name:"Fractional CMOs & Marketing/Sales Consultants", tag:"Sharpest audience, most crowded lane",
   why:"This audience studies and shares tactical how-to content more than any other persona here — but it's also the most crowded lane for ghostwriters, so differentiation matters more.",
   pain:"Genuinely great frameworks and case studies sitting in their head or a client deck, never turned into public content.",
   budget:"$800 – $3,000/mo.",
   triggers:["Signed a new fractional client","Published a framework or methodology with a name","Spoke on a marketing or growth podcast"],
   find:["LinkedIn: search \"fractional CMO\" or \"marketing consultant\"","Marketing agency owner and freelancer directories","Guest lists from marketing and growth podcasts"],
   angle:"Ask what framework they explain most often in client calls — that's usually the highest-performing post they haven't written yet."},
  {icon:"⚖️", name:"Attorneys & Legal Consultants", tag:"Underserved, budget-rich, rules-aware",
   why:"Educational, myth-busting content builds trust in a traditionally opaque industry, and this niche is genuinely underserved compared to the rest of this list — with real per-client budgets at established firms.",
   pain:"Bar-association marketing rules make many attorneys cautious to the point of posting nothing at all, even when they're allowed to.",
   budget:"$800 – $3,000/mo for partners and firm owners.",
   triggers:["Made partner or opened their own practice","Won a case that's already public record","Took on a new practice area"],
   find:["LinkedIn: search by practice area plus \"attorney\" or \"partner\"","State bar association directories and CLE speaker lists","Legal industry award and \"rising star\" lists"],
   angle:"Confirm what their state bar's advertising rules actually allow before pitching — most attorneys assume the restriction is broader than it is, and knowing the real rule is itself a trust-builder."},
  {icon:"💼", name:"Venture Capitalists, Angel Investors & Fund Managers", tag:"Highest budget, measurable deal-flow ROI",
   why:"Investors with a consistent public presence report a meaningfully higher share of deal flow coming through inbound, and they typically raise their next fund faster — a personal brand isn't vanity here, it's a measurable part of the job.",
   pain:"Sharp, differentiated opinions in partner meetings that never make it to a public post — most investor content is a portfolio-company shout-out, not an actual point of view.",
   budget:"$1,500 – $5,000+/mo, funded by the management fee rather than personal income.",
   triggers:["Closed a new fund","Made an investment they're allowed to talk about","Was promoted to partner or general partner"],
   find:["LinkedIn AND X — both drive real deal flow for investors, unlike most personas on this list","Fund portfolio and \"team\" pages","\"Who's investing in [category]\" roundup posts and newsletters"],
   angle:"Ask for one specific, slightly contrarian market opinion they hold — written up well, it usually outperforms every generic \"excited to announce\" post they've written."},
  {icon:"🎤", name:"Authors, Keynote Speakers & Podcast Hosts", tag:"Visibility IS the product",
   why:"For this persona, an audience isn't a channel for something else — it's the entire revenue model, through book sales, speaking fees, and sponsorships. That makes the willingness to invest in visibility unusually high.",
   pain:"Excellent on stage or in an interview, but their written presence doesn't reflect it — long gaps between posts, or posts that just promote the next event instead of sharing the actual ideas.",
   budget:"$600 – $2,500/mo, a wide range depending on how established they are.",
   triggers:["Book launch or pre-order window is open","Upcoming keynote or conference announced","Podcast hit a milestone episode count"],
   find:["Podcast guest directories (PodMatch, Podchaser, PodcastGuests.com) — browse in reverse, for people already signaling they want more visibility","Conference and TEDx speaker directories","Amazon \"new releases\" in their category, for authors specifically"],
   angle:"Pull a specific line from a talk or podcast appearance they've already given and show how it could become a written post — the raw material already exists, it just needs a rewrite."},
];

const LOCATIONS = [
  {icon:"🔗", name:"LinkedIn", color:"#7A5A00",
   why:"The platform itself. Decision-makers from every persona on this list are already here, and LinkedIn's own search is powerful enough that you rarely need anything else.",
   bestFor:"Every persona, but especially SaaS founders, financial advisors, recruiters, and legal — the most B2B-native of the ten.",
   tactics:[
     "People search with Boolean operators in the native search bar: (\"Founder\" OR \"Co-Founder\") AND SaaS — AND, OR, NOT, quotes, and parentheses all work with no tool required.",
     "Use the Keywords field, not just Title — it searches the full profile, catching people who describe themselves differently than you'd expect.",
     "Search the Posts tab for phrases like \"need to post more\" or \"finally writing this\" — this surfaces the exact pain signal you're prospecting for, in their own words.",
     "Sales Navigator's saved searches send an alert when a new profile matches your criteria — a built-in feature, not automation.",
   ],
   caution:"Skip any browser extension or tool that logs into an account, auto-connects, or auto-comments — this violates LinkedIn's terms and risks the account you're trying to build. Everything above works from LinkedIn's own native search."},
  {icon:"✕", name:"X (Twitter)", color:"#7A5A00",
   why:"Less universal than LinkedIn, but genuinely strong for one slice — founders, operators, and especially investors, who treat it as a real-time public notebook.",
   bestFor:"Venture capitalists and angel investors first, B2B SaaS founders second — a noticeably weaker fit for real estate, financial advisors, recruiters, and legal, whose audiences mostly aren't here.",
   tactics:[
     "Search \"looking for guests\" or \"booking podcasts\" to find people actively signaling they want more visibility.",
     "Build a private List of 20–30 target accounts in your persona and check it directly instead of relying on the algorithmic feed.",
     "Reply genuinely under a target's posts before ever sending a DM — visible reply history usually does more trust-building here than a cold message.",
   ]},
  {icon:"👥", name:"Facebook Groups", color:"#0D7A5F",
   why:"Niche-specific groups — real estate, coaching, agency-owner communities — put your exact ICP in one searchable place, self-sorted by profession.",
   bestFor:"Real estate agents, corporate wellness coaches, and executive coaches — the personas most likely to run or join a practice-specific group.",
   tactics:[
     "Join 3–5 groups specific to one persona rather than broad \"entrepreneur\" groups — the more specific the group, the higher the buying intent.",
     "Search inside the group for posts about content struggles or LinkedIn specifically before posting or commenting anything yourself.",
     "Build visible credibility by answering questions genuinely for a week or two before ever mentioning what you do.",
   ],
   caution:"Read the group rules before posting anything promotional. Most admins remove members who pitch before contributing, and getting removed burns the whole group as a channel."},
  {icon:"🎓", name:"Skool & Circle Communities", color:"#8B2E1F",
   why:"Coaches and consultants have largely moved their paid communities here from Facebook Groups. Anyone active inside one has already proven they'll pay for structured growth help — a real buying-intent signal.",
   bestFor:"Executive & leadership coaches, fractional CMOs, and financial advisors — the personas most likely to run or belong to a paid mastermind.",
   tactics:[
     "Join communities your target persona teaches inside, not just ones they belong to — hosting is a strong authority signal in itself.",
     "Check the leaderboard or most-active-member list — high engagement inside a paid community often carries over to outside opportunities.",
     "Use the community's \"wins\" or \"introductions\" channel to spot people who just hit a milestone worth congratulating — a natural, genuine opening line.",
   ]},
  {icon:"🎙️", name:"Podcast & Speaker Directories", color:"#7A5A00",
   why:"Directories like PodMatch, Podchaser, and PodcastGuests.com exist so people can list themselves as wanting to be interviewed — about as pure a \"ready for more visibility\" signal as prospecting gets.",
   bestFor:"Authors, keynote speakers, and podcast hosts first — genuinely useful for executive coaches and fractional CMOs too, since both guest on podcasts often.",
   tactics:[
     "Browse guest profiles filtered by your persona's niche, then cross-reference each name against their actual LinkedIn activity.",
     "Check TEDx and conference speaker directories for the same reason — anyone listed has already opted into being found.",
     "For authors specifically, Amazon's \"new releases\" in their category surfaces people in an active promotion window, when visibility matters most to them.",
   ]},
];

const SCORING_QUESTIONS = [
  {id:"authority", icon:"👑", color:"#7A5A00", label:"Decision-Making Authority",
   sub:"Can they say yes without anyone else signing off?",
   options:[
     {label:"They're the owner or final decision-maker", points:15},
     {label:"Strong influence, but light approval needed", points:9},
     {label:"Needs a manager, partner, or committee to approve", points:3},
   ]},
  {id:"budget", icon:"💵", color:"#0D7A5F", label:"Budget Reality",
   sub:"Is there real, visible evidence they spend on growth?",
   options:[
     {label:"Already pays for content, coaching, or marketing help", points:15},
     {label:"Spends visibly elsewhere — ads, tools, a coach", points:10},
     {label:"No visible spending signal yet", points:2},
   ]},
  {id:"gap", icon:"📉", color:"#C99A3B", label:"The Posting Gap",
   sub:"How does their current output compare to what they need?",
   options:[
     {label:"Posts occasionally, inconsistent — a clear, visible gap", points:15},
     {label:"Posts often, but generic or low engagement", points:9},
     {label:"Doesn't post at all", points:5},
     {label:"Posts consistently and already performs well", points:0},
   ]},
  {id:"stage", icon:"🏢", color:"#8B2E1F", label:"Stage & Capacity",
   sub:"Can their business actually support the retainer?",
   options:[
     {label:"Funded, established, or a team of 10+", points:15},
     {label:"Growing — solo practice or a small team", points:10},
     {label:"Pre-revenue or very early stage", points:3},
   ]},
  {id:"urgency", icon:"⚡", color:"#7A5A00", label:"Urgency Trigger",
   sub:"Did something just happen that makes visibility matter right now?",
   options:[
     {label:"Major trigger in the last 90 days — raise, launch, promotion, award", points:15},
     {label:"Something notable in the last 6–12 months", points:8},
     {label:"Nothing recent that you know of", points:0},
   ]},
  {id:"audience", icon:"👥", color:"#7A5A00", label:"Audience Fit",
   sub:"Is their current following in the sweet spot?",
   options:[
     {label:"1,000–20,000 followers with real engagement", points:10},
     {label:"Under 1,000, early but genuinely active", points:6},
     {label:"20,000+ — likely already has help, or expects agency pricing", points:4},
   ]},
  {id:"prior", icon:"🔁", color:"#0D7A5F", label:"Prior Content Investment",
   sub:"Have they already tried to solve this?",
   options:[
     {label:"Has used a ghostwriter or agency and seems open to a change", points:10},
     {label:"Tried DIY and openly says it's a struggle", points:8},
     {label:"Never tried anything yet", points:4},
     {label:"Has one now and seems happy with them", points:0},
   ]},
  {id:"warm", icon:"🤝", color:"#7A5A00", label:"Warm Path",
   sub:"Is there already a bridge, or are you starting cold?",
   options:[
     {label:"Mutual connection, or they've already engaged with you", points:5},
     {label:"Completely cold, no prior interaction", points:0},
   ]},
];

const TIERS = [
  {min:80, name:"Hot Lead", emoji:"🔥", color:"#8B0000",
   action:"Reach out within 24 hours. Send the free sample rewrite and personalize the DM with something specific from their profile — this combination of signals is rare, don't let it sit in a list."},
  {min:58, name:"Warm Lead", emoji:"🟡", color:"#C99A3B",
   action:"Spend 1–2 weeks on genuine engagement first — a handful of real comments — then send the free sample rewrite. Real potential, but trust needs to be built before the ask."},
  {min:34, name:"Cool Lead", emoji:"🔵", color:"#7A5A00",
   action:"Add them to a long nurture list. Comment occasionally over the next 60–90 days and revisit if a new trigger event shows up. Not a priority today."},
  {min:0, name:"Cold — Deprioritize", emoji:"⚪", color:"#D9CFBB",
   action:"Not a fit right now. Only revisit if a real trigger happens — a raise, a promotion, a visible change in their posting. Spending outreach energy here usually isn't worth it yet."},
];
function getTier(score){
  return TIERS.find(t=>score>=t.min) || TIERS[TIERS.length-1];
}

const ECONOMICS = [
  {tier:"Starter", monthly:"$500–$700/mo", annual:"$6,000–$8,400/yr", color:"#0D7A5F"},
  {tier:"Growth", monthly:"$800–$1,200/mo", annual:"$9,600–$14,400/yr", color:"#7A5A00"},
  {tier:"Authority", monthly:"$1,300–$1,800/mo", annual:"$15,600–$21,600/yr", color:"#8B2E1F"},
];

const fieldStyle = {
  width:"100%", boxSizing:"border-box", background:"#F5F0E4", border:"1px solid #FBF8F1",
  borderRadius:8, padding:"10px 12px", fontSize:12.5, color:"#201A16", fontFamily:"inherit",
};

function Chevron({open}) {
  return <span style={{color:"#D9CFBB",fontSize:19,display:"inline-block",
    transform:open?"rotate(90deg)":"none",transition:"transform .2s",flexShrink:0}}>›</span>;
}

function SLabel({text,color}) {
  return (
    <div style={{fontSize:10,fontWeight:700,color,textTransform:"uppercase",
      letterSpacing:".08em",marginBottom:7}}>{text}</div>
  );
}

function Num({n,color}) {
  return (
    <div style={{width:24,height:24,borderRadius:"50%",background:color+"18",
      border:`1px solid ${color}50`,display:"flex",alignItems:"center",justifyContent:"center",
      fontSize:11,fontWeight:800,color,flexShrink:0}}>{n}</div>
  );
}

function Block({label,color,icon,text}) {
  return (
    <div style={{marginTop:12}}>
      <div style={{fontSize:10,fontWeight:700,color,textTransform:"uppercase",
        letterSpacing:".07em",marginBottom:5}}>{icon} {label}</div>
      <p style={{fontSize:13,color:"#6E6459",margin:0,lineHeight:1.6,
        borderLeft:`2px solid ${color}40`,paddingLeft:10}}>{text}</p>
    </div>
  );
}

function ListBlock({label,color,icon,items}) {
  return (
    <div style={{marginTop:12}}>
      <div style={{fontSize:10,fontWeight:700,color,textTransform:"uppercase",
        letterSpacing:".07em",marginBottom:5}}>{icon} {label}</div>
      <div style={{borderLeft:`2px solid ${color}40`,paddingLeft:10,display:"flex",
        flexDirection:"column",gap:5}}>
        {items.map((it,idx)=>(
          <p key={idx} style={{fontSize:13,color:"#6E6459",margin:0,lineHeight:1.55}}>• {it}</p>
        ))}
      </div>
    </div>
  );
}

function Row({label,color,value}) {
  return (
    <div style={{marginTop:12,background:color+"0D",border:`1px solid ${color}25`,
      borderRadius:8,padding:"9px 11px"}}>
      <div style={{fontSize:10,fontWeight:700,color,textTransform:"uppercase",
        letterSpacing:".06em",marginBottom:3}}>{label}</div>
      <div style={{fontSize:13,fontWeight:600,color:"#201A16",lineHeight:1.5}}>{value}</div>
    </div>
  );
}

function TierBadge({tier}) {
  return (
    <span style={{fontSize:11,fontWeight:700,color:tier.color,background:tier.color+"18",
      border:`1px solid ${tier.color}40`,borderRadius:999,padding:"3px 9px",whiteSpace:"nowrap",
      display:"inline-flex",alignItems:"center",gap:4}}>{tier.emoji} {tier.name}</span>
  );
}

function ScoreGauge({score,tier}) {
  return (
    <div>
      <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:10,flexWrap:"wrap"}}>
        <span style={{fontSize:40,fontWeight:800,color:tier.color,lineHeight:1}}>{score}</span>
        <span style={{fontSize:13,color:"#D9CFBB"}}>/ 100</span>
        <span style={{marginLeft:"auto",fontSize:13,fontWeight:700,color:tier.color,
          background:tier.color+"18",border:`1px solid ${tier.color}40`,borderRadius:999,
          padding:"5px 12px",whiteSpace:"nowrap"}}>{tier.emoji} {tier.name}</span>
      </div>
      <div style={{position:"relative",height:14,borderRadius:999,
        background:"linear-gradient(90deg,#D9CFBB 0%,#7A5A00 34%,#C99A3B 65%,#8B0000 100%)",
        marginBottom:6}}>
        <div style={{position:"absolute",top:-4,left:`calc(${score}% - 3px)`,width:6,height:22,
          borderRadius:3,background:"#201A16",boxShadow:"0 0 0 2px #F5F0E4, 0 1px 4px rgba(32,26,22,0.3)",
          transition:"left .3s"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#D9CFBB"}}>
        <span>Cold</span><span>Cool</span><span>Warm</span><span>Hot</span>
      </div>
    </div>
  );
}

export default function TheProspectingEngine() {
  const [tab,setTab] = useState("overview");
  const [openTarget,setOpenTarget] = useState(null);
  const [openLocation,setOpenLocation] = useState(null);
  const [answers,setAnswers] = useState({});
  const [form,setForm] = useState({name:"",persona:"",platform:"",notes:""});
  const [savedFlash,setSavedFlash] = useState(null);
  const [prospects,setProspects] = useState([]);
  const [prospectsLoading,setProspectsLoading] = useState(true);
  const [trackerFilter,setTrackerFilter] = useState("all");

  useEffect(()=>{
    let cancelled=false;
    (async()=>{
      try{
        const res = await window.storage.get("prospects", false);
        if(!cancelled && res && res.value){
          const parsed = JSON.parse(res.value);
          if(Array.isArray(parsed)) setProspects(parsed);
        }
      }catch(e){
        // nothing saved yet, or storage unavailable — start empty
      }
      if(!cancelled) setProspectsLoading(false);
    })();
    return ()=>{ cancelled=true; };
  },[]);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount===SCORING_QUESTIONS.length;
  const liveScore = SCORING_QUESTIONS.reduce((sum,q)=>{
    const oi = answers[q.id];
    return sum + (oi!=null ? q.options[oi].points : 0);
  },0);
  const liveTier = getTier(liveScore);

  const tierCounts = useMemo(()=>{
    const counts={};
    TIERS.forEach(t=>{ counts[t.name]=0; });
    prospects.forEach(p=>{ if(counts[p.tierName]!=null) counts[p.tierName]++; });
    return counts;
  },[prospects]);

  const visibleProspects = useMemo(()=>{
    const list = trackerFilter==="all" ? prospects : prospects.filter(p=>p.tierName===trackerFilter);
    return [...list].sort((a,b)=>b.score-a.score);
  },[prospects,trackerFilter]);

  const selectAnswer = (qid,oi) => { setAnswers(a=>({...a,[qid]:oi})); setSavedFlash(null); };
  const updateForm = (key,val) => setForm(f=>({...f,[key]:val}));
  const resetScorer = () => { setAnswers({}); setForm({name:"",persona:"",platform:"",notes:""}); setSavedFlash(null); };

  const persist = async (next) => {
    setProspects(next);
    try{ await window.storage.set("prospects", JSON.stringify(next), false); }catch(e){ /* saved for this session only */ }
  };
  const saveProspect = async () => {
    if(!form.name.trim()) return;
    const record = {
      id: Date.now()+"-"+Math.random().toString(36).slice(2,7),
      name: form.name.trim(), persona: form.persona, platform: form.platform,
      notes: form.notes.trim(), score: liveScore, tierName: liveTier.name,
      dateAdded: new Date().toISOString(),
    };
    await persist([record, ...prospects]);
    setSavedFlash(`Saved ${record.name} as a ${liveTier.name}.`);
    setAnswers({});
    setForm({name:"",persona:"",platform:"",notes:""});
  };
  const deleteProspect = (id) => persist(prospects.filter(p=>p.id!==id));

  const TABS=[
    {id:"overview", label:"🎯 Overview"},
    {id:"targets",  label:"🧑‍💼 Top 10 Targets"},
    {id:"locations",label:"📍 Top 5 Locations"},
    {id:"scorer",   label:"🔥 Lead Scorer"},
    {id:"tracker",  label:"🗂️ Prospect Tracker"},
    {id:"method",   label:"📐 The Math & Method"},
  ];

  return (
    <div style={{fontFamily:"'Inter',system-ui,-apple-system,sans-serif",
      background:"#F5F0E4",minHeight:"100vh",color:"#201A16"}}>
      <style>{`
        .pe-field:focus{ border-color:#7A5A00 !important; box-shadow:0 0 0 3px #7A5A0033; outline:none; }
        .pe-btn:hover{ filter:brightness(1.08); }
        @media (prefers-reduced-motion: reduce){ *{ transition:none !important; } }
      `}</style>

      {/* HEADER */}
      <div style={{background:"linear-gradient(160deg,#F8F5EE 0%,#F8F5EE 60%,#F5F0E4 100%)",
        padding:"22px 16px 18px",borderBottom:"1px solid #FBF8F1"}}>
        <div style={{maxWidth:880,margin:"0 auto"}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",color:"#0D7A5F",
            textTransform:"uppercase",marginBottom:7,display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"#0D7A5F",
              boxShadow:"0 0 6px #0D7A5F",display:"inline-block"}}/>
            The Authority Engine — Part 2: Prospecting System
          </div>
          <h1 style={{margin:"0 0 7px",fontSize:"clamp(21px,4.5vw,33px)",fontWeight:800,
            lineHeight:1.15,background:"linear-gradient(135deg,#201A16 30%,#C99A3B 100%)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            The Prospecting & Lead Scoring System
          </h1>
          <p style={{margin:"0 0 14px",fontSize:12.5,color:"#D9CFBB",maxWidth:580,lineHeight:1.65}}>
            Ten proven buyer types, five places to find them, and a weighted scorecard that
            separates a hot lead from a wasted free sample — before you ever send the DM.
          </p>
          <div style={{background:"#F5F0E4",border:"1px solid #7A5A0030",borderRadius:10,
            padding:"11px 14px",marginBottom:14}}>
            <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.6}}>
              <strong style={{color:"#C99A3B"}}>Why scoring first:</strong> roughly three in four
              B2B decision-makers say they trust thought leadership content more than a company's
              own marketing material — but "could benefit from this" and "ready to say yes this
              month" are two very different lists. This system exists to tell them apart.
            </p>
          </div>
          <div style={{background:"#F8F5EE",borderRadius:10,padding:"11px 14px",border:"1px solid #FBF8F1"}}>
            {prospects.length===0 ? (
              <p style={{fontSize:12.5,color:"#D9CFBB",margin:0,lineHeight:1.5}}>
                No prospects tracked yet — score your first one in the 🔥 Lead Scorer tab.
              </p>
            ) : (
              <>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                  <span style={{fontSize:12,fontWeight:600,color:"#6E6459"}}>Prospects Tracked</span>
                  <span style={{fontSize:13,fontWeight:800,color:"#201A16"}}>{prospects.length} total</span>
                </div>
                <div style={{display:"flex",height:8,borderRadius:999,overflow:"hidden",
                  marginBottom:7,background:"#FBF8F1"}}>
                  {TIERS.map(t=> tierCounts[t.name]>0 && (
                    <div key={t.name} style={{flex:tierCounts[t.name],background:t.color}}/>
                  ))}
                </div>
                <div style={{display:"flex",gap:11,flexWrap:"wrap"}}>
                  {TIERS.map(t=>(
                    <span key={t.name} style={{fontSize:11,color:"#D9CFBB"}}>
                      {t.emoji} {tierCounts[t.name]||0} {t.name.split(" ")[0].toLowerCase()}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{background:"#F8F5EE",borderBottom:"1px solid #FBF8F1",position:"sticky",top:0,zIndex:20}}>
        <div style={{maxWidth:880,margin:"0 auto",display:"flex",padding:"0 8px",overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              background:"transparent",border:"none",
              borderBottom:tab===t.id?"2px solid #7A5A00":"2px solid transparent",
              color:tab===t.id?"#C99A3B":"#D9CFBB",
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
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>How This System Works</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 16px",lineHeight:1.6}}>
              Three moves, in order: know WHO to target, know WHERE to find them, and score every
              real prospect before you spend a DM on them. This assumes you've already picked one
              persona from Part 1's playbook — everything here goes deeper on that same decision.
            </p>

            <SLabel text="The 4-Step Loop" color="#0D7A5F"/>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                {n:1,color:"#7A5A00",title:"Pick your persona",desc:"Confirm the one persona you're specializing in from the Top 10 Targets tab — or Part 1, if you already chose."},
                {n:2,color:"#C99A3B",title:"Go find 15–20 real people",desc:"Use the Top 5 Locations tab to identify actual professionals who fit — real names, real profiles."},
                {n:3,color:"#8B2E1F",title:"Run each one through the Lead Scorer",desc:"Eight quick questions turn what you know about them into a single 0–100 score."},
                {n:4,color:"#0D7A5F",title:"Track them all, hottest first",desc:"Save every scored prospect to the Prospect Tracker so nothing falls through the cracks."},
              ].map(s=>(
                <div key={s.n} style={{display:"flex",gap:12,alignItems:"flex-start",
                  background:"#F8F5EE",border:"1px solid #FBF8F1",borderRadius:10,padding:"12px 14px"}}>
                  <Num n={s.n} color={s.color}/>
                  <div>
                    <div style={{fontSize:13.5,fontWeight:700,color:"#201A16",marginBottom:2}}>{s.title}</div>
                    <div style={{fontSize:12.5,color:"#6E6459",lineHeight:1.55}}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TARGETS */}
        {tab==="targets"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Top 10 Targets</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 16px",lineHeight:1.6}}>
              The ten professional types most likely to say yes — chosen for real buying signals,
              not for how big their audience already is. Tap one open for the full profile.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {TARGETS.map((t,i)=>{
                const isOpen=openTarget===i;
                return (
                  <div key={i} onClick={()=>setOpenTarget(isOpen?null:i)}
                    style={{background:isOpen?"#FBF8F1":"#F8F5EE",
                      border:`1px solid ${isOpen?"#7A5A00":"#FBF8F1"}`,
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"13px 15px",display:"flex",alignItems:"center",gap:11}}>
                      <span style={{fontSize:22,flexShrink:0}}>{t.icon}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:14,color:"#201A16"}}>{t.name}</div>
                        <div style={{fontSize:11,color:"#D9CFBB",marginTop:1}}>{t.tag}</div>
                      </div>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 15px 16px",borderTop:"1px solid #FBF8F1"}}>
                        <Block label="Why This Works" color="#0D7A5F" icon="💡" text={t.why}/>
                        <Block label="The Pain Signal" color="#C99A3B" icon="🔍" text={t.pain}/>
                        <Row label="Typical Budget" color="#8B2E1F" value={t.budget}/>
                        <ListBlock label="Urgency Triggers To Watch For" color="#7A5A00" icon="⚡" items={t.triggers}/>
                        <ListBlock label="Where To Find Them" color="#0D7A5F" icon="📍" items={t.find}/>
                        <Block label="Opening Angle" color="#7A5A00" icon="🎯" text={t.angle}/>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LOCATIONS */}
        {tab==="locations"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Top 5 Locations</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 16px",lineHeight:1.6}}>
              Where to actually find the ten targets above — with no scraping, no automation, and
              no tool that puts the account you're building at risk.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {LOCATIONS.map((l,i)=>{
                const isOpen=openLocation===i;
                return (
                  <div key={i} onClick={()=>setOpenLocation(isOpen?null:i)}
                    style={{background:isOpen?"#FBF8F1":"#F8F5EE",
                      border:`1px solid ${isOpen?l.color:"#FBF8F1"}`,
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"13px 15px",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:38,height:38,borderRadius:9,background:l.color+"18",
                        border:`1px solid ${l.color}35`,display:"flex",alignItems:"center",
                        justifyContent:"center",fontSize:19,flexShrink:0}}>{l.icon}</div>
                      <div style={{flex:1,fontWeight:700,fontSize:14,color:"#201A16"}}>{l.name}</div>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 15px 16px",borderTop:"1px solid #FBF8F1"}}>
                        <Block label="Why It Works" color={l.color} icon="💡" text={l.why}/>
                        <Row label="Best For" color={l.color} value={l.bestFor}/>
                        <ListBlock label="How To Actually Do It" color={l.color} icon="🛠️" items={l.tactics}/>
                        {l.caution&&<Block label="Compliance & Etiquette" color="#8B0000" icon="⚠️" text={l.caution}/>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SCORER */}
        {tab==="scorer"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Lead Scorer</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 14px",lineHeight:1.6}}>
              Answer what you know about one real prospect. The score updates live — answer all
              eight to save them to your tracker.
            </p>

            {savedFlash&&(
              <div style={{background:"#0D7A5F15",border:"1px solid #0D7A5F40",borderRadius:9,
                padding:"10px 13px",marginBottom:14,fontSize:12.5,color:"#0D7A5F",fontWeight:600}}>
                ✓ {savedFlash} View it in the 🗂️ Prospect Tracker tab.
              </div>
            )}

            <div style={{background:"#F8F5EE",border:"1px solid #FBF8F1",borderRadius:12,
              padding:"16px",marginBottom:16}}>
              <ScoreGauge score={liveScore} tier={liveTier}/>
              <p style={{fontSize:12,color:"#6E6459",margin:"10px 0 0",lineHeight:1.55}}>
                <strong style={{color:liveTier.color}}>{answeredCount}/{SCORING_QUESTIONS.length} answered.</strong>{" "}
                {liveTier.action}
              </p>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>
              {SCORING_QUESTIONS.map(q=>(
                <div key={q.id} style={{background:"#F8F5EE",border:"1px solid #FBF8F1",
                  borderRadius:11,padding:"13px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                    <span style={{fontSize:16}}>{q.icon}</span>
                    <span style={{fontSize:13.5,fontWeight:700,color:"#201A16"}}>{q.label}</span>
                  </div>
                  <p style={{fontSize:11.5,color:"#D9CFBB",margin:"0 0 10px",lineHeight:1.4}}>{q.sub}</p>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {q.options.map((opt,oi)=>{
                      const selected = answers[q.id]===oi;
                      return (
                        <button key={oi} className="pe-btn" onClick={()=>selectAnswer(q.id,oi)}
                          style={{textAlign:"left",display:"flex",justifyContent:"space-between",
                            alignItems:"center",gap:10,width:"100%",fontFamily:"inherit",cursor:"pointer",
                            background:selected?q.color+"18":"#F5F0E4",
                            border:`1px solid ${selected?q.color:"#FBF8F1"}`,
                            borderRadius:8,padding:"9px 12px"}}>
                          <span style={{fontSize:12.5,color:selected?"#201A16":"#6E6459",lineHeight:1.4}}>{opt.label}</span>
                          <span style={{fontSize:11,fontWeight:800,color:selected?q.color:"#D9CFBB",
                            flexShrink:0}}>+{opt.points}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {allAnswered ? (
              <div style={{background:"#FBF8F1",border:`1px solid ${liveTier.color}40`,borderRadius:12,
                padding:"16px"}}>
                <SLabel text="Save This Prospect" color={liveTier.color}/>
                <input className="pe-field" placeholder="Their name"
                  value={form.name} onChange={e=>updateForm("name",e.target.value)}
                  style={{...fieldStyle,marginBottom:9}}/>
                <div style={{display:"flex",gap:9,marginBottom:9,flexWrap:"wrap"}}>
                  <select className="pe-field" value={form.persona}
                    onChange={e=>updateForm("persona",e.target.value)}
                    style={{...fieldStyle,flex:"1 1 160px"}}>
                    <option value="">Persona (optional)</option>
                    {TARGETS.map(t=><option key={t.name} value={t.name}>{t.name}</option>)}
                  </select>
                  <select className="pe-field" value={form.platform}
                    onChange={e=>updateForm("platform",e.target.value)}
                    style={{...fieldStyle,flex:"1 1 160px"}}>
                    <option value="">Found on (optional)</option>
                    {LOCATIONS.map(l=><option key={l.name} value={l.name}>{l.name}</option>)}
                  </select>
                </div>
                <textarea className="pe-field" placeholder="Notes (optional)" rows={2}
                  value={form.notes} onChange={e=>updateForm("notes",e.target.value)}
                  style={{...fieldStyle,marginBottom:11,resize:"vertical"}}/>
                <div style={{display:"flex",gap:9}}>
                  <button className="pe-btn" onClick={saveProspect} disabled={!form.name.trim()}
                    style={{flex:1,background:form.name.trim()?liveTier.color:"#FBF8F1",
                      color:form.name.trim()?"#F5F0E4":"#D9CFBB",border:"none",borderRadius:9,
                      padding:"11px",fontSize:13,fontWeight:700,
                      cursor:form.name.trim()?"pointer":"not-allowed",fontFamily:"inherit"}}>
                    Save to Tracker
                  </button>
                  <button className="pe-btn" onClick={resetScorer}
                    style={{background:"transparent",color:"#D9CFBB",border:"1px solid #FBF8F1",
                      borderRadius:9,padding:"11px 14px",fontSize:13,fontWeight:600,cursor:"pointer",
                      fontFamily:"inherit"}}>
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <p style={{fontSize:12,color:"#D9CFBB",textAlign:"center"}}>
                Answer all 8 factors above to save this prospect.
              </p>
            )}
          </div>
        )}

        {/* TRACKER */}
        {tab==="tracker"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Prospect Tracker</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 14px",lineHeight:1.6}}>
              Every prospect you've scored, saved automatically and sorted hottest-first. This list
              is private to you and stays here between visits.
            </p>

            {prospectsLoading ? (
              <p style={{fontSize:12.5,color:"#D9CFBB"}}>Loading your saved prospects…</p>
            ) : prospects.length===0 ? (
              <div style={{background:"#F8F5EE",border:"1px dashed #FBF8F1",borderRadius:12,
                padding:"28px 18px",textAlign:"center"}}>
                <div style={{fontSize:28,marginBottom:8}}>🗂️</div>
                <p style={{fontSize:13,color:"#6E6459",margin:"0 0 4px",fontWeight:600}}>No prospects yet</p>
                <p style={{fontSize:12,color:"#D9CFBB",margin:0,lineHeight:1.5}}>
                  Head to the 🔥 Lead Scorer tab and score your first real prospect to start building this list.
                </p>
              </div>
            ) : (
              <>
                <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:14}}>
                  {["all","Hot Lead","Warm Lead","Cool Lead","Cold — Deprioritize"].map(f=>(
                    <button key={f} className="pe-btn" onClick={()=>setTrackerFilter(f)}
                      style={{background:trackerFilter===f?"#7A5A00":"#F8F5EE",
                        color:trackerFilter===f?"#201A16":"#6E6459",
                        border:`1px solid ${trackerFilter===f?"#7A5A00":"#FBF8F1"}`,
                        borderRadius:999,padding:"6px 12px",fontSize:11.5,fontWeight:600,
                        cursor:"pointer",fontFamily:"inherit"}}>
                      {f==="all"?"All":f}
                    </button>
                  ))}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {visibleProspects.map(p=>{
                    const t = TIERS.find(x=>x.name===p.tierName) || TIERS[TIERS.length-1];
                    return (
                      <div key={p.id} style={{background:"#F8F5EE",border:"1px solid #FBF8F1",
                        borderRadius:10,padding:"12px 14px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:14,fontWeight:700,color:"#201A16"}}>{p.name}</div>
                            <div style={{fontSize:11.5,color:"#D9CFBB",marginTop:2}}>
                              {[p.persona,p.platform].filter(Boolean).join(" · ") || "No persona or platform noted"}
                            </div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                            <span style={{fontSize:16,fontWeight:800,color:t.color}}>{p.score}</span>
                            <button className="pe-btn" onClick={()=>deleteProspect(p.id)}
                              aria-label={`Remove ${p.name}`}
                              style={{background:"transparent",border:"none",color:"#D9CFBB",
                                fontSize:16,cursor:"pointer",padding:2,lineHeight:1}}>×</button>
                          </div>
                        </div>
                        <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                          <TierBadge tier={t}/>
                          {p.notes&&<span style={{fontSize:12,color:"#6E6459"}}>{p.notes}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* METHOD */}
        {tab==="method"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>The Math & Method</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 16px",lineHeight:1.6}}>
              What the 8 factors actually measure, what the tiers mean, and the honest arithmetic
              behind "up to 10 clients a year."
            </p>

            <SLabel text="The 8 Scoring Factors" color="#7A5A00"/>
            <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:20}}>
              {SCORING_QUESTIONS.map(q=>(
                <div key={q.id} style={{background:"#F8F5EE",border:"1px solid #FBF8F1",borderRadius:9,
                  padding:"10px 13px",display:"flex",gap:11,alignItems:"flex-start"}}>
                  <span style={{fontSize:16,flexShrink:0,marginTop:1}}>{q.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:2}}>
                      <span style={{fontSize:13,fontWeight:700,color:"#201A16"}}>{q.label}</span>
                      <span style={{fontSize:10,background:q.color+"18",border:`1px solid ${q.color}35`,
                        borderRadius:5,padding:"1px 7px",color:q.color,fontWeight:700}}>
                        up to {Math.max(...q.options.map(o=>o.points))} pts
                      </span>
                    </div>
                    <p style={{fontSize:12,color:"#6E6459",margin:0,lineHeight:1.5}}>{q.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <SLabel text="What Each Score Means" color="#C99A3B"/>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:22}}>
              {TIERS.map((t,i)=>{
                const upper = i===0 ? 100 : TIERS[i-1].min-1;
                return (
                  <div key={t.name} style={{background:t.color+"0D",border:`1px solid ${t.color}30`,
                    borderRadius:10,padding:"12px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,flexWrap:"wrap"}}>
                      <span style={{fontSize:13.5,fontWeight:800,color:t.color}}>{t.emoji} {t.name}</span>
                      <span style={{fontSize:11,color:"#D9CFBB"}}>{t.min}–{upper} pts</span>
                    </div>
                    <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.55}}>{t.action}</p>
                  </div>
                );
              })}
            </div>

            <SLabel text="Illustrative Path to Six Figures" color="#0D7A5F"/>
            <div style={{background:"#F5F0E4",border:"1px solid #0D7A5F25",borderRadius:12,
              padding:"16px",marginBottom:16}}>
              <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 12px",lineHeight:1.6}}>
                This is arithmetic, not a promise — nobody can guarantee you'll close 10 clients or
                hold this exact mix. It's the same package pricing from Part 1's Packages tab, laid
                out so you can see exactly where the number comes from and adjust it to your own reality.
              </p>
              {ECONOMICS.map(e=>(
                <div key={e.tier} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                  padding:"9px 0",borderBottom:"1px solid #FBF8F1"}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"#201A16"}}>{e.tier}</div>
                    <div style={{fontSize:11,color:"#D9CFBB"}}>{e.monthly}</div>
                  </div>
                  <div style={{fontSize:13,fontWeight:700,color:e.color,textAlign:"right"}}>{e.annual}</div>
                </div>
              ))}
              <div style={{marginTop:12,background:"#0D7A5F12",borderRadius:8,padding:"11px 13px"}}>
                <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.6}}>
                  A mix of <strong style={{color:"#201A16"}}>4 Starter + 4 Growth + 2 Authority</strong> —
                  10 client slots total — lands around <strong style={{color:"#0D7A5F"}}>$114,000/year</strong>,
                  using the midpoint of each tier's pricing. Fewer, higher-tier clients gets there with
                  less volume; more Starter-tier clients means more relationships to manage for the
                  same total.
                </p>
              </div>
            </div>

            <SLabel text="On Competition" color="#8B2E1F"/>
            <div style={{background:"#F8F5EE",border:"1px solid #FBF8F1",borderRadius:12,padding:"16px"}}>
              <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.65}}>
                No honest guide can promise zero competition. What actually keeps students from
                competing with each other is two real mechanisms stacked together: persona
                specialization carried over from Part 1 — a student writing for real estate team
                leads and one writing for legal consultants are never fishing in the same pond, even
                running an identical system — and the fact that three of the ten targets here
                (venture capitalists, authors/speakers, and legal consultants) are genuinely less
                crowded with ghostwriters than the SaaS-founder or executive-coach lanes most guides
                default to.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
