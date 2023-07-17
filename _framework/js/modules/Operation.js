/*jshint unused:false */
"use strict";
var Operation = (function( $, Environment, Helper ) {
   
   var URI = {},
      EVENTS = {},
      OPERATION_TYPES = {};

   URI = {
      CREATE: Environment.get('domains.services') + '/operations/create',
      UPDATE: Environment.get('domains.services') + '/operations/update/'
   };



   EVENTS = {
      SAVE: {
         DONE: 'Operation/save/done',
         FAIL: 'Operation/save/fail'
      }
   };

   OPERATION_TYPES = {
      ENCASH: 'encash',
      CARD: 'payment_card',
      CASH: 'payment_cash',
      DEPOSITE: 'payment_deposite',
      CANCEL: 'payment_cash_cancel',
      NOACTIVITY: "no_activity_cancel",

      PROMO: "promo",

      ANNULATE_CASH: 'annulate_cash',
      ANNULATE_CARD: 'annulate_card',
      RETURN_CASH: 'ret_cash',
      RETURN_CARD: 'ret_card',
   
   };


   var operationData = {
      "id": null,
      "type": '',
      "price": 0,
      "inserted": 0,
      "dispensed": 0,
      "datetime": 0,
      "sync": 0,
      "sync_remote": 0,
      "fisc": 0,
      "printed": 0,
      "no_troubles": 0,
      "approved": 0,
      
      "org_id": null,
      "user_phone": "",
      
      "data" : {}
   };

  

   function init(operation_type) {
      operationData.type = OPERATION_TYPES[operation_type];
   }


   /***************************************************************/
   /* DEFAULT #toparent */
   /***************************************************************/
   
   function get( name ) {
      if ( !name ) {
         return operationData;
      }

      if ( typeof operationData[name] == 'undefined' ) {
         return operationData.data[name];
      }

      return operationData[name];
   
   }

   function set( name, value ) {

      if ( typeof operationData[name] == 'undefined' ) {
         return operationData.data[name] = value;
      }

      return operationData[name] = value;
   
   }

   function save() {

      if ( operationData["id"] ) {
         update();
      } else {
         create();
      }

   }

   function create() {
      var postData = $.extend({}, operationData);
      postData['data'] = JSON.stringify(postData['data']);

      var Hooks = {
         done: function(data) {
            console.log("hooks done");
            if ( !Operation.get('id') ) {
               Operation.set('id', data['operationId']);
               Operation.set('datetime', data['datetime']);
            }
         }
      }

      Helper.ajax( URI.CREATE, postData, EVENTS.SAVE, Hooks);
   }

   function update() {

      var postData = $.extend({}, operationData);
      delete postData["id"];
      delete postData["datetime"];
      postData['data'] = JSON.stringify(postData['data']);

      Helper.ajax( URI.UPDATE + operationData.id, postData, EVENTS.SAVE );

   }

   const default_style = "border: black; border-width: 1px; border-style: dashed; padding: 5px";
   function getTable( obj, style ) {
      if ( obj === void 0 && operationData ) return getTable(operationData, style);
      if ( !obj ) return "";
      style = style || default_style;
      var out = "<table style='"+style+"'><tr>";
      out += Object.keys(obj).map( k => "<td>"+k+"</td><td>"+ (( typeof obj[k] === "object" )? getTable(obj[k], style) : obj[k] )+"</td>" )
                  .join("</tr><tr>"); 
      return out + "</tr></table>";
   }

   /***************************************************************/
   /* INTERFACE */
   /***************************************************************/

   return {
      set: set,
      get: get,
      save: save,
      init: init,

      getTable: getTable
   }

})( $, Environment, Helper );

