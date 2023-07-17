var Model = (function(){

	const key = "cart_data";
	var data = null;

	const org_key = "org_data";
	var org = null;

	function load() { return !!( data = LocalStorage.get(key) ) /*&& !!( org = LocalStorage.get(org_key) )*/; };
	function save() { LocalStorage.set(key, data); LocalStorage.set(org_key, org) };
	function clear() { data = null; LocalStorage.remove(key); LocalStorage.remove(org_key); };

	function setData( upd ){
		//if( !checkData(upd) ){ console.error("nothing to set"); return; }
		data = upd;
		save();
		return data;
	};

	function set( key, val ){
		if( !data ) data = {};
		data[key] = val;
		save();
		return data;
	};

	/////////////////////////////////////////////////////////

	function setCart( cart ){
		let data = JSON.parse( JSON.stringify(cart) );
		set('services', data );		
		return data;
	};


	////////////////////////////////////////////////
	function get( key ){
		if( !key && data ) return data;
		if( !data || data[key] === void 0 ) return false;
		return data[key];
	};

	function getServicesCount(){
		let services = get('services');
		if( !services || !Object.keys( services ).length ) return 0;
		return Object.keys( services ).reduce( (sum, e) => sum + services[e].count, 0);
	};
	function getServicesSum(){
		let services = get('services');
		if( !services || !Object.keys( services ).length ) return 0;
		return Object.keys( services ).reduce( (sum, e) => sum + (services[e].price ? services[e].count * services[e].price : services[e].count * (services[e].user_price || 0) ) , 0);
	};
	//////////////////////////////////////////////

	function checkData( type ){
		if( !data || !data.id ) return false;
		if( data.services ){
			Object.keys(data.services).forEach( k => {
				if( !data.services[k].count || data.services[k].count <= 0 )
					delete data.services[k];
			});
		}
		
		if( Object.keys(data.services).some( k => !data.services[k].id ) ){
			return false;
		}

		save();
		return true;
	};

	//////////////////////////////////////////////

	function setOrg( id ){
		org = { id };
		// let tmp = null;
		// if( !Array.isArray(window.ORGANIZATIONS_DATA) ) return null;
		// tmp = window.ORGANIZATIONS_DATA.find( e => e.id === parseInt(id) );
		// if( !tmp ) return null;

		// if( !org ) org = {};
		// org.name = tmp.name;
		// org.id = tmp.is_org;
		// org.kaznachey_id = tmp.kaznachey_id;
		// org.terminal_id = tmp.terminal_id;
		// org.seller_img = tmp.seller_img;
		// if( tmp.seller_data ) org.seller_data = JSON.parse(tmp.seller_data);
		// else org.seller_data = {};
		// if( tmp.settings_data ) org.settings_data = JSON.parse(tmp.settings_data);
		// else org.settings_data = {};

		save();
		return org;
	};

	function getOrg(){
		return org;
	};

	// console.log('Model loaded');
	
	return { 
		load, clear,
		get, setData, set, save,

		setCart,

		getServicesCount, getServicesSum,
		checkData,

		setOrg, getOrg,
	};

})();
