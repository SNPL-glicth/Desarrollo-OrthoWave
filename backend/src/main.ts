import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import { webcrypto } from 'node:crypto';

// Polyfill para crypto en Node.js
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as any;
}
import { winstonConfig } from './config/logger.config';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { Logger } from '@nestjs/common';
import { setColombiaTimezone, getTimezoneInfo } from './utils/timezone.utils';

async function bootstrap() {
  // PRIMERO: Configurar timezone de Colombia para toda la aplicación
  setColombiaTimezone();
  
  const app = await NestFactory.create(AppModule, {
    logger: winstonConfig,
  });

  const logger = new Logger('Bootstrap');

  // Configurar interceptor de logging global
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Configurar CORS para desarrollo y producción
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
      ? [
          'https://www.ortowhavecolombia.com',
          'https://ortowhavecolombia.com',
          'https://owc-orthowave.com',
          'https://www.owc-orthowave.com',
          ...(process.env.FRONTEND_URLS?.split(',') || [])
        ]
      : [
          'http://localhost:3000', 
          'http://localhost:8080', 
          'http://127.0.0.1:3000',
          'http://192.168.20.29:3000', // IP local para acceso desde otros dispositivos
          'http://192.168.20.29:8080',
          'http://10.23.240.188:3000', // Nueva IP para acceso desde dispositivos móviles externos
          'http://10.23.240.188:8080'
        ],
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
  const host = '0.0.0.0'; // Escuchar en todas las interfaces de red
  await app.listen(port, host);

  const timezoneInfo = getTimezoneInfo();
  
  logger.log(`🚀 Servidor Orto-Whave iniciado en puerto ${port}`);
  logger.log(`🌐 Accesible desde:`); 
  logger.log(`   • Local: http://localhost:${port}`);
  logger.log(`   • Red local: http://192.168.20.29:${port}`);
  logger.log(`   • Dispositivos móviles externos: http://10.23.240.188:${port}`);
  logger.log(`   • Celulares/Tablets: http://10.23.240.188:${port}`);
  logger.log(`📊 Nivel de logging: ${process.env.LOG_LEVEL || 'info'}`);
  logger.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`📝 Logs guardándose en: ./logs/`);
  logger.log(`🕐 Timezone: ${timezoneInfo.colombiaTimezone} (UTC${timezoneInfo.utcOffset})`);
  logger.log(`⏰ Hora actual Colombia: ${timezoneInfo.formattedColombia}`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('❌ Error al iniciar el servidor:', error);
  process.exit(1);
});
