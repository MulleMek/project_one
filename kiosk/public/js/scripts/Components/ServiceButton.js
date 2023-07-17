const ServiceButton = {
	props: ['service'],
	template: `
		<button class="service2" v-bind:class="{ selected: (service.count && service.count >= 1) }" v-on:click="showService( service )">
			<div class="service-block">
				<div  style="width: 0px; height: 0px;" v-bind:class="{ hide: !(service.count && service.count >= 1) }">
					<div style="width: 50px; height: 50px; position: relative; top: -10px; right: -215px;">
						<img src="/kiosk/public/pics/check-circle.svg" />
					</div>
				</div>
			
				<p class="sid"><b>ID:{{service.id}}</b></p>
				<div style="height: 125px; overflow: hidden;">
					<p class="sdata">{{service.date}}</p>
					<p class="stitle">{{service.name}}</p>
				</div>
				
                <p class="sprice" v-if="service.price > 0">{{service.price}} руб.</p>
                
			</div>
		</button>`,
    methods: {
        showService: function( service ){
			this.$root.checkActivity();
            console.log("service", service);
			if( service.count && service.count >= 1 ) {				
				this.$store.dispatch('Cart/removeService', service);
			} else {
				this.$store.dispatch('Cart/addService', service);
			}
			return;


            this.$store.dispatch('PricePopup/show', service)
				.then( result => {
					this.$root.checkActivity();
					console.log(result);
					if( !result ) return;
					if( result && result.price && result.count && result.id ) 
						this.$root.onNextClick( result );
				});
        }       
    },
};
