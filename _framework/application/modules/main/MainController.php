<?php

class MainController extends Controller
{
   function __construct( $model = null ){
    if( !(isset($_SERVER['REMOTE_ADDR']) && ($_SERVER['REMOTE_ADDR'] === "127.0.0.1" || $_SERVER['REMOTE_ADDR'] === "localhost" ) ) ){
      //$_SERVER['HTTP_X_FORWARDED_FOR']; // &&? 
      die();
    }
    parent::__construct( $model );
   }

	public function action_index()
	{
		$this->view->generate(
			'main_view',
			'template_view',
			[
			],
			[
			//'devices' => ['SmartHopper', "NV200"],
			//'devices' => ['JCM_RC', 'SmartHopper'],
			'specific' => ['operator']
		]);
	}

	public function action_payment()
	{
		$this->view->generate('main_view', 'template_view', [
			//'devices' => ['ECDM400', 'FPrinter', 'SmartHopper', 'CashcodeSM', 'CashcodeBNL']
		]);
	}

	public function action_printer()
	{
		$this->view->generate('main_view', 'template_view', [
			//'devices' => ['Printer', 'ECDM400']
		]);
	}

	public function action_updatetable()
	{
		if ( DB_AUTOUPDATE ) {
			dd('NOT SUPPORTED IF DB_AUTOAPDATE is true in project config');
		}

		if ( !Input::has('password') ) {
			dd('No password in query');
		}

		if ( Input::request('password') !== DB_RESET_PASS ) {
			dd('WRONG PASSWORD');
		}

		ProjectManager::delete();
	}
}
