/* пост терминал для меги */

function EFTPOS(options, eventManager, Logger) {
	var connection = null;
	var isdebug = false;
	var state = null;
	var last_query = null; // последний запрос

	var _tmp = {
		ticket: "", // собираем части слипа из разных пакетов
		started: false,
		status_payment: false,
		urn: null,
		last_payment: null,

		// Время последнего ответа, для калькуляции таймингов
		last_time_out: null,

		// Опперация на выполнение в таймере
		timeout_callback: null,

		// id таймер для
		timer_id: null,

		// текущее время ожидания, определяет можно ли сейчас чтолибо отправлять
		time: 3,
	};

	const defaultStartTimeout = 15000;
	let start_timeout = null; 

	// var last = {processed:};

	const STATES = {
		LOGIN: "LOGIN",
		INIT: "INIT",
		READY: "READY", // ожадание
		PAYMENT: "PAYMENT",
		BACK: "BACK", // Возврат
		EHCASH: "ENCASH",
		ERROR: "ERROR",
	};

	/*
		//* Значения поля "status" в остальных случаях

		///? всё заебца
		00 - успешное начало сессии с устройством
		10 - сокет готов к работе (Socket Ready)
		100 - устройство готово к новому запросу (The device is ready for a new request")

		///? Критичная ошибка
		01 - неверный формат данных (Invalid data format)
		02 - устройство не отвечает (The device does not respond)

		///? Лёгонькая ошибка
		03 - превышен таймаут ожидания от устройства (The device does not respond | out of timeout(...))
		04 - устройство занято. В данный момент проходит операция , обмен данными с устройством  (The device is busy. Message processing in progress)
		05 - не существующий класс или код операции, или функция в данный момент не активна (There is no such class | code, or this function is not activated)
		06 - локальный номер транзакции в ответе не совпадает с исходным (No valid local transaction number)
		08 - неверный токен (Token invalid)

	*/

	const s_ok = ['00', '10', '100'],
		s_warning = ['04', '05', '06', '08', '03'],
		s_critical = ['01', '02'];


	function _log(type, msg, ...data) {
		if (isdebug) console.log(msg);
		switch (type) {
			case -1: type = "<-----"; break; // полученно
			case 1: type = "----->"; break; // отправленно на устройство
			default: type = "------"; break;
		}
		return Logger.log([type, options.deviceName, msg, ...data].join(" "));
	};

	function _debug(msg, ...data) {
		if (options.debug) console.log(options.deviceName, msg, ...data);
	};

	// возврат ошибки
	function _raiseError(event, message) {
		_log(0, 'ERROR', message);
		console.error(message);
		return eventManager.publish(event, message);
	};

	function timeh() {
		return parseInt(new Date().getTime() / 1000) + 2112374856738
	}

	function utf8_encode(str_data) {
		str_data = str_data.replace(/\r\n/g, "\n");
		var utftext = '';
		for (var n = 0; n < str_data.length; n++) {
			var c = str_data.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	}

	////// no comments
	function _md5(str) {
	  var RotateLeft = function (lValue, iShiftBits) {
	    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
	  };
	  var AddUnsigned = function (lX, lY) {
	    var lX4, lY4, lX8, lY8, lResult;
	    lX8 = (lX & 0x80000000);
	    lY8 = (lY & 0x80000000);
	    lX4 = (lX & 0x40000000);
	    lY4 = (lY & 0x40000000);
	    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
	    if (lX4 & lY4) {
	      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
	    }
	    if (lX4 | lY4) {
	      if (lResult & 0x40000000) {
	        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
	      } else {
	        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
	      }
	    } else {
	      return (lResult ^ lX8 ^ lY8);
	    }
	  };
	  var F = function (x, y, z) { return (x & y) | ((~x) & z); };
	  var G = function (x, y, z) { return (x & z) | (y & (~z)); };
	  var H = function (x, y, z) { return (x ^ y ^ z); };
	  var I = function (x, y, z) { return (y ^ (x | (~z))); };
	  var FF = function (a, b, c, d, x, s, ac) {
	    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
	    return AddUnsigned(RotateLeft(a, s), b);
	  };
	  var GG = function (a, b, c, d, x, s, ac) {
	    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
	    return AddUnsigned(RotateLeft(a, s), b);
	  };
	  var HH = function (a, b, c, d, x, s, ac) {
	    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
	    return AddUnsigned(RotateLeft(a, s), b);
	  };
	  var II = function (a, b, c, d, x, s, ac) {
	    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
	    return AddUnsigned(RotateLeft(a, s), b);
	  };
	  var ConvertToWordArray = function (str) {
	    var lWordCount;
	    var lMessageLength = str.length;
	    var lNumberOfWords_temp1 = lMessageLength + 8;
	    var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
	    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
	    var lWordArray = Array(lNumberOfWords - 1);
	    var lBytePosition = 0;
	    var lByteCount = 0;
	    while (lByteCount < lMessageLength) {
	      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
	      lBytePosition = (lByteCount % 4) * 8;
	      lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
	      lByteCount++;
	    }
	    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
	    lBytePosition = (lByteCount % 4) * 8;
	    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
	    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
	    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
	    return lWordArray;
	  };
	  var WordToHex = function (lValue) {
	    var WordToHexValue = '', WordToHexValue_temp = '', lByte, lCount;
	    for (lCount = 0; lCount <= 3; lCount++) {
	      lByte = (lValue >>> (lCount * 8)) & 255;
	      WordToHexValue_temp = '0' + lByte.toString(16);
	      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
	    }
	    return WordToHexValue;
	  };
	  var x = Array();
	  var k, AA, BB, CC, DD, a, b, c, d;
	  var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
	  var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
	  var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
	  var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
	  str = utf8_encode(str);
	  x = ConvertToWordArray(str);
	  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
	  for (k = 0; k < x.length; k += 16) {
	    AA = a; BB = b; CC = c; DD = d;
	    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
	    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
	    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
	    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
	    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
	    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
	    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
	    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
	    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
	    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
	    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
	    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
	    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
		 d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
	    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
	    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
	    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
	    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
	    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
	    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
	    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
	    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
	    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
	    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
	    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
	    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
	    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
	    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
	    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
	    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
	    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
	    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
	    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
	    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
	    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
	    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
	    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
	    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
	    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
	    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
	    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
	    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
	    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
	    b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
	    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
	    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
	    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
	    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
	    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
	    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
	    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
	    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
	    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
	    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
	    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
	    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
	    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
	    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
	    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
	    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
	    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
	    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
	    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
	    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
	    a = AddUnsigned(a, AA);
	    b = AddUnsigned(b, BB);
	    c = AddUnsigned(c, CC);
	    d = AddUnsigned(d, DD);
	  }
	  var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
	  return temp.toLowerCase();
	};

	// Функция логина
	function _login() {
		_send({
			class: "3",
			code: "0",
			// tid: "77421759", // nika
			// tid: "77317715",
			infocode: "1"
		});
		state = STATES.LOGIN;
	}

	/*
	//* Технические тайминги
	///? Между последовательно выполняемыми запросами должны соблюдаться технологические таймауты:
	→	после ответа 3-1 на запрос 3-0 Login – таймаут 3 секунды;
	→	после ответа 5-1 на любой запрос – таймаут 3 секунды;
	→	после ответа 5-4 на любой запрос – таймаут 3 секунды;
	→	после ответа 6-0 на любой прикладной запрос - таймаут 10 секунд;
	→	после ответа 5-X на любой прикладной запрос – таймаут 15 секунд;
	→	после получения печатной формы ответами 3-2 - таймаут 10 секунд.
	*/
	// тут пришло сообщение пересчитываем через сколько можно выполнять
	// обновляем существующие тайминги
	function _calcTiming(data, time) {
		if (_tmp.timer_id) clearTimeout(_tmp.timer_id);

		// записываем новые тайминги
		_tmp.last_time_out = Date.now() / 1000;
		_tmp.time = time;

		// Переопределяем таймер
		if (_tmp.timeout_callback) {
			_log(1, 'Timeout drop');
			_tmp.timer_id = setTimeout(_tmp.timeout_callback, _tmp.time * 1000);
		}
	}

	function calcTiming(data) {
		if (data.class == "3" && data.code == "1") _calcTiming(data, 3);
		if (data.class == "5" && data.code == "1") _calcTiming(data, 3);
		if (data.class == "5" && data.code == "4") _calcTiming(data, 3);
		if (data.class == "6" && data.code == "0") _calcTiming(data, 10);
		if (data.class == "5" && data.code == "X") _calcTiming(data, 15);
		if (data.class == "3" && data.code == "2") _calcTiming(data, 3);
	}

	function _send(obj) {
		if (connection.readyState != 1) {
			servicemessage('Socket closed', "red");
			return _debug('socket closed');
		}

		if (_tmp.timeout_callback) _log(1, 'Timeout drop');

		_log(1, 'sending', obj);
		_debug('sending', obj);

		if (_tmp.timer_id) clearTimeout(_tmp.timer_id);
		_tmp.timeout_callback = () => {
			_log("send");
			last_query = obj;
			obj.token = _md5(utf8_encode(timeh().toString())).substr(7, 12);
			obj = JSON.stringify(obj);

			servicemessage(obj, "blue");
			connection.send(obj);

			clearTimeout(_tmp.timer_id);
			_tmp.timeout_callback = null;
		};

		let time = (_tmp.last_time_out + _tmp.time) - (Date.now() / 1000);
		if (time < 0)
			_tmp.timeout_callback();
		else
			_tmp.timer_id = setTimeout(_tmp.timeout_callback, time * 1000);

	}

	// функция чтобы вести в лог
	function servicemessage(message, color = "green") {
		if (isdebug)
			eventManager.publish(options.events.servicemessage, { message: message, color: color });
	}

	// возвращает массив строк слипа подрят
	function getArrayCheck(ticket) {
		return ticket.replace(/\|\|/g, "|\n|").split("\n");
	}

	let hold_ignore_flag = true;
	function handlerMessages(e) {
		servicemessage(e.data, "green");

		_log(-1, 'answer', e.data);
		_debug('in socket', e.data);

		var data = null;
		try { data = JSON.parse(e.data); } catch (e) { return console.error('JSON parse error'); }

		calcTiming(data);

		//console.log(data);
		
		//	if (data.errorcode=="E3") {
		//		clearTimeout(start_timeout);
		//		state = STATES.ERROR;
		//		return eventManager.publish(options.events.start.fail, data.statuscodestring);
		//	}

		/////// TMP
		// // Определение критической ошибки
		// if (s_critical.indexOf(data.status) > -1)
		// 	return eventManager.publish(options.events.critical);

		
		// if (data.class == "5" && data.code == "X" && data.errorcode != "E2")
		// 	return eventManager.publish(options.events.critical, data.errorcodestring);
		////////

		// одна попытка на случай того если токены не совпадут
		if (data.status == "08" && last_query) {
			_send(last_query);
			console.log("Token invalid, second try to send", last_query);
			last_query = null;
			return;
		}

		/////////////////////
		//// HOLD HANDLER
		if (data.class == "5" && data.code == "5" ) 
			return hold_ignore_flag = true;

		if( hold_ignore_flag ){
			hold_ignore_flag = false;
			if (data.class == "1" && data.code == "0" && data.status == "100" )
				return;
			/// по факту надо проверять, вдруг будет status !== 100 и этот момент нужно ловить...
		}
		/////////////////////
		
		/////////////////////
		//// MESSAGE HANDLER
		if (data.class == "5" && data.code == "M")
			eventManager.publish(options.events.message, data.message);
		/////////////////////


		if (state == STATES.INIT) {
			if (s_ok.indexOf(data.status) === -1){
				clearTimeout(start_timeout);
				state = STATES.ERROR;
				return eventManager.publish(options.events.start.fail, data.statuscodestring);
			}

			return _login();
		}


		if (state == STATES.LOGIN) {
			// значит ждём логин и игнорируем все остальные
			return _onLogin( data );
		}

		if (state == STATES.READY) {
			return;
		}

		if (state == STATES.PAYMENT) {
			return _onPayment( data );
		}

		if (state == STATES.BACK) {
			return _onCancel( data );
		}

		if (state == STATES.ENCASH) {
			return _onEncash( data );
		}


		////// OLD Critical Handler
		// Определение критической ошибки
		if (s_critical.indexOf(data.status) > -1)
			return eventManager.publish(options.events.message, "Критическая ошибка");

		if (data.class == "5" && data.code == "X" && data.errorcode != "E2")
			return eventManager.publish(options.events.message, "Критическая ошибка - " + data.errorcodestring);

	};

	function _onLogin( data ){
		/*
			// Значения поля "statuscode" в ответе на Login
			0	EFTPOS устройство полностью готово к обработке транзакций по картам
			1	EFTPOS устройству требуется инкассация
			2	В EFTPOS устройстве закончилась бумага для печати
		*/
		// чекаем, если первый запуск то воззвращаем ошибку старта
		clearTimeout(start_timeout);
		if (data.statuscode == '0') {
			state = STATES.READY;
			eventManager.publish(options.events[_tmp.started ? 'login' : 'start'].done);
			_tmp.started = true;
		} else {
			if( !_tmp.started ) state = STATES.ERROR;
			eventManager.publish(options.events[_tmp.started ? 'login' : 'start'].fail, data.statuscodestring);
		}
	}

	function _onPayment( data ){
		let ev = null, ev_data = null;

		if (s_critical.indexOf(data.status) > -1 || s_warning.indexOf(data.status) > -1){
			ev = options.events.payment.fail; 
			ev_data = { error: data.statuscodestring ? data.statuscodestring : "Error" };
		}

		if (data.class == "5" && data.code == "X" && data.errorcode == "E2"){
			ev = options.events.payment.fail; 
			ev_data = { error: data.statuscodestring ? data.statuscodestring : (data.errorcodestring ? data.errorcodestring : "Error") };
		}
		
		// if (data.class == "5" && data.code == "X" && data.errorcode == "13") /// ОШИБКА Сетевого интерфейса?
		// 	eventManager.publish(options.events.payment.fail, { error: data.statuscodestring ? data.statuscodestring : (data.errorcodestring ? data.errorcodestring : "Error") + `<br> errorcode: ${data.errorcode}  errormessage: ${data.errormessage}` });

		if (data.class == "5" && data.code == "X" && data.errorcode != "E2"){
			state = STATES.READY;
			return eventManager.publish(options.events.critical, data.errorcodestring);		
		}

		// первичный ответ
		if (data.class == "5" && data.code == "0")
			eventManager.publish(options.events.message, "Соединение установленно");

		// if (data.class == "5" && data.code == "M")
		// 	eventManager.publish(options.events.message, data.message);

		// Разрешенно
		if (data.class == "6" && data.code == "0" && data.responsecode == "00") {
			_tmp.status_payment = true;
			eventManager.publish(options.events.message, data.message);
		}

		// Не разрешено по каким либо причинам
		if (data.class == "6" && data.code == "0" && data.responsecode != "00")
			eventManager.publish(options.events.message, data.message);

		// Сохраняем уникальный номер опперации
		if (data.class == "6" && data.code == "0") {
			_tmp.last_payment = data;
			_tmp.urn = data.urn;
		}

		// сохраняем данныеп по опперации
		if (data.class == "3" && data.code == "2")
			_tmp.ticket += data.textline;

		// В штатном режиме прошло, значит возвращаем ответ от банка
		if (data.class == "1" && (data.code == "100" || data.code == "0")) {
			if (_tmp.status_payment){
				ev = options.events.payment.done; 
				ev_data = { slip: getArrayCheck(_tmp.ticket), urn: _tmp.urn, data: _tmp.last_payment };
			} else {
				ev = options.events.payment.fail; 
				ev_data = { slip: getArrayCheck(_tmp.ticket), urn: _tmp.urn, data: _tmp.last_payment ? _tmp.last_payment : {} };
			}
		}


		/// end operation
		if( ev && ev_data ){ 
			eventManager.publish( ev, ev_data );
			state = STATES.READY;
		}
	};

	function _onCancel( data ){

		let ev = null, ev_data = null;

		// чекаем ошибки
		if (s_critical.indexOf(data.status) > -1 || s_warning.indexOf(data.status) > -1){
			ev = options.events.cancel.fail; 
			ev_data = { error: data.statuscodestring ? data.statuscodestring : "Error" };
		}

		if (data.class == "5" && data.code == "X"  && data.errorcode == "E2"){
			ev = options.events.cancel.fail;
			ev_data = { error: data.statuscodestring ? data.statuscodestring : "Error" };
		}

		if (data.class == "5" && data.code == "X" && data.errorcode != "E2"){
			state = STATES.READY;
			return eventManager.publish(options.events.critical, data.errorcodestring);
		}

		// не найденна опперация
		if (data.class == "5" && data.code == "4"){
			ev = options.events.cancel.fail;
			ev_data = { error: data.description };
		}

		// первичный ответ
		if (data.class == "5" && data.code == "0")
			eventManager.publish(options.events.message, "Соединение установленно");

		// if (data.class == "5" && data.code == "M")
		// 	eventManager.publish(options.events.message, data.message);

		// Разрешенно
		if (data.class == "6" && data.code == "0" && data.responsecode == "00") {
			_tmp.status_payment = true;
			eventManager.publish(options.events.message, data.message);
		}

		// Не разрешено по каким либо причинам
		if (data.class == "6" && data.code == "0" && data.responsecode != "00")
			eventManager.publish(options.events.message, data.message);


		// Сохраняем уникальный номер опперации
		if (data.class == "6" && data.code == "0") {
			_tmp.last_payment = data;
			_tmp.urn = data.urn;
		}

		// сохраняем данныеп по опперации
		if (data.class == "3" && data.code == "2")
			_tmp.ticket += data.textline;

		// В штатном режиме прошло, значит возвращаем ответ от банка
		if (data.class == "1" && (data.code == "100" || data.code == "0" || data.code == "A")) {
			if (_tmp.status_payment){
				ev = options.events.cancel.done;
				ev_data = { slip: getArrayCheck(_tmp.ticket), urn: _tmp.urn, data: _tmp.last_payment };
			} else {
				ev = options.events.cancel.fail;
				ev_data = { slip: getArrayCheck(_tmp.ticket), urn: _tmp.urn, data: _tmp.last_payment };
			}
		}

		/// end operation
		if( ev && ev_data ){ 
			eventManager.publish( ev, ev_data );
			state = STATES.READY;
		}
	};

	function _onEncash( data ){
		// чекаем ошибки
		if (s_critical.indexOf(data.status) > -1 || s_warning.indexOf(data.status) > -1){
			eventManager.publish(options.events.encash.fail, { error: data.statuscodestring ? data.statuscodestring : "Error" });
			return state = STATES.READY;
		}

		if (data.class == "5" && data.code == "X") {
			eventManager.publish(options.events.encash.fail, { error: data.statuscodestring ? data.statuscodestring : "Error" });
			return state = STATES.READY;
		}

		// if (data.class == "5" && data.code == "M")
		// 	eventManager.publish(options.events.message, data.message);

		// сохраняем данныеп по опперации
		if (data.class == "3" && data.code == "2")
			_tmp.ticket += data.textline;

		// В штатном режиме прошло, значит возвращаем ответ от банка
		if (data.class == "2" && data.code == "1") {
			eventManager.publish(options.events.encash.done, { slip: getArrayCheck(_tmp.ticket) });
			state = STATES.READY;
		}
	};

	if (options.isFake) {
		connection = {};
		setTimeout(eventManager.publish, options.scenario.start.timeout, options.events.start[(options.scenario.start.error) ? 'fail' : 'done']);
	} else {
		state = STATES.INIT;
		connection = new WebSocket(options.uri);
		
		start_timeout = setTimeout( _ => {
				state = STATES.ERROR;
				eventManager.publish(options.events.start.fail, `Таймаут на запуск. Проверьте связь с EFTPOS`);
			}, defaultStartTimeout);

		/***************************************************************/
		/* CONNECTION EVENTS */
		/***************************************************************/

		connection.onopen = function (e) {
			servicemessage("Socket opened", "red");
			_log(0, 'socket opened');
			_debug('socket opened');

			// совершаем логин
			console.log(this.login);

			// _login();
			// return setTimeout(eventManager.publish, 1000, options.events.start.done, '');
		};

		connection.onclose = function (e) {
			servicemessage("Socket closed", "red");
			_log(0, 'socket closed');
			_debug('socket closed');
		};

		connection.onerror = function (e) {
			clearTimeout(start_timeout);
			servicemessage("Socket error", "red");
			_log(0, 'socket error');
			_debug('socket error');
			state = STATES.ERROR;
			return eventManager.publish(options.events.start.fail, `Возможо не запущен .exe файл, ответственный за устройство или не сработало автоопределение ком-порта (из-за отсутствия соединения или физических проблем с устройством) или сокет-порт ${options.uri} в конфигурации`);
		};

		connection.onmessage = handlerMessages;
	}

	function _fakePayment(amount) {
		state = STATES.PAYMENT;
		// handlerMessages - обработчик событий
		let messages = [];
		_tmp.ticket = '';
		_tmp.status_payment = false; // флаг, удачно ли прошла оплата

		if (options.scenario.payment.error)
			messages = [
				{ "class": "5", "code": "0", "description": "Initial response – OK | первичный позитивный ответ на авторизационный запрос класса 1 или 2-6", "status": "00", "tid": "0019999355", "token": "9f1b3195326a" },
				{ "class": "5", "code": "M", "description": "Console Message | сообщение на экран кассы", "message": "ВВОД КАРТЫ", "status": "00", "tid": "0019999355", "token": "9f1b3195326a" },
				{ "class": "5", "code": "M", "description": "Console Message | сообщение на экран кассы", "message": "СОЕДИНЕНИЕ 1-4", "status": "00", "tid": "0019999355", "token": "9f1b3195326a" },
				{ "class": "5", "code": "M", "description": "Console Message | сообщение на экран кассы", "message": "АВТОРИЗАЦИЯ", "status": "00", "tid": "0019999355", "token": "9f1b3195326a" },
				{ "additionaldata": "", "carddetails": "************9998", "cardtype": "*** VISA ***", "class": "6", "code": "0", "confirmationcode": "", "date": "20190516", "merchantID": "000009903600050", "message": "ЗАПРЕЩЕНО", "operationtype": "0", "responsecode": "59", "status": "00", "tid": "0019999355", "time": "104015", "token": "9f1b3195326a", "transactioncurrency": "643", "transactionsum": "000000000100", "urn": "913610000038" },
				{ "class": "3", "code": "2", "description": "Print line | печать одной или нескольких линий текста на чековом принтере", "lastlineflag": "0", "status": "00", "textline": "|==============================|\n|ТЕСТ ПРЕДПРИЯТИЕ              |\n|ЛЮБАЯ УЛИЦА 1                 |\n|МОСКВА                        |\n|T19999355               B:0111|\n|U9903600050           ЧЕК:0038|\n|         *** VISA ***         |", "tid": "0019999355", "token": "9f1b3195326a" },
				{ "class": "3", "code": "2", "description": "Print line | печать одной или нескольких линий текста на чековом принтере", "lastlineflag": "0", "status": "00", "textline": "|************9998              |\n|СПОСОБ ВВОДА:  MAGNETIC STRIPE|\n|           ПРОДАЖА            |\n|СУММА                         |\n|РУБ.  :                 " + amount + "}|\n|                              |\n|         НЕ ВЫПОЛНЕНО         |", "tid": "0019999355", "token": "9f1b3195326a" },
				{ "class": "3", "code": "2", "description": "Print line | печать одной или нескольких линий текста на чековом принтере", "lastlineflag": "0", "status": "00", "textline": "|                              |\n|ЗАПРЕЩЕНО                     |\n|------------------------------|\n|RRN:              913610000038|\n|КОД ОТВЕТА: 59                |\n|** 16/05/2019         10:40 **|\n|КОМИССИЯ С ДЕРЖАТЕЛЯ 0%       |", "tid": "0019999355", "token": "9f1b3195326a" },
				{ "class": "3", "code": "2", "description": "Print line | печать одной или нескольких линий текста на чековом принтере", "lastlineflag": "0", "status": "00", "textline": "|++++++++++++++++++++++++++++++|\n|==============================|\n                                \n                                \n", "tid": "0019999355", "token": "9f1b3195326a" },
				{ "class": "3", "code": "2", "description": "Print line | печать одной или нескольких линий текста на чековом принтере", "lastlineflag": "1", "status": "00", "textline": "", "tid": "0019999355", "token": "9f1b3195326a" },
				{ "class": "1", "code": "0", "status": "100", "statuscodestring": "The device is ready for a new request", "token": "9f1b3195326a" }
			];
		else
			messages = [
				{ "class": "5", "code": "0", "description": "Initial response – OK | первичный позитивный ответ на авторизационный запрос класса 1 или 2-6", "status": "00", "tid": "0019999355", "token": "d6ebec43dfef" },
				{ "class": "5", "code": "M", "description": "Console Message | сообщение на экран кассы", "message": "ВВОД КАРТЫ", "status": "00", "tid": "0019999355", "token": "d6ebec43dfef" },
				{ "class": "5", "code": "M", "description": "Console Message | сообщение на экран кассы", "message": "СОЕДИНЕНИЕ 1-4", "status": "00", "tid": "0019999355", "token": "d6ebec43dfef" },
				{ "class": "5", "code": "M", "description": "Console Message | сообщение на экран кассы", "message": "АВТОРИЗАЦИЯ", "status": "00", "tid": "0019999355", "token": "d6ebec43dfef" },
				{ "additionaldata": "", "carddetails": "************9915", "cardtype": "*** VISA ***", "class": "6", "code": "0", "confirmationcode": "308902", "date": "20190516", "merchantID": "000009903600050", "message": "РАЗРЕШЕНО", "operationtype": "0", "responsecode": "00", "status": "00", "tid": "0019999355", "time": "102845", "token": "d6ebec43dfef", "transactioncurrency": "643", "transactionsum": "000000000100", "urn": "913610000037" },
				{ "class": "3", "code": "2", "description": "Print line | печать одной или нескольких линий текста на чековом принтере", "lastlineflag": "0", "status": "00", "textline": "|==============================|\n|ТЕСТ ПРЕДПРИЯТИЕ              |\n|ЛЮБАЯ УЛИЦА 1                 |\n|МОСКВА                        |\n|T19999355               B:0111|\n|U9903600050           ЧЕК:0037|\n|         *** VISA ***         |", "tid": "0019999355", "token": "d6ebec43dfef" },
				{ "class": "3", "code": "2", "description": "Print line | печать одной или нескольких линий текста на чековом принтере", "lastlineflag": "0", "status": "00", "textline": "|************9915              |\n|СПОСОБ ВВОДА:  MAGNETIC STRIPE|\n|           ПРОДАЖА            |\n|СУММА                         |\n|РУБ.  :               " + amount + "|\n|                              |\n|СНЯТИЕ СО СЧЕТА УТВЕРЖД.      |", "tid": "0019999355", "token": "d6ebec43dfef" },
				{ "class": "3", "code": "2", "description": "Print line | печать одной или нескольких линий текста на чековом принтере", "lastlineflag": "0", "status": "00", "textline": "|ПОДПИСЬ КЛИЕНТА               |\n|                              |\n|                              |\n|                              |\n|------------------------------|\n|RRN:              913610000037|\n|КОД ОТВЕТА: 00                |", "tid": "0019999355", "token": "d6ebec43dfef" },
				{ "class": "3", "code": "2", "description": "Print line | печать одной или нескольких линий текста на чековом принтере", "lastlineflag": "0", "status": "00", "textline": "|КОД АВТОРИЗ.  :     (1) 308902|\n|** 16/05/2019         10:28 **|\n|КОМИССИЯ С ДЕРЖАТЕЛЯ 0%       |\n|++++++++++++++++++++++++++++++|\n|==============================|\n                                \n                                ", "tid": "0019999355", "token": "d6ebec43dfef" },
				{ "class": "3", "code": "2", "description": "Print line | печать одной или нескольких линий текста на чековом принтере", "lastlineflag": "1", "status": "00", "textline": "", "tid": "0019999355", "token": "d6ebec43dfef" },
				{ "class": "1", "code": "0", "status": "100", "statuscodestring": "The device is ready for a new request", "token": "d6ebec43dfef" }
			];


		for (let i = 0; i < messages.length; i++) {
			setTimeout(() => {
				handlerMessages({ data: JSON.stringify(messages[i]) });
			}, options.scenario.payment.timeout * i + 1);
		}
	}

	function _fakeBack(urn, start, end) {
		state = STATES.BACK;
		// handlerMessages - обработчик событий
		let messages = [];

		_tmp.ticket = '';
		_tmp.status_payment = false; // флаг, удачно ли прошла оплата

		if (options.scenario.cancel.error)
			messages = [
				{ "class": "5", "code": "4", "description": "Initial response – No previous transaction with such ref. number | ", "status": "00", "tid": "0019999355", "token": "0da5ea5aa8fc" },
				{ "class": "1", "code": "A", "status": "100", "statuscodestring": "The device is ready for a new request", "token": "0da5ea5aa8fc" }
			];
		else
			messages = [
				{ "class": "5", "code": "0", "description": "Initial response – OK | первичный позитивный ответ на авторизационный запрос класса 1 или 2-6", "status": "00", "tid": "0019999355", "token": "c9cd1fd163c8" },
				{ "class": "5", "code": "M", "description": "Console Message | сообщение на экран кассы", "message": "СОЕДИНЕНИЕ 1-4", "status": "00", "tid": "0019999355", "token": "c9cd1fd163c8" },
				{ "class": "5", "code": "M", "description": "Console Message | сообщение на экран кассы", "message": "ОТМЕНА", "status": "00", "tid": "0019999355", "token": "c9cd1fd163c8" },
				{ "additionaldata": "", "carddetails": "************9915", "cardtype": "*** VISA ***", "class": "6", "code": "0", "confirmationcode": "308902", "date": "20190516", "merchantID": "000009903600050", "message": "РАЗРЕШЕНО", "operationtype": "A", "responsecode": "00", "status": "00", "tid": "0019999355", "time": "105757", "token": "c9cd1fd163c8", "transactioncurrency": "643", "transactionsum": "000000000100", "urn": "${urn}" },
				{ "class": "3", "code": "2", "description": "Print line | печать одной или нескольких линий текста на чековом принтере", "lastlineflag": "0", "status": "00", "textline": "|==============================|\n|ТЕСТ ПРЕДПРИЯТИЕ              |\n|ЛЮБАЯ УЛИЦА 1                 |\n|МОСКВА                        |\n|T19999355               B:0111|\n|U9903600050           ЧЕК:0038|\n|         *** VISA ***         |", "tid": "0019999355", "token": "c9cd1fd163c8" },
				{ "class": "3", "code": "2", "description": "Print line | печать одной или нескольких линий текста на чековом принтере", "lastlineflag": "0", "status": "00", "textline": "|************9915              |\n|СПОСОБ ВВОДА:  MAGNETIC STRIPE|\n|            ОТМЕНА            |\n|           ПРОДАЖА            |\n|СУММА                         |\n|РУБ.  :                   1.00|\n|                              |", "tid": "0019999355", "token": "c9cd1fd163c8" },
				{ "class": "3", "code": "2", "description": "Print line | печать одной или нескольких линий текста на чековом принтере", "lastlineflag": "0", "status": "00", "textline": "|                              |\n|------------------------------|\n|RRN:            " + urn + "}|\n|КОД ОТВЕТА: 00                |\n|КОД АВТОРИЗ.  :     (1) 308902|\n|** 16/05/2019         10:58 **|\n|КОМИССИЯ С ДЕРЖАТЕЛЯ 0%       |", "tid": "0019999355", "token": "c9cd1fd163c8" },
				{ "class": "3", "code": "2", "description": "Print line | печать одной или нескольких линий текста на чековом принтере", "lastlineflag": "0", "status": "00", "textline": "|++++++++++++++++++++++++++++++|\n|==============================|\n                                \n                                \n", "tid": "0019999355", "token": "c9cd1fd163c8" },
				{ "class": "3", "code": "2", "description": "Print line | печать одной или нескольких линий текста на чековом принтере", "lastlineflag": "0", "status": "00", "textline": "\r", "tid": "0019999355", "token": "c9cd1fd163c8" },
				{ "class": "1", "code": "A", "status": "100", "statuscodestring": "The device is ready for a new request", "token": "c9cd1fd163c8" }
			];

		for (let i = 0; i < messages.length; i++) {
			setTimeout(() => {
				handlerMessages({ data: JSON.stringify(messages[i]) });
			}, options.scenario.cancel.timeout * i + 1);
		}
	}

	this.encash = function () {
		if (options.isFake){
			return eventManager.publish(options.events.critical, "Устройство в режиме Fake, инкасация невозможна");
		}

		state = STATES.ENCASH;
		_tmp.ticket = '';
		_tmp.status_payment = false; // флаг, удачно ли прошла оплата

		_send({
			class: "2",
			code: "1",
		});
	}

	this.stop = function () { }
	this.reset = function () { }
	this.payment = function (sum) {
		// проводим фейковую оплату
		if (options.isFake)
			return _fakePayment(sum);

		state = STATES.PAYMENT;
		_tmp.ticket = '';
		_tmp.status_payment = false; // флаг, удачно ли прошла оплата

		_send({
			class: "1",
			code: "0",
			amount: "" + Math.round(sum * 100),  // Приводим к копейкам
		});
	}

	// возврат
	// два варианта, либо Сумма (полная) и RRN
	// либо Начальная сумма, RRN, конечная сумма
	// 
	// в старом варианте (back) первым параметром шел RRN
	this.cancel = function (start, urn, end) {
		if( !end || end < 0 ) end = 0;

		if (options.isFake)
			return _fakeBack(urn, start, end);


		if (state != STATES.READY) return eventManager.publish(options.events.cancel.fail, { error: `Устройство находится в состоянии ${state}. Повторите опперацию чуть позже` });

		_tmp.ticket = '';
		_tmp.status_payment = false; // флаг, удачно ли прошла оплата

		state = STATES.BACK;

		_send({
			class: "1",
			code: "A",
			amount: "" + Math.round(end * 100), 				// `${end * 100}`,
			origtransamount: "" + Math.round(start * 100), 	// `${start * 100}`,
			correctamount: "" + Math.round(end * 100),		// `${end * 100}`,
			urn: `${urn}`,
		});
	}

	this.login = _login;
	this.send = _send;

	// отправлять ли событие отправки в лог окна
	this.debug = function (a) {
		isdebug = !!a;
	}

	this.getSlip = function () {
		return getArrayCheck(_tmp.ticket);
	}
};
