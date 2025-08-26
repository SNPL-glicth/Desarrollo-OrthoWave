# Sistema de Limpieza Automática de Datos

## Descripción General

El sistema Orto-Whave ahora incluye un sistema automático de limpieza de datos que elimina pacientes y sus documentos después de 6 meses para mantener la base de datos optimizada y cumplir con políticas de retención de datos.

## Características Principales

### 🔄 Limpieza Automática
- **Frecuencia**: Cada domingo a las 2:00 AM (horario de Colombia)
- **Criterio**: Elimina pacientes creados hace más de 6 meses
- **Protección**: Los usuarios con "demo" o "test" en su email/nombre NUNCA se eliminan

### 🎯 Alcance de la Limpieza
Cuando se elimina un paciente, se remueve:
1. **Documentos físicos**: Archivos PDF del sistema de archivos
2. **Registros de documentos**: Entradas en la base de datos
3. **Perfil de paciente**: Información del paciente
4. **Usuario**: Cuenta de usuario completa

### 🛡️ Protecciones de Seguridad
- **Usuarios demo protegidos**: Cualquier usuario con "demo" o "test" en email/nombre
- **Solo datos antiguos**: Únicamente pacientes con más de 6 meses
- **Logs detallados**: Registro completo de todas las operaciones
- **Manejo de errores**: Errores individuales no afectan el proceso general

## Endpoints API

### GET `/api/cleanup/stats`
**Permisos**: Doctores y Administradores

Obtiene estadísticas del sistema de limpieza:

```json
{
  "totalPatients": 150,
  "oldPatients": 45,
  "demoPatients": 5,
  "eligibleForDeletion": 40
}
```

### POST `/api/cleanup/run`
**Permisos**: Solo Administradores

Ejecuta la limpieza manual inmediatamente:

```json
{
  "success": true,
  "message": "Limpieza ejecutada exitosamente",
  "deletedPatients": 15,
  "deletedDocuments": 42
}
```

## Implementación Técnica

### Backend (NestJS)

#### Archivos Clave:
- `src/cleanup/cleanup.service.ts` - Lógica principal del servicio
- `src/cleanup/cleanup.controller.ts` - Endpoints REST
- `src/cleanup/cleanup.module.ts` - Módulo NestJS
- `src/app.module.ts` - Integración al app principal

#### Configuración del Cron Job:
```typescript
@Cron('0 2 * * 0') // Cada domingo a las 2:00 AM
async cleanupOldPatients() {
  // Lógica de limpieza...
}
```

### Frontend (React)

#### Componente de Administración:
- `src/components/admin/CleanupManager.tsx` - Panel de control y estadísticas

## Uso del Sistema

### Para Administradores

1. **Ver Estadísticas**:
   - Navegar al panel de administración
   - Acceder a la sección "Gestión de Limpieza Automática"
   - Visualizar estadísticas en tiempo real

2. **Ejecutar Limpieza Manual**:
   - Hacer clic en "Ejecutar Limpieza Ahora"
   - Confirmar la operación en el diálogo
   - Revisar el resultado en pantalla

3. **Monitorear Logs**:
   ```bash
   # Ver logs del backend
   tail -f backend/logs/app.log
   ```

### Para Doctores

- **Solo visualización**: Pueden ver las estadísticas pero no ejecutar limpieza manual

## Configuración y Personalización

### Cambiar Frecuencia de Limpieza

Editar `src/cleanup/cleanup.service.ts`:

```typescript
// Cambiar de semanal a diario
@Cron('0 2 * * *') // Todos los días a las 2:00 AM

// Cambiar de semanal a mensual
@Cron('0 2 1 * *') // El primer día de cada mes a las 2:00 AM
```

### Modificar Período de Retención

```typescript
// Cambiar de 6 meses a 1 año
const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 12); // Cambiar -6 por -12
```

### Personalizar Criterios de Protección

```typescript
// Agregar más criterios de protección
const isProtected = patient.email.toLowerCase().includes('demo') || 
                   patient.email.toLowerCase().includes('test') ||
                   patient.email.toLowerCase().includes('admin') ||
                   patient.nombre.toLowerCase().includes('importante');
```

## Logging y Monitoreo

### Logs Generados

La limpieza genera logs detallados:

```
[CleanupService] Iniciando limpieza automática de pacientes antiguos...
[CleanupService] Buscando pacientes creados antes de: 2025-02-22T19:00:00.000Z
[CleanupService] Encontrados 15 pacientes para eliminar
[CleanupService] Paciente eliminado: usuario@ejemplo.com (creado: 2024-12-15)
[CleanupService] Archivo eliminado: /uploads/documents/file123.pdf
[CleanupService] Limpieza completada: 15 pacientes y 42 documentos eliminados
```

### Métricas Importantes

- **Tiempo de ejecución**: Monitoreado automáticamente
- **Errores**: Registrados individualmente sin afectar el proceso
- **Contadores**: Pacientes y documentos eliminados por sesión

## Instalación y Configuración Inicial

### 1. Dependencias Backend
```bash
npm install @nestjs/schedule
```

### 2. Variables de Entorno
Asegurarse que esté configurado el timezone:
```bash
TZ=America/Bogota
```

### 3. Permisos de Sistema
El servicio necesita permisos para:
- Leer la base de datos
- Eliminar archivos del sistema de archivos
- Escribir logs

## Consideraciones de Seguridad

### ⚠️ Importante
- **Irreversible**: La limpieza no se puede deshacer
- **Backup**: Considerar respaldos antes de habilitar en producción
- **Testing**: Probar en ambiente de desarrollo primero
- **Notifications**: Considerar notificar a los usuarios antes de eliminar sus datos

### Recomendaciones
1. **Ambiente de pruebas**: Probar completamente antes de producción
2. **Políticas de retención**: Documentar y comunicar las políticas
3. **Auditoría**: Mantener logs de todas las operaciones
4. **Backups**: Sistema de respaldo antes de eliminación masiva

## Troubleshooting

### Problemas Comunes

**Error: No se pueden eliminar archivos**
- Verificar permisos del directorio de uploads
- Confirmar que el servicio tiene acceso de escritura

**Cron job no se ejecuta**
- Verificar que ScheduleModule esté importado
- Confirmar timezone del servidor
- Revisar logs de NestJS

**Errores de base de datos**
- Verificar relaciones entre entidades
- Confirmar que TypeORM está configurado correctamente

### Logs de Debug

Para habilitar logs más detallados:

```typescript
// En cleanup.service.ts
this.logger.debug(`Evaluando paciente: ${patient.email}`);
this.logger.debug(`Archivo eliminado: ${doc.filePath}`);
```

## Estado del Sistema

✅ **Implementado y Funcionando**:
- Servicio de limpieza automática
- Cron job semanal
- API endpoints para administradores
- Panel de control frontend
- Protección de usuarios demo
- Logging detallado

🚀 **Listo para Producción**: El sistema está completamente implementado y puede ser usado en producción con las configuraciones apropiadas.

---

*Última actualización: 22 de Agosto, 2025*
