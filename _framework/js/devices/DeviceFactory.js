
var DeviceFactory = (function( Environment, EventManager, Logger ) {

   if ( !Environment || !EventManager || !Logger ) {
      throw "It's not possible to run Devices without Environment or EventManager or Logger";
   }

   function create( device ) {
      var isFake, scenario, className, options

      /***************************************************************/
      /* EXISTS */
      /***************************************************************/

      if ( !Environment.get('deviceConfig.' + device) ) {
         throw "couldn't find config for " + device + " in Environment";
      } else {
         options = Environment.get('deviceConfig.' + device);
      }

      isFake = Environment.get('fakeDevices.' + device) || false;

      if ( isFake && !Environment.get('scenarios.' + device) ) {
         throw "couldn't find scenario for " + device + "";
      } else {
         options.scenario = Environment.get('scenarios.' + device);
         options.isFake = isFake;
      }

      className = device;

      /***************************************************************/
      /* CHECK IS CONSTRUCTOR FUNCTION OF DEVICE AND FAKE_DEVICE EXIST */
      /***************************************************************/
      if ( typeof window[className] !== "function" ) {
         throw className + " is not defined in current context. (check if you include " + className + ".js file)";
      }

      if ( Environment.get('prevent.globalSocketDebug') ) {
         options.debug = false;
      }

      var _device = new window[className]( options, EventManager, Logger );

      var consoleStuff = [];   

      if ( Environment.get('trace.deviceOptionsBeforeStart') ) {
         consoleStuff.push(options);
      }

      if ( typeof _device.info == 'function' && Environment.get('trace.deviceInfoBeforeStartDevice') ) {
         consoleStuff.push(_device.info);
      }

      if ( consoleStuff.length ) {
         console.group("Info " + className);
         for ( var _i in consoleStuff ) {
            console.log(consoleStuff[_i]);
         }
         console.groupEnd();
      }

      return _device; 
   }

   return {
      create: create
   };

})( Environment, $, SocketLogger );
