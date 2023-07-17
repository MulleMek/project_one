/* jshint unused:false */
/* globals console: true, Sender: true, Logger: true, emu: true, $dialogbox: true, $: true, Router: true */
"use strict";

var U = (function() {
   var NAME = "U";
   return {
      NAME: NAME
   };
}());


/***************************************************************/
/* UTILS */
/***************************************************************/
(function(U) {

   var Utils = (function() {

      /***************************************************************/
      /* NUMBERS */
      /***************************************************************/
      function intDivision( x, y ) {
         return ( x - x % y ) / y;
      }



      /***************************************************************/
      /* FORMAT */
      /***************************************************************/
      function twoDigits( i ) {
         return ( i < 10 )? "0" + i : i;
      }
      /**
       * @param  {number} number
       * @param  {number} numberOfDecimals
       * @return {string} "10.02"
       */
      function floatFixed( number, numberOfDecimals ) {
         numberOfDecimals = numberOfDecimals || 2;
         return parseFloat(number).toFixed(numberOfDecimals);
      }


      /***************************************************************/
      /* CONVERT */
      /***************************************************************/
      function snakeCase( str ) {
         str = str.replace(/([A-Z])/g, " $1").trim().toLowerCase()
         str = str.replace(/\s/g, "_");
         return str;
      }

      /***************************************************************/
      /* CONTAINS */
      /***************************************************************/
      function containsBase( where, what, arrayCallbackName ) {
         if ( !Array.isArray(what) ) {
            what = [what];
         }

         if ( !arrayCallbackName && typeof Array.prototype[arrayCallbackName] !== "function" ) {
            arrayCallbackName = "some";
         }

         return what[arrayCallbackName](function( elem ) {
            return where.indexOf(elem) > -1;
         });
      }

      function contains( where, what ) {
         return containsBase(where, what);
      }

      function containsAny( where, what ) {
         return containsBase( where, what, "some" );
      }

      function containEvery( where, what ) {
         return containsBase( where, what, "every" );
      }


      /***************************************************************/
      /* API */
      /***************************************************************/
      return {
         
         number: {
            intDivision: intDivision
         },

         format: {
            floatFixed: floatFixed,
            twoDigits: twoDigits,
         },

         convert: {
            snake: snakeCase,
            snakeUpper: function( str ) {
               return snakeCase( str ).toUpperCase();
            }
         },

         contains: contains

      };

   }());

   U.utils = Utils;

}(U));


/*
|--------------------------------------------------------------------------
| AJAX
|--------------------------------------------------------------------------
|
| 
|
*/
(function(U) {

   function request( url, postData, eventNames, hooks, name ) {
      var
         NAME = name || U.NAME,
         dfd = new $.Deferred(),
         defaultEventNames = {
            DONE: NAME + "/done",
            FAIL: NAME + "/fail"
         };

      eventNames = eventNames || defaultEventNames;
      
      if ( emu && emu.ajax.params ) {
         console.log("%c" + (JSON.stringify(postData) || postData), "font-size:3em; color:green");
      }

      $.ajax({
         method: "post",
         url: url,
         data: postData
      }).done(function( message ) {

         if ( emu && emu.ajax.result ) {
            console.log("%c" + (JSON.stringify(message) || message), "font-size:3em; color:blue");
         }
         
         /***************************************************************/
         /* FAIL */
         /***************************************************************/
         if ( typeof message !== "object" || message.error ) {

            /***************************************************************/
            /* AJAX DEBUG */
            /***************************************************************/
            if ( emu && emu.dev_mode && emu.ajaxDebug && (typeof message !== "object") ) {
               $("#debug").html(message).fadeIn();
            }
            /***************************************************************/

            if ( hooks && (typeof hooks.fail === "function") ) {
               hooks.fail.apply( hooks.fail, [message] );
            }

            $.publish(eventNames.FAIL || eventNames.fail, [message]);
            dfd.reject(message);
            return;
         }

         /***************************************************************/
         /* DONE */
         /***************************************************************/
         if ( hooks && (typeof hooks.done === "function") ) {
            hooks.done.apply( hooks.done, [message.data] );
         }

         $.publish(eventNames.DONE || eventNames.done, [message.data]);
         dfd.resolve(message.data);

      }).fail(function( message ) {
         $.publish(eventNames.FAIL || eventNames.fail);
         dfd.reject();
      });

      return dfd;
   } 


   U.ajax = {
      request: request
   };

}(U));



/*
|--------------------------------------------------------------------------
| DEFAULT SCENARIOS (DIALOG, LOGGER, SENDER)
|--------------------------------------------------------------------------
|
| 
|
*/
/***************************************************************/
/* HARD DEPENDENCIES

   1. DIALOGBOX
   2. PRELOADER
   3. SENDER
   4. LOGGER
 
 */
/***************************************************************/
(function(U) {

   function defaultDialog( message, message2, options ) {
      var defaults = {
         timout: false,
         time: 3 * 1000,
         callback: null
      };

      message2 = message2 || "";
      
      options = (options || {}) && $.extend({}, defaults, options);

      $dialogbox.open({
         props: {
            text: message,
            text2: message2
         },

         buttons: false,
         
         callbacks: {
            ok: options.callback,
            cancel: options.callback
         }
      });

      if ( options.timeout && options.time ) {
         setTimeout(function() {
            $dialogbox.close();
         }, options.time);
      }
   }

   function defaultErrorCallback( forUserMessage, forAdminsMessage, options ) {
      /* INIT */
      options = options || {};
      var defaults = {
         send: true,
         log: true,
         dialogbox: true,
         timeout: false,
         time: 2000,
         buttons: false,
         callbacks: {
            ok: null,
            cancel: null
         }
      };
      options = $.extend({}, defaults, options);

      switch ( typeof forAdminsMessage ) {
         case "object":
            forAdminsMessage = JSON.stringify(forAdminsMessage);
         break;
      }


      if ( options.send ) {
         Sender.send(forAdminsMessage);
      }

      if ( options.log ) {
         Logger.put(forAdminsMessage);
      }

      if ( options.dialogbox ) {
         $dialogbox.open({
            props: {
               text: forUserMessage
            },

            buttons: options.buttons,

            callbacks: {
               ok: function() {
                  if ( options.callbacks.ok ) {
                     options.callbacks.ok();
                  }
               },
               cancel: function() {
                  if ( options.callbacks.cancel ) {
                     options.callbacks.cancel();
                  }
                  Router.errorPage();
               }
            }
         });   
      }

      if ( options.timeout ) {
         setTimeout(function() {
            Router.errorPage(forUserMessage);
         }, options.time);
      }
   }

   function defaultSend( message, details, options ) {
      var defaults = {};
      options = options || {};
      options = $.extend({}, defaults, options);

      if ( details ) {
         if ( typeof details === "object" || Array.isArray(details) ) {
            details = JSON.stringify(details);
         }

         message += " " + details;
      }

      Sender.send(message);
      Logger.put(message);
   }


   U.scenarios = {
      send: defaultSend,
      error: defaultErrorCallback,
      dialog: defaultDialog 
   };

}(U));

(function(U) {
   function bigLog( message ) {

      if ( emu && emu.dev_mode && emu.clear ) {
         console.clear();
      }

      var style = "color: #ffffff; font-weight: bold; font-size: 7em; background-color: orange; padding: 3px;";
      message = "%c" + message;
      console.log(message, style);
   }

   U.bigLog = bigLog;
}(U));