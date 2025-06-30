import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnsToRoles1709942400001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar columna activo
        await queryRunner.query(`
            ALTER TABLE roles 
            ADD COLUMN activo BOOLEAN DEFAULT true
        `);

        // Agregar columna fechaCreacion
        await queryRunner.query(`
            ALTER TABLE roles 
            ADD COLUMN fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar columna fechaCreacion
        await queryRunner.query(`
            ALTER TABLE roles 
            DROP COLUMN fecha_creacion
        `);

        // Eliminar columna activo
        await queryRunner.query(`
            ALTER TABLE roles 
            DROP COLUMN activo
        `);
    }
} 