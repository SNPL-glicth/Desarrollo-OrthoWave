# 📱 OrthoWave - Guía de Acceso Multiplataforma

## 🌐 Acceso desde Cualquier Dispositivo en tu Red

Tu aplicación OrthoWave está completamente optimizada para funcionar en **cualquier dispositivo** dentro de tu red local. Desde móviles hasta tablets y computadores, todos pueden acceder sin problemas.

---

## 🔗 URLs de Acceso

### 🖥️ **En tu Computador Principal**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`

### 📱 **Desde Otros Dispositivos en la Red**
- **Frontend**: `http://192.168.20.29:3000`
- **Backend API**: `http://192.168.20.29:4000`

---

## 📋 Instrucciones de Acceso por Dispositivo

### 📱 **Móviles (Android/iPhone)**

1. **Conecta** tu móvil a la **misma red WiFi** que tu computador
2. **Abre** cualquier navegador web (Chrome, Safari, Firefox, etc.)
3. **Escribe** la URL: `http://192.168.20.29:3000`
4. **¡Listo!** Ya puedes usar la aplicación desde tu móvil

#### ✨ **Características móviles optimizadas:**
- ✅ Botones grandes y fáciles de tocar (44px mínimo)
- ✅ Formularios optimizados para teclados móviles
- ✅ Navegación fluida con gestos táctiles
- ✅ Calendarios adaptados a pantallas pequeñas
- ✅ Menús desplegables optimizados
- ✅ Compatible con orientación horizontal y vertical

### 💻 **Tablets (iPad, Android Tablets)**

1. **Asegúrate** de estar en la misma red WiFi
2. **Abre** tu navegador favorito
3. **Navega** a: `http://192.168.20.29:3000`
4. **Disfruta** de la experiencia optimizada para tablets

#### ✨ **Ventajas en tablets:**
- ✅ Interfaz que aprovecha el espacio de pantalla mediano
- ✅ Navegación híbrida entre móvil y desktop
- ✅ Formularios cómodos para completar
- ✅ Calendarios con vista ampliada

### 🖥️ **Otros Computadores**

1. **Conecta** el dispositivo a la misma red
2. **Abre** cualquier navegador moderno
3. **Ve** a: `http://192.168.20.29:3000`
4. **Usa** la aplicación con todas las funcionalidades

---

## 🔑 **Credenciales de Acceso**

La aplicación viene con usuarios de prueba configurados:

### 👨‍💼 **Administrador**
- **Email**: `admin@ortowhave.com`
- **Contraseña**: `admin123`
- **Acceso**: Panel completo de administración

### 👩‍⚕️ **Doctor**
- **Email**: `doctor@ortowhave.com` 
- **Contraseña**: `doctor123`
- **Acceso**: Dashboard médico y gestión de pacientes

### 👤 **Paciente**
- **Email**: `paciente@ortowhave.com`
- **Contraseña**: `paciente123`
- **Acceso**: Dashboard de paciente y agendamiento

---

## 🚀 **Cómo Iniciar la Aplicación**

### **Backend (API)**
```bash
cd backend
npm run dev
# El servidor estará disponible en: http://192.168.20.29:4000
```

### **Frontend (Interfaz Web)**
```bash
cd frontend/my-app
npm start
# La aplicación estará disponible en: http://192.168.20.29:3000
```

---

## 🌍 **Navegadores Compatibles**

### ✅ **Totalmente Compatible**
- **Chrome** (versión 88+)
- **Safari** (versión 14+)
- **Firefox** (versión 85+)
- **Edge** (versión 88+)
- **Opera** (versión 74+)

### ⚠️ **Compatibilidad Limitada**
- **Internet Explorer**: No compatible
- **Navegadores muy antiguos**: Funcionalidad reducida

---

## 📱 **Características PWA (Progressive Web App)**

Tu aplicación funciona como una **PWA**, lo que significa:

### ✨ **En Móviles**
- 🏠 **Agregar a pantalla de inicio**: Guarda un acceso directo como si fuera una app nativa
- 📶 **Funciona offline** (funcionalidades básicas)
- 🔔 **Notificaciones push** (cuando estén habilitadas)
- 🎨 **Apariencia nativa**: Se ve y siente como una app real

### 🖥️ **En Desktop**
- 💾 **Instalar como aplicación**: Funciona como software independiente
- ⚡ **Carga rápida**: Cacheo inteligente para mejor rendimiento
- 🔄 **Actualizaciones automáticas**: Siempre la última versión

---

## 🔧 **Solución de Problemas Comunes**

### 🚫 **No puedo acceder desde mi móvil**
1. **Verifica** que ambos dispositivos estén en la **misma red WiFi**
2. **Desactiva** el firewall temporalmente en tu computador
3. **Reinicia** el router WiFi
4. **Prueba** con `http://192.168.20.29:3000` exactamente como está escrito

### 🐌 **La aplicación carga lentamente**
1. **Acércate** al router WiFi para mejor señal
2. **Cierra** otras aplicaciones que usen internet
3. **Reinicia** el navegador
4. **Limpia** la caché del navegador

### 📱 **Problemas en móviles**
1. **Actualiza** tu navegador móvil
2. **Limpia** los datos de navegación
3. **Prueba** con un navegador diferente
4. **Reinicia** tu dispositivo móvil

### 🔐 **Problemas de login**
1. **Usa exactamente** las credenciales proporcionadas
2. **Verifica** que no haya espacios extra
3. **Prueba** con diferentes tipos de usuario
4. **Refresca** la página si hay problemas

---

## 🔒 **Seguridad en Red Local**

### ✅ **Configuración Segura**
- 🛡️ **Solo accesible en tu red local** (no desde internet)
- 🔐 **HTTPS en producción** (cuando despliegues)
- 🚪 **CORS configurado** apropiadamente
- 🔑 **Autenticación JWT** implementada

### ⚠️ **Recomendaciones**
- 📶 Usa una **red WiFi segura** con contraseña
- 🔒 **Cambia** las contraseñas por defecto en producción
- 👥 **Controla** quién tiene acceso a tu red
- 💾 Haz **respaldos** regulares de la base de datos

---

## 📞 **Información de Contacto en la App**

La aplicación muestra información de contacto predeterminada:
- **📞 Teléfono**: (+34) 123 456 789
- **📧 Email**: info@ortowhave.com

*Nota: Estos son datos de ejemplo. Cámbialos por los reales de tu centro médico.*

---

## 🚀 **Próximos Pasos Recomendados**

1. **🧪 Prueba** la aplicación en todos tus dispositivos
2. **👥 Invita** a tu equipo a probar desde sus móviles
3. **📝 Personaliza** la información de contacto
4. **🎨 Ajusta** los colores y branding si es necesario
5. **📊 Configura** los datos reales de tu práctica médica
6. **☁️ Considera** el despliegue en la nube para acceso externo

---

## 💡 **Tips para la Mejor Experiencia**

### 📱 **En Móviles**
- Usa el móvil en **orientación vertical** para formularios
- **Pellizca para hacer zoom** si necesitas ver mejor
- **Mantén presionado** los enlaces para opciones adicionales

### 💻 **En Tablets**
- Aprovecha el **modo landscape** para dashboards
- Usa **gestos de deslizar** para navegar calendarios
- **Toca y mantén** para menús contextuales

### 🖥️ **En Desktop**
- Usa **atajos de teclado** cuando estén disponibles
- **Ctrl+R** para refrescar si hay problemas
- **F11** para modo pantalla completa

---

¡**Felicidades!** 🎉 Tu aplicación OrthoWave está lista para ser usada desde cualquier dispositivo en tu red. Es completamente responsiva y optimizada para brindar la mejor experiencia en móviles, tablets y computadores.
