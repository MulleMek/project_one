(function(){
 
    var parse = JSON.parse;
 
    JSON = {
 
        stringify: JSON.stringify,
 
        validate: function(str){
        
            try {
                parse(str);
                return true;
            } catch(err) {
                return false;
            }
 
        },

 
        parse: function(str){
 
            try {
                return parse(str);
            } catch(err) {
                return undefined;
            }
 
        }
    }
    
})();