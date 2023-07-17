"use strict";

function PinPad( options, eventManager, Logger ) {
	var self = this;

	options.file_url = Environment.get('domains.services') + '/devices/sber/';
	// options.default_depart = 0;				/// преобразование в строку будет уже перед отсылкой команды
	//options.always_use_advanced_make = false;	/// возможно нужно добавить в setDefaultDepart установку этого параметра в true в любом случае...


	/***************************************************************/
	/* STATIC */
	/***************************************************************/
	var ERROR_LIST = {
		USER: {
			"Некорректный пин. В случае неправильного ввода пин-кода трижды Ваша карта будет заблокирована": [403,4455],
			"Ваш пин-код заблокирован": [405,708,709],
			"Истек срок действия карты": [444,507,572],
			"На карте недостаточно средств": [521,4451],
			"Карта заблокирована": [574,579,705,706,707,2004,2005,2006,2007,2405,2406,2407],
			"Истек период обслуживания карты": [584,585], 
			"Операция прервана нажатием клавиши ОТМЕНА": [2000],
			"Превышено ожидание ввода пин-кода": [2002],
			"Недостаточно средств для загрузки на карту": [3001],
			"По карте числится прерванная загрузка средств": [3002],
			"На сервере проводятся регламентные работы": [3019,3020,3021,4419,4468,4497],
			"Нет связи с банком": [4100,4119],
			"Ошибка обмена с чипом карты": [4103,4104],
			"Неправильно введен или прочитан номер карты": [4108], 
			"Превышен лимит, допустимый без связи с банком": [4113,4114],
			"Ручной ввод для таких карт запрещен": [4115], 
			"Введены неверные 4 последних цифры номера карты": [4116],
			"Отказ от ввода пин-кода": [4117,5116,5120],
			"На карте есть чип": [4125],
			"Операция отклонена картой. Возможно, карту вытащили из чипового ридера до завершения печати чека": [4132], 
			"Истек период ожидания карты": [4334],
			"Карта не поддерживает ввод online ПИН. Требуется обязательный ввод ПИН": [4345],
			"Карта не поддерживает ввод offline ПИН. Требуется обязательный ввод ПИН или ПИН блокирован": [4346],
			"Операции на данной карте невозможны": [4404,4405,4407,4441,4443],
			"Карта просрочена": [4454], 
			"Операция не разрешена по причинам, связанным с картой": [4457],
			"Пин-код введен неверно трижды. Карта заблокирована": [4475],
			"Нарушены данные на чипе карты": __getArray(5100, 9),	/// 5100 5108
			"Срок действия карты истек": [5109],
			"Срок действия карты еще не начался": [5110],
			"Для этой карты такая операция не разрешена": [5111],
			"Операция отклонена картой": [5133],
 		},
		ADMIN: {
			"Неверная настройка терминала": [12,4128,4496,4498],
			"Нарушился контакт с пинпадом": [99], 
			"Нарушился контакт с чипом карты": [361,362,363,364],
			"На терминале установлена неверная дата": [518],
			"Карта терминала не проинкассирована": [4101,4102],
			"Требуется проинкассировать карту терминала": [4110,4111,4112], 
			"Неисправен пинпад": [4120],
			"Память терминала заполнена": [4130],
			"Был заменен пинпад": [4131], 
			"Слишком долго не выполнялась сверка тогов на терминале": [4134],
			"Неправильно настроена касса": __getArray(4300, 8), //// 4307 лишний
			"Нужно позвонить в банк": [4401],
			"Операция не разрешена по причинам, связанным с настройкой терминала": [4458],
			"Неверная настройка терминала или нарушены данные на чипе карты": __getArray(5000, 57),	//5000 - 5056
		}
	};

	function __getArray(from, count){
		return Array.apply(0, Array(count)).map((e,i)=>from+i);
	};

	var ERRORS = { USER: {}, ADMIN: {}, };	/// old list

	Object.keys(ERROR_LIST.USER).forEach( k => ERROR_LIST.USER[k].forEach( n => ERRORS.USER[n] = k ) );
	Object.keys(ERROR_LIST.ADMIN).forEach( k => ERROR_LIST.ADMIN[k].forEach( n => ERRORS.ADMIN[n] = k ) );

	// console.log(ERRORS);

	/***************************************************************/
	/* File Helper */
	/***************************************************************/
	var enter_pin_flag = true;

	function _publish(message) {
		message = message.trim();
		if ( message === '' ) return;

		var arr = message.split(':'); 		/// сообщение Введите ПИН: - с двоеточием...
		var event = options.events.message;

		if ( arr[0] === "PIN" ) {
			event = options.events.pin;
			if( enter_pin_flag || !arr[1].trim() ) {
				eventManager.publish(options.events.message, "Введите ПИН");
				enter_pin_flag = false;
			}
		} else {
			if( enter_pin_flag && arr[1] === "Введите ПИН" ) enter_pin_flag = false;
		}

		eventManager.publish(event, arr[1]);
	};


	var previousResult = '';
	var stop_listener = true;

	function listenFile(firstRun) {
		if( firstRun ) stop_listener = false;
		if( stop_listener ) return _debug("File listener is stopped");

		$.ajax({ url: options.file_url }).always(function( message ) {
				if ( firstRun ) {
					if( message.data === "MESS:Заберите карту" )
						previousResult = message.data;
					return listenFile(false);
				}
				
				if ( message.data == previousResult ) return listenFile(false);
				
				_debug("new file message -", message.data);
				_log("file message", message.data);
				_publish(message.data);
				previousResult = message.data;
				return listenFile(false);
			});
	};

	/***************************************************************/
	/* PRIVATES */
	/***************************************************************/
	function _log( type, msg, ...data ){
		switch (type) {
			case -1: type = "<-----"; break;
			case 1: 	type = "----->"; break;
			default: type = "------"; break;
		}
		return Logger.log( [type, options.deviceName, msg, ...data].join(" ") );
	};

	function _debug( msg, ...data ){
		if( options.debug ) console.log( options.deviceName, msg, ...data );
	};

	function _send( cmd ) {
		Object.keys(cmd).forEach( key => (cmd[key] = "" + cmd[key]) );  //// переваривает только все в виде строк
		cmd = JSON.stringify(cmd);
		
		if ( options.isFake )
			return eventManager.publish(options.events.message, 'Данная функция (' + cmd + ') не поддерживается в фейковом режиме');

		if ( self.connection.readyState != 1 )
			return _debug("socket closed");

		_log( 1, " sending cmd " + cmd );
		_debug( "running", cmd );

		self.connection.send(cmd);
	};

	function _defaultHandler( cmd, events, data ){
		if( (!data.ret && !data.status) || data.cmd !== cmd ) return; 
		/// ret - код ответа обычного обработчика сбера
		/// status - код ответа евгеновского обработчика в случае запуска нескольких функций
		///  - но иногда status "10003" может придти с cmd ""

		_debug( data.message );
		stop_listener = true;

		if( data.ret === "0" && data.check )
			return eventManager.publish(events.done, data.check);
		
		if( data.ret ){
			data.ret = parseInt(data.ret, 10) || -1;
			if( ERRORS.USER[data.ret] )
				return eventManager.publish( events.fail, data.retcodestring || ERRORS.USER[data.ret] );
			
			if( ERRORS.ADMIN[data.ret] )
				return eventManager.publish( events.critical, data.retcodestring || ERRORS.ADMIN[data.ret], 'error' );
		}
		
		/// retcodestring или statuscodestring (в случае если внутренняя Евгеновская ошибка)
		return eventManager.publish( events.critical, data.retcodestring || data.statuscodestring || "Unknown error", 'error' );
	};

	var onMessageEvents = {
		'make': 		{ done: options.events.payment.done, fail: options.events.payment.fail, critical: options.events.critical },
		'make_adv': { done: options.events.payment.done, fail: options.events.payment.fail, critical: options.events.critical },
		'undo': 		{ done: options.events.cancel.done, fail: options.events.cancel.fail, critical: options.events.critical },
		'undo_adv': { done: options.events.cancel.done, fail: options.events.cancel.fail, critical: options.events.critical },
		'undo_adv6': { done: options.events.cancel.done, fail: options.events.cancel.fail, critical: options.events.critical },
		'report': 	{ done: options.events.closeDay.done, fail: options.events.closeDay.fail, critical: options.events.closeDay.fail },
	};
	function _onMessage( message ){
		if( !message ) return;
		try {
			message = JSON.parse(message);
		} catch( err ){
			_log(-1, "Parsing error");
			_debug(err);
			return console.error("JSON Parse error");
		}

		if( !message ) return;
		if( message.socket === "Ready" ) return;

		if( onMessageEvents[message.cmd] !== void 0 )
			return _defaultHandler( message.cmd, onMessageEvents[message.cmd], message );
		
		_debug("!!Unknown command answer!!", message.cmd);
	};

	/***************************************************************/
	/* WEBSOCKET */
	/***************************************************************/

	if ( options.isFake ) {
		this.connection = { readyState: 1 };
		_log( -1, "starting in fake mode");
		setTimeout(eventManager.publish, 1000, ( options.scenario.start.error ) ? options.events.start.fail : options.events.start.done );

	} else {
		this.connection = new WebSocket( options.uri );
	}

	this.connection.onclose = function( e ) {
		_debug("socket closed");
		_log( 0, "socket closed");
	};

	this.connection.onerror = function( e ) {
		_log( 0, "socket error");
		return eventManager.publish(options.events.start.fail, "Возможо не запущен .exe файл, ответственный за устройство или некорректно указан ком-порт или сокет-порт в конфигурации" );
	};

	this.connection.onopen = function( evt ) {
		_log( 0, "socket opened");
		_debug("socket opened");
		return eventManager.publish(options.events.start.done, "");
	};

	this.connection.onmessage = function( evt ) {
		var message = evt.data;
		_log( -1, "answer - " + message );
		_debug( "in socket", message);

		_onMessage( message );
	};


	/***************************************************************/
	/* Fake payment / undo */
	/***************************************************************/
	var current = 0;
	var _sample_check ='                 ТЕСТ                   \r\n    Москва, ул.Годовикова, -1, стр.0    \r\n            т. (495)7300000             \r\n                                        \r\n22.06.16                           15:04\r\n                  ЧЕК           \r\n                 Оплата                 \r\nНомер операции:                     0003\r\nТерминал:                       10740000\r\nПункт обслуживания:         780000670000\r\n                   Visa   A0000000031010\r\nКарта:(C)               ************0000\r\nКлиент:                        TEST/TEST\r\n \r\nСумма (Руб):\r\n                1.00\r\nОДОБРЕНО   Код авторизации:       135700\r\n \r\n             Введен ПИН-код             \r\n========================================\r\n';
	var scenarious = {
		good: [
			"Вставьте пожалуйста карту",
			"Подождите...",
			"Введите ПИН",
			"*",
			"**",
			"***",
			"**",
			"***",
			"****",
			"Подождите",
			"Заберите карту"
		],
		user: [ 'USER', ],
		critical: [ 'CRITICAL', ]
	};

	function fakeSend(scenario, event) {
		if ( scenario[current] === void 0 ) {
			eventManager.publish(event, [_sample_check, '123456789000']);

			//var str = 'Тестовая ошибка';
			//eventManager.publish(options.events.critical, [str]);
			//eventManager.publish(options.events.payment.fail, [str]);
			return
		}

		setTimeout(eventManager.publish, options.scenario.delay * 1000, (scenario[current].indexOf("*") === 0) ? options.events.pin : options.events.message, scenario[current]);
		current++;
		setTimeout( fakeSend, options.scenario.delay * 1000, scenario, event );
	};

	function proceedFake( cancel ) {
		current = 0;
		return fakeSend(scenarious.good, cancel ? options.events.cancel.done : options.events.payment.done );
	};


	/***************************************************************/
	/* API
	 * v1.4 commands
	 * report, ejectCard, getStatistics, testPinpad
	 * make, undo ( amount )
	 * make_mem (amount), undo
	 * make ( amount, confirm "0" ), make (confirm "1" - true), make (confirm "2" - false) - транзакция с подтверждением или отменой
	 * make_adv ( amount, depart "0-14" )
	 * undo_adv ( amount, rrn "0000000000000", depart "0-14" ) 
	 * undo_adv6 ( amount, rrn "0000000000000" ) 
	 */
	/***************************************************************/
	/////// В РУБЛЯХ!!!!!!
	function _payment(price){
		_make( Math.round(price * 100) );  /// Переводим в копейки и начинаем dispense
	};

	/////// В КОПЕЙКАХ!!!!!!!
	function _make(amount) {
		amount = parseInt(amount, 10);
		if ( !amount || amount < 0 ) throw 'Wrong PinPad input';
		_debug('Wanna payment via pinpad', amount);
		if ( options.isFake ) return proceedFake();


		var out = { cmd: 'make', amount: amount }
		if( options.always_use_advanced_make || ( options.default_depart > 0 && options.default_depart <= 14 ) ){
			out.cmd = "make_adv";
			out.depart = options.default_depart || 0;
		}

		_send(out);	////   съедает только строки, перенес формирование в начало _send
		listenFile(true);
	};

	/////// В РУБЛЯХ!!!!!!
	function _undo( price, rrn ) {
		var amount = Math.round( price * 100 );
		if( !amount || amount < 0 ) throw "Wrong PinPad input on undo";
		if ( options.isFake ) return proceedFake(true);

		var out = { cmd: 'undo', amount: amount }; //// Отмена только последней операции, нужно знать верную сумму!!!! Если скормить не ту сумму, то сбер ПОВИСНЕТ!
		if( options.always_use_advanced_make || ( options.default_depart > 0 && options.default_depart <= 14 ) ){
			out.cmd = "undo_adv";
			out.depart = options.default_depart || 0;
		}

		if( rrn ){
			out.cmd = "undo_adv";	/// undo_adv6 - если там только rrn
			out.rrn = rrn;
		}

		_send(out);
		listenFile(true);
	};

	function _eject() { _send({ cmd: 'ejectCard' }); };
	function _closeDay() { _send({ cmd: 'report' }); };
	function _strongCmd(cmd) { _send(cmd); };


	///////////////////////////////////////////////

	self.payment = _payment;
	self.make = _make;			///	лучше не использовать так как в копейках
	self.undo = _undo;			///	только undo и payment который принимает рубли
	self.eject = _eject;
	self.closeDay = _closeDay;
	self.strongCmd = _strongCmd;
}
