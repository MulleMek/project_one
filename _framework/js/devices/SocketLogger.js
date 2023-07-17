var SocketLogger = (function( Helper ) {

   var URL = Environment.get('domains.services') + '/abu/saveSocketLogs';

   var EVENTS = {
      DONE: 'SocketLogger/save/done',
      FAIL: 'SocketLogger/save/fail'
   };

   var _newLineSymbol = "\n";

   var _log = '';

   var _startTime = '';

   function _write(string) {
      _log += string + _newLineSymbol;
   }

   function _get() {
      return _startTime + _newLineSymbol + _newLineSymbol + _log + _newLineSymbol + Helper.getDate() + ' ' + Helper.getTime();
   }

   function _save(name) {
      var _data = {
         name: name,
         data: SocketLogger.get()
      };

      Helper.ajax(URL, _data, EVENTS);
   }

   _startTime = Helper.getDate() + ' ' + Helper.getTime();

   return {
      log: _write,
      get: _get,
      save: _save
   };


}( Helper ) )


