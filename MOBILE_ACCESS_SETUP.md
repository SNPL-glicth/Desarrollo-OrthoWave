# Configuración de Acceso Móvil para Orto-Whave

## 📱 Acceso desde Dispositivos Móviles Externos

Esta guía explica cómo acceder a la aplicación Orto-Whave desde dispositivos móviles y otros dispositivos en tu red local.

## 🔧 Configuraciones Realizadas

### 1. Frontend (React)
- **Puerto**: 3000
- **Configuración**: `HOST=0.0.0.0` en package.json
- **Acceso**: `http://[TU_IP_LOCAL]:3000`

### 2. Backend (NestJS)
- **Puerto**: 4000  
- **Configuración**: `host: '0.0.0.0'` en main.ts
- **Acceso**: `http://[TU_IP_LOCAL]:4000`

### 3. API Dinámica
Se creó un sistema de configuración dinámica que detecta automáticamente la IP desde la cual se accede:

**Archivo**: `frontend/my-app/src/config/api.js`
```javascript
const getBaseURL = () => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:4000';
  }
  
  return `http://${hostname}:4000`;
};
```

### 4. CORS Configurado
El backend acepta conexiones desde:
- `http://localhost:3000`
- `http://127.0.0.1:3000` 
- `http://[TU_IP_LOCAL]:3000` (donde TU_IP_LOCAL es tu dirección IP en la red)

### 5. Firewall (UFW) 
```bash
# Reglas configuradas:
sudo ufw allow ssh          # Puerto 22 - Acceso SSH
sudo ufw allow 3000/tcp     # Frontend React
sudo ufw allow 4000/tcp     # Backend NestJS
```

## 🌐 URLs de Acceso

### Desde Localhost (desarrollo local)
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

### Desde Dispositivos Móviles y Otros Dispositivos en la Red
- **Frontend**: `http://[TU_IP_LOCAL]:3000`
- **Backend**: `http://[TU_IP_LOCAL]:4000`

**Para encontrar tu IP local:**
```bash
# En Linux/Mac
hostname -I
# o
ip route get 1.1.1.1 | grep -oP 'src \K\S+'

# En Windows
ipconfig | findstr "IPv4"
```

## ✅ Estado Actual

### Servicios Activos
```bash
# Verificar que los servicios estén corriendo:
netstat -tlnp | grep -E "(3000|4000)"
```

**Resultado esperado:**
```
tcp  0.0.0.0:3000  0.0.0.0:*  LISTEN  [PID]/node
tcp  0.0.0.0:4000  0.0.0.0:*  LISTEN  [PID]/node
```

### Firewall
```bash
sudo ufw status
```

**Resultado esperado:**
```
Status: active
3000/tcp    ALLOW IN    Anywhere
4000/tcp    ALLOW IN    Anywhere  
22/tcp      ALLOW IN    Anywhere
```

## 🚀 Cómo Iniciar los Servicios

### Backend
```bash
cd backend
npm run dev
```

### Frontend  
```bash
cd frontend/my-app
npm start
```

### Opción Rápida (Ambos servicios)
```bash
# Linux/macOS
./start.sh

# Windows
start.bat
```

## 📋 Pruebas de Conectividad

### 1. Verificar Backend
```bash
curl http://[TU_IP_LOCAL]:4000
```

### 2. Verificar Frontend
Abre en el navegador móvil: `http://[TU_IP_LOCAL]:3000`

## 🔍 Troubleshooting

### Problema: "No se puede conectar"
1. Verificar que los servicios estén corriendo:
   ```bash
   ps aux | grep -E "(node|npm|react)" | grep -v grep
   ```

2. Verificar puertos abiertos:
   ```bash
   netstat -tlnp | grep -E "(3000|4000)"
   ```

3. Verificar firewall:
   ```bash
   sudo ufw status
   ```

### Problema: "Error de CORS"
- El CORS está configurado para aceptar conexiones desde tu red local
- Si cambias de IP, actualiza el archivo `backend/src/main.ts` con tu nueva IP

### Problema: "API no responde"
- La configuración dinámica detecta automáticamente la IP
- No requiere cambios manuales al cambiar de red

## 📁 Archivos Modificados

1. `backend/src/main.ts` - CORS y logging de IPs
2. `frontend/my-app/src/config/api.js` - Configuración dinámica de API
3. `frontend/my-app/src/services/api.js` - Uso de configuración centralizada
4. `frontend/my-app/src/components/CreateUserForm.jsx` - URLs dinámicas
5. `frontend/my-app/package.json` - `HOST=0.0.0.0` para React

## 🎯 Funcionalidades Verificadas

- ✅ Acceso desde dispositivos móviles externos
- ✅ Detección automática de IP
- ✅ CORS configurado correctamente
- ✅ Firewall permite conexiones necesarias
- ✅ Modal de creación de usuario con tema profesional
- ✅ Iconos SVG profesionales (sin emojis)
- ✅ Esquema de colores gris profesional

## 📱 Acceso Móvil

Para acceder desde tu dispositivo móvil:

1. **Encontrar tu IP local** usando los comandos mostrados arriba
2. **Conectar el dispositivo móvil a la misma red WiFi**
3. **Abrir navegador móvil**
4. **Navegar a**: `http://[TU_IP_LOCAL]:3000` (reemplaza [TU_IP_LOCAL] con tu IP real)
5. **Iniciar sesión** con cualquier cuenta existente

¡La aplicación ahora es completamente accesible desde dispositivos móviles externos! 🎉
