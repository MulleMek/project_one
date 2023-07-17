<?php

class View
{

	public function generate( $contentView, $templateView = "template_view", $data = [], $js = [] )
	{
		/***************************************************************/
		/* VALIDATE (.php) */
		/***************************************************************/

		$viewName = $contentView;

		$contentView = $this->validFile($contentView);
		$templateView = $this->validFile($templateView);

		$templates = [];
		if( isset($data['templates']) ){
			$templates = $data['templates'];
		}

		//проверяет наличие шаблонов для js во views/$contentView_templates.php
		$innerTemplates = $this->getInnerTemplates($viewName);
		$additionalTemplates = [];
		foreach ($templates as $val) {
			$additionalTemplates[] = $this->getInnerTemplates($val);
		}


		//раскрывает переменную data, в которой хранятся все переменные, которые нужно передать в шаблон

		if ( is_array($data) ) {
			extract($data);
		}

		//Если поддомен - admin, создаёт переменную menu

		if ( Route::$subdomain == 'admin/') {
			$menu = Webadmin::getMenu(Auth::user("permissions"));
		}

		//подготавливает все скрипты, включая переданные в $js
		$js = $this->prepareJS($js, $viewName);

		/***************************************************************/
		/* IF MODULE VIEW */
		/***************************************************************/

		$contentView = strtolower('/modules/'.Route::$domainName.'/views/'.$contentView);

		/***************************************************************/
		/* DEFAULT PAGE SCRIPT */
		/***************************************************************/

		include 'application/modules/'.$templateView;
	}

	/***********************************************/
	// PRIVATE FUNCTIONS
	/***********************************************/
	private function validFile( $string, $extension = "php" )
	{
		/*
		 * проверяет имя шаблона, если оно не содержит расширение файла
		 * то, возарвщается строка уже с эксеншеном
		 */

		$tempArray = explode(".", $string);
		if ( $tempArray[count($tempArray) - 1] !== $extension ) {
			$string .= "." . $extension;
		}
		return $string;
	}

	private function getTemplatePath($template)
	{
		/*
		 * возвращает относительный путь до шаблона
		 */
		return strtolower('/modules/'.Route::$domainName.'/views/'.$template);
	}

	private function getInnerTemplates($viewName)
	{
		/*
		 * Проверяет, есть ли в application/modules/{{имя_модуля}}/views
		 * файл $viewName_templates.php
		 *
		 * содержит всякие шаблоны для knocout или handlebars
		 * (чтобы не грузить асинхронно)
		 *
		 *
		 */

		$name = $viewName."_templates.php";

		$path = DOCUMENT_ROOT . "/" . Route::$subdomain . 'application' . $this->getTemplatePath($name);

		if ( file_exists($path) ) {
			return $this->getTemplatePath($name);
		}

		return false;
	}

	private function prepareJS($js, $viewName)
	{

		/*
		 * Возвращает массив, где содержатся src на нужные скрипты
		 */
		$answer = [];

		if(Route::$subdomain != 'kiosk/'){

			$answer = [
				'<script src="'. JS . '/vendors/jquery-2.1.1.min.js"></script>',
				'<script src="' . PROJECT_JS . '/EnvironmentConfig.js"></script>',
				'<script src="' . PROJECT_JS . '/EnvironmentEtc.js"></script>',
				'<script src="' . PROJECT_JS . '/EnvironmentScenarios.js"></script>',
				'<script src="' . JS . '/Environment.js"></script>',
				'<script src="'. JS . '/vendors/jquery.clocks.js"></script>',
				'<script src="'. JS . '/vendors/jquery.ba-tinypubsub.js"></script>',
				'<script src="'. JS . '/vendors/EM.js"></script>',
				'<script src="'. JS . '/vendors/iscroll.js"></script>',
				'<script src="'. JS . '/vendors/date-picker.min.js"></script>',
				'<script src="'. JS . '/vendors/datepicker-ru.js"></script>',

				//
				'<script src="'. JS . '/vendors/TweenMax.js"></script>',
				'<script src="'. JS . '/vendors/underscore-min.js"></script>',
				'<script src="'. JS . '/vendors/backbone-min.js"></script>',
				'<script src="'. JS . '/vendors/handlebars.min.js"></script>',
				'<script src="'. JS . '/vendors/knockout-3.4.0.js"></script>',
				'<script src="'. JS . '/vendors/nicEdit/nicEdit.min.js"></script>',
				'<script src="'. JS . '/vendors/chosen.jquery.min.js"></script>',
				'<script src="'. JS . '/vendors/chosen.proto.min.js"></script>',
				'<script src="'. JS . '/modules/U.js"></script>',
				//	- 500 ms

				'<script src="'. JS . '/modules/Helper.js"></script>',
				'<script src="'. JS . '/modules/Abu.js"></script>',
				'<script src="'. JS . '/modules/LocalStorage.js"></script>',
				// '<script src="'. JS . '/modules/Services.js"></script>',
				'<script src="'. JS . '/modules/Popup.js"></script>',
				'<script src="'. JS . '/modules/Router.js"></script>',
			];

		} else {
			/////	То, что будет на киоске.... поубирал половину, т.к. не требуется
			$answer = [
				'<script src="'. JS . '/vendors/jquery-2.1.1.min.js"></script>',
				'<script src="' . PROJECT_JS . '/EnvironmentConfig.js"></script>',
				'<script src="' . PROJECT_JS . '/EnvironmentEtc.js"></script>',
				'<script src="' . PROJECT_JS . '/EnvironmentScenarios.js"></script>',
				'<script src="' . JS . '/Environment.js"></script>',
				//'<script src="'. JS . '/vendors/jquery.clocks.js"></script>',
				'<script src="'. JS . '/vendors/jquery.ba-tinypubsub.js"></script>',
				'<script src="'. JS . '/vendors/EM.js"></script>',
				'<script src="'. JS . '/vendors/iscroll.js"></script>',
				//'<script src="'. JS . '/vendors/date-picker.min.js"></script>',
				//	'<script src="'. JS . '/vendors/datepicker-ru.js"></script>',


				//
				//'<script src="'. JS . '/vendors/TweenMax.js"></script>',							///	Используется для показа Virtual keyboard в операторке /// судя по всему только там...
				//'<script src="'. JS . '/vendors/underscore-min.js"></script>',
				//'<script src="'. JS . '/vendors/backbone-min.js"></script>',
				//'<script src="'. JS . '/vendors/handlebars.min.js"></script>',
				//'<script src="'. JS . '/vendors/knockout-3.4.0.js"></script>',
				//'<script src="'. JS . '/modules/U.js"></script>',
				//'<script src="'. JS . '/vendors/nicEdit/nicEdit.min.js"></script>',
				//'<script src="'. JS . '/vendors/chosen.jquery.min.js"></script>',
				//'<script src="'. JS . '/vendors/chosen.proto.min.js"></script>',
				//	- 500 ms

				'<script src="'. JS . '/modules/Helper.js"></script>',
				'<script src="'. JS . '/modules/Abu.js"></script>',
				'<script src="'. JS . '/modules/LocalStorage.js"></script>',
			//	'<script src="'. JS . '/modules/Services.js"></script>',								///	От этого тоже можно отказаться
				'<script src="'. JS . '/modules/Popup.js"></script>',
				'<script src="'. JS . '/modules/Router.js"></script>',
			];
		}

		if ( array_key_exists("devices", $js)  && !empty($js["devices"]) ) {
			$answer = array_merge($answer, $this->getDevicesJS($js["devices"]));
		}

		if ( array_key_exists("specific", $js) && !empty($js["specific"]) ) {
			$answer = array_merge($answer, $this->getSpecificJS($js["specific"]));
		}

		if ( array_key_exists("scripts", $js) && !empty($js["scripts"]) ) {
			$answer = array_merge($answer, $this->getScriptsJS($js["scripts"]));
		}

		$answer = array_merge($answer, $this->getViewJS($viewName));

		return $answer;
	}

	private function getViewJS($viewName)
	{

		$scriptsDirectory = DOCUMENT_ROOT . '/' . Route::$subdomain . 'public/js/';
		$pageScripts = [];
		$pageScriptsTemplate = [$viewName . '.js', $viewName . '_app.js', $viewName . '_helper.js'];

		foreach ($pageScriptsTemplate as $script) {
			if ( file_exists($scriptsDirectory . $script) ) {
				$pageScripts[] = $script;
			}

		}

		$answer = [];

		foreach ($pageScripts as $script) {
			$answer[] = "<script src='/" . SUBDOMAIN_PREFIX . Route::$subdomain . "public/js/" . $script . "'></script>";
		}

		return $answer;
	}


	private function getScriptsJS($list)
	{
		/*
		 * Возвращает специфичные модули фреймворка, которые нужны не на каждой странице
		 */

		$answer = [];

		foreach ($list as $module) {
			$answer[] = "<script src='/" . SUBDOMAIN_PREFIX . Route::$subdomain . "public/js/scripts/" . $module . ".js'></script>";
		}

		return $answer;
	}

	private function getSpecificJS($list)
	{
		/*
		 * Возвращает специфичные модули фреймворка, которые нужны не на каждой странице
		 */

		$answer = [];

		foreach ($list as $module) {
			$answer[] = "<script src=" . JS . "/specific/" . $module . '.js' . "></script>";
		}

		return $answer;
	}

	private function getDevicesJS($list)
	{

		/*
		 * Возвращает массив с ссылками на билиотеки устройств и сопуствующие им
		 */

		$devices = [
			JS . '/modules/Operation.js',
			JS . '/devices/DevicesList.js',
			JS . "/devices/SocketLogger.js",
			JS . "/devices/DeviceFactory.js",
			JS . "/devices/DeviceManager.js",
//			JS . '/modules/PaymentApp.js'
		];

		foreach ($list as $device) {
			if ( $device == 'Printer' ) {
				$devices[] = JS."/devices/TicketMaker.js";
			}
			$devices[] = JS . "/devices/classes/" . $device . '.js';
		}

		$answer = [];

		foreach ($devices as $value) {
			$answer[] = "<script src=" . $value . "></script>";
		}

		return $answer;
	}
}
