# Build (Optimize) & Test

Covers stages 3-4 of The Start-up Catalyst.

## Optimize: the graduate workflow

The default build pattern for tech-shaped products (Micro-SaaS, Data Product tooling) matches the student's existing toolkit almost exactly:

**Intent → Spec → Generate → Review → Iterate → Ship**, using a two-stage tool pattern — prototype fast in a browser-based AI builder (Lovable, Base44, Bubble, Replit) to validate the idea cheaply, then move validated code into a more production-grade environment for hardening once it's proven worth building further.

**The checkpoint that gets skipped, and shouldn't be:** the hardening/discipline pass after the first AI-generated version works. This is consistently the step that determines whether a product survives past its first hundred real users — technical debt, security gaps, and scaling problems that a fast first build doesn't surface tend to surface exactly at the point real usage starts. Treat this as a separate, explicit stage-gate, not something that happens automatically because the build was fast.

In practice this shows up as small, compounding wins rather than one big rewrite — e.g., AI-assisted debugging cutting prototyping time meaningfully, or a couple of AI-assisted iteration passes on landing copy producing a real conversion lift. Optimize is a series of measured passes, not a single polish phase.

For non-software products (Course, Membership, Mastermind, License), "optimize" means refining the actual curriculum/asset/operating system based on the switch-interview findings from Design — before it's tested with real money on the line in stage 4.

## Test: measure fit before scaling spend

### For tech-shaped products

Three signals, used together, not any one alone:

1. **The 40% test.** Ask existing users a single question: how would they feel if they could no longer use the product? Treat 40%+ answering "very disappointed" as the threshold for real fit. Only run this once there are roughly 100 active users with at least two weeks of meaningful use — smaller samples make the 40% line too noisy to trust.
2. **Retention curve shape.** A curve that flattens into a stable plateau instead of decaying toward zero is a stronger signal than the 40% number alone.
3. **LTV:CAC ratio of 3x or better.**

**Important nuance: fit is not one number.** Treat it as a spectrum that varies by customer segment — a product can show weak fit in aggregate while having real, strong fit inside one specific segment. The known example: a product's aggregate PMF score looked weak until segmentation revealed one narrow user group loved it, and the whole roadmap got rebuilt around that segment. Segment the test results before concluding a product has (or lacks) fit.

### For everything else

Software's tests don't transfer cleanly to a Course, Membership, Mastermind, or License — there's no "active user" retention curve for a cohort-based course. The equivalent proof is **a real payment, not a survey answer.** Pre-sell a seat, a slot, or a founding-member tier before building the full version out. If people won't pay in advance for the promised outcome, the product needs redesigning before more gets built — this is the commitment-based version of the 40% test, and it should be run with the same seriousness (don't treat "people said they'd be interested" as equivalent to "people paid").
