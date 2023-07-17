<?php
class TicketController extends Controller
{
   
   function __construct( $model = null ){
      if( !(isset($_SERVER['REMOTE_ADDR']) && ($_SERVER['REMOTE_ADDR'] === "127.0.0.1" || $_SERVER['REMOTE_ADDR'] === "localhost" ) ) ){
         //$_SERVER['HTTP_X_FORWARDED_FOR']; // &&? 
        	if( !defined("IS_DEVELOPER_ON") || !IS_DEVELOPER_ON ){
				die();
			}
      }
      parent::__construct( $model );
   }

	public function action_webkassa_fiscal()
	{
		$json = file_get_contents('php://input');
		$data = json_decode($json, 1);
		if(!$data){
			$data = [
					"_PaymentData" => [
						"Positions" => [[
							 "Count" => 10,
							 "Price" => 2000,
							 "PositionName" => "Тестовая услуга",
							 "UnitCode" => 796,
							 "TaxType" => 100,
							 "Discount" => 1000,
							 "Markup" => 1,
							 "Tax" => 2035.71
						],
						[
							 "Count" => 10,
							 "Price" => 2000,
							 "PositionName" => "Тестовая услуга",
							 "UnitCode" => 796,
							 "TaxType" => 100,
							 //"Discount" => 1000,
							 "Markup" => 1,
							 "Tax" => 2035.71,
							 "IsStorno" => true,
							 "DiscountDeleted" => true,
							 "MarkupDeleted" => true,
						],[
							 "Count" => 10,
							 "Price" => 2000,
							 "PositionName" => "Тестовая услуга",
							 "PositionCode" => "test code",
							 "SectionCode" => "test section",
							 "UnitCode" => 112,
							 "TaxType" => 0,
							 "Discount" => 1000,
							 "Markup" => 1,
							 "Tax" => 0,
							 "IsStorno" => true,
							 
						]
						],
						"Payments" => [[
								"Sum" => 19000,
								"PaymentType" => 1
							],
							[
								"Sum" => 1,
								"PaymentType" => 2
							]],

						"TicketModifiers" => [[
								"Text" => "Тестовая скидка",
								"Sum" => 1,
								"Type" => 1,
								"Tax" => 1,
								"TaxType" => 101,
							],
							[
								"Text" => "Тестовая наценка",
								"Sum" => 1,
								"Type" => 2,
								"Tax" => 0,
								"TaxType" => 0,
							]],
						"Change" => 0,
						"RoundType" => 2,
						"CustomerEmail" => "SOME EMAIL",
						"ExternalCheckNumber" => "op-1558966625",
						"OperationType" => 2
					],
					"CheckNumber" => "3645220102",
					"DateTime" => "27.05.2019 20:16:46",
					"OfflineMode" => true,
					"CashboxOfflineMode" => true,
					"Cashbox" => [
						"UniqueNumber" => "SWK00030725",
						"RegistrationNumber" => "0000620100030725",
						"IdentityNumber" => "2307",
						"Address" => "г. Астана, пр.Республики 25, оф.7"
					],
					"_TaxPayer" => [
						"Name" => "Кофейня Angel-in-us",
						"IN" => "090540008881",
						"VAT" => true,
						"VATSeria" => "12345",
						"VATNumber" => "1234567",
					],
					"_OFD" => [
						"Name" => "АО КАЗАХОфд",
						"Url" => "ofd.kz"
					],
					"cmd" => [
						"Нефискальные",
						"Строки",
						"Для",
						"Печати",
					],
					"CheckOrderNumber" => 1,
					"ShiftNumber" => 46,
					"EmployeeName" => "ИвановА ИвановА Иван",
					"TicketUrl" => "https://kkm.webkassa.kz/Ticket?chb=SWK00030725&extnum=op-1558966625"
				];
		}

		$out = $data;

		if( isset($out['_PaymentData']) && $out['_PaymentData'] ){
			$out['_PaymentData']['_Total'] = 0;
			$out['_PaymentData']['_TotalVat'] = [];

			if( isset($out['_PaymentData']['Positions']) && $out['_PaymentData']['Positions'] ){
				foreach ($out['_PaymentData']['Positions'] as $i => $val) {
					$out['_PaymentData']['Positions'][$i]['_Total'] = $val['Count'] * $val['Price'];
					if( isset( $val['Discount']) && $val['Discount'] && (!isset($val['DiscountDeleted']) || !$val['DiscountDeleted']) )
						$out['_PaymentData']['Positions'][$i]['_Total'] -= $val['Discount'];
					if( isset( $val['Markup']) && $val['Markup'] && (!isset($val['MarkuptDeleted']) || !$val['MarkupDeleted']) )
						$out['_PaymentData']['Positions'][$i]['_Total'] += $val['Markup'];

					if( isset($val['IsStorno']) && $val['IsStorno'] ) continue;

					if( isset($val['Tax']) && $val['Tax'] && $val['TaxType']){
						if( !isset($out['_PaymentData']['_TotalVat'][$val['TaxType']]) ) $out['_PaymentData']['_TotalVat'][$val['TaxType']] = 0;
						$out['_PaymentData']['_TotalVat'][$val['TaxType']] += $val['Tax'];
					}

					$out['_PaymentData']['_Total'] += $out['_PaymentData']['Positions'][$i]['_Total'];
				}
			}

			$out['_PaymentData']['_TotalPay'] = $out['_PaymentData']['_Total'];
			if( isset( $out['_PaymentData']['TicketModifiers']) )
				foreach ($out['_PaymentData']['TicketModifiers'] as $val) {
					if( isset($val['Tax']) && $val['Tax'] && $val['TaxType']){
						if( !isset($out['_PaymentData']['_TotalVat'][$val['TaxType']]) ) $out['_PaymentData']['_TotalVat'][$val['TaxType']] = 0;
						$out['_PaymentData']['_TotalVat'][$val['TaxType']] += $val['Tax'];
					}
		
					if( $val['Type'] === 1 ) $out['_PaymentData']['_TotalPay'] -= $val['Sum'];
					else $out['_PaymentData']['_TotalPay'] += $val['Sum'];
				}
		}

		$this->view->generate('webkassa_fiscal_view.php', 'base_ticket_view.php', 
			[
				'Currency' => $this->model->webkassa_currency(),
				'Types' => $this->model->webkassa_getTypes(),
				'Model' => $this->model,
				'data' => $out,
			]
		);
	}

	public function action_simple_fiscal()
	{
		$json = file_get_contents('php://input');
		$data = json_decode($json, 1);
		if(!$data){
			$data = [
				"PaymentData" =>	[
						"goods" => [
							[
								"price" => "2.2",
								"quantity" => 2,
								"name" => "Тестовая услуга",
								"description" => "ТестовоеТестовое Тестовое Тестовое Тестовое Тестовое  описание услуги",
								"dep" => "Дом быта > Ремонт обуви > Мужская обувь > Замена стельки",
							//	"code" => "111.123",
							]
						],
						"operation" => "sale",
						"sum" => 10,
						"paymentType" => 0,
						"inserted" => 10,

						"change" => 5.60,

						"address" => "+79051234567",		//??
						"external_number" => "000144", 	//?
						"external_serial" => "T1",
						"cmd" => [  ],		///"Cчет №123123", " "

						"date_time" => "27.07.2019 20:16:46",
						//"check_number" => "0", //?

						//"carrier" => true,
						"change" => 0,
						"dispensed" => 0,
						"qr_code" => "t=20200619T140900&s=1.00&fn=9280440300787386&i=495&fp=4068253588&n=2",
						"date_time"=> "19.06.2020 14:09",
						"fn_num"=> "9280440300787386",
						"num_fd"=> 495,
						"num_fp"=> "4068253588",
						"vend_address"=> "Дубна",
						"vend_mesto"=> "Колонка 1",
						"vend_num_avtovat"=> "02",
						"kkt_operator"=> "ofd.kontur.ru",
						"site_fns"=> "nalog.ru",
						"sno"=> "ПСО"
				],
				"SellerData" => [
					"TerminalID" => "00001",
					"TerminalAddress" => "Пролетарский проспект 20к2",
					"Name" => "ИП Войтенко М.А.",
					"INN" => "772481803005",
					"OGRNIP" => "310774610600438",
					"WorkHours" => "Часы 123 123",
					"Address" => "115477, Пролетарский проспект 20к2",
					
					"Phone" => "+7906-081-77-47",
					"Email" => "db-com@bk.ru",
					"Site" => "www.домбыта.com",
					"Instagram" => "dom_bita.lm",

					"CmdBefore" => [ ], //// "Строка для печати до" 
					"CmdAfter" => [ ], /// "Спасибо!" 

					"img" => "depstore"
				],
				"Type" => [
					"header" => "Копия",
					// "id" => 0,
					// "name" => "Test"
				]
			];
		}

		$out = $data;

		if( isset($out['PaymentData']) && $out['PaymentData'] ){
			//$out['PaymentData']['Total'] = 0;
			//$out['PaymentData']['Total'] = [];

			if( isset($out['PaymentData']['goods']) && $out['PaymentData']['goods'] ){
				foreach ($out['PaymentData']['goods'] as $i => $val) {
					$out['PaymentData']['goods'][$i]['_Total'] = $val['quantity'] * $val['price'];
					if( isset( $val['discount']) && $val['discount']  )
						$out['PaymentData']['goods'][$i]['_Total'] -= $val['discount'];
					
					//if( isset($val['IsStorno']) && $val['IsStorno'] ) continue;

					//// НУЖНО еще посчитать сколько ндс выходит в рублях, если будет
					// if( isset($val['Tax']) && $val['Tax'] && $val['TaxType']){
					// 	if( !isset($out['_PaymentData']['_TotalVat'][$val['TaxType']]) ) $out['_PaymentData']['_TotalVat'][$val['TaxType']] = 0;
					// 	$out['_PaymentData']['_TotalVat'][$val['TaxType']] += $val['Tax'];
					// }

					//$out['PaymentData']['_Total'] += $out['_PaymentData']['Positions'][$i]['_Total'];
				}
			}

			// $out['_PaymentData']['_TotalPay'] = $out['_PaymentData']['_Total'];
			// if( isset( $out['_PaymentData']['TicketModifiers']) )
			// 	foreach ($out['_PaymentData']['TicketModifiers'] as $val) {
			// 		if( isset($val['Tax']) && $val['Tax'] && $val['TaxType']){
			// 			if( !isset($out['_PaymentData']['_TotalVat'][$val['TaxType']]) ) $out['_PaymentData']['_TotalVat'][$val['TaxType']] = 0;
			// 			$out['_PaymentData']['_TotalVat'][$val['TaxType']] += $val['Tax'];
			// 		}
		
			// 		if( $val['Type'] === 1 ) $out['_PaymentData']['_TotalPay'] -= $val['Sum'];
			// 		else $out['_PaymentData']['_TotalPay'] += $val['Sum'];
			// 	}
		}

		$view = 'simple_fiscal_view.php';
		// if( isset( $data['PaymentData']['carrier'] ) && $data['PaymentData']['carrier'] ){
		// 	$view = 'simple_fiscal_carrier_view';
		// }

		$this->view->generate( $view, 'base_ticket_view.php', 
			[
				'Currency' => $this->model->simple_currency(),
				'Types' => $this->model->simple_getTypes(),
				'Model' => $this->model,
				'data' => $out,
			]
		);
	}

	public function action_simple_non_fiscal()
	{
		$json = file_get_contents('php://input');
		$data = json_decode($json, 1);

		$out = $data;

		if( isset($out['PaymentData']) && $out['PaymentData'] ){
			
			if( isset($out['PaymentData']['goods']) && $out['PaymentData']['goods'] ){
				foreach ($out['PaymentData']['goods'] as $i => $val) {
					$out['PaymentData']['goods'][$i]['_Total'] = $val['quantity'] * $val['price'];
					if( isset( $val['discount']) && $val['discount']  )
						$out['PaymentData']['goods'][$i]['_Total'] -= $val['discount'];
					
				}
			}
		}
		
		$this->view->generate( 'simple_non_fiscal_view.php', 'base_ticket_view.php', 
			[
				'Currency' => $this->model->simple_currency(),
				'Types' => $this->model->simple_getTypes(),
				'Model' => $this->model,
				'data' => $out,
			]
		);
	}

	public function action_simple_strings()
	{
		$json = file_get_contents('php://input');
		$data = json_decode($json, 1);
		if(!$data){
			$data = [
				"StringsData" =>	[
					" ", 
					"                   Инкассация CashcodeSM", 
					" ", 
					"                    Имя Отчество Фамилия", 
					"                        06.09.2019 13:07", 
					" ", 
					"                          10р.        x0", 
					"                          50р.      x999", 
					"                          100р.       x0", 
					"                          200р.       x0", 
					"                          500р.       x0", 
					"                          1000р.      x0", 
					"                          2000р.      x0", 
					"                          5000р. x100000", 
					" ", 
					"                           Итого 57800р.", 
					" "
				],
				"SellerData" => [
					"TerminalID" => "00001",
					"TerminalAddress" => "Пролетарский проспект 20к2",
					"Name" => "ИП Войтенко М.А.",
					"INN" => "772481803005",
					"OGRNIP" => "310774610600438",
					"Address" => "115477, Пролетарский проспект 20к2",
					
					"Phone" => "+7906-081-77-47",
					"Email" => "db-com@bk.ru",
					"Site" => "www.домбыта.com",
					"Instagram" => "dom_bita.lm",

					"CmdBefore" => [ ], //// "Строка для печати до" 
					"CmdAfter" => [ ], /// "Спасибо!" 
				],
			];
		}

		$out = $data;

		$this->view->generate('simple_strings_view.php', 'base_ticket_view.php', 
			[
				'Model' => $this->model,
				'data' => $out,
			]
		);
	}

	public function action_test()
	{
		$this->view->generate('test.php', 'base_ticket_view.php', 
			[
				'data' => json_decode('
											{
												"inserted":1100,
												"sync_error":false,
												"id": 1,
												"user_name":"Api Test Student",
												"user_phone":"+7 (999) 999-99-99",
												"insertList":{"100":2,"200":2,"500":1},
												"affiliate_name": "ELC Almaty the Left Side"
											}', 1)
			]
		);
	}


}
