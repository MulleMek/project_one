const AppFooter = {
	props: ['cartCounter', 'cartTotal', 'parent'],
	template: `<footer>
			<button v-if="parent && parent !== -1" v-on:click="$root.onBackClick()">Назад</button>
			<button v-else-if="cartCounter > 0" v-on:click="$root.onClearClick()">Отмена</button>
	        <button v-else id='cancel' v-on:click="onBackClick">Назад</button>

			<div class="logo placeholder" style="min-width: 400px;" v-bind:class="{ hide: !(cartCounter > 0) }" alt="empty or cart">
				<div style="margin-top: 30px;font-size: 28px; text-align: center;" class='label' id='cart-counter'>К оплате: {{ cartTotal }} руб</div>
			</div>
			<button id="next" v-bind:class="{ hide: !(cartCounter > 0) }" v-on:click="$root.onNextClick()">Оплатить</button>
		</footer>`,
    methods: {
        onBackClick(){
            console.log("onBackClick");
            Router.redirectHome();
        },
    },
};
