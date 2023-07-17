function LCDM200( options, eventManager, Logger ) {

	var connection = null;
	var _cache = {
			state: '',
			request: null
		};
	
	const COMMANDS = {
		GET_STATUS: 'statusDisp',
	};
	const STATES = {
		INIT: 'init',
		DISPENSE: 'dispense',
		IDLING: 'idle'
	};
	const ANSWERS = {
		PORTOPENERR: [ "Er0", "Er61", "Er65", "Er6f" ],		//	нет связи. //возможно еще Er61 // может прислать в сокете еще ERROR_COMM_INVALIDHANDLE // 65 6f было у Росинки
		OK: [ "Er31", "Er30" ],
		CRITICAL: [ 
			{ code: "Er32",	status: "PickUp Error - Ошибка захвата купюры"} ,
			{ code: "Er33",	status: "Jam in the CHK sensor 1\/2 part - Зажим купюры в районе CHK-сенсора"} ,
			{ code: "Er34",	status: "Over release of bill - Переполнение купюрами"} ,
			{ code: "Er35",	status: "Jam in the exit sensor part - Зажим купюры в районе EXIT-сенсора или EJT-сенсора"} ,
			{ code: "Er36",	status: "Jam in the div sensor part - Зажим купюры в районе DIV-сенсора"} ,
			{ code: "Er37",	status: "Incompletion of release in 60 seconds"} ,
			{ code: "Er38",	status: "В кассете отсутствуют купюры"} ,
			{ code: "Er3b",	status: "Request bill quantity is over 20 - Неверное количество запрашиваемых купюр (ошибка протокола)"} ,
			{ code: "Er3c",	status: "There is difference in bill data between DIV Sensor & EJT Sensor - Ошибка подсчета (данные датчиков DIV и EJT разнятся)"} ,
			{ code: "Er3d",	status: "There is difference in bill data between EJT Sensor & Exit Sensor - Ошибка подсчета (данные датчиков EJT и EXIT разнятся)"} ,
			{ code: "Er3e",	status: "Error in sensor"} ,
			{ code: "Er3f",	status: "Reject tray is not closed - Кассета корзины не найдена (не пристутствует в диспенсере)"} ,
			{ code: "Er40",	status: "Dispensed bill fail to arrive at the Exit Sensor within 15 seconds"} ,
			{ code: "Er41",	status: "Stop or lowspeed of Motor - Низкое питание или поломка мотора"} ,
			{ code: "Er42",	status: "Jam in the DIV Sensor part - Зажим купюры в районе DIV-сенсора"} ,
			{ code: "Er43",	status: "Timeout between DIV sensor and EJT sensor - Таймаут прохождения купюры между сенсорами DIV и EJT"} ,
			{ code: "Er44",	status: "Переполнение кассеты корзины"} ,
			{ code: "Er45",	status: "No Upper or Lower cassete - Кассета отсутствует" },
			{ code: "Er47",	status: "Таймаут выдачи средств"} ,
			{ code: "Er49",	status: "Ошибка дивертера соленоида или сенсора соленоида"} ,
			{ code: "Er4a",	status: "Ошибка сенсора соленоида"} ,
			{ code: "Er4c",	status: "Jam in the CHK Sensor 3\/4 part"} ,
			{ code: "Er4e",	status: "Ошибка самоочистки (зажим в районе DIV-сенсора)"} ,
		]	
		//		часть из них только в момент выдачи - аля 38 или 46 47 
		//		
		//		хотя был момент во время старта Er38 Er46
		//		
		//		{ code: "Er46",	status: "???"} ,			
		//		///	скорее всего таймаут выдачи средств или что-то около ( т.к. был момент с попыткой выдачи купюр из почти пустой (или пустой) кассеты)
		//		///	 хотя приходит почти сразу после команды	
		//		///	 но при этом LoNearEnd_1
		//		///	 получается ошибка связанна с пустой кассетой...
	};

	///	был момент у парковок что после dispense пришел в сокет ERROR_COMM_INVALIDHANDLE

	///// OPTIONS
	/// disableAlwaysStart
	/// oneCassette
	/// mergeLastError

	if( options.mergeLastError === void 0 ) options.mergeLastError = true;

	/***************************************************************/
	/* PRIVATE Functions */
	/***************************************************************/

	function _checkCrit( data ){
		var out = null;
		ANSWERS.CRITICAL.some( (e) => (( e.code === data) ? out = e.code + ' - ' + e.status || '' : false) );
		return out;
	};

	function _parseString( str ){
		var out = {};
		(""+str).split("_")
			.map( e => e.match(/^(St|Up|Lo|Rej)(?:(?:(Er)([0-9a-f]{2}))|(?:([a-zA-Z]{1,})(\d{1,})))$/) )
			.filter( e => !!e )
			.map( e => e.filter( s => s !== void 0 ) )
			.forEach( e => {
				if( !e || !e[1] || !e[2] || !e[3] ) return;
				if( !out[e[1]] ) out[e[1]] = {};
				out[e[1]][e[2]] = e[3];
			});

		if( !Object.keys(out).length ) return null;

		Object.entries( out ).forEach( ([k, data]) => {
			if( !data ) return;
			Object.entries(data).forEach( ([m, data]) => {
				if( m !== "Er" ) out[k][m] = parseInt(data, 10) || 0;
			});
		});
		return out;
	};

	const cassetes = ["Up", "Lo"];
	// const cassetes = (options.oneCassette) ? ["Up"] : ["Up", "Lo"];
	// оставляем как есть, будем просто помечать вторую кассету как dispensable false

	function mergeReport( report ){
		if( !Array.isArray(report) || report.length !== 2 || !_cache.status ) return report;

		let err = _cache.last_error;

		return report.map( e => {
			delete e['error'];
			var k = cassetes[e.id-1];
			if( k && _cache.status[k] )
				Object.keys(_cache.status[k]).forEach( m => e[m] = _cache.status[k][m] );
			if( options.mergeLastError && err ){
				e['error'] = err;
				err = null;
			}
			if( options.oneCassette && e.id > 1 ) 
				e.dispensable = false;
			return e;
		});
	};

	function _onStart(data) {
		_cache.status = _parseString( data );
		_cache.last_error = null;

		///	Если получаем вдруг сообщение другого вида, не StErXX....
		if( !_cache.status['St'] ) return _cache.status = null;

		var code = "Er" + (_cache.status['St']['Er'] || "0");
		_cache.state = STATES.IDLING;

		if( ANSWERS.OK.indexOf(code) > -1 )
			return eventManager.publish(options.events.start.done); 	///	Точно все ок

		if ( ANSWERS.PORTOPENERR.indexOf(code) > -1) {
			_cache.last_error = 'Не могу открыть ком-порт либо нет связи с диспенсером';
		} else {
			_cache.last_error = _checkCrit( code );
		}

		if( !options.disableAlwaysStart ){	//	запускаем всегда по умолчанию, если в настройках ничего не указано
			_debug('Environment config - Always start');
			return eventManager.publish(options.events.start.done);
		}
		
		if( _cache.last_error )
			return eventManager.publish(options.events.start.fail, _cache.last_error);
				
		return eventManager.publish(options.events.start.done); ///	Не точно
	};

	function _onDispense(data) {
		var res = _parseString( data );
		
		if( !res || (!res['Up'] && !res['Lo']) ) return; /// не ок, если вдруг придет чет не то

		var type = ""; 
		if(res['Up']){ res = res['Up']; type = "up"; } 
		if(res['Lo']){ res = res['Lo']; type = "low"; }

		///	UpEr31_UpDispensed1_UpExited1_UpRejected0_UpNearend1_;
		///	возможно допом надо чекать Exited... - если тут имеется ввиду выдача из диспенсера
		///	а не сколько вышло из определенной кассеты
		
		_cache.request[type]['dispense'] = res['Dispensed'];
		_cache.request[type]['reject'] = res['Rejected'];
		_cache.request[type]["done"] = true;

		return _sendDispense( _cache.request );
	};

	function _log( type, msg, ...data ){
		switch (type) {
			case -1: type = "<-----"; break;
			case 1:  type = "----->"; break;
			default: type = "------"; break;
		}
		return Logger.log( [type, options.deviceName, msg, ...data].join(" ") );
	};
	function _debug( msg, ...data ){ if( options.debug ) console.log( options.deviceName, msg, ...data ); };

	function _send(cmd) {
		if ( connection.readyState != 1 ) { 
			_log( 1, 'can not send cmd', cmd, "- socket was closed");
			return _debug('socket closed'); 
		}

		_log( 1, "sending cmd", cmd);
		_debug('running ', cmd);
		connection.send(cmd);
	};

	function _getStatus() { return _send(COMMANDS.GET_STATUS); };

	function dispense( values ) {

		if ( !values || !Array.isArray(values) || values.length !== 2 ) {
			console.error("Входящие данные должны быть массивом из двух элементов");
			return false;
		}

		_debug("команда к выдаче", values);

		if ( options.isFake ) { return _fakeDispense( values ); }

		_cache.request = {};
		[ "up", "low" ].forEach(function(e, i){		///	на формах в операторке и админке получается Input-ы попутаны местами
			_cache.request[e] = {
				done: false, 
				id: i + 1,
				need: parseInt( values[i], 10 ),
				dispense: 0, 
				reject: 0
			};
		});

		_cache.state = STATES.DISPENSE;
		return _sendDispense( _cache.request );
	};

	function _sendDispense( data ) {

		for ( var i in data ) {
			console.log(data[i]);
			
			if ( !data.hasOwnProperty(i) || data[i].done  ) { continue; }

			if ( data[i].need > 0) { return _sendDispenseCmd(i, data[i].need); } ///	если нужно выдать, то цикл останавливается и отправляется команда на выдачу

			data[i].done = true; //	на деле мы и так должны работать с сылкой на _cache.request (туда перезаписывать data не будем) + Еще делал return _sendDispense!??
			/// если need 0
		}

		var ev = ( !Object.keys(data).some( i => data[i].need !== data[i].dispense ) ) ? options.events.dispense.done : options.events.dispense.fail;

		var out = Object.keys(data).map( i => ({ id: data[i].id, count: data[i].dispense, reject: data[i].reject }) );

		return eventManager.publish(ev, [out]);
	};

	function _sendDispenseCmd(type, value) {
		switch ( type ) {
			case "up":
				return _send( "Up" + value );  //Up1

			case "low":
				return _send( "Lo" + value );
		}
	};

	/*******************************/
	/* FAKE Methods */
	/*******************************/
	function _fakeDispense( values ){
		///	в values полюбому будет массив из двух элементов
		var onceRej = false;		///	флаг, для того чтобы только у одного номинала сработал reject
		var _data = values.map( (e, i) => ( { id: i + 1, count: e, reject: ( e && !onceRej ) ? (onceRej = true , 1) : 0 } ) ); 
		
		if ( !options.scenario.dispense.error ) 
			return eventManager.publish(options.events.dispense.done, [_data]); 
		

		if ( options.scenario.dispense.partial ) {
			_data = _data.map( e => (e.count -= (e.count > 2)? 1 : 0 , e) );	///	частичная выдача по некоторым номиналам
		} else {
			_data = _data.map((e, i) => (e.count = 0, e) );	///	нулевая выдача по всем номиналам
		}

		return eventManager.publish(options.events.dispense.fail, [_data]);  
	};

	/***************************************************************/
	/* CONNECTION INIT */
	/***************************************************************/

	if ( options.isFake ) {
		connection = { readyState: 1 };
		_log( -1, "starting in fake mode");
		if( options.scenario.status_string && !options.scenario.start.error ) {
			setTimeout( _onStart, 1000, options.scenario.status_string );
			_cache.state = null;
		} else {
			setTimeout( eventManager.publish, 1000, (options.scenario.start.error) ? options.events.start.fail : options.events.start.done );      
		}
	} else {
		connection = new WebSocket( options.uri );
	}

	connection.onopen = function( e ) {
		_log( 0, "socket opened");
		_debug('socket opened');

		_cache.state = STATES.INIT;
		_getStatus();
	};

	connection.onclose = function( e ) {
		_log(0, "socket closed");
		_debug("socket closed");
	};

	connection.onerror = function( e ) {
		_log(0, "socket error");
		_debug("socket error", e);
		return eventManager.publish(options.events.start.fail, "Проблемы с запуском исполняемого файла. Убедитесь что процесс для LCDM2000 запущен");
	};

	connection.onmessage = function ( e ) {
		_log( -1, "answer", e.data );
		_debug('in socket', e.data);

		switch (_cache.state) {
			case STATES.INIT:
				return _onStart(e.data);
			
			case STATES.DISPENSE:
				return _onDispense(e.data);

			default:
				_log(-1, "Not handled by state message!");
				_debug('Not handled by state message!');
				return;
		}
	};

	this.dispense = dispense;
	this.mergeReport = mergeReport;
};