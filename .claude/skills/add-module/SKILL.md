---
name: add-module
description: Scaffold a complete NestJS feature module for this learning platform — entity, DTOs, service, controller, module file, error code registration, and migration reminder. Use when asked to add a new feature, resource, or domain module.
---

Scaffold a complete NestJS feature module for the learning platform. The module name is: $ARGUMENTS

Read AGENTS.md first for the exact patterns. Then follow these steps:

## Step 1 — Read Existing Code for Reference

Before generating anything, read one existing module to confirm conventions:
- `src/questionnaire/questionnaire.controller.ts`
- `src/questionnaire/questionnaire.service.ts`
- `src/questionnaire/questionnaire.module.ts`
- `src/questionnaire/entities/questionnaire.entity.ts`

## Step 2 — Scaffold with NestJS CLI

```bash
npx nest g resource <name> --no-spec
```

This generates controller, service, module, and DTOs. We will rewrite each to match project patterns.

## Step 3 — Entity

File: `src/<name>/entities/<name>.entity.ts`

```typescript
import { Entity, PrimaryKey, Property, Embedded, Filter } from '@mikro-orm/core';
import { Auditable } from '../../shared/classes/audit.embeddable';

@Entity({ tableName: '<plural_table_name>' })   // NO schema: here
@Filter({
   name: 'notDeleted',
   cond: { deleted_at: null },   // use column name deleted_at, not field name
   default: true
})
export class Feature {
   @PrimaryKey()
   id!: number;

   @Property({ length: 255 })
   name!: string;

   @Embedded(() => Auditable, { prefix: false })   // no nullable: true
   audit!: Auditable;
}
```

## Step 4 — Add Table to Auto-Migration Whitelist

**This step is required — without it, the auto-migration will never create your table.**

Open `src/config/database/mikro-orm.config.ts` and add your table name to `includedTables` inside `CustomMigrationGenerator`:

```typescript
private includedTables = [
   // ... existing tables ...
   '<plural_table_name>',   // add your new table here
];
```

The app auto-generates and applies migrations on startup using `DbMigrationService`. It only processes tables in this list. New tables not listed here are silently ignored.

## Step 5 — Register Error Code in TWO places

**`src/shared/enums/error-code.enum.ts`** — add under "Resource Not Found":
```typescript
FEATURE_NOT_FOUND = 'FEATURE_NOT_FOUND',
```

**`src/utils/db.util.ts`** — add to `getErrorCodeForEntity` map:
```typescript
'Feature': ErrorCode.FEATURE_NOT_FOUND,
```

Both must be updated so `findOrFail()` returns the right error code.

## Step 6 — Query DTO

File: `src/<name>/dto/get-<name>s.dto.ts`

```typescript
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApiFilter } from '../../utils/filtering.util';   // has limit, offset, isDescByCreatedAt

export class GetFeaturesDto extends ApiFilter {
   @IsOptional()
   @ApiPropertyOptional()
   @IsString()
   name?: string;
}
```

Never define `limit`, `offset`, or `isDescByCreatedAt` directly — always extend `ApiFilter`.

## Step 7 — Response DTO

File: `src/<name>/dto/<name>-response.dto.ts`

Use `@Expose()` on every field you want to include in the response (class-transformer).

## Step 8 — Service

File: `src/<name>/<name>.service.ts`

```typescript
import { Logger } from 'winston';
import { CommonUtils } from '../utils/common.util';
import { PaginationMeta } from '../utils/api.util';
import { UpdateWrapper } from '../utils/update-wrapper.util';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { LoggingService } from '../logging/logging.service';
import { CustomError } from '../shared/classes/custom-error';
import { BaseService } from '../shared/services/base.service';
import { Auditable } from '../shared/classes/audit.embeddable';
import { ErrorHandlerService } from '../shared/services/error-handler.service';
import { QueryOrder } from '@mikro-orm/core';

@Injectable()
export class FeatureService extends BaseService {
   private readonly ctx = FeatureService.name;
   private readonly log: Logger;

   constructor(
      private readonly logger: LoggingService,
      protected readonly entityManager: EntityManager,
      protected readonly errorHandler: ErrorHandlerService,
   ) {
      super(entityManager, errorHandler);
      this.log = this.logger.getLogger();
   }

   async getAll(filters: GetFeaturesDto) {
      const context = { label: this.ctx + '.getAll' };
      try {
         this.log.info('Fetching features', context);
         const { isDescByCreatedAt, limit, offset } = filters;
         const qb = this.entityManager.qb(Feature, 'f');
         const total = await qb.clone().count('f.id', true);
         qb.orderBy({ 'f.created_at': isDescByCreatedAt ? QueryOrder.DESC : QueryOrder.ASC });
         qb.limit(limit).offset(offset);
         const features = await qb.getResultList();
         const data = CommonUtils.serializeToDto(FeatureResponseDto, features) as FeatureResponseDto[];
         const pagination = new PaginationMeta(data.length, total, limit, offset);
         return { data, pagination };
      } catch (error) {
         throw this.errorHandler.handleServiceError(error, FeatureService, '.getAll');
      }
   }

   async getOne(id: number) {
      const context = { label: this.ctx + '.getOne' };
      try {
         const feature = await this.findOrFail(Feature, { id });
         return CommonUtils.serializeToDto(FeatureResponseDto, feature) as FeatureResponseDto;
      } catch (error) {
         throw this.errorHandler.handleServiceError(error, FeatureService, '.getOne');
      }
   }

   async create(dto: CreateFeatureDto, createdBy: string) {
      const context = { label: this.ctx + '.create' };
      try {
         return await this.runInTransaction(async (em) => {
            const audit = new Auditable();
            audit.createdBy = createdBy;
            const feature = em.create(Feature, { ...dto, audit });
            await em.persistAndFlush(feature);
            this.log.info(`Feature created: ${feature.id}`, context);
            return CommonUtils.serializeToDto(FeatureResponseDto, feature) as FeatureResponseDto;
         });
      } catch (error) {
         throw this.errorHandler.handleServiceError(error, FeatureService, '.create');
      }
   }

   async update(id: number, dto: UpdateFeatureDto, updatedBy: string) {
      const context = { label: this.ctx + '.update' };
      try {
         return await this.runInTransaction(async (em) => {
            const feature = await this.findOrFail(Feature, { id }, em);
            new UpdateWrapper(feature)
               .updateStringField('name', dto.name);
            feature.audit.updatedAt = new Date();
            feature.audit.updatedBy = updatedBy;
            await em.flush();
            return CommonUtils.serializeToDto(FeatureResponseDto, feature) as FeatureResponseDto;
         });
      } catch (error) {
         throw this.errorHandler.handleServiceError(error, FeatureService, '.update');
      }
   }

   async remove(id: number, deletedBy: string) {
      const context = { label: this.ctx + '.remove' };
      try {
         await this.runInTransaction(async (em) => {
            const feature = await this.findOrFail(Feature, { id }, em);
            this.markAsDeleted(feature, deletedBy);
            await em.flush();
            this.log.info(`Feature soft-deleted: ${id}`, context);
         });
      } catch (error) {
         throw this.errorHandler.handleServiceError(error, FeatureService, '.remove');
      }
   }
}
```

## Step 9 — Controller

File: `src/<name>/<name>.controller.ts`

```typescript
import {
   Get, Post, Body, Patch, Query, Param, Delete,
   Version, HttpCode, Controller, HttpStatus, ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles, AuthenticatedUser } from 'nest-keycloak-connect';
import { ApiVersion } from '../shared/enums/api-version.enum';
import { AuthUser } from '../shared/interfaces/authenticated-user.interface';
import { ErrorHandlerService } from '../shared/services/error-handler.service';
import { ApiOperationAndResponses, ApiResponse, PaginationMeta } from '../utils/api.util';

@ApiTags('Features')
@Controller('features')
@ApiBearerAuth()
export class FeatureController {
   constructor(
      private readonly featureService: FeatureService,
      private readonly errorHandler: ErrorHandlerService,
   ) {}

   @Post()
   @Version(ApiVersion.ONE)
   @HttpCode(HttpStatus.CREATED)
   @Roles({ roles: ['realm:admin'] })
   @ApiOperationAndResponses({
      summary: 'Create a new feature',
      description: 'Create a new feature.',
      responseDescriptions: {
         [HttpStatus.CREATED]: 'Feature created successfully',
         [HttpStatus.BAD_REQUEST]: 'Invalid input',
         [HttpStatus.UNAUTHORIZED]: 'Authentication failed',
         [HttpStatus.CONFLICT]: 'Feature already exists',
      },
   })
   async createFeature(
      @Body() dto: CreateFeatureDto,
      @AuthenticatedUser() user: AuthUser,
   ): Promise<ApiResponse<FeatureResponseDto>> {
      try {
         const data = await this.featureService.create(dto, user.sub);
         return { statusCode: HttpStatus.CREATED, message: 'Feature created successfully', data };
      } catch (error) {
         this.errorHandler.handleControllerError(error, FeatureController, '.createFeature');
      }
   }

   @Get()
   @Version(ApiVersion.ONE)
   @Roles({ roles: ['realm:admin', 'realm:student'] })
   @ApiOperationAndResponses({
      summary: 'Get all features',
      responseDescriptions: {
         [HttpStatus.OK]: 'Returns feature list',
         [HttpStatus.UNAUTHORIZED]: 'Authentication failed',
      },
   })
   async getFeatures(
      @Query() query: GetFeaturesDto,
   ): Promise<ApiResponse<FeatureResponseDto[]> & { pagination: PaginationMeta }> {
      try {
         const { data, pagination } = await this.featureService.getAll(query);
         return { statusCode: HttpStatus.OK, message: 'OK', data, pagination };
      } catch (error) {
         this.errorHandler.handleControllerError(error, FeatureController, '.getFeatures');
      }
   }

   @Get(':id')
   @Version(ApiVersion.ONE)
   @Roles({ roles: ['realm:admin', 'realm:student'] })
   @ApiOperationAndResponses({
      summary: 'Get feature by ID',
      responseDescriptions: {
         [HttpStatus.OK]: 'Returns the feature',
         [HttpStatus.NOT_FOUND]: 'Feature not found',
         [HttpStatus.UNAUTHORIZED]: 'Authentication failed',
      },
   })
   async getFeatureById(
      @Param('id', ParseIntPipe) id: number,
   ): Promise<ApiResponse<FeatureResponseDto>> {
      try {
         const data = await this.featureService.getOne(id);
         return { statusCode: HttpStatus.OK, message: 'OK', data };
      } catch (error) {
         this.errorHandler.handleControllerError(error, FeatureController, '.getFeatureById');
      }
   }

   @Patch(':id')
   @Version(ApiVersion.ONE)
   @Roles({ roles: ['realm:admin'] })
   @ApiOperationAndResponses({
      summary: 'Update a feature',
      responseDescriptions: {
         [HttpStatus.OK]: 'Feature updated successfully',
         [HttpStatus.NOT_FOUND]: 'Feature not found',
         [HttpStatus.UNAUTHORIZED]: 'Authentication failed',
      },
   })
   async updateFeature(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateFeatureDto,
      @AuthenticatedUser() user: AuthUser,
   ): Promise<ApiResponse<FeatureResponseDto>> {
      try {
         const data = await this.featureService.update(id, dto, user.sub);
         return { statusCode: HttpStatus.OK, message: 'Feature updated successfully', data };
      } catch (error) {
         this.errorHandler.handleControllerError(error, FeatureController, '.updateFeature');
      }
   }

   @Delete(':id')
   @Version(ApiVersion.ONE)
   @HttpCode(HttpStatus.NO_CONTENT)
   @Roles({ roles: ['realm:admin'] })
   @ApiOperationAndResponses({
      summary: 'Delete a feature',
      description: 'Soft-delete a feature by ID.',
      responseDescriptions: {
         [HttpStatus.NO_CONTENT]: 'Feature deleted successfully',
         [HttpStatus.NOT_FOUND]: 'Feature not found',
         [HttpStatus.UNAUTHORIZED]: 'Authentication failed',
      },
   })
   async deleteFeature(
      @Param('id', ParseIntPipe) id: number,
      @AuthenticatedUser() user: AuthUser,
   ): Promise<void> {
      try {
         await this.featureService.remove(id, user.sub);
      } catch (error) {
         this.errorHandler.handleControllerError(error, FeatureController, '.deleteFeature');
      }
   }
}
```

Key controller rules:
- `@Version(ApiVersion.ONE)` on EVERY method — NOT in the `@Controller()` decorator
- NO `UseGuards` — auth is via `@Roles({ roles: [...] })`
- `ErrorHandlerService` injected in constructor
- Return plain object `{ statusCode, message, data }` — NOT `new ApiResponse(...)`
- Use `user.sub` for audit fields (not `user.preferred_username`)
- Delete: `Promise<void>` + `@HttpCode(HttpStatus.NO_CONTENT)`

## Step 10 — Module

File: `src/<name>/<name>.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { LoggingService } from '../logging/logging.service';
import { FeatureService } from './feature.service';
import { FeatureController } from './feature.controller';
import { ErrorHandlerService } from '../shared/services/error-handler.service';

@Module({
   controllers: [FeatureController],
   providers: [FeatureService, ErrorHandlerService, LoggingService],
   exports: [FeatureService],
})
export class FeatureModule {}
```

No `MikroOrmModule.forFeature([])` needed — `EntityManager` is provided globally.

## Step 11 — Register in App Module

Add `FeatureModule` to the `imports` array in `src/app.module.ts`.

## Step 12 — Remind User

Tell the user to:
1. Run `/add-migration` to create the database migration
2. Run `/add-test` to scaffold unit tests
