<?php

class PaymentController extends Controller
{

		public function action_index()
		{
			$pinpad = Settings::get('pinpad_status') === '1';
		
			$cash = Settings::get("cash_status");
			if( $cash !== '0' && $cash !== "1"){
				$cash = 1;
			} else {
				$cash = $cash === "1";
			}

			$this->view->generate(
				'choose_view',
				'template_view',
				[
					'pinpad' => $pinpad,
					'cash' => $cash,
					'preloader' => true,
				],
				[
					'scripts' => ['Model'],
				]
			);
		}

		public function action_cash()
		{
			// Settings::get('cash_status') !== '1'

			$b2b = Settings::getMany(["cashcodeSMNoticeLevel", "cashcodeSMDisableLevel"]);

			$out = [];
			if( !$b2b ) $out = null;
			else {
				if( isset($b2b['cashcodeSMNoticeLevel']) ) $out['notice'] = intval($b2b['cashcodeSMNoticeLevel']);
				if( isset($b2b['cashcodeSMDisableLevel']) ) $out['error'] = intval($b2b['cashcodeSMDisableLevel']);
			}

			$devices = Config::get("devices", "devices_cash");

			$this->view->generate(
				'cash_view',
				'template_view',
				[
					'preloader' => true,
					'seller' => SellerInfo::get(),
					'b2b' => $out,
					'devices' => $devices,
				],
				[
					'devices' => $devices,
					'scripts' => [
						'Model',
						'ProxyClient',
						'PaymentClass',
						'PaymentApp',
						"PayHelper",
						"Clocks"
					],
				]
			);
		}
}
