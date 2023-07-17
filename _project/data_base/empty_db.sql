-- --------------------------------------------------------
-- Хост:                         127.0.0.1
-- Версия сервера:               5.5.37-log - MySQL Community Server (GPL)
-- ОС Сервера:                   Win32
-- HeidiSQL Версия:              8.3.0.4694
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Дамп структуры для таблица depstore.devices
CREATE TABLE IF NOT EXISTS `devices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `device_name` varchar(50) NOT NULL DEFAULT '0',
  `last_device_report_time` int(11) NOT NULL DEFAULT '0',
  `last_device_report` text NOT NULL,
  `last_device_error` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;


-- Дамп структуры для таблица depstore.emails
CREATE TABLE IF NOT EXISTS `emails` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `active` tinyint(1) NOT NULL,
  `comment` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- Дамп данных таблицы depstore.emails: ~1 rows (приблизительно)
/*!40000 ALTER TABLE `emails` DISABLE KEYS */;
INSERT INTO `emails` (`id`, `email`, `active`, `comment`) VALUES
  (1, 'tva.10@usrbb.ru', 0, 'Test');
/*!40000 ALTER TABLE `emails` ENABLE KEYS */;


-- Дамп структуры для таблица depstore.log
CREATE TABLE IF NOT EXISTS `log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `log` text NOT NULL,
  `datetime` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;


-- Дамп структуры для таблица depstore.operations
CREATE TABLE IF NOT EXISTS `operations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL DEFAULT '0',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `inserted` decimal(10,2) NOT NULL DEFAULT '0.00',
  `dispensed` decimal(10,2) NOT NULL DEFAULT '0.00',
  `printed` int(2) NOT NULL,
  `fisc` int(2) NOT NULL,
  `datetime` int(11) NOT NULL DEFAULT '0',
  `user_phone` varchar(20) DEFAULT NULL,
  `org_id` int(11) DEFAULT NULL,
  `sync` tinyint(4) NOT NULL,
  `sync_remote` tinyint(4) NOT NULL,
  `no_troubles` tinyint(4) NOT NULL DEFAULT '0',
  `approved` tinyint(4) NOT NULL DEFAULT '0',
  `data` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;



-- Дамп структуры для таблица depstore.settings
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `k` varchar(255) NOT NULL,
  `v` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8;

-- Дамп данных таблицы depstore.settings: ~37 rows (приблизительно)
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` (`id`, `k`, `v`) VALUES
  (5, 'terminal_id', '00001'),
  (42, 'time_save_logs', '14'),
  (49, 'SellerName', 'ИП ТЕСТ'),
  (50, 'SellerAddress', '115001, Тестовый Адрес'),
  (53, 'SellerPhone', '+7 000 000 00-00'),
  (57, 'TerminalAddress', 'Адрес терминала');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;


-- Дамп структуры для таблица depstore.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fio` varchar(255) NOT NULL,
  `admin` tinyint(4) NOT NULL,
  `operator` tinyint(4) NOT NULL,
  `org` text NOT NULL COMMENT 'список доступных организаций для клиента',
  `master` int(1) unsigned NOT NULL DEFAULT '0' COMMENT 'Божество',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- Дамп данных таблицы depstore.users: ~2 rows (приблизительно)
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `name`, `password`, `fio`, `admin`, `operator`, `org`, `master`) VALUES
  (1, 'operator', '202cb962ac59075b964b07152d234b70', 'Имя Отчество Фамилия', 1, 1, '[]', 1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;


-- Дамп структуры для таблица depstore.variables
CREATE TABLE IF NOT EXISTS `variables` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `k` varchar(255) NOT NULL,
  `v` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;


/*!40000 ALTER TABLE `variables` ENABLE KEYS */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
