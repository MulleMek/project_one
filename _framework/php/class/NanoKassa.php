<?php

require_once 'vendors/Nanokassa/nanosys/nanoparams.php';
require_once 'vendors/Nanokassa/nanosys/nanofunctions.php';

use Nanokassa\F\NanoFunctions as nanoF;
use Nanokassa\P\NanoParams as nanoP;

class NanoKassa {

	private $kassaid;
	private $kassatoken;
	private $vend_params;
	private $cms = "wordpress";

	private $settings_params = [ 
		"nanokassa_testmode",  
		"nanokassa_kassaid", 
		"nanokassa_kassatoken", 
		"nanokassa_vend_address", 
		"nanokassa_vend_mesto", 
		"nanokassa_vend_num_avtovat",

		"nanokassa_rezhim_nalog",
	];

	private $test;
	private $url = nanoP::URL_TO_SEND_TO_NANOKASSA;
	private $check_url = "http://fp.nanokassa.com/getfp";
	public $ready = false;

	public function __construct( $kassa_org_id = null ){
		if( $kassa_org_id ){
			if( !$this -> initAsOrg($kassa_org_id) ) return;
		} else{
			if( !$this -> initFromSettings() ) return;
		}

		$this -> ready = true;
	}

	private function initFromSettings(){
		$settings = Settings::getMany( $this -> settings_params);
		if( !$settings ) $settings = [];
		if( !isset($settings['nanokassa_testmode']) ) $settings['nanokassa_testmode'] = 1;
		if( !isset($settings['nanokassa_kassaid']) || !$settings['nanokassa_kassaid'] ) return false;
		if( !isset($settings['nanokassa_kassatoken']) || !$settings['nanokassa_kassatoken'] ) return false;
		
		$this -> kassaid = $settings['nanokassa_kassaid'];
		$this -> kassatoken = $settings['nanokassa_kassatoken'];

		$this -> test = intval($settings['nanokassa_testmode']);
		if( $this -> test ) $this -> test = "1";
		else $this -> test = "0";

		if( isset($settings['nanokassa_vend_address']) && $settings['nanokassa_vend_address'] && 
				isset($settings['nanokassa_vend_mesto']) && $settings['nanokassa_vend_mesto'] &&
				isset($settings['nanokassa_vend_num_avtovat']) && $settings['nanokassa_vend_num_avtovat'] ){
			$this -> vend_params = [
				"check_vend_address" => $settings['nanokassa_vend_address'],			/// [string] [max 256 symb]
				"check_vend_mesto" => $settings['nanokassa_vend_mesto'],					/// [string] [max 256 symb]
				"check_vend_num_avtovat" => $settings['nanokassa_vend_num_avtovat'],	/// [string] [max 20 symb]
			];
		} else {
			$this -> vend_params = null;
		}

		if( isset($settings['nanokassa_rezhim_nalog']) && $settings['nanokassa_rezhim_nalog'] ){
			$this -> rezhim_nalog = $settings['nanokassa_rezhim_nalog'];
		} else {
			$this -> rezhim_nalog = "";
		}

		return true;
	}

	private function initAsOrg( $id ){
		$org = DB::query("SELECT id, nanokassa_data FROM organizations where active=1 and id=".$id , false);
		if( !$org || !$org[0] || !$org[0]['nanokassa_data'] ) return false;
		$org = $org[0];
		$org['nanokassa_data'] = json_decode($org['nanokassa_data'], true);
		if( !$org['nanokassa_data'] ) return false;

		$settings = $org['nanokassa_data'];
		if( !$settings ) $settings = [];
		if( !isset($settings['testmode']) ) $settings['testmode'] = 0;
		if( !isset($settings['kassaid']) || !$settings['kassaid'] ) return false;
		if( !isset($settings['kassatoken']) || !$settings['kassatoken'] ) return false;
		
		$this -> kassaid = $settings['kassaid'];
		$this -> kassatoken = $settings['kassatoken'];

		$this -> test = intval($settings['testmode']);
		if( $this -> test ) $this -> test = "1";
		else $this -> test = "0";

		if( isset($settings['vend_address']) && $settings['vend_address'] && 
				isset($settings['vend_mesto']) && $settings['vend_mesto'] &&
				isset($settings['vend_num_avtovat']) && $settings['vend_num_avtovat'] ){
			$this -> vend_params = [
				"check_vend_address" => $settings['vend_address'],			/// [string] [max 256 symb]
				"check_vend_mesto" => $settings['vend_mesto'],					/// [string] [max 256 symb]
				"check_vend_num_avtovat" => $settings['vend_num_avtovat'],	/// [string] [max 20 symb]
			];
		} else {
			$this -> vend_params = null;
		}

		if( isset($settings['rezhim_nalog']) && $settings['rezhim_nalog'] ){
			$this -> rezhim_nalog = $settings['rezhim_nalog'];
		} else {
			$this -> rezhim_nalog = "";
		}

		return true;
	}

	/////////////////////////////////////////////////////////////////////////////////////////
	///

	private static function error( $msg = "", $data = null, $code = null ){
		return [ "error" => 1, "message" => $msg, "data" => $data, "code" => $code ];
	}
	private static function resolve( $data, $code = null ){
		return [ "error" => 0, "data" => $data, "code" => $code ];
	}

	private static function parseAnswer( $data, $code ){

		if( !$data ) return self::error( "Answer is empty", false, $code);
		$data = json_decode($data, true);
		if( !$data ) return self::error( "Json parse error", false, $code);

		if( isset($data['status']) && $data['status'] == "success" 
			&& isset($data['nuid']) && $data['nuid'] 
			&& isset($data['qnuid']) && $data['qnuid']
		){
			return self::resolve( $data, $code );
		}

		return self::error( null, $data, $code );
	}
	private static function parseStatusAnswer( $data, $code ){

		if( !$data ) return self::error( "Answer is empty", false, $code);
		$data = json_decode($data, true);
		if( !$data ) return self::error( "Json parse error", false, $code);

		if( isset($data['status_code']) && (!$data['status_code'] || $data['status_code'] == "000") 
				&& isset($data['error_code']) && (!$data['error_code'] || $data['status_code'] == "000") 
				&& isset($data["check_status"] )
		){
			return self::resolve( $data, $code );
		}

		return self::error( null, $data, $code );
	}

	public function getStatus(){
		if( !$this -> ready ) return self::error("Nanokassa not inited", false, -1);

		$last_check = Variables::get("nanokassa_last_check_nuid");
		if( $last_check ) $last_check = json_decode($last_check, 1);
		if( !$last_check ) $last_check = null;

		$out = [
			'testmode' => $this -> test,
			'kassaid' => $this -> kassaid,
			'vend' => $this -> vend_params,
			'last_check' => $last_check,
		];

		return self::resolve( $out );
	}


	////////////////////////////////////////
	private static function verify( $data ){
		if( !$data || !isset($data['check_send_type']) || !isset($data['oplata_arr']) || !isset($data['itog_arr']) || !isset($data['products_arr']) )
			return false;

		//// TMP del
		//// Минимальный формат.... нужно указать и нулевые внесенные суммы( безнал предоплата и прочее)
		//// Так же режим налогообложения и пустой телефон клиента...
		// $data = [
		// 	'check_send_type' => "email",
		// 	'oplata_arr' => [
		// 		"client_email" => "tva.10@usrbb.ru",
		// 		"client_phone" => "",

		// 		"rezhim_nalog" => "",

		// 		"money_nal" => 150,
		// 		"money_electro" => 0,

		// 		"money_predoplata" => 0,
		// 		"money_postoplata" => 0,
		// 		"money_vstrecha" => 0,
		// 	],
		// 	'itog_arr' => [
		// 		"priznak_rascheta" => 1,
		// 		"itog_cheka" => 150
		// 	],
		// 	'products_arr' => [
		// 		[
		// 			"name_tovar" => "Тестовый товар",
		// 			"price_piece" => 100,
		// 			"kolvo" => 1.50,
		// 			"summa" => 150,
		// 			"stavka_nds" => 6,
		// 			"priznak_sposoba_rascheta" => 1,
		// 			"priznak_predmeta_rascheta" => 1,
		// 			"priznak_agenta" => "none",
		// 		]
		// 	],
		// ];

		if( !$data['check_send_type'] ) return false;

		if( count($data['products_arr']) == 0 ) return false;

		$_sum = 0;
		foreach ($data['products_arr'] as $good ) {
			if( !isset($good['summa']) || !isset($good['name_tovar']) 
					|| !isset($good['price_piece']) || !isset($good['kolvo']) 
					|| !isset($good['stavka_nds']) || !isset($good['priznak_sposoba_rascheta'])
					|| !isset($good['priznak_predmeta_rascheta']) || !isset($good['priznak_agenta']) 
			) return false;

			if( $good['summa'] !== $good['price_piece'] * $good['kolvo'] ) return false;
			$_sum += $good['summa'];
		}

		if( !isset($data['itog_arr']['priznak_rascheta']) || !isset($data['itog_arr']['itog_cheka']) ) return false;
		if( $data['itog_arr']['itog_cheka'] !== $_sum ) return false;

		if( !isset($data['oplata_arr']['client_email']) || !isset($data['oplata_arr']['client_phone']) ) return false;

		if( !isset($data['oplata_arr']['money_nal']) 
				|| !isset($data['oplata_arr']['money_electro']) 
				|| !isset($data['oplata_arr']['money_predoplata']) 
				|| !isset($data['oplata_arr']['money_postoplata']) 
				|| !isset($data['oplata_arr']['money_vstrecha']) 
			) return false;

		return $data;
	}



	/////////////////////////////////////////
	///
	///
	public function makeCheck( $check = [] ){
		
		if( !self::verify( $check ) ) {
			PJLogger::log(" ---- Verify check error", $check, 4);
			return self::error("Not all params received");
		}

		//// докидываем режим налогообложения, если не указан...
		if( !isset($check['oplata_arr']['rezhim_nalog']) || !$check['oplata_arr']['rezhim_nalog'] ){
			$check['oplata_arr']['rezhim_nalog'] = $this -> rezhim_nalog;
		}

		$res = $this -> request($check);

		if( !$res['error'] ){
			$tmp = [ 
					'check_nuid' => $res['data']['nuid'], 
					'check_qnuid' => $res['data']['qnuid'] 
				];
			Variables::set("nanokassa_last_check_nuid", json_encode($tmp));

			//// мб не стоит запрашивать сразу
			//// и типо лучше вернуть тогда массив в формате check_nuid check_qnuid
			//// и потом со стороны nanokassa js повторить запрос статуса через 5 секунд... 
			$res2 = $this -> statusCheck( $res['data']['nuid'], $res['data']['qnuid'] );
			
			if( !$res2['error'] ) return $res2;

			return self::resolve($tmp);
		}

		return  $res;
	}

	public function statusCheck( $nuid, $qnuid ) {
		if( !$nuid && !$qnuid ) return self::error("Not all params received");

		return $this -> check_request( [ 'nuid' => $nuid, 'qnuid' => $qnuid, 'auth' => 'base' ] );
	}


	/////////////////////////////////////////////////////////////////////////////////////
	///
	private function request($data = []){

		if( !$this -> ready ) return self::error("Nanokassa not inited", false, -1);

		PJLogger::log(" ----> POST", $data, 4);

		$data['kassaid'] = $this -> kassaid;
		$data['kassatoken'] = $this -> kassatoken;
		$data['cms'] = $this -> cms;

		if( $this -> vend_params ){
			foreach ($this -> vend_params as $key => $val) {
				if( !isset($data[$key]) ) 
					$data[$key] = $val;
			}
		}

		$firstcrypt = nanoF::crypt_nanokassa_first(json_encode($data, JSON_UNESCAPED_UNICODE) );
		$returnDataAB = $firstcrypt[0];
		$returnDataDE = $firstcrypt[1];

		$request2 = [
			"ab" => $returnDataAB,
			"de" => $returnDataDE,
			"kassaid" => $this -> kassaid,
			"kassatoken" => $this -> kassatoken,
			"test" => $this -> test,
		];

		$secondcrypt = nanoF::crypt_nanokassa_second(json_encode($request2, JSON_UNESCAPED_UNICODE));
		$returnDataAAB = $secondcrypt[0];
		$returnDataDE2 = $secondcrypt[1];

		$request3 = [
			"aab" => $returnDataAAB,
			"dde" => $returnDataDE2,
			"test" => $this -> test,
		];


		$result = $this -> send(json_encode($request3, JSON_UNESCAPED_UNICODE));

		if( !$result || !isset($result['error']) ) return self::error("Unexpected error", false, -1);
		return $result;
	}


	private function send( $request ){
		
		$curl = curl_init();
		if( !$curl ) return self::error("Curl failure", null, -1 );

		curl_setopt($curl, CURLOPT_URL, $this -> url);
		curl_setopt($curl, CURLOPT_HTTPHEADER, ["Content-type: application/json"]);
		curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 10);
		curl_setopt($curl, CURLOPT_TIMEOUT, 10);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);	//// ---
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $request);

		$res = curl_exec($curl);
		$http_code = curl_getinfo( $curl, CURLINFO_HTTP_CODE);
		curl_close( $curl );

		PJLogger::log(" <---- POST answer", [ "http_code" => $http_code, "response" => $res ], 4);
		
		if( $http_code !== 200 || !$res ){
			return self::error("Server error", null, $http_code);
		}

		return self::parseAnswer($res, $http_code);

		// if (function_exists('curl_init')) {
		// 	$curl = @curl_init();
		// 	@curl_setopt($curl, CURLOPT_URL, $this -> url);
		// 	curl_setopt($curl, CURLOPT_HTTPHEADER, array("Content-type: application/json"));
		// 	@curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 10);
		// 	@curl_setopt($curl, CURLOPT_TIMEOUT, 10);
		// 	@curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		// 	@curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		// 	@curl_setopt($curl, CURLOPT_POST, true);
		// 	@curl_setopt($curl, CURLOPT_POSTFIELDS, $request);
		// 	$tp = @curl_exec($curl);
		// } else {
		// 	$tp = 'error, curl not installed on server';
		// }
		// return ($tp);
	}

	private function check_request( $params ){
		$curl = curl_init();
		if( !$curl ) return self::error("Curl failure", null, -1 );

		$query = "?".http_build_query($params);

		PJLogger::log(" ----> GET", $query, 4);


		curl_setopt( $curl, CURLOPT_URL, $this -> check_url. $query );
		curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 10);
		curl_setopt($curl, CURLOPT_TIMEOUT, 10);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);	//// ---

		$res = curl_exec($curl);
		$http_code = curl_getinfo( $curl, CURLINFO_HTTP_CODE);
		curl_close( $curl );

		PJLogger::log(" <---- GET answer", [ "http_code" => $http_code, "response" => $res ], 4);

		if( $http_code !== 200 || !$res ){
			return self::error("Server error", null, $http_code);
		}

		return self::parseStatusAnswer($res, $http_code);
	}

}
