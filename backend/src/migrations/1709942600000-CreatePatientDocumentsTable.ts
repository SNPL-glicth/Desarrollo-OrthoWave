import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreatePatientDocumentsTable1709942600000 implements MigrationInterface {
  name = 'CreatePatientDocumentsTable1709942600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'patient_documents',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'patient_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'original_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'file_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'file_path',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '100',
            default: "'application/pdf'",
            isNullable: false,
          },
          {
            name: 'size',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'upload_date',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Crear foreign key constraint
    await queryRunner.createForeignKey(
      'patient_documents',
      new TableForeignKey({
        columnNames: ['patient_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'pacientes',
        onDelete: 'CASCADE',
        name: 'FK_PATIENT_DOCUMENTS_PACIENTES',
      }),
    );

    // Crear índice para mejorar consultas por paciente
    await queryRunner.query(
      'CREATE INDEX IDX_patient_documents_patient_id ON patient_documents (patient_id)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar clave foránea
    await queryRunner.dropForeignKey('patient_documents', 'FK_PATIENT_DOCUMENTS_PACIENTES');
    
    // Eliminar índice
    await queryRunner.query('DROP INDEX IDX_patient_documents_patient_id ON patient_documents');
    
    // Eliminar tabla
    await queryRunner.dropTable('patient_documents');
  }
}
