(function ( $, window, undefined ) {

   var pluginName = 'clocks',
      document = window.document,
      defaults = {
         date: false,
         time: true
      };



   function Plugin( element, options ) {
      var base = this;

      base.element = element;
      base.$element = $(element);

      base.options = $.extend( {}, defaults, options ) ;

      base._defaults = defaults;
      base._name = pluginName;

      base.init();
   }



   /***************************************************************/
   /* HELPERS */
   /***************************************************************/
   function checkTime(i) {
      return ( i < 10 )? "0" + i : i;
   };

   function generateTime( dateObj ) {
      return [checkTime(dateObj.getHours()), checkTime(dateObj.getMinutes()), checkTime(dateObj.getSeconds())].join(':');
   };

   function generateDate( dateObj ) {
      return [dateObj.getDate(), (dateObj.getMonth() + 1), dateObj.getFullYear()].join('.');
   };

   Plugin.prototype.tick = function() {
      var base = this,
         dateObj = new Date();

      if ( base.$timeBind ) {
         base.$timeBind.html(generateTime(dateObj));
      };

      if ( base.$dateBind ) {
         base.$dateBind.html(generateDate(dateObj));
      };

      setTimeout(function() {
         base.tick();
      }, 1000)
   };

   Plugin.prototype.init = function () {

      if ( this.options.time ) {
         var bind = this.$element.find('time-bind');
         this.$timeBind = ( bind.length ) ? bind : this.$element;
      }

      if ( this.options.date ) {
         var bind = this.$element.find('date-bind');
         this.$dateBind = ( bind.length ) ? bind : this.$element;
      }

      this.tick();
   };

   $.fn[pluginName] = function ( options ) {
      return this.each(function () {
         if (!$.data(this, 'plugin_' + pluginName)) {
            $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
         }
      });
   };

}(jQuery, window));