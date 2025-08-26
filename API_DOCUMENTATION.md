# Documentación API REST - Sistema Orto-Whave

## Información General

**API Version:** 2.0.0  
**Base URL:** `http://localhost:4000` (desarrollo) / `https://api.ortowhave.com` (producción)  
**Content-Type:** `application/json`  
**Authentication:** JWT Bearer Token  

## Autenticación

### Obtener Token de Acceso

Todos los endpoints (excepto los públicos) requieren autenticación mediante JWT token en el header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Estados HTTP

| Código | Significado | Descripción |
|--------|-------------|-------------|
| **200** | OK | Solicitud exitosa |
| **201** | Created | Recurso creado exitosamente |
| **400** | Bad Request | Datos de entrada inválidos |
| **401** | Unauthorized | Token inválido o ausente |
| **403** | Forbidden | Acceso denegado para el rol actual |
| **404** | Not Found | Recurso no encontrado |
| **409** | Conflict | Conflicto con datos existentes |
| **422** | Unprocessable Entity | Error de validación |
| **500** | Internal Server Error | Error interno del servidor |

---

## 🔐 Módulo de Autenticación

### POST /auth/login
Iniciar sesión en el sistema.

#### Request Body
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "usuario@ejemplo.com",
      "telefono": "+57 300 123 4567",
      "rol": {
        "id": 2,
        "nombre": "doctor",
        "descripcion": "Doctor del sistema"
      },
      "isVerified": true,
      "fechaCreacion": "2025-01-20T10:00:00.000Z"
    }
  },
  "message": "Inicio de sesión exitoso"
}
```

#### Response (401)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email o contraseña incorrectos"
  }
}
```

#### Response (403)
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Debes verificar tu email antes de iniciar sesión"
  }
}
```

---

### POST /auth/register
Registrar nuevo usuario en el sistema.

#### Request Body
```json
{
  "nombre": "María",
  "apellido": "González",
  "email": "maria@ejemplo.com",
  "password": "password123",
  "telefono": "+57 301 234 5678",
  "fechaNacimiento": "1990-05-15",
  "direccion": "Calle 123 #45-67, Bogotá",
  "rolId": 3
}
```

#### Validation Rules
- `nombre`: Requerido, mínimo 2 caracteres
- `apellido`: Requerido, mínimo 2 caracteres
- `email`: Requerido, formato email válido, único
- `password`: Requerido, mínimo 8 caracteres
- `telefono`: Opcional, formato internacional
- `fechaNacimiento`: Opcional, formato YYYY-MM-DD
- `direccion`: Opcional
- `rolId`: Requerido, debe existir (1=admin, 2=doctor, 3=paciente)

#### Response (201)
```json
{
  "success": true,
  "data": {
    "id": 15,
    "nombre": "María",
    "apellido": "González",
    "email": "maria@ejemplo.com",
    "telefono": "+57 301 234 5678",
    "fechaNacimiento": "1990-05-15",
    "direccion": "Calle 123 #45-67, Bogotá",
    "isVerified": false,
    "rol": {
      "id": 3,
      "nombre": "paciente"
    },
    "fechaCreacion": "2025-01-22T15:30:00.000Z"
  },
  "message": "Usuario registrado exitosamente. Por favor verifica tu email."
}
```

#### Response (409)
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "Ya existe una cuenta con este email"
  }
}
```

---

### POST /auth/verify
Verificar email del usuario.

#### Request Body
```json
{
  "token": "abc123def456ghi789"
}
```

#### Response (200)
```json
{
  "success": true,
  "message": "Email verificado exitosamente. Ya puedes iniciar sesión."
}
```

#### Response (400)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Token de verificación inválido o expirado"
  }
}
```

---

### POST /auth/forgot-password
Solicitar recuperación de contraseña.

#### Request Body
```json
{
  "email": "usuario@ejemplo.com"
}
```

#### Response (200)
```json
{
  "success": true,
  "message": "Si el email existe, recibirás instrucciones para recuperar tu contraseña."
}
```

---

### POST /auth/reset-password
Resetear contraseña con token.

#### Request Body
```json
{
  "token": "reset_token_here",
  "password": "new_password123"
}
```

#### Response (200)
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente."
}
```

---

### GET /auth/me
Obtener información del usuario autenticado.

**Autenticación requerida:** ✅

#### Response (200)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@ejemplo.com",
    "telefono": "+57 300 123 4567",
    "fechaNacimiento": "1985-03-20",
    "direccion": "Carrera 15 #25-30, Medellín",
    "isVerified": true,
    "rol": {
      "id": 2,
      "nombre": "doctor",
      "descripcion": "Doctor del sistema"
    },
    "perfilMedico": {
      "id": 1,
      "numeroRegistroMedico": "RM-12345",
      "especialidad": "Ortopedia y Traumatología",
      "subespecialidades": ["Cirugía de Columna", "Artroscopia"],
      "experienciaAnios": 10,
      "tarifaConsulta": 120000,
      "aceptaNuevosPacientes": true
    },
    "fechaCreacion": "2025-01-15T08:00:00.000Z"
  }
}
```

---

## 👥 Módulo de Usuarios

### GET /users/admin/todos
Obtener lista de todos los usuarios (solo admin).

**Autenticación requerida:** ✅  
**Roles permitidos:** Admin

#### Query Parameters
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, max: 100)
- `rol` (opcional): Filtrar por rol (admin, doctor, paciente)
- `verified` (opcional): Filtrar por verificación (true, false)
- `search` (opcional): Buscar por nombre, apellido o email

#### Response (200)
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "nombre": "Juan",
        "apellido": "Pérez",
        "email": "juan@ejemplo.com",
        "telefono": "+57 300 123 4567",
        "isVerified": true,
        "rol": {
          "id": 2,
          "nombre": "doctor"
        },
        "fechaCreacion": "2025-01-15T08:00:00.000Z",
        "ultimoAcceso": "2025-01-22T14:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### POST /users/admin/crear-usuario
Crear nuevo usuario (solo admin).

**Autenticación requerida:** ✅  
**Roles permitidos:** Admin

#### Request Body
```json
{
  "nombre": "Carlos",
  "apellido": "Rodríguez",
  "email": "carlos@ejemplo.com",
  "password": "password123",
  "telefono": "+57 302 345 6789",
  "rolId": 2,
  "perfilMedico": {
    "numeroRegistroMedico": "RM-54321",
    "especialidad": "Traumatología",
    "experienciaAnios": 8,
    "tarifaConsulta": 150000,
    "duracionConsultaMinutos": 45,
    "aceptaNuevosPacientes": true,
    "diasLaborables": ["lunes", "martes", "miércoles", "jueves", "viernes"],
    "horarioInicio": "08:00",
    "horarioFin": "17:00"
  }
}
```

#### Response (201)
```json
{
  "success": true,
  "data": {
    "id": 16,
    "nombre": "Carlos",
    "apellido": "Rodríguez",
    "email": "carlos@ejemplo.com",
    "isVerified": true,
    "rol": {
      "id": 2,
      "nombre": "doctor"
    },
    "perfilMedico": {
      "id": 5,
      "numeroRegistroMedico": "RM-54321",
      "especialidad": "Traumatología",
      "experienciaAnios": 8,
      "tarifaConsulta": 150000
    }
  },
  "message": "Usuario creado exitosamente"
}
```

---

### PUT /users/admin/:id
Actualizar usuario específico (solo admin).

**Autenticación requerida:** ✅  
**Roles permitidos:** Admin

#### Request Body
```json
{
  "nombre": "Carlos Alberto",
  "apellido": "Rodríguez Pérez",
  "telefono": "+57 302 999 8888",
  "isVerified": true
}
```

#### Response (200)
```json
{
  "success": true,
  "data": {
    "id": 16,
    "nombre": "Carlos Alberto",
    "apellido": "Rodríguez Pérez",
    "email": "carlos@ejemplo.com",
    "telefono": "+57 302 999 8888",
    "isVerified": true,
    "fechaActualizacion": "2025-01-22T16:45:00.000Z"
  },
  "message": "Usuario actualizado exitosamente"
}
```

---

### DELETE /users/admin/:id
Eliminar usuario específico (solo admin).

**Autenticación requerida:** ✅  
**Roles permitidos:** Admin

#### Response (200)
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

#### Response (409)
```json
{
  "success": false,
  "error": {
    "code": "USER_HAS_APPOINTMENTS",
    "message": "No se puede eliminar un usuario con citas activas"
  }
}
```

---

## 📅 Módulo de Citas

### POST /citas
Crear nueva cita médica.

**Autenticación requerida:** ✅  
**Roles permitidos:** Paciente, Admin

#### Request Body
```json
{
  "doctorId": 2,
  "fechaHora": "2025-01-25T10:30:00.000Z",
  "tipoConsulta": "primera_vez",
  "motivoConsulta": "Dolor en rodilla derecha después de actividad deportiva",
  "duracionMinutos": 45
}
```

#### Validation Rules
- `doctorId`: Requerido, debe ser ID válido de doctor
- `fechaHora`: Requerido, formato ISO 8601, debe ser fecha futura
- `tipoConsulta`: Requerido, valores: "primera_vez", "seguimiento", "urgencia"
- `motivoConsulta`: Requerido, 10-1000 caracteres
- `duracionMinutos`: Opcional, default según perfil del doctor

#### Response (201)
```json
{
  "success": true,
  "data": {
    "id": 45,
    "pacienteId": 8,
    "doctorId": 2,
    "fechaHora": "2025-01-25T10:30:00.000Z",
    "duracionMinutos": 45,
    "estado": "pendiente",
    "tipoConsulta": "primera_vez",
    "motivoConsulta": "Dolor en rodilla derecha después de actividad deportiva",
    "tarifaConsulta": 120000,
    "fechaCreacion": "2025-01-22T18:15:00.000Z",
    "paciente": {
      "id": 8,
      "nombre": "María",
      "apellido": "González",
      "email": "maria@ejemplo.com",
      "telefono": "+57 301 234 5678"
    },
    "doctor": {
      "id": 2,
      "nombre": "Dr. Juan",
      "apellido": "Pérez",
      "perfilMedico": {
        "especialidad": "Ortopedia y Traumatología",
        "tarifaConsulta": 120000
      }
    }
  },
  "message": "Cita creada exitosamente. El doctor será notificado."
}
```

#### Response (409)
```json
{
  "success": false,
  "error": {
    "code": "SLOT_NOT_AVAILABLE",
    "message": "El horario solicitado no está disponible",
    "details": {
      "availableSlots": [
        "2025-01-25T09:00:00.000Z",
        "2025-01-25T11:15:00.000Z",
        "2025-01-25T14:30:00.000Z"
      ]
    }
  }
}
```

---

### GET /citas/mis-citas
Obtener citas del usuario autenticado.

**Autenticación requerida:** ✅

#### Query Parameters
- `estado` (opcional): Filtrar por estado (pendiente, confirmada, en_curso, completada, cancelada)
- `desde` (opcional): Fecha inicio (formato: YYYY-MM-DD)
- `hasta` (opcional): Fecha fin (formato: YYYY-MM-DD)
- `page` (opcional): Página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)

#### Response (200) - Para Paciente
```json
{
  "success": true,
  "data": {
    "citas": [
      {
        "id": 45,
        "fechaHora": "2025-01-25T10:30:00.000Z",
        "duracionMinutos": 45,
        "estado": "pendiente",
        "tipoConsulta": "primera_vez",
        "motivoConsulta": "Dolor en rodilla derecha después de actividad deportiva",
        "tarifaConsulta": 120000,
        "fechaCreacion": "2025-01-22T18:15:00.000Z",
        "doctor": {
          "id": 2,
          "nombre": "Dr. Juan",
          "apellido": "Pérez",
          "perfilMedico": {
            "especialidad": "Ortopedia y Traumatología",
            "numeroRegistroMedico": "RM-12345"
          }
        }
      }
    ],
    "estadisticas": {
      "total": 8,
      "pendientes": 1,
      "confirmadas": 2,
      "completadas": 4,
      "canceladas": 1
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 8
    }
  }
}
```

#### Response (200) - Para Doctor
```json
{
  "success": true,
  "data": {
    "citas": [
      {
        "id": 45,
        "fechaHora": "2025-01-25T10:30:00.000Z",
        "duracionMinutos": 45,
        "estado": "pendiente",
        "tipoConsulta": "primera_vez",
        "motivoConsulta": "Dolor en rodilla derecha después de actividad deportiva",
        "tarifaConsulta": 120000,
        "fechaCreacion": "2025-01-22T18:15:00.000Z",
        "paciente": {
          "id": 8,
          "nombre": "María",
          "apellido": "González",
          "email": "maria@ejemplo.com",
          "telefono": "+57 301 234 5678",
          "fechaNacimiento": "1990-05-15",
          "direccion": "Calle 123 #45-67, Bogotá"
        }
      }
    ],
    "estadisticas": {
      "total": 156,
      "pendientes": 12,
      "confirmadas": 8,
      "completadas": 128,
      "canceladas": 8
    }
  }
}
```

---

### PATCH /citas/:id/estado
Actualizar estado de una cita.

**Autenticación requerida:** ✅  
**Roles permitidos:** Doctor (para sus citas), Admin

#### Request Body
```json
{
  "estado": "confirmada",
  "notasDoctor": "Cita confirmada. Traer estudios radiológicos previos si los tiene."
}
```

#### Estados válidos y transiciones
- `pendiente` → `confirmada`, `cancelada`
- `confirmada` → `en_curso`, `cancelada`
- `en_curso` → `completada`
- `completada` → (estado final)
- `cancelada` → (estado final)

#### Response (200)
```json
{
  "success": true,
  "data": {
    "id": 45,
    "estado": "confirmada",
    "notasDoctor": "Cita confirmada. Traer estudios radiológicos previos si los tiene.",
    "fechaActualizacion": "2025-01-22T19:30:00.000Z"
  },
  "message": "Estado de cita actualizado exitosamente"
}
```

#### Response (400)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "No se puede cambiar de 'completada' a 'confirmada'"
  }
}
```

---

### GET /citas/disponibilidad
Consultar disponibilidad de doctores.

**Autenticación requerida:** ✅

#### Query Parameters
- `doctorId`: Requerido, ID del doctor
- `fecha`: Requerida, fecha en formato YYYY-MM-DD
- `duracionMinutos` (opcional): Duración deseada (default: 30)

#### Response (200)
```json
{
  "success": true,
  "data": {
    "doctorId": 2,
    "fecha": "2025-01-25",
    "doctor": {
      "nombre": "Dr. Juan Pérez",
      "especialidad": "Ortopedia y Traumatología",
      "tarifaConsulta": 120000,
      "duracionConsultaMinutos": 45
    },
    "horariosDisponibles": [
      {
        "inicio": "2025-01-25T08:00:00.000Z",
        "fin": "2025-01-25T08:45:00.000Z",
        "disponible": true
      },
      {
        "inicio": "2025-01-25T09:00:00.000Z",
        "fin": "2025-01-25T09:45:00.000Z",
        "disponible": true
      },
      {
        "inicio": "2025-01-25T10:00:00.000Z",
        "fin": "2025-01-25T10:45:00.000Z",
        "disponible": false,
        "razon": "Cita existente"
      },
      {
        "inicio": "2025-01-25T11:15:00.000Z",
        "fin": "2025-01-25T12:00:00.000Z",
        "disponible": true
      }
    ],
    "totalSlots": 12,
    "slotsDisponibles": 9,
    "slotsOcupados": 3
  }
}
```

---

### DELETE /citas/:id
Eliminar una cita (solo admin o antes de ser confirmada).

**Autenticación requerida:** ✅

#### Response (200)
```json
{
  "success": true,
  "message": "Cita eliminada exitosamente"
}
```

#### Response (403)
```json
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_CONFIRMED_APPOINTMENT",
    "message": "No se puede eliminar una cita confirmada. Debes cancelarla primero."
  }
}
```

---

## 👩‍⚕️ Módulo de Perfiles Médicos

### GET /perfil-medico/doctores-disponibles
Obtener lista de doctores que aceptan nuevos pacientes.

**Autenticación requerida:** ✅

#### Query Parameters
- `especialidad` (opcional): Filtrar por especialidad
- `maxTarifa` (opcional): Tarifa máxima
- `disponibleHoy` (opcional): Solo doctores disponibles hoy (true/false)

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "nombre": "Dr. Juan",
      "apellido": "Pérez",
      "perfilMedico": {
        "id": 1,
        "numeroRegistroMedico": "RM-12345",
        "especialidad": "Ortopedia y Traumatología",
        "subespecialidades": ["Cirugía de Columna", "Artroscopia"],
        "experienciaAnios": 10,
        "educacion": "Universidad Nacional de Colombia",
        "certificaciones": ["Especialista en Ortopedia", "Fellow en Artroscopia"],
        "biografia": "Especialista en ortopedia con amplia experiencia en cirugía artroscópica",
        "tarifaConsulta": 120000,
        "duracionConsultaMinutos": 45,
        "aceptaNuevosPacientes": true,
        "diasLaborables": ["lunes", "martes", "miércoles", "jueves", "viernes"],
        "horarioInicio": "08:00",
        "horarioFin": "17:00",
        "proximaDisponibilidad": "2025-01-25T09:00:00.000Z"
      },
      "estadisticas": {
        "totalPacientes": 245,
        "calificacionPromedio": 4.8,
        "tiempoPromedioRespuesta": "2 horas"
      }
    }
  ]
}
```

---

### GET /perfil-medico/:id
Obtener perfil médico específico.

**Autenticación requerida:** ✅

#### Response (200)
```json
{
  "success": true,
  "data": {
    "id": 2,
    "nombre": "Dr. Juan",
    "apellido": "Pérez",
    "email": "juan@ejemplo.com",
    "perfilMedico": {
      "id": 1,
      "numeroRegistroMedico": "RM-12345",
      "especialidad": "Ortopedia y Traumatología",
      "subespecialidades": ["Cirugía de Columna", "Artroscopia", "Medicina Deportiva"],
      "experienciaAnios": 10,
      "educacion": "Universidad Nacional de Colombia - Especialización en Ortopedia",
      "certificaciones": [
        "Especialista en Ortopedia y Traumatología",
        "Fellow en Artroscopia (AANA)",
        "Certificación en Cirugía de Columna"
      ],
      "hospitalAfiliacion": "Hospital Universitario San Ignacio",
      "biografia": "Especialista en ortopedia con amplia experiencia en cirugía artroscópica y tratamiento de lesiones deportivas. Más de 10 años de experiencia tratando atletas profesionales y pacientes con patologías complejas de rodilla y hombro.",
      "tarifaConsulta": 120000,
      "duracionConsultaMinutos": 45,
      "aceptaNuevosPacientes": true,
      "diasLaborables": ["lunes", "martes", "miércoles", "jueves", "viernes"],
      "horarioInicio": "08:00",
      "horarioFin": "17:00"
    },
    "estadisticas": {
      "totalPacientes": 245,
      "citasCompletadas": 1,
      "calificacionPromedio": 4.8,
      "tiempoPromedioRespuesta": "2 horas",
      "especialidadMasTratada": "Lesiones de rodilla"
    },
    "horariosSemana": {
      "lunes": { "inicio": "08:00", "fin": "17:00", "disponible": true },
      "martes": { "inicio": "08:00", "fin": "17:00", "disponible": true },
      "miércoles": { "inicio": "08:00", "fin": "17:00", "disponible": true },
      "jueves": { "inicio": "08:00", "fin": "17:00", "disponible": true },
      "viernes": { "inicio": "08:00", "fin": "17:00", "disponible": true },
      "sábado": { "disponible": false },
      "domingo": { "disponible": false }
    }
  }
}
```

---

## 🔔 Módulo de Notificaciones

### GET /notifications
Obtener notificaciones del usuario autenticado.

**Autenticación requerida:** ✅

#### Query Parameters
- `leida` (opcional): Filtrar por estado (true/false)
- `tipo` (opcional): Filtrar por tipo (cita_confirmada, cita_cancelada, recordatorio, cita_reagendada)
- `limit` (opcional): Número de notificaciones (default: 20, max: 100)

#### Response (200)
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 123,
        "tipo": "cita_confirmada",
        "titulo": "Cita Confirmada",
        "mensaje": "Tu cita con Dr. Juan Pérez ha sido confirmada para el 25 de enero a las 10:30 AM",
        "leida": false,
        "datos": {
          "citaId": 45,
          "doctorId": 2,
          "fechaHora": "2025-01-25T10:30:00.000Z"
        },
        "fechaCreacion": "2025-01-22T19:30:00.000Z"
      },
      {
        "id": 122,
        "tipo": "recordatorio",
        "titulo": "Recordatorio de Cita",
        "mensaje": "Recuerda tu cita de mañana con Dr. María López a las 2:00 PM",
        "leida": true,
        "datos": {
          "citaId": 44,
          "doctorId": 3,
          "fechaHora": "2025-01-23T14:00:00.000Z"
        },
        "fechaCreacion": "2025-01-22T14:00:00.000Z"
      }
    ],
    "estadisticas": {
      "total": 15,
      "noLeidas": 3,
      "leidas": 12
    }
  }
}
```

---

### GET /notifications/unread-count
Obtener contador de notificaciones no leídas.

**Autenticación requerida:** ✅

#### Response (200)
```json
{
  "success": true,
  "data": {
    "count": 3
  }
}
```

---

### PATCH /notifications/:id/read
Marcar notificación específica como leída.

**Autenticación requerida:** ✅

#### Response (200)
```json
{
  "success": true,
  "message": "Notificación marcada como leída"
}
```

---

### PATCH /notifications/read-all
Marcar todas las notificaciones como leídas.

**Autenticación requerida:** ✅

#### Response (200)
```json
{
  "success": true,
  "data": {
    "notificacionesActualizadas": 5
  },
  "message": "Todas las notificaciones marcadas como leídas"
}
```

---

## 📊 Módulo de Dashboard

### GET /dashboard/admin/estadisticas
Obtener estadísticas generales del sistema (solo admin).

**Autenticación requerida:** ✅  
**Roles permitidos:** Admin

#### Query Parameters
- `periodo` (opcional): Período de estadísticas (dia, semana, mes, año)
- `desde` (opcional): Fecha inicio para período personalizado
- `hasta` (opcional): Fecha fin para período personalizado

#### Response (200)
```json
{
  "success": true,
  "data": {
    "usuarios": {
      "total": 145,
      "activos": 128,
      "porRol": {
        "admin": 2,
        "doctor": 8,
        "paciente": 135
      },
      "registrosHoy": 3,
      "registrosSemana": 15
    },
    "citas": {
      "total": 1247,
      "hoy": 12,
      "semana": 89,
      "porEstado": {
        "pendiente": 15,
        "confirmada": 25,
        "en_curso": 3,
        "completada": 1180,
        "cancelada": 24
      },
      "ingresos": {
        "hoy": 1440000,
        "semana": 10680000,
        "mes": 42500000
      }
    },
    "doctores": {
      "total": 8,
      "disponibles": 7,
      "enConsulta": 3,
      "promedioCalificacion": 4.7
    },
    "sistema": {
      "tiempoActividad": "15 días",
      "ultimoBackup": "2025-01-22T06:00:00.000Z",
      "rendimiento": {
        "tiempoRespuestaPromedio": "285ms",
        "uso_cpu": "25%",
        "uso_memoria": "68%"
      }
    }
  }
}
```

---

### GET /dashboard/doctor/agenda
Obtener agenda del doctor autenticado.

**Autenticación requerida:** ✅  
**Roles permitidos:** Doctor

#### Query Parameters
- `fecha` (opcional): Fecha específica (YYYY-MM-DD), default: hoy
- `vista` (opcional): Tipo de vista (dia, semana, mes), default: dia

#### Response (200)
```json
{
  "success": true,
  "data": {
    "fecha": "2025-01-23",
    "doctor": {
      "id": 2,
      "nombre": "Dr. Juan Pérez",
      "especialidad": "Ortopedia y Traumatología"
    },
    "horarios": {
      "inicio": "08:00",
      "fin": "17:00",
      "duracionConsulta": 45,
      "tiempoBuffer": 15
    },
    "citas": [
      {
        "id": 44,
        "fechaHora": "2025-01-23T09:00:00.000Z",
        "duracionMinutos": 45,
        "estado": "confirmada",
        "tipoConsulta": "seguimiento",
        "motivoConsulta": "Control post-operatorio rodilla izquierda",
        "paciente": {
          "id": 12,
          "nombre": "Ana María",
          "apellido": "Jiménez",
          "telefono": "+57 310 555 6677",
          "edad": 34
        }
      },
      {
        "id": 45,
        "fechaHora": "2025-01-23T10:30:00.000Z",
        "duracionMinutos": 45,
        "estado": "pendiente",
        "tipoConsulta": "primera_vez",
        "motivoConsulta": "Dolor en rodilla derecha después de actividad deportiva",
        "paciente": {
          "id": 8,
          "nombre": "María",
          "apellido": "González",
          "telefono": "+57 301 234 5678",
          "edad": 34
        }
      }
    ],
    "estadisticasDia": {
      "totalCitas": 8,
      "confirmadas": 6,
      "pendientes": 2,
      "slotsLibres": 4,
      "ingresosPotenciales": 960000
    },
    "proximasCitas": [
      {
        "fechaHora": "2025-01-24T08:00:00.000Z",
        "paciente": "Carlos Mendoza",
        "tipo": "primera_vez"
      }
    ]
  }
}
```

---

### GET /dashboard/paciente/resumen
Obtener resumen para el dashboard del paciente.

**Autenticación requerida:** ✅  
**Roles permitidos:** Paciente

#### Response (200)
```json
{
  "success": true,
  "data": {
    "paciente": {
      "id": 8,
      "nombre": "María González",
      "edad": 34,
      "miembroDesde": "2024-11-15"
    },
    "proximaCita": {
      "id": 45,
      "fechaHora": "2025-01-25T10:30:00.000Z",
      "estado": "pendiente",
      "doctor": {
        "nombre": "Dr. Juan Pérez",
        "especialidad": "Ortopedia y Traumatología"
      },
      "tiempoRestante": "2 días, 16 horas"
    },
    "historialResumen": {
      "totalCitas": 3,
      "citasCompletadas": 2,
      "citasCanceladas": 0,
      "ultimaCita": "2024-12-20T14:00:00.000Z"
    },
    "doctoresVisitados": [
      {
        "id": 2,
        "nombre": "Dr. Juan Pérez",
        "especialidad": "Ortopedia y Traumatología",
        "ultimaVisita": "2024-12-20T14:00:00.000Z"
      }
    ],
    "recordatorios": [
      {
        "tipo": "cita_proxima",
        "mensaje": "Tu cita con Dr. Juan Pérez es en 2 días",
        "fechaHora": "2025-01-25T10:30:00.000Z"
      }
    ],
    "recomendaciones": [
      "Considera agendar cita de seguimiento después de tu próxima consulta",
      "Mantén actualizada tu información de contacto"
    ]
  }
}
```

---

## 🏥 Módulo de Productos y Reservas

### GET /products
Obtener lista de productos disponibles.

**Autenticación requerida:** ✅

#### Query Parameters
- `categoria` (opcional): Filtrar por categoría
- `disponible` (opcional): Solo productos disponibles (true/false)
- `search` (opcional): Buscar por nombre o descripción

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Férula para Muñeca",
      "descripcion": "Férula ortopédica ajustable para inmovilización de muñeca",
      "categoria": "ortesis",
      "precio": 45000,
      "disponible": true,
      "stock": 15,
      "imagen": "/images/products/ferula-muneca.jpg",
      "especificaciones": {
        "material": "Neopreno y velcro",
        "tallas": ["S", "M", "L", "XL"],
        "peso": "150g"
      }
    }
  ]
}
```

---

### POST /products/reservations
Crear reserva de producto.

**Autenticación requerida:** ✅

#### Request Body
```json
{
  "productId": 1,
  "cantidad": 2,
  "talla": "M",
  "fechaRetiro": "2025-01-25T14:00:00.000Z",
  "observaciones": "Para uso después de cirugía programada"
}
```

#### Response (201)
```json
{
  "success": true,
  "data": {
    "id": 15,
    "productId": 1,
    "cantidad": 2,
    "talla": "M",
    "estado": "pendiente",
    "fechaRetiro": "2025-01-25T14:00:00.000Z",
    "observaciones": "Para uso después de cirugía programada",
    "total": 90000,
    "producto": {
      "nombre": "Férula para Muñeca",
      "precio": 45000
    },
    "fechaCreacion": "2025-01-22T20:15:00.000Z"
  },
  "message": "Reserva creada exitosamente"
}
```

---

## 🏥 Módulo de Disponibilidad de Doctores

### GET /doctor-availability/:doctorId
Obtener disponibilidad específica de un doctor.

**Autenticación requerida:** ✅

#### Query Parameters
- `desde`: Fecha inicio (YYYY-MM-DD)
- `hasta`: Fecha fin (YYYY-MM-DD)

#### Response (200)
```json
{
  "success": true,
  "data": {
    "doctorId": 2,
    "doctor": {
      "nombre": "Dr. Juan Pérez",
      "especialidad": "Ortopedia y Traumatología"
    },
    "disponibilidad": {
      "2025-01-23": {
        "disponible": true,
        "horarios": [
          { "inicio": "08:00", "fin": "08:45", "libre": true },
          { "inicio": "09:00", "fin": "09:45", "libre": false, "citaId": 44 },
          { "inicio": "10:30", "fin": "11:15", "libre": false, "citaId": 45 }
        ]
      },
      "2025-01-24": {
        "disponible": true,
        "horarios": [
          { "inicio": "08:00", "fin": "08:45", "libre": true },
          { "inicio": "09:00", "fin": "09:45", "libre": true }
        ]
      }
    },
    "configuracion": {
      "duracionConsulta": 45,
      "tiempoBuffer": 15,
      "diasLaborables": ["lunes", "martes", "miércoles", "jueves", "viernes"],
      "horarioInicio": "08:00",
      "horarioFin": "17:00"
    }
  }
}
```

---

### POST /doctor-availability/flexible-schedule
Crear horario flexible para doctor.

**Autenticación requerida:** ✅  
**Roles permitidos:** Doctor, Admin

#### Request Body
```json
{
  "doctorId": 2,
  "tipo": "fecha_especifica",
  "fechaInicio": "2025-01-25",
  "fechaFin": "2025-01-25",
  "horarioInicio": "09:00",
  "horarioFin": "15:00",
  "duracionSlot": 30,
  "tiempoBuffer": 10,
  "activo": true,
  "descripcion": "Horario especial por conferencia médica"
}
```

#### Response (201)
```json
{
  "success": true,
  "data": {
    "id": 8,
    "doctorId": 2,
    "tipo": "fecha_especifica",
    "fechaInicio": "2025-01-25",
    "fechaFin": "2025-01-25",
    "horarioInicio": "09:00",
    "horarioFin": "15:00",
    "duracionSlot": 30,
    "tiempoBuffer": 10,
    "activo": true,
    "descripcion": "Horario especial por conferencia médica",
    "fechaCreacion": "2025-01-22T21:00:00.000Z"
  },
  "message": "Horario flexible creado exitosamente"
}
```

---

## 🚫 Manejo de Errores

### Estructura Estándar de Error

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción legible del error",
    "details": {
      "field": "campo_con_error",
      "value": "valor_recibido",
      "expected": "valor_esperado"
    },
    "timestamp": "2025-01-22T22:30:00.000Z",
    "path": "/api/endpoint",
    "method": "POST"
  }
}
```

### Códigos de Error Comunes

| Código | Descripción | Status HTTP |
|--------|-------------|-------------|
| `INVALID_CREDENTIALS` | Credenciales incorrectas | 401 |
| `EMAIL_NOT_VERIFIED` | Email no verificado | 403 |
| `EMAIL_ALREADY_EXISTS` | Email ya registrado | 409 |
| `SLOT_NOT_AVAILABLE` | Horario no disponible | 409 |
| `INVALID_STATE_TRANSITION` | Transición de estado inválida | 400 |
| `INSUFFICIENT_PERMISSIONS` | Permisos insuficientes | 403 |
| `RESOURCE_NOT_FOUND` | Recurso no encontrado | 404 |
| `VALIDATION_ERROR` | Error de validación | 422 |
| `RATE_LIMIT_EXCEEDED` | Límite de peticiones excedido | 429 |
| `INTERNAL_SERVER_ERROR` | Error interno del servidor | 500 |

---

## 📡 WebSockets

### Conexión WebSocket

**URL:** `ws://localhost:4000/notifications` (desarrollo)  
**Namespace:** `/notifications`  
**Autenticación:** Token JWT en query string

```javascript
const socket = io('http://localhost:4000/notifications', {
  auth: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
});
```

### Eventos del Cliente → Servidor

#### join_room
```javascript
socket.emit('join_room', {
  userId: 123
});
```

#### leave_room
```javascript
socket.emit('leave_room', {
  userId: 123
});
```

### Eventos del Servidor → Cliente

#### new_notification
```javascript
socket.on('new_notification', (data) => {
  console.log('Nueva notificación:', data);
  // data = {
  //   id: 124,
  //   tipo: 'cita_confirmada',
  //   titulo: 'Cita Confirmada',
  //   mensaje: 'Tu cita ha sido confirmada',
  //   datos: { citaId: 45 }
  // }
});
```

#### appointment_update
```javascript
socket.on('appointment_update', (data) => {
  console.log('Actualización de cita:', data);
  // data = {
  //   citaId: 45,
  //   estado: 'confirmada',
  //   doctorId: 2,
  //   pacienteId: 8
  // }
});
```

#### doctor_availability_changed
```javascript
socket.on('doctor_availability_changed', (data) => {
  console.log('Disponibilidad de doctor actualizada:', data);
  // data = {
  //   doctorId: 2,
  //   fecha: '2025-01-25',
  //   slotsActualizados: [...] 
  // }
});
```

---

## 📝 Notas de Implementación

### Rate Limiting
- **Límite general:** 100 requests por 15 minutos por IP
- **Login:** 5 intentos por 15 minutos por IP
- **Password reset:** 3 requests por hora por email

### Paginación
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Fechas y Horas
- Todas las fechas/horas se manejan en **UTC** (ISO 8601)
- El cliente debe convertir a timezone local
- Formato: `YYYY-MM-DDTHH:mm:ss.sssZ`

### Validación de Datos
- Todos los endpoints validan datos de entrada
- Errores de validación retornan status `422`
- Campos opcionales pueden ser `null` o omitidos

### Seguridad
- Todos los endpoints (excepto públicos) requieren JWT
- Tokens expiran en 24 horas
- Rate limiting implementado
- Validación y sanitización de datos

---

## 🔧 Ambiente de Desarrollo

### Variables de Entorno Requeridas
```env
# Básicas
NODE_ENV=development
API_PORT=4000
JWT_SECRET=your-secret-key

# Base de datos MySQL
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=ortowhave
DATABASE_PASSWORD=your-password
DATABASE_NAME=ortowhave_db

# Email
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your-mailtrap-user
MAIL_PASS=your-mailtrap-pass
```

### Comandos Útiles
```bash
# Iniciar servidor de desarrollo
npm run dev

# Ver logs de base de datos
npm run db:logs

# Ejecutar migraciones
npm run migration:run

# Revertir última migración
npm run migration:revert
```

---

**Documentación API generada:** Enero 2025  
**Versión:** 2.0.0  
**Estado:** Producción-ready  

*Para más detalles técnicos, consultar la documentación de arquitectura técnica.*
