import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, body, headers, ip } = request;
    const userAgent = headers['user-agent'] || '';
    const contentLength = headers['content-length'] || '0';

    // Datos sensibles que no se deben loggear
    const sanitizedBody = this.sanitizeData(body);
    const sanitizedHeaders = this.sanitizeHeaders(headers);

    const startTime = Date.now();

    // Log de request entrante
    this.logger.log({
      message: `Incoming Request: ${method} ${url}`,
      method,
      url,
      ip,
      userAgent,
      contentLength,
      body: sanitizedBody,
      headers: sanitizedHeaders,
      timestamp: new Date().toISOString(),
    });

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        // Log de response exitoso
        this.logger.log({
          message: `Outgoing Response: ${method} ${url} - ${statusCode}`,
          method,
          url,
          statusCode,
          duration: `${duration}ms`,
          responseSize: JSON.stringify(data || {}).length,
          timestamp: new Date().toISOString(),
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;

        // Log de error
        this.logger.error({
          message: `Error Response: ${method} ${url} - ${statusCode}`,
          method,
          url,
          statusCode,
          duration: `${duration}ms`,
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        });

        throw error;
      })
    );
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = [
      'password',
      'token',
      'authorization',
      'secret',
      'key',
      'credential',
    ];

    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

    for (const header of sensitiveHeaders) {
      if (header in sanitized) {
        sanitized[header] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
