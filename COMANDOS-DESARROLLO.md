# 🛠️ Comandos Útiles para Desarrollo OrthoWave

## 🚀 **Comandos Principales**

### **Iniciar Backend**
```bash
cd backend
npm run dev
```

### **Iniciar Frontend**
```bash
cd frontend/my-app
npm start
```

### **Ambos al mismo tiempo (desde la raíz)**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend/my-app && npm start
```

---

## 🌐 **Comandos de Red y Conectividad**

### **Verificar tu IP local**
```bash
# En Linux/Mac
hostname -I
# o
ip route get 1.1.1.1 | grep -oP 'src \K\S+'

# En Windows
ipconfig | findstr "IPv4"
```

### **Verificar puertos abiertos**
```bash
# Verificar si el puerto 3000 está abierto
sudo netstat -tlnp | grep :3000

# Verificar si el puerto 4000 está abierto  
sudo netstat -tlnp | grep :4000
```

### **Probar conectividad desde otro dispositivo**
```bash
# Desde otro dispositivo en la red
curl -I http://192.168.20.29:3000
curl -I http://192.168.20.29:4000/health
```

---

## 📱 **Testing Responsivo**

### **Simular diferentes dispositivos en Chrome**
1. Abre `http://192.168.20.29:3000` en Chrome
2. Presiona `F12` para abrir DevTools
3. Haz clic en el ícono de dispositivo móvil (📱)
4. Selecciona diferentes dispositivos del dropdown

### **URLs de testing por dispositivo**
- **iPhone SE**: `http://192.168.20.29:3000` (375x667)
- **iPad**: `http://192.168.20.29:3000` (768x1024)
- **Desktop**: `http://192.168.20.29:3000` (1920x1080)

---

## 🔧 **Comandos de Desarrollo**

### **Instalar dependencias**
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend/my-app && npm install
```

### **Build para producción**
```bash
# Backend
cd backend && npm run build

# Frontend  
cd frontend/my-app && npm run build
```

### **Linting y formato**
```bash
# Backend
cd backend && npm run lint
cd backend && npm run format

# Frontend (si tienes ESLint configurado)
cd frontend/my-app && npx eslint src/ --fix
```

---

## 📊 **Comandos de Base de Datos**

### **Migraciones TypeORM**
```bash
cd backend

# Generar nueva migración
npm run migration:generate -- -n NombreMigracion

# Ejecutar migraciones
npm run migration:run

# Revertir última migración
npm run migration:revert
```

### **Seed de datos de prueba**
```bash
cd backend

# Crear roles por defecto
node seed-roles.js

# Resetear contraseñas de prueba
node reset-passwords.js
```

---

## 🐛 **Debugging y Logs**

### **Ver logs del backend en tiempo real**
```bash
cd backend
tail -f logs/combined.log
# o solo errores
tail -f logs/error.log
```

### **Verificar estado de la aplicación**
```bash
# Verificar procesos Node.js ejecutándose
ps aux | grep node

# Verificar conexiones de red activas
netstat -an | grep :3000
netstat -an | grep :4000
```

---

## 🔄 **Comandos de Reinicio y Limpieza**

### **Reiniciar servicios**
```bash
# Matar procesos en puerto 3000
sudo lsof -ti:3000 | xargs kill -9

# Matar procesos en puerto 4000
sudo lsof -ti:4000 | xargs kill -9
```

### **Limpiar caché**
```bash
# Frontend
cd frontend/my-app && npm start -- --reset-cache

# Backend (limpiar dist)
cd backend && rm -rf dist && npm run build
```

### **Reinstalación completa**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend/my-app  
rm -rf node_modules package-lock.json
npm install
```

---

## 🔐 **Comandos de Firewall (Ubuntu/Debian)**

### **Permitir acceso desde la red local**
```bash
# Permitir puerto 3000 desde la red local
sudo ufw allow from 192.168.20.0/24 to any port 3000

# Permitir puerto 4000 desde la red local
sudo ufw allow from 192.168.20.0/24 to any port 4000

# Ver reglas actuales
sudo ufw status numbered
```

### **Deshabilitar firewall temporalmente (para testing)**
```bash
# Deshabilitar
sudo ufw disable

# Habilitar después
sudo ufw enable
```

---

## 📈 **Monitoreo y Performance**

### **Verificar uso de recursos**
```bash
# CPU y memoria
htop
# o
top | grep node

# Espacio en disco
df -h

# Tráfico de red
sudo iftop
```

### **Testing de carga**
```bash
# Instalar Apache Bench si no está instalado
sudo apt install apache2-utils

# Test básico de carga
ab -n 100 -c 10 http://192.168.20.29:3000/
ab -n 100 -c 10 http://192.168.20.29:4000/health
```

---

## 🌐 **Compartir con Equipo**

### **Obtener QR code para fácil acceso móvil**
```bash
# Instalar qrencode si no está instalado
sudo apt install qrencode

# Generar QR para la URL
qrencode -t ansiutf8 "http://192.168.20.29:3000"

# Guardar QR como imagen
qrencode -o orthowave-qr.png "http://192.168.20.29:3000"
```

### **Enviar URL por email/mensaje**
- **URL Frontend**: `http://192.168.20.29:3000`
- **Credenciales**: Ver README-MULTIPLATAFORMA.md

---

## 🔄 **Hot Reload y Desarrollo**

### **Verificar que hot reload funciona**
```bash
# El frontend debería recargar automáticamente al guardar archivos
# Si no funciona, verifica que estas variables estén configuradas:
echo $FAST_REFRESH
echo $CHOKIDAR_USEPOLLING
```

### **Forzar recarga de cambios**
```bash
# Frontend
cd frontend/my-app
# Ctrl+C para parar
npm start

# Backend  
cd backend
# Ctrl+C para parar
npm run dev
```

---

## 🏷️ **Variables de Entorno Importantes**

### **Frontend**
```bash
# En frontend/my-app/.env (crear si no existe)
REACT_APP_API_URL=http://192.168.20.29:4000
FAST_REFRESH=true
CHOKIDAR_USEPOLLING=true
```

### **Backend**
```bash
# En backend/.env
NODE_ENV=development
PORT=4000
HOST=0.0.0.0
```

---

## 🎯 **Comandos de Testing**

### **Probar endpoints desde terminal**
```bash
# Test de salud del backend
curl http://192.168.20.29:4000/health

# Test de login
curl -X POST http://192.168.20.29:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"paciente@ortowhave.com","password":"paciente123"}'
```

### **Testing automatizado**
```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend/my-app && npm test
```

---

¡**Con estos comandos tienes todo lo necesario para desarrollar, probar y compartir tu aplicación OrthoWave!** 🚀
