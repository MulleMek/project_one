const FiscalFormController = (function($, Helper, VirtualKeyboard){

	let __t = null;

	const clickEvent = "click";

	let btn = {
		header: $("#header-text"),

		popup: $("#fiscal-popup"),

		email: $("#email-button"),
		phone: $("#phone-button"),
		print: $("#print-button"),
		skip: $("#fiscal-next-button"),
		skip_notice: $("#fiscal-next-notice"),


		popup_phone: $("#phone-input-popup"),
		phone_input_visual: $("#phone-input"),
		phone_input: $("#phone-input-value"),
		phone_keyboard: $("#phone-keyboard"),
		phone_confirm: $("#phone-confirm"),
		phone_cancel: $("#phone-cancel"),


		popup_email: $("#email-input-popup"),
		email_input: $("#email-input"),
		email_keyboard: $("#email-keyboard"),
		email_confirm: $("#email-confirm"),
		email_cancel: $("#email-cancel"),
	};

	let _user_phone = null;

	let _promise_callback = null;

	function _show( isPrinterEnabled ){
		__t = Helper.createActivityHandler(cancelHandler, 5 * 60 * 1000);
		
		btn.email.off(clickEvent).on(clickEvent, onEmailClick);
		btn.phone.off(clickEvent).on(clickEvent, onPhoneClick);
		btn.skip.off(clickEvent).on(clickEvent, cancelHandler);
		
		if( isPrinterEnabled ) {
			btn.print.removeClass("display-none").off(clickEvent).on(clickEvent, onPrintClick);
			btn.skip_notice.removeClass("display-none");
		} else {
			btn.print.addClass("display-none");
			// btn.skip_notice.addClass("display-none");
			//if( !window.TEST_FISC ){
			//	btn.skip_notice.text("Показать чек на экране").removeClass("display-none");
			//}
		}
		
		btn.header.text("Что делать с чеком?");
		btn.popup.removeClass("display-none");
	};
	function _hide(){
		__t.disable();
		btn.popup.addClass("display-none");
		btn.email.off(clickEvent);
		btn.phone.off(clickEvent);
		btn.print.off(clickEvent);
		btn.skip.off(clickEvent);
		VirtualKeyboard.close();
	};

	function _showEmail(){
		btn.email_input.val(_user_email);
		VirtualKeyboard.close();
		VirtualKeyboard.init({
			input: 		btn.email_input,
			keyboard: 	btn.email_keyboard,
			callback: 	function() { },
		});
		btn.email_confirm.off(clickEvent).on(clickEvent, nextHandler);
		btn.email_cancel.off(clickEvent).on(clickEvent, _hideEmail);

		btn.header.text("Ввод электронной почты");
		btn.popup_email.removeClass("display-none");
	};
	function _hideEmail(){
		__t.checkActivity();
		VirtualKeyboard.close();
		btn.email_input.val("");
		btn.email_confirm.off(clickEvent);
		btn.email_cancel.off(clickEvent);
		btn.header.text("Что делать с чеком?");
		btn.popup_email.addClass("display-none");
	};

	function _showPhone(){
		btn.phone_input.focus().on('change', onPhoneChange);
		btn.phone_input.val(_user_phone).change();
		VirtualKeyboard.close();
		VirtualKeyboard.init({
			input: 		btn.phone_input,
			keyboard: 	btn.phone_keyboard,
			callback: 	function() { },
		});
		btn.phone_confirm.off(clickEvent).on(clickEvent, nextHandler);
		btn.phone_cancel.off(clickEvent).on(clickEvent, _hidePhone);

		btn.header.text("Ввод номера телефона");
		btn.popup_phone.removeClass("display-none");
	};
	function _hidePhone(){
		__t.checkActivity();
		VirtualKeyboard.close();
		btn.phone_input.val("");
		btn.phone_input.off('change');
		btn.phone_confirm.off(clickEvent);
		btn.phone_cancel.off(clickEvent);
		btn.header.text("Что делать с чеком?");
		btn.popup_phone.addClass("display-none");
	};

	function onPhoneChange(){
		btn.phone_input_visual.val(Helper.maskPhone(btn.phone_input.val(), btn.phone_input));
		__t.checkActivity();
	};

	// const phone_reg = /^(\+?7|8)?9\d{9}$/;
	const phone_reg = /^(\+?7|8)?\d{10}$/;
	const email_reg = /^[^\s\@\,\`\"\'\;\/]+\@[^\s\@\,\`\"\'\;\/]+\.[^\s\@\,\`\"\'\;\/]{2,}$/;
	//var email_reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

	function test( t ){

		if( !t ) return;
		t = (""+t).replace(/\s/g,"");
		if( !t ) return;
		
		if( email_reg.test(t) ){
			console.log("User input email", t);
			return { email: t };
		}
		if( phone_reg.test(t) ){
			t = t.replace(/^(\+?7|8)?/,"+7");
			console.log("User input phone number", t);
			return { phone: t };
		}

		return null;
	};

	function cancelHandler(){
		__t.checkActivity();
		Helper.showPreloader();
		_hide();
		_promise_callback();
	};
	function onEmailClick(){
		__t.checkActivity();
		_showEmail();
	};
	function onPhoneClick(){
		__t.checkActivity();

		/*if( _user_phone ){
			let out = test( _user_phone );
			if( out ) {
				Helper.showPreloader();
				_hide();
				_hideEmail();
				_hidePhone();
				_promise_callback(out);
				return;
			}
		}*/
		

		_showPhone();
	};
	function onPrintClick(){
		__t.checkActivity();
		Helper.showPreloader();
		_hide();
		_promise_callback({ print: true });
	};
	function onInputChange(){
		__t.checkActivity();
	};
	function nextHandler(){
		__t.checkActivity();

		let input = btn.phone_input.val() || btn.email_input.val();

		if( !input ) return;
		
		let out = test( input );
		if( !out ) return;	//  Helper.showPopup(notice_text, null, 5000, "Нажмите чтобы продолжить");

		Helper.showPreloader();
		_hide();
		_hideEmail();
		_hidePhone();
		_promise_callback(out);
	};

	function _init( printerStatus, user_phone, user_email ){
		console.log("Init askForm",user_phone, user_email);
		
		VirtualKeyboard.close();
		_show( printerStatus && !printerStatus.critical );
		_user_phone = user_phone;
		if( _user_phone ) {
			if( !phone_reg.test(_user_phone) ) _user_phone = "";
			_user_phone = _user_phone.replace(/^(\+?7)|(8)/g, "");
		}
		_user_email = user_email;
		
		//$('#phone-input-value').val("+" + _user_phone );
		//$('#email-input').val("+" + user_email );
		
		Helper.hidePreloader();
		return new Promise(resolve => _promise_callback = resolve );
	};

	return {
		show: _init,
	};

})($, Helper, VirtualKeyboard);
