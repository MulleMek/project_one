var PayClient = (function(EM, Helper, Environment, Operation, SocketLogger){

	var conf = { isFake: false, getSerial: 'done' };
	if( conf.isFake ) console.log('PayClient.js находится в фейковом режиме');


	var _url_prefix  = Environment.get("domains.proxy") + '/main/';
	var _urls = { getSerial: 'serial' };

	var _event_prefix = 'Proxy';
	var _events = {};

	/*  HELPERS  */
	Object.keys(_urls).forEach(function(e){
		_urls[e] = _url_prefix + _urls[e];
		_events[e] = {
				done: _event_prefix + '/'+ e + '/done',
				fail: _event_prefix + '/'+ e + '/fail',
		};
	});

	//$.ajax({asd}).done().fail();
	function sendRequest(url, data, events){ return Helper.ajax(url, data, events); };

	function raiseError(events, text){ return setTimeout( EM.pub, 100, events.fail, text); };

	function raiseFake(cmd, data){ return setTimeout( EM.pub, 500, getEvents(cmd)[conf[cmd]], data); };

	function getEvents(cmd){ return _events[cmd]; };

	function socketLog( w, data ){ if(!SocketLogger || !SocketLogger.log) return;;  SocketLogger.log( w + "  " + JSON.stringify( data ) ); }
	if( conf.isFake ) socketLog( "pay client is in fake mode", conf );
	
	////////////////////////////
	function getSerial(data){
			if(conf.isFake) return raiseFake( 'getSerial', { 'external_number': "101000", 'external_serial': 'T1' } );
			
			/*
				uid - uid операции
				inserted, amount - Сумма операции
				datetime - Дата и время
				is_carrier
			 */
			socketLog( " ---> getSerial client ", data);
			return sendRequest(_urls.getSerial, data, _events.getSerial);
	};

	return {
		getSerial: function(){
			return new Promise( function( resolve, reject ){

				EM.subOnce( _events.getSerial.done, function(ev, data){
					EM.unsub( _events.getSerial.fail );
					//EM.unsub( _events.getSerial.done );
					Operation.set('sync', 1);
					socketLog( " <--- getSerial client done ", data);
					if( data && data.external_number ){
						Operation.set('e_number', data.external_number);
						Operation.set('e_serial', data.external_serial);
					}
					if( data && data.org && data.org.seller_data ){
						Operation.set('seller_data', data.org.seller_data);
					}
					resolve( data );
				});
				EM.subOnce( _events.getSerial.fail, function(ev, data){
					EM.unsub( _events.getSerial.done );
					//EM.unsub( _events.getSerial.fail );
					socketLog( " <--- getSerial client fail ", data);
					//if( !data || data.error === void 0 ) data = null;
					//if( data && data.error_message ) Operation.set("sync_message", data.error_message);
					if( !data ) data = null;
					resolve( data );
				});

				getSerial({
					uid: Operation.get('id'), 
					inserted: Operation.get('inserted'),
					datetime: Operation.get("datetime"),
					is_carrier: Operation.get('is_carrier'),
					org_id: Operation.get('org_id'),
				});
			});
		},
	};

})(EM, Helper, Environment, Operation, SocketLogger);
