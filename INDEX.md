# Quick Start & Documentation Index

This file serves as a central hub for getting started with Stackwise and navigating the documentation.

---

## 🚀 Quick Start (5 minutes)

### Using Docker (Recommended)
```bash
cp .env.example .env
docker-compose up -d
# Frontend: http://localhost
# Backend: http://localhost/api/health
```

### Local Development
```bash
npm install
cd backend && npm run build
cd ../frontend && npm install
npm run dev
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

---

## 📚 Documentation Map

| Document | Purpose | Best for |
|----------|---------|----------|
| **[README.md](README.md)** | Overview, features, setup | Getting started, first impression |
| **[DOCKER.md](DOCKER.md)** | Docker & deployment guide | Production setup, troubleshooting |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System design & data flow | Understanding the codebase |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | How to contribute | Adding features, fixing bugs |
| **[TESTS.md](TESTS.md)** | Testing strategy | Running & writing tests |
| **[PRICING_DATA.md](PRICING_DATA.md)** | Pricing sources | Audit rules, pricing accuracy |
| **[GTM.md](GTM.md)** | Go-to-market strategy | Business context, user research |
| **[ECONOMICS.md](ECONOMICS.md)** | Unit economics | Unit LTV, CAC, revenue models |
| **[METRICS.md](METRICS.md)** | Success metrics | KPIs, instrumentation |
| **[DEVLOG.md](DEVLOG.md)** | Development timeline | Project history, decisions |
| **[REFLECTION.md](REFLECTION.md)** | Postmortem & learnings | What worked, what didn't |
| **[USER_INTERVIEWS.md](USER_INTERVIEWS.md)** | Customer feedback | Feature priorities, user needs |
| **[ABUSE_PROTECTION.md](ABUSE_PROTECTION.md)** | Security & spam prevention | Rate limiting, honeypot |
| **[PROMPTS.md](PROMPTS.md)** | AI prompt design | Gemini summary generation |
| **[LANDING_COPY.md](LANDING_COPY.md)** | Marketing messaging | Headlines, CTAs |

---

## 🔥 Most Important Files

1. **[README.md](README.md)** — Start here. Complete project overview.
2. **[ARCHITECTURE.md](ARCHITECTURE.md)** — How the system works.
3. **[CONTRIBUTING.md](CONTRIBUTING.md)** — How to contribute code.
4. **[DOCKER.md](DOCKER.md)** — How to deploy.

---

## 🛠️ Common Tasks

### I want to...

#### Understand the project
→ Read [README.md](README.md), then [ARCHITECTURE.md](ARCHITECTURE.md)

#### Run it locally
→ Follow [README.md](README.md) Quick Start → Option 2

#### Deploy to production
→ See [DOCKER.md](DOCKER.md) → Deployment Scenarios

#### Add a new audit rule
→ See [CONTRIBUTING.md](CONTRIBUTING.md) → Audit Rules section + [ARCHITECTURE.md](ARCHITECTURE.md) → Audit Rules table

#### Fix a pricing bug
→ Verify at vendor's site, update `backend/src/lib/pricing.ts`, add test, update [PRICING_DATA.md](PRICING_DATA.md)

#### Write a test
→ See [TESTS.md](TESTS.md) → Testing in Docker, then add test file in appropriate `*.test.ts`

#### Understand the business
→ Read [GTM.md](GTM.md), [ECONOMICS.md](ECONOMICS.md), [METRICS.md](METRICS.md)

#### Debug an issue
→ Check [DOCKER.md](DOCKER.md) → Monitoring & Debugging section

#### Understand user needs
→ See [USER_INTERVIEWS.md](USER_INTERVIEWS.md)

---

## 🗂️ Project Structure

```
stackwise/
├── backend/              # Express API (Node.js + TypeScript)
│   └── src/
│       ├── models/       # MongoDB schemas
│       ├── controllers/  # Request handlers
│       ├── services/     # Business logic
│       ├── routes/       # Express routes
│       └── middleware/   # Rate limiting
│
├── frontend/             # React SPA (Vite + TypeScript)
│   └── src/
│       ├── pages/        # Page components
│       ├── components/   # UI components
│       └── lib/          # Audit engine, pricing
│
├── docker-compose.yml    # Local orchestration
├── .env.example          # Environment template
├── Dockerfile            # Multi-stage builds (both services)
│
└── Documentation (root):
    ├── README.md         # Start here
    ├── ARCHITECTURE.md   # System design
    ├── DOCKER.md         # Deployment
    ├── CONTRIBUTING.md   # How to contribute
    ├── TESTS.md          # Testing
    ├── PRICING_DATA.md   # Pricing sources
    ├── GTM.md            # Go-to-market
    ├── ECONOMICS.md      # Unit economics
    ├── METRICS.md        # Success metrics
    ├── DEVLOG.md         # Development timeline
    ├── REFLECTION.md     # Postmortem
    ├── USER_INTERVIEWS.md # Customer feedback
    ├── ABUSE_PROTECTION.md # Security
    ├── PROMPTS.md        # AI prompts
    └── LANDING_COPY.md   # Marketing
```

---

## 📊 Key Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Audit calculation time | <10ms | ✅ |
| Lead capture API | <500ms | ✅ |
| AI summary generation | 3-5s | ✅ |
| Frontend bundle size | <100KB gzipped | ✅ |
| Test coverage (audit engine) | >80% | ✅ |
| Price verification | Weekly | ⏳ (Manual) |

---

## 🔐 Security Checklist

- ✅ Honeypot protection on lead form
- ✅ IP-based rate limiting (5 req/min for leads, 20 for summaries)
- ✅ CORS restricted to frontend origin
- ✅ No PII in share URLs
- ✅ Input validation on all endpoints
- ⏳ HTTPS required (configure at proxy layer)
- ⏳ Secret management (set in `.env` or secrets manager)

---

## 🎯 API Endpoints

| Method | Endpoint | Rate Limit | Returns |
|--------|----------|-----------|---------|
| `GET` | `/health` | — | `{ ok: true }` |
| `POST` | `/api/public/leads` | 5/min | `{ ok, stored, emailSent }` |
| `POST` | `/api/summary` | 20/min | `{ summary }` |

Full details: [ARCHITECTURE.md](ARCHITECTURE.md) → API Data Flow

---

## 🚢 Deployment

### Docker Compose (Local)
```bash
docker-compose up -d
```

### Production (VPS)
See [DOCKER.md](DOCKER.md) → Scenario 1: Single Server

### Kubernetes
See [DOCKER.md](DOCKER.md) → Scenario 2: Kubernetes

### Managed Platforms
See [DOCKER.md](DOCKER.md) → Scenario 3 & 4 (ECS, Railway, Render)

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 already in use | `lsof -i :5000 \| xargs kill -9` |
| MongoDB won't connect | Check `MONGODB_URI` in `.env`, ensure MongoDB is running |
| Frontend returns 502 | Backend not responding; check `docker-compose logs backend` |
| OG tags not showing | Twitter card validator caches; clear with `?v=123` |

Full troubleshooting: [DOCKER.md](DOCKER.md) → Troubleshooting

---

## 💡 Key Concepts

### Audit Engine
Client-side calculation of savings for each tool based on defensible rules. Never sends raw data.

### Audit Rules
Specific recommendations: e.g., "Cursor Business is overkill for <3 seats, downgrade to Pro."

### Share URL
Base64url-encoded public audit payload (no PII). Includes OG meta tags for Twitter/LinkedIn/Slack previews.

### Lead Capture
Optional email form with honeypot bot protection. Lead + audit data stored in MongoDB.

### AI Summary
Gemini API generates personalized recommendation. Falls back to template on error/timeout.

---

## 👥 Contributing

To contribute:
1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Create a feature branch
3. Make changes, write tests
4. Submit a PR
5. Get review from maintainers

Priority areas:
- New audit rules (with pricing verification)
- Bug fixes in audit math
- Documentation improvements
- Docker/deployment improvements

---

## 📞 Support

- **Questions?** Open an issue with `[question]` prefix
- **Bug report?** Open an issue with `[bug]` prefix
- **Feature request?** Open an issue with `[feature]` prefix

---

## 📄 License

MIT (See LICENSE file)

---

## 🎉 Getting Help

- **First time here?** Start with [README.md](README.md)
- **Want to understand the code?** Go to [ARCHITECTURE.md](ARCHITECTURE.md)
- **Ready to code?** Check [CONTRIBUTING.md](CONTRIBUTING.md)
- **Deploying?** See [DOCKER.md](DOCKER.md)

---

**Last updated:** May 25, 2026
