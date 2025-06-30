import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { format } from 'winston';

// Configuración personalizada para formato de logs
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, context, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}] ${context ? `[${context}] ` : ''}${message}`;

    // Agregar metadatos si existen
    if (Object.keys(meta).length > 0) {
      log += ` | Meta: ${JSON.stringify(meta)}`;
    }

    // Agregar stack trace para errores
    if (stack) {
      log += `\nStack: ${stack}`;
    }

    return log;
  })
);

// Configuración para archivos de logs rotativos
const dailyRotateFileTransport = new DailyRotateFile({
  filename: 'logs/orto-whave-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d', // Mantener logs por 14 días
  format: logFormat,
});

// Configuración para logs de errores separados
const errorFileTransport = new DailyRotateFile({
  filename: 'logs/orto-whave-error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d', // Mantener logs de errores por 30 días
  level: 'error',
  format: logFormat,
});

// Configuración del logger
export const winstonConfig = WinstonModule.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Console para desarrollo
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple(),
        format.printf(({ timestamp, level, message, context }) => {
          return `${timestamp} [${level}] ${context ? `[${context}] ` : ''}${message}`;
        })
      ),
    }),
    // Archivos rotativos
    dailyRotateFileTransport,
    errorFileTransport,
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
});

// Configurar creación de carpeta de logs
import * as fs from 'fs';
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}
