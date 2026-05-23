# Stackwise — Mint for your AI tool spend

Monorepo: **frontend** (Vite + React) and **backend** (Express + MVC + MongoDB).

## Structure

```
frontend/          # React SPA — audit UI, share links
backend/           # Express API — MVC, MongoDB, Resend, Gemini SDK
  src/
    models/        # Mongoose models (leads, audits)
    controllers/   # Request handlers
    routes/        # Express routers
    services/      # Gemini SDK, Resend
    views/         # Email HTML templates
    middleware/    # Rate limiting
```

## Quick start

```bash
# 1. MongoDB: configure connection string
cp backend/.env.example backend/.env
# Set MONGODB_URI=mongodb://localhost:27017/stackwise

# 2. Install dependencies
npm install

# 3. Frontend env
cp frontend/.env.example frontend/.env

# 4. Run both
npm run dev
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:3001  

## Deploy

- **Frontend:** Vercel / Netlify / Cloudflare Pages → `frontend/`, set `VITE_API_URL`
- **Backend:** Render / Railway / Fly.io → `backend/`, set `MONGODB_URI` + API keys

## Tests

```bash
npm test
```

## Docs

See repo root: `ARCHITECTURE.md`, `PRICING_DATA.md`, `DEVLOG.md`, `ABUSE_PROTECTION.md`, etc.
