import { useState, useMemo } from "react";

const WEEKS = [
  {
    week:1, title:"Audit Your Own Ministry", range:"Days 1-7",
    icon:"🔍", color:"#7A5A00",
    goal:"Free tools set up, your own parish audited, one pilot project chosen, and verbal buy-in secured from leadership.",
    days:[
      {day:1, focus:"Free Account Setup", icon:"⚡",
       note:"Total cost today: $0. This entire system runs on free tools until real revenue justifies an upgrade.",
       tasks:[
         {id:"1a",text:"Create a free Notion account — this becomes your Ministry CRM"},
         {id:"1b",text:"Create a free Zapier or Make.com account — the free tier is enough to start"},
         {id:"1c",text:"Confirm you already have Google Forms and Sheets access (most Gmail accounts do)"},
         {id:"1d",text:"Research whether your diocese or denomination already has a preferred giving platform"},
       ]},
      {day:2, focus:"Audit Your Own Parish", icon:"🔎",
       note:"You cannot pitch a solution until you understand the real, specific gap. Do this audit honestly.",
       tasks:[
         {id:"2a",text:"List every event your parish or ministry runs in a typical year — feast days, camps, retreats, fundraisers"},
         {id:"2b",text:"Note how each currently handles registration — paper sign-up, WhatsApp, or nothing at all"},
         {id:"2c",text:"Note how giving currently works — envelope only, or is there any online option"},
         {id:"2d",text:"Note how announcements currently go out — pulpit only, WhatsApp broadcast, or a printed bulletin"},
       ]},
      {day:3, focus:"Pick Your Pilot Project", icon:"🎯",
       note:"One gap, one fix, one pilot. Do not try to solve everything at once — that overwhelms both you and your leadership.",
       tasks:[
         {id:"3a",text:"Choose ONE upcoming event or ONE clear pain point to solve first"},
         {id:"3b",text:"Best pilot candidates: an upcoming feast week, youth camp, retreat, or conference with a real registration need"},
         {id:"3c",text:"Confirm the event date gives you at least 3 weeks to build, test, and launch"},
       ]},
      {day:4, focus:"Have the Conversation", icon:"💬",
       note:"This is not a sales pitch. This is a trusted member of the community offering to help, for free, to prove a concept.",
       tasks:[
         {id:"4a",text:"Approach your parish priest, youth coordinator, or ministry leader directly"},
         {id:"4b",text:"Use the 'Bringing It Up With Your Own Leadership' script from the Scripts tab"},
         {id:"4c",text:"Get verbal buy-in to pilot the system for this one event, completely free"},
       ]},
      {day:5, focus:"Map the Pilot", icon:"📐",
       note:"Blueprint before build. This one habit will define your entire career as a Digital Systems Engineer.",
       tasks:[
         {id:"5a",text:"Sketch exactly what the registration form needs to capture — name, contact, dietary needs, age group"},
         {id:"5b",text:"Decide whether you need automated confirmation email, SMS, or both"},
         {id:"5c",text:"Decide whether the planning committee needs a live headcount dashboard"},
       ]},
      {day:6, focus:"Build the Pilot — Part 1", icon:"🛠️",
       note:"Simple beats fancy. A working Google Form beats an elaborate app nobody finishes.",
       tasks:[
         {id:"6a",text:"Build the Google Form with every field mapped out on Day 5"},
         {id:"6b",text:"Connect it to a Google Sheet"},
         {id:"6c",text:"Set up basic formulas or a simple view for real-time headcount tracking"},
       ]},
      {day:7, focus:"Build the Pilot — Part 2", icon:"✅",
       note:"Test everything yourself, twice, before anyone else touches it. Broken links kill trust instantly.",
       tasks:[
         {id:"7a",text:"Set up the Zapier or Make automation — form submission triggers a confirmation email or SMS"},
         {id:"7b",text:"Test the entire flow yourself end to end before anyone else sees it"},
         {id:"7c",text:"Share the form link with the event coordinator for their review"},
       ]},
    ]},
  {
    week:2, title:"Launch the Pilot", range:"Days 8-14",
    icon:"🚀", color:"#0D7A5F",
    goal:"The pilot system live and running for a real event, with early friction points caught and fixed.",
    days:[
      {day:8, focus:"Soft Launch", icon:"🚀",
       note:"Watch the first few responses closely — small fixes now prevent bigger problems later.",
       tasks:[
         {id:"8a",text:"Share the registration link through your parish's normal channels — bulletin, WhatsApp, announcement"},
         {id:"8b",text:"Monitor the first responses closely and fix any issues immediately"},
       ]},
      {day:9, focus:"Monitor and Support", icon:"👀",
       tasks:[
         {id:"9a",text:"Check for new registrations daily"},
         {id:"9b",text:"Personally help any older or less tech-comfortable congregants who need assistance registering"},
       ]},
      {day:10, focus:"Continue Monitoring", icon:"👀",
       tasks:[
         {id:"10a",text:"Note any friction points people mention — these become improvements for your next parish"},
         {id:"10b",text:"Keep the event coordinator updated on registration numbers"},
       ]},
      {day:11, focus:"Mid-Pilot Check-In", icon:"🗣️",
       note:"Their exact words here become your testimonial. Write them down verbatim.",
       tasks:[
         {id:"11a",text:"Meet briefly with the event coordinator — ask how this compares to the usual paper process"},
         {id:"11b",text:"Write down their exact words — this becomes your testimonial material"},
       ]},
      {day:12, focus:"Prepare for Event Day", icon:"📋",
       tasks:[
         {id:"12a",text:"Export the final headcount and registration list for the planning committee"},
         {id:"12b",text:"If doing day-of check-in, prepare a simple sheet or QR-based system"},
       ]},
      {day:13, focus:"Brief Your Volunteers", icon:"🙋",
       tasks:[
         {id:"13a",text:"If others will help with check-in, walk them through the system in 5 minutes"},
         {id:"13b",text:"Confirm everyone knows what to do if something goes wrong"},
       ]},
      {day:14, focus:"Event Day", icon:"🎉",
       note:"This is the moment your case study is born. Pay close attention.",
       tasks:[
         {id:"14a",text:"Run the event using the system live"},
         {id:"14b",text:"Note everything that worked well and anything that did not, honestly"},
       ]},
    ]},
  {
    week:3, title:"Document the Case Study", range:"Days 15-21",
    icon:"📄", color:"#C99A3B",
    goal:"A real case study, testimonial, numbers, and packaged offer ready to show any parish or ministry.",
    days:[
      {day:15, focus:"Debrief with Leadership", icon:"🪞",
       note:"Ask directly. Most leaders are happy to give an honest, specific answer if you ask well.",
       tasks:[
         {id:"15a",text:"Sit down with the priest or coordinator after the event"},
         {id:"15b",text:"Ask directly whether this was easier than the old way, and whether they would want it again"},
         {id:"15c",text:"Ask for a specific quote you can use later — this is your testimonial"},
       ]},
      {day:16, focus:"Gather the Numbers", icon:"📊",
       note:"Numbers make your case study credible. Vague impressions do not close deals — specific results do.",
       tasks:[
         {id:"16a",text:"Compare how many registered digitally versus what paper tracking would have captured"},
         {id:"16b",text:"Ask the coordinator to estimate admin time saved"},
         {id:"16c",text:"Note any other measurable wins — fewer no-shows, better dietary or accessibility planning"},
       ]},
      {day:17, focus:"Build Your One-Page Case Study", icon:"📝",
       tasks:[
         {id:"17a",text:"Create a simple document showing The Problem → What You Built → The Result"},
         {id:"17b",text:"Include the testimonial quote and the real numbers from Day 16"},
       ]},
      {day:18, focus:"Build Your Notion Ministry CRM", icon:"🗂️",
       tasks:[
         {id:"18a",text:"Set up the full Notion database using every column in the Notion CRM tab"},
         {id:"18b",text:"Enter your own parish as your first case study entry"},
       ]},
      {day:19, focus:"Package Your Offer", icon:"💰",
       tasks:[
         {id:"19a",text:"Finalize your three pricing tiers — Foundation, Growth, Full Ministry"},
         {id:"19b",text:"Write a simple one-page overview of exactly what each tier includes"},
       ]},
      {day:20, focus:"Build a Visual Demo", icon:"🎨",
       tasks:[
         {id:"20a",text:"If you have Lovable access, build a simple branded demo page for a generic parish"},
         {id:"20b",text:"This becomes your visual pitch tool, the same way your SMB Lovable demos work"},
       ]},
      {day:21, focus:"Week 3 Review", icon:"✅",
       tasks:[
         {id:"21a",text:"Confirm you now have a real case study, a real testimonial, real numbers, and a packaged offer"},
       ]},
    ]},
  {
    week:4, title:"Identify Your Warm Network", range:"Days 22-28",
    icon:"🗺️", color:"#8B2E1F",
    goal:"A prioritized list of real relationships — no cold outreach, only warm, trusted introductions.",
    days:[
      {day:22, focus:"Map Your Network", icon:"🗺️",
       note:"This is the entire point of this system — your network is inherently different from every other student's.",
       tasks:[
         {id:"22a",text:"List every parish, ministry, youth group, or diocesan contact you have any real relationship with"},
         {id:"22b",text:"Include other parishes in your diocese, youth society connections, and denominational conference contacts"},
       ]},
      {day:23, focus:"Prioritize Your List", icon:"🎯",
       tasks:[
         {id:"23a",text:"Rank contacts by relationship strength and likely need for these systems"},
         {id:"23b",text:"Pick your top 5 to approach first"},
       ]},
      {day:24, focus:"Prepare Your Approach", icon:"📝",
       note:"This is a warm, relational introduction — never a cold email. The tone must feel completely different.",
       tasks:[
         {id:"24a",text:"For each of the 5, think through the natural way to bring this up — after Mass, at a diocesan meeting, through a mutual friend"},
       ]},
      {day:25, focus:"Make Your First Approaches", icon:"🤝",
       tasks:[
         {id:"25a",text:"Reach out to your top 2-3 warm contacts using the 'Introducing to a New Parish' script"},
         {id:"25b",text:"Share your case study and offer a similar pilot"},
       ]},
      {day:26, focus:"Continue Outreach", icon:"🤝",
       tasks:[
         {id:"26a",text:"Reach out to the remaining contacts on your top-5 list"},
         {id:"26b",text:"Keep the tone warm and low-pressure throughout"},
       ]},
      {day:27, focus:"Follow Up", icon:"🔁",
       tasks:[
         {id:"27a",text:"Follow up with anyone who has not yet responded"},
         {id:"27b",text:"Schedule proper conversations with anyone who showed interest"},
       ]},
      {day:28, focus:"Week 4 Review", icon:"✅",
       tasks:[
         {id:"28a",text:"Count how many real conversations have started and how many are moving toward a proposal"},
       ]},
    ]},
  {
    week:5, title:"Present and Close", range:"Days 29-35",
    icon:"🏆", color:"#7A5A00",
    goal:"Your first paying ministry client, with a clear agreement on package, price, and timeline.",
    days:[
      {day:29, focus:"Prepare Your Presentation", icon:"🎤",
       tasks:[
         {id:"29a",text:"Adapt your case study and pricing to the specific ministry you are presenting to"},
         {id:"29b",text:"Anticipate their single biggest pain point before the conversation"},
       ]},
      {day:30, focus:"Present to Your Top Prospect", icon:"🎤",
       tasks:[
         {id:"30a",text:"Walk through the case study, the demo, and the tiered pricing together"},
         {id:"30b",text:"Lead with the tier that solves their specific biggest pain point first"},
       ]},
      {day:31, focus:"Present to Additional Prospects", icon:"🎤",
       tasks:[
         {id:"31a",text:"Repeat the presentation with your next 1-2 warm prospects"},
       ]},
      {day:32, focus:"Handle Objections", icon:"🛡️",
       tasks:[
         {id:"32a",text:"Use the 'No Budget' and 'Committee Approval' scripts from the Scripts tab as needed"},
         {id:"32b",text:"Offer a small free pilot period if a full retainer feels too big a first step"},
       ]},
      {day:33, focus:"Close Your First Paying Client", icon:"🤝",
       tasks:[
         {id:"33a",text:"Get clear verbal or written agreement on the package and price"},
         {id:"33b",text:"Set expectations for what gets built, by when, and the first payment"},
       ]},
      {day:34, focus:"Confirm and Kick Off", icon:"📋",
       tasks:[
         {id:"34a",text:"Send a simple written summary of what was agreed"},
         {id:"34b",text:"Schedule the Blueprint conversation to map exactly what gets built"},
       ]},
      {day:35, focus:"Week 5 Review", icon:"✅",
       tasks:[{id:"35a",text:"Confirm your first paying ministry client is locked in with clear next steps"}]},
    ]},
  {
    week:6, title:"Deliver", range:"Days 36-42",
    icon:"⚙️", color:"#0D7A5F",
    goal:"The system fully built, tested, and live for your first paying client.",
    days:[
      {day:36, focus:"Blueprint the Build", icon:"📐",
       tasks:[
         {id:"36a",text:"Map out exactly what this client needs, using the same Blueprint approach from your SMB work"},
         {id:"36b",text:"Get written confirmation before building anything"},
       ]},
      {day:37, focus:"Build — Part 1", icon:"🛠️",
       tasks:[{id:"37a",text:"Begin building the agreed system — forms, automations, or giving integration"}]},
      {day:38, focus:"Build — Part 2", icon:"🛠️",
       tasks:[
         {id:"38a",text:"Continue building"},
         {id:"38b",text:"Send the client a quick progress update"},
       ]},
      {day:39, focus:"Test Thoroughly", icon:"🧪",
       tasks:[{id:"39a",text:"Test every part of the system yourself before the client sees it live"}]},
      {day:40, focus:"Client Review", icon:"👀",
       tasks:[
         {id:"40a",text:"Walk the client through the system before public launch"},
         {id:"40b",text:"Make any final adjustments they request"},
       ]},
      {day:41, focus:"Launch", icon:"🚀",
       tasks:[{id:"41a",text:"Launch the system for the new client using the same soft-launch approach as your own parish pilot"}]},
      {day:42, focus:"Week 6 Review", icon:"✅",
       tasks:[{id:"42a",text:"Confirm the system is live and functioning correctly for the new client"}]},
    ]},
  {
    week:7, title:"Support and Prove Value", range:"Days 43-49",
    icon:"🛟", color:"#7A5A00",
    goal:"A smoothly running system and a client who feels genuinely supported, not just sold to.",
    days:[
      {day:43, focus:"First Days of Live Support", icon:"🛟",
       note:"This is where trust is won or lost. Respond fast to anything that comes up.",
       tasks:[{id:"43a",text:"Check in every 2-3 days during the first two weeks live and fix any issues immediately"}]},
      {day:44, focus:"Continue Monitoring", icon:"🛟",
       tasks:[{id:"44a",text:"Check the system is running smoothly, resolve anything flagged"}]},
      {day:45, focus:"Continue Monitoring", icon:"🛟",
       tasks:[{id:"45a",text:"Check the system is running smoothly, resolve anything flagged"}]},
      {day:46, focus:"Mid-Point Check-In Call", icon:"📞",
       tasks:[{id:"46a",text:"Show the client results so far and gather honest feedback"}]},
      {day:47, focus:"Address Any Feedback", icon:"🔧",
       tasks:[{id:"47a",text:"Make any adjustments based on the check-in conversation"}]},
      {day:48, focus:"Continue Supporting", icon:"🛟",
       tasks:[{id:"48a",text:"Stay responsive and visible without being intrusive"}]},
      {day:49, focus:"Week 7 Review", icon:"✅",
       tasks:[{id:"49a",text:"Confirm the system is running smoothly with no outstanding issues"}]},
    ]},
  {
    week:8, title:"Expand the Relationship", range:"Days 50-56",
    icon:"📈", color:"#7A5A00",
    goal:"An upsold client and at least one warm referral opened inside the diocesan or denominational network.",
    days:[
      {day:50, focus:"Identify the Next Need", icon:"🔍",
       tasks:[{id:"50a",text:"Now that trust exists, identify their next biggest pain point — giving, communication, or digital formation"}]},
      {day:51, focus:"Pitch the Upsell", icon:"📈",
       tasks:[{id:"51a",text:"Use the same 'problem you already showed them' approach from your SMB upsell ladder"}]},
      {day:52, focus:"Continue the Upsell Conversation", icon:"📈",
       tasks:[{id:"52a",text:"Follow up on the upsell pitch, answer any questions"}]},
      {day:53, focus:"Ask for a Referral", icon:"🙏",
       note:"Diocesan meetings and denominational conferences are gold for this. Ask directly and warmly.",
       tasks:[{id:"53a",text:"Use the 'Asking for a Referral' script — ask if they know another parish or ministry facing the same challenge"}]},
      {day:54, focus:"Follow Up on Referrals", icon:"🔁",
       tasks:[{id:"54a",text:"Reach out to any referral warmly, mentioning who connected you"}]},
      {day:55, focus:"Follow Up on the Upsell", icon:"🔁",
       tasks:[{id:"55a",text:"Close the upsell conversation if it has not yet concluded"}]},
      {day:56, focus:"Week 8 Review", icon:"✅",
       tasks:[{id:"56a",text:"Tally upsell revenue and any new referral conversations opened"}]},
    ]},
  {
    week:9, title:"Review and Plan to Scale", range:"Days 57-60",
    icon:"🌅", color:"#0D7A5F",
    goal:"A full honest review complete and your own refined playbook documented for teaching others.",
    days:[
      {day:57, focus:"Full Revenue Review", icon:"📊",
       tasks:[{id:"57a",text:"Tally total revenue collected, systems built, and relationships opened over the full 60 days"}]},
      {day:58, focus:"Honest Retrospective", icon:"🪞",
       tasks:[{id:"58a",text:"Write down what worked best and what you would do differently next time"}]},
      {day:59, focus:"Set Your Next 30-Day Targets", icon:"🎯",
       tasks:[{id:"59a",text:"Decide how many more parishes or ministries to approach next month"}]},
      {day:60, focus:"Document Your Own Playbook", icon:"📚",
       note:"This is what makes the system teachable — your own real, lived version of this process.",
       tasks:[
         {id:"60a",text:"Write your own refined version of this process in your own words"},
         {id:"60b",text:"This becomes what you can teach other Digital Systems students to run in their own faith communities"},
       ]},
    ]},
];

const NOTION_COLS = [
  {name:"Parish / Ministry Name", type:"Title",    icon:"⛪", desc:"Official name of the parish, church, or ministry organization"},
  {name:"Denomination",           type:"Select",   icon:"✝️", desc:"Catholic / Anglican / Pentecostal / Baptist / Methodist / Non-denominational / Other"},
  {name:"Diocese / Network",      type:"Text",     icon:"🏛️", desc:"Which diocese or denominational network they belong to"},
  {name:"Location",               type:"Text",     icon:"📍", desc:"City or region where the parish/ministry operates"},
  {name:"Primary Contact Name",   type:"Text",     icon:"👤", desc:"Usually the parish priest, pastor, or ministry coordinator"},
  {name:"Contact Role",           type:"Select",   icon:"🎖️", desc:"Parish Priest / Pastor / Youth Coordinator / Ministry Leader / Committee Chair"},
  {name:"Contact Method",         type:"Select",   icon:"📱", desc:"WhatsApp / Phone / Email / In-Person Only"},
  {name:"Relationship Type",      type:"Select",   icon:"🤝", desc:"My Own Parish / Personal Network / Referral / Diocesan Connection"},
  {name:"Congregation Size",      type:"Select",   icon:"👥", desc:"Small (under 100) / Medium (100-500) / Large (500+)"},
  {name:"Biggest Pain Point",     type:"Select",   icon:"⚠️", desc:"Event Registration Chaos / Giving Friction / Communication Scatter / No Digital Formation"},
  {name:"Relationship Stage",     type:"Select",   icon:"📊", desc:"Identified → Relationship Building → Pilot Proposed → Pilot Running → Case Study Documented → Package Presented → Closed → Active Client → Referral Source"},
  {name:"Package Tier",           type:"Select",   icon:"💰", desc:"Pilot Only / Foundation / Growth / Full Ministry"},
  {name:"Monthly Retainer",       type:"Number",   icon:"💵", desc:"Agreed monthly amount, once closed"},
  {name:"Pilot Event / Project",  type:"Text",     icon:"📅", desc:"What event or project the pilot was built around"},
  {name:"Testimonial Quote",      type:"Text",     icon:"💬", desc:"Their exact words after the pilot — your proof material"},
  {name:"Next Action",            type:"Text",     icon:"➡️", desc:"What needs to happen next with this relationship"},
  {name:"Next Action Date",       type:"Date",     icon:"⏰", desc:"When the next action is due"},
  {name:"Notes",                  type:"Text",     icon:"📝", desc:"Anything else relevant — family connections, shared history, prior conversations"},
];

const NOTION_VIEWS = [
  {name:"⛪ All Ministries",        desc:"Master table — every parish, church, or ministry relationship in one place."},
  {name:"🌱 My Network",            desc:"Filter: Relationship Stage = Identified or Relationship Building. Your warm outreach list."},
  {name:"🔬 Active Pilots",         desc:"Filter: Stage = Pilot Proposed or Pilot Running. What you're currently proving out."},
  {name:"💰 Active Paying Clients", desc:"Filter: Stage = Active Client. Your recurring revenue base."},
  {name:"🙏 Referral Sources",      desc:"Filter: Stage = Referral Source. Clients who have opened doors to others — nurture these relationships."},
];

const SERVICES_4 = [
  {icon:"📋", color:"#7A5A00", name:"Event Registration & Check-In System", price:"$100-250/month (free pilot only at your own parish)",
   signal:"Parish or ministry runs 3+ events per year with paper sign-up sheets, no headcount visibility, or manual tracking.",
   pitch:"\"I noticed [event]'s registration is still tracked on paper. I could build a simple online form that captures the same information but gives the planning committee an exact headcount automatically, and sends everyone a confirmation. Want me to try it for the next event — no cost, just to see if it helps?\"",
   tools:"Google Forms + Google Sheets + Zapier or Make (all free)",
   setup:"Build the form with every needed field → connect to a Sheet → automation: form submitted → confirmation email or SMS → optional QR check-in on event day",
   upsell:"Once this is running smoothly: \"Now that registration is handled, the next thing I noticed is how giving currently works — want me to show you what an online option could look like?\""},
  {icon:"💝", color:"#0D7A5F", name:"Digital Giving & Stewardship System", price:"$150-350/month",
   signal:"Envelope or cash-only giving, no recurring tithe option, or an existing giving solution that feels clunky.",
   pitch:"\"Right now giving only happens through envelopes on Sunday, which means members who travel or would give electronically have no easy way to support the parish consistently. I can set up an online giving option with automatic receipts and optional recurring giving, so stewardship doesn't depend on who's physically present each week.\"",
   tools:"Tithe.ly or Pushpay (US / international), Paystack or Flutterwave (Nigeria / Africa)",
   setup:"Set up the giving platform account → connect bank details → embed the giving link on the parish website or WhatsApp → configure automated receipt emails",
   upsell:"Once giving is flowing smoothly: \"Now let's make sure every giver actually hears from the parish regularly — want me to set up a proper communication system too?\""},
  {icon:"📢", color:"#C99A3B", name:"Congregant Communication Hub", price:"$100-250/month",
   signal:"Relying solely on WhatsApp broadcast or pulpit announcements, low event attendance due to poor reminders, no proper email list.",
   pitch:"\"A lot of announcements are only reaching whoever happened to be in the building that Sunday, or hasn't muted the WhatsApp group. I can set up a proper email and SMS system that reminds people automatically about services and events, and even sends a personal note on birthdays and anniversaries — the kind of pastoral touch that's hard to keep up manually.\"",
   tools:"Klaviyo or Mailchimp (free tier), WhatsApp Business (free)",
   setup:"Build the congregant email and phone list → set up automated service/event reminder sequences → configure birthday and anniversary automated messages",
   upsell:"Once communication is solid: \"The last piece is making sure your teaching reaches people beyond just Sunday — want to see what a simple online Bible study platform could look like?\""},
  {icon:"📖", color:"#8B2E1F", name:"Digital Formation & Course Platform", price:"$150-450/month",
   signal:"Wants to scale Bible studies, confirmation classes, RCIA, or leadership training beyond in-person only, or reach members who travel.",
   pitch:"\"Right now, anyone who misses a Bible study session or confirmation class simply misses it — there's no way to catch up. I can build a simple course platform where sessions are recorded, materials are organized, and you can actually track who's completing the formation program. The same content can then serve multiple small groups instead of being taught fresh every time.\"",
   tools:"Kajabi or Passion.io",
   setup:"Structure the content into modules → upload teaching videos and materials → configure progress tracking → set up enrollment for the relevant group",
   upsell:"This is typically the final tier — from here, the conversation naturally shifts to introducing you to other parishes or ministries in the diocesan network."},
];

const SCRIPTS = [
  {id:"own", tag:"Your Own Parish · Opening the Pilot", color:"#7A5A00",
   title:"Bringing It Up With Your Own Leadership",
   note:"This is not a pitch. It is a trusted member of the community offering to help, for free, to see if it works.",
   body:"Father / Pastor [Name], I've been learning digital systems as part of my work, and I'd love to try something for [upcoming event]. Right now we track registrations on paper — I could build a simple online form that captures the same information but automatically gives us a headcount and sends people a confirmation. No cost, I just want to see if it actually helps. Would you be open to trying it for this one event?"},
  {id:"results", tag:"After the Pilot · Presenting Results", color:"#0D7A5F",
   title:"Presenting Your Pilot Results",
   note:"Lead with the numbers and the coordinator's own words wherever possible — proof beats promises.",
   body:"I wanted to share what happened with the registration system for [event]. We had [X] people register online, which meant we knew exact numbers for food and seating days ahead instead of guessing. [Coordinator name] mentioned it saved real time compared to the usual paper process. I think this could genuinely help going forward — would you want to talk about making this a regular part of how we run events?"},
  {id:"intro", tag:"New Parish · Warm Introduction", color:"#C99A3B",
   title:"Introducing This to a New Parish or Ministry",
   note:"Always through a warm connection — never a cold email. Reference the shared network directly.",
   body:"[Name], I built a simple registration and reminder system for [your own parish]'s recent [event], and it made a real difference — we finally had exact headcounts and nobody missed the reminder. I know [their parish/ministry] runs [similar events] too — would it be worth a quick conversation about whether something similar could help you?"},
  {id:"budget", tag:"Objection · No Budget", color:"#8B2E1F",
   title:"Handling: \"We Don't Have Budget for This\"",
   note:"Never push. Offer the free pilot again if needed — trust is the currency here, not urgency.",
   body:"I completely understand — most parishes don't have a line item for this yet. That's actually why I usually start with a free pilot for one event first, so there's no financial risk at all. If it genuinely saves time and helps planning, then we can talk about a small monthly amount to keep it running and grow it. Does that feel fair?"},
  {id:"committee", tag:"Objection · Committee Approval Needed", color:"#7A5A00",
   title:"Handling: \"We Need Committee or Board Approval\"",
   note:"This is normal, not a rejection. Make it easy for them to advocate for you when you're not in the room.",
   body:"Of course — that makes complete sense for a decision like this. Would it help if I put together a one-page summary you could bring to the committee? I can include what we built for [case study parish], the actual results, and the pricing tiers, so they have everything they need without me needing to be in the room."},
  {id:"referral", tag:"Growth · Asking for a Referral", color:"#0D7A5F",
   title:"Asking for a Referral Within Your Network",
   note:"Diocesan meetings and denominational conferences are the best place to ask this in person.",
   body:"I'm really glad this has been helpful for [parish name]. If you know any other parish priests, pastors, or ministry leaders in the diocese who might be dealing with the same headache around [registration / giving / communication], I'd love an introduction. I promise to take just as much care with them as I have here."},
];

const FAQS = [
  {q:"How do I bring this up without it seeming like I'm trying to profit from my own church?",
   a:"Frame the first project as a genuine free pilot. You are not selling to your own parish first — you are proving the concept. The paid relationship comes later, or with other parishes and ministries once you have real proof it works."},
  {q:"What if the church genuinely has no budget at all?",
   a:"A free pilot is reserved for your own parish — everywhere else, propose a short paid trial instead. Many congregations can find $100-200 a month once they see clear time savings and better event outcomes — but never assume budget exists until you've shown value first."},
  {q:"What if there's a whole committee or parish council that needs to approve spending?",
   a:"This is normal and not a bad sign. Prepare a simple one-page summary they can review without you present. Committees move slower than individuals — budget extra time in your pipeline for this."},
  {q:"Should I do this completely free forever at my own parish?",
   a:"The first pilot, yes — free. But once it's proven and becomes a permanent part of how the parish runs, it is completely appropriate to propose a modest ongoing fee to maintain and expand it, the same way any recurring service would be."},
  {q:"What if my priest or pastor doesn't understand technology at all?",
   a:"This is common and fine. Don't lead with the technology — lead with the outcome, such as knowing exact headcounts three days early instead of guessing. Handle all technical setup yourself; they should only ever need to view a simple list or dashboard."},
  {q:"How is this different from the church just using free tools themselves?",
   a:"Same reason a business hires a bookkeeper instead of doing it themselves — they could, but they won't, because they're busy running the actual ministry. You handle the setup, the automation, the troubleshooting, and the ongoing maintenance so it simply works."},
  {q:"What if I don't have any church connections at all to start with?",
   a:"Attend a service or ministry event as a genuine visitor first, build a real relationship, then offer the free pilot. This system depends on trust built over time, not cold outreach — it moves slower than SMB prospecting, and that is by design."},
  {q:"Can this work outside Christian churches — other faiths, or secular nonprofits?",
   a:"Yes. The exact same system — event registration, giving automation, communication hub, digital formation platform — applies to mosques, synagogues, temples, and any small nonprofit or community organization. The names change; the pain points are nearly identical everywhere."},
];

const PACKAGES = [
  {name:"Foundation", icon:"🌱", color:"#0D7A5F", price:"$100-200/month",
   includes:["Event registration & automated confirmation system","Basic communication hub (email/SMS reminders)","Monthly headcount and attendance summary"],
   bestFor:"Small parishes and ministries just starting to go digital"},
  {name:"Growth", icon:"⚡", color:"#7A5A00", price:"$250-450/month",
   includes:["Everything in Foundation","Digital giving & stewardship system","Automated giving receipts","Monthly giving report"],
   bestFor:"Growing congregations wanting a recurring giving option"},
  {name:"Full Ministry", icon:"🏆", color:"#8B2E1F", price:"$500-900/month",
   includes:["Everything in Growth","Digital formation / course platform","Priority support","Quarterly strategy check-in"],
   bestFor:"Larger parishes or dioceses wanting a complete digital presence"},
];

function Chevron({open}) {
  return <span style={{color:"#6E6459",fontSize:19,display:"inline-block",
    transform:open?"rotate(90deg)":"none",transition:"transform .2s",flexShrink:0}}>›</span>;
}

function Check({checked,color}) {
  return (
    <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${checked?color:"#6E6459"}`,
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

export default function DigitalMinistrySystems() {
  const [tab,setTab]             = useState("plan");
  const [openWeek,setOpenWeek]   = useState(0);
  const [openDay,setOpenDay]     = useState(null);
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
    {id:"plan",     label:"📅 60-Day Plan"},
    {id:"notion",   label:"🗂️ Ministry CRM"},
    {id:"services", label:"⛪ The 4 Services"},
    {id:"scripts",  label:"💬 Scripts"},
    {id:"pricing",  label:"💰 Packages"},
    {id:"faq",      label:"❓ FAQ"},
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
            Digital Ministry Systems — 60-Day Playbook
          </div>
          <h1 style={{margin:"0 0 7px",fontSize:"clamp(21px,4.5vw,33px)",fontWeight:800,
            lineHeight:1.15,background:"linear-gradient(135deg,#201A16 30%,#C99A3B 100%)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            Digital Systems for Faith Communities
          </h1>
          <p style={{margin:"0 0 14px",fontSize:12.5,color:"#6E6459",maxWidth:580,lineHeight:1.65}}>
            Event registration, digital giving, congregant communication, and online formation —
            built for parishes, churches, and ministries. Warm-network acquisition, not cold outreach.
          </p>
          <div style={{background:"#F5F0E4",border:"1px solid #0D7A5F30",borderRadius:10,
            padding:"11px 14px",marginBottom:14}}>
            <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.6}}>
              <strong style={{color:"#0D7A5F"}}>Why this system exists:</strong> your addressable
              market here is your own parish, your own diocese, your own denominational network —
              which by definition does not overlap with another student's community. This is the one
              system that structurally cannot saturate the way cold-outreach systems can.
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
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>60-Day Action Plan</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 14px"}}>
              Tap a week → tap a day → tick tasks as you complete them. This moves slower and warmer
              than SMB outreach — that is intentional.
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
                        <span style={{fontSize:10,color:"#6E6459",background:"#FBF8F1",
                          borderRadius:4,padding:"1px 6px"}}>{w.range}</span>
                        {wp>0&&<span style={{fontSize:10.5,fontWeight:700,color:w.color}}>{wp}%</span>}
                      </div>
                      <p style={{fontSize:11.5,color:"#6E6459",margin:"0 0 6px",lineHeight:1.4}}>{w.goal}</p>
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
                                <div style={{fontSize:11,color:"#6E6459",marginTop:2}}>{dDone}/{d.tasks.length} tasks</div>
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
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Ministry CRM — Full Setup</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 16px",lineHeight:1.6}}>
              Notion (free plan) tracks every parish, church, and ministry relationship — from first
              contact to active paying client to referral source.
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

        {/* SERVICES */}
        {tab==="services"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>The 4 Core Services</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 16px",lineHeight:1.6}}>
              Same rule as your SMB work: match the service to the pain point they already feel.
              Never pitch all four at once — lead with the one signal that fits.
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
                          ["🛠️ Tools",s.tools,"#C99A3B"],
                          ["⚙️ Setup Steps",s.setup,"#7A5A00"],
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
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Conversation Scripts</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 14px",lineHeight:1.6}}>
              These are warm, relational conversations — not cold emails. The tone should feel like a
              trusted member of the community, never a salesperson.
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
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 16px",lineHeight:1.6}}>
              Nothing in this system is priced below $100/month. The free pilot is reserved for your own
              parish — everywhere else, use a short, guarantee-backed paid trial to earn the pricing conversation.
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
                        <div style={{fontSize:11,color:"#6E6459",marginTop:2}}>Best for: {pkg.bestFor}</div>
                      </div>
                    </div>
                    <div style={{fontSize:17,fontWeight:800,color:pkg.color,whiteSpace:"nowrap"}}>{pkg.price}</div>
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
              <SLabel text="12-Month Value Per Ministry" color="#0D7A5F"/>
              {[
                {t:"Foundation only",v:"$1,200-$2,400/year"},
                {t:"Foundation + Growth",v:"$3,000-$5,400/year"},
                {t:"Full Ministry Package",v:"$6,000-$10,800/year"},
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",
                  padding:"8px 0",borderBottom:"1px solid #FBF8F1"}}>
                  <span style={{fontSize:13,color:"#6E6459"}}>{r.t}</span>
                  <span style={{fontSize:13,fontWeight:700,color:"#0D7A5F"}}>{r.v}</span>
                </div>
              ))}
              <p style={{fontSize:12,color:"#6E6459",margin:"10px 0 0",lineHeight:1.6}}>
                Five parishes on the Growth tier alone = roughly $15,000-$27,000 a year in recurring
                revenue, built entirely on relationships you already have or can warmly reach.
              </p>
            </div>
          </div>
        )}

        {/* FAQ */}
        {tab==="faq"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>FAQ</h2>
            <p style={{fontSize:12.5,color:"#6E6459",margin:"0 0 14px"}}>
              The questions every student asks before approaching their first parish or ministry.
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
