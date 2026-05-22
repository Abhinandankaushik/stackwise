# Tests

Audit engine = the only business-logic worth unit-testing now.

```bash
bun run test          # one-shot
bun run test:watch    # vitest watch mode
```

CI runs `bun run test` on every push (see `.github/workflows/ci.yml`).

File: `src/lib/audit-engine.test.ts`

| # | Test | What it pins down |
|---|------|-------------------|
| 1 | flags Cursor Business as overkill for 2 seats | "wrong plan for team size" fires, severity=major |
| 2 | leaves Cursor Pro alone for small coding team | engine doesn't manufacture savings |
| 3 | detects Cursor + Copilot redundancy | cross-tool overlap pass |
| 4 | recommends Credex credits for high API spend | API-direct ≥ $300/mo → credexEligible |
| 5 | downgrades Claude Max for non-coding | use-case-aware rule; exact $80 math |
| 6 | annual = monthly × 12, never negative | invariant guard |
| 7 | templated summary in optimal state | fallback never empty |

File: `src/lib/storage.test.ts`

| # | Test | What it pins down |
|---|------|-------------------|
| 8 | share payload round-trip | encode/decode identity for public URLs |
| 9 | invalid slug returns null | broken links don't crash |
| 10 | base64url has no padding | URL-safe slugs |

Adding a rule: add the rule, add one positive + one false-positive-guard test, update `PRICING_DATA.md` if new pricing.