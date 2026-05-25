# Docker & Deployment Guide

This document covers Docker setup, configuration, and deployment strategies for Stackwise.

---

## Quick Reference

### Local Development (Docker Compose)

```bash
# Copy environment template
cp .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean everything (including data)
docker-compose down -v
```

**URLs:**
- Frontend: http://localhost
- Backend API: http://localhost/api
- MongoDB: localhost:27017

---

## Docker Images

### Backend (`backend/Dockerfile`)

**Base:** `node:20-alpine` (multi-stage build)

**Stages:**
1. **Builder** — compiles TypeScript → dist/
2. **Production** — minimal runtime, only production dependencies

**Optimizations:**
- Alpine Linux (~180 MB base → ~200 MB final image)
- Multi-stage reduces image size by 60%
- `.dockerignore` excludes node_modules, dist, git files

**Build:**
```bash
docker build -t stackwise-backend:latest backend/
```

**Run:**
```bash
docker run -d \
  --name stackwise-backend \
  -p 5000:5000 \
  -e MONGODB_URI="mongodb://mongodb:27017/stackwise" \
  -e GOOGLE_API_KEY="your_key" \
  stackwise-backend:latest
```

### Frontend (`frontend/Dockerfile`)

**Base:** `node:20-alpine` (builder) + `nginx:alpine` (production)

**Features:**
- Builds React app with Vite
- Serves from Nginx
- Includes Nginx config for API proxying
- Gzip compression enabled

**Build:**
```bash
docker build -t stackwise-frontend:latest frontend/
```

**Run:**
```bash
docker run -d \
  --name stackwise-frontend \
  -p 80:80 \
  stackwise-frontend:latest
```

### MongoDB (`docker-compose.yml`)

**Image:** `mongo:7-alpine` (official, ~130 MB)

**Features:**
- Root authentication (MONGO_ROOT_USER, MONGO_ROOT_PASSWORD)
- Persistent volumes for data + config
- Health checks enabled

---

## Docker Compose Services

### Service Definitions

```yaml
services:
  backend:
    # Node.js Express API
    build: ./backend
    ports: ["5000:5000"]
    depends_on: [mongodb]
    environment: [MONGODB_URI, GOOGLE_API_KEY, CORS_ORIGIN]
    healthcheck: GET /api/health every 30s

  frontend:
    # Nginx serving React SPA
    build: ./frontend
    ports: ["80:80"]
    depends_on: [backend]
    healthcheck: GET / every 30s

  mongodb:
    # MongoDB database
    image: mongo:7-alpine
    ports: ["27017:27017"]
    environment: [MONGO_ROOT_USER, MONGO_ROOT_PASSWORD]
    volumes: [mongodb_data, mongodb_config]
    healthcheck: mongosh ping every 10s
```

### Health Checks

All services include health checks:
- **Backend:** `wget --spider http://localhost:5000/api/health`
- **Frontend:** `wget --spider http://localhost/`
- **MongoDB:** `mongosh --eval db.adminCommand('ping')`

The container is considered healthy after 40s of startup (to allow MongoDB initialization).

---

## Environment Configuration

### .env File

Copy `.env.example` and update with your values:

```bash
cp .env.example .env
```

**Required for production:**
```env
NODE_ENV=production
MONGODB_URI=mongodb://root:password@mongodb:27017/stackwise
GOOGLE_API_KEY=AIza...
RESEND_API_KEY=re_...
CORS_ORIGIN=https://yourdomain.com
```

**Optional for local testing:**
- Leave `GOOGLE_API_KEY` blank → summaries use fallback template
- Leave `RESEND_API_KEY` blank → emails skip, no error
- Default `CORS_ORIGIN=http://localhost` is fine for local

### Docker Secrets (Advanced)

For production on Kubernetes/Swarm, use Docker secrets:

```bash
# Create secret
echo "your_mongodb_uri" | docker secret create mongo_uri -

# Reference in compose (requires compose format 3.1+)
services:
  backend:
    environment:
      MONGODB_URI_FILE: /run/secrets/mongo_uri
```

---

## Deployment Scenarios

### Scenario 1: Single Server (VPS)

```bash
# Clone repo
git clone https://github.com/yourusername/stackwise.git
cd stackwise

# Copy and configure .env
cp .env.example .env
nano .env  # Set GOOGLE_API_KEY, RESEND_API_KEY, MONGO credentials

# Start services
docker-compose up -d

# Verify
docker-compose ps
curl http://localhost/api/health
```

**Reverse proxy (optional):**
```nginx
# Nginx or Caddy in front of port 80
# (Stackwise frontend already includes Nginx config)
```

**Backup MongoDB:**
```bash
docker-compose exec mongodb mongodump --out /backup
docker cp stackwise-mongodb:/backup ./backup-$(date +%Y%m%d)
```

### Scenario 2: Kubernetes

**Prerequisites:** kubectl, helm (optional)

**Manual manifests:**
```yaml
# deployment-backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stackwise-backend
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: backend
        image: myrepo/stackwise-backend:latest
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: stackwise-secrets
              key: mongodb-uri
        ports:
        - containerPort: 5000
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 30

---
apiVersion: v1
kind: Service
metadata:
  name: stackwise-backend
spec:
  selector:
    app: stackwise-backend
  ports:
  - port: 5000
    targetPort: 5000
```

**Helm chart (simpler):**
```bash
helm repo add stackwise https://...
helm install stackwise stackwise/stackwise \
  --set mongodb.auth.rootPassword=secret \
  --set google.apiKey=AIza...
```

### Scenario 3: AWS ECS / Fargate

1. **Build and push images:**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456.dkr.ecr.us-east-1.amazonaws.com
   docker tag stackwise-backend:latest 123456.dkr.ecr.us-east-1.amazonaws.com/stackwise-backend:latest
   docker push 123456.dkr.ecr.us-east-1.amazonaws.com/stackwise-backend:latest
   ```

2. **Create CloudFormation / Terraform for:**
   - ECS Cluster + Task Definitions
   - RDS (MongoDB Atlas or DocumentDB)
   - ALB + Target Groups
   - Secrets Manager for environment variables

3. **Deploy:**
   ```bash
   aws ecs create-service --cluster stackwise --task-definition stackwise-backend:1 --service-name backend
   ```

### Scenario 4: Railway / Render (Platform-as-a-Service)

1. **Connect GitHub repo**
2. **Configure environment variables:**
   - `MONGODB_URI` → Railway's MongoDB add-on or external
   - `GOOGLE_API_KEY`, `RESEND_API_KEY`
3. **Deploy:** auto-deploys on push to main

Both platforms support Docker Compose natively (as of 2026).

---

## Monitoring & Debugging

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines, follow
docker-compose logs --tail=100 -f

# With timestamps
docker-compose logs --timestamps -f
```

### SSH into Container

```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# MongoDB
docker-compose exec mongodb mongosh -u root -p rootpassword
```

### Common Issues

**Port already in use:**
```bash
# Kill existing process on port 5000
lsof -i :5000 | xargs kill -9

# Or use different port
docker-compose -f docker-compose.yml -f docker-compose.override.yml up
# (create override file with custom ports)
```

**MongoDB connection refused:**
```bash
# Ensure MongoDB is running
docker-compose ps

# Check MongoDB logs
docker-compose logs mongodb

# Verify network
docker-compose exec backend ping mongodb
```

**Backend can't reach MongoDB:**
```bash
# Add network explicitly (usually not needed)
docker network create stackwise
docker-compose --network stackwise up
```

**Frontend returns 502 Bad Gateway:**
```bash
# Backend not responding — check backend health
docker-compose logs backend

# Verify Nginx config
docker-compose exec frontend cat /etc/nginx/nginx.conf
```

---

## Performance Tuning

### Resource Limits

Set memory/CPU limits to prevent runaway processes:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Caching

**Frontend:**
- Nginx caches static assets (1 year expiry)
- Gzip compression enabled
- Cloudflare or CDN recommended for production

**Backend:**
- In-memory rate-limit buckets
- Consider Redis for distributed rate limiting at scale
- MongoDB indexes on `email`, `created_at`

### Scaling

**Horizontal scaling (multiple backend instances):**
```yaml
services:
  backend:
    deploy:
      replicas: 3  # Swarm mode only
```

**Or use load balancer + multiple containers:**
```bash
docker-compose up -d --scale backend=3 backend
# (requires Network load balancer in front)
```

---

## Security Checklist

- [ ] Use strong MongoDB passwords (update `MONGO_ROOT_PASSWORD`)
- [ ] Store API keys in `.env` file (never commit)
- [ ] Use HTTPS in production (Caddy/Nginx with Let's Encrypt)
- [ ] Set `CORS_ORIGIN` to your domain (not `*`)
- [ ] Enable rate limiting on public endpoints
- [ ] Use secrets management (Docker Secrets, Kubernetes Secrets, AWS Secrets Manager)
- [ ] Regularly update base images (`docker pull node:20-alpine`)
- [ ] Scan images for vulnerabilities (`docker scan stackwise-backend`)
- [ ] Use read-only root filesystem (optional hardening)

---

## Maintenance

### Update Images

```bash
# Pull latest base images
docker pull node:20-alpine
docker pull nginx:alpine
docker pull mongo:7-alpine

# Rebuild
docker-compose build --no-cache

# Restart
docker-compose up -d
```

### Database Backups

```bash
# Dump MongoDB
docker-compose exec mongodb mongodump --out /backup
docker cp stackwise-mongodb:/backup ./backup-$(date +%Y%m%d)

# Restore MongoDB
docker cp ./backup-20260525 stackwise-mongodb:/restore
docker-compose exec mongodb mongorestore /restore
```

### Logs Rotation

Docker by default stores logs in `/var/lib/docker/containers/`. Set up rotation:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  }
}
```

(Add to `/etc/docker/daemon.json`, restart Docker)

---

## CI/CD with Docker

### GitHub Actions

```yaml
# .github/workflows/docker.yml
name: Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: ghcr.io/${{ github.repository }}/backend:latest
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Containers won't start | Check `.env` file, verify paths, inspect logs with `docker-compose logs` |
| MongoDB won't initialize | Wait 30s for startup, check password in `MONGO_ROOT_PASSWORD` |
| Frontend returns 404 | Verify Nginx config, check backend connectivity, view Nginx logs |
| Rate limiting too strict | Adjust limits in `backend/src/middleware/rateLimit.ts` |
| High memory usage | Set resource limits, check for memory leaks in app, enable swap |
| Persistent data loss | Verify volumes are mounted, check Docker disk space, backup regularly |
