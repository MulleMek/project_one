
const PricePopup = {
	props: [ ],
	template: `
		<div class="popup" v-bind:class="{ 'display-none': !show }">
		  <div class="amount">

		      <div class="popup-header">
		        <p v-if="params.service_description"><small>{{params.service_description}}</small></p>
		      </div>
	      
              <div class="title">
                    Укажите количество 
                    
              </div>
				<hr>
              <div class="title ">
                    {{ params.name}} <br>
					<p>Стоимость за час: <span>{{ params.price }}</span><span class="rub">Р</span></p>

                    
              </div>
                    <div class="count">
                        <div class="point" @click="minus()">
                            <img src="/kiosk/public/pics/minus.png" alt="">
                        </div>

                        <span>{{quantity}}</span>

                        <div class="point" @click="plus()">
                            <img src="/kiosk/public/pics/plus.png" alt="">
                        </div>
                    </div>
                    <div class="bottom">
                        <div class="point">
                            <div class="text">
                                Итого:

                                <p>
                                    <span>{{ totals }}</span>
                                    <span class="rub">Р</span>
                                </p>
                            </div>
                        </div>

                        <div class="point">
                            <div class="bottom-buttons">
                                <button class="cancel" @click="onCancelClick">Отмена</button>
                                <button class="ok" @click="onConfirmClick">Продолжить</button>
                            </div>
                        </div>
                    </div>
            
              </div>


		</div>`,

	data: () => {
		return {
			// val: null,
			quantity: 1,
		}
	},
	computed: {
		params: function(){
			return this.$store.getters['PricePopup/getPopupData'];
		},
		show: function(){
			return this.$store.getters['PricePopup/getVisibility'];
		},
		service_type: function(){
			if( !this.params || !this.params.service_type ) return "услуги"

			switch( this.params.service_type ){
				case "good": return "товара";

				case "service":
				default: return "услуги";
			}
		},
		totals: function(){
			if( this.show && this.params && this.params.price > 0 && this.quantity )
				return parseInt(this.params.price * this.quantity, 10);

			return 0;
		}
	},
	watch: {
		show: ( newval, oldval ) => {
			console.log("SHOWED CHANGED", newval, oldval);
			this.quantity = 1;
			
			/*VirtualKeyboard.close();
			if( newval ){
				console.log("VirtualKeyboard init");
				VirtualKeyboard.init({
					 input: $("#price-popup-input"),
					 keyboard: $("#price-popup-keyboard"),
					 callback: function() { },
				});
				// if( this.params && this.params.user_price ){
				// 	this.val = this.params.user_price;
				// } else {
				// 	this.val = null;
				// }
			}*/
		},
	},
	methods: {
		plus: function(){
			this.$root.checkActivity();
			if( !this.quantity || this.quantity < 0 ) this.quantity = 1;
			if( this.quantity >= 10 ) return;
			this.quantity ++;
		}, 
		minus: function(){
			this.$root.checkActivity();
			if( !this.quantity || this.quantity <= 1 ) return this.quantity = 1;
			this.quantity --;
		},

		resolve: function(result){
			console.log("resolved", result);
			this.$store.dispatch('PricePopup/close', result);
		},
		onConfirmClick(){
			if( this.quantity > 0 && this.quantity < 11 && this.totals > 0 ){
			
				let data = {
					id: this.params.id,
					name: this.params.name,
					description: this.params.description,
					price: this.params.price,
					count: this.quantity,
				};
				this.resolve(data);
			}
		},
		onCancelClick(){
			this.resolve( null );
		},
	},
};
