/* // Методы 
* .print(data) - напечатать чек с параметрами дата:
*
*     data = {
*        goods: [
*           {
*              name: 'ИМЯ1',
*              price: 10,
*              quantity: 2,
*              depart: 1         /// Номер отдела. Если не передаем, то не печатает
*              discount: 2,		/// Скидка или надбавка (если отриц)
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
*        discount: 0,      // не используется, после нового закона, тут мб округление в районе рубля (типо скинуть копейки), но лучше не использовать
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
*        cmd: [ 										/// Если не требуется ничего печатать посередине чека, то пустой массив
*        	' Тестовая строка до закрытия ', /// для обычных строк теперь конвертация не требуется 
*        	' Еще одна ', 							/// плюс там можно через конфиг указать align для текста поумолчанию 
*        	'pb_not_close:123456789'			/// вместо pb_not_close|||:
*         ], 
*     }
* 
* 
* getXorder() - получить X Отчет
* getZorder() - Закрыть смену и напечатать все отчеты с гашением 
* getReport() - не асинхронный, возвращает статус принтера как только он прошел/не прошел инициализацию
* 
* printStrings() - для печати обычных строк - передаем массив (нужно учитвать длину одной строки в символах)
* 						//// там теперь есть фича, пока захардкоженная, с указанием align: left, right, center
* 
*/


function Kaznachey( options, eventManager, Logger ) {

	var connection = null;

	/***************************************************************/
	/* STATIC */
	/***************************************************************/

	var STATES = {
			CURRENT: '',
			INIT: 'init',
			BUFFER: 'buffer',
			BUFFER_CLEAR: 'buffclear',
			CLOSESESSION: 'close',
		},


		CMDS = {
			PRINT: 'MAKECHECK',
			GET_STATUS: 'GETSTATUS',
			GET_STATUS_CODE: 'GETCODESTATUS',
			SET_PRINTER_INDEX: 'SETINDEX', //для случаев, если используется одновременно два принтера
			SAVE_Z: 'saveZorder',
			GET_Z: 'getZorder',
			CLEAR_BUFF: 'clearBuffer',
			GET_X: 'getXorder',
			CUT: 'cut',

			OPENSESSION: 'openSession',
			CANCELCHECK: 'cancelCheck',

			CASHINCOME: 'cashIncome',
			CASHOUTCOME: 'cashOutcome',

			printString: "printString",
			printBarcode: "printBarCode",

			getLastDocument: "LASTDOCUMENT",
			getLastReceipt: "LASTRECEIPT",
			fnInfo: "fnInfo",
		},

		ERRORS = {
			NODEVICES: 'Отсутствует соеднинение с сокетом',
			NOSTATUS: 'Статус не получен',
			NOFISCAL: 'Касса не фискализирована',
			NOPAPER: 'Нет бумаги',
			COVEROPENED: 'Крышка принтера открыта',
			ZORDER: 'Ошибка отчета с гашением',
			ZORDER_BUFFER: 'Ошибка отчета с гашением. Не удалось отчистить буффер',
			CANT_SET_PRINTER_INDEX: 'Не могу установить индекс фискального регистратора',
			ANOTHER: 'Ошибка',
			REGISTRATION: 'Казначей находится в режиме Регистрации. Возможно во время печати не удалось закрыть чек! ',
			SESSIONFAIL: 'Смена превысила 24 часа', //'С момента открытия предыдущей смены прошло более 24 часов. Необходимо снять Z отчет.',
		};

		var REPORT = false;
		var FNINFO = null;
	
	/***************************************************************/
	/* PRIVATE */
	/***************************************************************/

	function onStart(data) {

		if ( data.cmd !== CMDS.GET_STATUS ) {
			return;
		}

		REPORT = data; //data.data;


		// Ошибка 3822 - смена не закрывалась больше 24 часов, нужно сохранить Z отчет в буфер 

		if ( data.errorCode && data.errorCode !== "000" && data.errorCode !== "00" ) {
			// if ( data.error == -3822) {
			// 	//getZorderBeforeStart(); // пытаемся снять отчет и провести процедуру еще раз
			// 	return eventManager.publish(options.events.start.fail, ERRORS.SESSIONFAIL);
			// } else {
				return eventManager.publish(options.events.start.fail, ERRORS.NOSTATUS + '.' + data.errorDescription || data.errorCode);
			// }
		}

		var _errors = [];

		// REPORT = data; /// data.data;

		//Обработчик ошибок

		if ( !REPORT.isFiscalFN ) {
			// Если не фискализирован и не включен фейк фискал режим
			if ( !options.fakeFiscal ) {
				_errors.push(ERRORS.NOFISCAL);
			}
		}

		if ( ( !REPORT.isPaperPresent || REPORT.isPrinterError )  && !options.disablePaperCheck ) {
			// Если нет бумаги
			_errors.push(ERRORS.NOPAPER);
		}

		if ( REPORT.isCoverOpened ) {
			// Если открыта крышка
			_errors.push(ERRORS.COVEROPENED);
		}

		if ( /*REPORT.mode === 1 && */ false && !options.disableModeCheck ) {
			// Режим, в котором находится ккт
			// см Drivers8_FprnM_PM.pdf стр 348
			// Mode . AdvancedMode
			_errors.push(ERRORS.REGISTRATION);
		}

		if( REPORT.shiftState === 2 && options.shiftStateCheck ) {
			getZorderBeforeStart();
			// _errors.push(ERRORS.SESSIONFAIL);
		}

		// if ( REPORT.ECRError ) {
		// 	_errors.push(ERRORS.ANOTHER + '.' + REPORT.ECRError);
		// }
		
		if ( _errors.length ) {
			return eventManager.publish(options.events.start.fail, [_errors]);
		}

		//getStatusCode();

		return eventManager.publish(options.events.start.done);
	};


	function getStatusCode() { send( { cmd: CMDS.GET_STATUS_CODE } ); };

	var check_vars = [ {
			key: 'paper',
			name: 'Бумага',
			vals: { "0": "Есть", "1": "Нету!" },
			error: "1",
		},{
			key: 'link',
			name: 'Связь с принтером',
			vals: { "0": "Есть", "1": "Нету!" },
			error: "1",
		},{
			key: 'treserr',
			name: 'Ошибка отрезчика',
			vals: { "0": "Нету", "1": "Есть!" },
			error: "1",
		},{
			key: 'prnterr',
			name: 'Ошибка принтера',
			vals: { "0": "Нету", "1": "Есть!" },
			error: "1",
	}  ];

	function onGetStatusCode(data) {
		if(!data) return;
		
		var error = false;
		var message = "";

		// paper // Бумага 0 есть / 1 нет
		// link  // Связь с принтером 0 есть / 1 нет
		// treserr // Нет ошибок отрезчика 0 нет / 1 есть
		// prnterr // Нет ошибок принтера 0 нет / 1 есть (восстановимая)
		// mode   Режим.Подрежим
		// datamode Комментарии к mode
		
		check_vars.forEach(function(e){
			if( !data.hasOwnProperty(e.key) ) return;

			if( data[e.key] === e.error ){ error = true; }
			message += e.name + ' - ' + (e.vals[data[e.key]] || '') + "; "; 
		});

		if( error ){
			message += " Ошибка!";
		} else {
			message += " Ок";
		}

		console.log(message);
		Logger.log( "<----- " + options.deviceName + " " + message );

		return error;
	};

	function getZorderBeforeStart() {
		STATES.CURRENT = STATES.CLOSESESSION; 	///// STATES.INIT;
		send({cmd: CMDS.SAVE_Z});
	};


	_stringsCache = {
		on: false,
		stringsToPrint: 0,
		stringsPrinted: 0,
		cmd: "printString:",
		barcode: "pb|||:",            ////  ПРИ печати qr кода с сылкой или двоеточием где либо, о
												////  обрезает все что после :. Поэтому команда pb_not_close Будет с |||:
		array: null,
		done: false
	};

	function printString( text ) {
		if( text.indexOf('__BARCODE__:') === 0 ){
			text = text.replace('__BARCODE__:','');
			//send(_stringsCache.barcode + text);
			send( { cmd: CMDS.printBarcode, code: text }  )
		} else {
			send( { cmd: CMDS.printString, str: text, align: "left" } );
		}
	};

	function printStrings( arrayOfStrings, disableCut ) {
		if ( options.isFake ) {
			arrayOfStrings.forEach( s => console.log(s) );
			var _event = '';
			if ( !options.scenario.printStrings.error ) {
				_event = options.events.print.done;
			} else {
				_event = options.events.print.fail;
			}

			return eventManager.publish(_event);
		}

		_stringsCache.on = true;
		_stringsCache.done = false;
		_stringsCache.stringsToPrint = arrayOfStrings.length;
		_stringsCache.array = arrayOfStrings.map( function(e){ return ( !e ) ? " " : e; } );
		_stringsCache.stringsPrinted = 0;
		_stringsCache.disableCut = !!disableCut;

		printString(_stringsCache.array[_stringsCache.stringsPrinted]);
	};

	function whenStringsPrinted(result) {
		console.log(result);

		if ( _stringsCache.done ) {   ///   можно убрать, т.к. раньше ждали ответ после cut
			_stringsCache.on = false;
			return;
		}

		try {
			result = JSON.parse(result);
			if( result && result.errorCode !== "000" && result.errorCode !== "00" ){
				send({ cmd: CMDS.CUT });
				_stringsCache.array = [];
				_stringsCache.done = true;
				_stringsCache.on = false;

				eventManager.publish(options.events.print.fail);
				return;
			}
		} catch (e) {
			result = false;
		}

		_stringsCache.stringsPrinted++;

		if ( _stringsCache.array[_stringsCache.stringsPrinted] ) {
			setTimeout( printString, 0, _stringsCache.array[_stringsCache.stringsPrinted] );
		} else {

			if( !_stringsCache.disableCut ) send( { cmd: CMDS.CUT });
			
			_stringsCache.done = true;
			_stringsCache.on = false;
			eventManager.publish(options.events.print.done);
		}
	};

	/***************************************************************/
	/* PUBLIC */
	/***************************************************************/

	function getXorder() {

		if ( options.isFake ) {
			var _event = '';

			if ( options.scenario.getXorder.error ) {
				_event = options.events.xorder.done;
			} else {
				_event = options.events.xorder.done;
			}

			return eventManager.publish(_event);
		}

		send({cmd: CMDS.GET_X});
	};

	function onXorder(data) {
		if (data.error) {
			return eventManager.publish(options.events.xorder.fail, ERRORS.ANOTHER + '.' + data.error);
		} else {
			return eventManager.publish(options.events.xorder.done);
		}
	};

	function getZorder() {

		if ( options.isFake ) {
			var _event = '';

			if ( options.scenario.getZorder.error ) {
				_event = options.events.zorder.done;
			} else {
				_event = options.events.zorder.done;
			}

			return eventManager.publish(_event);
		}


		STATES.CURRENT = STATES.BUFFER;
		send({cmd: CMDS.SAVE_Z});
	};

	function getZorderFromBuffer() {

		if ( options.isFake ) {
			var _event = '';
			if ( options.scenario.getZorder.error ) {
				_event = options.events.zorder.done;
			} else {
				_event = options.events.zorder.done;
			}

			return eventManager.publish(_event);
		}

		STATES.CURRENT = STATES.BUFFER;
		send( {cmd: CMDS.GET_Z} );
	};


	function onZorder(data) {

		if ( STATES.CURRENT == STATES.BUFFER ) {
			STATES.CURRENT = STATES.BUFFER_CLEAR;

			//if (data.error != 0 || data.error != || data.error != "00" || data.error != "0") {
			if( data.errorCode !== "000" && data.errorCode !== "3828" && data.errorCode !== "073" ) {
				return eventManager.publish(options.events.zorder.fail, ERRORS.ZORDER);
			} else {

				//return eventManager.publish(options.events.zorder.done);
				setTimeout( send, 5000, {cmd: CMDS.GET_Z} );
				return;
			}

		} 

		if ( STATES.CURRENT == STATES.INIT ) {
			STATES.CURRENT = '';

			if ( data.error ) {
				return eventManager.publish(options.events.start.fail, ERRORS.ZORDER);
			} else {
				return send( {cmd: CMDS.GET_STATUS} );            
			}
		}

		if ( STATES.CURRENT == STATES.CLOSESESSION ) {
			STATES.CURRENT = '';

			if( data.error ) {
				return eventManager.publish(options.events.closeSession.fail);
			} else {
				return eventManager.publish(options.events.closeSession.done);   
			}
		}
	};

	function onPrintZorder(data) {
		if ( !data.error ) {
			if( STATES.CURRENT == STATES.BUFFER_CLEAR ) {

				/////////// DEL
				/////////// Временно убрал очистку буффера
				STATES.CURRENT = '';
				return eventManager.publish(options.events.zorder.done);
				////////////////


				////  Очистка буффера сразу после печати отчетов
				////  с задержкой 10 сек
				/*return setTimeout(function(){
					return send({ cmd: CMDS.CLEAR_BUFF });
				}, 1000 * 10); */  
			}
			return eventManager.publish(options.events.zorder.done);
		}

		return eventManager.publish(options.events.zorder.fail, ERRORS.ZORDER + '.' + data.error);
	};

	function onClearBuff(data){
		
		if( STATES.CURRENT == STATES.BUFFER_CLEAR ){
			STATES.CURRENT = '';
			
			if( !data.error ){
				return eventManager.publish(options.events.zorder.done);
			}
			return eventManager.publish(options.events.zorder.fail, ERRORS.ZORDER_BUFFER + '.' + data.error);
		
		} else {
			
			if( !data.error ){
				return eventManager.publish(options.events.clearBuffer.done);
			}
			return eventManager.publish(options.events.clearBuffer.fail, ERRORS.ZORDER_BUFFER + '.' + data.error);
			
		}
	}

	var printStarted = false;
	function printFiscal ( data ) {
  		
  		function _checkAndPrepareData(obj) {
			
			function _checkKeys(array, object) {
				for (var i in array) {
					var _field = array[i];

					if ( !object[_field] && object[_field] !== 0 ) {
						return false;
					}
				}
				return true;
			}

			//Object if defined

			if ( options.debug ) {
				console.log(options.deviceName + ' objectToPrint:')
				console.log(obj);
			}

			//goods is not empty array
			if ( !Array.isArray(obj.goods) || obj.goods.length < 1) {
				return 'goods is empty';      
			}

			///// inserted & paymentType can be moved in paymentsArray
			//operation, type and inserted are defined
			if ( !_checkKeys(['operation'], obj) ) {
				return 'could not find operation keys';
			}

			//all fields in goods ok
			for (var k in obj.goods) {
				if ( !_checkKeys (['name', 'price', 'quantity'], obj.goods[k]) ) {
					console.error(k);
					return 'Name or price or quantity in goods';
				}

				/// fix ',', '[', ']'
				obj.goods[k].name = obj.goods[k].name; //replace(/\,/g,'.').replace(/\[/g,'-').replace(/\]/g,'-');
			}

			// prepare goods (depart, tax, discount, SUM)
			var out = {};
			var _sum = 0;
			out.goods = obj.goods.map(function(e){
					var out = {
						name: e.name,
						price: e.price,
						quantity: e.quantity,
					};
					
					out.tax = ( e.tax >= 0 ) ? e.tax : options.defaultTax || 0;

					out.curdiscount = e.discount || 0;
					
					if( e.depart ) out.depart = e.depart; 	/// номер отдела /// out.depart = e.depart || 0;
					
					if( e.itemtype ) out.itemtype = e.itemtype;	//// товар, услуга....
					else if( options.defaultItemType ) out.itemtype = options.defaultItemType;
					
					if( e.paymentMode ) out.paymentMode = e.paymentMode; //// полный расчет, предоплата 100%, аванс....

					if( Array.isArray(e.tags) && e.tags.length ) out.tags = e.tags;	/// пока без проверок, но возможно нужно привести все к string

					_sum += Math.round( out.price * out.quantity * 100 ) / 100;  ///// DEL  - ( out.curdiscount || 0 )
					return out;
			});
			_sum = Math.round( _sum * 100 ) / 100;

			out.operation = obj.operation;

			if( !Array.isArray(obj.payments) ){
				out.paymentType = obj.paymentType || 0;
				out.inserted = obj.inserted;
			} else {
				out.payments = obj.payments;
				//// мб тут нужно провалидировать массив оплат...
			}

			if( Array.isArray(obj.tags) && obj.tags.length ) 
				out.tags = obj.tags;	/// пока без проверок, но возможно нужно привести все к string

			
			out.discount = 0;

			//	обычную скидку/надбавку пока отрубил
			//out.discount = obj.discount || 0;
			//_sum = _sum + out.discount;

			out.cmd = obj.cmd || [];


			//prepare sum
			out.sum = obj.sum || _sum;

			//prepare user phone or email
			if( obj.address ) out.address = obj.address;


			if( obj.operation === 'ret' ){
				out.sum = _sum;
				out.inserted = out.sum;
			}

			if( obj.paymentType !== void 0 ){
				if ( obj.paymentType == 1 || obj.paymentType == 3 ) {
					//credit card              //////   ПОД Вопросом пока!!! НА фискальнике должен быть +... Т.к. надбавка была с плюсом
					//obj.inserted = obj.sum - obj.discount;    ///   А тут пока не понятно как быть, т.к. еще не решено
					//out.inserted = out.sum + out.discount;
					out.inserted = out.sum;
				}
			} else if( Array.isArray(obj.payments) ) {
				//out.sum = obj.payments.reduce( function( sum, e ){ return sum + e.inserted; }, 0 );
				///// для проверки суммы тогда если только
			}

			return out;
		};

		var printObj = _checkAndPrepareData( data ); 

		if ( typeof printObj == 'string' ) {
			throw 'wrong print input - ' + printObj;
		}

		if ( options.isFake ) {
			if ( options.scenario.printFiscal.error ) {
				return eventManager.publish(options.events.printFiscal.fail, 'er0x00123');
			}

			return eventManager.publish(options.events.printFiscal.done);

		}
		if( printStarted ){
			console.error("Previous print does not ended...");
			return eventManager.publish(options.events.printFiscal.fail);
		}

		printStarted = true;
		send( {cmd: CMDS.PRINT, data: printObj} );
	};

	function onPrint( data ){
		if( !printStarted ) return;
		//if( data['function'] === 'printText' ) return;
		printStarted = false;

		//// получается не игнорю первое сообщение
		if (data.errorCode && data.errorCode === "000" && data["function"] === "queryData" ) {
			return eventManager.publish(options.events.printFiscal.done, [data.reseipt_num]);
		}

		return eventManager.publish(options.events.printFiscal.fail, [data.errorDescription]);
	}


	/***************************************************************/
	/* SOCKET */
	/***************************************************************/

	if ( options.isFake ) {

		connection = {
			readyState: 1,
		};

		setTimeout(function(){

			if ( options.scenario.start.error ) {
				return eventManager.publish(options.events.start.fail);
			}

			return eventManager.publish(options.events.start.done);

		}, 1000);

	} else {
		connection = new WebSocket( options.uri );
	}


	function send(cmd) {

		if ( connection.readyState !== 1 ) {
			throw 'Trying to send '
		} 

		var _stringCmd = JSON.stringify(cmd);

		Logger.log("-----> " + options.deviceName + " cmd " + _stringCmd);

		// if ( _stringsCache.on ) {
		// 	_stringCmd = cmd;   
		// }

		if ( options.debug ) {
			console.log('sending to FPrinter:');
			console.log(cmd);
			console.log(JSON.stringify(cmd));
		}

		connection.send(_stringCmd);
	};


	connection.onmessage = function ( e ) {

		Logger.log("<----- " + options.deviceName + " answer - " + e.data);
		

		if ( _stringsCache.on ) {
			return whenStringsPrinted(e.data);
		}

		var _data = {};
		try {
			_data = JSON.parse(e.data)
		} catch(err){
			//throw 'Не валидный JSON';
			console.error(err);
			return;
		}

		if( _data && _data.errorCode && !_data.error ){
			var n = Number(_data.errorCode);
			if( n !== 0 ){
				_data.error = _data.errorCode + " - " + (_data.errorDescription || "");
			}
		} 

		if ( options.debug ) {
			console.group('answer from FPrinter:');
			console.log(e.data);
			console.log(_data);
			console.groupEnd();
		}

		switch (_data.cmd) {
			case CMDS.GET_STATUS: 
				return onStart(_data);
			case CMDS.GET_X:
				return onXorder(_data);
			case CMDS.PRINT:
				return onPrint(_data);
			case CMDS.SAVE_Z:
				return onZorder(_data);
			case CMDS.GET_Z:
				return onPrintZorder(_data);
			case CMDS.CLEAR_BUFF:
				return onClearBuff(_data);
			case CMDS.OPENSESSION: 
				return onOpenSession(_data);
			
			case CMDS.CASHINCOME:
				return onCashIncome(_data);
			case CMDS.CASHOUTCOME:
				return onCashOutcome(_data);

			case CMDS.GET_STATUS_CODE:
				return onGetStatusCode(_data);

			case CMDS.getLastDocument:
				return onGetLastDocument(_data);
			case CMDS.getLastReceipt:
				return onGetLastReceipt(_data);

			/*
			case CMDS.SET_PRINTER_INDEX:
				break;
				if ( _data.error ) {    ///   В казначее пока не работаем Index (В Exe устанавливает автоматом при запуске)
					return eventManager.publish(options.events.start.fail, [ERRORS.CANT_SET_PRINTER_INDEX]);
				} else {
					send( {cmd: CMDS.GET_STATUS} );
				}
			*/
		}


		if( _data.fnInfo ) return onFnInfo( _data.fnInfo );

	};

	connection.onopen = function( e ) {
		Logger.log("----- " + options.deviceName + " socket opened");

		send( {cmd: CMDS.GET_STATUS} );
		//send( {cmd: CMDS.SET_PRINTER_INDEX, index: options.printerIndex });
	};

	connection.onclose = function( e ) {
		Logger.log("----- " + options.deviceName + " socket closed");
	};

	connection.onerror = function( e ) {
		Logger.log("----- " + options.deviceName + " socket error");
		return eventManager.publish(options.events.start.fail, [ERRORS.NODEVICES]);
	};

	function getReport() {
		return REPORT;
	};

	function openSession() {
		if( options.isFake ) return eventManager.publish(options.events.openSession.done);
		send( {cmd: CMDS.OPENSESSION });
	};

	function closeSession() {
		if( options.isFake ) return eventManager.publish(options.events.closeSession.done);   
		STATES.CURRENT = STATES.CLOSESESSION;
		send( {cmd: CMDS.SAVE_Z} );
	};

	function onOpenSession(data) {
		if (data.error) {
			return eventManager.publish(options.events.openSession.fail, ERRORS.ANOTHER + '.' + data.error);
		} else {
			return eventManager.publish(options.events.openSession.done);
		}
	};

	
	function cashIncome(sum) {
		//STATES.CURRENT = STATES.CLOSESESSION;
		sum = Number(sum);
		if(!sum || sum <=0 ){
			return eventManager.publish(options.events.cashIncome.fail, 'Ошибка, указана неправильная сумма');
		}
		send( {cmd: CMDS.CASHINCOME, sum: sum });
	};

	function onCashIncome(data) {
		if ( data.error || !data.cashIncome ) {
			return eventManager.publish(options.events.cashIncome.fail, ERRORS.ANOTHER + '.' + (data.error||"") );
		} else {
			send({ cmd: CMDS.CUT });			/// т.к. чек какой-то короткий и не презентуется нормально
			return eventManager.publish(options.events.cashIncome.done);
		}
	};

	function cashOutcome(sum) {
		//STATES.CURRENT = STATES.CLOSESESSION;
		sum = Number(sum);
		if(!sum || sum <=0 ){
			return eventManager.publish(options.events.cashOutcome.fail, 'Ошибка, указана неправильная сумма');
		}
		send( {cmd: CMDS.CASHOUTCOME, sum: sum });
	};

	function onCashOutcome(data) {
		if (data.error || !data.cashOutcome ) {
			return eventManager.publish(options.events.cashOutcome.fail, ERRORS.ANOTHER + '.' + (data.error||"") );
		} else {
			send({ cmd: CMDS.CUT });		/// из-за короткого чека
			return eventManager.publish(options.events.cashOutcome.done);
		}
	};


	/***************************************************************/
	var _promisies = {};
	function getFnInfo(){
		if( options.isFake ) return Promise.resolve( options.scenario.fn_info );
		return new Promise(function( resolve ){
			send( {"cmd":"json", type: "getFnInfo"} );
			setTimeout( resolve, 10000, null );
			_promisies.fnInfo = resolve;
		});
	};
	function onFnInfo(data){
		if( !data.serial ) return;
		
		FNINFO = data;
		if( _promisies.fnInfo ) {
			_promisies.fnInfo( data );
			delete _promisies.fnInfo;
		}
	};

	function getLastDocument(){
		if( options.isFake ) 
			return Promise.resolve( options.scenario.last_document );
		
		return new Promise(function( resolve ){
			send( { cmd: CMDS.getLastDocument } );
			setTimeout( resolve, 5000, null );
			_promisies.getLastDocument = resolve;
		});
	};
	function onGetLastDocument( data ){
		if( !_promisies.getLastDocument ) return;
		if( !data || !data.year ) _promisies.getLastDocument(null);
		else _promisies.getLastDocument( data );
		delete _promisies.getLastDocument;
	};

	function getLastReceipt(){
		if( options.isFake ) 
			return Promise.resolve( options.scenario.last_receipt );
		
		return new Promise(function( resolve ){
			send( { cmd: CMDS.getLastReceipt } );
			setTimeout( resolve, 5000, null );
			_promisies.getLastReceipt = resolve;
		});
	};
	function onGetLastReceipt( data ){
		if( !_promisies.getLastReceipt ) return;
		if( !data || !data.year ) _promisies.getLastReceipt(null);
		else _promisies.getLastReceipt( data );
		delete _promisies.getLastReceipt;
	};

	/// мб принимать номер документа, чтоб проверять что вернули тот QR код
	function getLastQRCode( asObject ){	/// возвращать в виде объекта, либо в виде строки(поумолчанию)
		//// t=20200619T1409&s=1.00&fn=9999078900002183&i=495&fp=4068253588&n=2
		//// t=20200619T1407&s=110.00&fn=9999078900002183&i=494&fp=4030957043&n=1
		///
		/// возможные отличия - наличие секунд в дате (на чеке не печаталось...)
		/// косяк с формированием даты - year month из-за прошивки или еще чего-то...
		/// наличие/отсутствие ведущих нулей в FN FP
		/// 
		var out = { t: '', s: '', fn: '', i: '', fp: '', n: ''  };

		if( !options.isFake && (!REPORT || !REPORT.isFiscalFN) ){ return Promise.resolve(null); }

		return getFnInfo()
			.then( function(data) {
				if( !data ) throw "Данные о фиск. накопителе не получены";
				if( !data.serial ) throw "Серийный номер фиск. накопителя не получен";
				out.fn = data.serial.replace(/^0{1,}/ ,'');		/// убираем ведущие нули
				return getLastReceipt();
			})
			.then( function(data){
				if( !data ) throw "Данные о последнем чеке не получены";

				out.s = data.receipt_sum.toFixed(2);
				out.n = data.receipt_type;
				out.i = data.document_num;
				out.fp = data.fiscal_sign.replace(/^0{1,}/ ,'');	//// убираем ведущие нули

				var year = data.year;
				if( year > 100 && year < 2000 ) year += 1900;
				var month = data.month + 1;
				out.t = [year, month, data.day, "T", data.hour, data.minute, data.second ]
								.map(function(e){
										if( e >= 0 && e < 10 ) return "0" + e;
										return e;
									})
								.join('');

				if( asObject ){ 
					out._additional_info = data;
					if( REPORT && REPORT.shiftNumber ){
						if( REPORT.shiftState === 1 )
							out._additional_info.shiftNumber = REPORT.shiftNumber;
						else
							out._additional_info.shiftNumber = REPORT.shiftNumber + 1;
					}

					return out;
				}
				return Object.keys( out ).map( function(key){ return key + "=" + out[key]; }).join('&'); /// 49й хром не переваривает .entries
			})
			.catch(function(error){
				console.error(error);
				return null;
			});
	};

	/***************************************************************/
	/* API */
	/***************************************************************/

	this.printFiscal = printFiscal;           // Печать Фискального чека
	this.getZorder = getZorder;               // Печать Z Отчета
	this.getZorderFromBuffer = getZorderFromBuffer;
	this.getXorder = getXorder;               // Печать X отчета
	this.getReport = getReport;               // Выдача текущего репорта
	this.getActualReport = getReport;
	this.printStrings = printStrings;         // Печать массива строк (Не фискальный чек)


	this.clearBuffer = function(){  			 	// Чистка буффера ZОтчетов - для тестов
		if( options.isFake ) return eventManager.publish(options.events.clearBuffer.done);
		send( {cmd: CMDS.CLEAR_BUFF } ); 
	};  

	this.openSession = openSession;           // Открытие смены
	this.closeSession = closeSession;

	this.cashIncome = cashIncome;             // Внесение наличных
	this.cashOutcome = cashOutcome;           // Выплата наличных

	// this.getStatusCode = getStatusCode;       // получение кода ошибки по 45h
	
	this.getLastQRCode = getLastQRCode;
}
