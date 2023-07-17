var VirtualKeyboard = ( function($){

	var _debug = false,
		activityStatus = false,
		keyboardData = null,
		shiftedOnce = false,
		shiftHolded = false,
		kbuttons = null,
		keyboardButton = '.k-number, .k-btn, .k-btn-2, .k-space, .number';
		/*	Добавил ограничение на количество символов, если укаазн аттрибут MAXLENGTH в INPUT */

	// 	для правильного расположения курсора
	function setCursore(pos) {

		var input = keyboardData.input[0];

		if( pos <= 0 ) pos = 0; 

		if (input.setSelectionRange) {
    		input.focus();
    		input.setSelectionRange(pos, pos);
  		}

  		else if (input.createTextRange) {
    		var range = input.createTextRange();
    		range.collapse(true);
    		range.moveEnd('character', pos);
    		range.moveStart('character', pos);
    		range.select();
  		}
		keyboardData.input.change();
	}

	function getCursore() {
		var el = keyboardData.input[0];

  		if (el.selectionStart) {
    		return el.selectionStart;
  		} else if (document.selection) {
    		el.focus();

    		var r = document.selection.createRange();
    		if (r == null) {
      			return 0;
    		}

    		var re = el.createTextRange(),
        		rc = re.duplicate();
    		re.moveToBookmark(r.getBookmark());
    		rc.setEndPoint('EndToStart', re);

    	return rc.text.length;
  		}
  		return 0;
	}

	function init(data) {

		var keys = ['input', 'keyboard', 'callback'];


		for ( var _i in keys ) {
			if ( typeof data[keys[_i]] == 'undefined' ) {
				console.log(keys);
				console.log(data);
				console.log(data[keys[_i]]);
				throw 'Not all parameters to start virtual keyboard';
			}
		}

		if ( keyboardData ) {

			if ( keyboardData.input.context == data.input.context ) {
				return;
			}

			keyboardData.input.blur();

			keyboardData.keyboard.find('.number').off('click');

			keyboardData = data;

			if ( _debug ) {
		    	console.group("Reiniting VirtualKeyboard");
	            	console.info('params:');
	            	console.info(data);
	         	console.groupEnd();
			}

			return subscribe();


		}

		if ( _debug ) {
		    console.group("Start VirtualKeyboard");
	            console.info('params:');
	            console.info(data);
	         console.groupEnd();
		}


		keyboardData = data;

		show();
		
		kbuttons = keyboardData.keyboard.find(keyboardButton);
		
		return subscribe();
	}

	function delChar() {
		var _thisCursore = getCursore();
		var _thisLine = keyboardData.input.val();
		var _thisLineBefore = _thisLine.substr(0, _thisCursore);
		var _thisLineAfter = _thisLine.substr(_thisCursore);
		_thisLineBefore = _thisLineBefore.substr(0, _thisLineBefore.length - 1);
		keyboardData.input.val(  _thisLineBefore +  _thisLineAfter );
		setCursore(_thisCursore - 1);
	}

	function addChar(string) {
		var _thisCursore = getCursore();

		var _thisLine = keyboardData.input.val();
		var _thisLineBefore = _thisLine.substr(0, _thisCursore);
		var _thisLineAfter = _thisLine.substr(_thisCursore);

		if( ( shiftedOnce || shiftHolded ) && /^[a-zа-я]/gi.test(string) ){
			string = string.toUpperCase();
			
			shiftedOnce = false;
			switchCase();
		}

		keyboardData.input.val(  _thisLineBefore +  string + _thisLineAfter );

		setCursore(_thisCursore + 1);
	}

	function switchCase(){
		
		kbuttons.each(function(){
			var text = $(this).text();
			if( ! /^[a-zа-я]$/gi.test( text ) ) return; 
			
			if(shiftedOnce || shiftHolded ){
				$(this).text(text.toUpperCase());
			} else {
				$(this).text(text.toLowerCase());
			}
		});
	};

	function subscribe() {
	
		activityStatus = true;

		kbuttons.off('click').on('click',function(){
			keyboardData.input.focus();

			var _val = $(this).data('value');

			if ( _debug ) {
				console.log(_val);
			}

			if ( typeof _val == "undefined" ) {
				return;
			}
			if ( _val == "del" ) {
				delChar();
				return;
			}

			if ( _val == "shift") {
				
				if(!shiftedOnce && !shiftHolded){
					shiftedOnce = true;
					return switchCase();
				}

				if(!shiftHolded){
					shiftHolded = true;
					$('div.k-btn[data-value="shift"]').addClass('k-btn-holded');
					return switchCase();
				}

				shiftHolded = false;
				$('div.k-btn[data-value="shift"]').removeClass('k-btn-holded');
			
				shiftedOnce = false
				return switchCase();
			}


			if ( _val == 'enter' ) {
				keyboardData.callback();
				return close();
			}

			if ( _val == 'digit' ) {
				var _name = $(this).html();

				if ( _name == '123' ) {
					$(this).html('ABC');
					$('.letters').fadeOut(0);
					$('.numbers').fadeIn(0);

				} else {
					$(this).html('123');
					$('.numbers').fadeOut(0);
					$('.letters').fadeIn(0);
				}

				return;
			}

			var _maxLength = keyboardData.input.attr('maxlength');
			if(_maxLength && keyboardData.input.val().length>=_maxLength ) return; //	ДЛЯ ОГРАНИЧЕНИЯ НА N симоволов указанных в MaxLength

			if ( _val == "point" ) {
				addChar('.');
				return;
			}

			if ( _val == "comma" ) {
				addChar(',');
				return;
			}

			if ( _val == "break" ) {
				addChar('\n');
				return;
			}

			if ( _val == "space" ) {
				addChar(' ');
				return;
			}

			addChar(_val);
		});

	}

	function getContext(param) {
		if ( !keyboardData ) {
			return false;
		}

		return keyboardData[param];
	}

	function set(data) {
		for ( var _i in data ) {
			keyboardData[_i] = data[_i];
		}
	}


	function show() {
		//TweenMax.to(keyboardData.keyboard[0], 0, {bottom:"0px", ease: Linear.easeOut, delay: 0});
	}

	function close() {
		if ( activityStatus ) {
			//keyboardData.input.blur();
			//TweenMax.to(keyboardData.keyboard[0], 0, {bottom:"-390px", ease: Linear.easeOut, delay: 0});
			keyboardData.keyboard.find(keyboardButton).off('click');
			keyboardData = null;
			activityStatus = false;
		}

	}

	function isActive() {
		return activityStatus;
	}

	function toUpperOnce(){
		shiftedOnce = true;
		shiftHolded = false;
		switchCase();
	};

	return {
		init: init,
		close: close,
		isActive: isActive,
		toUpperOnce: toUpperOnce,
	};

}) ($);
