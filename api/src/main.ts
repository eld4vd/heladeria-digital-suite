import 'reflect-metadata';
import { Catch, ArgumentsHost, ExceptionFilter, HttpException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import type { Response } from 'express';
import { AppModule } from './app.module';

@Catch()
class ApiExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    if (error instanceof HttpException) { response.status(error.getStatus()).json(error.getResponse()); return; }
    const code = (error as { code?: string })?.code;
    const status = code === 'P2025' ? 404 : code === 'P2002' ? 409 : code === 'P2003' ? 400 : 500;
    const message = code === 'P2025' ? 'Registro no encontrado.' : code === 'P2002' ? 'Ya existe un registro con esos datos.' : code === 'P2003' ? 'La referencia seleccionada no es válida.' : 'No se pudo completar la operación. Inténtalo nuevamente.';
    if (status === 500) console.error('API error:', error instanceof Error ? error.name : 'UnknownError');
    response.status(status).json({ statusCode: status, message });
  }
}
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  // Solo el proxy local de Next puede proporcionar la dirección original del cliente.
  app.set('trust proxy', 'loopback');
  app.use(helmet());
  app.use(cookieParser());
  app.use((_req: unknown, res: Response, next: () => void) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  app.enableCors({ origin: [config.getOrThrow<string>('FRONTEND_ORIGIN'), config.getOrThrow<string>('ADMIN_ORIGIN')], credentials: true, allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'Idempotency-Key'] });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks();
  const port = config.get<number>('PORT', 4000);
  await app.listen(port, '0.0.0.0');
  // Mantiene el aviso de inicio separado de los registros con fecha de Nest, como hace Next.js.
  const useColor = process.stdout.isTTY && process.env.NO_COLOR === undefined && process.env.TERM !== 'dumb';
  const white = useColor ? '\u001b[1;97m' : '';
  const reset = useColor ? '\u001b[0m' : '';
  process.stdout.write(`${white}\n  Delicias · Backend (NestJS)\n  - Local:  http://localhost:${port}/api/v1\n  - Puerto: ${port}\n\n  Listo para recibir solicitudes.\n\n${reset}`);
}
void bootstrap();
