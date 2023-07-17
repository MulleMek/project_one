var EnvironmentConfig = ( function() {

	var self = {
	 	rootPrefix: '', // if url starts not with project/, but witt lala/project/
	};

	self.debug = {
		CashcodeBNL: true,
		Uniteller: true,
		CashcodeSM: true,
		MEI: true,
		ECDM400: true,
		LCDM200: true,
		Printer: true,
		Kaznachey: true,
		NanoKassa: true,
		SmartHopper: true,
		PinPad: true,
		EFTPOS: true,
		Vendotek: true,
	};

	self.fakeDevices = {
		//acceptors
		CashcodeBNL: false,
		CashcodeSM: true,
		MEI: true,

		//dispensers
		ECDM400: false,
		LCDM200: false,

		//recyclers
		SmartHopper: false,

		//printer
		Kaznachey: false,
		NanoKassa: false,
		Printer: false,

		//banking
		Uniteller: false,
		PinPad: false,
		Vendotek: false,
		EFTPOS: false,

	};

	self.prevent = {
		goHome: false,
		goError: false,
		redirect: false,
		reload: false,
		globalSocketDebug: false,
		mail: false
	};

	self.trace = {
		ajax: true,
		deviceInfoBeforeStartDevice: true,
		deviceOptionsBeforeStart: true
	};


	function _getAll() {
		return self;
	}


	return {
		get: _getAll,
	}


}) ();
