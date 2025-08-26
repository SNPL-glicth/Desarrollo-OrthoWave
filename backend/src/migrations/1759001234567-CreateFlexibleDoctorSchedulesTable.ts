import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateFlexibleDoctorSchedulesTable1759001234567 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'flexible_doctor_schedules',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'doctor_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'schedule_type',
            type: 'enum',
            enum: ['specific_date', 'weekly_recurring', 'monthly_recurring', 'exception'],
            default: "'specific_date'",
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'end_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'recurrence_pattern',
            type: 'enum',
            enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
            default: "'none'",
            isNullable: true,
          },
          {
            name: 'day_of_week',
            type: 'int',
            isNullable: true,
            comment: '0-6, domingo-sábado para patrones semanales',
          },
          {
            name: 'day_of_month',
            type: 'int',
            isNullable: true,
            comment: '1-31 para patrones mensuales',
          },
          {
            name: 'is_available',
            type: 'boolean',
            default: true,
          },
          {
            name: 'time_slots',
            type: 'json',
            isNullable: true,
            comment: 'Array de objetos con startTime, endTime, label',
          },
          {
            name: 'slot_duration',
            type: 'int',
            default: 60,
            comment: 'Duración de cada cita en minutos',
          },
          {
            name: 'buffer_time',
            type: 'int',
            default: 0,
            comment: 'Tiempo de buffer entre citas en minutos',
          },
          {
            name: 'max_appointments',
            type: 'int',
            default: 8,
            comment: 'Número máximo de citas para este período',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
            comment: 'Notas del doctor para este horario',
          },
          {
            name: 'reason',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Motivo para casos especiales (vacaciones, etc.)',
          },
          {
            name: 'notify_patients',
            type: 'boolean',
            default: false,
            comment: 'Si notificar a pacientes sobre cambios',
          },
          {
            name: 'priority',
            type: 'int',
            default: 3,
            comment: 'Prioridad del horario (1=alta, 5=baja)',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            comment: 'Si este horario está activo',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['doctor_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true
    );

    // Crear índices para optimizar consultas
    await queryRunner.createIndex(
      'flexible_doctor_schedules',
      new TableIndex({
        name: 'IDX_flexible_doctor_schedule_doctor_type_start',
        columnNames: ['doctor_id', 'schedule_type', 'start_date'],
      })
    );

    await queryRunner.createIndex(
      'flexible_doctor_schedules',
      new TableIndex({
        name: 'IDX_flexible_doctor_schedule_doctor_day_type',
        columnNames: ['doctor_id', 'day_of_week', 'schedule_type'],
      })
    );

    await queryRunner.createIndex(
      'flexible_doctor_schedules',
      new TableIndex({
        name: 'IDX_flexible_doctor_schedule_doctor_date_range',
        columnNames: ['doctor_id', 'start_date', 'end_date'],
      })
    );

    await queryRunner.createIndex(
      'flexible_doctor_schedules',
      new TableIndex({
        name: 'IDX_flexible_doctor_schedule_active_priority',
        columnNames: ['is_active', 'priority'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.dropIndex('flexible_doctor_schedules', 'IDX_flexible_doctor_schedule_active_priority');
    await queryRunner.dropIndex('flexible_doctor_schedules', 'IDX_flexible_doctor_schedule_doctor_date_range');
    await queryRunner.dropIndex('flexible_doctor_schedules', 'IDX_flexible_doctor_schedule_doctor_day_type');
    await queryRunner.dropIndex('flexible_doctor_schedules', 'IDX_flexible_doctor_schedule_doctor_type_start');
    
    // Eliminar tabla
    await queryRunner.dropTable('flexible_doctor_schedules');
  }
}
