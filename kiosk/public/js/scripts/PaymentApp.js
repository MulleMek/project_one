class PaymentApp extends PaymentClass {

	constructor( pageName ){
		super();
		this.pageName = pageName;
	};

	prepareGood( service ){
		let g = {
				price: service.price || service.user_price || 0,
				quantity: service.count,
				name: service.name,
				
				tax: 6,
				itemtype: 4,
				paymentMode: 4,

				//// нефиск данные....
				description: service.description,
				code: service.code,

		};
		/*
		g.name = service.good_name || service.name;

		switch( service.good_tax ) {
			case 10: g.tax = 2; break;
			case 20: g.tax = 7; break;
			case 0:
			default: g.tax = 6; break;
		}

		switch( service.good_type ){
			case "service": g.itemtype = 4; break;
			case "good":
			default: g.itemtype = 1; break;
		}
		*/
		console.log("good", g);
		return g;
	};

	prepareFiscal( strs, seller_data ){

		if( !Operation.get("inserted") && Operation.get("type") !== "payment_deposite" ) return Promise.resolve();

		let self = this;
		return super.prepareFiscal()
			.then( sample => {
				///// Подготавливаем ФИСКАЛЬНЫЙ ЧЕК
				sample.goods = Object.values( Operation.get('goods') )
										.map( service => self.prepareGood( service ) );

				if( Operation.get("price") < Operation.get("inserted") ){
					sample.goods.push(
						self.prepareGood({
							name: "Пополнение депозита",
							count: 1,
							price: Math.abs(Operation.get("price") - Operation.get("inserted")),
						})
					);
				}
				
				if( ["payment_cash_cancel", "no_activity_cancel"].indexOf(Operation.get("type")) > -1 ){
					sample.goods = [
						self.prepareGood({
							name: "Пополнение депозита",
							count: 1,
							price: Operation.get("inserted"),
						})
					];
				}

				if( Operation.get('type') === 'payment_card' )
					sample.paymentType = 1;
				
				
				//// на фискальном чеке не указываем
				if( Operation.get("fisc_address") )
				 	sample.address = Operation.get("fisc_address");

				sample.sum = sample.goods.reduce( (sum, e) => sum + (e.price * e.quantity), 0 );
				sample.inserted = Operation.get('inserted');

				// sample.change = Operation.get('inserted') - Operation.get('price');
				// if( sample.change ) sample.dispensed = Operation.get('dispensed');

				sample.operation = 'sale';
				sample.cmd = [];
				
				console.log("sample", sample);
				Operation.set("goods_fisc", sample);
			});
	};

	setFiscalData( fisc, additional_info, qr_data ){
		if( !additional_info ) return fisc;

		var year = additional_info.year;
		if( year > 100 && year < 2000 ) year += 1900;
		var month = additional_info.month + 1;
		fisc.date_time = [additional_info.day, month, year].map( e => ( e >= 0 && e < 10 ) ? "0" + e : e ).join(".");
		fisc.date_time += " ";
		fisc.date_time += [additional_info.hour, additional_info.minute].map( e => ( e >= 0 && e < 10 ) ? "0" + e : e ).join(':'); 

		if( additional_info.shiftNumber )
			fisc.shift_number = additional_info.shiftNumber;

		if( qr_data ){
			fisc.fn_num = qr_data.fn;
			fisc.num_fd = qr_data.i;
			fisc.num_fp = qr_data.fp;
		}

		//// остается задать check_number и данные в cmd
		return fisc;
	};

	getSellerData( seller_data, fisc  ){
		let SellerData = {
			"TerminalID": 	"00000",
			"TerminalAddress": "Тестовый терминал",
			"Name": 			"ИП Тест тест",
			"INN": 			"1234567890",
			"OGRNIP": 		"0987654321",
			"Address": 		"Тест тест тест",

			//"CmdBefore": 	[ ], //// "Строка для печати до" 
			//"CmdAfter": 	[ ], /// "Спасибо!" 
		};

		if( seller_data && seller_data.Name ){
			SellerData = seller_data;
		} else if( window.SELLER_DATA && Object.keys(window.SELLER_DATA).length ){
			SellerData = window.SELLER_DATA;
		}

		if( fisc ) {
		 	fisc.vend_address = SellerData.TerminalAddress;
		 	fisc.vend_mesto = SellerData.TerminalMesto;
			fisc.vend_num_avtovat = SellerData.TerminalID;
		 	
			fisc.kkt_operator = SellerData.OFD;	/// "ООО ТАКСКОМ";	/// нанокасса возвращает ссылку на себя, а не на офд...
			fisc.site_fns = SellerData.SiteFNS; /// "www.nalog.ru";
			fisc.sno = SellerData.SNO;				/// "ОСН";
		}

		return SellerData;
	}

	prepareTalon( seller_data ){
		let fisc = Operation.get("goods_fisc") ? JSON.parse(JSON.stringify(Operation.get("goods_fisc"))) : null;
		if( Operation.get('type') !== 'payment_deposite' && (!Operation.get("fisc") || !fisc )) { 
			Operation.set("print_error", "No kaznachey data");
			return Promise.resolve([]);
		}

		let self = this;

		return Promise.resolve()
			.then( _ => {
				//// данные для фискального талона.
				
				if( Operation.get("slip_data") )
					fisc.cmd = Operation.get("slip_data");
				
				fisc.date_time = (new Date( Operation.get('datetime') * 1000)).toLocaleString("ru-RU").replace(/\:\d\d$/g, "");
				if( Operation.get("qrcode") ) 
					fisc.qr_code = Operation.get("qrcode");
				if( Operation.get("check_number") )
					fisc.check_number = Operation.get("check_number");
				
				//// закидываем в талон данные по фискальной части чека
				fisc = self.setFiscalData( fisc, Operation.get("additional_info"), Operation.get("qr_data"));

				//// формируем данные по организации на основе настроек
				let SellerData = self.getSellerData( seller_data, fisc );
				
				return {
					PaymentData: fisc,
					SellerData: SellerData,
				};
			})
			.then( data => {
				if( !data ) return null;

				return Promise.all([
					TicketMaker.get("simple_fiscal", { PaymentData: data.PaymentData, SellerData: data.SellerData }),
				]);
			});
	};

	async printArray( arrayOfTickets ){
		if( [ 'payment_cash', 'payment_card' ].indexOf(Operation.get("type")) > -1 && !Operation.get("need_print") ) 
			return; 
		if( !arrayOfTickets || !arrayOfTickets.length ) return;
		let printflag = true;
		let self = this;
		for ( const ticket of arrayOfTickets ){
			printflag = printflag && await self.print( ticket );  /// Если один раз не распечаталось, то следующие тоже не печатаем
		}
	};

	printFiscal( ){
		if( Operation.get('type') === 'payment_deposite' || !Operation.get("inserted") ) return Promise.resolve();

		let self = this;

		if( !self.fiscalDevice ){
			Operation.set('fisc', 1);
			Operation.set('kassa_disabled', true);
			return Promise.resolve();
		}

		return super.printFiscal( Operation.get("goods_fisc") )
			.then(function( data ){
				switch( self.fiscalDevice ){
					case "NanoKassa":
						if( data && data.nuid ){
							Operation.set("check_nuid", data.nuid);
							Operation.set("check_qnuid", data.qnuid);
							Operation.set("check_data", data);
						}
						if( data && data.qr_code ){
							Operation.set('fisc', 1);
							Operation.set("qrcode", data.qr_code);
							Operation.set("check_data", data);
						}
						break;
					
					case "Kaznachey":
						Operation.set('fisc', 1);
						data = parseInt(data, 10);
						if( data ) Operation.set('check_number', (data - 1) || 1);

						return DeviceManager.devices.Kaznachey.getLastQRCode( true )
							.then( qr_data => {
								if( !qr_data ) return false;
								Operation.set("additional_info", qr_data._additional_info);
								delete qr_data._additional_info;
								Operation.set("qrcode", Object.entries(qr_data).map(e=>e.join('=')).join('&'));
								Operation.set("qr_data", qr_data);
								return true;
							})
							.catch(err => console.error(err));
						break;

					default:
						Operation.set('fisc', 1);
						break;
				}

				return true;
			})
			.catch(function(err){
				if( err.state === 'printFiscal')
					Operation.set('print_error', err.data);

				switch( self.fiscalDevice ){
					case "NanoKassa":
						if( err.data && err.data.nuid ){
							Operation.set("check_nuid", err.data.nuid);
							Operation.set("check_qnuid", err.data.qnuid);
							Operation.set("check_data", err.data);
						}
						break;
				}

				return false;
			});
	};

	async print( ...args ){
		if( !args || !args[0] ) 
			return Promise.resolve();

		return super.print( ...args )
			.then(function( check_number ){
				Operation.set("printed", 1);
				return true;
			})
			.catch(function(err){
				if( err.state === 'printFiscal')
					Operation.set('print_error', err.data);

				return false;
			});
	};

	acceptBanking( amount ){
		if( !amount || amount < 0 )
			amount = Operation.get('price');

		return super.acceptBanking( amount )
			.then(function(data){
				Operation.set('inserted', amount);
				if( data ){
					Operation.set('slip_data', data.slip);
					if( data.rrn ) Operation.set('rrn', data.rrn);
					return data.slip;
				}
			})
			.catch( function(err){
				throw err;
			});
	};

	async createSale(){
		if( !['payment_card', 'payment_cash', 'payment_deposite'].includes( Operation.get("type") ))
			return;

		if( !Operation.get('goods') || !Operation.get("client_id") || !Object.values(Operation.get('goods'))[0] )
			return;
		
		try {
			let good = Object.values(Operation.get('goods'))[0];		
			let result = null;
			if( Operation.get("type") === "payment_deposite") {
				result = await ProxyClient.createDepositSale(
					good['id'], 
					good['count'], 
					Operation.get("client_id")
				);	
			} else {
				result = await ProxyClient.createSale(
					good['id'], 
					good['count'], 
					Operation.get("client_id"), 
					Operation.get("type") === 'payment_cash' ? 'cash' : 'card'
				);
			}

			if( result && result.ok ) Operation.set("sync", 1);
			Operation.set('sync_result', result);		

			return result;
		} catch( err ) {
			console.error(err);
			Operation.set("sync_error", err && err.message);
		}
	};

	async depositedChange(){
		let toBeDeposited = 0;
		if( Operation.get("type") === 'payment_cash' ){
			toBeDeposited = Operation.get('inserted') - Operation.get('price');
		} else if( ['payment_cash_cancel','no_activity_cancel'].indexOf(Operation.get("type")) > -1 ) {
			toBeDeposited = Operation.get('inserted');
		}

		if( !toBeDeposited || toBeDeposited < 0 ) 
			return Operation.set("deposited", 0 );
		
		try {
			let result = await ProxyClient.addDeposit(Operation.get("client_id"), toBeDeposited );
			if( result.ok ) Operation.set("deposited", toBeDeposited );

			return result;
		} catch( err ){
			console.error(err);
			Operation.set("add_deposit_error", err && err.message);
		}
	};
	
	
	dispenseChange( ){
		if( Operation.get('type') === "payment_card" ) 
			return Promise.resolve( { "expected":0, "dispensed":0 } );
		
		var change = Operation.get('inserted') - Operation.get('price');
		if( change > 0 ) {
			if(DeviceManager.calculate(change).debt === 0 ){
				return super.dispense()
					.then( data => {
						if( data && data.dispensed ) Operation.set('dispensed', data.dispensed);
						return data;
					});
			} else {
				return Promise.resolve({ "expected":change, "dispensed":0 });
			}
		} else {
			return Promise.resolve( { "expected":0, "dispensed":0 } );
		}
	}

	levelsCheck( devices ){
		if( !Array.isArray(devices) || !devices.length ) return Promise.resolve();

		var critical = [];
		var notices = [];
		var cache = DeviceManager.getCache();

		var genMessage = ( name, type, rule, count ) => 'Количество купюр в '+name+' превысило '+type+' ('+rule+') значение: '+count;
		
		devices.forEach( e => {
			var deviceName = e.name, limits = e.data, type = e.type;
			if( !limits || (!limits.notice && !limits.error) ) return;
			var device = cache.deviceData[deviceName];
			if( !device || !Array.isArray(device.data) ) return;

			var total_count = device.data.reduce( (sum,e) => sum + e.count - ( (e.dispensable !== true && e.dispensable > 0) ? e.dispensable : 0 ) , 0 );
			switch( limits.type ){
				case 'min':
					if( limits.error > 0 && total_count < limits.error )
						critical[critical.length] = genMessage( deviceName, limits.type, limits.error, total_count );
					else if( limits.notice > 0 && total_count < limits.notice )
						notices[notices.length] = genMessage( deviceName, limits.type, limits.notice, total_count );
				break;
				case "min_cassette":
					if( limits.error > 0 ){
						var tmp = device.data.filter( e => e.count < limits.error );
						if( tmp.length > 0 ) tmp.forEach( e => critical[critical.length] = genMessage( deviceName+" "+e.id+"-"+e.value, limits.type, limits.error, e.count ) );
					} else if( limits.notice > 0 ) {
						var tmp = device.data.filter( e => e.count < limits.notice );
						if( tmp.length > 0 ) tmp.forEach( e => notices[notices.length] = genMessage( deviceName+" "+e.id+"-"+e.value, limits.type, limits.notice, e.count ) );
					}
				break;
				
				default:
					if( limits.error > 0 && total_count >= limits.error )
						critical[critical.length] = genMessage( deviceName, "max", limits.error, total_count );
					else if( limits.notice > 0 && total_count >= limits.notice )
						notices[notices.length] = genMessage( deviceName, 'max', limits.notice, total_count );		
				break;
			}
		});

		if( critical.length > 0 ){
			Abu.notice("Терминал совершает переход на страницу ошибок, потому что при старте приложения на платежной странице<br/>" 
							+ critical.join("<br/>") + "<br/><br/>" + notices.join("<br/>") );
			return Promise.reject("Device bills limit error");
		}
		if( notices.length > 0 ) Abu.mail( notices.join("<br/>") );
		return Promise.resolve();
	};

	initDevices( ...args ){
		var self = this;
		return super.initDevices( ...args )
			.catch( function(err){
				if( err.state === 'start' && err.status === 'fail' && err.data ){
					var msg = 'Терминал совершает переход на страницу ошибок, потому что при старте приложения на платёжной странице ('+self.pageName+') были выявлены следующие ошибки:<br/>';

					if( Array.isArray(err.data) && err.data.length ){
						msg += err.data.map( el => el.device + ' - ' + (( el.data ) ? el.data.error || el.data : el.error || "") ).join("; ");
					} else {
						msg += JSON.stringify( err.data );
					}

					msg += "<br/>" + 'Терминал будет оставаться на этой странице пока проблемы не будут решены оператором системы';
					Abu.notice(msg);
					return new Promise((res,rej) => setTimeout( rej, 500, err ) );
				}
				throw err;
			});
	};

};