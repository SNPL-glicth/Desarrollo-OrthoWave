# Sistema de Notificaciones de Solicitudes de Citas

Este documento describe el sistema de notificaciones de solicitudes de citas médicas implementado para OrthoWhave.

## Características Principales

### Para Pacientes
- Los pacientes pueden solicitar citas médicas que quedan en estado "pendiente"
- Pueden ver el estado de sus solicitudes (pendiente, aprobada, rechazada)
- Reciben feedback sobre el estado de sus citas

### Para Doctores
- **Campana de Notificaciones**: Muestra el número de solicitudes pendientes
- **Offcanvas de Solicitudes**: Panel lateral que muestra todas las solicitudes de citas
- **Gestión de Solicitudes**: Pueden aprobar o rechazar solicitudes con razones
- **Navegación al Calendario**: Pueden ver las fechas solicitadas directamente en el calendario

## Componentes Implementados

### Backend
1. **Endpoints de API**:
   - `GET /citas/mis-solicitudes-pendientes` - Obtener solicitudes pendientes del doctor autenticado
   - `GET /citas/doctor/:id/solicitudes-pendientes` - Obtener solicitudes de un doctor específico
   - `PATCH /citas/:id/aprobar` - Aprobar una solicitud
   - `PATCH /citas/:id/rechazar` - Rechazar una solicitud con razón opcional

2. **Servicio de Citas**:
   - Método `obtenerSolicitudesPendientesDoctor()` para filtrar solicitudes
   - Notificaciones WebSocket cuando cambia el estado de una cita

### Frontend
1. **NotificationBell**: Campana que muestra contador de notificaciones pendientes
2. **AppointmentRequestsOffcanvas**: Panel lateral para gestionar solicitudes
3. **useAppointmentRequests**: Hook personalizado para manejar el estado
4. **appointmentRequestsService**: Servicio para comunicación con la API

## Estados de las Citas

- **pendiente**: Solicitud recién creada, esperando aprobación del doctor
- **aprobada**: Doctor ha aprobado la solicitud
- **rechazada**: Doctor ha rechazado la solicitud (con razón opcional)

## Flujo de Trabajo

1. **Paciente solicita cita**: La cita se crea en estado "pendiente"
2. **Notificación al doctor**: La campana muestra el nuevo contador
3. **Doctor revisa solicitudes**: Abre el offcanvas para ver detalles
4. **Doctor toma decisión**: Aprueba o rechaza con razón
5. **Actualización en tiempo real**: WebSocket notifica los cambios
6. **Navegación al calendario**: Doctor puede ver la fecha en contexto

## Instalación y Configuración

### Base de Datos
Ejecutar la migración SQL:
```sql
-- Archivo: backend/migrations/add-notification-fields.sql
mysql -u usuario -p orto_whave_db < backend/migrations/add-notification-fields.sql
```

### Backend
Los cambios están en:
- `src/citas/citas.controller.ts`
- `src/citas/citas.service.ts`

### Frontend
Los nuevos archivos son:
- `src/services/appointmentRequestsService.ts`
- `src/hooks/useAppointmentRequests.ts`
- `src/components/doctor/AppointmentRequestsOffcanvas.tsx`
- Modificaciones en `src/components/NotificationBell.tsx`
- Modificaciones en `src/components/dashboards/DoctorDashboard.tsx`

## Uso

### Para Doctores
1. **Ver notificaciones**: La campana en el navbar muestra solicitudes pendientes
2. **Abrir panel**: Click en la campana para ver el offcanvas
3. **Revisar solicitudes**: Ver detalles completos de cada solicitud
4. **Tomar acción**: Aprobar o rechazar con botones dedicados
5. **Ver en calendario**: Botón para navegar a la fecha específica

### Funciones Adicionales
- **Auto-actualización**: Las solicitudes se actualizan automáticamente cada 30 segundos
- **Navegación fluida**: Desde solicitudes se puede ir directamente al calendario
- **Filtros inteligentes**: Solo se muestran solicitudes relevantes para cada doctor
- **Estados visuales**: Colores diferentes para cada estado de solicitud

## Próximas Mejoras

1. **Notificaciones Push**: Implementar notificaciones del navegador
2. **Filtros avanzados**: Por fecha, tipo de consulta, etc.
3. **Historial completo**: Ver todas las solicitudes (no solo pendientes)
4. **Métricas**: Dashboard con estadísticas de solicitudes
5. **Notificaciones para pacientes**: Cuando el doctor aprueba/rechaza

## Tecnologías Utilizadas

- **Backend**: NestJS, TypeORM, WebSockets
- **Frontend**: React, TypeScript, Tailwind CSS
- **Base de datos**: MySQL/MariaDB
- **Tiempo real**: Socket.io

## Soporte

Para dudas o issues con el sistema de notificaciones, consultar:
- Logs del backend en la consola
- Network tab para verificar llamadas API
- Console del navegador para errores de frontend
