var Operator = (function($, Environment, Router) {

   var _settings = {
      element: 'div',
      id: 'operator',
      time: 3,
      style: {
         'width': '200px',
         'height': '200px',
         'z-index': '9999',
         'position': 'fixed',
         'top': '0',
         'left': '0'
      },
   };

   var _cache = {
      count: 0,
      timer: null
   };

   function _onOver() {
      if ( _cache.count == 4 ) {
         _cache.count = 0;
         Router.goOperatorPage();
      } else {
         _cache.count = 0;
      }
   }

   function _start(el) {
      el.on('click', function(){
         if ( !_cache.count || !_cache.timer) {
            _cache.timer = setTimeout(function(){
               return _onOver();
            }, _settings.time * 1000);
         }
         
         _cache.count++;

         if ( _cache.count == 4) {
            clearTimeout(_cache.timer);
            Router.goOperatorPage();
         };

      });
   }

   function _getStyle() {
      var _style = _settings.style; 
      var _answer = ''
      for ( var _el in _style ) {
         _answer += _el + ':' + _style[_el] + ';';
      } 

      _answer = _answer.substring('0', _answer.length - 1);

      return _answer;
   }

   function _init() {
      var _element = document.createElement(_settings.element);
      var _style = _getStyle();
      _element.setAttribute('style', _style);
      _element.id = _settings.id;
      $('body').append(_element);

      _start($('#' + _settings.id));
   }

   _init();

}($, Environment, Router))


