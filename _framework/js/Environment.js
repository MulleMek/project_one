
var Environment = ( function($){

	function _buildDeviceOptions(deviceName, eventsWithProp, events) {
		return {
			deviceName: deviceName,
			events: 		_buildEvents(deviceName, eventsWithProp, events),
			debug: 		self.debug[deviceName],
			uri: 			self.socketPorts[deviceName],
		};
	};

	function _buildEvents(device, eventsWithProp, events) {
		var _result = {};
		device = device + '';

		if ( Array.isArray(eventsWithProp) && eventsWithProp.length ) {
			for ( var _i in eventsWithProp ) {
				if ( eventsWithProp.hasOwnProperty(_i) ) {
					_result[eventsWithProp[_i]] = {
						done: device + '/' + eventsWithProp[_i] + '/done',
						fail: device + '/' + eventsWithProp[_i] + '/fail'
					};
				}
			}
		}

		if ( Array.isArray(events) && events.length ) {
			for ( var _i in events ) {
				if ( events.hasOwnProperty(_i) ) {
					_result[events[_i]] = device + '/' + events[_i];
				}
			}
		}

		return _result;
	};

	var self = $.extend( {}, EnvironmentConfig.get(), EnvironmentScenarios.get(), EnvironmentEtc.get());

	self.domains = {
			kiosk: 		self.rootPrefix + '/kiosk',
			services: 	self.rootPrefix + '/_framework',
			developer: 	self.rootPrefix + '/developer',
			proxy: 		self.rootPrefix + '/proxy',
			operator: 	self.rootPrefix + '/operator',
			admin: 		self.rootPrefix + '/admin'
	};

	self.socketPorts = {
		CashcodeSM: 	'ws://localhost:8015',
		MEI: 			'ws://localhost:8181',
		LCDM200: 		'ws://localhost:8017',
		SmartHopper: 	'ws://localhost:8020',
		Printer: 		'ws://localhost:8018',
		Kaznachey: 		'ws://localhost:8010',
		PinPad: 			'ws://localhost:8071/ws',
		EFTPOS: 			'ws://localhost:8030/',
		Vendotek: 'ws://localhost:8071',
	};

	self.deviceConfig = {
		CashcodeSM: 	_buildDeviceOptions( 'CashcodeSM', 	['start'], ['inserted', 'jammed']),
		MEI: 			_buildDeviceOptions( 'MEI', 		['start'], ['inserted', 'jammed']),
		LCDM200: 		_buildDeviceOptions( 'LCDM200', 		['start', 'dispense'], []),
		SmartHopper: 	_buildDeviceOptions( 'SmartHopper', ['start', 'dispense', 'setLevel'], ['inserted']),
		Printer: 		_buildDeviceOptions( 'Printer', 		['start', 'print'], []),
		Kaznachey: 		_buildDeviceOptions( 'Kaznachey', 	['start', 'printFiscal', 'print', 'xorder', 'zorder', 'openSession', 'closeSession', 'clearBuffer', 'cashIncome', 'cashOutcome' ], []),
		NanoKassa: 		_buildDeviceOptions( 'NanoKassa', 	['start', 'printFiscal', 'checkStatus', 'getStatus' ], []),
		PinPad: 			_buildDeviceOptions( 'PinPad', 		['start', 'payment', 'cancel', 'closeDay'], ["critical", "message", "pin"]),
		Vendotek: 		_buildDeviceOptions( 'Vendotek', 	['start', 'payment'], ["message", "touched", "critical"]),
		EFTPOS: 			_buildDeviceOptions( 'EFTPOS', 		['start', 'payment', 'cancel', 'encash'], ["critical", "message", "pin", "servicemessage"]),
	};

	self.deviceConfig.Kaznachey.printerIndex = 1;

	/// DTO 10
	self.deviceConfig.Kaznachey.defaultTax = 6;	//	"без Ндс"
	self.deviceConfig.Kaznachey.defaultItemType = 4;	/// Услуга
	// self.deviceConfig.Kaznachey.fakeFiscal = true;		/// Игнорировать отсутствие фискализации
	//// 2 - 10 %
	//// 4 - 10/110
	//// 5 - 0 %
	//// 6 - Не облагается
	//// 7 - 20 %
	//// 8 - 20/120

	self.deviceConfig.NanoKassa.defaultTax = 6; 			/// Без Ндс
	self.deviceConfig.NanoKassa.defaultItemType = 4;	/// Услуга
	
	// self.deviceConfig.LCDM200.oneCassette = true;		/// LCDM1000 (однокассетный режим, работаем только сверхней кассетой - пометка dispensable: false и скрытие в операторке)


	function get(param) {

		if ( typeof param !== 'string' ) {
			throw 'Wrong input ' + JSON.stringify(param) + ' with type ' + typeof param +' to get param of Environment. Must be a string "object.param.subparam"';
		}

		var _splitArray = param.split('.');
		var _currentObject = self;

		for ( var _i in _splitArray ) {

			if ( typeof _currentObject[_splitArray[_i]] == 'undefined' ) {
				throw 'Be carefull! Environment has no property ' + param + '. Stack was interrupted on ' + _splitArray[_i];
			}

			_currentObject = _currentObject[_splitArray[_i]];
		}

		return _currentObject;
	}

	function disablePrinterCheck(){
		self.deviceConfig['Printer'].ignoreCriticalErrors = true;
	};

	function setMaxAccept( device, value ){
		if( !self.deviceConfig[device] ) return;
		if( value ){
			self.deviceConfig[device].maxAccept = value;
		} else {
			delete self.deviceConfig[device].maxAccept;
		}
	};

	function setMaxDispense( device, value ){
		if( !self.deviceConfig[device] ) return;
		if( value ){
			self.deviceConfig[device].maxDispense = value;
		} else {
			delete self.deviceConfig[device].maxDispense;
		}
	};

	function setDefaultDepart( device, value ){			/// Пока только под сбер
		if( !value ) {
			delete self.deviceConfig[device].default_depart;
			return;
		}

		value = parseInt( value, 10 );
		if( ( !value && value !== 0 ) || value < 0 || value > 14 ) return;

		self.deviceConfig[device].default_depart = value;
		//self.deviceConfig[device].always_use_advanced_make = true;
	};

	function setKassaIndex( device, value ){
		if( !value ) return;
		if( device === 'Kaznachey' ){
			if( !/^\d{4}$/.test(value) ) return console.error("Wrong kassa index specified");
			console.log("DEBUG: SET KASSA ", device, value);
			self.deviceConfig[device].uri =  'ws://localhost:' + value + '/';
		}
	};

	return { 
		get: get, 
		disablePrinterCheck: disablePrinterCheck,
		setMaxAccept: setMaxAccept, 
		setMaxDispense: setMaxDispense, 
		setDefaultDepart: setDefaultDepart, 
		setKassaIndex: setKassaIndex 
	};

})($);
