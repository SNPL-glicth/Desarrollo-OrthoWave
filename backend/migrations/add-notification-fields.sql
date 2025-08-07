-- Migración para asegurar que la tabla citas tiene todos los campos necesarios para el sistema de notificaciones

-- Verificar y agregar columnas faltantes si no existen
ALTER TABLE citas 
ADD COLUMN IF NOT EXISTS fecha_creacion datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS fecha_actualizacion datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS aprobada_por int(11) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS fecha_aprobacion datetime DEFAULT NULL,
ADD COLUMN IF NOT EXISTS razonRechazo text DEFAULT NULL;

-- Agregar índices para mejorar el rendimiento de las consultas de notificaciones
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
CREATE INDEX IF NOT EXISTS idx_citas_doctor_estado ON citas(doctor_id, estado);
CREATE INDEX IF NOT EXISTS idx_citas_paciente_estado ON citas(paciente_id, estado);
CREATE INDEX IF NOT EXISTS idx_citas_fecha_creacion ON citas(fecha_creacion);

-- Agregar constraints de foreign key si no existen
-- Nota: En MySQL esto puede fallar si ya existe, así que usamos IF NOT EXISTS en versiones que lo soporten
ALTER TABLE citas 
ADD CONSTRAINT fk_citas_aprobada_por 
FOREIGN KEY (aprobada_por) REFERENCES usuarios(id) 
ON DELETE SET NULL ON UPDATE CASCADE;
