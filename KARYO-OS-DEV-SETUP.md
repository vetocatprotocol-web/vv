# KARYO OS — Development Setup Guide

## Dari Nol ke Running dalam 15 Menit

---

## 📋 Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| **Node.js** | ≥ 20 LTS | `nvm install 20` |
| **npm** | ≥ 10 | Included with Node.js |
| **Docker** | ≥ 24 | [docker.com/get-docker](https://docker.com/get-docker) |
| **Docker Compose** | ≥ 2.20 | Included with Docker Desktop |
| **Git** | ≥ 2.40 | `apt install git` |

Optional:
- **Postman/Insomnia** — untuk test API
- **pgAdmin** — untuk inspect database
- **Redis Insight** — untuk inspect Redis

---

## 🚀 Quick Start (5 Commands)

```bash
# 1. Clone
git clone https://github.com/your-org/karyo-os.git
cd karyo-os

# 2. Setup environment
cp .env.example .env

# 3. Start infrastructure (PostgreSQL + Redis)
docker compose up -d

# 4. Install dependencies
npm install

# 5. Setup database & run
npm run db:migrate
npm run db:seed
npm run dev
```

**Done!** Open http://localhost:3000

---

## 📁 Project Structure

```
karyo-os/
├── apps/
│   ├── web/                    # Next.js — User Dashboard
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   ├── components/     # React components
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── stores/         # Zustand stores
│   │   │   ├── lib/            # Utilities
│   │   │   └── types/          # TypeScript types
│   │   ├── public/
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   ├── admin/                  # Next.js — Admin Dashboard
│   │   └── (same structure as web)
│   │
│   └── api/                    # NestJS — Backend API
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/       # Authentication
│       │   │   ├── users/      # User management
│       │   │   ├── workspaces/ # Workspace management
│       │   │   ├── tasks/      # Task CRUD & execution
│       │   │   ├── agents/     # Agent management
│       │   │   ├── files/      # File storage
│       │   │   ├── memory/     # AI memory
│       │   │   ├── integrations/ # External services
│       │   │   ├── billing/    # Subscription & usage
│       │   │   ├── command/    # Command interpreter (AI router)
│       │   │   ├── orchestrator/ # Core orchestrator
│       │   │   └── realtime/   # WebSocket gateway
│       │   ├── common/         # Shared utilities
│       │   ├── config/         # Configuration
│       │   ├── database/       # DB connection & migrations
│       │   ├── queue/          # BullMQ workers
│       │   └── main.ts         # Entry point
│       ├── test/
│       ├── package.json
│       ├── nest-cli.json
│       └── tsconfig.json
│
├── packages/
│   ├── ai-core/                # AI logic (LangChain + LangGraph)
│   │   ├── src/
│   │   │   ├── chains/         # LangChain chains
│   │   │   ├── graphs/         # LangGraph workflows
│   │   │   ├── providers/      # OpenRouter, etc.
│   │   │   ├── router/         # Model routing logic
│   │   │   ├── context/        # Context builder
│   │   │   ├── prompts/        # Prompt templates
│   │   │   ├── memory/         # Memory operations
│   │   │   └── validators/     # Output validation
│   │   └── package.json
│   │
│   ├── sdk/                    # API client for frontend
│   │   ├── src/
│   │   │   ├── client.ts       # HTTP client
│   │   │   ├── auth.ts         # Auth API
│   │   │   ├── tasks.ts        # Tasks API
│   │   │   ├── agents.ts       # Agents API
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── types/                  # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── api.ts          # API request/response types
│   │   │   ├── models.ts       # Database model types
│   │   │   ├── events.ts       # WebSocket event types
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ui/                     # Shared UI components
│   │   ├── src/
│   │   │   ├── components/     # Button, Input, Modal, etc.
│   │   │   ├── hooks/
│   │   │   └── styles/
│   │   └── package.json
│   │
│   ├── utils/                  # Shared utilities
│   │   ├── src/
│   │   │   ├── date.ts
│   │   │   ├── format.ts
│   │   │   ├── validation.ts
│   │   │   └── crypto.ts
│   │   └── package.json
│   │
│   └── config/                 # Shared config (ESLint, TS, etc.)
│       ├── eslint/
│       ├── tsconfig/
│       └── package.json
│
├── infra/
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.web
│   │   └── Dockerfile.admin
│   ├── k8s/
│   │   ├── api-deployment.yaml
│   │   ├── web-deployment.yaml
│   │   └── ingress.yaml
│   └── scripts/
│       ├── setup.sh
│       └── seed.ts
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── turbo.json
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🐳 Docker Compose (Development)

### `docker-compose.yml`

```yaml
version: '3.8'

services:
  # ═══════════════════════════════════════════
  # PostgreSQL
  # ═══════════════════════════════════════════
  postgres:
    image: pgvector/pgvector:pg15
    container_name: karyo-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: karyo_dev
      POSTGRES_USER: karyo
      POSTGRES_PASSWORD: karyo_dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U karyo -d karyo_dev"]
      interval: 5s
      timeout: 5s
      retries: 5

  # ═══════════════════════════════════════════
  # Redis
  # ═══════════════════════════════════════════
  redis:
    image: redis:7-alpine
    container_name: karyo-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  # ═══════════════════════════════════════════
  # MinIO (S3-compatible storage for dev)
  # ═══════════════════════════════════════════
  minio:
    image: minio/minio:latest
    container_name: karyo-minio
    restart: unless-stopped
    environment:
      MINIO_ROOT_USER: karyo_minio
      MINIO_ROOT_PASSWORD: karyo_minio_password
    ports:
      - "9000:9000"     # API
      - "9001:9001"     # Console
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

  # ═══════════════════════════════════════════
  # Mailhog (Email testing)
  # ═══════════════════════════════════════════
  mailhog:
    image: mailhog/mailhog:latest
    container_name: karyo-mailhog
    restart: unless-stopped
    ports:
      - "1025:1025"     # SMTP
      - "8025:8025"     # Web UI

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

---

## ⚙ Environment Variables

### `.env.example`

```bash
# ═══════════════════════════════════════════
# DATABASE
# ═══════════════════════════════════════════
DATABASE_URL=postgresql://karyo:karyo_dev_password@localhost:5432/karyo_dev

# ═══════════════════════════════════════════
# REDIS
# ═══════════════════════════════════════════
REDIS_URL=redis://localhost:6379

# ═══════════════════════════════════════════
# OBJECT STORAGE (MinIO for dev, R2/S3 for prod)
# ═══════════════════════════════════════════
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_BUCKET=karyo-dev
S3_ACCESS_KEY=karyo_minio
S3_SECRET_KEY=karyo_minio_password
S3_FORCE_PATH_STYLE=true

# ═══════════════════════════════════════════
# AI / OPENROUTER
# ═══════════════════════════════════════════
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# ═══════════════════════════════════════════
# AUTH
# ═══════════════════════════════════════════
JWT_SECRET=your-jwt-secret-min-32-chars-long
JWT_REFRESH_SECRET=your-refresh-secret-min-32
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# ═══════════════════════════════════════════
# EMAIL (Mailhog for dev)
# ═══════════════════════════════════════════
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@karyo-os.com

# ═══════════════════════════════════════════
# APP
# ═══════════════════════════════════════════
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001
WEB_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# ═══════════════════════════════════════════
# BILLING (Stripe — test mode)
# ═══════════════════════════════════════════
STRIPE_SECRET_KEY=sk_test_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRICE_PRO=price_pro_monthly_id
STRIPE_PRICE_ENTERPRISE=price_enterprise_monthly_id

# ═══════════════════════════════════════════
# OPTIONAL: GOOGLE OAUTH
# ═══════════════════════════════════════════
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3001/api/v1/integrations/google/callback
```

---

## 🗄 Database Setup

### Run Migrations

```bash
# Run all migrations
npm run db:migrate

# Check migration status
npm run db:migrate:status

# Rollback last migration
npm run db:migrate:rollback
```

### Seed Development Data

```bash
# Seed database with sample data
npm run db:seed

# This creates:
# - 3 test users (admin, user, viewer)
# - 2 workspaces (personal + team)
# - 5 sample tasks (various statuses)
# - 5 system agents
# - 3 sample files
# - 10 memory entries
```

### Connect to Database

```bash
# Via Docker
docker exec -it karyo-postgres psql -U karyo -d karyo_dev

# Or via connection string
psql postgresql://karyo:karyo_dev_password@localhost:5432/karyo_dev
```

### Useful Queries

```sql
-- Check all tables
\dt

-- Check table structure
\d tasks

-- Check RLS policies
SELECT * FROM pg_policies;

-- Check active tasks
SELECT id, title, status, type, created_at FROM tasks WHERE status = 'running';

-- Check AI costs
SELECT DATE(created_at) as date, SUM(cost_usd) as total_cost
FROM usage_records
WHERE resource_type = 'ai_task'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🏃 Running the Application

### Development Mode (All Services)

```bash
# Start everything (uses Turborepo)
npm run dev

# This runs in parallel:
# - apps/web      → http://localhost:3000
# - apps/admin    → http://localhost:3002
# - apps/api      → http://localhost:3001
# - queue workers → background
```

### Run Individual Services

```bash
# API only
npm run dev --filter=@karyo/api

# Web only
npm run dev --filter=@karyo/web

# Admin only
npm run dev --filter=@karyo/admin

# Queue workers only
npm run dev:workers
```

### Production Build

```bash
# Build all packages
npm run build

# Run production
npm run start

# Docker production build
docker compose -f docker-compose.prod.yml up -d
```

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests for specific package
npm run test --filter=@karyo/api

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run specific test file
npm run test -- --testPathPattern="auth.service.spec"
```

### Test Accounts (Seeded)

| Email | Password | Role | Workspace |
|-------|----------|------|-----------|
| `admin@karyo.dev` | `admin123` | admin | Tim Marketing |
| `user@karyo.dev` | `user123` | user | Tim Marketing |
| `viewer@karyo.dev` | `viewer123` | viewer | Tim Marketing |

---

## 🔧 Common Commands

```bash
# ═══════════════════════════════════════════
# Development
# ═══════════════════════════════════════════
npm run dev                  # Start all services
npm run build                # Build all packages
npm run lint                 # Lint all code
npm run format               # Format with Prettier
npm run typecheck            # TypeScript check

# ═══════════════════════════════════════════
# Database
# ═══════════════════════════════════════════
npm run db:migrate           # Run migrations
npm run db:migrate:rollback  # Rollback migration
npm run db:seed              # Seed data
npm run db:studio            # Open Drizzle Studio (DB GUI)
npm run db:generate          # Generate new migration

# ═══════════════════════════════════════════
# Docker
# ═══════════════════════════════════════════
docker compose up -d         # Start infrastructure
docker compose down          # Stop infrastructure
docker compose logs -f       # View logs
docker compose down -v       # Stop + delete volumes (reset DB)

# ═══════════════════════════════════════════
# Testing
# ═══════════════════════════════════════════
npm run test                 # Unit tests
npm run test:watch           # Watch mode
npm run test:coverage        # Coverage report
npm run test:e2e             # End-to-end tests

# ═══════════════════════════════════════════
# AI / Workers
# ═══════════════════════════════════════════
npm run dev:workers          # Start queue workers
npm run dev:ai               # Start AI service standalone
```

---

## 🐛 Debugging

### API Debugging

```bash
# Enable debug logs
DEBUG=karyo:* npm run dev --filter=@karyo/api

# Specific module
DEBUG=karyo:orchestrator,karyo:agent npm run dev --filter=@karyo/api
```

### VS Code Launch Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug API",
      "type": "node",
      "request": "launch",
      "runtimeArgs": ["-r", "ts-node/register"],
      "args": ["apps/api/src/main.ts"],
      "cwd": "${workspaceFolder}",
      "env": {
        "NODE_ENV": "development"
      },
      "restart": true,
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npx",
      "args": ["jest", "--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Common Issues

| Problem | Solution |
|---------|----------|
| `ECONNREFUSED` on port 5432 | `docker compose up -d postgres` |
| `ECONNREFUSED` on port 6379 | `docker compose up -d redis` |
| Migration fails | Check `DATABASE_URL`, ensure pgvector extension installed |
| AI calls fail | Check `OPENROUTER_API_KEY` in `.env` |
| File upload fails | Check MinIO is running: `docker compose ps` |
| WebSocket not connecting | Check `CORS_ORIGIN` matches frontend URL |
| Module not found | Run `npm install` again, clear `node_modules` |
| TypeScript errors | Run `npm run typecheck` for detailed errors |

### Reset Everything

```bash
# Nuclear option — full reset
docker compose down -v
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

---

## 📦 Turborepo Configuration

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {},
    "typecheck": {},
    "db:migrate": {
      "cache": false
    },
    "db:seed": {
      "cache": false
    }
  }
}
```

---

## 🚢 Deployment Checklist

Before deploying to production:

- [ ] All tests passing (`npm run test`)
- [ ] TypeScript clean (`npm run typecheck`)
- [ ] Lint clean (`npm run lint`)
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Docker images built
- [ ] SSL certificates configured
- [ ] CORS origins set correctly
- [ ] Rate limiting configured
- [ ] Monitoring (Prometheus/Grafana) set up
- [ ] Error tracking (Sentry) configured
- [ ] Backup strategy verified

---

**🚀 Sekarang developer bisa langsung mulai coding!**
