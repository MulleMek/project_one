'use strict';

function BarcodeReader(start, end) {
   const options = Environment.get('options.BarcodeReader');

   const startCymbol = ( typeof start == 'string' && start) ? start.charCodeAt(0) : false;
   const endCymbol = ( typeof end == 'string' && start) ? start.charCodeAt(0) : false;

   function _proceedCymbols(start, end) {
      let answer = "";
      let started = false;

      $("body").keypress(function(e) {
         const charCode = e.charCode;
         
         if ( charCode === start && !started ) {
            started = true;
            answer = "";
            return;
         }

         if ( charCode == ESCAPE_CODE && started ) {
            started = false;
            return EM.pub(options.events.code, [answer]);
         }

         const num = String.fromCharCode(charCode);

         answer += num.toString();
      });
   }

   function _proceedTimer() {
      let answer = '';

      let timer = null;
      
      $("body").keypress(function(e) {
         const charCode = e.charCode;

         if ( timer ) {
            clearTimeout(timer);
         }

         timer = setTimeout(() => {
            EM.pub(options.events.code, [answer]);
            answer = '';
         }, 1000);
         
         const num = String.fromCharCode(charCode);

         answer += num.toString();
      });  
   }

   $("input").keypress(function(e) {
      e.stopPropagation();
      e.preventDefault();
   });

   if ( start && end ) {
      return _proceedCymbols(startCymbol, endCymbol);
   } else {
      return _proceedTimer();
   }

}