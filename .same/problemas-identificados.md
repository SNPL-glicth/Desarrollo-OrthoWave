# Problemas Identificados en el Sistema de Autenticación de Orto-Whave

## 🔴 PROBLEMAS CRÍTICOS DE SEGURIDAD

### 1. Uso inseguro de SHA256 para contraseñas
**Ubicación:** `backend/src/auth/auth.service.ts` líneas 19-22, 82-85
**Problema:** Se usa SHA256 sin salt, lo cual es extremadamente inseguro
**Solución:** Implementar bcrypt que ya está instalado en las dependencias

```typescript
// ACTUAL (INSEGURO):
const hashedPassword = crypto
  .createHash('sha256')
  .update(password)
  .digest('hex');

// DEBE SER:
const hashedPassword = await bcrypt.hash(password, 10);
```

## 🟡 PROBLEMAS DE INCONSISTENCIA

### 2. Inconsistencia en nombres de campos rol/role
**Ubicación:** `frontend/my-app/src/context/AuthContext.jsx` línea 42
**Problema:** Se accede a `response.user.role` pero el backend devuelve `rol`
**Impacto:** Redirección por roles no funciona correctamente

### 3. Caracteres extraños en archivos
**Ubicación:**
- `frontend/my-app/src/services/api.js` línea 1
- `backend/src/auth/auth.controller.ts` línea 1
**Problema:** Archivos contienen caracteres no printables que pueden causar errores

## 🟠 PROBLEMAS DE FUNCIONALIDAD

### 4. Validación de tipos insuficiente
**Ubicación:** `backend/src/auth/auth.controller.ts`
**Problema:** No hay DTOs para validar los datos de entrada

### 5. Manejo inconsistente de errores
**Ubicación:** `backend/src/auth/auth.controller.ts` línea 16
**Problema:** Se lanza Error genérico en lugar de UnauthorizedException

### 6. Configuración de base de datos con credenciales hardcodeadas
**Ubicación:** `backend/src/config/database.config.ts`
**Problema:** Credenciales por defecto visibles en el código

## 🟢 MEJORAS RECOMENDADAS

### 7. Falta de refresh tokens
**Problema:** Solo se maneja access token, no hay sistema de refresh

### 8. Logs de debugging en producción
**Problema:** Muchos console.log que deberían eliminarse en producción

### 9. Falta de rate limiting
**Problema:** No hay protección contra ataques de fuerza bruta

## PLAN DE CORRECCIÓN

1. ✅ Migrar a bcrypt para contraseñas
2. ✅ Corregir inconsistencias rol/role
3. ✅ Limpiar caracteres extraños en archivos
4. ✅ Implementar DTOs de validación
5. ✅ Mejorar manejo de errores
6. ✅ Configurar variables de entorno
7. ⏳ Implementar refresh tokens (opcional)
8. ⏳ Limpiar logs de debugging
9. ⏳ Añadir rate limiting (opcional)
