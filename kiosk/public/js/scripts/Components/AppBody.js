const AppBody = {
	components: { CategoryButton, ServiceButton },
	props: ['catalog'],
	mounted: function(){
		this.$root.scroll = Helper.createScroll(this.$refs.scroller);
		this.$root.scroll.refresh();
		setTimeout( _ => this.$root.scroll.refresh(), 350);
	},
	template: `<main class="scrollable" ref="scroller">
			<div style="width: 1000px; margin:0 auto; min-height: 300px; padding-bottom: 50px;">
			<div class="catalog-wrap" v-if="catalog">
                <div class="buttons-wrap-inner" style="transition-timing-function: cubic-bezier(0.1, 0.57, 0.1, 1); transition-duration: 0ms; transform: translate(0px, 0px) translateZ(0px);">
                			    
				    <ServiceButton 
					    v-for="_service in catalog" 
					    :key="'_service'+_service.id" 
					    :service="_service"
				    >
				    </ServiceButton>
                </div>
			</div>

			<div class="catalog-wrap empty" v-else>
			</div>
			</div>
		</main>`,
};