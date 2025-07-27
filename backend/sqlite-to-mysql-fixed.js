const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Configuración
const dbPath = path.join(__dirname, 'orto_whave_dev.db');
const outputFile = path.join(__dirname, 'migration-to-mysql-fixed.sql');

console.log('🔄 Iniciando exportación mejorada de SQLite a MySQL...');
console.log('📍 Base de datos SQLite:', dbPath);
console.log('📄 Archivo de salida:', outputFile);

// Crear conexión a SQLite
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('❌ Error conectando a SQLite:', err.message);
    return;
  }
  console.log('✅ Conectado a SQLite');
  
  let sqlOutput = [];
  
  // Header del archivo SQL
  sqlOutput.push('-- Migración mejorada de SQLite a MySQL para Orto-Whave');
  sqlOutput.push('-- Generado automáticamente el ' + new Date().toLocaleString());
  sqlOutput.push('-- ============================================\n');
  
  sqlOutput.push('SET FOREIGN_KEY_CHECKS = 0;');
  sqlOutput.push('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";');
  sqlOutput.push('SET AUTOCOMMIT = 0;');
  sqlOutput.push('START TRANSACTION;\n');
  
  // Usar base de datos
  sqlOutput.push('USE `orto_whave_db`;\n');
  
  // Crear tablas con estructura corregida
  createMySQLTables();
  
  function createMySQLTables() {
    sqlOutput.push('-- ============================================');
    sqlOutput.push('-- CREACIÓN DE TABLAS CON ESTRUCTURA MYSQL');
    sqlOutput.push('-- ============================================\n');
    
    // Tabla roles
    sqlOutput.push('-- Estructura de tabla roles');
    sqlOutput.push('DROP TABLE IF EXISTS `roles`;');
    sqlOutput.push(`CREATE TABLE \`roles\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`nombre\` VARCHAR(50) NOT NULL,
      \`activo\` TINYINT(1) NOT NULL DEFAULT 1,
      \`fecha_creacion\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n`);
    
    // Tabla usuarios
    sqlOutput.push('-- Estructura de tabla usuarios');
    sqlOutput.push('DROP TABLE IF EXISTS `usuarios`;');
    sqlOutput.push(`CREATE TABLE \`usuarios\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`email\` VARCHAR(255) NOT NULL UNIQUE,
      \`password\` VARCHAR(255) NOT NULL,
      \`nombre\` VARCHAR(100) NOT NULL,
      \`apellido\` VARCHAR(100) NOT NULL,
      \`telefono\` VARCHAR(20),
      \`direccion\` TEXT,
      \`rol_id\` INT NOT NULL,
      \`fecha_creacion\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`is_verified\` TINYINT(1) NOT NULL DEFAULT 0,
      \`verification_code\` VARCHAR(10),
      \`reset_password_token\` VARCHAR(255),
      \`reset_password_expires\` DATETIME,
      FOREIGN KEY (\`rol_id\`) REFERENCES \`roles\`(\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n`);
    
    // Tabla perfiles_medicos
    sqlOutput.push('-- Estructura de tabla perfiles_medicos');
    sqlOutput.push('DROP TABLE IF EXISTS `perfiles_medicos`;');
    sqlOutput.push(`CREATE TABLE \`perfiles_medicos\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`usuario_id\` INT NOT NULL UNIQUE,
      \`numero_registro_medico\` VARCHAR(50) NOT NULL UNIQUE,
      \`especialidad\` VARCHAR(100) NOT NULL,
      \`subespecialidades\` TEXT,
      \`universidad_egreso\` VARCHAR(200) NOT NULL,
      \`año_graduacion\` INT NOT NULL,
      \`biografia\` TEXT,
      \`acepta_nuevos_pacientes\` TINYINT(1) NOT NULL DEFAULT 1,
      \`tarifa_consulta\` DECIMAL(10,2),
      \`duracion_consulta_default\` INT NOT NULL DEFAULT 60,
      \`telefono_consultorio\` VARCHAR(20),
      \`direccion_consultorio\` TEXT,
      \`ciudad\` VARCHAR(100),
      \`dias_atencion\` TEXT,
      \`hora_inicio\` TIME,
      \`hora_fin\` TIME,
      \`hora_almuerzo_inicio\` TIME,
      \`hora_almuerzo_fin\` TIME,
      \`activo\` TINYINT(1) NOT NULL DEFAULT 1,
      \`verificado_colegio\` TINYINT(1) NOT NULL DEFAULT 0,
      \`fecha_verificacion\` DATETIME,
      \`fecha_creacion\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`fecha_actualizacion\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\`(\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n`);
    
    // Tabla pacientes
    sqlOutput.push('-- Estructura de tabla pacientes');
    sqlOutput.push('DROP TABLE IF EXISTS `pacientes`;');
    sqlOutput.push(`CREATE TABLE \`pacientes\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`usuario_id\` INT NOT NULL UNIQUE,
      \`numero_identificacion\` VARCHAR(20) NOT NULL UNIQUE,
      \`tipo_identificacion\` VARCHAR(10) NOT NULL DEFAULT 'CC',
      \`fecha_nacimiento\` DATE NOT NULL,
      \`genero\` VARCHAR(20) NOT NULL DEFAULT 'masculino',
      \`estado_civil\` VARCHAR(20),
      \`ocupacion\` VARCHAR(100),
      \`ciudad_residencia\` VARCHAR(100),
      \`barrio\` VARCHAR(100),
      \`eps\` VARCHAR(100),
      \`numero_afiliacion\` VARCHAR(50),
      \`tipo_afiliacion\` VARCHAR(20),
      \`contacto_emergencia_nombre\` VARCHAR(100),
      \`contacto_emergencia_telefono\` VARCHAR(20),
      \`contacto_emergencia_parentesco\` VARCHAR(50),
      \`antecedentesMedicos\` TEXT,
      \`antecedentesQuirurgicos\` TEXT,
      \`antecedentesFamiliares\` TEXT,
      \`alergias\` TEXT,
      \`medicamentosActuales\` TEXT,
      \`peso\` DECIMAL(5,2),
      \`estatura\` DECIMAL(5,2),
      \`grupo_sanguineo\` VARCHAR(5),
      \`acepta_comunicaciones\` TINYINT(1) NOT NULL DEFAULT 1,
      \`prefiere_whatsapp\` TINYINT(1) NOT NULL DEFAULT 0,
      \`prefiere_email\` TINYINT(1) NOT NULL DEFAULT 1,
      \`prefiere_sms\` TINYINT(1) NOT NULL DEFAULT 0,
      \`activo\` TINYINT(1) NOT NULL DEFAULT 1,
      \`primera_consulta\` TINYINT(1) NOT NULL DEFAULT 1,
      \`fecha_registro\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`fecha_actualizacion\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\`(\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n`);
    
    // Tabla citas
    sqlOutput.push('-- Estructura de tabla citas');
    sqlOutput.push('DROP TABLE IF EXISTS `citas`;');
    sqlOutput.push(`CREATE TABLE \`citas\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`paciente_id\` INT NOT NULL,
      \`doctor_id\` INT NOT NULL,
      \`fechaHora\` DATETIME NOT NULL,
      \`duracion\` INT NOT NULL DEFAULT 60,
      \`estado\` VARCHAR(20) NOT NULL DEFAULT 'pendiente',
      \`tipoConsulta\` VARCHAR(20) NOT NULL DEFAULT 'primera_vez',
      \`motivoConsulta\` TEXT,
      \`notasDoctor\` TEXT,
      \`notasPaciente\` TEXT,
      \`costo\` DECIMAL(10,2),
      \`fecha_creacion\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`fecha_actualizacion\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      \`aprobada_por\` INT,
      \`fecha_aprobacion\` DATETIME,
      \`razonRechazo\` TEXT,
      \`recordatorio_enviado\` TINYINT(1) NOT NULL DEFAULT 0,
      FOREIGN KEY (\`paciente_id\`) REFERENCES \`usuarios\`(\`id\`),
      FOREIGN KEY (\`doctor_id\`) REFERENCES \`usuarios\`(\`id\`),
      FOREIGN KEY (\`aprobada_por\`) REFERENCES \`usuarios\`(\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n`);
    
    // Tabla historias_clinicas
    sqlOutput.push('-- Estructura de tabla historias_clinicas');
    sqlOutput.push('DROP TABLE IF EXISTS `historias_clinicas`;');
    sqlOutput.push(`CREATE TABLE \`historias_clinicas\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`paciente_id\` INT NOT NULL,
      \`doctor_id\` INT NOT NULL,
      \`cita_id\` INT,
      \`motivoConsulta\` TEXT NOT NULL,
      \`enfermedadActual\` TEXT NOT NULL,
      \`antecedentesMedicos\` TEXT,
      \`antecedentesQuirurgicos\` TEXT,
      \`alergias\` TEXT,
      \`medicamentosActuales\` TEXT,
      \`examenFisico\` TEXT NOT NULL,
      \`signosVitales\` TEXT,
      \`diagnostico\` TEXT NOT NULL,
      \`diagnosticoDiferencial\` TEXT,
      \`tratamiento\` TEXT NOT NULL,
      \`examenesSolicitados\` TEXT,
      \`interconsultas\` TEXT,
      \`recomendaciones\` TEXT,
      \`observaciones\` TEXT,
      \`proximaConsulta\` DATE,
      \`fecha_consulta\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`fecha_actualizacion\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (\`paciente_id\`) REFERENCES \`usuarios\`(\`id\`),
      FOREIGN KEY (\`doctor_id\`) REFERENCES \`usuarios\`(\`id\`),
      FOREIGN KEY (\`cita_id\`) REFERENCES \`citas\`(\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n`);
    
    // Ahora exportar los datos
    exportTable('roles', () => {
      exportTable('usuarios', () => {
        exportTable('perfiles_medicos', () => {
          exportTable('pacientes', () => {
            exportTable('citas', () => {
              exportTable('historias_clinicas', () => {
                // Finalizar archivo
                sqlOutput.push('\nSET FOREIGN_KEY_CHECKS = 1;');
                sqlOutput.push('COMMIT;');
                
                // Escribir archivo
                fs.writeFileSync(outputFile, sqlOutput.join('\n'));
                console.log('✅ Exportación completada');
                console.log('📊 Archivo generado:', outputFile);
                
                db.close();
              });
            });
          });
        });
      });
    });
  }
  
  function exportTable(tableName, callback) {
    console.log(`📋 Exportando datos: ${tableName}`);
    
    // Obtener datos de la tabla
    db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
      if (err) {
        console.error(`❌ Error obteniendo datos de ${tableName}:`, err.message);
        callback();
        return;
      }
      
      if (rows.length > 0) {
        sqlOutput.push(`-- Datos para la tabla ${tableName}`);
        
        // Obtener nombres de columnas
        const columns = Object.keys(rows[0]);
        const columnNames = columns.map(col => `\`${col}\``).join(', ');
        
        rows.forEach(row => {
          const values = columns.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'string') {
              return `'${value.replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
            }
            if (typeof value === 'boolean') return value ? 1 : 0;
            return value;
          }).join(', ');
          
          sqlOutput.push(`INSERT INTO \`${tableName}\` (${columnNames}) VALUES (${values});`);
        });
        
        console.log(`✅ ${rows.length} registros exportados de ${tableName}`);
      } else {
        console.log(`ℹ️ Tabla ${tableName} está vacía`);
      }
      
      sqlOutput.push('');
      callback();
    });
  }
});
