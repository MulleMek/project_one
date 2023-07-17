const RemoteClient = (function ($, Helper, Environment) {
	var _url_prefix = Environment.get('domains.proxy') + '/remote/';
	var urls = {
		'sync': 'sync',
		'syncDevices': 'sync_devices',
		'ping': 'ping',
		'settings': 'settings',
	};
	var events = {};

	Object.keys(urls).forEach(function (e) {
		urls[e] = _url_prefix + urls[e];

		events[e] = {
			done: 'Remote/' + e + '/done',
			fail: 'Remote/' + e + '/fail',
		};
	});

	function _getAjaxEvents(name) { return events[name]; };
	function sendRequest(url, data, events) { return Helper.ajax(url, data, events); };


	function ping() {
		return sendRequest( urls.ping, {}, events.ping );
	};

	function sync() {
		return sendRequest( urls.sync, {}, events.sync );
	};

	function settings(){
		return sendRequest( urls.settings, { }, events.settings );
	};

	function syncDevices(){
		let data = { location: window.location.pathname };

		data.br_time = JSON.parse(JSON.stringify( new Date() ));
		data.br_timezone = -1 * (new Date()).getTimezoneOffset();

		let err = LocalStorage.get('last_error');
		if( err ) data.last_error = err;

		return sendRequest( urls.syncDevices, data, events.syncDevices );
	};

	function syncOperation(id){
		return sendRequest( urls.sync, {operation_id: id}, events.sync );
	};

	/////////////////////////////////////////////////////////////////
	function _promisify( func, method ){
		return function( ...args ){
			return new Promise(function(resolve, reject){
				EM.subOnce( _getAjaxEvents(method).done, function(ev, data){
					EM.unsub( _getAjaxEvents(method).fail);
					resolve(data);
				});
				EM.subOnce( _getAjaxEvents(method).fail, function(ev, error){
					EM.unsub( _getAjaxEvents(method).done )
					reject(error);
				});
				func( ...args );
			});
		};
	};

	/// init promisified function
	var _pSync = _promisify( sync, 'sync' );
	var _pSyncDevices = _promisify( syncDevices, 'syncDevices' );
	var _pSyncSettings = _promisify( settings, 'settings' );

	function fullSync(){
		return Promise.resolve()
			.then( async function(){

				sync_result = -1;
				while( sync_result !== 0 ){
					sync_result = await _pSync();
				}

				console.log('done');
			})
			.then( _ => _pSyncDevices() )
			.then( _ => _pSyncSettings() )
			.catch( err => console.error(err) );
	};

	return {
		ev: _getAjaxEvents,

		ping: ping,
		////////////////////////////
		settings: settings,
		sync: sync,
		syncDevices: syncDevices,
		syncOperation: syncOperation,
		///////////////////////////

		fullSync: fullSync,
	};

})($, Helper, Environment);
