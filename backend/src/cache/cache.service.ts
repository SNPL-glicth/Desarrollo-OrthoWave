import { Injectable, Logger } from '@nestjs/common';

interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

@Injectable()
export class CacheService {
  private cache: Map<string, CacheItem> = new Map();
  private logger: Logger = new Logger('CacheService');

  constructor() {
    // Limpiar cache expirado cada 5 minutos
    setInterval(() => {
      this.cleanExpiredItems();
    }, 5 * 60 * 1000);
  }

  set(key: string, data: any, ttl: number = 60000): void {
    const item: CacheItem = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    this.cache.set(key, item);
    this.logger.debug(`Cache set: ${key} with TTL ${ttl}ms`);
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.logger.debug(`Cache miss: ${key}`);
      return null;
    }
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.logger.debug(`Cache expired and removed: ${key}`);
      return null;
    }
    
    this.logger.debug(`Cache hit: ${key}`);
    return item.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    this.logger.debug(`Cache invalidated: ${key}`);
  }

  invalidatePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    const regex = new RegExp(pattern);
    
    keys.forEach(key => {
      if (regex.test(key)) {
        this.cache.delete(key);
        this.logger.debug(`Cache invalidated by pattern: ${key}`);
      }
    });
  }

  clear(): void {
    this.cache.clear();
    this.logger.debug('Cache cleared');
  }

  private cleanExpiredItems(): void {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
      this.logger.debug(`Cleaned ${expiredCount} expired cache items`);
    }
  }

  // Métodos específicos para dashboard
  getDashboardData(userId: number, role: string): any | null {
    return this.get(`dashboard_${role}_${userId}`);
  }

  setDashboardData(userId: number, role: string, data: any, ttl: number = 30000): void {
    this.set(`dashboard_${role}_${userId}`, data, ttl);
  }

  invalidateDashboardData(userId?: number, role?: string): void {
    if (userId && role) {
      this.invalidate(`dashboard_${role}_${userId}`);
    } else if (role) {
      this.invalidatePattern(`dashboard_${role}_.*`);
    } else {
      this.invalidatePattern('dashboard_.*');
    }
  }

  // Métodos específicos para citas
  getCitasData(userId: number, role: string): any | null {
    return this.get(`citas_${role}_${userId}`);
  }

  setCitasData(userId: number, role: string, data: any, ttl: number = 15000): void {
    this.set(`citas_${role}_${userId}`, data, ttl);
  }

  invalidateCitasData(userId?: number, role?: string): void {
    if (userId && role) {
      this.invalidate(`citas_${role}_${userId}`);
    } else if (role) {
      this.invalidatePattern(`citas_${role}_.*`);
    } else {
      this.invalidatePattern('citas_.*');
    }
  }

  // Métodos específicos para estadísticas
  getStatsData(userId: number, role: string): any | null {
    return this.get(`stats_${role}_${userId}`);
  }

  setStatsData(userId: number, role: string, data: any, ttl: number = 45000): void {
    this.set(`stats_${role}_${userId}`, data, ttl);
  }

  invalidateStatsData(userId?: number, role?: string): void {
    if (userId && role) {
      this.invalidate(`stats_${role}_${userId}`);
    } else if (role) {
      this.invalidatePattern(`stats_${role}_.*`);
    } else {
      this.invalidatePattern('stats_.*');
    }
  }

  // Método para obtener información del cache
  getCacheInfo(): any {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      timestamp: Date.now()
    };
  }
}
