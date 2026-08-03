import { useState, useMemo } from "react";

const SPACES = [
  {rank:1, icon:"🎥", name:"YouTube", color:"#7A5A00",
   tag:"The new #1 — by a wide margin",
   why:"YouTube passed Spotify and Apple Podcasts combined to become the most-used podcast platform in the world — over a billion monthly podcast viewers, with roughly a third of weekly podcast listeners now naming it their primary platform. This isn't a slow trend anymore, it's the current shape of the market.",
   find:"Search a genre + \"podcast\" directly on YouTube, sorted by recent uploads. Check the channel's other videos to see if full episodes are posted at all, and whether they get meaningfully fewer views than the audio show's apparent audience size would suggest.",
   signal:"A show with real engagement on Apple/Spotify (reviews, ratings) that has no YouTube channel, or one that's clearly an afterthought — low-effort thumbnails, inconsistent uploads, audio-only reposts. In 2026, that's one of the largest, most provable gaps you can find.",
   bestFits:["Interview & Conversational","Comedy & Entertainment","Gaming & Pop Culture"]},
  {rank:2, icon:"🎧", name:"Apple Podcasts & Spotify Charts", color:"#0D7A5F",
   tag:"Still the core directory layer",
   why:"Spotify alone lists somewhere around 6-7 million podcast titles and Apple Podcasts around 2.6-2.9 million — genre and category charts on both are still the most direct way to browse a niche by real listener engagement (ratings, reviews, chart position) rather than guessing.",
   find:"Browse the category charts directly inside each app — not just the top 10, but positions 30-150, where shows have proven engagement but haven't been snapped up by an agency yet.",
   signal:"Real reviews and a consistent rating, but no show notes, generic episode titles, or a posting gap of more than 2-3 weeks between episodes.",
   bestFits:["Business & Entrepreneurship","Health & Wellness","Self-Improvement & Personal Development"]},
  {rank:3, icon:"✂️", name:"TikTok & Instagram Reels", color:"#8B2E1F",
   tag:"Where new listeners actually discover a show",
   why:"Most new listeners find a podcast through a clip, not the platform itself — which means this is also where you can see, in about thirty seconds, whether a show has any clip strategy at all.",
   find:"Search the show or host's name directly. If nothing comes up, or what's there is a single flat screen-recording with no captions, that's a visible, provable gap you can reference specifically in outreach.",
   signal:"A host who's clearly comfortable on camera in other content but has zero or barely-edited clips from their own show — the skill gap is production, not personality.",
   bestFits:["Comedy & Entertainment","True Crime","Gaming & Pop Culture"]},
  {rank:4, icon:"💬", name:"Genre Communities", color:"#7A5A00",
   tag:"Reddit, Discord, Facebook Groups",
   why:"Genre-specific communities are where the most engaged part of a show's audience actually hangs out — a host who's active in these spaces (or whose fans are, even if the host isn't) is a strong signal of a real, durable audience worth investing production quality into.",
   find:"Genre-specific subreddits, Facebook groups, and Discord servers built around a genre or even a specific show. Hosts often post their own episodes there directly, which doubles as a built-in engagement signal.",
   signal:"An active fan community discussing episodes in detail while the show itself still sounds rough or posts inconsistently — proof the content is strong enough to carry weak production, which makes the pitch for better production even easier.",
   bestFits:["True Crime","Sports Commentary","Gaming & Pop Culture"]},
  {rank:5, icon:"💼", name:"LinkedIn", color:"#7A5A00",
   tag:"Business genre + inbound discovery",
   why:"Business and interview-format hosts routinely cross-promote new episodes on LinkedIn, which makes it one of the few spaces where you can watch a host announce an episode and see, in the comments, exactly how their existing network reacts to it.",
   find:"Search for posts announcing new episodes in your genre, or search your genre + \"podcast\" + \"guest\" to find hosts actively booking interviews — a sign of a growing, resourced show.",
   signal:"A host posting consistently and getting real engagement on the post itself, but the actual episode has no show notes and a generic title — the content and audience are there, the production polish isn't.",
   bestFits:["Business & Entrepreneurship","Interview & Conversational","Self-Improvement & Personal Development"]},
];

const GENRES = [
  {icon:"💼", name:"Business & Entrepreneurship", color:"#7A5A00",
   why:"A large, well-monetized audience — hosts often already understand marketing ROI and have real budget for production.",
   find:"Apple Podcasts Business category charts, Spotify business podcast charts, LinkedIn posts where hosts promote their own show."},
  {icon:"💪", name:"Health & Wellness", color:"#0D7A5F",
   why:"A growing category with a highly engaged, loyal listener base — hosts often already invest in their personal brand elsewhere.",
   find:"Apple Podcasts Health & Fitness category, wellness influencer crossover shows."},
  {icon:"🕵️", name:"True Crime", color:"#7A5A00",
   why:"Massive audience engagement and extremely high clip-shareability — true crime clips perform exceptionally well on social platforms.",
   find:"Apple Podcasts True Crime category, true crime podcast Facebook communities and subreddits."},
  {icon:"🎭", name:"Comedy & Entertainment", color:"#C99A3B",
   why:"High clip virality potential — hosts are often creators already comfortable with social media growth tactics.",
   find:"Apple Podcasts Comedy category, comedian social media crossover shows."},
  {icon:"🎤", name:"Interview & Conversational", color:"#0D7A5F",
   why:"A broad, evergreen category with consistent, repeatable production needs across every single episode.",
   find:"Apple Podcasts Society & Culture category, LinkedIn or Twitter posts announcing new episode guests."},
  {icon:"🧠", name:"Self-Improvement & Personal Development", color:"#8B2E1F",
   why:"An engaged, loyal audience that returns episode after episode — hosts often building a broader coaching business alongside the show.",
   find:"Apple Podcasts Self-Improvement subcategory, personal development influencer crossover shows."},
  {icon:"🎮", name:"Gaming & Pop Culture", color:"#7A5A00",
   why:"A young, highly social-media-active audience — clips from this genre spread especially fast on TikTok and YouTube Shorts.",
   find:"Apple Podcasts TV & Film or Video Games categories, Discord gaming communities where hosts promote episodes."},
  {icon:"⚽", name:"Sports Commentary", color:"#7A5A00",
   why:"A passionate, consistent audience with strong appetite for clip-based highlights and hot takes.",
   find:"Apple Podcasts Sports category, sports team fan community forums and subreddits."},
];

const SCORE_FACTORS = [
  {key:"engagement", label:"Audience Engagement", max:25,
   help:"Proof there's a real audience worth investing production quality into.",
   options:[
     {label:"Strong ratings (4.5+) with active, recent reviews or comments", points:25},
     {label:"Decent ratings with some reviews", points:16},
     {label:"New or thin engagement, but real potential in the content itself", points:8},
     {label:"No visible engagement anywhere", points:0},
   ]},
  {key:"gap", label:"Production Gap Size", max:25,
   help:"How much real, provable value could you add — from the Show CRM's own gap signals.",
   options:[
     {label:"Multiple clear gaps at once (e.g. no clips AND no YouTube AND rough audio)", points:25},
     {label:"One clear, specific, fixable gap", points:16},
     {label:"Minor or mostly cosmetic gap only", points:8},
     {label:"Already well-produced — no real gap to point to", points:0},
   ]},
  {key:"consistency", label:"Posting Consistency & Momentum", max:20,
   help:"A stalled show is a much harder sell than an active one, regardless of past quality.",
   options:[
     {label:"Weekly, active, on-schedule", points:20},
     {label:"Bi-weekly, mostly consistent", points:13},
     {label:"Monthly", points:7},
     {label:"Irregular or appears stalled", points:2},
   ]},
  {key:"budget", label:"Budget / Monetization Signal", max:15,
   help:"Evidence they already spend money to grow the show — not a guess.",
   options:[
     {label:"Visible sponsors, ads, merch, or a paid membership/Patreon", points:15},
     {label:"Some personal-brand or cross-promotion investment visible", points:9},
     {label:"No visible monetization yet", points:3},
   ]},
  {key:"contact", label:"Contactability", max:15,
   help:"A great lead you can't actually reach isn't a lead yet.",
   options:[
     {label:"Direct email or an actively-used DM/social handle found", points:15},
     {label:"Indirect only — a general contact form or shared inbox", points:8},
     {label:"No clear contact method found", points:0},
   ]},
];

const SCORE_BANDS = [
  {min:80, max:100, label:"Hot", icon:"🔥", color:"#8B0000",
   action:"Send this week, in Wave 1 or 2. Reference the specific gap and a specific episode by name."},
  {min:55, max:79, label:"Warm", icon:"⚡", color:"#C99A3B",
   action:"Worth outreach, but personalize extra carefully — the gap or budget signal is less certain than a Hot lead's."},
  {min:30, max:54, label:"Cold", icon:"❄️", color:"#7A5A00",
   action:"Log it in the Show CRM and revisit in 60-90 days, or only pursue once your Hot and Warm list runs dry."},
  {min:0, max:29, label:"Skip", icon:"⏭️", color:"#6E6459",
   action:"Not a real lead yet — either there's no provable gap, or no way to reach them. Don't spend outreach time here."},
];

const REVENUE_SCENARIOS = [
  {name:"Conservative", icon:"🌱", color:"#7A5A00",
   clients:"3-4 shows",
   mix:"All Starter tier",
   range:"$20,000 – $34,000/year",
   note:"A realistic first-90-days outcome working one genre's worth of Hot and Warm leads."},
  {name:"Solid", icon:"⚡", color:"#C99A3B",
   clients:"6-7 shows",
   mix:"Mixed Starter and Growth, one Full Production",
   range:"$55,000 – $80,000/year",
   note:"A well-run practice after 6-12 months, once referrals inside the genre start compounding."},
  {name:"Strong", icon:"🏆", color:"#0D7A5F",
   clients:"9-10 shows",
   mix:"Majority Growth and Full Production",
   range:"$100,000 – $135,000/year",
   note:"A mature, ten-client portfolio at the system's own stated ceiling — this is the realistic home of the '$100,000' figure: total portfolio revenue for one strong student, not the amount any single client pays."},
];

const SPACE_NOTES = [
  {icon:"🎥", color:"#7A5A00", name:"YouTube-First Outreach",
   applies:"Any show with real Apple/Spotify engagement but a weak or missing YouTube presence",
   note:"Lead with the video gap specifically — it's current, provable in one search, and most hosts already know they're behind on it even if they haven't acted. Offer the free sample as a YouTube-ready cut, not just an audio clip."},
  {icon:"🍎", color:"#0D7A5F", name:"Chart-Position Scouting",
   applies:"Genre category charts on Apple Podcasts and Spotify",
   note:"Positions 30-150 in a genre chart are the sweet spot — proven engagement, but rarely already locked up by an agency the way top-10 shows usually are."},
  {icon:"✂️", color:"#8B2E1F", name:"Clip-Gap Scouting",
   applies:"TikTok and Instagram Reels",
   note:"A 30-second search either confirms or rules out a show as a lead. If a host is active and comfortable on camera elsewhere but has no clips from their own show, that's a fast, specific, provable opener."},
  {icon:"💬", color:"#7A5A00", name:"Community-Sourced Leads",
   applies:"Reddit, Discord, and Facebook genre communities",
   note:"Fan communities discussing a show in detail while the show itself sounds rough is one of the strongest combined signals on this whole list — real audience, real gap, in one place."},
  {icon:"💼", color:"#7A5A00", name:"Professional-Network Outreach",
   applies:"LinkedIn, for Business/Interview-format shows specifically",
   note:"Engagement on the host's own promotional post is a live, real-time readout of how their actual network responds — often more current than a stale review count."},
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

export default function GlobalPodcastProspectingGuide() {
  const [tab,setTab]                 = useState("start");
  const [openSpace,setOpenSpace]     = useState(0);
  const [openGenre,setOpenGenre]     = useState(null);
  const [openNote,setOpenNote]       = useState(0);
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
    {id:"start",   label:"📖 Start Here"},
    {id:"spaces",  label:"🌐 Top 5 Spaces"},
    {id:"genres",  label:"🎙️ Top 8 Genres"},
    {id:"scoring", label:"🎯 Lead Scoring"},
    {id:"revenue", label:"💵 Revenue Model"},
    {id:"notes",   label:"🗺️ Space Notes"},
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
            Global Expansion Module — Companion to the 45-Day Playbook
          </div>
          <h1 style={{margin:"0 0 7px", fontSize:"clamp(20px,4.3vw,32px)", fontWeight:800,
            lineHeight:1.15, background:"linear-gradient(135deg,#201A16 30%,#C99A3B 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>
            Global Podcast Production & Growth Prospecting Guide
          </h1>
          <p style={{margin:"0 0 14px", fontSize:12.5, color:"#D9CFBB", maxWidth:600, lineHeight:1.65}}>
            Where the shows are, which genre to specialize in, and a repeatable way to tell a hot
            lead from one that just needs more time.
          </p>
          <div style={{background:"#F5F0E4", border:"1px solid #0D7A5F30", borderRadius:10,
            padding:"11px 14px", marginBottom:14}}>
            <p style={{fontSize:12.5, color:"#6E6459", margin:0, lineHeight:1.6}}>
              <strong style={{color:"#0D7A5F"}}>Why this exists:</strong> the 45-Day Playbook's
              genre-lock is what keeps two students from ever competing over the same shows. This
              is the zoomed-out map — the platforms and genres with the strongest real opportunity,
              plus a scoring system for any real show you find. It's a targeting tool for
              genre-matched prospecting, never a script for mass, unpersonalized outreach.
            </p>
          </div>
          <div style={{background:"#F8F5EE", borderRadius:10, padding:"11px 14px",
            border:"1px solid #FBF8F1", display:"flex", flexWrap:"wrap", gap:"10px 22px"}}>
            {[
              ["5","Spaces ranked"],
              ["8","Genres covered"],
              ["5","Scoring factors"],
              ["5","Space playbooks"],
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
                {n:"1",t:"Confirm your genre",c:"#7A5A00",
                 d:"Check Top 8 Genres against the skills and interests you already have — the whole point of genre-lock is that it's yours alone. Don't switch genres just because a space looks hotter."},
                {n:"2",t:"Work your genre across all 5 spaces",c:"#0D7A5F",
                 d:"Don't just search Apple Podcasts. A show can look quiet there and be thriving on YouTube, or vice versa — checking multiple spaces is what finds the gaps other students miss."},
                {n:"3",t:"Score every real show before you outreach",c:"#C99A3B",
                 d:"Run it through the Lead Scoring tab before it goes in your Show CRM. Hot shows get Wave 1 outreach; everyone else gets logged, not pitched."},
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
              These are the exact tiers from the Packages tab — checked against the real 2026
              freelance market ($50-600/episode independently, $500-3,000+/month for managed
              production) and found to sit right inside it, not above it.
            </p>
            <div style={{background:"#F5F0E4",border:"1px solid #0D7A5F25",borderRadius:12,padding:"16px",marginBottom:8}}>
              <SLabel text="12-Month Value Per Client (unchanged from the Playbook)" color="#0D7A5F"/>
              {[
                {t:"Starter tier",v:"$6,000 - $8,400/year"},
                {t:"Growth tier",v:"$9,600 - $14,400/year"},
                {t:"Full Production tier",v:"$15,600 - $21,600/year"},
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",
                  borderBottom:"1px solid #FBF8F1"}}>
                  <span style={{fontSize:13,color:"#6E6459"}}>{r.t}</span>
                  <span style={{fontSize:13,fontWeight:700,color:"#0D7A5F"}}>{r.v}</span>
                </div>
              ))}
              <p style={{fontSize:12,color:"#D9CFBB",margin:"10px 0 0",lineHeight:1.6}}>
                See the Revenue Model tab for what a realistic full portfolio adds up to — including
                where the "$100,000" figure genuinely lives in this system.
              </p>
            </div>
          </div>
        )}

        {/* SPACES */}
        {tab==="spaces"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Top 5 Spaces Online</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 16px",lineHeight:1.6}}>
              Ranked by where genuine production gaps are easiest to find and prove — not by raw
              traffic alone. Tap a space for the full picture.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {SPACES.map((sp,i)=>{
                const isOpen = openSpace===i;
                return (
                  <div key={sp.name} onClick={()=>setOpenSpace(isOpen?null:i)}
                    style={{background:isOpen?"#FBF8F1":"#F8F5EE",
                      border:`1px solid ${isOpen?sp.color:"#FBF8F1"}`,
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"13px 15px",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:34,height:34,borderRadius:9,background:sp.color+"18",
                        border:`1px solid ${sp.color}35`,display:"flex",alignItems:"center",
                        justifyContent:"center",fontSize:15,fontWeight:800,color:sp.color,flexShrink:0}}>
                        {sp.rank}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
                          <span style={{fontSize:18}}>{sp.icon}</span>
                          <span style={{fontWeight:700,fontSize:14,color:"#201A16"}}>{sp.name}</span>
                        </div>
                        <div style={{fontSize:11.5,color:sp.color,marginTop:2}}>{sp.tag}</div>
                      </div>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 15px 16px",borderTop:"1px solid #FBF8F1"}}>
                        {[
                          ["🔍 Why It Ranks Here",sp.why,"#7A5A00"],
                          ["🔎 How To Search It",sp.find,"#0D7A5F"],
                          ["📶 Signal It's a Real Lead",sp.signal,"#8B2E1F"],
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
                            letterSpacing:".07em",marginBottom:6}}>Best-Fit Genres</div>
                          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                            {sp.bestFits.map(bf=>(
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

        {/* GENRES */}
        {tab==="genres"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Top 8 Genres</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 16px",lineHeight:1.6}}>
              The exact 8 from the Pick Your Genre tab — this guide doesn't replace that choice,
              it gives each one a global reach strategy across all 5 spaces. Tap a genre for the
              full picture.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {GENRES.map((g,i)=>{
                const isOpen = openGenre===i;
                return (
                  <div key={g.name} onClick={()=>setOpenGenre(isOpen?null:i)}
                    style={{background:isOpen?"#FBF8F1":"#F8F5EE",
                      border:`1px solid ${isOpen?g.color:"#FBF8F1"}`,
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"13px 15px",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:38,height:38,borderRadius:9,background:g.color+"18",
                        border:`1px solid ${g.color}35`,display:"flex",alignItems:"center",
                        justifyContent:"center",fontSize:19,flexShrink:0}}>{g.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:14,color:"#201A16"}}>{g.name}</div>
                      </div>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 15px 16px",borderTop:"1px solid #FBF8F1"}}>
                        {[
                          ["💡 Why This Genre Works",g.why,"#7A5A00"],
                          ["🔎 Where To Find Shows",g.find,"#0D7A5F"],
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
              Answer all five about one real show at a time — this is what turns Day 20's "tag
              each show Hot, Warm, or Cold" into an actual number for your Show CRM.
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
                    <div style={{fontWeight:800,fontSize:14,color:band.color,marginBottom:3}}>{band.label}</div>
                    <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.55}}>{band.action}</p>
                  </div>
                </div>
              )}
              {answeredCount>0&&(
                <div onClick={resetScore} style={{marginTop:12,fontSize:11.5,color:"#D9CFBB",
                  cursor:"pointer",textDecoration:"underline",display:"inline-block"}}>
                  Reset and score a different show
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
              Modeled directly from the Packages pricing — this niche's per-client value is
              genuinely higher than most service niches, which changes where "$100,000" actually
              shows up.
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

            <div style={{marginTop:16,background:"#F5F0E4",border:"1px solid #C99A3B25",
              borderRadius:12,padding:"16px",marginBottom:12}}>
              <SLabel text="About The $100,000 Figure" color="#C99A3B"/>
              <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.65}}>
                It's real in this system — but as total portfolio revenue for one strong student
                running close to 10 well-mixed clients, not as $100,000 from any single show. No
                independent podcast is paying a freelance producer six figures a year; the Full
                Production tier tops out around $21,600/year per client. Ten clients at a mature,
                Growth-and-up mix is what closes the gap to $100K+ — which the Strong scenario
                above shows honestly.
              </p>
            </div>

            <div style={{background:"#F5F0E4",border:"1px solid #0D7A5F25",
              borderRadius:12,padding:"16px"}}>
              <SLabel text="At Program Scale" color="#0D7A5F"/>
              <p style={{fontSize:12.5,color:"#6E6459",margin:0,lineHeight:1.65}}>
                There are an estimated 7-8 million unique podcasts in the world today. Genre-lock
                means students never compete for the same shows, so even the Conservative scenario
                above, run across 100,000 students, adds up to roughly $2-3.4 billion a year in
                value delivered across 300,000-400,000 shows — still a small fraction of the total
                market. The opportunity is real without needing to inflate what any single client
                is worth.
              </p>
            </div>
          </div>
        )}

        {/* SPACE NOTES */}
        {tab==="notes"&&(
          <div>
            <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 4px",color:"#201A16"}}>Space Playbook Notes</h2>
            <p style={{fontSize:12.5,color:"#D9CFBB",margin:"0 0 16px",lineHeight:1.6}}>
              One tactical adaptation per space — the core system doesn't change, just how you
              scout and open the conversation.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {SPACE_NOTES.map((n,i)=>{
                const isOpen = openNote===i;
                return (
                  <div key={n.name} onClick={()=>setOpenNote(isOpen?null:i)}
                    style={{background:isOpen?"#FBF8F1":"#F8F5EE",
                      border:`1px solid ${isOpen?n.color:"#FBF8F1"}`,
                      borderRadius:11,cursor:"pointer",overflow:"hidden"}}>
                    <div style={{padding:"13px 15px",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:38,height:38,borderRadius:9,background:n.color+"18",
                        border:`1px solid ${n.color}35`,display:"flex",alignItems:"center",
                        justifyContent:"center",fontSize:19,flexShrink:0}}>{n.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:14,color:"#201A16"}}>{n.name}</div>
                        <div style={{fontSize:11.5,color:"#D9CFBB",marginTop:2}}>{n.applies}</div>
                      </div>
                      <Chevron open={isOpen}/>
                    </div>
                    {isOpen&&(
                      <div style={{padding:"0 15px 16px",borderTop:"1px solid #FBF8F1"}}>
                        <p style={{fontSize:13,color:"#6E6459",margin:"12px 0 0",lineHeight:1.65,
                          borderLeft:`2px solid ${n.color}40`,paddingLeft:10}}>{n.note}</p>
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
