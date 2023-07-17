var PayHelper = (function(Helper, Operation, Abu){
	
	var messages = {
			done: "Спасибо! Не забудьте взять чек.",
			someTroubles: 'Извините, произошла ошибка при проведении операции - ',
			someTroubles2: '<br/>Сообщите номер операции менеджеру для решения проблемы',

			cantCancelError: 'Извините, терминал не смог вернуть внесённую сумму. Ваш номер операции - ',
			cantCancelError2: ', обратитесь к менеджеру для решения проблемы',
	};
	
	function askFiscal(){
	
		return Promise.resolve()
			.then( data => {
				if( data ) return data;
				
				if( Operation.get("inserted") ){
					/// будет работать только если у нас фиск. операция (при оплате бонусами ничего не печатается)
					let status = null;
					if( DeviceManager.devices.Printer ) status = DeviceManager.devices.Printer.getLastStatus();
					return FiscalFormController.show( status, Operation.get("user_phone"), Operation.get("user_email")); // , Operation.get("user_phone"), Operation.get("user_email")
				}
			})
			.then( data => {
				Helper.showPreloader();
				if( !data ) return;
				if( data.email || data.phone ){ Operation.set("fisc_address", data.email || data.phone ); }
				else if( data.print ){ Operation.set("need_print", true); }
			});
	};


	function getCriticalBankMessage( err ){
		var msg = "";
		
		switch ( true ){
			case err.state === 'banking' && err.status === 'fail' && !!err.data :
				return msg + "<br/>" + err.data;
			
			case err.state === 'banking' && err.status === 'critical' :
				//go_errorpage = true; // Pinpad на странице ошибок не проверяем на critical 
				Abu.mail("Произошла критическая ошибка при проведении оплаты картой - " + JSON.stringify(err) );
				return msg + "<br/>Произошла критическая ошибка<br/>Оплата картой невозможна";

			default: 
				console.error(err);
				Abu.log("Произошла непредвиденная ошибка при проведении оплаты картой - " + JSON.stringify(err)  + " - " + ((err.data)?JSON.stringify(err.data):'') );
				/// ABU log err ///
				return msg + "<br/>Непредвиденная ошибка";
		}
		return  "";
	};

	function getEndMessage(){
		if( Operation.get('no_troubles') ) {
			if( !Operation.get('goods') || !Object.keys(Operation.get('goods')).length ) 
				return messages.done;
			
			let strID = 'ID: ' + Object.keys(Operation.get('goods')).join(", ");
			return "<label style='color: grey; font-size: 24px; margin-bottom: 15px;'>" + strID  + "</label><br/>" + messages.done;
		}
		
		var msg = "";
		var type = "Наличными";
		if( Operation.get("type") === "payment_card" ) type = "Картой";
		
		if( !Operation.get('sync') ) msg += "Операция не попала в учетную систему<br/>";
		//if( Operation.get('sync_message') ) msg += Operation.get('sync_message') + "<br>";
		// .....
		
		//// MAIL
		var mail = "Произошла ошибка при проведении операции " + type + " - #" + Operation.get('id');
		mail += "<br/>" + msg + "<br/><br/>" + Operation.getTable();
		Abu.mail( mail );
		
		return messages.someTroubles + Operation.get('id') + "<br/>" + msg + messages.someTroubles2;
	};

	function getCancelMessage(  ){
		console.log("no_troubles - ", Operation.get("no_troubles"));
		if( Operation.get("no_troubles") ){
			return "Оплата отменена";
		} 
		
		return getEndMessage();
		
		/*else {
			var msg = messages.cantCancelError + Operation.get('id') + messages.cantCancelError2;
			Abu.mail(msg + "<br/><br/>" + Operation.getTable() );
			return msg;
		}*/
	};

	function defaultCatch( err ){
		console.log("Непредвиденная ошибка");
		console.error(err);
		if(SocketLogger && SocketLogger.log){
			SocketLogger.log( 'Unexpected error');
			SocketLogger.log( JSON.stringify(err) + " " + JSON.stringify(err.message) + " " + JSON.stringify(err.stack) );
			SocketLogger.log( 'Operation Data: ');
			SocketLogger.log( JSON.stringify( Operation.get() ) );
			SocketLogger.log( ' --- ' );
		}
		Operation.save();
		Abu.log( 'Произошла непредвиденная ошибка - ' + JSON.stringify(err) + " " + JSON.stringify(err.message) + " " + JSON.stringify(err.stack));
		//  мб стоит так же отправить на почту.... + редиректиться
		Helper.showPopup("Извините, Произошла непредвиденная ошибка", _ => { Helper.showPreloader(); DeviceManager.exit(); setTimeout( Router.redirectHome, 5000); }, 20000, "Обратитесь к администратору"); 
	};

	/// Cash - nextHandler, cancelHandler

	return {
		askFiscal,
		getEndMessage,
		getCriticalBankMessage,
		getCancelMessage,
		defaultCatch,
	};

})(Helper, Operation, Abu);
