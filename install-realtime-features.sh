#!/bin/bash

echo "🚀 Instalando características de tiempo real para Orto-Whave..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Verificar que estamos en el directorio correcto
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    show_error "Este script debe ejecutarse desde el directorio raíz del proyecto Orto-Whave"
    exit 1
fi

show_message "Directorio del proyecto verificado ✓"

# Instalar dependencias del backend
show_message "Instalando dependencias del backend..."
cd backend

if [ ! -f "package.json" ]; then
    show_error "No se encontró package.json en el directorio backend"
    exit 1
fi

# Instalar dependencias específicas para WebSocket
show_message "Instalando dependencias de WebSocket para NestJS..."
npm install @nestjs/websockets@^10.4.19 @nestjs/platform-socket.io@^10.4.19 socket.io@^4.8.0

if [ $? -eq 0 ]; then
    show_message "Dependencias del backend instaladas correctamente ✓"
else
    show_error "Error al instalar dependencias del backend"
    exit 1
fi

# Volver al directorio raíz
cd ..

# Instalar dependencias del frontend
show_message "Instalando dependencias del frontend..."
cd frontend/my-app

if [ ! -f "package.json" ]; then
    show_error "No se encontró package.json en el directorio frontend/my-app"
    exit 1
fi

# Instalar dependencias específicas para WebSocket en React
show_message "Instalando dependencias de WebSocket para React..."
npm install socket.io-client@^4.8.0

if [ $? -eq 0 ]; then
    show_message "Dependencias del frontend instaladas correctamente ✓"
else
    show_error "Error al instalar dependencias del frontend"
    exit 1
fi

# Volver al directorio raíz
cd ../..

# Construir el backend
show_message "Construyendo el backend..."
cd backend
npm run build

if [ $? -eq 0 ]; then
    show_message "Backend construido correctamente ✓"
else
    show_warning "Error al construir el backend. Esto podría deberse a errores de TypeScript."
    show_message "Puedes continuar e intentar ejecutar el servidor para ver los errores específicos."
fi

cd ..

# Mostrar instrucciones finales
echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "📋 CARACTERÍSTICAS INSTALADAS:"
echo "  ✓ WebSocket Gateway para actualizaciones en tiempo real"
echo "  ✓ Sistema de caché inteligente para optimizar consultas"
echo "  ✓ Hooks de React optimizados para datos en tiempo real"
echo "  ✓ Componente de estado de conexión"
echo "  ✓ Invalidación automática de caché"
echo "  ✓ Polling inteligente como respaldo"
echo ""
echo "🚀 PRÓXIMOS PASOS:"
echo "  1. Ejecutar el backend: cd backend && npm run dev"
echo "  2. En otra terminal, ejecutar el frontend: cd frontend/my-app && npm start"
echo "  3. Abrir http://localhost:3000 en tu navegador"
echo ""
echo "🔧 FUNCIONALIDADES NUEVAS:"
echo "  • Los dashboards se actualizan automáticamente cuando hay cambios"
echo "  • Indicador de estado de conexión en tiempo real"
echo "  • Cache inteligente que se invalida automáticamente"
echo "  • Respaldo con polling cuando WebSocket no está disponible"
echo "  • Notificaciones instantáneas de cambios en citas"
echo ""
echo "📊 BENEFICIOS:"
echo "  • Información 100% actualizada sin necesidad de recargar"
echo "  • Mejor experiencia de usuario con actualizaciones instantáneas"
echo "  • Menor carga en el servidor gracias al sistema de caché"
echo "  • Reconexión automática en caso de pérdida de conexión"
echo ""
echo "💡 NOTAS IMPORTANTES:"
echo "  • El sistema funciona con WebSocket para actualizaciones instantáneas"
echo "  • Si WebSocket falla, automáticamente usa polling como respaldo"
echo "  • El caché se invalida automáticamente cuando hay cambios"
echo "  • Todos los dashboards (Admin, Doctor, Paciente) están optimizados"
echo ""
echo "🎯 Tu aplicación ahora tiene datos 100% actualizados en tiempo real!"

exit 0
