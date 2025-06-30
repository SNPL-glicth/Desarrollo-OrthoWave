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
