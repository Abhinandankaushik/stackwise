# Reflection

## 1. Hardest bug this week
The share-URL OG tags showed correctly when I loaded `/a/:slug` in a fresh tab, but Twitter's card validator showed the home-page title instead. My first hypothesis was that the validator was caching — I added `?v=2`, no change. Second hypothesis: the route's `head()` wasn't running on initial render — I logged from inside `head()`, it ran, returned the right meta. Third hypothesis: the root route's `head()` was concatenating on top, overriding leaf tags. Confirmed by stripping the root's `og:title` — Twitter immediately read the correct value. The fix was to leave root meta as defaults and never set `og:title` / `og:description` at root level. The deeper lesson: TanStack's head merging is last-write-wins per key, so a generic root key silently shadows a specific leaf key when both are set. I now treat root `head()` as "defaults only, no `og:*`."

## 2. A decision I reversed
Originally the audit results were a separate route, `/audit/:id`, with a DB lookup on every load. Day 4, building the share flow, I realized that a DB-backed slug means every shared link can 404 after a lead row ages out, *and* the OG tags need a synchronous read on the edge. I switched to encoding the public payload into the slug itself (base64url, ~800 bytes). Slower URL, but the slug is the data — no DB, no expiry, OG renders from a stateless handler. Identity stripping happens at encode time so the public version genuinely can't leak the user's email. Reversal felt expensive (~2 hrs of rework) but landed a better property: links live forever.

## 3. Week 2 build
PDF export (already designed — the results page is print-friendly), then the embeddable widget — a `<script>` blogger drops in that renders a mini Stackwise form on their post and routes results to the canonical site (referral attribution built in). After that: the cron-scraped pricing diff so I stop being the source of staleness, and programmatic SEO pages (`/compare/X-vs-Y`) generated from the same rules table. Each `/compare` page is a real audit for that pair, not SEO sludge.

## 4. AI tool usage
Used Cursor for the bulk of component scaffolding and Claude for the audit-rule trade-off conversation (e.g., "is Claude Max worth it for non-coding teams" — pushed me to add the use-case-aware downgrade rule). Did *not* trust AI for: pricing numbers (every one hand-verified against the vendor page), the audit math itself, and the lead-capture copy variants by state (felt important to feel founder-written, not assistant-written). One specific catch: Cursor suggested `monthlySavings = current - recommended` without the `Math.max(0, …)` clamp; I caught it during the "never negative" test, which would have shipped a bug where an unusual user input could show *negative* savings on the hero. Tests are the only honest defense.

## 5. Self-rating
- **Discipline (8/10):** 7 days, 7 entries, commits across 7 distinct days; could have started day 1 with a sharper rule list.
- **Code quality (8/10):** Pure functions where it matters, full TS strict, no implicit anys; would refactor `evaluateEntry` into a per-rule registry if it grew past ~10 rules.
- **Design sense (7/10):** Editorial-finance aesthetic is consistent and the hero reads at a glance; lower than I'd like because share-card copy is still a bit generic.
- **Problem-solving (8/10):** The base64-slug pivot was the right call and shipped fast; lost a couple of hours on the OG merge bug that I should have caught from docs.
- **Entrepreneurial thinking (7/10):** GTM has specific channels; economics math is honest but conservative. Lower because three interviews is the minimum, not the ceiling.
