function SmartHopper( options, eventManager, Logger ) {
	var self = this;
   var connection = null,
      _cache = {
      	state: '',
         startTimer: null,
         reports: {}
      };

   /// options.use_denominated_payout = false;
   /// options.maxDispense = 49;

	/***************************************************************/
	/* STATIC */
	/***************************************************************/
   var PAYOUT_TIMEOUT = 20 * 1000;  // 45000 было т.к таймаут
   var SEND_TIMEOUT = 1000;
   var START_TIMEOUT = 5000;
  
   STATES = {
      START: "start",
      PAYOUT: "payout",
   	POLLING: "polling",
      EMPTY: "empty",
      SET_COIN_LEVEL: 'setting_level'
   },

   COMMANDS = {
		START: "startPolling",
		STOP: "stopPolling",
		DISABLE: "disable",
      RESET: "reset",
		EMPTY: "empty",
		GET_REPORT: "getReport",
		SET_COIN_LEVEL: "setCoinLevel",
		PAYOUT: "makePayoutDen",           /// makePayoutDen_10v00_50v00_1000v01.... пример должен быть в кургане
		PAYOUT_SMART: "makePayout"
   },

   ANSWERS = {
    	ENABLED: "enabledValidator",
    	INSERTED: "BILL_INSERTED:",
    	DISPENSED: "DISPENSED:",
    	EMPTIED: "SMART_EMPTIED",
      SET_COIN_LEVEL: "LEVEL_CHANGED:",

    	POLLING: {
    		STARTED: "startedPolling",
    		STOPPED: "stoppedPolling"
    	},

    	REPORT: "REPORT:",
    	
    	NOTICE: {
    		/* 
    		1 - Not enough,
    		2 - Cannot pay exact amount,
    		3 - Busy,
    		4 - Disabled
    		*/
    		PREFIX: "ERROR:",
    		MESSAGES: ["","NotEnough", "CannotPayExactAmount", "Busy", "Disabled"]
    	},

    	/* for user -> press button on device */
    	COIN_JAM: "coinJammed",

    	/* for holder -> reboot device */
    	PORT_ERROR: "portError"
   },

   ERRORS = {
      NO_DEVICE: 'Проблемы с открытием веб-сокета. Скорее всего не запущен исполняемый файл',
      START_TIMEOUT: 'Устройство слишком долго не могло пройти инициализацию'
   }

   /***************************************************************/
   /* DEVICE SPECIFIC */
   /***************************************************************/

   function parseMessage( message ) {
      var answer = {
         "data": null,
         "event": null
      },
      data = null; /*For manipulation within switch without "already defined" */



      switch( true ) {

      	/*
      	|--------------------------------------------------------------------------
      	| INFO
      	|--------------------------------------------------------------------------
      	|
      	| 
      	|
      	*/
      
         /***************************************************************/
         /* ENABLED */
         /***************************************************************/
         case contains( message, ANSWERS.ENABLED ):
            answer["event"] = EVENTS.ENABLED;
            start();
         break;



         /***************************************************************/
         /* POLLING */
         /***************************************************************/
         case contains( message, ANSWERS.POLLING.STARTED ):
         	answer["event"] = EVENTS.POLLING.STARTED;
         break;

         case contains( message, ANSWERS.POLLING.STOPPED ):
         	answer["event"] = EVENTS.POLLING.STOPPED;
         break;



         /***************************************************************/
         /* REPORT */
         /***************************************************************/
         case contains( message, ANSWERS.REPORT ):
   	     	data = message.substr(ANSWERS.REPORT.length);

   	     	if ( !JSON.validate(data) ) {
   	     		return false;
   	     	}

	     		data = JSON.parse(data);

         	answer["event"] = EVENTS.REPORT;
         	answer["data"] = data;
         break;



         /*
         |--------------------------------------------------------------------------
         | MONEY
         |--------------------------------------------------------------------------
         |
         | 
         |
         */

         /***************************************************************/
         /* PAYOUT */
         /***************************************************************/
         case contains( message, ANSWERS.PAYOUT.DONE ):
         	data = +(message.substr(ANSWERS.PAYOUT.DONE.length)) || 0;
         	if ( !data ) {
         		return false;
         	}

         	answer["event"] = EVENTS.PAYOUT.DONE;
         	answer["data"] = data;
         	cache["state"] = STATES.EMPTY;
         break;



         /***************************************************************/
         /* INSERTED */
         /***************************************************************/
         case contains( message, ANSWERS.INSERTED ):
         	data = +(message.substr(ANSWERS.INSERTED.length)) || 0;
         	if ( !data ) {
         		return false;
         	}

         	answer["event"] = EVENTS.INSERTED;
         	answer["data"] = data;
         break;
			


			/***************************************************************/
         /* EMPTIED */
         /***************************************************************/
         case contains( message, ANSWERS.EMPTIED ):
            answer["event"] = EVENTS.EMPTIED;
         break;



         /*
         |--------------------------------------------------------------------------
         | PROBLEMS
         |--------------------------------------------------------------------------
         |
         | 
         |
         */
        
			/***************************************************************/
         /* NOTICE */
         /***************************************************************/
         case contains( message, ANSWERS.NOTICE.PREFIX ):
         	data = +(message.substr(ANSWERS.NOTICE.PREFIX.length)) || 0;
         	if ( !data ) {
         		return false;
         	}
         	answer["event"] = EVENTS.NOTICE;
         	answer["data"] = ANSWERS.NOTICE.MESSAGES[data];
         break;


        
         /***************************************************************/
         /* COIN JAM */
         /***************************************************************/
         case contains( message, ANSWERS.COIN_JAM ):
         	answer["event"] = EVENTS.COIN_JAM;
         break;



         /***************************************************************/
         /* PORT ERROR */
         /***************************************************************/
         case contains( message, ANSWERS.PORT_ERROR ):
         	answer["event"] = EVENTS.PORT_ERROR;
         break;
      }

      return answer.event? answer : false;
   }

   /***************************************************************/
   /* PRIVATE */
   /***************************************************************/

   function _setDispenseTimeout(time) {
      _cache.dispenseTimer = setTimeout(function(){
         _getReport();
      }, time);
   }

   function _startTimerToWaitEnableAndPollingAndReport() {
      /*
      * СмартХоппер весьма мутное устройство
      * Как только сокет-соединение открывается, запускается эта функция с таймером
      * В автоматическом режиме выполняется _startPolling, _getReport
      * В случае успешного получения отчета (последняя операция),
      * Таймер будет обнулен.
      * В противном будет инициироваться событие неуспешного старта
       */
      
      _cache.startTimer = setTimeout(function(){
         _stop();
         eventManager.publish(options.events.start.fail, ERRORS.START_TIMEOUT);
      }, START_TIMEOUT);

   }

   function _beforeStart(data) {
      /*

       */
      
      if ( data == ANSWERS.POLLING.STARTED ) {
         return _getReport();
      }

      if ( data.indexOf(ANSWERS.REPORT) > -1 ) {
         _data = data.replace(ANSWERS.REPORT, '');
         _data = JSON.parse(_data);

         var _error = false;

         for (var i in _data) {
            if ( _data.hasOwnProperty(i) ) {
               if ( _data[i].count > 10000 ) {
                  _error = true;
               }
               _data[i].dispensable = true;
            }
         }

         _cache.firstReport = _data;
         _cache.state = '';
         clearTimeout(_cache.startTimer);

         if ( _error ) {
            return eventManager.publish(options.events.start.fail, [
                  {
                     error: 'Некорректно заданы уровни ' + options.deviceName, 
                     report: _cache.firstReport
                  }
               ]);
         }

         eventManager.publish(options.events.start.done, [_cache.firstReport]);
      }

   }

   function _onPayout(data) {
      /*
      * Несмотря на то, что название устройства SmartHopper
      * переводится как "Умный прыгальщик", он не является таковым.
      * Поэтому на событие "DISPENSED:" лучше попросить еще один отчет, и посчитать
      * вручную сколько чего выдано.
       */
      
      if ( data.indexOf(ANSWERS.DISPENSED) > -1 ) {
         clearTimeout(_cache.dispenseTimer);
         return _getReport();
      }

      if( data.indexOf( ANSWERS.PORT_ERROR ) > -1 ){
         clearTimeout(_cache.dispenseTimer);
         $.publish(options.events.dispense.fail, {
            dispensed: 0,
            newReport: _cache.firstReport
         });
         return;
      }

      if ( data.indexOf(ANSWERS.REPORT) > -1) {
         var _firstMoney = 0;
         var _report = _cache.firstReport;
         for ( var _i in _report ) {
            if ( _report.hasOwnProperty(_i) ) {
               _firstMoney += _report[_i].count * _report[_i].value;
            }
         } 

         var _reportMoney = 0;

         _data = data.replace(ANSWERS.REPORT, '');
         _data = JSON.parse(_data);

         for ( var _i in _data ) {
            if ( _data.hasOwnProperty(_i) ) {
               var _count = _data[_i].count;
               if ( _count > 20000 ) {
                  _count = -(65536 - _count);
               }
               _reportMoney += _count * _data[_i].value;
            }
         } 

         var _event = '';

         if ( _cache.toDispense == _firstMoney - _reportMoney ) {
            _event = options.events.dispense.done;
         } else {
            _event = options.events.dispense.fail;
         }

         for (var i in _data) {
            if ( _data.hasOwnProperty(i) ) {
               _data[i].dispensable = true;
            }
         }

         $.publish(_event, {
            dispensed: _firstMoney - _reportMoney,
            newReport: _data
         });

         _cache.firstReport = _data;
         _cache.state = '';
         _cache.toDispense = 0;

      }

   }

   function _onSetLevel(data) {

      if ( data.indexOf(ANSWERS.REPORT) > -1 ) {
         _data = data.replace(ANSWERS.REPORT, '');
         _data = JSON.parse(_data);

         for (var i in _data) {
            if ( _data.hasOwnProperty(i) ) {
               _data[i].dispensable = true;
            }
         }


         _cache.firstReport = _data;
         _cache.state = '';
         eventManager.publish(options.events.setLevel.done, [_cache.firstReport]);
         return;
      }

      var _result = data.indexOf(ANSWERS.SET_COIN_LEVEL) > -1;

      for ( var _i in _cache.setLevelStack ) {
         if ( _cache.setLevelStack.hasOwnProperty(_i) ) {
            if ( _cache.setLevelStack[_i] == null ) {
               _cache.setLevelStack[_i] = _result; 
               return _setLevelStack();
            }
         }
      }

   }

   /***************************************************************/
   /* WEBSOCKET */
   /***************************************************************/

    function _fakeMoneyInsert() {

      if ( options.scenario.insert.error || !options.isFake ) {
         return;
      } 

      setTimeout(function(){
         var _ins = options.scenario.insert.data // array to insert

         
         for (var _i in _ins) {
            (function(_i) {

               setTimeout(function() {
                  eventManager.publish(options.events.inserted, options.scenario.insert.data[_i] );

               }, options.scenario.insert.timeouts.interval * 1000 * _i);

            })(_i);
         }

      }, options.scenario.insert.timeouts.start * 1000)
   }

   if ( options.isFake ) {
      connection = {
         readyState: 1,
         send: function( message ) {}
      };

      var _event = '',
         _data = 1;
      if ( options.scenario.start.error ) {
         _event = options.events.start.fail;
         _data = {error: 'fakeError'};
      } else {
         _event = options.events.start.done;
         _data = options.scenario.start.data;
         _cache.firstReport = _data;
      }

      setTimeout(function(){
         eventManager.publish(_event, [_data]);
         if ( _event.indexOf('done') > -1 ) {
            _fakeMoneyInsert();
         }
      }, options.scenario.start.delay * 1000);

   } else {
      connection = new WebSocket( options.uri );
   }

	connection.onmessage = function ( e ) {
      var data = e.data;
      Logger.log("<----- " + options.deviceName + " answer - " + e.data);

      if ( options.debug ) {
         console.log('answer from ' + options.deviceName + ' : ' + data);
      }

      if ( _cache.state == STATES.START ) {
         return _beforeStart(data);
      }

      if ( _cache.state == STATES.PAYOUT ) {
         return _onPayout(data);
      }

      if ( _cache.state == STATES.SET_COIN_LEVEL ) {
         return _onSetLevel(data);
      }

      if ( data.indexOf(ANSWERS.INSERTED) != -1) {
         var m = data.substr(ANSWERS.INSERTED.length);
         return eventManager.publish(options.events.inserted, parseInt(m) );
      }

/*      var answer = parseMessage( data );
      
      if ( !answer || !answer.event ) {
         return false;
      }

      eventManager.publish( answer["event"], [answer["data"]] );*/

   };

   connection.onopen = function( e ) {
      Logger.log("----- " + options.deviceName + " socket opened");

      if ( options.debug ) {
         console.log(options.deviceName + " socket opened");
      }

      _cache.state = STATES.START;
      _startTimerToWaitEnableAndPollingAndReport();
      _startPolling();

   };

   connection.onclose = function( e ) {
      Logger.log("----- " + options.deviceName + " socket closed");
      
      if ( options.debug ) {
         console.log(options.deviceName + " socket closed");
      }

   };

   connection.onerror = function( e ) {
      Logger.log("----- " + options.deviceName + " socket error");
      
      if ( options.debug ) {
         console.log(options.deviceName + " socket error");
      }

      return eventManager.publish(options.events.start.fail, [{error:ERRORS.NO_DEVICE}]);

   };

   function _send( cmd ) {

      Logger.log("-----> " + options.deviceName + " cmd " + cmd);

      if ( options.debug ) {
         console.log(options.deviceName + " running " + cmd);
      }

      connection.send(cmd);

   };

   /***************************************************************/
   /* PRIVATE API FUNCTIONS */
   /***************************************************************/

   function _startPolling() {
      _send(COMMANDS.START);
   }

   function _getReport(cmd) {
      _send(COMMANDS.GET_REPORT);
   }

   function _setOneCoinLevel(cmd) {
      _send(cmd);
   }

   function _setLevelStack() {

      for ( var _i in _cache.setLevelStack ) {
         if ( _cache.setLevelStack.hasOwnProperty(_i) ) {
            if ( typeof _cache.setLevelStack[_i] == 'object' && _cache.setLevelStack[_i] !== null) {
               if ( _cache.setLevelStack[_i] ) 
               _oneCoinObj = _cache.setLevelStack[_i];
               _cache.setLevelStack[_i] = null;
               var _cmd = [COMMANDS.SET_COIN_LEVEL, _oneCoinObj.value, _oneCoinObj.count].join("_");
               return _setOneCoinLevel(_cmd);
            }
         }
      }

      var _result = true;

      for ( var _i in _cache.setLevelStack ) {
         if ( _cache.setLevelStack.hasOwnProperty(_i) ) {
               if ( !_cache.setLevelStack[_i] ) {
                  console.log(_cache.setLevelStack[_i]);
                  _result = false;
               }

         }
      }

      if ( _result ) {
         _getReport();         
      } else {
         eventManager.publish(options.events.setLevel.fail)
      }

   }

   /***************************************************************/
   /* PUBLIC API FUNCTIONS */
   /***************************************************************/

   function _dispense(sum) {
      sum = +sum;

      if ( !sum || sum < 0 || sum % 0.5 ) {
         throw 'Unexpected input for dispense of ' + options.deviceName +' - ' + sum;
      }

      if ( options.isFake ) {

         console.error('SmartHopper FakeMode dispense alpha: report would be without changes and no check for possibility of delivery ');
         
         var _report = _cache.firstReport;

         _data = {
            dispensed: sum,
            newReport: _report
         }

         if ( !options.scenario.dispense.error ) {
            eventManager.publish(options.events.dispense.done, [_data]);
         } else {
            if ( !options.scenario.dispense.partial ) {
               _data = {
                  dispensed: 0,
                  newReport: _report
               }
               eventManager.publish(options.events.dispense.fail, [_data]);
            } else {
               if ( sum > 0.5 ) {
                  _data.dispensed = sum - 0.5;
                  eventManager.publish(options.events.dispense.fail, [_data]);
               }
            }
         }

         return;
      }

      var payout_cmd = COMMANDS.PAYOUT_SMART;
      // if( options.use_denominated_payout ){
      //    payout_cmd = COMMANDS.PAYOUT;
      // }

      var cmd = [payout_cmd, sum].join("_");
      if( options.maxDispense && options.maxDispense > 0 && sum > options.maxDispense ){
         cmd = [ payout_cmd, options.maxDispense ].join("_");
         console.log("Suppress max dispense from ", sum, "to",  options.maxDispense);
      }

      _cache.state = STATES.PAYOUT;
      _cache.toDispense = sum;
      _setDispenseTimeout(PAYOUT_TIMEOUT);
      _send(cmd);
   }

   function _dispenseAll() {

      var _report = _cache.firstReport;
      var _totalyInDevice = 0;
      for ( var _i in _report ) {
         if ( _report.hasOwnProperty(_i) ) {
            _totalyInDevice += _report[_i].count * _report[_i].value;
         }
      }

      if ( options.isFake ) {

         _data = {
            dispensed: _totalyInDevice,
            newReport: null
         }

         if ( !options.scenario.dispense.error ) {
            for ( var _i in _report ) {
               if ( _report.hasOwnProperty(_i) ) {
                  _report[_i].count = 0;
               }    
            }

            _data.newReport = _report;
            _cache.firstReport = _report;
            eventManager.publish(options.events.dispense.done, [_data]);
         } else {

            if ( !options.scenario.dispense.partial ) {
               _data = {
                  dispensed: 0,
                  newReport: _report
               }
               eventManager.publish(options.events.dispense.fail, [_data]);
            } else {
               throw 'DispenseAll unsupported in fakeMode of SmartHopper with this scenario';
            }
         }

         return;
      }

      _dispense(_totalyInDevice);
   }

   function _stop() {
      if( options.isFake ) { return console.log("SmartHopper stopping in fake mode"); }
      _send(COMMANDS.STOP);
   };

   function _reset() {
      _send(COMMANDS.RESET);
   };

   function setCoinLevel( levelObject ) {

      /*
      * Уставновка уровней проходит поэтапно (для каждой монеты)
      * При этом, каждый уровень ДОБАВЛЯЕТСЯ, а не устанавливается, поэтому
      * необходимо калькулировать на основе последнего отчета _cache.firstReport;
       */

      if ( options.isFake ) {
         throw 'setCoinLevel unsupported in fake Mode';
      }

      if ( typeof levelObject !== 'object' || !levelObject.length ) {
         return false;
      }

      _cache.setLevelStack = [];

      _rep = _cache.firstReport;

      for ( var _i in levelObject ) {
         if ( levelObject.hasOwnProperty(_i) ) {
            for ( var _k in _rep ) {
               if ( _rep[_k].value == levelObject[_i].value ) {
                  var _countToSet = -_rep[_k].count + levelObject[_i].count;
                  if ( _countToSet ) {
                     _cache.setLevelStack.push({
                        value: levelObject[_i].value * 100,
                        count: _countToSet   
                     });
                  }

               }
            }
         }
      }

      _cache.state = STATES.SET_COIN_LEVEL;

      return _setLevelStack();

   }


	/***************************************************************/
	/* API */
	/***************************************************************/
  
   self.dispenseAll = _dispenseAll;
   self.dispense = _dispense;
   self.setCoinLevel = setCoinLevel;
   self.reset = _reset;
   
   self.stop = _stop;

}
