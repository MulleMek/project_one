const CartStore = {
	namespaced: true,

	state: {
		cart: {},
		org_id: null,
	},

	mutations: {
		set( state, cart ){
			Vue.set( state, 'cart', cart );
		},

		plus( state, service ){
			if( !state.cart[service.id] ) return;
			if( !state.cart[service.id].count ) {
				Vue.set(state.cart[service.id], 'count', 1);
			} else if( state.cart[service.id].count < 10 ){
				state.cart[service.id].count ++;
			}
		},
		minus( state, service ){
			if( !state.cart[service.id] ) return;
			if( state.cart[service.id].count > 0 ){
				state.cart[service.id].count --;
			}
		},

		add( state, service ){
			if( state.cart[service.id] ) return;
			Vue.set(state.cart, service.id, service);
		},

		remove( state, service ){
			if( !state.cart[service.id] ) return;
			if( state.cart[service.id].count <= 0 )
				Vue.delete(state.cart, service.id);
		},

		clean( state ){
			if( !state.cart ) return;
			Object.keys(state.cart).forEach( id => {
				if( !state.cart[id] || !state.cart[id].count || state.cart[id].count < 0 )
					Vue.delete(state.cart, id);
			});
		},

		set_price( state, { service, user_price } ){
			if( !state.cart[service.id] ) return;
			Vue.set(state.cart[service.id], 'user_price', user_price);
			if( !state.cart[service.id].count ) {
				Vue.set(state.cart[service.id], 'count', 1);
			}
		},
		del_price( state, service ){
			if( !state.cart[service.id] ) return;
			Vue.delete(state.cart[service.id], 'user_price');
			state.cart[service.id].count = 0;
		},

		set_org( state, org_id ){
			state.org_id = org_id;
		},

		del_org( state ){
			state.org_id = null;
		},
	},

	actions: {
		set( context, cart ){
			if( !cart || !Object.keys(cart).length ) return;
			context.commit( 'set', JSON.parse(JSON.stringify(cart)) );
		},

		addService( context, service ){
			context.commit('add', service);
			context.commit('plus', service);
		},
		removeService( context, service ){
			context.commit('minus', service);
			context.commit('remove', service);
		},

		setPrice( context, { service, user_price } ){
			context.commit('add', service);
			context.commit('set_price', { service, user_price });
		},
		removePrice( context, service ){
			context.commit('del_price', service);
			context.commit('remove', service);
		},

		cleanCart( context ){
			context.commit("clean");
		},

		setOrgId( context, org_id ){
			context.commit( 'set_org', org_id );
		},
	},

	getters: {
		getData(state){
			if( !Object.keys( state.cart ) ) return {};
			return state.cart;
		},
		getCount( state ){
			if( !Object.keys( state.cart ) ) return 0;
			return Object.values(state.cart).reduce( (count, e) => count + (e.count > 0 ? e.count : 0), 0);
		},
		getTotalPrice( state ){
			if( !Object.keys( state.cart ) ) return 0;
			return Object.values(state.cart).reduce( (sum, e) => sum + ( ( !e.price || e.price < 0 ? e.user_price || 0 : e.price ) * (e.count || 0) ), 0);
		},
		getServiceCount( state ){
			return service_id => {
				if( !state.cart[service_id] ) return 0;
				return state.cart[service_id].count;
			};
		},
		getServiceUserPrice( state ){
			return service_id => {
				if( !state.cart[service_id] ) return 0;
				return state.cart[service_id].user_price;
			};
		},

		getOrgId(state){
			return state.org_id;
		},
	},
};


const PricePopupStore = {
	namespaced: true,
	state: {
		show: false,
		status: '',
		callback: () => ( null ),
		timeout_id: null,

		data: {
			title: "",
			notice: "",
			button1: "Нет",
			button2: "Да",
		},
	},
	mutations: {
		showed( state, { params, resolve, timeout_id } ){
			state.status = "showed";
			state.data = params;
			state.timeout_id = timeout_id;
			state.callback = resolve;
			state.show = true;
		},

		hide( state, result ){
			if( !state.show ) return;

			state.status = "wanna_hide";
			clearTimeout( state.timeout_id );
			state.show = false;
			state.data = {};

			if( !state.callback ) console.error("something happens on callback definition");
			else state.callback( result );
		},

		hidden( state ){
			state.status = "hidden";
			state.show = false;
			//clearTimeout( state.timeout_id );
			state.callback = () => (null);
		},

	},
	actions: {
		show( { commit }, params ){
			//// check if opened?
			commit( "hide", null /*"another_open"*/ );

			return new Promise( resolve => {
				let timeout_id = null;
				if( params.timeout && params.timeout > 0 )
				timeout_id = setTimeout( commit, params.timeout * 1000, "hide", null /*"timeout"*/ );

				commit( "showed", { params, resolve, timeout_id } );
			})
			.then( result => {
				commit( "hidden" );
				return result;
			});
		},

		close( { commit }, result ){
			commit( "hide", result );
		},
	},
	getters: {
		getStatus: state => state.status,
		getVisibility: state => state.show,
		getPopupData: state => state.data,
	},
	modules: { }
};


const CartPopupStore = {
	namespaced: true,
	state: {
		show: false,
		status: '',
		callback: () => ( null ),
		timeout_id: null,

		data: {
			title: "",
			notice: "",
			button1: "Нет",
			button2: "Да",
		},
	},
	mutations: {
		showed( state, { params, resolve, timeout_id } ){
			state.status = "showed";
			state.data = params;
			state.timeout_id = timeout_id;
			state.callback = resolve;
			state.show = true;
		},

		hide( state, result ){
			if( !state.show ) return;

			state.status = "wanna_hide";
			clearTimeout( state.timeout_id );
			state.show = false;
			state.data = {};

			if( !state.callback ) console.error("something happens on callback definition");
			else state.callback( result );
		},

		hidden( state ){
			state.status = "hidden";
			state.show = false;
			//clearTimeout( state.timeout_id );
			state.callback = () => (null);
		},

	},
	actions: {
		show( { commit }, params ){
			//// check if opened?
			commit( "hide", null /*"another_open"*/ );

			return new Promise( resolve => {
				let timeout_id = null;
				if( params.timeout && params.timeout > 0 )
				timeout_id = setTimeout( commit, params.timeout * 1000, "hide", null /*"timeout"*/ );

				commit( "showed", { params, resolve, timeout_id } );
			})
			.then( result => {
				commit( "hidden" );
				return result;
			});
		},

		close( { commit }, result ){
			commit( "hide", result );
		},
	},
	getters: {
		getStatus: state => state.status,
		getVisibility: state => state.show,
		getPopupData: state => state.data,
	},
	modules: { }
};


const Store = new Vuex.Store({
	modules: {
		Cart: CartStore,
		PricePopup: PricePopupStore,
		CartPopup: CartPopupStore
	},
});
