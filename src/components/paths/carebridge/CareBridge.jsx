import { useState, useMemo } from "react";

const WEEKS = [
  {
    week:1, title:"Learn the System, Build Your Foundation", range:"Days 1-7",
    icon:"🚨", color:"#8B2E1F",
    goal:"Free tools set up, the industry's real pain points understood, and your rapid-response intake demo working.",
    days:[
      {day:1, focus:"Free Tool Setup", icon:"⚡",
       note:"Total cost today: $0. This entire system runs on tools you likely already know from your SMB work.",
       tasks:[
         {id:"1a",text:"Create a free Notion account — this becomes your Agency CRM"},
         {id:"1b",text:"Create a free Zapier or Make.com account"},
         {id:"1c",text:"Confirm Google Forms and Sheets access"},
         {id:"1d",text:"Research a free-tier SMS/email tool you'll use for family updates — Klaviyo or similar"},
       ]},
      {day:2, focus:"Study the Industry Deeply", icon:"🔍",
       note:"You cannot pitch this well without genuinely understanding the crisis moment families are in when they call.",
       tasks:[
         {id:"2a",text:"Research how home care and assisted living agencies typically operate day to day"},
         {id:"2b",text:"Understand why response speed matters so much — families call several agencies within the same hour"},
         {id:"2c",text:"Sit with the emotional weight a family carries when searching for care for a loved one"},
       ]},
      {day:3, focus:"Map the Rapid-Response Intake System", icon:"📐",
       tasks:[
         {id:"3a",text:"Sketch exactly what information a new inquiry form needs to capture"},
         {id:"3b",text:"Decide: instant acknowledgment message to the family plus an immediate alert to staff"},
       ]},
      {day:4, focus:"Build the Intake System — Part 1", icon:"🛠️",
       tasks:[
         {id:"4a",text:"Build a Google Form for new inquiry intake on a dummy agency profile"},
         {id:"4b",text:"Connect it to a Google Sheet"},
       ]},
      {day:5, focus:"Build the Intake System — Part 2", icon:"✅",
       tasks:[
         {id:"5a",text:"Set up the automation — form submitted triggers an instant SMS or email to the family plus an alert to staff"},
         {id:"5b",text:"Test the entire flow yourself end to end"},
       ]},
      {day:6, focus:"Map the Family Update Portal", icon:"💌",
       tasks:[{id:"6a",text:"Sketch what a simple, warm, periodic family update message could look like"}]},
      {day:7, focus:"Week 1 Review", icon:"✅",
       tasks:[{id:"7a",text:"Confirm the intake system works end to end and your understanding of the industry is solid"}]},
    ]},
  {
    week:2, title:"Build Your Full Demo System", range:"Days 8-14",
    icon:"🌉", color:"#7A5A00",
    goal:"All 4 Bridge components demoed, a case study asset ready, and your Agency CRM fully set up.",
    days:[
      {day:8, focus:"Build the Family Update System", icon:"💌",
       tasks:[{id:"8a",text:"Set up an automated periodic family update template and test the flow"}]},
      {day:9, focus:"Build the Staff Scheduling Demo", icon:"📅",
       tasks:[{id:"9a",text:"Build a simple shift schedule with an automated reminder system using Sheets and Zapier or Make"}]},
      {day:10, focus:"Build the Referral & Testimonial System", icon:"🌟",
       tasks:[{id:"10a",text:"Design and build an automated request for family testimonials after a positive care milestone"}]},
      {day:11, focus:"Record Loom Walkthroughs", icon:"🎬",
       tasks:[
         {id:"11a",text:"Record a 60-90 second Loom of the intake system"},
         {id:"11b",text:"Record a 60-90 second Loom of the family update portal"},
       ]},
      {day:12, focus:"Build Your Case Study Page", icon:"📄",
       tasks:[{id:"12a",text:"Create a simple document showing all 4 Bridge components with screenshots"}]},
      {day:13, focus:"Set Up Your Agency CRM", icon:"🗂️",
       tasks:[{id:"13a",text:"Build the full Notion database using every column in the Agency CRM tab"}]},
      {day:14, focus:"Week 2 Review", icon:"✅",
       tasks:[{id:"14a",text:"Confirm all 4 components work and you have a case study ready to show"}]},
    ]},
  {
    week:3, title:"Identify Local Agencies", range:"Days 15-21",
    icon:"🔎", color:"#C99A3B",
    goal:"10-15 scored, researched target agencies with real response-time data ready for outreach.",
    days:[
      {day:15, focus:"Research Local Agencies", icon:"🗺️",
       tasks:[{id:"15a",text:"Search for home care agencies and assisted living facilities in your target area — list 15-20"}]},
      {day:16, focus:"Audit Each Agency", icon:"🕵️",
       note:"A mystery-shopper call is the single most persuasive piece of data you can bring to a pitch.",
       tasks:[
         {id:"16a",text:"Contact each agency as a genuine potential inquiry and time how long it takes to hear back"},
         {id:"16b",text:"Note their current response time and communication style"},
       ]},
      {day:17, focus:"Score and Prioritize", icon:"🎯",
       tasks:[
         {id:"17a",text:"Tag each agency: Hot (slow response, clear gap), Warm (decent but improvable), Cold (already excellent)"},
         {id:"17b",text:"Focus outreach only on Hot and Warm agencies"},
       ]},
      {day:18, focus:"Research Decision-Makers", icon:"👤",
       tasks:[{id:"18a",text:"Find the owner or administrator's name and best contact method for each Hot/Warm agency"}]},
      {day:19, focus:"Prepare Your Approach", icon:"📝",
       tasks:[{id:"19a",text:"For each target, plan the natural way to approach — an in-person visit is strongest in this vertical"}]},
      {day:20, focus:"Refine Your Pitch", icon:"✍️",
       tasks:[{id:"20a",text:"Tailor your pitch to the specific gap you found in each agency's audit"}]},
      {day:21, focus:"Week 3 Review", icon:"✅",
       tasks:[{id:"21a",text:"Confirm you have 10-15 scored, researched target agencies ready for outreach"}]},
    ]},
  {
    week:4, title:"Warm Approach", range:"Days 22-28",
    icon:"🤝", color:"#0D7A5F",
    goal:"Real conversations started with multiple agencies, moving toward a pilot proposal.",
    days:[
      {day:22, focus:"Make Your First Approaches", icon:"🚪",
       tasks:[{id:"22a",text:"Visit or contact your top 3-5 target agencies using the 'Introducing Yourself' script"}]},
      {day:23, focus:"Continue Approaches", icon:"🚪",
       tasks:[{id:"23a",text:"Contact your next batch of target agencies"}]},
      {day:24, focus:"Continue Approaches", icon:"🚪",
       tasks:[{id:"24a",text:"Contact your remaining target agencies"}]},
      {day:25, focus:"Follow Up", icon:"🔁",
       tasks:[{id:"25a",text:"Follow up with anyone who hasn't responded after a few days"}]},
      {day:26, focus:"Schedule Meetings", icon:"📅",
       tasks:[{id:"26a",text:"Book proper conversations with interested agencies"}]},
      {day:27, focus:"Prepare for Meetings", icon:"📋",
       tasks:[{id:"27a",text:"Prepare your case study and pilot offer specific to each meeting"}]},
      {day:28, focus:"Week 4 Review", icon:"✅",
       tasks:[{id:"28a",text:"Confirm how many real conversations have started and how many feel promising"}]},
    ]},
  {
    week:5, title:"Close and Pilot", range:"Days 29-35",
    icon:"🏆", color:"#7A5A00",
    goal:"A free pilot agreed with your first agency, running live on their next 5 real inquiries.",
    days:[
      {day:29, focus:"Present to Your Top Prospect", icon:"🎤",
       tasks:[{id:"29a",text:"Walk through the case study and the free pilot offer"}]},
      {day:30, focus:"Present to Additional Prospects", icon:"🎤",
       tasks:[{id:"30a",text:"Repeat the presentation with your next warm prospects"}]},
      {day:31, focus:"Handle Objections", icon:"🛡️",
       tasks:[{id:"31a",text:"Use the 'already have software' and 'no budget' objection scripts as needed"}]},
      {day:32, focus:"Close Your First Pilot Agreement", icon:"🤝",
       tasks:[{id:"32a",text:"Get agreement to pilot the intake system on their next 5 new inquiries, completely free"}]},
      {day:33, focus:"Set Up the Live System", icon:"🔌",
       tasks:[{id:"33a",text:"Connect the intake system to their real inquiry channels — phone, website, Facebook"}]},
      {day:34, focus:"Brief Their Staff", icon:"👥",
       tasks:[{id:"34a",text:"Walk their staff through exactly how the new system works"}]},
      {day:35, focus:"Week 5 Review", icon:"✅",
       tasks:[{id:"35a",text:"Confirm the pilot is live and running smoothly"}]},
    ]},
  {
    week:6, title:"Deliver and Prove Value", range:"Days 36-42",
    icon:"📊", color:"#0D7A5F",
    goal:"Real pilot results gathered, showing measurable improvement in response time and family experience.",
    days:[
      {day:36, focus:"Monitor the Pilot", icon:"👀",
       tasks:[{id:"36a",text:"Track every new inquiry and its response time closely"}]},
      {day:37, focus:"Continue Monitoring", icon:"👀",
       tasks:[{id:"37a",text:"Track and support, fixing anything that comes up immediately"}]},
      {day:38, focus:"Continue Monitoring", icon:"👀",
       tasks:[{id:"38a",text:"Track and support"}]},
      {day:39, focus:"Continue Monitoring", icon:"👀",
       tasks:[{id:"39a",text:"Track and support"}]},
      {day:40, focus:"Gather Agency Feedback", icon:"🗣️",
       tasks:[{id:"40a",text:"Ask the owner or administrator how the pilot has felt so far — capture their exact words"}]},
      {day:41, focus:"Gather Family Feedback", icon:"💬",
       tasks:[{id:"41a",text:"If possible, ask a family member who went through the new intake process how it felt"}]},
      {day:42, focus:"Week 6 Review", icon:"✅",
       tasks:[{id:"42a",text:"Compile pilot results — response time improvement, feedback, any new clients won"}]},
    ]},
  {
    week:7, title:"Convert, Upsell, Referral", range:"Days 43-45",
    icon:"📈", color:"#7A5A00",
    goal:"The pilot converted into a paying retainer, with a referral opened to another agency.",
    days:[
      {day:43, focus:"Present Pilot Results", icon:"📊",
       note:"Lead with the before/after response time number — it usually does the selling on its own.",
       tasks:[{id:"43a",text:"Show the before/after response time data and any feedback gathered"}]},
      {day:44, focus:"Convert to Paid Retainer", icon:"💰",
       tasks:[{id:"44a",text:"Present your tiered pricing and close the ongoing retainer using the pilot results as proof"}]},
      {day:45, focus:"Ask for a Referral and Set Next Targets", icon:"🎯",
       tasks:[
         {id:"45a",text:"Ask if they know other agencies who might benefit from the same system"},
         {id:"45b",text:"Set your next 30-day targets"},
       ]},
    ]},
];

const NOTION_COLS = [
  {name:"Agency Name",           type:"Title",    icon:"🏥", desc:"The home care agency or facility's name"},
  {name:"Agency Type",           type:"Select",   icon:"🏷️", desc:"Home Care / Assisted Living / Memory Care / Hospice / Disability Support / Adult Day Care"},
  {name:"Location",              type:"Text",     icon:"📍", desc:"City or region the agency serves"},
  {name:"Owner / Administrator", type:"Text",     icon:"👤", desc:"The decision-maker's name"},
  {name:"Contact Method",        type:"Select",   icon:"📱", desc:"Phone / Email / In-Person / LinkedIn"},
  {name:"Audited Response Time", type:"Text",     icon:"⏱️", desc:"What you found when you mystery-shopped a real inquiry"},
  {name:"Current Communication", type:"Select",   icon:"💬", desc:"Phone only / Basic email / No system / Existing software"},
  {name:"Agency Size",           type:"Select",   icon:"📏", desc:"Small (1 location) / Medium (multiple locations) / Large (regional chain)"},
  {name:"Biggest Pain Point",    type:"Select",   icon:"⚠️", desc:"Slow Inquiry Response / No Family Updates / Staff Scheduling Chaos / No Referral System"},
  {name:"Relationship Stage",    type:"Select",   icon:"📊", desc:"Identified → Audited → Approached → Meeting Booked → Pilot Proposed → Pilot Running → Pilot Proven → Closed → Retainer"},
  {name:"Package Tier",          type:"Select",   icon:"💰", desc:"Foundation / Growth / Full Care System"},
  {name:"Monthly Retainer",      type:"Number",   icon:"💵", desc:"Agreed monthly amount, once closed"},
  {name:"Pilot Start Date",      type:"Date",     icon:"📅", desc:"When the free pilot began"},
  {name:"Pilot Results",         type:"Text",     icon:"📈", desc:"Response time before/after, and any new clients won during the pilot"},
  {name:"Testimonial Quote",     type:"Text",     icon:"🗣️", desc:"The owner or administrator's exact words after the pilot"},
  {name:"Next Action",           type:"Text",     icon:"➡️", desc:"What needs to happen next with this agency"},
  {name:"Next Action Date",      type:"Date",     icon:"⏰", desc:"When the next action is due"},
  {name:"Notes",                 type:"Text",     icon:"📝", desc:"Anything else relevant — conversation history, family stories, context"},
];

const NOTION_VIEWS = [
  {name:"🏥 All Agencies",        desc:"Master table — every agency you've identified and audited."},
  {name:"🔥 Hot Prospects",       desc:"Filter: audited response time is slow and the gap is clear. Your highest-converting targets."},
  {name:"🔬 Active Pilots",       desc:"Filter: Stage = Pilot Proposed or Pilot Running. What you're currently proving out."},
  {name:"💰 Active Retainers",    desc:"Filter: Stage = Retainer. Your recurring revenue base and referral source list."},
  {name:"📊 Pipeline Board",      desc:"Kanban grouped by Relationship Stage — drag agencies through as they progress."},
];

const CARE_TYPES = [
  {icon:"🏠", name:"Home Care Agencies",
   why:"The most numerous and accessible type — small, locally owned, decision-maker usually reachable directly, and the highest volume of crisis-moment new inquiries.",
   find:"Local business directories, Google Maps search 'home care agency,' independently-owned franchise territories of national brands"},
  {icon:"🏢", name:"Assisted Living Facilities",
   why:"Larger budgets than solo home care agencies, with an ongoing need for both fast intake response and regular family communication since residents live on-site.",
   find:"State assisted living facility directories (most regions require licensing, making these searchable), local senior resource guides"},
  {icon:"🧠", name:"Memory Care / Dementia Care Facilities",
   why:"Families here are under exceptional emotional strain, making warm, fast communication even more valued and differentiating than in general elder care.",
   find:"Alzheimer's Association local chapter resource lists, specialized memory care facility directories"},
  {icon:"🕊️", name:"Hospice & End-of-Life Care Organizations",
   why:"Communication with families is the core of the service itself, not an add-on — this vertical values thoughtful family communication more than almost any other.",
   find:"National hospice and palliative care association member directories, local hospice referral networks"},
  {icon:"♿", name:"Disability Support Services",
   why:"The same crisis-driven intake dynamic as elder care — families searching urgently for the right fit for a loved one's specific needs.",
   find:"Local disability services directories, state-funded care provider networks"},
  {icon:"👶", name:"Adult Day Care Centers",
   why:"Smaller and often overlooked by agencies, but genuinely underserved with straightforward operational needs — intake, family updates, and scheduling.",
   find:"Senior center partnership listings, local Area Agency on Aging directories"},
];

const SERVICES_4 = [
  {icon:"🚨", color:"#8B2E1F", name:"Rapid-Response Intake System", price:"$75-$150/month (or free pilot first)",
   signal:"Agency takes an hour or more to respond to new inquiries, no automated acknowledgment exists, families report frustration reaching them.",
   pitch:"\"When a family calls you in the middle of a care crisis, how fast do you actually get back to them? I tested this myself — [X hours]. Families are calling 3-4 agencies within the same hour, and the first one to respond clearly and quickly usually wins the client. I can build a system that acknowledges every inquiry within minutes and alerts your team instantly, so you never lose a family to slower response time again.\"",
   setup:"Google Form or website form → Zapier or Make automation → instant SMS/email acknowledgment to the family + instant alert to staff phone → Sheet log for follow-up tracking",
   upsell:"\"Now that new inquiries are being caught instantly, the next thing families ask for once they're a client is regular updates — want me to set that up too?\""},
  {icon:"💌", color:"#7A5A00", name:"Family Update Portal", price:"$100-$200/month",
   signal:"No systematic way for families to receive updates, families calling in constantly for status checks, staff time consumed by repetitive update calls.",
   pitch:"\"Right now, how do families find out how their loved one is doing day to day? If it's only through them calling in, that's time your staff could spend on actual care. I can set up automated weekly update messages — a simple, warm summary sent directly to family members — so they feel reassured without needing to call, and your staff gets that time back.\"",
   setup:"Klaviyo or similar email/SMS tool → automated periodic update template → staff fills in brief notes → system sends personalized update to the family contact list",
   upsell:"\"With families feeling well-informed, the next gap I noticed is how your staff schedule gets communicated internally — want me to look at that too?\""},
  {icon:"📅", color:"#C99A3B", name:"Staff Scheduling & Shift Communication", price:"$100-$200/month",
   signal:"Scheduling done manually by phone, missed shifts due to poor communication, no automated reminder system.",
   pitch:"\"How much time does scheduling and confirming shifts take every week right now? I can set up a simple system that sends automatic shift reminders to your caregivers, reduces missed shifts, and gives you a clear view of coverage at a glance.\"",
   setup:"Google Sheets schedule → Zapier or Make automation → automated SMS reminder 24 hours and 2 hours before each shift → confirmation tracking",
   upsell:"\"Now that scheduling runs smoothly, the last piece is making sure happy families actually tell others about you — want me to set up a referral system?\""},
  {icon:"🌟", color:"#0D7A5F", name:"Referral & Testimonial System", price:"$75-$150/month",
   signal:"No systematic way to collect family testimonials or generate referrals, relying purely on unstructured word of mouth.",
   pitch:"\"Families who've had a genuinely good experience with your care are your most powerful marketing asset, but right now nothing is capturing that. I can set up an automated system that reaches out to families after a positive milestone, asks for a quick testimonial or review, and makes it easy for them to refer other families going through the same situation.\"",
   setup:"Trigger after a care milestone → automated testimonial or review request → referral ask built into the same message",
   upsell:"\"This is typically the final piece — from here, the conversation naturally shifts to whether other agencies in your network might want the same system.\""},
];

const SCRIPTS = [
  {id:"intro", tag:"Warm Approach · Introducing Yourself", color:"#8B2E1F",
   title:"Introducing Yourself to an Agency",
   note:"Lead with real data from your mystery-shop audit, not a generic pitch. It shows you've already done the work.",
   body:"Hi, I'm [Name] — I help home care agencies make sure they never lose a family to slow response time. I actually called in as a mystery inquiry last week and noticed it took [X time] to hear back. I know how competitive it is out there when families are calling multiple agencies at once. I'd love to show you a simple system that could fix that — would you have 10 minutes this week?"},
  {id:"pilot", tag:"The Free Pilot Offer", color:"#0D7A5F",
   title:"Presenting the Free Pilot",
   note:"Zero risk, zero commitment. This is what makes the yes easy.",
   body:"Here's what I'd propose — let me set up the rapid-response system for your next 5 new inquiries, completely free. No commitment, no cost. If it genuinely helps you respond faster and feel more organized, we can talk about making it permanent. If not, no harm done. Does that sound fair?"},
  {id:"obj1", tag:"Objection · Already Have Software", color:"#7A5A00",
   title:"Objection: \"We Already Have a System\"",
   note:"Most care software handles scheduling and documentation, rarely instant family communication specifically.",
   body:"That's great — having something in place already means we're not starting from zero. A lot of agencies have a system but it's either underused or not built around speed specifically. Would you mind if I took a quick look at how it currently handles a new inquiry? If it's already fast and clear, I'll tell you honestly. If there's a gap, I can show you exactly where."},
  {id:"obj2", tag:"Objection · No Budget", color:"#C99A3B",
   title:"Objection: \"We Don't Have Budget for This\"",
   note:"The free pilot removes this objection almost entirely — reference it directly.",
   body:"Completely understand — that's exactly why I start with a free pilot on your next 5 inquiries. There's no financial risk. If even one of those five inquiries becomes a client because you responded faster than the competition, this pays for itself many times over. Want to see it in action first?"},
  {id:"results", tag:"Presenting Pilot Results", color:"#0D7A5F",
   title:"Presenting Pilot Results",
   note:"Lead with the specific before/after number — it does more persuading than any pitch.",
   body:"Here's what happened over the pilot — average response time went from [X] to [Y], and [specific outcome, e.g. you converted 4 out of 5 pilot inquiries into new clients]. I think this is worth making a permanent part of how you operate — want to talk about what that looks like going forward?"},
  {id:"convert", tag:"Converting Pilot to Retainer", color:"#7A5A00",
   title:"Converting the Pilot to a Paid Retainer",
   note:"Anchor the price directly to the pilot result they just witnessed.",
   body:"Based on the pilot results, I'd suggest starting with the [tier name] package at $[price] a month — that covers [specific components]. This keeps the system running exactly as it did during the pilot, plus [additional benefit of the paid tier]."},
  {id:"referral", tag:"Growth · Referral Ask", color:"#8B2E1F",
   title:"Asking for a Referral",
   note:"Agency owners in this space often know each other through local senior-care networks and referral partnerships.",
   body:"I'm really glad this has made a difference for [agency name]. Do you know any other home care agencies or assisted living facilities who might be dealing with the same response-time challenge? I'd love an introduction — happy to run the same free pilot for them."},
];

const PACKAGES = [
  {name:"Foundation", icon:"🌱", color:"#0D7A5F", price:"$75-$150/month",
   includes:["Rapid-Response Intake System only","Monthly response-time report"],
   bestFor:"Small agencies wanting to fix their single biggest gap first"},
  {name:"Growth", icon:"⚡", color:"#7A5A00", price:"$175-$350/month",
   includes:["Rapid-Response Intake System","Family Update Portal","Monthly performance report"],
   bestFor:"Growing agencies wanting to reduce staff workload and reassure families"},
  {name:"Full Care System", icon:"🏆", color:"#8B2E1F", price:"$350-$600/month",
   includes:["Everything in Growth","Staff Scheduling & Shift Communication","Referral & Testimonial System","Quarterly strategy check-in"],
   bestFor:"Established agencies wanting a complete operational and growth partner"},
];

const FAQS = [
  {q:"What if I don't have any personal connection to elder care?",
   a:"You don't need direct experience to build genuine empathy here — nearly everyone has a family story somewhere close to this. Spend time understanding a real family's experience searching for care before your first outreach; that understanding will come through in how you pitch."},
  {q:"How do I audit an agency's response time without seeming intrusive?",
   a:"This is simply a mystery-shopper approach — call or message as a genuine potential inquiry, note how long it takes to hear back, and use that real data respectfully in your pitch. This is standard, ethical market research, not intrusive."},
  {q:"What if the agency already uses expensive care management software?",
   a:"Most care management software handles scheduling and documentation, not necessarily instant family communication or rapid inquiry response. Ask what's currently automated versus manual — there's almost always a real gap even with existing software in place."},
  {q:"Is this appropriate to pitch given how emotionally sensitive this space is?",
   a:"Yes, as long as your tone matches the stakes. You're not selling a marketing gimmick — you're helping agencies respond to families in genuine need faster and more warmly. Lead with empathy in every conversation, not urgency or pressure."},
  {q:"What if a family shares sensitive medical information — do I need to worry about privacy or compliance?",
   a:"Keep all systems focused on logistics and communication — appointment times, response acknowledgments, general updates — not detailed medical records. If an agency wants to go further into care documentation, that's a conversation for a specialized healthcare compliance tool, not something to build yourself without proper guidance."},
  {q:"How do I find agencies to approach if I don't live near many of them?",
   a:"Start with whatever city or region you do have some connection to, even loosely. This system scales well to any city with an aging population, which is virtually everywhere — you are not limited to your immediate neighborhood."},
  {q:"What if the pilot doesn't show a clear win?",
   a:"Use it as real data regardless. If response time didn't improve much, look at where the bottleneck actually was — sometimes it's staff follow-through, not the system itself. Refine and offer a second pilot period before concluding it isn't a fit."},
  {q:"Can this work for other care-adjacent businesses, like disability care or childcare?",
   a:"Yes, the same core problem — families in a moment of need who reward whoever responds first and clearest — applies to disability care providers, childcare centers, and similar care-based small businesses."},
];

function Chevron({open}) {
  return <span style={{color:"#D9CFBB",fontSize:19,display:"inline-block",
    transform:open?"rotate(90deg)":"none",transition:"transform .2s",flexShrink:0}}>›</span>;
}

function Check({checked,color}) {
  return (
    <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${checked?color:"#D9CFBB"}`,
      background:checked?color:"transparent",display:"flex",alignItems:"center",
      justifyContent:"center",flexShrink:0,marginTop:2,fontSize:11,
      color:"#F5F0E4",fontWeight:800,transition:"all .15s"}}>
      {checked?"✓":""}
    </div>
  );
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
    <div style={{fontSize:10,fontWeight:700,color,textTransform:"",
      letterSpacing:".08em",marginBottom:7}}>{text}</div>
  );
}

export default function TheCareBridge() {
  const [tab,setTab]             = useState("plan");
  const [openWeek,setOpenWeek]   = useState(0);
  const [openDay,setOpenDay]     = useState(null);
  const [openCare,setOpenCare]   = useState(null);
  const [openSvc,setOpenSvc]     = useState(null);
  const [openScript,setOpenScript]= useState(null);
  const [openFaq,setOpenFaq]     = useState(null);
  const [done,setDone]           = useState({});

  const allTasks = useMemo(()=>WEEKS.flatMap(w=>w.days.flatMap(d=>d.tasks)),[]);
  const totalTasks     = allTasks.length;
  const completedTasks = allTasks.filter(t=>done[t.id]).length;
  const progress = totalTasks>0?Math.round((completedTasks/totalTasks)*100):0;
  const progressColor = progress>=70?"#0D7A5F":progress>=35?"#C99A3B":"#7A5A00";
  const toggle = id=>setDone(p=>({...p,[id]:!p[id]}));
  const weekPct = w=>{
    const t=w.days.flatMap(d=>d.tasks);
    return t.length>0?Math.round((t.filter(x=>done[x.id]).length/t.length)*100):0;
  };

  const TABS=[
    {id:"plan",    label:"📅 45-Day Plan"},
    {id:"notion",  label:"🗂️ Agency CRM"},
    {id:"care",    label:"🏥 Pick Your Care Focus"},
    {id:"services",label:"🌉 The 4 Bridge Components"},
    {id:"scripts", label:"💬 Scripts"},
    {id:"pricing", label:"💰 Packages"},
    {id:"faq",     label:"❓ FAQ"},
  ];

  return (
    <div style={{fontFamily:"'Inter',system-ui,-apple-system,sans-serif",
      background:"#F5F0E4",minHeight:"100vh",color:"#201A16"}}>

      {/* HEADER */}
      <div style={{background:"linear-gradient(160deg,#F8F5EE 0%,#F8F5EE 60%,#F5F0E4 100%)",
        padding:"22px 16px 18px",borderBottom:"1px solid #FBF8F1"}}>
        <div style={{maxWidth:880,margin:"0 auto"}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",color:"#0D7A5F",
            textTransform:"",marginBottom:7,display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"#0D7A5F",
              boxShadow:"0 0 6px #0D7A5F",display:"inline-block"}}/>
            The Care Bridge — 45-Day Playbook
          </div>
          <h1 style={{margin:"0 0 7px",fontSize:"clamp(21px,4.5vw,33px)",fontWeight:800,
            lineHeight:1.15,background:"linear-gradient(135deg,#201A16 30%,#C99A3B 100%)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            Senior & Home Care Communication Systems
          </h1>
          <p style={{margin:"0 0 14px",fontSize:12.5,color:"#D9CFBB",maxWidth:580,lineHeight:1.65}}>
            Rapid-response intake, family updates, staff scheduling, and referrals — built for home
            care agencies and assisted living facilities. A market almost no digital agency serves.
          </p>
          <div style={{background:"#F5F0E4",border:"1px solid #0D7A5F30",borderRadius:10,
            padding:"11px 14px",marginBottom:14}}>
            <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.6}}>
              <strong style={{color:"#0D7A5F"}}>Why this system exists:</strong> families searching
              for elder care are in crisis, not casually browsing — that changes the entire emotional
              register of this pitch. Nearly every student has some personal connection to this world
              through their own extended family, giving it the same warm-network advantage as your
              Ministry system, in a market virtually no professional digital agency bothers to serve.
            </p>
          </div>
          <div style={{background:"#F8F5EE",borderRadius:10,padding:"11px 14px",border:"1px solid #FBF8F1"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
              <span style={{fontSize:12,fontWeight:600,color:"#6E6459"}}>Overall Progress</span>
              <span style={{fontSize:13,fontWeight:800,color:progressColor}}>
                {completedTasks} / {totalTasks} tasks · {progress}%
              </span>
            </div>
            <ProgressBar value={progress} color={progressColor} height={8}/>
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

        {/* PLAN */}
        {tab==="plan"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>45-Day Action Plan</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 14px"}}>
              Tap a week → tap a day → tick tasks as you complete them.
            </p>
            {WEEKS.map((w,wi)=>{
              const wp=weekPct(w); const wOpen=openWeek===wi;
              return (
                <div key={w.week} style={{marginBottom:9}}>
                  <div onClick={()=>setOpenWeek(wOpen?null:wi)}
                    style={{background:wOpen?"#FBF8F1":"#F8F5EE",
                      border:`1px solid ${wOpen?w.color+"55":"#FBF8F1"}`,
                      borderRadius:wOpen?"11px 11px 0 0":11,cursor:"pointer",
                      padding:"13px 15px",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:37,height:37,borderRadius:9,background:w.color+"18",
                      border:`1px solid ${w.color}35`,display:"flex",alignItems:"center",
                      justifyContent:"center",fontSize:18,flexShrink:0}}>{w.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap",marginBottom:4}}>
                        <span style={{fontWeight:700,fontSize:14,color:"#201A16"}}>Week {w.week}: {w.title}</span>
                        <span style={{fontSize:10,color:"#D9CFBB",background:"#FBF8F1",
                          borderRadius:4,padding:"1px 6px"}}>{w.range}</span>
                        {wp>0&&<span style={{fontSize:10.5,fontWeight:700,color:w.color}}>{wp}%</span>}
                      </div>
                      <p style={{fontSize:11.5,color:"#D9CFBB",margin:"0 0 6px",lineHeight:1.4}}>{w.goal}</p>
                      <ProgressBar value={wp} color={w.color} height={3}/>
                    </div>
                    <Chevron open={wOpen}/>
                  </div>
                  {wOpen&&(
                    <div style={{background:"#F5F0E4",border:`1px solid ${w.color}25`,
                      borderTop:"none",borderRadius:"0 0 11px 11px",padding:"8px 11px 13px"}}>
                      {w.days.map(d=>{
                        const dk=`${wi}-${d.day}`; const dOpen=openDay===dk;
                        const dDone=d.tasks.filter(t=>done[t.id]).length;
                        const dComplete=dDone===d.tasks.length&&d.tasks.length>0;
                        return (
                          <div key={d.day} style={{marginTop:7}}>
                            <div onClick={()=>setOpenDay(dOpen?null:dk)}
                              style={{background:dOpen?"#FBF8F1":"#F5F0E4",
                                border:`1px solid ${dComplete?w.color+"60":"#FBF8F1"}`,
                                borderRadius:dOpen?"9px 9px 0 0":9,cursor:"pointer",
                                padding:"10px 12px",display:"flex",alignItems:"center",gap:9}}>
                              <span style={{fontSize:16,flexShrink:0}}>{dComplete?"✅":d.icon}</span>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                                  <span style={{fontSize:10,fontWeight:700,color:w.color,
                                    background:w.color+"18",borderRadius:4,padding:"1px 6px"}}>Day {d.day}</span>
                                  <span style={{fontSize:13,fontWeight:600,color:"#201A16"}}>{d.focus}</span>
                                </div>
                                <div style={{fontSize:11,color:"#D9CFBB",marginTop:2}}>{dDone}/{d.tasks.length} tasks</div>
                              </div>
                              <Chevron open={dOpen}/>
                            </div>
                            {dOpen&&(
                              <div style={{background:"#F5F0E4",border:"1px solid #FBF8F1",
                                borderTop:"none",borderRadius:"0 0 9px 9px",padding:"10px 12px 12px"}}>
                                {d.note&&(
                                  <div style={{background:w.color+"10",border:`1px solid ${w.color}22`,
                                    borderRadius:7,padding:"7px 10px",marginBottom:10,
                                    fontSize:12,color:w.color+"CC",lineHeight:1.5}}>💡 {d.note}</div>
                                )}
                                {d.tasks.map(t=>(
                                  <div key={t.id} onClick={()=>toggle(t.id)}
                                    style={{display:"flex",gap:9,alignItems:"flex-start",
                                      padding:"8px 0",borderBottom:"1px solid #FBF8F1",cursor:"pointer"}}>
                                    <Check checked={!!done[t.id]} color={w.color}/>
                                    <span style={{fontSize:13,lineHeight:1.55,
                                      color:done[t.id]?"#D9CFBB":"#6E6459",
                                      textDecoration:done[t.id]?"line-through":"none",
                                      transition:"all .15s"}}>{t.text}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* NOTION CRM */}
        {tab==="notion"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Agency CRM</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 16px",lineHeight:1.6}}>
              Notion (free plan) tracks every agency you audit, approach, and pilot — from mystery-shop
              call to closed retainer.
            </p>
            <div style={{marginBottom:10}}>
              <SLabel text="All 18 Database Properties" color="#0D7A5F"/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:22}}>
              {NOTION_COLS.map((c,i)=>(
                <div key={i} style={{background:"#F8F5EE",border:"1px solid #FBF8F1",
                  borderRadius:9,padding:"10px 13px",display:"flex",gap:11,alignItems:"flex-start"}}>
                  <span style={{fontSize:18,flexShrink:0,marginTop:1}}>{c.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:3}}>
                      <span style={{fontSize:13.5,fontWeight:700,color:"#201A16"}}>{c.name}</span>
                      <span style={{fontSize:10.5,background:"#FBF8F1",border:"1px solid #FBF8F1",
                        borderRadius:5,padding:"1px 7px",color:"#7A5A00",fontWeight:600}}>{c.type}</span>
                    </div>
                    <p style={{fontSize:12,color:"#6E6459",margin:0,lineHeight:1.5}}>{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginBottom:10}}>
              <SLabel text="The 5 Views to Create" color="#C99A3B"/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {NOTION_VIEWS.map((v,i)=>(
                <div key={i} style={{background:"#F8F5EE",border:"1px solid #FBF8F1",
                  borderRadius:9,padding:"11px 14px"}}>
                  <div style={{fontSize:13.5,fontWeight:700,color:"#201A16",marginBottom:4}}>{v.name}</div>
                  <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.5}}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CARE FOCUS */}
        {tab==="care"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Pick Your Care Focus</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 16px",lineHeight:1.6}}>
              Choose one care-type specialization so your outreach and case studies get sharper the
              more agencies you sign in the same category.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {CARE_TYPES.map((n,i)=>{
                const isOpen=openCare===i;
                return (
                  <div key={i} onClick={()=>setOpenCare(isOpen?null:i)}
                    style={{background:isOpen?"#FBF8F1":"#F8F5EE",
                      border:`1px solid ${isOpen?"#0D7A5F":"#FBF8F1"}`,
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:22,flexShrink:0}}>{n.icon}</span>
                      <span style={{flex:1,fontWeight:600,fontSize:14,color:"#201A16"}}>{n.name}</span>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 14px 16px",borderTop:"1px solid #FBF8F1"}}>
                        <div style={{marginTop:12}}>
                          <div style={{fontSize:10,fontWeight:700,color:"#0D7A5F",textTransform:"",
                            letterSpacing:".07em",marginBottom:5}}>💡 Why This Works</div>
                          <p style={{fontSize:13,color:"#6E6459",margin:0,lineHeight:1.6,
                            borderLeft:"2px solid #0D7A5F40",paddingLeft:10}}>{n.why}</p>
                        </div>
                        <div style={{marginTop:12}}>
                          <div style={{fontSize:10,fontWeight:700,color:"#C99A3B",textTransform:"",
                            letterSpacing:".07em",marginBottom:5}}>📍 Where to Find Them</div>
                          <p style={{fontSize:13,color:"#6E6459",margin:0,lineHeight:1.6,
                            borderLeft:"2px solid #C99A3B40",paddingLeft:10}}>{n.find}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SERVICES */}
        {tab==="services"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>The 4 Bridge Components</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 16px",lineHeight:1.6}}>
              Always start with Rapid-Response Intake — it's the fastest, most measurable win, and it
              earns the trust that makes every upsell after it easier.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {SERVICES_4.map((s,i)=>{
                const isOpen=openSvc===i;
                return (
                  <div key={i} onClick={()=>setOpenSvc(isOpen?null:i)}
                    style={{background:isOpen?"#FBF8F1":"#F8F5EE",
                      border:`1px solid ${isOpen?s.color:"#FBF8F1"}`,
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"13px 15px",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:38,height:38,borderRadius:9,background:s.color+"18",
                        border:`1px solid ${s.color}35`,display:"flex",alignItems:"center",
                        justifyContent:"center",fontSize:20,flexShrink:0}}>{s.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:14,color:"#201A16"}}>{s.name}</div>
                        <div style={{fontSize:12,color:s.color,fontWeight:600,marginTop:2}}>{s.price}</div>
                      </div>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 15px 16px",borderTop:"1px solid #FBF8F1"}}>
                        {[
                          ["🔍 Signal — When to Lead With This",s.signal,"#7A5A00"],
                          ["🎤 Pitch Script",s.pitch,"#0D7A5F"],
                          ["⚙️ Setup Steps",s.setup,"#C99A3B"],
                          ["📈 Upsell Trigger",s.upsell,"#8B2E1F"],
                        ].map(([lbl,val,col])=>(
                          <div key={lbl} style={{marginTop:12}}>
                            <div style={{fontSize:10,fontWeight:700,color:col,textTransform:"",
                              letterSpacing:".07em",marginBottom:5}}>{lbl}</div>
                            <p style={{fontSize:13,color:"#6E6459",margin:0,lineHeight:1.65,
                              borderLeft:`2px solid ${col}40`,paddingLeft:10,
                              fontStyle:lbl.includes("Pitch")?"italic":"normal"}}>{val}</p>
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

        {/* SCRIPTS */}
        {tab==="scripts"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Scripts and Templates</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 14px",lineHeight:1.6}}>
              Warm and empathetic in tone, always. This is not urgency-driven sales — it's helping
              people who help families in genuine need.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {SCRIPTS.map((s,i)=>{
                const isOpen=openScript===i;
                return (
                  <div key={i} onClick={()=>setOpenScript(isOpen?null:i)}
                    style={{background:isOpen?"#FBF8F1":"#F8F5EE",
                      border:`1px solid ${isOpen?s.color:"#FBF8F1"}`,
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap",marginBottom:2}}>
                          <span style={{fontWeight:700,fontSize:13.5,color:"#201A16"}}>{s.title}</span>
                          <span style={{fontSize:10,color:s.color,background:s.color+"18",
                            borderRadius:4,padding:"1px 6px",fontWeight:600}}>{s.tag}</span>
                        </div>
                      </div>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 14px 14px",borderTop:"1px solid #FBF8F1"}}>
                        <p style={{background:"#F5F0E4",borderRadius:8,padding:"12px 13px",
                          marginTop:12,fontFamily:"'Courier New',monospace",fontSize:12,
                          color:"#6E6459",lineHeight:1.85,borderLeft:`2px solid ${s.color}40`,
                          whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{s.body}</p>
                        <div style={{marginTop:9,background:s.color+"10",border:`1px solid ${s.color}25`,
                          borderRadius:7,padding:"7px 10px",fontSize:12,color:s.color,lineHeight:1.5}}>
                          💡 {s.note}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PRICING */}
        {tab==="pricing"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Pricing Packages</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 16px",lineHeight:1.6}}>
              Always begin with a free pilot on 5 real inquiries before proposing any tier — this is
              what earns the right to a pricing conversation at all.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {PACKAGES.map((pkg)=>(
                <div key={pkg.name} style={{background:"#F8F5EE",border:`1px solid ${pkg.color}35`,
                  borderRadius:12,overflow:"hidden"}}>
                  <div style={{padding:"15px 16px",borderBottom:"1px solid #FBF8F1",
                    display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:24}}>{pkg.icon}</span>
                      <div>
                        <div style={{fontWeight:700,fontSize:15,color:"#201A16"}}>{pkg.name}</div>
                        <div style={{fontSize:11,color:"#D9CFBB",marginTop:2}}>Best for: {pkg.bestFor}</div>
                      </div>
                    </div>
                    <div style={{fontSize:16,fontWeight:800,color:pkg.color,whiteSpace:"nowrap"}}>{pkg.price}</div>
                  </div>
                  <div style={{padding:"13px 16px"}}>
                    {pkg.includes.map((item,j)=>(
                      <div key={j} style={{display:"flex",gap:8,marginBottom:7,alignItems:"flex-start"}}>
                        <span style={{color:pkg.color,fontSize:13,flexShrink:0,marginTop:1}}>✓</span>
                        <span style={{fontSize:13,color:"#6E6459",lineHeight:1.55}}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:16,background:"#F5F0E4",border:"1px solid #0D7A5F25",
              borderRadius:12,padding:"16px"}}>
              <SLabel text="12-Month Value Per Agency" color="#0D7A5F"/>
              {[
                {t:"Foundation only",v:"$900-$1,800/year"},
                {t:"Growth tier",v:"$2,100-$4,200/year"},
                {t:"Full Care System",v:"$4,200-$7,200/year"},
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",
                  padding:"8px 0",borderBottom:"1px solid #FBF8F1"}}>
                  <span style={{fontSize:13,color:"#6E6459"}}>{r.t}</span>
                  <span style={{fontSize:13,fontWeight:700,color:"#0D7A5F"}}>{r.v}</span>
                </div>
              ))}
              <p style={{fontSize:12,color:"#D9CFBB",margin:"10px 0 0",lineHeight:1.6}}>
                Five agencies on the Growth tier alone = $10,500-$21,000 a year in recurring revenue,
                in a market virtually no other digital agency is competing for.
              </p>
            </div>
          </div>
        )}

        {/* FAQ */}
        {tab==="faq"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>FAQ</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 14px"}}>
              The questions every student asks before approaching their first care agency.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {FAQS.map((f,i)=>{
                const isOpen=openFaq===i;
                return (
                  <div key={i} onClick={()=>setOpenFaq(isOpen?null:i)}
                    style={{background:isOpen?"#FBF8F1":"#F8F5EE",
                      border:`1px solid ${isOpen?"#7A5A00":"#FBF8F1"}`,
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"12px 14px",display:"flex",alignItems:"flex-start",gap:9}}>
                      <span style={{color:"#7A5A00",fontSize:13,fontWeight:800,flexShrink:0,marginTop:1}}>Q</span>
                      <span style={{flex:1,fontSize:13.5,fontWeight:600,color:"#201A16",lineHeight:1.45}}>{f.q}</span>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 14px 13px",borderTop:"1px solid #FBF8F1"}}>
                        <div style={{display:"flex",gap:9,marginTop:11,alignItems:"flex-start"}}>
                          <span style={{color:"#0D7A5F",fontSize:13,fontWeight:800,flexShrink:0}}>A</span>
                          <p style={{fontSize:13,color:"#6E6459",margin:0,lineHeight:1.65}}>{f.a}</p>
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
