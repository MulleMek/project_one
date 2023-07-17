var LocalStorage = (function( ) {
	
	function getItem( name ) {
		var out = localStorage.getItem(name);
		try {
			return JSON.parse(out);
		} catch (e){
			console.log('LocalStorage.getItem ', name, ' error: JSON parse error - ', e);
			return out; 
			//// ЛИБО возвращать false/null итд
		}
	};

	function setItem( name, value ) {
		var answer = localStorage.setItem( name, JSON.stringify(value) );
		return answer;
	};

	function clear() {
		console.log('LocalStorage cleared');
		localStorage.clear();
	};

	function remove(item) {
		localStorage.removeItem(item);
	};

	///	принимает либо массив ключей которые надо удалить
	///	либо массив ключей к объекту в котором записаны ключи для хранилища
	function removeArray(arrayOfKeys, kvObject){
		if( !Array.isArray(arrayOfKeys) || !arrayOfKeys.length ){ return console.log('LocalStorage.removeArray Error: Array is empty'); }

		if( kvObject ){ return removeArray( arrayOfKeys.map( function(e){ return kvObject[e]; } ) ); }

		return arrayOfKeys.forEach( function(e){ remove(e); } );
	};

	return {
		set: setItem,     // LocalStorage.set('param', '12123') // ВСЕ ПРЕОБРАЗУЕТ В JSON
		get: getItem,     // LocalStorage.get('param'); // ВЕРНЕТ '12123' КАК STRING - попытается распарсить;
		
		remove: remove,	//	один item
		removeArray: removeArray, // массив item, либо можно пробросить через объект
		
		clear: clear,     //LocalStorage.clear() // очистит хранилище


		//EVENTS: EVENTS
	};

}());
