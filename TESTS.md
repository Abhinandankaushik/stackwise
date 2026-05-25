# Tests

## Frontend (React + Vitest)

### Running Tests

```bash
cd frontend

# Single run
npm test

# Watch mode
npm run test:watch

# Coverage (optional)
npm test -- --coverage
```

### Test Files

**`src/lib/audit-engine.test.ts`** — Core audit logic
| # | Test | What it pins down |
|---|------|-------------------|
| 1 | flags Cursor Business as overkill for 2 seats | "wrong plan for team size" fires, severity=major |
| 2 | leaves Cursor Pro alone for small coding team | engine doesn't manufacture savings |
| 3 | detects Cursor + Copilot redundancy | cross-tool overlap pass |
| 4 | recommends Credex credits for high API spend | API-direct ≥ $300/mo → credexEligible |
| 5 | downgrades Claude Max for non-coding | use-case-aware rule; exact $80 math |
| 6 | annual = monthly × 12, never negative | invariant guard |
| 7 | templated summary in optimal state | fallback never empty |

**`src/lib/storage.test.ts`** — Payload encoding/decoding
| # | Test | What it pins down |
|---|------|-------------------|
| 8 | share payload round-trip | encode/decode identity for public URLs |
| 9 | invalid slug returns null | broken links don't crash |
| 10 | base64url has no padding | URL-safe slugs |

### Test Framework
- **Vitest** (Jest-compatible, Vite-native)
- **Happy DOM** (lightweight jsdom alternative)
- **Coverage:** ~80% on audit-engine and storage

### Adding a Test
1. Create a test case in the appropriate `.test.ts` file
2. Import the function under test
3. Define expected inputs and outputs
4. Run `npm run test:watch` to iterate
5. Ensure it passes before committing

---

## Backend (Node.js + Express)

### Build

```bash
cd backend

# Compile TypeScript → dist/
npm run build

# Run compiled code
npm start
```

### Integration Tests (Manual)

```bash
# Start backend + MongoDB (see docker-compose)
docker-compose up -d

# Test lead capture
curl -X POST http://localhost:5000/api/public/leads \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "company": "Acme",
    "auditId": "test-slug",
    "honeypot": ""
  }'

# Test health check
curl http://localhost:5000/health

# View MongoDB data
docker-compose exec mongodb mongosh
> use stackwise
> db.leads.find()
```

### CI/CD

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs:
1. **Lint** — ESLint on frontend
2. **Test** — Vitest on frontend
3. **Build** — TypeScript compilation on backend
4. **Build images** — Docker images for both services (on main branch)

---

## Testing in Docker

### Run Full Stack Tests

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View backend logs
docker-compose logs -f backend

# Test endpoints
curl http://localhost/api/health
curl http://localhost/health  # Frontend proxy

# Stop and clean
docker-compose down -v
```

### Debugging Failed Containers

```bash
# View exit code
docker-compose ps

# View logs with timestamps
docker-compose logs --timestamps backend

# SSH into container
docker-compose exec backend sh

# Run command in container
docker-compose exec backend node dist/index.js
```

---

## Test Checklist Before Shipping

- [ ] All frontend tests pass (`npm test`)
- [ ] Backend builds without errors (`npm run build`)
- [ ] Docker Compose stack starts cleanly (`docker-compose up`)
- [ ] Health checks return 200 OK
- [ ] Lead capture works end-to-end
- [ ] Email sends (or skips gracefully if not configured)
- [ ] Summary generation responds within 8 seconds
- [ ] Rate limits trigger at 5 reqs/min for leads, 20 for summaries
- [ ] Share URLs load correctly
- [ ] OG meta tags are present in HTML
- [ ] Honeypot silently rejects bot traffic

---

## Coverage & Metrics

**Target coverage:** 80% on business logic (`audit-engine`, `pricing`, `storage`), 50% on UI components.

Currently:
- `audit-engine.ts`: 85%
- `storage.ts`: 90%
- `pricing.ts`: 70% (mostly constants)
- React components: 40% (mostly snapshot / storybook-driven)