class PaymentClass {

	prepareFiscal(){
		/// шаблон
		return Promise.resolve({
			goods: [],
			operation: 'sale',
			paymentType: 0,
			sum: 0,
			inserted: 0,
			cmd: []
		});
	};

	printFiscal( data ){
		var self = this;

		if( self.deviceList )
			self.fiscalDevice = DevicesList.getKKMName( self.deviceList );

		return new Promise( function( resolve, reject ){
			EM.subOnce(self.fiscalDevice + "/printFiscal/done", function(ev, data){
				EM.unsub(self.fiscalDevice + "/printFiscal/fail");
				resolve( data );
			});
			EM.subOnce(self.fiscalDevice + "/printFiscal/fail", function(ev, data){
				EM.unsub(self.fiscalDevice + "/printFiscal/done");
				/// а тут можно попытаться выдрать номер ошибки и передать выше...
				reject( { state: 'printFiscal', data: data, status: 'fail' } )
			});
			DeviceManager.devices[self.fiscalDevice].printFiscal( data );
		});
	};

	print( data ){
		return new Promise( function( resolve, reject ){
			EM.subOnce("Printer/print/done", function(ev, data){
				EM.unsub("Printer/print/fail");
				resolve( );
			});
			EM.subOnce("Printer/print/fail", function(ev, data){
				EM.unsub("Printer/print/done");
				/// а тут можно попытаться выдрать номер ошибки и передать выше...
				reject( { state: 'printFiscal', data: data, status: 'fail' } )
			});
			DeviceManager.devices.Printer.print( data );
		});
	};


	saveOperation(){
		return new Promise( function( resolve, reject ){
			EM.subOnce("Operation/save/done", function(ev, data){
				EM.unsub("Operation/save/fail");
				resolve();
			});
			EM.subOnce("Operation/save/fail", function(ev, data){
				EM.unsub("Operation/save/done");
				resolve();
			});

			Operation.save();
		});
	};

	acceptBanking( amount ){
		var self = this;
		var BankDevice = "Vendotek";
		if( self.deviceList )
			BankDevice = DevicesList.getBankName( self.deviceList );

		return new Promise(function(resolve, reject){
			EM.subOnce('DeviceManager/banking/done', function(ev, data, rrn){
				EM.unsub("DeviceManager/banking/fail");
				EM.unsub("DeviceManager/banking/critical");
				
				switch( BankDevice ){
					case "PinPad":
						return ( !Array.isArray(data) ) ? resolve({ slip: data.split('\r\n'), rrn: rrn }) : resolve({ slip: data, rrn: rrn });
					case "ArcusPinPad":
						return resolve( data );
					case "EFTPOS":
						if( data && data.slip )
							return resolve({ slip: data.slip, rrn: data.urn });
						return resolve({});
					case "Vendotek":
					default:
						return resolve({});
				}
			});

			EM.subOnce('DeviceManager/banking/fail', function(ev, data){
				EM.unsub("DeviceManager/banking/done");
				EM.unsub("DeviceManager/banking/critical");
				switch( BankDevice ){
					case "PinPad":
					case "ArcusPinPad":
						return reject( { state: 'banking', data: data, status: 'fail' } );
					case "EFTPOS":
						if( data && data.error )
							return reject( { state: 'banking', data: "Операция завершена с ошибкой - " + data.error, status: 'fail' } );
						return reject( { state: 'banking', data: "Ошибка оплаты", status: 'fail' } );
					case "Vendotek":
					default:
						return reject( { state: 'banking', data: "Ошибка оплаты", status: 'fail' } );
				}
			});
			EM.subOnce('DeviceManager/banking/critical', function(ev, data){
				EM.unsub("DeviceManager/banking/done");
				EM.unsub("DeviceManager/banking/fail");

				switch( BankDevice ){
					case "PinPad":
						return reject( { state: 'banking', data: data, status: 'critical' } );
					case "Vendotek":
					default:
						return reject( { state: 'banking', data: "Критическая ошибка", status: 'critical' } );
				}
			});

			DeviceManager.acceptBanking( amount );
		});
	};

	dispense(){
		return new Promise(function(resolve){
			EM.sub('DeviceManager/dispense/done', function(ev, data){
				EM.unsub("DeviceManager/dispense/done");
				EM.unsub("DeviceManager/dispense/fail");
				resolve(data);
			});
			EM.sub('DeviceManager/dispense/fail', function(ev, data){
				EM.unsub("DeviceManager/dispense/done");
				EM.unsub("DeviceManager/dispense/fail");
				resolve(data);
			});

			DeviceManager.dispense();
		});
	};

	unloadDevices( ){
		return new Promise( function(resolve, reject){
			EM.subOnce("DeviceManager/exit/done DeviceManager/exit/fail", _ => resolve() );
			DeviceManager.exit();
		});
	};

	initDevices( deviceList ){
		var self = this;
		self.deviceList = deviceList;
		self.init_state = null;

		if( self.deviceList )
			self.fiscalDevice = DevicesList.getKKMName( self.deviceList );

		return new Promise(function(resolve, reject){

			EM.subOnce('DeviceManager/start/done', function(ev, data){
				EM.unsub('DeviceManager/start/fail');
				self.init_state = "started";
				resolve();
			});

			EM.subOnce('DeviceManager/start/fail', function(ev, data){
				EM.unsub('DeviceManager/start/done');
				DeviceManager.stop();
				LocalStorage.set('last_error', data );
				self.init_state = false;
				reject({ state: 'start', data: data, status: 'fail' });
			});

			DeviceManager.init(deviceList);
		});
	};

};

