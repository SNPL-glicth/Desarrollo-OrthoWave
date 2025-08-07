-- Script para crear solicitudes de citas de prueba
-- Esto te ayudará a probar el sistema de notificaciones

-- Primero, vamos a verificar que tenemos usuarios de prueba
SELECT * FROM usuarios WHERE rol_id IN (2, 3) LIMIT 5;

-- Insertar algunas citas de prueba en estado 'pendiente'
-- Nota: Ajusta los IDs según los usuarios que tengas en tu base de datos

-- Ejemplo 1: Cita de prueba para hoy + 2 días
INSERT INTO citas (
    paciente_id, 
    doctor_id, 
    fechaHora, 
    duracion, 
    estado, 
    tipoConsulta, 
    motivoConsulta, 
    notasPaciente,
    fecha_creacion
) VALUES (
    3, -- ID del paciente (ajustar según tu BD)
    2, -- ID del doctor (ajustar según tu BD)
    DATE_ADD(NOW(), INTERVAL 2 DAY), -- Cita en 2 días
    60,
    'pendiente',
    'primera_vez',
    'Dolor en la rodilla derecha desde hace 2 semanas. Se presenta especialmente al subir escaleras y después de estar mucho tiempo sentado.',
    'Prefiero cita por la mañana si es posible, entre 9am y 12pm',
    NOW()
);

-- Ejemplo 2: Otra cita de prueba para mañana
INSERT INTO citas (
    paciente_id, 
    doctor_id, 
    fechaHora, 
    duracion, 
    estado, 
    tipoConsulta, 
    motivoConsulta, 
    fecha_creacion
) VALUES (
    3, -- ID del paciente
    2, -- ID del doctor
    DATE_ADD(NOW(), INTERVAL 1 DAY), -- Cita mañana
    45,
    'pendiente',
    'control',
    'Control post-operatorio de fractura en muñeca izquierda. Necesito revisión de evolución.',
    NOW()
);

-- Ejemplo 3: Cita de seguimiento
INSERT INTO citas (
    paciente_id, 
    doctor_id, 
    fechaHora, 
    duracion, 
    estado, 
    tipoConsulta, 
    motivoConsulta, 
    notasPaciente,
    fecha_creacion
) VALUES (
    3, -- ID del paciente
    2, -- ID del doctor
    DATE_ADD(NOW(), INTERVAL 3 DAY), -- Cita en 3 días
    30,
    'pendiente',
    'seguimiento',
    'Seguimiento de tratamiento para tendinitis en hombro derecho. Evaluación de progreso.',
    'He estado haciendo los ejercicios recomendados. El dolor ha disminuido pero aún persiste un poco.',
    NOW()
);

-- Verificar que las citas se crearon correctamente
SELECT 
    c.id,
    c.fechaHora,
    c.estado,
    c.tipoConsulta,
    c.motivoConsulta,
    p.nombre as paciente_nombre,
    p.apellido as paciente_apellido,
    d.nombre as doctor_nombre,
    d.apellido as doctor_apellido
FROM citas c
JOIN usuarios p ON c.paciente_id = p.id
JOIN usuarios d ON c.doctor_id = d.id
WHERE c.estado = 'pendiente'
ORDER BY c.fecha_creacion DESC
LIMIT 10;

-- Consulta para ver el conteo de solicitudes pendientes por doctor
SELECT 
    d.id as doctor_id,
    d.nombre,
    d.apellido,
    COUNT(c.id) as solicitudes_pendientes
FROM usuarios d
LEFT JOIN citas c ON d.id = c.doctor_id AND c.estado = 'pendiente'
WHERE d.rol_id = 2 -- rol de doctor
GROUP BY d.id, d.nombre, d.apellido
HAVING solicitudes_pendientes > 0
ORDER BY solicitudes_pendientes DESC;
