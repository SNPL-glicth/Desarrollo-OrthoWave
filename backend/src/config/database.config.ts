import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';

config();

// Configuración para desarrollo con MySQL
const developmentMySQLConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'mainline.proxy.rlwy.net',
  port: parseInt(process.env.DB_PORT || '15576', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'AnFZIsTtYazUEsstWEiAMxtIHHJuHUhH',
  database: process.env.DB_DATABASE || 'railway',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Deshabilitado para evitar conflictos
  logging: ['error', 'warn'], // Solo mostrar errores y warnings
  migrationsRun: false, // No ejecutar migraciones automáticamente
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  charset: 'utf8mb4',
  extra: {
    connectionLimit: 5,
    // Removidas acquireTimeout y timeout que no son válidas para MySQL2
  }
};

// Configuración para producción con MySQL
const productionConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'mainline.proxy.rlwy.net',
  port: parseInt(process.env.DB_PORT || '15576', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'AnFZIsTtYazUEsstWEiAMxtIHHJuHUhH',
  database: process.env.DB_DATABASE || 'railway',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Mantener en false para producción
  migrationsRun: true,
  logging: false,
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  ssl: { rejectUnauthorized: false },
  extra: {
    connectionLimit: 10,
    // Removidas acquireTimeout y timeout que no son válidas para MySQL2
  }
};

export const databaseConfig: TypeOrmModuleOptions =
  process.env.NODE_ENV === 'production' ? productionConfig : developmentMySQLConfig;
