# 🌟 Orto-Whave Frontend
*Aplicación React del Sistema de Gestión para Clínicas de Ortopedia*

Esta es la aplicación frontend del sistema Orto-Whave, desarrollada con **React 18+** y **TypeScript**, que proporciona una interfaz moderna y responsive para la gestión de clínicas de ortopedia y traumatología.

## 🚀 Tecnologías Utilizadas

- **React 18+** - Biblioteca de UI moderna
- **TypeScript** - Tipado estático para mayor robustez
- **Tailwind CSS** - Estilos modernos y responsivos
- **React Router** - Navegación SPA
- **Axios** - Cliente HTTP para comunicación con el backend
- **React Bootstrap** - Componentes UI prediseñados
- **Context API** - Gestión de estado global
- **Big Calendar** - Visualización avanzada de calendarios
- **React Hook Form** - Manejo eficiente de formularios

## 📱 Características Principales

### 🔐 **Sistema de Autenticación**
- Login seguro con JWT tokens
- Registro de usuarios con validación
- Recuperación de contraseñas
- Verificación por email

### 👥 **Dashboards Especializados**
- **Dashboard Admin**: Gestión completa de usuarios y estadísticas
- **Dashboard Doctor**: Citas pendientes, calendario personal, gestión de pacientes
- **Dashboard Paciente**: Agendamiento de citas, historial médico

### 📅 **Sistema de Citas Avanzado**
- Calendario interactivo con múltiples vistas (día/semana/mes)
- Agendamiento en tiempo real
- Validación de disponibilidad
- Estados de cita dinámicos
- Horarios flexibles por doctor

### 🔔 **Notificaciones en Tiempo Real**
- Campana de notificaciones
- Actualizaciones automáticas
- Tipos diferenciados de notificación
- Marcado como leído

## 🛠️ Comandos Disponibles

### Desarrollo
```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start
# La aplicación se abrirá en http://localhost:3000
```

### Producción
```bash
# Construir para producción
npm run build

# Los archivos optimizados se generarán en la carpeta 'build/'
```

### Otros Comandos
```bash
# Ejecutar tests
npm test

# Analizar bundle de producción
npm run build && npx serve -s build
```

## 📂 Estructura del Proyecto

```
src/
├── 📁 components/          # Componentes reutilizables
│   ├── 📁 dashboards/      # Dashboards por rol
│   ├── 📁 appointment/     # Sistema de citas
│   ├── 📁 calendar/        # Componentes de calendario
│   ├── 📁 doctor/          # Componentes específicos de doctor
│   ├── 📁 patient/         # Componentes específicos de paciente
│   ├── 📁 notifications/   # Sistema de notificaciones
│   └── 📁 shared/          # Componentes compartidos
├── 📁 contexts/            # Context providers
│   ├── AuthContext.tsx    # Contexto de autenticación
│   └── NotificationContext.tsx # Contexto de notificaciones
├── 📁 hooks/               # Hooks personalizados
│   ├── useAuth.ts          # Hook de autenticación
│   ├── usePolling.ts       # Hook de polling
│   └── useNotifications.ts # Hook de notificaciones
├── 📁 services/            # Servicios de API
│   ├── api.ts              # Cliente Axios configurado
│   ├── authService.ts      # Servicios de autenticación
│   ├── appointmentService.ts # Servicios de citas
│   └── doctorService.ts    # Servicios de doctor
├── 📁 utils/               # Utilidades y helpers
│   ├── dateUtils.ts        # Utilidades de fechas
│   ├── validationUtils.ts  # Utilidades de validación
│   └── constants.ts        # Constantes de la aplicación
├── 📁 types/               # Tipos TypeScript
│   ├── auth.ts             # Tipos de autenticación
│   ├── appointment.ts      # Tipos de citas
│   └── user.ts             # Tipos de usuario
└── 📄 App.tsx              # Componente principal
```

## 🔧 Configuración

### Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
# URL del backend
REACT_APP_API_URL=http://localhost:4000

# Configuraciones adicionales
REACT_APP_APP_NAME="Orto-Whave"
REACT_APP_VERSION="2.0.0"
```

### Configuración del Proxy
El archivo `package.json` incluye configuración de proxy para desarrollo:
```json
"proxy": "http://localhost:4000"
```

## 🎨 Guía de Estilos

### Tailwind CSS
Se utiliza Tailwind CSS para estilos con configuración personalizada:

```css
/* Colores principales */
.bg-primary { @apply bg-blue-600; }
.bg-secondary { @apply bg-gray-600; }
.bg-success { @apply bg-green-600; }
.bg-danger { @apply bg-red-600; }
.bg-warning { @apply bg-yellow-600; }
```

### Bootstrap Components
Se utilizan componentes de React Bootstrap para:
- Modales
- Formularios
- Navegación
- Cards y containers

## 🧪 Testing

### Estructura de Tests
```
src/
├── 📁 __tests__/           # Tests principales
├── 📁 components/
│   └── 📄 Component.test.tsx # Tests unitarios
└── 📁 utils/
    └── 📄 helpers.test.ts    # Tests de utilidades
```

### Ejecutar Tests
```bash
# Tests en modo watch
npm test

# Tests con coverage
npm test -- --coverage

# Tests sin watch
npm test -- --watchAll=false
```

## 📊 Optimizaciones Implementadas

### Performance
- **Lazy Loading** de componentes
- **Code Splitting** automático
- **Memoización** de componentes pesados
- **Debounce** en búsquedas
- **Cache** inteligente de datos

### UX/UI
- **Loading states** informativos
- **Error boundaries** para manejo de errores
- **Feedback visual** inmediato
- **Responsive design** para todos los dispositivos
- **Accesibilidad** mejorada

## 🔗 Integración con Backend

### Endpoints Principales
```typescript
// Autenticación
POST /auth/login
POST /auth/register
GET  /auth/me

// Citas
GET    /citas/mis-citas
POST   /citas
PATCH  /citas/:id/estado

// Usuarios
GET    /users/admin/todos
POST   /users/admin/crear-usuario

// Notificaciones
GET    /notifications
PATCH  /notifications/:id/read
```

### Servicios API
```typescript
// Ejemplo de servicio
import apiClient from './api';

export const appointmentService = {
  getMyAppointments: () => apiClient.get('/citas/mis-citas'),
  createAppointment: (data) => apiClient.post('/citas', data),
  updateAppointmentStatus: (id, status) => 
    apiClient.patch(`/citas/${id}/estado`, { estado: status })
};
```

## 🚀 Despliegue

### Build de Producción
```bash
# Generar build optimizado
npm run build

# Los archivos se generarán en build/
# Listos para servir con cualquier servidor web
```

### Servidor Estático
```bash
# Servir build localmente
npx serve -s build

# Disponible en http://localhost:3000
```

### Docker (Opcional)
```dockerfile
# Dockerfile para producción
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
```

## 🐛 Troubleshooting

### Problemas Comunes

**Error: "Cannot connect to backend"**
```bash
# Verificar que el backend esté corriendo en puerto 4000
curl http://localhost:4000/api/health

# Verificar variables de entorno
echo $REACT_APP_API_URL
```

**Error: "Module not found"**
```bash
# Limpiar dependencias e instalar
rm -rf node_modules package-lock.json
npm install
```

**Error en build**
```bash
# Verificar sintaxis TypeScript
npx tsc --noEmit

# Limpiar cache
npm start -- --reset-cache
```

## 📝 Contribución

### Estándares de Código
- **ESLint** configurado con reglas estrictas
- **Prettier** para formateo automático
- **TypeScript** obligatorio para nuevas características
- **Comentarios en español** para funciones complejas

### Workflow de Desarrollo
1. Crear feature branch: `git checkout -b feature/nueva-funcionalidad`
2. Implementar cambios con TypeScript
3. Agregar tests si es necesario
4. Ejecutar linting: `npm run lint`
5. Commit con mensaje descriptivo
6. Push y crear Pull Request

## 📞 Soporte

Para problemas específicos del frontend:
1. Verificar logs en consola del navegador (F12)
2. Revisar Network tab para problemas de API
3. Verificar que el backend esté funcionando
4. Consultar documentación principal en `../../README.md`

---

*Desarrollado con ❤️ para el Sistema Orto-Whave*
*Última actualización: Enero 2025 - v2.0.0*
