# AGENTS.md - NestJS Boilerplate

Guidance for AI agents (Claude, Codex, Gemini, Copilot, etc.) working in this repository.

## Recommended Workflow

Follow this cycle for every task:

```
Requirements -> Plan -> Task Breakdown -> Execute -> Verify
```

1. Plan first for medium/large tasks.
2. Break work into small units (`tasks.md` for larger sessions).
3. Execute one logical unit per diff.
4. Verify with typecheck/lint/tests as far as possible.
5. For long-running sessions, maintain `HANDOFF.md`.

## Git Rules

IMPORTANT: Do not execute `git commit` or `git push` automatically.

- Allowed read-only git: `git status`, `git diff`, `git log`, `git show`
- Allowed branch operations: `git branch`, `git checkout -b`
- Allowed temporary stashing: `git stash`
- Developer performs commit/push after reviewing the diff

## Project Summary

Reusable NestJS 10 + MikroORM 6 boilerplate with:
- Keycloak auth (`nest-keycloak-connect`) + API key guard (`x-api-key`)
- PostgreSQL/MySQL runtime switch
- Optional Redis/BullMQ queue stack
- Storage abstraction (`local`/`s3`)
- Mail abstraction (`console`/`sendgrid`/`smtp`/`ses`)
- Proxy module for service endpoint forwarding
- Centralized error handling and migration/seeding services

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 |
| Framework | NestJS 10 + TypeScript 5 |
| ORM | MikroORM 6 |
| Auth | Keycloak + API key guard |
| Validation | `class-validator` + `class-transformer` |
| API Docs | `@nestjs/swagger` |
| Logging | Winston + `winston-daily-rotate-file` |
| Testing | Jest + `ts-jest` |
| Container | Docker multi-stage + Compose |
| CI/CD | GitLab CI |

## Repository Layout

```
src/
|- main.ts
|- app.module.ts
|- app.controller.ts
|- auth/                          # Keycloak user-context endpoint(s)
|- attachment/                    # Upload/list/get/delete attachment metadata/files
|- queue/                         # BullMQ metrics and job endpoints
|- proxy/                         # Proxy endpoint forwarding
|- mail/                          # Mail providers and templating
|- storage/                       # Local/S3 storage driver abstraction
|- common/                        # Errors, guards, filters, decorators, enums
|- config/
|  |- auth/auth-config.module.ts  # Keycloak global guards registration
|  |- database/mikro-orm.config.ts
|  |- queue/redis/storage/throttle
|- database/
|  |- migrations/
|  |- seeders/
|- logging/
|- utils/
```

## Architectural Conventions

1. Controllers and services use `try/catch` and route errors via `ErrorHandlerService`.
2. Keep response shape consistent using `ApiResponse<T>`.
3. Prefer explicit DTOs for request/response.
4. Use Keycloak decorators from `nest-keycloak-connect` (`Public`, `Roles`, `AuthenticatedUser`).
5. Keep feature modules generic/template-safe; avoid domain-specific coupling.
6. Keep migration generation deterministic and review generated SQL.

## Auth Conventions (Keycloak)

- Global auth wiring lives in `src/config/auth/auth-config.module.ts`.
- Guards order:
  - `ThrottleGuard` (when enabled)
  - `ApiKeyGuard`
  - `AuthGuard`
  - `ResourceGuard`
  - `RoleGuard`
- Required API key env:
  - `API_KEY`
- Required env keys:
  - `KEYCLOAK_BASE_URL`
  - `KEYCLOAK_REALM`
  - `KEYCLOAK_CLIENT_ID`
- Optional env keys:
  - `KEYCLOAK_CLIENT_SECRET`
  - `KEYCLOAK_PUBLIC_KEY`

## Runtime and DB Commands

```bash
npm run start:dev
npm run build
npm run test
npm run test:cov
npm run lint
npm run typecheck
npm run db:migration:create
npm run db:migration:up
npm run db:migration:down
npm run db:seed
```

## Verification Policy

After each implementation task (when possible):
- `npm run typecheck`
- `npm run lint:check`
- relevant tests (`npm run test`, `npm run test:e2e` if applicable)
- include a manual verification checklist for flows that cannot be validated headlessly

## Skills

Project skills live under `.claude/skills`.

Primary reusable workflows:
- `add-module`
- `add-endpoint`
- `add-migration`
- `add-test`
- `review`
- `sort-imports`
- `handoff`
- `security-audit`
- `typescript-review`

## Key Files

- App root: `src/app.module.ts`
- Bootstrap: `src/main.ts`
- Auth config: `src/config/auth/auth-config.module.ts`
- Auth module: `src/auth`
- ORM config: `src/config/database/mikro-orm.config.ts`
- Migration service: `src/database/migrations/db-migration.service.ts`
- Error handling: `src/common/services/error-handler.service.ts`
- Queue: `src/queue`
- Storage: `src/storage`
- Mail: `src/mail`
