# Architecture

## System diagram

```mermaid
flowchart LR
  U[User browser] -->|Vite SPA| F[frontend/]
  F -->|POST /api/public/leads| B[backend Express MVC]
  F -->|POST /api/summary| B
  B -->|Mongoose| DB[(MongoDB)]
  B -->|SDK| Gem[Gemini API]
  B -->|fetch| Res[Resend email]
  F -->|encode slug| URL[/a/:slug client route]
```

## Backend MVC

| Layer | Role |
|-------|------|
| **routes/** | Mounts `/api/public/leads`, `/api/summary` |
| **controllers/** | Parse request, call models/services, JSON response |
| **models/** | Mongoose schemas + `MONGODB_URI` |
| **services/** | Gemini summary, Resend email |
| **views/** | HTML email templates |
| **middleware/** | IP rate limits |

## Data flow

1. `frontend` runs audit math client-side (`audit-engine.ts`).
2. Optional email → `POST /api/public/leads` → `leads` + `audits` collections on MongoDB.
3. Summary → `POST /api/summary` → Gemini → fallback template.
4. Share link encodes public payload in URL (`/a/:slug`); no PII in slug.

## Why split frontend / backend

- Clear separation for Credex review (MVC API vs React UI).
- Neon connection string stays server-only (`DATABASE_URL`).
- Frontend deploys as static CDN; API scales independently.

## Env vars

**Backend:** `MONGODB_URI`, `GEMINI_API_KEY`, `RESEND_API_KEY`, `FRONTEND_URL`  
**Frontend:** `VITE_API_URL`

## 10k audits/day

Same as before: pricing cron, KV for short slugs, PostHog funnel. Neon handles this volume on the free tier for lead rows.
