# Estructura del Proyecto Orto-Whave

Este documento describe la función de cada archivo en el directorio principal del proyecto.

## 📁 Directorios

### `backend/`
Contiene todo el código del servidor NestJS:
- Controladores, servicios y módulos
- Configuración de base de datos
- Autenticación y autorización
- API endpoints

### `frontend/`
Contiene la aplicación React:
- Componentes de interfaz de usuario
- Hooks personalizados
- Servicios de API
- Estilos y assets

### `.git/`
Directorio de control de versiones Git (generado automáticamente)

## 📄 Archivos de Instalación

### `install.sh` (Linux/macOS)
Script de instalación automática para sistemas Unix:
- Instala dependencias del backend y frontend
- Configura variables de entorno
- Inicializa la base de datos
- Crea usuarios por defecto

### `install.bat` (Windows)
Script de instalación automática para Windows:
- Misma funcionalidad que install.sh
- Adaptado para Command Prompt/PowerShell

## 🚀 Archivos de Inicio

### `start.sh` (Linux/macOS)
Inicia todo el sistema completo:
- Lanza backend en puerto 4000
- Lanza frontend en puerto 3000
- Ejecuta ambos en paralelo

### `start.bat` (Windows)
Versión Windows del script de inicio completo

### `start-backend.sh` (Linux/macOS)
Inicia solo el servidor backend:
- Útil para desarrollo del frontend por separado
- Ejecuta `npm run dev` en el directorio backend

### `start-backend.bat` (Windows)
Versión Windows del script de inicio del backend

### `start-frontend.sh` (Linux/macOS)
Inicia solo la aplicación React:
- Útil para desarrollo del backend por separado
- Ejecuta `npm start` en el directorio frontend

### `start-frontend.bat` (Windows)
Versión Windows del script de inicio del frontend

## 📚 Archivos de Documentación

### `README.md`
Documentación principal del proyecto:
- Guía de instalación completa
- Características del sistema
- Solución de problemas
- API endpoints

### `CHANGELOG.md`
Registro detallado de cambios:
- Nuevas características por versión
- Mejoras técnicas
- Correcciones de errores
- Métricas de rendimiento

### `STRUCTURE.md` (este archivo)
Explicación de la estructura del proyecto

## ⚙️ Archivos de Configuración

### `.gitignore`
Especifica qué archivos Git debe ignorar:
- node_modules
- Archivos de configuración local
- Logs y archivos temporales

### `.gitattributes`
Configuración de manejo de archivos en Git:
- Normalización de saltos de línea
- Tratamiento de archivos binarios

## 🎯 Funciones Específicas

### Instalación
1. **Automática**: Usar `install.sh` (Linux/macOS) o `install.bat` (Windows)
2. **Manual**: Seguir pasos en README.md

### Inicio del Sistema
1. **Sistema completo**: `start.sh` o `start.bat`
2. **Solo backend**: `start-backend.sh` o `start-backend.bat`
3. **Solo frontend**: `start-frontend.sh` o `start-frontend.bat`

### Desarrollo
- Backend: `cd backend && npm run dev`
- Frontend: `cd frontend/my-app && npm start`

## 🧹 Archivos Eliminados

Los siguientes archivos fueron eliminados en la limpieza del proyecto:
- Scripts de testing temporales
- Archivos de configuración de desarrollo
- Scripts de setup específicos
- node_modules del directorio principal
- Documentación obsoleta

## 📝 Convenciones

### Nomenclatura
- `.sh` - Scripts para Linux/macOS
- `.bat` - Scripts para Windows
- `.md` - Documentación en Markdown

### Estructura
- Un archivo por función específica
- Documentación clara y mantenida
- Scripts multiplataforma cuando sea necesario

---

**Mantenido por**: Equipo de desarrollo Orto-Whave  
**Última actualización**: 17 de Enero, 2025
