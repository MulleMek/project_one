/* 
      THIS MODULE PROVIDES FACADE FOR Logger AND Sender Modules

                                             .  .,cd$$$$$$$$$$$$$$h,
                                           ,c",c$$$$$$$$$$$""?$$$$$'
                                        .z$$$$$$$$$$$$$$$$$$c, "$$$$c
       ;;.                           .,c$$$$$$$$$$$$$$$$$$$$$$h. "?$$h.
     <!!!!!>>                     zc$$$$$$$$$$$$$$$$$$$$$$$$$$$$h, "$$$
   ;!!!!!!!!! 4Mmnx.,.   .,,,,= `.    ""$$$$L.""?$$$$F"$$$$$$$$$$$c `?$c
   !!!!!!!!!!> 4MMMMP ,c$$$$$hr=" ,ccc??""    "- "$$$$.`?$$$$$$$$$$h  "$
  !!!!!! ..nnmnmMM" ,c$$$$$P"'.zc$$P"" .,ccccc  h. "$$h   "?$$$$$$$$,  `
 '!!!!!! "MMMMMMP  c$$$$$$" zJ$$$F  zc$$$$$$$$c J$h `$$     "$$$$$$$$
  `<!!!!> "MMMMP .J$$$$$$'.J$$$P",c$$$$$$$$$$$$ $$$h "$, .   `$$$$c`$>
    `''''' `MM" z$$$$$$P'.$$$$" .$$$$$$$$$$$$$$ $$$$L ?F $h   `$$$$ $
       -4MMMMP z$$$$$$$ .$$$P z$$$$??"??$$$$$$F $$$$$   <$$    `$$$ `
         "MMP <$$$$$$$$ $$$" z$$P"'.,u,.`"?$$$  $$$P"   $$$     $$$
           " .$$$$$$$$F $$P z$P" xJMMMMMMn `?$ <$$P zr z$$$     `$$
             $$$$$$$$$F.$$'J$" uMMMMMMMMMMMx ? $$P'<$F $$$$      $
            -$$$$$$$$$'<$P $' JMMMMMMMMMMMMM. <$P  .,,.`$$F
         .,,,.`"???$$$ <$'<F uMMMMPPPMMMMMMMb $$'.nMMMb "$
      zJ$$$$$$$hc, "$$h`$ J' MMMM     )MMMMMM $',MMMMMMb
     J$$$$cc,.`"?$h ?$L $ $ 4MMM       MMMMMM ?,J444MMMM
     $$$$$$$$$$hc,"c ?$ $ 4 4MMM      ;MMMMM>/ f    MMMM
     ?$$$$$$$$$$$$c  <$ `h`L`MMMx    .MMMMMP  j     JMMM
     `$$$$$$$$$$$$$$ <$L ?,"r`MMMMmnMMMMMM" z J.   uMMM'
      `$$$$$$$$$$$$$ <$$, $.",`4MMMMMMMMP'.z$.4MmnMMMMP
       `?$$$$$$$$$$P J"$$ `h."r `4MMMMP' /""$h `4MMMMP
         "?$$$$$$$P -"J$$L ?$."?c,.    ,J cP"?$c, "P"
           `?$$$$$   J$$$$, ?$c "?$P",J$$,"  `$$ P
               """ ? $$$$$$. "$$$cccd$$$$$$$h.`
                     `$$$$?$L `$$$$$$$$$$$F?$$$$h.
                      `$$$ ?$h.`"$$$$$$$$$c,`?$$$$c
                       `?$  "$". "$$$$$$$$$$h..""??
                         `   `\`". "?$$$$$$$$$$$hccccc=
                                  "  "?$$$$$$$$$$$??"
                                        """"""""
*/
/* jshint unused:false */
"use strict";

var Abu = (function(Environment, Helper){

   function _sendMail(message) {
      if ( Environment.get('prevent.mail') ) {
         return console.log('Emails fake send: ' + message);
      }

      var _url = Environment.get('domains.services') + '/abu/mail';

      Helper.ajax(_url, {data: message}, null);

   }

   function _log(message) {
      if ( Environment.get('prevent.mail') ) {
         return console.log('Fake log: ' + message);
      }

      var _url = Environment.get('domains.services') + '/abu/log';

      Helper.ajax(_url, {data: message}, null);
   }

   function _notice(message) {
      _sendMail(message);
      _log(message);
   }

   function _sendMailTo(email, message) {
      if ( Environment.get('prevent.mail') ) {
         return console.log('Emails fake send: ' + message);
      }

      var _url = Environment.get('domains.services') + '/abu/mailto';

      Helper.ajax(_url, {data: message, email: email}, null);
   }

   //// from -> type -> "day"/"week"/"month"/"year"
   function _sendReport( message, from, to ){
     var type = null;
     if( !to ) type = from;

     var _url = Environment.get('domains.services') + '/abu/mail_report';
     
     var data = { data: message };
     if( type ) data.type = type;
     if( to && from ) { data.from = from; data.to = to; }

     return Helper.ajax(_url, data, null);
   }

   return {
      mail: _sendMail,
      log: _log,
      notice: _notice,
      sendMailTo: _sendMailTo,
      sendReport: _sendReport,
   }


})(Environment, Helper)
