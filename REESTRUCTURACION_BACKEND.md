# REESTRUCTURACIÓN COMPLETA DEL BACKEND - ORTO WHAVE

## 📋 ANÁLISIS DE LA ESTRUCTURA ACTUAL

### 🏗️ Módulos Existentes
```
src/
├── auth/               # ✅ Autenticación (completo)
├── users/              # ✅ Gestión de usuarios (completo)
├── roles/              # ✅ Roles del sistema (completo)
├── citas/              # ⚠️ Gestión de citas (necesita mejoras)
├── perfil-medico/      # ✅ Perfiles médicos (completo)
├── pacientes/          # ✅ Gestión de pacientes (completo)
├── historia-clinica/   # 🔄 Historia clínica (básico)
├── websocket/          # ✅ WebSocket para tiempo real (completo)
├── cache/              # ✅ Cache service (completo)
├── mail/               # ✅ Servicio de correo (completo)
└── config/             # ✅ Configuraciones (completo)
```

### 📊 Endpoints Identificados

#### 🔐 AUTH (`/auth`)
- `POST /auth/login` ✅
- `POST /auth/register` ✅
- `POST /auth/verify` ✅
- `GET /auth/me` ✅
- `POST /auth/forgot-password` ✅
- `POST /auth/reset-password` ✅

#### 👥 USERS (`/users`)
- `GET /users/me` ✅
- `PUT /users/me` ✅
- `POST /users/admin/crear-usuario` ✅
- `POST /users/public/crear-usuario` ✅
- `GET /users/public/roles` ✅
- `GET /users/admin` ✅
- `GET /users/admin/por-rol/:rol` ✅
- `GET /users/admin/buscar` ✅
- `GET /users/admin/estadisticas` ✅
- `GET /users/admin/:id` ✅
- `PUT /users/admin/:id` ✅
- `PUT /users/admin/:id/estado` ✅
- `DELETE /users/admin/:id` ✅

#### 📅 CITAS (`/citas`)
- `POST /citas` ✅
- `GET /citas/paciente/:id` ✅
- `GET /citas/doctor/:id` ✅
- `GET /citas/mis-citas` ✅
- `GET /citas/pendientes-aprobacion` ✅
- `GET /citas/disponibilidad` ✅
- `GET /citas/:id` ✅
- `PATCH /citas/:id/estado` ✅
- `DELETE /citas/:id` ✅
- `GET /citas/doctor/:doctorId/agenda/:fecha` ✅

#### 📊 DASHBOARD CITAS (`/dashboard/citas`)
- `GET /dashboard/citas/doctores-disponibles` ✅
- `GET /dashboard/citas/estadisticas` ✅
- `GET /dashboard/citas/estadisticas/admin` ✅
- `GET /dashboard/citas/disponibilidad-semanal/:doctorId` ✅
- `GET /dashboard/citas/especialidades` ✅
- `GET /dashboard/citas/resumen-paciente` ✅
- `GET /dashboard/citas/agenda-doctor` ✅
- `GET /dashboard/citas/validar-disponibilidad` ✅
- `GET /dashboard/citas/doctores-recomendados` ✅
- `GET /dashboard/citas/estado-sistema` ✅
- `GET /dashboard/citas/panel-medico` ✅

#### 👨‍⚕️ PERFIL MÉDICO (`/perfil-medico`)
- `GET /perfil-medico/doctores` ✅
- `GET /perfil-medico/doctores-disponibles` ✅
- `GET /perfil-medico/mi-perfil` ✅
- `GET /perfil-medico/usuario/:id` ✅
- `POST /perfil-medico` ✅
- `PATCH /perfil-medico/mi-perfil` ✅
- `PATCH /perfil-medico/usuario/:id` ✅

#### 🏥 PACIENTES (`/pacientes`)
- `GET /pacientes` ✅
- `GET /pacientes/mis-pacientes` ✅
- `GET /pacientes/mi-perfil` ✅
- `GET /pacientes/buscar` ✅
- `GET /pacientes/estadisticas` ✅
- `GET /pacientes/usuario/:id` ✅
- `POST /pacientes` ✅
- `PATCH /pacientes/mi-perfil` ✅
- `PATCH /pacientes/usuario/:id` ✅
- `POST /pacientes/crear-pacientes-prueba` ✅

---

## 🎯 MEJORAS PROPUESTAS

### 1. 🔧 REESTRUCTURACIÓN DE ENDPOINTS

#### A. Organización por Versión de API
```
/api/v1/
├── auth/
├── users/
├── appointments/     # Nuevo nombre para citas
├── doctors/          # Nuevo módulo separado
├── patients/         # Renombrado de pacientes
├── dashboard/
└── admin/
```

#### B. Consolidación de Endpoints de Dashboard
```
/api/v1/dashboard/
├── stats/           # Estadísticas generales
├── appointments/    # Gestión de citas para dashboard
├── users/           # Gestión de usuarios para dashboard
└── system/          # Estado del sistema
```

### 2. 📦 NUEVOS MÓDULOS PROPUESTOS

#### A. Módulo de Servicios
```typescript
// services/
├── entities/service.entity.ts
├── services.controller.ts
├── services.service.ts
├── services.module.ts
└── dto/
    ├── create-service.dto.ts
    └── update-service.dto.ts
```

#### B. Módulo de Notificaciones
```typescript
// notifications/
├── entities/notification.entity.ts
├── notifications.controller.ts
├── notifications.service.ts
├── notifications.module.ts
└── dto/
    ├── create-notification.dto.ts
    └── notification-settings.dto.ts
```

#### C. Módulo de Configuración del Sistema
```typescript
// system-config/
├── entities/system-config.entity.ts
├── system-config.controller.ts
├── system-config.service.ts
├── system-config.module.ts
└── dto/
    ├── update-config.dto.ts
    └── schedule-config.dto.ts
```

### 3. 🛠️ REFACTORIZACIÓN DE CONTROLADORES

#### A. Separación de Responsabilidades

**Actual:** Controlador de Citas muy grande
**Propuesto:** 
```typescript
// appointments/
├── appointments.controller.ts     # CRUD básico
├── appointments-admin.controller.ts  # Funciones admin
├── appointments-doctor.controller.ts # Funciones doctor
└── appointments-patient.controller.ts # Funciones paciente
```

#### B. Middleware de Autorización Mejorado
```typescript
// guards/
├── role.guard.ts          # Guard por rol
├── owner.guard.ts         # Guard de propietario
├── appointment.guard.ts   # Guard específico para citas
└── admin.guard.ts         # Guard solo admin
```

### 4. 📊 NUEVOS ENDPOINTS PROPUESTOS

#### A. API de Reportes
```
GET /api/v1/reports/appointments/summary
GET /api/v1/reports/doctors/performance
GET /api/v1/reports/patients/statistics
GET /api/v1/reports/system/usage
```

#### B. API de Configuración
```
GET /api/v1/config/schedule-settings
PUT /api/v1/config/schedule-settings
GET /api/v1/config/system-settings
PUT /api/v1/config/system-settings
```

#### C. API de Búsqueda Unificada
```
GET /api/v1/search/appointments
GET /api/v1/search/patients
GET /api/v1/search/doctors
GET /api/v1/search/global
```

---

## 🔄 PLAN DE MIGRACIÓN

### FASE 1: Preparación (SQLite)
1. ✅ Revisar endpoints actuales
2. 🔄 Crear nuevos módulos
3. 🔄 Implementar middleware mejorado
4. 🔄 Actualizar documentación

### FASE 2: Optimización
1. 🔄 Implementar cache Redis
2. 🔄 Mejorar manejo de errores
3. 🔄 Añadir validaciones completas
4. 🔄 Implementar rate limiting

### FASE 3: Testing
1. 🔄 Tests unitarios completos
2. 🔄 Tests de integración
3. 🔄 Tests de performance
4. 🔄 Validación con frontend

### FASE 4: Producción (MySQL + Docker)
1. 🔄 Migración a MySQL
2. 🔄 Dockerización completa
3. 🔄 Configuración de CI/CD
4. 🔄 Monitoreo y logging

---

## 📝 ESTRUCTURA PROPUESTA FINAL

```
backend/
├── src/
│   ├── common/                 # Utilities compartidas
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   └── filters/
│   ├── config/                 # Configuraciones
│   ├── database/               # Migraciones y seeders
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── appointments/       # Renombrado de citas
│   │   ├── doctors/            # Separado de perfil-medico
│   │   ├── patients/           # Renombrado de pacientes
│   │   ├── services/           # Nuevo
│   │   ├── notifications/      # Nuevo
│   │   ├── reports/            # Nuevo
│   │   ├── dashboard/          # Consolidado
│   │   └── admin/              # Nuevo
│   ├── shared/                 # DTOs y interfaces compartidas
│   └── main.ts
├── test/                       # Tests organizados
├── docs/                       # Documentación API
└── docker/                     # Configuración Docker
```

---

## 🚀 PASOS INMEDIATOS

### 1. Validar Endpoints Actuales
```bash
cd backend
npm run dev
# Probar con scripts existentes
node ../test-backend.js
node ../test-endpoints.js
```

### 2. Crear Branch de Refactoring
```bash
git checkout -b feature/backend-restructure
```

### 3. Implementar Nuevos Módulos
- Módulo de servicios
- Módulo de notificaciones
- Controladores organizados por rol

### 4. Actualizar Frontend
- Adaptar servicios para usar nuevos endpoints
- Implementar manejo de errores mejorado
- Actualizar interfaces TypeScript

---

## 📊 MÉTRICAS DE ÉXITO

- ✅ Todos los endpoints responden correctamente
- ✅ Frontend consume solo endpoints del backend
- ✅ Base de datos SQLite funcional
- ✅ Tests pasan al 100%
- ✅ Documentación actualizada
- ✅ Performance mejorada en 30%

---

¿Procedemos con la implementación paso a paso?
