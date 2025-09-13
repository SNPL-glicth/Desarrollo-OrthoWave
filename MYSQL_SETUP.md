# Configuración de MySQL Server - Orto-Whave

Esta guía detalla la configuración de MySQL Server para el sistema Orto-Whave.

## Información de Configuración

**Base de Datos:** MySQL Server  
**Puerto:** 3306  
**Encoding:** UTF-8  
**Collation:** utf8mb4_unicode_ci  

## Instalación de MySQL Server

### Ubuntu/Debian
```bash
# Actualizar paquetes
sudo apt update

# Instalar MySQL Server
sudo apt install mysql-server -y

# Configuración segura inicial
sudo mysql_secure_installation

# Iniciar y habilitar MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Verificar estado
sudo systemctl status mysql
```

### CentOS/RHEL/Fedora
```bash
# Instalar MySQL Server
sudo dnf install mysql-server -y

# O para versiones más antiguas
sudo yum install mysql-server -y

# Iniciar y habilitar MySQL
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Configuración segura
sudo mysql_secure_installation
```

### Windows
1. Descargar MySQL Server desde [mysql.com](https://dev.mysql.com/downloads/mysql/)
2. Ejecutar el instalador
3. Seguir el wizard de configuración
4. Configurar puerto 3306 y root password

### macOS
```bash
# Usando Homebrew
brew install mysql

# Iniciar MySQL
brew services start mysql

# Configuración segura
mysql_secure_installation
```

## Configuración de Base de Datos

### 1. Acceder a MySQL como Root
```bash
sudo mysql -u root -p
```

### 2. Crear Base de Datos y Usuario

```sql
-- Crear base de datos
CREATE DATABASE orto_whave_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario para la aplicación
CREATE USER 'ortowhave'@'localhost' IDENTIFIED BY 'Root1234a';

-- Otorgar permisos completos al usuario
GRANT ALL PRIVILEGES ON orto_whave_db.* TO 'ortowhave'@'localhost';

-- Para desarrollo, también permitir desde cualquier host
CREATE USER 'ortowhave'@'%' IDENTIFIED BY 'Root1234a';
GRANT ALL PRIVILEGES ON orto_whave_db.* TO 'ortowhave'@'%';

-- Aplicar cambios
FLUSH PRIVILEGES;

-- Mostrar usuarios creados
SELECT User, Host FROM mysql.user WHERE User = 'ortowhave';

-- Salir de MySQL
EXIT;
```

### 3. Verificar Conexión
```bash
# Probar conexión con el nuevo usuario
mysql -u ortowhave -p -h localhost orto_whave_db

# O especificando el puerto
mysql -u ortowhave -p -h localhost -P 3306 orto_whave_db
```

## Configuración de Variables de Entorno

### Archivo .env del Backend
```env
# Base de datos MySQL
DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=ortowhave
DATABASE_PASSWORD=Root1234a
DATABASE_NAME=orto_whave_db

# Configuraciones adicionales de MySQL
DATABASE_CHARSET=utf8mb4
DATABASE_COLLATION=utf8mb4_unicode_ci
DATABASE_SYNCHRONIZE=false
DATABASE_LOGGING=true
DATABASE_TIMEZONE=Z
```

### Configuración de Producción
```env
# Para producción, usar valores más seguros
DATABASE_HOST=tu-servidor-mysql.com
DATABASE_USERNAME=ortowhave_prod
DATABASE_PASSWORD=Contraseña_Muy_Segura_Con_Caracteres_Especiales_123!
DATABASE_NAME=ortowhave_production
DATABASE_SYNCHRONIZE=false
DATABASE_LOGGING=false
```

## Configuración de TypeORM

### archivo `backend/src/config/database.config.ts`
```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT) || 3306,
  username: process.env.DATABASE_USERNAME || 'ortowhave',
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || 'orto_whave_db',
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development' && 
              process.env.DATABASE_SYNCHRONIZE === 'true',
  logging: process.env.DATABASE_LOGGING === 'true',
  timezone: 'Z', // UTC
  extra: {
    connectionLimit: 20,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    idleTimeoutMillis: 600000,
    reapIntervalMillis: 1000,
  },
};
```

## Migraciones de Base de Datos

### Ejecutar Migraciones Iniciales
```bash
# Navegar al directorio del backend
cd backend

# Instalar dependencias si no están instaladas
npm install

# Ejecutar migraciones
npm run migration:run

# Verificar estado de las migraciones
npm run migration:show
```

### Comandos Útiles de Migración
```bash
# Generar nueva migración
npm run migration:generate -- -n NombreDeLaMigracion

# Crear migración vacía
npm run migration:create -- -n NombreDeLaMigracion

# Revertir última migración
npm run migration:revert

# Ejecutar seed de datos iniciales
npm run seed
```

## Optimización y Configuración Avanzada

### my.cnf / mysqld.cnf (Linux)
```ini
[mysqld]
# Configuración de conexiones
max_connections = 200
max_user_connections = 150

# Buffer pools
innodb_buffer_pool_size = 1G
innodb_buffer_pool_instances = 4

# Log files
innodb_log_file_size = 256M
innodb_log_files_in_group = 2

# Character set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Timezone
default-time-zone = '+00:00'

# Query cache
query_cache_type = 1
query_cache_size = 128M

# Slow query log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
```

### Reiniciar MySQL después de cambios
```bash
sudo systemctl restart mysql
# o
sudo service mysql restart
```

## Backup y Restore

### Backup
```bash
# Backup completo
mysqldump -u ortowhave -p --single-transaction --routines --triggers orto_whave_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup solo estructura
mysqldump -u ortowhave -p --no-data orto_whave_db > estructura_$(date +%Y%m%d).sql

# Backup automatizado (agregar a crontab)
0 2 * * * /usr/bin/mysqldump -u ortowhave -pRoot1234a --single-transaction orto_whave_db > /backups/ortowhave_$(date +\%Y\%m\%d).sql
```

### Restore
```bash
# Restaurar desde backup
mysql -u ortowhave -p orto_whave_db < backup_20250122_020000.sql

# Restaurar solo estructura
mysql -u ortowhave -p orto_whave_db < estructura_20250122.sql
```

## Monitoreo y Mantenimiento

### Verificar Estado de la Base de Datos
```sql
-- Mostrar información general
SHOW STATUS;

-- Mostrar configuración actual
SHOW VARIABLES;

-- Verificar conexiones activas
SHOW PROCESSLIST;

-- Estadísticas de tablas
SELECT 
    table_schema AS 'Database',
    table_name AS 'Table',
    round(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'orto_whave_db'
ORDER BY (data_length + index_length) DESC;

-- Verificar fragmentación
SELECT 
    table_name,
    round(data_free / 1024 / 1024, 2) AS 'Free Space (MB)'
FROM information_schema.tables
WHERE table_schema = 'orto_whave_db' AND data_free > 0;
```

### Optimización de Tablas
```sql
-- Optimizar una tabla específica
OPTIMIZE TABLE citas;

-- Optimizar todas las tablas
SELECT CONCAT('OPTIMIZE TABLE ', table_schema, '.', table_name, ';') 
FROM information_schema.tables 
WHERE table_schema = 'orto_whave_db';
```

## Troubleshooting

### Problemas Comunes

#### Error: "Can't connect to MySQL server"
```bash
# Verificar que MySQL esté corriendo
sudo systemctl status mysql

# Verificar puerto
netstat -tlnp | grep :3306

# Verificar logs
sudo tail -f /var/log/mysql/error.log
```

#### Error: "Access denied for user"
```sql
-- Verificar usuario y permisos
SELECT User, Host FROM mysql.user WHERE User = 'ortowhave';
SHOW GRANTS FOR 'ortowhave'@'localhost';

-- Resetear contraseña si es necesario
ALTER USER 'ortowhave'@'localhost' IDENTIFIED BY 'nueva_contraseña';
FLUSH PRIVILEGES;
```

#### Error: "Table doesn't exist"
```bash
# Verificar que las migraciones se ejecutaron
npm run migration:show

# Ejecutar migraciones pendientes
npm run migration:run
```

#### Performance Issues
```sql
-- Verificar queries lentas
SELECT * FROM information_schema.PROCESSLIST WHERE COMMAND != 'Sleep';

-- Habilitar slow query log temporalmente
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;
```

## Seguridad

### Recomendaciones de Seguridad
1. **Usar contraseñas fuertes** para todos los usuarios
2. **Limitar conexiones** por host cuando sea posible
3. **Configurar firewall** para permitir solo conexiones necesarias
4. **Mantener MySQL actualizado** con patches de seguridad
5. **Eliminar usuarios y bases de datos de prueba**
6. **Configurar SSL** para conexiones de producción

### Configurar SSL (Producción)
```sql
-- Verificar si SSL está habilitado
SHOW VARIABLES LIKE 'have_ssl';

-- Crear usuario que requiera SSL
CREATE USER 'ortowhave_ssl'@'%' IDENTIFIED BY 'password' REQUIRE SSL;
```

---

## Scripts de Utilidad

### Script de Verificación de Conexión
```bash
#!/bin/bash
# check_mysql.sh

echo "Verificando conexión a MySQL..."
mysql -u ortowhave -p$DATABASE_PASSWORD -h localhost -e "SELECT 1;" orto_whave_db

if [ $? -eq 0 ]; then
    echo "✅ Conexión exitosa a MySQL"
else
    echo "❌ Error de conexión a MySQL"
    exit 1
fi
```

### Script de Backup Automatizado
```bash
#!/bin/bash
# backup_db.sh

BACKUP_DIR="/backups/ortowhave"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/ortowhave_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

echo "Iniciando backup de base de datos..."
mysqldump -u ortowhave -p$DATABASE_PASSWORD --single-transaction --routines --triggers orto_whave_db > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup completado: $BACKUP_FILE"
    # Comprimir backup
    gzip $BACKUP_FILE
    echo "✅ Backup comprimido: $BACKUP_FILE.gz"
    
    # Limpiar backups antiguos (más de 7 días)
    find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
else
    echo "❌ Error en el backup"
    exit 1
fi
```

---

**Documento generado:** Enero 2025  
**Sistema:** Orto-Whave v2.0.0  
**Base de datos:** MySQL Server 8.0+  
