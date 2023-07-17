var Timer = {
    time: 0,
    cacheTime: 0,
    start: function(t) {
      this.time = t;
      this.tick();
    },
    tick: function() {
      if ( this.time == this.cacheTime) {
        return console.log('timer finished');
      }
    
      console.log(this.cacheTime);

      this.cacheTime++;

      var _that = this;

      timeoutId = setTimeout(function() {
        _that.tick();
      }, 1000);
    },
    stop: function() {
      clearTimeout(timeoutId);
    },
    reset: function() {
      time = 0;
      cacheTime = 0;
      var _that = this;
      _that.start(t);
    }
};