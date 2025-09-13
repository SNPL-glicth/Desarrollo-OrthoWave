import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompletarPerfilToNotificationType1757105000000 implements MigrationInterface {
    name = 'AddCompletarPerfilToNotificationType1757105000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Modificar el ENUM para agregar 'completar_perfil'
        await queryRunner.query(
            `ALTER TABLE notificaciones MODIFY COLUMN tipo ENUM('cita_confirmada', 'cita_cancelada', 'recordatorio', 'cita_reagendada', 'completar_perfil') NOT NULL DEFAULT 'cita_confirmada'`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir el ENUM removiendo 'completar_perfil'
        await queryRunner.query(
            `ALTER TABLE notificaciones MODIFY COLUMN tipo ENUM('cita_confirmada', 'cita_cancelada', 'recordatorio', 'cita_reagendada') NOT NULL DEFAULT 'cita_confirmada'`
        );
    }
}
