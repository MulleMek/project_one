<?php

/**
 * makecheck
 * status - типо для проверки настроек...
 */

class NanokassaController extends Controller
{
	private $kassa = null;

	public function __construct( ){
		parent::__construct();

		if( !(isset($_SERVER['REMOTE_ADDR']) && ($_SERVER['REMOTE_ADDR'] === "127.0.0.1" || $_SERVER['REMOTE_ADDR'] === "localhost" ) ) ){
			//$_SERVER['HTTP_X_FORWARDED_FOR']; // &&?
			
			sj(["error" => 1, "data" => false, "message" => "" ]);
			die();
		}

		$this -> kassa = new NanoKassa();
		if( !$this -> kassa || !$this -> kassa -> ready ){
			sj(["error" => 1, "data" => false, "message" => "Nanokassa init err" ]);
			die();
		}
	}

	public function action_status(){
		return sj( $this -> kassa -> getStatus() );
	}

	/// должен быть флаг, при котором можно пробить тестовый чек (чтоб test = 1)
	public function action_makecheck()
	{
		$data = Input::request("data");
		if( !$data ) return sj(["error" => 1, "data" => false, "message" => "" ]);
		$data = json_decode( $data, true );
		if( !$data ) return sj(["error" => 1, "data" => false, "message" => "" ]);

		return sj( $this -> kassa -> makeCheck($data) );
	}

	public function action_checkstatus(){
		if( !Input::exists('nuid') && !Input::exists('qnuid') ) return sj(["error" => 1, "data" => false, "message" => "" ]);
		$nuid = Input::request("nuid");
		$qnuid = Input::request("qnuid");

		if( !$nuid || !$qnuid ) return sj(["error" => 1, "data" => false, "message" => "" ]);

		return sj( $this -> kassa -> statusCheck( $nuid, $qnuid ) );
	}

}
