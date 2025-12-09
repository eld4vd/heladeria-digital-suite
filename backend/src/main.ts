// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { csrfMiddleware } from './common/middlewares/csrf.middleware';
import { helmetConfig } from './common/utils/helmet-config';

type TrustProxyCapable = { set: (setting: string, value: unknown) => void };

const canSetTrustProxy = (value: unknown): value is TrustProxyCapable =>
  typeof value === 'object' &&
  value !== null &&
  'set' in value &&
  typeof (value as { set: unknown }).set === 'function';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const csrfEnabled =
    (process.env.CSRF_ENABLED || 'true').toLowerCase() === 'true';
  const trustProxy =
    (process.env.TRUST_PROXY || 'false').toLowerCase() === 'true';

  app.use(helmetConfig());

  // 1. Habilita CORS (esto está bien como está)
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'Cache-Control',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // 2. Usa cookieParser (esto está bien como está)
  app.use(cookieParser());
  if (trustProxy) {
    const httpAdapter = app.getHttpAdapter();
    const instance: unknown =
      typeof httpAdapter.getInstance === 'function'
        ? httpAdapter.getInstance()
        : undefined;
    if (canSetTrustProxy(instance)) {
      instance.set('trust proxy', 1);
    }
  }
  if (csrfEnabled) app.use(csrfMiddleware());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.setGlobalPrefix('api');

  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);
  const baseUrl = await app.getUrl();
  console.log(`App corriendo en: ${baseUrl}`);
}
bootstrap().catch((error) => {
  console.error('Error al iniciar la aplicación', error);
  process.exitCode = 1;
});
