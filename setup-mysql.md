# Configuración de MySQL para Orto-Whave

## 1. Instalar MySQL en Debian/Ubuntu

```bash
# Actualizar repositorios
sudo apt update

# Instalar MySQL Server
sudo apt install mysql-server

# Verificar que está corriendo
sudo systemctl status mysql

# Si no está corriendo, iniciarlo
sudo systemctl start mysql
sudo systemctl enable mysql
```

## 2. Configurar MySQL

```bash
# Ejecutar configuración segura (opcional)
sudo mysql_secure_installation

# Conectar como root
sudo mysql -u root -p
```

## 3. Crear usuario y base de datos

```sql
-- Crear base de datos
CREATE DATABASE orto_whave_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario
CREATE USER 'ortowhave'@'localhost' IDENTIFIED BY 'Root1234a';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON orto_whave_db.* TO 'ortowhave'@'localhost';

-- Aplicar cambios
FLUSH PRIVILEGES;

-- Verificar usuario creado
SELECT User, Host FROM mysql.user WHERE User = 'ortowhave';

-- Salir
EXIT;
```

## 4. Importar datos desde SQLite

```bash
# Desde el directorio backend
mysql -u ortowhave -p orto_whave_db < migration-to-mysql.sql
```

## 5. Verificar instalación

```bash
# Probar conexión
mysql -u ortowhave -p orto_whave_db

# Dentro de MySQL, verificar tablas
SHOW TABLES;
SELECT COUNT(*) FROM usuarios;
```

## 6. Si MySQL está en servidor remoto

Actualizar el archivo `.env`:

```env
# Configuración de Base de Datos MySQL
DB_HOST=IP_DEL_SERVIDOR
DB_PORT=3306
DB_USERNAME=ortowhave
DB_PASSWORD=Root1234a
DB_DATABASE=orto_whave_db
```

## 7. Comandos útiles

```bash
# Ver estado de MySQL
sudo systemctl status mysql

# Reiniciar MySQL
sudo systemctl restart mysql

# Ver logs de MySQL
sudo tail -f /var/log/mysql/error.log

# Conectar directamente
mysql -u ortowhave -p -h localhost orto_whave_db
```
