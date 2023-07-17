<?php

/***************************************************************/
/* DB INIT PARAMS */
/***************************************************************/
define( 'DB_HOST', '127.0.0.1');			//Расположение БД
define( 'DB_USERNAME', 'root' );		//Логин пользователя
define( 'DB_TABLE', PROJECT_NAME );	//Название таблицы
define( 'DB_PASSWORD', '' );		//Пароль пользователя

define( 'DB_AUTOCREATE', true);

/***************************************************************/
/* PROJECT OPERATION SYSTEM */
/***************************************************************/
define ('IS_LINUX', false);

/***************************************************************/
/* PHP CONFIG */
/***************************************************************/
define ('IS_SESSION_ON', true);
define ('IS_ERRORS_ON', true);
define ('IS_DEVELOPER_ON', false);
define ('IS_MIGRATE_ENABLED', false);


define ('IS_PINPAD_CLOSEDAY_ON', true);

date_default_timezone_set('Etc/GMT-3');

/***************************************************************/
/*OTHER
/***************************************************************/
// define('REMOTE_URL', '');
// define('REMOTE_URL', '');
// define('REMOTE_KEY', ' ');

// define('SYNC_MONTHLY', true);
