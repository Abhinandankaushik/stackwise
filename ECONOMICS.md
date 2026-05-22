# Economics

## Unit value of a converted lead to Credex
Credex sells discounted AI credits at a margin. Assume:
- **Avg deal size** (one Credex credit purchase): $4,000 (median of small-team contracts; large-team contracts are 5–10×).
- **Credex gross margin** on credits: 25% (sourced inventory discount minus their take).
- **Gross profit per deal**: ~$1,000.
- **Repeat purchase rate within 12 months**: 40%, with average 1.6× repurchase value.
- **12-month LTV per closed deal**: $1,000 + (0.4 × 1.6 × $1,000) = **~$1,640.**

## CAC by channel (from GTM)
| Channel | Cost basis | Est. CAC |
|---|---|---|
| Hand-audit + tweet | 30 min of founder time × $80/hr = $40 | $40 |
| Subreddit threads | 2 hrs/week, 1 thread → ~3 leads → ~0.3 deals | $530/deal |
| HN comment replies | 30 min/week — high signal | $80/deal |
| Targeted DMs | 1 hr per 20 DMs, ~2 audits, ~0.3 deals | $260/deal |
| Show HN | one-shot effort, ~50 audits, ~2 deals | $40/deal |
| **Credex outbound (Stackwise-led)** | reuses existing pipeline | **$0 incremental** |
| Embed/widget | 4 hr build + outreach amortized | $30–80/deal |

Blended CAC over the 30-day plan: **~$120/deal.** Net contribution per deal: **$1,640 − $120 = $1,520.**

## Funnel rates that make this profitable
Need contribution > CAC. With CAC $120 and LTV $1,640, the breakeven funnel is:

```
audit_completed → email_captured: 18% (industry norm for free tool email gate)
email_captured → consultation_booked: 12% (qualified by high-savings flag)
consultation → credit_purchase: 25% (warm lead, real-savings-shown context)

Net audit→deal: 0.18 × 0.12 × 0.25 = 0.54%
i.e., ~185 audits per closed deal.
Per-deal acquisition cost at $120 CAC requires audits to cost <$0.65 each blended.
```

Subreddit + HN + DM channels comfortably clear that bar.

## What has to be true for $1M ARR in 18 months
$1M ARR ÷ $1,640 LTV ≈ **610 deals over 18 months ≈ 34 deals/month at steady state.**
At a 0.54% audit→deal rate that's **6,300 audits/month** ≈ **210 audits/day.**

That's *high* but not implausible if:
1. Credex outbound becomes the primary acquisition lever (it routes ~70% of inbound demand straight into Stackwise — they already have the contacts).
2. The embeddable widget ships and lands on 3+ engineering newsletters/blogs.
3. Programmatic SEO `/compare/` pages capture even 2% of the long-tail "X vs Y" search volume.

## Realistic v0 forecast
- Month 1: 400 audits, 70 leads, ~2 deals → $3.3k ARR (mostly a loss)
- Month 6: 3k audits/mo, 540 leads, ~16 deals/mo → $260k ARR run-rate
- Month 12: 6k audits/mo, ~32 deals/mo → $630k ARR run-rate
- Month 18: 8k audits/mo + Credex push → ~50 deals/mo → **$980k ARR run-rate**

This is the line that gets to $1M ARR — and it requires Credex to *push* Stackwise, not just host it.
