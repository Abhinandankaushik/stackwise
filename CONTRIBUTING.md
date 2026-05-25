# Contributing to Stackwise

Thank you for your interest in contributing to Stackwise! This guide explains how to get started, what we're looking for, and how the project is organized.

---

## Getting Started

### Prerequisites
- Node.js 20+ (for local development)
- Docker & Docker Compose (for containerized setup)
- Git
- MongoDB (local or Docker)

### Setting Up Your Development Environment

**Option 1: Docker (Recommended)**
```bash
git clone https://github.com/yourusername/stackwise.git
cd stackwise
cp .env.example .env
docker-compose up -d
```

**Option 2: Local Node.js**
```bash
git clone https://github.com/yourusername/stackwise.git
cd stackwise

# Backend
cd backend
npm install
cp .env.example .env
# Edit .env: set MONGODB_URI

# Frontend
cd ../frontend
npm install
cp .env.example .env
# Edit .env: set VITE_API_URL=http://localhost:5000

# Start MongoDB (if not using Docker)
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Run dev servers from project root
npm run dev
```

---

## Project Structure

The project is organized as a **monorepo** with clear separation:

```
stackwise/
├── backend/              # Express API (Node.js + TypeScript)
│   ├── src/
│   │   ├── index.ts      # Server entry
│   │   ├── models/       # Mongoose schemas
│   │   ├── controllers/  # Request handlers (MVC)
│   │   ├── services/     # Business logic (Gemini, Resend)
│   │   ├── routes/       # Express routes
│   │   ├── middleware/   # Rate limiting, CORS
│   │   └── views/        # Email templates
│   ├── Dockerfile        # Multi-stage Node.js build
│   └── package.json
│
├── frontend/             # React SPA (Vite + TypeScript)
│   ├── src/
│   │   ├── App.tsx       # Routes
│   │   ├── pages/        # Page components
│   │   ├── components/   # UI components
│   │   ├── lib/          # Business logic
│   │   │   ├── audit-engine.ts     # Core algorithm
│   │   │   ├── audit-engine.test.ts
│   │   │   ├── pricing.ts          # Tool pricing
│   │   │   ├── api.ts              # Backend client
│   │   │   └── storage.ts          # URL encoding
│   │   └── styles.css    # Tailwind + theme
│   ├── Dockerfile        # Multi-stage Vite + Nginx
│   ├── nginx.conf        # Nginx config (API proxy)
│   └── package.json
│
├── docker-compose.yml    # Local orchestration
├── .env.example         # Environment template
├── .dockerignore
│
├── Documentation:
├── README.md            # Project overview & quick start
├── ARCHITECTURE.md      # System design & data flow
├── DOCKER.md            # Docker deployment guide
├── TESTS.md             # Testing strategy
├── PRICING_DATA.md      # Pricing sources & verification
├── GTM.md               # Go-to-market strategy
├── ECONOMICS.md         # Unit economics
├── METRICS.md           # Success metrics
├── DEVLOG.md            # Development timeline
├── REFLECTION.md        # Postmortem & learnings
└── PROMPTS.md           # AI prompt design
```

---

## Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/add-new-tool
# or
git checkout -b fix/rate-limit-edge-case
```

Branch naming conventions:
- `feature/` — new functionality
- `fix/` — bug fixes
- `docs/` — documentation updates
- `refactor/` — code restructuring
- `test/` — test improvements

### 2. Frontend Changes

**Adding a new audit rule:**
1. Edit `frontend/src/lib/pricing.ts` — add the new tool/plan if needed
2. Edit `frontend/src/lib/audit-engine.ts` — add the rule in `evaluateEntry()`
3. Write tests in `frontend/src/lib/audit-engine.test.ts`
4. Update `PRICING_DATA.md` with source URLs
5. Run `npm test` to verify

**Updating UI components:**
1. Components live in `frontend/src/components/`
2. Use Radix UI + Tailwind for consistency
3. Update corresponding `.test.tsx` file
4. Test responsive design (mobile-first)

**Adding a page:**
1. Create in `frontend/src/pages/PageName.tsx`
2. Add route in `frontend/src/App.tsx`
3. Add tests in `frontend/src/pages/__tests__/`

### 3. Backend Changes

**Adding an endpoint:**
1. Create controller in `backend/src/controllers/newController.ts`
2. Add route in `backend/src/routes/index.ts`
3. Add data model if needed in `backend/src/models/`
4. Add service if business logic is involved
5. Document in `ARCHITECTURE.md`

**Updating pricing:**
- Always verify against live vendor pages before committing
- Add link in `PRICING_DATA.md`
- Run the existing tests to ensure no rule regressions

### 4. Running Tests

```bash
# Frontend tests
cd frontend
npm test              # single run
npm run test:watch   # watch mode

# Backend build verification
cd backend
npm run build
```

### 5. Lint & Format

```bash
# Frontend
cd frontend
npm run lint

# Fix formatting (ESLint)
npm run lint -- --fix
```

### 6. Commit & Push

```bash
# Descriptive commit messages
git add .
git commit -m "feat: add Claude Team downgrade rule for ≤2 seats"

# Push to your fork
git push origin feature/add-new-tool
```

---

## Submitting a Pull Request

1. **Create a PR** on GitHub with:
   - Clear title (e.g., "Add Gemini API pricing verification")
   - Description of changes
   - Link to any related issues
   - Screenshots/GIFs if UI changes

2. **PR Template:**
   ```markdown
   ## What does this change?
   Brief summary of the change.

   ## Why?
   Context or motivation for the change.

   ## Testing
   How was this tested? (manual testing, unit tests, etc.)

   ## Checklist
   - [ ] Tests pass
   - [ ] Pricing verified (if applicable)
   - [ ] Documentation updated
   - [ ] No breaking changes
   ```

3. **Wait for review** — maintainers will provide feedback

4. **Merge** — once approved and CI passes

---

## Audit Rules — How to Add One

Audit rules are the heart of Stackwise. Here's the process:

### Step 1: Identify the Opportunity
Gather data: team size ranges, pricing plans, when the rule applies.

Example: "Cursor Business plan is overkill for teams <3 people."

### Step 2: Verify Pricing
Visit the vendor's pricing page. Record the exact URL and price.
- Cursor Pro: $20/user/mo (https://cursor.com/pricing)
- Cursor Business: $40/user/mo (https://cursor.com/pricing)

Add to `PRICING_DATA.md` with today's date.

### Step 3: Implement the Rule
In `frontend/src/lib/audit-engine.ts`, add to the `evaluateEntry()` function:

```typescript
if (tool.id === "cursor" && plan.id === "business" && seats < 3) {
  const proPrice = getPlan("cursor", "pro").pricePerSeat * seats;
  finding = {
    ...finding,
    recommendedMonthly: round(proPrice),
    monthlySavings: round(current - proPrice),
    action: "Downgrade to Cursor Pro",
    reason: "Business adds SSO + admin tools you don't need below ~3 seats.",
    severity: "major",
    credexEligible: true,  // if buying credits saves money
  };
}
```

### Step 4: Add Tests
In `frontend/src/lib/audit-engine.test.ts`:

```typescript
it("flags Cursor Business as overkill for 2 seats", () => {
  const input: AuditInput = {
    tools: [
      { toolId: "cursor", planId: "business", seats: 2, monthlySpend: 0 }
    ],
    teamSize: 2,
    useCase: "coding"
  };
  const result = runAudit(input);
  const finding = result.findings[0];
  
  expect(finding?.action).toBe("Downgrade to Cursor Pro");
  expect(finding?.severity).toBe("major");
  expect(finding?.monthlySavings).toBe(40);  // $80 - $40
});

it("does not flag Cursor Business as overkill for 5 seats", () => {
  // Same input, but seats: 5
  // Assert no action recommended
});
```

### Step 5: Update Documentation
- Update `PRICING_DATA.md` with the new tool/plan and URL
- Update `ARCHITECTURE.md` with the new rule in the rules table
- Add user interview insights if relevant

### Step 6: Get Review
Post your PR. Maintainers will verify:
- Pricing accuracy
- Rule logic defensibility
- Test coverage
- No edge cases missed

---

## Performance Considerations

- **Audit engine must be <10ms:** client-side, must feel instant
- **API endpoints <500ms:** lead capture, summary generation
- **Frontend bundle <100KB gzipped:** Vite code-splitting handles this
- **No database queries in the audit math:** it's all client-side

---

## Security Guidelines

When adding features:
1. **Validate all inputs** — especially in controllers
2. **No secrets in URLs** — share slugs contain only public findings
3. **Rate limit public endpoints** — already in place for /api/public/leads and /api/summary
4. **CORS restricted** — frontend origin only
5. **No PII in logs** — scrub emails/IPs from production logs

---

## Documentation Standards

All changes should update relevant `.md` files:

| File | When to update |
|------|---|
| `README.md` | New features, new environment variables, deployment changes |
| `ARCHITECTURE.md` | New endpoints, new models, new services, system diagram changes |
| `TESTS.md` | New test suites, changes to test strategy |
| `PRICING_DATA.md` | New tool/plan, price changes, verification updates |
| `DOCKER.md` | Docker/compose changes, deployment updates |

---

## Common Tasks

### Add a new AI tool to the audit
1. Add to `pricing.ts` with all plans
2. Add rule in `audit-engine.ts` if applicable
3. Add test case
4. Update `PRICING_DATA.md`
5. Document the decision in a commit message

### Fix a pricing bug
1. Verify against the vendor's current pricing page
2. Update `pricing.ts`
3. Add to `PRICING_DATA.md` with updated date
4. Run tests to ensure no regressions

### Add a new API endpoint
1. Create controller
2. Add route
3. Update `ARCHITECTURE.md` — API table
4. Add test (curl example)
5. Update `README.md` if public-facing

### Update Docker configuration
1. Modify `docker-compose.yml` or `Dockerfile`
2. Update `.env.example` if new env vars
3. Update `DOCKER.md` with deployment guidance
4. Test locally: `docker-compose up -d`

---

## Tips for Success

1. **Start small:** first PR should be a rule addition or a documentation fix
2. **Ask questions:** open an issue before big changes to discuss approach
3. **Test thoroughly:** broken pricing is worse than no code
4. **Document as you go:** future you will thank present you
5. **Respect the rules engine:** it's the product — changes here need care

---

## Code Style

### Frontend (React + TypeScript)
- Use **functional components** + hooks
- **Explicit types** — no `any` implicitly
- **Named exports** for pages, default for components
- **Const over let** where possible
- **Trailing commas** in multi-line structures

### Backend (Express + TypeScript)
- **Type every function parameter and return**
- **Separate concerns:** models ≠ controllers ≠ services
- **Async/await** over `.then()`
- **Descriptive variable names:** `lead` not `l`, `monthlySavings` not `ms`
- **Error handling:** always catch, log, and respond gracefully

---

## Questions?

- **Audit rules logic:** See `ARCHITECTURE.md` — Audit Rules section
- **Pricing accuracy:** See `PRICING_DATA.md` for sources
- **Deployment:** See `DOCKER.md` for setup
- **Metrics & GTM:** See `METRICS.md` and `GTM.md`
- **Still stuck?** Open an issue with `[question]` prefix

---

## Code of Conduct

We're building in public and welcome all contributions. Be respectful, assume good intent, and help others learn. (See CODE_OF_CONDUCT.md if this project grows.)

Happy contributing! 🚀
