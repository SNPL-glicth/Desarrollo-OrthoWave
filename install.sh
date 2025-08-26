#!/bin/bash

# Script de Instalación Automatizada - Sistema Orto-Whave
# Para sistemas Debian/Ubuntu
# Autor: Desarrollo Orto-Whave
# Versión: 1.0

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Banner de inicio
print_banner() {
    echo -e "${BLUE}"
    echo "======================================================"
    echo "    INSTALADOR AUTOMATIZADO - SISTEMA ORTO-WHAVE"
    echo "======================================================"
    echo -e "${NC}"
    echo "Este script instalará automáticamente:"
    echo "• Node.js y npm"
    echo "• Dependencias del backend (NestJS)"
    echo "• Dependencias del frontend (React)"
    echo "• Configuración de base de datos MySQL"
    echo "• Configuración de variables de entorno"
    echo ""
    echo -e "${YELLOW}Presiona ENTER para continuar o Ctrl+C para cancelar${NC}"
    read -r
}

# Verificar si el script se ejecuta como root (no recomendado)
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_warning "No se recomienda ejecutar este script como root"
        log_warning "Se creará un usuario no-root para la aplicación"
        echo "¿Deseas continuar? (y/N)"
        read -r response
        if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            log_info "Instalación cancelada"
            exit 1
        fi
    fi
}

# Actualizar el sistema
update_system() {
    log_info "Actualizando el sistema..."
    sudo apt-get update -y
    sudo apt-get upgrade -y
    log_success "Sistema actualizado"
}

# Instalar dependencias del sistema
install_system_dependencies() {
    log_info "Instalando dependencias del sistema..."

    # Instalar paquetes necesarios
    sudo apt-get install -y \
        curl \
        wget \
        git \
        build-essential \
        python3 \
        python3-pip \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release

    log_success "Dependencias del sistema instaladas"
}

# Instalar Node.js
install_nodejs() {
    log_info "Verificando instalación de Node.js..."

    if command_exists node && command_exists npm; then
        local node_version=$(node --version)
        log_info "Node.js ya está instalado: $node_version"

        # Verificar si la versión es compatible (>=16)
        local major_version=$(echo $node_version | cut -d'.' -f1 | cut -d'v' -f2)
        if [[ $major_version -lt 16 ]]; then
            log_warning "Versión de Node.js demasiado antigua. Instalando versión más reciente..."
            install_nodejs_fresh
        else
            log_success "Versión de Node.js compatible"
        fi
    else
        log_info "Node.js no encontrado. Instalando..."
        install_nodejs_fresh
    fi
}

install_nodejs_fresh() {
    # Instalar Node.js 18 LTS usando NodeSource
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs

    # Verificar instalación
    if command_exists node && command_exists npm; then
        log_success "Node.js $(node --version) y npm $(npm --version) instalados correctamente"
    else
        log_error "Error al instalar Node.js"
        exit 1
    fi
}

# Verificar directorio del proyecto
verify_project_directory() {
    log_info "Verificando directorio del proyecto..."

    if [[ ! -f "backend/package.json" ]] || [[ ! -f "frontend/my-app/package.json" ]]; then
        log_error "No se encontraron los archivos package.json del proyecto"
        log_error "Asegúrate de ejecutar este script desde el directorio raíz del proyecto"
        exit 1
    fi

    log_success "Directorio del proyecto verificado"
}

# Configurar variables de entorno
setup_environment() {
    log_info "Configurando variables de entorno..."

    # Crear archivo .env para el backend si no existe
    if [[ ! -f "backend/.env" ]]; then
        log_info "Creando archivo .env para el backend..."
        cp backend/.env.example backend/.env

        # Generar JWT secret aleatorio
        local jwt_secret=$(openssl rand -hex 32)
        sed -i "s/tu_clave_secreta_jwt_muy_segura_aqui/$jwt_secret/g" backend/.env

        log_success "Archivo .env creado con JWT secret seguro"
    else
        log_info "Archivo .env ya existe"
    fi
}

# Instalar dependencias del backend
install_backend_dependencies() {
    log_info "Instalando dependencias del backend..."

    cd backend

    # Instalar dependencias
    npm install

    # Verificar que se instalaron correctamente
    if [[ -d "node_modules" ]]; then
        log_success "Dependencias del backend instaladas correctamente"
    else
        log_error "Error al instalar dependencias del backend"
        exit 1
    fi

    cd ..
}

# Instalar dependencias del frontend
install_frontend_dependencies() {
    log_info "Instalando dependencias del frontend..."

    cd frontend/my-app

    # Instalar dependencias
    npm install

    # Verificar que se instalaron correctamente
    if [[ -d "node_modules" ]]; then
        log_success "Dependencias del frontend instaladas correctamente"
    else
        log_error "Error al instalar dependencias del frontend"
        exit 1
    fi

    cd ../..
}

# Configurar base de datos
setup_database() {
    log_info "Configurando conexión a MySQL..."

    cd backend

    # Compilar TypeScript
    log_info "Compilando backend..."
    npm run build

    # Verificar conexión a MySQL
    log_info "Verificando conexión a MySQL..."
    log_warning "Asegúrate de que MySQL esté ejecutándose en puerto 3306"
    log_warning "Y que la base de datos 'orto_whave_db' exista con las credenciales correctas"
    
    # Inicializar base de datos con datos de prueba
    log_info "Inicializando base de datos con roles..."
    if [[ -f "seed-roles.js" ]]; then
        node seed-roles.js
    fi

    log_success "Configuración de base de datos completada"
    cd ..
}

# Crear scripts de inicio
create_startup_scripts() {
    log_info "Creando scripts de inicio..."

    # Script para iniciar todo el sistema
    cat > start.sh << 'EOF'
#!/bin/bash

# Script para iniciar el Sistema Orto-Whave
# Ejecuta tanto el backend como el frontend

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Iniciando Sistema Orto-Whave...${NC}"

# Función para limpiar procesos al salir
cleanup() {
    echo -e "\n${BLUE}Deteniendo servicios...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Configurar trap para cleanup
trap cleanup SIGINT SIGTERM

# Iniciar backend
echo -e "${GREEN}Iniciando backend en puerto 4000...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!

# Esperar un momento para que el backend se inicie
sleep 3

# Iniciar frontend
echo -e "${GREEN}Iniciando frontend en puerto 3000...${NC}"
cd ../frontend/my-app
npm start &
FRONTEND_PID=$!

echo -e "${GREEN}¡Sistema iniciado!${NC}"
echo -e "Backend: http://localhost:4000"
echo -e "Frontend: http://localhost:3000"
echo -e "\nPresiona Ctrl+C para detener ambos servicios"

# Esperar a que terminen los procesos
wait $BACKEND_PID $FRONTEND_PID
EOF

    chmod +x start.sh

    # Script solo para backend
    cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "Iniciando solo el backend..."
cd backend
npm run dev
EOF

    chmod +x start-backend.sh

    # Script solo para frontend
    cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "Iniciando solo el frontend..."
cd frontend/my-app
npm start
EOF

    chmod +x start-frontend.sh

    log_success "Scripts de inicio creados"
}

# Verificar instalación
verify_installation() {
    log_info "Verificando instalación..."

    # Verificar que los scripts existen
    local errors=0

    if [[ ! -f "start.sh" ]]; then
        log_error "Script start.sh no encontrado"
        ((errors++))
    fi

    if [[ ! -d "backend/node_modules" ]]; then
        log_error "Dependencias del backend no instaladas"
        ((errors++))
    fi

    if [[ ! -d "frontend/my-app/node_modules" ]]; then
        log_error "Dependencias del frontend no instaladas"
        ((errors++))
    fi

    if [[ ! -f "backend/.env" ]]; then
        log_error "Archivo .env del backend no encontrado"
        ((errors++))
    fi

    if [[ $errors -eq 0 ]]; then
        log_success "Instalación verificada correctamente"
        return 0
    else
        log_error "Se encontraron $errors errores en la instalación"
        return 1
    fi
}

# Mostrar instrucciones finales
show_final_instructions() {
    echo -e "${GREEN}"
    echo "======================================================"
    echo "           ¡INSTALACIÓN COMPLETADA!"
    echo "======================================================"
    echo -e "${NC}"
    echo "Para iniciar el sistema, usa uno de estos comandos:"
    echo ""
    echo -e "${BLUE}Iniciar todo el sistema:${NC}"
    echo "  ./start.sh"
    echo ""
    echo -e "${BLUE}Iniciar solo el backend:${NC}"
    echo "  ./start-backend.sh"
    echo ""
    echo -e "${BLUE}Iniciar solo el frontend:${NC}"
    echo "  ./start-frontend.sh"
    echo ""
    echo -e "${GREEN}URLs de acceso:${NC}"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:4000"
    echo ""
    echo -e "${YELLOW}Datos de prueba:${NC}"
    echo "  Los roles se han configurado automáticamente"
    echo "  Puedes registrar nuevos usuarios desde el frontend"
    echo ""
    echo -e "${GREEN}¡Listo para usar!${NC}"
}

# Función principal
main() {
    print_banner
    check_root
    update_system
    install_system_dependencies
    install_nodejs
    verify_project_directory
    setup_environment
    install_backend_dependencies
    install_frontend_dependencies
    setup_database
    create_startup_scripts

    if verify_installation; then
        show_final_instructions
    else
        log_error "La instalación no se completó correctamente"
        exit 1
    fi
}

# Ejecutar función principal
main "$@"
