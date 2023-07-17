var EnvironmentScenarios = ( function() {

	var self = {};

	self.scenarios = {
		NanoKassa: {
			getStatus: { 
				error: false, 
				data: {
					kassaid: "000000",
					last_check: {check_nuid: "35248693554991600330232", check_qnuid: "16003375814451129431374"},
					testmode: 0,
					vend: {check_vend_address: "Фейковый адрес расп.", check_vend_mesto: "Фейк место расположения ", check_vend_num_avtovat: "99999"}
				}, 
			},
			printFiscal: { 
				error: false, 
				data: {"check_nuid":"35048793662991603110162","check_qnuid":"16031149564445368514904","check_status":3,"check_status_info":"debug","check_name":"Кассовый чек","check_type":1,"check_kkt_operator":"https://nanokassa.ru","check_sno":0,"check_vend_address":"Тестовый адрес расположения","check_vend_mesto":"Тюмень","check_vend_num_avtovat":"99999","check_dt_unixtime":"1603110163","check_dt_ofdtime":"","check_num_fd":"999","check_num_fp":"9999999999","check_fn_num":"9282000000009999","check_site_fns":"www.nalog.ru","check_qr_code":"t=20201019T1522&s=200.00&fn=9282000000009999&i=999&fp=9999999999&n=1","check_qr_code_nano_url":"","check_qr_code_img_url":"https://nanokassa.ru/qr/qrcode.php?t=20201019T1522&s=200.00&fn=9282000000009999&i=999&fp=9999999999&n=1","check_qr_code_img_b64":"data:image/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAAHsAAAB7AQMAAABuCW08AAAABlBMVEX///8AAABVwtN+AAAACXBIWXMAAA7EAAAOxAGVKw4bAAABa0lEQVRIid2UsY2EMBBFBxE4gwYsuQ1nboltAEwD0JIz2rDkBtjMAWLue9m922g9l66FhHkBM/P1/xB90+mZFzIz68HxKQMdtYvi3dJgcZcBl9YQp9zuFj8TgxxJmfM/YM7JK5QVA2rXTLes6a/1Cih62FSeN4E+g3KcbrLxb8p/Bn1gb4/pmk8GmowGjX98jTJAtgw3qGOkZ6dV0ITjFpK3umFNMlD0UGaxsQnpFALUtBH2GV27y0CnEkx33/h07KVAT5vuLN02KSBn7vnoQ+zo6rQOeo5jCVC7hpeDaoDIID1TgI8iyUCniupQEfPtMlA6ZeMdrPSyYA3g3cNxNiJJXgZIJRRkdKoOEgLY0+k+m3uQgp4Th2NQ5bLIQJGEzLohCi9NawA+LTNZWPWSsA7KLrRYVGah35VTA1hsm1k5PnwhBd5G2IFDe4rBDFM7hPuKqQBgF25YhFDxGY8qgB5rPgYCaxcZ+J7zAwVyOZX3zSecAAAAAElFTkSuQmCC","check_itog":"20000","status_code":"","error_code":""}
			},
			checkStatus: { 
				error: false, 
				data: {"check_nuid":"35048793662991603110162","check_qnuid":"16031149564445368514904","check_status":3,"check_status_info":"debug","check_name":"Кассовый чек","check_type":1,"check_kkt_operator":"https://nanokassa.ru","check_sno":0,"check_vend_address":"Тестовый адрес расположения","check_vend_mesto":"Тюмень","check_vend_num_avtovat":"99999","check_dt_unixtime":"1603110163","check_dt_ofdtime":"","check_num_fd":"999","check_num_fp":"9999999999","check_fn_num":"9282000000009999","check_site_fns":"www.nalog.ru","check_qr_code":"t=20201019T1522&s=200.00&fn=9282000000009999&i=999&fp=9999999999&n=1","check_qr_code_nano_url":"","check_qr_code_img_url":"https://nanokassa.ru/qr/qrcode.php?t=20201019T1522&s=200.00&fn=9282000000009999&i=999&fp=9999999999&n=1","check_qr_code_img_b64":"data:image/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAAHsAAAB7AQMAAABuCW08AAAABlBMVEX///8AAABVwtN+AAAACXBIWXMAAA7EAAAOxAGVKw4bAAABa0lEQVRIid2UsY2EMBBFBxE4gwYsuQ1nboltAEwD0JIz2rDkBtjMAWLue9m922g9l66FhHkBM/P1/xB90+mZFzIz68HxKQMdtYvi3dJgcZcBl9YQp9zuFj8TgxxJmfM/YM7JK5QVA2rXTLes6a/1Cih62FSeN4E+g3KcbrLxb8p/Bn1gb4/pmk8GmowGjX98jTJAtgw3qGOkZ6dV0ITjFpK3umFNMlD0UGaxsQnpFALUtBH2GV27y0CnEkx33/h07KVAT5vuLN02KSBn7vnoQ+zo6rQOeo5jCVC7hpeDaoDIID1TgI8iyUCniupQEfPtMlA6ZeMdrPSyYA3g3cNxNiJJXgZIJRRkdKoOEgLY0+k+m3uQgp4Th2NQ5bLIQJGEzLohCi9NawA+LTNZWPWSsA7KLrRYVGah35VTA1hsm1k5PnwhBd5G2IFDe4rBDFM7hPuKqQBgF25YhFDxGY8qgB5rPgYCaxcZ+J7zAwVyOZX3zSecAAAAAElFTkSuQmCC","check_itog":"20000","status_code":"","error_code":""}
			}

		},

		Kaznachey: {
			start: {
				error: false
			},

			printFiscal: {
				error: false
			},
			printStrings: {
				error: false
			},

			getXorder: {
				error: false
			},

			getZorder: {
				error: false
			},
			openSession: {
				error: false
			},

			fn_info: {"ffdVersion":"1.05","fnFfdVersion":"1.0","livePhase":"fiscalMode","numberOfRegistrations":1,"registrationsRemaining":29,"serial":"9280440300787386","validityDate":"2021-10-08T00:00:00+03:00","warnings":{"criticalError":false,"memoryOverflow":false,"needReplacement":false,"ofdTimeout":false,"resourceExhausted":false}},
			last_document: {cmd:"LASTDOCUMENT",day:19,document_num:495,fiscal_sign:"4068253588",hour:14,minute:9,month:5,second:0,year:120},		
			last_receipt: {cmd:"LASTRECEIPT",day:19,document_num:495,fiscal_sign:"4068253588",hour:14,minute:9,month:5,receipt_sum:1,receipt_type:2,second:0,year:120},
		},
		Printer: {
			start: {
				error: false
			},

			print: {
				error: false
			},
			fakeStatusCode: {
				message: "0x00000000 Принтер готов", codes: [0], code: 0, critical: false,
			},
		},
		CashcodeSM: {
			start: {
				error: false
			},

			insert: {
				error: false,
				data: [100],
				timeouts: {
					start: 1,
					interval: 5
				}
			}
		},
		MEI: {
			start: {
				error: false
			},

			insert: {
				error: false,
				data: [],
				timeouts: {
					start: 0.3,
					interval: 2
				}
			}
		},
		SmartHopper: {
			start: {
				error: false,
				data: [
					{ value: 0.5, count: 0, dispensable: true },
					{ value: 1, count: 6, dispensable: true },
					{ value: 2, count: 0, dispensable: true },
					{ value: 5, count: 8, dispensable: true },
					{ value: 10, count: 5, dispensable: true },
				]
			},
			dispense: {
				error: false,
				partial: false
			},
			insert: {
				error: false,
				data: [10, 5],
				timeouts: {
					start: 15,
					interval: 1
				}
			}
		},

		LCDM200: {
			start: {
				error: false
			},

			status_string: "StEr4c_UpNotEx0_UpNearend1_LoNotEx0_LoNearend1_RejNotEx1_",
			status_string: "StEr31_UpNotEx0_UpNearend0_LoNotEx0_LoNearend0_RejNotEx0_",

			dispense: {
				error: false,
				partial: false
			}
		},

		Uniteller: {
			start: {
				error: false
			},

			payment: {
				error: false,
			}
		},

		PinPad: {
			start: {
				error: false
			},

			delay: 1,
			error: {
				user: false, 			//пользовательская ошибка
				card: false, 			//ошибка после фейкового вставления карты
				critical: false,	//ошибка терминала
			}
		},

		EFTPOS: {
			start: {
				error: false,
				timeout: 1000,
			},
			payment: {
				error: false,
				timeout: 2000,
			},
			cancel: {
				error: false,
				timeout: 2000,
			},
		},
		
		Vendotek: {
			start: {
				error: false
			},
			payment: {
				data: {"cmd":"make","code":"00","description":"successful payment"},
			},
			cancel: {
				data: {"cmd":"abort","code":"12","description":"the current operation is interrupted"},
			},
		},


	};

	return {
		get: function() { return self; },
	};
})();
