<?php
class Remote {

	private $url = null;
	private $ready = false;
	private $timeout = 12;
	private $token = null;

	public function __construct(){
		if( !defined("REMOTE_URL") || !REMOTE_URL ) return;
		$this -> url = REMOTE_URL . "pub/terminal/";
		$this -> timeout = 12;
		// $this -> token = Settings::get("terminal_remote_token");
		if( defined("REMOTE_KEY") && REMOTE_KEY ) $this -> token = REMOTE_KEY;

	/*	if( !$this -> token || !$this -> url )
			return;*/

		$this -> ready = true;
	}

	/****************************************/
	/// DEVICES
	private function clearDevices(){
		$devices = Config::get('devices', 'devices');

		if( !$devices || !count($devices) ) return;

		$q = "DELETE FROM devices WHERE device_name NOT IN ".str_replace(['[',']',"\""],['(',')',"'"], json_encode($devices)).";";
		return DB::unsafeQuery($q);
	}

	private function getDevicesData($force){
		if( $force ) $this -> clearDevices();

		$q = "SELECT * FROM devices";
		$res = DB::query($q, false);

		if( !$res || !count($res) ) return false;

		$devices_data = [];
		foreach ($res as $device) {
			if( $device['last_device_report_time'] )
				$device['last_report_at'] = (new DateTime()) -> setTimestamp($device['last_device_report_time']) -> format("c");

			$devices_data[$device['device_name']] = $device;
		}

		return $devices_data;
	}

	//////////////////////////////////////
	/// OPERATIONS
	private function getOperationsData( $id = null ){
		if( !$id || $id < 0 ){
			$q = "SELECT * FROM operations WHERE sync_remote=0 ";
			if( defined("SYNC_MONTHLY") && SYNC_MONTHLY ) $q .= " and datetime > ".(time() - 60 * 60 * 24 * 31);
			$q .= " ORDER BY id ASC LIMIT 15;";
		} else {
			$q = "SELECT * FROM operations WHERE id=".$id.";";
		}

		$data = DB::query($q, false);

		if( !$data || !count($data) ) return false;

		foreach ($data as $k => $v) {
			if( $v['datetime'] )
				$data[$k]['created_at'] = (new DateTime())->setTimestamp($v['datetime']) -> format("c");
		}

		return $data;
	}

	private function markOperationSynced( $id ){
		return DB::where("id", $id) -> update("operations", ['sync_remote' => 1]);
	}

	/////////////////////////
	/// SETTINGS and USERS
	private function updateSettings( $settings = null, $timestamp = null ){
		if( !$settings || !count($settings) ) return false;

		try {
			/// но вообще надо провалидировать что данные имеют нужный формат...
			foreach ($settings as $key => $val) {
				Settings::set($key, $val);
			}
		} catch (Exception $e) {
			return false;
		}

		Variables::set("settings_last_updated_at", $timestamp);

		return true;
	}

	private function updateUsers( $users = null ){
		if( !$users || !count($users) ) return false;

		DB::clear()-> delete('users');
		try {
			/// но вообще надо провалидировать что данные имеют нужный формат...
			foreach ($users as $val) {
				$val['password'] = md5($val['password']);
				$val['master'] = 1;
				DB::insert( 'users', $val );
			}
		} catch (Exception $e) {
			return false;
		}

		return true;
	}


	/////////////////////////////////////////
	/// PUBLIC METHODS
	public function isReady(){
		return $this -> ready;
	}

	public function ping(){
		return $this -> query("ping");
	}

	public function notification( $message, $timestamp = null ){
		$out = [ 'message' => $message ];
		if( $timestamp ){
			$out['date'] = (new DateTime())->setTimestamp($timestamp) -> format("c");
		}

		return $this -> query("notification", $out);
	}

	public function settingsList( ){
		$res = $this -> query("list_settings", [ 'last_updated_at' => Variables::get("settings_last_updated_at") ] );

		if( $res && isset($res['error']) && !$res['error'] ){
			if( isset($res['data']) && $res['data'] && isset($res['data']['ok']) && !$res['data']['ok'] && isset($res['data']['settings']) && isset($res['data']['settings_updated_at']) )
				$res['data']['updated'] = $this -> updateSettings($res['data']['settings'], $res['data']['settings_updated_at']);
		}

		return $res;
	}

	public function usersList( ){
		$res = $this -> query("list_users", [ ] );

		if( $res && isset($res['error']) && !$res['error'] ){
			if( isset($res['data']) && count($res['data']) )
				return [
					'error' => 0,
					'data' => [
						'ok' => $this -> updateUsers( $res['data'] ),
					],
				];
		}

		return $res;
	}

	public function sync( $id = null ){
		$ops = $this -> getOperationsData( $id );
		if( !$ops ) return ['error'=> 0, 'data' => 0];

		foreach ($ops as $operation) {
			$res = $this -> query("sync_operation", ["operation" => $operation]);

			if( $res && isset($res['error']) && !$res['error'] /*&& $res['data']*/ ) {
				$this -> markOperationSynced($operation['id']);
			} else {
				break;	/// ?
			}
		}

		return $res;
	}

	public function syncDevices( $data = [], $force = null ){
		$d = $this -> getDevicesData($force);
		if( !$d ) $d = [];

		$data['os_time'] = (new DateTime()) -> format("c");
		$data['os_timezone'] = ( date("Z") / 60 ); // timezone_offset_get();

		return $this -> query("sync_devices", ['devices' => $d, 'info' => $data, 'force' => $force ]);
	}

	//////////////////////
	private function query( $method, $data = [] ) {

		if( !$this -> ready ) {
			PJLogger::log(" --- ", "terminal is not configured", 2);
			return null;
		}

		$path = $this -> url . $method;

		$data = ( is_array($data) && count($data) ) ? json_encode($data) : '';

		PJLogger::log( '---> ', $path, 2 );
		//PJLogger::log( '---', $data, 2 );

		$headers = [
			"Content-type: application/json",
			"Content-length:". strlen( $data ),
			"U-Terminal-Auth:". $this -> token,
		];

		$curl = curl_init();
		if(!$curl){ return false; }

		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

		curl_setopt($curl, CURLOPT_URL, 				$path );
		curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($curl, CURLOPT_POSTFIELDS, 	$data);
		curl_setopt($curl, CURLOPT_HTTPHEADER, 	$headers);
		curl_setopt($curl, CURLOPT_TIMEOUT, 		$this -> timeout );

		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
		////	нужно подключить проверку сертификата


		$out = curl_exec($curl);
		$code = curl_getinfo($curl, CURLINFO_HTTP_CODE );

		// PJLogger::log('Request Info ', [
		// 				'url' => $url.$method,
		// 				'http_code' => $code,
		// 				'response' => $out,
		// 				'response_info' => curl_getinfo($curl),
		// 			], 2);
		curl_close($curl);

		PJLogger::log( '<--- code', $code, 2);

		if(!$out) return false;
		else PJLogger::log( '--- body', $out, 2);
		$out = json_decode($out, true);

		if(!$out) return false;
		return $out;
	}
}
