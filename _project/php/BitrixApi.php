<?php
session_write_close();

class BitrixApi {

	private $path;
	private $token;
	private $logs;
	private $solveStage;
	private $filterStage;


	public function __construct( ){
		$this -> path = Settings::get("remote_url");
		$this -> token = Settings::get("remote_token");
		$this -> solveStage = Settings::get("remote_solve_param");
		$this -> filterStage = Settings::get("remote_filter_param");
		//$this -> token = base64_encode('Basic usr:pass');

		$this -> ready = true;
	}
	
	public function isReady(){
		return $this -> ready;
	}

	// public function ping(){
	// 	return $this -> send_get("Ping", [], 5);
	// }

	public function getUser( $phone ){
		$res = $this -> send_post("user.get.json", [ ], [ 'WORK_PHONE' => $phone ]);
		return $res;
	}

	public function getCatalog( $user_id ){
		$data = [
			'filter' => [
				'ASSIGNED_BY_ID' => $user_id,
			],
		];
		if( $this -> filterStage )
			$data['filter']['STAGE_ID'] = explode( ",", $this -> filterStage );
		// $data['filter']['STAGE_ID'] = [ 'C18:UC_60MXV9', 'C18:UC_3O1UKO' ];
		$res = $this -> send_post("crm.deal.list", $data );
		return $res;
	}

	public function solve( $id ){
		$data = [
			'ID' => $id,
			// 'fields' => [ 'STAGE_ID' => "C22:UC_FN6W36" ],
			'params' => [ 'REGISTER_SONET_EVENT' => "Y" ],
			'fields' => [ 'UF_CRM_1683746689780' => "Y" ], // добавлено по доп.запросу клиента
		];
	
		if( $this -> solveStage )
			$data['fields']['STAGE_ID'] = $this -> solveStage;
		
		
		
		$res = $this -> send_post("crm.deal.update.json", $data );
		return $res;
	}

	private function send_post( $method, $data = [], $query = [], $timeout=20 ){

		$out = [ 'error' => 1, 'data' => null ];

		$curl = curl_init();
		if( !$curl ) {
			$out['message'] = 'Init error';
			return $out;
		}

		$url = $this -> path . $method;
		if( $query ) $url .= "?".http_build_query($query, null, '&', PHP_QUERY_RFC3986);

		if( $data ) {
			$data = ( is_array($data) && count($data) ) ? json_encode($data) : '';
			$headers = [
				"Content-type: application/json",
				"Content-length:". strlen( $data ),
			];
		}
		
		PJLogger::log("Request ----> ", $url );
		PJLogger::log("Request data ----> ", $data );


		curl_setopt ($curl, CURLOPT_URL,  $url );
		curl_setopt ($curl, CURLOPT_CUSTOMREQUEST, "POST");
		if( $data ){
			curl_setopt ($curl, CURLOPT_POSTFIELDS, $data);
			curl_setopt ($curl, CURLOPT_HTTPHEADER, $headers);	
		}
		// curl_setopt ($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
		// curl_setopt ($curl, CURLOPT_USERPWD, $this -> token);
		curl_setopt ($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt ($curl, CURLOPT_TIMEOUT, $timeout);
		curl_setopt ($curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt ($curl, CURLOPT_SSL_VERIFYHOST, 0);

		$result = curl_exec($curl);
		PJLogger::log("Response <-----", json_encode($result) );

		// PJLogger::log("Curl debug", curl_getinfo($curl));
		// if( $this -> logs['debug'] && $this -> logs['curlinfo'] ){
		// 	$out['curl_info'] = curl_getinfo($curl);
		// 	PJLogger::log("Curl debug", $out['curl_info']);
		// }

		$out['code'] = curl_errno($curl);
		if( $out['code'] ){
			curl_close($curl);
			return $out;
		}

		$out['code'] = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		curl_close($curl);
		if( $out['code'] !== 200 || !$result) {
			PJLogger::log("Response out ", json_encode($out) );
			return $out;
		}

		$out['data'] = json_decode($result, true);
		if( !$out['data'] ) { return $out; }

		$out['error'] = 0;
		return $out;
	}

}
