(function(){
	let timeout_id = setTimeout( Router.reload,  1000 * 60 * 5 );
	let sync_timeout = null;

	if( !window._DEVICES || !window._DEVICES.length )
		window._DEVICES = [ "Nanokassa", "Printer", "CashcodeSM", "LCDM200", "EFTPOS" ];

	function exit(){ return new Promise( res => (EM.sub('DeviceManager/exit/done DeviceManager/exit/fail', _ => res() ), DeviceManager.exit()) ); };

	function checkLimits( ){
		var cc = DeviceManager.getCache().deviceData['CashcodeSM'];
		if( cc && Array.isArray(cc.data) ){
			var total_count = cc.data.reduce( (sum,e) => sum + e.count - (e.dispensable || 0) , 0 );
			console.log("Total bill count", total_count);
			if( total_count >= window.DEVICE_LIMITS.error ){
				EM.pub("DeviceManager/start/fail", [[
					{ device: "CashcodeSM", data:'Количество купюр в купюроприемнике превысило max ('+DEVICE_LIMITS.error+') значение: ' + total_count }
				]]);
				return false;
			}
		}
		return true;
	}

	EM.sub('DeviceManager/start/done', function(event, data){
		DeviceManager.stop();

		if( window.DEVICE_LIMITS && window.DEVICE_LIMITS.error > 0 && !checkLimits() ) return;

		// Abu.notice('Все устройства запустились на странице kiosk/error. Терминал переходит в рабочий режим');
		// LocalStorage.remove('last_error');
		LocalStorage.clear();
		exit().then( _ => ( console.log('wanna go home'), Router.redirectHome() ) );
	});

	EM.sub('DeviceManager/start/fail', function(event, data){
		DeviceManager.stop();
		LocalStorage.set('last_error', data);
		exit().then( _ => console.log('wanna reload') );
	});

	$(document).ready(function() {
		sync_timeout = setTimeout( _ => RemoteClient.fullSync(), 2 * 60 * 1000 );
		DeviceManager.init(window._DEVICES);
	});
})();
