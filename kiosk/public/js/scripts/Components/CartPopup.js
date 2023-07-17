
const CartPopup = {
	props: [ ],
	template: `
		<div class="popup fiscal-phone-input-popup cart-popup" v-bind:class="{ 'display-none': !show }">
		  <div class="popup-inner">
		    <div class="popup-inner-wrapper">
		      <div class="popup-header">
		        <p>Состав заказа</p>
		      </div>

		      <div class="popup-cart-content scrollable" ref="scroller">
					<div class="popup-cart-content-wrapper">
						<div v-if="cart">
							<div class="cart-item" v-for="item in cart" :key='item.id'>
								<div class="header">{{item.name}}</div> 
								<!--div v-if="item.price" class="selector">
									<div v-bind:class="{ hide: !item.count }" v-on:click="minus( item )">-</div>
									<div class="count" v-bind:class="{ hide: !item.count }">{{item.count}} - {{item.price || item.user_price}}р</div>
									<div v-on:click="plus( item )">+</div>
								</div>
								<div v-else-if="item.user_price" class="selector">
									<div v-if="item.count > 0" v-on:click="minus( item )">x</div>
									<div class="count">{{item.count}} шт</div>
								</div-->

								<div class="price"></div>
							</div>
						</div>
					</div>
		      </div>

				<div class="popup-cart-totals" v-if="params">
					<h2>Итого {{cart_total_price}} руб.</h2>
				</div>
		    </div>
		  </div>

		  <div class="buttons">
		    <button class="button cancel" v-on:click="onBackClick">Назад</button>
		    <button class="button" v-on:click="onNextClick">К Оплате</button>
		  </div>
		</div>`,

	data: () => {
		return {
			scroll: null,
		};
	},
	mounted: function(){
		this.scroll = Helper.createScroll(this.$refs.scroller);
	},
	computed: {
		params: function(){
			return this.$store.getters['CartPopup/getPopupData'];
		},
		show: function(){
			return this.$store.getters['CartPopup/getVisibility'];
		},
		cart: function(){
			return this.$store.getters['Cart/getData'];
		},
		cart_count: function(){
			return this.$store.getters['Cart/getCount'];
		},
		cart_total_price: function(){
			return this.$store.getters['Cart/getTotalPrice'];
		},
	},
	watch: {
		show: function( newval ){
			if( !newval ) return;

			//// ....
			//// scroller reinit ???
			console.log("refresh scroll");
			this.scroll.refresh();
			this.scroll.scrollTo(0,0);
			setTimeout( _ => this.scroll.refresh(), 400);
		},
	},
	methods: {
		resolve: function(result){
			console.log("resolved", result);
			this.$store.dispatch('CartPopup/close', result);
		},
		plus: function( service ){
			this.$root.checkActivity();
			this.$store.dispatch('Cart/addService', service);
		},
		minus: function( service ){
			this.$root.checkActivity();
			this.$store.dispatch('Cart/removeService', service);
			this.scroll.refresh();
			setTimeout( _ => this.scroll.refresh(), 400);
		},
		onNextClick(){
			if( !this.cart_count || !this.cart_total_price ) return;

			this.$store.dispatch('Cart/cleanCart');
			this.resolve(true);
			// this.scroll.refresh();
			// this.scroll.scrollTo(0,0);
		},
		onBackClick(){
			this.resolve(null);
		},
	},
};
