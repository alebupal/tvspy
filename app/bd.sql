-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 25-05-2018 a las 17:04:50
-- Versión del servidor: 10.1.8-MariaDB
-- Versión de PHP: 5.6.14
create database tvspy;
use tvspy;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+02:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tvspy`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `canales`
--

CREATE TABLE `canales` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=COMPACT;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion`
--

CREATE TABLE `configuracion` (
  `id` int(11) NOT NULL,
  `ip` varchar(100) NOT NULL,
  `puerto` int(11) NOT NULL,
  `usuario` varchar(100) NOT NULL,
  `contrasena` varchar(100) NOT NULL,
  `refresco` int(11) NOT NULL,
  `tiempoMinimo` int(11) NOT NULL,
  `notificacion_telegram` tinyint(1) NOT NULL,
  `texto_empieza` varchar(500) NOT NULL,
  `texto_para` varchar(500) NOT NULL,
  `texto_tiempo` varchar(500) NOT NULL,
  `texto_conexion` varchar(500) NOT NULL,
  `telegram_empieza` tinyint(1) NOT NULL,
  `telegram_para` tinyint(1) NOT NULL,
  `telegram_tiempo` tinyint(1) NOT NULL,
  `telegram_tiempo_limite` int(11) NOT NULL,
  `telegram_conexion` int(11) NOT NULL,
  `bot_token` varchar(500) NOT NULL,
  `id_chat` varchar(500) NOT NULL,
  `unidadTiempo` varchar(500) NOT NULL,
  `ip_permitida` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `configuracion`
--

INSERT INTO `configuracion` (
								`id`, 
								`ip`, 
								`puerto`, 
								`usuario`, 
								`contrasena`, 
								`refresco`, 
								`tiempoMinimo`, 
								`notificacion_telegram`, 
								`texto_empieza`, 
								`texto_para`, 
								`texto_tiempo`, 
								`texto_conexion`, 
								`telegram_empieza`, 
								`telegram_para`, 
								`telegram_tiempo`, 
								`telegram_tiempo_limite`, 
								`telegram_conexion`, 
								`bot_token`, 
								`id_chat`, 
								`unidadTiempo`
								`ip_permitida`
							) VALUES(
								1, 
								'192.168.1.50', 
								9981, 
								'usuario', 
								'contraseña', 
								10, 
								180, 
								1, 
								'%%fecha%%: El usuario <b>%%usuario%%</b> ha empezado a reproducir <b>%%canal%%</b> en %%reproductor%% (%%hostname%%)', 
								'%%fecha%%: El usuario <b>%%usuario%%</b> ha parado de reproducir <b>%%canal%%</b> en %%reproductor%% (%%hostname%%)', 
								'%%fecha%%: El usuario <b>%%usuario%%</b> ha pasado el límite de tiempo (%%tiempo%%) y está reproduciendo <b>%%canal%%</b> en %%reproductor%% (%%hostname%%)', 
								'%%fecha%%: El usuario <b>%%usuario%%</b> está reproduciendo <b>%%canal%%</b> en %%reproductor%% en una <b>IP DESCONOCIDA(%%hostname%%)</b>', 
								1, 
								1, 
								1, 
								350, 
								1, 
								'token', 
								'id chat', 
								'Minutos',
								'192.168.1'
							);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registro`
--

CREATE TABLE `registro` (
  `id` int(11) NOT NULL,
  `usuario` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `canal` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `inicio` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fin` datetime DEFAULT NULL,
  `idReproduccion` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `hostname` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `reproductor` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `errores` int(11) NOT NULL,
  `tiempo` int(50) NOT NULL DEFAULT '0',
  `notificacion_tiempo` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=COMPACT;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ROW_FORMAT=COMPACT;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `canales`
--
ALTER TABLE `canales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indices de la tabla `configuracion`
--
ALTER TABLE `configuracion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `id_2` (`id`);

--
-- Indices de la tabla `registro`
--
ALTER TABLE `registro`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `canales`
--
ALTER TABLE `canales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de la tabla `registro`
--
ALTER TABLE `registro`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
