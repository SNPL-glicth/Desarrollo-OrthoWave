import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateNotificationsTable1709942500001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notificaciones',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'usuario_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'cita_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'tipo',
            type: 'enum',
            enum: ['cita_confirmada', 'cita_cancelada', 'recordatorio', 'cita_reagendada'],
            default: "'cita_confirmada'",
          },
          {
            name: 'titulo',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'mensaje',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'doctor_nombre',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'fecha_cita',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'leida',
            type: 'boolean',
            default: false,
          },
          {
            name: 'fecha_creacion',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'fecha_actualizacion',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      })
    );

    // Crear índice para mejorar el rendimiento de consultas por usuario
    await queryRunner.createIndex(
      'notificaciones',
      new TableIndex({
        name: 'IDX_NOTIFICACIONES_USUARIO_FECHA',
        columnNames: ['usuario_id', 'fecha_creacion']
      })
    );

    // Crear índice para notificaciones no leídas
    await queryRunner.createIndex(
      'notificaciones',
      new TableIndex({
        name: 'IDX_NOTIFICACIONES_NO_LEIDAS',
        columnNames: ['usuario_id', 'leida']
      })
    );

    // Crear clave foránea para usuario_id
    await queryRunner.createForeignKey(
      'notificaciones',
      new TableForeignKey({
        columnNames: ['usuario_id'],
        referencedTableName: 'usuarios',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_NOTIFICACIONES_USUARIO',
      })
    );

    // Crear clave foránea para cita_id
    await queryRunner.createForeignKey(
      'notificaciones',
      new TableForeignKey({
        columnNames: ['cita_id'],
        referencedTableName: 'citas',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_NOTIFICACIONES_CITA',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar claves foráneas
    await queryRunner.dropForeignKey('notificaciones', 'FK_NOTIFICACIONES_CITA');
    await queryRunner.dropForeignKey('notificaciones', 'FK_NOTIFICACIONES_USUARIO');

    // Eliminar índices
    await queryRunner.dropIndex('notificaciones', 'IDX_NOTIFICACIONES_NO_LEIDAS');
    await queryRunner.dropIndex('notificaciones', 'IDX_NOTIFICACIONES_USUARIO_FECHA');

    // Eliminar tabla
    await queryRunner.dropTable('notificaciones');
  }
}
