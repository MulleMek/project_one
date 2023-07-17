"use strict";

function Vendotek( options, eventManager, Logger ) {
	var self = this,
		_cache = {
			started: null,
			stopped: null,
			last_command: null,
		};
	
	/// v0.2.1 - должен держать соединение сам 
	///  команда stop отпадает

	const COMMANDS = {
		START: "start",
		//STOP : "stop",
		CANCEL: "abort",
		PAYMENT: "make",
		TOUCHED: "touch",
	};
	
	const ERROR_CODES = {
		"-10": "Таймаут на выполнение платежа",	// Внутренние ошибки
		"-11": "Таймаут на запуск девайса",


		"01": "потеря TCP соединения",
		
		// "11": "ошибка связи с процессинговым центром",
		// "12": "журнал транзакций не синхронизирован",
		// "13": "необходима сверка журнала",
		// "14": "отклонено чип-картой",
		// "15": "ошибка доставки сообщения",
		// "16": "нет условий для ввода Онлайн ПИН",
		// "17": "отказ от ввода ПИН",
		// "18": "нет ответа от процессингового центра",
		// "19": "отклонено в режиме оффлайн",
		// "20": "нет связи с хостом, отклонено в режиме оффлайн",
	};
	
	const supported_opts = ["amount", "curr"];
	
	//// !!! Конфигурация !!!
	//// можно задать в Environment.js как например с Kaznachey defaultTax
	//options.disableCurrency_selector = true;
	//options.defaultCurrency = "rub";
	//options.disableUsePosMessage = true;
	options.startTimeout = 60 * 1000;			///	Внутренний таймаут на старт девайса
	options.paymentTimeout = 2 * 60 * 1000;	///	Внутренний таймаут для проведения платежа 
											/// в самом девайсе надо приложить карту где-то за 30 секунд
	/// Если вызвать cmd:stop в тот момент когда запущена оплата, то формально можно провести оплату, но результат не придет в сокет
	/// поэтому при вызове DeviceManager.stop в случае если запущена оплата, то stop вызовет команду abort

	function _log( type, msg, ...data ){
		switch (type) {
			case -1: type = "<-----"; break;
			case 1:  type = "----->"; break;
			default: type = "------"; break;
		}
		return Logger.log( [type, options.deviceName, msg, ...data].join(" ") );
	};

	function _debug( msg, ...data ){
		if( options.debug ) console.log( options.deviceName, msg, ...data );
	};
	
	///////////////////////////////////////////////////////////////////////////

	if ( options.isFake ) {
		self.connection = { readyState: -1 };
		_log( -1, "starting in fake mode");

		setTimeout(
			eventManager.publish,
			1000,
			options.events.start[( ( options.scenario.start.error )? "fail" : "done")]
		);
	} else {
		self.connection = new WebSocket( options.uri );
	}
	
	function _send(cmd, opts) {
		if ( self.connection.readyState != 1 ) return _debug("socket closed, cmd - " + cmd + " ignored" );

		_debug( "running", cmd, opts || '' );

		var out = { cmd: cmd };
		if( opts ){
			supported_opts.forEach(function(e){
				if( opts.hasOwnProperty(e) ) out[e] = opts[e];
			});
		}

		_log( 1, "sending cmd " + JSON.stringify(out) );
		_cache.last_command = cmd;
		self.connection.send( JSON.stringify( out ) );
	};
	
	self.connection.onopen = function( e ) {
		_log( 0, "socket opened");
		_debug("socket opened");
		
		return start();
	};

	self.connection.onclose = function( e ) {
		_log( 0, "socket closed");
	};

	self.connection.onerror = function( e ) {
		_log( 0, "socket error");
		return eventManager.publish(options.events.start.fail, "Возможо не запущен .exe файл, ответственный за устройство или некорректно указан ком-порт или сокет-порт в конфигурации");
	};

	self.connection.onmessage = function( e ) {
		_log( -1, "answer - " + e.data );
		_debug( "in socket", e.data);

		var data = e.data;
		try {
			data = JSON.parse(data);
		} catch( e ){
			return console.error("JSON Parse error");
		}
		
		proceedMessage( data );
	}; 
	///////////////////////////////////////////////////////////////////////////
	
	function proceedMessage( message ){
		if( !message.cmd ) return;
		if( message.cmd === COMMANDS.TOUCHED ) return _onTouched(message);
	
		if(  _cache.last_command && _cache.last_command !== message.cmd ){
			return _debug("Another command received - " + message.cmd + ". Expected - " + _cache.last_command);
		}
		
		switch( message.cmd ){
			case COMMANDS.START: return _onStart(message);
			// case COMMANDS.STOP:
			// 	_cache.stopped = true;
			// 	_debug("Device is stopped");
			// 	break;
			case COMMANDS.PAYMENT: return _onPayment(message);
			case COMMANDS.CANCEL : return _onCancel(message);
		}
	};
	
	var once = true;
	function _onStart( data ){
		if( !once ) return;
		once = false;

		if( data.code === "00" ){
			if( data.description === "successful tcp connection" ) {
				once = true;	/// пробуем заигнорить первое сообщение которое он мне присылает
				return;			/// и пытаемся дождаться следующего сообщения "description":"the device started"
			}
			clearTimeout( _cache.start_timeout );
			_cache.started = true;
			return eventManager.publish(options.events.start.done)
		}
		
		clearTimeout( _cache.start_timeout );
		var message = ERROR_CODES[data.code];
		if( message === void 0 ) message = data.description || "Неизвестная ошибка - код " + data.code;
		
		return eventManager.publish( options.events.start.fail, message);
	};
	
	function _onPayment( data ){
		if( !_cache.payment_started ) return;	/// если платеж не был начат, ничего не делаем
		
		clearTimeout( _cache.payment_timeout );
		clearTimeout( _cache.message_timeout );
		
		_cache.payment_started = false;
		_cache.stopped = true;

		if( data.code === "00" ){
			return eventManager.publish(options.events.payment.done, data.description || "" )
		}

		var message = ERROR_CODES[data.code];
		if( message === void 0 ) message = data.description || "Неизвестная ошибка - код " + data.code;
		
		return eventManager.publish( options.events.payment.fail, message);
	};
	
	function _onCancel( data ){
		if( !_cache.payment_started ) return;
		clearTimeout(_cache.message_timeout);
		
		if( data.code === "00" ){
			//return eventManager.publish(options.events.cancel.done, data)
			//return eventManager.publish(options.events.payment.fail, data)		//// ABORT fail ??
			//return eventManager.publish( options.events.critical, "Unexpected cancel result with code 00");
			//// Евген сказал невозможно, скорее всего должен перехватить payment.done....
			_log( 0, "Unexpected cancel result with code 00", data)
			_debug("Unexpected cancel result with code 00")
			return;
		}
		
		clearTimeout( _cache.payment_timeout );
		_cache.payment_started = false;
		_cache.stopped = true;

		var message = ERROR_CODES[data.code];
		if( message === void 0 ) message = data.description || "Неизвестная ошибка - код " + data.code;
		
		return eventManager.publish( options.events.payment.fail, message);
	};

	function _onTouched( data ){
		if( !_cache.started || _cache.stopped || _cache.payment_started ) return;

		eventManager.publish( options.events.touched, data );
	};
	
	///////////////////////////////////////////////////////////////////////////
	function showUseMessage( delay ){
		if( !options.disableUsePosMessage )
			_cache.message_timeout = setTimeout( eventManager.publish, delay || 500, options.events.message, "Воспользуйтесь POS терминалом" );		
	};

	/// payment - amount в рублях, currency можно не передавать совсем, т.к. можно задать в ini
	function payment( amount, currency ){
		if( _cache.payment_started ){
			_log( 0, "Payment is already started, new payment aborted");
			return;
		}
		
		if( options.isFake ){
			showUseMessage();
			_cache.payment_started = true;
			return setTimeout( _onPayment, 3000, options.scenario.payment.data );
		}
		
		if( !_cache.started || _cache.stopped ){
			_log( 0, "Device is stopped, payment aborted");
			_debug("Device is stopped");
			return eventManager.publish(options.events.payment.fail);
		}

		if( options.disableCurrencySelector ) {
			currency = void 0;
		} else {
			if( !currency ) currency = options.defaultCurrency || "rub";
		}
		
		amount = "" + Math.round( amount * 100 );

		if( !amount ) return;
		
		_cache.payment_started = true;
		_send(COMMANDS.PAYMENT, { amount: amount, curr: currency}); //// curr можно задать в конфиге
		
		//// Еще среди параметров можно было передать, название товара, id товара и QR код....
		///// product_name, product_id, QR_code - все в виде строк

		if( options.paymentTimeout >= 40000 )
			_cache.payment_timeout = setTimeout( _onPayment, options.paymentTimeout, {"cmd":"payment","code":"-10","description":"payment internal timeout"} );
		showUseMessage();
	};
	
	function start(){
		if( _cache.started ) return _debug("Device is started already");
		
		//_onStart( {"cmd":"start","code":"00","description":"Vendotek 0.2 without start Started"} );

		_send( COMMANDS.START );
		if( options.startTimeout )
			_cache.start_timeout = setTimeout( _onStart, options.startTimeout, {"cmd":"start","code":"-11","description":"Start timeout"} );
	};

	function stop(){
		if( _cache.stopped ) return _debug("Device is already stopped");

		if( _cache.payment_started ){
			return cancel();
		}

		_cache.stopped = true;
		// _send(COMMANDS.STOP);
	};
	
	function cancel(){
		if( !_cache.payment_started ){
			_log( 0, "Payment is stopped, cancel aborted");
			_debug("Payment is stopped");
			return;
		}
		
		if( options.isFake ){
			return setTimeout( _onCancel, 1000, options.scenario.cancel.data );
		}

		if( !_cache.started || _cache.stopped ){
			_log( 0, "Device is stopped, cancel aborted");
			_debug("Device is stopped");
			return;
		}

		_send(COMMANDS.CANCEL);
	};

	self.getActualReport = _ => ( _cache.started ? ({ started: true }) : ({ started: false, fake: options.isFake }) );

	self.stop = stop;		/// остановка девайса (становится неактивным)
	self.cancel = cancel;	/// прерывание приема платежа
	self.payment = payment;	/// начало платежа (сумма в копейках, + можно указать валюту - либо берется по умолчанию)
};