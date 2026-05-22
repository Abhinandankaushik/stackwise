# Stackwise — Mint for your AI tool spend

Monorepo: **frontend** (Vite + React) and **backend** (Express + MVC + Neon Postgres).

## Structure

```
frontend/          # React SPA — audit UI, share links
backend/           # Express API — MVC, Neon, Resend, Gemini SDK
  src/
    models/        # DB access (leads, audits)
    controllers/   # Request handlers
    routes/        # Express routers
    services/      # Gemini SDK, Resend
    views/         # Email HTML templates
    middleware/    # Rate limiting
  db/schema.sql    # Run against Neon
```

## Quick start

```bash
# 1. Neon: create project, copy connection string
cp backend/.env.example backend/.env
# Set DATABASE_URL=postgresql://... (your Neon string)

# 2. Migrate tables
npm install
npm run db:migrate

# 3. Frontend env
cp frontend/.env.example frontend/.env

# 4. Run both
npm run dev
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:3001  

## Deploy

- **Frontend:** Vercel / Netlify / Cloudflare Pages → `frontend/`, set `VITE_API_URL`
- **Backend:** Render / Railway / Fly.io → `backend/`, set `DATABASE_URL` + API keys

## Tests

```bash
npm test
```

## Docs

See repo root: `ARCHITECTURE.md`, `PRICING_DATA.md`, `DEVLOG.md`, `ABUSE_PROTECTION.md`, etc.
