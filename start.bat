@echo off
title Sistema Orto-Whave - Iniciando...
color 0A

echo.
echo ==========================================
echo    Sistema Orto-Whave - Iniciando...
echo ==========================================
echo.

echo [1/2] Iniciando Backend...
cd backend
start "Orto-Whave Backend" cmd /c "npm run dev"
cd ..

echo [2/2] Iniciando Frontend...
cd frontend\my-app
start "Orto-Whave Frontend" cmd /c "npm start"
cd ..\..

echo.
echo ==========================================
echo    Sistema Orto-Whave Iniciado!
echo ==========================================
echo.
echo Backend: http://localhost:4000
echo Frontend: http://localhost:3000
echo.
echo Presiona cualquier tecla para salir...
pause > nul
