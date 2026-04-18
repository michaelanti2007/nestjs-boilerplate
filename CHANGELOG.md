# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2025-06-01

### Added

- NestJS 11 bootstrap with CORS, validation pipes, URI versioning, Swagger UI
- Optional Keycloak authentication via `AUTH_PROVIDER=keycloak|none`
- Global API key guard (`x-api-key` header)
- MikroORM with PostgreSQL/MySQL hot-switching support
- Migration and seeder services with custom migration generator
- Optional Redis/BullMQ queue module with job management endpoints
- Storage module with local filesystem and S3 providers
- Attachment module with upload, list, get, delete, and signed URLs
- Mail module with console, SendGrid, SMTP, and SES providers
- Proxy module with JSON-configured service map and security hardening
- Cache module with `@nestjs/cache-manager` and `getOrSet` cache-aside pattern
- In-memory monitoring module (request/error counts, slow endpoints, cache stats)
- Correlation ID tracing via `AsyncLocalStorage` across logs and responses
- Response envelope interceptor with `@UnwrapResponse()` / `@WrapResponse()` decorators
- Enhanced exception filter with `correlationId`, `VALIDATION_FAILED` error code, field-level details
- Global throttle guard with Redis support for multi-instance consistency
- Graceful shutdown hooks
- Winston logging with daily rotation and correlation ID prefix
- Docker Compose with profiles for PostgreSQL, MySQL, Redis, Keycloak
- Runtime profile system (`setup:profile`) for quick environment configuration
- CI pipeline (GitHub Actions) with typecheck, lint, unit tests, e2e tests
- AI skills for Claude Code and Codex (add-module, add-endpoint, add-migration, add-test, review)
- Comprehensive documentation in `docs/`
