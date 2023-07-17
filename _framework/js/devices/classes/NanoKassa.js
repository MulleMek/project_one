/*
*     data = {
*        goods: [
*           {
*              name: 'ИМЯ1',
*              price: 10,
*              quantity: 2,
*              // depart: 1      /// Номер отдела. Если не передаем, то не печатает /// Не используется
*              discount: 2,	/// Скидка или надбавка (если отриц)  //// лучше не использовать, т.к. не в реале носит информационный характер
*              						/// !!! - не учитывается при расчете суммы - !!!!!!!
*                    				/// Носит информационный характер, т.к. фнс пофигу на наши скидки надбавки
*                    			 	/// Поэтому price должен быть уже с учетом всех скидок !!!!!!!
*
* 
*              tax: 2,4,5,6,7,8  ///   Если не указано, то Без НДС.  (автоматом подставит tax: Без НДС через Environment указываю ID (либо 5, либо 6))
*                                ///   Если что, можно посмотреть какой порядок налогов отображается в ДТО, но хотя там вроде список немного с другим порядком
*                                ///   Либо в ДТО10 в разделе печати чека, либо Параметры Оборудования - Налоги - Наименования налогов
*                                ///   типо 		2 - 10 %
*	                                    			4 - 10/110
*	                                       		5 - 0 %
*                                          		6 - Не облагается
*	                                           	7 - 20 %
*	                                            	8 - 20/120
*                                      если в этом случае вдруг отправим tax: 7, то будет использован 20% вместо 18%
*              itemtype: 1,		/// Предмет расчета (если не указан, то берет зн. по-умолчанию из настроек кассы)
*              						/// Список может меняться взависимости от прошивки (default - 1 - Товар)
*              						/// самый надежный вариант, проверить список в ДТО10 в режиме печати чека (выпадающее меню)
*                    						1 - ТОВАР
*                    						2 - ПОДАКЦИЗНЫЙ ТОВАР
*                    						3 - РАБОТА 
*                    						4 - УСЛУГА 
*                    						9 - ПРЕДОСТАВЛЕНИЕ РИД 
*                    						10 - ПЛАТЕЖ - ВЫПЛАТА 
*                    						11 - СОСТАВНОЙ ПРЕДМЕТ РАСЧЕТА
*                    						12 - ИНОЙ ПРЕДМЕТ РАСЧЕТА
* 
*              paymentMode: 4,	/// Признак способа расчета (так же, если не указан, то берет зн. по-умолчанию)
*              						/// Список так же может меняться взависимости от прошивки (default - 4 - Полный расчет)
*              					 	/// Может понадобиться при явном указании что это будет - 3-Авансовый (itemtype: 10-платеж)
*                     					 	1 - ПРЕДОПЛАТА 100%
*                            				2 - ПРЕДОПЛАТА
*	                               		3 - АВАНС
*	                                 	4 - ПОЛНЫЙ РАСЧЕТ
*	                                  	5 - ЧАСТИЧНЫЙ РАСЧЕТ 
*	                                   	6 - ПЕРЕДАЧА В КРЕДИТ
*	                                    7 - ОПЛАТА КРЕДИТА
*           }
*        ],
*        // discount: 0,      // не используется, после нового закона, тут мб округление в районе рубля (типо скинуть копейки), но лучше не использовать
*        sum: 18,
*        operation: sale,  // продажа или возврат, расход или возврат расхода
*                          // sale, ret, buy, buyret // при расходе или возврате расхода дополнительно идет проверка находящейся наличности в терминале 
* 
*        paymentType: 0/1/2/3, // 0 платежи наличными, 
*                              // 1 Безналичными
*                              // 2 Предварительная оплата (Аванс)
*                              // 3 Последующая оплата (кредит)
*                              // 4 Иная форма оплаты (встречное предоставление )
*                              //////// СПИСОК МОЖЕТ МЕНЯТЬСЯ ИЗ-ЗА законодательства/прошивки
*        inserted: 1000,		 /// сколько было внесено через paymentType 0,1,2,3 ...
*        ///// теперь есть возможность вместо двух полей указать платежи массивом
*        ///// может понадобиться с авансами
*        payments: [
*					{ paymentType: 0, inserted: 2.90 },		/// наличными 2.90
*					{ paymentType: 2, inserted: 9.10 },		/// предоплатой 9.10
*			],
*
* 
* 			address: some@email.com или 79055553535
* 
*     }
*
*	//// ответ с результатом
*	{ 
*		"nuid":"35453883455991598868684",
*		"qnuid":"15988729364438884379482",
*		"status":3,
*		"status_info":"debug",
*		"name":"Кассовый чек",
*		"type":1,
*		"kkt_operator":"https://nanokassa.ru",
*		"sno":0,
*		"vend_address":"Тестовый адрес расположения",
*		"vend_mesto":"Тестовое место расположения ",
*		"vend_num_avtovat":"99999",
*		"dt_unixtime":"1598868685",
*		"dt_ofdtime":"",
*		"num_fd":"",
*		"num_fp":"",
*		"fn_num":"",
*		"site_fns":"www.nalog.ru",
*		"qr_code":"t=20200831T1311&s=1.00&fn=9282000000009999&i=999&fp=9999999999&n=1",
*		"qr_code_nano_url":"",
*		"qr_code_img_url":"https://nanokassa.ru/qr/qrcode.php?t=20200831T1311&s=1.00&fn=9282000000009999&i=999&fp=9999999999&n=1",
*		"qr_code_img_b64":"data:image/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAAHsAAAB7AQMAAABuCW08AAAABlBMVEX///8AAABVwtN+AAAACXBIWXMAAA7EAAAOxAGVKw4bAAABXklEQVRIid3UMa6EIBAG4NlQ2OkFSLgGHVfSC7ByAb0SHdcg4QLaWRD/N6y7ea9zXrvERPIVDMwMEH3TGIAVZo/ZO5wy6EnNHXaoxfJcBq6EZELU3mIRw+zUaXmNf0GdUL0cSHHY9Sh/tn4DnI/Flvb9JugGmkU+3xVTBEMqIQLRnJ+wt/CIurdqPWiKWQpQO4eFJqtHIST+c8oVDjPLgMjwNBzY4ycfd/A49GgzORqd2qRgrl4IyKMMeksjYaMCLq8MHgcWl4dUp3et7oGcnsAlah00yoCzfrawZk/Zy4BsfkL7Lnt71fYeBhhATy3xYkj1Gesz8TUtmwx6p2bHYdXWmUUIVntX+VjPhFkGA1RAnWIBrqzfw2sZE8AxM8mAb3bg86XaWym0t9C1bX7WEIAra2xNPaD2ckhYk1rjO0ESCCDvzNmZUwjtWhfuuOEgL4PXW4ilq9SVWQbfM34A0uFmKYxk2gQAAAAASUVORK5CYII=",
*		"itog":"100",
*		
*		"status_code":"",
*		"error_code":""
*	}
*
*  https://nanokassa.ru/integration/documentation/code-errors/
*
*  были ситуации когда прихоидт check_status(или status_code) - 01 - фиск, QR код тоже получаем
*  а вот допом еще прихоидт error_code 16
*/

//// HELPER в зависимостях....

function NanoKassa( options, eventManager, Logger ) {

	var _url_prefix  = Environment.get("domains.services") + '/nanokassa/';
	var _urls = { 
		makecheck: 'makecheck',
		status: 'status',
		checkstatus: 'checkstatus'
	};
	Object.keys(_urls).forEach( e => _urls[e] = _url_prefix + _urls[e] );

	var _cache = {
		REPORT: null,
		started: null,
	};

	//options.disableFiscalCheck = true;
	if(options.defaultTax === void 0) options.defaultTax = 6;						///	 без НДС
	if(options.defaultItemType === void 0) options.defaultItemType = 1;			/// 	 Товар ('Реализуемый товар, за исключением подакцизного товара (1)')
	if(options.defaultPaymentMode === void 0) options.defaultPaymentMode = 4;  ///    Полный расчет ('Полная оплата, в том числе с учетом аванса (предварительной оплаты) в момент передачи предмета расчета')
	if(options.defaultUserEmail === void 0) options.defaultUserEmail = 'noreply@usrbb.ru';
	options.disableFiscalCheck = true;
	//if(options.rezhim_nalog === void 0) options.rezhim_nalog = "";
	//if(options.kassir_inn === void 0) options.kassir_inn = "";
	//if(options.kassir_fio === void 0) options.kassir_fio = "";
	//if(options.kassaIndex === void 0 ) options.kassaIndex = null;	 

	
	if(options.isFake) _debug('NanoKassa находится в фейковом режиме');

	options.firstStatusTimeout = 7000;
	options.secondStatusTimeout = 10000;
	

	const additional_fields = ['priznak_agenta', 'phone_oper_perevoda', 'operation_plat_agenta', 'phone_plat_agenta', 'phone_oper_priem_plat', 'name_oper_perevoda', 'address_oper_perevoda', 'inn_oper_perevoda', 'phone_postavshika', 'name_postavshika'];
	options.disableAdditionalFields = true;		// не работаем с доп. полями (аля признак агента) в объекте goods


	//$.ajax({asd}).done().fail();
	function sendRequest(url, data, events) { 
		if( options.kassaIndex && data ) ( _log(0, "Apply Kassa Index", options.kassaIndex), data.kassaIndex = options.kassaIndex );
		return new Promise( (resolve, reject) => Helper.ajax(url, data, events).done( resolve ).fail( reject ) ); 
	};
	function raiseError(events, text) { return new Promise( (res, rej) => setTimeout( (e,t) => (eventManager.publish(e,t), rej(t) ), 100, events.fail, text) ); };
	function raiseFake(events, data) { return new Promise( (res, rej) => setTimeout( (e,t) => (eventManager.publish(e,t), res(t) ), 500, events.done, data) ); };
	function _timeout( t, data){ return new Promise( res => setTimeout(res, t, data) ); };
	function _debug( msg, ...data ){ if( options.debug ) console.log( options.deviceName, msg, ...data ); };
	function _log( type, msg, ...data ){
		switch (type) {
			case -1: type = "<-----"; break;
			case 1:  type = "----->"; break;
			default: type = "------"; break;
		}
		return Logger.log( [type, options.deviceName, msg, JSON.stringify([...data]) ].join(" ") );
	};

	const ERRORS = { };

	function onStart(data) {

		if( !data ) {
			return eventManager.publish(options.events.start.fail, "Ошибка при запросе статуса кассы - касса не сконфигурирована");
			//throw "empty data..."; 
		}

		_cache.REPORT = data;
		_cache.REPORT.testmode = Number(_cache.REPORT.testmode);
		
		var errors = []; // errors

		if ( !options.disableFiscalCheck && _cache.REPORT.testmode ) errors[errors.length] = "Касса находится в тестовом режиме";

		if ( errors.length )
			return eventManager.publish(options.events.start.fail, errors.join(", "));

		_cache.started = true;
		return eventManager.publish(options.events.start.done);
	};

	/* starting .... */
	(function(){
		getStatus()
			.then( onStart )
			.catch( (data) => {
				console.error(data);
				eventManager.publish(options.events.start.fail, "Ошибка конфигурации" );
			});
	})();

	/****************/
	//// PRIVATE

	//////////////////////////////////////
	/// НДС
	const tax_map = {
		2: 2,		// 10 %
		4: 4,		// 10/110
		5: 5,		// 0 %
		6: 6,		// Не облагается
		7: 1,		// 20 %
		8: 3,		// 20/120
	};

	function getTax( our_tax ){ return tax_map[Number(our_tax)] || 6; };

	const sale_map = {
		'sale': 	1,
		'ret': 	2,
		'buy': 	3,
		'buyret': 4,
	};
	function getSaleType( type ){ return sale_map[type] || 1; };

	const payments_map = {
		0: 'money_nal',
		1: 'money_electro',
		2: 'money_predoplata',
		3: 'money_postoplata',
		4: 'money_vstrecha',
	};
	function pushPayment( obj, type, inserted ){
		let k = payments_map[type] || 'money_nal';
		if( !obj[k] ) obj[k] = inserted;
		else obj[k] += inserted;
		return obj;
	};

	function round( sum, count ){
		if( !(count >=0) ) count = 0;
		count = 10 ** count;
		return Math.round( sum * count ) / count;
	};

	function simplify( check_data ){
		let out = {};
		Object.keys(check_data).forEach( k => out[k.replace("check_","")] = check_data[k] );

		delete out['qr_code_img_b64'];
		delete out['qr_code_img_url'];
		// delete out['qr_code_nano_url'];	/// ссылка для проверки чека		
		return out;
	};

	//////////////////////////////////////////////////////////
	///	Подготовка объекта для отправки на сервер
	/// 
	function checkAndPrepareData( data ){
		_debug( "Obj to print", data);
		_log(0, "Obj to print", data);

		let result = {
			// check_send_type:
			// oplata_arr:
			// itog_arr:
			// products_arr:
		};

		if( !data ) throw "Empty data";
		if( !Array.isArray(data.goods) || !data.goods.length ) throw "Empty goods array";

		result.products_arr = data.goods.map( e => {
			let good = {
				name_tovar: e.name,
				price_piece: Math.round( e.price * 100 ),
				kolvo: e.quantity,
				
				priznak_agenta: "none",
			};

			if( e.discount ){
				good.skidka = e.discount * 100;
				good.price_piece_bez_skidki = good.price_piece + Math.round( good.skidka / e.quantity );
			}

			good.stavka_nds = getTax(e.tax || options.defaultTax),
			good.summa = Math.round( good.price_piece * good.kolvo );
			good.priznak_predmeta_rascheta = e.itemtype || options.defaultItemType;
			good.priznak_sposoba_rascheta = e.paymentMode || options.defaultPaymentMode;

			//// проходимся по допполям, если фича включена
			if( !options.disableAdditionalFields ){
				additional_fields.forEach( k => {
					if( e[k] ) goods[k] = e[k];
				});
			}

			return good;
		});


		result.itog_arr = {};
		result.itog_arr.priznak_rascheta = getSaleType( data.operation );
		result.itog_arr.itog_cheka = Math.round( data.sum * 100 );

		_debug(result);
		_debug(Math.round( result.products_arr.reduce( (sum, e) => sum + e.summa, 0 ) ) );

		if( !result.itog_arr.itog_cheka ) 
			result.itog_arr.itog_cheka = Math.round( result.products_arr.reduce( (sum, e) => sum + e.summa, 0) );
		else if ( result.itog_arr.itog_cheka !== Math.round( result.products_arr.reduce( (sum, e) => sum + e.summa, 0) ) )
			throw "Goods sum does not match";


		result.oplata_arr = {
			money_nal: 0,
			money_electro: 0,
			money_predoplata: 0,
			money_postoplata: 0,
			money_vstrecha: 0,

			client_email: "",
			client_phone: "",

			rezhim_nalog: "",
		};

		if( Array.isArray(data.payments) && data.payments.length ){
			data.payments.forEach( e => pushPayment( result.oplata_arr, e.paymentType, Math.round(e.inserted * 100) ) );

		} else if( data.inserted && data.paymentType !== void 0 ){
			pushPayment( result.oplata_arr, data.paymentType, Math.round(data.inserted * 100) );
			
			if( data.paymentType === 1 && result.itog_arr.itog_cheka !== Math.round(data.inserted * 100) )
				throw "Bank sum and goods sum does not match"; 

		} else {
			throw "Inserted with paymentType block does not specified";
		}

		if( !data.address ) data.address = options.defaultUserEmail;

		if( data.address.indexOf("\@") > -1 ){
			result.oplata_arr.client_email = data.address;
			result.check_send_type = "email";
		} else if( data.address.replace(/\D/g,'').length >= 10 ){
			result.oplata_arr.client_phone = data.address.replace(/\D/g,'');
			result.check_send_type = "phone";
		}

		if( options.kassir_inn ) result.oplata_arr = options.kassir_inn;
		if( options.kassir_fio ) result.kassir_fio = options.kassir_fio;

		/// debug...
		/// по идее будем как-то выставлять из настроек
		if( options.rezhim_nalog )
			result.oplata_arr.rezhim_nalog = options.rezhim_nalog;

		_debug("Result obj", result);
		_log(1, "Send check", result);

		return result;
	};


	////////////////////////////////////////
	///	готовим данные
	///	отправляем на сервер, и получаем ID в очереди или резалт (в случае если моментально напечатается)
	///	Проверяем через 5, а потом и через 7 секунд чек в очереди
	///	Если что-то пошло не так, то выдаем ошибку + если есть вариант дополнительно показываем nuid qnuid
	function printFiscal(data){
		let last_check_info = null;
		if( options.isFake ){
			if( options.scenario.printFiscal.error ) return raiseError( options.events.printFiscal );
			return raiseFake( options.events.printFiscal, simplify(options.scenario.printFiscal.data) );
		}

		return new Promise( res => res(checkAndPrepareData( data )) )
			.then( check => {

				return sendRequest( _urls.makecheck, { data: JSON.stringify(check) } );
			},
			err => {
				console.error("Error happens before PrintFiscal", err);
				throw "Prepare data error";
			})
			.then( data => {
				_log(-1, "Makecheck result", data);
				if( !data.check_nuid || !data.check_qnuid ) throw "Unknown error";
				if( data.check_qr_code ) return data;
				last_check_info = { nuid: data.check_nuid, qnuid: data.check_qnuid };

				return _timeout( options.firstStatusTimeout )
					.then( _ => statusCheck( data.check_nuid, data.check_qnuid ) )
					.then( check_data => {
						if( !check_data || check_data.check_qr_code ) return check_data;
						
						return _timeout( options.secondStatusTimeout )
							.then( _ => statusCheck( data.check_nuid, data.check_qnuid ) );
					});
			})
			.then( check_data => {
				_log(-1, "Status check result", check_data);
				if( !check_data ) throw "Empty answer error";
				if( !check_data.check_qr_code ) throw check_data;

				let out = simplify(check_data);
				eventManager.publish(options.events.printFiscal.done, out);
				return out;
			})
			.catch( error_data => {
				if( error_data && error_data.check_status_info )
					return raiseError( options.events.printFiscal, simplify(error_data) );
				
				if( last_check_info )
					return raiseError( options.events.printFiscal, last_check_info );

				console.error( error_data );
				return raiseError( options.events.printFiscal );
			});
	};


	function getStatus(){
		if( options.isFake ){
			if( options.scenario.getStatus.error ) return raiseError( options.events.getStatus, { msg: "Fake error" } );
			return raiseFake( options.events.getStatus, options.scenario.getStatus.data );
		}
		return sendRequest( _urls.status, {} );
	};	
	
	//// event возвращается только в случае ошибки или фейк режима
	//// и работаю тут только с промисом...
	function statusCheck( nuid, qnuid ){
		if( !nuid || !qnuid ) return raiseError( options.events.checkStatus, "Empty params" );

		if( options.isFake ){
			if( options.scenario.checkStatus.error ) return raiseError( options.events.checkStatus, { msg: "Fake error" } );
			return raiseFake( options.events.checkStatus, options.scenario.checkStatus.data );
		}
		return sendRequest( _urls.checkstatus, { nuid: nuid, qnuid: qnuid } );
	};

	function getLastCheckInfo(){
		if( !_cache.REPORT || !_cache.REPORT.last_check ) return raiseError( options.events.checkStatus, "Check not found" );
		return statusCheck( _cache.REPORT.last_check.check_nuid, _cache.REPORT.last_check.check_qnuid )
						.then( data => simplify(data) );
	};


	/***************************************************************/
	/* API */
	/***************************************************************/
	/* Некоторые из этих методов можно опустить и скрыть */
	this.unused = { getStatus };

	this.printFiscal = printFiscal;           // Печать Фискального чека
	this.getLastCheckInfo = getLastCheckInfo; // Проверка последнего чека в очереди, nuid qnuid берется из REPORT
	this.statusCheck = statusCheck;				// Проверка чека в очереди по nuid qnuid /// возвращает объект с префиском check_*
	this.getReport = _ => _cache.REPORT;

	this._simplify = simplify;

	this.getActualReport = () => {
		let out = _cache.REPORT;
		out.isFake = options.isFake;
		return out;
	};

}
