# User interviews

Three 10–15 minute conversations during build week. Names anonymized at request.

## Interview 1 — "R.K.", CTO, 8-person SaaS company (seed)
**Stack:** Cursor Business (5 seats), Claude Team (3), ChatGPT Team (8), Anthropic API ~$600/mo for product features.

> "I genuinely don't know if Business is worth the extra $20/seat — we don't use the admin stuff."
> "Renewal is on autopilot. I'd switch tomorrow if someone told me what to switch to."
> "I'd email this to my finance person before I'd email it to my team."

**Most surprising:** He didn't want savings recommendations — he wanted *justification language* he could forward to his cofounder. "Tell me why we should downgrade, in one sentence I can paste into Slack."

**Changed in design:** Added the explicit `reason` field per finding (1-sentence, copy-pasteable). Originally I'd planned just `action`.

---

## Interview 2 — "M.D.", founding engineer, AI-vertical startup (Series A)
**Stack:** Cursor Pro (12 seats), Claude Max (3 power users), OpenAI API ~$2.4k/mo for production inference.

> "I don't want a tool that tells me to drop Cursor. I love Cursor. Tell me about the *bill*."
> "If you tell me API direct is cheaper than what I'm doing, I want to see the math, not vibes."
> "Twitter share is fine. But I'd never share company-identifying numbers."

**Most surprising:** Pushed back hard on any framing that felt like "Cursor bad". Reframed how I wrote the per-tool copy — it's never about the tool, always about the plan or the redundancy.

**Changed in design:** Stripped company identifiers from the share payload (was already planned but his comment hardened it). Made the API → Credex recommendation include the *amount* in the reason ("at $2,400/mo, 25% off retail is $600/mo").

---

## Interview 3 — "A.P.", finance ops at a 22-person devtools startup
**Stack:** doesn't use AI tools personally, but owns the budget line for them.

> "I have a Notion page with what each tool costs. I don't know which ones we actually use."
> "I'd want to send this to every team lead and ask them to fill it in for their team."
> "I don't care about savings under $50/mo. I care if there's a $500 line item I can kill."

**Most surprising:** Her #1 use case was *not* her running the audit — it was *asking her engineers to run it*. The shareable URL is the product *for her*; she just consumes the output. Hadn't thought of it that way.

**Changed in design:** The share URL became more prominent in the results layout (was below-the-fold; moved up). Added "send this to your finance person" as a phrasing option in the lead-capture variant for ≥$500 savings cases. Considered (but didn't ship — week 2 work) a "multi-team" mode where one URL aggregates several team-leads' inputs.
