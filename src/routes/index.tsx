import { createFileRoute, Link } from "@tanstack/react-router";
import { DfsMark, DfgMark, Motto, DFG_CREST } from "@/components/dfs/Brand";
import founderAsset from "@/assets/founder.jpg.asset.json";
import { Crown, Shield, Target, Flame, BookOpen, TrendingUp, Globe, Calendar, Lock, Award } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DFS — The D'Famocious Freelance Scholarship" },
      { name: "description", content: "An invitation-only training citadel by D'Famocious Group. We forge Digital Systems Experts and scale them globally in record time." },
      { property: "og:title", content: "DFS — The D'Famocious Freelance Scholarship" },
      { property: "og:description", content: "An invitation-only training citadel by D'Famocious Group. We forge Digital Systems Experts and scale them globally in record time." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-md bg-background/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <DfsMark className="h-10 w-10" />
            <div className="leading-tight">
              <div className="font-display text-sm font-bold tracking-wider">DFS</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">D'Famocious Freelance Scholarship</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#pillars" className="hover:text-primary transition">The Citadel</a>
            <a href="#path" className="hover:text-primary transition">The Path</a>
            <a href="#ranks" className="hover:text-primary transition">Ranks</a>
            <a href="#founder" className="hover:text-primary transition">Founder</a>
          </nav>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-regal"
          >
            <Lock className="h-4 w-4" /> Beneficiary Login
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-royal opacity-[0.04]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.78_0.13_80/0.08),transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Motto />
            <h1 className="mt-6 font-display text-5xl md:text-7xl font-bold leading-[1.05]">
              The citadel for the next generation of{" "}
              <span className="text-gold-gradient">Digital Systems Engineers</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              An invitation-only scholarship by D'Famocious Group. We train, equip, and scale our beneficiaries
              from cold start to closing international clients — in forty-five days.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 shadow-regal">
                <Shield className="h-5 w-5" /> Enter as Beneficiary
              </Link>
              <a href="#path" className="inline-flex items-center gap-2 rounded-md border border-gold px-6 py-3 text-base font-semibold hover:bg-accent/40 transition">
                <BookOpen className="h-5 w-5" /> Read the Path
              </a>
            </div>
            <div className="mt-10 flex items-center gap-6 text-xs uppercase tracking-widest text-muted-foreground">
              <span>Invitation-only</span>
              <span className="h-1 w-1 rounded-full bg-gold" />
              <span>45-day forge</span>
              <span className="h-1 w-1 rounded-full bg-gold" />
              <span>Global placements</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-gold/20 via-transparent to-crimson/20 blur-2xl" />
            <img src={DFG_CREST} alt="D'Famocious Group crest" className="relative mx-auto w-full max-w-md drop-shadow-2xl" />
          </div>
        </div>
      </section>

      <div className="gold-divider mx-auto max-w-7xl" />

      {/* PILLARS */}
      <section id="pillars" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <Motto />
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold">Four pillars of the scholarship</h2>
          <p className="mt-4 text-muted-foreground">The DFS Constitution mandates four interlocking systems every beneficiary must master.</p>
        </div>
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Target, title: "Niche Mastery", desc: "One niche, one city. Depth closes deals." },
            { icon: Globe, title: "Global Markets", desc: "USA, UK, Canada, Australia & the diaspora corridors." },
            { icon: Flame, title: "The 45-Day Forge", desc: "From zero arsenal to first closed client." },
            { icon: TrendingUp, title: "Scale & Systems", desc: "Automations, retainers, and durable income." },
          ].map((p) => (
            <div key={p.title} className="group rounded-xl border border-border bg-card p-6 hover:border-gold hover:shadow-regal transition">
              <p.icon className="h-8 w-8 text-gold-deep group-hover:text-primary transition" />
              <h3 className="mt-4 font-display text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THE PATH */}
      <section id="path" className="bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <Motto />
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold">The 45-Day Path</h2>
              <p className="mt-4 text-muted-foreground">A precise, day-by-day forge. Every task tracked. Every milestone reported. Every week reviewed.</p>
            </div>
            <ol className="space-y-6">
              {[
                { w: "Week 1", t: "Build Your Foundation", d: "Tools, niche, two demos, portfolio live." },
                { w: "Weeks 2–3", t: "Go to Market", d: "Outreach, demos, qualified conversations." },
                { w: "Weeks 4–5", t: "Close & Deliver", d: "First client. First invoice. First testimonial." },
                { w: "Week 6+", t: "Scale & Retain", d: "Retainers, referrals, systems." },
              ].map((s, i) => (
                <li key={s.w} className="flex gap-5 group">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-royal text-gold flex items-center justify-center font-display font-bold text-lg shadow-regal">
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-gold-deep">{s.w}</div>
                    <div className="font-display text-xl font-semibold">{s.t}</div>
                    <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* RANK TIERS */}
      <section id="ranks" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <Motto />
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold">The five ranks of a beneficiary</h2>
          <p className="mt-4 text-muted-foreground">Progress through the ranks by completing milestones, hitting revenue thresholds, and earning the trust of the council.</p>
        </div>
        <div className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: "Recruit", icon: Shield, color: "text-muted-foreground", desc: "Day 1. Arsenal armed." },
            { name: "Operator", icon: Target, color: "text-chart-1", desc: "First demo, first 100 leads." },
            { name: "Closer", icon: TrendingUp, color: "text-gold-deep", desc: "First paid client." },
            { name: "Lion", icon: Flame, color: "text-crimson", desc: "Mentorship privileges. Five clients." },
            { name: "Crown", icon: Crown, color: "text-gold", desc: "Council seat. Pass the torch." },
          ].map((r, i) => (
            <div key={r.name} className="rounded-xl border border-border bg-card p-5 text-center hover:border-gold transition">
              <div className="text-xs text-muted-foreground">Rank {i + 1}</div>
              <r.icon className={`h-10 w-10 mx-auto mt-3 ${r.color}`} />
              <div className="mt-3 font-display text-lg font-semibold">{r.name}</div>
              <p className="text-xs text-muted-foreground mt-2">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRACKING SYSTEMS */}
      <section className="bg-royal text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Calendar, t: "Synced to Google Calendar", d: "Every day's tasks land on your calendar. Reminders fire. Check-ins schedule themselves." },
              { icon: Award, t: "Weekly Cadence & XP", d: "Earn XP per task. Promote tiers by hitting weekly KPIs. Fall behind and the council is notified." },
              { icon: Shield, t: "Real-time Escalation", d: "If a beneficiary stalls, mentors are paged automatically. No one is forgotten." },
            ].map((b) => (
              <div key={b.t}>
                <b.icon className="h-12 w-12 mx-auto text-gold" />
                <h3 className="mt-5 font-display text-xl font-semibold">{b.t}</h3>
                <p className="mt-2 text-sm text-primary-foreground/80">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section id="founder" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute -inset-3 bg-gradient-gold opacity-30 blur-2xl rounded-full" />
            <img src={founderAsset.url} alt="Boluwatife Famokunwa, founder of D'Famocious Group" className="relative rounded-2xl border border-gold shadow-regal w-full max-w-md mx-auto object-cover" />
          </div>
          <div>
            <Motto />
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold">From the founder</h2>
            <p className="mt-6 text-lg text-muted-foreground">
              "DFS exists because talent without an arena is wasted talent. We are not selling courses.
              We are admitting beneficiaries into a citadel — and we expect them to graduate as engineers
              capable of building, selling, and scaling digital systems for businesses anywhere on earth."
            </p>
            <p className="mt-4 font-display font-semibold">Boluwatife Famokunwa</p>
            <p className="text-sm text-muted-foreground">Founder, D'Famocious Group</p>
            <div className="mt-8 flex items-center gap-4">
              <DfgMark className="h-14 w-14" />
              <div className="text-xs uppercase tracking-widest text-muted-foreground leading-relaxed">
                A subsidiary of<br/>
                <span className="text-foreground font-semibold">D'Famocious Group</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <Motto />
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold">The gate opens by invitation.</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            DFS is closed to public sign-up. If your email has been registered by an admin, your invitation is already in your inbox — use it to set your password and step inside.
          </p>
          <div className="mt-10">
            <Link to="/auth" className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-4 text-base font-semibold text-primary-foreground hover:bg-primary/90 shadow-regal">
              <Lock className="h-5 w-5" /> Beneficiary Login
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <DfgMark className="h-8 w-8" />
            <span>© {new Date().getFullYear()} D'Famocious Group. All rights reserved.</span>
          </div>
          <Motto />
          <span>Registered in Nigeria · D'Famocious Ltd.</span>
        </div>
      </footer>
    </div>
  );
}
