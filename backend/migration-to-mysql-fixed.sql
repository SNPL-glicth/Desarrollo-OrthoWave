-- Migración mejorada de SQLite a MySQL para Orto-Whave
-- Generado automáticamente el 26/7/2025, 11:49:29 a. m.
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;

USE `orto_whave_db`;

-- ============================================
-- CREACIÓN DE TABLAS CON ESTRUCTURA MYSQL
-- ============================================

-- Estructura de tabla roles
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `nombre` VARCHAR(50) NOT NULL,
      `activo` TINYINT(1) NOT NULL DEFAULT 1,
      `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Estructura de tabla usuarios
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `email` VARCHAR(255) NOT NULL UNIQUE,
      `password` VARCHAR(255) NOT NULL,
      `nombre` VARCHAR(100) NOT NULL,
      `apellido` VARCHAR(100) NOT NULL,
      `telefono` VARCHAR(20),
      `direccion` TEXT,
      `rol_id` INT NOT NULL,
      `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
      `verification_code` VARCHAR(10),
      `reset_password_token` VARCHAR(255),
      `reset_password_expires` DATETIME,
      FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Estructura de tabla perfiles_medicos
DROP TABLE IF EXISTS `perfiles_medicos`;
CREATE TABLE `perfiles_medicos` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `usuario_id` INT NOT NULL UNIQUE,
      `numero_registro_medico` VARCHAR(50) NOT NULL UNIQUE,
      `especialidad` VARCHAR(100) NOT NULL,
      `subespecialidades` TEXT,
      `universidad_egreso` VARCHAR(200) NOT NULL,
      `año_graduacion` INT NOT NULL,
      `biografia` TEXT,
      `acepta_nuevos_pacientes` TINYINT(1) NOT NULL DEFAULT 1,
      `tarifa_consulta` DECIMAL(10,2),
      `duracion_consulta_default` INT NOT NULL DEFAULT 60,
      `telefono_consultorio` VARCHAR(20),
      `direccion_consultorio` TEXT,
      `ciudad` VARCHAR(100),
      `dias_atencion` TEXT,
      `hora_inicio` TIME,
      `hora_fin` TIME,
      `hora_almuerzo_inicio` TIME,
      `hora_almuerzo_fin` TIME,
      `activo` TINYINT(1) NOT NULL DEFAULT 1,
      `verificado_colegio` TINYINT(1) NOT NULL DEFAULT 0,
      `fecha_verificacion` DATETIME,
      `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `fecha_actualizacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Estructura de tabla pacientes
DROP TABLE IF EXISTS `pacientes`;
CREATE TABLE `pacientes` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `usuario_id` INT NOT NULL UNIQUE,
      `numero_identificacion` VARCHAR(20) NOT NULL UNIQUE,
      `tipo_identificacion` VARCHAR(10) NOT NULL DEFAULT 'CC',
      `fecha_nacimiento` DATE NOT NULL,
      `genero` VARCHAR(20) NOT NULL DEFAULT 'masculino',
      `estado_civil` VARCHAR(20),
      `ocupacion` VARCHAR(100),
      `ciudad_residencia` VARCHAR(100),
      `barrio` VARCHAR(100),
      `eps` VARCHAR(100),
      `numero_afiliacion` VARCHAR(50),
      `tipo_afiliacion` VARCHAR(20),
      `contacto_emergencia_nombre` VARCHAR(100),
      `contacto_emergencia_telefono` VARCHAR(20),
      `contacto_emergencia_parentesco` VARCHAR(50),
      `antecedentesMedicos` TEXT,
      `antecedentesQuirurgicos` TEXT,
      `antecedentesFamiliares` TEXT,
      `alergias` TEXT,
      `medicamentosActuales` TEXT,
      `peso` DECIMAL(5,2),
      `estatura` DECIMAL(5,2),
      `grupo_sanguineo` VARCHAR(5),
      `acepta_comunicaciones` TINYINT(1) NOT NULL DEFAULT 1,
      `prefiere_whatsapp` TINYINT(1) NOT NULL DEFAULT 0,
      `prefiere_email` TINYINT(1) NOT NULL DEFAULT 1,
      `prefiere_sms` TINYINT(1) NOT NULL DEFAULT 0,
      `activo` TINYINT(1) NOT NULL DEFAULT 1,
      `primera_consulta` TINYINT(1) NOT NULL DEFAULT 1,
      `fecha_registro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `fecha_actualizacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Estructura de tabla citas
DROP TABLE IF EXISTS `citas`;
CREATE TABLE `citas` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `paciente_id` INT NOT NULL,
      `doctor_id` INT NOT NULL,
      `fechaHora` DATETIME NOT NULL,
      `duracion` INT NOT NULL DEFAULT 60,
      `estado` VARCHAR(20) NOT NULL DEFAULT 'pendiente',
      `tipoConsulta` VARCHAR(20) NOT NULL DEFAULT 'primera_vez',
      `motivoConsulta` TEXT,
      `notasDoctor` TEXT,
      `notasPaciente` TEXT,
      `costo` DECIMAL(10,2),
      `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `fecha_actualizacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      `aprobada_por` INT,
      `fecha_aprobacion` DATETIME,
      `razonRechazo` TEXT,
      `recordatorio_enviado` TINYINT(1) NOT NULL DEFAULT 0,
      FOREIGN KEY (`paciente_id`) REFERENCES `usuarios`(`id`),
      FOREIGN KEY (`doctor_id`) REFERENCES `usuarios`(`id`),
      FOREIGN KEY (`aprobada_por`) REFERENCES `usuarios`(`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Estructura de tabla historias_clinicas
DROP TABLE IF EXISTS `historias_clinicas`;
CREATE TABLE `historias_clinicas` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `paciente_id` INT NOT NULL,
      `doctor_id` INT NOT NULL,
      `cita_id` INT,
      `motivoConsulta` TEXT NOT NULL,
      `enfermedadActual` TEXT NOT NULL,
      `antecedentesMedicos` TEXT,
      `antecedentesQuirurgicos` TEXT,
      `alergias` TEXT,
      `medicamentosActuales` TEXT,
      `examenFisico` TEXT NOT NULL,
      `signosVitales` TEXT,
      `diagnostico` TEXT NOT NULL,
      `diagnosticoDiferencial` TEXT,
      `tratamiento` TEXT NOT NULL,
      `examenesSolicitados` TEXT,
      `interconsultas` TEXT,
      `recomendaciones` TEXT,
      `observaciones` TEXT,
      `proximaConsulta` DATE,
      `fecha_consulta` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `fecha_actualizacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (`paciente_id`) REFERENCES `usuarios`(`id`),
      FOREIGN KEY (`doctor_id`) REFERENCES `usuarios`(`id`),
      FOREIGN KEY (`cita_id`) REFERENCES `citas`(`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos para la tabla roles
INSERT INTO `roles` (`id`, `nombre`, `activo`, `fecha_creacion`) VALUES (1, 'admin', 1, '2025-07-10 04:13:05');
INSERT INTO `roles` (`id`, `nombre`, `activo`, `fecha_creacion`) VALUES (2, 'doctor', 1, '2025-07-10 04:13:05');
INSERT INTO `roles` (`id`, `nombre`, `activo`, `fecha_creacion`) VALUES (3, 'paciente', 1, '2025-07-10 04:13:05');
INSERT INTO `roles` (`id`, `nombre`, `activo`, `fecha_creacion`) VALUES (4, 'admin', 1, '2025-07-11 23:52:35');
INSERT INTO `roles` (`id`, `nombre`, `activo`, `fecha_creacion`) VALUES (5, 'doctor', 1, '2025-07-11 23:52:35');
INSERT INTO `roles` (`id`, `nombre`, `activo`, `fecha_creacion`) VALUES (6, 'paciente', 1, '2025-07-11 23:52:35');
INSERT INTO `roles` (`id`, `nombre`, `activo`, `fecha_creacion`) VALUES (7, 'admin', 1, '2025-07-14 02:20:32');
INSERT INTO `roles` (`id`, `nombre`, `activo`, `fecha_creacion`) VALUES (8, 'doctor', 1, '2025-07-14 02:20:32');
INSERT INTO `roles` (`id`, `nombre`, `activo`, `fecha_creacion`) VALUES (9, 'paciente', 1, '2025-07-14 02:20:32');

-- Datos para la tabla usuarios
INSERT INTO `usuarios` (`id`, `email`, `password`, `nombre`, `apellido`, `telefono`, `direccion`, `rol_id`, `fecha_creacion`, `is_verified`, `verification_code`, `reset_password_token`, `reset_password_expires`) VALUES (1, 'admin@ortowhave.com', '$2b$12$NTw2.vl2zqSMIb6qJ4pwZus2u5WULKDB9dJhCEhCTlfKA06RqULP.', 'Administrador', 'Sistema', '3001111111', 'Oficina Central', 1, '2025-07-10 04:02:15', 1, NULL, NULL, NULL);
INSERT INTO `usuarios` (`id`, `email`, `password`, `nombre`, `apellido`, `telefono`, `direccion`, `rol_id`, `fecha_creacion`, `is_verified`, `verification_code`, `reset_password_token`, `reset_password_expires`) VALUES (2, 'doctor@ortowhave.com', '$2b$12$x0w26ga5glJy/huoT9oTpuhuSSSgCRd.GvlDx.8iSEK5Ac5g7fDei', 'Doctor', 'Principal', '3002222222', 'Consultorio Médico', 2, '2025-07-10 04:02:15', 1, NULL, NULL, NULL);
INSERT INTO `usuarios` (`id`, `email`, `password`, `nombre`, `apellido`, `telefono`, `direccion`, `rol_id`, `fecha_creacion`, `is_verified`, `verification_code`, `reset_password_token`, `reset_password_expires`) VALUES (3, 'paciente@ortowhave.com', '$2b$12$iOkiSewrkTSTJiSE.B0SD.hOrjlCWOyGGVYcB5EyVw8/HJESC4dye', 'Paciente', 'Demo', '3003333333', 'Dirección Paciente', 3, '2025-07-10 04:02:16', 1, NULL, NULL, NULL);

-- Datos para la tabla perfiles_medicos
INSERT INTO `perfiles_medicos` (`id`, `usuario_id`, `numero_registro_medico`, `especialidad`, `subespecialidades`, `universidad_egreso`, `año_graduacion`, `biografia`, `acepta_nuevos_pacientes`, `tarifa_consulta`, `duracion_consulta_default`, `telefono_consultorio`, `direccion_consultorio`, `ciudad`, `dias_atencion`, `hora_inicio`, `hora_fin`, `hora_almuerzo_inicio`, `hora_almuerzo_fin`, `activo`, `verificado_colegio`, `fecha_verificacion`, `fecha_creacion`, `fecha_actualizacion`) VALUES (7, 2, 'RM-DOCTOR-2024', 'Medicina General', 'Medicina Interna,Consulta General', 'Universidad Nacional', 2015, 'Doctor especialista en medicina general con experiencia en atención primaria.', 1, 75000, 45, '6001234567', 'Consultorio Médico Principal', 'Bogotá', 'lunes,martes,miércoles,jueves,viernes', '08:00', '17:00', '12:00', '13:00', 1, 1, NULL, '2025-07-18 02:32:39', '2025-07-18 02:32:39');
INSERT INTO `perfiles_medicos` (`id`, `usuario_id`, `numero_registro_medico`, `especialidad`, `subespecialidades`, `universidad_egreso`, `año_graduacion`, `biografia`, `acepta_nuevos_pacientes`, `tarifa_consulta`, `duracion_consulta_default`, `telefono_consultorio`, `direccion_consultorio`, `ciudad`, `dias_atencion`, `hora_inicio`, `hora_fin`, `hora_almuerzo_inicio`, `hora_almuerzo_fin`, `activo`, `verificado_colegio`, `fecha_verificacion`, `fecha_creacion`, `fecha_actualizacion`) VALUES (8, 15, 'RM-12345', 'Traumatologia', NULL, 'Universidad nacionarl ', 2015, 'Modulo de Prueba para agregar al nuevo doctor', 1, 10, 60, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, '2025-07-18 22:22:36', '2025-07-18 22:22:36');
INSERT INTO `perfiles_medicos` (`id`, `usuario_id`, `numero_registro_medico`, `especialidad`, `subespecialidades`, `universidad_egreso`, `año_graduacion`, `biografia`, `acepta_nuevos_pacientes`, `tarifa_consulta`, `duracion_consulta_default`, `telefono_consultorio`, `direccion_consultorio`, `ciudad`, `dias_atencion`, `hora_inicio`, `hora_fin`, `hora_almuerzo_inicio`, `hora_almuerzo_fin`, `activo`, `verificado_colegio`, `fecha_verificacion`, `fecha_creacion`, `fecha_actualizacion`) VALUES (9, 16, 'RM-23123', 'Ortopedia ', NULL, 'Universidad del Bosques', 2000, 'Probando 123', 1, 10, 60, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, '2025-07-18 23:16:30', '2025-07-18 23:16:30');


-- Datos para la tabla citas
INSERT INTO `citas` (`id`, `paciente_id`, `doctor_id`, `fechaHora`, `duracion`, `estado`, `tipoConsulta`, `motivoConsulta`, `notasDoctor`, `notasPaciente`, `costo`, `fecha_creacion`, `fecha_actualizacion`, `aprobada_por`, `fecha_aprobacion`, `razonRechazo`, `recordatorio_enviado`) VALUES (6, 3, 2, '2025-07-25 16:56:10.641', 30, 'aprobada', 'seguimiento', 'Evaluación post-tratamiento', NULL, 'Cita de seguimiento', NULL, '2025-07-18 16:56:11', '2025-07-25 18:36:03.058', 2, '2025-07-25 18:36:03.084', NULL, 0);



SET FOREIGN_KEY_CHECKS = 1;
COMMIT;