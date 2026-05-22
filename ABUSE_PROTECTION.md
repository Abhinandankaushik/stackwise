# Abuse protection

Stackwise uses two layers on lead capture and one on the AI summary endpoint.

## 1. Honeypot field (primary for bots)

The lead form includes a hidden text field (`tabIndex={-1}`, `aria-hidden`, CSS `hidden`). Real users never see or tab into it. Simple bots fill every field and get a silent `200 OK` with `{ skipped: "honeypot" }` — no DB write, no email.

**Why honeypot:** Zero friction for humans, no third-party script, works on static + edge hosts. Good enough for a free lead-gen tool at low volume.

## 2. IP rate limiting (secondary)

Backend (`backend/src/middleware/rateLimit.ts`) applies an in-memory limiter per Node process:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /api/public/leads` | 5 req | 60s per IP |
| `POST /api/summary` | 20 req | 60s per IP |

IP is read from `cf-connecting-ip` (Cloudflare) or `x-forwarded-for`.

**Why not hCaptcha:** Adds UX friction on a tool that must feel instant. We only gate *after* value (email), not on the audit itself. Rate limits stop burst abuse; honeypot stops dumb scrapers.

Returns `429` with `retryAfterSec` when exceeded.

## 3. What we did not add (yet)

- hCaptcha / Turnstile — if lead spam exceeds ~50/day
- Cloudflare KV rate limits — for multi-isolate consistency at scale (see `ARCHITECTURE.md` 10k/day section)
