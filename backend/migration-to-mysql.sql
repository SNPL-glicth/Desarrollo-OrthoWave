-- Migración de SQLite a MySQL para Orto-Whave
-- Generado automáticamente el 26/7/2025, 11:38:03 a. m.
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS `orto_whave_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `orto_whave_db`;

-- Estructura de tabla para roles
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (`id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL, `nombre` varchar NOT NULL, `activo` TINYINT(1) NOT NULL DEFAULT (1), `fecha_creacion` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- Estructura de tabla para usuarios
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (`id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL, `email` varchar NOT NULL, `password` varchar NOT NULL, `nombre` varchar NOT NULL, `apellido` varchar NOT NULL, `telefono` varchar, `direccion` varchar, `rol_id` INT NOT NULL, `fecha_creacion` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP), `is_verified` TINYINT(1) NOT NULL DEFAULT (0), `verification_code` VARCHAR(10), `reset_password_token` varchar, `reset_password_expires` DATETIME, CONSTRAINT `UQ_446adfc18b35418aac32ae0b7b5` UNIQUE (`email`), CONSTRAINT `FK_9e519760a660751f4fa21453d3e` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos para la tabla usuarios
INSERT INTO `usuarios` (`id`, `email`, `password`, `nombre`, `apellido`, `telefono`, `direccion`, `rol_id`, `fecha_creacion`, `is_verified`, `verification_code`, `reset_password_token`, `reset_password_expires`) VALUES (1, 'admin@ortowhave.com', '$2b$12$NTw2.vl2zqSMIb6qJ4pwZus2u5WULKDB9dJhCEhCTlfKA06RqULP.', 'Administrador', 'Sistema', '3001111111', 'Oficina Central', 1, '2025-07-10 04:02:15', 1, NULL, NULL, NULL);
INSERT INTO `usuarios` (`id`, `email`, `password`, `nombre`, `apellido`, `telefono`, `direccion`, `rol_id`, `fecha_creacion`, `is_verified`, `verification_code`, `reset_password_token`, `reset_password_expires`) VALUES (2, 'doctor@ortowhave.com', '$2b$12$x0w26ga5glJy/huoT9oTpuhuSSSgCRd.GvlDx.8iSEK5Ac5g7fDei', 'Doctor', 'Principal', '3002222222', 'Consultorio Médico', 2, '2025-07-10 04:02:15', 1, NULL, NULL, NULL);
INSERT INTO `usuarios` (`id`, `email`, `password`, `nombre`, `apellido`, `telefono`, `direccion`, `rol_id`, `fecha_creacion`, `is_verified`, `verification_code`, `reset_password_token`, `reset_password_expires`) VALUES (3, 'paciente@ortowhave.com', '$2b$12$iOkiSewrkTSTJiSE.B0SD.hOrjlCWOyGGVYcB5EyVw8/HJESC4dye', 'Paciente', 'Demo', '3003333333', 'Dirección Paciente', 3, '2025-07-10 04:02:16', 1, NULL, NULL, NULL);

-- Estructura de tabla para perfiles_medicos
DROP TABLE IF EXISTS `perfiles_medicos`;
CREATE TABLE `perfiles_medicos` (`id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL, `usuario_id` INT NOT NULL, `numero_registro_medico` varchar NOT NULL, `especialidad` varchar NOT NULL, `subespecialidades` TEXT, `universidad_egreso` varchar NOT NULL, `año_graduacion` INT NOT NULL, `biografia` TEXT, `acepta_nuevos_pacientes` TINYINT(1) NOT NULL DEFAULT (1), `tarifa_consulta` decimal(10,2), `duracion_consulta_default` INT NOT NULL DEFAULT (60), `telefono_consultorio` varchar, `direccion_consultorio` varchar, `ciudad` varchar, `dias_atencion` TEXT, `hora_inicio` time, `hora_fin` time, `hora_almuerzo_inicio` time, `hora_almuerzo_fin` time, `activo` TINYINT(1) NOT NULL DEFAULT (1), `verificado_colegio` TINYINT(1) NOT NULL DEFAULT (0), `fecha_verificacion` DATETIME, `fecha_creacion` DATETIME NOT NULL DEFAULT (DATETIME('now')), `fecha_actualizacion` DATETIME NOT NULL DEFAULT (DATETIME('now')), CONSTRAINT `UQ_71295a1059bbb912f3270b3fa9a` UNIQUE (`usuario_id`), CONSTRAINT `UQ_6a6e9f2cb6cd21e0e6d1a040b3b` UNIQUE (`numero_registro_medico`), CONSTRAINT `REL_71295a1059bbb912f3270b3fa9` UNIQUE (`usuario_id`), CONSTRAINT `FK_71295a1059bbb912f3270b3fa9a` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos para la tabla perfiles_medicos
INSERT INTO `perfiles_medicos` (`id`, `usuario_id`, `numero_registro_medico`, `especialidad`, `subespecialidades`, `universidad_egreso`, `año_graduacion`, `biografia`, `acepta_nuevos_pacientes`, `tarifa_consulta`, `duracion_consulta_default`, `telefono_consultorio`, `direccion_consultorio`, `ciudad`, `dias_atencion`, `hora_inicio`, `hora_fin`, `hora_almuerzo_inicio`, `hora_almuerzo_fin`, `activo`, `verificado_colegio`, `fecha_verificacion`, `fecha_creacion`, `fecha_actualizacion`) VALUES (7, 2, 'RM-DOCTOR-2024', 'Medicina General', 'Medicina Interna,Consulta General', 'Universidad Nacional', 2015, 'Doctor especialista en medicina general con experiencia en atención primaria.', 1, 75000, 45, '6001234567', 'Consultorio Médico Principal', 'Bogotá', 'lunes,martes,miércoles,jueves,viernes', '08:00', '17:00', '12:00', '13:00', 1, 1, NULL, '2025-07-18 02:32:39', '2025-07-18 02:32:39');
INSERT INTO `perfiles_medicos` (`id`, `usuario_id`, `numero_registro_medico`, `especialidad`, `subespecialidades`, `universidad_egreso`, `año_graduacion`, `biografia`, `acepta_nuevos_pacientes`, `tarifa_consulta`, `duracion_consulta_default`, `telefono_consultorio`, `direccion_consultorio`, `ciudad`, `dias_atencion`, `hora_inicio`, `hora_fin`, `hora_almuerzo_inicio`, `hora_almuerzo_fin`, `activo`, `verificado_colegio`, `fecha_verificacion`, `fecha_creacion`, `fecha_actualizacion`) VALUES (8, 15, 'RM-12345', 'Traumatologia', NULL, 'Universidad nacionarl ', 2015, 'Modulo de Prueba para agregar al nuevo doctor', 1, 10, 60, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, '2025-07-18 22:22:36', '2025-07-18 22:22:36');
INSERT INTO `perfiles_medicos` (`id`, `usuario_id`, `numero_registro_medico`, `especialidad`, `subespecialidades`, `universidad_egreso`, `año_graduacion`, `biografia`, `acepta_nuevos_pacientes`, `tarifa_consulta`, `duracion_consulta_default`, `telefono_consultorio`, `direccion_consultorio`, `ciudad`, `dias_atencion`, `hora_inicio`, `hora_fin`, `hora_almuerzo_inicio`, `hora_almuerzo_fin`, `activo`, `verificado_colegio`, `fecha_verificacion`, `fecha_creacion`, `fecha_actualizacion`) VALUES (9, 16, 'RM-23123', 'Ortopedia ', NULL, 'Universidad del Bosques', 2000, 'Probando 123', 1, 10, 60, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, NULL, '2025-07-18 23:16:30', '2025-07-18 23:16:30');

-- Estructura de tabla para pacientes
DROP TABLE IF EXISTS `pacientes`;
CREATE TABLE `pacientes` (`id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL, `usuario_id` INT NOT NULL, `numero_identificacion` varchar NOT NULL, `tipo_identificacion` VARCHAR(10) NOT NULL DEFAULT ('CC'), `fecha_nacimiento` date NOT NULL, `genero` VARCHAR(20) NOT NULL DEFAULT ('masculino'), `estado_civil` varchar, `ocupacion` varchar, `ciudad_residencia` varchar, `barrio` varchar, `eps` varchar, `numero_afiliacion` varchar, `tipo_afiliacion` varchar, `contacto_emergencia_nombre` varchar, `contacto_emergencia_telefono` varchar, `contacto_emergencia_parentesco` varchar, `antecedentesMedicos` TEXT, `antecedentesQuirurgicos` TEXT, `antecedentesFamiliares` TEXT, `alergias` TEXT, `medicamentosActuales` TEXT, `peso` decimal(5,2), `estatura` decimal(5,2), `grupo_sanguineo` varchar, `acepta_comunicaciones` TINYINT(1) NOT NULL DEFAULT (1), `prefiere_whatsapp` TINYINT(1) NOT NULL DEFAULT (0), `prefiere_email` TINYINT(1) NOT NULL DEFAULT (1), `prefiere_sms` TINYINT(1) NOT NULL DEFAULT (0), `activo` TINYINT(1) NOT NULL DEFAULT (1), `primera_consulta` TINYINT(1) NOT NULL DEFAULT (1), `fecha_registro` DATETIME NOT NULL DEFAULT (DATETIME('now')), `fecha_actualizacion` DATETIME NOT NULL DEFAULT (DATETIME('now')), CONSTRAINT `UQ_3065e2172ba8e5572489cceac74` UNIQUE (`usuario_id`), CONSTRAINT `UQ_c88fbb0066cd8b74ddb1d8e7f4c` UNIQUE (`numero_identificacion`), CONSTRAINT `REL_3065e2172ba8e5572489cceac7` UNIQUE (`usuario_id`), CONSTRAINT `FK_3065e2172ba8e5572489cceac74` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Estructura de tabla para citas
DROP TABLE IF EXISTS `citas`;
CREATE TABLE `citas` (`id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL, `paciente_id` INT NOT NULL, `doctor_id` INT NOT NULL, `fechaHora` DATETIME NOT NULL, `duracion` INT NOT NULL DEFAULT (60), `estado` VARCHAR(20) NOT NULL DEFAULT ('pendiente'), `tipoConsulta` VARCHAR(20) NOT NULL DEFAULT ('primera_vez'), `motivoConsulta` TEXT, `notasDoctor` TEXT, `notasPaciente` TEXT, `costo` decimal(10,2), `fecha_creacion` DATETIME NOT NULL DEFAULT (DATETIME('now')), `fecha_actualizacion` DATETIME NOT NULL DEFAULT (DATETIME('now')), `aprobada_por` INT, `fecha_aprobacion` DATETIME, `razonRechazo` TEXT, CONSTRAINT `FK_cb9ae070f79985c5df13ac6bb3a` FOREIGN KEY (`paciente_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT `FK_2a98f2543d190bfff5723ed0356` FOREIGN KEY (`doctor_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT `FK_396fd59bc81634d49631e1d218b` FOREIGN KEY (`aprobada_por`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos para la tabla citas
INSERT INTO `citas` (`id`, `paciente_id`, `doctor_id`, `fechaHora`, `duracion`, `estado`, `tipoConsulta`, `motivoConsulta`, `notasDoctor`, `notasPaciente`, `costo`, `fecha_creacion`, `fecha_actualizacion`, `aprobada_por`, `fecha_aprobacion`, `razonRechazo`) VALUES (6, 3, 2, '2025-07-25 16:56:10.641', 30, 'aprobada', 'seguimiento', 'Evaluación post-tratamiento', NULL, 'Cita de seguimiento', NULL, '2025-07-18 16:56:11', '2025-07-25 18:36:03.058', 2, '2025-07-25 18:36:03.084', NULL);

-- Estructura de tabla para historias_clinicas
DROP TABLE IF EXISTS `historias_clinicas`;
CREATE TABLE `historias_clinicas` (`id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL, `paciente_id` INT NOT NULL, `doctor_id` INT NOT NULL, `cita_id` INT, `motivoConsulta` TEXT NOT NULL, `enfermedadActual` TEXT NOT NULL, `antecedentesMedicos` TEXT, `antecedentesQuirurgicos` TEXT, `alergias` TEXT, `medicamentosActuales` TEXT, `examenFisico` TEXT NOT NULL, `signosVitales` TEXT, `diagnostico` TEXT NOT NULL, `diagnosticoDiferencial` TEXT, `tratamiento` TEXT NOT NULL, `examenesSolicitados` TEXT, `interconsultas` TEXT, `recomendaciones` TEXT, `observaciones` TEXT, `proximaConsulta` date, `fecha_consulta` DATETIME NOT NULL DEFAULT (DATETIME('now')), `fecha_actualizacion` DATETIME NOT NULL DEFAULT (DATETIME('now')), CONSTRAINT `FK_7681732d1c66a675e9fb8d5586d` FOREIGN KEY (`paciente_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT `FK_d8bd744f5835fb5b15488e61882` FOREIGN KEY (`doctor_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT `FK_08494003fdddd5e0336bfbf8054` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



SET FOREIGN_KEY_CHECKS = 1;
COMMIT;