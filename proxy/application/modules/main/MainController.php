<?php
class MainController extends Controller
{

	public function __construct( ){
		parent::__construct();

		if( !(isset($_SERVER['REMOTE_ADDR']) && ($_SERVER['REMOTE_ADDR'] === "127.0.0.1" || $_SERVER['REMOTE_ADDR'] === "localhost" ) ) ){
			//$_SERVER['HTTP_X_FORWARDED_FOR']; // &&?
			
			sj(["error" => 1, "data" => false, "message" => "" ]);
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

	public function action_serial()
	{
		if( !Input::exists("uid") ) return self::err();

		$is_carrier = Input::exists("is_carrier") && Input::request('is_carrier');

		if( $is_carrier ){
			$out = [
				'external_number' => Variables::get('external_number_carrier'),
				'external_serial' => Settings::get('ExternalSerialCarrier'),
				'is_carrier' => true
			];

			if( !$out['external_number'] ){
				$out['external_number'] = 1;
			}

			if( !$out['external_serial'] ){
				$out['external_serial'] = 'T2';
				Settings::set('ExternalSerialCarrier', 'T2');
			}

			Variables::set( 'external_number_carrier', $out['external_number'] + 1 );
		} else {
			$out = [
				'external_number' => Variables::get('external_number'),
				'external_serial' => Settings::get('ExternalSerial'),
				'is_carrier' => false,
			];

			if( !$out['external_number'] ){
				$out['external_number'] = 1;
			}

			if( !$out['external_serial'] ){
				$out['external_serial'] = 'T1';
				Settings::set('ExternalSerial', 'T1');
			}
			Variables::set( 'external_number', $out['external_number'] + 1 );
		}

		if( Input::exists("org_id") ){
			$out['org'] = SellerInfo::getOrganization( intval(Input::request("org_id")) );
		}

		return self::resolve($out);
	}

}

