function MEI(options, eventManager, Logger) {

	var self = this,
		_cache = {
			inserted: 0,
			accepted: 0,
			started: null,
		};

	const COMMANDS = {
			OPEN: 'open',
			CLOSE: 'close',
			STACK: 'stack',
			RETURN: 'return',
			RESET: 'softReset'
		};

	const ANSWERS = {
			STACKED: 'Stacked',
			RETURNED: 'Returned',	/// ??? или мб Rejected
			CONNECTED: 'Connected',
			ERRORS: {
				// CASSETE_FULL: 'Cassette Full',
				JAM: 'Jam Detected',
				FAILURE: 'Failure',
				UNABLE_TO_OPEN: 'Unable to open',
			},
			INSERTED: {
				RUB: 'RUB',
				EUR: 'EUR',
				PREFIX: 'Escrowed',
				// PREFIX: 'Bill = '
			}
		};

	const billTypes = [ 10, 50, 100, 200, 500, 1000, 2000, 5000 ];
	
	// if( options.maxAccept ) options.isStackControlEnabled = true;
	options.isStackControlEnabled = true;	/// включен всегда


	/***************************************************************/
	/* PRIVATE */
	/***************************************************************/
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


	function containsBase(where, what, arrayCallbackName) {
		if (!Array.isArray(what)) what = [what];

		if (!arrayCallbackName || typeof Array.prototype[arrayCallbackName] !== 'function')
			arrayCallbackName = 'some';

		return what[arrayCallbackName]( elem => where.indexOf(elem) > -1 );
	}

	function contains(where, what) { return containsBase(where, what); }
	function containsAny(where, what) { return containsBase(where, what, 'some'); }
	function containEvery(where, what) { return containsBase(where, what, 'every'); }


	/***************************************************************/
	/* DEVICE SPECIFIC */
	/***************************************************************/
	function open() { send(COMMANDS.OPEN); }
	function close() { send(COMMANDS.CLOSE); }
	function stack() { setTimeout( _ => send(COMMANDS.STACK), 500); }
	function payback() { setTimeout( _ => send(COMMANDS.RETURN), 500); }

	const regexp = new RegExp('Bill = ([a-zA-Z]+) ([0-9]+)');
	function parseInsertMessage(message) {
		let result = regexp.exec(message);

		if( !result ) return false;
		return { type: result[1], count: +(result[2]) };
	};

	function parseMessage(message) {
		if( !message ) return;

		switch (true) {
			/***************************************************************/
			/* ERROR */
			/***************************************************************/
			case containsAny(message, ANSWERS.ERRORS):
				clearTimeout(_cache.timeout_id);
				if( _cache.started !== null ) break;
				_cache.started = false;
				eventManager.publish(options.events.start.fail, message);
				break;

			/***************************************************************/
			/* CONNECTED */
			/***************************************************************/
			case contains(message, ANSWERS.CONNECTED):
				clearTimeout(_cache.timeout_id);
				if( _cache.started !== null ) break;
				eventManager.publish(options.events.start.done);
				_cache.started = true;
				break;

			/***************************************************************/
			/* JAMMED */
			/***************************************************************/
			case contains(message, ANSWERS.ERRORS.JAM):
				eventManager.publish(options.events.jammed);
				break;

			/***************************************************************/
			/* INSERTED */
			/***************************************************************/
			case contains(message, ANSWERS.INSERTED.PREFIX):
				let inserted = parseInsertMessage(message);
				if( !inserted ) break;

				/* type: 'EUR/RUR', count: {number} */
				_cache.inserted = inserted.count;
				if( options.isStackControlEnabled ){
					if( options.maxAccept && _cache.accepted === options.maxAccept ) _cache.needtostop = true;
					if( options.maxAccept && _cache.accepted + _cache.inserted > options.maxAccept ) {
						return payback()
					}
					return stack();
				}
				break;

			/***************************************************************/
			/* STACKED */
			/***************************************************************/
			case contains(message, ANSWERS.STACKED):
				if( contains(message, 'No Value') ) break;

				let i = parseInsertMessage(message);
				if( !i ) break; 
				_cache.accepted += i.count;
				_cache.inserted = 0;
				eventManager.publish(options.events.inserted, [ i.count, i.type ]);
				if( _cache.needtostop ) stop();
				break;

			/***************************************************************/
			/* RETURNED */
			/***************************************************************/
			case contains(message, ANSWERS.RETURNED):
				// if( contains(message, 'No Value') ) break;

				_cache.inserted = 0;
				if( _cache.needtostop ) stop();
				break;
		}
	};


	/***************************************************************/
	/* SOCKET */
	/***************************************************************/
	if (options.isFake) {
		self.connection = { readyState: 1, send: _ => _ };
		setTimeout(
			eventManager.publish,
			3000,
			options.events.start[((options.scenario.start.error) ? 'fail' : 'done')]
		);
		if( !options.scenario.start.error && !options.scenario.insert.error )
			setTimeout( fakeMoneyInsert, 5000 );
	} else {
		self.connection = new WebSocket(options.uri);
	}


	self.connection.onmessage = function (e) {
		_log( -1, "answer - " + e.data );
		_debug( "in socket", e.data );

		return parseMessage(e.data);
	};

	self.connection.onopen = function (e) {
		_log( 0, "socket opened");
		_debug("socket opened");

		clearTimeout(_cache.timeout_id);
		_cache.timeout_id = setTimeout( eventManager.publish, 15000, options.events.start.fail, "TIMEOUT");

		open();
	};

	self.connection.onclose = function (e) {
		_log( 0, "socket closed");
		_debug("socket closed");
		_cache.stopped = true;
	};

	self.connection.onerror = function (e) {
		_log( 0, "socket error");
		_debug("socket error");
		return eventManager.publish(options.events.start.fail, "Возможо не запущен .exe файл, ответственный за устройство или некорректно указан ком-порт или сокет-порт в конфигурации");
	};

	//FAKE INSERT
	function fakeMoneyInsert() {
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



	function send(cmd) {
		if (self.connection.readyState != 1) {
			return console.log(options.deviceName + ' socket closed');
		}

		_log( 1, "send cmd - " + cmd);
		_debug( "send cmd", cmd);

		self.connection.send(cmd);
	};

	function stop() {
		if( _cache.stopped ) return _debug("Already stopped");
		if( options.isFake ) return _debug("Stopping in fake mode");
		if( _cache.inserted ){ _cache.needtostop = true; return _debug("Banknote in acceptor. Will stop later"); }

		_debug("stop mei");
		_log(0, "stop");
		
		close();
		self.connection.close();
		// _cache.stopped = true;
	};

	return {
		stop: stop,
	};
};