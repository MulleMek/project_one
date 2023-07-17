<?php

require_once '../_project/config/php/project_details.php';
require_once "config/framework_config.php";
require_once '../_project/config/php/config.php';

define("D_ROOT", realpath(__DIR__."/../") . "/");

require_once SHARED_FOLDER . "core/helpers.php";
require_once SHARED_FOLDER . "core/Autoloader.php";
require_once SHARED_FOLDER . "core/Functions.php";

ProjectManager::checkConstants();

if ( IS_SESSION_ON ) {
	session_start();
}

if ( IS_ERRORS_ON ) {
	//ini_set('error_reporting', E_ALL ^ E_DEPRECATED);
	error_reporting(E_ALL ^ (E_DEPRECATED));
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
} else {
	ini_set('display_errors', 'Off');
}

ProjectManager::check();
//Terminal::getErrors();
Route::start();
