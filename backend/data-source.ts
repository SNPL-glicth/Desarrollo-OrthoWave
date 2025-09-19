import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'mainline.proxy.rlwy.net',
  port: parseInt(process.env.DB_PORT || '15576', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'AnFZIsTtYazUEsstWEiAMxtIHHJuHUhH',
  database: process.env.DB_DATABASE || 'railway',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
  charset: 'utf8mb4',
});
