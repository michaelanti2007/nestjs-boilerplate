---
name: add-endpoint
description: Add a new route and service method to an existing module in the learning platform. Use when asked to add an endpoint, route, or action to an existing controller/service.
---

Add a new endpoint to: $ARGUMENTS

Read the existing controller and service files first, then follow the patterns below.

## Step 1 — Read the Existing Files

Read:
- `src/<module>/<module>.controller.ts`
- `src/<module>/<module>.service.ts`

Understand what already exists before adding anything.

## Step 2 — Add Service Method

Every service method follows this exact structure:

```typescript
async myAction(id: number, dto: MyActionDto, performedBy: string): Promise<MyResponseDto> {
   const context = { label: this.ctx + '.myAction' };
   try {
      this.log.info(`Starting myAction for id: ${id}`, context);

      return await this.runInTransaction(async (em) => {
         // 1. Fetch and validate entity
         const entity = await this.findOrFail(Entity, { id }, em);

         // 2. Business logic here
         // Use: new CustomError('msg', HttpStatus.X, ErrorCode.X) for domain errors

         // 3. Persist changes
         await em.flush();
         this.log.info(`myAction completed for id: ${id}`, context);

         // 4. Return serialized DTO
         return CommonUtils.serializeToDto(MyResponseDto, entity) as MyResponseDto;
      });
   } catch (error) {
      throw this.errorHandler.handleServiceError(error, ThisService, '.myAction');
   }
}
```

For read-only actions (no writes), skip `runInTransaction`:

```typescript
async myReadAction(id: number): Promise<MyResponseDto> {
   const context = { label: this.ctx + '.myReadAction' };
   try {
      const entity = await this.findOrFail(Entity, { id });
      return CommonUtils.serializeToDto(MyResponseDto, entity) as MyResponseDto;
   } catch (error) {
      throw this.errorHandler.handleServiceError(error, ThisService, '.myReadAction');
   }
}
```

## Step 3 — Add Controller Method

```typescript
@Post(':id/my-action')
@Version(ApiVersion.ONE)
@HttpCode(HttpStatus.OK)
@Roles({ roles: ['realm:admin'] })
@ApiOperationAndResponses({
   summary: 'Short description of what this does',
   description: `Longer description if needed.

Multi-line markdown is supported here for complex endpoints.`,
   responseDescriptions: {
      [HttpStatus.OK]: 'Action completed successfully',
      [HttpStatus.NOT_FOUND]: 'Entity not found',
      [HttpStatus.BAD_REQUEST]: 'Invalid input',
      [HttpStatus.UNAUTHORIZED]: 'Authentication failed',
      [HttpStatus.FORBIDDEN]: 'Insufficient permissions',
   },
})
async myAction(
   @Param('id', ParseIntPipe) id: number,
   @Body() dto: MyActionDto,
   @AuthenticatedUser() user: AuthUser,
): Promise<ApiResponse<MyResponseDto>> {
   try {
      const data = await this.service.myAction(id, dto, user.sub);
      return { statusCode: HttpStatus.OK, message: 'Action completed successfully', data };
   } catch (error) {
      this.errorHandler.handleControllerError(error, ThisController, '.myAction');
   }
}
```

## Rules Checklist

- [ ] `@Version(ApiVersion.ONE)` on the new method
- [ ] `@Roles({ roles: [...] })` — no `UseGuards`
- [ ] `@ApiOperationAndResponses` with all relevant HTTP status codes
- [ ] Return `{ statusCode, message, data }` plain object — NOT `new ApiResponse(...)`
- [ ] Controller catch: `this.errorHandler.handleControllerError(error, ThisController, '.methodName')`
- [ ] Service catch: `throw this.errorHandler.handleServiceError(error, ThisService, '.methodName')`
- [ ] Use `user.sub` for audit fields
- [ ] Wrap writes in `this.runInTransaction(async (em) => { ... })`
- [ ] Serialize response: `CommonUtils.serializeToDto(ResponseDto, entity)`
- [ ] Use `this.findOrFail(Entity, { id }, em)` — never return null silently
