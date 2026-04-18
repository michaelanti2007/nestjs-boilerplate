# NestJS Boilerplate

[![CI](https://github.com/bannaarr01/nestjs-boilerplate/actions/workflows/ci.yml/badge.svg)](https://github.com/bannaarr01/nestjs-boilerplate/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![NestJS](https://img.shields.io/badge/NestJS-11-ea2845.svg)](https://nestjs.com/)
[![Node](https://img.shields.io/badge/Node-%3E%3D22-brightgreen.svg)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

Production-ready NestJS starter with batteries included PostgreSQL/MySQL, optional Keycloak auth, Redis/BullMQ, S3/local storage, mail providers, request tracing, caching, monitoring, and more.

## Features

- **API Foundation** — CORS, validation pipes, URI versioning (`/api/v1`), Swagger UI
- **Authentication** — Optional Keycloak via `AUTH_PROVIDER=keycloak|none` + global API key guard
- **Database** — MikroORM with PostgreSQL/MySQL hot-switching, migrations, seeders
- **Queue** — Optional BullMQ backed by Redis with job management endpoints
- **Storage** — Local filesystem or S3 with signed URLs and attachment management
- **Mail** — Pluggable providers: console, SendGrid, SMTP, SES
- **Proxy** — JSON-configured service proxy with security hardening
- **Cache** — In-memory cache with `getOrSet` cache-aside pattern
- **Monitoring** — In-memory request/error metrics, slow endpoint tracking, cache hit/miss ratios
- **Request Tracing** — Correlation ID propagation via `AsyncLocalStorage` across logs and responses
- **Response Envelope** — Auto-wrapped `{ statusCode, message, data }` with `@UnwrapResponse()` opt-out
- **Error Handling** — Structured errors with `correlationId`, validation field details, custom error codes
- **Rate Limiting** — Global throttle guard with Redis support for multi-instance deployments
- **Graceful Shutdown** — `enableShutdownHooks()` for clean process termination
- **Quality Gates** — TypeScript strict mode, ESLint, Prettier, Jest unit + e2e tests, CI pipeline
- **AI Skills** — Built-in Claude/Codex skills for scaffolding modules, endpoints, migrations, tests
- **Custom MikroORM Migration Generator** with optional table include filtering and schema exclude filtering

## 1. Setup

```bash
git clone https://github.com/bannaarr01/nestjs-boilerplate.git
cd nestjs-boilerplate
cp .env.example .env
npm install
```

Git usage note:
- New projects should be independent repositories.
- You do not need to keep an active Git link to this boilerplate repo.

### 1.1 One-Time Skill Activation (Claude + Codex)

Project skills are stored in `.claude/skills`. To make them available in Codex as well, run once:

macOS/Linux:

```bash
bash scripts/setup-codex-skills.sh
```

Windows (PowerShell):

```powershell
pwsh -File .\scripts\setup-codex-skills.ps1
```

Included skills:
- `add-module`
- `add-endpoint`
- `add-migration`
- `add-test`
- `review`
- `handoff`
- `sort-imports`
- `typescript-review`
- `security-audit`

## 2. Docker Compose Profiles

Start only what you need:

```bash
# PostgreSQL only (minimal)
docker compose --profile postgres up -d

# PostgreSQL + Redis (queues, throttle, cache)
docker compose --profile postgres --profile redis up -d

# PostgreSQL + Redis + Keycloak (full auth)
docker compose --profile postgres --profile redis --profile keycloak up -d

# MySQL instead of PostgreSQL
docker compose --profile mysql up -d
```

## 3. Runtime Profile (Autowire)

Defaults:
- `DB_CLIENT=postgresql`
- `REDIS_ENABLED=false`
- `STORAGE_PROVIDER=local`
- `MAIL_PROVIDER=console`
- `AUTH_PROVIDER=none`

Set once (writes `.env` and optionally starts Docker services):

```bash
npm run setup:profile -- --db=postgres --schema=public --redis=off --storage=local --mail=console --auth=none --docker=on
npm run setup:profile -- --db=mysql --redis=on --storage=s3 --mail=smtp --auth=keycloak --docker=on
npm run setup:profile -- --db=postgres --schema=public --redis=off --storage=local --mail=ses --auth=none --docker=off
```

After that, run normally:

```bash
npm run start:dev
```

If you want ad-hoc override, you can still switch per command:

```bash
npm run start:dev -- --db=postgres --schema=public --redis=off --storage=local --mail=console --auth=none
npm run start:dev -- --db=mysql --redis=on --storage=s3 --mail=smtp --auth=keycloak
npm run start:dev -- --db=postgres --schema=public --redis=off --storage=local --mail=ses
```

| Option | Values |
|--------|--------|
| `--db` | `postgres`, `postgresql`, `pg`, `mysql`, `mariadb` |
| `--redis` | `on`, `off`, `true`, `false`, `1`, `0`, `yes`, `no` |
| `--storage` | `local`, `s3` |
| `--mail` | `console`, `sendgrid`, `smtp`, `ses` |
| `--auth` | `keycloak`, `none` |

Use standard DB env keys for both clients:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`
- `DB_SCHEMA` (required for PostgreSQL)
- Connection pool tuning (optional): `DB_POOL_MIN`, `DB_POOL_MAX`, `DB_POOL_ACQUIRE_TIMEOUT_MS`, `DB_POOL_CREATE_TIMEOUT_MS`, `DB_POOL_IDLE_TIMEOUT_MS`

DB connection notes:
- Local development should use `DB_HOST=127.0.0.1` (preferred over `localhost`).
- Startup wrapper reads `.env` from the project root explicitly.

## 4. Start

```bash
npm run start:dev
```

Startup validates security-critical env configuration and fails fast on invalid settings.

Open [http://localhost:8080/docs](http://localhost:8080/docs) for Swagger UI (when `SHOW_SWAGGER=true`).

### Key Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1` | Public | App info |
| `GET` | `/api/v1/healthz` | Public | Liveness check |
| `GET` | `/api/v1/readyz` | Public | Readiness check (DB + Redis) |
| `GET` | `/api/v1/auth/me` | Bearer | Current user (Keycloak) |
| `GET` | `/api/v1/secure` | Bearer + Role | Secured test endpoint |
| `GET` | `/api/v1/monitoring/metrics` | API Key | In-memory metrics snapshot |
| `POST` | `/api/v1/attachments` | Bearer | Upload file |
| `GET` | `/api/v1/attachments/entity/:entityType/:entityId` | Bearer | List entity attachments |
| `GET` | `/api/v1/attachments/:id` | Bearer | Get attachment by id |
| `DELETE` | `/api/v1/attachments/:id` | Bearer | Delete attachment |
| `GET` | `/api/v1/queue/health` | Public | Queue health |
| `GET` | `/api/v1/queue/metrics` | API Key | Queue metrics |
| `GET` | `/api/v1/queue/queues` | API Key | List queues |
| `GET` | `/api/v1/queue/queues/types` | API Key | Queue types |
| `GET` | `/api/v1/queue/queues/:queueType/status` | API Key | Queue status |
| `GET` | `/api/v1/queue/jobs/active` | API Key | Active jobs |
| `GET` | `/api/v1/queue/jobs/failed` | API Key | Failed jobs |
| `POST` | `/api/v1/queue/jobs/demo` | API Key | Enqueue demo job |
| `GET` | `/api/v1/queue/jobs/:jobId` | API Key | Get job by id |

## 5. Migration Behavior

- App startup runs pending migrations when `RUN_MIGRATIONS_ON_BOOT=true`.
- Expensive schema-diff validation is now opt-in with:
  - `DB_VERIFY_MIGRATION_DIFF=true`
- MySQL migrations run without forced transaction wrapping (`transactional/allOrNothing` disabled for MySQL).
- PostgreSQL requires an explicit schema via:
  - `--schema=<schema>` command option, or
  - `DB_SCHEMA` environment variable.
- Migration SQL generation can be filtered with:
  - `DB_MIGRATION_INCLUDED_TABLES` (comma-separated allow-list)
  - `DB_MIGRATION_EXCLUDED_SCHEMAS` (comma-separated block-list)

DB commands:

```bash
npm run db:migration:create -- --db=postgres --schema=public
npm run db:migration:up -- --db=mysql
npm run db:migration:down -- --db=mysql
npm run db:seed -- --db=postgres --schema=public
```

## 6. Proxy / Mail / Storage Configuration

- `PROXY_SERVICES_JSON`: service + endpoint map consumed by `ProxyService`
- Proxy hardening defaults:
  - `PROXY_ALLOW_BASE_URL_OVERRIDE=false`
  - `PROXY_ALLOW_DYNAMIC_CONFIG=false`
  - `PROXY_ALLOW_PRIVATE_IPS=false`
  - `PROXY_MAX_REDIRECTS=0`
- `MAIL_PROVIDER`: selects provider implementation
  - SES uses `EMAIL_SOURCE` (or fallback `MAIL_FROM_ADDRESS`) and AWS creds/region envs
  - SES requires `@aws-sdk/client-ses` installed in the project (`npm install @aws-sdk/client-ses`)
- `STORAGE_PROVIDER`: selects driver implementation
- `REDIS_ENABLED=true` enables BullMQ queue endpoints (Redis key/value controller is intentionally not exposed)
- `QUEUE_GENERAL_NAME` controls default queue name for demo/metrics endpoints
- `AttachmentModule` uses `StorageService` for upload/delete/signed URL handling
- Local attachment URLs are HMAC-signed; configure:
  - `ATTACHMENT_URL_SIGNING_SECRET`
- Multer storage mode is configurable: `ATTACHMENT_UPLOAD_STORAGE=memory|disk`

## 7. Throttle (Default)

- Global throttle guard is enabled by default.
- Defaults:
  - production-like: `100 requests / 60 seconds`
  - development: disabled (`THROTTLE_DEV_LIMIT=0`)
- When `REDIS_ENABLED=true`, throttle counters use Redis (`THROTTLE_USE_REDIS=true`) for multi-instance consistency.
- Endpoint-specific throttling example:
  - `POST /api/v1/queue/jobs/demo` uses `5 requests in 1 minute`.

## 8. Error Handling Convention

- Controllers: `try/catch` + `errorHandler.handleControllerError(...)`
- Services: `try/catch` + `throw errorHandler.handleServiceError(...)`
- All error responses include `correlationId` for request tracing
- Validation errors return `VALIDATION_FAILED` error code with `details.fields[]` for field-level issues

Reference files:
- `src/common/services/error-handler.service.ts`
- `src/common/decorators/api-ops.decorator.ts`
- `src/common/filters/all-exceptions.filter.ts`

## 9. Project Structure

```
src/
  app.module.ts              # Root module
  main.ts                    # Bootstrap + middleware
  auth/                      # Keycloak auth (optional)
  attachment/                # File upload/download
  cache/                     # Cache-aside service
  monitoring/                # In-memory metrics
  queue/                     # BullMQ job management
  mail/                      # Multi-provider mail
  proxy/                     # Service proxy
  storage/                   # Local/S3 storage
  logging/                   # Winston + correlation ID + request context
  common/
    decorators/              # @ApiOperationAndResponses, @WrapResponse, etc.
    filters/                 # Global exception filter
    guards/                  # API key guard, throttle
    interceptors/            # Request context, response envelope
    services/                # Error handler
    enums/                   # Error codes, API versions
    classes/                 # CustomError
    types/                   # Exception filter types
```

## 10. Quality

```bash
npm run typecheck        # TypeScript strict check
npm run lint:check       # ESLint (zero warnings)
npm run test             # Jest unit tests
npm run test:e2e         # E2E tests
npm run test:cov         # Coverage report
npm run quality:check    # All of the above
npm run build:app        # Production build
```

## 11. Environment Variables

See [`.env.example`](./.env.example) for the full reference. Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `AUTH_PROVIDER` | `none` | `keycloak` or `none` |
| `DB_CLIENT` | `postgresql` | `postgresql`, `mysql`, `mariadb` |
| `REDIS_ENABLED` | `false` | Enable Redis + BullMQ |
| `STORAGE_PROVIDER` | `local` | `local` or `s3` |
| `MAIL_PROVIDER` | `console` | `console`, `sendgrid`, `smtp`, `ses` |
| `SHOW_SWAGGER` | `true` | Toggle Swagger UI at `/docs` |
| `CACHE_TTL_DEFAULT` | `300` | Default cache TTL in seconds |
| `SLOW_API_THRESHOLD_MS` | `3000` | Slow request threshold for monitoring |

## 12. Documentation

Full guides in the [`docs/`](./docs/README.md) folder:

- [Quick Start](./docs/quick-start.md)
- [Runtime Profiles](./docs/runtime-profiles.md)
- [Architecture Overview](./docs/architecture.md)
- [API Conventions](./docs/api-conventions.md)
- [Security Guide](./docs/security.md)
- [Database & Migrations](./docs/database-migrations.md)
- [Redis & Queue](./docs/redis-queue.md)
- [Storage & Attachments](./docs/storage-attachments.md)
- [Mail Module](./docs/mail-module.md)
- [Proxy Module](./docs/proxy-module.md)
- [Operations & Deployment](./docs/operations.md)
- [Testing & Quality](./docs/testing-quality.md)
- [Troubleshooting](./docs/troubleshooting.md)
- [AI Skills & Agent Usage](./docs/skills-and-agents.md)

## 13. Agent Rules

See [AGENTS.md](./AGENTS.md) for:
- Permission mode policy
- Plan -> execute -> verify workflow
- Git safety rules (`no commit/push` by agent)
- Context and handoff guidance

## Contributing

Contributions are welcome! Please read the [Contributing Guide](./CONTRIBUTING.md) before submitting a PR.

## License

[MIT](./LICENSE)
