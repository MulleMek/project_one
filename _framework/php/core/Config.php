<?php

class Config {

	public static function get( $type, $param = false )
	{

		$configFile = PROJECT . "/config/" . $type.".json";

		if ( !file_exists($configFile) ) {
			return false;
		}

		if( $param === false ){
			$content = file_get_contents($configFile);
			$content = json_decode($content, true);

			if (isset($content)) {
				return $content;
			} else {
				return false;
			}
		}

		if ( !is_string($param) ) {
			return false;
		}

		
		$content = file_get_contents($configFile);
		$content = json_decode($content, true);
		if (isset($content[$param])) {
			return $content[$param];
		} else {
			return false;
		}

	}

	public static function getRemoteOperationMethod()
	{
		/*
		 * возвращает либо false
		 * либо [
		 *    "class" => ClassName,
		 *    "method" => methodName,
		 *    "devices" => либо null, либо массив устройств
		 * ]
		 *
		 */
		$data = self::get("remote", "operator_encash");

		if ( !$data["isOn"] ) {
			 return false;
		}


		$toCheck = ["class", "method"];

		foreach ($toCheck as $key => $value) {
			 if ( !isset($data[$value]) || !is_string($data[$value]) || !$data[$value] ) {
					return false;
			 }
		}

		$devices = null;

		if ( isset($data["devices"]) || is_array($data["devices"]) || !empty($devices) ) {
			 $devices = $data["devices"];
		}

		$answer = [
			 "class" => $data["class"],
			 "method" => $data["method"],
			 "devices" => $devices
		];

		return $answer;
	 }

}