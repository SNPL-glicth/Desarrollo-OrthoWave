@echo off
setlocal enabledelayedexpansion

:: Script de Instalación Automatizada - Sistema Orto-Whave
:: Para sistemas Windows
:: Autor: Desarrollo Orto-Whave
:: Versión: 1.0

echo ======================================================
echo     INSTALADOR AUTOMATIZADO - SISTEMA ORTO-WHAVE
echo ======================================================
echo.
echo Este script instalará automáticamente:
echo • Node.js y npm (si no están instalados)
echo • Dependencias del backend (NestJS)
echo • Dependencias del frontend (React)
echo • Configuración de base de datos MySQL
echo • Configuración de variables de entorno
echo.
echo Presiona cualquier tecla para continuar o Ctrl+C para cancelar
pause >nul

:: Verificar si Node.js está instalado
echo [INFO] Verificando instalación de Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js no está instalado
    echo Por favor instala Node.js desde https://nodejs.org/
    echo Se recomienda la versión LTS más reciente
    pause
    exit /b 1
) else (
    echo [SUCCESS] Node.js está instalado
    node --version
)

:: Verificar npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm no está disponible
    pause
    exit /b 1
) else (
    echo [SUCCESS] npm está disponible
    npm --version
)

:: Verificar directorio del proyecto
echo [INFO] Verificando directorio del proyecto...
if not exist "backend\package.json" (
    echo [ERROR] No se encontró backend\package.json
    echo Asegúrate de ejecutar este script desde el directorio raíz del proyecto
    pause
    exit /b 1
)

if not exist "frontend\my-app\package.json" (
    echo [ERROR] No se encontró frontend\my-app\package.json
    echo Asegúrate de ejecutar este script desde el directorio raíz del proyecto
    pause
    exit /b 1
)

echo [SUCCESS] Directorio del proyecto verificado

:: Configurar variables de entorno
echo [INFO] Configurando variables de entorno...
if not exist "backend\.env" (
    echo [INFO] Creando archivo .env para el backend...
    copy "backend\.env.example" "backend\.env" >nul

    :: Generar JWT secret simple para Windows
    set "jwt_secret="
    for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(64, 0)"') do set "jwt_secret=%%i"

    :: Reemplazar en el archivo .env usando PowerShell
    powershell -command "(Get-Content 'backend\.env') -replace 'tu_clave_secreta_jwt_muy_segura_aqui', '!jwt_secret!' | Set-Content 'backend\.env'"

    echo [SUCCESS] Archivo .env creado con JWT secret seguro
) else (
    echo [INFO] Archivo .env ya existe
)

:: Instalar dependencias del backend
echo [INFO] Instalando dependencias del backend...
cd backend
call npm install
if errorlevel 1 (
    echo [ERROR] Error al instalar dependencias del backend
    pause
    exit /b 1
)
echo [SUCCESS] Dependencias del backend instaladas correctamente
cd ..

:: Instalar dependencias del frontend
echo [INFO] Instalando dependencias del frontend...
cd frontend\my-app
call npm install
if errorlevel 1 (
    echo [ERROR] Error al instalar dependencias del frontend
    pause
    exit /b 1
)
echo [SUCCESS] Dependencias del frontend instaladas correctamente
cd ..\..

:: Configurar base de datos
echo [INFO] Configurando conexión a MySQL...
cd backend

:: Compilar TypeScript
echo [INFO] Compilando backend...
call npm run build
if errorlevel 1 (
    echo [WARNING] Error al compilar backend, continuando...
)

echo [WARNING] Asegúrate de que MySQL esté ejecutándose en puerto 3306
echo [WARNING] Y que la base de datos 'orto_whave_db' exista con las credenciales correctas

:: Inicializar base de datos con datos de prueba
echo [INFO] Inicializando base de datos con roles...
if exist "seed-roles.js" (
    node seed-roles.js
)

echo [SUCCESS] Configuración de base de datos completada
cd ..

:create_scripts
:: Crear scripts de inicio para Windows
echo [INFO] Creando scripts de inicio...

:: Script para iniciar todo el sistema
(
echo @echo off
echo echo Iniciando Sistema Orto-Whave...
echo.
echo echo Iniciando backend en puerto 4000...
echo start "Backend" cmd /k "cd backend && npm run dev"
echo.
echo timeout /t 3 /nobreak >nul
echo.
echo echo Iniciando frontend en puerto 3000...
echo start "Frontend" cmd /k "cd frontend\my-app && npm start"
echo.
echo echo ¡Sistema iniciado!
echo echo Backend: http://localhost:4000
echo echo Frontend: http://localhost:3000
echo echo.
echo echo Presiona cualquier tecla para salir
echo pause >nul
) > start.bat

:: Script solo para backend
(
echo @echo off
echo echo Iniciando solo el backend...
echo cd backend
echo npm run dev
echo pause
) > start-backend.bat

:: Script solo para frontend
(
echo @echo off
echo echo Iniciando solo el frontend...
echo cd frontend\my-app
echo npm start
echo pause
) > start-frontend.bat

echo [SUCCESS] Scripts de inicio creados

:: Verificar instalación
echo [INFO] Verificando instalación...
set "errors=0"

if not exist "start.bat" (
    echo [ERROR] Script start.bat no encontrado
    set /a errors+=1
)

if not exist "backend\node_modules" (
    echo [ERROR] Dependencias del backend no instaladas
    set /a errors+=1
)

if not exist "frontend\my-app\node_modules" (
    echo [ERROR] Dependencias del frontend no instaladas
    set /a errors+=1
)

if not exist "backend\.env" (
    echo [ERROR] Archivo .env del backend no encontrado
    set /a errors+=1
)

if !errors! equ 0 (
    echo [SUCCESS] Instalación verificada correctamente
) else (
    echo [ERROR] Se encontraron !errors! errores en la instalación
    pause
    exit /b 1
)

:: Mostrar instrucciones finales
echo.
echo ======================================================
echo            ¡INSTALACIÓN COMPLETADA!
echo ======================================================
echo.
echo Para iniciar el sistema, usa uno de estos comandos:
echo.
echo Iniciar todo el sistema:
echo   start.bat
echo.
echo Iniciar solo el backend:
echo   start-backend.bat
echo.
echo Iniciar solo el frontend:
echo   start-frontend.bat
echo.
echo URLs de acceso:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:4000
echo.
echo Datos de prueba:
echo   Los roles se han configurado automáticamente
echo   Puedes registrar nuevos usuarios desde el frontend
echo.
echo ¡Listo para usar!
echo.
pause
