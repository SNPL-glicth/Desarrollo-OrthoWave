# 🧪 Instrucciones para Probar la Sincronización del Mini Calendario

## 🎯 Objetivo
Verificar que el mini calendario y el calendario principal funcionen con sincronización bidireccional perfecta como Google Calendar.

## 🚀 Cómo realizar las pruebas

### 1. **Preparar el entorno**
```bash
cd /home/nicolas/Documentos/da/Desarrollo-Orto-Whave/frontend/my-app
npm start
```

### 2. **Acceder al calendario**
1. Iniciar sesión como doctor
2. Ir a `/calendar` o hacer clic en "Mi Calendario" desde `/dashboard/doctor/pacientes`
3. Abrir el componente de debug haciendo clic en "Debug Calendar" (esquina inferior derecha)

### 3. **Pruebas de sincronización Mini → Grande**

#### ✅ **Prueba 1: Clic en día del mini calendario**
- **Acción**: Hacer clic en cualquier día del mini calendario
- **Resultado esperado**: 
  - El calendario principal navega a esa fecha específica
  - El debug muestra el cambio de fecha
  - El día queda resaltado en el mini calendario

#### ✅ **Prueba 2: Navegación por flechas del mini calendario**
- **Acción**: Usar las flechas ← → del mini calendario para cambiar meses
- **Resultado esperado**:
  - El calendario principal navega al mes seleccionado (día 15)
  - El mini calendario muestra el nuevo mes
  - El título del navbar se actualiza

#### ✅ **Prueba 3: Clic en días de meses anteriores/siguientes**
- **Acción**: Hacer clic en días grises (de meses anterior/siguiente) en el mini calendario
- **Resultado esperado**:
  - El calendario principal navega a esa fecha exacta
  - El mini calendario cambia al mes correspondiente
  - El día queda seleccionado correctamente

### 4. **Pruebas de sincronización Grande → Mini**

#### ✅ **Prueba 4: Navegación con flechas del navbar principal**
- **Acción**: Usar las flechas ← → del navbar principal
- **Resultado esperado**:
  - El mini calendario se sincroniza automáticamente
  - El mes mostrado en el mini calendario coincide con el principal
  - El debug registra el cambio

#### ✅ **Prueba 5: Botón "Hoy" del navbar**
- **Acción**: Hacer clic en "Hoy" en el navbar principal
- **Resultado esperado**:
  - El mini calendario navega al mes actual
  - El día de hoy queda resaltado en azul
  - Ambos calendarios muestran la fecha actual

#### ✅ **Prueba 6: Cambio de vista (Mes/Semana/Día)**
- **Acción**: Cambiar entre vistas usando el dropdown del navbar
- **Resultado esperado**:
  - El mini calendario se mantiene sincronizado
  - La fecha activa se preserva en el mini calendario
  - El comportamiento de navegación se adapta a la nueva vista

### 5. **Pruebas de comportamiento Google Calendar**

#### ✅ **Prueba 7: Resaltado del día actual**
- **Verificar**: El día de hoy debe aparecer con fondo azul en el mini calendario
- **Comportamiento**: Debe ser consistente independiente de navegación

#### ✅ **Prueba 8: Día seleccionado vs día actual**
- **Caso 1**: Si navegas a una fecha diferente al día actual → día seleccionado en azul claro
- **Caso 2**: Si regresas al día actual → día actual en azul oscuro
- **Caso 3**: Si el día actual está seleccionado → azul oscuro

#### ✅ **Prueba 9: Comportamiento con meses de diferente cantidad de días**
- **Acción**: Navegar entre enero (31 días) ↔ febrero (28/29 días) ↔ marzo (31 días)
- **Resultado esperado**: La sincronización debe funcionar correctamente sin errores

### 6. **Pruebas de rendimiento**

#### ✅ **Prueba 10: Navegación rápida**
- **Acción**: Hacer clic rápidamente múltiples veces en diferentes días
- **Resultado esperado**: No debe haber desfase ni errores de sincronización

#### ✅ **Prueba 11: Cambios de vista rápidos**
- **Acción**: Cambiar rápidamente entre vistas mes/semana/día
- **Resultado esperado**: El mini calendario debe mantener la sincronización sin problemas

## 🐛 Cómo reportar problemas

Si encuentras algún problema, anota:

1. **Pasos exactos** para reproducir el error
2. **Resultado esperado** vs **resultado obtenido**
3. **Información del debug** (fecha/hora del log)
4. **Vista actual** cuando ocurrió el problema
5. **Capturas de pantalla** si es posible

## ✅ Criterios de éxito

La implementación es exitosa si:
- ✅ **Todas las 11 pruebas pasan**
- ✅ **No hay desfases** entre mini y calendario principal  
- ✅ **Los cambios son instantáneos** (< 100ms)
- ✅ **No hay errores en consola**
- ✅ **El comportamiento es idéntico a Google Calendar**

## 🔧 Modificaciones realizadas

### Archivos corregidos:
1. **`MiniCalendar.tsx`** - Corregida navegación por flechas (usa día 15 para centrar el mes)
2. **`GoogleStyleCalendar.tsx`** - Mejorada sincronización con fechas normalizadas
3. **`GoogleCalendarPage.tsx`** - Agregado componente de debug
4. **`App.tsx`** - Agregada ruta `/calendar` faltante
5. **`DebugCalendarSync.tsx`** - Nuevo componente para monitorear sincronización

### Funcionamiento técnico:
- **Mini → Grande**: `onDateSelect()` dispara cambio en calendario principal
- **Grande → Mini**: `useEffect()` en mini calendario escucha cambios de `currentDate`
- **Estado global**: Manejado por `useGoogleCalendar()` hook
- **Prevención de loops**: Comparación de fechas normalizadas

¡Ahora el mini calendario debería funcionar exactamente como Google Calendar! 🎉
