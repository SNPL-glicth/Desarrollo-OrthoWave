const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

async function setupEmailCredentials() {
  console.log('🔧 Configurando credenciales de email de prueba...');

  try {
    // Crear una cuenta de prueba en Ethereal Email
    console.log('📧 Creando cuenta de prueba en Ethereal Email...');
    const testAccount = await nodemailer.createTestAccount();

    console.log('✅ Cuenta de prueba creada:');
    console.log('📧 Email:', testAccount.user);
    console.log('🔑 Password:', testAccount.pass);
    console.log('🖥️ SMTP Host:', testAccount.smtp.host);
    console.log('🔌 SMTP Port:', testAccount.smtp.port);
    console.log('');

    // Actualizar archivo .env con las credenciales reales
    const envPath = path.join(__dirname, 'backend', '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Reemplazar las configuraciones de email
    envContent = envContent.replace(/MAIL_HOST=.*/, `MAIL_HOST=${testAccount.smtp.host}`);
    envContent = envContent.replace(/MAIL_PORT=.*/, `MAIL_PORT=${testAccount.smtp.port}`);
    envContent = envContent.replace(/MAIL_USER=.*/, `MAIL_USER=${testAccount.user}`);
    envContent = envContent.replace(/MAIL_PASS=.*/, `MAIL_PASS=${testAccount.pass}`);
    envContent = envContent.replace(/MAIL_SECURE=.*/, `MAIL_SECURE=${testAccount.smtp.secure}`);

    fs.writeFileSync(envPath, envContent);

    console.log('✅ Archivo .env actualizado con credenciales válidas');
    console.log('');

    // Probar el envío de email
    console.log('📨 Probando envío de email...');
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: '"Orto-Whave Test" <noreply@ortowhave.com>',
      to: testAccount.user,
      subject: 'Prueba de configuración de email',
      html: `
        <h2>🎉 ¡Email configurado correctamente!</h2>
        <p>Este es un email de prueba para verificar que el servicio de email de Orto-Whave está funcionando.</p>
        <p><strong>Código de verificación de prueba:</strong> 123456</p>
        <hr>
        <small>Este email fue enviado desde el sistema de pruebas de Orto-Whave</small>
      `,
    });

    console.log('✅ Email enviado exitosamente!');
    console.log('📧 Message ID:', info.messageId);
    console.log('🔗 Preview URL:', nodemailer.getTestMessageUrl(info));
    console.log('');

    console.log('🎉 ¡Configuración de email completada exitosamente!');
    console.log('');
    console.log('📋 PRÓXIMOS PASOS:');
    console.log('1. Reinicia el backend para cargar las nuevas credenciales');
    console.log('2. Prueba el registro de usuarios');
    console.log('3. Los emails se pueden ver en:', nodemailer.getTestMessageUrl(info));
    console.log('');
    console.log('⚠️  NOTA: Para producción, configura credenciales reales de Gmail o un servicio de email profesional.');

  } catch (error) {
    console.error('❌ Error al configurar email:', error);
  }
}

// Ejecutar configuración
setupEmailCredentials();
