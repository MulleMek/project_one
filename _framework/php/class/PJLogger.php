<?php

class PJLogger 
{
	// $path = 0 - стандартный лог, просто логи о работе части которая осуществляет основное предназначение терминала
	// $path = 1 - клиентский лог, логи терминала который взаимодействует с сервером
	// $path = 2 - серверный лог, логи терминала являющегося сервером
	public static function log( $comment='', $answer=[], $path = 0)
	{
		if( is_array($answer)){
			$answer = json_encode($answer, JSON_UNESCAPED_UNICODE);
		}

		$log = [];
		$ip = $_SERVER['REMOTE_ADDR'];//"null";
		/* if(isset($_SERVER['REMOTE_ADDR'])) {
				$tmp = explode(".", $_SERVER['REMOTE_ADDR']);
				$ip = array_pop($tmp);
		} */

		$log[] =  date("H:i d.m.Y ", date("U")) . $ip." ".$comment." ".$answer;

		self::writeLog($log, $path);
	}


	private static function writeLog($log, $path)
	{
	  $fileName = self::returnStatFileName($path);

	  //file_put_contents($fileName, '_  _  _  _  _  _  _  _  _  _  _  _  _  _  _  _'.PHP_EOL,  FILE_APPEND);
	  //file_put_contents($fileName, PHP_EOL.PHP_EOL,  FILE_APPEND);

	  foreach ($log as $string) {
		 file_put_contents($fileName, $string.PHP_EOL, FILE_APPEND);
	  }

	  return true;
	}

	private static function returnStatFileName($path)
	{
		//определяем куа сохраним логи
		$dir = null;
		// Клиент
		if($path == 1) $dir = D_ROOT."_project/Logger/Client/";		
		// Сервер
		if($path == 2) $dir = D_ROOT."_project/Logger/Server/";
		// дефолтные настройки
		if($path == 0 || !$dir) $dir = D_ROOT."_project/Logger/Custom/";

		//Проверяем чтобы была дирректория, если нет директори то создаём
		if(!is_dir($dir)) mkdir($dir, 0777, TRUE);
		
		//$dir = D_ROOT.'/log/';
		if ($handle = opendir($dir)) {
			while (false !== ($file = readdir($handle))) { 
				//тут нужно отрезать .log
				if(!in_array($file, [".",".."])){
					$tmp = explode('.', $file);
					$_file = array_shift($tmp);
					if (intval(time())-intval(strtotime($_file)) > (int)(Settings::get("time_save_logs"))*24*60*60 ) {
						unlink($dir.$file);
					}
				}
			}
			closedir($handle);
		}

		return $dir.date( "Y-m-d", time()).'.log';
	}
}