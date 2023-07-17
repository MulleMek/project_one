/* jQuery Tiny Pub/Sub - v0.7 - 10/27/2011
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT, GPL */
(function($) {

   var o = $({});

   $.subscribe = function() {
      o.on.apply(o, arguments);
   };

   $.unsubscribe = function() {
      o.off.apply(o, arguments);
   };

   $.publish = function() {
      var message = arguments[0];
      var style = "color:white; font-size: 2em; ";

      if ( arguments[1] ) {
         message += ":";
         if ( typeof arguments[1] === "object" ) {
            try {
               message += JSON.stringify(arguments[1]);
            } catch( e ) {
               console.log(e);
            }
         } else {
            message += arguments[1].toString();
         }
      }

      if ( typeof EM !== "undefined" ) {
         if ( !EM.isSubscribed(arguments[0]) ) {
            style += "background: pink";
            message = "!NOT SUBSCRIBED - " + message;
            console.log('%c' + message, style);
            o.trigger.apply(o, arguments);
            return;
         }
      }

      if ( message.indexOf("/error") > -1 || message.indexOf("fail") > -1 ) {
         style += "background:red;";
      } else {
         style += "background:blue;";
      }

      if ( message.indexOf("DeviceManager/") > -1 ) {

         style = "color:white; font-size: 2.5em; ";

         if ( message.indexOf("/error") > -1 || message.indexOf("fail") > -1 ) {
            style += "background:black;";
         } else {
            style += "background:green;";
         }
      }

      if ( message.indexOf("App/") > -1 ) {

         style = "color:white; font-size: 3em; ";
         style += "background:orange;";
      }

      if ( message.indexOf("Tester") > -1 ) {
         return;
      }

      if ( style ) {
         console.log('%c' + message, style);
      }

      o.trigger.apply(o, arguments);

   };

}(jQuery));
