<?php

class Route
{
	public static $domainName = "main";
	public static $controllerName = "MainController";
	public static $action;
	public static $id = null;
	public static $subdomain;


	static function start()
	{
		$domainName = "Main";
		$actionName = "index";
		$id = null;

		/***************************************************************/
		/* VALIDATE REQUESTED URI */
		/***************************************************************/

		$uri = str_replace(SUBDOMAIN_PREFIX, '', $_SERVER['REQUEST_URI'] );
		$subdomainLastPosition = stripos($uri, '/', 1);
		self::$subdomain = substr($uri, 1, $subdomainLastPosition);
		$reqURI = str_replace(self::$subdomain, "", $uri);
		$reqURI = str_replace('?'.$_SERVER['QUERY_STRING'], "", $reqURI);
		$routes = explode('/', $reqURI);

		/***************************************************************/
		/* DETERMIN CONTROLLER/ACTIONS/ID */
		/***************************************************************/
		if ( !empty($routes[1]) ) {
			$domainName = ucfirst($routes[1]);
			self::$domainName = $domainName;
		}
		
		if ( !empty($routes[2]) ) {
			$actionName = $routes[2];
		}

		if ( !empty($routes[3]) ) {
			$id = $routes[3];
			self::$id = $id;
		}
		
		if($_SERVER['SERVER_ADDR'] == $_SERVER['REMOTE_ADDR']){
			// if(Settings::get("sync_is_server") == "1"){
			// 	// ему можно во все вкладки
			// } else {
			// 	if(!in_array(self::$subdomain, ["operator/", "kiosk/", "_framework/", "screen/", "kitchen/", "api/"])){
			// 		header("Location: /operator/");
			// 		exit();
			// 	}
			// }
		} else {
			//if(Settings::get("sync_is_server") == "1"){
			//	if(!in_array(self::$subdomain, ["screen/", "kitchen/", "admin/", "_framework/", "api/", "services/"])){
			//		header("Location: /admin/");
			//		exit();
			//	}
			// } else {
			// 	header('HTTP/1.0 404 not found');
			// 	exit();
			// }
		}

		// чтобы не мастер не мог зайти во вкладки only master
		if(self::$subdomain == "admin/" && !Auth::check_master()){
			$page_master = ["settings", "organization", "users", "email", "agreement", "emailreports"];
			if(in_array(mb_strtolower(self::$domainName), $page_master)){
				header("Location: /admin/");
				exit();
			}
		}

		// исключение для screen чтобы можно было получать нужный screen для любой организации оринтируясь на url
		if(self::$subdomain == "screen/" && COUNT($routes) == 2 && isset($routes[1])) {
			$_REQUEST['org_id'] = (int)$routes[1];
			$routes = ['/'];
			$reqURI = '/';
			$domainName = "Main";
			$actionName = "index";

			self::$domainName = "main";
			$controllerName = "MainController";
		}


		/***************************************************************/
		/* CLASS AND METHODS NAMES */
		/***************************************************************/
		$modelName = $domainName . "Model";
		$controllerName = $domainName . "Controller";
		self::$controllerName = $controllerName;
		$methodName = 'action_'.$actionName;


		/***************************************************************/
		/* CONTROLLER DOESN'T EXIST */
		/***************************************************************/
		if ( !class_exists($controllerName) ) {
			dd('not '.$controllerName);
			return Route::ErrorPage404();
		}
		
		$modelInstance = class_exists($modelName)? new $modelName($domainName) : new Model($domainName);

		$controller = new $controllerName($modelInstance);

		/***************************************************************/
		/* ACTION DOESN'T EXIST */
		/***************************************************************/
		if ( !method_exists($controller, $methodName) ) {
			return Route::ErrorPage404();
		}

		return $controller->$methodName($id);
	}

	public static function redirect($controller = "", $action = "", $id = "", $param = "")
	{

		$controller = ($controller)? $controller ."/" : "";
		$action     = ($action)? $action . "/" : "";
		$id         = ($id)? $id . "/" : "";
		$query      = ($param)? "?".$param : "";

		$body = "Location:http://".$_SERVER['HTTP_HOST'].'/';
		$body .= SUBDOMAIN_PREFIX . self::$subdomain;
		$body .= $controller . $action . $id . $query;

		header($body);
		die();
	}

	public static function redirectHome()
	{
		$host = 'http://'.$_SERVER['HTTP_HOST'].'/';
		$host .= KIOSK_DOMAIN;
		header('Location:'.$host);
		die();
	}	

	public static function redirectErrorPage()
	{
		$host = 'http://'.$_SERVER['HTTP_HOST'].'/';
		$host .= KIOSK_DOMAIN."/error";
		header('Location:'.$host);
		die();
	}	

	public static function ErrorPage404()
	{
		$host = 'http://'.$_SERVER['HTTP_HOST'].'/';
		$host .= (defined('SUB_DOMAIN')) ? SUB_DOMAIN . "/" : "";

		header('HTTP/1.1 404 Not Found');
		header("Status:404 Not Found");
   }
}