import { useState, useMemo } from "react";

const COUNTRIES = [
  {rank:1, flag:"🇳🇬", name:"Nigeria", color:"#0D7A5F",
   tag:"The anchor market",
   why:"Africa's largest Christian population and, alongside Kenya, the continent's megachurch capital — roughly two-thirds of Africa's largest congregations are based in these two countries alone. Extended-family and denominational trust networks run deep here, which is exactly the soil this system was built for.",
   rail:"Paystack, Flutterwave, direct bank transfer",
   competition:"Low-to-Medium. The global ChMS incumbents (Tithe.ly, Pushpay, Planning Center) have almost no footprint outside a handful of the largest megachurches. A wave of homegrown 'worship tech' tools is emerging in 2026, but the small-and-mid parish market — the vast majority of congregations — remains wide open.",
   bestFits:["Local Parish / Congregation","Diocese / Denominational Network","Media & Broadcast Ministry"],
   signal:"Three or more annual events still tracked on paper or a WhatsApp headcount, and giving is envelope-only even though most members already use a bank app daily."},
  {rank:2, flag:"🇰🇪", name:"Kenya", color:"#7A5A00",
   tag:"The mobile-money proof case",
   why:"East Africa's other megachurch capital, sitting on top of the most advanced mobile-money culture on earth. Where most markets need convincing that digital giving is safe, Kenyan congregants already trust mobile money with their salary, rent, and school fees — digital tithing is a small leap here, not a big one.",
   rail:"M-Pesa, Airtel Money",
   competition:"Low. Near-total absence of Western ChMS platforms outside a handful of the largest Nairobi churches.",
   bestFits:["Local Parish / Congregation","Youth & Campus Ministry","Relief & Development NGO"],
   signal:"Congregation already uses mobile money daily for personal life, but the parish itself still collects only physical cash during the service."},
  {rank:3, flag:"🇬🇭", name:"Ghana", color:"#C99A3B",
   tag:"The natural second market",
   why:"Culturally adjacent to Nigeria's charismatic movement, broadly English-speaking, and home to one of West Africa's fastest-growing mobile money bases. For a student who has already proven the model in Nigeria, Ghana is usually the easiest next country — similar church culture, similar tools, similar trust dynamics.",
   rail:"MTN Mobile Money, Vodafone Cash, Telecel Cash",
   competition:"Low.",
   bestFits:["Local Parish / Congregation","Faith-Based School / Seminary"],
   signal:"Fast-growing charismatic congregation running youth camps or crusades with no formal registration system."},
  {rank:4, flag:"🇺🇬", name:"Uganda", color:"#8B2E1F",
   tag:"The under-pitched majority",
   why:"One of the most Christian-majority nations in the world by share of population, in a region where mobile money already contributes more than 5% of GDP. Very few parishes here have ever been formally pitched a digital tool of any kind, which means almost every warm relationship is a genuinely fresh conversation.",
   rail:"MTN MoMo, Airtel Money",
   competition:"Low.",
   bestFits:["Local Parish / Congregation","Relief & Development NGO"],
   signal:"Denomination runs a national conference or camp meeting with no centralized headcount across attending parishes."},
  {rank:5, flag:"🇿🇦", name:"South Africa", color:"#7A5A00",
   tag:"The higher-budget market",
   why:"The continent's most developed economy, with a genuinely diverse denominational landscape — Dutch Reformed, Anglican, Catholic, and a fast-growing charismatic scene — and real budget headroom for the Full Ministry tier, not just Foundation.",
   rail:"PayFast, EFT, card",
   competition:"Medium. A few Western vendors already sell into the largest urban congregations, so the clearer opening is mid-size, township, and rural congregations those vendors never reach.",
   bestFits:["Diocese / Denominational Network","Faith-Based School / Seminary"],
   signal:"Mid-size congregation running a building fund or missions program entirely through spreadsheets or a paper ledger."},
  {rank:6, flag:"🇵🇭", name:"Philippines", color:"#0D7A5F",
   tag:"The relational-culture fit",
   why:"One of the largest Catholic populations on earth, alongside a fast-growing Born-Again and Evangelical movement, sitting on top of near-universal GCash adoption. The culture's own 'kapamilya' (extended-family) instinct is the warm-network model this whole system runs on, already built into daily life.",
   rail:"GCash, Maya, QR Ph",
   competition:"Low-to-Medium.",
   bestFits:["Local Parish / Congregation","Youth & Campus Ministry"],
   signal:"Parish runs an annual fiesta, novena, or youth congress with paper sign-ups and no digital reminder system."},
  {rank:7, flag:"🇧🇷", name:"Brazil", color:"#7A5A00",
   tag:"The fastest-growing congregation count",
   why:"Evangelical and Pentecostal congregations have multiplied for two decades running and now account for roughly a quarter of the population — on a trajectory some demographers expect to overtake Catholicism within the next several years. PIX gives Brazil a free, instant, near-universal payment rail that is arguably better giving infrastructure than most of the Western world already has.",
   rail:"PIX",
   competition:"Low, though it requires real Portuguese localization of every script and tool in this system, not just translation.",
   bestFits:["Local Parish / Congregation","Media & Broadcast Ministry"],
   signal:"Fast-growing Pentecostal congregation already livestreaming services but still collecting tithes only in person."},
  {rank:8, flag:"🇲🇽", name:"Mexico", color:"#0D7A5F",
   tag:"The Latin America anchor",
   why:"One of the largest Christian populations on earth in absolute numbers, with a Catholic majority alongside a steadily growing Evangelical minority, and strong extended-family trust networks that mirror this system's warm-referral design almost exactly.",
   rail:"CoDi, SPEI, card",
   competition:"Low, though it requires real Spanish localization.",
   bestFits:["Local Parish / Congregation","Faith-Based School / Seminary"],
   signal:"Parish runs a patronal feast day or pilgrimage with no centralized registration or communication system."},
  {rank:9, flag:"🇺🇸", name:"United States", color:"#7A5A00",
   tag:"Mature overall, wide open in one niche",
   why:"The largest market in absolute dollars — and also the most competitive, with a dozen well-funded ChMS platforms already embedded in most mid-size and large congregations. The real opening sits inside it: African, Filipino, and Latino immigrant congregations that the mature incumbents rarely design for, market to, or earn the trust of.",
   rail:"Tithe.ly, Pushpay, Stripe, Zelle",
   competition:"High overall — Low inside the immigrant/diaspora-congregation niche specifically.",
   bestFits:["Diaspora Congregation","Diocese / Denominational Network"],
   signal:"First-generation immigrant congregation renting a shared space, growing fast, running everything through one overworked pastor's phone."},
  {rank:10, flag:"🇬🇧", name:"United Kingdom", color:"#C99A3B",
   tag:"Africa's 'reverse mission' market",
   why:"Church attendance has declined for decades among historically native congregations, but African-led diaspora churches are reportedly among the fastest-growing — and in some cities, among the largest — congregations in the country. Mainstream UK ChMS options rarely target this specific, fast-growing community.",
   rail:"GoCardless, Stripe, bank transfer",
   competition:"High overall — Low inside the diaspora-congregation niche. Note the added layer of UK data-protection (GDPR) expectations.",
   bestFits:["Diaspora Congregation"],
   signal:"Nigerian-, Ghanaian-, or Caribbean-founded congregation renting a hall or former cinema, growing across multiple UK cities, coordinated entirely by WhatsApp."},
];

const MINISTRY_TYPES = [
  {icon:"⛪", color:"#7A5A00", name:"Local Parish / Congregation",
   blurb:"The foundational unit of this whole system — a single church, parish, or assembly with one primary pastor or priest. This is every student's own starting point, and remains the highest-volume, most warmly-reachable client type anywhere in the world.",
   size:"Typically under 500 members; budget usually modest and controlled by one or two decision-makers.",
   entryService:"Event Registration & Check-In System",
   receptiveness:"Highest of any type when approached by someone already inside the community — lowest when approached cold."},
  {icon:"🏛️", color:"#0D7A5F", name:"Diocese / Denominational Network",
   blurb:"The regional or national body overseeing many member parishes — a diocese, a denominational headquarters, or a conference or convention structure. One relationship here can open doors to dozens of individual congregations at once.",
   size:"Institutional budgets, often with a dedicated communications or administrative office.",
   entryService:"Full Ministry Package, typically rolled out parish-by-parish after a diocesan-level pilot",
   receptiveness:"Slower to close (committee-driven), but by far the highest referral multiplier once trust is established."},
  {icon:"📖", color:"#C99A3B", name:"Faith-Based School / Seminary",
   blurb:"Christian academies, Sunday schools operating at scale, Bible colleges, and seminaries. Enrollment, parent communication, and tuition or fee collection map directly onto this system's existing services.",
   size:"Often better-funded than the median congregation, with clearer budget lines for administrative software.",
   entryService:"Event Registration & Check-In System, upgraded quickly to the Digital Formation & Course Platform",
   receptiveness:"High. Education administrators are typically the most software-comfortable decision-makers anywhere in this guide."},
  {icon:"🙋", color:"#8B2E1F", name:"Youth & Campus Ministry",
   blurb:"Youth groups, campus fellowships, and parachurch organizations built around camps, retreats, conferences, and weekly gatherings. Extremely event-heavy by nature.",
   size:"Budgets are often thin and volunteer-run, but leadership is usually the most social-media-fluent in any congregation.",
   entryService:"Event Registration & Check-In System",
   receptiveness:"High. Usually the easiest and fastest first pilot in any parish, since the pain — paper camp sign-ups — is immediate and visible."},
  {icon:"🤝", color:"#7A5A00", name:"Relief & Development NGO",
   blurb:"Faith-based charities, community development organizations, and disaster-relief arms often operating alongside or inside a denomination. Donor communication and reporting are core to their mission, not an afterthought.",
   size:"Varies widely; the best-run ones are already grant-literate and comfortable with dashboards and reporting.",
   entryService:"Digital Giving & Stewardship System, paired with the Congregant Communication Hub for donor updates",
   receptiveness:"Medium-High. Most receptive when the pitch is framed around donor trust and transparency, not fundraising volume."},
  {icon:"📡", color:"#0D7A5F", name:"Media & Broadcast Ministry",
   blurb:"Television, radio, podcast, and online-only ministries built around teaching content. Already producing digital content, which shortens the sales cycle considerably.",
   size:"Ranges from a single-person YouTube ministry to national broadcast networks.",
   entryService:"Digital Formation & Course Platform",
   receptiveness:"High. Already tech-forward, so the conversation is about organizing existing content rather than justifying 'going digital' at all."},
  {icon:"🌍", color:"#7A5A00", name:"Diaspora Congregation",
   blurb:"Immigrant-founded or immigrant-majority congregations operating outside their country of origin — Nigerian, Ghanaian, Filipino, and Latino churches in the US, UK, and Gulf states are the largest examples.",
   size:"Often higher per-capita giving capacity than the equivalent congregation back home, with English-fluent, multi-generational leadership.",
   entryService:"Digital Giving & Stewardship System, since remittance-minded congregations already trust digital money movement",
   receptiveness:"High relationship density inside the community, but slower formal decision processes (boards, trustees) in the US and UK specifically."},
];

const SCORE_FACTORS = [
  {key:"warmth", label:"Relationship Warmth", max:25,
   help:"How close is this relationship, really, today — not in theory?",
   options:[
     {label:"This is my own parish or ministry", points:25},
     {label:"Close personal relationship (family, friend, mentor)", points:20},
     {label:"Warm referral from a trusted mutual contact", points:14},
     {label:"Same diocese or denomination, no personal tie yet", points:8},
     {label:"No real connection yet", points:0},
   ]},
  {key:"pain", label:"Pain Signal Strength", max:25,
   help:"How clear and specific is the problem you would actually be solving?",
   options:[
     {label:"I've personally witnessed the exact problem: paper chaos, envelope-only giving, scattered comms", points:25},
     {label:"Leadership has directly told me about this pain point", points:19},
     {label:"I suspect it, but haven't confirmed it", points:10},
     {label:"No known pain point yet", points:0},
   ]},
  {key:"capacity", label:"Capacity to Pay", max:20,
   help:"This should shape which tier you propose — never whether you engage at all.",
   options:[
     {label:"Large congregation (500+) or a denominational budget line", points:20},
     {label:"Medium congregation (100-500) with some existing spend on services", points:12},
     {label:"Small but financially stable", points:6},
     {label:"Small and budget genuinely uncertain", points:2},
   ]},
  {key:"speed", label:"Decision-Making Speed", max:15,
   help:"This changes your expected timeline, not your priority.",
   options:[
     {label:"Single decision-maker with real autonomy (pastor or priest)", points:15},
     {label:"Small leadership team or board", points:10},
     {label:"Full committee or denominational approval required", points:5},
   ]},
  {key:"network", label:"Referral & Network Value", max:15,
   help:"If this goes well, how many doors could it realistically open?",
   options:[
     {label:"Highly networked: diocesan officer, conference organizer, denominational leader", points:15},
     {label:"Moderately connected to other congregations", points:8},
     {label:"Standalone — not especially connected", points:3},
   ]},
];

const SCORE_BANDS = [
  {min:80, max:100, label:"Hot", icon:"🔥", color:"#8B0000",
   action:"Move this week. Use the pilot-conversation or warm-introduction script and propose a specific, named event or project — don't wait for a 'better' moment."},
  {min:55, max:79, label:"Warm", icon:"🌤️", color:"#7A5A00",
   action:"Nurture for 2-4 weeks. Deepen the relationship or wait for a sharper pain signal before proposing anything. This is a real prospect, just not a this-week one."},
  {min:30, max:54, label:"Cool", icon:"🌥️", color:"#7A5A00",
   action:"Stay on the radar. Revisit in 60-90 days. Do not pitch yet — invest in the relationship first, the same way you did with your own parish."},
  {min:0, max:29, label:"Cold", icon:"❄️", color:"#6E6459",
   action:"Not ready, and that's fine. This is a 'build trust first' contact, not a 'never' one. This system does not do cold outreach, on purpose."},
];

const REVENUE_SCENARIOS = [
  {name:"Conservative", icon:"🌱", color:"#7A5A00",
   clients:"3-5 ministries",
   mix:"Mostly Foundation tier, one or two Growth",
   range:"$2,000 – $6,000/year",
   note:"A realistic first-12-months outcome for a student working their own parish plus one or two warm referrals."},
  {name:"Solid", icon:"⚡", color:"#C99A3B",
   clients:"6-8 ministries",
   mix:"Mixed Foundation and Growth, at least one Full Ministry",
   range:"$8,000 – $20,000/year",
   note:"A well-run practice after 12-24 months, with referrals starting to compound inside one diocese or denominational network."},
  {name:"Strong", icon:"🏆", color:"#0D7A5F",
   clients:"9-10 ministries",
   mix:"Majority Growth / Full Ministry, plus one diocesan or network-level relationship",
   range:"$20,000 – $45,000/year",
   note:"A mature practice, usually anchored by one institutional client — a diocese or denomination — worth more than several individual parishes combined."},
];

const REGIONAL_NOTES = [
  {icon:"🌍", color:"#0D7A5F", name:"Sub-Saharan Africa", countries:"Nigeria, Kenya, Ghana, Uganda, South Africa",
   payment:"Mobile money first: Paystack and Flutterwave in Nigeria, M-Pesa in Kenya, MTN Mobile Money across West and East Africa. Bank cards are a distant second choice.",
   comms:"WhatsApp is the default communication channel, not email. Build confirmation and reminder automations around WhatsApp Business wherever the free tier allows it.",
   culture:"Extended-family and denominational trust runs deep. A referral from a respected elder or clergy member carries far more weight than any pitch deck.",
   pilot:"Feast days, camp meetings, crusades, and harvest or thanksgiving services make the strongest first pilots: high attendance, real headcount pain, a clear before-and-after."},
  {icon:"🌏", color:"#0D7A5F", name:"Southeast Asia", countries:"Philippines",
   payment:"GCash and Maya dominate; the QR Ph standard makes accepting digital payments nearly frictionless for any organization.",
   comms:"Facebook Messenger and group chats are as central as WhatsApp is in Africa. Build around whichever channel the specific parish already uses daily.",
   culture:"The 'kapamilya' (extended-family) instinct means one trusted introduction inside a parish community tends to open several more with very little extra effort.",
   pilot:"Fiestas, novenas, and youth congresses are the highest-visibility, highest-pain-point events to pilot around."},
  {icon:"🌎", color:"#7A5A00", name:"Latin America", countries:"Brazil, Mexico",
   payment:"PIX in Brazil (free, instant, near-universal) and CoDi/SPEI in Mexico give this region some of the best digital-payment infrastructure in the world, often better than the US.",
   comms:"WhatsApp is dominant across the region. Scripts and materials need real Portuguese or Spanish localization, not just translation.",
   culture:"Fast-growing Evangelical and Pentecostal movements are especially open to new tools, even inside historically Catholic countries and communities.",
   pilot:"Patronal feast days, pilgrimages, and youth camps are strong entry points, especially for congregations already livestreaming but still collecting tithes only in person."},
  {icon:"🕊️", color:"#8B2E1F", name:"Diaspora & Immigrant Congregations", countries:"United States, United Kingdom, Canada",
   payment:"Standard card and bank-transfer rails: Stripe, Tithe.ly, Pushpay, GoCardless. The infrastructure is mature, so the opportunity is trust and fit, not payment technology.",
   comms:"Multi-generational leadership is common: a first-generation founding pastor alongside a second-generation, English-first youth or communications lead. Find whoever already 'does the tech' informally and start there.",
   culture:"Denominational HQ relationships can multiply reach fast. A UK or US 'province' of a Nigeria- or Ghana-founded denomination can open many congregations through one relationship. Expect boards and trustees to slow decisions down.",
   pilot:"A multi-site or multi-city congregation's next regional convention or anniversary event is usually the strongest pilot opportunity."},
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

export default function GlobalMinistryProspectingGuide() {
  const [tab,setTab]           = useState("start");
  const [openCountry,setOpenCountry] = useState(0);
  const [openType,setOpenType]       = useState(null);
  const [openRegion,setOpenRegion]   = useState(0);
  const [sel,setSel]                 = useState({});

  const selectOption = (key,idx) => setSel(p=>({...p,[key]:idx}));
  const resetScore    = () => setSel({});

  const totalScore = useMemo(()=>{
    return SCORE_FACTORS.reduce((sum,f)=>{
      const idx = sel[f.key];
      return idx===undefined ? sum : sum + f.options[idx].points;
    },0);
  },[sel]);
  const answeredCount = Object.keys(sel).length;
  const allAnswered   = answeredCount === SCORE_FACTORS.length;
  const band = useMemo(()=>
    SCORE_BANDS.find(b=>totalScore>=b.min && totalScore<=b.max) || SCORE_BANDS[SCORE_BANDS.length-1]
  ,[totalScore]);

  const TABS = [
    {id:"start",     label:"📖 Start Here"},
    {id:"countries", label:"🌍 Top 10 Countries"},
    {id:"types",     label:"⛪ Ministry Types"},
    {id:"scoring",   label:"🎯 Lead Scoring"},
    {id:"revenue",   label:"💵 Revenue Model"},
    {id:"regional",  label:"🗺️ Regional Notes"},
  ];

  return (
    <div style={{fontFamily:"'Inter',system-ui,-apple-system,sans-serif",
      background:"#F5F0E4", minHeight:"100vh", color:"#201A16"}}>

      {/* HEADER */}
      <div style={{background:"linear-gradient(160deg,#F8F5EE 0%,#F8F5EE 60%,#F5F0E4 100%)",
        padding:"22px 16px 18px", borderBottom:"1px solid #FBF8F1"}}>
        <div style={{maxWidth:880, margin:"0 auto"}}>
          <div style={{fontSize:10, fontWeight:700, letterSpacing:".12em", color:"#0D7A5F",
            textTransform:"uppercase", marginBottom:7, display:"flex", alignItems:"center", gap:6}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"#0D7A5F",
              boxShadow:"0 0 6px #0D7A5F",display:"inline-block"}}/>
            Global Expansion Module — Companion to the 60-Day Playbook
          </div>
          <h1 style={{margin:"0 0 7px", fontSize:"clamp(21px,4.5vw,33px)", fontWeight:800,
            lineHeight:1.15, background:"linear-gradient(135deg,#201A16 30%,#C99A3B 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>
            Global Ministry Prospecting Guide
          </h1>
          <p style={{margin:"0 0 14px", fontSize:12.5, color:"#D9CFBB", maxWidth:600, lineHeight:1.65}}>
            Where the opportunity is strongest, which ministries to prioritize, and a repeatable
            way to tell a hot lead from one that just needs more time.
          </p>
          <div style={{background:"#F5F0E4", border:"1px solid #0D7A5F30", borderRadius:10,
            padding:"11px 14px", marginBottom:14}}>
            <p style={{fontSize:12.5, color:"#6E6459", margin:0, lineHeight:1.6}}>
              <strong style={{color:"#0D7A5F"}}>Why this exists:</strong> the 60-Day Playbook proved
              the model inside one parish and one warm network. This is the zoomed-out map — the
              countries and ministry types with the strongest underlying opportunity, plus a scoring
              system for any real contact you already have. It is a targeting tool for relationships
              you have or can warmly reach, never a script for cold outreach to strangers.
            </p>
          </div>
          <div style={{background:"#F8F5EE", borderRadius:10, padding:"11px 14px",
            border:"1px solid #FBF8F1", display:"flex", flexWrap:"wrap", gap:"10px 22px"}}>
            {[
              ["10","Countries ranked"],
              ["7","Ministry & NGO types"],
              ["5","Scoring factors"],
              ["4","Regional playbooks"],
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
        <div style={{maxWidth:880, margin:"0 auto", display:"flex", padding:"0 8px", overflowX:"auto"}}>
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
      <div style={{maxWidth:880, margin:"0 auto", padding:"18px 13px 60px"}}>

        {/* START HERE */}
        {tab==="start"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>How to Use This Guide</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 14px",lineHeight:1.6}}>
              Three steps, in order. Skipping the first one is the most common mistake.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:24}}>
              {[
                {n:"1",t:"Pick your focus",c:"#7A5A00",
                 d:"Usually wherever your own warm network already lives. Check Top 10 Countries for the underlying opportunity, but don't manufacture a market where you have no real relationships yet."},
                {n:"2",t:"Score every real contact",c:"#0D7A5F",
                 d:"Run every parish, ministry, or NGO relationship you already have through the Lead Scoring tab. Hot leads get a conversation this week; everyone else gets a plan, not a pitch."},
                {n:"3",t:"Match the approach to the type and the region",c:"#C99A3B",
                 d:"Check Ministry Types for which of the 4 Services to lead with, and Regional Notes for the right payment rail and communication channel — before you ever open your mouth."},
              ].map(s=>(
                <div key={s.n} style={{background:"#F8F5EE",border:"1px solid #FBF8F1",borderRadius:11,
                  padding:"13px 15px",display:"flex",gap:13}}>
                  <div style={{width:26,height:26,borderRadius:7,background:s.c+"18",border:`1px solid ${s.c}35`,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,
                    color:s.c,flexShrink:0}}>{s.n}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:13.5,color:"#201A16",marginBottom:3}}>{s.t}</div>
                    <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.55}}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>How Students Actually Earn From This</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 14px",lineHeight:1.6}}>
              Every figure below matches the pricing already set in the Packages tab of the 60-Day
              Playbook, on purpose. Modest, honest pricing is what keeps a small parish's trust and
              its referrals — a client oversold on inflated promises churns, and warns the next
              three parishes off you.
            </p>
            <div style={{background:"#F5F0E4",border:"1px solid #0D7A5F25",borderRadius:12,padding:"16px"}}>
              <SLabel text="12-Month Value Per Ministry — unchanged from the Playbook" color="#0D7A5F"/>
              {[
                {t:"Foundation tier",v:"$600 – $1,200/year"},
                {t:"Growth tier",v:"$1,800 – $3,000/year"},
                {t:"Full Ministry tier",v:"$3,000 – $4,800/year"},
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",
                  borderBottom:"1px solid #FBF8F1"}}>
                  <span style={{fontSize:13,color:"#6E6459"}}>{r.t}</span>
                  <span style={{fontSize:13,fontWeight:700,color:"#0D7A5F"}}>{r.v}</span>
                </div>
              ))}
              <p style={{fontSize:12,color:"#D9CFBB",margin:"10px 0 0",lineHeight:1.6}}>
                See the Revenue Model tab for what this adds up to across a realistic student
                portfolio, and across the whole program.
              </p>
            </div>
          </div>
        )}

        {/* COUNTRIES */}
        {tab==="countries"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Top 10 Countries</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 16px",lineHeight:1.6}}>
              Ranked by religious demographics, digital-payment readiness, and how little of the
              market established church-tech vendors already occupy. Tap a country for the full picture.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {COUNTRIES.map((c,i)=>{
                const isOpen = openCountry===i;
                return (
                  <div key={c.name} onClick={()=>setOpenCountry(isOpen?null:i)}
                    style={{background:isOpen?"#FBF8F1":"#F8F5EE",
                      border:`1px solid ${isOpen?c.color:"#FBF8F1"}`,
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"13px 15px",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:34,height:34,borderRadius:9,background:c.color+"18",
                        border:`1px solid ${c.color}35`,display:"flex",alignItems:"center",
                        justifyContent:"center",fontSize:15,fontWeight:800,color:c.color,flexShrink:0}}>
                        {c.rank}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
                          <span style={{fontSize:18}}>{c.flag}</span>
                          <span style={{fontWeight:700,fontSize:14,color:"#201A16"}}>{c.name}</span>
                        </div>
                        <div style={{fontSize:11.5,color:c.color,marginTop:2}}>{c.tag}</div>
                      </div>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 15px 16px",borderTop:"1px solid #FBF8F1"}}>
                        {[
                          ["🔍 Why It Ranks Here",c.why,"#7A5A00"],
                          ["💳 Payment Rail",c.rail,"#0D7A5F"],
                          ["🏁 Competitive Intensity",c.competition,"#C99A3B"],
                          ["📶 Signal It's Ready",c.signal,"#8B2E1F"],
                        ].map(([lbl,val,col])=>(
                          <div key={lbl} style={{marginTop:12}}>
                            <div style={{fontSize:10,fontWeight:700,color:col,textTransform:"uppercase",
                              letterSpacing:".07em",marginBottom:5}}>{lbl}</div>
                            <p style={{fontSize:13,color:"#6E6459",margin:0,lineHeight:1.65,
                              borderLeft:`2px solid ${col}40`,paddingLeft:10}}>{val}</p>
                          </div>
                        ))}
                        <div style={{marginTop:12}}>
                          <div style={{fontSize:10,fontWeight:700,color:"#7A5A00",textTransform:"uppercase",
                            letterSpacing:".07em",marginBottom:6}}>Best-Fit Ministry Types</div>
                          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                            {c.bestFits.map(bf=>(
                              <span key={bf} style={{fontSize:11,color:"#7A5A00",background:"#7A5A0018",
                                borderRadius:5,padding:"3px 8px",fontWeight:600}}>{bf}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MINISTRY TYPES */}
        {tab==="types"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Top 7 Ministry & NGO Types</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 16px",lineHeight:1.6}}>
              Same rule as the core Playbook: match the pitch to the type of organization in front
              of you, never the reverse. Tap a type for the full picture.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {MINISTRY_TYPES.map((m,i)=>{
                const isOpen = openType===i;
                return (
                  <div key={m.name} onClick={()=>setOpenType(isOpen?null:i)}
                    style={{background:isOpen?"#FBF8F1":"#F8F5EE",
                      border:`1px solid ${isOpen?m.color:"#FBF8F1"}`,
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"13px 15px",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:38,height:38,borderRadius:9,background:m.color+"18",
                        border:`1px solid ${m.color}35`,display:"flex",alignItems:"center",
                        justifyContent:"center",fontSize:19,flexShrink:0}}>{m.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:14,color:"#201A16"}}>{m.name}</div>
                        <div style={{fontSize:11.5,color:"#D9CFBB",marginTop:2}}>{m.size}</div>
                      </div>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 15px 16px",borderTop:"1px solid #FBF8F1"}}>
                        {[
                          ["👥 Who They Are",m.blurb,"#7A5A00"],
                          ["🚪 Natural Entry Service",m.entryService,"#0D7A5F"],
                          ["🤝 Receptiveness",m.receptiveness,"#8B2E1F"],
                        ].map(([lbl,val,col])=>(
                          <div key={lbl} style={{marginTop:12}}>
                            <div style={{fontSize:10,fontWeight:700,color:col,textTransform:"uppercase",
                              letterSpacing:".07em",marginBottom:5}}>{lbl}</div>
                            <p style={{fontSize:13,color:"#6E6459",margin:0,lineHeight:1.65,
                              borderLeft:`2px solid ${col}40`,paddingLeft:10}}>{val}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LEAD SCORING */}
        {tab==="scoring"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Lead Scoring System</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 16px",lineHeight:1.6}}>
              Answer all five, honestly, about one real contact at a time. This prioritizes, it
              doesn't judge — a low score just means "relationship first, pitch later."
            </p>

            <div style={{background:"#F5F0E4",border:`1px solid ${band.color}35`,borderRadius:12,
              padding:"16px",marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:12,fontWeight:600,color:"#6E6459"}}>
                  {allAnswered ? "Lead Score" : `${answeredCount} of ${SCORE_FACTORS.length} answered`}
                </span>
                <span style={{fontSize:20,fontWeight:800,color:band.color}}>{totalScore} / 100</span>
              </div>
              <ProgressBar value={totalScore} color={band.color} height={8}/>
              {allAnswered&&(
                <div style={{marginTop:12,display:"flex",gap:10,alignItems:"flex-start"}}>
                  <span style={{fontSize:22}}>{band.icon}</span>
                  <div>
                    <div style={{fontWeight:800,fontSize:14,color:band.color,marginBottom:3}}>{band.label} Lead</div>
                    <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.55}}>{band.action}</p>
                  </div>
                </div>
              )}
              {answeredCount>0&&(
                <div onClick={resetScore} style={{marginTop:12,fontSize:11.5,color:"#D9CFBB",
                  cursor:"pointer",textDecoration:"underline",display:"inline-block"}}>
                  Reset and score a different contact
                </div>
              )}
            </div>

            {SCORE_FACTORS.map(f=>(
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

        {/* REVENUE MODEL */}
        {tab==="revenue"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Realistic Capacity & Revenue Model</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 16px",lineHeight:1.6}}>
              Modeled directly from the Packages pricing in the 60-Day Playbook, not a separate,
              bigger number. This is what a real student portfolio looks like at three stages.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {REVENUE_SCENARIOS.map(r=>(
                <div key={r.name} style={{background:"#F8F5EE",border:`1px solid ${r.color}35`,
                  borderRadius:12,overflow:"hidden"}}>
                  <div style={{padding:"15px 16px",borderBottom:"1px solid #FBF8F1",
                    display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:24}}>{r.icon}</span>
                      <div>
                        <div style={{fontWeight:700,fontSize:15,color:"#201A16"}}>{r.name}</div>
                        <div style={{fontSize:11,color:"#D9CFBB",marginTop:2}}>{r.clients} · {r.mix}</div>
                      </div>
                    </div>
                    <div style={{fontSize:16,fontWeight:800,color:r.color,whiteSpace:"nowrap",textAlign:"right"}}>{r.range}</div>
                  </div>
                  <div style={{padding:"13px 16px"}}>
                    <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.6}}>{r.note}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:16,background:"#F5F0E4",border:"1px solid #0D7A5F25",
              borderRadius:12,padding:"16px"}}>
              <SLabel text="At Program Scale" color="#0D7A5F"/>
              <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.65}}>
                This system is built to be non-saturating: every student's addressable market is
                their own distinct network, which by definition doesn't overlap with anyone else's.
                Even the Conservative scenario above, run across 100,000 students, adds up to
                roughly $300M–$500M a year in value delivered across 300,000–500,000 ministries
                worldwide — a small fraction of the world's churches, mosques, temples, and
                community NGOs. The opportunity is real without needing to inflate what any single
                relationship is worth.
              </p>
            </div>
          </div>
        )}

        {/* REGIONAL NOTES */}
        {tab==="regional"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Regional Playbook Notes</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 16px",lineHeight:1.6}}>
              Four regional adaptations of the same core system. The tools, the channel, and the
              highest-opportunity pilot event change; the warm-network principle does not.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {REGIONAL_NOTES.map((r,i)=>{
                const isOpen = openRegion===i;
                return (
                  <div key={r.name} onClick={()=>setOpenRegion(isOpen?null:i)}
                    style={{background:isOpen?"#FBF8F1":"#F8F5EE",
                      border:`1px solid ${isOpen?r.color:"#FBF8F1"}`,
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"13px 15px",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:38,height:38,borderRadius:9,background:r.color+"18",
                        border:`1px solid ${r.color}35`,display:"flex",alignItems:"center",
                        justifyContent:"center",fontSize:19,flexShrink:0}}>{r.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:14,color:"#201A16"}}>{r.name}</div>
                        <div style={{fontSize:11.5,color:"#D9CFBB",marginTop:2}}>{r.countries}</div>
                      </div>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 15px 16px",borderTop:"1px solid #FBF8F1"}}>
                        {[
                          ["💳 Payment Rail",r.payment,"#0D7A5F"],
                          ["💬 Communication Channel",r.comms,"#7A5A00"],
                          ["🤝 Cultural Note",r.culture,"#8B2E1F"],
                          ["🎯 Strongest Pilot Opportunity",r.pilot,"#C99A3B"],
                        ].map(([lbl,val,col])=>(
                          <div key={lbl} style={{marginTop:12}}>
                            <div style={{fontSize:10,fontWeight:700,color:col,textTransform:"uppercase",
                              letterSpacing:".07em",marginBottom:5}}>{lbl}</div>
                            <p style={{fontSize:13,color:"#6E6459",margin:0,lineHeight:1.65,
                              borderLeft:`2px solid ${col}40`,paddingLeft:10}}>{val}</p>
                          </div>
                        ))}
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
