const ProxyClient = (function(EM, Environment, Helper){

	let options = Environment.get("options.ProxyClient");
	if( !options ) options = { isFake: false }; 
	if(options.isFake) console.log('ProxyClient.js находится в фейковом режиме');

	let _url_prefix  = Environment.get("domains.proxy") + '/bitrixcrm/';
	var _urls = { 
		getUser: 'get_user',
		getCatalog: 'get_catalog',
		solve: 'solve',
	};

	let _event_prefix = 'Proxy';
	let _events = {};

	/*  HELPERS  */
	Object.keys(_urls).forEach(function(e){
		_urls[e] = _url_prefix + _urls[e];
		_events[e] = {
				done: _event_prefix + '/'+ e + '/done',
				fail: _event_prefix + '/'+ e + '/fail',
		};
	});

	//$.ajax({asd}).done().fail();
	function sendRequest(url, data, events) { return Helper.ajax(url, data, events); };
	function raiseError(events, text) { return setTimeout( EM.pub, 100, events.fail, text); };
	function raiseFake(cmd, data) { return setTimeout( EM.pub, 500, getEvents(cmd).done, data); };
	function getEvents(cmd) { return _events[cmd]; };

	///////////////////////////////////
	/// Private
	function _promisify( func, method ){
		return function( ...args ){
			return new Promise(function(resolve, reject){
				EM.subOnce( getEvents(method).done, function(ev, data){
					EM.unsub( getEvents(method).fail);
					resolve(data);
				});
				EM.subOnce( getEvents(method).fail, function(ev, error){
					EM.unsub( getEvents(method).done )
					reject(error);
				});
				func( ...args );
			});
		};
	};

	function getUser( phone ){
		if( !phone ) return raiseError( _events.getUser, "Телефон не указан" );
		phone = phone.replace(/\D/g, '').replace(/(^\+?7)/g,"8");
		if( !phone ) return raiseError( _events.getUser, "Телефон не указан" );
		if( phone.length === 10 ) phone = "8" + phone;

		if( options.isFake && options.scenario && options.scenario.getUser ){
			if( options.scenario.getUser.error ) return raiseFake('getUser', options.scenario.getUser.error_data);
			return raiseFake('getUser', options.scenario.getUser.data);
		}

		return sendRequest( _urls.getUser, { phone }, _events.getUser ); 
	};

	function getCatalog( user_id ){
		if( !user_id ) return raiseError( _events.getCatalog, "Пользователь не указн" );
		if( options.isFake && options.scenario && options.scenario.getCatalog ){
			if( options.scenario.getCatalog.error ) return raiseFake('getCatalog', options.scenario.getCatalog.error_data);
			return raiseFake('getCatalog', options.scenario.getCatalog.data);
		}
		
		return sendRequest( _urls.getCatalog, { user_id }, _events.getCatalog ); 
	};

	function solve( id ){
		if( !id ) return raiseError( _events.getCatalog, "Не указн id услуги" );
		if( options.isFake && options.scenario && options.scenario.solve ){
			if( options.scenario.solve.error ) return raiseFake('solve', options.scenario.solve.error_data);
			return raiseFake('solve', options.scenario.solve.data);
		}
		
		return sendRequest( _urls.solve, { id }, _events.solve ); 
	};

	///////////////////////////////////////
	/*  MAIN Functions  */
	function checkPhone( phone ){
		return _promisify( getUser, 'getUser' )( phone )
			.then( data => {
				console.log( data );
				if( !data) return false;
				if( data.result.length != 1) return { error: true, result: data.result.length };
					
				_d = {
					id: data.result[0].ID,
					active: data.result[0].ACTIVE,
					name: data.result[0].NAME,
					lastName: data.result[0].LAST_NAME, 
					secondName: data.result[0].SECOND_NAME,
					email: data.result[0].EMAIL,
					mobilePhone: data.result[0].PERSONAL_MOBILE,
					workPhone: data.result[0].WORK_PHONE,
					userType: data.result[0].USER_TYPE,
				}
				console.log( _d )	;
				return {error: false, result: _d};
			})
			.catch( err => {
				console.error(err);
				throw err;
			});
	};
	
	function loadCatalog( user_id ){
		return _promisify( getCatalog, 'getCatalog' )( user_id )
			.then( catalog => {
				let _d = [];
				console.log("catalog", catalog);
				if( catalog && Array.isArray(catalog.result) )
					_d = catalog.result.map( item => ({
								id: item.ID,
								name: item.TITLE,
								price: Math.round( parseFloat( item.OPPORTUNITY ) * 100 ) / 100,
								date: (new Date(item.DATE_CREATE)).toLocaleDateString("ru-RU"),
							}) 
						).filter( e => !!e.price );		
					
				console.log("catalog", _d);
				
				return _d;
				
			})
			.catch( err => {
				console.error(err);
				throw err;
			});
	};
	
	async function pay( goods ) {
		if( !goods ) return Promise.reject("Empty goods");
		
		// console.log(goods); // { [id]: { id, name, price, count }, ... }
		
		let flags = [];
		let solver = _promisify( solve, 'solve' );
		
		for ( let service of Object.values( goods ) ) {
				try {
					console.log("SENDING", service);
					let res = await solver( service.id );
					flags.push({ id: service.id, result: res });
				} catch( err ) {
					flags.push({ id: service.id, error: err });
					console.error(err);
				}
		}

		return !flags.some( e => !e.result || !e.result.result || e.error );
	};

	return {
		checkPhone, 
		loadCatalog,
		pay,
	};
	
})(EM, Environment, Helper);
