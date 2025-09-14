# Optimización WebSocket - Evitar Saturación del Servidor

## 🎯 Objetivo
Implementar WebSocket **SOLO** en funcionalidades críticas que requieren tiempo real, evitando saturar el servidor con eventos innecesarios.

## ✅ Eventos WebSocket CRÍTICOS Implementados

### 1. **Notificaciones de Citas** - ESENCIAL
- **Cuándo**: Doctor aprueba/rechaza una cita
- **A quién**: Solo al paciente específico
- **Por qué**: El paciente necesita saber inmediatamente el estado de su solicitud

### 2. **Contador de Solicitudes Pendientes** - ESENCIAL
- **Cuándo**: Nueva solicitud de cita o aprobación/rechazo
- **A quién**: Solo al doctor específico
- **Por qué**: Doctores no pueden perder solicitudes importantes

### 3. **Cambios de Estado de Citas** - IMPORTANTE
- **Cuándo**: Estados críticos: `aprobada`, `rechazada`, `cancelada`, `confirmada`
- **A quién**: Doctor y paciente involucrados
- **Por qué**: Ambas partes necesitan ver cambios de estado inmediatamente

### 4. **Disponibilidad de Horarios** - IMPORTANTE
- **Cuándo**: Doctor cambia horarios de atención
- **A quién**: Todos los usuarios (para disponibilidad)
- **Por qué**: Los pacientes necesitan ver nueva disponibilidad

### 5. **Eliminación de Citas** - IMPORTANTE
- **Cuándo**: Se elimina una cita
- **A quién**: Doctor y paciente involucrados
- **Por qué**: Ambas partes deben saber que la cita ya no existe

## ❌ Eventos ELIMINADOS para Optimización

### 1. **Actualizaciones Generales de Dashboard**
- **Antes**: Cada cambio disparaba eventos de dashboard
- **Ahora**: Solo polling cada 45 segundos (suficiente para estadísticas)
- **Razón**: Las estadísticas no necesitan ser instantáneas

### 2. **Listas de Usuarios**
- **Antes**: Cada nuevo usuario disparaba eventos
- **Ahora**: Solo nuevos doctores (importante para pacientes)
- **Razón**: Evitar spam de eventos por registros de pacientes

### 3. **Actualizaciones de Perfil**
- **Antes**: Cada cambio de perfil disparaba múltiples eventos
- **Ahora**: Solo cambios de horarios de doctores
- **Razón**: Solo los horarios afectan a otros usuarios

### 4. **Eventos de Lista Genéricos**
- **Antes**: `list_update` para todo tipo de listas
- **Ahora**: Eliminados, se usa polling
- **Razón**: Las listas no cambian tan frecuentemente

## 🔧 Implementación Optimizada

### Backend - CitasService
```typescript
// ANTES: 8+ eventos por operación
// AHORA: Solo 2-3 eventos críticos

// Creación de cita
this.websocketGateway.notifyCounterUpdate('pending_appointments', count, doctorId);
this.websocketGateway.notifyCalendarSync(doctorId);

// Cambio de estado  
if (['aprobada', 'rechazada', 'cancelada', 'confirmada'].includes(estado)) {
  this.websocketGateway.notifyAppointmentStatusChange(...);
}
```

### Frontend - Hooks Optimizados
```typescript
// useRealtimeDashboard - Solo eventos críticos
socket.on('counter_update', handleCounterUpdate);
socket.on('appointment_status_changed', handleAppointmentEvents);
socket.on('schedule_updated', handleScheduleUpdate);

// useRealtimeAppointments - Solo cambios importantes
socket.on('appointment_status_changed', handleAppointmentStatusChanged);
socket.on('appointment_deleted', handleAppointmentDeleted);
socket.on('calendar_sync', () => fetchAppointments());
```

## 📊 Resultados de la Optimización

### Reducción de Eventos WebSocket
- **Antes**: ~15-20 eventos por operación de cita
- **Ahora**: ~3-5 eventos por operación crítica
- **Reducción**: ~70% menos tráfico WebSocket

### Eventos por Tipo de Operación
1. **Nueva cita**: 2 eventos (contador + disponibilidad)
2. **Aprobar cita**: 3 eventos (estado + contador + disponibilidad)  
3. **Eliminar cita**: 3 eventos (eliminación + contador + disponibilidad)
4. **Cambio horarios doctor**: 2 eventos (horarios + calendario)

### Fallback con Polling
- **Dashboard**: Polling cada 45 segundos
- **Listas de citas**: Polling cada 30 segundos
- **Solo cuando WebSocket desconectado**

## 🚀 Beneficios de la Optimización

1. **Menos Carga del Servidor**: ~70% reducción en eventos WebSocket
2. **Mejor Performance**: Solo eventos que realmente importan
3. **Experiencia de Usuario Mantiene**: Funcionalidades críticas siguen siendo instantáneas
4. **Escalabilidad**: Puede manejar más usuarios concurrentes
5. **Red Más Eficiente**: Menos ancho de banda utilizado

## 🎯 Funcionalidades que Siguen Siendo Instantáneas

- ✅ Notificaciones de citas aprobadas/rechazadas
- ✅ Contador de solicitudes pendientes para doctores  
- ✅ Cambios de estado de citas importantes
- ✅ Disponibilidad de horarios de doctores
- ✅ Eliminación de citas

## 📝 Funcionalidades con Polling (No Críticas)

- ⏰ Estadísticas del dashboard (45s)
- ⏰ Listas de usuarios (45s)  
- ⏰ Información general del perfil (45s)
- ⏰ Datos no críticos del dashboard (45s)

Esta optimización mantiene la experiencia de tiempo real donde realmente importa, mientras protege el servidor de saturación innecesaria.