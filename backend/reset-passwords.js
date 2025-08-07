const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function resetPasswords() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'ortowhave',
    password: 'Root1234a',
    database: 'orto_whave_db'
  });

  console.log('🔐 Generando contraseñas hasheadas...');
  
  // Hashear las contraseñas
  const adminPassword = await bcrypt.hash('admin123', 12);
  const doctorPassword = await bcrypt.hash('doctor123', 12);
  const pacientePassword = await bcrypt.hash('paciente123', 12);

  console.log('📝 Actualizando contraseñas en la base de datos...');

  // Actualizar las contraseñas
  await connection.execute(
    'UPDATE usuarios SET password = ? WHERE email = ?',
    [adminPassword, 'admin@ortowhave.com']
  );

  await connection.execute(
    'UPDATE usuarios SET password = ? WHERE email = ?',
    [doctorPassword, 'doctor@ortowhave.com']
  );

  await connection.execute(
    'UPDATE usuarios SET password = ? WHERE email = ?',
    [pacientePassword, 'paciente@ortowhave.com']
  );

  console.log('✅ Contraseñas actualizadas exitosamente:');
  console.log('   - admin@ortowhave.com: admin123');
  console.log('   - doctor@ortowhave.com: doctor123');
  console.log('   - paciente@ortowhave.com: paciente123');

  await connection.end();
}

resetPasswords().catch(console.error);
