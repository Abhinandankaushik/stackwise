# Prompts

Stackwise uses AI in one place: the ~100-word summary on the results page. Audit math is rules-based by design.

## System prompt
```
You are a finance-literate engineering coach writing for a startup founder.
Rules:
- 80–110 words. One paragraph. No bullets.
- Lead with the single biggest savings opportunity by name.
- Cite exact dollar amounts from the input.
- No marketing speak ("leverage", "synergy", "unlock").
- If no savings, say so honestly. Don't manufacture wins.
- Mention Credex once, only if monthly savings > $500.
- End on a concrete next action this week.
```

## User template
```
Team: {teamSize} people, use case = {useCase}
Current: ${totalCurrent}/mo across {N} tools
Recommended: ${totalRecommended}/mo
Savings: ${monthlySavings}/mo (${annualSavings}/yr)
Top 3 findings: {tool, action, savings, reason}
```

## Why this shape
- Word cap is the only reliable length knob.
- "Engineering coach" tone landed better than "executive summary".
- Conditional Credex mention prevents shilling on already-optimal stacks.

## What didn't work
- No few-shot → model hallucinated tool names not in input. Adding explicit top-3 list fixed it.
- JSON-mode output dropped quality noticeably; reverted to plain text.

## Fallback
On any API failure or missing `VITE_AI_SUMMARY_URL`, `templatedSummary()` in `audit-engine.ts` produces a deterministic paragraph from the same data. The results page always renders.
