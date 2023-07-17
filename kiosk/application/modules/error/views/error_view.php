<header>
	<figure>
		<img src="/<?=KIOSK_DOMAIN?>/public/pics/logo.png" alt="">
		<figcaption></figcaption>
	</figure>
	<div class="header-clock">
		<div class="clock-title">Список заказов</div>
		<div class="hours-line">
			<div class="hours-img">
				<img src="/kiosk/public/pics/clock.svg" />
			</div>
			<div id="clock-hours"></div>
		</div>
	</div>
</header>
<main class="main-wrap error">
	<img src="/<?=KIOSK_DOMAIN?>/public/pics/warning.svg">
	<h1 class="h1">Извините, терминал <span class="orange">временно не работает<span></h1>
</main>

<script type="text/javascript">
	window._DEVICES = <?=json_encode($devices)?>;
</script>
