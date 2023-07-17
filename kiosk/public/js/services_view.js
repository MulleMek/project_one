const inactivity_timeout = 5 * 60 * 1000;
const remotesync_timeout = 90 * 1000;

const urls = {
	category: Environment.get("domains.kiosk") + "/main/category_json?category_id=",
	next: Environment.get("domains.kiosk") + "/payment/cash",
};

window.APP = new Vue({
	el: "#app",
	store: Store,
	components: {
		AppHeader,
		AppBody,
		AppFooter,

		PricePopup,
		CartPopup,
	},
	template: `
		<div class="main-wrap">
			<AppHeader
				:headerText="header"
				:cartTotal="cartTotal"
			></AppHeader>
			<AppBody
				:catalog="currentCategory"
			></AppBody>
			<AppFooter
				:parent="parentId"
				:cartCounter="cartCount"
				:cartTotal="cartTotal"
			></AppFooter>

			<PricePopup></PricePopup>
			<CartPopup></CartPopup>
		</div>`,

	data: {
		scroll: null,

		header: null,
		currentCategory: null,
		parentId: null,
	},

	mounted: function(){
		this.__t = Helper.createActivityHandler( _ => this.onInactivity(), inactivity_timeout );
		if( !Model.load() ) return Helper.showPopup("Извините, получены не все данные", Router.redirectHome, 5 * 1000);

		this.onCategoryClick( Model.get("id") );
	},
	computed: {
		cartCount() { return this.$store.getters['Cart/getCount']; },
		cartTotal() { return this.$store.getters['Cart/getTotalPrice'];  }
	},
	methods: {
		loadCategory( user_id ){
			// console.log("loadCatalog", ProxyClient.loadCatalog( user_id ));
			return  ProxyClient.loadCatalog( user_id );
		},

		onCategoryClick( user_id ){
			this.checkActivity();
			Helper.showPreloader();
			
			return this.loadCategory( user_id ).then( data => {
					this.currentCategory = data;
					setTimeout( _ => this.$root.scroll.refresh(), 350);
				})
				.catch( err => console.error(err) )
				.then( _ => {
					Helper.hidePreloader();
				});;
		},
		onBackClick(){
			this.checkActivity();
			if( !this.currentCategory ) return;
			if( this.currentCategory.parent_id ) {
				this.onCategoryClick(this.currentCategory.parent_id);
			}
		},

		onNextClick( service ){
			this.checkActivity();
			// if( !this.cartCount ) return;
	
			//Model.setCart( { [service.id]: service } );
			//return Router.redirect(urls.next);

					
			Model.setCart( this.$store.getters['Cart/getData'] );
			return Router.redirect(urls.next);
					
			
			return this.$store.dispatch('CartPopup/show', {})
				.then( result => {
					if( !result ) return;
					
					Model.setCart( this.$store.getters['Cart/getData'] );

					return Router.redirect(urls.next);
				});
		},

		onClearClick(){
			return Popup.show({
				text: "Очистить корзину?",
				buttons: [
					{  name: "Нет", callback: _ => _ }, 
					{  name: "Да", callback: _ => this.onInactivity() },
				]
			});
		},

		checkActivity(){
			this.__t.checkActivity();
		},
		onInactivity(){
			Model.clear();
			LocalStorage.clear();
			Router.redirectHome();
		},
	},
});
