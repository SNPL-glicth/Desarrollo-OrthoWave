#!/bin/bash

echo "🚀 Iniciando Sistema de Tiempo Real Orto-Whave..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
show_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

show_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

show_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    show_error "Este script debe ejecutarse desde el directorio raíz del proyecto Orto-Whave"
    exit 1
fi

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    show_warning "Cerrando servicios..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill -TERM $BACKEND_PID 2>/dev/null
        show_message "Backend terminado"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill -TERM $FRONTEND_PID 2>/dev/null
        show_message "Frontend terminado"
    fi
    exit 0
}

# Configurar trap para cleanup
trap cleanup SIGINT SIGTERM

# Verificar que las dependencias estén instaladas
show_step "Verificando dependencias..."

if [ ! -d "backend/node_modules" ]; then
    show_warning "Instalando dependencias del backend..."
    cd backend && npm install
    if [ $? -ne 0 ]; then
        show_error "Error al instalar dependencias del backend"
        exit 1
    fi
    cd ..
fi

if [ ! -d "frontend/my-app/node_modules" ]; then
    show_warning "Instalando dependencias del frontend..."
    cd frontend/my-app && npm install
    if [ $? -ne 0 ]; then
        show_error "Error al instalar dependencias del frontend"
        exit 1
    fi
    cd ../..
fi

show_message "Dependencias verificadas ✓"

# Verificar y liberar puerto 4000
show_step "Verificando puertos..."
if lsof -i :4000 > /dev/null 2>&1; then
    show_warning "Puerto 4000 ocupado, liberando..."
    pkill -f "node.*4000" || true
    sleep 2
fi

# Verificar puerto 3000
if lsof -i :3000 > /dev/null 2>&1; then
    show_warning "Puerto 3000 ocupado, liberando..."
    pkill -f "react-scripts" || true
    sleep 2
fi

show_message "Puertos verificados ✓"

# Compilar backend
show_step "Compilando backend..."
cd backend
npm run build
if [ $? -ne 0 ]; then
    show_error "Error al compilar el backend"
    exit 1
fi
cd ..

show_message "Backend compilado ✓"

# Crear logs directory si no existe
mkdir -p logs

# Iniciar backend
show_step "Iniciando backend (puerto 4000)..."
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Esperar a que el backend esté listo
show_message "Esperando que el backend esté listo..."
sleep 5

# Verificar que el backend está corriendo
if ! curl -s http://localhost:4000 > /dev/null; then
    show_error "El backend no está respondiendo en el puerto 4000"
    show_error "Revisa los logs: tail -f logs/backend.log"
    cleanup
    exit 1
fi

show_message "Backend iniciado exitosamente ✓"

# Iniciar frontend
show_step "Iniciando frontend (puerto 3000)..."
cd frontend/my-app
npm start > ../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ../..

# Esperar a que el frontend esté listo
show_message "Esperando que el frontend esté listo..."
sleep 10

# Verificar que el frontend está corriendo
if ! curl -s http://localhost:3000 > /dev/null; then
    show_warning "El frontend puede estar iniciándose aún..."
    show_message "Intenta abrir http://localhost:3000 en tu navegador"
else
    show_message "Frontend iniciado exitosamente ✓"
fi

# Mostrar información del sistema
echo ""
echo "┌─────────────────────────────────────────────────────────────────────────────────┐"
echo "│                     🎉 SISTEMA ORTO-WHAVE INICIADO EXITOSAMENTE 🎉              │"
echo "└─────────────────────────────────────────────────────────────────────────────────┘"
echo ""
echo "🌐 URLs del Sistema:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend API: http://localhost:4000"
echo "   • WebSocket: ws://localhost:4000"
echo ""
echo "👥 Usuarios de Prueba:"
echo "   • Admin: admin@ortowhave.com / admin123"
echo "   • Doctor: doctor@ortowhave.com / doctor123"
echo "   • Paciente: paciente@ortowhave.com / paciente123"
echo ""
echo "🔧 Características Activas:"
echo "   ✓ Actualizaciones en tiempo real con WebSocket"
echo "   ✓ Cache inteligente para optimización"
echo "   ✓ Indicadores de estado de conexión"
echo "   ✓ Respaldo automático con polling"
echo "   ✓ Invalidación automática de cache"
echo ""
echo "📊 Monitoreo:"
echo "   • Logs del backend: tail -f logs/backend.log"
echo "   • Logs del frontend: tail -f logs/frontend.log"
echo "   • Estado de procesos: ps aux | grep -E '(node|react)'"
echo ""
echo "💡 Pruebas Recomendadas:"
echo "   1. Abrir múltiples pestañas con diferentes usuarios"
echo "   2. Realizar cambios en una pestaña y verificar actualizaciones automáticas"
echo "   3. Crear/modificar citas y observar reflejos instantáneos"
echo "   4. Verificar indicadores de conexión en tiempo real"
echo ""
echo "🚨 Para detener el sistema: Presiona Ctrl+C"
echo ""

# Mantener el script corriendo
show_message "Sistema funcionando... (Presiona Ctrl+C para detener)"
while true; do
    # Verificar que los procesos sigan corriendo
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        show_error "El backend se ha detenido inesperadamente"
        break
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        show_error "El frontend se ha detenido inesperadamente"
        break
    fi
    
    sleep 5
done

cleanup
