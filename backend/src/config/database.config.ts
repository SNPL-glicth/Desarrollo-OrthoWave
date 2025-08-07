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

// Configuración para desarrollo con MySQL
const developmentMySQLConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'ortowhave',
  password: process.env.DB_PASSWORD || 'Root1234a',
  database: process.env.DB_DATABASE || 'orto_whave_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // Habilitado temporalmente para actualizar schema
  logging: ['error', 'warn'], // Solo mostrar errores y warnings
  migrationsRun: false, // No ejecutar migraciones automáticamente
  charset: 'utf8mb4',
  extra: {
    connectionLimit: 5,
    // Removidas acquireTimeout y timeout que no son válidas para MySQL2
  }
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
    // Removidas acquireTimeout y timeout que no son válidas para MySQL2
  }
};

export const databaseConfig: TypeOrmModuleOptions =
  process.env.NODE_ENV === 'production' ? productionConfig : 
  process.env.DB_HOST ? developmentMySQLConfig : developmentConfig; // Usar SQLite si no hay DB_HOST configurado
