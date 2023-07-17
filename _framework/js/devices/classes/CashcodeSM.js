function CashcodeSM( options, eventManager, Logger ) {
	var self = this,
		_cache = {
			noStack: false,
			accepted: 0,
			inserted: null,
			started: null,
			stopped: null,
		};
	const billTypes = [ 10, 50, 100, 200, 500, 1000, 2000, 5000 ];
	const supported_opts = [ 'stackControl', 'billtype' ];
	
	if( options.maxAccept ) options.isStackControlEnabled = true;
	
	/***************************************************************/
	/* STATIC */
	/***************************************************************/
	var COMMANDS = {
			RESET: 'reset',
			START_POLLING: 'start',
			STOP_POLLING: 'stop',
			PAYBACK: 'return',
			STACK: 'stack',
		},
		ERROR_LIST = {
			"STACK_FULL": "Drop Cassette Full",
			"STACK_ABSENT": "Drop Cassette out of position",
			"DROP_CASSETTE_REMOVED": "Drop Cassette out of position",
			"JAMMED":   "A bill has jammed in the acceptance path",
			"CASSETTE_JAMMED": "Drop Cassette Jammed",
			"CHEATED":  "Bill Validator sends this event if the intentions of the user to deceive the Bill Validator are detected",
			"PAUSE":    "When the user tries to insert a second bill when the previous bill is in the Bill Validator but has not been stacked. Thus Bill Validator stops motion of the second bill until the second bill is removed",
			"POLL_NO_STARTED" : "CRC err. Проблемы со связью",
			"POLL_STOPPED_AFTER_START": "Polling err. Проблемы со связью",
			"CONFIG" : "Check config. There are no bills to accept enabled",
			"TIMEOUT": "Device take too long to load",
		},
		/**
		 * 0x50: "Stack Motor Failure (Drop Cassette Motor failure)"; 
		 * 0x51: "Transport Motor Speed Failure";
		 * 0x52: "Transport Motor Failure";
		 * 0x53: "Aligning Motor Failure";
		 * 0x54: "Initial Cassette Status Failure";
		 * 0x55: "Optic Canal Failure";
		 * 0x56: "Magnetic Canal Failure";
		 * 0x5f: "Capacitance Canal Failure";
		 */
		MESSAGE_TYPES = {
			WAITING_FOR_BILL: 'WAITING_FOR_BILL',
			ACCEPTING: 'Accepting',
			BILL_INSERTED: 'BILL_INSERTED',  //BILL_INSERTED:XX
			BILL_STACKED: 'BILL_STACKED',    //BILL_STACKED:XX
			BILL_RETURNED: 'BILL_RETURNED',  //BILL_RETURNED:XX
			
			DEVICE_BUSY: 'DEVICE_BUSY',      //DEVICE_BUSY:XX Bill Validator cannot answer with a full-length message right now. On expiration of time XX, peripheral is accessible to polling. XX is expressed in multiple of 100 milliseconds
			CASSETTE_REMOVED: 'DROP_CASSETTE_REMOVED',
			CASSETTE_JAMMED: 'CASSETTE_JAMMED',
			STACK_FULL: 'STACK_FULL',
			STARTED:    'POLL_STARTED',
			STOPPED: 'POLL_STOPPED',
			NOT_STARTED: 'POLL_NO_STARTED',
			NOT_STARTED2: 'POLL_STOPPED_AFTER_START',
			START_RESETTING: 'START_RESETTING',
			RESETTED: 'RESETTED',
		};
	/***************************************************************/
	/* PRIVATE HELPERS */
	/***************************************************************/
	let _startOptions = {};
	function _onSocketOpened() {
		if( !options.disableTimeoutCheck ){ // Start Timeout
			clearTimeout(_cache.timeoutid);
			_cache.timeoutid = setTimeout( _onPollingStarted, 17 * 1000, 'TIMEOUT' );  
		}
		var ops = { };
		// генерим доп параметры
		if( options.isStackControlEnabled !== void 0 ){
			ops.stackControl = !!options.isStackControlEnabled;
		}
		if( Array.isArray( options.disabledBills ) && options.disabledBills.length ){
			ops.billtype = billTypes.map(function(e){
				if( options.disabledBills.indexOf( e ) > -1 ){ return { bill: e, enabled: false, escrowed: false }; }
				return { bill: e, enabled: true, escrowed: true };
			});
			if( !ops.billtype.some(e => e.enabled && e.bill !== 200 && e.bill !== 2000 ) ){
				_debug('wanna disable bills:', ops.billtype );
				return eventManager.publish( options.events.start.fail, ERROR_LIST['CONFIG'] );
			}
		}
		
		if( !Object.keys(ops).length ){ ops = null; }
		
		_startOptions = ops;
		return _send( COMMANDS.START_POLLING, ops ); 
	};
	function _fakeMoneyInsert() {
		if ( options.scenario.insert.error || !options.isFake ) { return; } 
		setTimeout(function(){
			options.scenario.insert.data.forEach(function(sum, indx){
				setTimeout( 
						eventManager.publish, 
						options.scenario.insert.timeouts.interval * 1000 * indx, 
						options.events.inserted, 
						sum 
					);
			});
		}, options.scenario.insert.timeouts.start * 1000);
	};
	
	const critical_list = ["Power Up with Bill in Validator", "Power Up with Bill in Stacker", /*"TIMEOUT",*/ /*"BillTableList not initialized!"*/ ];
	function _onPollingStarted( err ) {
		
		if( _cache.started !== null ){ return; }
		if( _cache.timeoutid ){ clearTimeout( _cache.timeoutid ); _cache.timeoutid=null; }
		
		if( !err ){
			_cache.started = true;  
			return eventManager.publish( options.events.start.done );
		}
		
		_cache.started = false;
		self.stop();   // на случай, если все совсем плохо
		
		// if( critical_list.indexOf(err) > -1 ) {
		// 	setTimeout(self.reset, 700); /// капец, как все плохо
		// }

		eventManager.publish( options.events.start.fail, ERROR_LIST[ err ] || err );
	};
	
	const ok_codes = ["0x00","0x80","0x81","0x82","0x15"];
	function proceedMessage( message ) {
		if( _cache.started === null ){
			if( message.cmd === "start" ){
				if ( Object.keys( ERROR_LIST ).indexOf( message.data ) > -1 || ok_codes.indexOf(message.error) === -1 )
					return _onPollingStarted( message.data );
				if ( message.data === "unknown error" )
					return _onPollingStarted( message.data + " - " + message.error );
			}
			if( message.cmd === "status" && ok_codes.indexOf(message.error) === -1 ){
				return _onPollingStarted( message.data );
			}
			
			switch ( message.data ){
				case MESSAGE_TYPES.WAITING_FOR_BILL:
				case MESSAGE_TYPES.ACCEPTING:
					_cache.stopped = null;
					_onPollingStarted();
					break;
				case MESSAGE_TYPES.NOT_STARTED:
				case MESSAGE_TYPES.NOT_STARTED2:
					_onPollingStarted( message.data );
					break;
				case MESSAGE_TYPES.STARTED:
					options.isStackControlEnabled = message.stackControl;
					break;
				case MESSAGE_TYPES.STOPPED:
					_cache.stopped = true;
					break;
			}
			return;
		}
		switch ( message.data ){
			
			case MESSAGE_TYPES.STOPPED:
				_cache.stopped = true;
				//eventManager.publish( options.deviceName + '/' + EVENTS.POLLING.STOPPED, null, 'info' );
				break;
			
			case MESSAGE_TYPES.WAITING_FOR_BILL:
			case MESSAGE_TYPES.ACCEPTING:
				_cache.stopped = null;
				break;

			case MESSAGE_TYPES.BILL_INSERTED:
				if( message.curr && message.curr === "BAR" ) break;
				_cache.inserted = Number( message.cash ) || 0;
				if ( !_cache.inserted ) { return false; }
				
				if( options.isStackControlEnabled ) {  // можно проверять еще curr: "RUB"
					if( _cache.accepted === options.maxAccept ) _cache.needtostop = true;      /// дополнительно стопаю если приняли максимум при следующей купюре, но можно было бы чекать в Stacked
					( _cache.accepted + _cache.inserted > options.maxAccept ) ? self.payback() : self.stack();
				}    
				break;
			case MESSAGE_TYPES.BILL_STACKED:
				if( message.curr && message.curr === "BAR" ) break;
				if( options.escrowDisabled ) _cache.inserted = Number(message.cash); // на случай, если будут выключать escrow для некоторых купюр
				if( !_cache.inserted || _cache.inserted !== Number(message.cash) ) break;
				_cache.accepted += _cache.inserted;
				if ( eventManager ) eventManager.publish( options.events.inserted, [_cache.inserted]);
				_cache.inserted = 0;
				if( _cache.needtostop ) self.stop();
				break;
			case MESSAGE_TYPES.BILL_RETURNED:
				if( message.curr && message.curr === "BAR" ) break;
				if( !_cache.inserted || _cache.inserted !== Number(message.cash) ) break;
				_cache.inserted = 0;
				if( _cache.needtostop ) self.stop();
				break;
			case MESSAGE_TYPES.STARTED:   // т.к. может прийти позже
				options.isStackControlEnabled = message.stackControl;
				//_cache.stopped = null;
				break;
		}
	};
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
	/***************************************************************/
	/* WEBSOCKET */
	/***************************************************************/
	if ( options.isFake ) {
		self.connection = { readyState: 1 };
		_log( -1, "starting in fake mode");
		setTimeout(
			eventManager.publish,
			1000,
			options.events.start[( ( options.scenario.start.error )? "fail" : "done")]
		);
		if( !options.scenario.start.error && !options.scenario.insert.error )
			setTimeout( _fakeMoneyInsert, 1500 );
	} else {
		self.connection = new WebSocket( options.uri );
	}
	function _send(cmd, opts) {
		if ( self.connection.readyState != 1 ) {
			return console.log( options.deviceName, "socket closed");
		}
		_log( 1, "sending cmd " + cmd + ((opts) ? ' '+ JSON.stringify(opts) : '') );
		_debug( "running", cmd, opts || '' );
		var out = { cmd: cmd };
		if( opts ){
			supported_opts.forEach(function(e){
				if( opts.hasOwnProperty(e) ) out[e] = opts[e];
			});
		}
		self.connection.send( JSON.stringify( out ) );
	};
	self.connection.onopen = function( e ) {
		_log( 0, "socket opened");
		_debug("socket opened");
		
		return _onSocketOpened();
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
	/***************************************************************/
	/* API */
	/***************************************************************/
	self.stop = function() {
		if( _cache.stopped ){ return _debug("Already stopped"); }
		if( options.isFake ) { return _debug("stopping in fake mode"); }
		if( _cache.inserted ){ _cache.needtostop = true; return _debug("Banknote in acceptor. Will stop later"); }
		_send( COMMANDS.STOP_POLLING );
	};
	
	self.payback = function() {
		_send( COMMANDS.PAYBACK );
	};
	self.stack = function() {
		// проверка на fake......
		_send( COMMANDS.STACK );
	};
	self.reset = function() {
		if( options.isFake ){ return _debug( "resetted in fake mode" ); }
		_send( COMMANDS.RESET );   ///   не работает??
	};
}
	
	// Доп опции
	// const billtype = [
		//{ "bill":10, "enabled":true,   "escrowed":true },
		//{ "bill":50, "enabled":true,   "escrowed":true },
		//{ "bill":100, "enabled":true,  "escrowed":true },
		//{ "bill":200, "enabled":true,  "escrowed":true },
		//{ "bill":500, "enabled":true,  "escrowed":true },
		//{ "bill":1000, "enabled":true, "escrowed":true },
		//{ "bill":2000, "enabled":true, "escrowed":true },
		//{ "bill":5000, "enabled":true, "escrowed":true },
		//
		// если будем отправлять пустой массив, тогда надо генерить ошибку... и не запускать!
		// т.к. иначе будет трабла со стартом
	// ];
	// options.escrowDisabled = true;
	// если для какой-то купюры будет выключен escrow, тогда нужен флаг!
	// т.к. не будет приходить inserted
	// options.disabledBills = [ 500, 1000, 5000 ];
	// будет принимать автоматом все купюры кроме
	// а это можно прокинуть через deviceManager
	// options.isStackControlEnabled    // будет срабатывает если есть escrow (по умолчанию есть)
	// options.maxAccept                // иначе не будет inserted и не отследить
	// 
	// + дополнительно добавил timeout на start
	// вполне можно сделать так, чтобы была проверка, только если вдруг указано в конфиге
	// options.disableTimeoutCheck = true;
