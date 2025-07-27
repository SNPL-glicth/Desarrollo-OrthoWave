#!/bin/bash

# Script de consultas rápidas para la base de datos Orto-Whave
# Uso: ./db-queries.sh [comando]

DB_USER="ortowhave"
DB_PASS="Root1234a"
DB_NAME="orto_whave_db"

case $1 in
  "users" | "usuarios")
    echo "📋 Usuarios del sistema:"
    mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "
    SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, r.nombre as rol, u.is_verified, u.fecha_creacion 
    FROM usuarios u 
    JOIN roles r ON u.rol_id = r.id 
    ORDER BY u.id;"
    ;;
    
  "doctors" | "doctores")
    echo "👨‍⚕️ Doctores y sus especialidades:"
    mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "
    SELECT u.nombre, u.apellido, u.email, pm.especialidad, pm.numero_registro_medico, 
           pm.acepta_nuevos_pacientes, pm.tarifa_consulta 
    FROM usuarios u 
    JOIN perfiles_medicos pm ON u.id = pm.usuario_id 
    WHERE u.rol_id = 2;"
    ;;
    
  "appointments" | "citas")
    echo "📅 Citas del sistema:"
    mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "
    SELECT c.id, p.nombre as paciente, d.nombre as doctor, c.fechaHora, c.estado, 
           c.tipoConsulta, c.motivoConsulta 
    FROM citas c 
    JOIN usuarios p ON c.paciente_id = p.id 
    JOIN usuarios d ON c.doctor_id = d.id 
    ORDER BY c.fechaHora DESC;"
    ;;
    
  "roles")
    echo "👤 Roles del sistema:"
    mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "
    SELECT * FROM roles ORDER BY id;"
    ;;
    
  "tables" | "tablas")
    echo "🗃️ Tablas de la base de datos:"
    mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "SHOW TABLES;"
    ;;
    
  "status" | "estado")
    echo "📊 Estado de la base de datos:"
    echo "Total usuarios: $(mysql -u $DB_USER -p$DB_PASS $DB_NAME -se "SELECT COUNT(*) FROM usuarios;")"
    echo "Total doctores: $(mysql -u $DB_USER -p$DB_PASS $DB_NAME -se "SELECT COUNT(*) FROM usuarios WHERE rol_id = 2;")"
    echo "Total pacientes: $(mysql -u $DB_USER -p$DB_PASS $DB_NAME -se "SELECT COUNT(*) FROM usuarios WHERE rol_id = 3;")"
    echo "Total citas: $(mysql -u $DB_USER -p$DB_PASS $DB_NAME -se "SELECT COUNT(*) FROM citas;")"
    ;;
    
  "help" | *)
    echo "🔧 Script de consultas Orto-Whave"
    echo "Uso: ./db-queries.sh [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  users|usuarios    - Mostrar todos los usuarios"
    echo "  doctors|doctores  - Mostrar doctores y especialidades"
    echo "  appointments|citas - Mostrar todas las citas"
    echo "  roles             - Mostrar roles del sistema"
    echo "  tables|tablas     - Mostrar tablas de la BD"
    echo "  status|estado     - Mostrar estadísticas generales"
    echo "  help              - Mostrar esta ayuda"
    ;;
esac
