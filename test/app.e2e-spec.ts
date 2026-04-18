import request from 'supertest';
import { VersioningType } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../src/app.service';
import { AppController } from '../src/app.controller';
import { ErrorHandlerService } from '../src/common/services/error-handler.service';

describe('AppController (e2e)', () => {
   let app: INestApplication;

   beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
         controllers: [AppController],
         providers: [
            {
               provide: AppService,
               useValue: {
                  getInfo: () => ({
                     name: 'nestjs-boilerplate',
                     version: '1.0.0',
                     dbClient: 'postgresql',
                     redisEnabled: false
                  }),
                  getReadiness: jest.fn()
               }
            },
            {
               provide: ErrorHandlerService,
               useValue: {
                  handleControllerError: jest.fn()
               }
            }
         ]
      }).compile();

      app = moduleFixture.createNestApplication();
      app.setGlobalPrefix('api');
      app.enableVersioning({ type: VersioningType.URI });
      await app.init();
   });

   afterEach(async () => {
      if (app) {
         await app.close();
      }
   });

   it('/api/v1/healthz (GET)', () => {
      return request(app.getHttpServer())
         .get('/api/v1/healthz')
         .expect(200)
         .expect(({ body }) => {
            expect(body.statusCode).toBe(200);
            expect(body.message).toBe('OK');
            expect(body.data.status).toBe('ok');
         });
   });
});
