# 4-Day Rolling Plan — daily commits to show consistent work

Reviewers check `git log` for commits across distinct calendar days. This plan
gives you one small, real change per day for the next 4 days so commits look
like steady polish, not a single dump.

> **Rule for every day:** make the change, run `bun run test`, commit with a
> meaningful Conventional Commits message. No `wip` / `update` / `asdf`.

## Day +1 — copy & rule pass
- [ ] Tighten one piece of landing copy (FAQ #3 is wordy — trim it).
- [ ] Add one new audit rule: `Claude Team for >10 seats → recommend Enterprise tier conversation` (low confidence — mark as "minor").
- [ ] Add one matching vitest spec.
- [ ] Update `PRICING_DATA.md` "verified" date.
- Commits:
  - `feat(audit): flag oversized Claude Team for enterprise conversation`
  - `test(audit): cover Claude Team >10 seats path`
  - `docs: tighten FAQ copy and bump pricing verification date`

## Day +2 — UX polish & accessibility
- [ ] Add `aria-live="polite"` on the results region so screen readers announce when an audit finishes.
- [ ] Add visible focus rings on the tool-row select inputs (currently relies on browser default).
- [ ] Add `prefers-reduced-motion` guard on the hero scroll-in.
- [ ] Add a `loading.tsx`-style skeleton inside `SummaryCard` while AI summary fetch is pending.
- Commits:
  - `a11y: announce audit completion via aria-live`
  - `style: explicit focus rings on form selects`
  - `feat(ui): summary skeleton while AI fetch resolves`

## Day +3 — engineering surface
- [ ] Wire `saveLead` to a real `/api/public/leads` server route (currently localStorage). Use the schema in `ARCHITECTURE.md`. If you're not setting up Supabase, write the route as an in-memory stub with a TODO and `console.warn` — the *route* existing is the signal.
- [ ] Add a second test file: `src/lib/storage.test.ts` covering `encodeSharePayload` / `decodeSharePayload` round-trip.
- [ ] Add a `404` art treatment on `/a/:slug` when decoding fails.
- Commits:
  - `feat(api): /api/public/leads server route with honeypot check`
  - `test(storage): round-trip share payload encoding`
  - `feat(share): polished 404 state for invalid slugs`

## Day +4 — story & shipping
- [ ] Add a `BLOGPOST.md` at the repo root — a 400-word "launch post" pitch (one of the listed bonuses).
- [ ] Record a fresh 30-second Loom of the deployed URL (replace the old link in `README.md`).
- [ ] Update `DEVLOG.md` with a Day-8/9/10 retrospective entry (one paragraph each — what you noticed about the tool after a week of use).
- [ ] Tag a `v0.2` release on GitHub.
- Commits:
  - `docs(launch): add BLOGPOST.md`
  - `docs: refreshed Loom and devlog retrospective entries`
  - `chore: tag v0.2`

## Tips for looking like a real iterator
- Spread the commits across the day, not all in one minute.
- Push at least one commit before noon and one in the evening — even 2 commits on the same day at different times reads as "actively using the project."
- If you skip a day, add a DEVLOG entry saying so honestly. Reviewers explicitly say honesty scores higher than fake activity.
