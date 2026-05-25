# Stackwise — AI Tool Spend Auditor

**Stackwise** is an open-source audit engine that analyzes AI tool spending for engineering teams and recommends cost optimization strategies. Run a 60-second audit to discover potential monthly savings across Cursor, GitHub Copilot, Claude, ChatGPT, Gemini, and more.

**Demo:** https://stackwise.app  
**Architecture:** Monorepo — **frontend** (React + Vite) and **backend** (Express + Node.js + MongoDB)

---

## Features

✅ **Client-side audit engine** — calculates savings without sending raw data  
✅ **Share URLs with OG cards** — tweet your findings, embed on blogs  
✅ **AI-powered summaries** — Gemini generates personalized recommendations  
✅ **Lead capture** — optional email + honeypot protection  
✅ **Rate-limited API** — 5 req/min per IP for leads, 20 req/min for summaries  
✅ **Pricing accuracy** — all plans verified against live vendor pages  
✅ **Docker & Docker Compose** — one-command local setup and deployment

---

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Copy environment template
cp .env.example .env

# Update .env with your API keys (optional for local testing)
# - GOOGLE_API_KEY=your_gemini_key
# - RESEND_API_KEY=your_resend_key

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

- **Frontend:** http://localhost  
- **Backend API:** http://localhost/api  
- **MongoDB:** localhost:27017

### Option 2: Local Development (Node + npm)

```bash
# 1. Install dependencies
npm install

# 2. Backend environment
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI=mongodb://localhost:27017/stackwise

# 3. Frontend environment
cd ../frontend
cp .env.example .env
# Edit .env: set VITE_API_URL=http://localhost:5000

# 4. Start MongoDB (if not using Docker)
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Docker: docker run -d -p 27017:27017 mongo:7-alpine

# 5. Run dev servers
npm run dev
```

- **Frontend:** http://localhost:5173  
- **Backend:** http://localhost:5000

---

## Project Structure

```
frontend/                  # React SPA
├── src/
│   ├── pages/            # Routes: IndexPage, SharePage, WidgetPage
│   ├── components/       # UI components + Radix UI system
│   ├── lib/
│   │   ├── audit-engine.ts   # Core algorithm + audit rules
│   │   ├── pricing.ts        # Tool plans & pricing (verified 2026-05-20)
│   │   ├── api.ts            # Backend API client
│   │   └── storage.ts        # Base64url payload encoding
│   └── styles.css        # Tailwind + custom themes
├── vite.config.ts
├── vitest.config.ts
└── nginx.conf            # Production Nginx config

backend/                   # Express API (MVC)
├── src/
│   ├── index.ts          # Server entry, middleware setup
│   ├── config/
│   │   └── database.ts   # Mongoose connection
│   ├── models/
│   │   ├── leadModel.ts  # Lead schema + persistence
│   │   └── auditModel.ts # Audit payload storage
│   ├── controllers/
│   │   ├── leadsController.ts   # POST /api/public/leads
│   │   └── summaryController.ts # POST /api/summary
│   ├── services/
│   │   ├── emailService.ts   # Resend email integration
│   │   └── summaryService.ts # Gemini API client
│   ├── views/
│   │   └── emailTemplates.ts # HTML email markup
│   ├── routes/
│   │   └── index.ts      # Express router setup
│   └── middleware/
│       └── rateLimit.ts  # Per-IP rate limiting
├── Dockerfile
└── tsconfig.json

docker-compose.yml         # Multi-container orchestration
.dockerignore
.env.example              # Environment template
```

---

## Environment Variables

### Backend (`.env`)
```env
NODE_ENV=production                                    # dev | production
PORT=5000
MONGODB_URI=mongodb://root:password@mongodb:27017/stackwise
GOOGLE_API_KEY=your_gemini_api_key                   # For AI summaries
RESEND_API_KEY=your_resend_api_key                   # For lead emails
RESEND_FROM_EMAIL=Stackwise <audits@stackwise.app>   # Email sender
FRONTEND_URL=http://localhost:5173                    # CORS origin
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000  # Backend API endpoint
```

---

## API Endpoints

| Method | Endpoint | Rate Limit | Description |
|--------|----------|-----------|-------------|
| `GET` | `/health` | — | Health check |
| `POST` | `/api/public/leads` | 5/min | Capture lead + email |
| `POST` | `/api/summary` | 20/min | Generate AI summary |

### POST /api/public/leads
**Body:**
```json
{
  "email": "user@example.com",
  "company": "Acme Inc",
  "role": "VP Eng",
  "teamSize": 8,
  "monthlySavings": 340,
  "annualSavings": 4080,
  "auditState": "high_savings",
  "auditId": "base64_slug",
  "auditPayload": { "payload": {...}, "useCase": "coding", "teamSize": 8, "monthlySavings": 340 },
  "shareUrl": "https://stackwise.app/a/slug",
  "honeypot": ""
}
```

**Response:**
```json
{
  "ok": true,
  "stored": true,
  "emailSent": true,
  "message": "Lead saved. Check your inbox for the audit confirmation."
}
```

### POST /api/summary
**Body:**
```json
{
  "result": { "findings": [...], "monthlySavings": 340, ... },
  "useCase": "coding"
}
```

**Response:**
```json
{
  "summary": "Your team could save ~$340/month by..."
}
```

---

## Testing

```bash
# Frontend tests
cd frontend
npm test           # Single run
npm run test:watch # Watch mode

# Lint
npm run lint

# Backend builds
cd ../backend
npm run build
```

---

## Deployment

### Docker (Production)
```bash
# Build images
docker-compose build

# Push to registry (e.g., Docker Hub, ECR)
docker tag stackwise-backend:latest myrepo/stackwise-backend:latest
docker push myrepo/stackwise-backend:latest

# Deploy (e.g., Docker Swarm, Kubernetes, AWS ECS)
```

### Traditional Hosting

**Frontend:** Vercel, Netlify, Cloudflare Pages, S3 + CloudFront
- Build: `npm run build` (outputs to `dist/`)
- Environment: `VITE_API_URL` (backend URL)

**Backend:** Render, Railway, Fly.io, Heroku, AWS Lambda
- Build: `npm run build`
- Start: `npm start`
- Environment: `MONGODB_URI`, `GOOGLE_API_KEY`, `RESEND_API_KEY`, `FRONTEND_URL`

---

## Key Concepts

### Audit Engine
The core algorithm (`frontend/src/lib/audit-engine.ts`) evaluates each tool entry against defensible rules:
- **Cursor Business for tiny teams** → downgrade to Pro (~50% savings)
- **Claude Team for 1–2 people** → switch to Plus or API
- **ChatGPT Team for ≤2 seats** → use Plus instead
- **Copilot Business for <5 seats** → downgrade to Individual
- **Gemini Ultra default** → rarely justified; consider AI Pro or API
- Additional rules for API vs. subscription breakeven

Results are ranked by severity (`ok` | `minor` | `major`) and marked `credexEligible` when buying credits saves money.

### Shareable URLs
Share audits via `/a/:slug` where slug is a **base64url-encoded** JSON payload:
```json
{
  "findings": [...],
  "totals": { "current": 1200, "recommended": 850, "savings": 350, "annual": 4200 },
  "state": "high_savings",
  "useCase": "coding",
  "teamSize": 12,
  "generatedAt": "2026-05-25T..."
}
```

The route emits **OG meta tags** (title, description, image) so Twitter, LinkedIn, and Slack preview the audit's key metrics.

### Email Capture
Leads are captured via a honeypot-protected form:
- `honeypot` field (hidden) must remain empty
- Valid email + optional company/role/team_size
- Lead stored in MongoDB; audit payload stored if provided
- Confirmation email sent via Resend (if configured)

---

## Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — System design, data flow, MVC patterns
- **[PRICING_DATA.md](PRICING_DATA.md)** — Pricing sources & verification dates
- **[DEVLOG.md](DEVLOG.md)** — Development timeline & decisions
- **[GTM.md](GTM.md)** — Go-to-market strategy & target users
- **[ECONOMICS.md](ECONOMICS.md)** — Unit economics & monetization paths
- **[METRICS.md](METRICS.md)** — Success metrics & analytics
- **[REFLECTION.md](REFLECTION.md)** — Postmortem & learnings
- **[USER_INTERVIEWS.md](USER_INTERVIEWS.md)** — Founder feedback
- **[ABUSE_PROTECTION.md](ABUSE_PROTECTION.md)** — Security & spam prevention

---

## Tech Stack

**Frontend**
- React 19 + React Router
- Vite (build) + Vitest (testing)
- Tailwind CSS + Radix UI
- TypeScript

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Google Generative AI SDK (Gemini)
- Resend (email)
- TypeScript

**Infrastructure**
- Docker & Docker Compose
- Nginx (frontend proxy)
- Alpine Linux (minimal images)

---

## Contributing

Contributions welcome! Please:
1. Fork and create a feature branch
2. Add tests for new audit rules
3. Verify pricing accuracy for new tools
4. Submit a PR with a clear description

---

## License

MIT
