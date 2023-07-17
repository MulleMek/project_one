<?php

/***************************************************************/
/* PROJECT INFORMATION */
/***************************************************************/

if ( $_SERVER['SERVER_NAME'] == 'xxx.com' || $_SERVER['SERVER_NAME'] == '111.111.111.110' ) {
	define( 'IS_LOCAL', false );
	define( 'SUBDOMAIN_PREFIX', PROJECT_NAME . '/' );
	define( 'DOCUMENT_ROOT', $_SERVER['DOCUMENT_ROOT'] . '/' . PROJECT_NAME);
} else {
	define( 'IS_LOCAL', true );
	define( 'SUBDOMAIN_PREFIX', '' );
	define( 'DOCUMENT_ROOT', $_SERVER['DOCUMENT_ROOT']);
}

/***************************************************************/
/* DIRECTORIES AND DOMAIN */
/***************************************************************/

define( 'SHARED_FOLDER', '../_framework/php/' );
define( 'JS', '/' . SUBDOMAIN_PREFIX . '_framework/js');
define( 'CSS', '_framework/public/css');
define( 'PROJECT', '../_project');
define( 'PROJECT_JS', '/' . SUBDOMAIN_PREFIX . '_project' );
define( 'DEVICES_INFO', '../_project/config/devices.json');
define( 'LOGS', '../_project/files/logs/log.log');
define( 'BAT_PATH', DOCUMENT_ROOT . '/_framework/bat/');
define( 'OPERATION_LOGS_PATH', '../_project/files/logs/operations/');

define( 'DIRECT_SERVICES_IMAGE', '../_project/files/image_services/');
define( 'FOLDER_SERVICES_IMAGE', '_project/files/image_services/');
define( 'FOLDER_ORG_IMAGE', '_project/files/image_org/');
define( 'HTTP_SERVICES_IMAGE', 'http://'. $_SERVER['HTTP_HOST'].'/');

define( "KIOSK_DOMAIN", SUBDOMAIN_PREFIX . "kiosk");
define( "PROXY_DOMAIN", SUBDOMAIN_PREFIX . "proxy");
define( "SERVICES_DOMAIN", SUBDOMAIN_PREFIX . "_framework");
define( "OPERATOR_DOMAIN", SUBDOMAIN_PREFIX . "operator");
define( "WEBADMIN_DOMAIN", SUBDOMAIN_PREFIX . "admin");
define( "SCREEN_DOMAIN", SUBDOMAIN_PREFIX . "screen");
define( "KITCHEN_DOMAIN", SUBDOMAIN_PREFIX . "kitchen");