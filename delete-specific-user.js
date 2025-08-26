#!/usr/bin/env node

/**
 * Script para eliminar un usuario específico de la base de datos
 * Este script elimina completamente el usuario y todos sus datos asociados
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
// Cargar variables de entorno desde backend/.env explícitamente
const path = require('path');
const envPath = path.join(__dirname, 'backend', '.env');
require('dotenv').config({ path: envPath });

// Configuración de la base de datos desde variables de entorno
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1', // forzar IPv4 por defecto
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USERNAME || 'ortowhave',
  password: process.env.DB_PASSWORD || 'Root123a',
  database: process.env.DB_DATABASE || 'orto_whave_db'
};

const EMAIL_TO_DELETE = 'sandevistan2510@gmail.com';

async function deleteUserAndData() {
  let connection;
  
  try {
    console.log('=== ELIMINANDO USUARIO ===');
    console.log(`Email: ${EMAIL_TO_DELETE}`);
    console.log('Configuración de conexión:');
    console.log(`- Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`- Database: ${dbConfig.database}`);
    console.log(`- User: ${dbConfig.user}`);
    console.log('Conectando a la base de datos...');
    
    connection = await mysql.createConnection(dbConfig);
    
    // Iniciar transacción para asegurar consistencia
    await connection.beginTransaction();
    
    // 1. Buscar el usuario
    console.log('\n1. Buscando usuario...');
    const [userRows] = await connection.execute(
      'SELECT u.*, r.nombre as rol_nombre FROM usuarios u LEFT JOIN roles r ON u.rol_id = r.id WHERE u.email = ?',
      [EMAIL_TO_DELETE]
    );
    
    if (userRows.length === 0) {
      console.log(`❌ No se encontró el usuario con email: ${EMAIL_TO_DELETE}`);
      await connection.rollback();
      return;
    }
    
    const user = userRows[0];
    console.log(`✅ Usuario encontrado: ${user.nombre} ${user.apellido} (ID: ${user.id}, Rol: ${user.rol_nombre})`);
    
    let deletedDocuments = 0;
    let deletedPatientProfile = false;
    let deletedMedicalProfile = false;
    
    // 2. Si es paciente, eliminar documentos y perfil de paciente
    if (user.rol_nombre === 'paciente') {
      console.log('\n2. Eliminando datos de paciente...');
      
      // Buscar perfil de paciente
      const [patientRows] = await connection.execute(
        'SELECT * FROM pacientes WHERE usuario_id = ?',
        [user.id]
      );
      
      if (patientRows.length > 0) {
        const patient = patientRows[0];
        console.log(`📋 Perfil de paciente encontrado (ID: ${patient.id})`);
        
        // Buscar y eliminar documentos
        const [documentRows] = await connection.execute(
          'SELECT * FROM patient_documents WHERE patient_id = ?',
          [patient.id]
        );
        
        console.log(`📄 Encontrados ${documentRows.length} documentos para eliminar`);
        
        for (const doc of documentRows) {
          try {
      // Eliminar archivo físico si existe
            if (fs.existsSync(doc.file_path)) {
              fs.unlinkSync(doc.file_path);
              console.log(`🗑️  Archivo eliminado: ${doc.file_path}`);
            } else {
              console.log(`⚠️  Archivo no encontrado: ${doc.file_path}`);
            }
            
            // Eliminar registro de documento
            await connection.execute('DELETE FROM patient_documents WHERE id = ?', [doc.id]);
            deletedDocuments++;
            
          } catch (error) {
            console.log(`❌ Error eliminando documento ${doc.id}:`, error.message);
          }
        }
        
        // Eliminar perfil de paciente
        await connection.execute('DELETE FROM pacientes WHERE id = ?', [patient.id]);
        deletedPatientProfile = true;
        console.log('✅ Perfil de paciente eliminado');
      }
    }
    
    // 3. Si es doctor, eliminar perfil médico
    if (user.rol_nombre === 'doctor') {
      console.log('\n3. Eliminando datos de doctor...');
      
      const [medicalProfileRows] = await connection.execute(
        'SELECT * FROM perfiles_medicos WHERE usuario_id = ?',
        [user.id]
      );
      
      if (medicalProfileRows.length > 0) {
        await connection.execute('DELETE FROM perfiles_medicos WHERE usuario_id = ?', [user.id]);
        deletedMedicalProfile = true;
        console.log('✅ Perfil médico eliminado');
      }
    }
    
    // 4. Eliminar otras relaciones si existen (citas, etc.)
    console.log('\n4. Eliminando otras relaciones...');
    
    // Eliminar citas donde el usuario es paciente o doctor
    const [appointmentRows] = await connection.execute(
      'DELETE FROM citas WHERE paciente_id = ? OR doctor_id = ?',
      [user.id, user.id]
    );
    
    if (appointmentRows.affectedRows > 0) {
      console.log(`✅ ${appointmentRows.affectedRows} citas eliminadas`);
    }
    
    // 5. Eliminar el usuario principal
    console.log('\n5. Eliminando usuario principal...');
    await connection.execute('DELETE FROM usuarios WHERE id = ?', [user.id]);
    console.log('✅ Usuario eliminado de la tabla usuarios');
    
    // Confirmar transacción
    await connection.commit();
    
    // Resumen
    console.log('\n=== RESUMEN DE ELIMINACIÓN ===');
    console.log(`✅ Usuario eliminado: ${user.email}`);
    console.log(`📋 Perfil de paciente eliminado: ${deletedPatientProfile ? 'Sí' : 'No'}`);
    console.log(`👨‍⚕️ Perfil médico eliminado: ${deletedMedicalProfile ? 'Sí' : 'No'}`);
    console.log(`📄 Documentos eliminados: ${deletedDocuments}`);
    console.log(`✅ Eliminación completada exitosamente`);
    
  } catch (error) {
    console.error('❌ Error durante la eliminación:', error.message);
    
    if (connection) {
      await connection.rollback();
      console.log('🔄 Transacción revertida');
    }
    
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Función de confirmación
async function confirmDeletion() {
  console.log('⚠️  ADVERTENCIA: Esta operación eliminará permanentemente el usuario y todos sus datos.');
  console.log(`📧 Email a eliminar: ${EMAIL_TO_DELETE}`);
  console.log('🚨 Esta operación NO se puede deshacer.');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    readline.question('\n¿Está seguro de que desea continuar? (escriba "CONFIRMAR" para proceder): ', (answer) => {
      readline.close();
      resolve(answer === 'CONFIRMAR');
    });
  });
}

// Ejecutar script principal
async function main() {
  try {
    const confirmed = await confirmDeletion();
    
    if (!confirmed) {
      console.log('❌ Operación cancelada por el usuario.');
      process.exit(0);
    }
    
    await deleteUserAndData();
    console.log('\n🎉 Proceso completado exitosamente');
    
  } catch (error) {
    console.error('\n💥 Error fatal:', error.message);
    process.exit(1);
  }
}

// Solo ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { deleteUserAndData };
