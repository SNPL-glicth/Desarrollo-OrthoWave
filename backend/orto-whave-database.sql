/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.2-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: orto_whave_db
-- ------------------------------------------------------
-- Server version	11.8.2-MariaDB-1 from Debian

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `citas`
--

DROP TABLE IF EXISTS `citas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `citas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `paciente_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `fechaHora` datetime NOT NULL,
  `duracion` int(11) NOT NULL DEFAULT 60,
  `estado` varchar(20) NOT NULL DEFAULT 'pendiente',
  `tipoConsulta` varchar(20) NOT NULL DEFAULT 'primera_vez',
  `motivoConsulta` text DEFAULT NULL,
  `notasDoctor` text DEFAULT NULL,
  `notasPaciente` text DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `aprobada_por` int(11) DEFAULT NULL,
  `fecha_aprobacion` datetime DEFAULT NULL,
  `razonRechazo` text DEFAULT NULL,
  `recordatorio_enviado` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `paciente_id` (`paciente_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `aprobada_por` (`aprobada_por`),
  CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `citas_ibfk_3` FOREIGN KEY (`aprobada_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citas`
--

LOCK TABLES `citas` WRITE;
/*!40000 ALTER TABLE `citas` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `citas` (`id`, `paciente_id`, `doctor_id`, `fechaHora`, `duracion`, `estado`, `tipoConsulta`, `motivoConsulta`, `notasDoctor`, `notasPaciente`, `costo`, `fecha_creacion`, `fecha_actualizacion`, `aprobada_por`, `fecha_aprobacion`, `razonRechazo`, `recordatorio_enviado`) VALUES (6,3,2,'2025-07-25 16:56:10',30,'expirada','seguimiento','Evaluación post-tratamiento',NULL,'Cita de seguimiento',NULL,'2025-07-18 16:56:11','2025-07-26 12:10:00',2,'2025-07-25 18:36:03',NULL,0);
/*!40000 ALTER TABLE `citas` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `historias_clinicas`
--

DROP TABLE IF EXISTS `historias_clinicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `historias_clinicas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `paciente_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `cita_id` int(11) DEFAULT NULL,
  `motivoConsulta` text NOT NULL,
  `enfermedadActual` text NOT NULL,
  `antecedentesMedicos` text DEFAULT NULL,
  `antecedentesQuirurgicos` text DEFAULT NULL,
  `alergias` text DEFAULT NULL,
  `medicamentosActuales` text DEFAULT NULL,
  `examenFisico` text NOT NULL,
  `signosVitales` text DEFAULT NULL,
  `diagnostico` text NOT NULL,
  `diagnosticoDiferencial` text DEFAULT NULL,
  `tratamiento` text NOT NULL,
  `examenesSolicitados` text DEFAULT NULL,
  `interconsultas` text DEFAULT NULL,
  `recomendaciones` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `proximaConsulta` date DEFAULT NULL,
  `fecha_consulta` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `paciente_id` (`paciente_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `cita_id` (`cita_id`),
  CONSTRAINT `historias_clinicas_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `historias_clinicas_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `historias_clinicas_ibfk_3` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historias_clinicas`
--

LOCK TABLES `historias_clinicas` WRITE;
/*!40000 ALTER TABLE `historias_clinicas` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `historias_clinicas` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `migrations` (`id`, `timestamp`, `name`) VALUES (1,1709942400000,'InitialSetup1709942400000');
INSERT INTO `migrations` (`id`, `timestamp`, `name`) VALUES (2,1709942400001,'AddColumnsToRoles1709942400001');
INSERT INTO `migrations` (`id`, `timestamp`, `name`) VALUES (3,1753576068525,'AddUserApprovalColumns1753576068525');
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `pacientes`
--

DROP TABLE IF EXISTS `pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pacientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `numero_identificacion` varchar(20) NOT NULL,
  `tipo_identificacion` varchar(10) NOT NULL DEFAULT 'CC',
  `fecha_nacimiento` date NOT NULL,
  `genero` varchar(20) NOT NULL DEFAULT 'masculino',
  `estado_civil` varchar(20) DEFAULT NULL,
  `ocupacion` varchar(100) DEFAULT NULL,
  `ciudad_residencia` varchar(100) DEFAULT NULL,
  `barrio` varchar(100) DEFAULT NULL,
  `eps` varchar(100) DEFAULT NULL,
  `numero_afiliacion` varchar(50) DEFAULT NULL,
  `tipo_afiliacion` varchar(20) DEFAULT NULL,
  `contacto_emergencia_nombre` varchar(100) DEFAULT NULL,
  `contacto_emergencia_telefono` varchar(20) DEFAULT NULL,
  `contacto_emergencia_parentesco` varchar(50) DEFAULT NULL,
  `antecedentesMedicos` text DEFAULT NULL,
  `antecedentesQuirurgicos` text DEFAULT NULL,
  `antecedentesFamiliares` text DEFAULT NULL,
  `alergias` text DEFAULT NULL,
  `medicamentosActuales` text DEFAULT NULL,
  `peso` decimal(5,2) DEFAULT NULL,
  `estatura` decimal(5,2) DEFAULT NULL,
  `grupo_sanguineo` varchar(5) DEFAULT NULL,
  `acepta_comunicaciones` tinyint(1) NOT NULL DEFAULT 1,
  `prefiere_whatsapp` tinyint(1) NOT NULL DEFAULT 0,
  `prefiere_email` tinyint(1) NOT NULL DEFAULT 1,
  `prefiere_sms` tinyint(1) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `primera_consulta` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_registro` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  UNIQUE KEY `numero_identificacion` (`numero_identificacion`),
  CONSTRAINT `pacientes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacientes`
--

LOCK TABLES `pacientes` WRITE;
/*!40000 ALTER TABLE `pacientes` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `pacientes` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `perfiles_medicos`
--

DROP TABLE IF EXISTS `perfiles_medicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `perfiles_medicos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `numero_registro_medico` varchar(50) NOT NULL,
  `especialidad` varchar(100) NOT NULL,
  `subespecialidades` text DEFAULT NULL,
  `universidad_egreso` varchar(200) NOT NULL,
  `año_graduacion` int(11) NOT NULL,
  `biografia` text DEFAULT NULL,
  `acepta_nuevos_pacientes` tinyint(1) NOT NULL DEFAULT 1,
  `tarifa_consulta` decimal(10,2) DEFAULT NULL,
  `duracion_consulta_default` int(11) NOT NULL DEFAULT 60,
  `telefono_consultorio` varchar(20) DEFAULT NULL,
  `direccion_consultorio` text DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `dias_atencion` text DEFAULT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `hora_almuerzo_inicio` time DEFAULT NULL,
  `hora_almuerzo_fin` time DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `verificado_colegio` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_verificacion` datetime DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  UNIQUE KEY `numero_registro_medico` (`numero_registro_medico`),
  CONSTRAINT `perfiles_medicos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `perfiles_medicos`
--

LOCK TABLES `perfiles_medicos` WRITE;
/*!40000 ALTER TABLE `perfiles_medicos` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `perfiles_medicos` (`id`, `usuario_id`, `numero_registro_medico`, `especialidad`, `subespecialidades`, `universidad_egreso`, `año_graduacion`, `biografia`, `acepta_nuevos_pacientes`, `tarifa_consulta`, `duracion_consulta_default`, `telefono_consultorio`, `direccion_consultorio`, `ciudad`, `dias_atencion`, `hora_inicio`, `hora_fin`, `hora_almuerzo_inicio`, `hora_almuerzo_fin`, `activo`, `verificado_colegio`, `fecha_verificacion`, `fecha_creacion`, `fecha_actualizacion`) VALUES (7,2,'RM-DOCTOR-2024','Medicina General','Medicina Interna,Consulta General','Universidad Nacional',2015,'Doctor especialista en medicina general con experiencia en atención primaria.',1,75000.00,45,'6001234567','Consultorio Médico Principal','Bogotá','lunes,martes,miércoles,jueves,viernes','08:00:00','17:00:00','12:00:00','13:00:00',1,1,NULL,'2025-07-18 02:32:39','2025-07-18 02:32:39');
INSERT INTO `perfiles_medicos` (`id`, `usuario_id`, `numero_registro_medico`, `especialidad`, `subespecialidades`, `universidad_egreso`, `año_graduacion`, `biografia`, `acepta_nuevos_pacientes`, `tarifa_consulta`, `duracion_consulta_default`, `telefono_consultorio`, `direccion_consultorio`, `ciudad`, `dias_atencion`, `hora_inicio`, `hora_fin`, `hora_almuerzo_inicio`, `hora_almuerzo_fin`, `activo`, `verificado_colegio`, `fecha_verificacion`, `fecha_creacion`, `fecha_actualizacion`) VALUES (8,15,'RM-12345','Traumatologia',NULL,'Universidad nacionarl ',2015,'Modulo de Prueba para agregar al nuevo doctor',1,10.00,60,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2025-07-18 22:22:36','2025-07-18 22:22:36');
INSERT INTO `perfiles_medicos` (`id`, `usuario_id`, `numero_registro_medico`, `especialidad`, `subespecialidades`, `universidad_egreso`, `año_graduacion`, `biografia`, `acepta_nuevos_pacientes`, `tarifa_consulta`, `duracion_consulta_default`, `telefono_consultorio`, `direccion_consultorio`, `ciudad`, `dias_atencion`, `hora_inicio`, `hora_fin`, `hora_almuerzo_inicio`, `hora_almuerzo_fin`, `activo`, `verificado_colegio`, `fecha_verificacion`, `fecha_creacion`, `fecha_actualizacion`) VALUES (9,16,'RM-23123','Ortopedia ',NULL,'Universidad del Bosques',2000,'Probando 123',1,10.00,60,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,0,NULL,'2025-07-18 23:16:30','2025-07-18 23:16:30');
/*!40000 ALTER TABLE `perfiles_medicos` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `roles` (`id`, `nombre`, `activo`, `fecha_creacion`) VALUES (1,'admin',1,'2025-07-10 04:13:05');
INSERT INTO `roles` (`id`, `nombre`, `activo`, `fecha_creacion`) VALUES (2,'doctor',1,'2025-07-10 04:13:05');
INSERT INTO `roles` (`id`, `nombre`, `activo`, `fecha_creacion`) VALUES (3,'paciente',1,'2025-07-10 04:13:05');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `rol_id` int(11) NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verification_code` varchar(10) DEFAULT NULL,
  `reset_password_token` varchar(255) DEFAULT NULL,
  `reset_password_expires` datetime DEFAULT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT 1,
  `approval_status` enum('pendiente','aprobado','rechazado') NOT NULL DEFAULT 'aprobado',
  `recordatorio_enviado` tinyint(1) NOT NULL DEFAULT 0,
  `approved_by` int(11) DEFAULT NULL,
  `approval_date` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `rol_id` (`rol_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `usuarios` (`id`, `email`, `password`, `nombre`, `apellido`, `telefono`, `direccion`, `rol_id`, `fecha_creacion`, `is_verified`, `verification_code`, `reset_password_token`, `reset_password_expires`, `is_approved`, `approval_status`, `recordatorio_enviado`, `approved_by`, `approval_date`, `rejection_reason`) VALUES (1,'admin@ortowhave.com','$2b$12$NTw2.vl2zqSMIb6qJ4pwZus2u5WULKDB9dJhCEhCTlfKA06RqULP.','Administrador','Sistema','3001111111','Oficina Central',1,'2025-07-10 04:02:15',1,NULL,NULL,NULL,1,'aprobado',0,NULL,NULL,NULL);
INSERT INTO `usuarios` (`id`, `email`, `password`, `nombre`, `apellido`, `telefono`, `direccion`, `rol_id`, `fecha_creacion`, `is_verified`, `verification_code`, `reset_password_token`, `reset_password_expires`, `is_approved`, `approval_status`, `recordatorio_enviado`, `approved_by`, `approval_date`, `rejection_reason`) VALUES (2,'doctor@ortowhave.com','$2b$12$x0w26ga5glJy/huoT9oTpuhuSSSgCRd.GvlDx.8iSEK5Ac5g7fDei','Doctor','Principal','3002222222','Consultorio Médico',2,'2025-07-10 04:02:15',1,NULL,NULL,NULL,1,'aprobado',0,NULL,NULL,NULL);
INSERT INTO `usuarios` (`id`, `email`, `password`, `nombre`, `apellido`, `telefono`, `direccion`, `rol_id`, `fecha_creacion`, `is_verified`, `verification_code`, `reset_password_token`, `reset_password_expires`, `is_approved`, `approval_status`, `recordatorio_enviado`, `approved_by`, `approval_date`, `rejection_reason`) VALUES (3,'paciente@ortowhave.com','$2b$12$iOkiSewrkTSTJiSE.B0SD.hOrjlCWOyGGVYcB5EyVw8/HJESC4dye','Paciente','Demo','3003333333','Dirección Paciente',3,'2025-07-10 04:02:16',1,NULL,NULL,NULL,1,'aprobado',0,NULL,NULL,NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Dumping routines for database 'orto_whave_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-07-27 16:43:29
