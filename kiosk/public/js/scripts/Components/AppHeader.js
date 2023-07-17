const AppHeader = {
	props: ['headerText', 'cartTotal'],
	template: `
	<header>
		<figure>
			<img src="/kiosk/public/pics/logo.png" alt="">
			<figcaption></figcaption>
		</figure
		<div class="header-clock">
			<div class="clock-title">Список заказов</div>
			<div class="hours-line">
				<div class="hours-img">
					<img src="/kiosk/public/pics/clock.svg" />
				</div>
				<div id="clock-hours"></div>
			</div>
		</div>
	</header>`,
};
