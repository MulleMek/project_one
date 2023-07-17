function Printer( options, eventManager, Logger ) {
	
	var self = this;

	if( options.ignoreCriticalErrors === void 0 ) options.ignoreCriticalErrors = false;

	var CMDS = {
		INIT: 'getStatus',
		PRINT: 'print'
	};

	var ERRORS = {
		NODEVICES: 'Не удалось подключиться к веб-сокету. Скорее всего не запущен Printers.exe или порт указан не верно'
	};

	const CRITICAL = [ 'PRINTER_NOT_FOUND', 'PRINTER_NOT_FIND', 'ERROR', 'PAPER_JAM', 'PAPER_OUT', 'PAPER_PROBLEM', 'PENDING_DELETION', 'DOOR_OPEN', 'SERVER_OFFLINE', 'USER_INTERVENTION' ];
	const MESSAGE = {
		// Все возможные ошибки
		NO_STATUS_MONITOR: "0x11111111 Статус CePrnStatusMonitor не запущен",
		READY: "0x00000000 Принтер готов",
		PAUSED: "0x00000001 Принтер приостановлен",
		ERROR: "0x00000002 Принтер находится в состоянии ошибки",
		PENDING_DELETION: "0x00000004 Принтер удаляется",
		PAPER_JAM: "0x00000008 Бумага застряла в принтере",
		PAPER_OUT: '0x00000010 Статус принтера: В принтере закончилась(или отсутствует) бумага',
		MANUAL_FEED: "0x00000020 Принтер находится в состоянии ручной подачи",
		PAPER_PROBLEM: '0x00000040 Статус принтера: В принтере возникли проблемы с бумагой',
		OFFLINE: "0x00000080 Принтер в офлайне",
		IO_ACTIVE: "0x00000100 Принтер находится в активном состоянии ввода/вывода",
		BUSY: "0x00000200 Принтер занят",
		PRINTING: "0x00000400 Принтер печатает",
		OUTPUT_BIN_FULL: "0x00000800 Выходной лоток принтера заполнен",
		NOT_AVAILABLE: "0x00001000 Принтер недоступен для печати",
		WAITING: "0x00002000 Принтер ждет",
		PROCESSING: "0x00004000 Принтер обрабатывает задание на печать",
		INITIALIZING: "0x00008000 Принтер инициализируется",
		WARMING_UP: "0x00010000 Принтер прогревается",
		TONER_LOW: "0x00020000 Уровень тонера низкий",
		NO_TONER: "0x00040000 На принтере нет тонера",
		PAGE_PUNT: "0x00080000 Принтер не может распечатать текущую страницу",
		USER_INTERVENTION: "0x00100000 У принтера есть ошибка, требующая от пользователя чего-то сделать",
		OUT_OF_MEMORY: "0x00200000 В принтере закончилась память",
		DOOR_OPEN: "0x00400000 Открыта дверца принтера",
		SERVER_UNKNOWN: "0x00800000 Состояние принтера неизвестно",
		POWER_SAVE: "0x01000000 Принтер находится в режиме энергосбережения",
		SERVER_OFFLINE: "0x02000000 Состояние принтера отключено",
		DRIVER_UPDATE_NEEDED: "0x04000000 Состояние принтера - требуется обновление драйвера",
	};

	const CODES = {
		"PAUSED":             0x00000001,
		"ERROR":             0x00000002, 
		"PENDING_DELETION":  0x00000004,
		"PAPER_JAM":         0x00000008,
		"PAPER_OUT":         0x00000010,
		"MANUAL_FEED":       0x00000020,
		"PAPER_PROBLEM":     0x00000040,
		"OFFLINE":           0x00000080,
		"IO_ACTIVE" :        0x00000100,
		"BUSY" :             0x00000200,
		"PRINTING" :         0x00000400,
		"OUTPUT_BIN_FULL":   0x00000800,
		"NOT_AVAILABLE":     0x00001000,
		"WAITING"      :     0x00002000,
		"PROCESSING"  :      0x00004000,
		"INITIALIZING" :     0x00008000,
		"WARMING_UP"  :      0x00010000,
		"TONER_LOW"   :      0x00020000,
		"NO_TONER"    :      0x00040000,
		"PAGE_PUNT"   :      0x00080000,
		"USER_INTERVENTION": 0x00100000,
		"OUT_OF_MEMORY":     0x00200000,
		"DOOR_OPEN"   :      0x00400000,
		"SERVER_UNKNOWN":    0x00800000,
		"POWER_SAVE"   :     0x01000000,
		"SERVER_OFFLINE":    0x02000000,
		"DRIVER_UPDATE_NEEDED":    0x04000000,
	};

	/***************************************************************/
	/* PRIVATE */
	/***************************************************************/
	function checkStatusCode( statuscode ){
		statuscode = parseInt( statuscode, 16 );
		if( !statuscode ) return [];  
		let out = [];
		Object.entries(CODES).forEach( ([key, code]) => ( statuscode & code ) ? out[out.length] = key : null );
		return out;
	};

	function onMessage(data, events) {
		self.status_code = data.error;
		if( data.data && data.data.indexOf("PRINTER_NOT") > -1 ){
			self.status = [ data.data ];
			self.status_code = -1;
		} else {
			self.status = checkStatusCode(data.error);
		}

		let status = getLastStatus();
		if( !options.ignoreCriticalErrors && status.critical ){
			return eventManager.publish( events['fail'], status.message );
		}

		return eventManager.publish(events['done']);
	};

	function _log( type, msg, ...data ){
		if( !Logger || !Logger.log ) return;
		switch (type) {
			case -1: type = "<-----"; break;
			case 1:  type = "----->"; break;
			default: type = "------"; break;
		}
		return Logger.log( [type, options.deviceName, msg, JSON.stringify([...data]) ].join(" ") );
	};
	function _debug( msg, ...data ){
		if( options.debug ) console.log( options.deviceName, msg, ...data );
	};

	/***************************************************************/
	/* SOCKET */
	/***************************************************************/
	if ( options.isFake ) {
		self.connection = { readyState: 1, send: function(data){ console.log("fake send", data)} };
		_log(-1, "starting in fake mode");
		setTimeout( eventManager.publish, 3000, options.events.start[ options.scenario.start.error ? 'fail' : 'done' ] );
	} else {
		self.connection = new WebSocket( options.uri );
	}


	self.connection.onopen = function( e ) {
		_log( -1, "socket opened");
		_debug( 'socket opened' );
		self.status = [];
		send({ cmd: CMDS.INIT });
	};

	self.connection.onclose = function( e ) {
		_log(0, "socket closed");
		_debug( "socket closed" );
	};

	self.connection.onerror = function( e ) {
		_log(0, "socket error");
		return eventManager.publish(options.events.start.fail, [ERRORS.NODEVICES]);
	};

	self.connection.onmessage = function ( e ) {
		_log(-1, "answer - ", e.data);
		_debug( 'in socket', e.data);

		var data = e.data;
		try {
			data = JSON.parse(data);  
		} catch( err ){
			console.error(err);
		}

		if( !data || !data['function'] ) return;

		switch ( data['function'] ) {
			case CMDS.INIT: return onMessage(data, options.events.start);
			case CMDS.PRINT: return onMessage(data, options.events.print);
		}
	};

	///////////////////////////////////////////
	function send(cmd) {
		var _stringCmd = JSON.stringify(cmd);

		_debug('sending', _stringCmd);
		_log(1, 'send cmd', _stringCmd);

		if ( self.connection.readyState != 1 ) return _debug('socket closed');

		self.connection.send(_stringCmd);
	};

	function printDocument( html_document ) {
		if ( html_document === void 0 ) throw 'No document html_document in printDocument()';

		if ( options.isFake ) {
			console.log( "Wanna print document: ", html_document );
			return eventManager.publish(options.events.print[ options.scenario.print.error ? 'fail' : 'done' ]);
		}

		send({ cmd: CMDS.PRINT, data: html_document });
	};

	function getLastStatus(){
		if( options.isFake ) return options.scenario.fakeStatusCode;
		if( !Array.isArray(self.status) ) self.status = [];
		var out = {
			message: "",
			codes: self.status,
			code: self.status_code,
			critical: false,
		};

		if ( Array.isArray(self.status) && self.status.length && self.status.some( e => CRITICAL.indexOf(e) > -1 ) ) {
			out.message = self.status.map( e => (MESSAGE[e] || "") ).join("; ");
			out.critical = true;
		}

		return out;
	};
	

	this.print = printDocument;
	this.getLastStatus = getLastStatus;
	this.getActualReport = getLastStatus;
}