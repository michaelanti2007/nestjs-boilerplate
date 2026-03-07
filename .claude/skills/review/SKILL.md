---
name: review
description: Review the current git diff against project coding conventions. Use when asked to review changes, check code quality, or verify patterns before committing.
---

Review the current code changes for correctness and adherence to project conventions.

## Step 1 — Get the Diff

```bash
git diff HEAD
git diff --cached
git status
```

Read every changed file in full if needed to understand context.

## Step 2 — Check Against Project Rules

Read `AGENTS.md` for the full patterns. Then verify each changed file:

### Entity
- [ ] `@Entity({ tableName: '...' })` — no `schema:` in the decorator
- [ ] `@Filter` cond uses column name `deleted_at`, not field name `audit.deletedAt`
- [ ] `Auditable` embedded with `{ prefix: false }` only — no `nullable: true`
- [ ] New entity: table name added to `includedTables` in `mikro-orm.config.ts`
- [ ] New entity: `_NOT_FOUND` error code added in `error-code.enum.ts`
- [ ] New entity: error code mapped in `getErrorCodeForEntity()` in `db.util.ts`

### Service
- [ ] Extends `BaseService`
- [ ] `private readonly ctx = ServiceName.name` defined
- [ ] `private readonly log: Logger` initialized via `this.logger.getLogger()` in constructor
- [ ] Every method declares `const context = { label: this.ctx + '.methodName' }`
- [ ] Every method wrapped in `try { ... } catch(error) { throw this.errorHandler.handleServiceError(error, ServiceClass, '.method') }`
- [ ] Responses use `CommonUtils.serializeToDto()` — no raw entity returns
- [ ] Audit object uses `new Auditable()` then sets `.createdBy` / `.updatedBy` manually
- [ ] PATCH operations use `UpdateWrapper<T>`
- [ ] All writes wrapped in `this.runInTransaction(async (em) => { ... })`
- [ ] FK assignments use `em.getReference(Entity, id)` — no unnecessary loads

### Controller
- [ ] `@Version(ApiVersion.ONE)` on EVERY method — not on `@Controller()`
- [ ] `@Roles({ roles: [...] })` present — no `UseGuards(AuthGuard, ResourceGuard)`
- [ ] `ErrorHandlerService` injected in constructor
- [ ] Returns plain `{ statusCode, message, data }` literals — NOT `new ApiResponse(...)`
- [ ] List endpoints return `& { pagination: PaginationMeta }` intersection type
- [ ] Delete: `Promise<void>` + `@HttpCode(HttpStatus.NO_CONTENT)`
- [ ] Uses `user.sub` (not `user.preferred_username`) for audit fields
- [ ] `catch` calls `this.errorHandler.handleControllerError(error, ControllerClass, '.method')`

### Module
- [ ] Providers include `ErrorHandlerService` and `LoggingService`
- [ ] No `MikroOrmModule.forFeature([...])`
- [ ] New module registered in `src/app.module.ts`

### Code Style
- [ ] 3-space indentation (no 2 or 4)
- [ ] Single quotes everywhere
- [ ] No unused imports (these are lint errors)
- [ ] Lines ≤ 120 characters

## Step 3 — Run Lint

```bash
npm run lint
```

## Step 4 — Report

Summarize findings in this format:

**Violations** (must fix before committing):
- `src/path/to/file.ts:42` — description of issue and how to fix it

**Warnings** (worth noting):
- Any patterns that are unusual but not strictly wrong

**Looks Good**:
- Confirm which conventions are correctly followed
