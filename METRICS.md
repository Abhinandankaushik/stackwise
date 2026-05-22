# Metrics

## North Star
**Audits-with-actionable-savings shared publicly per week.**

Not "audits run" — running an audit is cheap and doesn't prove value. Not "leads captured" — easy to inflate with weak CTAs. *Shared* is the only signal that conflates "the result was useful enough to send to someone else" with "the recommendation was credible enough to put their name behind." It's also the metric most correlated with Credex pipeline: every shared URL is a free outbound channel.

## Three input metrics
1. **Audit completion rate** (form-start → audit-rendered). Floor target: 70%. Drops mean the form has too many fields or the loading state is broken.
2. **Median actionable savings per audit** (only cases where savings > $50/mo). Trending below $150/mo means the rule set is stale or the pricing data is stale.
3. **Email opt-in rate by state** (high_savings vs some_savings vs optimal). Asymmetric: high_savings should be ≥25%, optimal should still hit ≥10% via "notify me later" framing. Asymmetry confirms the lead-capture copy is matching state correctly.

## What to instrument first
- PostHog event: `landing_viewed`, `form_started`, `audit_completed`, `audit_shared`, `lead_captured`, `share_link_clicked`, `consultation_booked`.
- Funnel: landing → form_started → audit_completed → audit_shared → consultation_booked. Watch weekly cohort retention on the share step specifically.
- Pricing-drift sanity check: weekly diff of `pricing.ts` vs the live vendor pages. Auto-PR when divergent.

## What number triggers a pivot
**If we get to 500 audits/week with <2% sharing them, the tool isn't credible enough to forward.** That's a pivot signal, not a marketing problem. The fix isn't "run more ads" — it's "the audit reasoning isn't defensible yet, sit down with 10 finance people and rewrite the rules until they read like real recommendations."

The mistake I want to avoid: optimizing for audit volume while sharing collapses. Volume without sharing means we built a quiz, not a tool.
