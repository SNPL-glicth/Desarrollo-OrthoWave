const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Configuración
const dbPath = path.join(__dirname, 'orto_whave_dev.db');
const outputFile = path.join(__dirname, 'migration-to-mysql.sql');

console.log('🔄 Iniciando exportación de SQLite a MySQL...');
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
  sqlOutput.push('-- Migración de SQLite a MySQL para Orto-Whave');
  sqlOutput.push('-- Generado automáticamente el ' + new Date().toLocaleString());
  sqlOutput.push('-- ============================================\n');
  
  sqlOutput.push('SET FOREIGN_KEY_CHECKS = 0;');
  sqlOutput.push('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";');
  sqlOutput.push('SET AUTOCOMMIT = 0;');
  sqlOutput.push('START TRANSACTION;\n');
  
  // Crear base de datos
  sqlOutput.push('-- Crear base de datos');
  sqlOutput.push('CREATE DATABASE IF NOT EXISTS `orto_whave_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
  sqlOutput.push('USE `orto_whave_db`;\n');
  
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
  
  function exportTable(tableName, callback) {
    console.log(`📋 Exportando tabla: ${tableName}`);
    
    // Obtener estructura de la tabla
    db.get(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'`, (err, row) => {
      if (err) {
        console.error(`❌ Error obteniendo estructura de ${tableName}:`, err.message);
        callback();
        return;
      }
      
      if (!row) {
        console.log(`⚠️ Tabla ${tableName} no encontrada`);
        callback();
        return;
      }
      
      // Convertir CREATE TABLE de SQLite a MySQL
      const mysqlCreateTable = convertToMySQLCreateTable(tableName, row.sql);
      sqlOutput.push(`-- Estructura de tabla para ${tableName}`);
      sqlOutput.push(`DROP TABLE IF EXISTS \`${tableName}\`;`);
      sqlOutput.push(mysqlCreateTable + '\n');
      
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
                return `'${value.replace(/'/g, "''")}'`;
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
    });
  }
  
  function convertToMySQLCreateTable(tableName, sqliteSQL) {
    // Conversiones básicas de SQLite a MySQL
    let mysqlSQL = sqliteSQL
      .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'INT AUTO_INCREMENT PRIMARY KEY')
      .replace(/INTEGER/gi, 'INT')
      .replace(/TEXT/gi, 'TEXT')
      .replace(/REAL/gi, 'DECIMAL(10,2)')
      .replace(/BLOB/gi, 'LONGBLOB')
      .replace(/DATETIME/gi, 'DATETIME')
      .replace(/BOOLEAN/gi, 'TINYINT(1)')
      .replace(/VARCHAR\(([^)]+)\)/gi, 'VARCHAR($1)')
      .replace(/CURRENT_TIMESTAMP/gi, 'CURRENT_TIMESTAMP');
    
    // Ajustes específicos por tabla
    if (tableName === 'usuarios') {
      mysqlSQL = mysqlSQL.replace(/CREATE TABLE "?usuarios"?/gi, 'CREATE TABLE `usuarios`');
    } else if (tableName === 'roles') {
      mysqlSQL = mysqlSQL.replace(/CREATE TABLE "?roles"?/gi, 'CREATE TABLE `roles`');
    } else if (tableName === 'perfiles_medicos') {
      mysqlSQL = mysqlSQL.replace(/CREATE TABLE "?perfiles_medicos"?/gi, 'CREATE TABLE `perfiles_medicos`');
    } else if (tableName === 'pacientes') {
      mysqlSQL = mysqlSQL.replace(/CREATE TABLE "?pacientes"?/gi, 'CREATE TABLE `pacientes`');
    } else if (tableName === 'citas') {
      mysqlSQL = mysqlSQL.replace(/CREATE TABLE "?citas"?/gi, 'CREATE TABLE `citas`');
    } else if (tableName === 'historias_clinicas') {
      mysqlSQL = mysqlSQL.replace(/CREATE TABLE "?historias_clinicas"?/gi, 'CREATE TABLE `historias_clinicas`');
    }
    
    // Limpiar comillas dobles y reemplazar con backticks
    mysqlSQL = mysqlSQL.replace(/"/g, '`');
    
    // Agregar ENGINE y CHARSET para MySQL
    mysqlSQL = mysqlSQL.replace(/\);?\s*$/, '') + ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;';
    
    return mysqlSQL;
  }
});
