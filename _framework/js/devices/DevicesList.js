"use strict";

var DevicesList = (function(){

   const devices = {
      acceptors: ['CashcodeSM', 'CashcodeGX', 'CashcodeBNL', 'JCM', 'ICT'],
      dispensers: ['ECDM400', 'LCDM200'],
      recyclers: ['SmartHopper', 'NV200', 'JCM_RC', 'Bill2Bill'],
      bank: ['PinPad', 'RusStandPinPad', 'ArcusPinPad', 'Vendotek', 'EFTPOS'],

      kkms: [ 'FPrinter', 'Kaznachey', 'NanoKassa' ],

   };

   const notPaymentDevices = ['Printer', 'FPrinter', 'Kaznachey', 'NanoKassa', 'Proxy'];


   function get(param) {
      if ( param ) {
         if ( devices[param] ) {
            return devices[param];
         } else {
            return [];
         }
      } else {
         const answer = notPaymentDevices;

         for ( var i in devices ) {
            if ( devices.hasOwnProperty(i) ) {
               answer.push(...devices[i]);
            }
         }

         return answer;
      }

   }

   function isCash(array) {
      return array.some(el => {
         return devices.acceptors.indexOf(el) > -1 ||
                devices.recyclers.indexOf(el) > -1 ||
                devices.dispensers.indexOf(el) > -1;
      });
   }

   function getKKMName(array){
      var s = false;
      array.forEach(function(e){
         if(devices.kkms.indexOf(e) > -1 ) s = e;
      });

      return s;
   }

   function getBankName(array){
      var s = false;
      array.forEach(function(e){
         if(devices.bank.indexOf(e) > -1 ) s = e;
      });

      return s;
   }

   function isValidDevicesList(array) {
      if ( !Array.isArray(array) ) {
         console.error('список устройств должен являться массивом, передан', typeof array, JSON.stringify(array));
         return false;
      }

      if ( !array.length ) {
         console.error('в качестве списка устройств передан пустой массив');
         return false;
      }

      const allDevices = get();
      const unknownDevices = [];

      array.forEach(el => {
         if ( allDevices.indexOf(el) < 0 ) {
            unknownDevices.push(el);
         }
      });

      if ( unknownDevices.length ) {
         console.error('в списке устройств есть неизвестные устройства', JSON.stringify(unknownDevices));
         return false;
      }

      const isCash = array.some(el => {
         return devices.acceptors.indexOf(el) > -1 ||
                devices.recyclers.indexOf(el) > -1 ||
                devices.dispensers.indexOf(el) > -1;
      });

      const isCard = array.some(el => {
         return devices.bank.indexOf(el) > -1;
      });

      if ( (isCash && isCard) || (!isCash && !isCard) ) {
         console.error('в списке устройств есть девайсы для работы с банковскими картами и наличными или нет ни одного платёжного устройства', JSON.stringify(array));
         return false;
      }

      return true;
   }

   function isDeviceBelongsToGroup(device, group) {
      if (!group || !devices[group] ) {
         return false;
      }

      return devices[group].indexOf(device) > -1;
   }

   return {
      get: get,
      isValidDevicesList: isValidDevicesList,
      isCash: isCash,
      isDeviceBelongsToGroup: isDeviceBelongsToGroup,
      getKKMName: getKKMName,
      getBankName: getBankName,

   }


})();
