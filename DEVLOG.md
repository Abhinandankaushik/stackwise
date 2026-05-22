# Devlog

## Day 1 — 2026-05-14
**Hours worked:** 4
**What I did:** Read the brief twice. Sketched the audit-rule space on paper (Cursor plans × seat counts, API-direct → credits path, cross-tool overlap). Picked TanStack Start for per-route `head()` (OG tags on share URLs). Scaffolded the design system in `styles.css` — dark editorial finance-terminal palette with a green savings accent.
**What I learned:** The audit-rule set is smaller than I expected — maybe 10 rules cover 80% of real cases. That's a clue the AI should write the *summary*, not the *math*.
**Blockers:** None.
**Plan for tomorrow:** Build `pricing.ts` table (cited URLs) + `audit-engine.ts` skeleton.

## Day 2 — 2026-05-15
**Hours worked:** 5
**What I did:** Wrote `pricing.ts` with every plan from the 8 required vendors, each cited in `PRICING_DATA.md`. Implemented `runAudit` with five rules: Cursor Business overkill, Claude Team for tiny teams, Claude Max for non-coding, Copilot Business <5 seats, Gemini Ultra default downgrade. Wrote first 4 tests; all green.
**What I learned:** Cursor + Copilot overlap can't be detected inside a per-entry loop — needs a post-pass. Reshaped `runAudit` accordingly.
**Blockers:** Spent 20 min on a vitest happy-dom config issue (resolved with explicit `vitest.config.ts`).
**Plan for tomorrow:** Build the SpendForm + persistence.

## Day 3 — 2026-05-16
**Hours worked:** 6
**What I did:** SpendForm with add/remove tool rows, plan select cascades on tool change, API plans toggle into user-reported $/mo. localStorage draft persistence working. Started ResultsView — hero savings + per-tool list.
**What I learned:** Form-state-as-source-of-truth + a single `useEffect(saveDraft)` is plenty here; reaching for react-hook-form would've added a dependency for no win.
**Blockers:** Briefly tried encoding the share payload as URL hash — easier — but realized OG tags can't read fragments. Switched to base64url in the path segment.
**Plan for tomorrow:** Share URL route with OG meta, AI summary integration with fallback.

## Day 4 — 2026-05-17
**Hours worked:** 5
**What I did:** Built `/a/:slug` route. `head()` decodes the slug and emits per-audit OG tags (savings $ in the title). Wired AI summary with `fetch` + 8s timeout + templated fallback. Added lead capture (email + optional company/role/team) with honeypot. Added benchmark card ("$X/dev vs $55/dev avg").
**What I learned:** Twitter card validator caches aggressively; tested with `?v=` cachebust. Honest about it being a "mock benchmark until we have N≥50 audits."
**Blockers:** None notable.
**Plan for tomorrow:** Three user interviews. Write entrepreneurial docs.

## Day 5 — 2026-05-18
**Hours worked:** 3
**What I did:** Talked to three founders (notes in `USER_INTERVIEWS.md`). Two surprises that changed the design: (1) the #1 thing they wanted was per-tool *reasoning*, not just savings numbers — drove the "1-sentence reason" field per finding. (2) "Notify me later" was preferred over "give me my report" when savings were small — split the lead-capture CTA copy on state.
**What I learned:** I had assumed "more savings = better CTA"; reality is users want validation regardless. Reworked the optimal-state empty path to feel like a win.
**Blockers:** N/A.
**Plan for tomorrow:** Round out docs (GTM, economics, metrics), CI, polish pass.

## Day 6 — 2026-05-19
**Hours worked:** 5
**What I did:** GTM.md, ECONOMICS.md, METRICS.md, LANDING_COPY.md, REFLECTION.md drafts. Added 3 more tests (cross-tool overlap, optimal-state guard, annual=12×monthly invariant). Set up GitHub Actions: lint → test → build on push to main. Lighthouse pass on a deployed preview: Perf 92, A11y 96, Best 100.
**What I learned:** GTM lands when the channel is *specific and weird*. "We'll do content marketing" earns nothing. The unfair-distribution section is the hardest to write honestly.
**Blockers:** None.
**Plan for tomorrow:** Final polish, screenshot the deployed URL, double-check `git log` shows ≥5 distinct days.

## Day 7 — 2026-05-20
**Hours worked:** 3
**What I did:** Copy pass on landing. Re-verified every price in `PRICING_DATA.md` against the live pricing pages — no diffs. Recorded a 30-second Loom (linked in README). Final commits. Submitted.
**What I learned:** Shipping is the part nobody talks about — the last 10% is 30% of the time. The audit engine's been done for days; the polish is what makes it feel real.
**Blockers:** None.
**Plan for tomorrow:** Sleep. Then plan Round 2.
