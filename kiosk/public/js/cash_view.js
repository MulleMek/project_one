(function(){
	var __t = Helper.createActivityHandler( activityHandler, 2 * 60 * 1000);
	var navigateDelay = 15000;

	var buttons = {
		next: $('#confirm'),
		back: $('#cancel'),

		title: $('#title'),

		cost: $('#sum'),
		inserted: $('#inserted'),
		remained: $('#rest'),
		change: $('#change'),
		
		banknotes: $("#banknotes"),
	};

	if( !Model.load() ) return Router.redirectHome();
	var Controller = new PaymentApp("Платежи наличными");
	var messages = {
				userDataError: 'Извините, получены не все данные. Попробуйте, пожалуйста, позднее',
				cantCalcError: 'Внимание, терминал сдачи не выдает!',
	
				cancelError: 'Вы действительно хотите прервать операцию?',

				noActivityMessage: 'Вы еще здесь?',
				tap: 'Нажмите чтобы продолжить',
	};

	if( !window._DEVICES || !window._DEVICES.length ) 
		window._DEVICES = [ "CashcodeSM" ];

	function setCost( field, sum ){ return field.text( '' + sum ); };
	function show(){
		
		setCost( buttons.inserted, Operation.get('inserted') );

		if( Operation.get("price") > 0){
			if( Operation.get('price') - Operation.get('inserted') > 0 ){
				setCost( buttons.remained, Operation.get('price') - Operation.get('inserted') );    
			} else {
				buttons.remained.parent().addClass('display-none');
				buttons.change.parent().removeClass('display-none');
				setCost( buttons.change, Operation.get('inserted') - Operation.get('price') );
			}
		}
		
		redraw();
	};
	
	let banknotes_list = {};
	const known_banknotes = [
								{nominal:10,col: "#D1E0DF"},
								{nominal:50,col: "#E1CFC9"},
								{nominal:100,col: "#DBD0DA"},
								{nominal:200,col: "#D1E0DF"}, 
								{nominal:500,col: "#DBD0DA"},
								{nominal:1000,col: "#E1CFC9"},
								{nominal:2000,col: "#DBD0DA"},
								{nominal:5000,col: "#E1CFC9"}
							];
	function redraw(){
		
		buttons.banknotes.html("");
		
		known_banknotes.forEach( b => {
			if( !banknotes_list[b.nominal] ) return;
		
			buttons.banknotes.append(`<div style="width: 75px; height: 45px; border: 1px solid gray; margin-left: 2px; margin-right: 2px;">
						<div style="margin: 0 auto; width: 70%; height: 100%; background-color: ${b.col} ">
							<label>${b.nominal}</label>
							<label>${banknotes_list[b.nominal]}шт</label>
						</div>
					</div>
			`);
			
		});
	};

	////  Когда окно неактивно типо... показываем сообщение, вы здесь??
	var activity_once = false;
	function activityHandler(){
			$( document ).off('click');  //?
			if( activity_once ) return;
			activity_once = true;

			if( !Operation.get('inserted') ) return exit();

			var _redirect_timeout = Helper.createActivityHandler( _ => cancelProceed("NOACTIVITY") , 30000 );

			Popup.show({ text: messages.noActivityMessage,
							notice: messages.tap,
							close: function(){
								_redirect_timeout.disable();
								activity_once = false;
								__t.checkActivity();
							}
					});
			Helper.hidePreloader(); /// не должно быть
	};

	var once = false;
	function nextHandler(){
		if( Operation.get("price") > 0 && Operation.get('price') > Operation.get('inserted') ){ return; }
		if( Operation.get("inserted") <= 0 ) { return; }
		if( once ) return;
		once = true;

		__t.disable();
		buttons.back.off('click').addClass('hide');
		buttons.next.off('click').addClass('hide');
		Helper.showPreloader();
		
		DeviceManager.stop();

		///  на случай если DeviceManager.stop будет работать долго
		///  и кто-то успеет накидать еще...
		return new Promise( res => setTimeout( res, 1500 ) )
			.then( _ => Controller.saveOperation() )
			.then( _ => {
				return ProxyClient.pay( Operation.get('goods') )
					.then( res => {
						if( res ) Operation.set('sync', 1);
					})
					.catch( err => {
						Operation.set("sync_error", err);
					});
			})
			.then( function(){
				if( Operation.get("sync") ) Operation.set('no_troubles', 1);
			})
			.then( _ => Controller.saveOperation() )
			.then( endOperation )
			.catch( PayHelper.defaultCatch );
	};


	////////////////////////////////////////////////////////////
	///// CANCEL !!!!
	////  Когда пользователь нажал кнопку отмены, показываем попап - мол, подтвердите
	function cancelHandler(){
	 	if( once ) return;
	 	once = true;
		
		buttons.next.off('click');
		buttons.back.off('click');

		if( Operation.get('inserted') === 0 ) return exit();

		__t.disable();

		Popup.show({
			text: messages.cancelError,
			buttons: [
			 		{ name: 'Нет', callback: _ => setTimeout(restoreAfterCancelHandler, 600) },
					{ name: 'Да', callback: _ => cancelProceed("CANCEL") }
			],
		});
	};
	function restoreAfterCancelHandler(){
		buttons.back.on('click', cancelHandler);
		if( Operation.get('inserted') >= Operation.get('price') ) buttons.next.on('click', nextHandler);
		__t = Helper.createActivityHandler( activityHandler, 3 * 60 * 1000);
		__t.checkActivity();
		once = false;
	};
	///// Обработка основных событий
	////  Когда пользователь сказал да, при отмене, либо прошляпил момент по неактивности
	var onceConfirm = false;
	async function cancelProceed( type ){
		if( onceConfirm ) return;
		onceConfirm = true;
		Helper.showPreloader();
		__t.disable();
		
		DeviceManager.stop( );
		Operation.init(type);  /// CANCEL / NOACTIVITY
		
		await new Promise( res => setTimeout( res, 1500 ) );
		
		if( Operation.get("inserted") === 0 ) return exit();

		Operation.set('no_troubles', 1);
		await Controller.saveOperation();
		await Helper.showPopup(PayHelper.getCancelMessage(), exit, navigateDelay * 2 );
	};

	function exit( error ){
		Helper.showPreloader();
		DeviceManager.stop();
		Model.clear();

		return Controller.unloadDevices()
			.then(() => (error) ? Router.goErrorPage() : Router.redirectHome());
	};

	//////////////////////////////////////////
	/// OK
	function endOperation( ){
		var tout = ( Operation.get('no_troubles') ) ? 60000 : 90000;
		var msg = PayHelper.getEndMessage();

		Helper.showPopup( msg, exit, tout, messages.tap);
	};


	///////////////////////////////////
	/// INIT !!!!!
	///
	EM.sub('DeviceManager/inserted', function(ev, inserted){
		inserted = Number(inserted);
		if( !inserted || inserted <= 0 ) return;
		Operation.set('inserted', Operation.get('inserted') + inserted );
		
		if( !banknotes_list[ inserted ] )
			banknotes_list[inserted] = 0;

		banknotes_list[inserted]++;		
		
		if( Operation.get('inserted') >= Operation.get('price') ){
			DeviceManager.stop( true );
			buttons.back.off('click').addClass('hide');
			buttons.next.off("click").on('click', nextHandler);
		}

		__t.checkActivity();
		show();
	});

	////  Подготавливаем окно и операцию
	function operationInit(){
		if( !Model.checkData( 'CASH' ) ){	
			Model.clear();
			Helper.showPopup(messages.userDataError, Router.redirectHome, navigateDelay );
			return false;
		}

		if(SocketLogger && SocketLogger.log){
				SocketLogger.log( 'Debug Data, Operation CASH: ');
				SocketLogger.log( JSON.stringify( Model.get() ) );
				SocketLogger.log( ' --- ' );
		}

		Operation.init('CASH');

		//if( Model.get('phoneNumber') ) Operation.set( 'user_phone', Model.get('phoneNumber') );
		//if( Model.get('email') ) Operation.set( 'user_email', Model.get('email') );
		
		Operation.set( 'org_id', Model.get('org_id') );
		Operation.set( 'client_id', Model.get('id') );

		let sum = Model.getServicesSum();
		
		
		Operation.set( 'price', Math.round(Model.getServicesSum() / 50) * 50 );
		Operation.set( 'goods', Model.get('services') )

		if( Operation.get("price") > 0 ){
			buttons.cost.text( Operation.get('price') );
			//buttons.title.text("Оплата счета № "+Operation.get('code')+" наличными");
		}

		show();
		return true;
	};


	$(document).ready(function(){

		buttons.back.on('click', cancelHandler);
		__t.checkActivity();

		if( !operationInit() ) return; 
			

		Controller.initDevices( window._DEVICES )
			.then( _ => Controller.levelsCheck( [{ name: 'CashcodeSM', data: window.DEVICE_LIMITS }, { name: 'LCDM200', data: window.DISPENSER_LIMITS }] ) )
			.then(function(){
				// if( !DeviceManager.calculate(5000).can ){ DeviceManager.calculate(0); Helper.showPopup(messages.cantCalcError, null, 5000, messages.tap); }				
				// if( Operation.get('inserted') >= Operation.get('price') ) DeviceManager.stop();

			})
			.then( Helper.hidePreloader )
			.catch( err => {
				console.error(err);
				exit(1);
			});
	});
})();
