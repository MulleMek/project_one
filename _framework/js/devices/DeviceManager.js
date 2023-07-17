var DeviceManager = ( function($, DeviceFactory, Environment, SocketLogger, Operation, Helper, DevicesList ) {

	var self = this,
		_options = {
			moduleName: 'DeviceManager',
			supportedDevices: ['CashcodeSM','Printer', 'Kaznachey', 'NanoKassa',  'SmartHopper', 'PinPad', 'RusStandPinPad', 'MicrocoinSP', 'NRI', 'LCDM200','Bill2Bill', 'Vendotek', 'EFTPOS', 'MEI'],
			debug: true,
			devicesTypes: {
				acceptors: ['CashcodeSM', 'CashcodeBNL', 'JCM', 'ICT', 'CashcodeGX', 'MicrocoinSP', 'NRI', 'MEI'],
				dispensers: ['ECDM400', 'LCDM200'],
				recyclers: ['SmartHopper', 'NV200', 'JCM_RC', 'Bill2Bill'],
				bank: ['PinPad', 'RusStandPinPad', 'Vendotek', 'EFTPOS']
			}
		},

		_devices = {},
		_publicDevices = {},
		_URLS = {},
		_EVENTS = {},
		_cache = {
			isStarted: false,
			isBusy: false,
			isOkToAcceptMoney: false,
			isFinished: false,
			promises: [],
			failData: [],
			moneyEvents: [],
			deviceData: {},
		};

	/***********************************************/
	/*  PRIVATE URL's AND EVENTS                   */
	/***********************************************/

	_URLS = {
		EXIT: Environment.get('domains.services') + '/devices/save',
		GET: Environment.get('domains.services') + '/devices/get'
	};

	_EVENTS = {
		START: {
			DONE: 'DeviceManager/start/done',
			FAIL: 'DeviceManager/start/fail'
		},
		EXIT: {
			DONE: 'DeviceManager/exit/done',
			FAIL: 'DeviceManager/exit/fail'
		},

		INSERTED: 'DeviceManager/inserted',

		DISPENSE: {
			DONE: 'DeviceManager/dispense/done',
			FAIL: 'DeviceManager/dispense/done'
		},

		BANKING: {
			DONE: 'DeviceManager/banking/done',
			FAIL: 'DeviceManager/banking/fail',
			CRITICAL: 'DeviceManager/banking/critical',
			MESSAGE: 'DeviceManager/banking/message',
			PIN: 'DeviceManager/banking/pin'
		}

	};

	/***********************************************/
	/*  PRIVATE DEVICES FUNCTION                   */
	/***********************************************/

	function _registerMoneyDeviceBySelfData(name, data, promise) {
		_cache.deviceData[name].data = data;

		$.publish(`${name}/importData/done`, [data]);

		if ( $.inArray(name, _options.devicesTypes.acceptors) > -1 || $.inArray(name, _options.devicesTypes.recyclers) > -1 ) {
			_cache.moneyEvents.push({
				device: name,
				event: Environment.get('deviceConfig.' + name + '.events.inserted')
			});
		}

		promise.resolve();
	}

	function _registerMoneyDevice(name, events, promise) {

		function __pushFailData(reason) {
			_cache.failData.push({
				device: name,
				data: reason
			});

			promise.resolve();
		}

		$.subscribe(events.done, function(event, data){
			if ( _options.debug ) {
				console.group( name + ' data import');
					console.log(data);
				console.groupEnd();

			}

			if ( data.error ) {
				return __pushFailData(data.data);
			}

			_cache.deviceData[name].data = data;

			if ( $.inArray(name, _options.devicesTypes.acceptors) > -1 || $.inArray(name, _options.devicesTypes.recyclers) > -1 ) {
				_cache.moneyEvents.push({
					device: name,
					event: Environment.get('deviceConfig.' + name + '.events.inserted')
				});
			}

			promise.resolve();

		});

		$.subscribe(events.fail, function(event, data){
			__pushFailData("Can't connect to get device data with URL " + _URLS.GET);
		});

		Helper.ajax(_URLS.GET, {device: name}, events);
	}

	function _registerDispenser(name, events, promise) {

		function __pushFailData(reason) {
			_cache.failData.push({
				device: name,
				data: reason
			});

			promise.resolve();
		}

		$.subscribe(events.done, function(event, data){

			if ( _options.debug ) {
				console.group( name + ' data import');
					console.log(data);
				console.groupEnd();

			}

			if ( data.error ) {
				return __pushFailData(data.data);
			}

			_cache.deviceData[name].data = data;

			promise.resolve();

		});

		$.subscribe(events.fail, function(event, data){
			__pushFailData("Can't connect to get device data with URL " + _URLS.GET);
		});


		Helper.ajax(_URLS.GET, {device: name}, events)
	}

	function _registerRecyclerWithMerge(name, events, promise) {
		if( _devices[name].mergeReport )
			$.subscribe(events.done, (e, data) => {
				_cache.deviceData[name].data = _devices[name].mergeReport(data);
			});

		_registerMoneyDevice(name, events, promise);
	}

	function _onStartedDevice(name, promise, deviceData) {

		var _events = {
			done: name + '/importData/done',
			fail: name + '/importData/fail'
		};

		switch ( name  ) {
			case 'Printer':
			case 'NanoKassa':
			case 'Vendotek':
			case 'EFTPOS':
			case 'Proxy':
			case 'RusStandPinPad':
			case 'PinPad':
				return promise.resolve();
				break;

			case 'ArdHopper':
				_cache.deviceData[name].data = deviceData;
				return promise.resolve();
				break;

			case 'JCM_RC':
			case 'Bill2Bill':
			case 'LCDM200':
				return _registerRecyclerWithMerge(name, _events, promise, deviceData);
				break;

			case 'FPrinter':
			case 'Kaznachey':
				_cache.deviceData[name].data = _devices[name].getReport();
				return promise.resolve();
				break;
			case 'SmartHopper':
			case 'NV200':
				return _registerMoneyDeviceBySelfData(name, deviceData, promise);
				break;
		}

		return _registerMoneyDevice(name, _events, promise);
	}

	/***********************************************/
	/*  DEVICES                                    */
	/***********************************************/

	function _startDevice(name) {

      return new Promise(function(resolve, reject){
			_events = Environment.get('deviceConfig.' + name + '.events.start');
			_cache.deviceData[name] = {};

			$.subscribe(_events.done, function(event, data){
				_onStartedDevice(name, { resolve: resolve, reject: reject }, data);
			});
			$.subscribe(_events.fail, function(event, data){
            _cache.failData.push({ device: name, data: data });
            resolve();
			});

			_devices[name] = DeviceFactory.create(name);
		});
	}

	/***********************************************/
	/*  START                                      */
	/***********************************************/

	function _checkDevicesBeforStart(arrayOfDevices) {

		console.group("Start Devices");
			console.info('supported devices by ' + _options.moduleName + ':');
			console.info(_options.supportedDevices);
			console.info('initing devices by ' + _options.moduleName + ':');
			console.info(arrayOfDevices);
		console.groupEnd();

      arrayOfDevices.forEach( device => {
         if( _options.supportedDevices.indexOf( device ) === -1 )
            throw 'unsupported device in ' + _options.moduleName + ' - ' + device;
      });
	};

	function _onStarted() {

		if ( !_cache.failData.length ) {
			_cache.isStarted = true;
			_cache.isBusy = false;
			_publicDevices = _devices;

			if ( _options.debug && SocketLogger && SocketLogger.log ) {
				SocketLogger.log( '----------' );
				SocketLogger.log( 'START DONE, DeviceManager data: ' );
				Object.keys(_cache.deviceData).forEach( name => {
					SocketLogger.log( " " + name + " " + JSON.stringify(_cache.deviceData[name]) );
				});
				SocketLogger.log( '----------' );
			}

			$.publish(_EVENTS.START.DONE);
			setTimeout(_updateDeviceData, 3500);
		} else {
			$.publish(_EVENTS.START.FAIL, [_cache.failData]);
		}

		_cache.isBusy = false;
	};

	function _start(arrayOfDevices) {

		if ( _cache.isBusy ) throw 'DeviceManager is busy';

		if ( typeof arrayOfDevices == 'undefined' || !arrayOfDevices || !arrayOfDevices.length)
			throw 'Wrong input to start devices - ' + JSON.stringify(arrayOfDevices);

		if ( _cache.isStarted || _cache.isBusy )
			return console.error(_moduleName + ' is already started');

		_checkDevicesBeforStart(arrayOfDevices);
		_cache.isBusy = true;

		var firstQueue = [], secondQueue = [];

		arrayOfDevices.forEach(function(e){
			if( e === "SmartHopper" ) return firstQueue[firstQueue.length] = e;
			///   тут можно заюзать DeviceList
			if( _options.devicesTypes.acceptors.indexOf(e) > -1 || _options.devicesTypes.recyclers.indexOf(e) > -1 )
			  { secondQueue[secondQueue.length] = e; }
			else
			  { firstQueue[firstQueue.length] = e; }
		});

      Promise.all( firstQueue.map( _startDevice ) )
         .then( function(){ return Promise.all(secondQueue.map( _startDevice )); } )
         .catch( function( error ){
            console.error(error);
            _cache.failData.push({ device: 'dev', data: 'something went wrong in starting queue of devices' });
         })
         .then( _onStarted )
	};

	/***********************************************/
	/*  BANKING                                    */
	/***********************************************/

	function acceptBanking(amount) {
		const devicesArray = []

		for ( var _i in _devices ) {
			if ( _devices.hasOwnProperty(_i) ) {
				devicesArray.push(_i);
			}
		}

		const device = devicesArray.find((el) => {
			return (DevicesList.isDeviceBelongsToGroup(el, 'bank')) ? el : false;
		});

		if ( !device ) {
			throw `Не запущен ни один девайс, связанный с банковской службой. Невозможно выполнить функцию acceptBanking`;
		}
		const events = Environment.get(`deviceConfig.${device}.events`);

		console.log(events);

		$.subscribe(events.payment.done, (e, data) => {
			$.publish(_EVENTS.BANKING.DONE, [data]);
		});

		$.subscribe(events.payment.fail, (e, data) => {
			$.publish(_EVENTS.BANKING.FAIL, [data]);
		});

		$.subscribe(events.message, (e, data) => {
			$.publish(_EVENTS.BANKING.MESSAGE, [data]);
		});

		$.subscribe(events.pin, (e, data) => {
			$.publish(_EVENTS.BANKING.PIN, [data]);
		});

		$.subscribe(events.critical, (e, data) => {
			$.publish(_EVENTS.BANKING.CRITICAL, [data]);
		});

		_devices[device].payment(amount);     /// Для сбера уходит в рублях
	}

	/***********************************************/
	/*  MONEY INSERT                               */
	/***********************************************/

	function _insertMoney(device, data) {
		for ( var _i in _cache.deviceData[device].data ) {
			if ( _cache.deviceData[device].data[_i].value == data ) {
				_cache.deviceData[device].data[_i].count++;
			}
		}
	}

	$.subscribe(_EVENTS.START.DONE, function(){
		var _insertData = _cache.moneyEvents;

		for ( var _i in _insertData ) {
			$.subscribe( _insertData[_i].event, function(event, data) {
				var _event = event.type;
				var _device = _event.substring(0, _event.indexOf('/'));
				_insertMoney(_device, data);
				$.publish(_EVENTS.INSERTED, data);
			});
		}
	});

	/***********************************************/
	/*  MONEY DISPENSE                             */
	/***********************************************/

	function _calculateDelivery(sum) {

		_cache.lastCalculation = {};


		var _error = '';

		if ( !sum ) {
			_error = 'No sum';
		}

		sum = parseFloat(sum);
		sum = sum.toFixed(2);
		sum = parseFloat(sum);

		if ( sum % 0.5 || sum < 0.5 ) {
			_error = 'Sum must be > 0.5 and integer devide on 0.5';
		}

		if ( !_cache.isStarted ) {
			_error = 'DeviceManager is not started';
		}

		var _answer = {
			debt: sum,
			error: ''
		};

		if ( _error ) {
			_answer.error = _error;
			return _answer;
		}

		var _money = [5000, 2000, 1000, 500, 200, 100, 50, 10, 5, 2, 1, 0.5];
		var _allMoney = {};
		var _devicesData = {};

		for ( var _i in _options.devicesTypes.dispensers ) {
			if ( _options.devicesTypes.dispensers.hasOwnProperty(_i) ) {
				if ( typeof _cache.deviceData[_options.devicesTypes.dispensers[_i]] !== 'undefined' ) {
					_devicesData[_options.devicesTypes.dispensers[_i]] = _cache.deviceData[_options.devicesTypes.dispensers[_i]].data;
				}
			}
		}

		for ( var _i in _options.devicesTypes.recyclers ) {
			if ( _options.devicesTypes.recyclers.hasOwnProperty(_i) ) {
				if ( typeof _cache.deviceData[_options.devicesTypes.recyclers[_i]] !== 'undefined' ) {
					_devicesData[_options.devicesTypes.recyclers[_i]] = _cache.deviceData[_options.devicesTypes.recyclers[_i]].data;
				}
			}
		}

		//if ( !Object.keys({_devicesData}) ) {
		if ( !Object.keys( _devicesData ).length ) {
			_answer.error = 'Can not calculate: no registered dispensers or recyclers';
			return _answer;
		}

		console.group('Calculating delivery for', sum);
		console.log(_devicesData);
		for ( var _i in _money ) {
			if ( _money.hasOwnProperty(_i) ) {
				_allMoney[_money[_i]] = [];
				for ( var _dev in _devicesData ) {
					if ( _devicesData.hasOwnProperty(_dev) ) {
						var _data = _devicesData[_dev];
						for ( var _cassette in _data ) {
							if ( _data.hasOwnProperty(_cassette) ) {
								_cassette = _data[_cassette];
								if ( _cassette.value == _money[_i] && _cassette.count && _cassette.dispensable ) {
									_allMoney[_money[_i]].push({
										device: _dev,
										id: _cassette.id,
										count: ( _cassette.dispensable !== true && _cassette.dispensable > 0 ) ? _cassette.dispensable : _cassette.count,
									});
								}
							}
						}
					}
				}
			}
		}

		console.log('Money registered', _allMoney);

		var _deliveryObj = {
			toPay: sum,
			need: sum,
			can: 0,
			devices : {}
		}

		for ( var _i in _money ) {
			if ( _money.hasOwnProperty(_i) ) {
				var _val = _money[_i];
				if (_val > _deliveryObj.need) {
					console.log(_val, "is to big to decrease", _deliveryObj.need);
				} else {
					var _moneyArray = _allMoney[_val];
					if ( !_moneyArray.length ) {
						console.log(_val, ' has low level');
						continue;
					} else {
						if ( _moneyArray.length == 1 ) {
							var _data = _moneyArray[0];
							var _needCoins = _deliveryObj.need / _val | 0;
							console.log(_data.device, 'contains ', _data.count, 'coins with value', _val, 'when need', _needCoins);

							var _sum = _deliveryObj.need;

							var _thisCassetteCount = 0;

							if ( _data.count >= _needCoins ) {
								_thisCassetteCount = _needCoins;
							} else {
								_thisCassetteCount = _data.count;
							}

							_deliveryObj.need -= _thisCassetteCount * _val;
							_deliveryObj.can += _thisCassetteCount * _val;

							console.log('Increases by', _data.device, ' with', _thisCassetteCount * _val, 'debt is', _deliveryObj.need);

							if ( !_data.id ) {

								if ( !_deliveryObj.devices[_data.device] ) {
									_deliveryObj.devices[_data.device] = {
										sum: _thisCassetteCount * _val
									}
								} else {
									_deliveryObj.devices[_data.device].sum += _thisCassetteCount * _val;
								}

							} else {
								if ( !_deliveryObj.devices[_data.device] ) {
									_deliveryObj.devices[_data.device] = [];
								}
								_deliveryObj.devices[_data.device].push({
									id: _data.id,
									value: _val,
									count: _thisCassetteCount
								});
							}

						} else {
							var _indexes = [];

							_moneyArray.sort( function (a, b) {
								if (a.count < b.count) {
									return 1;
								}

								if (a.count > b.count) {
									return -1;
								}

								return 0;
							});

							var _needCoins = _deliveryObj.need / _val | 0;

							var _logData = {};

							_moneyArray.forEach(function(el){
								if ( !_logData[el.device] ) {
									_logData[el.device] = {
										count: el.count,
										cassette: 1
									}
								} else {
									_logData[el.device].count += el.count;
									_logData[el.device].cassette += 1;
								}
							});

							var _stringLog = "",
								_totalMoney = 0;

							for ( var _z in _logData ) {
								if ( _logData.hasOwnProperty(_z) ) {
									_stringLog += " " + _z + " contains " + _logData[_z].count + " coins in " +  _logData[_z].cassette + " cassette(s)";
									_totalMoney +=  _logData[_z].count * _val;
								}
							}

							var _sum = _deliveryObj.need;
							var _thisCassetteCount = 0;

							//console.log(_moneyArray);

							_moneyArray.forEach(function(el){
								//console.log(el);
								//console.log(_needCoins, _thisCassetteCount)
								if ( _needCoins ) {

									var _thisCount = 0;

									if ( el.count >= _needCoins ) {
										_thisCassetteCount += _needCoins;
										_thisCount += _needCoins;
									} else {
										_thisCassetteCount += el.count;
										_thisCount = el.count;
									}


									if ( !el.id ) {
										if ( !_deliveryObj.devices[el.device] ) {
											_deliveryObj.devices[el.device] = {
												sum: _thisCount * _val
											}
										} else {
											_deliveryObj.devices[el.device].sum += _thisCount * _val;
										}

									} else {
										if ( !_deliveryObj.devices[el.device] ) {
											_deliveryObj.devices[el.device] = [];
										}

										_deliveryObj.devices[el.device].push({
											id: el.id,
											value: _val,
											count: _thisCount
										});

										//console.log(_deliveryObj.devices[el.device]);
									}

									_deliveryObj.need -= _thisCount * _val;
									_deliveryObj.can += _thisCount * _val;
									_needCoins -= _thisCount;

									//console.log(el);

									if ( el.cassette ) {
										console.log('Increases by', el.device, 'with', _thisCount * _val, 'of cassette', el.id, 'debt is', _deliveryObj.need);
									} else {
										console.log('Increases by', el.device, 'with', _thisCount * _val, 'debt is', _deliveryObj.need);
									}

								}
							});

						}

						if ( !_deliveryObj.need ) {
							break;
						}
					}
				}
			}
		}

		console.log(_deliveryObj);
		console.groupEnd();
		_cache.lastCalculation = _deliveryObj;

		//console.log(_deliveryObj.devices);


		return {
			amount: _deliveryObj.toPay,
			can: _deliveryObj.can,
			debt: _deliveryObj.need
		};

	}

	function _dispense() {
		if ( typeof _cache.lastCalculation == "undefined" ) {
			console.error("You need to calculateDelivery before dispense");
			return false;
		}

		if ( _cache.lastCalculation.can == 0 ) {
			var _events = _EVENTS.DISPENSE;

			var _data = {
				expected: _cache.lastCalculation.can,
				dispensed: 0
			};

			return $.publish(_events.DONE, _data);
		}

		_cache.dispensePromises = [];
		_cache.dispensed = 0;

		for ( var _i in _cache.lastCalculation.devices ) {
			if ( _cache.lastCalculation.devices.hasOwnProperty(_i) ) {
				var _promise = new $.Deferred();
				_cache.dispensePromises.push(_promise);
				_dispenseDevice(_i, _cache.lastCalculation.devices[_i], _promise);
			}
		}

		$.when.apply($, _cache.dispensePromises).always(function() {

			var _events = _EVENTS.DISPENSE;

			var _data = {
				expected: _cache.lastCalculation.can,
				dispensed: _cache.dispensed
			};


			if ( _cache.dispensed == _cache.lastCalculation.can ) {
				$.publish(_events.DONE, _data);
			} else {
			  $.publish(_events.FAIL, _data);
			}

			_cache.dispensed = 0;
			_cache.lastCalculation = 0;

		});

	}

	function _dispenseDevice(name, data, promise) {
		var _events = Environment.get('deviceConfig.' + name + '.events.dispense');

		switch (name) {

			case "SmartHopper":
				$.subscribe(_events.done + " " + _events.fail, function(event, report){
					_cache.deviceData[name].data = report.newReport;
					_cache.dispensed += report.dispensed;
					promise.resolve();
				});

				_devices["SmartHopper"].dispense(data.sum);
				break;

			case "Bill2Bill":
				$.subscribe(_events.done + " " + _events.fail, function(event, report){
					if( report.affected ){
						report.affected.forEach( e => {
							var bill = _cache.deviceData[name].data.find( p => p.value === e.value );
							if( bill && bill.count && bill.count + e.count >= 0) bill.count += e.count;
						});
					}

					_cache.dispensed += report.dispensed;
					promise.resolve();
				});

				_devices["Bill2Bill"].dispense( data.reduce( (sum,e) => sum + (e.value * e.count), 0 ) );
				break;

			case "NV200":
				$.subscribe(_events.done + ' ' + _events.fail, function(event, report){
					_cache.dispensed += parseInt(report);
					promise.resolve();
				});

				_devices["NV200"].dispense( data.reduce( (sum,e) => sum + (e.value * e.count), 0 ) );
				break;

			case "ECDM400":
				var _dispenseArray = [0, 0, 0, 0];

				for ( var _i in data ) {
					if ( data.hasOwnProperty(_i) ) {
						var _id = data[_i].id - 1;
						_dispenseArray[_id] = data[_i].count;
					}
				}

				var _dispensed = 0;

				$.subscribe(_events.done + ' ' + _events.fail, function(event, report){
					var _data = _cache.deviceData.ECDM400.data;
					for ( var _i in report ) {
						if ( report.hasOwnProperty(_i) ) {
							for ( var _k in _data ) {
								if ( _data.hasOwnProperty(_k) ) {
									if ( report[_i].id == _data[_k].id ) {
										_data[_k].count -= report[_i].count;
										if( _data[_k].count < 0 ) _data[_k].count = 0;
										_data[_k].reject += report[_i].reject;
										_dispensed += report[_i].count * _data[_k].value;
									}
								}
							}

						}
					}

					_cache.dispensed += _dispensed;
					_cache.deviceData.ECDM400.data = _data;
					promise.resolve();
				});

				_devices["ECDM400"].dispense(_dispenseArray);

				break;

			case "LCDM200":
				if( !Array.isArray( data ) ) break;

				var _dispenseArray = [0, 0];
				data.forEach( e => _dispenseArray[ e.id-1 ] = e.count );

				var _dispensed = 0;
				$.subscribe(_events.done + ' ' + _events.fail, function(event, report){	/// Если делать несколько dispense подряд
					var _data = _cache.deviceData.LCDM200.data; 									/// тогда по счетчику будет списываться больше...
																												/// тут нужен unsubscribe
					if( Array.isArray(report) && Array.isArray(_data) ){
						report.forEach( e => {
							var cassette = _data.find( c => c.id === e.id );
							if( !cassette ) return console.error("Кассета не найдена");
							cassette.count -= e.count + e.reject;
							if( cassette.count < 0 ) cassette.count = 0;
							cassette.reject += e.reject;
							_dispensed += e.count * cassette.value;
						});
					}

					_cache.dispensed += _dispensed;
               _cache.deviceData.LCDM200.data = _data;
					promise.resolve();
				});

				_devices["LCDM200"].dispense(_dispenseArray);

				break;

		}

	}


	/***********************************************/
	/*  STOP                                       */
	/***********************************************/

	function _stop( softHopper ) {
		Object.entries(_devices).forEach( ([ deviceName, device ]) => {
			if( device.stop !== void 0 && ( !softHopper || deviceName !== 'SmartHopper' ) ){
				device.stop();
			}
		});

		//Object.values(_devices).forEach( device => ( device.stop !== void 0 && ) ? device.stop() : 0 );
	};

	/***********************************************/
	/*  EXIT                                       */
	/***********************************************/

	function _updateDeviceData(){
		if( _cache.isFinished ) return Promise.resolve();

		let d = {};

		Object.entries(_cache.deviceData).forEach( ([ device, info ]) => {
			if( _devices[device] && _devices[device].getActualReport ){
				d[device] = {
					data: JSON.stringify(_devices[device].getActualReport()),
					lastError: '',
				};

				let err = _cache.failData.find( e => e.device === device );
				if( err ){
					let err_str = err.data || "Have no error details";
					if( typeof err_str !== "string" ) err_str = JSON.stringify(err_str);
					d[device].lastError = err_str;
				}
			}
		});

		var _toSave = { devicesData: d };

		return new Promise( resolve => {
			Helper.ajax(_URLS.EXIT, _toSave)
			.always( _ => resolve() );
		});
	};

	function _exit() {

		if ( _cache.isFinished ) return Promise.resolve();
		_cache.isFinished = true;

		if ( _options.debug && SocketLogger && SocketLogger.log ) {
			SocketLogger.log( '----------' );
			SocketLogger.log( 'EXIT, DeviceManager data: ' );
			Object.keys(_cache.deviceData).forEach( name => {
				SocketLogger.log( " " + name + " " + JSON.stringify(_cache.deviceData[name]) );
			});
			SocketLogger.log( '----------' );
		}

		Object.entries(_cache.deviceData).forEach( ([ device, info ]) => {
			if( _devices[device] && _devices[device].getActualReport )
				info.data = _devices[device].getActualReport();   /// для специфичных девайсов
			if( info.data === void 0 ) delete info.data;
			else info.data = JSON.stringify(info.data);

			info.lastError = '';

			let err = _cache.failData.find( e => e.device === device );
			if( err ){
				let err_str = err.data || "Have no error details";
				if( typeof err_str !== "string" ) err_str = JSON.stringify(err_str);
				info.lastError = err_str;
			}

		});

		var _toSave = { devicesData: _cache.deviceData };

		if ( Operation.get('id') ) {
			_toSave.logs = {
				name: Operation.get('id'),
				data: SocketLogger.get()
			};

			_toSave.operation = Operation.get();
		}

		return new Promise( resolve => {
			Helper.ajax(_URLS.EXIT, _toSave, _EVENTS.EXIT)
			.always( _ => resolve() );
		});
	};


	/***********************************************/
	/*  REPORT ERROR                               */
	/***********************************************/

	function setError(device, error) {
		_cache.failData[_cache.failData.length] = { device: device, data: error };
	};


	/***********************************************/
	/*  API                                        */
	/***********************************************/

	return {
		getCache: _ => _cache,
		events: _EVENTS,
		setError: setError,
		init: _start,
		stop: _stop,
		exit: _exit,
		calculate: _calculateDelivery,
		dispense: _dispense,
		devices: _devices,
		acceptBanking: acceptBanking
	};

}) ($, DeviceFactory, Environment, SocketLogger, Operation, Helper, DevicesList );
