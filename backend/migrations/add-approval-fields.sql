-- Migración para agregar campos de aprobación de cuentas
-- Ejecutar en el servidor MySQL de Debian

USE orto_whave_db; -- Ajustar nombre de base de datos si es diferente

-- Agregar nuevas columnas para el sistema de aprobación
ALTER TABLE usuarios 
ADD COLUMN is_approved BOOLEAN DEFAULT TRUE COMMENT 'Si la cuenta está aprobada',
ADD COLUMN approval_status VARCHAR(20) DEFAULT 'approved' COMMENT 'Estado: pending, approved, rejected',
ADD COLUMN approved_by INT NULL COMMENT 'ID del admin que aprobó',
ADD COLUMN approval_date DATETIME NULL COMMENT 'Fecha de aprobación',
ADD COLUMN rejection_reason TEXT NULL COMMENT 'Motivo de rechazo';

-- Agregar índices para optimizar consultas
CREATE INDEX idx_usuarios_approval_status ON usuarios (approval_status);
CREATE INDEX idx_usuarios_is_approved ON usuarios (is_approved);

-- Verificar que las columnas se agregaron correctamente
DESCRIBE usuarios;

-- Mostrar estadísticas de usuarios
SELECT 
    COUNT(*) as total_usuarios,
    SUM(CASE WHEN is_approved = 1 THEN 1 ELSE 0 END) as aprobados,
    SUM(CASE WHEN approval_status = 'pending' THEN 1 ELSE 0 END) as pendientes
FROM usuarios;
