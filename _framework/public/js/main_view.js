
let device = null;

$(function(){

/*	DeviceManager.init(["SmartHopper", "NV200"]);

	EM.subOnce("DeviceManager/start/done", function(){
		DeviceManager.calculate(370);
	});*/

	//device = DeviceFactory.create( 'JCM_RC');

	DeviceManager.init(["SmartHopper", "JCM_RC"]);

});
