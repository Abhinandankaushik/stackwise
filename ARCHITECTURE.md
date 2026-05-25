# Architecture

## System Overview

Stackwise is a full-stack audit engine for AI tool spending. Users input their current tool stack, the system calculates potential savings using defensible rules, generates an AI summary, and enables sharing via OG-enabled URLs.

### High-Level Flow

```
┌─ User fills form (tools, team size, use case)
│
├─ Frontend runs audit-engine (client-side)
│  ├─ Fetches pricing rules
│  ├─ Evaluates each tool against 6+ rules
│  ├─ Ranks findings by severity
│  └─ Encodes result as base64url slug
│
├─ Optional: User shares URL
│  ├─ Frontend stores lead (email + metadata)
│  └─ Backend sends confirmation email
│
└─ Optional: Request AI summary
   └─ Backend calls Gemini API + returns summary
```

---

## Frontend Architecture

### Component Hierarchy

```
App.tsx
├── IndexPage
│   ├── Header (navigation, widget opener)
│   ├── Hero (headline + CTA)
│   ├── SpendForm (tool input, plan selection)
│   ├── ResultsView (findings list, benchmark card, CTA buttons)
│   ├── SocialProof (testimonials)
│   ├── FAQ
│   └── Footer
├── SharePage (/a/:slug)
│   ├── Audit results decoded from slug
│   ├── OG meta tags (title, description, image)
│   ├── LeadForm (email + optional company/role)
│   └── SummaryPanel (AI-generated or fallback template)
└── WidgetPage (/widget)
    └── Standalone audit form (embeddable iframe)
```

### Data Flow

```
SpendForm
  │
  └─> runAudit(input: AuditInput)
      ├─ Input: { tools, teamSize, useCase }
      ├─ For each tool:
      │  ├─ Get pricing plan details
      │  ├─ Run evaluation rules
      │  └─ Return finding (saving, action, severity)
      ├─ Aggregate totals (current, recommended, savings, annual)
      ├─ Classify state: high_savings | some_savings | optimal
      └─> Output: AuditResult
          ├─ findings: ToolFinding[]
          ├─ totalCurrent / totalRecommended / monthlySavings
          ├─ perDeveloperSpend vs benchmarkPerDeveloper
          └─ generatedAt

  │
  └─> encodeSharePayload()
      ├─ Convert AuditResult to JSON
      ├─ Stringify + base64url encode
      └─ Create share URL: /a/{slug}
```

### Key Libraries

| Library | Purpose |
|---------|---------|
| **React Router** | Client-side routing (/a/:slug, /widget) |
| **Vite** | Build bundler + dev server |
| **Tailwind CSS** | Utility-first styling |
| **Radix UI** | Unstyled, accessible components |
| **Vitest + Happy DOM** | Unit + integration tests |

---

## Backend Architecture

### MVC Pattern

```
Express App (index.ts)
│
├─ MIDDLEWARE
│  ├─ cors() — Allow frontend origin
│  ├─ express.json({ limit: "512kb" }) — Body parser
│  └─ rateLimit() — Per-IP request throttling
│
├─ ROUTES (routes/index.ts)
│  ├─ GET /health
│  ├─ POST /api/public/leads (5 req/min)
│  └─ POST /api/summary (20 req/min)
│
├─ CONTROLLERS
│  ├─ leadsController.ts
│  │  ├─ Validate email + auditId
│  │  ├─ Check honeypot
│  │  ├─ Call LeadModel.create()
│  │  ├─ Call AuditModel.create()
│  │  ├─ Call emailService.send()
│  │  └─ Return { ok, stored, emailSent }
│  │
│  └─ summaryController.ts
│     ├─ Validate result + useCase
│     ├─ Call summaryService.generateSummary()
│     └─ Return { summary: "...", cached?: boolean }
│
├─ MODELS (Mongoose)
│  ├─ Lead
│  │  ├─ email (indexed)
│  │  ├─ company, role, team_size
│  │  ├─ audit_id, monthly_savings, audit_state
│  │  └─ created_at (indexed for sorting)
│  │
│  └─ Audit
│     ├─ id (audit_id, primary key)
│     ├─ payload (full AuditResult JSON)
│     ├─ use_case, team_size, monthly_savings
│     └─ created_at
│
├─ SERVICES
│  ├─ emailService.ts
│  │  ├─ Validate RESEND_API_KEY
│  │  ├─ Generate subject (high_savings vs generic)
│  │  ├─ Fetch HTML template from emailTemplates()
│  │  └─ POST to https://api.resend.com/emails
│  │
│  └─ summaryService.ts
│     ├─ Validate GOOGLE_API_KEY
│     ├─ Format prompt with result + useCase
│     ├─ Call google.generativeAI.generateText()
│     ├─ 8-second timeout, fallback template on error
│     └─ Return { summary, cached? }
│
└─ VIEWS
   └─ emailTemplates.ts
      ├─ auditConfirmationHtml(params)
      ├─ Dynamic subject line
      ├─ Embedded share URL
      └─ Fallback text-only version
```

---

## Data Models

### Lead (MongoDB)

```javascript
{
  _id: ObjectId,
  email: String,            // indexed
  company?: String,
  role?: String,
  team_size?: Number,
  audit_id: String,         // foreign key to Audit
  monthly_savings?: Number,
  audit_state?: String,     // "high_savings" | "some_savings" | "optimal"
  created_at: Date          // indexed for analytics
}
```

### Audit (MongoDB)

```javascript
{
  _id: ObjectId,
  id: String,               // audit_id from request (unique-ish)
  payload: {                // Full AuditResult as JSON
    findings: [...],
    totalCurrent: Number,
    totalRecommended: Number,
    monthlySavings: Number,
    annualSavings: Number,
    perDeveloperSpend: Number,
    benchmarkPerDeveloper: Number,
    state: String,
    generatedAt: String
  },
  use_case: String,         // "coding" | "writing" | "data" | etc.
  team_size: Number,
  monthly_savings: Number,
  created_at: Date
}
```

---

## Audit Rules

The `audit-engine.ts` evaluates each tool entry against specific rules. **Default: no savings** (keep current plan). Rules are conservative and only recommend downgrades when justified.

| Rule | Condition | Action | Reason | Severity |
|------|-----------|--------|--------|----------|
| **Cursor Business → Pro** | Cursor Business, seats < 3 | Downgrade to Pro | Admin console not needed below 3 seats | Major |
| **Claude Team → Plus** | Claude Team, seats ≤ 2 | Downgrade to Plus or API | Org controls surplus | Minor |
| **ChatGPT Team → Plus** | ChatGPT Team, seats ≤ 2 | Downgrade to Plus | Admin overhead not justified | Minor |
| **Copilot Business → Individual** | Copilot Business, seats < 5 | Downgrade to Individual | Business features (org management) waste overhead | Major |
| **Gemini Ultra → Pro** | Gemini Ultra (any seats) | Downgrade to AI Pro or API | Ultra rarely justified; Pro + API combo is cheaper | Major |
| **Windsurf Teams → Pro** | Windsurf Teams, seats < 3 | Downgrade to Pro | Team features (SSO, org management) unused | Minor |

**Cross-tool rules** (post-pass):
- **Cursor + Copilot overlap**: If team has both, suggest consolidating to one (typically Cursor for AI-heavy coding).
- **Claude + ChatGPT overlap**: If spending >$50 on both, suggest choosing one for production + one API for experimentation.

**Metrics:**
- `credexEligible: true` when the savings come from switching to credits or API (where Credex can help).
- `benchmarkPerDeveloper`: $55/mo is the rough industry average (will calibrate with N ≥ 50 audits).

---

## API Data Flow

### POST /api/public/leads

**Request:**
```json
{
  "email": "alice@example.com",
  "company": "Acme",
  "role": "VP Eng",
  "teamSize": 8,
  "monthlySavings": 340,
  "annualSavings": 4080,
  "auditState": "high_savings",
  "auditId": "base64url_slug",
  "auditPayload": {
    "payload": { ... },
    "useCase": "coding",
    "teamSize": 8,
    "monthlySavings": 340
  },
  "shareUrl": "https://stackwise.app/a/slug",
  "honeypot": ""
}
```

**Steps:**
1. Validate honeypot is empty (if not, return 200 OK but skip)
2. Validate email format (must include @)
3. Validate auditId exists
4. If `hasDatabase()`: store Lead + Audit records
5. If `RESEND_API_KEY` set: send confirmation email
6. Return `{ ok, stored, emailSent, message }`

**Response (200 OK):**
```json
{
  "ok": true,
  "stored": true,
  "emailSent": true,
  "message": "Lead saved. Check your inbox for the audit confirmation."
}
```

### POST /api/summary

**Request:**
```json
{
  "result": {
    "findings": [...],
    "monthlySavings": 340,
    ...
  },
  "useCase": "coding"
}
```

**Steps:**
1. Validate `result` and `useCase` present
2. Call `generateSummary(result, useCase)`
   - Build prompt: "Summarize this audit for a {useCase} team..."
   - Call Gemini API with 8-second timeout
   - On timeout/error: return fallback template
3. Return `{ summary: "..." }`

**Response (200 OK):**
```json
{
  "summary": "Your team could save ~$340/month by downgrading Cursor Business to Pro. This plan includes...",
  "cached": false
}
```

---

## Rate Limiting

In-memory token bucket (no Redis needed for MVP):

```typescript
// Per endpoint, per client IP:
// - /api/public/leads: 5 req / 60 sec
// - /api/summary: 20 req / 60 sec

const key = `${keyPrefix}:${clientIp}`;
if (currentCount >= limit) return 429 Too Many Requests
```

Falls back to `x-forwarded-for` header for proxy environments (Docker, Kubernetes).

---

## Deployment Patterns

### Docker Compose (Local + Simple Hosting)

```yaml
services:
  backend:     # Node.js on :5000
  frontend:    # Nginx on :80 (proxies /api → backend)
  mongodb:     # Mongo on :27017
```

### Production (Kubernetes / Cloud)

```
Ingress / Load Balancer
  ├─> Frontend Pod (Nginx)
  │   └─> Backend Pod (Node.js)
  │       └─> MongoDB Cloud Cluster
  └─> [optional] Redis (for distributed rate limiting)
```

### Database

- **Local dev:** MongoDB in Docker (`mongo:7-alpine`)
- **Production:** MongoDB Atlas or self-hosted with replication + backups

---

## Environment Variables

| Variable | Service | Example | Required? |
|----------|---------|---------|-----------|
| `NODE_ENV` | Backend | `production` | Yes |
| `PORT` | Backend | `5000` | No (default 5000) |
| `MONGODB_URI` | Backend | `mongodb://...` | Yes (leads + audits persist only if set) |
| `GOOGLE_API_KEY` | Backend | `AIza...` | No (summaries skip if missing) |
| `RESEND_API_KEY` | Backend | `re_...` | No (emails skip if missing) |
| `RESEND_FROM_EMAIL` | Backend | `Stackwise <hi@stackwise.app>` | No |
| `FRONTEND_URL` | Backend | `http://localhost:5173` | Yes (CORS) |
| `VITE_API_URL` | Frontend | `http://localhost:5000` | Yes |

---

## Error Handling

### Frontend
- **Invalid email:** Show form error immediately
- **Lead submission error:** Show toast + retry option
- **Summary timeout:** Display fallback template + apologetic message
- **Network error:** Show user-friendly error, don't crash

### Backend
- **MongoDB connection fail on startup:** Log warning, continue anyway (leads won't persist)
- **Resend API fail:** Log error, return `{ emailSent: false }` (don't fail the whole request)
- **Gemini timeout:** Return fallback summary template (8-second limit)
- **Honeypot triggered:** Return 200 OK (don't reveal validation logic to bots)

---

## Performance

### Frontend
- **Audit calculation:** < 10ms (client-side, no network)
- **Share URL encoding:** < 5ms (base64url)
- **Initial load:** Vite with code splitting → ~45 KB JS (gzipped)

### Backend
- **Lead capture:** ~200ms (MongoDB write + optional Resend fetch)
- **Summary generation:** ~3–5s (Gemini API roundtrip) + 8s timeout
- **Rate limiting:** O(1) per request (in-memory map lookup)

---

## Security

1. **Honeypot field** on lead form (hidden from users, visible to bots)
2. **Rate limiting** per client IP on public endpoints
3. **CORS** restricted to frontend origin
4. **No sensitive data in URLs:** share slug contains only findings, no PII
5. **API key validation** on startup (skip features if keys missing, don't crash)
6. **Email validation** (simple @ check) before persisting
7. **Request body limit** (`512 KB`) to prevent DoS

---

## Monitoring & Analytics

### Metrics to Track
- Audits run (unique sessions)
- Share URLs viewed (external referrers)
- Leads captured (emails submitted)
- Conversions to Credex consultation
- Average team size, savings per audit
- Audit state distribution (% high_savings, some_savings, optimal)

### Logs
- Backend: `console.log` + structured logs on error
- Frontend: error boundary, Sentry (optional)
- MongoDB: slow query logs, connection drops

---

## Future Improvements

1. **Multi-tool cross-overlap detection** (more sophisticated than current rules)
2. **Historical pricing data** (track price changes over time)
3. **Integrations:** Slack / Teams alerts, Zapier, PagerDuty
4. **Premium features:** Org management, team reports, export to CSV/PDF
5. **LLM-generated rules** (audit-engine trained on team data)
6. **Benchmarking dashboard** (aggregate anonymized data, show peer comparisons)
