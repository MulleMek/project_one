var Router = (function( $, Environment, Helper ) {
   var module = {};

   function redirectHome( timeout ) {
      Helper.showPreloader();

      timeout = timeout || 0;

      if ( Environment.get('prevent.goHome') ) {
         console.log("fake goHome by Router");
         return;
      }

      setTimeout(function() {
         location.href = Environment.get('domains.kiosk');
      }, timeout );
   }

   function goOperatorPage() {
      Helper.showPreloader();

      location.href = Environment.get('domains.operator');
   }

   function redirectPrevious() {
      Helper.showPreloader();

      var _href = document.referrer;
      location.href = _href;
   }

   function goErrorPage( message ) {
      Helper.showPreloader();

      if ( Environment.get('prevent.goError') ) {
         console.log("fake goErrorPage by router");
      } else {
         location.href = Environment.get('domains.kiosk') + '/error';
      }
   }

   function redirect( domain, action, method, input ) {
      Helper.showPreloader();

      var uri = action || '';
      var action;

      action = domain + '/' + uri;

      if ( !method && !input ) {
         location.href = action;
         return;
      }

      method = method || "get";

      var $form = $('<form />', {
         action: action,
         method: method,
         style: 'display: none;'
      });

      if ( typeof input !== 'undefined' ) {
         $.each(input, function( name, value ) {
            $('<input />', {
                type: 'hidden',
                name: name,
                value: value
            }).appendTo($form);
        });
      }

      $form.appendTo('body').submit();
   }

   function reload( timeout ) {
      Helper.showPreloader();

      if ( Environment.get('prevent.reload') ) {
         return console.log('Page was reloaded');
      }

      timeout = timeout || 0;
      setTimeout( function() {
         location.reload();
      }, timeout);
   }

   return {
      redirect: redirect,
      redirectPrevious: redirectPrevious,
      goErrorPage: goErrorPage,
      goOperatorPage: goOperatorPage,
      redirectHome: redirectHome,
      reload: reload
   }

})( $, Environment, Helper );
