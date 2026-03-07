---
name: add-migration
description: Create a new MikroORM database migration for schema changes in the learning platform. Use when a new entity is added, columns change, or indexes need to be added.
---

Create a MikroORM migration for: $ARGUMENTS

## Step 1 — Build First

Migrations use the compiled output, so build first:

```bash
npm run build
```

## Step 2 — Generate Migration

```bash
npx mikro-orm migration:create --name=<DescriptiveName>
```

The file will be created in `migrations/` with a timestamp prefix.

## Step 3 — Review and Fix the Generated SQL

Open the new migration file and verify:

- Table names match the entity `@Entity({ tableName: '...' })`
- All audit columns are present: `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`
- The schema used in MikroORM config is `learning` — check that columns are correct
- The `notDeleted` filter relies on `deleted_at` being nullable

A correct migration for a new entity looks like:

```typescript
import { Migration } from '@mikro-orm/migrations';

export class Migration20260101000000_AddFeature extends Migration {
   async up(): Promise<void> {
      this.addSql(`
         CREATE TABLE IF NOT EXISTS "learning"."features" (
            "id" SERIAL PRIMARY KEY,
            "name" VARCHAR(255) NOT NULL,
            "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "created_by" VARCHAR(255),
            "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            "updated_by" VARCHAR(255),
            "deleted_at" TIMESTAMPTZ,
            "deleted_by" VARCHAR(255)
         );
      `);
   }

   async down(): Promise<void> {
      this.addSql(`DROP TABLE IF EXISTS "learning"."features";`);
   }
}
```

## Step 4 — Test Locally

```bash
npx mikro-orm migration:up
```

Verify the table was created correctly in the database.

## Auto-Migration on Startup

The app runs migrations automatically on startup (`main.ts` → `DbMigrationService.runMigrations()`). The flow is:

1. Check if schema is current
2. If not: auto-generate a migration from entity diffs
3. Apply all pending migrations
4. Run seeders

**⚠️ If adding a new table:** You must add the table name to `includedTables` in `src/config/database/mikro-orm.config.ts` inside `CustomMigrationGenerator`. Otherwise the auto-migration generator will silently ignore your new entity.

```typescript
private includedTables = [
   // ...
   'your_new_table',
];
```

## Notes

- All migrations are transactional — if any statement fails, the whole migration rolls back
- Use `IF NOT EXISTS` / `IF EXISTS` where possible for idempotency
- Add indexes separately after the table creation if needed
- For adding columns to existing tables use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...`
