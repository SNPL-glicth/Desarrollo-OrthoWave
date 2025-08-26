import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateProductsAndReservationsTables1759002000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla de productos
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'stock',
            type: 'int',
            default: 0,
          },
          {
            name: 'image_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'brand',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'is_available',
            type: 'boolean',
            default: true,
          },
          {
            name: 'requires_prescription',
            type: 'boolean',
            default: true,
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
      })
    );

    // Crear tabla de reservas de productos
    await queryRunner.createTable(
      new Table({
        name: 'product_reservations',
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
          },
          {
            name: 'product_id',
            type: 'int',
          },
          {
            name: 'quantity',
            type: 'int',
            default: 1,
          },
          {
            name: 'unit_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'total_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
            default: "'pending'",
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'doctor_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'confirmed_by_doctor_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'confirmed_at',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'delivered_at',
            type: 'datetime',
            isNullable: true,
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
        indices: [
          {
            name: 'idx_patient_status',
            columnNames: ['patient_id', 'status'],
          },
          {
            name: 'idx_product_status',
            columnNames: ['product_id', 'status'],
          },
        ],
      })
    );

    // Crear foreign keys
    await queryRunner.createForeignKey(
      'product_reservations',
      new TableForeignKey({
        columnNames: ['patient_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'fk_reservation_patient',
      })
    );

    await queryRunner.createForeignKey(
      'product_reservations',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'fk_reservation_product',
      })
    );

    await queryRunner.createForeignKey(
      'product_reservations',
      new TableForeignKey({
        columnNames: ['confirmed_by_doctor_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'fk_reservation_confirmed_by',
      })
    );

    // Insertar algunos productos de ejemplo
    await queryRunner.query(`
      INSERT INTO products (name, description, price, stock, category, brand, image_url, requires_prescription) VALUES 
      ('Brackets Metálicos', 'Brackets de acero inoxidable de alta calidad', 15000.00, 50, 'Ortodoncia', 'OrtoDental', 'https://via.placeholder.com/300x300/4A90E2/FFFFFF?text=Brackets', true),
      ('Retenedor Transparente', 'Retenedor transparente removible', 45000.00, 20, 'Ortodoncia', 'ClearAlign', 'https://via.placeholder.com/300x300/50C878/FFFFFF?text=Retenedor', true),
      ('Cepillo Dental Ortodóncico', 'Cepillo especial para limpieza con brackets', 8500.00, 100, 'Higiene', 'OralCare', 'https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=Cepillo', false),
      ('Hilo Dental Especializado', 'Hilo dental para ortodoncia con aplicador', 12000.00, 80, 'Higiene', 'DentalFloss', 'https://via.placeholder.com/300x300/FFE66D/000000?text=Hilo', false),
      ('Enjuague Bucal Ortodóncico', 'Enjuague especializado para pacientes con brackets', 16500.00, 60, 'Higiene', 'FreshMouth', 'https://via.placeholder.com/300x300/A8E6CF/000000?text=Enjuague', false),
      ('Kit de Limpieza Completo', 'Kit completo con cepillo, hilo y enjuague', 35000.00, 25, 'Higiene', 'OrthoKit', 'https://via.placeholder.com/300x300/DDA0DD/000000?text=Kit', false)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign keys
    await queryRunner.dropForeignKey('product_reservations', 'fk_reservation_confirmed_by');
    await queryRunner.dropForeignKey('product_reservations', 'fk_reservation_product');
    await queryRunner.dropForeignKey('product_reservations', 'fk_reservation_patient');
    
    // Eliminar tablas
    await queryRunner.dropTable('product_reservations');
    await queryRunner.dropTable('products');
  }
}
