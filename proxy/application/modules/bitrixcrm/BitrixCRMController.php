<?php
session_write_close();

class BitrixCRMController extends Controller
{

	private $client = null;

	function __construct( $model = null ){
		if( !(isset($_SERVER['REMOTE_ADDR']) && ($_SERVER['REMOTE_ADDR'] === "127.0.0.1" || $_SERVER['REMOTE_ADDR'] === "localhost" ) ) ){
	      if( !defined("IS_DEVELOPER_ON") || !IS_DEVELOPER_ON ){
				die();
			}
		}
		parent::__construct( $model );

		$this -> client = new BitrixApi();

		if( !$this -> client -> isReady() ){
			sj([ 'error' => 1, 'data' => false ]);
			die();
		}
	}
	

	private static function err( $msg = null, $action=" -- ", $data = null ){
			$out = [ 'error' => 1, 'data' => $data, 'message' => $msg ];
			// PJLogger::log( $action, $out );
			return sj( $out );
	}

	private static function resolve( $data = null ){
			$out = [ 'error' => 0, 'data' => $data ];
			//PJLogger::log( $action, $out );
			return sj( $out );
	}

	////////////////////////////////////////////////////////////

	public function action_get_user(){
		$res = $this -> client -> getUser( Input::request("phone") );
		if( $res && isset($res['error']) )
			return sj($res);

		return sj([ 'error' => 1, 'data' => $res ]);
	}

	public function action_get_catalog(){
		$res = $this -> client -> getCatalog( Input::request("user_id") );
		if( $res && isset($res['error']) )
			return sj($res);

		return sj([ 'error' => 1, 'data' => $res ]);
	}

	public function action_solve(){
		$res = $this -> client -> solve( Input::request("id") );
		if( $res && isset($res['error']) )
			return sj($res);

		return sj([ 'error' => 1, 'data' => $res ]);
	}

}
