var Helper = (function($, EM, IScroll, Environment) {

	/****************************************************/
	// TimeManager
	/****************************************************/

	function _getUnixTime() { return Date.now() / 1000 | 0; };  ///   Убираем мс и потом округляем

	function _getTime() { return (new Date()).toLocaleString().replace(/^.*,\s/g,''); };

	function _getDate() { return (new Date()).toLocaleString().replace(/,\s.*$/g,''); };

	function _getBeautifiedNumber( x ){
		return ( ''+x ).split('').reduceRight(function(out, y, index, array){
			ri = array.length - index;
			if( ri && !( ri % 3) ) return ' ' + y + out;
			return y + out;
		}, '').trim();
	};
	
	/****************************************************/
	// Ajax request
	/****************************************************/
	function _ajax( uri, postData, eventNames, hooks ) {

		if ( eventNames && typeof eventNames.DONE !== 'undefined' ) {
			eventNames.done = eventNames.DONE;
			eventNames.fail = eventNames.FAIL;
		}

		var _hooks = hooks || false;

		var dfd = new $.Deferred();

		function __checkDataAndPublich(data) {

			if ( !data ) {
				dfd.reject("connection fail");

				if ( eventNames && eventNames.fail ) {
					EM.pub(eventNames.fail, ['connection fail']);
				}

				return;
			}

			if ( typeof data.error == 'undefined' || typeof data.data == 'undefined' ) {

				dfd.reject('No error and data in answer from uri');

				if ( eventNames && eventNames.fail ) {
					EM.pub(eventNames.fail, 'No error and data in answer from uri');
				}

				return;
			}

			if ( data.error ) {

				dfd.reject(data.data);

				if ( eventNames && eventNames.fail ) {
					EM.pub(eventNames.fail, [data.data]);
				}

				return;

			}

			dfd.resolve(data.data);

			if ( eventNames && eventNames.done ) {
				EM.pub(eventNames.done, [data.data]);
			}

			return;
		}

		function __checkDataAndHooks(data) {
			if ( !_hooks ) {
				return;
			}

			if ( !data ) {

				if ( _hooks.fail ) {
					_hooks.fail('connection fail');
				}

				return;
			}

			if ( typeof data.error == 'undefined' || typeof data.data == 'undefined' ) {

				if ( _hooks.fail ) {
					_hooks.fail('No error and data in answer from uri');
				}

				return;
			}

			if ( data.error ) {

				if ( _hooks.fail ) {
					_hooks.fail(data.data);
				}

				return;

			}

			if ( _hooks.done ) {
				_hooks.done(data.data);
			}

			return;
		}

		$.ajax({
			url: uri,
			type: 'post',
			data: postData
		}).done(function( data ) {

			if ( Environment.get('trace.ajax') ) {
				console.group("Ajax Data");
					console.info('url - ' + uri);
					console.log('eventNames', eventNames);
					console.log('hooks', hooks);
					console.info('data:');
					console.info(postData);
					console.info('answer:');
					console.log(data);
				console.groupEnd();
			}

			__checkDataAndHooks(data);
			__checkDataAndPublich(data);

		}).fail(function( data ) {
			if ( Environment.get('trace.ajax') ) {
				console.group("Ajax Data");
					console.info('url - ' + uri);
					console.info('data:');
					console.info(postData);
					console.info('answer:');
					console.log(data.responseText);
				console.groupEnd();
			}

			__checkDataAndHooks(false);
			__checkDataAndPublich(false);
		});

		return dfd;
	};


	/****************************************************/
	// PRELOADER
	/****************************************************/

	$preloader = $('.preloader-wrap');

	function showPreloader() {
		$preloader.addClass("transition");
		$preloader.removeClass("hide");
		$preloader.addClass("show");
	};

	function hidePreloader() {
		$preloader.addClass("transition");
		$preloader.removeClass("show");
		$preloader.addClass("hide");
	};

	/****************************************************/
	// SCROLLS
	// при создании скармливаем объект полученный 
	// 	через document, а не jquery
	// document.getElementById
	/****************************************************/ 
	function createScroll(el) {

		return new IScroll(el, {
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: false,

			click: true,
		}); 

		//   myScroll.destroy();
		//   ранее был расcчет на один скролл на каждой странице
		//   поэтому он хранился прямо в хэлпере
	};


	/****************************************************/
	// ACTIVITY
	// 
	// ( время срабатывания, что вызывать, вкл логи )
	// вернет объект с checkActivity - который нужно вызывать
	// 	когда происходит какая-либо активность на странице 
	/****************************************************/ 
	function createActivityHandler( handler, timeout, debug ){

		var timeoutid = null;
		var self = {};

		//	чтобы "отметиться" - типо что-то происходило
		function _checkActivity( newtimeout ){
			clearTimeout( timeoutid );
			if(debug) console.log('ActivityHandler clear timeout');
			timeoutid = setTimeout( handler, ( newtimeout > 900 ) ? newtimeout : timeout );
		};

		//	на всякий - чтобы сменить обработчик по неактивности
		//	 или время срабатывания
		function _reinit( newhandler, newtimeout ){
			timeout = newtimeout || timeout;
			handler = newhandler || handler;
			self.checkActivity = _checkActivity;
			if(debug) console.log('ActivityHandler updated');
			self.checkActivity();
		};

		//	выключение обработчика
		function _disable(){
			clearTimeout( timeoutid );
			self.checkActivity = function(){};
			if(debug) console.log('ActivityHandler disabled');
		};

		//	мб нужен destroy
		//	+ нужны тесты
		//	особенно нужен дестрой, если будет по несколько раз без перезагрузок
		//	дестроить через перезаписанный хэндлер
		//	
		//	Алярм, _disable не срабатывал нормально! - не убирал checkActivity

		self = {
			checkActivity: _checkActivity,
			reinit: _reinit,
			disable: _disable,
		};

		self.checkActivity();

		return self;
	};


	//// На основе предыдущего, только с Popup уведомлением
	///  handler, timeout, beforeNoticeHandler, restoreHandler, restoreTimeout, text, notice
	function createActivityHandlerWithNotice( config ){
		
		if( !config.beforeNoticeHandler || typeof config.beforeNoticeHandler !== 'function' ) config.beforeNoticeHandler = function(){};
		if( !config.restoreHandler || typeof config.restoreHandler !== 'function' ) config.restoreHandler = function(){};
		config.restoreTimeout = config.restoreTimeout || 30000;
		config.text = config.text || "Вы еще здесь?";
		config.notice = config.notice || "Нажмите чтобы продолжить";

		var activity_once = false;
		function activityHandler(){
				if( activity_once ) return;
				activity_once = true;
				config.beforeNoticeHandler(); // $(document).off('click');

				var _redirect_timeout = createActivityHandler( config.handler, config.restoreTimeout );

				Popup.close();    /// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				///// потому не стоит использовать на платежке
				
				Popup.show({ text: config.text, notice: config.notice,
								close: function(){
									_redirect_timeout.disable();
									activity_once = false;
									config.restoreHandler(); 		//	$( document ).on( 'click', __t.checkActivity );
																			//	__t.checkActivity();
								}
						});
				// hidePreloader(); /// не должно быть
		};

		return Helper.createActivityHandler( activityHandler, config.timeout );
	};

	/****************************************************/
	// TRIBUTE
	/****************************************************/ 
	function _showBikt() {
		var bikt = "::::::::::::::::::::::::,::,,,:::::;;::::,,,,,,,,,......,..,,,,,...,......```````````````````````````````````````````..,\n;;;::::::::::::::::::::::::,,,::::::::::,,,,,,..,.........,,,,,::;;;;::::,.``````````````````````````````````````````..:\n;;;;;;:::::::::::::::::::::,,,,:::::::::,,,,,,,.,....,..,,:;;''''''''''';;;:,..``````````````````````````````````````.,:\n;;;;;;;:::::::::::::::::::,,,,,:::::::,,,,,,,,,,,,,.,,,:;;'''''''''+''''''''';,..````````````````````````````````````.,:\n;;;;;;;:::::::::::::::::::,,,,,,,:,,,,,,,,,,,,,,,,,,:;;;''''++'''''+++''''''''';,,.``````````````````````````````````.,:\n;;;;;;:::::::::::::::::,,,,,,,,,,,,,,,,,,..,,,,,,,:;;;;'++++++++++++++++''''+'''';:,.````````````````````````````````.,:\n;:::::::::::::::::,,,,,,,,,,,,,,,,,,,,,.....,,,,:;;;;'''++++++++++++++'+++'''''''';;:..``````````````````````````````.,:\n::::::::::::,,,,,,,,,,,,,,,,,,,,,,,,,,,....,,,::;;;''''++++++'+++++'++++++'''+''';;;;:,.`````````````````````````````.,:\n:::::::::::,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.,,,:::;:;'''''''++'+++++++++++++++#+'''''''';:,.````````````````````````````.,:\n::::::::::,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,::;:;;''''''++'++++++++++#++++++++'''+++++';,.```````````````````````````.,:\n:::::::::,,,,,::,,,,,,,,,,,,,,,,,,,,,,,,,,,:;::;''''';''+'+''+++++++++++#++++''++++++'+';:.``````````````````````````.,:\n::::::::::::::::::,,,:::::,,,,,,,,,,,,,,,,:::::;;';';''''+''''++++++++++++++'+++'+#+''++';:..````````````````````````.,:\n::::::::::::::::::::::::::,,,,,,::::,:,,,::::::;';'''''''+''+''+++'+'++++++++++'++++'++'+;;,..```````````````````````.,:\n:::::::::::::::::::::::::::::::::::,:,,,::::::;';;'''''+''''''+'''+'#++++'++++'++++'++++''';:.`.````````````````````..,;\n::::::::::::::::::::::::::::::::::,,,,,:::::::;;;''''''''''''''''+'++++++++++++++++'+++'''+';:.`.```````````````````..,;\n:::::::::::::::::::::::::::::::::::,,:::::::::;:;;''''''''''''''+''++++'+'++++++++'+#+''+##+';...```````````````````.,:;\n:::::::::::::::::::::::::::::::,:::,:::::::::;;;'''''''';;';'''''''+'+++'++++++++++''''''++'+;:..```````````````````.,:'\n;::::::::::::::::::::::::::::::::::,::::::,::;;;;';;;;'';';';'''''+'+''''+++++++++'+'''#++++;;;,.```````````````````.,:'\n;:::::::::::::::::::::::::::::::::::::::::;,;;;;;;;;;;;;';;;'''''''''''''+++++''+++'''#++++;+'';:.``````````````````.,:'\n;;;:::::::::::::::::::::::::::::::::::;::;::;;;;;;;;;;;;';;;'';;''''''''''+++++'+++'++''++'+''';::...```````````````.,:'\n;;;;;;::::::::::::::::::::::::::::::::::::::;;;;;;;;;;;;;;;;;;;''''''''''+'+++'++''+#+++''++'''':;:::.``````````````.,:'\n;;;;;;;;::::::::::::::::::::::::::::::::;,,;;;;::;;;:;;;;;;;;;;'';;;'''''''''+'++''++++++++'++';;;::;;.`````````````.,:'\n;;;;;;;;;;::::::::::::::::::::::::::;::;:,;;;;;::;;;:;;:;;;;::;;;';;''''''''''+'+++++++'+'+'+''';;:::::`````````````.,:'\n;;;;;;;;;;::::::::::::::::::::::::::;::;,:;;;:;:::;;:::;:;;;:;;;;;;'''''''''''++++++++'++++++'';';;::::````````````..,;+\n;;;;;;;;;:::::::::::::::::::::::::::;:;::;;;;:::::;:::::;;;:;:;;;;;;'''';';''+++'++++'++++'++'';+';;:::.```````````.,:;+\n;;;;;;;:::::::::::::::::::::::::::::;:;:::;;::::::;:::::;:::;:;;;';''''';;''+'++''+'+'++++'''''''';;::,,.``````````.,:'#\n;;;;;;;:::::::::::::::::::::::::::::::;::::;::::::;::::::::;:;;;;';'';';';'''++'+'++++++++'+''++''';;,:,.`````````..,;+#\n;;;;:::::::::::::::::::::::::::::::::;;;:::;:::::::::::::::::;;:;;;;;;;;';''''''+''+++++++'';;++''';;:,,..````````.,:'##\n;;;;:::::::::::::::::::::::::::::::::;:::::;:;::::::::::::::;:;;;;;;;;;;;'''''''''++++++'''';;+'''';;:,,..````````.,:'@#\n;;;:::::::::::::::::::::::::::::::::';:::::;::::::::::::,:::::;;;;;:;;;;;;';''''''++++'''''';'''''';::,,,..````````.:'#@\n;;;::::::::::::::::::::::::::::::::'';::::::::::::::::,,,:::::;;;;:;;;:;;;;;;';'''+''''+'''';''''';;::,,,..````````.,'##\n;;:::::::::::::::::::::::::::::::::+';:::::::,:::,,:::,,,:;::;;;;:::;:::;;;;;;;''''''''''''';''''';:::,,,..````````.,;+#\n;;;;:::::::::::::::::::::::::::::::+';;:::::::::,,,:::,::::::;;:;::;::::;;;;;;;'''''''''''''''''';;;;::,,..````````.,;++\n;;;;;::::::::::::::::::::::::::::::''';::::::::::,:::::::::::;;:;:::::::;;;;;;;;;;';''''''''''';'';;;:::,...``````..,;+'\n;:;;;;:::::::::::::::::::::,:::;:::;;;':::::::;;::::::::::,::::::::::::;;;;;;;';;;;;''''''''''';;';;;:::,....`````.,:;+;\n;:;;;;;:::::::::::::::::::::+#;';'++';;;:::::;;:;';::::::,::::::::::::;:;;;;;;;;:;;;;;';''''+'';;'';;:::,.........,,;'+;\n;;;:;;;:::::::::::::::::::::'';'##++##'';::,:::;;;'':::;:,,::::::::::::;;;;;;;;:::;;:;;;';'''''';;;;:;::,......,,,::''':\n;:;;;;;;::::::::::::::::::::::,;;:;'#+#';::,:::::;'';:;;::::::::::::::::;:;;;;;;::;;:;:;';'''';'';;;;;::,,.,,,,,::;''+':\n;::;;;;::::::::::::::::::::::,.;;::;+'#,;:,,:::::::::;;:;;::::::::::::;;;;;;:;;;;;';;;:;;;;;;'';';;;;;;:,,,,,,,::;''+'';\n;;;;;;;::::::::::::::::::::::,`;;::'+'#++;:;+';;;;:::,:;;::;;::::::::;;;;;;;:;;;;:;;;;;:;:;;';;;';;;;;:,,,,,,:::;;''''';\n;;;;;;;::::::::::::::::::::::..;;::'''+#;;+;;::'#+';:::::;;;;::::::::::;;;;;;;;;;;;:;:;:;:;;';;;';;;;;:,,::::::;;''''';;\n;;;;;;;::::::::::::::::::::::;;';;;';;#';,:':::;'++#';:::::;;;:::::::::;;;;;:;;;;;;;::::;;;;;;'';;;;;:,,,:::::;;;;''';;;\n;:::::::::::::::::::::::::::::''';'';'+;:::+';:;''++'+;;:::::;:::::::::;;;;:;;;;;;;;;;:;;;:;;:;';;;;;:,,:::::;;;;;;;;;;;\n;::::::::::::::::::::::::::::::'';;''+;:::;+;';;''+'+;+';:::::;::::::::;;;:;;:;':;;;;;;;;;:;;:;';;;';:,::::::;;;;;;;;;;;\n;;:::::::::::::::::::::::::::::::;++++;:::;';;;;''++;;#+++;;;;;:::::::;;;;;;::;;::;;;;;;;;;;;;'';';';:,::::::::::::;;;::\n;;;;;:::::::::::::::::::::::::::::;;;;::::;';:;;;'';;;#,######++'';;;;;;;;;:;:;;;;;;;;;''';;;''';';;;:,:::::::::::::::::\n;;;;::::::::::::::::::::::::::::::;;;::::,:+;::;;;;:::+:;;;'++###@#######+';;';;'''';';'+'';;;'';;';;:,:::::::::::::::::\n;;;;::::::::::::::::::::::::::::::;;;::::,:;';::;;::::':::::::::::::::;;''++++#+++#''+;'''+''';';;';;:,,::::::::::::::::\n;;;;::::::::::::::::::::::;;;;;;;;;;;:::::,:,:+;;;:::;::::::::,,::::::;;;;''''+';;;;;;;;;''+'';'';;;::,:::::::::::::::::\n;;;;;;;;;;;;;;;;;;:;;;;;;;;;;;;;;;;::::;::,,:,,:++;;;+:::,::::,,:::::::;;'';''';::::::;;';'''''';;;:::,,:::::::,,,,,::,,\n;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::::::::,,,,,:::::,,,,,,:::,:::::::;;;';;''';::::;;:;';;;++'';;;:::,,::::::,,,,,,,,,,\n;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;::::::;;:::,,,,,::,::,,,,,,,,,::::::;;;;;'''';:::;';,:;';;;+''';;:::,,,,:::,,,,,,,,,,,,\n;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::,:::;;;;;:,,,,,,:::,,,,,,,,::::::;:;;;;'''';:;;;;:,:;';;;+''';:::,,,,,,::,,,,,,,,,,,,\n;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:,:,,:;;;;;:,,,,,,,,,,,,,,,,,:::::::;;;''''';;:;'';:::;':;;+''';::,:::,,,,:,,,,,,,,,,,,\n;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::::::;;;:,,,,,,,,,,,,,,,,:::::::;;;;;'''';;::';:,;:;';;''';';:,,,,:,,,,::,,,,,::::::\n;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::::;;:,::,,,,,,,,,,,,,::::::::;;;'''';;::;';:,;:;';;''';;;:,,,,::,,:::,,:,:::::::\n;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;';:::::;;::::,,,,,,,,,,,,::::::::;;;;;;;';;::';:,:;:;;;'''';;;:,,,,::::,::,::::::::::\n;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;';;::::;;;:::,,,,,,,,,,,,,:::::::;:;;;;';';;:'';:;;;:';+''';;;;:,,,,::::::::::::::::::\n;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;';:::,::::,:::,,,,,,,,,,,,:::::::::;;;;;;;;;;+++''::;;++'';;;;:::,,,::::::::::::::::::\n';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;::::,,::::::,,,,,,,,,,,:::::::::::;;;;;';;;;:;;;;;;:'+''';;;::::::,::::::::::::::::::\n';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;::::,:::::::,,,,,,,,,,,::::::::::;;;;;'';;;;:,:;';:;++''';;::,::::::::::::::::::::::;\n';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;';;:::::::::,:,,,,,,,,,:::::::::::;;;;;'''':;:::::;;++''';;;:::::::::::::::::::;;;;;;;\n';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;';;::,:,::::,,,,,,,,,,:,:::::::::;;;;''''':;+';:;'+++'';;;;:::::::::::::::::;:;;;;;;;\n';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;';;;:,,,,,,,,,,,,,,,,,:,::::::::;;;;''''''::;+;;'+++++';;;:::::::::::::::::;;;;;;;;;;\n;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;++#+;;:,,,:,,,,,,,,,,,:,::::::::;;;;'''''+';',''+++++';;;;::::::::::::::;;;;;;;;;;;;;\n;;;;;;;;;;;''';;;;;;;;;;;;;;;;;;;+@''+++#':::,,,,,,,,,,,,::::::::::;;;;'''''''###'+++++'';;;;::::::::::;;;;;;;;;;;;;;;;;\n;;;;;;;;;;;'''';;;;;;;;;;;;;;;;;;'#';;'''++';:,,,,,,,,,,,:::::::::;;;;;''''''''''+++++''';;;;::::::::;;;;;;;;;;;;;;;;;''\n;;;;;;;;;;'''''';;;;;;;;;;;;;;;;;;;';;;;;;''';::,,,,,,,,::::::::::;;;;;'''''''''''++++''';;;::::::::;;;;;;;;;;;;;;;'''''\n;;;;;;;;;;;;;;;'';;;;;;;;;;;;;;;;;;;';;;;;;:::::,,,:,:,,:::::::::;;;;;''''''''''''+++''';;;;:::::::;;;;;;;;;;;;;;'''''''\n;;;;;;;;;;;;;;;;''''''';;;;;'''';;;;;;;:::::::::,,,:,:,,:::::::::;;;;''''''''''''''+''';;;;:::::;;;;;;;;;;;;;;;;''''''''\n''''';;;;;;;;;;;;;''''''';;;'''';''';;;::::::::::,,,,:::::::::::;;;;;''''''''''''+'''';;';:;;;:;;;;;;;;;;;;;;;;;''''''''\n''''''';;;;;;;;;;''''''''''''''''+##;;;;::::::::::::,:::::::::::;;;;''''''';''''''''';;;;;:;;;;;;;;;;;;;;;;;;;;;''''''''\n''''''';;;;;;;;;;;'''''''''''''+##@#;;;:::::::::::::::::::::::;;;;;''''''';;''''+';';;;;::;;;;;;;;;;;;;;;;;;;';;''''''''\n''''''';;;;;;;;;;;''''''''';;'+#@@@@;;:::::::::::::::,:::::::;;;;'''''';;;;;;''''''';;';:;;;;;;;;;;;;;;;;;;;;;;;';''''''\n'''''''';;;;;;;;;;;''''''';'+##@@@@#';::,:::::::::::::::::::;;;;''''';;;;;;;;'''+''+';';;';;;;;;;;;;;;;;;;;;;'''''''''''\n'''''''''';''''''''''''''''+#@@@@@@#+;:::,,:,:,,,,:::::::::;;;;'''';;;;;;;;;;'''''++';';'+';;;;;;;;;;;;;;;;;;'''''''''''\n''''''''''''''''''''''''''+#@@@#@@@##;:::,,,,,,,,:::::::::;;;''''';;;;;;;;;;;''''+++'';'+@#';;;;;;;;;;;;;;;;;;;'''''''''\n'''''''''''''''''''''''''+#@@@@@#@###';:::::,,,,,::::::::;;''''';;;;::::;;;;;'''++++'#;+##@#';;;;;;;;;;;;;;;;;;;''''''''\n''''''''''''''''''''''''+#@#@@@@@@##@#;:::::,,,:::::::;;;'''''';;;;:::::;;;;;''+++++'@#@####+;;;;;;;;;;;;;;;;;;;;;''''''\n''''''''''''''''''''''''##@@@@@@@######;;::::::::::;;;;'''''';;;;;:::::;;;;;;''+++++'#@@@@###+;;;;;;;;;;;;;;;;;;;;;;;;;;\n'''''''''''''''''''''''+##@@@@@@@#######+;;::::;;;;;''''''';;;;:;::::::::;;;'''++++++#@@###@##+;;;;;;;;;;;;;;;;;;;;;;;;;\n''''''''''''''''''''''+##@@@@@@@@########@##'''''''''''';;;;;;::::::::::;;;;''''+++++###@@@@@##';;;;;;;;;;;;;;;;;;;;;;;;\n''''''''''''''''''''''+##@@@@@@@#########@#@@@@@';;;;;;;;;;;::::::::::::;;;;'''++++##@@@@@@@@##+';;;;;;;;;;;;;;;;;;;;;;;\n'''''''''''''''''''''+#@#@@@@@@#########@@#@@@@@'';;;;;;::::::::::::::::;;;;'''++##@@@@@@@@@@@##+';;;;;;;;;;;;;;;;;;;;;;\n'''''''''''''''''''''+#@@@@@@@@########@@#@@@@@@';;;;;;::::::::::::::::::;;''''+#@@@@@@@@@@@@@@###';;;;;;;;;;;;;;;;;;;;;\n''''''''''''''''''''+#@#@@@@@@@########@#@@@@@@@';;;;;::::::::::::::::::;;;''+#@@@@@@@@@@@@@@@@##@#+';;;;;;;;;;;;;;;;;;;\n''''''''''''''''''''+#@@@@@@@@########@@@@@@@@@@';;;;;;:::::::::::::::::;;'+#@@@@@@@@@@@@@@@@@@@##@@+';;;;;;;;;;;;;;;;;;\n''''''''''''''''''''#@@@@@@@@@#########@@@@@@@@@+;;;;::::::::::::::::::;;+#@@@@@@@@@@@@@@@@@";
		console.log('%c' + bikt, "font-size: 10px;");
	};


	/****************************************************/
	// JS
	/****************************************************/ 
	function deleteElementFromArray(array, ind) {
		if(!Array.isArray(array) || ind < 0){ console.log('delete from array error'); return array; }

		///	на деле надо делать concat двух массивов урезанных
		
		var out = [];
		array.forEach( function(e, i){
			if(i !== ind ) out[out.length] = e;
		});
		return out;
	};

	/****************************************************/
	// СКЛОНЕНИЕ
	// Helper.prepareIntTitle( 0, ['подарок', 'подарка', 'подарков']) - подарков
	// Helper.prepareIntTitle( 101, ['подарок', 'подарка', 'подарков']) - подарок
	/****************************************************/ 
	function prepareIntTitle(number, titles) {  
		 cases = [2, 0, 1, 1, 1, 2];
		 number = Math.trunc( number );
		 return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];  
	};

	/****************************************************/
	// Float with .00
	function parseDecimal(str){
		str = parseFloat(str);
		if( !str ) return str;
		return Math.round( str * 100 ) / 100;
	};


	/****************************************************/
	// Сравнение
	/****************************************************/
	function deepCompare (x, y) {
		var i, l, leftChain, rightChain;

		function compare2Objects (x, y) {
				var p;

				// remember that NaN === NaN returns false
				// and isNaN(undefined) returns true
				if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
					return true;
				}

				// Compare primitives and functions.     
				// Check if both arguments link to the same object.
				// Especially useful on the step where we compare prototypes
				if (x === y) {
				  return true;
				}

				// Works in case when functions are created in constructor.
				// Comparing dates is a common scenario. Another built-ins?
				// We can even handle functions passed across iframes
				if ((typeof x === 'function' && typeof y === 'function') ||
				 (x instanceof Date && y instanceof Date) ||
				 (x instanceof RegExp && y instanceof RegExp) ||
				 (x instanceof String && y instanceof String) ||
				 (x instanceof Number && y instanceof Number)) {
				  return x.toString() === y.toString();
				}

				// At last checking prototypes as good as we can
				if (!(x instanceof Object && y instanceof Object)) {
				  return false;
				}

				if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
				  return false;
				}

				if (x.constructor !== y.constructor) {
				  return false;
				}

				if (x.prototype !== y.prototype) {
				  return false;
				}

				// Check for infinitive linking loops
				if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
					return false;
				}

				// Quick checking of one object being a subset of another.
				// todo: cache the structure of arguments[0] for performance
				for (p in y) {
				  if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
						return false;
				  }
				  else if (typeof y[p] !== typeof x[p]) {
						return false;
				  }
				}

				for (p in x) {
				  if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
						return false;
				  }
				  else if (typeof y[p] !== typeof x[p]) {
						return false;
				  }

				  switch (typeof (x[p])) {
						case 'object':
						case 'function':

							 leftChain.push(x);
							 rightChain.push(y);

							 if (!compare2Objects (x[p], y[p])) {
								  return false;
							 }

							 leftChain.pop();
							 rightChain.pop();
							 break;

						default:
							 if (x[p] !== y[p]) {
								  return false;
							 }
							 break;
				  }
				}

				return true;
		};

		if (arguments.length < 1) {
			return true; //Die silently? Don't know how to handle such case, please help...
			// throw "Need two or more arguments to compare";
		}

		for (i = 1, l = arguments.length; i < l; i++) {

			leftChain = []; //Todo: this can be cached
			rightChain = [];

			if (!compare2Objects(arguments[0], arguments[i])) {
				return false;
			}
		}
		return true;
	};



	var popup_timeout_id = null;
	function showPopup(text, callback, timeout, notice){
		if(!callback || (typeof callback !== 'function' && typeof callback !== 'number')) callback = _ => _;
		if( timeout && typeof callback === 'function' ){
		  clearTimeout(popup_timeout_id);
		  popup_timeout_id = setTimeout( _ =>{ callback(), Popup.close() }, timeout);
		}
		
		Popup.show({ text: text, close: _ =>( clearTimeout(popup_timeout_id), callback()), notice: notice || '' });
		setTimeout(hidePreloader, 300);
	};

	function maskPhone(phone, input) {
		if (phone.length > 10) {
			phone = phone.substring(0, 10);
			if( input ) input.val(phone);
		}

		var p = phone;
		var out = '';
		p = p.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
		if (!p || !p[1]) return '';
		
		if (!p[2]) {
			out = `(${p[1]}) ___ __-__` || '';
		} else {
			out = '(' + p[1] + ') ' + p[2];
			out += ' ' + (p[3] ? p[3] : '__');
			out += '-' + (p[4] ? p[4] : '__');
		}
		
		return '+7 ' + out;
	};

	return {
		getUnixTime: _getUnixTime,
		getTime: _getTime,
		getDate: _getDate,
		beautify: _getBeautifiedNumber,
		maskPhone: maskPhone,

		ajax: _ajax,
		
		showPreloader: showPreloader,
		hidePreloader: hidePreloader,
		showPopup: showPopup,

		createScroll: createScroll,
		createActivityHandler: createActivityHandler,
		createActivityHandlerWithNotice: createActivityHandlerWithNotice,
		
		showBikt: _showBikt,
		
		deleteElementFromArray: deleteElementFromArray,
		prepareIntTitle: prepareIntTitle,
		parseDecimal: parseDecimal,
		compareObjects: deepCompare
	};


}($, EM, IScroll, Environment))

