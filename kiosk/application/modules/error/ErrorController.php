<?php


class ErrorController extends Controller
{

	public function action_index(){

			$b2b = Settings::getMany(["cashcodeSMDisableLevel"]);

			$out = [];
			if( !$b2b ) $out = null;
			else {
				//if( isset($b2b['cashcodeSMNoticeLevel']) ) $out['notice'] = intval($b2b['cashcodeSMNoticeLevel']);
				if( isset($b2b['cashcodeSMDisableLevel']) ) $out['error'] = intval($b2b['cashcodeSMDisableLevel']);
			}


			$devices = Config::get("devices", "devices_error");

			$this->view->generate(
				'error_view',
				'template_view',
				[
					"b2b" => $out,
					"devices" => $devices,
				],
				[
					'devices' => $devices,
					'specific' => ['Operator'],
					'scripts' => ['Clocks'],
					
				]
			);
	}
}
