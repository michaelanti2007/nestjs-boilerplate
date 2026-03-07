---
name: add-test
description: Scaffold Jest unit tests for a service in the learning platform following project conventions. Use when asked to write tests, add tests, or test a service.
---

Write unit tests for: $ARGUMENTS

Read the actual service file first before writing any tests, then follow this pattern.

## Pattern — Service Unit Test

File: `src/<name>/<name>.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/postgresql';
import { HttpStatus } from '@nestjs/common';
import { FeatureService } from './feature.service';
import { Feature } from './entities/feature.entity';
import { LoggingService } from '../logging/logging.service';
import { ErrorHandlerService } from '../shared/services/error-handler.service';
import { CustomError } from '../shared/classes/custom-error';
import { ErrorCode } from '../shared/enums/error-code.enum';

// Mock logger so logging doesn't throw in tests
const mockLogger = {
   getLogger: jest.fn().mockReturnValue({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
   }),
};

// Mock EntityManager — only mock the methods your service actually calls
const mockEm = {
   findOne: jest.fn(),
   find: jest.fn(),
   count: jest.fn(),
   create: jest.fn(),
   persistAndFlush: jest.fn(),
   flush: jest.fn(),
   qb: jest.fn(),
   getReference: jest.fn(),
   // transactional must call the callback to simulate runInTransaction
   transactional: jest.fn().mockImplementation((cb) => cb(mockEm)),
};

const mockErrorHandler = {
   handleServiceError: jest.fn().mockImplementation((error) => error),
   handleControllerError: jest.fn(),
   throwCustomError: jest.fn(),
};

describe('FeatureService', () => {
   let service: FeatureService;

   beforeEach(async () => {
      jest.clearAllMocks();

      const module: TestingModule = await Test.createTestingModule({
         providers: [
            FeatureService,
            { provide: LoggingService, useValue: mockLogger },
            { provide: EntityManager, useValue: mockEm },
            { provide: ErrorHandlerService, useValue: mockErrorHandler },
         ],
      }).compile();

      service = module.get<FeatureService>(FeatureService);
   });

   describe('getOne', () => {
      it('should return a feature when found', async () => {
         const feature = { id: 1, name: 'Test Feature', audit: {} };
         mockEm.findOne.mockResolvedValue(feature);

         const result = await service.getOne(1);

         expect(mockEm.findOne).toHaveBeenCalledWith(Feature, { id: 1 });
         expect(result).toBeDefined();
      });

      it('should throw when feature not found', async () => {
         mockEm.findOne.mockResolvedValue(null);
         mockErrorHandler.handleServiceError.mockImplementation((err) => { throw err; });

         await expect(service.getOne(99)).rejects.toThrow();
      });
   });

   describe('create', () => {
      it('should create and return a feature', async () => {
         const dto = { name: 'New Feature' };
         const created = { id: 1, name: 'New Feature', audit: { createdBy: 'user1' } };
         mockEm.create.mockReturnValue(created);
         mockEm.persistAndFlush.mockResolvedValue(undefined);

         const result = await service.create(dto as any, 'user1');

         expect(mockEm.create).toHaveBeenCalled();
         expect(mockEm.persistAndFlush).toHaveBeenCalledWith(created);
         expect(result).toBeDefined();
      });

      it('should propagate errors through handleServiceError', async () => {
         const dbError = new Error('DB connection failed');
         mockEm.persistAndFlush.mockRejectedValue(dbError);
         mockErrorHandler.handleServiceError.mockImplementation((err) => { throw err; });

         await expect(service.create({ name: 'x' } as any, 'user1')).rejects.toThrow();
         expect(mockErrorHandler.handleServiceError).toHaveBeenCalledWith(
            dbError, FeatureService, '.create'
         );
      });
   });

   describe('remove', () => {
      it('should soft-delete a feature', async () => {
         const feature = { id: 1, name: 'Test', audit: {} };
         mockEm.findOne.mockResolvedValue(feature);
         mockEm.flush.mockResolvedValue(undefined);

         await service.remove(1, 'admin');

         // audit.deletedAt and audit.deletedBy should be set
         expect(feature.audit).toMatchObject({
            deletedAt: expect.any(Date),
            deletedBy: 'admin',
         });
         expect(mockEm.flush).toHaveBeenCalled();
      });
   });
});
```

## Key Rules

1. **Always mock `transactional`** to call the callback: `jest.fn().mockImplementation((cb) => cb(mockEm))` — otherwise `runInTransaction` never executes
2. **`jest.clearAllMocks()`** in `beforeEach` to prevent state leaking between tests
3. **Test error paths**: mock `handleServiceError` to re-throw, then `expect(...).rejects.toThrow()`
4. **Test the service call args**: use `toHaveBeenCalledWith(...)` to verify correct entity/condition passed to `em.findOne` etc.
5. **Don't test framework internals** — don't test that `@Roles` is applied or that NestJS DI works

## Run Tests

```bash
npm run test -- --testPathPattern=feature.service
npm run test:cov
```
