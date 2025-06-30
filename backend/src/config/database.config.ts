import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';

config();

// Configuración para desarrollo con SQLite
const developmentConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'orto_whave_dev.db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // Solo para desarrollo
  logging: true,
  migrationsRun: false, // No ejecutar migraciones en desarrollo con SQLite
};

// Configuración para producción con MySQL
const productionConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'ortowhave',
  password: process.env.DB_PASSWORD || 'Root1234a',
  database: process.env.DB_DATABASE || 'orto_whave_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Mantener en false para producción
  migrationsRun: true,
  logging: false,
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  ssl: { rejectUnauthorized: false },
  extra: {
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
  }
};

export const databaseConfig: TypeOrmModuleOptions =
  process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig;
