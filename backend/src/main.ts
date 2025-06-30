import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import { winstonConfig } from './config/logger.config';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonConfig,
  });

  const logger = new Logger('Bootstrap');

  // Configurar interceptor de logging global
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Configurar CORS mejorado para producción
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URLS?.split(',') || ['https://your-domain.com']
      : ['http://localhost:3000', 'http://localhost:8080', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Access-Control-Allow-Headers',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Authorization'],
    optionsSuccessStatus: 200,
    maxAge: 86400, // 24 horas para preflight cache
  };

  app.use(cors(corsOptions));

  // Configurar validación global y pipes si es necesario
  // app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`🚀 Servidor Orto-Whave iniciado en puerto ${port}`);
  logger.log(`📊 Nivel de logging: ${process.env.LOG_LEVEL || 'info'}`);
  logger.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`📝 Logs guardándose en: ./logs/`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('❌ Error al iniciar el servidor:', error);
  process.exit(1);
});
