-- Configuración de base de datos y usuario para Orto-Whave

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS orto_whave_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario si no existe
CREATE USER IF NOT EXISTS 'ortowhave'@'localhost' IDENTIFIED BY 'Root1234a';

-- Otorgar todos los permisos sobre la base de datos
GRANT ALL PRIVILEGES ON orto_whave_db.* TO 'ortowhave'@'localhost';

-- Aplicar cambios
FLUSH PRIVILEGES;

-- Mostrar información
SELECT 'Base de datos creada exitosamente' as resultado;
SHOW DATABASES LIKE 'orto_whave_db';
SELECT User, Host FROM mysql.user WHERE User = 'ortowhave';
