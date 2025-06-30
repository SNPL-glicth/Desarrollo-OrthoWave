import { MigrationInterface, QueryRunner } from 'typeorm';
import { Column } from 'typeorm';

export class InitialSetup1709942400000 implements MigrationInterface {
    name = 'InitialSetup1709942400000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tabla de roles
        await queryRunner.query(`
            CREATE TABLE roles (
                id INT NOT NULL AUTO_INCREMENT,
                nombre VARCHAR(255) NOT NULL,
                activo BOOLEAN NOT NULL DEFAULT true,
                fechaCreacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE INDEX IDX_nombre_unico (nombre),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB;
        `);

        // Insertar roles iniciales
        await queryRunner.query(`
            INSERT INTO roles (nombre) VALUES 
            ('admin'),
            ('doctor'),
            ('paciente');
        `);

        // Crear tabla de usuarios
        await queryRunner.query(`
            CREATE TABLE usuarios (
                id INT NOT NULL AUTO_INCREMENT,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                nombre VARCHAR(255) NOT NULL,
                apellido VARCHAR(255) NOT NULL,
                telefono VARCHAR(255),
                direccion TEXT,
                rol_id INT NOT NULL,
                fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                isVerified BOOLEAN NOT NULL DEFAULT false,
                verificationCode VARCHAR(10),
                UNIQUE INDEX IDX_email_unico (email),
                PRIMARY KEY (id),
                FOREIGN KEY (rol_id) REFERENCES roles(id)
            ) ENGINE=InnoDB;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS usuarios`);
        await queryRunner.query(`DROP TABLE IF EXISTS roles`);
    }
} 