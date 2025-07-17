# Sistema Orto-Whave 🏥

Sistema completo de gestión para clínicas de ortopedia y traumatología, desarrollado con NestJS (Backend) y React (Frontend).

## 🚀 Características Principales

- **Sistema de Autenticación Completo**: Login, registro, verificación de email y recuperación de contraseñas
- **Gestión de Roles**: Administrador, Doctor y Paciente con permisos específicos
- **Sistema de Citas Avanzado**: Agendamiento inteligente con validación de disponibilidad
- **Actualización en Tiempo Real**: Sistema de polling automático para dashboards
- **Feedback Instantáneo**: Notificaciones inmediatas de acciones exitosas o errores
- **Historia Clínica Digital**: Registro completo de consultas y tratamientos
- **Gestión de Usuarios**: Panel administrativo para crear y gestionar usuarios
- **Notificaciones por Email**: Sistema completo de notificaciones configurado con Gmail
- **Persistencia de Datos**: Sistema robusto de validación y persistencia de citas
- **Interfaz Responsiva**: Diseño optimizado para dispositivos móviles y desktop

## 🛠️ Tecnologías Utilizadas

### Backend
- **NestJS**: Framework de Node.js para el backend
- **TypeScript**: Lenguaje de programación tipado
- **SQLite**: Base de datos ligera y eficiente
- **TypeORM**: ORM para gestión de base de datos
- **JWT**: Autenticación segura con tokens
- **Bcrypt**: Encriptación segura de contraseñas
- **Nodemailer**: Envío de emails

### Frontend
- **React**: Biblioteca de JavaScript para interfaces de usuario
- **TypeScript**: Desarrollo tipado
- **Tailwind CSS**: Framework de estilos
- **React Router**: Navegación entre páginas
- **Axios**: Cliente HTTP para comunicación con el backend
- **React Bootstrap**: Componentes de interfaz
- **Hooks Personalizados**: Sistema de polling automático y gestión de estado
- **Context API**: Gestión global de estado de autenticación
- **Componentes Modulares**: Arquitectura escalable y reutilizable

## 📋 Requisitos Previos

### Para Linux/macOS:
- Node.js 16+ y npm
- Git
- SQLite3

### Para Windows:
- Node.js 16+ y npm (desde [nodejs.org](https://nodejs.org/))
- Git (desde [git-scm.com](https://git-scm.com/))

## 🔧 Instalación Rápida

### Opción 1: Instalación Automática (Linux/macOS)
```bash
git clone https://github.com/SNPL-glicth/Desarrollo-Orto-Whave.git
cd Desarrollo-Orto-Whave
chmod +x install.sh
./install.sh
```

### Opción 2: Instalación Automática (Windows)
```cmd
git clone https://github.com/SNPL-glicth/Desarrollo-Orto-Whave.git
cd Desarrollo-Orto-Whave
install.bat
```

### Opción 3: Instalación Manual

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/SNPL-glicth/Desarrollo-Orto-Whave.git
   cd Desarrollo-Orto-Whave
   ```

2. **Configurar variables de entorno**
   ```bash
   cp backend/.env.example backend/.env
   # Editar backend/.env con las configuraciones necesarias
   ```

3. **Instalar dependencias del backend**
   ```bash
   cd backend
   npm install
   ```

4. **Instalar dependencias del frontend**
   ```bash
   cd ../frontend/my-app
   npm install
   cd ../..
   ```

5. **Inicializar base de datos**
   ```bash
   cd backend
   npm run build
   node seed-roles.js
   cd ..
   ```

## 🚀 Ejecutar el Sistema

### Opción 1: Iniciar Todo el Sistema
```bash
./start.sh          # Linux/macOS
start.bat           # Windows
```

### Opción 2: Iniciar Servicios por Separado

**Backend solamente:**
```bash
./start-backend.sh  # Linux/macOS
start-backend.bat   # Windows
```

**Frontend solamente:**
```bash
./start-frontend.sh # Linux/macOS
start-frontend.bat  # Windows
```

### Opción 3: Inicio Manual

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend/my-app
npm start
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000

## 💡 Nuevas Características Implementadas

### 🔄 Sistema de Actualización Automática
- **Polling Inteligente**: Actualización automática de dashboards cada 15-30 segundos
- **Notificaciones en Tiempo Real**: Sistema de callbacks para cambios inmediatos
- **Optimización de Rendimiento**: Polling pausable y configurable

### 📋 Módulo de Citas Mejorado
- **Validación de Disponibilidad**: Verificación en tiempo real antes de agendar
- **Feedback Instantáneo**: Mensajes de éxito/error inmediatos
- **Persistencia Robusta**: Validación de datos antes de envío al backend
- **Estados de Cita**: Pendiente → Confirmada → En Curso → Completada

### 🎨 Interfaz de Usuario Optimizada
- **Componentes Reactivos**: Botones con estados de carga y feedback visual
- **Modales Inteligentes**: Cierre automático con confirmación
- **Dashboards Dinámicos**: Actualización automática sin recarga manual
- **Indicadores de Estado**: Timestamps de última actualización

### 🛠️ Hooks Personalizados
- **usePollingCitas**: Polling automático para citas con configuración flexible
- **Gestión de Estado**: Manejo optimizado de loading, error y datos
- **Suscripción a Eventos**: Sistema de callbacks para cambios en tiempo real

## 👥 Usuarios del Sistema

### Roles Disponibles:
1. **Admin**: Gestión completa del sistema
2. **Doctor**: Gestión de pacientes y citas
3. **Paciente**: Agendar citas y ver historial

### Credenciales de Administrador por Defecto:
- **Email**: admin@ortowhave.com
- **Contraseña**: admin123

> **Nota**: Cambia estas credenciales inmediatamente después de la primera instalación.

## 📧 Configuración de Email

El sistema está preconfigurado para envío de emails usando Gmail:

### Variables de Entorno (backend/.env):
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=pachonlucassergionicolas@gmail.com
MAIL_PASS=gqllgnlnfgpyxojt
MAIL_FROM="Orto-Whave" <pachonlucassergionicolas@gmail.com>
MAIL_SECURE=true
```

### Funcionalidades de Email:
- ✅ Verificación de cuenta para nuevos usuarios
- ✅ Recuperación de contraseñas
- ✅ Notificaciones de citas
- ✅ Cambios de estado de citas

## 🗂️ Estructura del Proyecto

```
Desarrollo-Orto-Whave/
├── backend/                 # Servidor NestJS
│   ├── src/                # Código fuente
│   │   ├── auth/          # Módulo de autenticación
│   │   ├── users/         # Gestión de usuarios
│   │   ├── citas/         # Sistema de citas avanzado
│   │   ├── pacientes/     # Gestión de pacientes
│   │   ├── historia-clinica/ # Historia clínica
│   │   └── mail/          # Servicio de email
│   ├── .env               # Variables de entorno
│   └── package.json       # Dependencias del backend
├── frontend/               # Aplicación React
│   └── my-app/            # Código del frontend
│       ├── src/           # Código fuente React
│       │   ├── components/ # Componentes reutilizables
│       │   │   ├── dashboards/    # PatientDashboard, DoctorDashboard
│       │   │   ├── appointment/   # AppointmentModal, PendingAppointments
│       │   │   └── patient/       # Componentes de paciente
│       │   ├── hooks/     # Hooks personalizados
│       │   │   ├── usePollingCitas.ts # Polling automático
│       │   │   └── usePatientAppointments.ts # Gestión de citas
│       │   ├── services/  # Servicios de API
│       │   │   ├── citasService.ts # Servicio de citas mejorado
│       │   │   └── api.js # Cliente HTTP
│       │   └── context/   # Context providers
│       └── package.json   # Dependencias del frontend
├── install.sh             # Instalador para Linux/macOS
├── install.bat            # Instalador para Windows
├── start.sh               # Iniciador para Linux/macOS
├── start.bat              # Iniciador para Windows
└── README.md              # Este archivo
```

## 🔒 Seguridad

- **Contraseñas**: Encriptadas con bcrypt (salt rounds: 12)
- **JWT**: Tokens seguros con expiración de 24 horas
- **Validación**: Validación completa de datos de entrada
- **CORS**: Configurado para desarrollo y producción
- **Variables de Entorno**: Configuración segura separada del código

## 🛡️ API Endpoints

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/verify` - Verificar email
- `POST /auth/forgot-password` - Solicitar recuperación de contraseña
- `POST /auth/reset-password` - Resetear contraseña
- `GET /auth/me` - Obtener información del usuario actual

### Usuarios (Admin)
- `GET /users/admin/todos` - Listar todos los usuarios
- `POST /users/admin/crear-usuario` - Crear nuevo usuario
- `PUT /users/admin/:id` - Actualizar usuario
- `DELETE /users/admin/:id` - Eliminar usuario

### Citas
- `POST /citas` - Crear nueva cita con validación avanzada
- `GET /citas/mis-citas` - Obtener mis citas
- `GET /citas/paciente/:id` - Obtener citas por paciente
- `GET /citas/doctor/:id` - Obtener citas por doctor
- `PATCH /citas/:id/estado` - Actualizar estado de cita con notificaciones
- `GET /citas/disponibilidad` - Consultar disponibilidad en tiempo real
- `GET /citas/doctor/:id/agenda/:fecha` - Obtener agenda específica del doctor
- `DELETE /citas/:id` - Eliminar cita (solo admin)

### Pacientes
- `GET /pacientes/mi-perfil` - Obtener perfil del paciente
- `PATCH /pacientes/mi-perfil` - Actualizar perfil
- `GET /pacientes/mis-pacientes` - Listar pacientes (para doctores)

## 🐛 Solución de Problemas

### Error: "No se puede conectar al backend"
1. Verificar que el backend esté ejecutándose en puerto 4000
2. Comprobar que no haya conflictos de puertos
3. Revisar logs del backend para errores específicos

### Error: "Dependencias no instaladas"
1. Ejecutar `npm install` en backend/
2. Ejecutar `npm install` en frontend/my-app/
3. Verificar versión de Node.js (requerida 16+)

### Error: "Base de datos no encontrada"
1. Ejecutar `cd backend && node seed-roles.js`
2. Verificar que el archivo `backend/orto_whave_dev.db` existe
3. Comprobar permisos de escritura en el directorio backend/

### Error de Email
1. Verificar configuración SMTP en backend/.env
2. Comprobar que las credenciales de Gmail sean correctas
3. Verificar que la "verificación en 2 pasos" esté habilitada en Gmail

### Error: "Citas no se actualizan automáticamente"
1. Verificar que el polling esté habilitado en usePollingCitas
2. Comprobar conexión a internet estable
3. Revisar logs de la consola del navegador

### Error: "Modal no se cierra después de agendar cita"
1. Verificar que el callback onSuccess esté configurado correctamente
2. Comprobar que no haya errores en el proceso de persistencia
3. Revisar logs del servicio de citas

### Error de Compilación de TypeScript
1. Verificar que todos los imports tengan las extensiones correctas (.ts, .tsx)
2. Ejecutar `npm run build` para verificar errores de tipo
3. Limpiar caché con `npm run clean` si existe

## 📞 Soporte

Para reportar problemas o solicitar ayuda:
1. Crear un issue en el repositorio de GitHub
2. Incluir logs de error completos
3. Describir pasos para reproducir el problema
4. Incluir información del sistema operativo y versión de Node.js

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo LICENSE para más detalles.

## 🤝 Contribución

1. Fork el repositorio
2. Crear una rama para la nueva feature (`git checkout -b feature/nueva-feature`)
3. Commit los cambios (`git commit -am 'Agregar nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Crear un Pull Request

## 🧪 Funcionalidades Destacadas

### 📱 Dashboard del Paciente
- **Visualización de Doctores**: Lista completa con especialidades y disponibilidad
- **Botón Agendar Cita**: Funcional con validación de disponibilidad
- **Modal de Agendamiento**: Formulario completo con selección de fecha/hora
- **Feedback Visual**: Mensajes de éxito y error en tiempo real
- **Estados de Botón**: Deshabilitado para doctores no disponibles

### 🩺 Dashboard del Doctor
- **Citas Pendientes**: Listado automático con información del paciente
- **Acciones Rápidas**: Botones para confirmar/cancelar citas
- **Actualización Automática**: Polling cada 15 segundos
- **Información Completa**: Motivo, notas del paciente, costo y duración
- **Estados de Cita**: Gestión completa del flujo de estados

### 🔄 Sistema de Tiempo Real
- **Polling Inteligente**: Actualización automática sin intervención manual
- **Notificaciones Push**: Callbacks para cambios inmediatos
- **Optimización de Rendimiento**: Polling pausable según contexto
- **Timestamps**: Indicadores de última actualización

### 🛡️ Validación y Persistencia
- **Validación Previa**: Verificación de disponibilidad antes de agendar
- **Persistencia Robusta**: Manejo de errores y reintento automático
- **Feedback Inmediato**: Confirmación visual de acciones exitosas
- **Estados de Carga**: Indicadores durante procesamiento

---

**¡Sistema Orto-Whave con Funcionalidades Avanzadas! 🚀**

### 🚀 Inicio Rápido
```bash
# Linux/macOS
./install.sh && ./start.sh

# Windows
install.bat && start.bat
```

### 📊 Últimas Actualizaciones
- ✅ Sistema de agendamiento optimizado con validación en tiempo real
- ✅ Polling automático para dashboards con configuración flexible
- ✅ Feedback instantáneo para todas las acciones del usuario
- ✅ Componentes mejorados con estados de carga y error
- ✅ Persistencia robusta con manejo avanzado de errores
- ✅ Hooks personalizados para gestión de estado optimizada

**¡Listo para producción con todas las funcionalidades implementadas! 🎉**
